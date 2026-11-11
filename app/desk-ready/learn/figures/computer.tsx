"use client";

import type { ReactNode } from "react";
import { W } from "../../tokens";
import { AppWindow, FakeButton, FigureFrame, Part, usePartNumber, type PartInfo } from "./parts";

/* The computer itself, drawn with its parts numbered, for Module 0: the
 * mouse, the keyboard, a desktop with a window and the taskbar, copy and
 * paste, and File Explorer. */

/* ── the mouse ──────────────────────────────────────────────────────── */

export type MousePart = "left" | "right" | "wheel" | "pointer";

export const MOUSE_PARTS: Record<MousePart, PartInfo> = {
  left: { n: 1, name: "Left button", what: "The one you'll use most. Press it once to click, twice quickly to double-click, and hold it down to drag." },
  right: { n: 2, name: "Right button", what: "Opens a small menu of things you can do with whatever's under the pointer, like Copy or Rename." },
  wheel: { n: 3, name: "Scroll wheel", what: "Roll it with your finger to move a page up and down." },
  pointer: { n: 4, name: "The pointer", what: "The arrow on the screen. It moves as you slide the mouse on the desk." },
};

export function MouseFigure({ focus, title = "The mouse", note }: { focus?: MousePart[]; title?: string; note?: string }) {
  return (
    <FigureFrame info={MOUSE_PARTS} focus={focus} title={title} note={note} minWidth={460}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 70, padding: "40px 20px 20px" }}>
        <div style={{ position: "relative", width: 150, height: 230 }}>
          <svg width="150" height="230" viewBox="0 0 150 230" aria-hidden style={{ display: "block" }}>
            <path d="M75 6 C 30 6 8 40 8 95 L 8 150 C 8 200 38 224 75 224 C 112 224 142 200 142 150 L 142 95 C 142 40 120 6 75 6 Z" fill="#f4f5f7" stroke="#9aa3b2" strokeWidth="2" />
            <path d="M75 6 L 75 92 M 8 92 L 142 92" stroke="#9aa3b2" strokeWidth="2" fill="none" />
            <rect x="68" y="30" width="14" height="34" rx="7" fill="#5b6475" />
          </svg>
          <Part k="left" badge="left" style={{ position: "absolute", left: 10, top: 10, width: 62, height: 80 }}>
            <span />
          </Part>
          <Part k="right" badge="right" style={{ position: "absolute", left: 78, top: 10, width: 62, height: 80 }}>
            <span />
          </Part>
          <Part k="wheel" badge="top" style={{ position: "absolute", left: 64, top: 26, width: 22, height: 42 }}>
            <span />
          </Part>
        </div>
        <div style={{ position: "relative", width: 160, height: 120, borderRadius: 8, background: W.desktop, boxShadow: W.float }}>
          <Part k="pointer" badge="right" style={{ position: "absolute", left: 66, top: 36, width: 30, height: 38 }}>
            <svg width="30" height="38" viewBox="0 0 24 28" aria-hidden style={{ display: "block" }}>
              <path d="M3 2 L3 22 L8 17.4 L11.6 25 L15 23.5 L11.4 16 L18.5 16 Z" fill="#fff" stroke="#111" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── the keyboard ───────────────────────────────────────────────────── */

export type KeyPart = "esc" | "tab" | "shift" | "ctrl" | "space" | "enter" | "backspace" | "delete" | "arrows" | "at" | "home";

export const KEY_PARTS: Record<KeyPart, PartInfo> = {
  esc: { n: 1, name: "Esc", what: "Cancels or closes: gets you out of a menu or a box you didn't mean to open." },
  tab: { n: 2, name: "Tab", what: "Moves to the next box on a form, or the next cell to the right in Excel." },
  shift: { n: 3, name: "Shift", what: "Hold it down while you press a letter to make a capital, or a symbol key to get its top symbol." },
  ctrl: { n: 4, name: "Ctrl", what: "Hold it with another key for a shortcut: Ctrl+C copies, Ctrl+V pastes, Ctrl+Z undoes, Ctrl+S saves." },
  space: { n: 5, name: "Space bar", what: "Puts a space between words." },
  enter: { n: 6, name: "Enter", what: "Starts a new line, or says \"yes, go\" to a box or a button." },
  backspace: { n: 7, name: "Backspace", what: "Deletes the letter to the left of where you're typing." },
  delete: { n: 8, name: "Delete", what: "Deletes the letter to the right of where you're typing, or a selected file." },
  arrows: { n: 9, name: "Arrow keys", what: "Move the cursor up, down, left and right, without the mouse." },
  at: { n: 10, name: "The @ key", what: "On a UK keyboard, hold Shift and press the key with @ on it, next to Enter. You need it for every email address." },
  home: { n: 11, name: "Home keys", what: "Rest your left fingers on A S D F and your right on J K L ;. The bumps on F and J help you find them without looking." },
};

