"use client";

/**
 * /explorers — Cyber Explorers entry: the MISSION MAP.
 * A spy-themed journey down through the 4 clearance blocks. Each case is
 * a node on the path, fronted by its villain and cold-open art; a guided
 * "next" marker and a clearance HUD show the kid exactly where they are
 * and what to play next. Every case stays open to play in any order.
 * The original static PoC lives on at /explorers/poc.
 */

import { useEffect, useMemo, useState } from "react";
import MissionRuntime from "./engine/MissionRuntime";
import { EngineStyles, Eyebrow, Resolve, RoomBackdrop, useReducedMotion } from "./engine/primitives";
import { BODY, MONO, T } from "./engine/tokens";
import type { AwardEvent, MissionManifest } from "./engine/types";
import { checkpointStorageKey, xpForEvent } from "./engine/types";
import { mission01 } from "./missions/mission01";
import { mission02 } from "./missions/mission02";
import { mission03 } from "./missions/mission03";
import { mission04 } from "./missions/mission04";
import { mission05 } from "./missions/mission05";
import { mission06 } from "./missions/mission06";
import { mission07 } from "./missions/mission07";
import { mission08 } from "./missions/mission08";
import { mission09 } from "./missions/mission09";
import { mission10 } from "./missions/mission10";
import { mission11 } from "./missions/mission11";
import { mission12 } from "./missions/mission12";
import { mission13 } from "./missions/mission13";
import { mission14 } from "./missions/mission14";
import { mission15 } from "./missions/mission15";
import { mission16 } from "./missions/mission16";
import { mission17 } from "./missions/mission17";
import { mission18 } from "./missions/mission18";
import { mission19 } from "./missions/mission19";
import { mission20 } from "./missions/mission20";

const CASES: MissionManifest[] = [
  mission01, mission02, mission03, mission04, mission05,
  mission06, mission07, mission08, mission09, mission10,
  mission11, mission12, mission13, mission14, mission15,
  mission16, mission17, mission18, mission19, mission20,
];

const BLOCKS = [
  { n: 1, name: "SIGNALS", classification: "CONFIDENTIAL", color: T.bandConfidential, blurb: "Learn to spot the scam." },
  { n: 2, name: "THE HUMAN FACTOR", classification: "SECRET", color: T.bandSecret, blurb: "The tricks aimed at people." },
  { n: 3, name: "SYSTEMS", classification: "TOP SECRET", color: T.bandTopSecret, blurb: "How the tech really works." },
  { n: 4, name: "THE LONG GAME", classification: "ULTRA", color: T.bandUltra, blurb: "The big picture, and the mastermind." },
] as const;

/** The real cybersecurity topic each case teaches, shown on its card. */
const TOPICS: Record<string, string> = {
  "explorers-m01": "PHISHING",
  "explorers-m02": "PRIZE SCAMS",
  "explorers-m03": "PASSWORD CRACKING",
  "explorers-m04": "DIGITAL FOOTPRINT",
  "explorers-m05": "SPEAR PHISHING",
  "explorers-m06": "SOCIAL ENGINEERING",
  "explorers-m07": "ACCOUNT TAKEOVER",
  "explorers-m08": "AI IMPERSONATION",
  "explorers-m09": "ONLINE MANIPULATION",
  "explorers-m10": "DEEPFAKE VOICE",
  "explorers-m11": "PASSWORDS & 2FA",
  "explorers-m12": "ENCRYPTION",
  "explorers-m13": "SESSION HIJACKING",
  "explorers-m14": "MALWARE",
  "explorers-m15": "SPOOFED SITES",
  "explorers-m16": "DATA BROKERS",
  "explorers-m17": "DISINFORMATION",
  "explorers-m18": "CYBERCRIME & ETHICS",
  "explorers-m19": "THE ATTACK CHAIN",
  "explorers-m20": "INCIDENT RESPONSE",
};

