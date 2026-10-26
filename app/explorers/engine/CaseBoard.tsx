"use client";

/**
 * The case board — a reopenable corkboard of this case's leads, UAT request
 * (Abdullah, Block 4): "turn the 7-leads list into a mini map, some pinned
 * like on a bulletin board, with others linked to each other... blurring
 * skills that have not yet been achieved and using red strings to link them
 * together." Docks at the LEFT edge (CaseJournal already owns the right),
 * same slide-out shell.
 *
 * Leads are laid out in a fixed zigzag down the board (a real corkboard
 * isn't a straight list) and connected string-to-string: solid red once
 * BOTH ends are cleared, dashed grey otherwise. A lead not yet cleared is
 * desaturated and its title blurred — you know lead 4 is coming, you can't
 * read it yet, matching the owner's "blurring" note.
 */

import { useState } from "react";

const MONO = `ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace`;
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

export interface CaseBoardLead {
  n: number;
  title: string;
  goal: string;
}

// Zigzag positions for up to 7 cards, hand-placed so the board reads as a
// real pinned layout rather than a straight list.
//
// UAT (Abdullah), twice now: the board reads "squashed", most recently
// "add more than the required space... so the skills fit perfectly." Both
// previous fixes tuned fixed PIXEL margins against a panel that's capped at
// 92vw on anything narrower than ~435px CSS width — i.e. on almost every
// real phone. Padding tuned to look right at one width just moves where it
// clips at another. Switched x and width to PERCENTAGES of the panel's own
// content box instead, so the margin is always proportional, never a fixed
// px guess against a moving target: 8% clear on the left, 8% clear on the
// right, symmetric, at any panel width.
const LEFT_X = "8%";
const RIGHT_X = "54%";
const CARD_W_PCT = "38%"; // 54% + 38% = 92% -> 8% clear on the right too
const CARD_CENTER_LEFT = "27%"; // 8% + 38%/2
const CARD_CENTER_RIGHT = "73%"; // 54% + 38%/2
const POS = [
  { x: LEFT_X, cx: CARD_CENTER_LEFT, y: 18 },
  { x: RIGHT_X, cx: CARD_CENTER_RIGHT, y: 92 },
  { x: LEFT_X, cx: CARD_CENTER_LEFT, y: 166 },
  { x: RIGHT_X, cx: CARD_CENTER_RIGHT, y: 240 },
  { x: LEFT_X, cx: CARD_CENTER_LEFT, y: 314 },
  { x: RIGHT_X, cx: CARD_CENTER_RIGHT, y: 388 },
  { x: LEFT_X, cx: CARD_CENTER_LEFT, y: 462 },
];
const CARD_H = 66;
const BOARD_H = 548;

export function CaseBoard({
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
        aria-label={open ? "Close case board" : "Open case board"}
        style={{
          position: "fixed",
          top: "50%",
          left: open ? "min(340px, 92vw)" : 0,
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
        {open ? "✕ CLOSE" : "📌 BOARD"}
      </button>

      <aside
        aria-hidden={!open}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100%",
          width: "min(340px, 92vw)",
          zIndex: 45,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.2,0,0,1)",
          background:
            "repeating-linear-gradient(45deg, #2a2016 0px, #2a2016 2px, #251b12 2px, #251b12 4px), radial-gradient(circle at 30% 20%, #332818 0%, #1c140c 70%)",
          borderRight: `1px solid ${accent}33`,
          boxShadow: open ? "18px 0 40px rgba(0,0,0,0.5)" : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "0 16px", flex: "0 0 auto" }}>
          <div style={{ height: 30, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: accent }}>CASE BOARD</span>
          </div>
          <div style={{ height: 26, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, color: "#F3F4F7" }}>{caseTitle}</span>
          </div>
          <div style={{ height: 24, display: "flex", alignItems: "flex-end", paddingBottom: 6, borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#b8a98f" }}>
              vs {actor} · {clearedCount} / {leads.length} leads pinned
            </span>
          </div>
        </div>

        <div style={{ position: "relative", flex: 1, overflowY: "auto", padding: "14px 16px 24px" }}>
          <div style={{ position: "relative", width: "100%", height: BOARD_H }}>
            <svg aria-hidden width="100%" height={BOARD_H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {leads.slice(1).map((lead, i) => {
                const a = POS[i];
                const b = POS[i + 1];
                const cleared = lead.n <= clearedCount && leads[i].n <= clearedCount;
                return (
                  <line
                    key={lead.n}
                    x1={a.cx}
                    y1={a.y + CARD_H / 2}
                    x2={b.cx}
                    y2={b.y + CARD_H / 2}
                    stroke={cleared ? "#d13b3b" : "rgba(255,255,255,0.18)"}
                    strokeWidth={cleared ? 1.6 : 1}
                    strokeDasharray={cleared ? undefined : "4 4"}
                  />
                );
              })}
            </svg>
            {leads.map((lead, i) => {
              const pos = POS[i] ?? POS[POS.length - 1];
              const cleared = lead.n <= clearedCount;
              const rotate = (i % 2 === 0 ? -1 : 1) * (2 + (i % 3));
              return (
                <div
                  key={lead.n}
                  style={{
                    position: "absolute",
                    left: pos.x,
                    top: pos.y,
                    width: CARD_W_PCT,
                    height: CARD_H,
                    transform: `rotate(${rotate}deg)`,
                    background: cleared ? "#efe6d2" : "#4a4238",
                    color: cleared ? "#241c10" : "#8a8276",
                    borderRadius: 3,
                    boxShadow: "0 4px 10px rgba(0,0,0,0.45)",
                    padding: "9px 10px 6px",
                    filter: cleared ? undefined : "blur(1.5px) saturate(0.3)",
                    opacity: cleared ? 1 : 0.62,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: -6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: cleared ? "#e0392f" : "#6b6459",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.6)",
                    }}
                  />
                  <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".08em", color: cleared ? "#8a6d1f" : "#6b6459", marginBottom: 2 }}>
                    LEAD {lead.n}
                  </div>
                  {cleared ? (
                    <div style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, lineHeight: 1.25 }}>{lead.title}</div>
                  ) : (
                    <div aria-label="Not yet uncovered" style={{ fontFamily: UI, fontSize: 11.5, fontWeight: 700, lineHeight: 1.25, filter: "blur(3px)" }}>
                      {lead.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
