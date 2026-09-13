import Link from "next/link";

import { Marquee } from "@/components/marquee";
import { ProductCover } from "@/components/product-cover";
import { ProductGrid } from "@/components/product-card";
import { ButtonLink } from "@/components/ui/button";
import { catalogStats, listProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ farewell?: string }>;
}) {
  const { farewell } = await searchParams;
  const featured = listProducts({ sort: "trending" }).slice(0, 6);
  const fresh = listProducts({ sort: "newest" }).slice(0, 3);
  const stats = catalogStats();

  return (
    <>
      {farewell ? (
        <div className="border-b border-line bg-surface">
          <div className="shell flex items-center justify-center gap-3 py-3 text-[0.8125rem] text-dim">
            <span aria-hidden className="text-acid">
              ✓
            </span>
            Your account and everything in it has been deleted. Thanks for stopping by.
          </div>
        </div>
      ) : null}

      <Hero stats={stats} spotlight={featured.slice(0, 3)} />

      <Marquee
        items={[
          "UI Kits",
          "Notion templates",
          "Icon sets",
          "Variable fonts",
          "Lightroom presets",
          "Figma systems",
          "3D packs",
          "Sound libraries",
          "Course bundles",
        ]}
      />

      <Featured products={featured} />
      <Bento />
      <FreshDrops products={fresh} />
      <SellerPitch />
      <Testimonials />
      <ClosingCta />
    </>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

function Hero({
  stats,
  spotlight,
}: {
  stats: { products: number; sales: number; creators: number };
  spotlight: Awaited<ReturnType<typeof listProducts>>;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div
        className="bloom -left-40 -top-40 size-[34rem] opacity-25"
        style={{ background: "var(--acid)" }}
      />
      <div
        className="bloom -right-32 top-24 size-[28rem] opacity-20"
        style={{ background: "var(--violet)" }}
      />

      <div className="shell relative grid gap-14 py-20 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 text-[0.6875rem] text-dim backdrop-blur">
            <span className="pulse-dot size-1.5 rounded-full bg-acid" />
            {stats.products} product{stats.products === 1 ? "" : "s"} live ·{" "}
            {stats.creators} creator{stats.creators === 1 ? "" : "s"}
          </div>

          <h1 className="display mt-7">
            Sell what
            <br />
            you make.
            <br />
            <span className="text-acid">Instantly.</span>
          </h1>

          <p className="mt-7 max-w-lg text-[1.0625rem] leading-relaxed text-dim">
            softsystem is the storefront for digital work — templates, kits, fonts, presets,
            courses. Upload a file, set a price, and get paid while you sleep. Buyers download
            the moment they pay.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="/products" size="lg">
              Browse the shop
              <ArrowIcon />
            </ButtonLink>
            <ButtonLink href="/sell" variant="outline" size="lg">
              Start selling
            </ButtonLink>
          </div>

          <dl className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-8">
            <Stat label="Products" value={stats.products.toLocaleString()} />
            <Stat label="Downloads" value={`${(stats.sales / 1000).toFixed(1)}k`} />
            <Stat label="You keep" value="95%" accent />
          </dl>
        </div>

        {/* A fanned stack of real covers. Only the front card carries a
            label — three stacked labels would sit on top of each other. */}
        <div className="relative mx-auto hidden h-[30rem] w-full max-w-md lg:block" aria-hidden>
          {spotlight.map((product, i) => (
            <div
              key={product.id}
              className="absolute left-1/2 top-1/2 w-64 overflow-hidden rounded-[1.75rem] border border-line-strong shadow-[var(--shadow-soft)] transition-transform duration-500 hover:!rotate-0"
              style={{
                transform: `translate(-50%, -50%) translate(${(i - 1) * -54}px, ${(i - 1) * -26}px) rotate(${(i - 1) * -6}deg)`,
                zIndex: 10 - i,
              }}
            >
              <ProductCover
                seed={product.slug}
                accent={product.accent}
                glyph={product.glyph}
                className={i === 0 ? "aspect-[4/5] w-full" : "aspect-[4/5] w-full opacity-80"}
              />
              {i === 0 ? (
                <div className="flex items-center justify-between gap-3 bg-surface px-4 py-3.5">
                  <span className="truncate font-display text-sm font-bold tracking-tight">
                    {product.title}
                  </span>
                  <span className="numeric shrink-0 text-xs text-dim">
                    {formatMoney(product.priceCents, product.currency)}
                  </span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <dd
        className={`numeric font-display text-3xl font-bold tracking-tight ${accent ? "text-acid" : ""}`}
      >
        {value}
      </dd>
      <dt className="eyebrow mt-1.5">{label}</dt>
    </div>
  );
}

/* ── Featured ──────────────────────────────────────────────────────────── */

function Featured({ products }: { products: Awaited<ReturnType<typeof listProducts>> }) {
  if (products.length === 0) {
    return (
      <section className="shell py-24">
        <div className="card grid place-items-center px-6 py-20 text-center">
          <h2 className="display-sm">The shelves are empty</h2>
          <p className="mt-4 max-w-md text-dim">
            Run <code className="rounded bg-surface-2 px-1.5 py-0.5 text-acid">npm run seed</code> to
            fill the shop with example products, or head to the Studio and publish your first one.
          </p>
          <ButtonLink href="/studio" className="mt-7">
            Open the Studio
          </ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section className="shell py-20 lg:py-28">
      <SectionHead
        eyebrow="Trending now"
        title="What everyone is buying"
        action={{ href: "/products", label: "See all" }}
      />
      <ProductGrid products={products} />
    </section>
  );
}

function FreshDrops({ products }: { products: Awaited<ReturnType<typeof listProducts>> }) {
  if (products.length === 0) return null;
  return (
    <section className="shell py-20 lg:py-24">
      <SectionHead
        eyebrow="Just landed"
        title="Fresh drops"
        action={{ href: "/products?sort=newest", label: "All new" }}
      />
      <ProductGrid products={products} />
    </section>
  );
}

function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4" data-reveal>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="display-sm mt-3">{title}</h2>
      </div>
      {action ? (
        <Link
          href={action.href}
          className="group inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-acid"
        >
          {action.label}
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      ) : null}
    </div>
  );
}

/* ── Bento ─────────────────────────────────────────────────────────────── */

function Bento() {
  return (
    <section className="border-y border-line bg-surface py-20 lg:py-28">
      <div className="shell">
        <div className="mb-12" data-reveal>
          <p className="eyebrow">Why here</p>
          <h2 className="display-sm mt-3 max-w-2xl">
            Everything a digital shop needs.
            <span className="text-faint"> Nothing it doesn&rsquo;t.</span>
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          <BentoCard
            className="md:col-span-4"
            glyph="⚡"
            title="Delivered before the confirmation email would have loaded"
            body="The moment a payment clears, the download is in the buyer's library with a licence key attached. No queues, no waiting, no 'your files will arrive shortly'."
            tone="acid"
            large
          />
          <BentoCard
            className="md:col-span-2"
            glyph="95%"
            title="Keep almost all of it"
            body="A flat 5% platform fee. No listing fees, no monthly minimum, no surprise deductions."
            tone="violet"
          />
          <BentoCard
            className="md:col-span-2"
            glyph="🔒"
            title="Encrypted at rest"
            body="Billing details are sealed with AES-256-GCM before they touch the disk. Card numbers are never stored at all."
          />
          <BentoCard
            className="md:col-span-2"
            glyph="👁"
            title="Zero trackers"
            body="No analytics scripts, no ad pixels, no third-party fonts. The only server your browser talks to is this one."
          />
          <BentoCard
            className="md:col-span-2"
            glyph="∞"
            title="Updates for life"
            body="Ship version 2 and every past buyer gets it free, straight in their library."
          />
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  glyph,
  title,
  body,
  className = "",
  tone,
  large,
}: {
  glyph: string;
  title: string;
  body: string;
  className?: string;
  tone?: "acid" | "violet";
  large?: boolean;
}) {
  const toneRing =
    tone === "acid" ? "border-acid/25" : tone === "violet" ? "border-violet/30" : "border-line";
  return (
    <div
      data-reveal
      className={`card group relative overflow-hidden bg-canvas p-7 transition-colors duration-300 hover:border-line-strong ${toneRing} ${className}`}
    >
      {tone ? (
        <div
          className="bloom -right-16 -top-16 size-48 opacity-[0.18] transition-opacity duration-500 group-hover:opacity-30"
          style={{ background: tone === "acid" ? "var(--acid)" : "var(--violet)" }}
        />
      ) : null}
      <div className="relative">
        <span
          className={`font-display font-bold ${large ? "text-4xl" : "text-2xl"} ${
            tone === "acid" ? "text-acid" : tone === "violet" ? "text-violet" : "text-text"
          }`}
        >
          {glyph}
        </span>
        <h3
          className={`mt-5 font-display font-bold tracking-[-0.035em] ${large ? "text-2xl leading-[1.1]" : "text-lg leading-snug"}`}
        >
          {title}
        </h3>
        <p className="mt-3 text-[0.8125rem] leading-relaxed text-dim">{body}</p>
      </div>
    </div>
  );
}

/* ── Seller pitch ──────────────────────────────────────────────────────── */

function SellerPitch() {
  const steps = [
    {
      n: "01",
      title: "Upload your file",
      body: "Zip, PDF, font, video, Figma file — up to 24 MB per product. It is stored outside the web root and can only be fetched by someone who has bought it.",
    },
    {
      n: "02",
      title: "Write the page",
      body: "Title, one-line pitch, what's included, price. Cover art is generated for you from your accent colour, so you can publish without opening a design tool.",
    },
    {
      n: "03",
      title: "Press publish",
      body: "It goes live immediately, sold worldwide, delivered automatically. You watch the sales come in from the Studio.",
    },
  ];

  return (
    <section className="shell py-20 lg:py-28">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.25fr]">
        <div data-reveal>
          <p className="eyebrow">For creators</p>
          <h2 className="display-sm mt-3">
            From file to
            <br />
            first sale in
            <br />
            <span className="text-acid">ten minutes.</span>
          </h2>
          <p className="mt-6 max-w-sm text-dim">
            No store to build, no payment plumbing to wire up, no delivery emails to write.
          </p>
          <ButtonLink href="/sell" className="mt-8">
            See how it works
            <ArrowIcon />
          </ButtonLink>
        </div>

        <ol className="space-y-px overflow-hidden rounded-[1.5rem] border border-line">
          {steps.map((step, i) => (
            <li
              key={step.n}
              data-reveal
              data-reveal-delay={i * 90}
              className="group flex gap-6 bg-surface p-7 transition-colors hover:bg-surface-2"
            >
              <span className="numeric font-display text-sm font-bold text-faint transition-colors group-hover:text-acid">
                {step.n}
              </span>
              <div>
                <h3 className="font-display text-lg font-bold tracking-[-0.035em]">{step.title}</h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-dim">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Testimonials ──────────────────────────────────────────────────────── */

function Testimonials() {
  const quotes = [
    {
      quote:
        "I moved four products over on a Sunday afternoon and made my first sale before dinner. The whole thing just works.",
      name: "Priya R.",
      role: "Sells Figma systems",
      accent: "acid",
    },
    {
      quote:
        "The thing that sold me was the receipt page. My buyers get their files and a licence key instantly — I stopped getting 'where is my download' emails entirely.",
      name: "Marcus O.",
      role: "Sells sample packs",
      accent: "violet",
    },
    {
      quote:
        "Finally a store that doesn't load eleven trackers before it loads my product. My customers noticed.",
      name: "Lena K.",
      role: "Sells Notion templates",
      accent: "flare",
    },
  ];

  return (
    <section className="border-y border-line bg-surface py-20 lg:py-24">
      <div className="shell">
        <div className="mb-12" data-reveal>
          <p className="eyebrow">Word of mouth</p>
          <h2 className="display-sm mt-3">People who ship here</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {quotes.map((item, i) => (
            <figure
              key={item.name}
              data-reveal
              data-reveal-delay={i * 90}
              className="card flex flex-col justify-between bg-canvas p-7"
            >
              <blockquote className="font-display text-[1.0625rem] font-medium leading-snug tracking-[-0.02em]">
                <span
                  className="mr-1 text-2xl leading-none"
                  style={{ color: `var(--${item.accent})` }}
                  aria-hidden
                >
                  &ldquo;
                </span>
                {item.quote}
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-5">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold"
                  style={{ background: `var(--${item.accent})`, color: "#0b0f00" }}
                  aria-hidden
                >
                  {item.name.charAt(0)}
                </span>
                <span className="text-[0.8125rem]">
                  <span className="block font-medium">{item.name}</span>
                  <span className="block text-faint">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Closing CTA ───────────────────────────────────────────────────────── */

function ClosingCta() {
  return (
    <section className="shell py-20 lg:py-28">
      <div
        data-reveal
        className="relative overflow-hidden rounded-[2rem] bg-acid px-8 py-16 text-acid-ink sm:px-14 sm:py-20"
      >
        <div
          className="absolute -right-20 -top-20 size-72 rounded-full opacity-20"
          style={{ background: "#000" }}
          aria-hidden
        />
        <div className="relative max-w-2xl">
          <h2 className="display-sm">Your work is worth money. Go and get it.</h2>
          <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed opacity-75">
            Create an account, upload your first product, and be selling to the whole internet
            before your coffee goes cold.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-13 items-center gap-2 rounded-full bg-acid-ink px-7 text-[0.9375rem] font-medium text-acid transition-transform hover:-translate-y-0.5"
            >
              Create your account
              <ArrowIcon />
            </Link>
            <Link
              href="/products"
              className="inline-flex h-13 items-center rounded-full border border-acid-ink/25 px-7 text-[0.9375rem] font-medium transition-colors hover:border-acid-ink/60"
            >
              Look around first
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h13m-5-6l6 6-6 6" />
    </svg>
  );
}
