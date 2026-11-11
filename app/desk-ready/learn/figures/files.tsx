"use client";

import type { CSSProperties, ReactNode } from "react";
import { Ico } from "../../office/apps/Explorer";
import { scopeIcon, ShareIcon } from "../../office/apps/Share";
import { SharedMark } from "../../office/places";
import { FileGlyph } from "../../office/ui";
import type { FileKind } from "../../office/types";
import { W } from "../../tokens";
import { FigureFrame, Part, type PartInfo } from "./parts";

/* Files and sharing, drawn the way they look, with every part numbered
 * (Module 9): a whole team folder in File Explorer with SharePoint's
 * command bar; a messy folder beside a tidy one; the house rule for a file
 * name, part by part; OneDrive, a SharePoint site and Teams' Files tab side
 * by side; a link and an attachment; Excel making a PDF of the rows on
 * show; the Share box, its link settings and Manage access; and Version
 * history. A lesson opens on one whole picture; later cards pass `focus`
 * to light only the parts they teach, and `what` to say what a part means
 * there. Every icon is the office's own, so the picture matches the app. */

/* Text that must not break across lines: a date (2026-11-10), a code
 * (DN-77790, PO 3312), a short path (Documents > Drafts) or a file name
 * (2026-11-06 Delivery report.xlsx). Hyphens become non-breaking hyphens
 * and the spaces inside become non-breaking spaces. */
const NBH = "\u2011";
const NBS = "\u00a0";
export function keep(text: string): string {
  return text
    .replace(/(\d{4})-(\d{2})-(\d{2})/g, `$1${NBH}$2${NBH}$3`)
    .replace(/\b([A-Z]{2,3})-(\d{2,})/g, `$1${NBH}$2`)
    .replace(/\bsign-in\b/g, `sign${NBH}in`)
    .replace(/\b(PO|NS) (\d{3,})/g, `$1${NBS}$2`)
    .replace(/ ([>›]) /g, `${NBS}$1${NBS}`)
    .replace(/\d{4}\u2011\d{2}\u2011\d{2}(?: [\w\u2011'()]+)+?\.(?:xlsx|xltx|pdf|docx|dotx)\b/g, (m) => m.replace(/ /g, NBS))
    .replace(/\b([A-Z][a-z]+) ([A-Z][a-z]+\.(?:xlsx|docx|pdf))\b/g, `$1${NBS}$2`);
}

type What<K extends string> = Partial<Record<K, string>>;
function withWhat<K extends string>(base: Record<K, PartInfo>, what?: What<K>, renumber?: Partial<Record<K, number>>): Record<K, PartInfo> {
  const info = { ...base };
  for (const k of Object.keys(what ?? {}) as K[]) info[k] = { ...info[k], what: what![k]! };
  for (const k of Object.keys(renumber ?? {}) as K[]) info[k] = { ...info[k], n: renumber![k]! };
  for (const k of Object.keys(info) as K[]) info[k] = { ...info[k], name: keep(info[k].name), what: keep(info[k].what) };
  return info;
}

const frame: CSSProperties = { borderRadius: 8, boxShadow: W.float, border: `1px solid ${W.edge}`, overflow: "visible", background: W.page, color: W.ink, fontFamily: W.font };
const bar = (bg: string, children: ReactNode, radius = "8px 8px 0 0") => <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "0 12px", background: bg, color: "#fff", fontSize: 13.5, borderRadius: radius }}>{children}</div>;
const cmd = (icon: ReactNode, label: string) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, minHeight: 32, padding: "2px 3px", borderRadius: 5, fontSize: 12.5, whiteSpace: "nowrap" }}>
    <span style={{ display: "inline-flex", color: W.outlook }}>{icon}</span>
    {label}
  </span>
);
const sep = <span style={{ width: 1, alignSelf: "stretch", background: W.edge, margin: "2px 0" }} />;
const siteTile = (label: string, size = 20) => (
  <span aria-hidden style={{ width: size, height: size, borderRadius: 5, background: "#03787c", color: "#fff", fontSize: size * 0.45, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
    {label
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)}
  </span>
);
const folderIcon = (size = 18) => <FileGlyph kind="folder" size={size} />;
const line = (icon: ReactNode, text: ReactNode, extra?: ReactNode, style?: CSSProperties) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 32, padding: "0 6px", fontSize: 13.5, ...style }}>
    {icon}
    <span style={{ minWidth: 0 }}>{text}</span>
    {extra}
  </div>
);

/* ── 1. a whole team folder, with SharePoint's command bar ────────────── */

export type LibraryPart = "places" | "path" | "newfolder" | "upload" | "share" | "copylink" | "moveto" | "rename" | "delete" | "history" | "folder" | "file" | "shared" | "modified" | "by" | "bin";

export const LIBRARY_PARTS: Record<LibraryPart, PartInfo> = {
  places: { n: 1, name: "Places", what: "Your own OneDrive at the top, then the SharePoint sites of the teams you're in: Operations Team, Finance, HR." },
  path: { n: 2, name: "Where you are", what: "The folder you're in, and the folders it sits inside, left to right. Click any step to go back to it." },
  newfolder: { n: 3, name: "New folder", what: "Makes an empty folder in the folder you're in, ready to name." },
  upload: { n: 4, name: "Upload", what: "Puts a copy of a file from your own computer into this folder." },
  share: { n: 5, name: "Share", what: "Lets named people open the selected file, and emails them a link to it." },
  copylink: { n: 6, name: "Copy link", what: "Copies a link to the selected file, to paste into an email or a chat." },
  moveto: { n: 7, name: "Move to", what: "Moves the selected file or folder somewhere else. You can also drag it onto a folder." },
  rename: { n: 8, name: "Rename", what: "Gives the selected file or folder a new name. F2 on the keyboard does the same." },
  delete: { n: 9, name: "Delete", what: "Sends the selected file to the Recycle bin, not away for ever." },
  history: { n: 10, name: "Version history", what: "Every saved version of the selected file, with who saved it and when. You can bring an old one back." },
  folder: { n: 11, name: "A folder", what: "Holds files, and other folders. Double-click it to go in." },
  file: { n: 12, name: "A file", what: "Its icon says what kind it is: green for Excel, blue for Word, red for PDF. Double-click it to open it." },
  shared: { n: 13, name: "Shared", what: "This file has been shared with someone outside the team, or has a link." },
  modified: { n: 14, name: "Modified", what: "When it was last saved." },
  by: { n: 15, name: "Modified by", what: "Who saved it last." },
  bin: { n: 16, name: "Recycle bin", what: "Where deleted files wait, so you can put one back. After 93 days they're gone for good." },
};

type LibRow = { name: string; kind: FileKind; when: string; who: string; part?: "folder" | "file" };

