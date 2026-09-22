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
 * The poster is the object. It lifts a little on hover — the whole sheet, not
 * a zoom inside a frame — and the words sit under it like a gallery caption.
 * A panel outline around every item is what made an earlier catalogue read as
 * a spreadsheet.
 */
export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? Math.round(100 - (product.priceCents / product.compareAtCents) * 100)
      : null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
        <ProductCover
          seed={product.slug}
          accent={product.accent}
          title={product.title}
          category={product.category}
          className="aspect-[4/5] w-full shadow-[0_12px_32px_-20px_rgb(0_0_0/0.9)] transition-shadow duration-500 group-hover:shadow-[0_26px_50px_-24px_rgb(0_0_0/0.95)]"
        />
        {discount ? (
          <span className="numeric absolute right-3 top-3 rounded-full bg-paper px-2.5 py-1 text-[0.6875rem] font-semibold text-accent">
            −{discount}%
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-[1.0625rem] font-semibold leading-tight transition-colors group-hover:text-accent">
          {product.title}
        </h3>
        <PriceTag product={product} className="shrink-0 text-[0.9375rem] font-semibold" />
      </div>
      <p className="mt-1.5 text-[0.8125rem] leading-snug text-ink-2">
        {product.tagline.length > 62 ? `${product.tagline.slice(0, 62)}…` : product.tagline}
      </p>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div data-rs="deal" className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <div key={product.id} data-reveal data-reveal-delay={Math.min(i, 5) * 50}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
