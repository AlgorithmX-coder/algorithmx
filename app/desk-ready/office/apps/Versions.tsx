"use client";

import { useState, type CSSProperties } from "react";
import { W } from "../../tokens";
import { colLetter, display } from "../formula";
import { versionsOf } from "../files";
import { tabsOf, type FileVersion, type Grid, type OfficeFile } from "../types";
import { AppButton, FileGlyph } from "../ui";
import { PaperSheet } from "./Viewer";
import { DocSheet } from "./WordParts";

/* ── Module 9: Files and sharing ──────────────────────────────────────────
 * Version history, as OneDrive and SharePoint keep it (criteria SP-7):
 * every save is kept, newest first, with who saved it and when. Open shows
 * that version, read-only; Restore makes it the current version again. The
 * version that was current isn't lost: it stays in the list, so a restore
 * can always be undone by restoring again. */

export function VersionHistory({ file, canRestore, onRestore, onClose }: { file: OfficeFile; canRestore: boolean; onRestore: (index: number) => void; onClose: () => void }) {
  const rows = versionsOf(file);
  const [open, setOpen] = useState<number | null>(null); // a version's index, -1 the current one
  const [confirm, setConfirm] = useState<number | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const shown = open === null ? null : open === -1 ? { no: rows[0].no, modified: file.modified, by: file.by, sheet: file.sheet, tabs: file.tabs, doc: file.doc, paper: file.paper } : file.versions?.[open];

  return (
    <div role="dialog" aria-modal="true" aria-label={`Version history: ${file.name}`} style={{ position: "absolute", inset: 0, zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,14,26,0.45)" }}>
      <div style={{ width: "100%", maxWidth: 900, maxHeight: "100%", display: "flex", flexDirection: "column", background: W.page, borderRadius: 10, boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)", fontFamily: W.font, color: W.ink, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 10px 16px", borderBottom: `1px solid ${W.edge}` }}>
          <FileGlyph kind={file.kind} />
          <b style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, overflowWrap: "anywhere" }}>Version history: {file.name}</b>
          <button type="button" onClick={onClose} aria-label="Close" className="of-btn" style={{ width: 40, height: 40, border: "none", background: "transparent", cursor: "pointer", color: W.muted, borderRadius: 6, fontSize: 18 }}>
            ✕
          </button>
        </div>
        <div style={{ overflowY: "auto", padding: "12px 16px 16px" }}>
          <p style={{ margin: 0, fontSize: 14.5, color: W.muted, lineHeight: 1.5 }}>Every time someone saves, the version before is kept here. Open one to look at it. Restore makes it the current version again.</p>
          {done && (
            <p role="status" style={{ margin: "10px 0 0", padding: "10px 12px", borderRadius: 6, background: "#dff6dd", fontSize: 14.5 }}>
              ✓ {done}
            </p>
          )}
          <table style={{ width: "100%", marginTop: 12, borderCollapse: "collapse", fontSize: 14.5 }}>
            <thead>
              <tr style={{ color: W.muted, fontSize: 13, textAlign: "left" }}>
                <th style={th}>Version</th>
                <th style={th}>Modified</th>
                <th style={th}>Modified by</th>
                <th style={th}>Comment</th>
                <th style={{ ...th, textAlign: "right" }}>
                  <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => {
                const on = open === v.index;
                return (
                  <tr key={v.no} style={{ background: on ? W.select : undefined, borderBottom: `1px solid ${W.edge}` }}>
                    <td style={td}>
                      <b style={{ fontWeight: 600 }}>{v.no}</b>
                      {v.current && <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 10, background: "#e0f0e6", color: W.excel, fontSize: 12, fontWeight: 700 }}>Current</span>}
                    </td>
                    <td style={td}>{v.modified}</td>
                    <td style={td}>{v.by}</td>
                    <td style={{ ...td, color: W.muted, fontSize: 13.5 }}>{v.comment ?? ""}</td>
                    <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                      <span style={{ display: "inline-flex", gap: 6 }}>
                        <AppButton onClick={() => setOpen(on ? null : v.index)} style={small} title={`Look at version ${v.no}`}>
                          {on ? "Close" : "Open"}
                        </AppButton>
                        {!v.current && (
                          <AppButton onClick={() => setConfirm(v.index)} disabled={!canRestore} style={small} title={canRestore ? `Make version ${v.no} the current version` : "You can look at this file's versions, not restore them"}>
                            Restore
                          </AppButton>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {confirm !== null && (
            <div role="alert" style={{ marginTop: 12, padding: "12px 14px", borderRadius: 8, background: "#fff4ce", fontSize: 15, lineHeight: 1.5 }}>
              Restore version {file.versions?.[confirm]?.no} from {file.versions?.[confirm]?.modified}? It becomes the current version. The one that&apos;s current now stays in this list.
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <AppButton
                  primary
                  onClick={() => {
                    const v = file.versions?.[confirm];
                    onRestore(confirm);
                    setDone(`Version ${v?.no} from ${v?.modified} is now the current version.`);
                    setConfirm(null);
                    setOpen(-1);
                  }}
                >
                  Restore
                </AppButton>
                <AppButton onClick={() => setConfirm(null)}>Cancel</AppButton>
              </div>
            </div>
          )}
          {shown && <Preview v={shown} />}
        </div>
      </div>
    </div>
  );
}

const th: CSSProperties = { position: "relative", padding: "6px 8px", fontWeight: 500, borderBottom: `1px solid ${W.edge}` };
const td: CSSProperties = { padding: "6px 8px", verticalAlign: "middle", minHeight: 44 };
const small: CSSProperties = { minHeight: 34, padding: "2px 12px", fontSize: 14 };

/* One version, read-only: a sheet's cells, a document's page or a scan. */
function Preview({ v }: { v: Pick<FileVersion, "no" | "modified" | "by" | "sheet" | "tabs" | "doc" | "paper"> }) {
  const tab = tabsOf(v)[0];
  return (
    <section aria-label={`Version ${v.no}`} style={{ marginTop: 14, border: `1px solid ${W.edge}`, borderRadius: 8, overflow: "hidden" }}>
      <p style={{ margin: 0, padding: "8px 12px", background: W.chrome, borderBottom: `1px solid ${W.edge}`, fontSize: 14 }}>
        <b style={{ fontWeight: 600 }}>Version {v.no}</b> · saved {v.modified} by {v.by} · <span style={{ color: W.muted }}>Read-only</span>
      </p>
      <div style={{ maxHeight: 260, overflow: "auto", background: tab ? W.page : "#e9e7e2", padding: tab ? 0 : 12 }}>
        {tab ? <MiniGrid g={tab.grid} /> : v.doc ? <div style={{ zoom: 0.7 } as CSSProperties}><DocSheet doc={v.doc} /></div> : v.paper ? <PaperSheet paper={v.paper} /> : <p style={{ margin: 0, padding: 14, color: W.muted }}>Nothing to show.</p>}
      </div>
    </section>
  );
}

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
