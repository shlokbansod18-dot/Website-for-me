import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductCover } from "@/components/product-cover";
import { getCurrentUser } from "@/lib/auth";
import { readCartIds } from "@/lib/cart";
import { getProductBySlug, relatedProducts } from "@/lib/catalog";
import { formatBytes, formatDate, formatMoney } from "@/lib/money";
import { ownsProduct } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.title,
    description: product.tagline,
    openGraph: { title: product.title, description: product.tagline },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const [user, cartIds] = await Promise.all([getCurrentUser(), readCartIds()]);
  const owned = user ? ownsProduct(user.id, product.id) : false;
  const related = relatedProducts(product);

  const discount =
    product.compareAtCents && product.compareAtCents > product.priceCents
      ? Math.round(100 - (product.priceCents / product.compareAtCents) * 100)
      : null;

  return (
    <div className="shell py-10 lg:py-14">
      <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-faint">
        <Link href="/products" className="transition-colors hover:text-acid">
          Shop
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/products?category=${encodeURIComponent(product.category)}`}
          className="transition-colors hover:text-acid"
        >
          {product.category}
        </Link>
        <span aria-hidden>/</span>
        <span className="truncate text-dim">{product.title}</span>
      </nav>

      {/*
        Explicit grid placement so the order differs by screen. On a phone the
        DOM order wins: cover, then price and Add to bag, then the long copy —
        nobody should have to scroll past three paragraphs to find the button.
        From lg up the copy returns to the left column and the buy box sits in
        a sticky right column.
      */}
      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-x-14 lg:gap-y-12">
        <div className="lg:col-start-1 lg:row-start-1">
          <ProductCover
            seed={product.slug}
            accent={product.accent}
            glyph={product.glyph}
            size="lg"
            className="aspect-[16/11] w-full rounded-[1.75rem] border border-line"
          />
        </div>

        {/* ── The buy box, which follows you down the page on desktop ───── */}
        <aside className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start">
          <div className="card p-7">
            <div className="flex items-start justify-between gap-4">
              <span className="rounded-full border border-line px-2.5 py-1 text-[0.625rem] tracking-wide text-faint">
                {product.category}
              </span>
              <span className="numeric flex items-center gap-1.5 text-xs text-faint">
                <span aria-hidden className="text-acid">
                  ★
                </span>
                {product.rating.toFixed(1)}
                <span className="text-line-strong">·</span>
                {product.salesCount.toLocaleString()} sold
              </span>
            </div>

            <h1 className="mt-5 font-display text-3xl font-bold leading-[1.05] tracking-[-0.04em]">
              {product.title}
            </h1>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-dim">{product.tagline}</p>

            <div className="mt-7 flex items-end gap-3 border-t border-line pt-6">
              <span className="numeric font-display text-4xl font-bold tracking-[-0.04em]">
                {formatMoney(product.priceCents, product.currency)}
              </span>
              {product.compareAtCents && product.compareAtCents > product.priceCents ? (
                <>
                  <span className="numeric mb-1.5 text-sm text-faint line-through">
                    {formatMoney(product.compareAtCents, product.currency)}
                  </span>
                  <span className="numeric mb-1.5 rounded-full bg-acid px-2 py-0.5 text-[0.625rem] font-bold text-acid-ink">
                    SAVE {discount}%
                  </span>
                </>
              ) : null}
            </div>
            <p className="mt-2 text-xs text-faint">One-time payment. Yours forever.</p>

            <AddToCart
              productId={product.id}
              owned={owned}
              inBag={cartIds.includes(product.id)}
              size="lg"
              className="mt-6 w-full"
              label="Add to bag"
            />

            {owned ? (
              <Link
                href="/account"
                className="mt-3 block text-center text-[0.8125rem] text-dim transition-colors hover:text-acid"
              >
                Go to your library to download it →
              </Link>
            ) : (
              <p className="mt-4 flex items-center justify-center gap-2 text-[0.6875rem] text-faint">
                <LockIcon />
                Encrypted checkout · instant download · 14-day refund
              </p>
            )}

            <dl className="mt-7 space-y-3 border-t border-line pt-6 text-[0.8125rem]">
              <Row label="Version" value={product.version} />
              <Row label="File" value={product.fileName ?? "—"} mono />
              <Row label="Size" value={formatBytes(product.fileSize)} />
              <Row label="Updated" value={formatDate(product.updatedAt)} />
              <Row label="Licence" value={product.licence} wrap />
            </dl>
          </div>

          <div className="card mt-4 flex gap-4 p-5">
            <span aria-hidden className="text-lg text-acid">
              ⇩
            </span>
            <p className="text-[0.8125rem] leading-relaxed text-dim">
              <span className="text-text">Delivered instantly.</span> The download appears in your
              library the moment payment clears, with a licence key attached. Files are served only
              to the account that bought them.
            </p>
          </div>
        </aside>

        {/* ── The long copy ─────────────────────────────────────────────── */}
        <div className="lg:col-start-1 lg:row-start-2">
          <div>
            <h2 className="eyebrow">About this product</h2>
            <div className="mt-5 space-y-4 text-[0.9375rem] leading-relaxed text-dim">
              {product.description.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>

          {product.highlights.length > 0 && (
            <div className="mt-12">
              <h2 className="eyebrow">What&rsquo;s included</h2>
              <ul className="mt-5 space-y-px overflow-hidden rounded-[1.25rem] border border-line">
                {product.highlights.map((item) => (
                  <li key={item} className="flex gap-4 bg-surface px-5 py-4 text-[0.875rem]">
                    <span aria-hidden className="mt-0.5 shrink-0 text-acid">
                      ✓
                    </span>
                    <span className="text-dim">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/products?q=${encodeURIComponent(tag)}`}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-faint transition-colors hover:border-acid hover:text-acid"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>

      {related.length > 0 && (
        <section className="mt-24">
          <h2 className="display-sm mb-8">You might also like</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  wrap,
}: {
  label: string;
  value: string;
  mono?: boolean;
  wrap?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <dt className="shrink-0 text-faint">{label}</dt>
      <dd
        className={`text-right text-dim ${mono ? "font-mono text-xs" : ""} ${wrap ? "" : "truncate"}`}
      >
        {value}
      </dd>
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" />
    </svg>
  );
}
