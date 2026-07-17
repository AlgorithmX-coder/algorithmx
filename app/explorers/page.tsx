"use client";

/**
 * /explorers — Cyber Explorers entry: the case files.
 * Mission-select with the energy of a game menu, in Signal Room
 * grammar: the living ops floor, big case dossiers, actor teases.
 * The original static PoC lives on at /explorers/poc.
 */

import { useEffect, useState } from "react";
import MissionRuntime from "./engine/MissionRuntime";
import { EngineStyles, Eyebrow, Resolve, RoomBackdrop, useReducedMotion } from "./engine/primitives";
import { BODY, MONO, T, BAND_BY_CLASSIFICATION } from "./engine/tokens";
import type { MissionManifest } from "./engine/types";
import { checkpointStorageKey } from "./engine/types";
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

const CASES: { m: MissionManifest; tease: string; minutes: string }[] = [
  { m: mission01, tease: "A student's game account gets a 24-hour death threat. Something about it reads wrong.", minutes: "45–60 MIN" },
  { m: mission02, tease: "Five hundred free skins, today only, everywhere at once. Nobody gives away five hundred of anything.", minutes: "45–60 MIN" },
  { m: mission03, tease: "Three hundred password guesses a second, aimed at your school. No tricks — just math. Beat it.", minutes: "45–60 MIN" },
  { m: mission04, tease: "Somebody built a file on a student — out of her own posts. It's for sale tonight.", minutes: "45–60 MIN" },
  { m: mission05, tease: "Every channel floods at once — and one message in the storm knows your name.", minutes: "45–60 MIN" },
  { m: mission06, tease: "Six levers move every scam on earth. SIREN knows them all. Now you will too.", minutes: "45–60 MIN" },
  { m: mission07, tease: "Your best friend's account asks for a favor. The account is real. The friend might not be.", minutes: "45–60 MIN" },
  { m: mission08, tease: "A new online friend is funny, kind, and perfect. Nobody wrote a single word of it.", minutes: "45–60 MIN" },
  { m: mission09, tease: "An account has been giving away gifts for weeks and asking for nothing. Until today.", minutes: "45–60 MIN" },
  { m: mission10, tease: "The phone rings in your mum's exact voice. She needs a code, fast. She isn't your mum.", minutes: "45–60 MIN" },
];

export default function ExplorersPage() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<MissionManifest | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    const s: Record<string, string> = {};
    for (const { m } of CASES) {
      try {
        const raw = localStorage.getItem(checkpointStorageKey(m.id));
        if (raw) {
          const cp = JSON.parse(raw) as { pos?: { beat?: string } };
          s[m.id] = cp.pos?.beat === "closed" ? "CLOSED" : "IN PROGRESS";
        }
      } catch {}
    }
    setStatus(s);
  }, []);

  if (active) return <MissionRuntime manifest={active} />;

  return (
    <main style={{ minHeight: "100vh", background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflow: "hidden" }}>
      <EngineStyles />
      <RoomBackdrop reduced={reduced} tone={T.arcCyan} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "68px 24px 80px" }}>
        <div className="sr-scene">
          <Eyebrow text="ARC secure net — active case files" color={T.arcCyan} />
          <h1 style={{ fontFamily: MONO, fontSize: "clamp(32px, 6vw, 54px)", fontWeight: 600, margin: "16px 0 10px", textShadow: `0 0 40px ${T.arcCyan}33` }}>
            <Resolve text="Pick your case," reduced={reduced} />
            <br />
            <span style={{ color: T.arcCyan }}>
              <Resolve text="Operative." reduced={reduced} delay={350} />
            </span>
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.65, color: T.textSecondary, margin: "0 0 34px", maxWidth: 540 }}>
            Two cases cleared at your level. Progress saves on every step — walk away any time, resume where you stood.
          </p>

          <div style={{ display: "grid", gap: 18 }}>
            {CASES.map(({ m, tease, minutes }, idx) => (
              <button
                key={m.id}
                onClick={() => setActive(m)}
                className="sr-btn sr-choice"
                style={{
                  textAlign: "left",
                  background: `${T.panel}E6`,
                  border: `1px solid ${T.hairline}`,
                  borderRadius: 4,
                  padding: 0,
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {/* giant case number watermark */}
                <span aria-hidden style={{ position: "absolute", right: 14, bottom: -26, fontFamily: MONO, fontSize: 120, fontWeight: 600, color: `${T.arcCyan}0D`, pointerEvents: "none" }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div style={{ background: BAND_BY_CLASSIFICATION[m.classification], color: T.inkBlack, fontFamily: MONO, fontWeight: 600, fontSize: 10.5, letterSpacing: "0.24em", padding: "5px 16px", display: "flex", justifyContent: "space-between" }}>
                  <span>{m.classification}</span>
                  <span>{minutes}</span>
                </div>
                <div style={{ padding: "20px 22px 22px", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.08em", color: T.textSecondary }}>
                      {m.caseNumber} <span style={{ color: T.textDisabled }}>//</span> SUSPECTED ACTOR:{" "}
                      <span style={{ color: T.threatRed }}>{m.actor.codename}</span>
                    </span>
                    {status[m.id] && (
                      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.1em", color: status[m.id] === "CLOSED" ? T.clearanceBrass : T.confirmedGreen, border: `1px solid ${status[m.id] === "CLOSED" ? T.clearanceBrass : T.confirmedGreen}66`, borderRadius: 2, padding: "3px 8px" }}>
                        {status[m.id]}
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: "clamp(21px, 3.4vw, 28px)", fontWeight: 600, margin: "10px 0 8px" }}>
                    {m.title}
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.6, color: T.textSecondary, margin: "0 0 16px", maxWidth: 560 }}>{tease}</p>
                  <span style={{ display: "inline-block", fontFamily: MONO, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", color: T.inkBlack, background: T.actionAmber, borderRadius: 3, padding: "10px 18px", boxShadow: `0 0 18px ${T.actionAmber}40` }}>
                    {status[m.id] === "IN PROGRESS" ? "RESUME CASE →" : status[m.id] === "CLOSED" ? "REOPEN CASE →" : "OPEN CASE →"}
                  </span>
                </div>
              </button>
            ))}

            {/* the next sealed case — the pull, without pressure */}
            <div style={{ background: `${T.panel}99`, border: `1px dashed ${T.hairline}`, borderRadius: 4, padding: "18px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div>
                <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.08em", color: T.textDisabled }}>
                  CASE 011 // DOSSIER SEALED
                </span>
                <div style={{ fontFamily: MONO, fontSize: 17, fontWeight: 600, color: T.textSecondary, marginTop: 6 }}>
                  The Master Key
                </div>
              </div>
              <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.1em", color: T.textDisabled, border: `1px solid ${T.hairline}`, borderRadius: 2, padding: "6px 10px" }}>
                DECLASSIFIES SOON
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
