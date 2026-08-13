"use client";

/**
 * /explorers — Cyber Explorers entry: the MISSION MAP as a neon cyber
 * terminal. Multi-colour matrix rain + CRT chrome; each of the 4 clearance
 * blocks owns a neon colour (cyan / pink / amber / violet) so the page has
 * real colour variety for a young-teen audience while staying a cool hacker
 * terminal. Every case is playable in any order. PoC lives at /explorers/poc.
 */

import { useEffect, useMemo, useState } from "react";
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
const BG = "#060810";

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

  // Dev-only deep link: /explorers?case=16 opens that case; &at=boss jumps to the boss.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const p = new URLSearchParams(window.location.search);
    const c = p.get("case");
    if (!c) return;
    const found = CASES.find((m) => m.id === `explorers-m${c.padStart(2, "0")}`);
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
  const ladder = blockStats.map((b) => (b.done ? "■" : "□")).join(" ");

  if (active) return <MissionRuntime manifest={active} devStartBeat={devBoss ? "incident" : undefined} />;

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
        .tc-h1{font-size:clamp(30px,6vw,56px);font-weight:700;letter-spacing:.04em;margin:8px 0 2px;color:${TXT};text-shadow:0 0 22px ${SYS}66}
        .tc-cta{font-family:inherit;font-size:14px;font-weight:700;letter-spacing:.06em;color:#101006;background:${AMBER};border:none;border-radius:3px;padding:12px 22px;cursor:pointer;box-shadow:0 0 22px ${AMBER}66;transition:box-shadow .15s, transform .15s}
        .tc-cta:hover{box-shadow:0 0 34px ${AMBER}AA;transform:translateY(-1px)}
        .tc-bar{display:flex;align-items:center;gap:7px;font-size:11px;padding:8px 12px;border:1px solid ${SYS}33;border-bottom:none;border-radius:7px 7px 0 0;background:rgba(8,14,26,0.72)}
        .tc-win{border:1px solid ${SYS}2E;border-radius:0 0 7px 7px;background:rgba(6,10,20,0.5);padding:24px 22px 26px}
        .tc-dot{width:9px;height:9px;border-radius:50%;display:inline-block}
        .tc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));gap:12px;margin-top:14px}
        .tc-card{position:relative;text-align:left;border:1px solid color-mix(in srgb, var(--accent) 34%, transparent);border-radius:4px;background:rgba(8,13,24,0.74);cursor:pointer;overflow:hidden;padding:0;transition:box-shadow .18s,border-color .18s,transform .18s}
        .tc-card:hover{border-color:var(--accent);box-shadow:0 0 26px color-mix(in srgb, var(--accent) 45%, transparent);transform:translateY(-2px)}
        .tc-next{border-color:var(--accent);box-shadow:0 0 24px color-mix(in srgb, var(--accent) 46%, transparent)}
        .tc-cardbar{display:flex;justify-content:space-between;align-items:center;font-size:10.5px;letter-spacing:.06em;padding:6px 10px;border-bottom:1px solid color-mix(in srgb, var(--accent) 22%, transparent);background:rgba(3,6,14,0.55)}
        .tc-glyph{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:6px;border:1px solid;background:rgba(255,255,255,0.03)}
        .tc-title{font-size:17px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;line-height:1.15;margin-top:12px}
        .tc-chip{font-size:9.5px;letter-spacing:.14em;border:1px solid;border-radius:2px;padding:2px 7px}
        @media (prefers-reduced-motion: reduce){.tc-cur,.tc-blink{animation:none}.tc-card:hover,.tc-cta:hover{transform:none}}
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
                <span style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, letterSpacing: "0.04em", color: TXT, textShadow: `0 0 14px ${b.color}66` }}>
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
                  const accent = isNext ? AMBER : b.color;
                  const ring = isClosed ? DIM : accent;
                  const titleColor = isClosed ? DIM : b.color;
                  const sevFilled = "■".repeat(b.sev) + "□".repeat(5 - b.sev);
                  return (
                    <button
                      key={m.id}
                      className={`tc-card${isNext ? " tc-next" : ""}`}
                      onClick={() => setActive(m)}
                      aria-label={`${m.caseNumber}: ${m.title}.${isClosed ? " Closed." : isNext ? " Play next." : ""}`}
                      style={{ ["--accent"]: accent } as CSSProperties}
                    >
                      <div className="tc-cardbar">
                        <span style={{ color: isNext ? AMBER : b.color }}>{m.caseNumber}</span>
                        {isClosed ? (
                          <span style={{ color: DIM }}>{"✓"} CLOSED</span>
                        ) : isNext ? (
                          <span className="tc-blink" style={{ color: AMBER }}>{"●"} {st === "IN PROGRESS" ? "RESUME" : "PLAY"}</span>
                        ) : st === "IN PROGRESS" ? (
                          <span style={{ color: b.color }}>{"◐"} STARTED</span>
                        ) : (
                          <span style={{ color: DIM }}>{"○"} OPEN</span>
                        )}
                      </div>

                      <div style={{ padding: "12px 13px 14px" }}>
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
                        <div style={{ fontSize: 10.5, color: AMBER, opacity: 0.85, marginTop: 9 }}>
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
