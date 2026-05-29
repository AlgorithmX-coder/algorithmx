"use client";

/**
 * Visibility- and pause-aware requestAnimationFrame hook.
 *
 * Existing exercises start a raw rAF loop in useEffect and let it run
 * forever, even when the tab is hidden. Background tabs are throttled
 * by the browser to ~1Hz, but the loop still fires - it just delivers
 * huge dt jumps that break tween-based animations on re-focus.
 *
 * This hook:
 *   - Calls back with `(dt, t)` where dt is clamped to a sensible
 *     maximum (no 30-second jumps after tab switch).
 *   - Pauses automatically when `document.hidden` is true.
 *   - Pauses when the `paused` option is true (e.g. wrong-answer panel
 *     is open).
 *   - Cancels cleanly on unmount.
 *
 * Usage:
 *   useRafLoop((dt, t) => { ... draw ... }, {
 *     paused: showingPanel,
 *     idleWhenHidden: true,
 *   });
 */

import { useEffect, useRef } from "react";

export interface RafLoopOptions {
  /** Pause the loop when truthy. */
  paused?: boolean;
  /** Stop ticking when the tab is hidden. Default true. */
  idleWhenHidden?: boolean;
  /** Maximum dt (ms) delivered to the callback. Default 50. */
  maxDt?: number;
}

export function useRafLoop(
  callback: (dt: number, t: number) => void,
  options: RafLoopOptions = {}
): void {
  const { paused = false, idleWhenHidden = true, maxDt = 50 } = options;

  // Pin the callback in a ref so changing it doesn't restart the loop.
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let stopped = false;

    const onVisibility = () => {
      if (idleWhenHidden && document.hidden) {
        // Will resume when visibility flips back; reset lastTime so the
        // first frame after resume doesn't deliver a huge dt.
        lastTime = performance.now();
      }
    };

    const tick = (now: number) => {
      if (stopped) return;
      const hidden = idleWhenHidden && typeof document !== "undefined" && document.hidden;
      if (pausedRef.current || hidden) {
        // Don't update lastTime while paused so dt resumes from the
        // current frame, not from when the pause started.
        lastTime = now;
      } else {
        const dt = Math.min(maxDt, now - lastTime);
        lastTime = now;
        try {
          callbackRef.current(dt, now);
        } catch (err) {
          // Never let one bad frame kill the loop.
          // eslint-disable-next-line no-console
          console.error("[useRafLoop] tick threw:", err);
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    if (idleWhenHidden && typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibility);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      stopped = true;
      cancelAnimationFrame(rafId);
      if (idleWhenHidden && typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
    };
  }, [idleWhenHidden, maxDt]);
}
