"use client";

import type { CSSProperties, ReactNode } from "react";
import { W } from "../tokens";
import type { FileKind } from "./types";

/* Shared bits for the office apps: light Microsoft-style windows (W
 * tokens), drawn in code with no vendor artwork. Every control is a real
 * button at least 40px tall, so it works with a mouse or a finger. */

export const KIND_LABEL: Record<FileKind, string> = {
  folder: "File folder",
  xlsx: "Excel workbook",
  xltx: "Excel template",
  docx: "Word document",
  pdf: "PDF document",
};

const KIND_COLOUR: Record<Exclude<FileKind, "folder">, string> = {
  xlsx: W.excel,
  xltx: W.excel,
  docx: W.word,
  pdf: "#c4314b",
};

export function FileGlyph({ kind, size = 20 }: { kind: FileKind; size?: number }) {
  if (kind === "folder")
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
        <path d="M2 6.5 A1.5 1.5 0 0 1 3.5 5 H9 L11 7 H20.5 A1.5 1.5 0 0 1 22 8.5 V18.5 A1.5 1.5 0 0 1 20.5 20 H3.5 A1.5 1.5 0 0 1 2 18.5 Z" fill={W.folder} />
        <path d="M2 9 H22 V18.5 A1.5 1.5 0 0 1 20.5 20 H3.5 A1.5 1.5 0 0 1 2 18.5 Z" fill={W.folderLight} />
      </svg>
    );
  const c = KIND_COLOUR[kind];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M5 2 H15 L20 7 V22 H5 Z" fill="#ffffff" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M15 2 V7 H20" fill="none" stroke={c} strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="2" y="10" width="12" height="9" rx="1.5" fill={c} />
      {kind === "xltx" && <rect x="15.5" y="15" width="3.5" height="3.5" fill={c} opacity="0.5" />}
      <path d={kind === "pdf" ? "M5 12.5 H11 M5 16 H9" : "M4.5 12.5 H11.5 M4.5 16 H11.5"} stroke="#ffffff" strokeWidth="1.5" />
    </svg>
  );
}

export function AppButton({
  children,
  onClick,
  primary,
  colour = W.outlook,
  disabled,
  title,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  colour?: string;
  disabled?: boolean;
  title?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="of-btn"
      style={{
        minHeight: 40,
        padding: "6px 14px",
        borderRadius: 6,
        border: primary ? "none" : `1px solid ${W.edge}`,
        background: primary ? colour : W.page,
        color: primary ? "#ffffff" : W.ink,
        fontFamily: W.font,
        fontSize: 15,
        fontWeight: primary ? 700 : 500,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* A dialog inside the office screen (not the browser's): a dimmed screen
 * and a light card, the way Office's own Save As box sits over the app. */
export function Dialog({ title, children, onClose, width = 640 }: { title: string; children: ReactNode; onClose: () => void; width?: number }) {
  return (
    <div role="dialog" aria-modal="true" aria-label={title} style={{ position: "absolute", inset: 0, zIndex: 40, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,14,26,0.45)" }}>
      <div style={{ width: "100%", maxWidth: width, maxHeight: "100%", overflow: "auto", background: W.page, borderRadius: 10, boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)", fontFamily: W.font, color: W.ink }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${W.edge}` }}>
          <b style={{ fontSize: 17, fontWeight: 600 }}>{title}</b>
          <button type="button" onClick={onClose} aria-label="Close" className="of-btn" style={{ width: 40, height: 40, border: "none", background: "transparent", fontSize: 20, cursor: "pointer", color: W.muted, borderRadius: 6 }}>
            ✕
          </button>
        </div>
        <div style={{ padding: 16 }}>{children}</div>
      </div>
    </div>
  );
}

/* A Windows-style title bar for an app window. */
export function TitleBar({ colour, app, name, children }: { colour: string; app: string; name?: string; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 40, padding: "0 12px", background: colour, color: "#ffffff", fontFamily: W.font, fontSize: 14, flexShrink: 0 }}>
      <b style={{ fontWeight: 700 }}>{app}</b>
      {name && <span style={{ opacity: 0.92, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>}
      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 10 }}>{children}</span>
    </div>
  );
}

export const OFFICE_CSS = `
  .of-btn:not(:disabled):hover { filter: brightness(0.96); }
  .of-row { cursor: pointer; }
  .of-row:hover { background: ${W.chrome}; }
  .of-row.on, .of-row.on:hover { background: ${W.select}; }
  .of-office :is(button, input, textarea, select, a):focus-visible { outline: 2px solid ${W.outlook}; outline-offset: 2px; }
  .of-office input::placeholder, .of-office textarea::placeholder { color: ${W.faint}; }
`;
