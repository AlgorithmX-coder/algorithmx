"use client";

import { useState, type ReactNode } from "react";
import { W } from "../../tokens";
import { accessFor, recycle, restoreItem, restoreVersion, SITE_MEMBERS } from "../files";
import { YOU } from "../northfield";
import { Breadcrumb, FileList, PlacePicker, PlacesNav } from "../places";
import { listFolder, type Action } from "../store";
import { pathText, samePath, type OfficeFile, type OfficeState, type Path } from "../types";
import { AppButton, Dialog, FileGlyph, TitleBar } from "../ui";
import { canSaveIn } from "../word";
import { ShareDialog } from "./Share";
import { VersionHistory } from "./Versions";

/* File Explorer, with OneDrive and the team's SharePoint sites in one
 * place, as Windows shows them once OneDrive syncs a site (criteria WIN-4,
 * WIN-5, SP-2, SP-3). Open, rename, move (Move to, or drag a file onto a
 * folder), make a folder, and delete to the Recycle bin, from where it can
 * be put back.
 *
 * ── Module 9: Files and sharing ── the command bar SharePoint has: Share,
 * Copy link and Version history (SP-5, SP-6, SP-7), a sharing mark on
 * shared files, a line saying whose place you are in (your OneDrive or a
 * team's site), and the Recycle bin. F2 renames and Delete deletes, as in
 * Windows. */

const BIN = "Recycle bin";

