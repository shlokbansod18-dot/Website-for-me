"use client";

import { useEffect, useState } from "react";

/**
 * Dark is the house style; light is an explicit choice, remembered locally.
 * Nothing about the preference leaves the browser.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = document.documentElement.dataset.theme;
    setTheme(saved === "light" ? "light" : "dark");
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ss-theme", next);
    } catch {
      // Private browsing with storage blocked — the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="grid size-9 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.7">
        {theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path
              strokeLinecap="round"
              d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
            />
          </>
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"
          />
        )}
      </svg>
    </button>
  );
}
