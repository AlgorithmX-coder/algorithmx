"use client";

import { useState, type CSSProperties } from "react";
import { W } from "../../tokens";
import { avatarColour } from "../meetings";
import { PEOPLE } from "../northfield";
import { FileList } from "../places";
import { listFolder } from "../store";
import type { OfficeFile, OfficeState, Path } from "../types";
import { Avatar } from "./icons";

/* ── Module 9: Files and sharing ──────────────────────────────────────────
 * The Teams pane of Teams: the Operations Team, its General channel, and
 * the channel's Posts and Files tabs. The Files tab is the point (criteria
 * SP-1): it lists the very same folders as the Operations Team site in
 * SharePoint and File Explorer, because that is where Teams keeps a team's
 * files. Opening a file here opens the same file, never a copy. */

export function TeamsChannel({ state, openFile }: { state: OfficeState; openFile: (f: OfficeFile) => void }) {
  const [tab, setTab] = useState<"posts" | "files">("files");
  const [at, setAt] = useState<Path>(["Operations Team", "Documents"]);
  const [picked, setPicked] = useState<string | null>(null);
  const go = (p: Path) => {
    setAt(p);
    setPicked(null);
  };
  const items = listFolder(state, at);
  const crumb: CSSProperties = { border: "none", background: "transparent", padding: "4px 2px", fontFamily: W.font, fontSize: 15, cursor: "pointer", borderRadius: 4 };

  return (
    <>
      <div style={{ width: 250, flexShrink: 0, background: "#f5f5f5", borderRight: `1px solid ${W.edge}`, padding: "12px 8px" }}>
        <b style={{ display: "block", padding: "2px 8px 12px", fontSize: 18, fontWeight: 700 }}>Teams</b>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", fontSize: 14.5, fontWeight: 600 }}>
          <span aria-hidden style={{ width: 28, height: 28, borderRadius: 6, background: "#03787c", color: "#fff", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>OT</span>
          Operations Team
        </div>
        <button type="button" aria-pressed className="of-row on" style={{ width: "100%", minHeight: 40, padding: "6px 8px 6px 46px", border: "none", borderRadius: 6, background: W.teamsSoft, textAlign: "left", fontFamily: W.font, fontSize: 14.5, fontWeight: 600, color: W.ink }}>
          General
        </button>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: W.page }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 18, minHeight: 52, padding: "0 16px", borderBottom: `1px solid ${W.edge}` }}>
          <span aria-hidden style={{ alignSelf: "center", width: 28, height: 28, borderRadius: 6, background: "#03787c", color: "#fff", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>OT</span>
          <b style={{ alignSelf: "center", fontSize: 16, fontWeight: 600, marginRight: 6 }}>General</b>
          {(["posts", "files"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} style={{ minHeight: 46, padding: "0 4px", border: "none", borderBottom: `3px solid ${tab === t ? W.teams : "transparent"}`, background: "transparent", fontFamily: W.font, fontSize: 15, fontWeight: tab === t ? 600 : 400, color: tab === t ? W.ink : W.muted, cursor: "pointer" }}>
              {t === "posts" ? "Posts" : "Files"}
            </button>
          ))}
        </div>
        {tab === "posts" ? (
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 6, background: "#f8f8f8", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", fontSize: 15, lineHeight: 1.55 }}>
              <Avatar name={PEOPLE.daniel.name} colour={avatarColour(PEOPLE.daniel.address)} size={30} />
              <div>
                <span style={{ fontSize: 12.5, color: W.muted }}>
                  <b style={{ color: W.ink, fontWeight: 600 }}>{PEOPLE.daniel.name}</b> · Mon 09:05
                </span>
                <p style={{ margin: "2px 0 0", color: W.body }}>Morning all. Anything the team needs lives in Files, here or on the Operations Team site. Same files, two ways in.</p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
            <p style={{ margin: 0, padding: "8px 16px", fontSize: 13.5, color: W.body, background: "#eef6f6", borderBottom: `1px solid ${W.edge}` }}>These are the Operations Team site&apos;s files on SharePoint: the same files you see in File Explorer, not copies.</p>
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, minHeight: 44, padding: "4px 14px", borderBottom: `1px solid ${W.edge}` }}>
              {at.slice(1).map((part, i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {i > 0 && <span style={{ color: W.faint }}>›</span>}
                  <button type="button" onClick={() => go(at.slice(0, i + 2))} style={{ ...crumb, color: i === at.length - 2 ? W.ink : W.muted, fontWeight: i === at.length - 2 ? 600 : 400 }}>
                    {part}
                  </button>
                </span>
              ))}
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              <FileList items={items} selected={picked} onPick={(f) => setPicked(f.id)} onOpen={(f) => (f.kind === "folder" ? go([...f.path, f.name]) : openFile(f))} />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
