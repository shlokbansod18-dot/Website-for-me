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
    <span className={`flex items-baseline gap-2 ${className}`}>
      <span className="numeric font-display text-lg font-bold tracking-tight">
        {product.priceCents === 0 ? "Free" : formatMoney(product.priceCents, product.currency)}
      </span>
      {product.compareAtCents && product.compareAtCents > product.priceCents ? (
        <span className="numeric text-xs text-faint line-through">
          {formatMoney(product.compareAtCents, product.currency)}
        </span>
      ) : null}
    </span>
  );
}

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const discount =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? Math.round(100 - (product.priceCents / product.compareAtCents) * 100)
      : null;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group card relative flex flex-col overflow-hidden transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-line-strong hover:shadow-[var(--shadow-soft)]"
    >
      <div className="relative">
        <ProductCover
          seed={product.slug}
          accent={product.accent}
          glyph={product.glyph}
          className="aspect-[4/3] w-full"
          size={priority ? "md" : "md"}
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <span className="rounded-full bg-black/45 px-2.5 py-1 text-[0.625rem] font-medium tracking-wide text-white backdrop-blur-sm">
            {product.category}
          </span>
          {discount ? (
            <span className="numeric rounded-full bg-acid px-2.5 py-1 text-[0.625rem] font-bold text-acid-ink">
              −{discount}%
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-[1.0625rem] font-bold leading-tight tracking-[-0.035em] transition-colors group-hover:text-acid">
          {product.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 flex-1 text-[0.8125rem] leading-relaxed text-dim">
          {product.tagline}
        </p>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
          <PriceTag product={product} />
          <span className="numeric flex items-center gap-1 text-[0.6875rem] text-faint">
            <span aria-hidden className="text-acid">
              ★
            </span>
            {product.rating.toFixed(1)}
            <span className="text-line-strong">·</span>
            {product.salesCount.toLocaleString()} sold
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, i) => (
        <div key={product.id} data-reveal data-reveal-delay={Math.min(i, 5) * 60}>
          <ProductCard product={product} priority={i < 3} />
        </div>
      ))}
    </div>
  );
}