type Key = { label: string; w?: number; part?: KeyPart; second?: boolean };
const ROWS: Key[][] = [
  [{ label: "Esc", part: "esc" }, ..."1234567890".split("").map((l) => ({ label: l })), { label: "Backspace", w: 2, part: "backspace" }],
  [{ label: "Tab", w: 1.5, part: "tab" }, ..."QWERTYUIOP".split("").map((l) => ({ label: l })), { label: "Delete", w: 1.5, part: "delete" }],
  [{ label: "Caps", w: 1.75 }, { label: "A" }, { label: "S" }, { label: "D" }, { label: "F" }, { label: "G" }, { label: "H" }, { label: "J" }, { label: "K" }, { label: "L" }, { label: ";" }, { label: "@", part: "at" }, { label: "Enter", w: 1.75, part: "enter" }],
  [{ label: "Shift", w: 2.25, part: "shift" }, ..."ZXCVBNM".split("").map((l) => ({ label: l })), { label: "," }, { label: "." }, { label: "/" }, { label: "Shift", w: 2.25, part: "shift", second: true }],
  [{ label: "Ctrl", w: 1.5, part: "ctrl" }, { label: "", w: 1.25 }, { label: "Alt", w: 1.25 }, { label: "", w: 6, part: "space" }, { label: "Alt", w: 1.25 }, { label: "Ctrl", w: 1.5, part: "ctrl", second: true }],
];
const U = 38;

/* A key. A numbered key carries its number on top of its own label (a
 * badge outside it would cover the next key). */
function KeyCap({ k, part }: { k: Key; part?: KeyPart }) {
  const n = usePartNumber(part ?? "");
  const numbered = n !== null && !!part && !k.second;
  return (
    <span style={{ display: "inline-flex", verticalAlign: "top", flexDirection: "column", gap: 1, alignItems: "center", justifyContent: "center", width: (k.w ?? 1) * U - 4, height: U - 4, borderRadius: 5, background: "#ffffff", border: "1px solid #c8ccd4", boxShadow: "0 2px 0 #b6bbc6", fontSize: numbered || k.label.length > 3 ? 11 : 13, lineHeight: 1, color: W.ink }}>
      {numbered && (
        <span aria-hidden style={{ width: 14, height: 14, borderRadius: "50%", background: "#f5b400", color: "#1b1b1b", fontSize: 9, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {n}
        </span>
      )}
      {k.label}
    </span>
  );
}

export function KeyboardFigure({ focus, title = "The keyboard", note }: { focus?: KeyPart[]; title?: string; note?: string }) {
  const homeLeft = ["A", "S", "D", "F"];
  const homeRight = ["J", "K", "L", ";"];
  const row = (keys: Key[], r: number) => {
    const out: ReactNode[] = [];
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (r === 2 && k.label === "A") {
        out.push(
          <Part key="hl" k="home" block={false} noBadge>
            <span style={{ display: "flex", gap: 4 }}>
              {homeLeft.map((l, i) => (
                <KeyCap key={l} k={{ label: l }} part={i === 0 ? "home" : undefined} />
              ))}
            </span>
          </Part>,
        );
        i += 3;
        continue;
      }
      if (r === 2 && k.label === "J") {
        out.push(
          <Part key="hr" k="home" block={false} noBadge>
            <span style={{ display: "flex", gap: 4 }}>
              {homeRight.map((l) => (
                <KeyCap key={l} k={{ label: l }} />
              ))}
            </span>
          </Part>,
        );
        i += 3;
        continue;
      }
      out.push(
        k.part ? (
          <Part key={i} k={k.part} block={false} noBadge>
            <KeyCap k={k} part={k.part} />
          </Part>
        ) : (
          <KeyCap key={i} k={k} />
        ),
      );
    }
    return out;
  };
  return (
    <FigureFrame info={KEY_PARTS} focus={focus} title={title} note={note} minWidth={720}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 18, padding: "22px 14px 14px", background: "#e6e8ec", borderRadius: 12, border: "1px solid #c8ccd4", width: "fit-content" }}>
        <div style={{ display: "grid", gap: 4 }}>
          {ROWS.map((keys, r) => (
            <div key={r} style={{ display: "flex", alignItems: "flex-start", gap: 4 }}>
              {row(keys, r)}
            </div>
          ))}
        </div>
        <Part k="arrows" block={false} noBadge>
          <span style={{ display: "grid", gridTemplateColumns: `repeat(3, ${U - 4}px)`, gap: 4 }}>
            <span />
            <KeyCap k={{ label: "↑" }} part="arrows" />
            <span />
            <KeyCap k={{ label: "←" }} />
            <KeyCap k={{ label: "↓" }} />
            <KeyCap k={{ label: "→" }} />
          </span>
        </Part>
      </div>
    </FigureFrame>
  );
}

