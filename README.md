# VELORA

A website for **Velora**, a small-run clothing house — dark, editorial, and
built around two hand-written WebGL scenes and a scroll-driven motion system.

Three pages, no build step, no runtime dependencies. Open `index.html` and it
runs.

| | |
|---|---|
| **index.html** | Hero with the silk shader, manifesto, collection grid, pinned horizontal lookbook, materials section with the orb shader, editorial split, newsletter |
| **lookbook.html** | SS26 plates in an asymmetric editorial grid, with category filters |
| **about.html** | The atelier: process steps, partner cities, house rules |

> ⚠️ **On the brand values:** no Velora palette or type spec was available in
> this repository or in session memory, so the entire system was designed for
> this build. It is a proposal, not a reproduction. Every colour, font and
> motion value lives in **`assets/css/tokens.css`** — swapping in your real
> spec is a one-file edit. See [BRAND.md](BRAND.md) for the full rationale.

---

## Run it

```bash
# any static server; the ES modules need http(s), not file://
npx http-server -p 8000 -c-1
# → http://localhost:8000
```

## Deploy

It is a static site, so anything works. For GitHub Pages: **Settings → Pages →
Deploy from branch**, pick this branch and the root folder. No CI needed.

---

## Structure

```
index.html · lookbook.html · about.html
assets/
  css/
    tokens.css      ← colour, type scale, spacing, motion. START HERE.
    main.css        ← reset, typography, nav, buttons, motion primitives
    sections.css    ← per-section layout
    fabric.css      ← procedural fabric artwork
  fonts/            ← self-hosted Archivo · Instrument Serif · Inter Tight · Geist Mono
  js/
    main.js         ← entry point
    smooth.js       ← inertial scroll (drives real scroll, so sticky still works)
    motion.js       ← reveals, split text, cursor, magnetic, counters, filters
    scenes.js       ← the two GLSL scenes
  vendor/           ← three.js r180 (MIT), vendored — no CDN
```

## Changing things

**Colours and type** — `assets/css/tokens.css`. Components only ever reference
the functional aliases (`--fg`, `--accent`, `--rule`), so changing the ten
palette values re-skins all three pages. The WebGL scenes read `--ember`,
`--bone` and `--clay` from the same file at runtime.

**Swapping in real photography.** Every fabric plate is procedural SVG. To use
a real photo, replace the `.fabric` block, keeping the wrapper:

```html
<div class="media" data-media-in>
  <div class="media__inner" data-parallax="8">
    <img src="assets/img/drape-coat.jpg" alt="The Drape Coat in ember cupro-silk">
  </div>
</div>
```

The wrapper supplies the aspect ratio, hover scale, parallax and clip reveal —
so the motion carries over unchanged. Only `alt` is on you.

**Copy and prices.** Prices are `₹` in the markup; search `₹` to change
currency. Product names, materials and the manifesto are plain text in the HTML.

**The newsletter form** is client-side only — it validates and confirms, but
posts nowhere. Point `[data-signup]` at your provider in `motion.js`.

---

## Notes

**Accessibility.** Semantic landmarks, one `<h1>` per page, a skip link,
visible focus rings, `aria-current` on the active nav item, `aria-pressed` on
the filters, and screen-reader labels on split headlines. Every animation
collapses under `prefers-reduced-motion: reduce` — including the WebGL, which
is never even fetched — and the still fabric artwork stands in for it. Content
is fully readable with JavaScript disabled.

**Performance.** No CDN, no framework, no build. three.js (~330 KB) is loaded
lazily via dynamic `import()` only after first paint and only when a scene is
actually wanted, so it never blocks rendering. Both scenes cap DPR at 1.75 and
stop rendering when scrolled out of view. Fonts are subset and preloaded.

**Browser support.** Any evergreen browser. Without WebGL the scenes are
replaced by still artwork; without JavaScript everything remains readable.

**Licences.** three.js is MIT (`assets/vendor/THREE-LICENSE.txt`). The four
typefaces are SIL OFL 1.1 (`assets/fonts/OFL.txt`).
