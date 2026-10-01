"use client";

import type { ReactNode } from "react";
import type { AttachedDocument } from "../engine/types";
import { Icon, ICONS } from "./shared";

/* Copilot inside Word, Excel, Outlook and Teams: the app on the left, the
 * Copilot pane on the right, laid out as Microsoft lays them out, with
 * ribbons and chrome drawn in code and the practice tenant label on every
 * view. No vendor artwork. The document, sheet, inbox or recap comes from
 * the practice's material. */

export type OfficeApp = "word" | "excel" | "outlook" | "teams";

const APP = {
  word: { name: "Word", colour: "#185abd", soft: "#e8f0fb" },
  excel: { name: "Excel", colour: "#107c41", soft: "#e7f3ec" },
  outlook: { name: "Outlook", colour: "#0f6cbd", soft: "#e8f1fb" },
  teams: { name: "Teams", colour: "#5b5fc7", soft: "#eceefb" },
} as const;

const C = {
  edge: "#e1dfdd",
  ink: "#242424",
  muted: "#616161",
  faint: "#8a8a8a",
  chrome: "#f3f2f1",
  page: "#ffffff",
  mark: "linear-gradient(135deg, #2f7ee6 0%, #33c1b7 55%, #f2b64a 100%)",
  font: "'Segoe UI', 'Segoe UI Web', -apple-system, system-ui, Helvetica, Arial, sans-serif",
};

const RIBBON: Record<OfficeApp, string[]> = {
  word: ["File", "Home", "Insert", "Layout", "References", "Review", "View", "Help"],
  excel: ["File", "Home", "Insert", "Formulas", "Data", "Review", "View", "Help"],
  outlook: ["Home", "View", "Help"],
  teams: ["Chat", "Teams", "Calendar", "Calls", "Files"],
};

