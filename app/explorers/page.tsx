"use client";

/**
 * /explorers — Cyber Explorers entry: the MISSION MAP as a neon cyber
 * terminal. Multi-colour matrix rain + CRT chrome; each of the 4 clearance
 * blocks owns a neon colour (cyan / pink / amber / violet) so the page has
 * real colour variety for a young-teen audience while staying a cool hacker
 * terminal. Every case is playable in any order. PoC lives at /explorers/poc.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import MissionRuntime from "./engine/MissionRuntime";
import { useReducedMotion } from "./engine/primitives";
import { MONO } from "./engine/tokens";
import type { AwardEvent, MissionManifest } from "./engine/types";
import { checkpointStorageKey, xpForEvent } from "./engine/types";
import { CaseGlyph } from "./CaseGlyphs";
import { MatrixRain } from "./MatrixRain";
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

// neon colour per clearance block (young-teen colour variety)
const BLOCKS = [
  { n: 1, name: "SIGNALS", slug: "signals", classification: "CONFIDENTIAL", color: "#34E1FF", blurb: "learn to spot the scam", sev: 2 },
  { n: 2, name: "THE HUMAN FACTOR", slug: "human_factor", classification: "SECRET", color: "#FF5CA8", blurb: "the tricks aimed at people", sev: 3 },
  { n: 3, name: "SYSTEMS", slug: "systems", classification: "TOP SECRET", color: "#FFB23E", blurb: "how the tech really works", sev: 4 },
  { n: 4, name: "THE LONG GAME", slug: "long_game", classification: "ULTRA", color: "#B98BFF", blurb: "the big picture, and the mastermind", sev: 5 },
] as const;

/** Plain-English gloss under each case's technique title. */
const TOPICS: Record<string, string> = {
  "explorers-m01": "spot the fake message",
  "explorers-m02": "too-good-to-be-true scams",
  "explorers-m03": "how passwords fall",
  "explorers-m04": "your public data trail",
  "explorers-m05": "targeted attacks",
  "explorers-m06": "manipulation tactics",
  "explorers-m07": "hijacked accounts",
  "explorers-m08": "fake online identities",
  "explorers-m09": "the slow trust trap",
  "explorers-m10": "voice-clone calls",
  "explorers-m11": "lock every account",
  "explorers-m12": "wi-fi eavesdropping",
  "explorers-m13": "stolen logins & side doors",
  "explorers-m14": "malware in disguise",
  "explorers-m15": "fake look-alike sites",
  "explorers-m16": "who buys your data",
  "explorers-m17": "faked images & media",
  "explorers-m18": "cybercrime & the choice",
  "explorers-m19": "the full attack, end to end",
  "explorers-m20": "unmask the coordinator",
};

const RAIN_COLORS = ["#34E1FF", "#FF5CA8", "#FFB23E", "#B98BFF", "#3BF57E"];

// terminal palette (scoped to this page)
const SYS = "#34E1FF"; // system / chrome
const TXT = "#D3E6F7"; // readable body
const DIM = "#5E7699"; // muted
const AMBER = "#FFC24B"; // the next case

/* Locked cards read as "encrypted intel awaiting decryption", not dead grey
 * boxes, and each of the four blocks gets its OWN texture so they feel distinct:
 *   signal   -> intercepted waveform / spectrum (Signals)
 *   redacted -> a censored classified file (The Human Factor)
 *   hex      -> a scrolling memory dump (Systems)
 *   network  -> the mastermind's node web (The Long Game)
 * All pure CSS (no Math.random at render, so no hydration mismatch); motion is
 * dropped under prefers-reduced-motion but each texture still reads. */
const LOCK_VARIANTS = ["signal", "redacted", "hex", "network"] as const;
type LockVariant = (typeof LOCK_VARIANTS)[number];

