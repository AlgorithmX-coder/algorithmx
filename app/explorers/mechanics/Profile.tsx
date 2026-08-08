"use client";

/**
 * PROFILE — build the actor's M.O. from case evidence: separate the
 * behaviors that match this actor from the ones that belong to someone
 * else. Inference about intent — the abstract-reasoning verb.
 */

import { useState } from "react";
import { AmberButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { MechanicProps, ProfilePayload } from "../engine/types";

export default function Profile({ payload, audio, onEvent }: MechanicProps<ProfilePayload>) {
  const [picked, setPicked] = useState<string[]>([]);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [missedOnce, setMissedOnce] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id: string) => {
    if (done) return;
    audio.click();
    setWrongIds([]);
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length < payload.picks ? [...p, id] : p));
  };

  const confirm = () => {
    const wrong = picked.filter((id) => !payload.behaviors.find((b) => b.id === id)?.matches);
    if (wrong.length === 0 && picked.length === payload.picks) {
      setDone(true);
      audio.latch();
      onEvent({ kind: "HIT" });
    } else {
      setWrongIds(wrong);
      setMissedOnce(true);
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  return (
    <section style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* No instruction heading here — the amber instruction strip above
          (rendered by PlayStage) is the single, canonical instruction. */}
      <div style={{ background: T.paper, color: T.fileInk, borderRadius: 2, padding: "16px 20px", boxShadow: "0 2px 0 rgba(0,0,0,0.55)" }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", opacity: 0.6, marginBottom: 8 }}>
          CASE EVIDENCE ON FILE
        </div>
        {payload.evidence.map((e) => (
          <div key={e} style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.7 }}>
            • {e}
          </div>
        ))}
      </div>

      <p style={{ margin: "16px 0 10px", fontFamily: MONO, fontSize: 13, color: T.textSecondary, letterSpacing: "0.04em" }}>
        SELECT THE {payload.picks} BEHAVIORS THAT MATCH THE EVIDENCE: {picked.length}/{payload.picks} SELECTED
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="sr-two-col">
        {payload.behaviors.map((b) => {
          const isPicked = picked.includes(b.id);
          const isWrong = wrongIds.includes(b.id);
          const border = isWrong ? T.threatRed : isPicked ? (done ? T.confirmedGreen : T.arcCyan) : T.hairline;
          return (
            <button
              key={b.id}
              onClick={() => toggle(b.id)}
              className="sr-btn"
              style={{
                textAlign: "left",
                fontFamily: MONO,
                fontSize: 12.5,
                lineHeight: 1.5,
                color: isWrong ? T.threatRed : isPicked ? T.textPrimary : T.textSecondary,
                background: isPicked ? `${T.arcCyan}0F` : T.panelRaised,
                border: `1px solid ${border}`,
                borderRadius: 3,
                padding: "12px 14px",
                cursor: done ? "default" : "pointer",
              }}
            >
              {isPicked ? "■ " : "□ "}
              {b.label}
            </button>
          );
        })}
      </div>

      {wrongIds.length > 0 && (
        <p role="status" style={{ margin: "12px 0 0", fontSize: 13, color: T.textSecondary }}>
          Not all of those match this actor&rsquo;s file. The marked ones belong to someone else&rsquo;s M.O. Look again.
        </p>
      )}

      <div style={{ marginTop: 16 }}>
        {!done && picked.length === payload.picks && wrongIds.length === 0 && (
          <AmberButton label="CONFIRM THE PROFILE" onClick={confirm} />
        )}
        {done && (
          <div style={{ display: "grid", gap: 10 }}>
            <p role="status" style={{ margin: 0, fontSize: 13, color: T.confirmedGreen }}>
              PROFILE CONFIRMED: pattern on file.
            </p>
            <p style={{ margin: 0, fontSize: 13, color: T.textSecondary, fontStyle: "italic" }}>
              &ldquo;{payload.doneLine}&rdquo;
            </p>
            <AmberButton label="ADD TO THE DOSSIER" onClick={() => onEvent({ kind: "COMPLETED", mastery: !missedOnce })} />
          </div>
        )}
      </div>
    </section>
  );
}
