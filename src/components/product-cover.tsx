export const ACCENTS = {
  acid: { a: "#d8ff3e", b: "#5d7f00", ink: "#0b0f00" },
  violet: { a: "#a68dff", b: "#3d2199", ink: "#0c0520" },
  flare: { a: "#ff8a6b", b: "#a31d07", ink: "#1c0600" },
  sky: { a: "#7fe3ff", b: "#0a5f80", ink: "#00161f" },
} as const;

export type AccentName = keyof typeof ACCENTS;

export function accentOf(name: string): (typeof ACCENTS)[AccentName] {
  return ACCENTS[(name as AccentName) in ACCENTS ? (name as AccentName) : "acid"];
}

/** Stable small integer from a string, so each product always gets the same art. */
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/**
 * Every product gets generated cover art instead of a stock photograph.
 *
 * A deep tinted field, one soft light source, a fine blueprint grid and the
 * product's symbol set very large — all derived from the slug, so the same
 * product always looks the same and the catalogue reads as art-directed
 * without anyone having to open a design tool.
 */
export function ProductCover({
  seed,
  accent,
  glyph,
  className = "",
  size = "md",
}: {
  seed: string;
  accent: string;
  glyph: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const tone = accentOf(accent);
  const h = hash(seed);

  // Where the light falls, and how the symbol sits in the frame.
  const lightX = 22 + (h % 56);
  const lightY = 18 + ((h >> 5) % 40);
  const tilt = -12 + ((h >> 11) % 24);
  const driftX = -8 + ((h >> 17) % 16);

  const glyphSize =
    size === "lg" ? "clamp(7rem, 24vw, 13rem)" : size === "sm" ? "2.75rem" : "5rem";
  const gridSize = size === "sm" ? 14 : size === "lg" ? 46 : 30;

  return (
    <div
      className={`relative isolate overflow-hidden ${className}`}
      style={{
        background: `
          radial-gradient(70% 80% at ${lightX}% ${lightY}%, ${tone.b} 0%, transparent 70%),
          linear-gradient(155deg, #14161d 0%, #080910 55%, #05060a 100%)
        `,
      }}
      aria-hidden
    >
      {/* Blueprint grid — gives the flat field a sense of scale. */}
      <div
        className="absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage: `linear-gradient(to right, ${tone.a} 1px, transparent 1px), linear-gradient(to bottom, ${tone.a} 1px, transparent 1px)`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          maskImage: `radial-gradient(85% 85% at ${lightX}% ${lightY}%, #000 10%, transparent 75%)`,
          WebkitMaskImage: `radial-gradient(85% 85% at ${lightX}% ${lightY}%, #000 10%, transparent 75%)`,
        }}
      />

      {/* The symbol, oversized and slightly off-axis. */}
      <div className="absolute inset-0 grid place-items-center">
        <span
          className="font-display font-bold leading-none"
          style={{
            fontSize: glyphSize,
            color: tone.a,
            opacity: 0.92,
            transform: `rotate(${tilt}deg) translateX(${driftX}%)`,
            textShadow: `0 0 60px ${tone.b}, 0 2px 30px rgb(0 0 0 / 0.45)`,
          }}
        >
          {glyph}
        </span>
      </div>

      {/* Highlight along the top edge, then a vignette to seat it on the page. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgb(255 255 255 / 0.07) 0%, transparent 22%, transparent 60%, rgb(3 4 8 / 0.6) 100%)`,
        }}
      />
    </div>
  );
}
