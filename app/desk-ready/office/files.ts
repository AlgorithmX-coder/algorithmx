import { PEOPLE, YOU } from "./northfield";
import { pathText, samePath, type AccessGrant, type Email, type OfficeFile, type OfficeState, type Path, type Person, type RecycledItem, type ShareLink, type ShareRole, type WordDoc } from "./types";
import { para } from "./word";

/* ── Module 9: Files and sharing ──────────────────────────────────────────
 * What OneDrive and SharePoint do with a file beyond opening it: the
 * Recycle bin, version history, and sharing (who can open it, and how).
 * Pure functions over the office record, so the apps, the lesson labs and
 * the job checks all agree on one answer to "who can open this?". */

export const COMPANY = "Northfield Supplies";
const DOMAIN = "@northfieldsupplies.example";

export const isColleague = (p: Person) => p.address.endsWith(DOMAIN);

/* Everyone the Share box suggests: the Northfield directory. Someone
 * outside can still be typed in full, and the box warns about them. */
export const DIRECTORY: Person[] = [PEOPLE.daniel, PEOPLE.sarah, PEOPLE.priya, PEOPLE.emma];

/* The members of each SharePoint site: they can open (and edit) everything
 * on it without being given a link. Everyone else needs the file shared
 * with them. HR's site lets every colleague look, but only HR edit. */
export const SITE_MEMBERS: Record<string, Person[]> = {
  "Operations Team": [PEOPLE.daniel, PEOPLE.sarah, YOU],
  Finance: [PEOPLE.priya, PEOPLE.daniel, YOU],
  HR: [PEOPLE.emma],
};

const same = (a: Person, b: Person) => a.address.toLowerCase() === b.address.toLowerCase();

/* Who can open a file, and what they can do: "edit", "view" or null. */
export function accessFor(f: OfficeFile, p: Person): ShareRole | null {
  const roles: ShareRole[] = [];
  const site = f.path[0];
  if (site === "OneDrive") {
    if (same(p, YOU)) roles.push("edit");
  } else if (SITE_MEMBERS[site]?.some((m) => same(m, p))) roles.push("edit");
  else if (site === "HR" && isColleague(p)) roles.push("view");
  for (const g of f.access ?? []) if (same(g.person, p)) roles.push(g.role);
  for (const l of f.shareLinks ?? []) {
    const works = l.scope === "anyone" || (l.scope === "org" && isColleague(p)) || (l.scope === "people" && l.people.some((x) => same(x, p)));
    if (works) roles.push(l.role);
  }
  return roles.includes("edit") ? "edit" : roles.includes("view") ? "view" : null;
}

/* A link that lets more people in than the ones named: anyone at
 * Northfield, or anyone at all. */
export const wideLinks = (f: OfficeFile) => (f.shareLinks ?? []).filter((l) => l.scope === "org" || l.scope === "anyone");

export const isShared = (f: OfficeFile) => (f.access?.length ?? 0) > 0 || (f.shareLinks?.length ?? 0) > 0;

export const SCOPE_LABEL: Record<ShareLink["scope"], string> = {
  anyone: "Anyone",
  org: `People in ${COMPANY}`,
  existing: "People with existing access",
  people: "Specific people",
};

/* What a link's settings say, the way the Copy link box words them. */
export function linkSentence(scope: ShareLink["scope"], role: ShareRole, people: Person[] = []) {
  const can = role === "edit" ? "can edit" : "can view";
  if (scope === "anyone") return `Anyone with the link ${can}`;
  if (scope === "org") return `People in ${COMPANY} with the link ${can}`;
  if (scope === "existing") return "Only people with existing access";
  return people.length ? `${people.map((p) => p.name).join(", ")} ${can}` : `Only the people you choose ${can}`;
}

const siteSlug = (p: Path) => (p[0] === "OneDrive" ? "personal/you" : `sites/${p[0].toLowerCase().replace(/\s+/g, "")}`);
const kindCode = (f: OfficeFile) => (f.kind === "xlsx" || f.kind === "xltx" ? "x" : f.kind === "docx" || f.kind === "dotx" ? "w" : "b");
export const linkUrl = (f: OfficeFile, id: string) => `https://northfield.sharepoint.example/:${kindCode(f)}:/${siteSlug(f.path)}/${id.replace(/[^a-z0-9]/gi, "").slice(-10)}`;

const LINK_RE = /https:\/\/northfield\.sharepoint\.example\/:[a-z]:\/[a-z/]+\/([a-z0-9]+)/gi;

/* The files a sent email links to: Insert link chips, and sharing links
 * pasted into the message as text. */
