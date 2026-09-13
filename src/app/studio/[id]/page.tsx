import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProductForm } from "@/components/product-form";
import { canSell, getCurrentUser } from "@/lib/auth";
import { CATEGORIES, getProductById } from "@/lib/catalog";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit product",
  robots: { index: false, follow: false },
};

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio");
  if (!canSell(user.role)) redirect("/studio");

  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  // Owning the Studio is not the same as owning this row.
  const row = getDb().prepare("SELECT seller_id FROM products WHERE id = ?").get(id) as
    | { seller_id: string | null }
    | undefined;
  if (row?.seller_id !== user.id && user.role !== "owner") notFound();

  return (
    <div className="shell py-12 lg:py-16">
      <header className="mb-10">
        <Link
          href="/studio"
          className="text-[0.8125rem] text-ink-3 transition-colors hover:text-ink"
        >
          ← Studio
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h1 className="display-2">{product.title}</h1>
          <span
            className={`rounded-full px-3 py-1 text-[0.6875rem] font-medium ${
              product.status === "published" ? "bg-accent/12 text-accent" : "bg-line text-ink-3"
            }`}
          >
            {product.status === "published" ? "LIVE IN THE SHOP" : "DRAFT"}
          </span>
        </div>
        <p className="mt-3 text-[0.8125rem] text-ink-3">
          {product.salesCount.toLocaleString()} sold ·{" "}
          <span className="font-mono">/products/{product.slug}</span>
        </p>
      </header>

      <ProductForm product={product} categories={[...CATEGORIES]} />
    </div>
  );
}
