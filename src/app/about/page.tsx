import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { SITE, mailto } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Soft System is one studio selling its own digital work. Everything here was drawn here.",
};

const PROMISES = [
  [
    "One maker",
    "Nobody else lists on this shop. Every font, kit, preset and system was drawn in this studio and used on real work before it went up for sale.",
  ],
  [
    "One payment",
    "No subscription, no seat count, no upgrade path. You pay once and the file is yours, with a licence key tied to your account.",
  ],
  [
    "Free updates",
    "When a product gets better, the new version appears in your library at no cost, for as long as the product is supported.",
  ],
  [
    "Fourteen days",
    "If it is not what you expected, say so within fourteen days and the money goes back. You do not have to explain yourself.",
  ],
];

export default function AboutPage() {
  return (
    <>
      <section className="on-ivory py-20 lg:py-32">
        <div className="shell">
          <p className="micro">About</p>
          <h1 className="display mt-7 max-w-[14ch]" data-words>
            A small shop, <span className="thin">run properly.</span>
          </h1>
          <p className="mt-9 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-2">
            Soft System makes digital things and sells them here. There is no catalogue of other
            people&rsquo;s work, no reseller inventory, and no algorithm deciding what you see. There
            is a shelf, and everything on it came out of the same studio.
          </p>
        </div>
      </section>

      <section className="on-stone alive py-20 lg:py-28">
        <div className="shell">
          <h2 className="display-2 max-w-[16ch]" data-words>
            What you get, every time
          </h2>
          <dl data-stagger className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {PROMISES.map(([title, body]) => (
              <div key={title} className="bg-paper p-8 lg:p-10">
                <dt className="font-sans text-[1.0625rem] font-semibold">{title}</dt>
                <dd className="mt-2.5 max-w-[46ch] text-[0.9375rem] leading-relaxed text-ink-2">
                  {body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="on-ink py-20 lg:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <h2 className="display-2 max-w-[13ch]" data-words>
              Write to me <span className="thin">directly.</span>
            </h2>
            <p className="mt-7 max-w-[42ch] text-ink-2">
              There is no support desk here and no ticket number. Questions about a licence, a refund,
              or whether something will work for your project all go to the same inbox, and a person
              answers.
            </p>
          </div>
          <div className="self-center">
            <ButtonLink href={mailto(SITE.email, "Hello")} size="lg">
              {SITE.email}
            </ButtonLink>
            <p className="mt-5 text-[0.875rem] text-ink-2">
              Usually the same day, always within two.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
