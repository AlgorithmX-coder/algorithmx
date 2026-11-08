"use client";

import { useState } from "react";
import { T } from "./tokens";

/* A shared "syntax help" pullout: a tab fixed to the right edge that opens a
 * reference drawer. Used anywhere the learner writes real code, so the help is
 * the same everywhere (the Code Lab's JavaScript, the SQL injection lab's SQL),
 * with the cheat sheet relevant to that activity passed in as `groups`. */

export type SyntaxTip = { code: string; note: string };
export type SyntaxGroup = { group: string; items: SyntaxTip[] };

function CodeBit({ children }: { children: string }) {
  return <code style={{ display: "block", whiteSpace: "pre", fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.5, color: "#c9f7e0", background: "#0b0a16", border: `1px solid ${T.edge}`, borderRadius: 7, padding: "7px 10px", overflowX: "auto" }}>{children}</code>;
}

export default function SyntaxHelp({ label = "Syntax help", intro, groups }: { label?: string; intro?: string; groups: SyntaxGroup[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label={`Open ${label}`}
          style={{ position: "fixed", right: 0, top: "42%", zIndex: 60, writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: T.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: "0 10px 10px 0", padding: "16px 9px", cursor: "pointer", boxShadow: "0 6px 20px rgba(0,0,0,0.35)" }}>
          {"{ }"} {label}
        </button>
      )}

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 70, background: "rgba(5,4,12,0.55)" }} />
          <aside style={{ position: "fixed", top: 0, right: 0, bottom: 0, zIndex: 71, width: "min(400px, 92vw)", background: T.bg, borderLeft: `1px solid ${T.edge}`, boxShadow: "-14px 0 40px rgba(0,0,0,0.5)", overflowY: "auto" }}>
            <div style={{ position: "sticky", top: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px", background: T.bg, borderBottom: `1px solid ${T.edge}` }}>
              <span style={{ fontFamily: T.display, fontSize: 16, fontWeight: 700, color: T.ink }}>{label}</span>
              <button onClick={() => setOpen(false)} aria-label={`Close ${label}`} style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.muted, background: "transparent", border: `1px solid ${T.edge}`, borderRadius: 8, padding: "5px 11px", cursor: "pointer" }}>Close &times;</button>
            </div>
            <div style={{ padding: "18px 20px 60px" }}>
              {intro && <p style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.55, margin: "0 0 20px" }}>{intro}</p>}
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {groups.map((sec) => (
                  <div key={sec.group}>
                    <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.cyan, marginBottom: 9 }}>{sec.group}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                      {sec.items.map((it, i) => (
                        <div key={i}>
                          <CodeBit>{it.code}</CodeBit>
                          <div style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.45, margin: "4px 2px 0" }}>{it.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
