"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export type TransitionType =
  | "slideRight"
  | "slideLeft"
  | "fadeScale"
  | "wipeDown"
  | "decrypt";

export interface ScreenTransitionProps {
  children: ReactNode;
  /** Changing this value triggers an exit-then-enter cycle. */
  transitionKey: string | number;
  type?: TransitionType;
  /** Total duration in ms. Exit and enter each take roughly half. Default 400.
   *  (The `decrypt` type overrides this with its own timing so the "decrypting"
   *  beat has room to register.) */
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

/* decrypt: encrypting curtain covers, then lifts as the next screen resolves */
@keyframes st-decrypt-cover   { 0% { opacity: 0; transform: scale(1.02); } 45% { opacity: 1; transform: scale(1); } 100% { opacity: 1; transform: scale(1); } }
@keyframes st-decrypt-reveal  { 0% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(1.05); } }
@keyframes st-decrypt-in      { 0% { opacity: 0; filter: blur(7px) brightness(1.35); transform: scale(1.012); } 55% { opacity: 1; filter: blur(2px) brightness(1.12); transform: scale(1); } 100% { opacity: 1; filter: blur(0) brightness(1); transform: scale(1); } }
@keyframes st-decrypt-scan     { 0% { top: -3%; } 100% { top: 103%; } }
@keyframes st-decrypt-progress { 0% { width: 0%; } 100% { width: 100%; } }
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

/** Exit/enter split per type. `decrypt` runs a touch longer and covers earlier
 *  so the fully-encrypted moment reads before the swap. */
function timingFor(type: TransitionType, baseDuration: number) {
  const dur = type === "decrypt" ? 720 : baseDuration;
  const frac = type === "fadeScale" ? 0.5 : type === "decrypt" ? 0.42 : 0.55;
  const exit = Math.round(dur * frac);
  return { exit, enter: dur - exit };
}

/* ── The encrypting curtain shown during a `decrypt` transition ──
 * A dark panel of scrambling hex/code glyphs with a sweeping cyan scan-bar and
 * a "DECRYPTING" readout. It fades in to cover the outgoing screen, then fades
 * away while the incoming screen resolves from a blur. */
const DECRYPT_ROWS = 9;
const DECRYPT_COLS = 48;
const DECRYPT_CHARSET = "01</>[]{}#$%*+=?ABCDEF0123456789";

function randomRow() {
  let s = "";
  for (let i = 0; i < DECRYPT_COLS; i++) {
    s += DECRYPT_CHARSET[Math.floor(Math.random() * DECRYPT_CHARSET.length)];
  }
  return s;
}

function DecryptCurtain({
  phase,
  exitMs,
  enterMs,
}: {
  phase: "exiting" | "entering";
  exitMs: number;
  enterMs: number;
}) {
  const [rows, setRows] = useState<string[]>(() =>
    Array.from({ length: DECRYPT_ROWS }, randomRow),
  );

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 55) {
        setRows(Array.from({ length: DECRYPT_ROWS }, randomRow));
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const anim =
    phase === "exiting"
      ? `st-decrypt-cover ${exitMs}ms ease-out both`
      : `st-decrypt-reveal ${enterMs}ms ease-in both`;
  const scanMs = exitMs + enterMs;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 10,
        pointerEvents: "none",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at center, #06101f 0%, #04070d 68%, #02040a 100%)",
        animation: anim,
        willChange: "opacity, transform",
      }}
    >
      {/* scrambling code field */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "16px 10px",
          fontFamily: "ui-monospace, 'SF Mono', Menlo, Consolas, monospace",
          fontSize: "clamp(11px, 2.4vw, 16px)",
          lineHeight: 1.3,
          letterSpacing: "0.35em",
          color: "rgba(54, 214, 255, 0.5)",
          textShadow: "0 0 8px rgba(54, 214, 255, 0.4)",
          whiteSpace: "pre",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        {rows.map((r, i) => (
          <div key={i} style={{ opacity: 0.3 + (i % 3) * 0.16 }}>
            {r}
          </div>
        ))}
      </div>

      {/* sweeping scan-bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #7fe9ff, #36d6ff, #7fe9ff, transparent)",
          boxShadow: "0 0 22px 6px rgba(54, 214, 255, 0.5)",
          animation: `st-decrypt-scan ${scanMs}ms linear both`,
        }}
      />

      {/* DECRYPTING readout */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div
            style={{
              fontFamily: "ui-monospace, Menlo, Consolas, monospace",
              letterSpacing: "0.42em",
              fontSize: "clamp(13px, 3vw, 18px)",
              fontWeight: 700,
              color: "#eaf7ff",
              textShadow: "0 0 14px rgba(54, 214, 255, 0.85)",
              paddingLeft: "0.42em",
            }}
          >
            <span style={{ color: "#36d6ff" }}>▓</span> DECRYPTING…
          </div>
          <div
            style={{
              width: "min(46vw, 240px)",
              height: 4,
              borderRadius: 99,
              background: "rgba(54, 214, 255, 0.15)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #36d6ff, #8b6cff)",
                boxShadow: "0 0 12px rgba(54, 214, 255, 0.7)",
                animation: `st-decrypt-progress ${scanMs}ms ease-out both`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
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

  // Respect reduced-motion: fall back from the heavy `decrypt` curtain to a
  // plain fade so we never blast a scrambling full-screen panel at users who
  // asked for calmer motion.
  const [reduced, setReduced] = useState(false);
  const reducedRef = useRef(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mq.matches;
    setReduced(mq.matches);
    const onChange = () => {
      reducedRef.current = mq.matches;
      setReduced(mq.matches);
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

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
      // Live child update on the same key - just swap in place.
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

    const effType: TransitionType =
      reducedRef.current && type === "decrypt" ? "fadeScale" : type;
    const { exit: exitMs, enter: enterMs } = timingFor(effType, duration);

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
    // We intentionally only re-run on transitionKey changes - children updates
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

  const activeType: TransitionType =
    reduced && type === "decrypt" ? "fadeScale" : type;
  const { exit: exitMs, enter: enterMs } = timingFor(activeType, duration);

  // Compute per-layer animation strings. wipeDown + decrypt keep the outgoing
  // screen static and use a covering curtain instead of a slide/fade.
  const usesCurtain = activeType === "wipeDown" || activeType === "decrypt";
  const inName = activeType === "wipeDown" ? "fadeScale" : activeType;
  const incomingAnim =
    phase === "entering" ? `st-${inName}-in ${enterMs}ms ${EASE} both` : undefined;
  const outgoingAnim =
    phase === "exiting" && !usesCurtain
      ? `st-${activeType}-out ${exitMs}ms ${EASE} both`
      : undefined;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        willChange: "transform, opacity",
        // Kill all clicks during exit/enter so the user can't tap a button on a
        // screen that's mid-unmount (see history for the dead-click bug).
        pointerEvents: phase === "idle" ? undefined : "none",
      }}
    >
      <div
        style={{
          animation: incomingAnim,
          willChange: "transform, opacity, filter",
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
            opacity: usesCurtain ? 1 : undefined,
          }}
        >
          {outgoingChildren}
        </div>
      )}

      {/* Wipe-down curtain */}
      {activeType === "wipeDown" && phase !== "idle" && (
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

      {/* Decrypt curtain */}
      {activeType === "decrypt" && phase !== "idle" && (
        <DecryptCurtain
          phase={phase === "exiting" ? "exiting" : "entering"}
          exitMs={exitMs}
          enterMs={enterMs}
        />
      )}
    </div>
  );
}