/* The team's Deliveries folder: this year's report sits by its year's folder. */
const LIB_ROWS: LibRow[] = [
  { name: "2025", kind: "folder", when: "05/01/2026", who: "Sarah Patel" },
  { name: "2026", kind: "folder", when: "09/11/2026", who: "Daniel Okafor", part: "folder" },
  { name: "2026-11-10 Delivery report.xlsx", kind: "xlsx", when: "10/11/2026 08:57", who: "Sarah Patel", part: "file" },
  { name: "Delivery report template.xltx", kind: "xltx", when: "14/01/2026", who: "Sarah Patel" },
];

/* Your OneDrive's Documents: a count the team needs, still only yours. */
const ONEDRIVE_ROWS: LibRow[] = [
  { name: "Drafts", kind: "folder", when: "02/11/2026", who: "You", part: "folder" },
  { name: "2026-11-10 Bay C count.xlsx", kind: "xlsx", when: "10/11/2026 17:05", who: "You", part: "file" },
  { name: "2026-11-06 Training ideas.docx", kind: "docx", when: "06/11/2026", who: "You" },
];

/* `view` picks the folder on show; `file` puts another name on the
 * selected file (a badly named one, to rename); `renumber` numbers a
 * lesson's few parts 1, 2, 3 when it doesn't show the whole picture. */
export function LibraryFigure({ focus, title = "A team folder in File Explorer", what, note, view = "deliveries", file, renumber }: { focus?: LibraryPart[]; title?: string; what?: What<LibraryPart>; note?: string; view?: "deliveries" | "onedrive"; file?: string; renumber?: Partial<Record<LibraryPart, number>> }) {
  const cols = "minmax(0, 2.7fr) 1.1fr 0.9fr";
  const mine = view === "onedrive";
  const rows = (mine ? ONEDRIVE_ROWS : LIB_ROWS).map((r) => (r.part === "file" && file ? { ...r, name: file, when: "06/11/2026 15:02" } : r));
  const crumbs = mine ? ["OneDrive - Northfield", "Documents"] : ["Operations Team", "Documents", "Deliveries"];
  return (
    <FigureFrame info={withWhat(LIBRARY_PARTS, what, renumber)} focus={focus} title={title} note={note} minWidth={780}>
      <div style={frame}>
        {bar("#2b2b2b", <><b>File Explorer</b><span style={{ opacity: 0.9 }}>{mine ? "OneDrive > Documents" : "Operations Team > Documents > Deliveries"}</span></>)}
        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 7, padding: "40px 8px 8px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <Part k="newfolder" block={false} badge="top">{cmd(Ico.newFolder, "New folder")}</Part>
          <Part k="upload" block={false} badge="top">{cmd(Ico.upload, "Upload")}</Part>
          {sep}
          <Part k="share" block={false} badge="top">{cmd(Ico.share, "Share")}</Part>
          <Part k="copylink" block={false} badge="top">{cmd(Ico.link, "Copy link")}</Part>
          {sep}
          <Part k="moveto" block={false} badge="top">{cmd(Ico.move, "Move to")}</Part>
          <Part k="rename" block={false} badge="top">{cmd(Ico.rename, "Rename")}</Part>
          <Part k="delete" block={false} badge="top">{cmd(Ico.bin, "Delete")}</Part>
          {sep}
          <Part k="history" block={false} badge="top">{cmd(Ico.history, "Version history")}</Part>
        </div>
        <div style={{ display: "flex", minHeight: 300 }}>
          <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", padding: "12px 6px 10px 44px", background: W.chrome, borderRight: `1px solid ${W.edge}`, borderRadius: "0 0 0 8px" }}>
            <Part k="places">
              <div>
                <p style={{ margin: "2px 8px 4px", fontSize: 12, fontWeight: 700, color: W.muted, whiteSpace: "nowrap" }}>OneDrive - Northfield</p>
                {["Documents", "Desktop", "Downloads"].map((p, i) => (
                  <div key={p}>{line(folderIcon(16), p, undefined, mine && i === 0 ? { background: W.select, borderRadius: 5, fontWeight: 600 } : undefined)}</div>
                ))}
                <p style={{ margin: "10px 8px 4px", fontSize: 12, fontWeight: 700, color: W.muted }}>SharePoint sites</p>
                {["Operations Team", "Finance", "HR"].map((p, i) => (
                  <div key={p}>{line(siteTile(p, 18), p, undefined, !mine && i === 0 ? { background: W.select, borderRadius: 5, fontWeight: 600 } : undefined)}</div>
                ))}
              </div>
            </Part>
            <div style={{ flex: 1, minHeight: 18 }} />
            <Part k="bin">{line(<span style={{ display: "inline-flex", color: W.muted }}>{Ico.bin}</span>, "Recycle bin", undefined, { borderTop: `1px solid ${W.edge}` })}</Part>
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: "10px 12px 14px 46px" }}>
            <Part k="path">
              <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 34, fontSize: 14 }}>
                <span style={{ padding: "2px 8px", border: `1px solid ${W.edge}`, borderRadius: 4, fontSize: 12.5 }}>↑ Up</span>
                {crumbs.map((c, i) => (
                  <span key={c} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {i > 0 && <span style={{ color: W.faint }}>›</span>}
                    {i === crumbs.length - 1 ? <b style={{ fontWeight: 600 }}>{c}</b> : <span style={{ color: W.muted }}>{c}</span>}
                  </span>
                ))}
              </div>
            </Part>
            <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10, padding: "40px 8px 6px", fontSize: 12.5, color: W.muted, borderBottom: `1px solid ${W.edge}` }}>
              <span>Name</span>
              <Part k="modified" block={false} badge="top">
                <span>Modified</span>
              </Part>
              <Part k="by" block={false} badge="top">
                <span>Modified by</span>
              </Part>
            </div>
            {rows.map((r) => {
              const row = (
                <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center", minHeight: 36, padding: "0 8px", fontSize: 13.5, background: r.part === "file" ? W.select : undefined, borderRadius: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <FileGlyph kind={r.kind} size={18} />
                    <span style={{ whiteSpace: "nowrap" }}>{r.name}</span>
                    {r.part === "file" && !mine && !file && (
                      <Part k="shared" block={false} badge="right">
                        <SharedMark />
                      </Part>
                    )}
                  </span>
                  <span style={{ color: W.muted }}>{r.when}</span>
                  <span style={{ color: W.muted }}>{r.who}</span>
                </div>
              );
              return r.part ? (
                <Part key={r.name} k={r.part} holds={r.part === "file" ? ["shared"] : []}>
                  {row}
                </Part>
              ) : (
                <div key={r.name}>{row}</div>
              );
            })}
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 2. a messy folder beside a tidy one ──────────────────────────────── */

