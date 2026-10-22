"use client";

/**
 * The Zero File — the reopenable dossier panel, UAT addition (Abdullah,
 * Block 4). Docks at the right edge below CaseJournal's tab (same slide-out
 * shell, different vertical anchor so both stay reachable at once). Visually
 * distinct from the journal and the case board on purpose — a classified
 * evidence folder, not a notebook or a corkboard, because this one artifact
 * spans the whole block rather than belonging to one case.
 */

import { useState } from "react";
import type { ZeroClue } from "./zeroFile";

const MONO = `ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace`;

export function ZeroFile({ clues, total }: { clues: ZeroClue[]; total: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close the Zero file" : "Open the Zero file"}
        style={{
          position: "fixed",
          top: "74%",
          right: open ? "min(320px, 92vw)" : 0,
          transform: "translateY(-50%)",
          zIndex: 46,
          writingMode: "vertical-rl",
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: "#FF4D4D",
          background: "rgba(10,10,14,0.88)",
          border: "1px solid rgba(255,77,77,0.45)",
          borderRight: "none",
          borderRadius: "8px 0 0 8px",
          padding: "14px 7px",
          cursor: "pointer",
          transition: "right 260ms cubic-bezier(0.2,0,0,1)",
        }}
      >
        {open ? "✕ CLOSE" : "🗃 ZERO FILE"}
      </button>

      <aside
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "min(320px, 92vw)",
          zIndex: 45,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.2,0,0,1)",
          background: "linear-gradient(180deg, #170a0a 0%, #0c0707 100%)",
          borderLeft: "1px solid rgba(255,77,77,0.28)",
          boxShadow: open ? "-18px 0 40px rgba(0,0,0,0.5)" : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(255,77,77,0.05) 0 1px, transparent 1px 28px)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", padding: "0 16px" }}>
          <div style={{ height: 28, display: "flex", alignItems: "flex-end", paddingBottom: 3 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: "#FF4D4D" }}>CLASSIFIED · THE ZERO FILE</span>
          </div>
          <div style={{ height: 28, display: "flex", alignItems: "flex-end", paddingBottom: 3 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "#F3F4F7" }}>Who is ZERO?</span>
          </div>
          <div style={{ height: 28, display: "flex", alignItems: "flex-end", paddingBottom: 3, borderBottom: "1px solid rgba(255,77,77,0.3)" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: "#c79a9a" }}>
              {clues.length} / {total} entries collected
            </span>
          </div>
        </div>

        <div style={{ position: "relative", flex: 1, overflowY: "auto", padding: "14px 16px 24px" }}>
          {clues.length === 0 ? (
            <p style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, lineHeight: 1.6, color: "#9a8080" }}>
              No entries yet. Close your first case this block and the file opens.
            </p>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {clues.map((c) => (
                <div key={c.caseId} style={{ borderLeft: "2px solid rgba(255,77,77,0.55)", paddingLeft: 10 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: "#FF4D4D", lineHeight: "20px" }}>
                    ENTRY {c.n} · CASE {c.caseNumber}
                  </div>
                  <p style={{ margin: "2px 0 0", fontFamily: MONO, fontSize: 13, fontWeight: 600, lineHeight: 1.55, color: "#E4D4D4" }}>{c.text}</p>
                </div>
              ))}
              {clues.length < total && (
                <p style={{ fontFamily: MONO, fontSize: 11.5, color: "#6b5555", fontStyle: "italic" }}>
                  {total - clues.length} entr{total - clues.length === 1 ? "y" : "ies"} still missing.
                </p>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
