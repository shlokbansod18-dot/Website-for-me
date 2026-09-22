import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Security & privacy",
  description:
    "How softsystem protects customer data: encrypted billing, hashed passwords, no trackers, and a checkout that never stores a panel number.",
};

const PILLARS = [
  {
    glyph: "🔑",
    title: "Passwords nobody can read back",
    body: "Stored as a scrypt hash with a random salt per account. scrypt is memory-hard, so guessing at scale is expensive even with rented GPUs. There is no code path anywhere in this project that can turn a stored hash back into a password.",
  },
  {
    glyph: "💳",
    title: "Card numbers are never stored",
    body: "A panel number exists as a local variable for the instant a payment is authorised, then it is gone. It is never written to the database, never logged, and never included in an error message. All that survives is the brand and the last four digits, so your receipt can say “Visa ending 4242”.",
  },
  {
    glyph: "🔒",
    title: "Personal data encrypted at rest",
    body: "Billing names, addresses and tax IDs are sealed with AES-256-GCM before they touch the disk. The key lives in the environment, not the database, so a stolen database file is unreadable on its own. GCM also authenticates, so a tampered row fails to decrypt rather than returning something wrong.",
  },
  {
    glyph: "🎫",
    title: "Sessions that survive a database leak",
    body: "The cookie carries a random id and a secret; the database stores only a SHA-256 of the secret. Someone holding a dump of the sessions table still cannot forge a login. Cookies are HTTP-only and SameSite, so JavaScript cannot read them and another site cannot send them.",
  },
  {
    glyph: "🚧",
    title: "Nothing injected, nothing framed",
    body: "Every page carries a Content-Security-Policy with a fresh nonce, so an injected script simply does not run, the attack that skims checkout pages elsewhere is inert here. Framing is refused outright, and every database query is a prepared statement with bound parameters, which is what puts SQL injection out of reach.",
  },
  {
    glyph: "⏱",
    title: "Guessing does not scale",
    body: "Sign-in, sign-up, password changes, checkout and downloads are each rate-limited. Eight wrong passwords locks an account for fifteen minutes. A wrong email and a wrong password take the same amount of time to answer, so the form cannot be used to discover who has an account here.",
  },
  {
    glyph: "📦",
    title: "Files only reach the people who bought them",
    body: "Uploads are stored outside the public folder under randomised names, there is no URL that serves them directly. Every download goes through a check that the signed-in account owns that exact purchase, and is always sent as a plain attachment so nothing can execute in your browser.",
  },
  {
    glyph: "👁",
    title: "No trackers. None.",
    body: "No analytics, no advertising pixels, no session recording, no third-party fonts, no CDN calls. The connect-src policy only permits this origin, so the page cannot phone home even by accident. Open your network tab and count the requests.",
  },
];

const PROMISES = [
  "We never sell, rent or share your personal data. There is no arrangement to sell.",
  "We collect a name, an email and a password. Not a phone number, not a birthday.",
  "Marketing email is off unless you deliberately switch it on.",
  "Export everything we hold about you as JSON, any time, from your account.",
  "Delete your account and it is gone immediately, no thirty-day window.",
];

export default function SecurityPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="bloom -right-32 -top-32 size-[30rem] opacity-20"
          style={{ background: "var(--sky)" }}
        />
        <div className="shell relative py-20 lg:py-28">
          <div className="max-w-3xl">
            <p className="label">Security & privacy</p>
            <h1 className="display mt-6">
              Boring
              <br />
              <span className="text-accent">on purpose.</span>
            </h1>
            <p className="mt-8 max-w-xl text-[1.0625rem] leading-relaxed text-ink-2">
              Most shops tell you they take security seriously and leave it there. Here is the
              actual list of what happens to your data, in enough detail that you could check it.
            </p>
          </div>
        </div>
      </section>

      <section className="shell py-20 lg:py-24">
        <div className="grid gap-4 md:grid-cols-2">
          {PILLARS.map((pillar, i) => (
            <article
              key={pillar.title}
              data-reveal
              data-reveal-delay={Math.min(i, 4) * 60}
              className="panel p-7 transition-colors hover:border-line-2"
            >
              <span aria-hidden className="text-2xl">
                {pillar.glyph}
              </span>
              <h2 className="mt-5 font-display text-lg leading-snug">
                {pillar.title}
              </h2>
              <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-2">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface py-20">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:items-start">
          <div data-reveal>
            <p className="label">In plain English</p>
            <h2 className="display-2 mt-3">
              What we
              <br />
              promise.
            </h2>
          </div>
          <ul className="space-y-px overflow-hidden rounded-[1.5rem] border border-line">
            {PROMISES.map((promise) => (
              <li key={promise} className="flex gap-4 bg-paper px-7 py-5 text-[0.875rem]">
                <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                  ✓
                </span>
                <span className="text-ink-2">{promise}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="shell py-20">
        <div className="panel mx-auto max-w-3xl p-8 sm:p-10">
          <h2 className="font-display text-xl">
            Before you take real money
          </h2>
          <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-2">
            This project ships with a self-contained demo payment processor so the whole flow works
            out of the box. It is written the way a real integration should be, the panel number
            never leaves the function that authorises it, but it does not move money and it is not
            a substitute for a real provider.
          </p>
          <p className="mt-4 text-[0.875rem] leading-relaxed text-ink-2">
            When you go live, put a hosted provider in front of it, Stripe Checkout, Paddle or
            Lemon Squeezy. Their iframe collects the panel so the number never reaches your server at
            all, which keeps you outside PCI-DSS scope entirely. Only the body of{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-accent">
              charge()
            </code>{" "}
            needs to change.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/legal/privacy" variant="outline" size="sm">
              Read the privacy policy
            </ButtonLink>
            <ButtonLink href="/help" variant="ghost" size="sm">
              Questions
            </ButtonLink>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-[0.6875rem] leading-relaxed text-ink-3">
          Found something wrong? Tell us before you tell anyone else, see{" "}
          <Link href="/help" className="underline underline-offset-2 hover:text-ink-2">
            responsible disclosure
          </Link>
          .
        </p>
      </section>
    </>
  );
}
