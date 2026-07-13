"use client";

/**
 * /explorers — Cyber Explorers entry: the case files.
 * Pick a case, run it through the mission engine. The original static
 * art-direction proof of concept lives on at /explorers/poc.
 */

import { useState } from "react";
import MissionRuntime from "./engine/MissionRuntime";
import { EngineStyles, Eyebrow, useReducedMotion } from "./engine/primitives";
import { BODY, MONO, T, BAND_BY_CLASSIFICATION } from "./engine/tokens";
import type { MissionManifest } from "./engine/types";
import { mission01 } from "./missions/mission01";
import { mission02 } from "./missions/mission02";

const CASES: MissionManifest[] = [mission01, mission02];

export default function ExplorersPage() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<MissionManifest | null>(null);

  if (active) return <MissionRuntime manifest={active} />;

  return (
    <main style={{ minHeight: "100vh", background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, position: "relative", overflow: "hidden" }}>
      <EngineStyles />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(${T.hairline}22 1px, transparent 1px), linear-gradient(90deg, ${T.hairline}22 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "72px 24px 80px" }}>
        <Eyebrow text="ARC secure net — case files" color={T.arcCyan} />
        <h1 style={{ fontFamily: MONO, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 600, margin: "14px 0 8px" }}>
          Pick your case, Operative.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.65, color: T.textSecondary, margin: "0 0 30px", maxWidth: 520 }}>
          Two cases are cleared for you at your current level. Your progress saves automatically — leave any time,
          resume where you stood.
        </p>
        <div style={{ display: "grid", gap: 14 }}>
          {CASES.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m)}
              className="sr-btn"
              style={{
                textAlign: "left",
                background: T.panel,
                border: `1px solid ${T.hairline}`,
                borderRadius: 3,
                padding: 0,
                overflow: "hidden",
                cursor: "pointer",
              }}
            >
              <div style={{ background: BAND_BY_CLASSIFICATION[m.classification], color: T.inkBlack, fontFamily: MONO, fontWeight: 600, fontSize: 10, letterSpacing: "0.22em", padding: "4px 14px" }}>
                {m.classification}
              </div>
              <div style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary }}>
                    {m.caseNumber} // SUSPECTED ACTOR: {m.actor.codename}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 19, fontWeight: 600, margin: "6px 0 0" }}>{m.title}</div>
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.actionAmber }}>
                  OPEN CASE →
                </span>
              </div>
            </button>
          ))}
        </div>
        {reduced ? null : null}
      </div>
    </main>
  );
}
