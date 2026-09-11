import { CouponForm } from "@/components/coupon-form";
import { formatMoney } from "@/lib/money";
import type { CartSummary } from "@/lib/cart";

export function OrderSummary({
  cart,
  showCoupon = true,
  children,
}: {
  cart: CartSummary;
  showCoupon?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="card p-6">
      <h2 className="font-display text-lg font-bold tracking-[-0.035em]">Summary</h2>

      <dl className="mt-6 space-y-3 text-[0.875rem]">
        <div className="flex justify-between">
          <dt className="text-dim">
            Subtotal
            <span className="ml-1.5 text-faint">
              ({cart.items.length} item{cart.items.length === 1 ? "" : "s"})
            </span>
          </dt>
          <dd className="numeric">{formatMoney(cart.subtotalCents, cart.currency)}</dd>
        </div>

        {cart.discountCents > 0 && (
          <div className="flex justify-between text-acid">
            <dt>Discount</dt>
            <dd className="numeric">−{formatMoney(cart.discountCents, cart.currency)}</dd>
          </div>
        )}

        <div className="flex justify-between">
          <dt className="text-dim">VAT / sales tax</dt>
          <dd className="numeric text-faint">Included</dd>
        </div>

        <div className="flex justify-between">
          <dt className="text-dim">Delivery</dt>
          <dd className="text-acid">Instant</dd>
        </div>
      </dl>

      {showCoupon && (
        <div className="mt-6 border-t border-line pt-5">
          <CouponForm applied={cart.coupon?.code ?? null} />
        </div>
      )}

      <div className="mt-6 flex items-end justify-between border-t border-line pt-5">
        <span className="text-[0.875rem] text-dim">Total</span>
        <span className="numeric font-display text-3xl font-bold tracking-[-0.04em]">
          {formatMoney(cart.totalCents, cart.currency)}
        </span>
      </div>

      {children}
    </div>
  );
}
