"use client";

import { useState, type CSSProperties, type DragEvent, type ReactNode } from "react";
import { W } from "../tokens";
import { isShared } from "./files";
import { ROOTS } from "./northfield";
import { folderExists, listFolder } from "./store";
import { pathText, samePath, type OfficeFile, type OfficeState, type Path } from "./types";
import { AppButton, Dialog, FileGlyph, KIND_LABEL } from "./ui";

/* Where files live, and the three dialogs that choose a place: Save as
 * (a folder and a name), pick a file (Insert link, Attach) and pick a
 * folder (Move to). They share the same left-hand list of places as File
 * Explorer, so a learner learns one map of the office. */

const QUICK: { label: string; path: Path; site?: boolean }[] = [
  { label: "Documents", path: ["OneDrive", "Documents"] },
  { label: "Desktop", path: ["OneDrive", "Desktop"] },
  { label: "Downloads", path: ["OneDrive", "Downloads"] },
  ...ROOTS.filter((r) => r.site).map((r) => ({ label: r.label, path: [r.name] as Path, site: true })),
];

export function PlacesNav({ at, go, extra, onDropPath }: { at: Path; go: (p: Path) => void; extra?: ReactNode; onDropPath?: (id: string, to: Path) => void }) {
  return (
    <nav aria-label="Places" style={{ width: 196, flexShrink: 0, padding: "10px 8px", borderRight: `1px solid ${W.edge}`, background: W.chrome, overflowY: "auto", fontFamily: W.font, display: "flex", flexDirection: "column" }}>
      <p style={{ margin: "4px 10px 6px", fontSize: 12.5, fontWeight: 700, color: W.muted }}>OneDrive - Northfield</p>
      {QUICK.filter((q) => !q.site).map((q) => (
        <PlaceButton key={q.label} label={q.label} on={samePath(at, q.path) || (at.length > q.path.length && q.path.every((x, i) => at[i] === x))} onClick={() => go(q.path)} onDrop={onDropPath && ((id) => onDropPath(id, q.path))} />
      ))}
      <p style={{ margin: "14px 10px 6px", fontSize: 12.5, fontWeight: 700, color: W.muted }}>SharePoint sites</p>
      {QUICK.filter((q) => q.site).map((q) => (
        <PlaceButton key={q.label} label={q.label} site on={at[0] === q.path[0]} onClick={() => go(q.path)} />
      ))}
      {extra}
    </nav>
  );
}

function PlaceButton({ label, on, site, onClick, onDrop }: { label: string; on: boolean; site?: boolean; onClick: () => void; onDrop?: (id: string) => void }) {
  const drop = useDropTarget(onDrop);
  return (
    <button
      type="button"
      onClick={onClick}
      {...drop.props}
      className={on ? "of-row on" : "of-row"}
      style={{ width: "100%", minHeight: 38, display: "flex", alignItems: "center", gap: 9, padding: "6px 10px", border: "none", borderRadius: 6, background: on || drop.over ? W.select : "transparent", outline: drop.over ? `2px solid ${W.outlook}` : undefined, outlineOffset: -2, color: W.ink, fontFamily: W.font, fontSize: 14.5, fontWeight: on ? 600 : 400, textAlign: "left" }}
    >
      {site ? (
        <span aria-hidden style={{ width: 20, height: 20, borderRadius: 5, background: "#03787c", color: "#fff", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {label.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </span>
      ) : (
        <FileGlyph kind="folder" size={18} />
      )}
      {label}
    </button>
  );
}

/* The path as clickable steps, with an Up button. */
export function Breadcrumb({ at, go, onDropPath }: { at: Path; go: (p: Path) => void; onDropPath?: (id: string, to: Path) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "4px 10px", borderBottom: `1px solid ${W.edge}`, fontFamily: W.font, fontSize: 15, flexWrap: "wrap" }}>
      <AppButton onClick={() => at.length > 1 && go(at.slice(0, -1))} disabled={at.length <= 1} title="Up one folder" style={{ minHeight: 34, padding: "2px 10px" }}>
        ↑ Up
      </AppButton>
      {at.map((part, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ color: W.faint }}>›</span>}
          <Crumb onDrop={onDropPath && i < at.length - 1 ? (id) => onDropPath(id, at.slice(0, i + 1)) : undefined} onClick={() => go(at.slice(0, i + 1))} style={{ border: "none", background: "transparent", padding: "4px 2px", fontFamily: W.font, fontSize: 15, color: i === at.length - 1 ? W.ink : W.muted, fontWeight: i === at.length - 1 ? 600 : 400, cursor: "pointer" }}>
            {part === "OneDrive" ? "OneDrive - Northfield" : part}
          </Crumb>
        </span>
      ))}
    </div>
  );
}

/* A folder's contents as a details list. `onPick` fires on a single
 * click, `onOpen` on a double click or Enter. */
