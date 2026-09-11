import "server-only";

import { getDb, now } from "./db";
import { encryptJSON, decryptJSON, humanCode, randomId } from "./crypto";
import { toProduct } from "./catalog";
import type {
  BillingDetails,
  OrderItemRow,
  OrderRow,
  Product,
  ProductRow,
} from "./types";
import type { CartSummary } from "./cart";

export type PlacedOrder = {
  id: string;
  orderNumber: string;
};

export function licenceKey(): string {
  return `SS-${humanCode(4)}-${humanCode(4)}-${humanCode(4)}`;
}

/**
 * Writes the order, its line items and the buyer's permanent entitlements in
 * one transaction — if any part fails, nothing is recorded and no money is
 * considered taken.
 *
 * The billing address is encrypted with AES-256-GCM before it is written, so
 * the row on disk is unreadable without the key from the environment.
 */
export function placeOrder(args: {
  userId: string;
  cart: CartSummary;
  billing: BillingDetails;
  payment: { brand: string; last4: string; reference: string };
}): PlacedOrder {
  const db = getDb();
  const { userId, cart, billing, payment } = args;

  const orderId = randomId();
  const orderNumber = `SS-${humanCode(6)}`;
  const ts = now();

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO orders (
         id, order_number, user_id, status, subtotal_cents, discount_cents, tax_cents,
         total_cents, currency, coupon_code, billing_enc, payment_brand, payment_last4, created_at
       ) VALUES (?, ?, ?, 'paid', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      orderId,
      orderNumber,
      userId,
      cart.subtotalCents,
      cart.discountCents,
      cart.taxCents,
      cart.totalCents,
      cart.currency,
      cart.coupon?.code ?? null,
      encryptJSON(billing),
      payment.brand,
      payment.last4,
      ts,
    );

    const insertItem = db.prepare(
      `INSERT INTO order_items (id, order_id, product_id, title, price_cents, licence_key)
       VALUES (?, ?, ?, ?, ?, ?)`,
    );
    const insertEntitlement = db.prepare(
      `INSERT INTO entitlements (id, user_id, product_id, order_id, licence_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id, product_id) DO NOTHING`,
    );
    const bumpSales = db.prepare("UPDATE products SET sales_count = sales_count + 1 WHERE id = ?");

    for (const item of cart.items) {
      const key = licenceKey();
      insertItem.run(randomId(), orderId, item.id, item.title, item.priceCents, key);
      insertEntitlement.run(randomId(), userId, item.id, orderId, key, ts);
      bumpSales.run(item.id);
    }

    if (cart.coupon) {
      db.prepare("UPDATE coupons SET redeemed = redeemed + 1 WHERE code = ?").run(cart.coupon.code);
    }
  });

  tx();
  return { id: orderId, orderNumber };
}

export function getOrder(orderId: string, userId: string) {
  const order = getDb()
    .prepare("SELECT * FROM orders WHERE id = ? AND user_id = ?")
    .get(orderId, userId) as OrderRow | undefined;
  if (!order) return null;

  const items = getDb()
    .prepare("SELECT * FROM order_items WHERE order_id = ?")
    .all(orderId) as OrderItemRow[];

  return {
    order,
    items,
    billing: decryptJSON<BillingDetails>(order.billing_enc),
  };
}

export function listOrders(userId: string) {
  const orders = getDb()
    .prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC")
    .all(userId) as OrderRow[];

  const countItems = getDb().prepare(
    "SELECT COUNT(*) AS n FROM order_items WHERE order_id = ?",
  );
  return orders.map((order) => ({
    order,
    itemCount: (countItems.get(order.id) as { n: number }).n,
  }));
}

export type LibraryEntry = {
  entitlementId: string;
  licenceKey: string;
  purchasedAt: number;
  downloadsUsed: number;
  product: Product;
};

export function listLibrary(userId: string): LibraryEntry[] {
  const rows = getDb()
    .prepare(
      `SELECT e.id AS entitlement_id, e.licence_key, e.created_at, e.downloads_used, p.*
       FROM entitlements e
       JOIN products p ON p.id = e.product_id
       WHERE e.user_id = ?
       ORDER BY e.created_at DESC`,
    )
    .all(userId) as (ProductRow & {
    entitlement_id: string;
    licence_key: string;
    downloads_used: number;
  })[];

  return rows.map((row) => ({
    entitlementId: row.entitlement_id,
    licenceKey: row.licence_key,
    purchasedAt: row.created_at,
    downloadsUsed: row.downloads_used,
    product: toProduct(row),
  }));
}

export function ownsProduct(userId: string, productId: string): boolean {
  const row = getDb()
    .prepare("SELECT 1 AS x FROM entitlements WHERE user_id = ? AND product_id = ?")
    .get(userId, productId);
  return Boolean(row);
}

export function sellerStats(sellerId: string) {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT COUNT(oi.id) AS sales, COALESCE(SUM(oi.price_cents), 0) AS revenue
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE p.seller_id = ?`,
    )
    .get(sellerId) as { sales: number; revenue: number };

  const live = db
    .prepare("SELECT COUNT(*) AS n FROM products WHERE seller_id = ? AND status = 'published'")
    .get(sellerId) as { n: number };

  return { sales: row.sales, revenueCents: row.revenue, live: live.n };
}
