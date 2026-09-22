"use client";

import { useEffect } from "react";

/**
 * The motion engine.
 *
 * Built on IntersectionObserver rather than scroll position. The reason is
 * measured: when this page is embedded in a frame whose parent does the
 * scrolling, the page's own document never scrolls, no scroll events arrive,
 * and CSS scroll-driven animations never advance, which leaves every reveal
 * frozen at opacity 0. The observer still fires in that case.
 *
 * The safety rule that follows: `html.anim` is what makes the hidden states
 * apply, and it is added only once the observer is confirmed constructed. No
 * script, no hiding, so the page always renders.
 */
export function ScrollMotion() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      root.classList.contains("still");

    /* Split a headline into words. The sentence itself stays in the
       accessibility tree; only the copy that animates is split. */
    document.querySelectorAll<HTMLElement>("[data-w]").forEach((el) => {
      if (el.dataset.split === "1") return;
      el.dataset.split = "1";
      const text = el.textContent ?? "";
      const out = document.createElement("span");
      out.setAttribute("aria-hidden", "true");

      const walk = (node: Node, cls: string) => {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const chunk of (node.textContent ?? "").split(/(\s+)/)) {
            if (chunk === "") continue;
            if (/^\s+$/.test(chunk)) {
              out.append(document.createTextNode(" "));
              continue;
            }
            const w = document.createElement("span");
            w.className = cls ? `wd ${cls}` : "wd";
            w.textContent = chunk;
            out.append(w);
          }
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const e = node as HTMLElement;
          e.childNodes.forEach((c) => walk(c, e.className || cls));
        }
      };
      Array.from(el.childNodes).forEach((n) => walk(n, ""));

      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text;
      el.textContent = "";
      el.append(sr, out);
      out.querySelectorAll<HTMLElement>(".wd").forEach((w, i) => {
        w.style.transitionDelay = `${Math.min(i * 72, 900)}ms`;
      });
    });

    const targets = document.querySelectorAll<HTMLElement>("[data-r],[data-rs],[data-w]");
    let io: IntersectionObserver | null = null;
    let backstop = 0;

    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue; /* arrive once, and stay */
            const el = e.target as HTMLElement;
            el.classList.add("on");
            io!.unobserve(el);
            if (el.hasAttribute("data-rs")) {
              /* Retire the stagger once it has played, or every later hover
                 on those children waits out its entrance delay. */
              window.setTimeout(() => el.classList.add("done"), 1400);
            }
          }
        },
        { threshold: 0, rootMargin: "0px 0px -15% 0px" },
      );

      targets.forEach((el) => {
        if (el.hasAttribute("data-rs")) {
          Array.from(el.children).forEach((c, j) => {
            (c as HTMLElement).style.transitionDelay = `${Math.min(j * 130, 1200)}ms`;
          });
        }
        io!.observe(el);
      });

      /* The backstop, for an element the observer never reports at all.
         Thirty seconds, because the trigger above is now correct and this
         should essentially never run. Two earlier versions got this wrong
         in opposite directions: 1.8 seconds revealed the whole page before
         anyone had scrolled, and a +300px trigger margin finished every
         reveal off-screen, so the section was already settled by the time
         it appeared. The convention is GSAP's "top 85%", which is a
         NEGATIVE bottom margin: fire just inside the viewport. */
      backstop = window.setTimeout(() => {
        targets.forEach((el) => el.classList.add("on", "done"));
      }, 30000);
    }

    /* This is the line that lets anything hide at all. */
    root.classList.toggle("anim", io !== null);

    /* Depth, from the observer's geometry rather than scroll position. */
    const layers: { el: HTMLElement; r: number }[] = [];
    let raf: number | null = null;
    const pump = () => {
      if (raf !== null || !layers.length) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        for (const l of layers) {
          const amt = Number(l.el.dataset.par) || 14;
          l.el.style.transform = `translate3d(0, ${(-(l.r - 0.5) * 2 * amt).toFixed(1)}px, 0)`;
        }
        if (layers.length) pump();
      });
    };
    let parIO: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined" && !reduced()) {
      parIO = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            const el = e.target as HTMLElement;
            const i = layers.findIndex((l) => l.el === el);
            if (e.isIntersecting && i === -1) layers.push({ el, r: e.intersectionRatio });
            else if (!e.isIntersecting && i !== -1) {
              layers[i].el.style.transform = "";
              layers.splice(i, 1);
            } else if (i !== -1) layers[i].r = e.intersectionRatio;
          }
          pump();
        },
        { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
      );
      document.querySelectorAll("[data-par]").forEach((el) => parIO!.observe(el));
    }

    /* Numbers run up the first time their figure is seen. */
    let countIO: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      countIO = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            const n = e.target as HTMLElement;
            countIO!.unobserve(n);
            const to = Number(n.dataset.count);
            const suffix = n.dataset.suffix ?? "";
            const dp = String(n.dataset.count).includes(".") ? 1 : 0;
            if (reduced()) {
              n.textContent = to.toFixed(dp) + suffix;
              continue;
            }
            const t0 = performance.now();
            const step = (now: number) => {
              const t = Math.min(1, (now - t0) / 1400);
              n.textContent = (to * (1 - Math.pow(1 - t, 3))).toFixed(dp) + suffix;
              if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        },
        { threshold: 0.5 },
      );
      document.querySelectorAll("[data-count]").forEach((n) => countIO!.observe(n));
    }

    /* The hero plays the moment the page exists. It must never wait on a
       scroll that, in an embedded frame, may never come. */
    const lit = requestAnimationFrame(() =>
      requestAnimationFrame(() => root.classList.add("lit")),
    );

    return () => {
      io?.disconnect();
      parIO?.disconnect();
      countIO?.disconnect();
      window.clearTimeout(backstop);
      cancelAnimationFrame(lit);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
