import type { Metadata } from "next";
import { Suspense } from "react";

import { CatalogFilters } from "@/components/catalog-filters";
import { ProductGrid } from "@/components/product-card";
import { ButtonLink } from "@/components/ui/button";
import { CATEGORIES, listProducts, type CatalogQuery } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse every product",
  description:
    "Templates, UI kits, fonts, presets, sound packs and courses — delivered the moment you buy them.",
};

type Search = { q?: string; category?: string; sort?: string };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { q, category, sort } = await searchParams;

  const query: CatalogQuery = {
    search: q?.trim() || undefined,
    category: category || undefined,
    sort: (["trending", "newest", "price-asc", "price-desc"].includes(sort ?? "")
      ? sort
      : "trending") as CatalogQuery["sort"],
  };

  const products = listProducts(query);

  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-10 max-w-2xl">
        <p className="label">The shop</p>
        <h1 className="display-2 mt-3">
          {query.search ? (
            <>
              Results for <span className="text-accent">&ldquo;{query.search}&rdquo;</span>
            </>
          ) : query.category ? (
            <>
              {query.category}, <span className="text-ink-3">all of it</span>
            </>
          ) : (
            <>
              Everything, <span className="text-ink-3">in one place</span>
            </>
          )}
        </h1>
        <p className="mt-4 text-ink-2">
          Every product is delivered instantly, includes a licence key, and gets free updates for
          as long as the creator ships them.
        </p>
      </header>

      <Suspense fallback={<div className="mb-10 h-20" />}>
        <CatalogFilters categories={[...CATEGORIES]} resultCount={products.length} />
      </Suspense>

      {products.length > 0 ? (
        <ProductGrid products={products} />
      ) : (
        <div className="panel grid place-items-center px-6 py-24 text-center">
          <span aria-hidden className="font-display text-5xl text-ink-3">
            ⌀
          </span>
          <h2 className="mt-6 font-display text-2xl tracking-tight">
            Nothing matches that
          </h2>
          <p className="mt-3 max-w-sm text-sm text-ink-2">
            Try a shorter search, or clear the filters to see the whole catalogue.
          </p>
          <ButtonLink href="/products" variant="outline" className="mt-7">
            Clear filters
          </ButtonLink>
        </div>
      )}
    </div>
  );
}
