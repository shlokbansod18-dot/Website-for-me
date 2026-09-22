# Deploying softsystem

Read the next section before you pick a host. It is the one decision that is
expensive to get wrong.

---

## Don't deploy this to Vercel (yet)

Vercel is the obvious answer for a Next.js app, and here it is the wrong one.

softsystem keeps its data in two places on disk: a SQLite database at
`$DATA_DIR/softsystem.db`, and the seller's uploaded product files in
`$DATA_DIR/uploads`. Vercel, Netlify and most serverless hosts give each
request a **temporary filesystem that is thrown away**. The site would appear
to work — you could sign up, publish a product, even buy it — and then every
account, order and uploaded file would silently vanish on the next deploy or
after a few idle minutes.

So you need a host that gives you a **persistent disk**. Any of these:

| Host | Notes |
| --- | --- |
| **Railway** | Simplest. Add a volume, point it at `/data`. Usage-based, a few dollars a month. |
| **Fly.io** | Cheap, fast in India. `fly volumes create`, then mount at `/data`. |
| **Render** | Easy, but persistent disks need a paid instance (the free tier's disk is temporary). |
| **A VPS** | Hetzner, DigitalOcean, or Oracle's free tier. Cheapest and most control, most setup. |

All four run the `Dockerfile` in this repository unchanged.

If you would rather stay on Vercel, that is a real option, but it is a code
change first: move `src/lib/db.ts` to a hosted Postgres and `src/lib/files.ts`
to object storage such as S3 or Cloudflare R2. Do that before launch, not
after you have customers.

---

## Deploying with the container

The `Dockerfile` builds a self-contained image. Nothing else is needed.

### 1. Generate your two secrets

Run this twice and keep both values. They are the only things standing between
a stolen database file and your customers' data.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Put them in your host's environment settings — never in a file you commit, and
never in the `Dockerfile`. Anything passed in at build time can be read back
out of the finished image.

### 2. Set the environment

| Variable | Required | What it does |
| --- | --- | --- |
| `SESSION_SECRET` | yes | Signs session and cart cookies. 64 hex characters. |
| `ENCRYPTION_KEY` | yes | Encrypts billing addresses at rest. 64 hex characters. **Changing this makes existing orders' addresses unreadable.** |
| `APP_URL` | yes | Your public address, e.g. `https://softsystem.in`. Must be `https://`. |
| `OWNER_EMAIL` | recommended | Register with this address and that first account becomes the owner. |
| `DATA_DIR` | no | Defaults to `/data` in the image. Leave it alone unless you mount elsewhere. |
| `PORT` | no | Defaults to 3000. Most hosts set this themselves. |

The server **refuses to start** if the two secrets are missing or `APP_URL` is
not HTTPS, and prints exactly what is wrong. That is deliberate: a shop that
boots into a broken state and passes its health check is worse than one that
fails the deploy.

### 3. Mount a volume at `/data`

This is the step people skip. Without it, the database is inside the container
and disappears on the next deploy.

- **Railway** — Add a volume, mount path `/data`.
- **Fly.io** — `fly volumes create softsystem_data --size 1`, then in `fly.toml`:
  ```toml
  [mounts]
    source = "softsystem_data"
    destination = "/data"
  ```
- **Docker** — `-v softsystem-data:/data`

One gigabyte is plenty to start; it holds the database and your product files.

### 4. Deploy

```bash
docker build -t softsystem .
docker run -p 3000:3000 -v softsystem-data:/data \
  -e SESSION_SECRET=… -e ENCRYPTION_KEY=… -e APP_URL=https://your-domain \
  -e OWNER_EMAIL=hello.softsystem@gmail.com \
  softsystem
```

On Railway or Render you point the service at this GitHub repository instead
and it builds the same `Dockerfile` for you.

Health checks should hit **`/api/health`**. It returns `200 {"status":"ok"}`
only when the server can actually reach its database, so a instance that is
listening but broken is taken out of rotation rather than served traffic.

### 5. Claim the shop

The moment it is live, go to `/signup` and register with your `OWNER_EMAIL`,
using a password you choose. That first account becomes the owner and the
Creator Studio unlocks.

Do this immediately. There is no email verification, so the grant is
first-come — and it closes as soon as any owner exists. If you miss the window,
the deliberate route is a shell on the server:

```bash
npm run make-owner -- you@example.com
```

### Never run `npm run seed` against the live site

It creates demo accounts whose passwords are printed in the README, and fills
your catalogue with example products. It is for local development only.

---

## After it is live

**Take backups.** Everything that matters is two paths inside the volume:

```bash
# SQLite needs its own backup command — copying the file while the server
# is writing can capture a torn database.
sqlite3 /data/softsystem.db ".backup '/tmp/softsystem-backup.db'"
tar czf uploads-backup.tar.gz -C /data uploads
```

Keep the backups somewhere other than the server, and test restoring one
before you need to.

**Keep `ENCRYPTION_KEY` safe and unchanged.** A backup of the database is
useless without it — billing addresses are AES-256-GCM ciphertext. Store it in
a password manager, not only in the host's dashboard.

**Payments are still a demo.** `src/lib/payments.ts` ships a self-contained
processor so the flow works end to end; it does not move money. Replace the
body of `charge()` with a real provider before you advertise the shop. For
Indian customers paying by UPI that means Razorpay or Cashfree: you complete
their KYC in their dashboard, and they give you a key that goes in the
environment alongside the two above. Your bank details go to the gateway, never
into this repository.

**Prices are in US dollars.** If you are selling mainly to Indian buyers, change
this before you take real orders rather than after — the currency runs through
pricing, checkout and every stored invoice.
