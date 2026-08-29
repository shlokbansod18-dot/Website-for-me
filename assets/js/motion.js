/* ============================================================
   VELORA — motion primitives
   Every effect degrades to "visible, static content" when
   JS is off or prefers-reduced-motion is on.
   ============================================================ */

export const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

/* ---------- SPLIT TEXT -------------------------------------
   Wraps each word in a masked line so it can slide up on
   reveal. Keeps the original text for screen readers.        */
export function splitText(root = document) {
  root.querySelectorAll('[data-split]').forEach((el) => {
    if (el.dataset.splitDone) return;
    el.dataset.splitDone = 'true';

    const mode = el.dataset.split || 'words';
    const source = el.innerHTML;
    el.setAttribute('aria-label', el.textContent.trim());

    // Split on top-level words but keep inline markup (e.g. <em>) intact
    const tmp = document.createElement('div');
    tmp.innerHTML = source;

    const pieces = [];
    const walk = (node, wrapper) => {
      node.childNodes.forEach((child) => {
        if (child.nodeType === 3) {
          child.textContent.split(/(\s+)/).forEach((token) => {
            if (!token.trim()) { if (token) pieces.push({ text: ' ', tag: wrapper }); return; }
            pieces.push({ text: token, tag: wrapper });
          });
        } else if (child.nodeType === 1) {
          walk(child, child);
        }
      });
    };
    walk(tmp, null);

    el.innerHTML = '';
    let i = 0;
    pieces.forEach((p) => {
      if (p.text === ' ') { el.appendChild(document.createTextNode(' ')); return; }
      const line = document.createElement('span');
      line.className = 'rv-line';
      const inner = document.createElement('span');
      inner.className = 'rv-inner';
      inner.style.setProperty('--i', mode === 'chars' ? i : i);
      if (p.tag) {
        const clone = p.tag.cloneNode(false);
        clone.textContent = p.text;
        inner.appendChild(clone);
      } else {
        inner.textContent = p.text;
      }
      line.appendChild(inner);
      line.setAttribute('aria-hidden', 'true');
      el.appendChild(line);
      i++;
    });
  });
}

/* ---------- REVEAL ON ENTER -------------------------------- */
export function observeReveals(root = document) {
  const targets = root.querySelectorAll(
    '[data-reveal], [data-split], [data-lines], [data-clip], [data-media-in], [data-draw], [data-count], .footer__wordmark'
  );
  if (!('IntersectionObserver' in window)) {
    targets.forEach((t) => t.classList.add('is-in'));
    return;
  }
  const show = (el) => {
    el.classList.add('is-in');
    if (el.hasAttribute('data-count')) countUp(el);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }
  );
  targets.forEach((t) => io.observe(t));

  // The observer's bottom margin and threshold mean an element sitting low
  // in the *first* viewport never qualifies until the user scrolls — which
  // would leave above-the-fold content (the hero CTA) invisible on arrival.
  // Anything on screen at load reveals immediately instead.
  requestAnimationFrame(() => {
    targets.forEach((t) => {
      if (t.classList.contains('is-in')) return;
      const r = t.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { show(t); io.unobserve(t); }
    });
  });
}

