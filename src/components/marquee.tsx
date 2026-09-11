/**
 * An infinite ticker. The list is rendered twice and the track slides exactly
 * half its width, which makes the loop seamless with no JavaScript at all.
 */
export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee relative overflow-hidden border-b border-line bg-canvas py-4">
      {/* Fades the strip into the page edges instead of cutting it off. */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(to right, var(--canvas), transparent 12%, transparent 88%, var(--canvas))",
        }}
        aria-hidden
      />
      <div className="marquee-track" aria-hidden>
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex shrink-0 items-center gap-8 whitespace-nowrap px-8 font-display text-sm font-medium tracking-[-0.02em] text-dim"
          >
            {item}
            <span className="text-acid">✳</span>
          </span>
        ))}
      </div>
      <span className="sr-only">Categories: {items.join(", ")}</span>
    </div>
  );
}
