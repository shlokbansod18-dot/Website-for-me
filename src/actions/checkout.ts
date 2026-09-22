"use server";

import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { clearCart, getCart } from "@/lib/cart";
import { charge } from "@/lib/payments";
import { placeOrder } from "@/lib/orders";
import { audit, rateLimit } from "@/lib/rate-limit";
import { clientFingerprint } from "@/lib/request";
import { keepValues } from "@/lib/form-values";
import { checkoutSchema, fieldErrors } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

/**
 * The billing fields we hand back to the form when something fails, so a
 * declined card does not wipe an address someone just typed. The card number
 * and security code are deliberately absent — they never make a round trip.
 */
const KEEP = ["fullName", "country", "city", "postalCode", "addressLine", "taxId"] as const;

/**
 * The one place money moves.
 *
 * Note what is *not* here: the totals are recomputed from the database on the
 * server, never read from the submitted form. A tampered price field in the
 * browser therefore changes nothing — the customer is charged what the
 * catalogue says.
 */
export async function checkoutAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const keep = keepValues(formData, KEEP);

  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Please sign in to complete your purchase.", values: keep };
  }

  const { ipHash } = await clientFingerprint();
  const limit = rateLimit(`checkout:${user.id}`, 10, 10 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, message: "Too many payment attempts. Please wait a few minutes.", values: keep };
  }

  const summary = await getCart();
  if (summary.items.length === 0) {
    return { ok: false, message: "Your bag is empty.", values: keep };
  }

  const parsed = checkoutSchema.safeParse({
    fullName: formData.get("fullName"),
    country: formData.get("country"),
    city: formData.get("city"),
    postalCode: formData.get("postalCode"),
    addressLine: formData.get("addressLine"),
    taxId: formData.get("taxId") ?? "",
    cardNumber: formData.get("cardNumber"),
    cardName: formData.get("cardName"),
    expiry: formData.get("expiry"),
    cvc: formData.get("cvc"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error), values: keep };
  }

  const data = parsed.data;

  const payment = await charge({
    cardNumber: data.cardNumber,
    cvc: data.cvc,
    expiry: data.expiry,
    amountCents: summary.totalCents,
    currency: summary.currency,
  });

  if (!payment.ok) {
    // The audit trail records that a payment failed and why the processor said
    // so — never any part of the card itself.
    audit("order.payment_failed", { userId: user.id, detail: { reason: payment.reason }, ipHash });
    return { ok: false, fieldErrors: { cardNumber: payment.reason }, values: keep };
  }

  const order = placeOrder({
    userId: user.id,
    cart: summary,
    billing: {
      fullName: data.fullName,
      country: data.country,
      city: data.city,
      postalCode: data.postalCode,
      addressLine: data.addressLine,
      taxId: data.taxId || undefined,
    },
    payment: { brand: payment.brand, last4: payment.last4, reference: payment.reference },
  });

  audit("order.paid", {
    userId: user.id,
    detail: { orderNumber: order.orderNumber, totalCents: summary.totalCents },
    ipHash,
  });

  await clearCart();
  redirect(`/checkout/success?order=${order.id}`);
}