/* ---------- NUMBER COUNTER --------------------------------- */
function countUp(el) {
  const to = parseFloat(el.dataset.count);
  const dp = (el.dataset.count.split('.')[1] || '').length;
  if (reduced()) { el.textContent = to.toFixed(dp); return; }
  const dur = 1500;
  const t0 = performance.now();
  const tick = (now) => {
    const p = clamp((now - t0) / dur, 0, 1);
    const eased = 1 - Math.pow(1 - p, 4);
    el.textContent = (to * eased).toFixed(dp);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/* ---------- CUSTOM CURSOR ---------------------------------- */
export function initCursor() {
  if (window.matchMedia('(pointer: coarse)').matches || reduced()) return;

  const ring = document.querySelector('.cursor');
  const dot = document.querySelector('.cursor-dot');
  const label = ring?.querySelector('.cursor__label');
  if (!ring || !dot) return;

  let mx = innerWidth / 2, my = innerHeight / 2;
  let rx = mx, ry = my;
  ring.style.opacity = '0';

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    ring.style.opacity = '1';
    dot.style.opacity = '1';
    const hit = e.target.closest('a, button, [data-cursor]');
    if (hit) {
      const text = hit.dataset.cursor;
      ring.classList.toggle('is-label', !!text);
      ring.classList.toggle('is-hover', !text);
      if (text && label) label.textContent = text;
    } else {
      ring.classList.remove('is-hover', 'is-label');
    }
  }, { passive: true });

  addEventListener('mouseleave', () => { ring.style.opacity = '0'; dot.style.opacity = '0'; });

  const loop = () => {
    rx = lerp(rx, mx, 0.16); ry = lerp(ry, my, 0.16);
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- MAGNETIC ELEMENTS ------------------------------ */
export function initMagnetic() {
  if (window.matchMedia('(pointer: coarse)').matches || reduced()) return;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic) || 0.32;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null, active = false;

    const run = () => {
      cx = lerp(cx, tx, 0.18); cy = lerp(cy, ty, 0.18);
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (active || Math.abs(cx) > 0.1 || Math.abs(cy) > 0.1) raf = requestAnimationFrame(run);
      else { el.style.transform = ''; raf = null; }
    };

    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength;
      active = true;
      if (!raf) raf = requestAnimationFrame(run);
    });
    el.addEventListener('mouseleave', () => { tx = 0; ty = 0; active = false; });
  });
}

/* ---------- SCROLL-DRIVEN EFFECTS -------------------------- *
   Parallax, the pinned horizontal gallery and the manifesto
   word-dimming all read from one rAF pass fed by Smooth.      */
export function initScrollEffects(smooth) {
  const parallax = [...document.querySelectorAll('[data-parallax]')];
  const hscrolls = [...document.querySelectorAll('[data-hscroll]')];
  const manifesto = document.querySelector('[data-manifesto]');
  const words = manifesto ? [...manifesto.querySelectorAll('.word')] : [];
  const bar = document.querySelector('[data-progress]');
  const still = reduced();

  words.forEach((w) => w.classList.add('is-dim'));

  const update = ({ progress }) => {
    const vh = window.innerHeight;

    if (bar) bar.style.transform = `scaleX(${progress})`;

    if (!still) {
      parallax.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const amt = parseFloat(el.dataset.parallax) || 12;
        const centre = (r.top + r.height / 2 - vh / 2) / vh;   // -1 … 1
        el.style.transform = `translate3d(0, ${(-centre * amt).toFixed(2)}%, 0)`;
      });
    }

    hscrolls.forEach((sec) => {
      const track = sec.querySelector('[data-hscroll-track]');
      const fill = sec.querySelector('[data-hscroll-fill]');
      if (!track) return;
      const r = sec.getBoundingClientRect();
      const dist = Math.max(1, sec.offsetHeight - vh);
      const p = clamp(-r.top / dist, 0, 1);
      const travel = Math.max(0, track.scrollWidth - sec.clientWidth);
      track.style.transform = `translate3d(${(-p * travel).toFixed(2)}px, 0, 0)`;
      if (fill) fill.style.transform = `scaleX(${p.toFixed(3)})`;
    });

    if (words.length) {
      const r = manifesto.getBoundingClientRect();
      const p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.18), 0, 1);
      const lit = Math.round(p * words.length * 1.25);
      words.forEach((w, i) => w.classList.toggle('is-dim', i > lit));
    }
  };

  smooth.onFrame(update);
  update({ progress: 0 });
}

