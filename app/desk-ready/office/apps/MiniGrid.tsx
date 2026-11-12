"use client";

import type { CSSProperties } from "react";
import { W } from "../../tokens";
import { colLetter, display } from "../formula";
import type { Grid } from "../types";

/* ── Module 9: Files and sharing ── */
/* A sheet drawn small and still, with its column letters and row numbers. */
export function MiniGrid({ g }: { g: Grid }) {
  const last = g.reduce((n, r, i) => (r.some((c) => c.trim()) ? i : n), 0);
  const cols = g[0]?.reduce((n, c, i) => (g.some((r) => (r[i] ?? "").trim()) ? i + 1 : n), 0) ?? 0;
  const cell: CSSProperties = { border: `1px solid ${W.edge}`, padding: "3px 8px", whiteSpace: "nowrap", fontSize: 13.5 };
  return (
    <table style={{ borderCollapse: "collapse", fontFamily: W.font, minWidth: "100%" }}>
      <thead>
        <tr>
          <th style={{ ...cell, background: W.sunk, width: 34 }} />
          {Array.from({ length: cols }, (_, c) => (
            <th key={c} style={{ ...cell, background: W.sunk, color: W.muted, fontWeight: 400, fontSize: 12.5 }}>
              {colLetter(c)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {g.slice(0, last + 1).map((r, ri) => (
          <tr key={ri}>
            <td style={{ ...cell, background: W.sunk, color: W.muted, textAlign: "center", fontSize: 12.5 }}>{ri + 1}</td>
            {Array.from({ length: cols }, (_, c) => (
              <td key={c} style={{ ...cell, fontWeight: ri === 0 ? 700 : 400, background: ri === 0 ? "#e6f2ea" : W.page }}>
                {display(g, ri, c)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
