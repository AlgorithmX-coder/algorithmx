"use client";

import { useState } from "react";
import { W } from "../tokens";
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

export function PlacesNav({ at, go }: { at: Path; go: (p: Path) => void }) {
  return (
    <nav aria-label="Places" style={{ width: 196, flexShrink: 0, padding: "10px 8px", borderRight: `1px solid ${W.edge}`, background: W.chrome, overflowY: "auto", fontFamily: W.font }}>
      <p style={{ margin: "4px 10px 6px", fontSize: 12.5, fontWeight: 700, color: W.muted }}>OneDrive - Northfield</p>
      {QUICK.filter((q) => !q.site).map((q) => (
        <PlaceButton key={q.label} label={q.label} on={samePath(at, q.path) || (at.length > q.path.length && q.path.every((x, i) => at[i] === x))} onClick={() => go(q.path)} />
      ))}
      <p style={{ margin: "14px 10px 6px", fontSize: 12.5, fontWeight: 700, color: W.muted }}>SharePoint sites</p>
      {QUICK.filter((q) => q.site).map((q) => (
        <PlaceButton key={q.label} label={q.label} site on={at[0] === q.path[0]} onClick={() => go(q.path)} />
      ))}
    </nav>
  );
}

function PlaceButton({ label, on, site, onClick }: { label: string; on: boolean; site?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={on ? "of-row on" : "of-row"}
      style={{ width: "100%", minHeight: 38, display: "flex", alignItems: "center", gap: 9, padding: "6px 10px", border: "none", borderRadius: 6, background: on ? W.select : "transparent", color: W.ink, fontFamily: W.font, fontSize: 14.5, fontWeight: on ? 600 : 400, textAlign: "left" }}
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
export function Breadcrumb({ at, go }: { at: Path; go: (p: Path) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "4px 10px", borderBottom: `1px solid ${W.edge}`, fontFamily: W.font, fontSize: 15, flexWrap: "wrap" }}>
      <AppButton onClick={() => at.length > 1 && go(at.slice(0, -1))} disabled={at.length <= 1} title="Up one folder" style={{ minHeight: 34, padding: "2px 10px" }}>
        ↑ Up
      </AppButton>
      {at.map((part, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          {i > 0 && <span style={{ color: W.faint }}>›</span>}
          <button type="button" onClick={() => go(at.slice(0, i + 1))} style={{ border: "none", background: "transparent", padding: "4px 2px", fontFamily: W.font, fontSize: 15, color: i === at.length - 1 ? W.ink : W.muted, fontWeight: i === at.length - 1 ? 600 : 400, cursor: "pointer" }}>
            {part === "OneDrive" ? "OneDrive - Northfield" : part}
          </button>
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
}: {
  items: OfficeFile[];
  selected?: string | null;
  onPick: (f: OfficeFile) => void;
  onOpen: (f: OfficeFile) => void;
  dimFiles?: boolean;
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
        <div
          key={f.id}
          role="option"
          aria-selected={selected === f.id}
          tabIndex={0}
          className={selected === f.id ? "of-row on" : "of-row"}
          onClick={() => onPick(f)}
          onDoubleClick={() => onOpen(f)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onOpen(f);
            if (e.key === " ") {
              e.preventDefault();
              onPick(f);
            }
          }}
          title={`${f.name} · ${KIND_LABEL[f.kind]}`}
          style={{ display: "grid", gridTemplateColumns: "minmax(0, 2.4fr) 1fr 1.1fr", gap: 10, alignItems: "center", minHeight: 42, padding: "4px 14px", fontSize: 15, opacity: dimFiles && f.kind !== "folder" ? 0.45 : 1 }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
            <FileGlyph kind={f.kind} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
          </span>
          <span style={{ color: W.muted, fontSize: 14 }}>{f.modified}</span>
          <span style={{ color: W.muted, fontSize: 14 }}>{f.by}</span>
        </div>
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
