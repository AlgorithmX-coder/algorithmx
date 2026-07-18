"use client";

/**
 * CIPHER — make and break codes (debuts M12 "Unreadable").
 *
 * A captured note is sealed with a Caesar shift. The child spins the
 * shift dial and watches the letters slide until the message reads —
 * then it latches. Two rounds, then the punchline: 25 possible
 * shifts is why simple ciphers ALWAYS fall.
 */

import { useState } from "react";
import { AmberButton, Eyebrow } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { CipherPayload, MechanicProps } from "../engine/types";

const A = "A".charCodeAt(0);

/** Shift letters forward (encode) by n, preserving spaces/punct. */
function caesar(text: string, n: number): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (c < A || c > A + 25) return ch;
      return String.fromCharCode(((c - A + n + 26) % 26) + A);
    })
    .join("");
}

export default function Cipher({ payload, reduced, audio, onEvent }: MechanicProps<CipherPayload>) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [dial, setDial] = useState(0);
  const [solvedIdx, setSolvedIdx] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const round = payload.rounds[roundIdx];
  const ciphertext = caesar(round.plaintext, round.shift);
  const preview = caesar(ciphertext, -dial);
  const solved = solvedIdx === roundIdx;
  const last = roundIdx === payload.rounds.length - 1;

  const spin = (n: number) => {
    if (solved) return;
    audio.click();
    setDial(n);
    if (n === round.shift) {
      setSolvedIdx(roundIdx);
      audio.latch();
      onEvent({ kind: "HIT" });
    }
  };

  const next = () => {
    audio.click();
    if (last) {
      setFinished(true);
      audio.stamp();
      window.setTimeout(() => onEvent({ kind: "COMPLETED", mastery: true }), reduced ? 300 : 900);
    } else {
      setRoundIdx((r) => r + 1);
      setDial(0);
    }
  };

  return (
    <section style={{ maxWidth: 700, margin: "0 auto" }}>
      <Eyebrow text={payload.intro} color={T.actionAmber} />

      <div style={{ display: "flex", gap: 8, margin: "12px 0 14px" }}>
        {payload.rounds.map((_, i) => (
          <span key={i} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", padding: "3px 8px", borderRadius: 2, border: `1px solid ${i === roundIdx ? T.arcCyan : T.hairline}`, color: i < roundIdx || (i === roundIdx && solved) ? T.confirmedGreen : i === roundIdx ? T.arcCyan : T.textDisabled }}>
            {i < roundIdx || (i === roundIdx && solved) ? "■" : "□"} NOTE {i + 1}
          </span>
        ))}
      </div>

      <p style={{ margin: "0 0 10px", fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.06em", color: T.actionAmber }}>
        {round.prompt}
      </p>

      {/* the captured note */}
      <div style={{ background: T.paper, borderRadius: 2, padding: "14px 16px", boxShadow: "0 2px 0 rgba(0,0,0,0.5)" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", color: "#A66A00", marginBottom: 6 }}>
          CAPTURED NOTE · SEALED
        </div>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: 15, letterSpacing: "0.12em", lineHeight: 1.7, color: T.fileInk }}>
          {ciphertext}
        </p>
      </div>

      {/* the dial */}
      <div style={{ marginTop: 14, background: T.panel, border: `1px solid ${solved ? `${T.confirmedGreen}66` : T.hairline}`, borderRadius: 3, padding: "14px 16px" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: T.textSecondary, marginBottom: 10 }}>
          SHIFT DIAL — spin until it reads
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              onClick={() => spin(n)}
              className="sr-btn"
              disabled={solved}
              style={{
                fontFamily: MONO,
                fontSize: 14,
                fontWeight: 600,
                minWidth: 44,
                height: 44,
                color: dial === n ? (solved ? T.confirmedGreen : T.arcCyan) : T.textPrimary,
                background: dial === n ? `${solved ? T.confirmedGreen : T.arcCyan}14` : T.panelRaised,
                border: `1px solid ${dial === n ? (solved ? T.confirmedGreen : T.arcCyan) : T.hairline}`,
                borderRadius: 3,
                cursor: solved ? "default" : "pointer",
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <p style={{ margin: "12px 0 0", fontFamily: MONO, fontSize: 15, letterSpacing: "0.12em", lineHeight: 1.7, color: solved ? T.confirmedGreen : T.textPrimary }}>
          → {preview}
        </p>
      </div>

      {solved && (
        <div role="status" style={{ marginTop: 14, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.textPrimary }}>{round.why}</p>
          <div style={{ marginTop: 12 }}>
            {finished ? (
              <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: T.confirmedGreen, margin: 0 }}>
                {payload.doneLine}
              </p>
            ) : (
              <AmberButton label={last ? "SEAL THE LESSON" : "NEXT NOTE"} onClick={next} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
