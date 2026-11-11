"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { W } from "../../tokens";
import { Breadcrumb, FileList, PlacesNav } from "../places";
import { folderExists, listFolder, newId } from "../store";
import { pathText, type OfficeFile, type Path, type WordDoc } from "../types";
import { AppButton, Dialog } from "../ui";
import { canSaveIn, fromTemplate, para, wordCount } from "../word";
import type { OfficeAppProps } from "./registry";
import WordEditor from "./WordEditor";
import { DocSheet, Icon } from "./WordParts";

/* Word, for the office jobs (Module 8, criteria WD-1 to WD-6). It opens a
 * .docx to edit, and a .dotx template as a new, untitled document, so the
 * template itself is never changed. File holds Save, Save As (as a Word
 * document or a PDF) and Export, which makes a PDF: a read-only copy that
 * carries the pages, saved where you choose and opened to check it.
 *
 * Like the office's Excel, AutoSave is off: changes reach the file when you
 * press Save, and closing asks first. The HR site is view only (except
 * Forms > Completed), so a file there saves as a copy elsewhere. */

export interface OpenDoc {
  fileId: string | null;
  name: string;
  path: Path | null;
  doc: WordDoc;
  dirty: boolean;
  key: number;
  /* What it was opened from, shown in File > Info. */
  from?: string;
}

let opened = 0;
let untitled = 0;

type SaveType = "docx" | "pdf";

