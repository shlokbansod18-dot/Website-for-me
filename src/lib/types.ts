export type Role = "customer" | "seller" | "owner";

export type UserRow = {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: Role;
  marketing_opt_in: number;
  failed_logins: number;
  locked_until: number | null;
  created_at: number;
  updated_at: number;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  marketingOptIn: boolean;
  createdAt: number;
};

export type ProductRow = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  price_cents: number;
  compare_at_cents: number | null;
  currency: string;
  status: "draft" | "published";
  seller_id: string | null;
  accent: string;
  glyph: string;
  highlights: string;
  tags: string;
  file_name: string | null;
  file_path: string | null;
  file_size: number | null;
  file_mime: string | null;
  version: string;
  licence: string;
  rating: number;
  sales_count: number;
  created_at: number;
  updated_at: number;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  priceCents: number;
  compareAtCents: number | null;
  currency: string;
  status: "draft" | "published";
  accent: string;
  glyph: string;
  highlights: string[];
  tags: string[];
  fileName: string | null;
  fileSize: number | null;
  version: string;
  licence: string;
  rating: number;
  salesCount: number;
  createdAt: number;
  updatedAt: number;
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status: string;
  subtotal_cents: number;
  discount_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  coupon_code: string | null;
  billing_enc: string | null;
  payment_brand: string | null;
  payment_last4: string | null;
  created_at: number;
};

export type BillingDetails = {
  fullName: string;
  country: string;
  city: string;
  postalCode: string;
  addressLine: string;
  taxId?: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  price_cents: number;
  licence_key: string;
};

export type SessionRow = {
  id: string;
  user_id: string;
  token_hash: string;
  user_agent: string | null;
  ip_hash: string | null;
  created_at: number;
  last_seen_at: number;
  expires_at: number;
};

/**
 * Shape returned by every server action, so forms can render errors uniformly.
 *
 * `values` echoes back what the person typed. React resets a `<form action>`
 * to its defaultValue once the action settles, so without this a single
 * validation error would wipe a long product description or a whole billing
 * address. Nothing sensitive is ever echoed — card fields are held in
 * component state instead and never make the round trip.
 */
export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};
