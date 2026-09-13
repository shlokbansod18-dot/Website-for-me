/**
 * The canonical database schema.
 *
 * Written as plain JavaScript rather than TypeScript on purpose: the Next.js
 * app imports it through `src/lib/db.ts`, and the standalone setup and seed
 * scripts in `scripts/` import the very same file directly with Node. One
 * definition, no chance of the two drifting apart.
 */
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'customer',
  marketing_opt_in INTEGER NOT NULL DEFAULT 0,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until  INTEGER,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL,
  user_agent   TEXT,
  ip_hash      TEXT,
  created_at   INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS products (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  tagline        TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  category       TEXT NOT NULL DEFAULT 'Other',
  price_cents    INTEGER NOT NULL DEFAULT 0,
  compare_at_cents INTEGER,
  currency       TEXT NOT NULL DEFAULT 'USD',
  status         TEXT NOT NULL DEFAULT 'draft',
  seller_id      TEXT REFERENCES users(id) ON DELETE SET NULL,
  accent         TEXT NOT NULL DEFAULT 'acid',
  glyph          TEXT NOT NULL DEFAULT '◆',
  highlights     TEXT NOT NULL DEFAULT '[]',
  tags           TEXT NOT NULL DEFAULT '[]',
  file_name      TEXT,
  file_path      TEXT,
  file_size      INTEGER,
  file_mime      TEXT,
  version        TEXT NOT NULL DEFAULT '1.0',
  licence        TEXT NOT NULL DEFAULT 'Standard commercial licence',
  rating         REAL NOT NULL DEFAULT 5,
  sales_count    INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,
  order_number   TEXT NOT NULL UNIQUE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status         TEXT NOT NULL DEFAULT 'paid',
  subtotal_cents INTEGER NOT NULL,
  discount_cents INTEGER NOT NULL DEFAULT 0,
  tax_cents      INTEGER NOT NULL DEFAULT 0,
  total_cents    INTEGER NOT NULL,
  currency       TEXT NOT NULL DEFAULT 'USD',
  coupon_code    TEXT,
  billing_enc    TEXT,
  payment_brand  TEXT,
  payment_last4  TEXT,
  created_at     INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id          TEXT PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  TEXT REFERENCES products(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  licence_key TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

CREATE TABLE IF NOT EXISTS entitlements (
  id             TEXT PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id     TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id       TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  licence_key    TEXT NOT NULL,
  downloads_used INTEGER NOT NULL DEFAULT 0,
  created_at     INTEGER NOT NULL,
  UNIQUE(user_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON entitlements(user_id);

CREATE TABLE IF NOT EXISTS coupons (
  code        TEXT PRIMARY KEY,
  kind        TEXT NOT NULL,
  value       INTEGER NOT NULL,
  active      INTEGER NOT NULL DEFAULT 1,
  expires_at  INTEGER,
  max_redemptions INTEGER,
  redeemed    INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_log (
  id         TEXT PRIMARY KEY,
  user_id    TEXT,
  action     TEXT NOT NULL,
  detail     TEXT,
  ip_hash    TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS rate_limits (
  bucket     TEXT PRIMARY KEY,
  count      INTEGER NOT NULL,
  reset_at   INTEGER NOT NULL
);
`;