export type TidyPart = "vague" | "copy" | "mixed" | "years" | "dated" | "order";

export const TIDY_PARTS: Record<TidyPart, PartInfo> = {
  copy: { n: 1, name: "A copy", what: "The same report twice. Which one is right? Someone will change one and not the other." },
  mixed: { n: 2, name: "Years mixed up", what: "Last December's files sit among this month's, so the folder only grows." },
  vague: { n: 3, name: "A name that says nothing", what: "scan001: you'd have to open it to find out what it is, and when." },
  years: { n: 4, name: "A folder per year", what: "Last year's files in 2025, this year's in 2026. The folder you need is always small." },
  order: { n: 5, name: "In date order by itself", what: "Because the date comes first, year first, the list sorts itself, oldest to newest." },
  dated: { n: 6, name: "A date-first name", what: "The scan, opened and renamed: its own date, then what it is." },
};

function Panel({ title, path, children, width = 374 }: { title: string; path: string; children: ReactNode; width?: number }) {
  return (
    <div style={{ ...frame, width, flexShrink: 0 }}>
      {bar("#2b2b2b", <><b>{title}</b></>)}
      <div style={{ padding: "8px 12px", fontSize: 13, color: W.muted, borderBottom: `1px solid ${W.edge}`, background: W.chrome }}>{path}</div>
      <div style={{ padding: "8px 14px 12px 46px" }}>{children}</div>
    </div>
  );
}

export function TidyFigure({ focus, title = "The same folder, before and after", what, note }: { focus?: TidyPart[]; title?: string; what?: What<TidyPart>; note?: string }) {
  const f = (name: string, kind: FileKind) => line(<FileGlyph kind={kind} size={18} />, keep(name));
  return (
    <FigureFrame info={withWhat(TIDY_PARTS, what)} focus={focus} title={title} note={note} minWidth={770}>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <Panel title="Before" path="Operations Team › Documents › Deliveries">
          {f("2025-12-22 Delivery report.xlsx", "xlsx")}
          <Part k="copy">{f("Copy of report final v2.xlsx", "xlsx")}</Part>
          {f("Delivery report 3 Nov.xlsx", "xlsx")}
          <Part k="mixed">{f("DR 14-12-25.xlsx", "xlsx")}</Part>
          {f("report final v2.xlsx", "xlsx")}
          <Part k="vague">{f("scan001.pdf", "pdf")}</Part>
        </Panel>
        <Panel title="After" path="Operations Team › Documents › Deliveries">
          <Part k="years">
            <div>
              {line(folderIcon(), "2025")}
              {line(folderIcon(), "2026", <span style={{ marginLeft: "auto", fontSize: 12, color: W.muted }}>opened below</span>)}
            </div>
          </Part>
          <div style={{ margin: "6px 0 0 8px", paddingLeft: 6, borderLeft: `2px solid ${W.edge}` }}>
            <Part k="order" holds={["dated"]}>
              <div>
                {f("2026-11-03 Delivery report.xlsx", "xlsx")}
                {f("2026-11-06 Delivery report.xlsx", "xlsx")}
                <Part k="dated">{f("2026-11-09 Delivery note DN-77790.pdf", "pdf")}</Part>
              </div>
            </Part>
          </div>
        </Panel>
      </div>
    </FigureFrame>
  );
}

/* ── 3. the house rule for a file name ────────────────────────────────── */

export type NamePart = "date" | "words" | "ending" | "sorted";

export const NAME_PARTS: Record<NamePart, PartInfo> = {
  date: { n: 1, name: "The date, year first", what: "Year, month, day, with dashes: 2026-11-10 is 10 November 2026. The date the file is about, not the day you saved it." },
  words: { n: 2, name: "What it is", what: "A few plain words, starting with a capital: Delivery report, Letter to Oak Street Deli. No \"final\", no \"v2\", no initials." },
  ending: { n: 3, name: "The ending", what: "Says what kind of file it is: .xlsx for Excel, .docx for Word, .pdf for a PDF. The program adds it. Leave it alone." },
  sorted: { n: 4, name: "Sorted by itself", what: "Names that start year first line up in date order, in any folder, on anyone's computer." },
};

export function NameFigure({ focus, title = "A file name, the house way", what, note }: { focus?: NamePart[]; title?: string; what?: What<NamePart>; note?: string }) {
  const seg: CSSProperties = { display: "inline-block", padding: "4px 6px", fontFamily: "Consolas, ui-monospace, monospace", fontSize: 30, letterSpacing: "0.01em" };
  return (
    <FigureFrame info={withWhat(NAME_PARTS, what)} focus={focus} title={title} note={note} minWidth={660}>
      <div style={{ ...frame, padding: "46px 26px 22px 46px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap" }}>
          <FileGlyph kind="xlsx" size={38} />
          <Part k="date" block={false} badge="top">
            <span style={{ ...seg, color: "#0f6cbd" }}>2026-11-10</span>
          </Part>
          <span aria-label="a space" style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 3, marginTop: 18 }}>
            <span style={{ width: 22, height: 14, border: `2px solid ${W.muted}`, borderTop: "none", borderRadius: "0 0 3px 3px" }} />
            <span style={{ fontSize: 11.5, fontWeight: 600, color: W.body }}>space</span>
          </span>
          <Part k="words" block={false} badge="top">
            <span style={{ ...seg, color: W.ink }}>Delivery report</span>
          </Part>
          <Part k="ending" block={false} badge="top" style={{ marginLeft: 6 }}>
            <span style={{ ...seg, color: W.excel }}>.xlsx</span>
          </Part>
        </div>
        <Part k="sorted" style={{ marginTop: 26 }} badge="left">
          <div style={{ border: `1px solid ${W.edge}`, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "6px 10px", fontSize: 12.5, color: W.muted, background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>Deliveries › 2026, sorted by name</div>
            {["2026-11-03 Delivery report.xlsx", "2026-11-06 Delivery report.xlsx", "2026-11-09 Delivery note DN-77790.pdf", "2026-11-10 Delivery report.xlsx"].map((n, i) => (
              <div key={n} style={{ background: i === 3 ? W.select : undefined }}>{line(<FileGlyph kind={n.endsWith(".pdf") ? "pdf" : "xlsx"} size={18} />, keep(n))}</div>
            ))}
          </div>
        </Part>
      </div>
    </FigureFrame>
  );
}

/* ── 4. OneDrive, a SharePoint site and Teams' Files tab ─────────────── */

export type PlacesPart = "onedrive" | "onlyyou" | "drafts" | "site" | "members" | "teamfile" | "filestab" | "samefile";

