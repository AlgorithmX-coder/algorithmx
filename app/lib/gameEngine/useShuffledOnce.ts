"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

/**
 * useShuffledOnce - the anti-sequence rule (owner mandate 2026-09-11):
 * "whenever we have a drop list or you have to select something, there is
 * never a sequence. Really muddle it up." Every engine that plays its
 * items / rounds / scenarios / answer options in authored order runs the
 * list through this hook so the order is random on every play, but STABLE
 * within a play (no re-shuffle on re-render).
 *
 * Implementation notes:
 * - The shuffle runs in a layout effect after mount, never in a state
 *   initializer, so server and first-client render agree (no hydration
 *   mismatch when a lesson deep-links straight onto an exercise) and the
 *   swap happens before the first paint.
 * - The result is guaranteed to differ from the authored order when the
 *   list has 2+ items (authored data puts things in a teaching order or
 *   a strict alternation, which is exactly the giveaway we are killing).
 * - Pass `enabled: false` where order IS the lesson (a chat transcript,
 *   the beats of one vignette, the steps of a procedure) - the list is
 *   returned untouched.
 *
 * Only shuffles once per mount. If the source list changes identity later
 * (a new round), pass its `key` so the hook re-shuffles for the new list.
 */

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function fisherYates<T>(input: readonly T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const sameOrder = <T,>(a: readonly T[], b: readonly T[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Fisher-Yates that never returns the authored order (for 2+ items). */
export function shuffleAvoidingAuthored<T>(input: readonly T[]): T[] {
  if (input.length < 2) return [...input];
  let out = fisherYates(input);
  for (let tries = 0; tries < 8 && sameOrder(out, input); tries++) out = fisherYates(input);
  if (sameOrder(out, input)) {
    // Degenerate case (all items identical by reference); rotate instead.
    out = [...input.slice(1), input[0]];
  }
  return out;
}

export interface UseShuffledOnceOptions {
  /** false = return the list untouched (order is the lesson). Default true. */
  enabled?: boolean;
  /** Change to re-shuffle for a new list (e.g. the round index). */
  key?: string | number;
}

export function useShuffledOnce<T>(items: readonly T[], options: UseShuffledOnceOptions = {}): T[] {
  const { enabled = true, key } = options;
  const [order, setOrder] = useState<T[]>(() => [...items]);
  const doneFor = useRef<string | number | undefined | symbol>(Symbol("never"));

  useIsoLayoutEffect(() => {
    if (!enabled) return;
    if (doneFor.current === key) return;
    doneFor.current = key;
    setOrder(shuffleAvoidingAuthored(items));
    // Intentionally NOT depending on `items` identity - authored arrays are
    // usually re-created every render; we shuffle once per key.
  }, [enabled, key]);

  return enabled ? order : (items as T[]);
}
