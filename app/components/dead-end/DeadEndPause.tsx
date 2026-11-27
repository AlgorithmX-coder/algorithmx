"use client";

import { useRef, useState } from "react";

/* The design's Pause control: holds every loop on the page (the pools, the
 * streams, the ring and the floating glyph) by setting data-still on the
 * dead end's root. Hidden under reduced motion, where nothing moves. */
export default function DeadEndPause() {
  const ref = useRef<HTMLButtonElement>(null);
  const [still, setStill] = useState(false);

  function toggle() {
    const next = !still;
    setStill(next);
    const root = ref.current?.closest(".r8");
    if (root) root.toggleAttribute("data-still", next);
  }

  return (
    <button
      ref={ref}
      className="r8-pause"
      type="button"
      onClick={toggle}
      aria-pressed={still}
      aria-label={still ? "Play motion" : "Pause motion"}
    >
      {still ? (
        <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <path d="M3 1.5v9l7.5-4.5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
          <rect x="2" y="1.5" width="3" height="9" rx="1" />
          <rect x="7" y="1.5" width="3" height="9" rx="1" />
        </svg>
      )}
    </button>
  );
}
