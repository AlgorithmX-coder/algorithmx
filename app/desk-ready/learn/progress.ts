import { useEffect, useMemo, useSyncExternalStore } from "react";

/* Desk Ready progress. One list of finished lesson ids ("m2t1") and office
 * job ids ("m5j1") under its own key, so it can never mix with Cyber Pro's
 * `pro:` keys. This browser's storage is the primary store; a signed-in
 * learner's list is also kept on their account (/api/desk/progress), best
 * effort, so it follows them to another computer. Every access is wrapped
 * because storage can be blocked (private windows, cleared site data).
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

function writeDone(ids: string[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage blocked: progress just is not remembered */
  }
  window.dispatchEvent(new Event(EVENT));
}

/* Whether the account answered "signed in" on this page load. Until it
 * does, nothing is sent: a signed-out learner's browser never asks the
 * account to store anything, so their console stays free of refusals. Any
 * id finished before the answer goes up with the next page's sync. */
let signedIn = false;

/* Tell the account, without waiting and without minding if it fails. */
function pushDone(ids: string[]): void {
  if (ids.length === 0 || !signedIn) return;
  void fetch("/api/desk/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) }).catch(() => {});
}

export function markDone(topicId: string): void {
  const done = parseDone(readDoneRaw());
  if (done.includes(topicId)) return;
  writeDone([...done, topicId]);
  pushDone([topicId]);
}

/* What a sync does with the two lists: everything finished anywhere is kept
 * here, and what only this browser knows goes up to the account. */
export function mergeDone(local: readonly string[], server: readonly string[]): { here: string[]; up: string[] } {
  const missingHere = server.filter((id) => !local.includes(id));
  return { here: [...local, ...missingHere], up: local.filter((id) => !server.includes(id)) };
}

/* Once per page load: bring in what the account has finished elsewhere,
 * and send up anything this browser finished before signing in. */
let synced = false;
async function syncDone(): Promise<void> {
  if (synced) return;
  synced = true;
  try {
    const res = await fetch("/api/desk/progress", { cache: "no-store" });
    const body = (await res.json()) as { done?: unknown; signedIn?: boolean };
    if (!body.signedIn) return;
    signedIn = true;
    const server = Array.isArray(body.done) ? body.done.filter((x): x is string => typeof x === "string") : [];
    const local = parseDone(readDoneRaw());
    const { here, up } = mergeDone(local, server);
    if (here.length > local.length) writeDone(here);
    pushDone(up);
  } catch {
    /* offline or signed out: this browser's progress stands */
  }
}

/* The finished ids, live: re-renders when a lesson is finished here, in
 * another tab, or arrives from the account. For client components only. */
export function useDone(): string[] {
  const raw = useSyncExternalStore(subscribeDone, readDoneRaw, serverDoneRaw);
  useEffect(() => {
    void syncDone();
  }, []);
  return useMemo(() => parseDone(raw), [raw]);
}

/* How many of a module's lessons are finished. Topic ids are "<module>t<n>",
 * so "m1t" cannot match "m10t1". */
export function doneIn(done: readonly string[], moduleId: string): number {
  return done.filter((id) => id.startsWith(`${moduleId}t`)).length;
}
