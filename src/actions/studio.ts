"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { canSell, getCurrentUser } from "@/lib/auth";
import { getProductById, uniqueSlug } from "@/lib/catalog";
import { randomId } from "@/lib/crypto";
import { getDb, now } from "@/lib/db";
import { deleteUpload, saveUpload } from "@/lib/files";
import { audit } from "@/lib/rate-limit";
import { keepValues } from "@/lib/form-values";
import { fieldErrors, productSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

/** Every Studio action starts here. Not the owner, no write. */
async function requireSeller() {
  const user = await getCurrentUser();
  if (!user || !canSell(user.role)) return null;
  return user;
}



/**
 * The listing fields handed back when a save fails. Without this, one
 * validation slip would throw away a description someone spent ten minutes
 * writing — React empties a `<form action>` as soon as the action settles.
 */
const KEEP_PRODUCT = [
  "title",
  "tagline",
  "description",
  "category",
  "price",
  "compareAt",
  "highlights",
  "tags",
  "version",
  "licence",
  "status",
] as const;

function splitLines(value: string, limit: number): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 8);
}

export async function saveProductAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const seller = await requireSeller();
  const keep = keepValues(formData, KEEP_PRODUCT);
  if (!seller) {
    return { ok: false, message: "Only the shop owner can publish products.", values: keep };
  }

  const parsed = productSchema.safeParse({
    title: formData.get("title"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    category: formData.get("category"),
    price: formData.get("price"),
    compareAt: formData.get("compareAt") ?? "",
    highlights: formData.get("highlights") ?? "",
    tags: formData.get("tags") ?? "",
    accent: formData.get("accent") ?? "acid",
    version: formData.get("version") || "1.0",
    licence: formData.get("licence") || "Standard commercial licence",
    status: formData.get("status") ?? "draft",
  });

  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error), values: keep };
  const data = parsed.data;

  if (data.compareAt !== null && data.compareAt <= data.price) {
    return {
      ok: false,
      fieldErrors: { compareAt: "A 'was' price only makes sense if it is higher than the price." },
      values: keep,
    };
  }

  const productId = String(formData.get("productId") ?? "").trim();
  const existing = productId ? getProductById(productId) : null;

  if (productId && !existing) {
    return { ok: false, message: "That product no longer exists.", values: keep };
  }
  if (existing) {
    const owner = getDb().prepare("SELECT seller_id FROM products WHERE id = ?").get(existing.id) as
      | { seller_id: string | null }
      | undefined;
    if (owner?.seller_id !== seller.id && seller.role !== "owner") {
      return { ok: false, message: "That product belongs to another seller.", values: keep };
    }
  }

  // Handle the uploaded file before touching the row, so a failed upload
  // never leaves a product pointing at a file that is not there.
  const upload = formData.get("file");
  let file: { name: string; stored: string; size: number; mime: string } | null = null;

  if (upload instanceof File && upload.size > 0) {
    const saved = await saveUpload(upload);
    if ("error" in saved) return { ok: false, fieldErrors: { file: saved.error }, values: keep };
    file = { name: saved.originalName, stored: saved.storedName, size: saved.size, mime: saved.mime };
  }

  if (data.status === "published" && !file && !existing?.fileName) {
    return {
      ok: false,
      fieldErrors: { file: "Upload the product file before publishing, buyers need something to download." },
      values: keep,
    };
  }

  const db = getDb();
  const ts = now();
  const highlights = JSON.stringify(splitLines(data.highlights ?? "", 8));
  const tags = JSON.stringify(splitTags(data.tags ?? ""));

  if (existing) {
    const previous = db.prepare("SELECT file_path FROM products WHERE id = ?").get(existing.id) as
      | { file_path: string | null }
      | undefined;

    db.prepare(
      `UPDATE products SET
         title = ?, slug = ?, tagline = ?, description = ?, category = ?,
         price_cents = ?, compare_at_cents = ?, status = ?, accent = ?,
         highlights = ?, tags = ?, version = ?, licence = ?, updated_at = ?
         ${file ? ", file_name = ?, file_path = ?, file_size = ?, file_mime = ?" : ""}
       WHERE id = ?`,
    ).run(
      ...[
        data.title,
        uniqueSlug(data.title, existing.id),
        data.tagline,
        data.description,
        data.category,
        data.price,
        data.compareAt,
        data.status,
        data.accent,
        highlights,
        tags,
        data.version,
        data.licence,
        ts,
        ...(file ? [file.name, file.stored, file.size, file.mime] : []),
        existing.id,
      ],
    );

    if (file && previous?.file_path) await deleteUpload(previous.file_path);
    audit("product.updated", { userId: seller.id, detail: { productId: existing.id } });
    revalidatePath("/studio");
    revalidatePath("/products");
    return { ok: true, message: data.status === "published" ? "Product updated and live." : "Draft saved." };
  }

  const id = randomId();
  db.prepare(
    `INSERT INTO products (
       id, slug, title, tagline, description, category, price_cents, compare_at_cents,
       status, seller_id, accent, highlights, tags, file_name, file_path,
       file_size, file_mime, version, licence, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    uniqueSlug(data.title),
    data.title,
    data.tagline,
    data.description,
    data.category,
    data.price,
    data.compareAt,
    data.status,
    seller.id,
    data.accent,
    highlights,
    tags,
    file?.name ?? null,
    file?.stored ?? null,
    file?.size ?? null,
    file?.mime ?? null,
    data.version,
    data.licence,
    ts,
    ts,
  );

  audit("product.created", { userId: seller.id, detail: { productId: id } });
  revalidatePath("/studio");
  revalidatePath("/products");
  redirect("/studio?saved=1");
}

export async function toggleProductStatusAction(formData: FormData): Promise<void> {
  const seller = await requireSeller();
  if (!seller) return;

  const id = String(formData.get("productId") ?? "");
  const db = getDb();
  const row = db.prepare("SELECT status, seller_id, file_path FROM products WHERE id = ?").get(id) as
    | { status: string; seller_id: string | null; file_path: string | null }
    | undefined;
  if (!row) return;
  if (row.seller_id !== seller.id && seller.role !== "owner") return;
  // Publishing something with nothing attached would sell an empty box.
  if (row.status === "draft" && !row.file_path) return;

  db.prepare("UPDATE products SET status = ?, updated_at = ? WHERE id = ?").run(
    row.status === "published" ? "draft" : "published",
    now(),
    id,
  );
  audit("product.status_toggled", { userId: seller.id, detail: { productId: id } });
  revalidatePath("/studio");
  revalidatePath("/products");
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const seller = await requireSeller();
  if (!seller) return;

  const id = String(formData.get("productId") ?? "");
  const db = getDb();
  const row = db.prepare("SELECT seller_id, file_path FROM products WHERE id = ?").get(id) as
    | { seller_id: string | null; file_path: string | null }
    | undefined;
  if (!row) return;
  if (row.seller_id !== seller.id && seller.role !== "owner") return;

  // People who already bought this keep their download, so the file stays and
  // the row is only unpublished. Removing it outright would break a purchase
  // someone has already paid for.
  const sold = db.prepare("SELECT COUNT(*) AS n FROM entitlements WHERE product_id = ?").get(id) as {
    n: number;
  };

  if (sold.n > 0) {
    db.prepare("UPDATE products SET status = 'draft', updated_at = ? WHERE id = ?").run(now(), id);
  } else {
    db.prepare("DELETE FROM products WHERE id = ?").run(id);
    await deleteUpload(row.file_path);
  }

  audit("product.deleted", { userId: seller.id, detail: { productId: id, hadSales: sold.n } });
  revalidatePath("/studio");
  revalidatePath("/products");
}
