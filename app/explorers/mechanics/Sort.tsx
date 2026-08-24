"use client";

/**
 * SORT — triage under a rule. A pool of items and two or three labelled
 * buckets. Tap an item to pick it up, tap a bucket to drop it. A wrong
 * drop bounces back with a reason and costs the mastery bonus, never XP.
 * When the pool is empty the sort is complete.
 *
 * Tap-to-place (not drag) on purpose: it works the same with a finger, a
 * mouse, or a keyboard, and never strands an item mid-drag.
 */

import { useState } from "react";
import { playWrenNudge } from "../engine/audio";
import { AmberButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { MechanicProps, SortPayload } from "../engine/types";

export default function Sort({ payload, audio, onEvent, voiceOn }: MechanicProps<SortPayload>) {
  const [held, setHeld] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, string>>({}); // itemId -> bucketId
  const [wrongOnce, setWrongOnce] = useState(false);
  const [bounce, setBounce] = useState<{ id: string; why: string } | null>(null);

  const pool = payload.items.filter((i) => !placed[i.id]);
  const done = pool.length === 0;

  const pick = (id: string) => {
    if (done) return;
    setBounce(null);
    setHeld((h) => (h === id ? null : id));
    audio.click();
  };

  const drop = (bucketId: string) => {
    if (!held || done) return;
    const item = payload.items.find((i) => i.id === held);
    if (!item) return;
    if (item.bucket === bucketId) {
      const next = { ...placed, [item.id]: bucketId };
      setPlaced(next);
      setHeld(null);
      setBounce(null);
      audio.latch();
      onEvent({ kind: "HIT" });
      if (payload.items.every((i) => next[i.id])) audio.stamp();
    } else {
      setWrongOnce(true);
      setBounce({ id: item.id, why: item.why });
      audio.thud();
      playWrenNudge(!!voiceOn); // "not quite, look again"
      onEvent({ kind: "MISS" });
    }
  };

  return (
    <section style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* the pool of items still to sort */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          minHeight: 56,
          padding: 12,
          background: T.panel,
          border: `1px solid ${T.hairline}`,
          borderRadius: 4,
        }}
      >
        {done ? (
          <span style={{ fontFamily: MONO, fontSize: 13, color: T.confirmedGreen, alignSelf: "center" }}>
            {payload.doneLine}
          </span>
        ) : (
          pool.map((i) => {
            const isHeld = held === i.id;
            const isBounced = bounce?.id === i.id;
            const color = isBounced ? T.threatRed : isHeld ? T.arcCyan : T.textPrimary;
            return (
              <button
                key={i.id}
                onClick={() => pick(i.id)}
                className="sr-btn"
                aria-pressed={isHeld}
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  color,
                  background: isHeld ? `${T.arcCyan}18` : T.panelRaised,
                  border: `1px solid ${isHeld ? T.arcCyan : isBounced ? T.threatRed : T.hairline}`,
                  borderRadius: 4,
                  padding: "9px 13px",
                  cursor: "pointer",
                  boxShadow: isHeld ? `0 0 14px ${T.arcCyan}44` : "none",
                }}
              >
                {i.label}
              </button>
            );
          })
        )}
      </div>

      {/* why-it-bounced note */}
      {bounce && (
        <p
          role="status"
          style={{ margin: "10px 2px 0", fontSize: 13, lineHeight: 1.6, color: T.threatRed, borderLeft: `2px solid ${T.threatRed}`, paddingLeft: 12 }}
        >
          {bounce.why}
        </p>
      )}

      {/* the buckets */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${payload.buckets.length}, 1fr)`, gap: 12, marginTop: 14 }}>
        {payload.buckets.map((b) => {
          const inside = payload.items.filter((i) => placed[i.id] === b.id);
          return (
            <button
              key={b.id}
              onClick={() => drop(b.id)}
              className="sr-btn"
              disabled={!held}
              aria-label={`Put in ${b.label}`}
              style={{
                textAlign: "left",
                display: "block",
                background: held ? `${T.arcCyan}0E` : T.panel,
                border: `1.5px ${held ? "dashed" : "solid"} ${held ? T.arcCyan : T.hairline}`,
                borderRadius: 4,
                padding: "12px 14px",
                cursor: held ? "pointer" : "default",
                minHeight: 96,
              }}
            >
              <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: T.textPrimary }}>
                {b.label}
              </span>
              {b.hint && (
                <span style={{ display: "block", fontFamily: MONO, fontSize: 11, color: T.textSecondary, marginTop: 2 }}>
                  {b.hint}
                </span>
              )}
              <span style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
                {inside.map((i) => (
                  <span
                    key={i.id}
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: T.confirmedGreen,
                      background: `${T.confirmedGreen}14`,
                      border: `1px solid ${T.confirmedGreen}55`,
                      borderRadius: 3,
                      padding: "5px 9px",
                    }}
                  >
                    {i.label}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {done && (
        <div style={{ marginTop: 16 }}>
          <AmberButton label="LOCK IT IN" onClick={() => onEvent({ kind: "COMPLETED", mastery: !wrongOnce })} />
        </div>
      )}
    </section>
  );
}
