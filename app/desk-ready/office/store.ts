import { useEffect, useReducer, useRef } from "react";
import { samePath, type Email, type Job, type OfficeFile, type OfficeState, type Path } from "./types";

/* The office record for one job, kept in this browser like the rest of
 * Desk Ready's progress. It lives under its own key per job, so starting
 * again on one job never touches another. Read once when the office mounts
 * (the office renders on the client only), and written back on every
 * change. Storage can be blocked, so every access is wrapped: the office
 * still works, it just is not remembered.
 *
 * A signed-in learner's office is also kept on their account
 * (/api/desk/office/[job]), best effort: on opening, the newer of the two
 * copies wins, and changes go up a moment after they happen. */

const VERSION = 1;
const key = (job: Job) => `desk:office:${job.id}`;
/* ── Final task ── the same key and version, for the pages outside the
 * office (the final task's start page and scorecard) that read the record. */
export const officeKey = (jobId: string) => `desk:office:${jobId}`;
export const OFFICE_VERSION = VERSION;

export type Action =
  | { type: "saveFile"; file: OfficeFile }
  | { type: "rename"; id: string; name: string }
  | { type: "move"; id: string; to: Path }
  | { type: "delete"; id: string }
  | { type: "newFolder"; path: Path; name: string }
  | { type: "read"; id: string }
  | { type: "moveMail"; id: string; folder: string }
  | { type: "flag"; id: string }
  | { type: "report"; id: string }
  | { type: "clickLink"; id: string }
  | { type: "send"; email: Email }
  /* Any other change, made by an app's own function (apps/registry). */
  | { type: "update"; fn: (s: OfficeState) => OfficeState }
  | { type: "reset"; state: OfficeState };

let counter = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/* Everything inside a folder, at any depth. */
const inside = (f: OfficeFile, folder: Path) => f.path.length >= folder.length && folder.every((x, i) => f.path[i] === x);
const folderPath = (f: OfficeFile): Path => [...f.path, f.name];

/* Every change is stamped, so the newer copy wins when the account's copy
 * and this browser's copy differ. A reset brings its own stamp. */
function reducer(s: OfficeState, a: Action): OfficeState {
  return a.type === "reset" ? a.state : { ...apply(s, a), savedAt: Date.now() };
}

/* ── Module 9 ── exported so a lesson lab can run the office's own rules on a practice record. */
export function apply(s: OfficeState, a: Action): OfficeState {
  switch (a.type) {
    case "saveFile": {
      const others = s.files.filter((f) => f.id !== a.file.id);
      return { ...s, files: [...others, a.file] };
    }
    case "rename": {
      const target = s.files.find((f) => f.id === a.id);
      if (!target) return s;
      const from = folderPath(target);
      const to = [...target.path, a.name];
      return {
        ...s,
        files: s.files.map((f) => {
          if (f.id === a.id) return { ...f, name: a.name, modified: "Today, just now", by: "You" };
          /* renaming a folder carries everything inside it along */
          if (target.kind === "folder" && inside(f, from)) return { ...f, path: [...to, ...f.path.slice(from.length)] };
          return f;
        }),
      };
    }
    case "move": {
      const target = s.files.find((f) => f.id === a.id);
      if (!target) return s;
      const from = folderPath(target);
      return {
        ...s,
        files: s.files.map((f) => {
          if (f.id === a.id) return { ...f, path: a.to, modified: "Today, just now", by: "You" };
          if (target.kind === "folder" && inside(f, from)) return { ...f, path: [...a.to, target.name, ...f.path.slice(from.length)] };
          return f;
        }),
      };
    }
    case "delete": {
      const target = s.files.find((f) => f.id === a.id);
      if (!target) return s;
      const from = folderPath(target);
      return { ...s, files: s.files.filter((f) => f.id !== a.id && !(target.kind === "folder" && inside(f, from))) };
    }
    case "newFolder":
      return { ...s, files: [...s.files, { id: newId("dir"), path: a.path, name: a.name, kind: "folder", modified: "Today, just now", by: "You" }] };
    case "read":
      return { ...s, emails: s.emails.map((e) => (e.id === a.id ? { ...e, unread: false } : e)) };
    case "moveMail":
      return { ...s, emails: s.emails.map((e) => (e.id === a.id ? { ...e, folder: a.folder } : e)) };
    case "flag":
      return { ...s, emails: s.emails.map((e) => (e.id === a.id ? { ...e, flagged: !e.flagged } : e)) };
    case "report":
      return { ...s, emails: s.emails.map((e) => (e.id === a.id ? { ...e, reported: true, folder: "junk", flagged: false } : e)) };
    case "clickLink":
      return { ...s, emails: s.emails.map((e) => (e.id === a.id ? { ...e, clicked: true } : e)) };
    case "send":
      return { ...s, emails: [...s.emails, a.email] };
    case "update":
      return a.fn(s);
    case "reset":
      return a.state;
  }
}