export const PLACES_PARTS: Record<PlacesPart, PartInfo> = {
  onedrive: { n: 1, name: "Your OneDrive", what: "Your own drawer at work, kept online. It's yours, not the team's." },
  onlyyou: { n: 2, name: "Only you", what: "Nobody else can open what's here unless you share it. Fine for drafts, wrong for anything the team needs." },
  drafts: { n: 3, name: "Your drafts", what: "Notes and first tries, just for you, in Documents > Drafts." },
  site: { n: 4, name: "A team's site", what: "SharePoint gives every team a site: Operations Team, Finance, HR. It's the team's filing cabinet." },
  members: { n: 5, name: "The team can open it", what: "Everyone in the team can open and edit what's on its site, without being sent anything." },
  teamfile: { n: 6, name: "A team file", what: "The stock sheet the whole team works on, kept on the team's site." },
  filestab: { n: 7, name: "Teams' Files tab", what: "Each team in Teams has a Files tab. It isn't a third place: it shows the team's SharePoint site." },
  samefile: { n: 8, name: "The very same file", what: "The stock sheet again: the same file as on the site, not a copy. Change it here and it's changed there." },
};

function Place({ head, children, colour }: { head: ReactNode; children: ReactNode; colour: string }) {
  return (
    <div style={{ ...frame, width: 246, flexShrink: 0 }}>
      {bar(colour, head)}
      {children}
    </div>
  );
}

export function PlacesFigure({ focus, title = "Your OneDrive, the team's site, and Teams", what, note }: { focus?: PlacesPart[]; title?: string; what?: What<PlacesPart>; note?: string }) {
  const stock = line(<FileGlyph kind="xlsx" size={18} />, "Stock November.xlsx");
  return (
    <FigureFrame info={withWhat(PLACES_PARTS, what)} focus={focus} title={title} note={note} minWidth={770}>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", paddingTop: 30 }}>
        <Part k="onedrive" badge="top" holds={["onlyyou", "drafts"]}>
          <Place colour="#6b3fb3" head={<><b>OneDrive</b><span style={{ opacity: 0.9 }}>Northfield Supplies</span></>}>
            <div style={{ padding: "10px 12px 12px 44px" }}>
              <Part k="onlyyou">
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 5, background: "#f3eefb", fontSize: 13, color: "#4b2a85" }}>
                  {ShareIcon.lock(16)} Only you
                </div>
              </Part>
              <div style={{ marginTop: 8, fontSize: 12.5, color: W.muted }}>Documents</div>
              <Part k="drafts" style={{ marginTop: 2 }}>
                <div>
                  {line(folderIcon(), "Drafts")}
                  <div style={{ paddingLeft: 22 }}>{line(<FileGlyph kind="docx" size={18} />, keep("2026-11-09 My stock notes.docx"))}</div>
                </div>
              </Part>
            </div>
          </Place>
        </Part>
        <Part k="site" badge="top" holds={["members", "teamfile"]}>
          <Place colour="#03787c" head={<><b>SharePoint</b><span style={{ opacity: 0.9 }}>Operations Team</span></>}>
            <div style={{ padding: "10px 12px 12px 44px" }}>
              <Part k="members">
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 5, background: "#eef6f6", fontSize: 13, color: "#03575a" }}>
                  {ShareIcon.people(16)} Daniel, Sarah and you
                </div>
              </Part>
              <div style={{ marginTop: 8, fontSize: 12.5, color: W.muted }}>Documents › Stock</div>
              <Part k="teamfile" style={{ marginTop: 2 }}>
                {stock}
              </Part>
              {line(<FileGlyph kind="xlsx" size={18} />, "Stock October.xlsx")}
            </div>
          </Place>
        </Part>
        <Part k="filestab" badge="top" holds={["samefile"]}>
          <Place colour={W.teams} head={<><b>Teams</b><span style={{ opacity: 0.9 }}>Operations Team</span></>}>
            <div style={{ display: "flex", gap: 16, padding: "6px 12px 0 44px", borderBottom: `1px solid ${W.edge}`, fontSize: 13 }}>
              <span style={{ padding: "6px 0", fontWeight: 600 }}>General</span>
              <span style={{ padding: "6px 0", color: W.muted }}>Posts</span>
              <span style={{ padding: "6px 0", borderBottom: `3px solid ${W.teams}`, fontWeight: 700 }}>Files</span>
            </div>
            <div style={{ padding: "10px 12px 12px 44px" }}>
              <div style={{ fontSize: 12.5, color: W.muted }}>Documents › Stock</div>
              <Part k="samefile" style={{ marginTop: 2 }}>
                {stock}
              </Part>
              {line(<FileGlyph kind="xlsx" size={18} />, "Stock October.xlsx")}
            </div>
          </Place>
        </Part>
      </div>
    </FigureFrame>
  );
}

/* ── 5. a link and an attachment ──────────────────────────────────────── */

export type SendPart = "colleague" | "link" | "onefile" | "outside" | "attachment" | "copy";

export const SEND_PARTS: Record<SendPart, PartInfo> = {
  colleague: { n: 1, name: "A colleague", what: "Priya works at Northfield, so she can be let into the team's file." },
  link: { n: 2, name: "A link", what: "A blue link with the file's name. Nothing is copied: it's a way in." },
  onefile: { n: 3, name: "The one file", what: "The link opens the stock sheet on the team's site. Priya's changes go straight into it, for everyone." },
  outside: { n: 4, name: "Someone outside", what: "Tom works for a supplier. He can't, and shouldn't, get into Northfield's files." },
  attachment: { n: 5, name: "An attachment", what: "A paperclip and a file name: a copy of the file travels with the email." },
  copy: { n: 6, name: "His own copy", what: "Tom gets a PDF of just his rows, to keep. Nothing he does to it touches our sheet." },
};

function MiniMail({ to, toTag, chip, body, foot, chipKey, toKey, footKey }: { to: string; toTag?: ReactNode; chip: ReactNode; body: string; foot: ReactNode; chipKey: SendPart; toKey: SendPart; footKey: SendPart }) {
  return (
    <div style={{ ...frame, width: 378, flexShrink: 0 }}>
      {bar(W.outlook, <b>New message</b>)}
      <div style={{ padding: "4px 14px 0 46px" }}>
        <Part k={toKey}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 38, padding: "0 6px", fontSize: 13.5, borderBottom: `1px solid ${W.edge}` }}>
            <span style={{ width: 46, color: W.muted }}>To</span>
            <span style={{ padding: "2px 10px", borderRadius: 12, background: W.select }}>{to}</span>
            {toTag}
          </div>
        </Part>
        <div style={{ padding: "10px 0" }}>
          <Part k={chipKey} block={false} badge="left">
            {chip}
          </Part>
        </div>
        <p style={{ margin: 0, paddingBottom: 12, fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{body}</p>
      </div>
      <div style={{ padding: "10px 14px 12px 46px", borderTop: `1px dashed ${W.edge}`, background: "#faf9f8", borderRadius: "0 0 8px 8px" }}>
        <Part k={footKey}>
          <div style={{ padding: "4px 6px" }}>{foot}</div>
        </Part>
      </div>
    </div>
  );
}

