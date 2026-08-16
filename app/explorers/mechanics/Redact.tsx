"use client";

/**
 * REDACT — hide what's private. A real caption/post split into spans; the
 * child taps the private ones to black them out and leaves the safe ones
 * alone. Tapping a safe span bounces with why it's fine to share. When
 * every risky span is covered the surface is clean. Tapping a safe span
 * costs the mastery bonus, never XP.
 *
 * The inverse of INSPECT: here the action is to COVER, not to find.
 */

import { useState } from "react";
import { AmberButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { MechanicProps, RedactPayload } from "../engine/types";

export default function Redact({ payload, audio, onEvent }: MechanicProps<RedactPayload>) {
  const [redacted, setRedacted] = useState<Record<string, boolean>>({});
  const [wrongOnce, setWrongOnce] = useState(false);
  const [note, setNote] = useState<{ id: string; why: string; ok: boolean } | null>(null);

  const riskyIds = payload.spans.filter((s) => s.risky).map((s) => s.id);
  const done = riskyIds.every((id) => redacted[id]);

  const tap = (id: string) => {
    if (done) return;
    const span = payload.spans.find((s) => s.id === id);
    if (!span || redacted[id]) return;
    if (span.risky) {
      const next = { ...redacted, [id]: true };
      setRedacted(next);
      setNote({ id, why: span.why, ok: true });
      audio.latch();
      onEvent({ kind: "HIT" });
      if (riskyIds.every((r) => next[r])) audio.stamp();
    } else {
      setWrongOnce(true);
      setNote({ id, why: span.why, ok: false });
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  return (
    <section style={{ maxWidth: 680, margin: "0 auto" }}>
      <p style={{ margin: "0 0 8px", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: T.textSecondary, textTransform: "uppercase" }}>
        {payload.surface}
      </p>

      {/* the post, rendered as tappable spans */}
      <div
        style={{
          background: T.paper,
          border: `1px solid ${T.hairline}`,
          borderRadius: 4,
          padding: "18px 20px",
          fontSize: 16,
          lineHeight: 1.9,
          color: T.fileInk,
        }}
      >
        {payload.spans.map((s, idx) => {
          const isRedacted = redacted[s.id];
          const isNoted = note?.id === s.id;
          return (
            <span key={s.id}>
              <button
                onClick={() => tap(s.id)}
                className="sr-btn"
                aria-label={isRedacted ? "redacted" : s.text}
                style={{
                  font: "inherit",
                  color: isRedacted ? "transparent" : T.fileInk,
                  background: isRedacted ? T.fileInk : isNoted && !note?.ok ? `${T.threatRed}33` : "transparent",
                  border: "none",
                  borderBottom: isRedacted ? "none" : `1px dotted ${T.fileInk}66`,
                  borderRadius: isRedacted ? 2 : 0,
                  padding: isRedacted ? "0 4px" : 0,
                  cursor: done ? "default" : "pointer",
                }}
              >
                {s.text}
              </button>
              {idx < payload.spans.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>

      {/* why note (covered / that's fine to share) */}
      {note && (
        <p
          role="status"
          style={{
            margin: "12px 2px 0",
            fontSize: 13,
            lineHeight: 1.6,
            color: note.ok ? T.confirmedGreen : T.threatRed,
            borderLeft: `2px solid ${note.ok ? T.confirmedGreen : T.threatRed}`,
            paddingLeft: 12,
          }}
        >
          {note.why}
        </p>
      )}

      {done && (
        <div style={{ marginTop: 16 }}>
          <p style={{ margin: "0 0 12px", fontSize: 14, lineHeight: 1.6, color: T.confirmedGreen }}>{payload.doneLine}</p>
          <AmberButton label="POST IT SAFELY" onClick={() => onEvent({ kind: "COMPLETED", mastery: !wrongOnce })} />
        </div>
      )}
    </section>
  );
}
