import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ProductCover } from "@/components/product-cover";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getProductById } from "@/lib/catalog";
import { getDb } from "@/lib/db";
import { formatDateTime, formatMoney } from "@/lib/money";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order confirmed",
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  // getOrder scopes by user id, so someone else's order id resolves to nothing.
  const record = getOrder(orderId, user.id);
  if (!record) notFound();

  const { order, items } = record;

  const entitlements = getDb()
    .prepare("SELECT id, product_id FROM entitlements WHERE order_id = ? AND user_id = ?")
    .all(order.id, user.id) as { id: string; product_id: string }[];

  const downloads = entitlements
    .map((entitlement) => ({
      entitlement,
      product: getProductById(entitlement.product_id),
      licence: items.find((item) => item.product_id === entitlement.product_id)?.licence_key ?? "",
    }))
    .filter((row) => row.product);

  return (
    <div className="shell max-w-3xl py-16 lg:py-24">
      <div className="text-center">
        <span
          aria-hidden
          className="mx-auto grid size-16 place-items-center rounded-full bg-acid font-display text-2xl font-bold text-acid-ink"
        >
          ✓
        </span>
        <h1 className="display-sm mt-8">Paid. It&rsquo;s yours.</h1>
        <p className="mx-auto mt-4 max-w-md text-dim">
          Order{" "}
          <span className="numeric font-mono text-text">{order.order_number}</span> · {" "}
          {formatDateTime(order.created_at)}. Everything below is downloadable right now, and it
          stays in your library forever.
        </p>
      </div>

      <section className="mt-12">
        <h2 className="eyebrow mb-4">Your downloads</h2>
        <ul className="space-y-px overflow-hidden rounded-[1.5rem] border border-line">
          {downloads.map(({ entitlement, product, licence }) => (
            <li key={entitlement.id} className="bg-surface p-5">
              <div className="flex items-center gap-4">
                <ProductCover
                  seed={product!.slug}
                  accent={product!.accent}
                  glyph={product!.glyph}
                  size="sm"
                  className="size-14 shrink-0 rounded-xl border border-line"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product!.slug}`}
                    className="font-display text-[0.9375rem] font-bold tracking-[-0.03em] transition-colors hover:text-acid"
                  >
                    {product!.title}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-faint">
                    v{product!.version} · {product!.fileName}
                  </p>
                </div>
                <a
                  href={`/api/download/${entitlement.id}`}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-acid px-5 text-[0.8125rem] font-medium text-acid-ink transition-[filter] hover:brightness-110"
                >
                  <DownloadIcon />
                  Download
                </a>
              </div>
              <p className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4 text-xs">
                <span className="text-faint">Licence key</span>
                <code className="rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[0.6875rem] tracking-wider text-acid">
                  {licence}
                </code>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="card mt-8 p-6">
        <h2 className="eyebrow mb-5">Receipt</h2>
        <dl className="space-y-3 text-[0.875rem]">
          <Row label="Subtotal" value={formatMoney(order.subtotal_cents, order.currency)} />
          {order.discount_cents > 0 && (
            <Row
              label={`Discount${order.coupon_code ? ` (${order.coupon_code})` : ""}`}
              value={`−${formatMoney(order.discount_cents, order.currency)}`}
              accent
            />
          )}
          <Row
            label="Paid with"
            value={
              order.payment_brand
                ? `${order.payment_brand} ending ${order.payment_last4}`
                : "Card"
            }
          />
          <div className="flex items-end justify-between border-t border-line pt-4">
            <dt className="text-dim">Total paid</dt>
            <dd className="numeric font-display text-2xl font-bold tracking-tight">
              {formatMoney(order.total_cents, order.currency)}
            </dd>
          </div>
        </dl>
      </section>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/account" size="lg">
          Go to your library
        </ButtonLink>
        <ButtonLink href={`/account/orders/${order.id}`} variant="outline" size="lg">
          View full invoice
        </ButtonLink>
      </div>

      <p className="mt-8 text-center text-[0.6875rem] leading-relaxed text-faint">
        Changed your mind? Digital products are refundable within 14 days —{" "}
        <Link href="/legal/refunds" className="underline underline-offset-2 hover:text-dim">
          read the policy
        </Link>
        .
      </p>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-6">
      <dt className="text-dim">{label}</dt>
      <dd className={`numeric text-right ${accent ? "text-acid" : ""}`}>{value}</dd>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l4-4m-4 4l-4-4M5 19h14" />
    </svg>
  );
}
