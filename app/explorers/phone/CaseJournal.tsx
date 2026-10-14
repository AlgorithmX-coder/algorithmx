"use client";

/**
 * The case journal — a collapsible notebook of what's been learned so far
 * this case. Docks at the right edge: on a wide screen that's empty margin
 * beside the centered phone, so opening it never covers the phone chrome;
 * on a narrow one (phone/iPad width) there's no margin to dock in, so it
 * naturally becomes a slide-out overlay instead — same component, same
 * behavior, the available space just decides which it looks like.
 */

import { useState } from "react";
import type { JournalEntry } from "./journal";

const MONO = `ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace`;

export function CaseJournal({ entries, accent, caseTitle }: { entries: JournalEntry[]; accent: string; caseTitle: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close case journal" : "Open case journal"}
        style={{
          position: "fixed",
          top: "50%",
          right: open ? "min(320px, 92vw)" : 0,
          transform: "translateY(-50%)",
          zIndex: 46,
          writingMode: "vertical-rl",
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: accent,
          background: "rgba(10,10,14,0.88)",
          border: `1px solid ${accent}55`,
          borderRight: "none",
          borderRadius: "8px 0 0 8px",
          padding: "14px 7px",
          cursor: "pointer",
          transition: "right 260ms cubic-bezier(0.2,0,0,1)",
        }}
      >
        {open ? "✕ CLOSE" : "📓 JOURNAL"}
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
          background: "linear-gradient(180deg, #0c0e16 0%, #0a0a11 100%)",
          borderLeft: `1px solid ${accent}33`,
          boxShadow: open ? "-18px 0 40px rgba(0,0,0,0.5)" : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", padding: "20px 18px 14px", borderBottom: `1px solid ${accent}2E` }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: accent }}>CASE LOG</div>
          <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: "#F3F4F7", marginTop: 4 }}>{caseTitle}</div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: "#7a7a88", marginTop: 6 }}>
            {entries.length} / {Math.max(entries.length, 7)} skills logged
          </div>
        </div>

        {/* Ruled lines scoped to just the notebook body (not the header) and
            pitched to match the body text's own line-height below, with a
            top padding that's an exact multiple of that pitch — so each
            line of running text actually sits on a rule instead of the
            lines passing through text at an unrelated offset. */}
        <div style={{ position: "relative", flex: 1, overflowY: "auto", padding: "28px 18px 24px" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 28px)",
              pointerEvents: "none",
            }}
          />
          {entries.length === 0 ? (
            <p style={{ position: "relative", fontFamily: MONO, fontSize: 14, fontWeight: 600, lineHeight: "28px", color: "#9a9ca8" }}>
              Nothing logged yet. Clear your first skill and it'll show up here.
            </p>
          ) : (
            <div style={{ position: "relative", display: "grid", gap: 28 }}>
              {entries.map((e) => (
                <div key={e.skillN} style={{ borderLeft: `2px solid ${accent}77`, paddingLeft: 10 }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: accent, lineHeight: "28px" }}>
                    ✓ SKILL {e.skillN} — {e.title.toUpperCase()}
                  </div>
                  <p style={{ margin: 0, fontFamily: MONO, fontSize: 14, fontWeight: 600, lineHeight: "28px", color: "#E4E6EC" }}>{e.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
