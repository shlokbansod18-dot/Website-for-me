/* ============================================================
   VELORA — entry point
   ============================================================ */

import { Smooth } from './smooth.js';
import {
  splitText, observeReveals, initCursor, initMagnetic, initScrollEffects,
  initNav, initMarquees, runPreloader, initSignup, initFilters, reduced
} from './motion.js';

const smooth = new Smooth({ lerp: 0.085 }).start();

splitText();
observeReveals();
initCursor();
initMagnetic();
initMarquees();
initNav(smooth);
initScrollEffects(smooth);
initSignup();
initFilters();
runPreloader();

document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = new Date().getFullYear();
});

/* ---------- WebGL, loaded lazily so first paint stays fast ----------
   three.js is only fetched once we know the page actually wants it. */
const wantsGL = document.querySelector('[data-gl]') && !reduced();

if (!wantsGL) {
  // Reduced motion: never load three.js, and remove the canvases so they
  // cannot sit as empty boxes over the still artwork.
  document.querySelectorAll('[data-gl]').forEach((c) => c.remove());
} else {
  import('./scenes.js')
    .then(({ createSilk, createOrb, supportsWebGL }) => {
      if (!supportsWebGL()) return;

      const heroCanvas = document.querySelector('[data-gl="silk"]');
      if (heroCanvas) {
        const silk = createSilk(heroCanvas, {
          colorA: cssVar('--ember'),
          colorC: cssVar('--bone'),
          colorD: cssVar('--clay')
        });
        heroCanvas.parentElement.classList.add('is-ready');
        smooth.onFrame(({ y }) => silk.setScroll(Math.min(1, y / window.innerHeight)));
      }

      const orbCanvas = document.querySelector('[data-gl="orb"]');
      if (orbCanvas) {
        createOrb(orbCanvas, {
          colorA: cssVar('--ember'),
          colorC: cssVar('--bone'),
          colorD: cssVar('--clay')
        });
        orbCanvas.parentElement.classList.add('is-ready');
      }
    })
    .catch(() => {
      /* No WebGL / module failed: the CSS gradient fallback stands in. */
      document.querySelectorAll('[data-gl]').forEach((c) => c.remove());
    });
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