export default function WordApp({ state, dispatch, request, openFile, show, active, practice, onDoc }: Pick<OfficeAppProps, "state" | "dispatch" | "request" | "openFile" | "show"> & { active?: boolean; practice?: boolean; onDoc?: (d: OpenDoc | null) => void }) {
  const [open, setOpen] = useState<OpenDoc | null>(null);
  const [backstage, setBackstage] = useState<"info" | "export" | null>(null);
  const [dialog, setDialog] = useState<{ type: SaveType; note?: string; then?: () => void } | null>(null);
  const [unsaved, setUnsaved] = useState<{ then: () => void } | null>(null);
  const handled = useRef<number | null>(null);

  /* an open document follows its file if it is renamed or moved */
  const file = open?.fileId ? state.files.find((f) => f.id === open.fileId) : undefined;
  const live: OpenDoc | null = open && (file ? { ...open, name: file.name, path: file.path } : open.fileId ? { ...open, fileId: null, path: null } : open);

  useEffect(() => {
    onDoc?.(live);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, file?.name, file?.path]);

  const ask = (then: () => void) => (open?.dirty ? setUnsaved({ then }) : then());

  /* Ctrl+S saves wherever the focus is, while Word is the window in front,
   * rather than the browser offering to save the web page */
  const saveRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (active === false || !open) return;
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "s" && !e.defaultPrevented) {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [active, open]);

  const load = (f: OfficeFile) => {
    const doc: WordDoc = f.doc ?? { blocks: [para("")] };
    if (f.kind === "dotx") setOpen({ fileId: null, name: `Document${++untitled}`, path: null, doc: fromTemplate(doc, f.name), dirty: false, key: ++opened, from: `the template ${f.name}` });
    else setOpen({ fileId: f.id, name: f.name, path: f.path, doc: structuredClone(doc), dirty: false, key: ++opened });
    setBackstage(null);
  };

  useEffect(() => {
    if (!request || handled.current === request.key) return;
    handled.current = request.key;
    const f = state.files.find((x) => x.id === request.fileId);
    if (!f) return;
    if (open && open.fileId === f.id) return; // already open: carry on where you were
    ask(() => load(f));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.key]);

  const blank = () => ask(() => setOpen({ fileId: null, name: `Document${++untitled}`, path: null, doc: { blocks: [para("")] }, dirty: false, key: ++opened }));

  const save = (then?: () => void) => {
    if (!live) return;
    if (!file || file.kind !== "docx" || !canSaveIn(file.path)) {
      return setDialog({ type: "docx", then, note: file && !canSaveIn(file.path) ? `You can open files in ${pathText(file.path)}, but not change them. Save your copy in a folder you can edit.` : undefined });
    }
    dispatch({ type: "saveFile", file: { ...file, doc: live.doc, modified: "Today, just now", by: "You" } });
    setOpen({ ...live, dirty: false });
    then?.();
  };

  useEffect(() => {
    saveRef.current = () => save();
  });

  const saved = (path: Path, name: string, type: SaveType, openAfter: boolean, replaceId?: string) => {
    if (!live) return;
    const replacing = replaceId ? state.files.find((f) => f.id === replaceId) : undefined;
    const id = replaceId ?? newId("file");
    if (type === "pdf") {
      const snapshot: WordDoc = { ...structuredClone(live.doc), comments: [] };
      const pdf: OfficeFile = { id, path, name, kind: "pdf", modified: "Today, just now", by: "You", doc: snapshot, seeded: replacing?.seeded };
      dispatch({ type: "saveFile", file: pdf });
      setDialog(null);
      setBackstage(null);
      if (openAfter) openFile(pdf);
      return;
    }
    dispatch({ type: "saveFile", file: { id, path, name, kind: "docx", modified: "Today, just now", by: "You", doc: live.doc, seeded: replacing?.seeded } });
    setOpen({ ...live, fileId: id, name, path, dirty: false });
    const then = dialog?.then;
    setDialog(null);
    setBackstage(null);
    then?.();
  };

  const close = () =>
    ask(() => {
      setOpen(null);
      setBackstage(null);
    });

  const templates = state.files.filter((f) => f.kind === "dotx");
  const recent = state.files.filter((f) => f.kind === "docx").slice(0, 8);

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      {live ? (
        <WordEditor
          doc={live.doc}
          docKey={live.key}
          onChange={(doc) => setOpen((o) => (o ? { ...o, doc, dirty: true } : o))}
          name={live.name}
          status={live.dirty ? "Not saved" : live.fileId ? "Saved" : "Not saved yet"}
          onFile={() => setBackstage("info")}
          onSave={() => save()}
          extra={
            <>
              <span style={{ fontSize: 12.5, opacity: 0.85, whiteSpace: "nowrap" }}>AutoSave off</span>
              <button type="button" onClick={close} aria-label="Close document" title="Close document" style={{ width: 38, height: 32, border: "none", background: "transparent", color: "#fff", fontSize: 17, cursor: "pointer" }}>
                ✕
              </button>
            </>
          }
        />
      ) : (
        <Home templates={templates} recent={recent} onOpen={(f) => load(f)} onBlank={blank} onBrowse={practice ? undefined : () => show("explorer")} />
      )}

      {backstage && live && (
        <div role="dialog" aria-label="File" style={{ position: "absolute", inset: 0, zIndex: 35, display: "flex", background: "#ffffff" }}>
          <nav aria-label="File menu" style={{ width: 190, flexShrink: 0, background: W.word, color: "#fff", padding: "8px 0", display: "flex", flexDirection: "column" }}>
            <button type="button" onClick={() => setBackstage(null)} aria-label="Back to the document" style={{ ...stageBtn, fontSize: 20 }}>
              ←
            </button>
            {(
              [
                ["Info", () => setBackstage("info"), backstage === "info"],
                ["Save", () => save(() => setBackstage(null)), false],
                ["Save As", () => setDialog({ type: "docx" }), false],
                ["Export", () => setBackstage("export"), backstage === "export"],
                ["Close", close, false],
              ] as const
            ).map(([label, fn, on]) => (
              <button key={label} type="button" onClick={fn} style={{ ...stageBtn, background: on ? "rgba(255,255,255,0.18)" : "transparent", fontWeight: on ? 700 : 500 }}>
                {label}
              </button>
            ))}
          </nav>
          <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "26px 32px" }}>
            {backstage === "info" ? (
              <>
                <h2 style={{ margin: 0, fontSize: 30, fontWeight: 300 }}>Info</h2>
                <p style={{ margin: "14px 0 0", fontSize: 18, fontWeight: 600 }}>{live.name}</p>
                <p style={{ margin: "4px 0 0", fontSize: 14.5, color: W.muted }}>{live.path ? pathText(live.path) : `Not saved yet${live.from ? `. Started from ${live.from}.` : "."}`}</p>
                <dl style={{ margin: "22px 0 0", display: "grid", gridTemplateColumns: "150px 1fr", rowGap: 8, fontSize: 14.5 }}>
                  <dt style={{ color: W.muted }}>Words</dt>
                  <dd style={{ margin: 0 }}>{wordCount(live.doc)}</dd>
                  <dt style={{ color: W.muted }}>Template</dt>
                  <dd style={{ margin: 0 }}>{live.doc.template ?? "Normal"}</dd>
                  <dt style={{ color: W.muted }}>Track Changes</dt>
                  <dd style={{ margin: 0 }}>{live.doc.tracking ? "On" : "Off"}</dd>
                  <dt style={{ color: W.muted }}>Changes saved</dt>
                  <dd style={{ margin: 0 }}>{live.dirty ? "Not yet: press Save" : live.fileId ? "Yes" : "Not saved yet"}</dd>
                </dl>
              </>
            ) : (
              <>
                <h2 style={{ margin: 0, fontSize: 30, fontWeight: 300 }}>Export</h2>
                <div style={{ display: "flex", gap: 18, alignItems: "flex-start", marginTop: 22, maxWidth: 560 }}>
                  {Icon.pdf(54)}
                  <div>
                    <p style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>Create a PDF</p>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 20, fontSize: 14.5, lineHeight: 1.6, color: W.body }}>
                      <li>Looks the same on any computer or phone</li>
                      <li>Fonts, letterhead and layout stay as they are</li>
                      <li>Hard for anyone to change by mistake</li>
                    </ul>
                    <AppButton primary colour={W.word} onClick={() => setDialog({ type: "pdf" })} style={{ marginTop: 16 }}>
                      Create PDF
                    </AppButton>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {dialog && live && (
        <SaveDialog
          state={state}
          type={dialog.type}
          note={dialog.note}
          name={live.name.replace(/\.(docx|dotx|pdf)$/i, "")}
          at={live.path && canSaveIn(live.path) ? live.path : ["OneDrive", "Documents"]}
          onCancel={() => setDialog(null)}
          onSave={saved}
        />
      )}

      {unsaved && live && (
        <Dialog title="Word" onClose={() => setUnsaved(null)} width={480}>
          <p style={{ margin: 0, fontSize: 16 }}>Do you want to save your changes to &ldquo;{live.name}&rdquo;?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <AppButton onClick={() => setUnsaved(null)}>Cancel</AppButton>
            <AppButton
              onClick={() => {
                const then = unsaved.then;
                setUnsaved(null);
                setOpen(null);
                then();
              }}
            >
              Don&apos;t save
            </AppButton>
            <AppButton
              primary
              colour={W.word}
              onClick={() => {
                const then = unsaved.then;
                setUnsaved(null);
                save(then);
              }}
            >
              Save
            </AppButton>
          </div>
        </Dialog>
      )}
    </div>
  );
}

