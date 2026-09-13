"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { PublicUser } from "@/lib/types";

const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/sell", label: "Sell" },
  { href: "/security", label: "Security" },
  { href: "/help", label: "Help" },
];

/**
 * One thin line across the top and nothing else. The old header carried a
 * promise bar, a pill nav and three icon buttons; on a page whose job is to
 * show other people's work, that is all noise.
 */
export function HeaderClient({
  user,
  cartCount,
  canSell,
}: {
  user: PublicUser | null;
  cartCount: number;
  canSell: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="shell flex h-[4.5rem] items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`text-[0.9375rem] font-medium transition-colors ${
                isActive(item.href) ? "text-accent-2" : "text-ink-2 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          <Link
            href="/cart"
            className="group flex items-baseline gap-1.5 text-[0.9375rem] text-ink-2 transition-colors hover:text-ink"
          >
            Bag
            <span className="numeric text-[0.8125rem] text-ink-3 group-hover:text-accent">
              ({cartCount})
            </span>
          </Link>

          {user ? (
            <Link
              href={canSell ? "/studio" : "/account"}
              className="hidden text-[0.9375rem] text-ink-2 transition-colors hover:text-ink sm:block"
            >
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/login"
              className="hidden text-[0.9375rem] text-ink-2 transition-colors hover:text-ink sm:block"
            >
              Sign in
            </Link>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-1 p-1 text-ink md:hidden"
          >
            <svg viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.4">
              {open ? (
                <path strokeLinecap="round" d="M5 5l10 10M15 5L5 15" />
              ) : (
                <path strokeLinecap="round" d="M3 7h14M3 13h14" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 overflow-y-auto bg-paper px-6 pb-12 pt-4 md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-line py-5 font-display text-[2.25rem] font-semibold leading-none tracking-[-0.04em]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex h-12 items-center justify-center rounded bg-accent font-medium text-on-accent"
                >
                  Your library
                </Link>
                {canSell && (
                  <Link
                    href="/studio"
                    className="flex h-12 items-center justify-center rounded border border-line-2"
                  >
                    Studio
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="flex h-12 items-center justify-center rounded bg-accent font-medium text-on-accent"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="flex h-12 items-center justify-center rounded border border-line-2"
                >
                  Sign in
                </Link>
              </>
            )}
            <div className="flex items-center justify-between border-t border-line pt-5 text-[0.9375rem] text-ink-2">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
