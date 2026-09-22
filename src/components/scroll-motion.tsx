"use client";

import { useEffect } from "react";

/**
 * The scroll engine.
 *
 * Reveals are CSS scroll-driven (see the SCROLL MOTION block in
 * globals.css). This file does the three things CSS cannot: run the
 * pinned gallery, condense the header, and stand in for scroll-driven
 * CSS on a browser that lacks it.
 *
 * There is deliberately no timer here. An earlier version had a 1.8
 * second failsafe that revealed every section before anybody scrolled,
 * which killed the animation entirely while every test still passed.
 */
export function ScrollMotion() {
  useEffect(() => {
    const supportsSD =
      typeof CSS !== "undefined" && CSS.supports("animation-timeline: view()");
    const lessMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("still");

    document.documentElement.classList.add("js");

    /* Split headlines into word spans so they can rise one at a time.
       The per-word ranges are nth-child rules, so the spans must be
       direct children of the split wrapper. */
    document.querySelectorAll<HTMLElement>("[data-words]").forEach((el) => {
      if (el.dataset.split === "1") return;
      el.dataset.split = "1";
      const text = el.textContent ?? "";
      const vis = document.createElement("span");
      vis.setAttribute("aria-hidden", "true");

      const walk = (node: Node, into: HTMLElement) => {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const chunk of (node.textContent ?? "").split(/(\s+)/)) {
            if (chunk === "") continue;
            if (/^\s+$/.test(chunk)) {
              into.append(document.createTextNode(" "));
              continue;
            }
            const w = document.createElement("span");
            w.className = "wd";
            w.textContent = chunk;
            into.append(w);
          }
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
          const src = node as HTMLElement;
          /* Keep the styling of an inner element (the italic clause) by
             copying its class onto each word it contains, rather than
             nesting, which would break the nth-child stagger. */
          src.childNodes.forEach((c) => walk(c, into));
          into.querySelectorAll<HTMLElement>(".wd:not([data-styled])").forEach((w) => {
            if (src.className) w.className = `wd ${src.className}`;
            w.dataset.styled = "1";
          });
        }
      };

      Array.from(el.childNodes).forEach((n) => walk(n, vis));
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text;
      el.textContent = "";
      el.append(sr, vis);
    });

    /* The pinned gallery: while the section is stuck, the rack slides
       sideways by exactly as much as it overflows. */
    const wrap = document.querySelector<HTMLElement>(".pinwrap");
    const track = wrap?.querySelector<HTMLElement>(".pintrack") ?? null;
    let travel = 0;

    const measure = () => {
      if (!wrap || !track) return;
      if (lessMotion() || window.innerWidth <= 860) {
        wrap.style.height = "";
        track.style.transform = "";
        travel = 0;
        return;
      }
      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      wrap.style.height = `${window.innerHeight + travel}px`;
    };

    const mast = document.querySelector<HTMLElement>("header");
    let stuck = false;
    let ticking = false;

    const draw = () => {
      if (wrap && track && travel) {
        const p = Math.min(1, Math.max(0, -wrap.getBoundingClientRect().top / travel));
        track.style.transform = `translate3d(${-p * travel}px,0,0)`;
      }
      if (mast) {
        const should = window.scrollY > 24;
        if (should !== stuck) {
          stuck = should;
          mast.classList.toggle("stuck", should);
        }
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        draw();
      });
    };

    /* Only where the browser cannot drive animation from scroll. No
       timers: an element is shown while it is in view and hidden again
       when it leaves, so it replays on every pass. */
    let io: IntersectionObserver | null = null;
    if (!supportsSD && typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => e.target.classList.toggle("seen", e.isIntersecting));
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
      );
      document
        .querySelectorAll("[data-sd],[data-stagger],[data-words]")
        .forEach((el) => io!.observe(el));
    }

    measure();
    draw();

    const onResize = () => {
      measure();
      onScroll();
    };
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    mq.addEventListener("change", onResize);

    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      mq.removeEventListener("change", onResize);
      io?.disconnect();
    };
  });

  return null;
}
