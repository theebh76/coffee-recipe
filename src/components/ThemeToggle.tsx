"use client";

import { THEME_COLORS, THEME_STORAGE_KEY } from "@/lib/theme";

/**
 * Light/dark switch.
 *
 * Deliberately stateless. Both icons are always in the markup and CSS picks
 * which one shows (see `.theme-icon--*` in globals.css), so the server and
 * client render identical HTML — no hydration mismatch, and no need to read
 * localStorage during render. The click handler just flips the attribute the
 * stylesheet keys off, and the blocking script in <head> restores it on the
 * next page load before anything paints.
 */
export default function ThemeToggle() {
  function toggle() {
    const root = document.documentElement;

    // No data-theme means the visitor is following their OS — resolve against
    // the media query so the first click always flips what they can see.
    const current =
      root.dataset.theme ??
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";

    root.dataset.theme = next;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage — the choice just won't outlive the tab.
    }

    // Keep the browser/iOS status bar in step. There are two theme-color tags
    // (one per media query); once the choice is explicit, both should agree.
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((tag) => tag.setAttribute("content", THEME_COLORS[next]));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className="-m-2 inline-flex h-11 w-11 items-center justify-center rounded-full p-2 text-lg text-ink-soft transition-colors hover:bg-paper-soft hover:text-accent"
    >
      <span className="theme-icon theme-icon--moon" aria-hidden="true">
        ☾
      </span>
      <span className="theme-icon theme-icon--sun" aria-hidden="true">
        ☀
      </span>
    </button>
  );
}
