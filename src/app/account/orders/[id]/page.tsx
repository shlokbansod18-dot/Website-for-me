import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/money";
import { getOrder } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");

  const { id } = await params;
  const record = getOrder(id, user.id);
  if (!record) notFound();

  const { order, items, billing } = record;

  return (
    <div>
      <Link
        href="/account/orders"
        className="mb-6 inline-block text-[0.8125rem] text-faint transition-colors hover:text-text"
      >
        ← All orders
      </Link>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-7">
          <div>
            <p className="eyebrow">Invoice</p>
            <h2 className="numeric mt-2 font-mono text-xl font-medium">{order.order_number}</h2>
            <p className="mt-1 text-xs text-faint">{formatDateTime(order.created_at)}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[0.6875rem] font-medium ${
              order.status === "paid" ? "bg-acid/12 text-acid" : "bg-flare/12 text-flare"
            }`}
          >
            {order.status === "paid" ? "Paid in full" : order.status}
          </span>
        </div>

        <div className="grid gap-8 border-b border-line p-7 sm:grid-cols-2">
          <div>
            <h3 className="eyebrow mb-3">Billed to</h3>
            {billing ? (
              <address className="space-y-0.5 text-[0.8125rem] not-italic leading-relaxed text-dim">
                <p className="text-text">{billing.fullName}</p>
                <p>{billing.addressLine}</p>
                <p>
                  {billing.city} {billing.postalCode}
                </p>
                <p>{billing.country}</p>
                {billing.taxId ? <p className="pt-1 text-faint">Tax ID {billing.taxId}</p> : null}
              </address>
            ) : (
              <p className="text-[0.8125rem] text-faint">
                The billing details for this order could not be decrypted. This happens if the
                site&rsquo;s encryption key was changed after the order was placed.
              </p>
            )}
          </div>

          <div>
            <h3 className="eyebrow mb-3">Payment</h3>
            <dl className="space-y-1.5 text-[0.8125rem] text-dim">
              <div className="flex justify-between gap-4">
                <dt>Method</dt>
                <dd className="text-right">
                  {order.payment_brand
                    ? `${order.payment_brand} •••• ${order.payment_last4}`
                    : "Card"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Currency</dt>
                <dd>{order.currency}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Delivery</dt>
                <dd className="text-acid">Instant download</dd>
              </div>
            </dl>
          </div>
        </div>

        <table className="w-full text-[0.8125rem]">
          <caption className="sr-only">Items in order {order.order_number}</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th scope="col" className="eyebrow px-7 py-3 font-normal">
                Product
              </th>
              <th scope="col" className="eyebrow px-7 py-3 text-right font-normal">
                Price
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-line">
                <td className="px-7 py-4">
                  <span className="block font-medium">{item.title}</span>
                  <code className="mt-1 block font-mono text-[0.6875rem] tracking-wider text-faint">
                    {item.licence_key}
                  </code>
                </td>
                <td className="numeric px-7 py-4 text-right align-top">
                  {formatMoney(item.price_cents, order.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <dl className="space-y-2.5 p-7 text-[0.8125rem]">
          <div className="flex justify-between">
            <dt className="text-dim">Subtotal</dt>
            <dd className="numeric">{formatMoney(order.subtotal_cents, order.currency)}</dd>
          </div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between text-acid">
              <dt>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</dt>
              <dd className="numeric">−{formatMoney(order.discount_cents, order.currency)}</dd>
            </div>
          )}
          <div className="flex items-end justify-between border-t border-line pt-4">
            <dt className="text-dim">Total</dt>
            <dd className="numeric font-display text-2xl font-bold tracking-tight">
              {formatMoney(order.total_cents, order.currency)}
            </dd>
          </div>
        </dl>
      </div>

      <p className="mt-5 text-[0.6875rem] leading-relaxed text-faint">
        Need this as a PDF? Use your browser&rsquo;s print dialogue and choose &ldquo;Save as
        PDF&rdquo;. Your billing address is stored encrypted and is only ever decrypted to render
        this page for you.
      </p>
    </div>
  );
}