export default function Explorer({ state, dispatch, onOpen, start }: { state: OfficeState; dispatch: (a: Action) => void; onOpen: (f: OfficeFile) => void; start?: Path }) {
  const [at, setAt] = useState<Path>(start ?? ["OneDrive", "Documents"]);
  const [selected, setSelected] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [share, setShare] = useState<{ id: string; start: "share" | "copy" | "access" } | null>(null);
  const [history, setHistory] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const inBin = at[0] === BIN;
  const bin = state.recycle ?? [];
  const items = inBin ? [] : listFolder(state, at);
  const sel = items.find((f) => f.id === selected) ?? null;
  const binSel = inBin ? bin.find((b) => b.id === selected) ?? null : null;
  const go = (p: Path) => {
    setAt(p);
    setSelected(null);
  };
  const open = (f: OfficeFile) => (f.kind === "folder" ? go([...f.path, f.name]) : onOpen(f));
  /* Seeded team files are other people's: the learner can open them but
   * not rename, move or delete them, unless the job hands them over. */
  const mine = (f: OfficeFile | null) => !!f && (!f.seeded || !!f.editable);
  const theirs = !!sel && !mine(sel);
  const sharable = !!sel && sel.kind !== "folder" && accessFor(sel, YOU) === "edit" && canSaveIn(sel.path);
  const nameTaken = (path: Path, name: string, not?: string) => state.files.some((f) => f.id !== not && samePath(f.path, path) && f.name.toLowerCase() === name.toLowerCase());

  const move = (id: string, to: Path) => {
    const f = state.files.find((x) => x.id === id);
    if (!f || !mine(f) || samePath(f.path, to)) return;
    if (f.kind === "folder" && to.length > f.path.length && [...f.path, f.name].every((x, i) => to[i] === x)) return setProblem(`"${f.name}" can't go inside itself.`);
    if (!canSaveIn(to)) return setProblem(`You can open files in ${pathText(to)}, but not put files there.`);
    if (nameTaken(to, f.name)) return setProblem(`There's already something called "${f.name}" in ${pathText(to)}. Rename one of them first, or delete the one you don't need.`);
    dispatch({ type: "move", id, to });
    setSelected(id);
  };
  const rename = (name: string) => {
    if (!sel) return;
    const next = keepExtension(sel, name);
    if (nameTaken(sel.path, next, sel.id)) return setProblem(`There's already a file called "${next}" in this folder. Pick another name.`);
    dispatch({ type: "rename", id: sel.id, name: next });
    setRenaming(null);
  };
  const remove = () => {
    if (!sel) return;
    dispatch({ type: "update", fn: (s) => recycle(s, sel.id) });
    setDeleting(false);
    setSelected(null);
  };

  const place = placeLine(at);

  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%", background: W.page, color: W.ink, fontFamily: W.font }}>
      <TitleBar colour="#2b2b2b" app="File Explorer" name={inBin ? BIN : pathText(at)} />
      <div role="toolbar" aria-label="Commands" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 4, padding: "6px 8px", borderBottom: `1px solid ${W.edge}`, background: W.chrome }}>
        {inBin ? (
          <>
            <Cmd icon={Ico.restore} onClick={() => binSel && (dispatch({ type: "update", fn: (s) => restoreItem(s, binSel.id) }), setSelected(null))} disabled={!binSel}>
              Restore
            </Cmd>
            <span style={{ fontSize: 13.5, color: W.muted, marginLeft: 6 }}>Deleted files wait here for 93 days, then they&apos;re gone for good.</span>
          </>
        ) : (
          <>
            <Cmd icon={Ico.newFolder} onClick={() => setFolderName("New folder")} disabled={at.length < 2 || !canSaveIn(at)}>
              New folder
            </Cmd>
            <Sep />
            <Cmd icon={Ico.open} onClick={() => sel && open(sel)} disabled={!sel}>
              Open
            </Cmd>
            <Cmd icon={Ico.share} onClick={() => sel && setShare({ id: sel.id, start: "share" })} disabled={!sharable}>
              Share
            </Cmd>
            <Cmd icon={Ico.link} onClick={() => sel && setShare({ id: sel.id, start: "copy" })} disabled={!sharable}>
              Copy link
            </Cmd>
            <Sep />
            <Cmd icon={Ico.move} onClick={() => setMoving(true)} disabled={!sel || theirs}>
              Move to
            </Cmd>
            <Cmd icon={Ico.rename} onClick={() => sel && setRenaming(sel.name)} disabled={!sel || theirs}>
              Rename
            </Cmd>
            <Cmd icon={Ico.bin} onClick={() => setDeleting(true)} disabled={!sel || theirs}>
              Delete
            </Cmd>
            <Sep />
            <Cmd icon={Ico.history} onClick={() => sel && setHistory(sel.id)} disabled={!sel || sel.kind === "folder"}>
              Version history
            </Cmd>
          </>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <PlacesNav
          at={inBin ? [] : at}
          go={go}
          onDropPath={move}
          extra={
            <button type="button" onClick={() => go([BIN])} className={inBin ? "of-row on" : "of-row"} style={{ marginTop: "auto", width: "100%", minHeight: 38, display: "flex", alignItems: "center", gap: 9, padding: "6px 10px", border: "none", borderTop: `1px solid ${W.edge}`, borderRadius: 6, background: inBin ? W.select : "transparent", color: W.ink, fontFamily: W.font, fontSize: 14.5, fontWeight: inBin ? 600 : 400, textAlign: "left" }}>
              <span style={{ display: "inline-flex", color: W.muted }}>{Ico.bin}</span>
              {BIN}
              {bin.length > 0 && <span style={{ marginLeft: "auto", fontSize: 13, color: W.muted }}>{bin.length}</span>}
            </button>
          }
        />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          {inBin ? (
            <div style={{ display: "flex", alignItems: "center", minHeight: 44, padding: "4px 14px", borderBottom: `1px solid ${W.edge}`, fontSize: 15, fontWeight: 600 }}>{BIN}</div>
          ) : (
            <Breadcrumb at={at} go={go} onDropPath={move} />
          )}
          {place && !inBin && (
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", fontSize: 13.5, color: W.body, background: place.site ? "#eef6f6" : "#f3eefb", borderBottom: `1px solid ${W.edge}` }}>
              <span aria-hidden style={{ display: "inline-flex", color: place.site ? "#03787c" : "#6b3fb3" }}>{place.site ? Ico.team : Ico.person}</span>
              {place.text}
            </p>
          )}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {inBin ? (
              <BinList items={bin} selected={selected} onPick={setSelected} />
            ) : (
              <FileList
                items={items}
                selected={selected}
                onPick={(f) => setSelected(f.id)}
                onOpen={open}
                drag={{ can: mine, onDrop: move }}
                onKey={(f, key) => {
                  if (!mine(f)) return;
                  if (key === "F2") setRenaming(f.name);
                  if (key === "Delete") setDeleting(true);
                }}
              />
            )}
          </div>
          <div style={{ padding: "6px 14px", borderTop: `1px solid ${W.edge}`, fontSize: 13, color: W.muted }}>
            {inBin ? `${bin.length} ${bin.length === 1 ? "item" : "items"}${binSel ? ` · ${binSel.file.name} selected` : ""}` : `${items.length} ${items.length === 1 ? "item" : "items"}${sel ? ` · ${sel.name} selected${theirs && sel.by !== "You" ? `. It belongs to ${sel.by}: you can open it, not change it.` : ""}` : items.length ? " · double-click to open, or drag a file onto a folder" : ""}`}
          </div>
        </div>
      </div>

      {renaming !== null && sel && (
        <Dialog title={`Rename ${sel.kind === "folder" ? "folder" : "file"}`} onClose={() => setRenaming(null)} width={520}>
          <input
            autoFocus
            value={renaming}
            onFocus={(e) => {
              /* select the name but not its ending, as Windows does */
              const dot = sel.kind === "folder" ? -1 : e.currentTarget.value.lastIndexOf(".");
              e.currentTarget.setSelectionRange(0, dot > 0 ? dot : e.currentTarget.value.length);
            }}
            onChange={(e) => setRenaming(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && renaming.trim()) rename(renaming.trim());
              if (e.key === "Escape") setRenaming(null);
            }}
            aria-label="New name"
            style={{ width: "100%", minHeight: 42, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 16, boxSizing: "border-box" }}
          />
          {sel.kind !== "folder" && <p style={{ margin: "8px 0 0", fontSize: 13.5, color: W.muted }}>The ending ({sel.name.slice(sel.name.lastIndexOf("."))}) says what kind of file it is. It stays the same.</p>}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <AppButton onClick={() => setRenaming(null)}>Cancel</AppButton>
            <AppButton primary disabled={!renaming.trim()} onClick={() => rename(renaming.trim())}>
              Rename
            </AppButton>
          </div>
        </Dialog>
      )}
      {moving && sel && (
        <PlacePicker
          state={state}
          mode={{ kind: "folder", title: `Move "${sel.name}"`, action: "Move", at }}
          onCancel={() => setMoving(false)}
          onFolder={(to) => {
            setMoving(false);
            move(sel.id, to);
          }}
        />
      )}
      {deleting && sel && (
        <Dialog title="Delete" onClose={() => setDeleting(false)} width={480}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
            Delete &ldquo;{sel.name}&rdquo;{sel.kind === "folder" ? " and everything in it" : ""}? It goes to the Recycle bin, so you can put it back if you need to.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <AppButton onClick={() => setDeleting(false)}>Cancel</AppButton>
            <AppButton primary colour="#c4314b" onClick={remove}>
              Delete
            </AppButton>
          </div>
        </Dialog>
      )}
      {folderName !== null && (
        <Dialog title="New folder" onClose={() => setFolderName(null)} width={480}>
          <input
            autoFocus
            value={folderName}
            onFocus={(e) => e.currentTarget.select()}
            onChange={(e) => setFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && folderName.trim()) makeFolder(folderName.trim());
              if (e.key === "Escape") setFolderName(null);
            }}
            aria-label="Folder name"
            style={{ width: "100%", minHeight: 42, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 16, boxSizing: "border-box" }}
          />
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: W.muted }}>In {pathText(at)}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <AppButton onClick={() => setFolderName(null)}>Cancel</AppButton>
            <AppButton primary disabled={!folderName.trim()} onClick={() => makeFolder(folderName.trim())}>
              Create
            </AppButton>
          </div>
        </Dialog>
      )}
      {problem && (
        <Dialog title="File Explorer" onClose={() => setProblem(null)} width={480}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{problem}</p>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
            <AppButton primary onClick={() => setProblem(null)}>
              OK
            </AppButton>
          </div>
        </Dialog>
      )}
      {share && <ShareDialog key={`${share.id}-${share.start}`} state={state} fileId={share.id} dispatch={dispatch} start={share.start} onClose={() => setShare(null)} />}
      {history && state.files.some((f) => f.id === history) && (
        <VersionHistory
          file={state.files.find((f) => f.id === history)!}
          canRestore={mine(state.files.find((f) => f.id === history) ?? null)}
          onRestore={(index) => dispatch({ type: "update", fn: (s) => restoreVersion(s, history, index) })}
          onClose={() => setHistory(null)}
        />
      )}
    </div>
  );

  function makeFolder(name: string) {
    if (nameTaken(at, name)) return setProblem(`There's already a folder called "${name}" here.`);
    dispatch({ type: "newFolder", path: at, name });
    setFolderName(null);
  }
}

