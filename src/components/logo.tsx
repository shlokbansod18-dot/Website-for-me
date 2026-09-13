import Link from "next/link";

/**
 * The mark is an aperture: a square with a circle cut from it, the circle
 * offset so the remaining shape reads as both a lens and a lowercase "o".
 * Flat, no gradient — it has to hold at 16px in a browser tab.
 */
export function LogoMark({ className = "size-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden focusable="false">
      <path
        d="M2 4a2 2 0 012-2h16a2 2 0 012 2v16a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm7.4 8a3.6 3.6 0 107.2 0 3.6 3.6 0 00-7.2 0z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-baseline gap-2 ${className}`}
      aria-label="softsystem — home"
    >
      <LogoMark className="size-[1.05rem] translate-y-[0.1rem] text-ink" />
      <span className="font-display text-[1.35rem] leading-none tracking-[-0.02em] text-ink">
        softsystem
      </span>
    </Link>
  );
}
