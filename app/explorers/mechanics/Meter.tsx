"use client";

/**
 * METER — set a level and watch it react. One slider; a live gauge and
 * readout update per zone as the child drags. They lock it in; if it's
 * parked in a safe (good) zone the fieldwork completes, otherwise it
 * bounces with the zone's readout so they can adjust. A wrong lock costs
 * the mastery bonus, never XP.
 *
 * Native <input type="range"> so keyboard, touch and screen readers all
 * work for free; the coloured gauge above it is the eye-candy.
 */

import { useState } from "react";
import { AmberButton } from "../engine/primitives";
import { MONO, T } from "../engine/tokens";
import type { MechanicProps, MeterPayload } from "../engine/types";

export default function Meter({ payload, audio, onEvent }: MechanicProps<MeterPayload>) {
  const [value, setValue] = useState(0);
  const [wrongOnce, setWrongOnce] = useState(false);
  const [locked, setLocked] = useState(false);

  const zones = payload.zones;
  const zone = zones.find((z) => value <= z.upTo) ?? zones[zones.length - 1];
  const fillColor = zone.good ? T.confirmedGreen : T.threatRed;

  const change = (v: number) => {
    if (locked) return;
    setValue(v);
    audio.click();
  };

  const lockIn = () => {
    if (zone.good) {
      setLocked(true);
      audio.stamp();
      onEvent({ kind: "HIT" });
      onEvent({ kind: "COMPLETED", mastery: !wrongOnce });
    } else {
      setWrongOnce(true);
      audio.thud();
      onEvent({ kind: "MISS" });
    }
  };

  return (
    <section style={{ maxWidth: 640, margin: "0 auto" }}>
      <div style={{ background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 4, padding: "20px 22px" }}>
        <p style={{ margin: 0, fontFamily: MONO, fontSize: 13, letterSpacing: "0.03em", color: T.textSecondary }}>
          {payload.prompt}
        </p>

        {/* live gauge */}
        <div style={{ marginTop: 18, height: 14, borderRadius: 7, background: T.inkBlack, border: `1px solid ${T.hairline}`, overflow: "hidden" }}>
          <div
            style={{
              width: `${value}%`,
              height: "100%",
              background: fillColor,
              boxShadow: `0 0 12px ${fillColor}99`,
              transition: "width 90ms linear, background 160ms ease",
            }}
          />
        </div>

        {/* the slider */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          disabled={locked}
          onChange={(e) => change(Number(e.target.value))}
          aria-label={payload.prompt}
          style={{ width: "100%", marginTop: 12, accentColor: T.arcCyan, cursor: locked ? "default" : "pointer" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled }}>{payload.minLabel}</span>
          <span style={{ fontFamily: MONO, fontSize: 11, color: T.textDisabled }}>{payload.maxLabel}</span>
        </div>

        {/* readout */}
        <div style={{ marginTop: 18, display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.04em", color: T.textSecondary }}>
            {payload.readoutLabel}
          </span>
          <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: fillColor }}>{zone.caption}</span>
        </div>
        <p style={{ margin: "6px 0 0", fontFamily: MONO, fontSize: 12, color: zone.good ? T.confirmedGreen : T.textSecondary }}>
          {zone.label}
        </p>
      </div>

      <div style={{ marginTop: 16 }}>
        {locked ? (
          <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: T.confirmedGreen, borderLeft: `2px solid ${T.confirmedGreen}`, paddingLeft: 14 }}>
            {payload.doneLine}
          </p>
        ) : (
          <AmberButton label="LOCK IT IN" onClick={lockIn} />
        )}
      </div>
    </section>
  );
}