export function FileList({
  items,
  selected,
  onPick,
  onOpen,
  dimFiles,
  drag,
  onKey,
}: {
  items: OfficeFile[];
  selected?: string | null;
  onPick: (f: OfficeFile) => void;
  onOpen: (f: OfficeFile) => void;
  dimFiles?: boolean;
  /* ── Module 9 ── drag a file or folder onto a folder to move it there */
  drag?: DragSpec;
  /* F2, Delete and the like, on a row */
  onKey?: (f: OfficeFile, key: string) => void;
}) {
  return (
    <div role="listbox" aria-label="Files" style={{ fontFamily: W.font }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.4fr) 1fr 1.1fr", gap: 10, padding: "8px 14px", fontSize: 13, color: W.muted, borderBottom: `1px solid ${W.edge}` }}>
        <span>Name</span>
        <span>Modified</span>
        <span>Modified by</span>
      </div>
      {items.length === 0 && <p style={{ margin: 0, padding: "22px 14px", fontSize: 15, color: W.muted }}>This folder is empty.</p>}
      {items.map((f) => (
        <FileRow key={f.id} f={f} drag={drag}>
        {(dnd, over) => (
        <div
          {...dnd}
          role="option"
          aria-selected={selected === f.id}
          tabIndex={0}
          className={selected === f.id ? "of-row on" : "of-row"}
          onClick={() => onPick(f)}
          onDoubleClick={() => onOpen(f)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onOpen(f);
            else if (e.key === " ") {
              e.preventDefault();
              onPick(f);
            } else if (onKey && (e.key === "F2" || e.key === "Delete")) {
              e.preventDefault();
              onPick(f);
              onKey(f, e.key);
            }
          }}
          title={`${f.name} · ${KIND_LABEL[f.kind]}`}
          style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.4fr) 1fr 1.1fr", gap: 10, alignItems: "center", minHeight: 42, padding: "4px 14px", fontSize: 15, opacity: dimFiles && f.kind !== "folder" ? 0.45 : 1, outline: over ? `2px solid ${W.outlook}` : undefined, outlineOffset: -2, background: over ? W.select : undefined }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <FileGlyph kind={f.kind} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
            {isShared(f) && <SharedMark />}
          </span>
          <span style={{ color: W.muted, fontSize: 14 }}>{f.modified}</span>
          <span style={{ color: W.muted, fontSize: 14 }}>{f.by}</span>
        </div>
        )}
        </FileRow>
      ))}
    </div>
  );
}

type PickerMode = { kind: "saveAs"; name: string; at: Path } | { kind: "file"; title: string; action: string; at: Path } | { kind: "folder"; title: string; action: string; at: Path };

/* One dialog for all three choices. */
export function PlacePicker({
  state,
  mode,
  onCancel,
  onSave,
  onFile,
  onFolder,
}: {
  state: OfficeState;
  mode: PickerMode;
  onCancel: () => void;
  onSave?: (path: Path, name: string, replaceId?: string) => void;
  onFile?: (f: OfficeFile) => void;
  onFolder?: (path: Path) => void;
}) {
  const [at, setAt] = useState<Path>(mode.at);
  const [picked, setPicked] = useState<OfficeFile | null>(null);
  const [name, setName] = useState(mode.kind === "saveAs" ? mode.name : "");
  const [confirmReplace, setConfirmReplace] = useState<OfficeFile | null>(null);
  const items = listFolder(state, at);
  const go = (p: Path) => {
    setAt(p);
    setPicked(null);
  };
  const open = (f: OfficeFile) => {
    if (f.kind === "folder") go([...f.path, f.name]);
    else if (mode.kind === "file") onFile?.(f);
  };

  const fullName = (n: string) => (/\.xlsx$/i.test(n.trim()) ? n.trim() : `${n.trim().replace(/\.(xltx|xls)$/i, "")}.xlsx`);
  const save = () => {
    if (!name.trim()) return;
    const finalName = fullName(name);
    const clash = items.find((f) => f.kind !== "folder" && f.name.toLowerCase() === finalName.toLowerCase());
    if (clash && !confirmReplace) {
      setConfirmReplace(clash);
      return;
    }
    onSave?.(at, finalName, clash?.id);
  };

  const title = mode.kind === "saveAs" ? "Save as" : mode.title;
  return (
    <Dialog title={title} onClose={onCancel} width={820}>
      <div style={{ display: "flex", height: 360, border: `1px solid ${W.edge}`, borderRadius: 8, overflow: "hidden" }}>
        <PlacesNav at={at} go={go} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Breadcrumb at={at} go={go} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            <FileList
              items={items}
              selected={picked?.id}
              dimFiles={mode.kind !== "file"}
              onPick={(f) => {
                if (f.kind === "folder") return setPicked(f);
                if (mode.kind === "file") setPicked(f);
                if (mode.kind === "saveAs") setName(f.name);
              }}
              onOpen={open}
            />
          </div>
        </div>
      </div>
      {mode.kind === "saveAs" && (
        <label style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 14, fontSize: 15 }}>
          <span style={{ width: 84, color: W.muted }}>File name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setConfirmReplace(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && save()}
            aria-label="File name"
            style={{ flex: 1, minHeight: 40, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 16, color: W.ink, background: W.page }}
          />
        </label>
      )}
      {mode.kind === "saveAs" && <p style={{ margin: "8px 0 0 96px", fontSize: 13.5, color: W.muted }}>Saving to {pathText(at)}</p>}
      {confirmReplace && (
        <p role="alert" style={{ margin: "12px 0 0", padding: "10px 12px", borderRadius: 6, background: "#fff4ce", fontSize: 14.5 }}>
          &ldquo;{confirmReplace.name}&rdquo; already exists here. Press Save again to replace it, or change the name.
        </p>
      )}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16 }}>
        <AppButton onClick={onCancel}>Cancel</AppButton>
        {mode.kind === "saveAs" && (
          <AppButton primary colour={W.excel} onClick={save} disabled={!name.trim() || !folderExists(state, at) || at.length < 2}>
            Save
          </AppButton>
        )}
        {mode.kind === "file" && (
          <AppButton primary onClick={() => picked && picked.kind !== "folder" && onFile?.(picked)} disabled={!picked || picked.kind === "folder"}>
            {mode.action}
          </AppButton>
        )}
        {mode.kind === "folder" && (
          <AppButton primary onClick={() => onFolder?.(picked?.kind === "folder" ? [...picked.path, picked.name] : at)} disabled={at.length < 1}>
            {mode.action}
            {picked?.kind === "folder" ? ` to ${picked.name}` : " here"}
          </AppButton>
        )}
      </div>
    </Dialog>
  );
}

