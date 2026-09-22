"use client";

import { useEffect } from "react";

/**
 * The motion engine.
 *
 * Three jobs: bring sections in as they arrive, assemble headline type off
 * scroll progress, and keep the whisper-level loops resting whenever nobody
 * is looking at them. All of it stands down the moment somebody asks for
 * less motion, in both directions, live.
 *
 * Everything here moves only transform and opacity, so it stays on the
 * compositor thread and never touches layout.
 */
export function Motion() {
  useEffect(() => {
    const still = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("still");

    /* A seeded generator, so the scatter is identical on every load rather
       than different each time the page is opened. */
    const rng = (seed: number) => {
      let s = seed >>> 0;
      return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
    };
    const hash = (s: string) => {
      let h = 2166136261;
      for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return Math.abs(h);
    };
    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

    /* The real sentence stays in the accessibility tree; the visible copy is
       built of spans and hidden from screen readers. */
    function splitType(el: HTMLElement) {
      if (el.dataset.split === "1") return;
      el.dataset.split = "1";
      const text = el.textContent ?? "";
      const r = rng(hash(text));
      const total = text.replace(/\s/g, "").length || 1;
      const vis = document.createElement("span");
      vis.className = "split";
      vis.setAttribute("aria-hidden", "true");
      let ci = 0;

      for (const chunk of text.split(/(\s+)/)) {
        if (/^\s+$/.test(chunk)) {
          vis.append(document.createTextNode(" "));
          continue;
        }
        const w = document.createElement("span");
        w.className = "w";
        w.style.setProperty("--th", (r() * 0.4).toFixed(3));
        for (const ch of chunk) {
          const c = document.createElement("span");
          c.className = "c";
          c.textContent = ch;
          c.style.setProperty("--th", ((ci / total) * 0.5 + r() * 0.06).toFixed(3));
          c.style.setProperty("--jx", `${(10 + r() * 22).toFixed(0)}px`);
          w.append(c);
          ci++;
        }
        vis.append(w);
      }

      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text;
      el.textContent = "";
      el.append(sr, vis);

      /* Halves parting needs the two sides pulled toward the centre. */
      if (el.dataset.enter === "part") {
        const ws = Array.from(vis.querySelectorAll<HTMLElement>(".w"));
        ws.forEach((w, i) => w.style.setProperty("--jx", `${i < ws.length / 2 ? 28 : -28}px`));
      }
    }

    type Head = { el: HTMLElement; k: number; latched: boolean };
    let heads: Head[] = [];
    let driveId: number | null = null;

    const headProgress = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const h = window.innerHeight;
      /* Assembly runs across the last part of the approach, so the line is
         settled well before it reaches the middle of the screen. */
      return clamp((h - r.top) / (h * 0.42), 0, 1);
    };

    function driveHeads() {
      let moving = false;
      for (const head of heads) {
        /* A heading latches once it has arrived. Text that disappears when
           you scroll back up is just text that disappeared. */
        if (head.latched) continue;
        const k = still() ? 1 : headProgress(head.el);
        if (Math.abs(k - head.k) > 0.008) {
          head.k = k;
          head.el.style.setProperty("--k", k.toFixed(3));
        }
        if (k >= 0.999) {
          head.latched = true;
          head.el.style.setProperty("--k", "1");
        } else if (k > 0) {
          moving = true;
        }
      }
      driveId = moving ? requestAnimationFrame(driveHeads) : null;
    }
    const nudge = () => {
      if (driveId === null) driveId = requestAnimationFrame(driveHeads);
    };

    heads = Array.from(document.querySelectorAll<HTMLElement>("[data-enter]")).map((el) => {
      splitType(el);
      return { el, k: -1, latched: false };
    });

    /* `.in` brings the children in. `.done` retires the stagger, or a hover
       on the third card lags by its entrance delay forever. `.live` starts
       the whisper-level loop only while the section is on screen. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) {
            el.classList.add("in", "live");
            if (!el.dataset.settled) {
              el.dataset.settled = "1";
              window.setTimeout(() => el.classList.add("done"), 1200);
            }
          } else {
            el.classList.remove("live");
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll(".enter, .alive").forEach((el) => io.observe(el));

    /* A failsafe. If the observer never fires, nothing stays hidden. */
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll(".enter").forEach((el) => el.classList.add("in", "done"));
    }, 1800);

    function applyStill(on: boolean) {
      document.documentElement.classList.toggle("still", on);
      if (on) {
        heads.forEach((h) => {
          h.k = 1;
          h.latched = true;
          h.el.style.setProperty("--k", "1");
        });
        document.querySelectorAll(".enter").forEach((el) => el.classList.add("in", "done"));
      } else {
        heads.forEach((h) => {
          h.k = -1;
          h.latched = false;
        });
        nudge();
      }
    }

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onPref = (e: MediaQueryListEvent) => applyStill(e.matches);
    mq.addEventListener("change", onPref);

    const onVisible = () =>
      document.body.classList.toggle("hidden-tab", document.hidden);
    document.addEventListener("visibilitychange", onVisible);
    addEventListener("scroll", nudge, { passive: true });
    addEventListener("resize", nudge);

    if (still()) applyStill(true);
    else nudge();

    return () => {
      io.disconnect();
      window.clearTimeout(failsafe);
      mq.removeEventListener("change", onPref);
      document.removeEventListener("visibilitychange", onVisible);
      removeEventListener("scroll", nudge);
      removeEventListener("resize", nudge);
      if (driveId !== null) cancelAnimationFrame(driveId);
    };
  });

  return null;
}

/** The fixed layer everything else sits on, so scrolling feels like moving
 *  through a place rather than past stacked sections. */
export function PressRoom() {
  return (
    <div className="press-room" aria-hidden>
      <span className="tooth" />
      <span className="bloom a" />
      <span className="bloom b" />
    </div>
  );
}
