"use client";
import { useEffect } from "react";
import { skipWrenWait } from "./audio";

/**
 * ArrowRight fast-forwards through a case for UAT: it collapses whatever
 * WREN narration is currently pacing (the actual wait), then clicks the
 * next "move forward" control if one's already on screen.
 *
 * It never answers a real question for the tester. Every pure move-forward
 * button in this app's copy ends its label with "→" (CONTINUE →, NEXT CASE
 * →, FIGHT →...) — genuine choice/option buttons never do — so that's the
 * one thing this keys off. It also skips anything `position: fixed` (the
 * Leave / WREN-voice-toggle buttons live there in every block), and skips
 * disabled buttons, so a half-finished build/pin/spot submit can't fire
 * early.
 */
export function useArrowAdvance() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight") return;
      const t = e.target as HTMLElement | null;
      if (t && /^(input|textarea)$/i.test(t.tagName)) return; // don't hijack a text field
      skipWrenWait();
      const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>("button"));
      const next = buttons.find(
        (b) => !b.disabled && b.textContent?.includes("→") && getComputedStyle(b).position !== "fixed",
      );
      if (next) {
        e.preventDefault();
        next.click();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
