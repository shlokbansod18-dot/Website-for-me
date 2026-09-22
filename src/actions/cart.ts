"use server";

import { revalidatePath } from "next/cache";

import * as cart from "@/lib/cart";
import { getProductById } from "@/lib/catalog";
import { couponSchema } from "@/lib/validation";
import type { ActionState } from "@/lib/types";

export async function addToCartAction(productId: string): Promise<ActionState> {
  const product = getProductById(productId);
  if (!product || product.status !== "published") {
    return { ok: false, message: "That product is no longer available." };
  }
  await cart.addToCart(product.id);
  revalidatePath("/", "layout");
  return { ok: true, message: `${product.title} added to your bag.` };
}

export async function removeFromCartAction(productId: string): Promise<void> {
  await cart.removeFromCart(productId);
  revalidatePath("/", "layout");
}

/** Form-post version, so removing an item works without JavaScript. */
export async function removeFromCartFormAction(formData: FormData): Promise<void> {
  const productId = String(formData.get("productId") ?? "");
  if (productId) await cart.removeFromCart(productId);
  revalidatePath("/", "layout");
}

export async function clearCartAction(): Promise<void> {
  await cart.clearCart();
  revalidatePath("/", "layout");
}

export async function applyCouponAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = couponSchema.safeParse(formData.get("code"));
  if (!parsed.success || !parsed.data) {
    return { ok: false, message: "Enter a coupon code." };
  }

  const coupon = cart.lookupCoupon(parsed.data);
  if (!coupon) {
    await cart.setCoupon(null);
    return { ok: false, message: "That code is not valid, or it has expired." };
  }

  await cart.setCoupon(coupon.code);
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return {
    ok: true,
    message:
      coupon.kind === "percent"
        ? `${coupon.code} applied, ${coupon.value}% off.`
        : `${coupon.code} applied.`,
  };
}

export async function removeCouponAction(): Promise<void> {
  await cart.setCoupon(null);
  revalidatePath("/cart");
  revalidatePath("/checkout");
}
