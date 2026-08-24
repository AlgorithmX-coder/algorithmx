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

import { useEffect, useState } from "react";
import { playWren, playWrenNudge, stopWren } from "../engine/audio";
import { AmberButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { MechanicProps, RedactPayload } from "../engine/types";

export default function Redact({ payload, audio, onEvent, voiceOn }: MechanicProps<RedactPayload>) {
  const [redacted, setRedacted] = useState<Record<string, boolean>>({});
  const [wrongOnce, setWrongOnce] = useState(false);
  const [note, setNote] = useState<{ id: string; why: string; ok: boolean } | null>(null);
  const [reviewReady, setReviewReady] = useState(false);

  const riskyIds = payload.spans.filter((s) => s.risky).map((s) => s.id);
  const done = riskyIds.every((id) => redacted[id]);

  // Once every risky span is covered, WREN reviews it aloud and the completion
  // button is held ~15s so they read + hear the review through (locked rule).
  useEffect(() => {
    if (!done) return;
    if (payload.doneAudio) playWren(payload.doneAudio, !!voiceOn);
    const t = setTimeout(() => setReviewReady(true), 15000);
    return () => { clearTimeout(t); stopWren(); };
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

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
      playWrenNudge(!!voiceOn); // "not quite, look again"
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
          {reviewReady ? (
            <AmberButton label={payload.doneLabel ?? "POST IT SAFELY"} onClick={() => onEvent({ kind: "COMPLETED", mastery: !wrongOnce })} />
          ) : (
            <div style={{ display: "inline-flex", flexDirection: "column", gap: 7, minWidth: 220 }} aria-label="review time">
              <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: T.textSecondary }}>LOOK IT OVER...</span>
              <span style={{ display: "block", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", background: T.confirmedGreen, transformOrigin: "left", transform: "scaleX(0)", animation: "sr-read 15000ms linear forwards" }} />
              </span>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
