# SoftSystem

A marketplace for publishing and selling digital products — templates, UI kits,
fonts, presets, sound packs, courses. Buyers pay and download in the same
second. Sellers upload a file, write a page, press publish.

Built to be private by default: no third-party scripts, no analytics, no ad
pixels, card numbers never stored, and personal data encrypted before it
touches the disk.

---

## Run it

You need [Node.js](https://nodejs.org) 20.12 or newer. Nothing else — no
database server, no Docker, no accounts to sign up for.

```bash
npm install     # once
npm run seed    # fills the shop with example products and demo logins
npm run dev     # http://localhost:3000
```

That's it. `npm run dev` creates `.env` with freshly generated secrets and sets
up the database on first run, so there is no configuration step.

### Demo logins

`npm run seed` prints these. They exist only in your local database.

| Role | Email | Password |
| --- | --- | --- |
| Seller (Studio access) | `studio@softsystem.test` | `SoftSystem!Studio1` |
| Customer | `you@softsystem.test` | `SoftSystem!Demo1` |

Or just create your own account — sign-up is a name, an email and a password.

### Test payments

The shop ships with a built-in demo payment processor so the whole
buy-and-download flow works immediately. **It does not move money.**

| Card number | What happens |
| --- | --- |
| `4242 4242 4242 4242` | Approved |
| `4000 0000 0000 0002` | Declined by the bank |
| `4000 0000 0000 0069` | Reads as expired |
| `4000 0000 0000 0119` | Network timeout |

Any future expiry date and any 3-digit code will do. Coupons `LAUNCH20` (20%
off) and `FIRST10` ($10 off) work at checkout.

### The other commands

```bash
npm run build     # production build
npm run start     # run the production build
npm run seed      # add example products (use -- --force to replace them)
npm run reset -- --yes   # wipe the database and uploads, keep your .env
npm run typecheck # TypeScript, no emit
```

---

## What's in it

**Shopping**
Home page, catalogue with live search / category filter / sort, product pages
with generated cover art, a bag, coupon codes, checkout, an order confirmation
with instant download links, and a permanent library of everything you own.

**Accounts**
Sign up, sign in, profile, password change, a list of every signed-in device
with one-click revoke, a full data export, and real account deletion.

**Selling**
A Creator Studio at `/studio`. Any signed-in account can open one. Upload a
file, write the listing, pick an accent colour and symbol (the cover art is
generated from them), set a price, save as a draft or publish. Sales and
revenue are on the dashboard.

**Pages**
`/` · `/products` · `/products/[slug]` · `/cart` · `/checkout` · `/account`
(library, orders, invoices, profile, security, privacy) · `/studio` · `/sell` ·
`/security` · `/help` · `/legal/{privacy,terms,refunds}`

---

## How the security works

The `/security` page says all of this in plain English for your customers.
The short version for you:

| Concern | What the code does |
| --- | --- |
| Passwords | scrypt with a random salt per account (`N=32768, r=8, p=1`). Memory-hard, and nothing in the project can reverse it. |
| Card numbers | Never stored, never logged, never in an error message. The number lives as a local variable inside `charge()` and is gone after. Only brand and last four survive. |
| Personal data | Billing name, address and tax ID are sealed with AES-256-GCM before being written. The key lives in the environment, not the database. |
| Sessions | Split-token: the cookie carries `id.secret`, the database stores only SHA-256 of the secret. A leaked database cannot be replayed as a login. HTTP-only, SameSite, Secure in production. |
| XSS | Per-request CSP nonce. An injected `<script>` does not run. No third-party script origins are allowed at all. |
| CSRF | Same-origin check on every mutating request, on top of Next.js's own Server Action origin validation. |
| SQL injection | Every query is a prepared statement with bound parameters. No string concatenation of user input, anywhere. |
| Brute force | Sign-in, sign-up, password change, checkout and downloads are each rate-limited. Eight wrong passwords locks an account for 15 minutes. |
| Account enumeration | A wrong email and a wrong password give the same message and burn the same CPU, so response timing reveals nothing. |
| File delivery | Uploads live outside the web root under randomised names. Every download checks that the signed-in account owns that purchase, and is always sent as `application/octet-stream` so nothing can execute. |
| Privacy | No analytics, no pixels, no external fonts, no CDN calls. `connect-src 'self'`. Three cookies, all strictly functional. |

### Before you take real money

Two things to change:

1. **Use a real payment provider.** Replace the body of `charge()` in
   `src/lib/payments.ts` with Stripe Checkout, Paddle or Lemon Squeezy. Their
   hosted form collects the card so the number never reaches your server,
   which keeps you out of PCI-DSS scope entirely. The rest of the checkout
   does not change.
2. **Set real secrets in your host's environment** — `SESSION_SECRET`,
   `ENCRYPTION_KEY`, `APP_URL`, `OWNER_EMAIL`. See `.env.example`. The
   generated `.env` is for local development and is gitignored.

Also worth doing before launch: wire up a tax provider (digital-goods tax
depends on where the buyer is — `summarise()` in `src/lib/cart.ts` currently
returns zero), add transactional email for receipts, and have someone
qualified read the documents in `/legal`.

---

## How it's put together

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind v4 · SQLite via
better-sqlite3 · Zod. No ORM, no auth library, no UI kit — the parts that
matter are readable in one sitting.

```
src/
  app/            pages, layouts, the one API route (downloads)
  actions/        server actions: auth, cart, checkout, account, studio
  components/     UI — header, product cards, forms, generated cover art
  lib/
    auth.ts       sessions
    cart.ts       signed-cookie basket
    catalog.ts    product queries
    crypto.ts     AES-256-GCM, signing, tokens
    db.ts         the SQLite connection
    files.ts      upload storage, outside the web root
    orders.ts     placing orders, entitlements, licence keys
    payments.ts   the payment boundary — swap this for a real provider
    schema.mjs    the database schema, shared with the scripts
    validation.ts every Zod schema
  middleware.ts   CSP nonce, same-origin check, signed-in-only routes
scripts/          setup, seed, reset
data/             gitignored: the database and uploaded files
```

**Design.** Dark by default with a light toggle, driven entirely by CSS
variables in `src/app/globals.css`. Fonts (Bricolage Grotesque and Inter, both
OFL) are self-hosted in `src/fonts/` — not loaded from a font CDN, which keeps
`font-src 'self'` honest and means visiting the shop tells Google nothing.

Product cover art is generated from the slug, so the catalogue looks
art-directed without anyone opening a design tool.

### Notes if you change things

- Base element styles go in `@layer base` and custom classes in
  `@layer components` in `globals.css`. Anything written outside a layer beats
  every Tailwind utility regardless of specificity, which silently breaks
  `text-*` and `border-*` on those elements.
- Server actions return `values` alongside errors, and forms read them as
  `defaultValue`. React empties a `<form action>` once the action settles, so
  without that a single validation error wipes what the person typed.
- Deleting a product that people already bought only unpublishes it. Their
  downloads keep working, because that sale was already paid for.

### Deploying

Works on any host that runs Node. On a platform with an ephemeral filesystem
(Vercel, most serverless hosts) the SQLite file and the uploads directory will
not survive a deploy — move `src/lib/db.ts` to a hosted Postgres and
`src/lib/files.ts` to object storage first. On a normal VPS or container with a
mounted volume, it runs as-is: point `DATA_DIR` at the volume.

---

## Licence

Yours. Do what you like with it.
