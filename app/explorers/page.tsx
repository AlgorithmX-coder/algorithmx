"use client";

/**
 * /explorers — Cyber Explorers entry: the MISSION MAP, rendered as a
 * hacker terminal. Full-screen matrix rain, CRT scanlines, green-on-black
 * terminal chrome; each case is a terminal "case file" window. The 4
 * clearance blocks and a guided next-case still drive it. Every case is
 * playable in any order. The static PoC lives on at /explorers/poc.
 */

import { useEffect, useMemo, useState } from "react";
import MissionRuntime from "./engine/MissionRuntime";
import { useReducedMotion } from "./engine/primitives";
import { MONO, T } from "./engine/tokens";
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

const BLOCKS = [
  { n: 1, name: "SIGNALS", slug: "signals", classification: "CONFIDENTIAL", color: T.bandConfidential, blurb: "learn to spot the scam", sev: 2 },
  { n: 2, name: "THE HUMAN FACTOR", slug: "human_factor", classification: "SECRET", color: T.bandSecret, blurb: "the tricks aimed at people", sev: 3 },
  { n: 3, name: "SYSTEMS", slug: "systems", classification: "TOP SECRET", color: T.bandTopSecret, blurb: "how the tech really works", sev: 4 },
  { n: 4, name: "THE LONG GAME", slug: "long_game", classification: "ULTRA", color: T.bandUltra, blurb: "the big picture, and the mastermind", sev: 5 },
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

// terminal palette (scoped to this page; does not touch the token system)
const G = "#3BF57E";
const G_TXT = "#9EF7BE";
const G_DIM = "#2E8F55";
const AMBER = "#FFC24B";
const BG = "#040804";

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
    ? "ALL CASES CLOSED"
    : status[nextCase.id] === "IN PROGRESS"
      ? `CONTINUE // ${nextCase.caseNumber.replace(" ", "_")}`
      : closedCount === 0
        ? `START // ${nextCase.caseNumber.replace(" ", "_")}`
        : `NEXT // ${nextCase.caseNumber.replace(" ", "_")}`;

  return (
    <main style={{ minHeight: "100vh", background: BG, color: G_TXT, fontFamily: MONO, position: "relative", overflow: "hidden" }}>
      <style>{`
        .tc-cur{animation:tcBlink 1s steps(1) infinite}
        .tc-blink{animation:tcBlink 1.1s steps(1) infinite}
        @keyframes tcBlink{50%{opacity:0}}
        .tc-scan{position:fixed;inset:0;z-index:1;pointer-events:none;background:repeating-linear-gradient(0deg, rgba(0,0,0,0.26) 0 1px, transparent 1px 3px);opacity:.55}
        .tc-vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(ellipse 75% 65% at 50% 38%, transparent 42%, rgba(2,6,3,0.82) 100%)}
        .tc-h1{font-size:clamp(30px,6vw,56px);font-weight:700;letter-spacing:.04em;margin:8px 0 2px;color:${G_TXT};text-shadow:0 0 22px ${G}55}
        .tc-cta{font-family:inherit;font-size:14px;font-weight:700;letter-spacing:.06em;color:#04160a;background:${G};border:none;border-radius:3px;padding:12px 22px;cursor:pointer;box-shadow:0 0 22px ${G}66;transition:box-shadow .15s, transform .15s}
        .tc-cta:hover{box-shadow:0 0 32px ${G}99;transform:translateY(-1px)}
        .tc-bar{display:flex;align-items:center;gap:7px;font-size:11px;padding:8px 12px;border:1px solid ${G}33;border-bottom:none;border-radius:7px 7px 0 0;background:rgba(6,18,10,0.72)}
        .tc-win{border:1px solid ${G}33;border-radius:0 0 7px 7px;background:rgba(4,12,7,0.5);padding:24px 22px 26px}
        .tc-dot{width:9px;height:9px;border-radius:50%;display:inline-block}
        .tc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));gap:12px;margin-top:14px}
        .tc-card{position:relative;text-align:left;border:1px solid ${G}3A;border-radius:4px;background:rgba(6,18,10,0.72);cursor:pointer;overflow:hidden;padding:0;transition:box-shadow .18s,border-color .18s,transform .18s}
        .tc-card:hover{border-color:${G};box-shadow:0 0 26px ${G}55;transform:translateY(-2px)}
        .tc-cardbar{display:flex;justify-content:space-between;align-items:center;font-size:10.5px;letter-spacing:.06em;padding:6px 10px;border-bottom:1px solid ${G}22;background:rgba(2,9,5,0.55)}
        .tc-glyph{display:inline-flex;align-items:center;justify-content:center;width:46px;height:46px;border-radius:6px;border:1px solid;background:rgba(59,245,126,0.06)}
        .tc-title{font-size:17px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;line-height:1.15;margin-top:12px}
        .tc-chip{font-size:9.5px;letter-spacing:.14em;border:1px solid;border-radius:2px;padding:2px 7px}
        @media (prefers-reduced-motion: reduce){.tc-cur,.tc-blink{animation:none}.tc-card:hover,.tc-cta:hover{transform:none}}
      `}</style>

      <MatrixRain reduced={reduced} opacity={0.5} color="#26E063" />
      <div className="tc-scan" aria-hidden />
      <div className="tc-vig" aria-hidden />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1080, margin: "0 auto", padding: "36px 22px 90px" }}>
        {/* terminal window */}
        <div className="tc-bar">
          <span className="tc-dot" style={{ background: "#ff5f56" }} />
          <span className="tc-dot" style={{ background: "#ffbd2e" }} />
          <span className="tc-dot" style={{ background: "#27c93f" }} />
          <span style={{ marginLeft: 10, color: G_DIM }}>arc@secure-net: ~/missions</span>
          <span style={{ marginLeft: "auto", color: G_DIM }}>SECURE SHELL // ENCRYPTED</span>
        </div>

        <div className="tc-win">
          {/* hero */}
          <div style={{ color: G, fontSize: 12.5, letterSpacing: "0.06em" }}>
            arc@secure-net:~$ ./mission-map --list<span className="tc-cur" style={{ color: G }}>▊</span>
          </div>
          <h1 className="tc-h1">
            PICK YOUR CASE, <span style={{ color: G }}>OPERATIVE</span>
          </h1>
          <div style={{ color: G_TXT, opacity: 0.85, fontSize: 13, marginTop: 8 }}>
            <span style={{ color: G_DIM }}>{"//"}</span> operative: <span style={{ color: G }}>TRAINEE</span> &nbsp;·&nbsp; cases_closed:{" "}
            <span style={{ color: G }}>{closedCount}</span>
            <span style={{ color: G_DIM }}>/20</span> &nbsp;·&nbsp; xp: <span style={{ color: AMBER }}>{totalXp}</span> &nbsp;·&nbsp; clearance:{" "}
            <span style={{ color: G, letterSpacing: "0.18em" }}>{ladder}</span>
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
              <div style={{ fontSize: 12, color: G_DIM }}>
                arc@secure-net:~$ ls ./block_{b.n}_{b.slug} <span style={{ color: `${G_DIM}` }}>--classified</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: G }}>[{String(b.n).padStart(2, "0")}]</span>
                <span style={{ fontSize: "clamp(18px,3vw,24px)", fontWeight: 700, letterSpacing: "0.04em", color: G_TXT, textShadow: `0 0 14px ${G}44` }}>
                  {b.name}
                </span>
                <span className="tc-chip" style={{ color: b.color, borderColor: `${b.color}88` }}>
                  {b.classification}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 12, color: b.done ? G : G_DIM }}>
                  [{b.closed}/{b.total} CLOSED]
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: G_DIM, marginTop: 4 }}>{"// "}{b.blurb}</div>

              <div className="tc-grid">
                {b.cases.map((m) => {
                  const st = status[m.id];
                  const isClosed = st === "CLOSED";
                  const isNext = nextCase?.id === m.id;
                  const ring = isNext ? AMBER : isClosed ? G_DIM : G;
                  const titleColor = isClosed ? G_DIM : G;
                  const sevFilled = "■".repeat(b.sev) + "□".repeat(5 - b.sev);
                  return (
                    <button
                      key={m.id}
                      className="tc-card"
                      onClick={() => setActive(m)}
                      aria-label={`${m.caseNumber}: ${m.title}.${isClosed ? " Closed." : isNext ? " Play next." : ""}`}
                      style={{ borderColor: isNext ? AMBER : `${G}3A`, boxShadow: isNext ? `0 0 24px ${AMBER}55` : "none" }}
                    >
                      <div className="tc-cardbar" style={{ borderColor: isNext ? `${AMBER}44` : `${G}22` }}>
                        <span style={{ color: isNext ? AMBER : G }}>{m.caseNumber.replace(" ", "_")}</span>
                        {isClosed ? (
                          <span style={{ color: G_DIM }}>{"✓"} CLOSED</span>
                        ) : isNext ? (
                          <span className="tc-blink" style={{ color: AMBER }}>{"●"} {st === "IN PROGRESS" ? "RESUME" : "RUN"}</span>
                        ) : st === "IN PROGRESS" ? (
                          <span style={{ color: G }}>{"◐"} STARTED</span>
                        ) : (
                          <span style={{ color: G_DIM }}>{"○"} OPEN</span>
                        )}
                      </div>

                      <div style={{ padding: "12px 13px 14px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span className="tc-glyph" style={{ borderColor: ring, color: ring, boxShadow: `0 0 14px ${ring}44` }}>
                            <CaseGlyph id={m.id} size={26} color={ring} />
                          </span>
                          <span style={{ textAlign: "right", fontSize: 8.5, letterSpacing: "0.12em", color: G_DIM, lineHeight: 1.5 }}>
                            THREAT
                            <br />
                            <span style={{ color: ring, letterSpacing: "0.08em", fontSize: 9.5 }}>{sevFilled}</span>
                          </span>
                        </div>

                        <div className="tc-title" style={{ color: titleColor, textShadow: `0 0 12px ${titleColor}55` }}>
                          {m.title}
                        </div>
                        <div style={{ fontSize: 11, color: G_TXT, opacity: 0.75, marginTop: 4 }}>{"// "}{TOPICS[m.id] ?? ""}</div>
                        <div style={{ fontSize: 10.5, color: AMBER, opacity: 0.85, marginTop: 9 }}>
                          {"> target: "}
                          {m.actor.codename.replace(/ /g, "_")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}

          <div style={{ marginTop: 40, fontSize: 12.5, color: G_DIM }}>
            arc@secure-net:~$ <span style={{ color: G }}>close all 20 cases to reach ULTRA clearance</span>
            <span className="tc-cur" style={{ color: G }}>▊</span>
          </div>
        </div>
      </div>
    </main>
  );
}