const chipStyle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 8, minHeight: 34, padding: "4px 12px", borderRadius: 6, border: `1px solid ${W.edge}`, background: W.page, fontSize: 13.5 };

export function SendFigure({ focus, title = "A link, and an attachment", what, note }: { focus?: SendPart[]; title?: string; what?: What<SendPart>; note?: string }) {
  return (
    <FigureFrame info={withWhat(SEND_PARTS, what)} focus={focus} title={title} note={note} minWidth={776}>
      <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
        <MiniMail
          to="Priya Shah"
          toKey="colleague"
          chipKey="link"
          footKey="onefile"
          chip={<span style={{ ...chipStyle, color: W.outlook }}>{ShareIcon.link(16, W.outlook)} Stock November.xlsx</span>}
          body={"Hi Priya,\n\nHere's the stock sheet. You can edit it.\n\nThanks"}
          foot={line(<FileGlyph kind="xlsx" size={18} />, <span>Opens <b style={{ fontWeight: 600, whiteSpace: "nowrap" }}>Operations Team › Stock</b> › <b style={{ fontWeight: 600, whiteSpace: "nowrap" }}>Stock November.xlsx</b>, the one the team uses</span>, undefined, { padding: 0, alignItems: "flex-start" })}
        />
        <MiniMail
          to="Tom Hale"
          toTag={<span style={{ fontSize: 12, fontWeight: 600, color: "#8a3c00" }}>Harlow Packaging</span>}
          toKey="outside"
          chipKey="attachment"
          footKey="copy"
          chip={<span style={chipStyle}>📎 <FileGlyph kind="pdf" size={18} /> {keep("2026-11-10 Harlow stock.pdf")}</span>}
          body={"Hi Tom,\n\nOur stock of your products is attached.\n\nKind regards"}
          foot={line(<FileGlyph kind="pdf" size={18} />, <span>A copy that goes with the email: <b style={{ fontWeight: 600 }}>Harlow&apos;s four rows only</b></span>, undefined, { padding: 0, alignItems: "flex-start" })}
        />
      </div>
    </FigureFrame>
  );
}

/* ── 6. Excel: a PDF of only the rows on show ─────────────────────────── */

export type ExportPart = "filter" | "shown" | "file" | "export";

export const EXPORT_PARTS: Record<ExportPart, PartInfo> = {
  filter: { n: 1, name: "The filter", what: "Filter puts a ▾ on each heading. Supplier is set to Harlow Packaging, so only their rows show." },
  shown: { n: 2, name: "The rows on show", what: "Harlow's four rows. The other seven are hidden, not deleted, and the yellow bar says so." },
  file: { n: 3, name: "File", what: "Opens the File menu: Save, Save as, Export and Close." },
  export: { n: 4, name: "Export, Create PDF", what: "Makes a PDF of what's on screen now: the headings and the rows the filter leaves." },
};

