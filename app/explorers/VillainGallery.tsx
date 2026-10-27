"use client";

/**
 * THE WATCHLIST — the mission board's villain gallery. All 7 recurring
 * actors (6 operatives + ZERO, the coordinator behind them), each shown as
 * a silhouette until the agent has actually closed a case against them, at
 * which point their portrait unlocks for good. Every actor returns 2-3
 * times across the game with a DIFFERENT mo and DIFFERENT defeatedBy line
 * each time (real authored dossier content, not invented here) — shown as
 * a LEVEL 1/2/3 timeline, so the gallery itself makes the point the owner
 * wanted stressed: real attackers don't stay still, they adapt.
 *
 * A case not yet closed shows its mo (the threat) but redacts defeatedBy
 * (the answer) until it's actually been played — no spoilers.
 *
 * Where a journal exists for a closed case (Blocks 2 and 3, see
 * engine/journal.ts), the dossier surfaces it directly: a revision hub, not
 * just a trophy case.
 */

import { useEffect, useState } from "react";
import type { MissionManifest } from "./engine/types";
import { MONO } from "./engine/tokens";
import { loadJournal, type JournalEntry } from "./engine/journal";

const INK = "#D3E6F7";
const DIM = "#617a9e";
const SYS = "#34E1FF";
const AMBER = "#FFC24B";
const GREEN = "#3BF57E";

interface Appearance {
  id: string;
  caseNumber: string;
  title: string;
  mo: string;
  defeatedBy: string;
  closed: boolean;
}
interface VillainEntry {
  codename: string;
  portrait: string;
  appearances: Appearance[];
}

function buildVillains(cases: MissionManifest[], status: Record<string, string>): VillainEntry[] {
  const byCodename = new Map<string, VillainEntry>();
  for (const c of cases) {
    const codename = c.actor.codename;
    const portrait = c.actor.portrait ?? "/explorers/actors/coordinator.png";
    const entry = byCodename.get(codename) ?? { codename, portrait, appearances: [] };
    entry.appearances.push({
      id: c.id,
      caseNumber: c.caseNumber,
      title: c.title,
      mo: c.dossier?.mo ?? c.actor.mo,
      defeatedBy: c.dossier?.defeatedBy ?? "",
      closed: status[c.id] === "CLOSED",
    });
    byCodename.set(codename, entry);
  }
  return Array.from(byCodename.values());
}