const REDACT_ROWS: { w: number; rd?: boolean }[][] = [
  [{ w: 34 }, { w: 48, rd: true }, { w: 22 }],
  [{ w: 20 }, { w: 30 }, { w: 54, rd: true }],
  [{ w: 60, rd: true }, { w: 18 }, { w: 26 }],
  [{ w: 28 }, { w: 40, rd: true }, { w: 20 }],
  [{ w: 44, rd: true }, { w: 24 }, { w: 34 }],
];
const HEX_BLOCK = [
  "4F2A 8B01 D39C 77", "1A0E FF42 8BA4 2D", "C7 91 3E 5B 0A F8", "6D14 2277 E0 9C 3F",
  "AA 05 B2 7E 44 10", "9F3C 81 D6 2B 5508", "07 EE 4A 1C 90 63", "B8 2F 7D 00 4E A1",
].join("\n");
const NET_NODES: [number, number, number][] = [
  [60, 35, 3.4], [20, 16, 2], [99, 22, 2], [28, 56, 2], [94, 52, 2], [58, 9, 1.7],
];
const NET_EDGES: [number, number, number, number][] = [
  [60, 35, 20, 16], [60, 35, 99, 22], [60, 35, 28, 56], [60, 35, 94, 52], [60, 35, 58, 9], [20, 16, 58, 9], [99, 22, 94, 52],
];

function LockedFX({ variant, accent }: { variant: LockVariant; accent: string }) {
  if (variant === "signal") {
    return (
      <span aria-hidden className="lf lf-radar" style={{ color: accent }}>
        <svg className="radar-grid" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" />
          <circle cx="50" cy="50" r="31" />
          <circle cx="50" cy="50" r="16" />
          <line x1="50" y1="3" x2="50" y2="97" />
          <line x1="3" y1="50" x2="97" y2="50" />
        </svg>
        <span className="radar-sweep" style={{ background: `conic-gradient(from 0deg, ${accent}, transparent 62deg)` }} />
        <span className="radar-blip" style={{ top: "34%", left: "64%" }} />
        <span className="radar-blip" style={{ top: "60%", left: "40%", animationDelay: "1.5s" }} />
      </span>
    );
  }
  if (variant === "redacted") {
    return (
      <span aria-hidden className="lf lf-redact" style={{ color: accent }}>
        {REDACT_ROWS.map((row, r) => (
          <span className="row" key={r}>
            {row.map((seg, i) => (
              <span key={i} className={seg.rd ? "rd" : "w"} style={{ width: seg.w, animationDelay: `${(r * 2 + i) * 0.22}s` }} />
            ))}
          </span>
        ))}
      </span>
    );
  }
  if (variant === "hex") {
    return (
      <span aria-hidden className="lf lf-hex" style={{ color: accent, fontFamily: MONO }}>
        <span className="hexroll">{HEX_BLOCK + "\n" + HEX_BLOCK}</span>
      </span>
    );
  }
  return (
    <span aria-hidden className="lf lf-net" style={{ color: accent }}>
      <svg viewBox="0 0 120 70" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%" }}>
        {NET_EDGES.map((e, i) => (
          <line key={i} className="edge" x1={e[0]} y1={e[1]} x2={e[2]} y2={e[3]} />
        ))}
        {NET_NODES.map((n, i) => (
          <circle key={i} className="node" cx={n[0]} cy={n[1]} r={n[2]} style={{ animationDelay: `${i * 0.3}s` }} />
        ))}
      </svg>
    </span>
  );
}
const BG = "#060810";