/* ── the desktop, a window and the taskbar ──────────────────────────── */

export type DeskPart = "window" | "titlebar" | "minimise" | "maximise" | "close" | "taskbar" | "apps" | "desktop";

export const DESK_PARTS: Record<DeskPart, PartInfo> = {
  desktop: { n: 1, name: "The desktop", what: "The screen behind everything. Windows open on top of it." },
  window: { n: 2, name: "A window", what: "Each program you open, like Outlook or Excel, opens in its own window." },
  titlebar: { n: 3, name: "Title bar", what: "The top strip of a window: it says what's open. Drag it to move the window." },
  minimise: { n: 4, name: "Minimise", what: "The dash. Hides the window down to the taskbar. It's still open; click it on the taskbar to bring it back." },
  maximise: { n: 5, name: "Maximise", what: "The square. Makes the window fill the screen, or shrinks it back." },
  close: { n: 6, name: "Close", what: "The cross. Closes the window. Save your work first." },
  taskbar: { n: 7, name: "Taskbar", what: "The strip along the bottom of the screen: the Start button, search, and every open program." },
  apps: { n: 8, name: "Open programs", what: "A button for each program that's open. Click one to bring its window to the front." },
};

export function DesktopFigure({ focus, title = "Your desktop", note }: { focus?: DeskPart[]; title?: string; note?: string }) {
  const app = (colour: string, label: string, on?: boolean) => (
    <span title={label} style={{ position: "relative", width: 34, height: 34, borderRadius: 6, background: on ? "rgba(255,255,255,0.8)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ width: 18, height: 18, borderRadius: 4, background: colour }} />
      {on && <span style={{ position: "absolute", bottom: 2, width: 14, height: 3, borderRadius: 2, background: "#2563c9" }} />}
    </span>
  );
  return (
    <FigureFrame info={DESK_PARTS} focus={focus} title={title} note={note} minWidth={640}>
      <Part k="desktop" badge="top" holds={["window", "titlebar", "minimise", "maximise", "close", "taskbar", "apps"]}>
        <div style={{ position: "relative", height: 330, borderRadius: 8, overflow: "visible", background: W.desktop }}>
          <div style={{ position: "absolute", left: 50, top: 40, width: 400 }}>
            <Part k="window" badge="left" holds={["titlebar", "minimise", "maximise", "close"]}>
              <div style={{ background: W.page, borderRadius: 8, boxShadow: W.float, overflow: "visible" }}>
                <div style={{ display: "flex", alignItems: "center", height: 36, background: W.excel, color: "#fff", borderRadius: "8px 8px 0 0", fontSize: 13.5 }}>
                  <Part k="titlebar" block={false} badge="top" style={{ flex: 1, paddingLeft: 12 }}>
                    <span>
                      <b>Excel</b> Stock November.xlsx
                    </span>
                  </Part>
                  <Part k="minimise" block={false} badge="top">
                    <span style={{ display: "inline-flex", width: 40, justifyContent: "center" }}>&#8212;</span>
                  </Part>
                  <Part k="maximise" block={false} badge="top">
                    <span style={{ display: "inline-flex", width: 40, justifyContent: "center" }}>&#9633;</span>
                  </Part>
                  <Part k="close" block={false} badge="top">
                    <span style={{ display: "inline-flex", width: 40, justifyContent: "center" }}>✕</span>
                  </Part>
                </div>
                <div style={{ height: 150, padding: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: W.edge }}>
                  {Array.from({ length: 20 }, (_, i) => (
                    <span key={i} style={{ background: i < 4 ? "#e6f2ea" : W.page }} />
                  ))}
                </div>
              </div>
            </Part>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0 }}>
            <Part k="taskbar" badge="top" holds={["apps"]} style={{ borderRadius: "0 0 8px 8px" }}>
              <div style={{ height: 46, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(238,242,250,0.92)", borderRadius: "0 0 8px 8px" }}>
                <span style={{ width: 20, height: 20, borderRadius: "50%", border: "3px solid #2563c9" }} />
                <span style={{ width: 150, height: 30, borderRadius: 15, background: "#fff", border: "1px solid #d9dde6", fontSize: 12.5, color: "#666", display: "inline-flex", alignItems: "center", paddingLeft: 12 }}>⌕ Search</span>
                <Part k="apps" block={false} badge="right">
                  <span style={{ display: "inline-flex", gap: 6 }}>
                    {app(W.folder, "File Explorer")}
                    {app(W.outlook, "Outlook", true)}
                    {app(W.excel, "Excel", true)}
                  </span>
                </Part>
              </div>
            </Part>
          </div>
        </div>
      </Part>
    </FigureFrame>
  );
}

/* ── copy, paste and undo ───────────────────────────────────────────── */

export type EditPart = "selection" | "menu" | "copy" | "paste" | "keys";

export const EDIT_PARTS: Record<EditPart, PartInfo> = {
  selection: { n: 1, name: "Selected text", what: "Highlighted in blue: drag across words with the left button held down. Whatever you do next happens to this." },
  menu: { n: 2, name: "The right-click menu", what: "Press the right button on the selection to open it." },
  copy: { n: 3, name: "Copy", what: "Keeps a copy of the selection, ready to paste. The original stays where it is." },
  paste: { n: 4, name: "Paste", what: "Puts what you copied wherever you're typing." },
  keys: { n: 5, name: "The shortcuts", what: "The same thing from the keyboard, much quicker: hold Ctrl and press C, V or Z." },
};

export function EditFigure({ focus, title = "Copy and paste", note }: { focus?: EditPart[]; title?: string; note?: string }) {
  const item = (label: string, keys: string, k?: EditPart) => {
    const row = (
      <span style={{ display: "flex", justifyContent: "space-between", gap: 24, padding: "7px 14px", fontSize: 14 }}>
        <span>{label}</span>
        <span style={{ color: W.muted }}>{keys}</span>
      </span>
    );
    return k ? (
      <Part k={k} badge="right">
        {row}
      </Part>
    ) : (
      row
    );
  };
  return (
    <FigureFrame info={EDIT_PARTS} focus={focus} title={title} note={note} minWidth={600}>
      <div style={{ display: "flex", gap: 40, alignItems: "flex-start", paddingLeft: 34 }}>
        <AppWindow app="Outlook" colour={W.outlook} title="Kent Bakery's new address">
          <div style={{ position: "relative", padding: "16px 18px 140px", width: 300, fontSize: 15, lineHeight: 1.6 }}>
            Hi, our new delivery address is{" "}
            <Part k="selection" block={false} badge="left">
              <span style={{ background: "#b9d6f7" }}>Unit 4, Wharf Road, Leicester LE3 5RT</span>
            </Part>
            . Thanks, Imran
            <div style={{ position: "absolute", left: 120, top: 92, width: 190, background: W.page, borderRadius: 6, boxShadow: W.float, border: `1px solid ${W.edge}` }}>
              <Part k="menu" badge="left" holds={["copy", "paste"]}>
                <div style={{ padding: "4px 0" }}>
                  {item("Cut", "Ctrl+X")}
                  {item("Copy", "Ctrl+C", "copy")}
                  {item("Paste", "Ctrl+V", "paste")}
                </div>
              </Part>
            </div>
          </div>
        </AppWindow>
        <div style={{ paddingTop: 10 }}>
          <Part k="keys" badge="top">
            <div style={{ display: "grid", gap: 8, padding: "12px 14px", borderRadius: 8, background: W.page, boxShadow: W.float, fontSize: 14 }}>
              {[
                ["Ctrl + C", "copy"],
                ["Ctrl + V", "paste"],
                ["Ctrl + Z", "undo"],
              ].map(([k, w]) => (
                <span key={k} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <FakeButton>{k}</FakeButton>
                  {w}
                </span>
              ))}
            </div>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── File Explorer ──────────────────────────────────────────────────── */

export type FilesPart = "path" | "places" | "folder" | "file" | "name" | "modified" | "search";

export const FILES_PARTS: Record<FilesPart, PartInfo> = {
  places: { n: 1, name: "Places", what: "The main places files are kept: your Documents, Downloads, and the team's shared sites." },
  path: { n: 2, name: "Where you are", what: "The folder you're in, and the folders it's inside, from left to right. Click any of them to go back up." },
  search: { n: 3, name: "Search", what: "Type part of a file's name to find it, without knowing which folder it's in." },
  folder: { n: 4, name: "A folder", what: "The yellow icon: a folder holds files, and other folders. Double-click it to open it." },
  file: { n: 5, name: "A file", what: "A document, a spreadsheet, a PDF. Double-click it to open it in its program." },
  name: { n: 6, name: "The file's name", what: "What the file is called. A good name says what's in it, and its date, so anyone can find it." },
  modified: { n: 7, name: "Date modified", what: "When it was last saved. The newest is usually the one you want." },
};

export function ExplorerFigure({ focus, title = "File Explorer", note }: { focus?: FilesPart[]; title?: string; note?: string }) {
  const rows: [string, string, boolean][] = [
    ["Timesheets", "07/11/2026 16:02", true],
    ["Training", "28/10/2026 16:40", true],
    ["2026-11-10 Delivery report.xlsx", "10/11/2026 08:57", false],
    ["CV 2026.docx", "09/11/2026 17:12", false],
  ];
  const icon = (folder: boolean) =>
    folder ? <span style={{ width: 18, height: 14, borderRadius: 2, background: W.folderLight, display: "inline-block" }} /> : <span style={{ width: 14, height: 17, borderRadius: 2, background: W.excel, display: "inline-block" }} />;
  return (
    <FigureFrame info={FILES_PARTS} focus={focus} title={title} note={note} minWidth={680}>
      <AppWindow app="File Explorer" colour="#2b2b2b">
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 8px 46px", borderBottom: `1px solid ${W.edge}`, background: W.chrome }}>
          <Part k="path" style={{ flex: 1 }} badge="left">
            <span style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 30, padding: "0 10px", border: `1px solid ${W.edge}`, borderRadius: 4, background: W.page, fontSize: 13.5 }}>
              OneDrive <span style={{ color: W.faint }}>›</span> Documents
            </span>
          </Part>
          <Part k="search" block={false} badge="top">
            <span style={{ display: "inline-flex", alignItems: "center", width: 170, minHeight: 30, padding: "0 10px", border: `1px solid ${W.edge}`, borderRadius: 4, background: W.page, color: W.faint, fontSize: 13.5 }}>⌕ Search Documents</span>
          </Part>
        </div>
        <div style={{ display: "flex", minHeight: 220 }}>
          <div style={{ width: 170, flexShrink: 0, padding: "12px 8px 12px 46px", borderRight: `1px solid ${W.edge}`, background: W.chrome }}>
            <Part k="places">
              <div style={{ display: "grid", gap: 4, fontSize: 13.5 }}>
                {["Documents", "Desktop", "Downloads", "Operations Team", "Finance"].map((p, i) => (
                  <span key={p} style={{ padding: "5px 8px", borderRadius: 4, background: i === 0 ? W.select : "transparent", fontWeight: i === 0 ? 600 : 400 }}>
                    {p}
                  </span>
                ))}
              </div>
            </Part>
          </div>
          <div style={{ flex: 1, padding: "8px 46px 12px 12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", padding: "4px 8px", fontSize: 12.5, color: W.muted, borderBottom: `1px solid ${W.edge}` }}>
              <span>Name</span>
              <span>Date modified</span>
            </div>
            {rows.map(([n, d, folder], i) => {
              const nameCell = (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {icon(folder)}
                  {n}
                </span>
              );
              const line = (
                <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", alignItems: "center", minHeight: 34, padding: "0 8px", fontSize: 13.5 }}>
                  {i === 2 ? (
                    <Part k="name" block={false} badge="top">
                      {nameCell}
                    </Part>
                  ) : (
                    nameCell
                  )}
                  {i === 2 ? (
                    <Part k="modified" block={false} badge="right">
                      <span style={{ color: W.muted }}>{d}</span>
                    </Part>
                  ) : (
                    <span style={{ color: W.muted }}>{d}</span>
                  )}
                </div>
              );
              if (i === 0)
                return (
                  <Part key={n} k="folder" badge="left">
                    {line}
                  </Part>
                );
              if (i === 2)
                return (
                  <Part key={n} k="file" badge="left" holds={["name", "modified"]} style={{ marginTop: 26 }}>
                    {line}
                  </Part>
                );
              return <div key={n}>{line}</div>;
            })}
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}
