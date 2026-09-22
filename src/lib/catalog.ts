import "server-only";

import { getDb } from "./db";
import type { Product, ProductRow } from "./types";

export const CATEGORIES = [
  "UI Kits",
  "Templates",
  "Icons",
  "Fonts",
  "Presets",
  "Notion",
  "Courses",
  "Audio",
  "3D",
  "Other",
] as const;

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    description: row.description,
    category: row.category,
    priceCents: row.price_cents,
    compareAtCents: row.compare_at_cents,
    currency: row.currency,
    status: row.status,
    accent: row.accent,
    highlights: safeJson<string[]>(row.highlights, []),
    tags: safeJson<string[]>(row.tags, []),
    fileName: row.file_name,
    fileSize: row.file_size,
    version: row.version,
    licence: row.licence,
    rating: row.rating,
    salesCount: row.sales_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function safeJson<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) || typeof parsed === "object" ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
}

export type CatalogQuery = {
  search?: string;
  category?: string;
  sort?: "trending" | "newest" | "price-asc" | "price-desc";
  maxPrice?: number;
};

export function listProducts(query: CatalogQuery = {}): Product[] {
  const clauses = ["status = 'published'"];
  const params: unknown[] = [];

  if (query.search) {
    clauses.push("(title LIKE ? OR tagline LIKE ? OR tags LIKE ? OR category LIKE ?)");
    const like = `%${query.search}%`;
    params.push(like, like, like, like);
  }
  if (query.category && query.category !== "All") {
    clauses.push("category = ?");
    params.push(query.category);
  }
  if (typeof query.maxPrice === "number") {
    clauses.push("price_cents <= ?");
    params.push(query.maxPrice);
  }

  const order =
    query.sort === "newest" ? "created_at DESC"
    : query.sort === "price-asc" ? "price_cents ASC"
    : query.sort === "price-desc" ? "price_cents DESC"
    : "sales_count DESC, rating DESC";

  const rows = getDb()
    .prepare(`SELECT * FROM products WHERE ${clauses.join(" AND ")} ORDER BY ${order}`)
    .all(...params) as ProductRow[];

  return rows.map(toProduct);
}

export function getProductBySlug(slug: string): Product | null {
  const row = getDb()
    .prepare("SELECT * FROM products WHERE slug = ? AND status = 'published'")
    .get(slug) as ProductRow | undefined;
  return row ? toProduct(row) : null;
}

export function getProductById(id: string): Product | null {
  const row = getDb().prepare("SELECT * FROM products WHERE id = ?").get(id) as
    | ProductRow
    | undefined;
  return row ? toProduct(row) : null;
}

export function getProductsByIds(ids: string[]): Product[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  const rows = getDb()
    .prepare(`SELECT * FROM products WHERE id IN (${placeholders}) AND status = 'published'`)
    .all(...ids) as ProductRow[];
  const byId = new Map(rows.map((row) => [row.id, toProduct(row)]));
  return ids.map((id) => byId.get(id)).filter((p): p is Product => Boolean(p));
}

export function listSellerProducts(sellerId: string): Product[] {
  const rows = getDb()
    .prepare("SELECT * FROM products WHERE seller_id = ? ORDER BY updated_at DESC")
    .all(sellerId) as ProductRow[];
  return rows.map(toProduct);
}

export function relatedProducts(product: Product, limit = 3): Product[] {
  const rows = getDb()
    .prepare(
      `SELECT * FROM products
       WHERE status = 'published' AND id != ?
       ORDER BY (category = ?) DESC, sales_count DESC
       LIMIT ?`,
    )
    .all(product.id, product.category, limit) as ProductRow[];
  return rows.map(toProduct);
}

export function catalogStats() {
  const db = getDb();
  const products = db
    .prepare("SELECT COUNT(*) AS n FROM products WHERE status = 'published'")
    .get() as { n: number };
  const sales = db.prepare("SELECT COALESCE(SUM(sales_count), 0) AS n FROM products").get() as {
    n: number;
  };
  const creators = db
    .prepare("SELECT COUNT(DISTINCT seller_id) AS n FROM products WHERE status = 'published'")
    .get() as { n: number };
  return { products: products.n, sales: sales.n, creators: Math.max(creators.n, 1) };
}

/** Turns a title into a URL-safe slug, guaranteeing uniqueness. */
export function uniqueSlug(title: string, ignoreId?: string): string {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60) || "product";

  const db = getDb();
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const clash = db.prepare("SELECT id FROM products WHERE slug = ?").get(candidate) as
      | { id: string }
      | undefined;
    if (!clash || clash.id === ignoreId) return candidate;
    candidate = `${base}-${suffix++}`;
  }
}