export default function ExplorersPage() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<MissionManifest | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});
  const [totalXp, setTotalXp] = useState(0);
  // Which case (if any) the dev deep-link jumped straight to the boss on. Scoped
  // to that one case so Next-case navigation always starts the next mission fresh.
  const [devBossId, setDevBossId] = useState<string | null>(null);

  const refreshStatus = useCallback(() => {
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

  // Re-read on mount and whenever we return from a mission, so a just-closed
  // case shows as CLOSED (with its stamp) the moment you're back on the map.
  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // Dev-only deep link: /explorers?case=16 opens that case; &at=boss jumps to the boss.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const p = new URLSearchParams(window.location.search);
    const c = p.get("case");
    if (!c) return;
    const found = CASES.find((m) => m.id === `explorers-m${c.padStart(2, "0")}`);
    if (found) {
      setActive(found);
      setDevBossId(p.get("at") === "boss" ? found.id : null);
    }
  }, []);

  const closedCount = useMemo(() => CASES.filter((m) => status[m.id] === "CLOSED").length, [status]);
  const nextCase = useMemo(() => CASES.find((m) => status[m.id] !== "CLOSED") ?? null, [status]);
  // Chronological gate: the only playable case is the first unsolved one. Every
  // case after it is locked until the case before it is closed (in order).
  const nextIdx = nextCase ? CASES.indexOf(nextCase) : CASES.length;

  const blockStats = BLOCKS.map((b) => {
    const cases = CASES.filter((m) => m.block === b.n);
    const closed = cases.filter((m) => status[m.id] === "CLOSED").length;
    return { ...b, cases, closed, total: cases.length, done: closed > 0 && closed === cases.length };
  });
  const ladder = blockStats.map((b) => (b.done ? "■" : "□")).join(" ");

  if (active) {
    const activeIdx = CASES.findIndex((m) => m.id === active.id);
    const hasNext = activeIdx >= 0 && activeIdx < CASES.length - 1;
    return (
      <MissionRuntime
        key={active.id}
        manifest={active}
        devStartBeat={active.id === devBossId ? "incident" : undefined}
        onExit={() => {
          refreshStatus();
          setActive(null);
        }}
        onNextCase={
          hasNext
            ? () => {
                refreshStatus();
                setActive(CASES[activeIdx + 1]);
              }
            : undefined
        }
      />
    );
  }

  const continueLabel = !nextCase
    ? "ALL CASES SOLVED"
    : status[nextCase.id] === "IN PROGRESS"
      ? `CONTINUE · ${nextCase.caseNumber}`
      : closedCount === 0
        ? `START · ${nextCase.caseNumber}`
        : `NEXT · ${nextCase.caseNumber}`;

  return (
    <main style={{ minHeight: "100vh", background: BG, color: TXT, fontFamily: MONO, position: "relative", overflow: "hidden" }}>
      <style>{`
        .tc-cur{animation:tcBlink 1s steps(1) infinite}
        .tc-blink{animation:tcBlink 1.1s steps(1) infinite}
        @keyframes tcBlink{50%{opacity:0}}
        .tc-scan{position:fixed;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(0deg, rgba(0,0,0,0.24) 0 1px, transparent 1px 3px);opacity:.5}
        .tc-vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse 80% 70% at 50% 36%, transparent 44%, rgba(3,5,12,0.82) 100%)}
        .tc-h1{font-family:var(--font-inter),system-ui,-apple-system,sans-serif;font-size:clamp(30px,6vw,56px);font-weight:800;letter-spacing:.005em;margin:8px 0 2px;color:${TXT};text-shadow:0 0 22px ${SYS}66}
        .tc-cta{font-family:inherit;font-size:14px;font-weight:700;letter-spacing:.06em;color:#101006;background:${AMBER};border:none;border-radius:3px;padding:12px 22px;cursor:pointer;box-shadow:0 0 22px ${AMBER}66;transition:box-shadow .15s, transform .15s}
        .tc-cta:hover{box-shadow:0 0 34px ${AMBER}AA;transform:translateY(-1px)}
        .tc-bar{display:flex;align-items:center;gap:7px;font-size:11px;padding:8px 12px;border:1px solid ${SYS}33;border-bottom:none;border-radius:7px 7px 0 0;background:rgba(8,14,26,0.72)}
        .tc-win{border:1px solid ${SYS}2E;border-radius:0 0 7px 7px;background:rgba(6,10,20,0.5);padding:24px 22px 26px}
        .tc-dot{width:9px;height:9px;border-radius:50%;display:inline-block}
        .tc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));gap:12px;margin-top:14px}
        .tc-card{position:relative;text-align:left;border:1px solid color-mix(in srgb, var(--accent) 34%, transparent);border-radius:4px;background:rgba(8,13,24,0.74);cursor:pointer;overflow:hidden;padding:0;transition:box-shadow .18s,border-color .18s,transform .18s}
        .tc-card:hover{border-color:var(--accent);box-shadow:0 0 26px color-mix(in srgb, var(--accent) 45%, transparent);transform:translateY(-2px)}
        .tc-next{border-color:var(--accent);box-shadow:0 0 24px color-mix(in srgb, var(--accent) 46%, transparent)}
        .tc-locked{cursor:not-allowed}
        .tc-locked:hover{border-color:color-mix(in srgb, var(--accent) 55%, transparent);box-shadow:0 0 22px color-mix(in srgb, var(--accent) 28%, transparent);transform:none}
        .lf{position:absolute;inset:0;z-index:1;overflow:hidden;pointer-events:none;user-select:none}
        .tc-locked:hover .lf{filter:brightness(1.6)}
        .lf-radar{opacity:.5}
        .radar-grid{position:absolute;top:52%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;opacity:.4}
        .radar-grid circle{fill:none;stroke:currentColor;stroke-width:.6}
        .radar-grid line{stroke:currentColor;stroke-width:.5;opacity:.7}
        .radar-sweep{position:absolute;top:52%;left:50%;width:120px;height:120px;transform:translate(-50%,-50%);border-radius:50%;opacity:.5;animation:radarSpin 3.4s linear infinite}
        @keyframes radarSpin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
        .radar-blip{position:absolute;width:5px;height:5px;border-radius:50%;background:currentColor;box-shadow:0 0 7px currentColor;opacity:0;animation:radarBlip 3.4s ease-in-out infinite}
        @keyframes radarBlip{0%,100%{opacity:0}18%{opacity:1}42%{opacity:0}}
        .lf-redact{display:flex;flex-direction:column;justify-content:center;gap:7px;padding:34px 14px 16px;opacity:.5}
        .lf-redact .row{display:flex;gap:5px;align-items:center}
        .lf-redact .w{height:5px;border-radius:2px;background:currentColor;opacity:.22}
        .lf-redact .rd{height:8px;border-radius:2px;background:rgba(6,9,16,.92);box-shadow:inset 0 0 0 1px currentColor;opacity:.55;animation:lfRedact 2.6s ease-in-out infinite}
        @keyframes lfRedact{0%,100%{opacity:.4}50%{opacity:.75}}
        .lf-hex{padding-top:30px;font-size:10px;line-height:1.55;letter-spacing:.08em;opacity:.16}
        .lf-hex .hexroll{display:block;white-space:pre;animation:lfHex 10s linear infinite}
        @keyframes lfHex{from{transform:translateY(0)}to{transform:translateY(-50%)}}
        .lf-net{opacity:.55}
        .lf-net .edge{stroke:currentColor;stroke-width:.5;opacity:.25}
        .lf-net .node{fill:currentColor;animation:lfNode 2.4s ease-in-out infinite}
        @keyframes lfNode{0%,100%{opacity:.3}50%{opacity:.95}}
        .tc-cardbar{position:relative;z-index:2}
        .tc-lockpulse{animation:tcLock 2.6s ease-in-out infinite}
        @keyframes tcLock{0%,100%{opacity:.85;filter:drop-shadow(0 0 5px var(--accent))}50%{opacity:1;filter:drop-shadow(0 0 12px var(--accent))}}
        .tc-cardbar{display:flex;justify-content:space-between;align-items:center;font-size:10.5px;letter-spacing:.06em;padding:6px 10px;border-bottom:1px solid color-mix(in srgb, var(--accent) 22%, transparent);background:rgba(3,6,14,0.55)}
        .tc-glyph{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:6px;border:1px solid;background:rgba(255,255,255,0.03)}
        .tc-title{font-family:var(--font-inter),system-ui,-apple-system,sans-serif;font-size:17px;font-weight:800;letter-spacing:.02em;text-transform:uppercase;line-height:1.15;margin-top:12px}
        .tc-chip{font-size:9.5px;letter-spacing:.14em;border:1px solid;border-radius:2px;padding:2px 7px}
        @media (prefers-reduced-motion: reduce){.tc-cur,.tc-blink{animation:none}.tc-card:hover,.tc-cta:hover{transform:none}.tc-lockpulse,.radar-sweep,.radar-blip,.lf-redact .rd,.lf-hex .hexroll,.lf-net .node{animation:none}}
      `}</style>

      <MatrixRain reduced={reduced} opacity={0.24} colors={RAIN_COLORS} />
      <div className="tc-scan" aria-hidden />
      <div className="tc-vig" aria-hidden />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1080, margin: "0 auto", padding: "36px 22px 90px" }}>
        {/* terminal window */}
        <div className="tc-bar">
          <span className="tc-dot" style={{ background: "#ff5f56" }} />
          <span className="tc-dot" style={{ background: "#ffbd2e" }} />
          <span className="tc-dot" style={{ background: "#27c93f" }} />
          <span style={{ marginLeft: 10, color: DIM }}>ARC · MISSION BOARD</span>
          <span style={{ marginLeft: "auto", color: DIM }}>SECURE · ENCRYPTED</span>
        </div>

        <div className="tc-win">
          {/* hero */}
          <div style={{ color: SYS, fontSize: 12.5, letterSpacing: "0.06em" }}>
            AGENT, YOUR MISSIONS<span className="tc-cur" style={{ color: SYS }}>▊</span>
          </div>
          <h1 className="tc-h1">
            PICK YOUR CASE, <span style={{ color: SYS }}>AGENT</span>
          </h1>
          <div style={{ color: TXT, opacity: 0.9, fontSize: 13, marginTop: 8 }}>
            agent: <span style={{ color: SYS }}>TRAINEE</span> &nbsp;·&nbsp; cases solved:{" "}
            <span style={{ color: "#3BF57E" }}>{closedCount}</span>
            <span style={{ color: DIM }}>/20</span> &nbsp;·&nbsp; xp: <span style={{ color: AMBER }}>{totalXp}</span> &nbsp;·&nbsp; rank:{" "}
            <span style={{ color: SYS, letterSpacing: "0.18em" }}>{ladder}</span>
          </div>

          <div style={{ marginTop: 18 }}>
            <button className="tc-cta" onClick={() => nextCase && setActive(nextCase)} disabled={!nextCase}>
              {nextCase ? "▶ " : "✓ "}
              {continueLabel}
            </button>
          </div>

          {/* blocks */}
          {blockStats.map((b) => (
            <section key={b.n} style={{ marginTop: 40 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: b.color }}>[{String(b.n).padStart(2, "0")}]</span>
                <span style={{ fontFamily: "var(--font-inter),system-ui,-apple-system,sans-serif", fontSize: "clamp(18px,3vw,24px)", fontWeight: 800, letterSpacing: "0.02em", color: TXT, textShadow: `0 0 14px ${b.color}66` }}>
                  {b.name}
                </span>
                <span className="tc-chip" style={{ color: b.color, borderColor: `${b.color}88` }}>
                  {b.classification}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: b.done ? b.color : DIM }}>
                  [{b.closed}/{b.total} CLOSED]
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: DIM, marginTop: 4 }}>{b.blurb}</div>

              <div className="tc-grid">
                {b.cases.map((m) => {
                  const st = status[m.id];
                  const isClosed = st === "CLOSED";
                  const isNext = nextCase?.id === m.id;
                  const locked = CASES.indexOf(m) > nextIdx;
                  // Locked cards now wear the block's colour (not grey) so the
                  // case name + glyph stand out and read as "encrypted", not dead.
                  const accent = isNext ? AMBER : b.color;
                  const ring = isClosed ? DIM : accent;
                  const titleColor = isClosed ? DIM : b.color;
                  const sevFilled = "■".repeat(b.sev) + "□".repeat(5 - b.sev);
                  return (
                    <button
                      key={m.id}
                      className={`tc-card${isNext ? " tc-next" : ""}${locked ? " tc-locked" : ""}`}
                      onClick={locked ? undefined : () => setActive(m)}
                      disabled={locked}
                      aria-label={`${m.caseNumber}: ${m.title}.${isClosed ? " Closed." : locked ? " Locked. Finish the earlier cases first." : isNext ? " Play next." : ""}`}
                      style={{ ["--accent"]: accent, position: "relative" } as CSSProperties}
                    >
                      {isClosed && (
                        <span
                          aria-hidden
                          className="tc-stamp"
                          style={{
                            position: "absolute",
                            top: "47%",
                            left: "50%",
                            transform: "translate(-50%, -50%) rotate(-10deg)",
                            padding: "5px 13px",
                            border: "3px solid #FF4D5E",
                            borderRadius: 4,
                            color: "#FF4D5E",
                            background: "rgba(24,8,12,0.5)",
                            fontFamily: MONO,
                            fontWeight: 800,
                            fontSize: 14,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            boxShadow: "0 0 16px rgba(255,77,94,0.45), inset 0 0 10px rgba(255,77,94,0.16)",
                            pointerEvents: "none",
                            zIndex: 4,
                          }}
                        >
                          Case Closed
                        </span>
                      )}
                      {locked && (
                        <>
                          <LockedFX variant={LOCK_VARIANTS[b.n - 1] ?? "signal"} accent={b.color} />
                          <span
                            aria-hidden
                            className="tc-lockpulse"
                            style={{
                              position: "absolute",
                              top: 44,
                              left: "50%",
                              transform: "translateX(-50%)",
                              zIndex: 4,
                              color: b.color,
                              ["--accent"]: b.color,
                              pointerEvents: "none",
                            } as CSSProperties}
                          >
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
                              <rect x="4" y="10.5" width="16" height="10.5" rx="2.2" stroke="currentColor" strokeWidth="2" fill="rgba(3,6,14,0.6)" />
                              <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          </span>
                        </>
                      )}
                      <div className="tc-cardbar">
                        <span style={{ color: isNext ? AMBER : b.color }}>{m.caseNumber}</span>
                        {isClosed ? (
                          <span style={{ color: DIM }}>{"✓"} CLOSED</span>
                        ) : locked ? (
                          <span style={{ color: b.color, display: "inline-flex", alignItems: "center", gap: 5, opacity: 0.9 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="2.4" />
                              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2.4" />
                            </svg>
                            ENCRYPTED
                          </span>
                        ) : isNext ? (
                          <span className="tc-blink" style={{ color: AMBER }}>{"●"} {st === "IN PROGRESS" ? "RESUME" : "PLAY"}</span>
                        ) : st === "IN PROGRESS" ? (
                          <span style={{ color: b.color }}>{"◐"} STARTED</span>
                        ) : (
                          <span style={{ color: DIM }}>{"○"} OPEN</span>
                        )}
                      </div>

                      <div style={{ padding: "12px 13px 14px", position: "relative", zIndex: 2 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span className="tc-glyph" style={{ borderColor: ring, color: ring, boxShadow: `0 0 14px ${ring}55` }}>
                            <CaseGlyph id={m.id} size={26} color={ring} />
                          </span>
                          <span style={{ textAlign: "right", fontSize: 8.5, letterSpacing: "0.12em", color: DIM, lineHeight: 1.5 }}>
                            THREAT
                            <br />
                            <span style={{ color: ring, letterSpacing: "0.08em", fontSize: 9.5 }}>{sevFilled}</span>
                          </span>
                        </div>

                        <div className="tc-title" style={{ color: titleColor, textShadow: `0 0 12px ${titleColor}66` }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: 11, color: TXT, opacity: 0.7, marginTop: 4 }}>{TOPICS[m.id] ?? ""}</div>
                        <div style={{ fontSize: 10.5, color: locked ? DIM : AMBER, opacity: 0.85, marginTop: 9 }}>
                          {"Villain: "}
                          {m.actor.codename}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <div style={{ marginTop: 40, fontSize: 12.5, color: DIM }}>
            <span style={{ color: SYS }}>Solve all 20 cases to reach ULTRA rank</span>
            <span className="tc-cur" style={{ color: SYS }}>▊</span>
          </div>
        </div>
      </div>
    </main>
  );
}