export default function ExplorersPage() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<MissionManifest | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [totalXp, setTotalXp] = useState(0);
  const [devBoss, setDevBoss] = useState(false);

  useEffect(() => {
    const s: Record<string, string> = {};
    let xp = 0;
    for (const m of CASES) {
      try {
        const raw = localStorage.getItem(checkpointStorageKey(m.id));
        if (raw) {
          const cp = JSON.parse(raw) as { pos?: { beat?: string }; events?: AwardEvent[] };
          s[m.id] = cp.pos?.beat === "closed" ? "CLOSED" : "IN PROGRESS";
          for (const e of cp.events ?? []) xp += xpForEvent(e);
        }
      } catch {}
    }
    setStatus(s);
    setTotalXp(xp);
  }, []);

  // Dev-only deep link: /explorers?case=16 opens that case; add &at=boss to jump
  // straight to the boss for review. Disabled in production builds.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const p = new URLSearchParams(window.location.search);
    const c = p.get("case");
    if (!c) return;
    const id = `explorers-m${c.padStart(2, "0")}`;
    const found = CASES.find((m) => m.id === id);
    if (found) {
      setActive(found);
      setDevBoss(p.get("at") === "boss");
    }
  }, []);

  const closedCount = useMemo(() => CASES.filter((m) => status[m.id] === "CLOSED").length, [status]);
  const nextCase = useMemo(() => CASES.find((m) => status[m.id] !== "CLOSED") ?? null, [status]);

  const blockStats = BLOCKS.map((b) => {
    const cases = CASES.filter((m) => m.block === b.n);
    const closed = cases.filter((m) => status[m.id] === "CLOSED").length;
    return { ...b, cases, closed, total: cases.length, done: closed > 0 && closed === cases.length };
  });
  const currentBlock = nextCase?.block ?? 4;

  if (active) return <MissionRuntime manifest={active} devStartBeat={devBoss ? "incident" : undefined} />;

  const continueLabel = !nextCase
    ? "ALL CASES CLOSED"
    : status[nextCase.id] === "IN PROGRESS"
      ? `CONTINUE: ${nextCase.caseNumber}`
      : closedCount === 0
        ? `START: ${nextCase.caseNumber}`
        : `NEXT: ${nextCase.caseNumber}`;

  return (
    <main style={{ minHeight: "100vh", background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflow: "hidden" }}>
      <EngineStyles />
      <RoomBackdrop reduced={reduced} tone={T.arcCyan} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 980, margin: "0 auto", padding: "56px 20px 90px" }}>
        {/* ---------------------------------------------------------- HERO / HUD */}
        <div className="sr-scene">
          <Eyebrow text="ARC secure net: mission map" color={T.arcCyan} />
          <h1 style={{ fontFamily: MONO, fontSize: "clamp(30px, 6vw, 52px)", fontWeight: 600, margin: "14px 0 6px", textShadow: `0 0 40px ${T.arcCyan}33`, lineHeight: 1.05 }}>
            <Resolve text="Pick your case," reduced={reduced} />
            <br />
            <span style={{ color: T.arcCyan }}>
              <Resolve text="Operative." reduced={reduced} delay={350} />
            </span>
          </h1>

          {/* clearance ladder + stats */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", margin: "18px 0 10px" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {BLOCKS.map((b, i) => {
                const bs = blockStats[i];
                const isCurrent = b.n === currentBlock;
                return (
                  <span
                    key={b.n}
                    title={`Block ${b.n}: ${b.name}`}
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.08em",
                      padding: "5px 9px",
                      borderRadius: 3,
                      border: `1px solid ${isCurrent ? b.color : bs.done ? `${b.color}88` : T.hairline}`,
                      color: bs.done ? b.color : isCurrent ? b.color : T.textDisabled,
                      background: isCurrent ? `${b.color}1A` : "transparent",
                      boxShadow: isCurrent ? `0 0 14px ${b.color}44` : "none",
                    }}
                  >
                    {bs.done ? "■" : "□"} {b.classification}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", marginTop: 6 }}>
            <button
              onClick={() => nextCase && setActive(nextCase)}
              disabled={!nextCase}
              className="sr-btn"
              style={{
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: T.inkBlack,
                background: T.actionAmber,
                border: "none",
                borderRadius: 4,
                padding: "13px 22px",
                cursor: nextCase ? "pointer" : "default",
                boxShadow: `0 0 22px ${T.actionAmber}55`,
                opacity: nextCase ? 1 : 0.6,
              }}
            >
              {nextCase ? "▶ " : "✓ "}
              {continueLabel}
            </button>
            <div style={{ display: "flex", gap: 22, fontFamily: MONO, fontSize: 12, color: T.textSecondary }}>
              <span>
                CASES&nbsp;<span style={{ color: T.confirmedGreen, fontSize: 17, fontWeight: 600 }}>{closedCount}</span>
                <span style={{ color: T.textDisabled }}> / {CASES.length}</span>
              </span>
              <span>
                XP&nbsp;<span style={{ color: T.clearanceBrass, fontSize: 17, fontWeight: 600 }}>{totalXp}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------- THE MAP */}
        <div style={{ position: "relative", marginTop: 46 }}>
          {/* the journey spine */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 21,
              top: 24,
              bottom: 60,
              width: 2,
              background: `linear-gradient(${T.bandConfidential}, ${T.bandSecret}, ${T.bandTopSecret}, ${T.bandUltra})`,
              opacity: 0.45,
            }}
          />

          {blockStats.map((b) => (
            <section key={b.n} className="sr-scene" style={{ position: "relative", paddingLeft: 56, marginBottom: 40 }}>
              {/* station marker on the spine */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  border: `2px solid ${b.color}`,
                  background: T.inkBlack,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: `0 0 16px ${b.color}66`,
                  fontFamily: MONO,
                  fontSize: 18,
                  fontWeight: 600,
                  color: b.color,
                  zIndex: 1,
                }}
              >
                {b.n}
              </div>

              {/* block header */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "4px 12px", minHeight: 44 }}>
                <span style={{ fontFamily: MONO, fontSize: "clamp(17px, 3vw, 22px)", fontWeight: 600, color: T.textPrimary }}>
                  BLOCK {b.n}: {b.name}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.16em", color: T.inkBlack, background: b.color, borderRadius: 3, padding: "3px 8px" }}>
                  {b.classification}
                </span>
                <span style={{ fontFamily: MONO, fontSize: 11, color: b.done ? T.confirmedGreen : T.textSecondary, marginLeft: "auto" }}>
                  {b.closed}/{b.total} CLOSED
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: 13.5, color: T.textSecondary }}>{b.blurb}</p>

              {/* case nodes */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(158px, 1fr))", gap: 12, marginTop: 14 }}>
                {b.cases.map((m) => {
                  const st = status[m.id];
                  const isClosed = st === "CLOSED";
                  const isNext = nextCase?.id === m.id;
                  const ring = isNext ? T.actionAmber : isClosed ? T.clearanceBrass : b.color;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActive(m)}
                      className="sr-btn"
                      aria-label={`${m.caseNumber}: ${m.title}. Villain ${m.actor.codename}.${isClosed ? " Closed." : isNext ? " Play next." : ""}`}
                      style={{
                        position: "relative",
                        textAlign: "left",
                        border: `1.5px solid ${isNext ? T.actionAmber : `${b.color}66`}`,
                        borderRadius: 8,
                        overflow: "hidden",
                        padding: 0,
                        cursor: "pointer",
                        background: T.inkBlack,
                        minHeight: 168,
                        boxShadow: isNext ? `0 0 24px ${T.actionAmber}55` : "none",
                      }}
                    >
                      {/* cold-open art */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.scene}
                        alt=""
                        loading="lazy"
                        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: isClosed ? 0.16 : 0.3 }}
                      />
                      <div aria-hidden style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${T.inkBlack}55 0%, ${T.inkBlack}dd 62%, ${T.inkBlack} 100%)` }} />

                      <div style={{ position: "relative", padding: "11px 12px 13px", height: "100%", display: "flex", flexDirection: "column" }}>
                        {/* top row: case number + status */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary }}>{m.caseNumber}</span>
                          {isClosed ? (
                            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: T.clearanceBrass, border: `1px solid ${T.clearanceBrass}77`, borderRadius: 2, padding: "2px 6px" }}>■ CLOSED</span>
                          ) : isNext ? (
                            <span className="sr-blink" style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: T.inkBlack, background: T.actionAmber, borderRadius: 2, padding: "2px 6px", fontWeight: 600 }}>▶ {status[m.id] === "IN PROGRESS" ? "RESUME" : "PLAY"}</span>
                          ) : st === "IN PROGRESS" ? (
                            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: "0.08em", color: T.confirmedGreen, border: `1px solid ${T.confirmedGreen}77`, borderRadius: 2, padding: "2px 6px" }}>◐ STARTED</span>
                          ) : null}
                        </div>

                        {/* villain avatar */}
                        <div style={{ margin: "10px 0 8px" }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.actor.portrait}
                            alt={m.actor.codename}
                            loading="lazy"
                            style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid ${ring}`, boxShadow: `0 0 12px ${ring}66`, background: T.panel }}
                          />
                        </div>

                        {/* topic + title + villain */}
                        <div style={{ fontFamily: MONO, fontSize: 9, fontWeight: 600, letterSpacing: "0.12em", color: b.color, marginBottom: 3 }}>
                          {TOPICS[m.id] ?? ""}
                        </div>
                        <div style={{ fontFamily: MONO, fontSize: 14.5, fontWeight: 600, lineHeight: 1.25, color: T.textPrimary }}>{m.title}</div>
                        <div style={{ marginTop: "auto", paddingTop: 8, fontFamily: MONO, fontSize: 10, letterSpacing: "0.06em", color: T.threatRed }}>
                          vs {m.actor.codename}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          {/* end-of-journey marker */}
          <div style={{ position: "relative", paddingLeft: 56 }}>
            <div style={{ position: "absolute", left: 8, top: 2, width: 28, height: 28, borderRadius: "50%", border: `2px solid ${T.clearanceBrass}`, background: T.inkBlack, display: "grid", placeItems: "center", color: T.clearanceBrass, fontSize: 13, boxShadow: `0 0 16px ${T.clearanceBrass}66` }}>★</div>
            <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.08em", color: T.clearanceBrass, paddingTop: 4 }}>
              CLOSE EVERY CASE TO REACH ULTRA CLEARANCE
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
