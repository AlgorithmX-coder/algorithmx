"use client";

import { useEffect } from "react";

/**
 * GlobalGameStyles — injects one stylesheet for hover-glow + focus-visible
 * polish that applies across every screen of the lesson shell. Stays in
 * one place so we can tweak the game-feel of buttons project-wide
 * without hunting through every component.
 *
 * Mount once near the lesson root.
 */

const ID = "ax-global-game-styles";
const CSS = `
/* Hover lift — applies to any button that opts in via [data-ax-juice]
 * (so we don't accidentally disturb the bespoke buttons). */
button[data-ax-juice]:hover {
  transform: translateY(-1px);
  filter: brightness(1.06) saturate(1.05);
}
button[data-ax-juice]:active {
  transform: translateY(0) scale(0.98);
  filter: brightness(0.96);
}

/* Crisp keyboard focus ring on EVERY interactive element. The default
 * browser outline is jagged; this is a clean cyan halo that matches
 * our palette. Click-focus stays invisible, only :focus-visible
 * (keyboard) shows the ring. */
button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible,
[role="button"]:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid #00e5ff;
  outline-offset: 3px;
  box-shadow: 0 0 0 4px rgba(0,229,255,0.18);
  border-radius: 8px;
}

/* Native range inputs — keep the outline subtler since the thumb is
 * already visible. */
input[type="range"]:focus-visible {
  outline: 2px solid #00e5ff;
  outline-offset: 4px;
}

/* Smooth caret colour for any text input across the shell. */
input, textarea {
  caret-color: #00e5ff;
}

/* Selection colour for any selected text. */
::selection {
  background: rgba(0,229,255,0.3);
  color: #ffffff;
}

/* Disabled button styling — uniform "you can't click this right now"
 * cue across the whole app. */
button:disabled,
[aria-disabled="true"] {
  opacity: 0.4;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

/* Reduce-motion override — when the user has the toggle on, kill any
 * decorative animations registered by other components. */
html[data-ax-reduce-motion="true"] *,
html[data-ax-reduce-motion="true"] *::before,
html[data-ax-reduce-motion="true"] *::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}
`;

export default function GlobalGameStyles() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(ID)) return;
    const el = document.createElement("style");
    el.id = ID;
    el.textContent = CSS;
    document.head.appendChild(el);
  }, []);
  return null;
}
