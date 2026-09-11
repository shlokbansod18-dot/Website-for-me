"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Library", exact: true },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/settings", label: "Profile" },
  { href: "/account/security", label: "Security" },
  { href: "/account/privacy", label: "Privacy & data" },
];

export function AccountNav({ canSell }: { canSell: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav aria-label="Account" className="lg:sticky lg:top-28 lg:self-start">
      {/* Scrolls sideways on phones instead of stacking into a tall column. */}
      <ul className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-2 lg:mx-0 lg:flex-col lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {LINKS.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <li key={link.href} className="shrink-0 lg:shrink">
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`block whitespace-nowrap rounded-full px-4 py-2 text-[0.8125rem] transition-colors lg:rounded-xl ${
                  active
                    ? "bg-surface-2 text-text lg:border-l-2 lg:border-acid lg:pl-3.5"
                    : "text-dim hover:bg-surface hover:text-text"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}

        {canSell && (
          <li className="shrink-0 lg:mt-4 lg:shrink lg:border-t lg:border-line lg:pt-4">
            <Link
              href="/studio"
              className="flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-[0.8125rem] text-acid transition-colors hover:bg-acid/10 lg:rounded-xl"
            >
              Creator studio
              <span aria-hidden>→</span>
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