const stageBtn: CSSProperties = { minHeight: 44, padding: "0 22px", border: "none", background: "transparent", color: "#fff", fontFamily: W.font, fontSize: 15.5, textAlign: "left", cursor: "pointer" };

/* Word's start screen: a blank document, the templates, the recent files. */
function Home({ templates, recent, onOpen, onBlank, onBrowse }: { templates: OfficeFile[]; recent: OfficeFile[]; onOpen: (f: OfficeFile) => void; onBlank: () => void; onBrowse?: () => void }) {
  const tile = (label: string, sub: string, body: ReactNode, onClick: () => void) => (
    <button key={sub + label} type="button" onClick={onClick} className="of-btn" title={sub} style={{ width: 150, display: "grid", gap: 6, padding: 0, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", fontFamily: W.font, color: W.ink }}>
      <span style={{ display: "block", height: 190, overflow: "hidden", border: `1px solid ${W.edge}`, borderRadius: 4, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>{body}</span>
      <b style={{ fontSize: 14, fontWeight: 600 }}>{label}</b>
      <span style={{ fontSize: 12.5, color: W.muted, marginTop: -4 }}>{sub}</span>
    </button>
  );
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40, padding: "0 12px", background: W.word, color: "#fff", fontSize: 14, flexShrink: 0 }}>
        <b>Word</b>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "22px 28px 30px", background: "#faf9f8" }}>
        <h2 style={{ margin: 0, fontSize: 26, fontWeight: 400 }}>Good morning</h2>
        <p style={{ margin: "18px 0 10px", fontSize: 15, fontWeight: 600 }}>New</p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {tile("Blank document", "A new, empty page", <span style={{ display: "block", height: "100%", background: "#fff" }} />, onBlank)}
          {templates.map((t) =>
            tile(
              t.name.replace(/\.dotx$/i, ""),
              `Template · ${t.path.join(" > ")}`,
              t.doc ? (
                <span style={{ display: "block", zoom: 0.19 } as CSSProperties}>
                  <DocSheet doc={t.doc} />
                </span>
              ) : null,
              () => onOpen(t),
            ),
          )}
        </div>
        <p style={{ margin: "26px 0 8px", fontSize: 15, fontWeight: 600 }}>Recent</p>
        {recent.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14.5, color: W.muted }}>No documents yet.</p>
        ) : (
          <div role="list" style={{ display: "grid", border: `1px solid ${W.edge}`, borderRadius: 6, background: "#fff", maxWidth: 720 }}>
            {recent.map((f) => (
              <button key={f.id} type="button" role="listitem" className="of-row" onClick={() => onOpen(f)} style={{ display: "grid", gridTemplateColumns: "26px minmax(0, 1fr) 120px", alignItems: "center", gap: 10, minHeight: 46, padding: "4px 14px", border: "none", borderBottom: `1px solid ${W.edge}`, background: "transparent", textAlign: "left", fontFamily: W.font, color: W.ink }}>
                <span style={{ width: 20, height: 20, borderRadius: 3, background: W.word, color: "#fff", fontSize: 11, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>W</span>
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontSize: 14.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span style={{ display: "block", fontSize: 12.5, color: W.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.path.join(" > ")}</span>
                </span>
                <span style={{ fontSize: 12.5, color: W.muted }}>{f.modified}</span>
              </button>
            ))}
          </div>
        )}
        {onBrowse && (
          <p style={{ margin: "16px 0 0" }}>
            <AppButton onClick={onBrowse}>Open other documents in File Explorer</AppButton>
          </p>
        )}
      </div>
    </>
  );
}

