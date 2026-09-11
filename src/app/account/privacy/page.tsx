import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DeleteAccount, ExportData } from "@/components/privacy-panel";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy & data",
  robots: { index: false, follow: false },
};

const HOLDINGS = [
  {
    what: "Your name and email",
    why: "To sign you in and put a name on your receipts.",
    kept: "Until you delete your account",
  },
  {
    what: "A scrypt hash of your password",
    why: "To check a sign-in without ever storing the password itself.",
    kept: "Until you delete your account",
  },
  {
    what: "What you have bought, and its licence keys",
    why: "So your library keeps working and you can re-download forever.",
    kept: "Until you delete your account",
  },
  {
    what: "Your billing address, encrypted",
    why: "Required on the invoice. Sealed with AES-256-GCM on disk.",
    kept: "With the order it belongs to",
  },
  {
    what: "Card brand and last four digits",
    why: 'So a receipt can say "Visa ending 4242".',
    kept: "With the order it belongs to",
  },
  {
    what: "A device label and a keyed hash of your IP",
    why: "To show your signed-in devices and to rate-limit attacks.",
    kept: "Until the session expires",
  },
];

export default async function PrivacyPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account/privacy");

  return (
    <div className="max-w-2xl space-y-10">
      <section>
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold tracking-[-0.035em]">
            Everything we hold about you
          </h2>
          <p className="mt-1 text-[0.8125rem] text-dim">
            The complete list. There is no second list.
          </p>
        </div>

        <ul className="space-y-px overflow-hidden rounded-[1.25rem] border border-line">
          {HOLDINGS.map((item) => (
            <li key={item.what} className="bg-surface px-5 py-4">
              <p className="text-[0.875rem] font-medium">{item.what}</p>
              <p className="mt-1 text-[0.8125rem] text-dim">{item.why}</p>
              <p className="mt-1.5 text-[0.6875rem] text-faint">Kept: {item.kept}</p>
            </li>
          ))}
        </ul>

        <div className="card mt-4 p-5">
          <p className="text-[0.8125rem] leading-relaxed text-dim">
            <span className="text-text">What we do not have:</span> your card number, your phone
            number, your date of birth, your browsing history on other sites, or any profile
            assembled by an advertising network. This site loads no third-party scripts at all —
            check the network tab.
          </p>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold tracking-[-0.035em]">Take it with you</h2>
          <p className="mt-1 text-[0.8125rem] text-dim">
            A machine-readable copy of your account, orders and activity.
          </p>
        </div>
        <div className="card p-7">
          <ExportData />
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold tracking-[-0.035em]">Delete everything</h2>
          <p className="mt-1 text-[0.8125rem] text-dim">
            Immediate and permanent — no cooling-off period, no email chase, no retention window.
          </p>
        </div>
        <div className="card p-7">
          <DeleteAccount />
        </div>
      </section>

      <p className="text-[0.6875rem] text-faint">
        The full policy lives at{" "}
        <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-dim">
          /legal/privacy
        </Link>
        . It is written in plain English and fits on one screen.
      </p>
    </div>
  );
}
