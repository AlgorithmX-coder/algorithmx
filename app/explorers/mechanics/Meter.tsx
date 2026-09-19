"use client";

/**
 * METER — set a level and watch it react. One slider; a live gauge and
 * readout update per zone as the child drags. They lock it in; if it's
 * parked in a safe (good) zone the fieldwork holds for review, otherwise
 * it bounces with the zone's readout so they can adjust. A wrong lock
 * costs the mastery bonus, never XP.
 *
 * On a correct lock WREN reviews it aloud during a 15s "look it over" hold
 * (the locked review-on-correct rule), then CONTINUE fires COMPLETED.
 *
 * Native <input type="range"> so keyboard, touch and screen readers all
 * work for free; everything around it is the eye-candy.
 *
 * Look (2026-09-19 owner pass): the rig's own console. A segmented power
 * bar that lights band by band, the time-to-crack as the big figure on the
 * panel, a lamp that turns with the zone, and the thresholds marked on the
 * track, so the jump from "an instant" to "centuries" is something you
 * watch happen. Colours come from tokens only, per the art direction, and
 * the readouts stay qualitative: a real crack time depends on the rig, and
 * inventing one for a child would teach them something false.
 */

import { useEffect, useState } from "react";
import { playWren, playWrenNudge, stopWren } from "../engine/audio";
import { AmberButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { MechanicProps, MeterPayload } from "../engine/types";

const SEGMENTS = 32;

export default function Meter({ payload, audio, onEvent, voiceOn }: MechanicProps<MeterPayload>) {
  const [value, setValue] = useState(0);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [locked, setLocked] = useState(false);
  const [reviewReady, setReviewReady] = useState(false);

  const zones = payload.zones;
  const zone = zones.find((z) => value <= z.upTo) ?? zones[zones.length - 1];
  const index = zones.indexOf(zone);
  const firstGood = zones.findIndex((z) => z.good);
  // Warms as it gets safer: danger, then "nearly", then safe.
  const fillColor = zone.good
    ? T.confirmedGreen
    : firstGood > 0 && index === firstGood - 1
      ? T.actionAmber
      : T.threatRed;
  const lit = Math.round((value / 100) * SEGMENTS);

  // Once locked in a safe zone, WREN reviews it aloud and CONTINUE is held ~15s
  // so they read + hear the review through (locked rule).
  useEffect(() => {
    if (!locked) return;
    if (payload.doneAudio) playWren(payload.doneAudio, !!voiceOn);
    const t = setTimeout(() => setReviewReady(true), 15000);
    return () => { clearTimeout(t); stopWren(); };
  }, [locked]); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (v: number) => {
    if (locked) return;
    setValue(v);
    audio.click();
  };

  const lockIn = () => {
    if (locked) return;
    if (zone.good) {
      setLocked(true);
      audio.stamp();
      onEvent({ kind: "HIT" }); // COMPLETED fires on the CONTINUE click below
    } else {
      setWrongOnce(true);
      audio.thud();
      playWrenNudge(!!voiceOn); // "not quite, look again"
      onEvent({ kind: "MISS" });
    }
  };

  return (
    <section style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="mtr-rig" style={{ borderColor: `${fillColor}55` }}>
        <span aria-hidden className="mtr-grid" />
        <span aria-hidden className="mtr-corner mtr-corner-tl" style={{ borderColor: fillColor }} />
        <span aria-hidden className="mtr-corner mtr-corner-br" style={{ borderColor: fillColor }} />

        <div className="mtr-head">
          <p className="mtr-prompt">{payload.prompt}</p>
          <span className="mtr-status">
            <span className="mtr-lamp" style={{ background: fillColor, boxShadow: `0 0 10px ${fillColor}` }} />
            <span style={{ color: fillColor }}>{zone.good ? "HOLDING" : "CRACKING"}</span>
          </span>
        </div>

        {/* the rig's clock: the figure this whole screen is about */}
        <div className="mtr-readout">
          <span className="mtr-readout-label">{payload.readoutLabel}</span>
          <span className="mtr-readout-value" style={{ color: fillColor, textShadow: `0 0 26px ${fillColor}66` }}>
            {zone.caption}
          </span>
        </div>

        {/* segmented power bar */}
        <div className="mtr-bar" aria-hidden>
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span
              key={i}
              className="mtr-seg"
              style={
                i < lit
                  ? { background: fillColor, boxShadow: `0 0 8px ${fillColor}aa`, opacity: 0.35 + (i / SEGMENTS) * 0.65 }
                  : undefined
              }
            />
          ))}
        </div>

        {/* the slider, with the zone thresholds marked on its track */}
        <div className="mtr-track">
          <span aria-hidden className="mtr-ticks">
            {zones.slice(0, -1).map((z) => (
              <span key={z.upTo} className="mtr-tick" style={{ left: `${z.upTo}%` }} />
            ))}
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            disabled={locked}
            onChange={(e) => change(Number(e.target.value))}
            aria-label={payload.prompt}
            className="mtr-range"
            style={{ ["--mtr-fill" as string]: fillColor, ["--mtr-pos" as string]: `${value}%`, cursor: locked ? "default" : "pointer" }}
          />
        </div>
        <div className="mtr-ends">
          <span>{payload.minLabel}</span>
          <span>{payload.maxLabel}</span>
        </div>

        <p className="mtr-verdict" style={{ color: zone.good ? T.confirmedGreen : T.textSecondary }}>
          {zone.label}
        </p>
      </div>

      <div style={{ marginTop: 16 }}>
        {locked ? (
          <div style={{ display: "grid", gap: 12 }}>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.confirmedGreen, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
              {payload.doneLine}
            </p>
            {reviewReady ? (
              <AmberButton label="CONTINUE →" onClick={() => onEvent({ kind: "COMPLETED", mastery: !wrongOnce })} />
            ) : (
              <div style={{ display: "inline-flex", flexDirection: "column", gap: 7, minWidth: 220 }} aria-label="review time">
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", color: T.textSecondary }}>LOOK IT OVER...</span>
                <span style={{ display: "block", height: 4, borderRadius: 2, background: T.hairline, overflow: "hidden" }}>
                  <span style={{ display: "block", height: "100%", background: T.confirmedGreen, transformOrigin: "left", transform: "scaleX(0)", animation: "sr-read 15000ms linear forwards" }} />
                </span>
              </div>
            )}
          </div>
        ) : (
          <AmberButton label="LOCK IT IN" onClick={lockIn} />
        )}
      </div>

      <style>{`
        .mtr-rig {
          position: relative;
          overflow: hidden;
          background:
            radial-gradient(120% 100% at 50% 0%, ${T.panelRaised} 0%, ${T.panel} 62%),
            ${T.panel};
          border: 1px solid ${T.hairline};
          border-radius: 6px;
          padding: 20px 22px 22px;
          transition: border-color 260ms ease;
        }
        /* a faint machine grid, so the panel reads as equipment */
        .mtr-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(${T.hairline}1f 1px, transparent 1px),
            linear-gradient(90deg, ${T.hairline}1f 1px, transparent 1px);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(120% 90% at 50% 0%, #000 20%, transparent 78%);
          mask-image: radial-gradient(120% 90% at 50% 0%, #000 20%, transparent 78%);
          pointer-events: none;
        }
        .mtr-corner {
          position: absolute;
          width: 13px;
          height: 13px;
          border-style: solid;
          border-width: 0;
          opacity: 0.85;
          transition: border-color 260ms ease;
          pointer-events: none;
        }
        .mtr-corner-tl { top: 8px; left: 8px; border-top-width: 2px; border-left-width: 2px; }
        .mtr-corner-br { bottom: 8px; right: 8px; border-bottom-width: 2px; border-right-width: 2px; }

        .mtr-head {
          position: relative;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
        }
        .mtr-prompt {
          margin: 0;
          font-family: ${MONO};
          font-size: 13px;
          letter-spacing: 0.03em;
          color: ${T.textSecondary};
        }
        .mtr-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: ${MONO};
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
        }
        .mtr-lamp {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          animation: mtr-pulse 1.5s ease-in-out infinite;
        }

        .mtr-readout {
          position: relative;
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .mtr-readout-label {
          font-family: ${MONO};
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: ${T.textDisabled};
        }
        .mtr-readout-value {
          font-family: ${MONO};
          font-size: clamp(1.9rem, 6vw, 2.9rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.01em;
          transition: color 200ms ease, text-shadow 200ms ease;
        }

        .mtr-bar {
          position: relative;
          margin-top: 18px;
          display: flex;
          gap: 3px;
          height: 26px;
        }
        .mtr-seg {
          flex: 1;
          border-radius: 1px;
          background: ${T.inkBlack};
          border: 1px solid ${T.hairline}66;
          transition: background 120ms linear, box-shadow 120ms linear, opacity 120ms linear;
        }

        .mtr-track { position: relative; margin-top: 14px; }
        .mtr-ticks { position: absolute; inset: 0; pointer-events: none; }
        .mtr-tick {
          position: absolute;
          top: 50%;
          width: 1px;
          height: 13px;
          margin-top: -6px;
          background: ${T.hairline};
        }
        .mtr-range {
          position: relative;
          width: 100%;
          height: 26px;
          margin: 0;
          background: transparent;
          -webkit-appearance: none;
          appearance: none;
        }
        .mtr-range:focus-visible { outline: 2px solid ${T.arcCyan}; outline-offset: 3px; }
        .mtr-range::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: 2px;
          border: 1px solid ${T.hairline}88;
          background: linear-gradient(90deg, var(--mtr-fill) 0%, var(--mtr-fill) var(--mtr-pos, 0%), ${T.inkBlack} var(--mtr-pos, 0%));
        }
        .mtr-range::-moz-range-track { height: 4px; border-radius: 2px; background: ${T.inkBlack}; border: 1px solid ${T.hairline}88; }
        .mtr-range::-moz-range-progress { height: 4px; border-radius: 2px; background: var(--mtr-fill); }
        .mtr-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 22px;
          margin-top: -10px;
          border-radius: 3px;
          background: ${T.textPrimary};
          border: 1px solid var(--mtr-fill);
          box-shadow: 0 0 14px var(--mtr-fill), inset 0 0 0 2px ${T.inkBlack};
        }
        .mtr-range::-moz-range-thumb {
          width: 14px;
          height: 22px;
          border-radius: 3px;
          background: ${T.textPrimary};
          border: 1px solid var(--mtr-fill);
          box-shadow: 0 0 14px var(--mtr-fill), inset 0 0 0 2px ${T.inkBlack};
        }
        .mtr-range:disabled::-webkit-slider-thumb { box-shadow: none; }

        .mtr-ends {
          display: flex;
          justify-content: space-between;
          margin-top: 2px;
          font-family: ${MONO};
          font-size: 11px;
          color: ${T.textDisabled};
        }
        .mtr-verdict {
          position: relative;
          margin: 16px 0 0;
          font-family: ${MONO};
          font-size: 12px;
          line-height: 1.5;
          transition: color 200ms ease;
        }

        @keyframes mtr-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        @media (prefers-reduced-motion: reduce) {
          .mtr-lamp { animation: none; }
          .mtr-seg, .mtr-readout-value, .mtr-verdict, .mtr-rig, .mtr-corner { transition: none; }
        }
      `}</style>
    </section>
  );
}
