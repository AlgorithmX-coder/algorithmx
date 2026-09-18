"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export type TransitionType = "slideRight" | "slideLeft" | "fadeScale" | "wipeDown";

export interface ScreenTransitionProps {
  children: ReactNode;
  /** Changing this value triggers a cross-fade to the new screen. */
  transitionKey: string | number;
  type?: TransitionType;
  /** Total duration in ms. Default 400. */
  duration?: number;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Only the INCOMING screen animates. The outgoing one is held, fully opaque,
 * underneath until the new screen has finished arriving, so there is never a
 * frame of bare background between two screens (UAT 2026-09-14: "random
 * screens flashing in between").
 */
const KEYFRAMES = `
@keyframes st-slideRight-in { 0% { opacity: 0; transform: translateX(64px) scale(0.985); } 100% { opacity: 1; transform: translateX(0) scale(1); } }
@keyframes st-slideLeft-in  { 0% { opacity: 0; transform: translateX(-64px) scale(0.985); } 100% { opacity: 1; transform: translateX(0) scale(1); } }
@keyframes st-fadeScale-in  { 0% { opacity: 0; transform: scale(1.03); } 100% { opacity: 1; transform: scale(1); } }
/* The curtain used to sit still from 45% to 55%, which read as a blocky stall
   halfway down (UAT W4 4b). It now sweeps through without stopping. */
@keyframes st-wipeDown-curtain { 0% { transform: translateY(-100%); } 50% { transform: translateY(0); } 100% { transform: translateY(100%); } }
`;

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  const id = "ax-screen-transition-keyframes";
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = KEYFRAMES;
  document.head.appendChild(el);
}

type Slot = { key: string | number; node: ReactNode } | null;

/**
 * ScreenTransition — cross-fades between lesson screens.
 *
 * TWO PERSISTENT SLOTS. A screen mounts into one slot and stays in that slot
 * for its whole life, so its mount effects run exactly once.
 *
 * This matters more than it looks. The previous version rendered the outgoing
 * tree a SECOND time in an overlay while the original was still mounted, which
 * remounted that screen mid-transition and re-ran its start-up effects: the
 * ATLAS week-intro briefing built a fresh <audio> element and restarted the
 * clip, which the app's one-voice-at-a-time rule then cut off. That was the
 * "it says something then cuts out" bug (UAT W1-01), plus a ghosted
 * double-image and a duplicate mount of every heavy screen on every advance.
 *
 * It also swapped the trees at the midpoint with no overlap, leaving a visible
 * window of bare page background between screens (UAT W1-02).
 */
export default function ScreenTransition({
  children,
  transitionKey,
  type = "slideRight",
  duration = 400,
  onTransitionStart,
  onTransitionEnd,
}: ScreenTransitionProps) {
  const [slots, setSlots] = useState<[Slot, Slot]>([
    { key: transitionKey, node: children },
    null,
  ]);
  /** Which slot holds the CURRENT screen. The other holds the retiring one. */
  const [front, setFront] = useState<0 | 1>(0);
  const [animating, setAnimating] = useState(false);
  // The container's height as it was the instant before a swap. Held for the
  // whole transition so the retiring screen keeps the exact box it was laid out
  // in: without this, the box shrinks to the INCOMING screen's height (a Learn
  // screen starts as a short title sweep), the leaving card re-centres upward
  // and is clipped, and the child sees a jump before the cross-fade (UAT round
  // 2, W2 item 1g: "the next screen flashing before its time").
  const [holdHeight, setHoldHeight] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const frontRef = useRef<0 | 1>(0);
  const firstRunRef = useRef(true);
  const prevKeyRef = useRef(transitionKey);
  const retireTimerRef = useRef<number | null>(null);

  // Keep handler refs current so we don't restart the effect on identity changes.
  const startCbRef = useRef(onTransitionStart);
  const endCbRef = useRef(onTransitionEnd);
  useEffect(() => { startCbRef.current = onTransitionStart; }, [onTransitionStart]);
  useEffect(() => { endCbRef.current = onTransitionEnd; }, [onTransitionEnd]);

  useEffect(() => {
    ensureKeyframes();
  }, []);

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      prevKeyRef.current = transitionKey;
      return;
    }
    if (transitionKey === prevKeyRef.current) return;
    prevKeyRef.current = transitionKey;

