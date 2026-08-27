# VELORA — Brand System

> **Note on provenance:** this system was designed from scratch for this build.
> No existing Velora palette or type spec was available in the repository or in
> session memory. Everything below is a proposal — every value lives in
> `assets/css/tokens.css`, so replacing it with the real brand spec is a
> single-file edit, not a rebuild.

---

## 1. Positioning

**Velora** is a small-run clothing house. Fourteen pieces a season, engineered
natural fibre, cut for drape. The design language follows from the product:
restraint, one decisive accent, and generous space.

Voice: plain, specific, slightly severe. Concrete nouns and real numbers
("148 GSM", "two hundred per run") over adjectives. Never exclamatory.

---

## 2. Colour

A warm-black base rather than pure black — `#000` reads as software, a warm
black reads as editorial. One saturated accent carries every call to action.

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#0B0A09` | Base canvas — warm black |
| `--ink-900` | `#100E0C` | Raised surface, menu |
| `--ink-800` | `#17140F` | Cards, media wells |
| `--ink-700` | `#221C16` | Hairlines on dark |
| `--bone` | `#F3EFE8` | Primary type, light surfaces |
| `--bone-dim` | `#CFC6B7` | Secondary type |
| `--sand` | `#8C8175` | Captions, metadata |
| `--ember` | `#E1542B` | **The accent** — CTA, focus, highlight |
| `--ember-lit` | `#FF6E42` | Accent hover / glow |
| `--clay` | `#7C5A47` | Gradient partner, tertiary |

**Rules**

- Ember is never a background for body copy — only for chips, buttons,
  the accent marquee, and single highlighted words.
- Components reference the functional aliases (`--fg`, `--accent`, `--rule`),
  never raw hex. Re-skinning means editing the ten values above.
- Body text on `--ink` uses `--bone` (≈ 15.8:1) or `--bone-dim` (≈ 11.4:1).
  `--sand` is reserved for uppercase metadata at ≥ 12px.

---

## 3. Typography

Four families, each with one job.

| Role | Family | Usage |
|---|---|---|
| Display | **Archivo** (variable, `wdth 62–125`, `wght 100–900`) | Headlines, set uppercase at `wght 800` / `wdth 112%`. The width axis is what makes it read bold and modern rather than merely heavy. |
| Accent | **Instrument Serif** *italic* | One emphasised word per headline. The serif/grotesque contrast is the whole typographic idea — use it sparingly or it stops working. |
| Body | **Inter Tight** | Paragraphs, product names, UI. |
| Mono | **Geist Mono** | Eyebrows, metadata, buttons, prices. Always uppercase, `0.14–0.22em` tracking. |

All four are **self-hosted** from `assets/fonts/` (latin + latin-ext variable
subsets). No third-party request at runtime.

**Scale** — fluid, `clamp()`-based, `--step--2` through `--step-6`, tuned
between a 380px and 1600px viewport. Headline line-height `0.86`, tracking
`-0.035em`; body `1.55` / `-0.005em`.

---

## 4. Motion

One easing curve carries the house style: `--ease-out` (`cubic-bezier(0.16, 1,
0.30, 1)`) — a fast expo-out that settles rather than bounces.

| Primitive | Behaviour |
|---|---|
| Mask reveal | Text lines slide up from behind a clipped edge, staggered `60ms` |
| Fade-rise | Blocks rise `34px` into place, staggered `90ms` |
| Clip wipe | Media uncovers top-to-bottom |
| Scale settle | Media eases from `1.18` to `1.0` over `1.6s` |
| Parallax | Media drifts against scroll, `5–12%` |
| Word dim | Manifesto words light up as they pass the reading line |

Durations: `0.32s` / `0.6s` / `0.95s` / `1.4s`. Nothing exceeds `1.6s`.

**Every one of these collapses to a static, fully visible layout under
`prefers-reduced-motion: reduce`,** including the WebGL scenes, which are
never loaded at all.

---

## 5. The 3D objects

Two shader scenes, both hand-written GLSL over a vendored three.js.

- **Silk** (hero) — a 280×190 plane displaced by an *anisotropic* height field:
  high frequency across x, almost none across y. That asymmetry is what makes
  it read as hanging cloth instead of terrain. Ember is confined to the top of
  the elevation range and to the satin sheen along each crease.
- **Orb** (materials) — a 72-subdivision icosphere morphed by three clean
  noise octaves, lit warm with a cool fill from below.

Both cap device pixel ratio at 1.75, pause when scrolled off-screen, and fall
back to still procedural artwork if WebGL is unavailable.

---

## 6. Artwork

There is no photography in this repository. Every fabric plate is generated
in-browser: an SVG turbulence field displaces a brand gradient into drape
shapes, a second softened turbulence is lit as a height field for fold relief,
and CSS adds weave and sheen on top. See `assets/css/fabric.css` and the
`<filter id="drape-*">` definitions in each page.

Swapping in real photography is a direct replacement — see the README.
