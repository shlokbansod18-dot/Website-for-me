/**
 * Cover art, generated per product.
 *
 * Every product is a book jacket: a muted tinted ground and one enormous
 * serif character, cropped by the frame. The tints are deliberately desaturated
 * — the catalogue is a wall of these, and saturated colour at that density
 * turns a shop into a fruit bowl. The letter comes from the product's own
 * title, so two products never look alike.
 */

export const TINTS = {
  sage: { ground: "#b9c5b2", mark: "#26331f", label: "Sage" },
  clay: { ground: "#dbb8a3", mark: "#3d2417", label: "Clay" },
  slate: { ground: "#aeb9c6", mark: "#1b2531", label: "Slate" },
  sand: { ground: "#ded1af", mark: "#342c15", label: "Sand" },
  plum: { ground: "#c3aec6", mark: "#2c1b31", label: "Plum" },
  ink: { ground: "#1f1f1c", mark: "#e9e7df", label: "Ink" },
} as const;

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export type TintName = keyof typeof TINTS;
export const TINT_NAMES = Object.keys(TINTS) as TintName[];

/**
 * Honours an explicit tint, and otherwise derives one from the seed. Products
 * created before this palette existed carry names like "acid" that mean
 * nothing here — without the fallback every one of them would come out the
 * same green and the catalogue would read as a single swatch.
 */
export function tintOf(name: string, seed = ""): (typeof TINTS)[TintName] {
  if ((name as TintName) in TINTS) return TINTS[name as TintName];
  return TINTS[TINT_NAMES[hash(seed || name) % TINT_NAMES.length]];
}

export function ProductCover({
  seed,
  accent,
  title,
  className = "",
  size = "md",
}: {
  seed: string;
  accent: string;
  title?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const tint = tintOf(accent, seed);
  const h = hash(seed);

  // Always a letterform, never a symbol. A wall of set characters reads as a
  // type specimen; a wall of geometric glyphs reads as clip art.
  const mark = ((title ?? seed).trim().charAt(0) || "S").toUpperCase();

  // A gentle per-product offset so the wall of covers is not a grid of
  // perfectly centred letters, without pushing any of them off the frame.
  const dx = -9 + (h % 18);
  const dy = -6 + ((h >> 6) % 12);
  const scale = size === "sm" ? 0.94 : size === "lg" ? 1 : 0.98;

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      // Container units below need a size container, so the letter scales with
      // the box rather than with whatever font-size it happens to inherit.
      style={{ background: tint.ground, containerType: "size" }}
      aria-hidden
    >
      <span
        className="absolute select-none font-display leading-none"
        style={{
          left: `${50 + dx}%`,
          top: `${50 + dy}%`,
          transform: "translate(-50%, -50%)",
          // Sized against whichever edge is shorter, so a letter fills a tall
          // card and a wide hero equally well instead of bursting out of one.
          fontSize: `min(${74 * scale}cqh, ${62 * scale}cqw)`,
          lineHeight: 1,
          color: tint.mark,
          opacity: 0.9,
        }}
      >
        {mark}
      </span>

      {/* A hairline inset, the way a print piece carries a trim mark. */}
      <span
        className="pointer-events-none absolute inset-[9px] rounded-[2px]"
        style={{ border: `1px solid ${tint.mark}`, opacity: 0.12 }}
      />
    </div>
  );
}