export function linkedFiles(s: OfficeState, e: Email): OfficeFile[] {
  const out: OfficeFile[] = [];
  for (const l of e.links) {
    const f = s.files.find((x) => samePath(x.path, l.path) && x.name === l.fileName);
    if (f) out.push(f);
  }
  for (const m of e.body.matchAll(LINK_RE)) {
    const f = s.files.find((x) => (x.shareLinks ?? []).some((l) => l.url.endsWith(m[1])));
    if (f && !out.includes(f)) out.push(f);
  }
  return out;
}

/* The sharing links pasted into an email, with the file each opens. */
export function pastedLinks(s: OfficeState, e: Email): { file: OfficeFile; link: ShareLink }[] {
  const out: { file: OfficeFile; link: ShareLink }[] = [];
  for (const m of e.body.matchAll(LINK_RE))
    for (const f of s.files) {
      const link = (f.shareLinks ?? []).find((l) => l.url.endsWith(m[1]));
      if (link) out.push({ file: f, link });
    }
  return out;
}

/* ── sharing ─────────────────────────────────────────────────────────── */

/* Ids made here, not in ./store, so the job checks (which a server page
 * imports) never pull in React. */
let counter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-m9${(counter++).toString(36)}`;

const mapFile = (s: OfficeState, id: string, fn: (f: OfficeFile) => OfficeFile): OfficeState => ({ ...s, files: s.files.map((f) => (f.id === id ? fn(f) : f)) });

/* Share by name, as the Share box's Send does: each person gets access to
 * this file only, and an email from you with a link to it. */
export function shareWith(s: OfficeState, fileId: string, people: Person[], role: ShareRole, message: string, time = "Just now"): OfficeState {
  const f = s.files.find((x) => x.id === fileId);
  if (!f || !people.length) return s;
  const grants: AccessGrant[] = [...(f.access ?? []).filter((g) => !people.some((p) => same(p, g.person))), ...people.map((person) => ({ person, role }))];
  const can = role === "edit" ? "edit" : "view";
  const email: Email = {
    id: newId("mail"),
    folder: "sent",
    from: YOU,
    to: people,
    cc: [],
    subject: `You shared "${f.name}"`,
    body: `${message.trim() ? `${message.trim()}\n\n` : ""}I've shared "${f.name}" with you. You can ${can} it.\n\nOpen it from the link above. It's in ${pathText(f.path)}.`,
    time,
    attachments: [],
    links: [{ name: f.name, path: f.path, fileName: f.name }],
  };
  return { ...mapFile(s, fileId, (x) => ({ ...x, access: grants })), emails: [...s.emails, email] };
}

/* Copy link: makes a link with the chosen settings, or hands back the one
 * already made with the same settings, as OneDrive does. */
export function makeLink(s: OfficeState, fileId: string, scope: ShareLink["scope"], role: ShareRole, people: Person[] = []): { state: OfficeState; link: ShareLink | null } {
  const f = s.files.find((x) => x.id === fileId);
  if (!f) return { state: s, link: null };
  const key = (l: Pick<ShareLink, "scope" | "role" | "people">) => `${l.scope}|${l.scope === "existing" ? "" : l.role}|${l.people.map((p) => p.address).sort().join(",")}`;
  const want = key({ scope, role, people });
  const had = (f.shareLinks ?? []).find((l) => key(l) === want);
  if (had) return { state: s, link: had };
  const id = newId("lnk");
  const link: ShareLink = { id, scope, role: scope === "existing" ? "view" : role, people: scope === "people" ? people : [], url: linkUrl(f, id) };
  return { state: mapFile(s, fileId, (x) => ({ ...x, shareLinks: [...(x.shareLinks ?? []), link] })), link };
}

/* Keep a link made by makeLink on its file (once). */
export const keepLink = (s: OfficeState, fileId: string, link: ShareLink) => mapFile(s, fileId, (f) => ((f.shareLinks ?? []).some((l) => l.id === link.id) ? f : { ...f, shareLinks: [...(f.shareLinks ?? []), link] }));

export const removeGrant =(s: OfficeState, fileId: string, p: Person) => mapFile(s, fileId, (f) => ({ ...f, access: (f.access ?? []).filter((g) => !same(g.person, p)) }));
export const setGrant = (s: OfficeState, fileId: string, p: Person, role: ShareRole) => mapFile(s, fileId, (f) => ({ ...f, access: (f.access ?? []).map((g) => (same(g.person, p) ? { ...g, role } : g)) }));
export const removeLink = (s: OfficeState, fileId: string, linkId: string) => mapFile(s, fileId, (f) => ({ ...f, shareLinks: (f.shareLinks ?? []).filter((l) => l.id !== linkId) }));

/* ── version history ─────────────────────────────────────────────────── */

/* Every version, newest first, with the current one on top. */
export function versionsOf(f: OfficeFile): { no: string; modified: string; by: string; current: boolean; index: number; comment?: string }[] {
  const old = f.versions ?? [];
  const currentNo = `${old.length + 1}.0`;
  return [{ no: currentNo, modified: f.modified, by: f.by, current: true, index: -1, comment: f.restoredFrom ? `Restored from version ${f.restoredFrom}` : undefined }, ...old.map((v, i) => ({ no: v.no, modified: v.modified, by: v.by, current: false, index: i, comment: v.comment })).reverse()];
}

/* Restore: the chosen version's contents become a new, current version,
 * and what was current is kept in the history, as SharePoint does. */
export function restoreVersion(s: OfficeState, fileId: string, index: number, when = "Today, just now"): OfficeState {
  return mapFile(s, fileId, (f) => {
    const v = f.versions?.[index];
    if (!v) return f;
    const was = { no: `${(f.versions?.length ?? 0) + 1}.0`, modified: f.modified, by: f.by, sheet: f.sheet, tabs: f.tabs, doc: f.doc, paper: f.paper, comment: f.restoredFrom ? `Restored from version ${f.restoredFrom}` : undefined };
    return { ...f, sheet: v.sheet, tabs: v.tabs, doc: v.doc, paper: v.paper, modified: when, by: "You", versions: [...(f.versions ?? []), was], restoredFrom: v.no };
  });
}

/* ── the Recycle bin ─────────────────────────────────────────────────── */

const insideOf = (f: OfficeFile, folder: Path) => f.path.length >= folder.length && folder.every((x, i) => f.path[i] === x);

/* Delete: the file (and, for a folder, everything in it) goes to the
 * Recycle bin, not away for ever. */
export function recycle(s: OfficeState, id: string, when = "Today, just now"): OfficeState {
  const target = s.files.find((f) => f.id === id);
  if (!target) return s;
  const folder: Path = [...target.path, target.name];
  const inside = target.kind === "folder" ? s.files.filter((f) => insideOf(f, folder)) : [];
  const item: RecycledItem = { id: newId("bin"), file: target, inside, deleted: when };
  return { ...s, files: s.files.filter((f) => f !== target && !inside.includes(f)), recycle: [...(s.recycle ?? []), item] };
}

/* Restore: back where it was. If its folder has gone, the folder comes
 * back too (an empty one), and a name already taken gets " (1)". */
export function restoreItem(s: OfficeState, binId: string): OfficeState {
  const item = s.recycle?.find((r) => r.id === binId);
  if (!item) return s;
  const files = [...s.files];
  /* bring back any missing folders on the way */
  for (let i = 2; i <= item.file.path.length; i++) {
    const p = item.file.path.slice(0, i);
    const parent = p.slice(0, -1);
    const name = p[p.length - 1];
    if (!files.some((f) => f.kind === "folder" && samePath(f.path, parent) && f.name === name)) files.push({ id: newId("dir"), path: parent, name, kind: "folder", modified: "Today, just now", by: "You" });
  }
  let name = item.file.name;
  const taken = (n: string) => files.some((f) => samePath(f.path, item.file.path) && f.name.toLowerCase() === n.toLowerCase());
  if (taken(name)) {
    const dot = item.file.kind === "folder" ? -1 : name.lastIndexOf(".");
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    let n = 1;
    while (taken(`${stem} (${n})${ext}`)) n++;
    name = `${stem} (${n})${ext}`;
  }
  const from: Path = [...item.file.path, item.file.name];
  const to: Path = [...item.file.path, name];
  const back = [{ ...item.file, name }, ...item.inside.map((f) => ({ ...f, path: [...to, ...f.path.slice(from.length)] }))];
  return { ...s, files: [...files, ...back], recycle: (s.recycle ?? []).filter((r) => r.id !== binId) };
}

/* ── a PDF made from what a sheet shows ──────────────────────────────── */

/* Excel's Export > Create PDF prints what is on show: the headings and the
 * rows the filter leaves, with the empty columns at the right left off. */
export function pdfOfRows(rows: string[][]): WordDoc {
  const used = rows.reduce((n, r) => Math.max(n, r.reduce((m, c, i) => (c.trim() ? i + 1 : m), 0)), 0);
  const table = rows.filter((r) => r.some((c) => c.trim())).map((r) => r.slice(0, used).map((c) => c.trim()));
  return { blocks: [{ ...para(""), table }], footer: "Page 1 of 1" };
}

/* The rows of a PDF made from a sheet: the table's data, heading row off. */
export const pdfRows = (doc?: WordDoc): string[][] => doc?.blocks.find((b) => b.table)?.table?.slice(1) ?? [];
export const pdfHead = (doc?: WordDoc): string[] => doc?.blocks.find((b) => b.table)?.table?.[0] ?? [];
