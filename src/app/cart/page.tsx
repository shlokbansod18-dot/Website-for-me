import type { Metadata } from "next";
import Link from "next/link";

import { removeFromCartFormAction } from "@/actions/cart";
import { OrderSummary } from "@/components/order-summary";
import { ProductCover } from "@/components/product-cover";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { getCart } from "@/lib/cart";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your bag",
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  const [cart, user] = await Promise.all([getCart(), getCurrentUser()]);

  if (cart.items.length === 0) {
    return (
      <div className="shell py-24">
        <div className="panel mx-auto grid max-w-lg place-items-center px-8 py-20 text-center">
          <span aria-hidden className="font-display text-5xl text-ink-3">
            ⌒
          </span>
          <h1 className="display-2 mt-6">Your bag is empty</h1>
          <p className="mt-4 text-sm text-ink-2">
            Nothing in here yet. The good stuff is one click away.
          </p>
          <ButtonLink href="/products" size="lg" className="mt-8">
            Browse products
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-14 lg:py-20">
      <header className="mb-10">
        <p className="label">Checkout</p>
        <h1 className="display-2 mt-3">Your bag</h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:gap-12">
        <ul className="space-y-px overflow-hidden rounded-[1.5rem] border border-line">
          {cart.items.map((product) => (
            <li
              key={product.id}
              className="flex items-center gap-4 bg-surface p-4 sm:gap-5 sm:p-5"
            >
              <Link href={`/products/${product.slug}`} className="shrink-0">
                <ProductCover
                  seed={product.slug}
                  accent={product.accent}
                  title={product.title}
                  size="sm"
                  className="size-20 rounded border border-line sm:size-24"
                />
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${product.slug}`}
                  className="font-display text-[0.9375rem] leading-tight transition-colors hover:text-accent"
                >
                  {product.title}
                </Link>
                <p className="mt-1 truncate text-xs text-ink-3">
                  {product.category} · v{product.version}
                </p>
                <form action={removeFromCartFormAction} className="mt-2">
                  <input type="hidden" name="productId" value={product.id} />
                  <button
                    type="submit"
                    className="text-xs text-ink-3 underline-offset-4 transition-colors hover:text-alert hover:underline"
                  >
                    Remove
                  </button>
                </form>
              </div>

              <span className="numeric shrink-0 self-start font-display text-base tracking-tight">
                {formatMoney(product.priceCents, product.currency)}
              </span>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary cart={cart}>
            <ButtonLink
              href={user ? "/checkout" : "/login?next=/checkout"}
              size="lg"
              className="mt-6 w-full"
            >
              {user ? "Continue to payment" : "Sign in to check out"}
            </ButtonLink>

            {!user && (
              <p className="mt-3 text-center text-xs text-ink-3">
                New here?{" "}
                <Link href="/signup?next=/checkout" className="text-accent hover:underline">
                  Create an account
                </Link>{" "}
                — it takes about twenty seconds.
              </p>
            )}

            <Link
              href="/products"
              className="mt-4 block text-center text-[0.8125rem] text-ink-3 transition-colors hover:text-ink"
            >
              ← Keep browsing
            </Link>
          </OrderSummary>

          <p className="mt-4 px-2 text-center text-[0.6875rem] leading-relaxed text-ink-3">
            Your bag is stored in a signed, HTTP-only cookie on your own device. We do not build a
            profile of what you looked at.
          </p>
        </aside>
      </div>
    </div>
  );
}