/* Typing a new name without ".xlsx" keeps the file an Excel file, as
 * Windows warns you it would otherwise break. */
function keepExtension(f: OfficeFile, name: string) {
  if (f.kind === "folder") return name;
  const ext = f.name.slice(f.name.lastIndexOf("."));
  return name.toLowerCase().endsWith(ext.toLowerCase()) ? name : `${name.replace(/\.[a-z]{3,4}$/i, "")}${ext}`;
}

/* Whose place this is, in a line under the path (SP-1). */
function placeLine(at: Path): { site: boolean; text: string } | null {
  if (!at.length) return null;
  if (at[0] === "OneDrive") return { site: false, text: "Your OneDrive: only you can open these files, unless you share one. For your own drafts." };
  const members = SITE_MEMBERS[at[0]];
  if (!members) return null;
  if (at[0] === "HR") return { site: true, text: "HR's team site on SharePoint: everyone can open these, only HR can change them (you can save in Forms > Completed)." };
  return { site: true, text: `${at[0]}'s team site on SharePoint: everyone in the team can open these files. For anything the team needs.` };
}

/* What's in the Recycle bin, with where each came from. */
function BinList({ items, selected, onPick }: { items: NonNullable<OfficeState["recycle"]>; selected: string | null; onPick: (id: string) => void }) {
  const cols = "minmax(0, 1.8fr) minmax(0, 1.6fr) 0.8fr";
  return (
    <div role="listbox" aria-label="Recycle bin" style={{ fontFamily: W.font }}>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 10, padding: "8px 14px", fontSize: 13, color: W.muted, borderBottom: `1px solid ${W.edge}` }}>
        <span>Name</span>
        <span>Original location</span>
        <span>Deleted</span>
      </div>
      {items.length === 0 && <p style={{ margin: 0, padding: "22px 14px", fontSize: 15, color: W.muted }}>The Recycle bin is empty.</p>}
      {items
        .slice()
        .reverse()
        .map((b) => (
          <div
            key={b.id}
            role="option"
            aria-selected={selected === b.id}
            tabIndex={0}
            className={selected === b.id ? "of-row on" : "of-row"}
            onClick={() => onPick(b.id)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(b.id))}
            style={{ display: "grid", gridTemplateColumns: cols, gap: 10, alignItems: "center", minHeight: 42, padding: "4px 14px", fontSize: 15 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
              <FileGlyph kind={b.file.kind} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.file.name}</span>
              {b.inside.length > 0 && <span style={{ fontSize: 13, color: W.muted, flexShrink: 0 }}>+{b.inside.length}</span>}
            </span>
            <span style={{ color: W.muted, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={pathText(b.file.path)}>
              {pathText(b.file.path)}
            </span>
            <span style={{ color: W.muted, fontSize: 14 }}>{b.deleted}</span>
          </div>
        ))}
    </div>
  );
}