function load(job: Job): OfficeState {
  try {
    const raw = window.localStorage.getItem(key(job));
    if (raw) {
      const saved = JSON.parse(raw) as OfficeState;
      if (saved?.version === VERSION && Array.isArray(saved.files) && Array.isArray(saved.emails)) return saved;
    }
  } catch {
    /* storage blocked or the record is damaged: start fresh */
  }
  return { ...job.seed(), version: VERSION };
}

/* On opening, which copy wins: the account's when it is newer ("down"),
 * this browser's when it is newer and signed in ("up"), else nothing. */
export function newerCopy(local: OfficeState, server: unknown, signedIn: boolean): "down" | "up" | null {
  const theirs = isOffice(server) ? server : null;
  if (theirs && (theirs.savedAt ?? 0) > (local.savedAt ?? 0)) return "down";
  if (signedIn && (local.savedAt ?? 0) > (theirs?.savedAt ?? 0)) return "up";
  return null;
}

const isOffice = (x: unknown): x is OfficeState => {
  const s = x as OfficeState | null;
  return !!s && s.version === VERSION && Array.isArray(s.files) && Array.isArray(s.emails);
};

export function useOffice(job: Job) {
  const [state, dispatch] = useReducer(reducer, job, load);
  const latest = useRef(state);
  /* null until the account has answered; then whether to keep it in step */
  const signedIn = useRef<boolean | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const url = `/api/desk/office/${job.id}`;

  useEffect(() => {
    let gone = false;
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((body: { state?: unknown; signedIn?: boolean }) => {
        if (gone) return;
        signedIn.current = !!body.signedIn;
        const which = newerCopy(latest.current, body.state, signedIn.current);
        if (which === "down" && isOffice(body.state)) dispatch({ type: "reset", state: body.state });
        else if (which === "up") push(url, latest.current);
      })
      .catch(() => {
        signedIn.current = false;
      });
    return () => {
      gone = true;
    };
  }, [url]);

  useEffect(() => {
    latest.current = state;
    try {
      window.localStorage.setItem(key(job), JSON.stringify(state));
    } catch {
      /* not remembered, still works */
    }
    if (!signedIn.current) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => push(url, state), 1500);
  }, [job, state, url]);

  /* ── Final task ── `keep` carries something from the old record into the
   * fresh one (a timed job's earlier scorecards). */
  const reset = (keep?: (fresh: OfficeState) => OfficeState) => {
    const fresh: OfficeState = { ...job.seed(), version: VERSION, savedAt: Date.now() };
    dispatch({ type: "reset", state: keep ? keep(fresh) : fresh });
  };
  return { state, dispatch, reset };
}

function push(url: string, state: OfficeState): void {
  void fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ state }) }).catch(() => {});
}

/* What sits directly in a folder: folders first, then files, by name. */
export function listFolder(s: OfficeState, path: Path): OfficeFile[] {
  return s.files
    .filter((f) => samePath(f.path, path))
    .sort((a, b) => (a.kind === "folder") === (b.kind === "folder") ? a.name.localeCompare(b.name, "en-GB", { numeric: true }) : a.kind === "folder" ? -1 : 1);
}

export function folderExists(s: OfficeState, path: Path): boolean {
  if (path.length <= 1) return true; // a root (OneDrive, a SharePoint site) always exists
  return s.files.some((f) => f.kind === "folder" && samePath(f.path, path.slice(0, -1)) && f.name === path[path.length - 1]);
}
