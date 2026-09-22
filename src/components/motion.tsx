"use client";

/**
 * The fixed layer everything else sits on: a grain that breathes and two
 * slow blooms, so scrolling reads as moving through a place rather than
 * past stacked sections. None of it depends on scroll position, which is
 * what keeps the page alive even where scroll-driven motion cannot run.
 */
export function PressRoom() {
  return (
    <div className="aura-wrap" aria-hidden>
      <span className="tooth" />
      <span className="aura one" />
      <span className="aura two" />
    </div>
  );
}
