"use client";

import { useState } from "react";
import { W } from "../../tokens";
import { Breadcrumb, FileList, PlacePicker, PlacesNav } from "../places";
import { listFolder, type Action } from "../store";
import { pathText, type OfficeFile, type OfficeState, type Path } from "../types";
import { AppButton, Dialog, TitleBar } from "../ui";

/* File Explorer, with OneDrive and the team's SharePoint sites in one
 * place, as Windows shows them once OneDrive syncs a site. Open, rename,
 * move, delete and make a folder: enough to put a mistake right, which is
 * the point (criteria WIN-4, WIN-5, SP-2, SP-3). */

export default function Explorer({ state, dispatch, onOpen }: { state: OfficeState; dispatch: (a: Action) => void; onOpen: (f: OfficeFile) => void }) {
  const [at, setAt] = useState<Path>(["OneDrive", "Documents"]);
  const [selected, setSelected] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const items = listFolder(state, at);
  const sel = state.files.find((f) => f.id === selected) ?? null;
  const go = (p: Path) => {
    setAt(p);
    setSelected(null);
  };
  const open = (f: OfficeFile) => (f.kind === "folder" ? go([...f.path, f.name]) : onOpen(f));
  /* Seeded team files are other people's: the learner can open them but
   * not rename, move or delete them. */
  const theirs = !!sel?.seeded;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: W.page }}>
      <TitleBar colour="#2b2b2b" app="File Explorer" name={pathText(at)} />
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "8px 10px", borderBottom: `1px solid ${W.edge}`, background: W.chrome }}>
        <AppButton onClick={() => sel && open(sel)} disabled={!sel}>
          Open
        </AppButton>
        <AppButton onClick={() => sel && setRenaming(sel.name)} disabled={!sel || theirs}>
          Rename
        </AppButton>
        <AppButton onClick={() => setMoving(true)} disabled={!sel || theirs}>
          Move to
        </AppButton>
        <AppButton onClick={() => setDeleting(true)} disabled={!sel || theirs}>
          Delete
        </AppButton>
        <span style={{ width: 1, alignSelf: "stretch", background: W.edge, margin: "0 4px" }} />
        <AppButton onClick={() => setFolderName("New folder")} disabled={at.length < 2 && at[0] === "OneDrive"}>
          + New folder
        </AppButton>
        {sel && theirs && <span style={{ fontSize: 13.5, color: W.muted }}>{sel.by === "You" ? "" : `This is ${sel.by}'s file. You can open it, not change it.`}</span>}
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <PlacesNav at={at} go={go} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Breadcrumb at={at} go={go} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            <FileList items={items} selected={selected} onPick={(f) => setSelected(f.id)} onOpen={open} />
          </div>
          <div style={{ padding: "6px 14px", borderTop: `1px solid ${W.edge}`, fontSize: 13, color: W.muted }}>
            {items.length} {items.length === 1 ? "item" : "items"}
            {sel ? ` · ${sel.name} selected` : " · double-click to open"}
          </div>
        </div>
      </div>

      {renaming !== null && sel && (
        <Dialog title={`Rename ${sel.kind === "folder" ? "folder" : "file"}`} onClose={() => setRenaming(null)} width={520}>
          <input
            autoFocus
            value={renaming}
            onChange={(e) => setRenaming(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && renaming.trim()) {
                dispatch({ type: "rename", id: sel.id, name: keepExtension(sel, renaming.trim()) });
                setRenaming(null);
              }
            }}
            aria-label="New name"
            style={{ width: "100%", minHeight: 42, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 16, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <AppButton onClick={() => setRenaming(null)}>Cancel</AppButton>
            <AppButton
              primary
              disabled={!renaming.trim()}
              onClick={() => {
                dispatch({ type: "rename", id: sel.id, name: keepExtension(sel, renaming.trim()) });
                setRenaming(null);
              }}
            >
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
            dispatch({ type: "move", id: sel.id, to });
            setMoving(false);
            go(to);
          }}
        />
      )}
      {deleting && sel && (
        <Dialog title="Delete" onClose={() => setDeleting(false)} width={480}>
          <p style={{ margin: 0, fontSize: 16 }}>Delete &ldquo;{sel.name}&rdquo;{sel.kind === "folder" ? " and everything in it" : ""}?</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
            <AppButton onClick={() => setDeleting(false)}>Cancel</AppButton>
            <AppButton
              primary
              colour="#c4314b"
              onClick={() => {
                dispatch({ type: "delete", id: sel.id });
                setDeleting(false);
                setSelected(null);
              }}
            >
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
            onChange={(e) => setFolderName(e.target.value)}
            aria-label="Folder name"
            style={{ width: "100%", minHeight: 42, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 16, boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 14 }}>
            <AppButton onClick={() => setFolderName(null)}>Cancel</AppButton>
            <AppButton
              primary
              disabled={!folderName.trim()}
              onClick={() => {
                dispatch({ type: "newFolder", path: at, name: folderName.trim() });
                setFolderName(null);
              }}
            >
              Create
            </AppButton>
          </div>
        </Dialog>
      )}
    </div>
  );
}

/* Typing a new name without ".xlsx" keeps the file an Excel file, as
 * Windows warns you it would otherwise break. */
function keepExtension(f: OfficeFile, name: string) {
  if (f.kind === "folder") return name;
  const ext = f.name.slice(f.name.lastIndexOf("."));
  return name.toLowerCase().endsWith(ext.toLowerCase()) ? name : `${name.replace(/\.[a-z]{3,4}$/i, "")}${ext}`;
}
