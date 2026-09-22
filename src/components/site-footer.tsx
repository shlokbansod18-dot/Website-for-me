import Link from "next/link";

import { LogoMark } from "@/components/logo";
import { SITE, mailto } from "@/lib/site";

const COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?sort=newest", label: "New this week" },
      { href: "/products?category=UI+Kits", label: "UI kits" },
      { href: "/products?category=Templates", label: "Templates" },
      { href: "/cart", label: "Your bag" },
    ],
  },
  {
    title: "Creators",
    links: [
      { href: "/sell", label: "Start selling" },
      { href: "/studio", label: "Creator studio" },
      { href: "/help", label: "Seller help" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: mailto(SITE.email, "softsystem, hello"), label: "Contact us" },
      { href: "/security", label: "Security & privacy" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/refunds", label: "Refund policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line bg-surface">
      <div className="shell py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark className="size-8" />
              <span className="font-display text-xl">softsystem</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-2">
              A marketplace for the things people make on screens. Publish once, deliver
              instantly, and keep your customers&rsquo; data out of everyone else&rsquo;s hands.
            </p>
            <p className="mt-5 text-sm">
              <span className="text-ink-3">Get in touch: </span>
              <a
                href={mailto(SITE.email, "softsystem, hello")}
                className="text-accent underline-offset-4 transition-opacity hover:underline"
              >
                {SITE.email}
              </a>
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-[0.6875rem] text-ink-2">
              <span className="pulse-dot size-1.5 rounded-full bg-positive" />
              All systems operational
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="label mb-4">{column.title}</h3>
                <ul className="space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href + link.label}>
                      {/* next/link is for in-app routes; mailto needs a plain anchor. */}
                      {link.href.startsWith("mailto:") ? (
                        <a
                          href={link.href}
                          className="text-sm text-ink-2 transition-colors hover:text-accent"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-ink-2 transition-colors hover:text-accent"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 text-xs text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} softsystem. Built for people who make things.</p>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>Payments encrypted end to end</span>
            <span aria-hidden className="text-line-2">/</span>
            <span>No third-party analytics on this site</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