/* ---------- NAVIGATION ------------------------------------- */
export function initNav(smooth) {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const menu = document.querySelector('.menu');
  if (!nav) return;

  let last = 0;
  smooth.onFrame(({ y }) => {
    nav.classList.toggle('is-stuck', y > 40);
    if (!nav.classList.contains('is-open')) {
      nav.classList.toggle('is-hidden', y > last && y > 380);
    }
    last = y;
  });

  const close = () => {
    nav.classList.remove('is-open');
    menu?.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    toggle?.setAttribute('aria-expanded', 'false');
  };

  toggle?.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    menu?.classList.toggle('is-open', open);
    document.body.classList.toggle('is-locked', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  // Smooth in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      close();
      const top = target.getBoundingClientRect().top + window.scrollY - 20;
      if (smooth.enabled && !reduced()) smooth.scrollTo(top);
      else window.scrollTo({ top, behavior: reduced() ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
}

/* ---------- MARQUEE ---------------------------------------- *
   Duplicates the track so the -100% loop is seamless at any
   viewport width.                                             */
export function initMarquees() {
  document.querySelectorAll('.marquee').forEach((m) => {
    const track = m.querySelector('.marquee__track');
    if (!track) return;
    const need = Math.ceil(window.innerWidth / Math.max(1, track.scrollWidth)) + 1;
    for (let i = 0; i < Math.max(1, need); i++) {
      const clone = track.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      m.appendChild(clone);
    }
  });
}

/* ---------- PRELOADER -------------------------------------- */
export function runPreloader(onDone) {
  const el = document.querySelector('.preloader');
  if (!el) { onDone?.(); return; }

  const fill = el.querySelector('.preloader__bar i');
  const num = el.querySelector('[data-pct]');
  document.body.classList.add('is-locked');

  const finish = () => {
    el.classList.add('is-done');
    document.body.classList.remove('is-locked');
    document.body.classList.add('is-loaded');
    setTimeout(() => el.remove(), 1200);
    onDone?.();
  };

  if (reduced()) { finish(); return; }

  // Hard ceiling: whatever else happens (slow shader compile, stalled
  // rAF, a wedged frame) the page is never held hostage by the loader.
  let settled = false;
  const done = () => { if (!settled) { settled = true; finish(); } };
  const bail = setTimeout(done, 2600);

  let pct = 0;
  const t0 = performance.now();
  const tick = () => {
    // ease toward 100 but never finish before ~1.1s of runway
    const elapsed = performance.now() - t0;
    const ceiling = Math.min(100, (elapsed / 1400) * 100);
    pct = lerp(pct, ceiling, 0.14);
    if (ceiling >= 100 && pct > 99.4) pct = 100;
    if (fill) fill.style.width = `${pct}%`;
    if (num) num.textContent = String(Math.round(pct)).padStart(3, '0');
    if (pct < 100 && !settled) requestAnimationFrame(tick);
    else if (!settled) { clearTimeout(bail); setTimeout(done, 260); }
  };
  requestAnimationFrame(tick);
}

/* ---------- NEWSLETTER (client-side only) ------------------ */
export function initSignup() {
  document.querySelectorAll('[data-signup]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input');
      const note = form.parentElement.querySelector('[data-signup-note]');
      if (!input?.value) return;
      form.classList.add('is-sent');
      if (note) note.textContent = `Welcome to the list — confirmation sent to ${input.value}.`;
      input.value = '';
      input.blur();
    });
  });
}

/* ---------- LOOKBOOK FILTERS ------------------------------- *
   Progressive enhancement: without JS every plate is visible
   and the buttons simply do nothing.                          */
export function initFilters() {
  const bar = document.querySelector('[data-filters]');
  if (!bar) return;

  const buttons = [...bar.querySelectorAll('[data-filter]')];
  const plates = [...document.querySelectorAll('[data-cat]')];
  const empty = document.querySelector('[data-filter-empty]');

  const apply = (cat) => {
    let shown = 0;
    plates.forEach((el) => {
      const hit = cat === 'all' || el.dataset.cat === cat;
      el.classList.toggle('is-filtered', !hit);
      el.setAttribute('aria-hidden', String(!hit));
      if (hit) shown++;
    });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === cat)));
    if (empty) empty.hidden = shown > 0;
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
}
