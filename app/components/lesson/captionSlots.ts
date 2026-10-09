"use client";

/**
 * Where a floating lesson pill is allowed to sit, and how to pick the spot
 * that covers nothing.
 *
 * This logic was written for the "Listening…" pill in NarrationClickGuard and
 * proved out across all twenty weeks. It lived privately in that file, so when
 * CoachCaption needed the same thing it did not get it: the caption is pinned
 * at a FIXED `bottom: 88`, which is clear at the owner's 1414x771 and lands
 * squarely on the board at the tester's 1093x525. Measured on week 6's Game
 * Zone Bingo, the caption covered the bottom row of cards.
 *
 * So the slots and the scoring move here, unchanged, and both the pill and the
 * caption read them. One definition, and a new board gets it for free - which
 * is what the original comment in NarrationClickGuard said the intent was.
 */

import { useEffect, useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface Box { left: number; top: number; right: number; bottom: number }

export interface Slot {
  /** Fixed-position offsets for this slot (every key explicit, so moving
   *  between slots never leaves a stale offset behind). */
  style: Pick<CSSProperties, "left" | "right" | "top" | "bottom" | "transform">;
  /** The box the pill would occupy here, for the collision check. */
  box: (vw: number, vh: number, w: number, h: number) => Box;
}

/** Candidate slots in preference order. Slot 0 is the original spot. */
export const SLOTS: Slot[] = [
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

/** Anything a child can tap. A floating pill must never sit on one of these. */
const CONTROL_SELECTOR = "button, a[href], [role='button'], input, select, textarea, [data-pd-card], [data-mm-card]";

/**
 * Total area (px²) the box would cover, counting BOTH tappable controls and
 * readable text.
 *
 * Text used to be invisible to this. The check only weighed CONTROL_SELECTOR,
 * so a slot sitting squarely on a sentence scored a clean zero and won on the
 * spot. On six of fifteen sampled boards the pill parked on the on-board
 * instruction strip, which is a plain div and always will be, covering the one
 * line telling the child what to do. It is the line they need most while Sarah
 * is talking.
 *
 * If every slot is covered the least-bad one still wins, so the worst case is
 * the behaviour before any of this existed.
 */
export function coveredArea(box: Box, guard: HTMLElement | null): number {
  let area = 0;
  const overlap = (r: DOMRect | Box) => {
    const ix = Math.max(0, Math.min(box.right, r.right) - Math.max(box.left, r.left));
    const iy = Math.max(0, Math.min(box.bottom, r.bottom) - Math.max(box.top, r.top));
    return ix * iy;
  };
  document.querySelectorAll(CONTROL_SELECTOR).forEach((el) => {
    if (guard && guard.contains(el)) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    // Opacity is deliberately NOT a reason to skip: lesson controls fade in as
    // the narration starts, and skipping them would park the pill on a button
    // that is about to appear.
    const cs = window.getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") return;
    area += overlap(r);
  });

  // Readable text. Measured with a Range rather than the element box, because
  // a short line inside a wide container would otherwise claim the whole
  // width, and intersected with any clipping ancestor, because a clipped
  // element's own rect reports where it WOULD paint, not where it does.
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let node = walk.nextNode(); node; node = walk.nextNode()) {
    const text = (node.textContent || "").trim();
    // Single glyphs and counters are not worth moving the pill for.
    if (text.length < 6) continue;
    const el = node.parentElement;
    if (!el || (guard && guard.contains(el))) continue;
    const cs = window.getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;

    const range = document.createRange();
    range.selectNodeContents(node);
    const r = range.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;

    let clip: Box = { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
    for (let p: HTMLElement | null = el; p && p !== document.body; p = p.parentElement) {
      const pcs = window.getComputedStyle(p);
      if (pcs.overflow === "visible" && pcs.overflowX === "visible" && pcs.overflowY === "visible") continue;
      const pb = p.getBoundingClientRect();
      clip = {
        left: Math.max(clip.left, pb.left),
        top: Math.max(clip.top, pb.top),
        right: Math.min(clip.right, pb.right),
        bottom: Math.min(clip.bottom, pb.bottom),
      };
    }
    const painted: Box = {
      left: Math.max(r.left, clip.left),
      top: Math.max(r.top, clip.top),
      right: Math.min(r.right, clip.right),
      bottom: Math.min(r.bottom, clip.bottom),
    };
    if (painted.right <= painted.left || painted.bottom <= painted.top) continue;
    area += overlap(painted);
  }
  return area;
}

/**
 * Pick the first slot that covers nothing, re-checking as the board settles.
 *
 * Returns null until the first placement, so a caller can render hidden (but
 * measurable) rather than flash in the wrong place.
 */
export function useClearSlot(
  elRef: RefObject<HTMLElement | null>,
  active: boolean,
  guardRef?: RefObject<HTMLElement | null>,
): number | null {
  const [slot, setSlot] = useState<number | null>(null);

  useIsoLayoutEffect(() => {
    if (!active) {
      setSlot(null);
      return;
    }
    const place = () => {
      const el = elRef.current;
      if (!el) return;
      const { width: w, height: h } = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let best = 0;
      let bestArea = Number.POSITIVE_INFINITY;
      for (let i = 0; i < SLOTS.length; i++) {
        const a = coveredArea(SLOTS[i].box(vw, vh, w, h), guardRef?.current ?? null);
        if (a === 0) { best = i; break; }
        if (a < bestArea) { best = i; bestArea = a; }
      }
      setSlot(best);
    };
    place();
    // Lesson content animates in; re-check once it has settled.
    const timers = [350, 900, 1800].map((ms) => window.setTimeout(place, ms));
    window.addEventListener("resize", place);
    // Some boards fill in WHILE the narration is still running, so watch the
    // document for as long as the pill is up. The choice itself is unchanged:
    // it still takes the first slot that covers nothing, so it does not wander.
    let raf = 0;
    const observer = new MutationObserver(() => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(place);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.removeEventListener("resize", place);
      if (raf) cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [active, elRef, guardRef]);

  return slot;
}
