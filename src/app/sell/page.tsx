import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { catalogStats } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start selling",
  description:
    "Publish a digital product on softsystem in ten minutes. Keep 95%, deliver instantly, no store to build.",
};

const STEPS = [
  {
    n: "01",
    title: "Open your Studio",
    body: "One button. No application form, no waiting list, no revenue threshold to clear first.",
  },
  {
    n: "02",
    title: "Upload and describe",
    body: "Attach the file, write a title and a few paragraphs, set a price. Cover art is generated from your accent colour and symbol.",
  },
  {
    n: "03",
    title: "Publish",
    body: "It is live worldwide immediately. Buyers download the second they pay and get a licence key with it.",
  },
  {
    n: "04",
    title: "Ship updates",
    body: "Replace the file and bump the version. Everyone who ever bought it gets the new one, free, in their library.",
  },
];

const FEES = [
  { label: "Listing a product", value: "Free" },
  { label: "Monthly platform fee", value: "None" },
  { label: "Per sale", value: "5%" },
  { label: "You keep", value: "95%", accent: true },
];

export default async function SellPage() {
  const [user, stats] = await Promise.all([getCurrentUser(), catalogStats()]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="bloom -left-32 -top-32 size-[30rem] opacity-25"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="bloom -right-24 top-32 size-96 opacity-20"
          style={{ background: "var(--accent)" }}
        />

        <div className="shell relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="label">For creators</p>
            <h1 className="display mt-6">
              You made it.
              <br />
              <span className="text-accent">Now sell it.</span>
            </h1>
            <p className="mt-8 max-w-xl text-[1.0625rem] leading-relaxed text-ink-2">
              A storefront, a payment flow, file delivery, licence keys and a customer library —
              all of it, without building any of it. Upload your work and start taking money today.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <ButtonLink href={user ? "/studio" : "/signup?next=/studio"} size="lg">
                {user ? "Open the Studio" : "Start selling free"}
                <span aria-hidden>→</span>
              </ButtonLink>
              <ButtonLink href="/products" variant="outline" size="lg">
                See what sells here
              </ButtonLink>
            </div>
            <p className="mt-6 text-[0.6875rem] text-ink-3">
              Joining {stats.creators} creator{stats.creators === 1 ? "" : "s"} already selling{" "}
              {stats.products} products.
            </p>
          </div>
        </div>
      </section>


      <section className="shell py-20 lg:py-28">
        <div className="mb-12" data-reveal>
          <p className="label">The process</p>
          <h2 className="display-2 mt-3">Four steps. That is it.</h2>
        </div>

        <ol className="grid gap-4 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <li
              key={step.n}
              data-reveal
              data-reveal-delay={i * 80}
              className="panel group p-7 transition-colors hover:border-line-2"
            >
              <span className="numeric font-display text-sm text-ink-3 transition-colors group-hover:text-accent">
                {step.n}
              </span>
              <h3 className="mt-4 font-display text-xl">
                {step.title}
              </h3>
              <p className="mt-2.5 text-[0.875rem] leading-relaxed text-ink-2">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-line bg-surface py-20 lg:py-24">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:items-center">
          <div data-reveal>
            <p className="label">Pricing</p>
            <h2 className="display-2 mt-3">
              One number,
              <br />
              and it is <span className="text-accent">five percent</span>.
            </h2>
            <p className="mt-6 max-w-md text-ink-2">
              No listing fee, no monthly minimum, no tiered plan that suddenly costs more when you
              start doing well. If you sell nothing, you pay nothing.
            </p>
          </div>

          <dl className="space-y-px overflow-hidden rounded-[1.5rem] border border-line">
            {FEES.map((fee) => (
              <div
                key={fee.label}
                className="flex items-center justify-between bg-paper px-7 py-5"
              >
                <dt className="text-[0.875rem] text-ink-2">{fee.label}</dt>
                <dd
                  className={`numeric font-display text-xl font-bold tracking-tight ${fee.accent ? "text-accent" : ""}`}
                >
                  {fee.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="shell py-20 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-1" data-reveal>
            <p className="label">What you get</p>
            <h2 className="display-2 mt-3">The whole back end, built.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
            {[
              ["Checkout", "Validated, rate-limited, and priced from the database — not from the browser."],
              ["File delivery", "Uploads sit outside the web root and are only ever streamed to accounts that bought them."],
              ["Licence keys", "A unique key generated per purchase and shown on the receipt."],
              ["Customer library", "Every buyer gets a permanent page listing everything they own."],
              ["Refund policy", "A 14-day window, written and published for you."],
              ["Privacy", "No trackers to explain, no cookie banner to design."],
            ].map(([title, body], i) => (
              <div key={title} data-reveal data-reveal-delay={i * 60} className="panel p-6">
                <h3 className="font-display text-base">{title}</h3>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-2">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell pb-24">
        <div
          data-reveal
          className="relative overflow-hidden rounded-[2rem] border border-line bg-surface px-8 py-16 text-center sm:px-14"
        >
          <div
            className="bloom left-1/2 top-0 size-96 -translate-x-1/2 opacity-20"
            style={{ background: "var(--accent)" }}
          />
          <div className="relative">
            <h2 className="display-2 mx-auto max-w-2xl">
              The file is already on your desktop. Go and publish it.
            </h2>
            <ButtonLink
              href={user ? "/studio/new" : "/signup?next=/studio"}
              size="lg"
              className="mt-9"
            >
              {user ? "Create a product" : "Create your account"}
              <span aria-hidden>→</span>
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