    if (retireTimerRef.current) {
      // A second advance landed mid-transition: retire the older screen now so
      // we never hold three trees at once.
      window.clearTimeout(retireTimerRef.current);
      retireTimerRef.current = null;
    }

    const retiring = frontRef.current;
    const incoming: 0 | 1 = retiring === 0 ? 1 : 0;

    // Measured while the DOM still shows the outgoing screen (this effect runs
    // before the slot swap below commits).
    const h = wrapperRef.current?.offsetHeight ?? 0;
    setHoldHeight(h > 0 ? h : null);

    setSlots((prev) => {
      const next: [Slot, Slot] = [prev[0], prev[1]];
      next[incoming] = { key: transitionKey, node: children };
      return next;
    });
    frontRef.current = incoming;
    setFront(incoming);
    setAnimating(true);
    startCbRef.current?.();

    retireTimerRef.current = window.setTimeout(() => {
      // Drop the old screen only once the new one is fully opaque on top of it,
      // so unmounting it can never expose the background.
      setSlots((prev) => {
        const next: [Slot, Slot] = [prev[0], prev[1]];
        next[retiring] = null;
        return next;
      });
      setAnimating(false);
      setHoldHeight(null);
      retireTimerRef.current = null;
      endCbRef.current?.();
    }, duration);

    return () => {
      if (retireTimerRef.current) {
        window.clearTimeout(retireTimerRef.current);
        retireTimerRef.current = null;
      }
    };
    // Only re-run when the screen actually changes; content updates within the
    // same screen flow through the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey]);

  // The parent can re-render the SAME screen (state changes inside a lesson
  // screen). Refresh the front slot in place: same slot index, so React
  // reconciles rather than remounting.
  useEffect(() => {
    if (transitionKey !== prevKeyRef.current) return;
    setSlots((prev) => {
      const i = frontRef.current;
      if (prev[i] && prev[i]!.node === children) return prev;
      const next: [Slot, Slot] = [prev[0], prev[1]];
      next[i] = { key: transitionKey, node: children };
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const incomingAnim = animating
    ? `st-${type === "wipeDown" ? "fadeScale" : type}-in ${duration}ms ${EASE} both`
    : undefined;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: "relative",
        overflow: "hidden",
        // Never shorter than the screen that is leaving, so its box (and the
        // retiring slot below, which copies this height) cannot shrink mid-fade.
        minHeight: animating && holdHeight ? holdHeight : undefined,
        // Kill all clicks mid-transition so a tap can't land on a screen that is
        // being retired: without this the parent fires navigate() again and the
        // click is silently dropped on a node React is removing.
        pointerEvents: animating ? "none" : undefined,
      }}
    >
      {([0, 1] as const).map((i) => {
        const slot = slots[i];
        if (!slot) return null;
        const isFront = i === front;
        return (
          <div
            key={i}
            aria-hidden={isFront ? undefined : true}
            style={{
              // The current screen is in flow and drives the container height.
              // The retiring one overlays the same box underneath it.
              position: isFront ? "relative" : "absolute",
              // The retiring slot keeps the exact height it had in flow (top-anchored,
              // not inset: 0), so its content is laid out identically while it fades.
              top: isFront ? undefined : 0,
              left: isFront ? undefined : 0,
              right: isFront ? undefined : 0,
              height: isFront ? undefined : holdHeight ?? "100%",
              zIndex: isFront ? 1 : 0,
              animation: isFront ? incomingAnim : undefined,
              pointerEvents: isFront ? undefined : "none",
              willChange: animating ? "transform, opacity" : undefined,
            }}
          >
            {slot.node}
          </div>
        );
      })}

      {/* Boss battle: a black curtain drops over the swap and lifts away. */}
      {type === "wipeDown" && animating && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "#04060a",
            zIndex: 10,
            pointerEvents: "none",
            animation: `st-wipeDown-curtain ${duration}ms ease-in-out both`,
            willChange: "transform",
          }}
        />
      )}
    </div>
  );
}
