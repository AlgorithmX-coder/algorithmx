import { useEffect, useReducer } from "react";
import { samePath, type Email, type Job, type OfficeFile, type OfficeState, type Path } from "./types";

/* The office record for one job, kept in this browser like the rest of
 * Desk Ready's progress (server sync is a follow-up). It lives under its own
 * key per job, so starting again on one job never touches another. Read
 * once when the office mounts (the office renders on the client only), and
 * written back on every change. Storage can be blocked, so every access is
 * wrapped: the office still works, it just is not remembered. */

const VERSION = 1;
const key = (job: Job) => `desk:office:${job.id}`;

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
  | { type: "reset"; state: OfficeState };

let counter = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/* Everything inside a folder, at any depth. */
const inside = (f: OfficeFile, folder: Path) => f.path.length >= folder.length && folder.every((x, i) => f.path[i] === x);
const folderPath = (f: OfficeFile): Path => [...f.path, f.name];

function reducer(s: OfficeState, a: Action): OfficeState {
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

export function useOffice(job: Job) {
  const [state, dispatch] = useReducer(reducer, job, load);
  useEffect(() => {
    try {
      window.localStorage.setItem(key(job), JSON.stringify(state));
    } catch {
      /* not remembered, still works */
    }
  }, [job, state]);
  const reset = () => dispatch({ type: "reset", state: { ...job.seed(), version: VERSION } });
  return { state, dispatch, reset };
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
