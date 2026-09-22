import Link from "next/link";

import { ProductGrid } from "@/components/product-card";
import { ProductCover, tintOf } from "@/components/product-cover";
import { ButtonLink } from "@/components/ui/button";
import { catalogStats, listProducts } from "@/lib/catalog";
import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ farewell?: string }>;
}) {
  const { farewell } = await searchParams;
  const trending = listProducts({ sort: "trending" });
  const stats = catalogStats();

  return (
    <>
      {farewell ? (
        <div className="border-b border-line bg-surface">
          <div className="shell py-3 text-center text-[0.875rem] text-ink-2">
            Your account and everything in it has been deleted. Thanks for stopping by.
          </div>
        </div>
      ) : null}

      <Hero stats={stats} lead={trending[0]} />
      <Ticker products={trending} />
      <Featured products={trending.slice(0, 6)} />
      <HowItWorks />
      <TheStudio />
      <Closing />
    </>
  );
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

function Hero({
  stats,
  lead,
}: {
  stats: { products: number; sales: number; creators: number };
  lead?: Product;
}) {
  return (
    <section className="shell pt-14 lg:pt-24">
      <div className="grid gap-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16">
        <div>
          <p className="micro">Soft System, since 2026</p>
          <h1 className="display mt-7 max-w-[13ch]" data-enter="drift">
            Digital things, <span className="thin">made beautifully.</span>
          </h1>
          <p className="mt-8 max-w-[42ch] text-[1.0625rem] leading-relaxed text-ink-2">
            Fonts, interfaces, presets, sound and whole systems, drawn here and sold here. Everything
            is in your library the second you pay, and it stays yours.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/products" size="lg">
              Browse the shop
            </ButtonLink>
            <ButtonLink href="/products" variant="outline" size="lg">
              What is new
            </ButtonLink>
          </div>
        </div>

        {/* One poster, hung slightly off-square, instead of a collage of three. */}
        {lead ? (
          <Link href={`/products/${lead.slug}`} className="group block">
            <div className="relative mx-auto w-full max-w-sm rotate-[-2.5deg] transition-transform duration-500 ease-out group-hover:rotate-0 lg:max-w-none">
              <ProductCover
                seed={lead.slug}
                accent={lead.accent}
                title={lead.title}
                category={lead.category}
                size="lg"
                className="aspect-[4/5] w-full shadow-[0_30px_60px_-30px_rgb(0_0_0/0.95)]"
              />
              <span className="absolute -bottom-4 -left-3 rounded-full bg-accent px-4 py-2 font-display text-[0.8125rem] font-semibold text-on-accent shadow-[var(--glow)]">
                Most bought this week
              </span>
            </div>
            <div className="mt-9 flex items-baseline justify-between gap-4">
              <span className="font-display text-lg font-semibold transition-colors group-hover:text-accent">
                {lead.title}
              </span>
              <span className="numeric text-[0.9375rem] font-semibold">
                {formatMoney(lead.priceCents, lead.currency)}
              </span>
            </div>
          </Link>
        ) : null}
      </div>

      <dl className="enter mt-20 grid grid-cols-3 gap-8 border-t border-line pt-8 lg:mt-24">
        <Stat label="On the shelves" value={stats.products.toLocaleString()} />
        <Stat label="Downloads" value={`${(stats.sales / 1000).toFixed(1)}k`} />
        <Stat label="Day returns" value="14" />
      </dl>
    </section>
  );
}

/* ── Ticker ────────────────────────────────────────────────────────────── */

/**
 * What the shop is actually selling, moving slowly enough to read and pausing
 * when the pointer lands on it. The numbers are the real sales counts, not
 * invented activity.
 */
function Ticker({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  const items = products.slice(0, 9);
  const run = (
    <div aria-hidden>
      {items.map((p) => (
        <span key={p.id} className="flex items-center gap-3 whitespace-nowrap text-[0.875rem]">
          <span
            className="size-2 rounded-full"
            style={{ background: TINTS_GROUND(p.accent, p.slug) }}
          />
          <span className="font-display font-semibold">{p.title}</span>
          <span className="text-ink-3">{p.category}</span>
          <span className="numeric text-ink-2">{p.salesCount.toLocaleString()} sold</span>
        </span>
      ))}
    </div>
  );

  return (
    <section className="mt-16 border-y border-line bg-surface py-4 lg:mt-24">
      <div className="ticker">
        {run}
        {run}
      </div>
      <span className="sr-only">
        Selling now: {items.map((p) => `${p.title}, ${p.salesCount} sold`).join("; ")}
      </span>
    </section>
  );
}

function TINTS_GROUND(accent: string, seed: string) {
  return tintOf(accent, seed).ground;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="numeric font-display text-[2rem] font-semibold leading-none tracking-[-0.04em] lg:text-[2.75rem]">{value}</dd>
      <dt className="label mt-2.5">{label}</dt>
    </div>
  );
}

/* ── Catalogue ─────────────────────────────────────────────────────────── */

function Featured({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <section className="shell py-28">
        <h2 className="display-2">Nothing on the shelves yet</h2>
        <p className="mt-5 max-w-[50ch] text-ink-2">
          Run <code className="font-mono text-[0.875rem] text-accent">npm run seed</code> to fill the
          shop with examples, or publish your first product in the Studio.
        </p>
        <ButtonLink href="/studio" className="mt-8">
          Open the Studio
        </ButtonLink>
      </section>
    );
  }

  return (
    <section className="shell py-24 lg:py-36">
      <div className="mb-14 flex items-end justify-between gap-6" data-reveal>
        <h2 className="display-2 max-w-[14ch]" data-enter="snap">
          New this week
        </h2>
        <Link href="/products" className="link shrink-0 pb-1 text-[0.9375rem]">
          All products
        </Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

/* ── How it works ───────────────────────────────────────────────────────────── */

function HowItWorks() {
  const points = [
    [
      "Delivered instantly",
      "The download is in your library the moment the payment clears, with a licence key attached. No queue, no email to wait for.",
    ],
    [
      "Yours to keep",
      "Every purchase stays in your library for good, re-downloadable from any device, and every update I ship reaches past buyers free.",
    ],
    [
      "Nobody is watching",
      "No analytics, no advertising pixels, no third-party fonts. Card numbers are never stored. Billing addresses are encrypted before they touch the disk.",
    ],
  ];

  return (
    <section className="on-stone alive py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="display-2 max-w-[11ch]" data-enter="punch">
          Pay once. <span className="thin">Keep it forever.</span>
        </h2>
        <dl className="enter grid gap-12 sm:grid-cols-2 lg:gap-x-12">
          {points.map(([title, body], i) => (
            <div key={title} data-reveal data-reveal-delay={i * 70}>
              <dt className="font-display text-[1.3rem] leading-snug">{title}</dt>
              <dd className="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">{body}</dd>
            </div>
          ))}
          <div data-reveal data-reveal-delay={210} className="sm:self-end">
            <Link href="/security" className="link text-[0.9375rem]">
              Read exactly what we store
            </Link>
          </div>
        </dl>
      </div>
    </section>
  );
}

/* ── For creators ──────────────────────────────────────────────────────── */

function TheStudio() {
  const notes = [
    ["Drawn here", "Every file on this shop was made in one studio, by one person, and tested on real work before it went up for sale."],
    ["Fixed here", "A bug in something you bought is my bug. Updates land in your library free, for as long as I keep shipping them."],
    ["Answered here", "There is no support desk and no ticket number. Write to hello.softsystem@gmail.com and I read it."],
  ];

  return (
    <section className="on-ink alive py-24 lg:py-36">
      <div className="shell grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div>
          <p className="micro">The studio</p>
          <h2 className="display-2 mt-6 max-w-[13ch]" data-enter="part">
            One shop, <span className="thin">one pair of hands.</span>
          </h2>
          <p className="mt-7 max-w-[40ch] text-ink-2">
            This is not a marketplace. Nobody else lists here, so nothing on these shelves is a
            reseller&rsquo;s copy or a bundle of somebody else&rsquo;s work.
          </p>
          <ButtonLink href="/products" variant="outline" className="mt-9">
            See the shelves
          </ButtonLink>
        </div>

        <dl className="enter grid gap-px overflow-hidden border border-line bg-line">
          {notes.map(([title, body]) => (
            <div key={title} className="bg-paper p-8">
              <dt className="font-sans text-[1.0625rem] font-semibold">{title}</dt>
              <dd className="mt-2.5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-2">{body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* ── Closing ───────────────────────────────────────────────────────────── */

function Closing() {
  return (
    <section className="on-burgundy alive py-24 lg:py-32">
      <div className="shell" data-reveal>
        <h2 className="display max-w-[13ch]" data-enter="rise">
          Take something home.
        </h2>
        <div className="mt-10 flex flex-wrap gap-4">
          <ButtonLink href="/signup" size="lg">
            Create an account
          </ButtonLink>
          <ButtonLink href="/products" variant="outline" size="lg">
            Browse everything
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
