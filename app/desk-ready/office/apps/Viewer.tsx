"use client";

import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { W } from "../../tokens";
import { DocSheet as PaperworkSheet, PAPERWORK_CSS } from "../paperwork";
import type { Paper, WordDoc } from "../types";
import { DocSheet } from "./WordParts";

/* A scanned page (a delivery note) in a small window that floats over
 * whatever app is open, so the learner can read it while they type, the
 * way you would prop the paper beside the keyboard. Drag it by its title
 * bar. Files with nothing to read show a short note instead. */

export function PaperSheet({ paper }: { paper: Paper }) {
  /* Module 10: real paperwork (an invoice, a receipt) draws itself */
  if (paper.doc) return <PaperworkSheet doc={paper.doc} />;
  return (
    <div style={{ position: "relative", background: "#fffdf6", padding: "22px 24px 26px", fontFamily: "'Courier New', ui-monospace, monospace", color: "#2a2a2a", fontSize: 13.5, lineHeight: 1.45, boxShadow: "inset 0 0 40px rgba(120,100,60,0.08)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
        <div>
          {paper.from.map((l, i) => (
            <div key={i} style={{ fontWeight: i === 0 ? 700 : 400, fontSize: i === 0 ? 15 : 13 }}>
              {l}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{paper.heading}</div>
      </div>
      <table style={{ marginTop: 16, borderCollapse: "collapse", fontSize: 13.5 }}>
        <tbody>
          {paper.meta.map(([k, v]) => (
            <tr key={k}>
              <td style={{ padding: "2px 18px 2px 0", color: "#666" }}>{k}</td>
              <td style={{ padding: "2px 0", fontWeight: 700 }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {paper.table && (
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr>
              {paper.table.head.map((h, i) => (
                <th key={h} style={{ textAlign: i === 0 ? "left" : "right", borderBottom: "1.5px solid #2a2a2a", padding: "4px 6px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paper.table.rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci} style={{ textAlign: ci === 0 ? "left" : "right", borderBottom: "1px dashed #bbb", padding: "6px" }}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {paper.note && (
        <div style={{ marginTop: 14, fontFamily: "'Segoe Print', 'Comic Sans MS', cursive", fontSize: 18, color: "#1d4fb8", transform: "rotate(-3deg)", transformOrigin: "left" }}>{paper.note}</div>
      )}
      {paper.footer && <div style={{ marginTop: 16, fontSize: 11.5, color: "#777" }}>{paper.footer}</div>}
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#777" }}>
        <span>Signed: ______________</span>
        <span>Driver: ______________</span>
      </div>
    </div>
  );
}

export default function Viewer({ title, paper, doc, onClose }: { title: string; paper?: Paper; doc?: WordDoc; onClose: () => void }) {
  const [pos, setPos] = useState({ x: 40, y: 60 });
  /* Module 10: a full page of paperwork needs a wider window; a photo opens in Photos */
  const paperwork = paper?.doc;
  const photo = /\.(jpe?g|png)$/i.test(title);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setPos({ x: Math.max(0, e.clientX - drag.current.dx), y: Math.max(0, e.clientY - drag.current.dy) });
  };

  return (
    <div
      role="dialog"
      aria-label={title}
      style={{ position: "absolute", left: pos.x, top: pos.y, zIndex: 30, width: doc ? 660 : paperwork && !photo ? 640 : 460, maxWidth: "calc(100% - 20px)", borderRadius: 8, overflow: "hidden", background: W.page, boxShadow: "0 24px 60px -18px rgba(0,0,0,0.55), 0 0 0 1px rgba(0,0,0,0.12)", fontFamily: W.font }}
    >
      <div
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={() => (drag.current = null)}
        style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 40, padding: "0 6px 0 12px", background: photo ? "#1f1f1f" : "#c4314b", color: "#fff", fontSize: 14, cursor: "grab", touchAction: "none", userSelect: "none" }}
      >
        <b>{photo ? "Photos" : "PDF"}</b>
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
        <span style={{ marginLeft: "auto", fontSize: 12.5, opacity: 0.85 }}>drag me</span>
        <button type="button" onClick={onClose} aria-label={`Close ${title}`} style={{ width: 40, height: 36, border: "none", background: "transparent", color: "#fff", fontSize: 18, cursor: "pointer" }}>
          ✕
        </button>
      </div>
      <div style={{ maxHeight: paperwork ? 500 : 460, overflowY: "auto", background: photo ? "#1f1f1f" : "#e9e7e2", padding: 12 }}>
        {paperwork && <style>{PAPERWORK_CSS}</style>}
        {doc ? (
          /* ── Module 8: Documents ── a PDF made from a Word document: its pages, read-only */
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ zoom: 612 / 794 } as CSSProperties}>
              <DocSheet doc={doc} />
            </div>
          </div>
        ) : paper ? (
          <PaperSheet paper={paper} />
        ) : (
          <div style={{ background: "#fff", padding: 24, fontSize: 15, color: W.muted, lineHeight: 1.5 }}>This file is here to make the office feel real. You don&apos;t need it for this job.</div>
        )}
      </div>
    </div>
  );
}
