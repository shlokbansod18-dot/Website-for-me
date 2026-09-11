import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteProductAction, toggleProductStatusAction } from "@/actions/studio";
import { BecomeSeller } from "@/components/become-seller";
import { ProductCover } from "@/components/product-cover";
import { ButtonLink } from "@/components/ui/button";
import { canSell, getCurrentUser } from "@/lib/auth";
import { listSellerProducts } from "@/lib/catalog";
import { formatDate, formatMoney } from "@/lib/money";
import { sellerStats } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Creator studio",
  robots: { index: false, follow: false },
};

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio");

  const { saved } = await searchParams;

  if (!canSell(user.role)) return <BecomeSeller name={user.name} />;

  const products = listSellerProducts(user.id);
  const stats = sellerStats(user.id);

  return (
    <div className="shell py-12 lg:py-16">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">Creator studio</p>
          <h1 className="display-sm mt-3">Your products</h1>
        </div>
        <ButtonLink href="/studio/new" size="lg">
          <span aria-hidden>+</span>
          New product
        </ButtonLink>
      </header>

      {saved ? (
        <div className="mb-8 rounded-2xl border border-acid/35 bg-acid/10 px-5 py-3.5 text-[0.8125rem] text-acid">
          Saved. {products[0]?.status === "draft" ? "It is a draft — publish it when you are ready." : "It is live in the shop."}
        </div>
      ) : null}

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <StatCard label="Live products" value={String(stats.live)} />
        <StatCard label="Units sold" value={stats.sales.toLocaleString()} />
        <StatCard
          label="Gross revenue"
          value={formatMoney(stats.revenueCents)}
          note={`You keep ${formatMoney(Math.round(stats.revenueCents * 0.95))} after the 5% fee`}
          accent
        />
      </div>

      {products.length === 0 ? (
        <div className="card grid place-items-center px-6 py-20 text-center">
          <span aria-hidden className="font-display text-4xl text-faint">
            ✎
          </span>
          <h2 className="mt-5 font-display text-xl font-bold">Nothing published yet</h2>
          <p className="mt-2 max-w-sm text-sm text-dim">
            Upload a file, write a few lines about it, set a price. That is the whole process.
          </p>
          <ButtonLink href="/studio/new" className="mt-7">
            Create your first product
          </ButtonLink>
        </div>
      ) : (
        <ul className="space-y-px overflow-hidden rounded-[1.5rem] border border-line">
          {products.map((product) => (
            <li key={product.id} className="flex flex-wrap items-center gap-4 bg-surface p-5">
              <ProductCover
                seed={product.slug}
                accent={product.accent}
                glyph={product.glyph}
                size="sm"
                className="size-16 shrink-0 rounded-xl border border-line"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/studio/${product.id}`}
                    className="font-display text-[0.9375rem] font-bold tracking-[-0.03em] transition-colors hover:text-acid"
                  >
                    {product.title}
                  </Link>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.625rem] font-medium tracking-wide ${
                      product.status === "published"
                        ? "bg-acid/12 text-acid"
                        : "bg-line text-faint"
                    }`}
                  >
                    {product.status === "published" ? "LIVE" : "DRAFT"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-faint">
                  {formatMoney(product.priceCents)} · {product.salesCount.toLocaleString()} sold ·
                  updated {formatDate(product.updatedAt)}
                  {!product.fileName ? " · no file attached" : ""}
                </p>
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-2">
                {product.status === "published" && (
                  <Link
                    href={`/products/${product.slug}`}
                    className="rounded-full border border-line px-3.5 py-1.5 text-xs text-dim transition-colors hover:border-line-strong hover:text-text"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/studio/${product.id}`}
                  className="rounded-full border border-line px-3.5 py-1.5 text-xs text-dim transition-colors hover:border-line-strong hover:text-text"
                >
                  Edit
                </Link>
                <form action={toggleProductStatusAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    disabled={product.status === "draft" && !product.fileName}
                    title={
                      product.status === "draft" && !product.fileName
                        ? "Attach a product file before publishing"
                        : undefined
                    }
                    className="rounded-full border border-line px-3.5 py-1.5 text-xs transition-colors hover:border-acid hover:text-acid disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {product.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </form>
                <form action={deleteProductAction}>
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="rounded-full border border-line px-3.5 py-1.5 text-xs text-faint transition-colors hover:border-flare hover:text-flare"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-[0.6875rem] leading-relaxed text-faint">
        Deleting a product that people have already bought only unpublishes it — their downloads
        keep working. A product nobody has bought is removed outright, file and all.
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note?: string;
  accent?: boolean;
}) {
  return (
    <div className="card p-6">
      <p className="eyebrow">{label}</p>
      <p
        className={`numeric mt-3 font-display text-3xl font-bold tracking-[-0.04em] ${accent ? "text-acid" : ""}`}
      >
        {value}
      </p>
      {note ? <p className="mt-2 text-[0.6875rem] text-faint">{note}</p> : null}
    </div>
  );
}
