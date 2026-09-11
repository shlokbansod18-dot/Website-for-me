import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CheckoutForm } from "@/components/checkout-form";
import { OrderSummary } from "@/components/order-summary";
import { ProductCover } from "@/components/product-cover";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");

  const cart = await getCart();
  if (cart.items.length === 0) redirect("/cart");

  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Almost yours</p>
          <h1 className="display-sm mt-3">Checkout</h1>
        </div>
        <Link
          href="/cart"
          className="text-[0.8125rem] text-faint transition-colors hover:text-text"
        >
          ← Back to bag
        </Link>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
        <CheckoutForm defaultName={user.name} />

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="card mb-4 p-6">
            <h2 className="eyebrow mb-5">Delivering to</h2>
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-acid font-display text-sm font-bold text-acid-ink">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 text-[0.8125rem]">
                <p className="truncate font-medium">{user.name}</p>
                <p className="truncate text-faint">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="card mb-4 overflow-hidden">
            <h2 className="eyebrow border-b border-line px-6 py-4">
              {cart.items.length} item{cart.items.length === 1 ? "" : "s"}
            </h2>
            <ul className="divide-y divide-[var(--line)]">
              {cart.items.map((product) => (
                <li key={product.id} className="flex items-center gap-3 px-6 py-4">
                  <ProductCover
                    seed={product.slug}
                    accent={product.accent}
                    glyph={product.glyph}
                    size="sm"
                    className="size-11 shrink-0 rounded-lg"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.8125rem] font-medium">
                      {product.title}
                    </span>
                    <span className="block truncate text-xs text-faint">v{product.version}</span>
                  </span>
                  <span className="numeric shrink-0 text-[0.8125rem]">
                    {formatMoney(product.priceCents, product.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <OrderSummary cart={cart} />
        </aside>
      </div>
    </div>
  );
}
