"use client";

/**
 * Case 16's bespoke case-board skin — UAT request (Abdullah, Block 4): "you
 * used the same Case Board UI for Module 3... change it up, especially the
 * final few cases: for example on case 16, show how your data could be
 * stored and kept on file by using a file explorer interface." Case 16 is
 * literally "The File On You" (PACKRAT assembling a file from your data
 * crumbs), so a file-explorer window is the one case where the corkboard
 * gets swapped for something that matches the content directly: each lead
 * is a FILE, unreadable/corrupted until that lead's cleared, then it
 * resolves into a real, named file — the same "pinned vs locked" idea as
 * CaseBoard, told through a different, on-theme metaphor.
 */

import { useState } from "react";

const MONO = `ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace`;
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

export interface CaseBoardLead {
  n: number;
  title: string;
  goal: string;
}

const EXT = ["loc", "acc", "aud", "del", "req", "con", "own"];
const SIZE = ["2.4 MB", "640 KB", "1.1 MB", "88 KB", "312 KB", "4.0 MB", "96 KB"];

export function CaseBoardFileExplorer({
  leads,
  clearedCount,
  accent,
  caseTitle,
  actor,
}: {
  leads: CaseBoardLead[];
  clearedCount: number;
  accent: string;
  caseTitle: string;
  actor: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close the file on you" : "Open the file on you"}
        style={{
          position: "fixed",
          top: "50%",
          left: open ? "min(320px, 92vw)" : 0,
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
          borderLeft: "none",
          borderRadius: "0 8px 8px 0",
          padding: "14px 7px",
          cursor: "pointer",
          transition: "left 260ms cubic-bezier(0.2,0,0,1)",
        }}
      >
        {open ? "✕ CLOSE" : "🗂 YOUR FILE"}
      </button>

      <aside
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "min(320px, 92vw)",
          zIndex: 45,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.2,0,0,1)",
          background: "#0d0a06",
          borderRight: `1px solid ${accent}33`,
          boxShadow: open ? "18px 0 40px rgba(0,0,0,0.5)" : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "0 16px", flex: "0 0 auto" }}>
          <div style={{ height: 30, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: accent }}>C:\ARCHIVE\{caseTitle.toUpperCase().replace(/\s+/g, "_")}</span>
          </div>
          <div style={{ height: 26, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "#F3F4F7" }}>The File On You</span>
          </div>
          <div style={{ height: 24, display: "flex", alignItems: "flex-end", paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#b8a98f" }}>
              {actor}'s build · {clearedCount} / {leads.length} entries decrypted
            </span>
          </div>
        </div>

        <div style={{ position: "relative", flex: 1, overflowY: "auto", padding: "10px 10px 24px" }}>
          <div style={{ display: "grid", gap: 6 }}>
            {leads.map((lead, i) => {
              const cleared = lead.n <= clearedCount;
              const ext = EXT[i] ?? "dat";
              return (
                <div
                  key={lead.n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    background: cleared ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.015)",
                    border: `1px solid ${cleared ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 6,
                    padding: "8px 10px",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      flex: "0 0 auto",
                      fontSize: 16,
                      filter: cleared ? undefined : "grayscale(1)",
                      opacity: cleared ? 1 : 0.45,
                    }}
                  >
                    {cleared ? "📄" : "🔒"}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    {cleared ? (
                      <div style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: "#F3F4F7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lead.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.{ext}
                      </div>
                    ) : (
                      <div aria-label="Not yet decrypted" style={{ fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: "#6b6459", filter: "blur(2.5px)" }}>
                        ████████_██████.{ext}
                      </div>
                    )}
                    <div style={{ fontFamily: MONO, fontSize: 9.5, color: "#6b6459", marginTop: 1 }}>
                      {cleared ? SIZE[i] ?? "—" : "ENCRYPTED"} · lead {lead.n}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