export function ExportFigure({ focus, title = "Making a PDF of some rows", what, note, menu = true }: { focus?: ExportPart[]; title?: string; what?: What<ExportPart>; note?: string; menu?: boolean }) {
  const apart = !!focus?.includes("filter") && !!focus.includes("shown");
  const rows = [
    ["HP-101", "Pallet wrap 500mm", "Harlow Packaging", "34", "2"],
    ["HP-114", "Bubble wrap roll", "Harlow Packaging", "12", "5"],
    ["HP-120", "Cardboard boxes, large", "Harlow Packaging", "240", "8"],
    ["HP-131", "Parcel tape (pack of 36)", "Harlow Packaging", "86", "11"],
  ];
  const w = [66, 160, 136, 70];
  const cell: CSSProperties = { borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, padding: "0 8px", height: 30, display: "flex", alignItems: "center", fontSize: 13.5, boxSizing: "border-box", whiteSpace: "nowrap", overflow: "hidden" };
  return (
    <FigureFrame info={withWhat(EXPORT_PARTS, what)} focus={focus} title={title} note={note} minWidth={720}>
      <div style={frame}>
        {bar(W.excel, <><b>Excel</b><span style={{ opacity: 0.9 }}>Stock November.xlsx · Saved</span></>)}
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 8px 48px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <Part k="file" block={false} badge="left">
            <span style={{ display: "inline-flex", alignItems: "center", minHeight: 32, padding: "4px 12px", borderRadius: 5, background: W.excel, color: "#fff", fontSize: 13.5, fontWeight: 700 }}>File ▾</span>
          </Part>
          <span style={{ fontSize: 13.5, padding: "4px 10px", border: `1px solid ${W.edge}`, borderRadius: 5, background: W.page }}>Save</span>
          <span style={{ fontSize: 13.5, padding: "4px 10px", border: `1px solid ${W.excel}`, borderRadius: 5, background: W.select }}>⏷ Filter</span>
          {menu && <div style={{ position: "absolute", left: 48, top: "100%", zIndex: 4, marginTop: 4, width: 220, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: "0 14px 30px -12px rgba(0,0,0,0.4)", padding: 4, fontSize: 13.5 }}>
            {["Save", "Save as"].map((m) => (
              <div key={m} style={{ padding: "7px 12px" }}>
                {m}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 12px" }}>
              Export <span style={{ color: W.muted }}>▾</span>
            </div>
            <Part k="export" badge="left">
              <div style={{ padding: "7px 12px 7px 26px", background: W.select, borderRadius: 4, fontWeight: 600 }}>Create PDF</div>
            </Part>
            <div style={{ padding: "7px 12px" }}>Close</div>
          </div>}
        </div>
        <div style={{ padding: "8px 12px 8px 290px", background: "#fff4ce", fontSize: 13, borderBottom: `1px solid ${W.edge}` }}>Showing only rows where Supplier is &ldquo;Harlow Packaging&rdquo; (4 of 11).</div>
        <div style={{ padding: "0 0 16px 290px", position: "relative" }}>
          <div style={{ display: "flex" }}>
            {["Code", "Item", "Supplier", "In stock"].map((h, i) => (
              <div key={h} style={{ ...cell, width: w[i], fontWeight: 700, background: "#e6f2ea", justifyContent: "space-between", overflow: i === 2 ? "visible" : "hidden" }}>
                {h}
                {i === 2 ? (
                  <Part k="filter" block={false} badge="left">
                    <span style={{ width: 18, height: 18, border: `1px solid ${W.edge}`, borderRadius: 3, background: W.select, fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>▾</span>
                  </Part>
                ) : (
                  <span style={{ width: 18, height: 18, border: `1px solid ${W.edge}`, borderRadius: 3, background: W.page, fontSize: 10, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>▾</span>
                )}
              </div>
            ))}
          </div>
          <Part k="shown" badge="right" style={{ borderRadius: 0, display: "inline-block", marginTop: apart ? 10 : 0 }}>
            <div>
              {rows.map((r) => (
                <div key={r[0]} style={{ display: "flex" }}>
                  {r.slice(0, 4).map((c, i) => (
                    <div key={i} style={{ ...cell, width: w[i], justifyContent: i === 3 ? "flex-end" : "flex-start", color: W.ink }}>
                      {c}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 7. the Share box ─────────────────────────────────────────────────── */

export type SharePart = "file" | "people" | "role" | "message" | "send" | "copylink" | "settings" | "manage";

export const SHARE_PARTS: Record<SharePart, PartInfo> = {
  file: { n: 1, name: "What you're sharing", what: "The file's name. Check it's the right one before you go on." },
  people: { n: 2, name: "Add people", what: "Type a name and pick them from the list. Only the people you add get in." },
  role: { n: 3, name: "Can edit or Can view", what: "Edit lets them change it. View lets them read it, nothing more." },
  message: { n: 4, name: "A message", what: "Say why you're sending it. It goes in the email they get." },
  send: { n: 5, name: "Send", what: "Lets them in and emails them a link. That's the whole job done." },
  copylink: { n: 6, name: "Copy link", what: "A link to paste yourself. Who it works for is written in the bar beside the Copy button." },
  settings: { n: 7, name: "Link settings", what: "Changes who a copied link works for, and whether they can edit." },
  manage: { n: 8, name: "Manage access", what: "Everyone who can open the file now, and every link to it. Change or take away access here." },
};

const fieldBox: CSSProperties = { display: "flex", alignItems: "center", gap: 8, minHeight: 36, padding: "4px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontSize: 13.5, boxSizing: "border-box" };

export function ShareFigure({ focus, title = "The Share box", what, note }: { focus?: SharePart[]; title?: string; what?: What<SharePart>; note?: string }) {
  return (
    <FigureFrame info={withWhat(SHARE_PARTS, what)} focus={focus} title={title} note={note} minWidth={600}>
      <div style={{ ...frame, maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 12px 46px", borderBottom: `1px solid ${W.edge}` }}>
          <Part k="file" block={false} badge="left">
            <b style={{ fontSize: 16, fontWeight: 600 }}>Share &ldquo;Stock November.xlsx&rdquo;</b>
          </Part>
          <span style={{ marginLeft: "auto" }}>
            <Part k="manage" block={false} badge="top">
              <span style={{ display: "inline-flex", color: W.muted, padding: 4 }}>{ShareIcon.people(20)}</span>
            </Part>
          </span>
          <span style={{ color: W.muted, fontSize: 16, padding: "0 4px" }}>✕</span>
        </div>
        <div style={{ padding: "14px 46px 10px 46px" }}>
          <div style={{ display: "flex", gap: 14 }}>
            <Part k="people" style={{ flex: 1 }}>
              <div style={fieldBox}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 8px 2px 3px", borderRadius: 14, background: W.select }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: W.outlook, color: "#fff", fontSize: 9, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>PS</span>
                  Priya Shah
                </span>
              </div>
            </Part>
            <Part k="role" block={false} badge="right">
              <span style={{ ...fieldBox, minWidth: 118 }}>
                {ShareIcon.pencil(15)} Can edit <span style={{ marginLeft: "auto", fontSize: 10 }}>▾</span>
              </span>
            </Part>
          </div>
          <Part k="message" style={{ marginTop: 16 }}>
            <div style={{ ...fieldBox, minHeight: 50, alignItems: "flex-start", color: W.ink }}>For the stock valuation this afternoon.</div>
          </Part>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Part k="send" block={false} badge="left">
              <span style={{ display: "inline-flex", alignItems: "center", minHeight: 34, padding: "4px 18px", borderRadius: 5, background: W.outlook, color: "#fff", fontWeight: 700, fontSize: 13.5 }}>Send</span>
            </Part>
          </div>
        </div>
        <div style={{ padding: "12px 16px 16px 46px", borderTop: `1px solid ${W.edge}` }}>
          <b style={{ fontSize: 14, fontWeight: 600 }}>Copy link</b>
          <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
            <Part k="settings" style={{ flex: 1 }}>
              <div style={{ ...fieldBox, borderColor: W.edge, background: W.chrome }}>
                <span style={{ display: "inline-flex", color: W.muted }}>{scopeIcon("org", 16)}</span>
                People in Northfield Supplies with the link can edit
                <span style={{ marginLeft: "auto", display: "inline-flex", color: W.muted }}>{ShareIcon.gear(16)}</span>
              </div>
            </Part>
            <Part k="copylink" block={false} badge="top">
              <span style={{ ...fieldBox, borderColor: W.edge, fontWeight: 600 }}>Copy</span>
            </Part>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 8. link settings ─────────────────────────────────────────────────── */

export type LinkPart = "anyone" | "org" | "existing" | "people" | "linkrole";

export const LINK_PARTS: Record<LinkPart, PartInfo> = {
  anyone: { n: 1, name: "Anyone", what: "Works for whoever gets the link, inside or outside the company, with no sign-in. Forwarded once, it's anyone's." },
  org: { n: 2, name: "People in Northfield Supplies", what: "Works for anyone at the company who gets the link. Copy link often starts with this one." },
  existing: { n: 3, name: "People with existing access", what: "Lets nobody new in. Handy for pointing a colleague who already has it to the file." },
  people: { n: 4, name: "Specific people", what: "Works only for the people you name. The safest choice: only the people you pick get in." },
  linkrole: { n: 5, name: "Can edit or Can view", what: "What people with the link can do: change it, or only read it." },
};

export function LinkSettingsFigure({ focus, title = "Link settings", what, note }: { focus?: LinkPart[]; title?: string; what?: What<LinkPart>; note?: string }) {
  const opt = (k: LinkPart, scope: "anyone" | "org" | "existing" | "people", label: string, sub: string, on = false) => (
    <Part k={k}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 48, padding: "6px 12px", border: `1px solid ${on ? W.outlook : W.edge}`, borderRadius: 6, background: on ? W.select : W.page }}>
        <span style={{ display: "inline-flex", color: on ? W.outlook : W.muted }}>{scopeIcon(scope, 20)}</span>
        <span>
          <b style={{ display: "block", fontSize: 14, fontWeight: 600 }}>{label}</b>
          <span style={{ fontSize: 12.5, color: W.muted }}>{sub}</span>
        </span>
      </div>
    </Part>
  );
  return (
    <FigureFrame info={withWhat(LINK_PARTS, what)} focus={focus} title={title} note={note} minWidth={560}>
      <div style={{ ...frame, maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 12px 16px", borderBottom: `1px solid ${W.edge}` }}>
          <span style={{ color: W.muted }}>←</span>
          <b style={{ fontSize: 16, fontWeight: 600 }}>Link settings</b>
        </div>
        <div style={{ padding: "12px 16px 16px 46px", display: "grid", gap: 12 }}>
          <span style={{ fontSize: 13, color: W.muted }}>Share the link with</span>
          {opt("anyone", "anyone", "Anyone", "Even people outside Northfield. No sign-in.")}
          {opt("org", "org", "People in Northfield Supplies", "Anyone at the company who has the link.")}
          {opt("existing", "existing", "People with existing access", "Only people who can already open it.")}
          {opt("people", "people", "Specific people", "Only the people you name.", true)}
          <span style={{ marginTop: 8, fontSize: 13, color: W.muted }}>More settings</span>
          <Part k="linkrole" block={false} badge="left" style={{ justifySelf: "start" }}>
            <span style={{ ...fieldBox, minWidth: 128 }}>
              {ShareIcon.eye(15)} Can view <span style={{ marginLeft: "auto", fontSize: 10 }}>▾</span>
            </span>
          </Part>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <span style={{ ...fieldBox, borderColor: W.edge, fontWeight: 600 }}>Cancel</span>
            <span style={{ ...fieldBox, border: "none", background: W.outlook, color: "#fff", fontWeight: 700 }}>Apply</span>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 9. Manage access ─────────────────────────────────────────────────── */

export type AccessPart = "members" | "person" | "change" | "remove" | "links" | "deletelink";

export const ACCESS_PARTS: Record<AccessPart, PartInfo> = {
  members: { n: 1, name: "The team", what: "Everyone on the Operations Team's SharePoint site can open its files. You don't need to share with them." },
  person: { n: 2, name: "Someone it's shared with", what: "Priya isn't on the team's site, so she was let in by name." },
  change: { n: 3, name: "What they can do", what: "Change Can edit to Can view, or back." },
  remove: { n: 4, name: "Remove", what: "Takes their access away. The link they were sent stops working for them." },
  links: { n: 5, name: "Links giving access", what: "Every link made with Copy link, and who it works for. Here, one for the whole company." },
  deletelink: { n: 6, name: "Delete link", what: "Switches that link off for everyone who has it." },
};

export function AccessFigure({ focus, title = "Manage access", what, note }: { focus?: AccessPart[]; title?: string; what?: What<AccessPart>; note?: string }) {
  const btn = (t: string) => <span style={{ ...fieldBox, borderColor: W.edge, minHeight: 32, fontWeight: 600 }}>{t}</span>;
  return (
    <FigureFrame info={withWhat(ACCESS_PARTS, what)} focus={focus} title={title} note={note} minWidth={600}>
      <div style={{ ...frame, maxWidth: 580, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 12px 12px 16px", borderBottom: `1px solid ${W.edge}` }}>
          <span style={{ color: W.muted }}>←</span>
          <b style={{ fontSize: 16, fontWeight: 600 }}>Manage access</b>
          <span style={{ marginLeft: "auto", fontSize: 13, color: W.muted }}>Stock November.xlsx</span>
        </div>
        <div style={{ padding: "10px 16px 16px 46px" }}>
          <p style={{ margin: "4px 0 6px", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: W.muted }}>PEOPLE</p>
          <Part k="members">
            <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 46, borderBottom: `1px solid ${W.edge}` }}>
              {siteTile("Operations Team", 30)}
              <span style={{ flex: 1, fontSize: 13.5 }}>
                <b style={{ display: "block", fontWeight: 600 }}>Operations Team members</b>
                <span style={{ fontSize: 12.5, color: W.muted }}>Daniel Okafor, Sarah Patel, You</span>
              </span>
              <span style={{ fontSize: 13, color: W.muted }}>Can edit</span>
            </div>
          </Part>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, borderBottom: `1px solid ${W.edge}`, paddingTop: 30 }}>
            <Part k="person" block={false} badge="left">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: W.outlook, color: "#fff", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>PS</span>
                <span style={{ fontSize: 13.5 }}>
                  <b style={{ display: "block", fontWeight: 600 }}>Priya Shah</b>
                  <span style={{ fontSize: 12.5, color: W.muted }}>priya.shah@northfieldsupplies.example</span>
                </span>
              </span>
            </Part>
            <span style={{ marginLeft: "auto", display: "inline-flex", gap: 14 }}>
              <Part k="change" block={false} badge="top">
                <span style={{ ...fieldBox, minWidth: 110 }}>
                  {ShareIcon.pencil(15)} Can edit <span style={{ marginLeft: "auto", fontSize: 10 }}>▾</span>
                </span>
              </Part>
              <Part k="remove" block={false} badge="top">
                {btn("Remove")}
              </Part>
            </span>
          </div>
          <p style={{ margin: "14px 0 6px", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: W.muted }}>LINKS GIVING ACCESS</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, paddingTop: 30 }}>
            <Part k="links" block={false} badge="left">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                <span style={{ width: 30, height: 30, borderRadius: "50%", background: W.select, color: W.outlook, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{scopeIcon("org", 17)}</span>
                <span style={{ fontSize: 13.5 }}>
                  <b style={{ display: "block", fontWeight: 600 }}>People in Northfield Supplies with the link can edit</b>
                  <span style={{ fontSize: 12.5, color: W.outlook }}>https://northfield.sharepoint.example/:x:/…</span>
                </span>
              </span>
            </Part>
            <span style={{ marginLeft: "auto" }}>
              <Part k="deletelink" block={false} badge="top">
                {btn("Delete link")}
              </Part>
            </span>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 10. Version history ──────────────────────────────────────────────── */

export type VersionPart = "list" | "current" | "saved" | "open" | "restore" | "preview";

export const VERSION_PARTS: Record<VersionPart, PartInfo> = {
  saved: { n: 1, name: "When, and who", what: "When each version was saved, and by whom. Last night's count was saved at 17:42." },
  current: { n: 2, name: "Current", what: "The version everyone opens now. Here, Sarah's 08:31 save, with last month's numbers by mistake." },
  list: { n: 3, name: "Every saved version", what: "Newest at the top. Each save keeps the one before, numbered 1.0, 2.0, 3.0." },
  open: { n: 4, name: "Open", what: "Shows that version, read-only, so you can check it's the one you want." },
  restore: { n: 5, name: "Restore", what: "Makes that version the current one again. The one it replaces stays in the list, so nothing is lost." },
  preview: { n: 6, name: "The version you opened", what: "Its numbers, as they were then. Counted 09/11/2026: last night's count." },
};

export function VersionsFigure({ focus, title = "Version history", what, note }: { focus?: VersionPart[]; title?: string; what?: What<VersionPart>; note?: string }) {
  const rows = [
    { no: "3.0", when: "10/11/2026 08:31", current: true },
    { no: "2.0", when: "09/11/2026 17:42", open: true },
    { no: "1.0", when: "02/11/2026 09:10" },
  ];
  const cols = "140px 130px 110px 1fr";
  const small = (t: string, on = false) => <span style={{ display: "inline-flex", alignItems: "center", minHeight: 28, padding: "0 10px", border: `1px solid ${on ? W.outlook : W.edge}`, borderRadius: 5, fontSize: 12.5, fontWeight: 600, background: on ? W.select : W.page }}>{t}</span>;
  return (
    <FigureFrame info={withWhat(VERSION_PARTS, what)} focus={focus} title={title} note={note} minWidth={680}>
      <div style={{ ...frame, maxWidth: 660, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${W.edge}` }}>
          <FileGlyph kind="xlsx" />
          <b style={{ fontSize: 16, fontWeight: 600 }}>Version history: Stock November.xlsx</b>
        </div>
        <div style={{ padding: "8px 46px 16px 46px" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8, padding: "34px 6px 6px", fontSize: 12.5, color: W.muted, borderBottom: `1px solid ${W.edge}` }}>
            <span>Version</span>
            <Part k="saved" block={false} badge="top">
              <span>Modified</span>
            </Part>
            <span>Modified by</span>
            <span />
          </div>
          <Part k="list" holds={["current", "open", "restore"]}>
            <div>
              {rows.map((r) => {
                const row = (
                  <div style={{ display: "grid", gridTemplateColumns: cols, gap: 8, alignItems: "center", minHeight: 42, padding: "0 6px", fontSize: 13.5, borderBottom: `1px solid ${W.edge}`, background: r.open ? W.select : undefined }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <b style={{ fontWeight: 600 }}>{r.no}</b>
                      {r.current && (
                        <Part k="current" block={false} badge="right" style={{ marginLeft: 2 }}>
                          <span style={{ display: "inline-block", padding: "1px 8px", borderRadius: 9, background: "#e0f0e6", color: W.excel, fontSize: 11, fontWeight: 700 }}>Current</span>
                        </Part>
                      )}
                    </span>
                    <span>{r.when}</span>
                    <span>Sarah Patel</span>
                    <span style={{ display: "inline-flex", justifyContent: "flex-end", gap: 14 }}>
                      {r.open ? (
                        <>
                          <Part k="open" block={false} badge="left">
                            {small("Open", true)}
                          </Part>
                          <Part k="restore" block={false} badge="right">
                            {small("Restore")}
                          </Part>
                        </>
                      ) : (
                        <>
                          {small("Open")}
                          {!r.current && small("Restore")}
                        </>
                      )}
                    </span>
                  </div>
                );
                return <div key={r.no}>{row}</div>;
              })}
            </div>
          </Part>
          <Part k="preview" style={{ marginTop: 14 }}>
            <div style={{ border: `1px solid ${W.edge}`, borderRadius: 6, overflow: "hidden", fontSize: 12.5 }}>
              <div style={{ padding: "6px 10px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
                <b style={{ fontWeight: 600 }}>Version 2.0</b> · saved 09/11/2026 17:42 by Sarah Patel · <span style={{ color: W.muted }}>Read-only</span>
              </div>
              {[
                ["Code", "Item", "In stock", "Counted"],
                ["HP-101", "Pallet wrap 500mm", "34", "09/11/2026"],
                ["KF-201", "Plain flour 25kg", "52", "09/11/2026"],
              ].map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 80px 100px", fontWeight: i === 0 ? 700 : 400, background: i === 0 ? "#e6f2ea" : undefined }}>
                  {r.map((c, j) => (
                    <span key={j} style={{ padding: "4px 8px", borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}` }}>
                      {c}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── 11. the Recycle bin ──────────────────────────────────────────────── */

export type BinPart = "item" | "from" | "when" | "restore";

export const BIN_PARTS: Record<BinPart, PartInfo> = {
  restore: { n: 1, name: "Restore", what: "Select an item, then press Restore. It's back where it was, as if nothing happened." },
  from: { n: 2, name: "Where it was", what: "The folder it came from. Restore puts it back there." },
  when: { n: 3, name: "When", what: "When it was deleted. After 93 days it goes for good." },
  item: { n: 4, name: "What was deleted", what: "A file or a folder you deleted. A folder keeps everything that was in it." },
};

export function BinFigure({ focus, title = "The Recycle bin", what, note }: { focus?: BinPart[]; title?: string; what?: What<BinPart>; note?: string }) {
  const cols = "minmax(0, 1.3fr) minmax(0, 1.75fr) 0.55fr";
  const where: CSSProperties = { color: W.muted, whiteSpace: "nowrap", fontSize: 13 };
  return (
    <FigureFrame info={withWhat(BIN_PARTS, what)} focus={focus} title={title} note={note} minWidth={770}>
      <div style={frame}>
        {bar("#2b2b2b", <><b>File Explorer</b><span style={{ opacity: 0.9 }}>Recycle bin</span></>)}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px 8px 46px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <Part k="restore" block={false} badge="left">
            {cmd(Ico.restore, "Restore")}
          </Part>
          <span style={{ fontSize: 12.5, color: W.muted }}>Deleted files wait here for 93 days.</span>
        </div>
        <div style={{ padding: "4px 16px 14px 46px" }}>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10, padding: "34px 8px 6px", fontSize: 12.5, color: W.muted, borderBottom: `1px solid ${W.edge}` }}>
            <span>Name</span>
            <Part k="from" block={false} badge="top">
              <span>Original location</span>
            </Part>
            <Part k="when" block={false} badge="top">
              <span>Deleted</span>
            </Part>
          </div>
          <Part k="item">
            <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center", minHeight: 36, padding: "0 8px", fontSize: 13.5, background: W.select, borderRadius: 4 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <FileGlyph kind="xlsx" size={18} /> {keep("2025-12-23 Christmas returns.xlsx")}
              </span>
              <span style={where}>Operations Team › Documents › Deliveries › 2025</span>
              <span style={{ color: W.muted }}>Today 11:41</span>
            </div>
          </Part>
          <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center", minHeight: 36, padding: "0 8px", fontSize: 13.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <FileGlyph kind="xlsx" size={18} /> Copy of report final v2.xlsx
            </span>
            <span style={where}>Operations Team › Documents › Deliveries</span>
            <span style={{ color: W.muted }}>Today 11:38</span>
          </div>
        </div>
      </div>
    </FigureFrame>
  );
}
