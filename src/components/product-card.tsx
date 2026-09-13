import Link from "next/link";

import { ProductCover } from "@/components/product-cover";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export function PriceTag({
  product,
  className = "",
}: {
  product: Pick<Product, "priceCents" | "compareAtCents" | "currency">;
  className?: string;
}) {
  return (
    <span className={`numeric flex items-baseline gap-2 ${className}`}>
      <span>
        {product.priceCents === 0 ? "Free" : formatMoney(product.priceCents, product.currency)}
      </span>
      {product.compareAtCents && product.compareAtCents > product.priceCents ? (
        <span className="text-[0.8125rem] text-ink-3 line-through">
          {formatMoney(product.compareAtCents, product.currency)}
        </span>
      ) : null}
    </span>
  );
}

/**
 * No border, no panel, no shadow. The cover is the object; the words sit under
 * it on the paper, the way a caption sits under a plate. A panel outline around
 * every item is what made the old catalogue read as a spreadsheet.
 */
export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? Math.round(100 - (product.priceCents / product.compareAtCents) * 100)
      : null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative overflow-hidden rounded">
        <ProductCover
          seed={product.slug}
          accent={product.accent}
          title={product.title}
          className="aspect-[4/5] w-full transition-transform duration-500 group-hover:scale-[1.02]"
        />
        {discount ? (
          <span className="numeric absolute right-3 top-3 rounded bg-paper/90 px-2 py-1 text-[0.6875rem] font-medium backdrop-blur-sm">
            −{discount}%
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[1.0625rem] leading-tight transition-colors group-hover:text-accent">
          {product.title}
        </h3>
        <PriceTag product={product} className="shrink-0 text-[0.9375rem]" />
      </div>
      <p className="mt-1 text-[0.8125rem] leading-snug text-ink-2">
        <span className="text-ink-3">{product.category}</span>
        <span className="mx-1.5 text-ink-3">·</span>
        {product.tagline.length > 62 ? `${product.tagline.slice(0, 62)}…` : product.tagline}
      </p>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <div key={product.id} data-reveal data-reveal-delay={Math.min(i, 5) * 50}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