function Sep() {
  return <span aria-hidden style={{ width: 1, alignSelf: "stretch", margin: "4px 4px", background: W.edge }} />;
}

/* A command bar button: a small drawn icon and a word, as SharePoint has. */
function Cmd({ icon, children, onClick, disabled }: { icon: ReactNode; children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="of-btn of-cmd" style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 40, padding: "4px 10px", border: "none", borderRadius: 6, background: "transparent", color: W.ink, fontFamily: W.font, fontSize: 14.5, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.42 : 1, whiteSpace: "nowrap" }}>
      <span style={{ display: "inline-flex", color: disabled ? W.muted : W.outlook }}>{icon}</span>
      {children}
    </button>
  );
}

const svg = (d: ReactNode) => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", flexShrink: 0 }}>
    {d}
  </svg>
);

/* The command bar's icons, drawn as a few lines each. */
export const Ico = {
  newFolder: svg(<path d="M3 7 A1.5 1.5 0 0 1 4.5 5.5 H9 L11 7.5 H19.5 A1.5 1.5 0 0 1 21 9 V17.5 A1.5 1.5 0 0 1 19.5 19 H4.5 A1.5 1.5 0 0 1 3 17.5 Z M12 10.5 V16 M9.25 13.25 H14.75" />),
  open: svg(<path d="M14 4 H20 V10 M20 4 L11 13 M18 14 V19 A1 1 0 0 1 17 20 H5 A1 1 0 0 1 4 19 V7 A1 1 0 0 1 5 6 H10" />),
  share: svg(<path d="M13 5 L20 11 L13 17 V13.5 C8.5 13.5 5.5 15 3.5 19 C4 13 7 9.5 13 8.5 Z" />),
  link: svg(<path d="M10 14 L14 10 M8.5 11.5 L6.6 13.4 A3.6 3.6 0 0 0 11.7 18.5 L13.6 16.6 M15.5 12.5 L17.4 10.6 A3.6 3.6 0 0 0 12.3 5.5 L10.4 7.4" />),
  move: svg(<path d="M3 7 A1.5 1.5 0 0 1 4.5 5.5 H9 L11 7.5 H19.5 A1.5 1.5 0 0 1 21 9 V17.5 A1.5 1.5 0 0 1 19.5 19 H4.5 A1.5 1.5 0 0 1 3 17.5 Z M8 13.5 H15.5 M12.5 10.5 L15.5 13.5 L12.5 16.5" />),
  rename: svg(<path d="M4 17 H11 M5 19.5 H10 M14 4 L19 9 L10.5 17.5 H7.5 V14.5 Z" />),
  bin: svg(<path d="M4 6.5 H20 M9 6.5 V4.5 H15 V6.5 M6 6.5 L7 20 H17 L18 6.5 M10 10 V16.5 M14 10 V16.5" />),
  history: svg(<path d="M4 12 A8 8 0 1 0 6.3 6.3 M4 4.5 V8.5 H8 M12 8 V12 L15 14" />),
  restore: svg(<path d="M4 12 A8 8 0 1 0 6.3 6.3 M4 4.5 V8.5 H8 M9 13 L12 10 L15 13 M12 10 V16" />),
  person: svg(<path d="M12 11.5 A3.6 3.6 0 1 0 12 4.3 A3.6 3.6 0 1 0 12 11.5 M5 20 C5.6 16 8.4 14 12 14 C15.6 14 18.4 16 19 20" />),
  team: svg(<path d="M9 11 A3.2 3.2 0 1 0 9 4.6 A3.2 3.2 0 1 0 9 11 M2.8 19.5 C3.4 15.6 5.9 13.6 9 13.6 C12.1 13.6 14.6 15.6 15.2 19.5 M16.6 11.7 A2.7 2.7 0 1 0 16.6 6.3 M17.2 13.9 C19.4 14.2 20.9 15.9 21.3 18.6" />),
};
