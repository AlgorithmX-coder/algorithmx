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
import { SLOTS, coveredArea } from "@/app/components/lesson/captionSlots";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// SLOTS + coveredArea now live in captionSlots.ts so CoachCaption can use the
// SAME placement. The pill's own behaviour here is unchanged.

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

    // Some boards fill in WHILE the narration is still running - Week 9's Test
    // Drive reveals one minute at a time, and its fourth row arrived underneath
    // a pill that had settled when only three rows existed. Three fixed
    // re-checks cannot see content that appears later, so watch the document
    // for as long as the pill is up. The choice itself is unchanged: it still
    // takes the first slot that covers nothing, so it does not wander.
    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", place);
      observer.disconnect();
      if (raf) cancelAnimationFrame(raf);
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
