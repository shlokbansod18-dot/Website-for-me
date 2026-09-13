import Link from "next/link";

import { ProductGrid } from "@/components/product-card";
import { ProductCover } from "@/components/product-cover";
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
      <Featured products={trending.slice(0, 6)} />
      <HowItWorks />
      <ForCreators />
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
    <section className="shell pt-16 lg:pt-28">
      <div className="grid gap-14 lg:grid-cols-[1.35fr_1fr] lg:items-end lg:gap-20">
        <div>
          <h1 className="display max-w-[15ch]">
            Sell the things you <span className="em">make</span>.
          </h1>
          <p className="mt-9 max-w-[46ch] text-[1.0625rem] leading-relaxed text-ink-2">
            A shop for digital work — type, templates, kits, presets, courses. Upload a file, set a
            price, and the buyer has it a second later.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <ButtonLink href="/products" size="lg">
              Browse the shop
            </ButtonLink>
            <Link href="/sell" className="link text-[0.9375rem]">
              Start selling
            </Link>
          </div>
        </div>

        {/* One product, shown properly, instead of a collage of three. */}
        {lead ? (
          <Link href={`/products/${lead.slug}`} className="group block lg:pb-2">
            <p className="label mb-4">Most bought this week</p>
            <ProductCover
              seed={lead.slug}
              accent={lead.accent}
              title={lead.title}
              size="lg"
              className="aspect-[5/4] w-full rounded transition-transform duration-500 group-hover:scale-[1.015]"
            />
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <span className="font-display text-lg transition-colors group-hover:text-accent">
                {lead.title}
              </span>
              <span className="numeric text-[0.9375rem]">
                {formatMoney(lead.priceCents, lead.currency)}
              </span>
            </div>
          </Link>
        ) : null}
      </div>

      <dl className="mt-20 grid grid-cols-3 gap-8 border-t border-line pt-8 lg:mt-28">
        <Stat label="Products" value={stats.products.toLocaleString()} />
        <Stat label="Downloads" value={`${(stats.sales / 1000).toFixed(1)}k`} />
        <Stat label="Creators keep" value="95%" />
      </dl>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dd className="numeric font-display text-[1.75rem] leading-none lg:text-[2.25rem]">{value}</dd>
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
        <h2 className="display-2 max-w-[16ch]">
          What people are <span className="em">buying</span>
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
      "The download is in the buyer's library the moment the payment clears, with a licence key attached. No queue, no email to wait for.",
    ],
    [
      "Yours to keep",
      "Every purchase stays in the library for good, re-downloadable from any device — and creators ship updates to past buyers free.",
    ],
    [
      "Nobody is watching",
      "No analytics, no advertising pixels, no third-party fonts. Card numbers are never stored. Billing addresses are encrypted before they touch the disk.",
    ],
  ];

  return (
    <section className="border-y border-line bg-surface py-24 lg:py-32">
      <div className="shell grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">
        <h2 className="display-2 max-w-[12ch]" data-reveal>
          How it should <span className="em">work</span>
        </h2>
        <dl className="grid gap-12 sm:grid-cols-2 lg:gap-x-12">
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

function ForCreators() {
  const steps = [
    ["Upload", "A zip, a font, a PDF, a Figma file. It is stored where only a buyer can reach it."],
    ["Describe", "A title, a price, a few lines. The cover art is generated from your title."],
    ["Publish", "Live worldwide, sold and delivered without you lifting a finger again."],
  ];

  return (
    <section className="shell py-24 lg:py-36">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-24">
        <div data-reveal>
          <p className="label">For creators</p>
          <h2 className="display-2 mt-5 max-w-[14ch]">
            Ten minutes from file to <span className="em">first sale</span>
          </h2>
          <p className="mt-7 max-w-[42ch] text-ink-2">
            No storefront to build, no payment plumbing, no delivery emails to write. A flat 5% when
            something sells, and nothing at all when it does not.
          </p>
          <ButtonLink href="/sell" variant="outline" className="mt-9">
            How selling works
          </ButtonLink>
        </div>

        <ol className="grid gap-px overflow-hidden rounded border border-line bg-line">
          {steps.map(([title, body], i) => (
            <li
              key={title}
              data-reveal
              data-reveal-delay={i * 70}
              className="flex gap-6 bg-paper p-8"
            >
              <span className="numeric label pt-1">0{i + 1}</span>
              <div>
                <h3 className="font-display text-[1.3rem] leading-snug">{title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">{body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Closing ───────────────────────────────────────────────────────────── */

function Closing() {
  return (
    <section className="shell pb-28 lg:pb-40">
      <div className="border-t border-line pt-16 text-center" data-reveal>
        <h2 className="display-2 mx-auto max-w-[18ch]">
          Your work is worth money. Go and <span className="em">get it</span>.
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <ButtonLink href="/signup" size="lg">
            Create an account
          </ButtonLink>
          <ButtonLink href="/products" variant="outline" size="lg">
            Look around first
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
