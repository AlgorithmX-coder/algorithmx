import { useMemo, useSyncExternalStore } from "react";

/* Desk Ready progress, in this browser for the pilot. One list of finished
 * topic ids under its own key, so it can never mix with Cyber Pro's
 * `pro:` keys. Topic ids are unique across the course ("m2t1"). Server
 * sync is a follow-up; every access is wrapped because storage can be
 * blocked (private windows, cleared site data).
 *
 * Read through useSyncExternalStore: subscribe + a raw-string snapshot
 * (a primitive, so React can compare it), "[]" on the server. */

const KEY = "desk:done";
const EVENT = "desk:progress";

export function subscribeDone(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

export function readDoneRaw(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

export const serverDoneRaw = () => "[]";

export function parseDone(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function markDone(topicId: string): void {
  const done = parseDone(readDoneRaw());
  if (done.includes(topicId)) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...done, topicId]));
  } catch {
    /* storage blocked: progress just is not remembered */
  }
  window.dispatchEvent(new Event(EVENT));
}

/* The finished topic ids, live: re-renders when a lesson is finished here
 * or in another tab. For client components only. */
export function useDone(): string[] {
  const raw = useSyncExternalStore(subscribeDone, readDoneRaw, serverDoneRaw);
  return useMemo(() => parseDone(raw), [raw]);
}

/* How many of a module's lessons are finished. Topic ids are "<module>t<n>",
 * so "m1t" cannot match "m10t1". */
export function doneIn(done: readonly string[], moduleId: string): number {
  return done.filter((id) => id.startsWith(`${moduleId}t`)).length;
}
