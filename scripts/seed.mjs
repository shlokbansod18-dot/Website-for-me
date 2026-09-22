#!/usr/bin/env node
/**
 * Fills an empty shop with example products, two demo logins and a couple of
 * working coupons, so you can click through the whole buy-and-download flow
 * straight away.
 *
 * Idempotent: running it twice does nothing the second time. Pass --force to
 * wipe the catalogue and re-seed it.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

import { SCHEMA } from "../src/lib/schema.mjs";
import { hashPassword } from "../src/lib/hash.mjs";
import { encryptJSON } from "../src/lib/encryption.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, "data"));
const uploadDir = path.join(dataDir, "uploads");
const force = process.argv.includes("--force");

fs.mkdirSync(uploadDir, { recursive: true, mode: 0o700 });

const db = new Database(path.join(dataDir, "softsystem.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(SCHEMA);

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const id = () => crypto.randomUUID();

const existing = db.prepare("SELECT COUNT(*) AS n FROM products").get().n;
if (existing > 0 && !force) {
  console.log(`\n  Catalogue already has ${existing} products, nothing to do.`);
  console.log("  Run  npm run seed -- --force  to replace them.\n");
  process.exit(0);
}

if (force) {
  db.exec("DELETE FROM products;");
  console.log("  cleared the existing catalogue");
}

/* ── Demo accounts ──────────────────────────────────────────────────────── */

/**
 * The demo seller is always a .test address, never OWNER_EMAIL.
 *
 * These accounts are created with a password printed in this file and in the
 * README, so they must never land on a real mailbox, or seeding a
 * deployed site would hand anyone who reads the repository an owner login.
 * OWNER_EMAIL is about promoting an account *you* register with your own
 * password; it has nothing to do with the demo data.
 */
const SELLER_EMAIL = "studio@softsystem.test";
const SELLER_PASSWORD = "SoftSystem!Studio1";
const BUYER_EMAIL = "you@softsystem.test";
const BUYER_PASSWORD = "SoftSystem!Demo1";

