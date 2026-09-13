import "server-only";

import { cookies } from "next/headers";

import { sign, unsign } from "./crypto";
import { getDb, now } from "./db";
import { getProductsByIds } from "./catalog";
import { IS_PROD } from "./env";
import type { Product } from "./types";

export const CART_COOKIE = "ss_cart";
export const COUPON_COOKIE = "ss_coupon";
const MAX_ITEMS = 40;

/**
 * The basket lives in a signed, HTTP-only cookie rather than a database row.
 *
 * Digital goods are bought one licence at a time, so a cart is just a short
 * list of product ids — no quantities, no personal data. Keeping it in a
 * signed cookie means guests get a working cart without us creating a tracking
 * record for someone who has not signed up, and the signature means a visitor
 * cannot hand themselves a basket referencing products that do not exist.
 */

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: IS_PROD,
    path: "/",
    maxAge,
  };
}

export async function readCartIds(): Promise<string[]> {
  const jar = await cookies();
  const payload = unsign(jar.get(CART_COOKIE)?.value);
  if (!payload) return [];
  try {
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

async function writeCartIds(ids: string[]): Promise<void> {
  const jar = await cookies();
  const unique = Array.from(new Set(ids)).slice(0, MAX_ITEMS);
  if (unique.length === 0) {
    jar.set(CART_COOKIE, "", cookieOptions(0));
    return;
  }
  jar.set(CART_COOKIE, sign(JSON.stringify(unique)), cookieOptions(30 * 24 * 60 * 60));
}

export async function addToCart(productId: string): Promise<void> {
  const ids = await readCartIds();
  if (!ids.includes(productId)) ids.push(productId);
  await writeCartIds(ids);
}

export async function removeFromCart(productId: string): Promise<void> {
  await writeCartIds((await readCartIds()).filter((id) => id !== productId));
}

export async function clearCart(): Promise<void> {
  await writeCartIds([]);
  await setCoupon(null);
}

export async function cartCount(): Promise<number> {
  return (await readCartIds()).length;
}

/* ── Coupons ───────────────────────────────────────────────────────────── */

export type Coupon = {
  code: string;
  kind: "percent" | "fixed";
  value: number;
};

export async function setCoupon(code: string | null): Promise<void> {
  const jar = await cookies();
  if (!code) {
    jar.set(COUPON_COOKIE, "", cookieOptions(0));
    return;
  }
  jar.set(COUPON_COOKIE, sign(code), cookieOptions(24 * 60 * 60));
}

export async function readCoupon(): Promise<Coupon | null> {
  const jar = await cookies();
  const code = unsign(jar.get(COUPON_COOKIE)?.value);
  return code ? lookupCoupon(code) : null;
}

export function lookupCoupon(code: string): Coupon | null {
  const row = getDb().prepare("SELECT * FROM coupons WHERE code = ? AND active = 1").get(code) as
    | {
        code: string;
        kind: "percent" | "fixed";
        value: number;
        expires_at: number | null;
        max_redemptions: number | null;
        redeemed: number;
      }
    | undefined;
  if (!row) return null;
  if (row.expires_at && row.expires_at < now()) return null;
  if (row.max_redemptions !== null && row.redeemed >= row.max_redemptions) return null;
  return { code: row.code, kind: row.kind, value: row.value };
}

/* ── Totals ────────────────────────────────────────────────────────────── */

export type CartSummary = {
  items: Product[];
  coupon: Coupon | null;
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
};

export function summarise(items: Product[], coupon: Coupon | null): CartSummary {
  const subtotalCents = items.reduce((sum, item) => sum + item.priceCents, 0);

  let discountCents = 0;
  if (coupon && subtotalCents > 0) {
    discountCents =
      coupon.kind === "percent"
        ? Math.round((subtotalCents * coupon.value) / 100)
        : Math.min(coupon.value, subtotalCents);
  }

  // Digital goods carry no shipping. Tax is shown as zero here because tax on
  // digital sales depends on where the buyer is; wire your tax provider in
  // before selling for real.
  const taxCents = 0;
  const totalCents = Math.max(0, subtotalCents - discountCents + taxCents);

  return {
    items,
    coupon,
    subtotalCents,
    discountCents,
    taxCents,
    totalCents,
    currency: items[0]?.currency ?? "USD",
  };
}

export async function getCart(): Promise<CartSummary> {
  const ids = await readCartIds();
  const items = getProductsByIds(ids);
  return summarise(items, await readCoupon());
}
