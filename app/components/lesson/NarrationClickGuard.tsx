"use client";

/**
 * NarrationClickGuard — while the narrator is speaking, catch clicks/taps on
 * the lesson so children can't skip or click through the voice. Renders a
 * full-viewport pointer catcher (portalled to <body>) only while `active`.
 *
 * HARD BLOCK (owner 2026-09-07): a tap is SWALLOWED, not a skip — the child
 * cannot skip the teaching voice by clicking. The voice auto-plays and the
 * guard lifts on its own when the voice ends (InfoNarration also has a
 * length-based safety-release, so the guard can never stick forever). The
 * master MuteToggle (z-index 90) stays reachable and is the only way to stop
 * the voice early (for a grown-up).
 *
 * Z-INDEX 88 is deliberate: above the lesson content, below the MuteToggle.
 *
 * PILL PLACEMENT (owner UAT 2026-09-16: "every one of these buttons is
 * defected"): the "Listening…" pill is pinned to the viewport, so a single
 * fixed spot sat on top of whatever control happened to be there, e.g. the
 * Learn screen's "Tap all the clues!" button or a quiz answer. It now takes the
 * first slot below that covers no visible control. Where the original spot is
 * already clear it stays exactly where it always was. It is placed before first
 * paint (never flashes over a button), re-checked once entrance animations
 * settle and on resize, and if no slot is clear it takes the one covering the
 * least, so it is never worse than before. Only the pill moves; the click
 * block is unchanged.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface Box { left: number; top: number; right: number; bottom: number }

interface Slot {
  /** Fixed-position offsets for the pill in this slot (every key explicit, so
   *  moving between slots never leaves a stale offset behind). */
  style: Pick<CSSProperties, "left" | "right" | "top" | "bottom" | "transform">;
  /** The box the pill would occupy here, for the collision check. */
  box: (vw: number, vh: number, w: number, h: number) => Box;
}

/** Candidate slots in preference order. Slot 0 is the original spot. */
const SLOTS: Slot[] = [
  {
    // Bottom centre, 76px up: the original spot, kept wherever it is clear.
    style: { left: "50%", right: "auto", top: "auto", bottom: 76, transform: "translateX(-50%)" },
    box: (vw, vh, w, h) => ({ left: (vw - w) / 2, top: vh - 76 - h, right: (vw + w) / 2, bottom: vh - 76 }),
  },
  {
    // Bottom centre, low: below most lesson content.
    style: { left: "50%", right: "auto", top: "auto", bottom: 14, transform: "translateX(-50%)" },
    box: (vw, vh, w, h) => ({ left: (vw - w) / 2, top: vh - 14 - h, right: (vw + w) / 2, bottom: vh - 14 }),
  },
  {
    // Bottom-left corner (the MuteToggle owns the bottom-right corner).
    style: { left: 20, right: "auto", top: "auto", bottom: 20, transform: "none" },
    box: (_vw, vh, w, h) => ({ left: 20, top: vh - 20 - h, right: 20 + w, bottom: vh - 20 }),
  },
  {
    // Top centre, just under the lesson header.
    style: { left: "50%", right: "auto", top: 72, bottom: "auto", transform: "translateX(-50%)" },
    box: (vw, _vh, w, h) => ({ left: (vw - w) / 2, top: 72, right: (vw + w) / 2, bottom: 72 + h }),
  },
];

/** Anything a child can tap. The pill must never sit on one of these. */
const CONTROL_SELECTOR = "button, a[href], [role='button'], input, select, textarea, [data-pd-card], [data-mm-card]";

/** Total area (px²) of visible controls the box would cover. */
function coveredArea(box: Box, guard: HTMLElement | null): number {
  let area = 0;
  document.querySelectorAll(CONTROL_SELECTOR).forEach((el) => {
    if (guard && guard.contains(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    // Opacity is deliberately NOT a reason to skip: lesson controls fade in as
    // the narration starts, and skipping them would park the pill on a button
    // that is about to appear.
    const cs = window.getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return;
    const ix = Math.max(0, Math.min(box.right, r.right) - Math.max(box.left, r.left));
    const iy = Math.max(0, Math.min(box.bottom, r.bottom) - Math.max(box.top, r.top));
    area += ix * iy;
  });
  return area;
}

export default function NarrationClickGuard({
  active,
  hidePill = false,
}: {
  active: boolean;
  /** Keep the no-skip click-block but hide the "Listening…" pill, for a host
   *  that already shows its own listen indicator (e.g. WeekIntroScene's gated
   *  "Let's go!" button) - avoids two "listen" badges on one screen. */
  hidePill?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const guardRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);
  // null = not placed yet: the pill renders hidden (still measurable) until the
  // first placement, which happens before paint.
  const [slot, setSlot] = useState<number | null>(null);

  useIsoLayoutEffect(() => {
    if (!active || hidePill || !mounted) {
      setSlot(null);
      return;
    }
    const place = () => {
      const pill = pillRef.current;
      if (!pill) return;
      const { width: w, height: h } = pill.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let best = 0;
      let bestArea = Number.POSITIVE_INFINITY;
      for (let i = 0; i < SLOTS.length; i++) {
        const a = coveredArea(SLOTS[i].box(vw, vh, w, h), guardRef.current);
        if (a === 0) {
          best = i;
          break;
        }
        if (a < bestArea) {
          best = i;
          bestArea = a;
        }
      }
      setSlot(best);
    };
    place();
    // Lesson content animates in; re-check once it has settled.
    const timers = [350, 900, 1800].map((ms) => window.setTimeout(place, ms));
    window.addEventListener("resize", place);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", place);
    };
  }, [active, hidePill, mounted]);

  if (!active || !mounted || typeof document === "undefined") return null;

  // Swallow every pointer/click so nothing underneath fires and the voice
  // can't be skipped. NOT preventable by the child; only the voice ending
  // (or the mute button) lifts the guard.
  const block = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return createPortal(
    <div
      ref={guardRef}
      aria-hidden
      data-narration-guard=""
      onPointerDownCapture={block}
      onMouseDownCapture={block}
      onClickCapture={block}
      onTouchStartCapture={block}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 88, // above lesson content, below MuteToggle (z 90)
        background: "transparent",
        cursor: "default",
        touchAction: "none",
      }}
    >
      {!hidePill && (
        <>
          <style>{`@keyframes ncgPulse{0%,100%{opacity:.72}50%{opacity:1}}`}</style>
          <div
            ref={pillRef}
            data-narration-pill=""
            style={{
              position: "fixed",
              ...SLOTS[slot ?? 0].style,
              visibility: slot === null ? "hidden" : "visible",
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 16px",
              borderRadius: 999,
              background: "rgba(10,16,38,0.9)",
              border: "1px solid rgba(125,240,255,0.45)",
              color: "#dff3ff",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: "0.02em",
              fontFamily: "'Nunito', system-ui, sans-serif",
              boxShadow: "0 10px 28px -8px rgba(0,0,0,0.65), 0 0 18px rgba(0,229,255,0.25)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              animation: "ncgPulse 1.6s ease-in-out infinite",
            }}
          >
            <span aria-hidden>🔊</span> Listening…
          </div>
        </>
      )}
    </div>,
    document.body,
  );
}
