import Link from "next/link";

/**
 * The mark is an eclipse: a solid acid squircle with a circle of the page
 * colour sliding across it. Reads as a "soft system" — two simple shapes
 * making a third.
 */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <defs>
        <mask id="ss-eclipse">
          <rect width="32" height="32" fill="white" />
          <circle cx="23" cy="9.5" r="9" fill="black" />
        </mask>
      </defs>
      <rect
        width="32"
        height="32"
        rx="10.5"
        fill="var(--acid)"
        mask="url(#ss-eclipse)"
      />
      <circle cx="23" cy="9.5" r="4.1" fill="var(--acid)" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      className={`group inline-flex items-center gap-2.5 ${className}`}
      aria-label="softsystem — home"
    >
      <LogoMark className="size-7 transition-transform duration-300 group-hover:rotate-[-8deg]" />
      <span className="font-display text-[1.0625rem] font-bold tracking-[-0.045em] text-text">
        softsystem
      </span>
    </Link>
  );
}
