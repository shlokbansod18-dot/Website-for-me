/**
 * Cover art, generated per product.
 *
 * Every product is a poster: a saturated ground, the category set small at
 * the top, and the title set large and tight across the bottom, cropped the
 * way a printed sheet is cropped. A wall of these reads as a curated print
 * shop. The previous version drew one enormous letter, which at catalogue
 * density read as a type specimen rather than a shop.
 */

export const TINTS = {
  persimmon:  { ground: "#ff4a24", ink: "#1b0400", label: "Persimmon"  },
  violet:     { ground: "#5b3bff", ink: "#efecff", label: "Violet"     },
  chartreuse: { ground: "#d7f04a", ink: "#151a00", label: "Chartreuse" },
  jade:       { ground: "#00b27b", ink: "#00301f", label: "Jade"       },
  blush:      { ground: "#ffc2d4", ink: "#4a0f24", label: "Blush"      },
  sky:        { ground: "#7ecbff", ink: "#05233d", label: "Sky"        },
  butter:     { ground: "#ffd84d", ink: "#3a2a00", label: "Butter"     },
  graphite:   { ground: "#16161c", ink: "#f4f3ef", label: "Graphite"   },
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
 * created under an older palette carry names that mean nothing here — without
 * the fallback every one of them would come out the same colour and the
 * catalogue would read as a single swatch.
 */
export function tintOf(name: string, seed = ""): (typeof TINTS)[TintName] {
  if ((name as TintName) in TINTS) return TINTS[name as TintName];
  return TINTS[TINT_NAMES[hash(seed || name) % TINT_NAMES.length]];
}

export function ProductCover({
  seed,
  accent,
  title,
  category,
  className = "",
  size = "md",
}: {
  seed: string;
  accent: string;
  title?: string;
  category?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const tint = tintOf(accent, seed);
  const h = hash(seed);
  const words = (title ?? seed).trim().split(/\s+/).filter(Boolean);

  // Two lines at most. A third line on a card this size sets too small to
  // read as display type, and the poster stops being a poster.
  const lines = words.length > 3 ? [words.slice(0, 2).join(" "), words.slice(2).join(" ")] : words;

  // A quiet plotted arc, placed per product so no two sheets are identical.
  const arcX = 20 + (h % 60);
  const arcY = 30 + ((h >> 5) % 40);
  const arcR = 26 + ((h >> 10) % 22);
  const scale = size === "sm" ? 0.82 : size === "lg" ? 1.12 : 1;

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      // Container units below need a size container, so the type scales with
      // the box rather than with whatever font-size it happens to inherit.
      style={{ background: tint.ground, containerType: "size" }}
      aria-hidden
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        style={{ opacity: 0.13 }}
      >
        <circle cx={arcX} cy={arcY} r={arcR} fill="none" stroke={tint.ink} strokeWidth="0.5" />
        <circle cx={arcX} cy={arcY} r={arcR * 0.66} fill="none" stroke={tint.ink} strokeWidth="0.5" />
        <circle cx={arcX} cy={arcY} r={arcR * 0.33} fill="none" stroke={tint.ink} strokeWidth="0.5" />
      </svg>

      {category ? (
        <span
          className="absolute font-sans font-semibold uppercase"
          style={{
            left: "7%",
            top: "7%",
            fontSize: `min(${5.5 * scale}cqh, ${4.6 * scale}cqw)`,
            letterSpacing: "0.18em",
            color: tint.ink,
            opacity: 0.7,
          }}
        >
          {category}
        </span>
      ) : null}

      <span
        className="absolute font-display font-semibold"
        style={{
          left: "7%",
          right: "7%",
          bottom: "7%",
          fontSize: `min(${17 * scale}cqh, ${14.5 * scale}cqw)`,
          lineHeight: 0.88,
          letterSpacing: "-0.045em",
          color: tint.ink,
          textWrap: "balance",
        }}
      >
        {lines.map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}