function upsertUser(email, name, password, role) {
  const found = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (found) return found.id;
  const userId = id();
  db.prepare(
    `INSERT INTO users (id, email, name, password_hash, role, marketing_opt_in, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
  ).run(userId, email, name, hashPassword(password), role, now, now);
  return userId;
}

const sellerId = upsertUser(SELLER_EMAIL, "softsystem studio", SELLER_PASSWORD, "owner");
const buyerId = upsertUser(BUYER_EMAIL, "Sam Buyer", BUYER_PASSWORD, "customer");

/* ── Sample downloads ───────────────────────────────────────────────────── */

/**
 * Each demo product needs a real file behind it, otherwise "buy then
 * download" cannot be tested. We write a small readme per product rather than
 * shipping binaries in the repository.
 */
function sampleFile(product) {
  const storedName = `${id()}.txt`;
  const body = `${product.title}
${"=".repeat(product.title.length)}

${product.tagline}

Thanks for buying from softsystem. This placeholder stands in for the real
download while you are trying the shop out. Replace it from the Studio:

  Studio -> ${product.title} -> Edit -> Product file

Version ${product.version}
Licence: ${product.licence}
`;
  fs.writeFileSync(path.join(uploadDir, storedName), body, { mode: 0o600 });
  return { storedName, size: Buffer.byteLength(body), name: `${product.slug}-v${product.version}.txt` };
}

/* ── Catalogue ──────────────────────────────────────────────────────────── */

const products = [
  {
    slug: "nocturne-ui",
    title: "Nocturne UI",
    tagline: "A 340-component dark-first design system for Figma, built to be shipped not admired.",
    category: "UI Kits",
    price: 6900,
    compareAt: 9900,
    accent: "persimmon",
    rating: 4.9,
    sales: 2841,
    version: "3.2",
    age: 120,
    description: `Nocturne is the design system I use on client work, cleaned up and documented.

Every component is built with auto-layout and variables, so resizing a card does what you expect instead of exploding. Light and dark themes are driven by one set of colour variables. Swap the mode and the whole file follows.

It covers the boring parts properly: form states, empty states, loading skeletons, toasts, table density, and a 60-page pattern library showing how the pieces fit together on real screens.`,
    highlights: [
      "340 components, all auto-layout and variable-driven",
      "Light and dark themes from a single variable set",
      "60-page pattern library of assembled screens",
      "Tailwind and CSS token exports included",
      "Free updates for life, and v3.2 shipped last month",
    ],
    tags: ["figma", "design system", "dark mode", "components"],
  },
  {
    slug: "ledger-notion-os",
    title: "Ledger for Notion",
    tagline: "One Notion workspace that finally holds your projects, clients, invoices and week.",
    category: "Notion",
    price: 3900,
    compareAt: null,
    accent: "violet",
    rating: 4.8,
    sales: 5210,
    version: "2.0",
    age: 64,
    description: `Most Notion templates are a pretty dashboard on top of nothing. Ledger is the opposite. It is boring in exactly the right places.

Projects roll into clients. Clients roll into invoices. Invoices roll into a revenue view that tells you what you actually earned this quarter. Your weekly review pulls from all of it automatically.

Set-up is a 12-minute video and a duplicate button.`,
    highlights: [
      "Projects, clients, invoices and revenue in one linked system",
      "Automatic weekly review that fills itself in",
      "Quarterly revenue rollup with paid/unpaid tracking",
      "12-minute set-up walkthrough",
    ],
    tags: ["notion", "freelance", "invoicing", "productivity"],
  },
  {
    slug: "halcyon-icons",
    title: "Halcyon Icons",
    tagline: "1,200 pixel-snapped icons in four weights that stay crisp at 16px.",
    category: "Icons",
    price: 2900,
    compareAt: 4900,
    accent: "chartreuse",
    rating: 5,
    sales: 3902,
    version: "1.8",
    age: 30,
    description: `Icons that were drawn at 16px and scaled up, not drawn at 64px and squashed down. That is the whole difference, and you can see it immediately in a dense interface.

Four weights, a consistent 1.5px stroke, and every icon aligned to a pixel grid. Ships as SVG, an icon font, a React component library and a Figma library.`,
    highlights: [
      "1,200 icons across four weights",
      "Drawn on a 16px grid, so no blurry half-pixels",
      "SVG, icon font, React components and Figma library",
      "Consistent 1.5px stroke throughout",
    ],
    tags: ["icons", "svg", "react", "figma"],
  },
  {
    slug: "grotesk-nine",
    title: "Grotesk Nine",
    tagline: "A variable display grotesk with a mean streak. Nine widths, one file.",
    category: "Fonts",
    price: 4900,
    compareAt: null,
    accent: "jade",
    rating: 4.7,
    sales: 1180,
    version: "1.1",
    age: 18,
    description: `A display grotesk for headlines that need to land. Tight apertures, flat terminals, and a width axis that goes from condensed poster type to something almost extended.

Two axes, weight 200 to 900 and width 75 to 125, in a single variable file, plus static instances if your workflow needs them.

Latin Extended, tabular figures, and a full set of arrows and symbols.`,
    highlights: [
      "Variable: weight 200–900, width 75–125",
      "Static instances included for older workflows",
      "Latin Extended with tabular figures",
      "Desktop, web and app licence in one purchase",
    ],
    tags: ["font", "variable font", "display", "typography"],
  },
  {
    slug: "kodak-ghost-presets",
    title: "Kodak Ghost",
    tagline: "24 Lightroom presets that look like film and not like a filter.",
    category: "Presets",
    price: 2400,
    compareAt: 3900,
    accent: "blush",
    rating: 4.6,
    sales: 4470,
    version: "2.1",
    age: 9,
    description: `Built from scans of Portra, Gold and Tri-X, then rebuilt until they behaved on digital files.

The point of these is restraint. Skin stays skin. Highlights roll instead of clipping. Shadows go slightly cool the way film does, without turning your photo into a teal-and-orange poster.

Includes desktop and mobile Lightroom versions, plus a one-page guide on fixing exposure before you apply anything.`,
    highlights: [
      "24 presets built from real film scans",
      "Desktop (.xmp) and mobile (.dng) versions",
      "Skin tones protected in every preset",
      "Exposure-first workflow guide included",
    ],
    tags: ["lightroom", "presets", "film", "photography"],
  },
  {
    slug: "landing-lab",
    title: "Landing Lab",
    tagline: "Twelve landing pages that convert, in clean Next.js and Tailwind.",
    category: "Templates",
    price: 5900,
    compareAt: 8900,
    accent: "sky",
    rating: 4.8,
    sales: 2210,
    version: "4.0",
    age: 45,
    description: `Twelve complete landing pages for SaaS, app, course, agency, waitlist, changelog and more, as real Next.js App Router code rather than a screenshot you have to rebuild.

Every page is responsive, accessible, dark-mode aware and scores 100 on Lighthouse out of the box. No component library to learn: it is Tailwind and plain React, so you can pull one section into an existing project without dragging in a dependency.`,
    highlights: [
      "12 full pages in Next.js App Router + Tailwind",
      "100/100 Lighthouse before you change anything",
      "Dark mode and reduced-motion handled properly",
      "Copy-paste sections, no component library lock-in",
    ],
    tags: ["nextjs", "tailwind", "landing page", "template"],
  },
  {
    slug: "signal-sound-pack",
    title: "Signal Sound Pack",
    tagline: "180 interface sounds that do not make people turn the volume off.",
    category: "Audio",
    price: 1900,
    compareAt: null,
    accent: "butter",
    rating: 4.9,
    sales: 1640,
    version: "1.4",
    age: 21,
    description: `Taps, toggles, sends, errors, successes and notifications, recorded and synthesised for interfaces rather than pulled from a stock library.

Everything is short, quiet and mixed to sit under speech. Delivered at 48kHz/24-bit WAV plus web-ready compressed versions, with the whole set also mapped into a single sprite sheet and a JSON index for the web.`,
    highlights: [
      "180 sounds across 12 interaction families",
      "48kHz/24-bit WAV plus compressed web versions",
      "Audio sprite and JSON index for the web",
      "Royalty-free in commercial products",
    ],
    tags: ["audio", "ui sound", "wav", "interaction"],
  },
  {
    slug: "blockform-3d",
    title: "Blockform 3D",
    tagline: "90 abstract 3D shapes, lit and ready to drop into a hero section.",
    category: "3D",
    price: 7900,
    compareAt: null,
    accent: "graphite",
    rating: 4.7,
    sales: 860,
    version: "1.2",
    age: 76,
    description: `Ninety abstract objects. Spirals, torus knots, soft blobs, glass shards and chrome ribbons, already lit with a three-point studio setup so they look finished the moment you import them.

Ships as .blend source files, GLB for the web, and 4K transparent PNG renders from six angles if you never want to open a 3D app at all.`,
    highlights: [
      "90 objects, studio-lit and render-ready",
      ".blend sources, GLB for web, 4K PNG renders",
      "Six pre-rendered angles per object",
      "Material presets: glass, chrome, matte, iridescent",
    ],
    tags: ["3d", "blender", "glb", "render"],
  },
  {
    slug: "ship-it-course",
    title: "Ship It: Selling Digital Products",
    tagline: "The four-hour course on going from a folder of files to actual revenue.",
    category: "Courses",
    price: 8900,
    compareAt: 14900,
    accent: "persimmon",
    rating: 4.9,
    sales: 1320,
    version: "2.0",
    age: 5,
    description: `Four hours, no filler, on the part nobody teaches: what happens after you have made something good.

Pricing that does not leave money on the table. Writing a product page that answers the question the buyer is actually asking. Getting the first hundred customers without an audience. Handling refunds, piracy and support without losing your weekends.

Comes with the pricing spreadsheet, a product-page checklist and the launch email sequence I still use.`,
    highlights: [
      "4 hours across 22 lessons, no filler",
      "Pricing spreadsheet and product-page checklist",
      "The launch email sequence, ready to adapt",
      "Updated for 2026, with v2.0 just released",
    ],
    tags: ["course", "business", "pricing", "marketing"],
  },
];

const insert = db.prepare(
  `INSERT INTO products (
     id, slug, title, tagline, description, category, price_cents, compare_at_cents,
     currency, status, seller_id, accent, highlights, tags,
     file_name, file_path, file_size, file_mime, version, licence,
     rating, sales_count, created_at, updated_at
   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'USD', 'published', ?, ?, ?, ?, ?, ?, ?, 'text/plain', ?, ?, ?, ?, ?, ?)`,
);

const seedAll = db.transaction(() => {
  for (const product of products) {
    const licence = "Standard commercial licence for unlimited personal and client projects.";
    const file = sampleFile({ ...product, licence });
    const created = now - product.age * day;
    insert.run(
      id(),
      product.slug,
      product.title,
      product.tagline,
      product.description,
      product.category,
      product.price,
      product.compareAt,
      sellerId,
      product.accent,
      JSON.stringify(product.highlights),
      JSON.stringify(product.tags),
      file.name,
      file.storedName,
      file.size,
      product.version,
      licence,
      product.rating,
      product.sales,
      created,
      created,
    );
  }

  const coupon = db.prepare(
    `INSERT INTO coupons (code, kind, value, active, expires_at, max_redemptions, redeemed, created_at)
     VALUES (?, ?, ?, 1, ?, ?, 0, ?)
     ON CONFLICT(code) DO NOTHING`,
  );
  coupon.run("LAUNCH20", "percent", 20, now + 90 * day, null, now);
  coupon.run("FIRST10", "fixed", 1000, now + 90 * day, 500, now);
});

seedAll();

/* ── A little sales history ─────────────────────────────────────────────── */

/**
 * Two real orders for the demo customer, so the library, the order history,
 * the invoice page and the seller's revenue figures all have something in
 * them the first time you look. These go through the same tables a live
 * purchase writes to. There is no separate "demo" path.
 */
function seedOrders() {
  const key = (process.env.ENCRYPTION_KEY || "").trim();
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    console.log("  (skipped demo orders: no ENCRYPTION_KEY yet, so run `npm run seed` again after `npm run dev`)");
    return 0;
  }
  const keyBuffer = Buffer.from(key, "hex");

  const billing = encryptJSON(keyBuffer, {
    fullName: "Sam Buyer",
    country: "United Kingdom",
    city: "Bristol",
    postalCode: "BS1 4DJ",
    addressLine: "8 Example Row",
  });

  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const code = (n) =>
    Array.from(crypto.randomBytes(n), (b) => alphabet[b % alphabet.length]).join("");
  const licence = () => `SS-${code(4)}-${code(4)}-${code(4)}`;

  const baskets = [
    { slugs: ["halcyon-icons", "kodak-ghost-presets"], daysAgo: 12, coupon: "LAUNCH20" },
    { slugs: ["ledger-notion-os"], daysAgo: 3, coupon: null },
  ];

  const write = db.transaction(() => {
    for (const basket of baskets) {
      const rows = basket.slugs.map((slug) =>
        db.prepare("SELECT id, title, price_cents FROM products WHERE slug = ?").get(slug),
      );
      if (rows.some((r) => !r)) continue;

      const subtotal = rows.reduce((sum, r) => sum + r.price_cents, 0);
      const discount = basket.coupon ? Math.round(subtotal * 0.2) : 0;
      const placedAt = now - basket.daysAgo * day;
      const orderId = id();

      db.prepare(
        `INSERT INTO orders (
           id, order_number, user_id, status, subtotal_cents, discount_cents, tax_cents,
           total_cents, currency, coupon_code, billing_enc, payment_brand, payment_last4, created_at
         ) VALUES (?, ?, ?, 'paid', ?, ?, 0, ?, 'USD', ?, ?, 'Visa', '4242', ?)`,
      ).run(
        orderId,
        `SS-${code(6)}`,
        buyerId,
        subtotal,
        discount,
        subtotal - discount,
        basket.coupon,
        billing,
        placedAt,
      );

      for (const row of rows) {
        const licenceKey = licence();
        db.prepare(
          `INSERT INTO order_items (id, order_id, product_id, title, price_cents, licence_key)
           VALUES (?, ?, ?, ?, ?, ?)`,
        ).run(id(), orderId, row.id, row.title, row.price_cents, licenceKey);

        db.prepare(
          `INSERT INTO entitlements (id, user_id, product_id, order_id, licence_key, created_at)
           VALUES (?, ?, ?, ?, ?, ?)
           ON CONFLICT(user_id, product_id) DO NOTHING`,
        ).run(id(), buyerId, row.id, orderId, licenceKey, placedAt);
      }
    }
  });

  write();
  return baskets.length;
}

const orderCount = seedOrders();
db.close();

console.log(`
  Seeded ${products.length} products, 2 coupons${orderCount ? ` and ${orderCount} example orders` : ""}.

  Demo logins
    Seller / Studio    ${SELLER_EMAIL}
                       ${SELLER_PASSWORD}
    Customer           ${BUYER_EMAIL}
                       ${BUYER_PASSWORD}

  Coupons              LAUNCH20  (20% off)
                       FIRST10   ($10 off)

  Test card            4242 4242 4242 4242, any future expiry, any CVC
                       ...0002 declines, ...0069 reads as expired

  Change these before you go anywhere near real customers.
`);
