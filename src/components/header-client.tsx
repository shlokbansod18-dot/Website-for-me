"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import type { PublicUser } from "@/lib/types";

const NAV = [
  { href: "/products", label: "Browse" },
  { href: "/sell", label: "Sell" },
  { href: "/security", label: "Security" },
  { href: "/help", label: "Help" },
];

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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A full-screen menu that leaves the page scrollable behind it is a
  // classic mobile annoyance — freeze the body while it is open.
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
    <header className="sticky top-0 z-50">
      {/* Slim promise bar. Three facts, no marketing noise. */}
      <div className="hidden border-b border-line bg-surface text-[0.6875rem] tracking-wide text-faint md:block">
        <div className="shell flex h-8 items-center justify-center gap-8">
          <span>Instant delivery — download the second you pay</span>
          <span className="text-line-strong">/</span>
          <span>Free updates for life</span>
          <span className="text-line-strong">/</span>
          <span>No trackers. No resold data. Ever.</span>
        </div>
      </div>

      <div
        className={`glass border-b transition-colors duration-300 ${
          scrolled ? "border-line" : "border-transparent"
        }`}
      >
        <div className="shell flex h-16 items-center justify-between gap-4">
          <Logo />

          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`relative rounded-full px-3.5 py-2 text-[0.8125rem] transition-colors ${
                  isActive(item.href) ? "text-text" : "text-dim hover:text-text"
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-acid" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            <Link
              href="/cart"
              aria-label={`Bag — ${cartCount} item${cartCount === 1 ? "" : "s"}`}
              className="relative grid size-9 place-items-center rounded-full border border-line text-dim transition-colors hover:border-acid hover:text-acid"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 7h12l-1 12.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 015 19.5L4 7h2zm3 0V5.5a3 3 0 016 0V7"
                />
              </svg>
              {cartCount > 0 && (
                <span className="numeric absolute -right-1 -top-1 grid size-[18px] place-items-center rounded-full bg-acid text-[0.625rem] font-bold text-acid-ink">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-full border border-line py-1.5 pl-1.5 pr-3.5 text-[0.8125rem] text-dim transition-colors hover:border-acid hover:text-text sm:flex"
              >
                <span className="grid size-6 place-items-center rounded-full bg-acid text-[0.6875rem] font-bold text-acid-ink">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-24 truncate">{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden h-9 items-center rounded-full bg-acid px-4 text-[0.8125rem] font-medium text-acid-ink transition-[filter] hover:brightness-110 sm:inline-flex"
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
              className="grid size-9 place-items-center rounded-full border border-line text-dim md:hidden"
            >
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                {open ? (
                  <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path strokeLinecap="round" d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-line bg-canvas px-5 pb-10 pt-6 md:hidden"
        >
          <nav aria-label="Mobile" className="flex flex-col">
            {NAV.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-baseline justify-between border-b border-line py-5 font-display text-3xl font-bold tracking-[-0.04em]"
              >
                {item.label}
                <span className="numeric text-xs font-normal tracking-normal text-faint">
                  0{i + 1}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 flex flex-col gap-3">
            {user ? (
              <>
                <Link
                  href="/account"
                  className="flex h-12 items-center justify-center rounded-full bg-acid font-medium text-acid-ink"
                >
                  Your account
                </Link>
                {canSell && (
                  <Link
                    href="/studio"
                    className="flex h-12 items-center justify-center rounded-full border border-line-strong"
                  >
                    Creator studio
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="flex h-12 items-center justify-center rounded-full bg-acid font-medium text-acid-ink"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="flex h-12 items-center justify-center rounded-full border border-line-strong"
                >
                  Sign in
                </Link>
              </>
            )}
            <div className="flex items-center justify-between pt-3 text-sm text-dim">
              <span>Appearance</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
