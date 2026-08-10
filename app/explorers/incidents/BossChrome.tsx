"use client";

/**
 * Shared boss chrome. Every boss used to copy-paste the villain intercept
 * bark and the phase pips verbatim, which is a big part of why bosses felt
 * identical up top. These two primitives own that boilerplate so each boss
 * file can spend its lines on a DISTINCT interaction, not repeated markup.
 */

import { Bubble } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";

/** The villain's intercepted taunt, shown above phase 1. Pass plain text; the quotes are added. */
export function BossIntro({ codename, taunt }: { codename: string; taunt: string }) {
  return (
    <div style={{ marginBottom: 18, maxWidth: 560 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.14em", color: T.threatRed, marginBottom: 8 }}>
        INTERCEPTED: {codename}, ON THE WIRE
      </div>
      <Bubble who="villain">
        <em>&ldquo;{taunt}&rdquo;</em>
      </Bubble>
    </div>
  );
}

/** Phase progress pips (filled = cleared, outline = current/upcoming). Optional per-phase labels. */
export function PhasePips({ phase, total = 3, labels }: { phase: number; total?: number; labels?: string[] }) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <span
          key={p}
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.08em",
            padding: "3px 8px",
            borderRadius: 2,
            border: `1px solid ${p === phase ? T.threatRed : T.hairline}`,
            color: p === phase ? T.threatRed : p < phase ? T.confirmedGreen : T.textDisabled,
          }}
        >
          {p < phase ? "■" : "□"} PHASE {p}
          {labels && labels[p - 1] ? `: ${labels[p - 1]}` : ""}
        </span>
      ))}
    </div>
  );
}
