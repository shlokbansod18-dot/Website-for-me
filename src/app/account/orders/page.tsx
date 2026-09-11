import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatDateTime, formatMoney } from "@/lib/money";
import { listOrders } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/orders");

  const orders = listOrders(user.id);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-xl font-bold tracking-[-0.035em]">Orders</h2>
        <p className="mt-1 text-[0.8125rem] text-dim">
          Every receipt, kept for as long as your account exists.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="card grid place-items-center px-6 py-20 text-center">
          <span aria-hidden className="font-display text-4xl text-faint">
            ▤
          </span>
          <h3 className="mt-5 font-display text-lg font-bold">No orders yet</h3>
          <ButtonLink href="/products" className="mt-6">
            Browse the shop
          </ButtonLink>
        </div>
      ) : (
        <ul className="space-y-px overflow-hidden rounded-[1.5rem] border border-line">
          {orders.map(({ order, itemCount }) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="flex flex-wrap items-center gap-4 bg-surface p-5 transition-colors hover:bg-surface-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="numeric font-mono text-[0.8125rem] font-medium">
                    {order.order_number}
                  </p>
                  <p className="mt-1 text-xs text-faint">
                    {formatDateTime(order.created_at)} · {itemCount} item
                    {itemCount === 1 ? "" : "s"}
                    {order.payment_brand
                      ? ` · ${order.payment_brand} ending ${order.payment_last4}`
                      : ""}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[0.625rem] font-medium tracking-wide ${
                    order.status === "paid"
                      ? "bg-acid/12 text-acid"
                      : "bg-flare/12 text-flare"
                  }`}
                >
                  {order.status.toUpperCase()}
                </span>

                <span className="numeric font-display text-base font-bold tracking-tight">
                  {formatMoney(order.total_cents, order.currency)}
                </span>

                <span aria-hidden className="text-faint">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