/* ── Module 9: Files and sharing ── drag and drop, and the sharing mark */

const DRAG_TYPE = "application/x-northfield-file";

type DragSpec = { can: (f: OfficeFile) => boolean; onDrop: (id: string, to: Path) => void };

/* A place a dragged file can be dropped on: a folder row, a step of the
 * path, a place in the list. Lit while a file is held over it. */
function useDropTarget(onDrop?: (id: string) => void) {
  const [over, setOver] = useState(false);
  if (!onDrop) return { over: false, props: {} };
  const has = (e: DragEvent) => e.dataTransfer.types.includes(DRAG_TYPE);
  return {
    over,
    props: {
      onDragOver: (e: DragEvent) => {
        if (!has(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!over) setOver(true);
      },
      onDragLeave: () => setOver(false),
      onDrop: (e: DragEvent) => {
        setOver(false);
        const id = e.dataTransfer.getData(DRAG_TYPE);
        if (id) {
          e.preventDefault();
          onDrop(id);
        }
      },
    },
  };
}

function Crumb({ onDrop, onClick, style, children }: { onDrop?: (id: string) => void; onClick: () => void; style: CSSProperties; children: ReactNode }) {
  const drop = useDropTarget(onDrop);
  return (
    <button type="button" onClick={onClick} {...drop.props} style={{ ...style, borderRadius: 4, background: drop.over ? W.select : style.background, outline: drop.over ? `2px solid ${W.outlook}` : undefined }}>
      {children}
    </button>
  );
}

/* One row of a folder: draggable when it can be moved, and a drop target
 * when it is a folder. */
function FileRow({ f, drag, children }: { f: OfficeFile; drag?: DragSpec; children: (dnd: Record<string, unknown>, over: boolean) => ReactNode }) {
  const drop = useDropTarget(drag && f.kind === "folder" ? (id) => id !== f.id && drag.onDrop(id, [...f.path, f.name]) : undefined);
  const canDrag = !!drag?.can(f);
  const dnd: Record<string, unknown> = {
    ...drop.props,
    draggable: canDrag || undefined,
    onDragStart: canDrag
      ? (e: DragEvent) => {
          e.dataTransfer.setData(DRAG_TYPE, f.id);
          e.dataTransfer.effectAllowed = "move";
        }
      : undefined,
  };
  return <>{children(dnd, drop.over)}</>;
}

/* The two-people mark File Explorer and SharePoint put beside a shared file. */
export function SharedMark({ size = 16 }: { size?: number }) {
  return (
    <span title="Shared" aria-label="Shared" style={{ display: "inline-flex", flexShrink: 0, color: W.muted }}>
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block" }}>
        <circle cx="9" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M2.8 19.5 C3.4 15.6 5.9 13.6 9 13.6 C12.1 13.6 14.6 15.6 15.2 19.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="16.6" cy="9" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M17.2 13.9 C19.4 14.2 20.9 15.9 21.3 18.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}