export function VillainGallery({
  cases,
  status,
  onOpenCase,
  onClose,
}: {
  cases: MissionManifest[];
  status: Record<string, string>;
  onOpenCase: (id: string) => void;
  onClose: () => void;
}) {
  const villains = buildVillains(cases, status);
  const [openCodename, setOpenCodename] = useState<string | null>(null);
  const open = villains.find((v) => v.codename === openCodename) ?? null;

  return (
    <div
      role="dialog"
      aria-label="The Watchlist, villain gallery"
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(3,5,12,0.94)", backdropFilter: "blur(6px)", overflowY: "auto", padding: "28px 18px 60px" }}
    >
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.26em", color: SYS }}>ARC · CLASSIFIED</div>
            <h1 style={{ fontFamily: MONO, fontSize: "clamp(26px,5vw,38px)", fontWeight: 800, color: INK, margin: "4px 0 0" }}>THE WATCHLIST</h1>
          </div>
          <button
            onClick={onClose}
            aria-label="Close the watchlist"
            style={{ fontFamily: MONO, fontSize: 12.5, color: DIM, background: "transparent", border: `1px solid ${DIM}55`, borderRadius: 999, padding: "8px 16px", cursor: "pointer" }}
          >
            ✕ Close
          </button>
        </div>
        <p style={{ fontFamily: MONO, fontSize: 12.5, color: DIM, lineHeight: 1.6, margin: "6px 0 26px", maxWidth: 640 }}>
          Every repeat offender ARC has flagged. Close a case against one to unmask their file, and watch how they change their angle every time they come back.
        </p>

        {open ? (
          <VillainDossier villain={open} onBack={() => setOpenCodename(null)} onOpenCase={onOpenCase} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 16 }}>
            {villains.map((v) => {
              const known = v.appearances.some((a) => a.closed);
              const defeatedCount = v.appearances.filter((a) => a.closed).length;
              return (
                <button
                  key={v.codename}
                  onClick={() => setOpenCodename(v.codename)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${known ? SYS + "44" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 12,
                    padding: "16px 10px 14px",
                    cursor: "pointer",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      overflow: "hidden",
                      background: "#11151f",
                      border: `1.5px solid ${known ? SYS + "77" : "rgba(255,255,255,0.12)"}`,
                      display: "block",
                    }}
                  >
                    <img
                      src={v.portrait}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", filter: known ? "none" : "brightness(0) opacity(0.5)" }}
                    />
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, letterSpacing: "0.04em", color: known ? INK : DIM, textAlign: "center" }}>
                    {known ? v.codename : "?????"}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 9.5, color: defeatedCount > 0 ? GREEN : DIM, letterSpacing: "0.06em" }}>
                    {defeatedCount}/{v.appearances.length} CLOSED
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function VillainDossier({ villain, onBack, onOpenCase }: { villain: VillainEntry; onBack: () => void; onOpenCase: (id: string) => void }) {
  const known = villain.appearances.some((a) => a.closed);
  // The most recently CLOSED appearance is the agent's current intel — their
  // latest known angle, not necessarily their first one.
  const latestClosed = [...villain.appearances].reverse().find((a) => a.closed) ?? villain.appearances[0];

  return (
    <div>
      <button onClick={onBack} style={{ fontFamily: MONO, fontSize: 11.5, color: DIM, background: "transparent", border: "none", cursor: "pointer", padding: 0, marginBottom: 16 }}>
        ← Back to the watchlist
      </button>

      <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 22 }}>
        <span aria-hidden style={{ width: 104, height: 104, borderRadius: 16, overflow: "hidden", background: "#11151f", border: `1.5px solid ${SYS}55`, flex: "0 0 auto" }}>
          <img src={villain.portrait} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: known ? "none" : "brightness(0) opacity(0.5)" }} />
        </span>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 800, color: INK, letterSpacing: "0.03em" }}>{known ? villain.codename : "UNIDENTIFIED"}</div>
          <p style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.6, color: DIM, margin: "8px 0 0", maxWidth: 520 }}>
            {known ? latestClosed.mo : "No case against this actor has been closed yet. Their file stays sealed until you do."}
          </p>
          {known && (
            <p style={{ fontFamily: MONO, fontSize: 12, lineHeight: 1.6, color: AMBER, margin: "10px 0 0", maxWidth: 520 }}>
              ⚠ {villain.codename} doesn't stay still. Each return uses a new angle. What worked last time might not work again.
            </p>
          )}
        </div>
      </div>

      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", color: SYS, marginBottom: 10 }}>ENCOUNTER HISTORY</div>
      <div style={{ display: "grid", gap: 12 }}>
        {villain.appearances.map((a, i) => (
          <AppearanceCard key={a.id} appearance={a} level={i + 1} onOpenCase={onOpenCase} />
        ))}
      </div>
    </div>
  );
}

function AppearanceCard({ appearance: a, level, onOpenCase }: { appearance: Appearance; level: number; onOpenCase: (id: string) => void }) {
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  useEffect(() => {
    if (a.closed) setJournal(loadJournal(a.id));
  }, [a.id, a.closed]);

  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${a.closed ? GREEN + "33" : "rgba(255,255,255,0.08)"}`, borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", color: a.closed ? GREEN : DIM }}>
          ⚡ LEVEL {level} {a.closed ? "· CLOSED" : "· OPEN CASE"}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 10.5, color: DIM }}>{a.caseNumber}</span>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 700, color: INK, margin: "4px 0 6px" }}>{a.title}</div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: a.closed ? INK : DIM, margin: 0, fontStyle: a.closed ? "normal" : "italic" }}>
        {a.closed ? a.mo : "Threat not yet assessed. Close this case to find out how they're operating this time."}
      </p>
      {a.closed && a.defeatedBy && (
        <p style={{ fontSize: 12.5, lineHeight: 1.5, color: GREEN, margin: "8px 0 0" }}>
          <b>What beat them:</b> {a.defeatedBy}
        </p>
      )}
      {journal.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed rgba(255,255,255,0.12)" }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: AMBER, marginBottom: 6 }}>📓 FROM YOUR CASE JOURNAL</div>
          <div style={{ display: "grid", gap: 6 }}>
            {journal.map((e) => (
              <div key={e.skillN} style={{ fontSize: 12, lineHeight: 1.5, color: DIM }}>
                <b style={{ color: INK }}>{e.title}:</b> {e.note}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: 11 }}>
        <button
          onClick={() => onOpenCase(a.id)}
          style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", color: SYS, background: "transparent", border: `1px solid ${SYS}55`, borderRadius: 999, padding: "6px 13px", cursor: "pointer" }}
        >
          {a.closed ? "Revisit this case →" : "Go to this case →"}
        </button>
      </div>
    </div>
  );
}