/* Save As, the Word way: a place, a name, and what to save it as (a Word
 * document or a PDF). Built on the office's own places, so it shows the
 * same OneDrive and SharePoint sites as File Explorer. */
export function SaveDialog({ state, type: startType, name: startName, at: startAt, note, onCancel, onSave }: { state: OfficeAppProps["state"]; type: SaveType; name: string; at: Path; note?: string; onCancel: () => void; onSave: (path: Path, name: string, type: SaveType, openAfter: boolean, replaceId?: string) => void }) {
  const [at, setAt] = useState<Path>(startAt);
  const [name, setName] = useState(startName);
  const [type, setType] = useState<SaveType>(startType);
  const [openAfter, setOpenAfter] = useState(true);
  const [confirm, setConfirm] = useState<string | null>(null);
  const items = listFolder(state, at);
  const ext = type === "pdf" ? ".pdf" : ".docx";
  const full = `${name.trim().replace(/\.(docx|dotx|doc|pdf)$/i, "")}${ext}`;
  const allowed = canSaveIn(at) && folderExists(state, at);
  const clash = items.find((f) => f.kind !== "folder" && f.name.toLowerCase() === full.toLowerCase());

  const go = (p: Path) => {
    setAt(p);
    setConfirm(null);
  };
  const save = () => {
    if (!name.trim() || !allowed) return;
    if (clash && confirm !== full) return setConfirm(full);
    onSave(at, full, type, openAfter, clash?.id);
  };

  return (
    <Dialog title={type === "pdf" ? "Save as PDF" : "Save as"} onClose={onCancel} width={840}>
      {note && <p style={{ margin: "0 0 12px", padding: "10px 12px", borderRadius: 6, background: "#fff4ce", fontSize: 14.5 }}>{note}</p>}
      <div style={{ display: "flex", height: 320, border: `1px solid ${W.edge}`, borderRadius: 8, overflow: "hidden" }}>
        <PlacesNav at={at} go={go} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Breadcrumb at={at} go={go} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            <FileList
              items={items}
              dimFiles
              onPick={(f) => {
                if (f.kind !== "folder" && (f.kind === type || (type === "docx" && f.kind === "docx"))) setName(f.name.replace(/\.(docx|pdf)$/i, ""));
              }}
              onOpen={(f) => f.kind === "folder" && go([...f.path, f.name])}
            />
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "110px minmax(0, 1fr)", alignItems: "center", gap: "10px 12px", marginTop: 14, fontSize: 15 }}>
        <label htmlFor="wd-save-name" style={{ color: W.muted }}>
          File name
        </label>
        <input
          id="wd-save-name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setConfirm(null);
          }}
          onKeyDown={(e) => e.key === "Enter" && save()}
          style={{ minHeight: 40, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 16, color: W.ink, background: W.page, minWidth: 0 }}
        />
        <label htmlFor="wd-save-type" style={{ color: W.muted }}>
          Save as type
        </label>
        <select
          id="wd-save-type"
          value={type}
          onChange={(e) => {
            setType(e.target.value as SaveType);
            setConfirm(null);
          }}
          style={{ minHeight: 40, padding: "4px 8px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 15, color: W.ink, background: W.page, minWidth: 0 }}
        >
          <option value="docx">Word Document (*.docx)</option>
          <option value="pdf">PDF (*.pdf)</option>
        </select>
        {type === "pdf" && (
          <>
            <span />
            <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14.5, minHeight: 32 }}>
              <input type="checkbox" checked={openAfter} onChange={(e) => setOpenAfter(e.target.checked)} style={{ width: 18, height: 18 }} />
              Open file after publishing
            </label>
          </>
        )}
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 13.5, color: W.muted }}>
        Saving to {pathText(at)} as <b style={{ color: W.ink }}>{name.trim() ? full : "…"}</b>
      </p>
      {!allowed && at.length >= 2 && (
        <p role="alert" style={{ margin: "10px 0 0", padding: "10px 12px", borderRadius: 6, background: "#fde7e9", fontSize: 14.5 }}>
          You can open files in {pathText(at)}, but not save here. {at[0] === "HR" ? "On the HR site, only Forms > Completed takes new files." : "Pick a folder you can edit."}
        </p>
      )}
      {confirm && clash && (
        <p role="alert" style={{ margin: "10px 0 0", padding: "10px 12px", borderRadius: 6, background: "#fff4ce", fontSize: 14.5 }}>
          &ldquo;{clash.name}&rdquo; already exists here. Press Save again to replace it, or change the name.
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <AppButton onClick={onCancel}>Cancel</AppButton>
        <AppButton primary colour={W.word} onClick={save} disabled={!name.trim() || !allowed}>
          Save
        </AppButton>
      </div>
    </Dialog>
  );
}
