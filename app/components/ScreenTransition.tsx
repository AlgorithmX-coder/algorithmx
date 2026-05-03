"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export type TransitionType = "slideRight" | "slideLeft" | "fadeScale" | "wipeDown";

export interface ScreenTransitionProps {
  children: ReactNode;
  /** Changing this value triggers an exit-then-enter cycle. */
  transitionKey: string | number;
  type?: TransitionType;
  /** Total duration in ms. Exit and enter each take roughly half. Default 400. */
  duration?: number;
  onTransitionStart?: () => void;
  onTransitionEnd?: () => void;
}

type Phase = "idle" | "exiting" | "entering";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const KEYFRAMES = `
@keyframes st-slideRight-out { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(-100%); } }
@keyframes st-slideRight-in  { 0% { opacity: 0; transform: translateX(80px) scale(0.97); } 100% { opacity: 1; transform: translateX(0) scale(1); } }

@keyframes st-slideLeft-out  { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(100%); } }
@keyframes st-slideLeft-in   { 0% { opacity: 0; transform: translateX(-80px) scale(0.97); } 100% { opacity: 1; transform: translateX(0) scale(1); } }

@keyframes st-fadeScale-out  { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.96); } }
@keyframes st-fadeScale-in   { 0% { opacity: 0; transform: scale(1.03); } 100% { opacity: 1; transform: scale(1); } }

@keyframes st-wipeDown-cover  { 0% { transform: translateY(-100%); } 100% { transform: translateY(0); } }
@keyframes st-wipeDown-reveal { 0% { transform: translateY(0); } 100% { transform: translateY(100%); } }
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

export default function ScreenTransition({
  children,
  transitionKey,
  type = "slideRight",
  duration = 400,
  onTransitionStart,
  onTransitionEnd,
}: ScreenTransitionProps) {
  // `displayedChildren` lags behind the children prop during exit so the
  // outgoing layer keeps showing the previous screen until the swap moment.
  const [displayedChildren, setDisplayedChildren] = useState<ReactNode>(children);
  const [outgoingChildren, setOutgoingChildren] = useState<ReactNode>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const firstRunRef = useRef(true);
  const prevKeyRef = useRef(transitionKey);
  const exitTimerRef = useRef<number | null>(null);
  const enterTimerRef = useRef<number | null>(null);

  // Keep handler refs current so we don't restart the effect on function identity changes.
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
    if (transitionKey === prevKeyRef.current) {
      // Live child update on the same key — just swap in place.
      setDisplayedChildren(children);
      return;
    }
    prevKeyRef.current = transitionKey;

    // ── Start exit ──
    if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
    if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);

    setOutgoingChildren(displayedChildren);
    setPhase("exiting");
    startCbRef.current?.();

    // Split timing roughly 50/50 for slide/fade; wipeDown uses a harder cut.
    const exitMs = type === "fadeScale" ? Math.round(duration * 0.5) : Math.round(duration * 0.55);
    const enterMs = duration - exitMs;

    exitTimerRef.current = window.setTimeout(() => {
      setDisplayedChildren(children);
      setOutgoingChildren(null);
      setPhase("entering");
      exitTimerRef.current = null;

      enterTimerRef.current = window.setTimeout(() => {
        setPhase("idle");
        endCbRef.current?.();
        enterTimerRef.current = null;
      }, enterMs);
    }, exitMs);

    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
      if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
    };
    // We intentionally only re-run on transitionKey changes — children updates
    // within the same key flow through the secondary effect above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey]);

  // Children can change without a key change (e.g. parent re-renders). Reflect
  // immediately when idle or entering (new content), never while exiting.
  useEffect(() => {
    if (phase === "idle" || phase === "entering") {
      setDisplayedChildren(children);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const exitMs = type === "fadeScale" ? Math.round(duration * 0.5) : Math.round(duration * 0.55);
  const enterMs = duration - exitMs;

  // Compute per-layer animation strings.
  const incomingAnim = phase === "entering"
    ? `st-${type === "wipeDown" ? "fadeScale" : type}-in ${enterMs}ms ${EASE} both`
    : undefined;
  const outgoingAnim = phase === "exiting" && type !== "wipeDown"
    ? `st-${type}-out ${exitMs}ms ${EASE} both`
    : undefined;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        willChange: "transform, opacity",
        // Bug 1 fix — kill all clicks during exit/enter so the user can't
        // tap a button on a screen that's mid-unmount.  Without this lock
        // the parent fires `navigate()` again, the in-flight transition
        // restarts on the new key, and the user's click occasionally
        // lands on a DOM node that React is removing — silently dropping
        // the event.  400ms of no-clicks is far less jarring than the
        // intermittent dead-clicks the old behaviour produced.
        pointerEvents: phase === "idle" ? undefined : "none",
      }}
    >
      <div
        style={{
          animation: incomingAnim,
          willChange: "transform, opacity",
        }}
      >
        {displayedChildren}
      </div>

      {outgoingChildren && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            animation: outgoingAnim,
            pointerEvents: "none",
            willChange: "transform, opacity",
            opacity: type === "wipeDown" ? 1 : undefined,
          }}
        >
          {outgoingChildren}
        </div>
      )}

      {/* Wipe-down curtain */}
      {type === "wipeDown" && phase !== "idle" && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background: "#04060a",
            zIndex: 10,
            pointerEvents: "none",
            animation:
              phase === "exiting"
                ? `st-wipeDown-cover ${exitMs}ms ease-in both`
                : `st-wipeDown-reveal ${enterMs}ms ease-out both`,
            willChange: "transform",
          }}
        />
      )}
    </div>
  );
}
