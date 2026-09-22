import type { Metadata } from "next";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/button";
import { SITE, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help",
  description: "Answers about buying, downloading, refunds, selling and security on softsystem.",
};

const SECTIONS = [
  {
    title: "Buying & downloading",
    items: [
      {
        q: "When do I get my files?",
        a: "The moment your payment clears. The confirmation page has a download button on it, and the same product is waiting in your library at /account. There is no email to wait for.",
      },
      {
        q: "Can I download something more than once?",
        a: "As many times as you like, forever, from any device you are signed in on. Your library never expires. There is a generous hourly cap purely to stop automated scraping.",
      },
      {
        q: "Do I need an account to buy?",
        a: "Yes. Digital purchases have to be tied to something so that your downloads keep working and your licence keys stay reachable. Signing up takes a name, an email and a password.",
      },
      {
        q: "What is the licence key for?",
        a: "It is your proof of purchase, and some creators use it to unlock features or register the product. You will find it on the receipt and next to the product in your library.",
      },
      {
        q: "Will I get updates?",
        a: "Yes, free. When a creator ships a new version, the updated file replaces the old one in your library at no extra cost.",
      },
    ],
  },
  {
    title: "Payments & refunds",
    items: [
      {
        q: "Which cards do you take?",
        a: "Visa, Mastercard, Amex, Discover and RuPay. Prices are shown and charged in US dollars; your bank converts at their rate.",
      },
      {
        q: "Do you store my panel?",
        a: "No. The number exists only for the instant the payment is authorised. We keep the brand and the last four digits so your receipt can identify which panel you used, and nothing else.",
      },
      {
        q: "Can I get a refund?",
        a: "Yes, within 14 days, as long as you have not downloaded the file more than a couple of times. Digital goods cannot be returned, so the window is about mistakes and misdescriptions rather than change of mind after use. The full policy is at /legal/refunds.",
      },
      {
        q: "Where is my invoice?",
        a: "Every order has one at /account/orders. It includes your billing address and tax ID if you entered one. Use your browser's print dialogue to save it as a PDF.",
      },
    ],
  },
  {
    title: "Selling",
    items: [
      {
        q: "How do I start selling?",
        a: "Sign in, go to /studio and press the button. There is no application and no waiting list. Then upload a file, write a description, set a price and publish.",
      },
      {
        q: "What does it cost?",
        a: "5% of each sale. No listing fee, no monthly fee, no minimum. If you sell nothing you pay nothing.",
      },
      {
        q: "What can I upload?",
        a: "Archives, documents, images, design files, fonts, audio, video and 3D formats, up to 24 MB each. Anything larger, or anything with lots of files, should be zipped.",
      },
      {
        q: "Can I take a product down?",
        a: "Yes. Unpublishing hides it from the shop immediately. If people have already bought it, their downloads keep working, that purchase was already paid for.",
      },
      {
        q: "Who can sell on Soft System?",
        a: "Only the owner of the shop. There is no seller sign-up, so nothing on these shelves is a reseller\u2019s copy or somebody else\u2019s work bundled up.",
      },
    ],
  },
  {
    title: "Account & privacy",
    items: [
      {
        q: "How do I sign out everywhere?",
        a: "Go to /account/security. You will see every signed-in device and can sign out of one, or of all of them at once. Changing your password also signs out every other device automatically.",
      },
      {
        q: "Can I get a copy of my data?",
        a: "Yes, /account/privacy has a button that downloads everything we hold about you as a JSON file. No request form, no waiting period.",
      },
      {
        q: "How do I delete my account?",
        a: "Same page. It asks for your password and a typed confirmation, then deletes your account, orders, licence keys and library immediately and permanently.",
      },
      {
        q: "Do you use cookies?",
        a: "Three, all strictly functional: one for your sign-in session, one for your bag, and one for an applied coupon. All are signed and HTTP-only. There are no advertising or analytics cookies, which is why you are not being shown a consent banner.",
      },
    ],
  },
  {
    title: "Responsible disclosure",
    items: [
      {
        q: "I found a security problem.",
        a: `Please tell us before telling anyone else, and give us a reasonable window to fix it. Send the details to ${SITE.securityEmail} with steps to reproduce. Do not test against other people's accounts or data, we would rather hear about a theoretical issue than have a real customer affected by a proof of concept.`,
      },
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="shell max-w-3xl py-16 lg:py-24">
      <header className="mb-14">
        <p className="label">Help</p>
        <h1 className="display-2 mt-3">Questions, answered</h1>
        <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-2">
          If the answer is not here, email{" "}
          <a
            href={mailto(SITE.supportEmail, "softsystem, question")}
            className="text-accent underline-offset-4 hover:underline"
          >
            {SITE.supportEmail}
          </a>{" "}
          and a person will read it.
        </p>
      </header>

      <div className="space-y-12">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="label mb-4">{section.title}</h2>
            <div className="space-y-px overflow-hidden rounded-[1.25rem] border border-line">
              {section.items.map((item) => (
                <details key={item.q} className="group bg-surface">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-[0.9375rem] font-medium transition-colors hover:text-accent">
                    {item.q}
                    <span
                      aria-hidden
                      className="shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="px-6 pb-6 text-[0.875rem] leading-relaxed text-ink-2">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="panel mt-14 flex flex-wrap items-center justify-between gap-6 p-7">
        <div>
          <h2 className="font-display text-lg">
            Still stuck?
          </h2>
          <p className="mt-1.5 text-[0.8125rem] text-ink-2">
            The security page goes into far more detail on how your data is handled.
          </p>
        </div>
        <div className="flex gap-3">
          <ButtonLink href="/security" variant="outline" size="sm">
            Security
          </ButtonLink>
          <ButtonLink href="/legal/refunds" variant="ghost" size="sm">
            Refunds
          </ButtonLink>
        </div>
      </div>

      <p className="mt-8 text-center text-[0.6875rem] text-ink-3">
        Looking for the legal wording?{" "}
        <Link href="/legal/terms" className="underline underline-offset-2 hover:text-ink-2">
          Terms
        </Link>{" "}
        ·{" "}
        <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-ink-2">
          Privacy
        </Link>{" "}
        ·{" "}
        <Link href="/legal/refunds" className="underline underline-offset-2 hover:text-ink-2">
          Refunds
        </Link>
      </p>
    </div>
  );
}