function TitleBar({ app, title, firmName, learnerName }: { app: OfficeApp; title: string; firmName: string; learnerName: string }) {
  const a = APP[app];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 12px", background: a.colour, color: "#fff", fontSize: 12.5 }}>
      <span aria-hidden style={{ width: 18, height: 18, borderRadius: 4, background: "rgba(255,255,255,0.25)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{a.name.slice(0, 1)}</span>
      <span style={{ fontWeight: 600 }}>{a.name}</span>
      {(app === "word" || app === "excel") && <span style={{ opacity: 0.85 }}>AutoSave <span style={{ border: "1px solid rgba(255,255,255,0.6)", borderRadius: 999, padding: "0 6px", fontSize: 10.5 }}>On</span></span>}
      <span style={{ marginLeft: 8, opacity: 0.95, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}{app === "word" || app === "excel" ? " · Saved to OneDrive" : ""}</span>
      <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 8, opacity: 0.95 }}>
        <span style={{ fontSize: 11.5 }}>{firmName}</span>
        <span style={{ width: 20, height: 20, borderRadius: "50%", background: "#c7e0f4", color: "#0f4a80", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{learnerName.trim().charAt(0).toUpperCase() || "Y"}</span>
      </span>
    </div>
  );
}

function Ribbon({ app }: { app: OfficeApp }) {
  const a = APP[app];
  return (
    <div style={{ background: C.chrome, borderBottom: `1px solid ${C.edge}`, padding: "0 12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12.5, color: C.ink }}>
        {RIBBON[app].map((tab, i) => (
          <span key={tab} style={{ padding: "7px 9px", borderBottom: i === 1 || (app === "teams" && i === 0) ? `2px solid ${a.colour}` : "2px solid transparent", color: i === 1 || (app === "teams" && i === 0) ? a.colour : C.ink, fontWeight: i === 1 || (app === "teams" && i === 0) ? 600 : 400 }}>
            {tab}
          </span>
        ))}
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, background: "#fff", border: `1px solid ${C.edge}`, fontSize: 12.5, fontWeight: 600 }}>
          <span aria-hidden style={{ width: 14, height: 14, borderRadius: 4, background: C.mark }} />
          Copilot
        </span>
      </div>
    </div>
  );
}

function WordPage({ doc }: { doc: AttachedDocument }) {
  return (
    <div style={{ flex: 1, overflow: "auto", background: "#e9e8e6", padding: "18px 22px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto", background: C.page, boxShadow: "0 1px 4px rgba(0,0,0,0.14)", padding: "44px 56px 60px", minHeight: 520, fontFamily: "'Aptos', 'Calibri', 'Segoe UI', sans-serif", color: "#1a1a1a", fontSize: 13.5, lineHeight: 1.6 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: "0 0 14px", color: "#1f3864" }}>{doc.title}</h2>
        {doc.sections.map((s, i) => (
          <div key={i}>
            <h3 style={{ fontSize: 14, fontWeight: 600, margin: "14px 0 6px", color: "#2f5496" }}>{s.heading}</h3>
            {s.paragraphs.map((p, j) => <p key={j} style={{ margin: "0 0 8px" }}>{p.text}</p>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function ExcelSheet({ doc }: { doc: AttachedDocument }) {
  const table = doc.table ?? { columns: ["Item"], rows: doc.sections.flatMap((s) => s.paragraphs.map((p) => [p.text])) };
  const cols = table.columns;
  const letters = "ABCDEFGHIJKL";
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", borderBottom: `1px solid ${C.edge}`, background: "#fff", fontSize: 12 }}>
        <span style={{ width: 54, padding: "2px 6px", border: `1px solid ${C.edge}`, borderRadius: 3, color: C.ink }}>A1</span>
        <span style={{ color: C.faint }}>fx</span>
        <span style={{ flex: 1, padding: "2px 6px", border: `1px solid ${C.edge}`, borderRadius: 3, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{cols[0]}</span>
      </div>
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12.5, fontFamily: "'Aptos Narrow', 'Calibri', 'Segoe UI', sans-serif", minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{ width: 34, background: C.chrome, border: `1px solid ${C.edge}`, color: C.faint, fontWeight: 400 }} />
              {cols.map((_, i) => <th key={i} style={{ background: C.chrome, border: `1px solid ${C.edge}`, color: C.muted, fontWeight: 400, padding: "3px 8px", textAlign: "center" }}>{letters[i] ?? "?"}</th>)}
            </tr>
            <tr>
              <td style={{ background: C.chrome, border: `1px solid ${C.edge}`, color: C.faint, textAlign: "center" }}>1</td>
              {cols.map((c, i) => <td key={i} style={{ border: `1px solid ${C.edge}`, padding: "3px 8px", fontWeight: 700, background: "#dbe5f1", whiteSpace: "nowrap" }}>{c}</td>)}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, r) => (
              <tr key={r}>
                <td style={{ background: C.chrome, border: `1px solid ${C.edge}`, color: C.faint, textAlign: "center" }}>{r + 2}</td>
                {cols.map((_, i) => <td key={i} style={{ border: `1px solid ${C.edge}`, padding: "3px 8px", whiteSpace: "nowrap", textAlign: /^[£$€]?\s?[\d,.]+$/.test(row[i] ?? "") ? "right" : "left" }}>{row[i] ?? ""}</td>)}
              </tr>
            ))}
            {Array.from({ length: Math.max(0, 14 - table.rows.length) }).map((_, r) => (
              <tr key={`e${r}`}>
                <td style={{ background: C.chrome, border: `1px solid ${C.edge}`, color: C.faint, textAlign: "center", height: 22 }}>{table.rows.length + r + 2}</td>
                {cols.map((_, i) => <td key={i} style={{ border: `1px solid ${C.edge}` }} />)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, padding: "0 10px", borderTop: `1px solid ${C.edge}`, background: C.chrome, fontSize: 12 }}>
        <span style={{ padding: "4px 12px", background: "#fff", borderBottom: `2px solid ${APP.excel.colour}`, color: APP.excel.colour, fontWeight: 600 }}>{doc.title.split(",")[0].slice(0, 24)}</span>
        <span style={{ padding: "4px 12px", color: C.muted }}>Sheet2</span>
        <span style={{ padding: "4px 8px", color: C.muted }}>+</span>
      </div>
    </div>
  );
}

function OutlookInbox({ doc }: { doc: AttachedDocument }) {
  const emails = doc.emails ?? [{ from: doc.title.replace(/^Email from /i, ""), subject: doc.sections[0]?.heading.replace(/^Subject:\s*/i, "") ?? doc.title, time: doc.kind.split(",").pop()?.trim() ?? "", preview: doc.sections[0]?.paragraphs[0]?.text.slice(0, 70) ?? "" }];
  const open = emails[0];
  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "230px minmax(0, 1fr)", minHeight: 0 }}>
      <div style={{ borderRight: `1px solid ${C.edge}`, background: "#fff", overflow: "auto" }}>
        <div style={{ padding: "8px 12px", fontSize: 12.5, fontWeight: 600, color: C.ink, borderBottom: `1px solid ${C.edge}` }}>Inbox <span style={{ color: C.faint, fontWeight: 400 }}>· Focused</span></div>
        {emails.map((e, i) => (
          <div key={i} style={{ padding: "8px 12px", borderBottom: `1px solid ${C.edge}`, background: i === 0 ? APP.outlook.soft : "transparent", borderLeft: i === 0 ? `3px solid ${APP.outlook.colour}` : "3px solid transparent" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 6, fontSize: 12.5 }}><b style={{ color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.from}</b><span style={{ color: C.faint, fontSize: 11, whiteSpace: "nowrap" }}>{e.time}</span></div>
            <div style={{ fontSize: 12.5, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.subject}</div>
            <div style={{ fontSize: 11.5, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.preview}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#fff" }}>
        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.edge}` }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.ink }}>{open.subject}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6, fontSize: 12.5, color: C.muted }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "#c7e0f4", color: "#0f4a80", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{open.from.charAt(0)}</span>
            <span><b style={{ color: C.ink }}>{open.from}</b> · To: you · {open.time}</span>
          </div>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "14px 16px", fontSize: 13.5, lineHeight: 1.6, color: C.ink }}>
          {doc.sections.map((s, i) => s.paragraphs.map((p, j) => <p key={`${i}-${j}`} style={{ margin: "0 0 10px" }}>{p.text}</p>))}
        </div>
        <div style={{ borderTop: `1px solid ${C.edge}`, padding: "8px 12px", display: "flex", gap: 8, fontSize: 12.5 }}>
          {["Reply", "Reply all", "Forward"].map((b) => <span key={b} style={{ padding: "4px 10px", border: `1px solid ${C.edge}`, borderRadius: 4, color: C.ink }}>{b}</span>)}
        </div>
      </div>
    </div>
  );
}

function TeamsRecap({ doc }: { doc: AttachedDocument }) {
  const lines = doc.transcript ?? doc.sections.flatMap((s) => s.paragraphs.map((p) => ({ who: s.heading, line: p.text })));
  return (
    <div style={{ flex: 1, display: "grid", gridTemplateColumns: "200px minmax(0, 1fr)", minHeight: 0 }}>
      <div style={{ borderRight: `1px solid ${C.edge}`, background: C.chrome, overflow: "auto", padding: "10px 0" }}>
        <div style={{ padding: "4px 12px", fontSize: 11, color: C.faint, letterSpacing: "0.04em" }}>Your teams</div>
        {["General", "Finance", "Month end"].map((ch, i) => (
          <div key={ch} style={{ padding: "6px 12px 6px 22px", fontSize: 12.5, color: i === 2 ? C.ink : C.muted, fontWeight: i === 2 ? 600 : 400, background: i === 2 ? "#fff" : "transparent" }}>{ch}</div>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#fff" }}>
        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.edge}`, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{doc.title}</span>
          <span style={{ fontSize: 11.5, color: C.muted, padding: "2px 8px", borderRadius: 999, background: APP.teams.soft }}>Recap</span>
          <span style={{ marginLeft: "auto", fontSize: 12, color: C.muted }}>{doc.kind}</span>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {lines.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0, width: 26, height: 26, borderRadius: "50%", background: ["#c7e0f4", "#e4d7f5", "#d4ead9", "#fde2cf"][i % 4], color: "#333", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{l.who.charAt(0)}</span>
              <span><b style={{ color: C.ink }}>{l.who}</b> <span style={{ color: C.faint, fontSize: 11 }}>{String(9 + Math.floor(i / 3)).padStart(2, "0")}:{String((i * 7) % 60).padStart(2, "0")}</span><br />{l.line}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OfficeFrame({ app, material, firmName, learnerName, children }: { app: OfficeApp; material: AttachedDocument; firmName: string; learnerName: string; children: ReactNode }) {
  return (
    <div className="sim-office" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gridTemplateRows: "minmax(0, 1fr)", height: 680, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.page, color: C.ink, fontFamily: C.font, lineHeight: 1.5, colorScheme: "light" }}>
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        <TitleBar app={app} title={material.title} firmName={firmName} learnerName={learnerName} />
        <Ribbon app={app} />
        {app === "word" && <WordPage doc={material} />}
        {app === "excel" && <ExcelSheet doc={material} />}
        {app === "outlook" && <OutlookInbox doc={material} />}
        {app === "teams" && <TeamsRecap doc={material} />}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px", borderTop: `1px solid ${C.edge}`, background: C.chrome, fontSize: 11, color: C.muted }}>
          <span>{APP[app].name} · practice tenant</span>
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4 }}><Icon d={ICONS.globe} size={12} /> {firmName}</span>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, minWidth: 0 }}>{children}</div>
      <style>{`
        @media (max-width: 1240px) {
          .sim-office { grid-template-columns: minmax(0, 1fr) 300px !important; }
        }
        @media (max-width: 900px) {
          .sim-office { grid-template-columns: minmax(0, 1fr) !important; grid-template-rows: 300px minmax(0, 1fr) !important; height: 720px !important; }
        }
      `}</style>
    </div>
  );
}
