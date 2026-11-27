import type { CSSProperties } from "react";
import { GATE_ARCS, GATE_CENTRE, GATE_SPOKES, GATE_STREAMS, GATE_TICKS } from "./lockRules";

const tint = (c: string) => ({ "--c": c }) as CSSProperties;

/**
 * The aperture on the right of the gate (on a phone, small above the form).
 * Decorative only: the form beside it carries every word a screen reader
 * needs. `seated` (0 to 6) lights that many arcs, nodes and count bars; the
 * spin, the red arcs on a wrong password and the opening come from the
 * page's data-gate attribute in gate.css.
 */
export default function GateLock({ seated, open }: { seated: number; open: boolean }) {
  const on = (i: number) => (i < seated ? "on" : undefined);
  return (
    <section className="agt-lock" aria-hidden="true" data-rise="" style={{ "--i": 1 } as CSSProperties}>
      <span className="halo" />
      <svg className="rings" viewBox="0 0 520 520">
        <g className="tick">
          {GATE_TICKS.map((t, i) => (
            <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="#c9d1de" strokeWidth={t.major ? 1.6 : 1} />
          ))}
        </g>
        <g className="outer">
          <circle cx={GATE_CENTRE.cx} cy={GATE_CENTRE.cy} r={226} fill="none" stroke="#cfd6e2" strokeWidth={1} strokeDasharray="2 9" />
        </g>
        {GATE_SPOKES.map((s, i) => (
          <g key={i}>
            <line className="spoke" x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
            <circle className={`node ${on(i) ?? ""}`.trim()} style={tint(s.color)} cx={s.x2} cy={s.y2} r={5} />
          </g>
        ))}
        <circle cx={GATE_CENTRE.cx} cy={GATE_CENTRE.cy} r={150} fill="none" stroke="#dfe4ec" strokeWidth={1} />
        <g className="arcs">
          {GATE_ARCS.map((a, i) => (
            <path key={i} className={`arc ${on(i) ?? ""}`.trim()} style={tint(a.color)} d={a.d} />
          ))}
        </g>
      </svg>
      <div className="agt-core">
        {/* eslint-disable-next-line @next/next/no-img-element -- a static 32px mark */}
        <img src="/favicon.svg" alt="" width={32} height={32} />
        <span className="state">{open ? "Open" : "Sealed"}</span>
      </div>
      <div className="agt-count">
        {GATE_STREAMS.map((c, i) => (
          <i key={i} className={on(i)} style={tint(c)} />
        ))}
        <span>one key</span>
      </div>
    </section>
  );
}
