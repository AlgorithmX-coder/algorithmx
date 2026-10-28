"use client";

/**
 * TEN WEEK-CARD DESIGNS, for the owner to pick one by number.
 *
 * Owner, 28 October 2026, on the dashboard week list: "the cards overall, the
 * whole week, they look too boring. I want you to show me ten different designs
 * of ones that we could possibly use. Then if youre futuristic, and really
 * good. Animation, live coding, just make it look like a cool future coding
 * place for kids."
 *
 * Same convention as the nav treatment ("owner pick 08") and the Bracket Core
 * cube from the Cube Concepts page: numbered, so the reply can be a number.
 *
 * THE RULES EACH CONCEPT HAS TO OBEY, so that a pick is shippable rather than
 * just a nice picture:
 *  - it carries the REAL content: week number, title, description, the week's
 *    icon strip, and the action;
 *  - it renders EVERY state. A design that cannot show a locked week or a
 *    finished one is not a candidate, so each concept is shown as
 *    current / available / completed in that order;
 *  - 20 of them stack in a list on a 1414x771 screen, so the motion is CSS
 *    only, no per-card JS timers, and it stops under prefers-reduced-motion;
 *  - it sits on the dashboard's own palette and fonts, not a new one.
 *
 * Everything here is scoped to this preview route. Nothing imports from it.
 */

import { useState } from "react";

/* The dashboard's palette, copied rather than imported so this preview cannot
 * drift the real page by accident. */
const C = {
  pageBg: "#05060f",
  card: "rgba(13, 19, 44, 0.62)",
  border: "rgba(86, 140, 230, 0.22)",
  borderStrong: "rgba(54, 214, 255, 0.42)",
  text: "#eaf1ff",
  textSoft: "#bcc8ee",
  textMuted: "rgba(150, 172, 224, 0.62)",
  cyan: "#36d6ff",
  cyanSoft: "#8fe9ff",
  blue: "#4d9bff",
  violet: "#8b6cff",
  violetSoft: "#a98bff",
  pink: "#ff4d9d",
  ember: "#ff7a4d",
  moss: "#7eff97",
  mossLight: "#a0ffb0",
  dark: "#05060f",
};
const FONT_DISPLAY = "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif";
const FONT_BODY = "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif";
const FONT_MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

type State = "current" | "available" | "completed";
interface Wk {
  week: number;
  title: string;
  description: string;
  state: State;
  stars: number;
}

/* Real week content from the live dashboard, so every concept is judged on
 * the words it will actually have to hold. */
const WEEKS: Wk[] = [
  {
    week: 1,
    title: "Passwords: The Secret Code",
    description: "Discover why passwords matter and learn how to create super strong ones.",
    state: "current",
    stars: 0,
  },
  {
    week: 2,
    title: "Private Info: Guard Your Secrets",
    description: "Learn what personal information is and why some things should stay private.",
    state: "available",
    stars: 0,
  },
  {
    week: 3,
    title: "Stranger Danger: Friend or Foe?",
    description: "Spot fake profiles and stay safe when chatting to people online.",
    state: "completed",
    stars: 3,
  },
];

const ACCENT: Record<State, string> = {
  current: C.cyan,
  available: C.blue,
  completed: C.moss,
};
const LABEL: Record<State, string> = {
  current: "Start Lesson",
  available: "Start Lesson",
  completed: "Replay",
};

/* ── shared bits ───────────────────────────────────────────── */

function Icons({ state, n = 5 }: { state: State; n?: number }) {
  /* Stand-ins for the per-week icon strip, drawn rather than imported so the
   * preview has no asset dependency. The real cards feed these from
   * /dashboard/week-bg art. */
  const a = ACCENT[state];
  const glyphs = [
    <path key="a" d="M5 11V8a4 4 0 0 1 8 0v3M4 11h10v7H4z" />,
    <path key="b" d="M9 3l5 3v5c0 3-2 5-5 6-3-1-5-3-5-6V6z" />,
    <path key="c" d="M3 6h12v8H3zM3 9h12" />,
    <path key="d" d="M9 2v5M9 11v5M2 9h5M11 9h5" />,
    <path key="e" d="M6 6h6v6H6zM9 2v4M9 12v4" />,
  ];
  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center" }}>
      {glyphs.slice(0, n).map((g, i) => (
        <svg
          key={i}
          width={18}
          height={18}
          viewBox="0 0 18 18"
          fill="none"
          stroke={a}
          strokeWidth={1.3}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: state === "completed" ? 0.5 : 0.75 }}
          aria-hidden
        >
          {g}
        </svg>
      ))}
    </span>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }} aria-label={`${n} stars`}>
      {[0, 1, 2].map((i) => (
        <svg key={i} width={11} height={11} viewBox="0 0 12 12" aria-hidden>
          <path
            d="M6 1l1.5 3.2 3.5.4-2.6 2.4.7 3.4L6 8.8 2.9 10.4l.7-3.4L1 4.6l3.5-.4z"
            fill={i < n ? C.mossLight : "rgba(160,255,176,0.22)"}
          />
        </svg>
      ))}
    </span>
  );
}

function Cta({ state, tone = "solid" }: { state: State; tone?: "solid" | "ghost" }) {
  const a = ACCENT[state];
  const done = state === "completed";
  if (tone === "ghost") {
    return (
      <span
        className="cta"
        style={{
          fontFamily: FONT_BODY,
          fontSize: 12,
          fontWeight: 800,
          color: a,
          border: `1px solid ${a}66`,
          background: `${a}14`,
          borderRadius: 100,
          padding: "9px 16px",
          whiteSpace: "nowrap",
        }}
      >
        {LABEL[state]} →
      </span>
    );
  }
  return (
    <span
      className="cta"
      style={{
        fontFamily: FONT_BODY,
        fontSize: 12.5,
        fontWeight: 900,
        color: done ? C.mossLight : C.dark,
        background: done ? "rgba(126,255,151,0.14)" : `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
        border: done ? "1px solid rgba(126,255,151,0.45)" : "none",
        borderRadius: 100,
        padding: "10px 18px",
        whiteSpace: "nowrap",
      }}
    >
      {LABEL[state]} →
    </span>
  );
}

/* ── 01 Terminal Line ──────────────────────────────────────── */
function C01({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  return (
    <div className={`c01 ${w.state}`}>
      <div className="c01-head">
        <span className="c01-prompt">cyberheroes@hq</span>
        <span className="c01-sep">:~$</span>
        <span className="c01-cmd">
          open week_{String(w.week).padStart(2, "0")}
        </span>
        {w.state === "current" && <i className="c01-caret" />}
      </div>
      <div className="c01-body">
        <div className="c01-title">{w.title}</div>
        <div className="c01-desc">
          <span className="c01-hash">#</span> {w.description}
        </div>
      </div>
      <div className="c01-foot">
        <Icons state={w.state} />
        <span className="c01-spacer" />
        {w.state === "completed" && <Stars n={w.stars} />}
        <Cta state={w.state} tone="ghost" />
      </div>
      <style jsx>{`
        .c01 {
          border: 1px solid ${C.border};
          border-left: 3px solid ${a};
          border-radius: 12px;
          background: linear-gradient(180deg, rgba(8, 12, 30, 0.9), rgba(5, 7, 20, 0.9));
          padding: 14px 18px;
          font-family: ${FONT_MONO};
          position: relative;
          overflow: hidden;
        }
        .c01.current {
          box-shadow: 0 0 0 1px ${a}44, 0 0 34px -12px ${a};
        }
        .c01-head {
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .c01-prompt { color: ${C.moss}; }
        .c01-sep { color: ${C.textMuted}; }
        .c01-cmd { color: ${C.cyanSoft}; }
        .c01-caret {
          width: 7px;
          height: 13px;
          background: ${a};
          display: inline-block;
          animation: blink 1.1s steps(2) infinite;
        }
        .c01-body { margin: 9px 0 11px; }
        .c01-title {
          font-family: ${FONT_DISPLAY};
          font-size: 17px;
          font-weight: 700;
          color: ${C.text};
        }
        .c01-desc { font-size: 11.5px; color: ${C.textMuted}; margin-top: 3px; }
        .c01-hash { color: ${a}; }
        .c01-foot { display: flex; align-items: center; gap: 10px; }
        .c01-spacer { flex: 1; }
        @keyframes blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .c01-caret { animation: none; }
        }
      `}</style>
    </div>
  );
}

/* ── 02 Mission Dossier ────────────────────────────────────── */
function C02({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  const stamp = w.state === "completed" ? "CLOSED" : w.state === "current" ? "ACTIVE" : "SEALED";
  return (
    <div className={`c02 ${w.state}`}>
      <span className="c02-tab">FILE {String(w.week).padStart(3, "0")}</span>
      <span className="c02-stamp">{stamp}</span>
      <div className="c02-inner">
        <h3 className="c02-title">{w.title}</h3>
        <p className="c02-desc">{w.description}</p>
        <div className="c02-foot">
          <Icons state={w.state} />
          <span className="c02-spacer" />
          {w.state === "completed" && <Stars n={w.stars} />}
          <Cta state={w.state} />
        </div>
      </div>
      <style jsx>{`
        .c02 {
          position: relative;
          margin-top: 12px;
          border: 1px solid ${a}55;
          border-radius: 4px 14px 14px 14px;
          background: repeating-linear-gradient(
              -45deg,
              rgba(255, 255, 255, 0.012) 0 10px,
              transparent 10px 20px
            ),
            rgba(10, 15, 36, 0.86);
          padding: 18px 20px 16px;
        }
        .c02-tab {
          position: absolute;
          top: -12px;
          left: 14px;
          font-family: ${FONT_MONO};
          font-size: 10px;
          letter-spacing: 0.16em;
          color: ${C.dark};
          background: ${a};
          padding: 3px 10px;
          border-radius: 4px 4px 0 0;
          font-weight: 700;
        }
        .c02-stamp {
          position: absolute;
          top: 14px;
          right: 16px;
          font-family: ${FONT_MONO};
          font-size: 10px;
          letter-spacing: 0.22em;
          color: ${a};
          border: 1.5px solid ${a}99;
          padding: 3px 9px;
          border-radius: 3px;
          transform: rotate(-5deg);
          opacity: 0.9;
        }
        .c02-title {
          font-family: ${FONT_DISPLAY};
          font-size: 17px;
          font-weight: 700;
          color: ${C.text};
          margin: 0 90px 4px 0;
        }
        .c02-desc { font-size: 12px; color: ${C.textMuted}; margin: 0 0 12px; font-family: ${FONT_BODY}; }
        .c02-foot { display: flex; align-items: center; gap: 10px; }
        .c02-spacer { flex: 1; }
      `}</style>
    </div>
  );
}

/* ── 03 Circuit Trace ──────────────────────────────────────── */
function C03({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  return (
    <div className={`c03 ${w.state}`}>
      <svg className="c03-trace" viewBox="0 0 600 90" preserveAspectRatio="none" aria-hidden>
        <path
          d="M0 80 H120 L134 68 H300 L314 80 H470 L484 66 H600"
          fill="none"
          stroke={a}
          strokeWidth="1.2"
          opacity="0.4"
        />
        {w.state === "current" && (
          <path
            className="c03-pulse"
            d="M0 80 H120 L134 68 H300 L314 80 H470 L484 66 H600"
            fill="none"
            stroke={C.cyanSoft}
            strokeWidth="2"
            strokeDasharray="36 564"
          />
        )}
      </svg>
      <div className="c03-chip">
        <span>W{w.week}</span>
      </div>
      <div className="c03-body">
        <h3 className="c03-title">{w.title}</h3>
        <p className="c03-desc">{w.description}</p>
      </div>
      <div className="c03-right">
        {w.state === "completed" && <Stars n={w.stars} />}
        <Cta state={w.state} />
      </div>
      <style jsx>{`
        .c03 {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 16px;
          border: 1px solid ${C.border};
          background: ${C.card};
          overflow: hidden;
        }
        .c03.current { border-color: ${a}77; box-shadow: 0 0 30px -14px ${a}; }
        .c03-trace { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
        .c03-pulse { animation: dash 2.6s linear infinite; }
        @keyframes dash { to { stroke-dashoffset: -600; } }
        .c03-chip {
          position: relative;
          width: 52px;
          height: 52px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border-radius: 10px;
          border: 1.5px solid ${a}88;
          background: rgba(5, 8, 22, 0.9);
          font-family: ${FONT_MONO};
          font-size: 13px;
          font-weight: 700;
          color: ${a};
          box-shadow: 0 0 18px -6px ${a};
        }
        .c03-body { position: relative; flex: 1; min-width: 0; }
        .c03-title { font-family: ${FONT_DISPLAY}; font-size: 16.5px; font-weight: 700; color: ${C.text}; margin: 0; }
        .c03-desc { font-family: ${FONT_BODY}; font-size: 12px; color: ${C.textMuted}; margin: 3px 0 0; }
        .c03-right { position: relative; display: flex; align-items: center; gap: 10px; }
        @media (prefers-reduced-motion: reduce) { .c03-pulse { animation: none; } }
      `}</style>
    </div>
  );
}

/* ── 04 Holo Panel ─────────────────────────────────────────── */
function C04({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  return (
    <div className={`c04 ${w.state}`}>
      <i className="c04-br c04-tl" />
      <i className="c04-br c04-tr" />
      <i className="c04-br c04-bl" />
      <i className="c04-br c04-brr" />
      {w.state === "current" && <i className="c04-scan" />}
      <div className="c04-num">{String(w.week).padStart(2, "0")}</div>
      <div className="c04-body">
        <div className="c04-kicker">WEEK {w.week} · MISSION BRIEF</div>
        <h3 className="c04-title">{w.title}</h3>
        <p className="c04-desc">{w.description}</p>
        <Icons state={w.state} />
      </div>
      <div className="c04-right">
        {w.state === "completed" && <Stars n={w.stars} />}
        <Cta state={w.state} tone="ghost" />
      </div>
      <style jsx>{`
        .c04 {
          position: relative;
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 18px 22px;
          background: linear-gradient(110deg, ${a}14, rgba(10, 15, 36, 0.8) 46%);
          border: 1px solid ${a}3a;
          overflow: hidden;
        }
        .c04-br {
          position: absolute;
          width: 14px;
          height: 14px;
          border: 2px solid ${a};
          opacity: 0.85;
        }
        .c04-tl { top: 6px; left: 6px; border-right: 0; border-bottom: 0; }
        .c04-tr { top: 6px; right: 6px; border-left: 0; border-bottom: 0; }
        .c04-bl { bottom: 6px; left: 6px; border-right: 0; border-top: 0; }
        .c04-brr { bottom: 6px; right: 6px; border-left: 0; border-top: 0; }
        .c04-scan {
          position: absolute;
          inset: 0 auto 0 0;
          width: 36%;
          background: linear-gradient(90deg, transparent, ${a}22, transparent);
          animation: sweep 3.4s ease-in-out infinite;
        }
        @keyframes sweep { 0%,100% { transform: translateX(-40%); } 50% { transform: translateX(300%); } }
        .c04-num {
          position: relative;
          font-family: ${FONT_DISPLAY};
          font-size: 40px;
          font-weight: 800;
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1.4px ${a}cc;
          flex-shrink: 0;
        }
        .c04-body { position: relative; flex: 1; min-width: 0; }
        .c04-kicker {
          font-family: ${FONT_MONO};
          font-size: 9.5px;
          letter-spacing: 0.2em;
          color: ${a};
          margin-bottom: 4px;
        }
        .c04-title { font-family: ${FONT_DISPLAY}; font-size: 17px; font-weight: 700; color: ${C.text}; margin: 0 0 3px; }
        .c04-desc { font-family: ${FONT_BODY}; font-size: 12px; color: ${C.textMuted}; margin: 0 0 9px; }
        .c04-right { position: relative; display: flex; align-items: center; gap: 10px; }
        @media (prefers-reduced-motion: reduce) { .c04-scan { animation: none; opacity: 0.3; } }
      `}</style>
    </div>
  );
}

/* ── 05 Code Block ─────────────────────────────────────────── */
function C05({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  const slug = w.title.toLowerCase().split(":")[0].replace(/[^a-z]+/g, "_");
  return (
    <div className={`c05 ${w.state}`}>
      <div className="c05-gutter">
        {[1, 2, 3, 4].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="c05-code">
        <div className="l">
          <span className="kw">const</span> <span className="var">week{w.week}</span>{" "}
          <span className="op">=</span> <span className="br">{"{"}</span>
        </div>
        <div className="l indent">
          <span className="key">skill</span>
          <span className="op">:</span> <span className="str">&quot;{slug}&quot;</span>
          <span className="op">,</span>
        </div>
        <div className="l indent">
          <span className="key">status</span>
          <span className="op">:</span>{" "}
          <span className="st">{w.state === "completed" ? "DONE" : w.state === "current" ? "LIVE" : "READY"}</span>
          {w.state === "current" && <i className="cur" />}
        </div>
        <div className="l">
          <span className="br">{"}"}</span>
        </div>
        <div className="c05-meta">
          <h3>{w.title}</h3>
          <p>{w.description}</p>
        </div>
      </div>
      <div className="c05-right">
        {w.state === "completed" && <Stars n={w.stars} />}
        <Cta state={w.state} tone="ghost" />
      </div>
      <style jsx>{`
        .c05 {
          display: flex;
          gap: 14px;
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid ${C.border};
          border-top: 2px solid ${a}aa;
          background: rgba(6, 10, 26, 0.92);
          font-family: ${FONT_MONO};
          font-size: 12px;
          align-items: center;
        }
        .c05.current { box-shadow: 0 0 30px -14px ${a}; }
        /* The gutter has to share the CODE lines line-box exactly, or the
         * numbers drift out of step with the lines they label. Same
         * font-size and line-height, no gap, pinned to the top. */
        .c05-gutter {
          display: flex;
          flex-direction: column;
          align-self: flex-start;
          color: rgba(150, 172, 224, 0.35);
          font-size: 12px;
          line-height: 1.5;
          text-align: right;
          flex-shrink: 0;
        }
        .c05-code { flex: 1; min-width: 0; }
        .l { line-height: 1.5; }
        .indent { padding-left: 18px; }
        .kw { color: ${C.violetSoft}; }
        .var { color: ${C.cyanSoft}; }
        .key { color: ${C.blue}; }
        .op, .br { color: ${C.textMuted}; }
        .str { color: ${C.mossLight}; }
        .st { color: ${a}; font-weight: 700; }
        .cur {
          display: inline-block;
          width: 6px;
          height: 11px;
          background: ${a};
          margin-left: 3px;
          vertical-align: -1px;
          animation: blink 1.1s steps(2) infinite;
        }
        .c05-meta { margin-top: 9px; border-top: 1px dashed ${C.border}; padding-top: 8px; }
        .c05-meta h3 { font-family: ${FONT_DISPLAY}; font-size: 16px; font-weight: 700; color: ${C.text}; margin: 0; }
        .c05-meta p { font-family: ${FONT_BODY}; font-size: 11.5px; color: ${C.textMuted}; margin: 2px 0 0; }
        .c05-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        @keyframes blink { 50% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .cur { animation: none; } }
      `}</style>
    </div>
  );
}

/* ── 06 Reactor Core ───────────────────────────────────────── */
function C06({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  const pct = w.state === "completed" ? 100 : w.state === "current" ? 35 : 0;
  const R = 22;
  const circ = 2 * Math.PI * R;
  return (
    <div className={`c06 ${w.state}`}>
      <div className="c06-core">
        <svg width="58" height="58" viewBox="0 0 58 58" aria-hidden>
          <circle cx="29" cy="29" r={R} fill="none" stroke="rgba(86,140,230,0.2)" strokeWidth="3" />
          <circle
            cx="29"
            cy="29"
            r={R}
            fill="none"
            stroke={a}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * circ} ${circ}`}
            transform="rotate(-90 29 29)"
          />
        </svg>
        <span className="c06-num">W{w.week}</span>
        {w.state === "current" && <i className="c06-halo" />}
      </div>
      <div className="c06-body">
        <h3>{w.title}</h3>
        <p>{w.description}</p>
        <Icons state={w.state} n={4} />
      </div>
      <div className="c06-right">
        {w.state === "completed" && <Stars n={w.stars} />}
        <Cta state={w.state} />
      </div>
      <style jsx>{`
        .c06 {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 16px 20px;
          border-radius: 20px;
          border: 1px solid ${C.border};
          background: radial-gradient(120% 140% at 0% 50%, ${a}18, transparent 55%), ${C.card};
        }
        .c06.current { border-color: ${a}66; }
        .c06-core { position: relative; display: grid; place-items: center; flex-shrink: 0; }
        .c06-core svg { display: block; }
        .c06-num {
          position: absolute;
          font-family: ${FONT_DISPLAY};
          font-size: 13px;
          font-weight: 800;
          color: ${C.text};
        }
        .c06-halo {
          position: absolute;
          inset: -6px;
          border-radius: 50%;
          border: 1px solid ${a}55;
          animation: pulse 2.8s ease-out infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .c06-body { flex: 1; min-width: 0; }
        .c06-body h3 { font-family: ${FONT_DISPLAY}; font-size: 16.5px; font-weight: 700; color: ${C.text}; margin: 0; }
        .c06-body p { font-family: ${FONT_BODY}; font-size: 12px; color: ${C.textMuted}; margin: 3px 0 8px; }
        .c06-right { display: flex; align-items: center; gap: 10px; }
        @media (prefers-reduced-motion: reduce) { .c06-halo { animation: none; } }
      `}</style>
    </div>
  );
}

/* ── 07 Data Stream ────────────────────────────────────────── */
function C07({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  const cols = 14;
  return (
    <div className={`c07 ${w.state}`}>
      <div className="c07-rain" aria-hidden>
        {Array.from({ length: cols }).map((_, i) => (
          <span key={i} style={{ animationDelay: `${(i % 7) * 0.45}s`, left: `${(i / cols) * 100}%` }}>
            {["0", "1", "1", "0", "1", "0", "0", "1"].join("")}
          </span>
        ))}
      </div>
      <div className="c07-badge">W{w.week}</div>
      <div className="c07-body">
        <h3>{w.title}</h3>
        <p>{w.description}</p>
      </div>
      <div className="c07-right">
        {w.state === "completed" && <Stars n={w.stars} />}
        <Cta state={w.state} tone="ghost" />
      </div>
      <style jsx>{`
        .c07 {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 14px;
          border: 1px solid ${C.border};
          background: rgba(6, 10, 26, 0.9);
          overflow: hidden;
        }
        .c07.current { border-color: ${a}66; }
        .c07-rain { position: absolute; inset: 0; opacity: ${w.state === "current" ? 0.3 : 0.12}; pointer-events: none; }
        .c07-rain span {
          position: absolute;
          top: -60px;
          font-family: ${FONT_MONO};
          font-size: 10px;
          line-height: 1.1;
          color: ${a};
          writing-mode: vertical-rl;
          animation: fall 5.5s linear infinite;
        }
        @keyframes fall { to { transform: translateY(190px); } }
        .c07-badge {
          position: relative;
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(5, 8, 22, 0.95);
          border: 1.5px solid ${a}88;
          font-family: ${FONT_DISPLAY};
          font-weight: 800;
          font-size: 13px;
          color: ${a};
        }
        .c07-body { position: relative; flex: 1; min-width: 0; }
        .c07-body h3 { font-family: ${FONT_DISPLAY}; font-size: 16.5px; font-weight: 700; color: ${C.text}; margin: 0; }
        .c07-body p { font-family: ${FONT_BODY}; font-size: 12px; color: ${C.textMuted}; margin: 3px 0 0; }
        .c07-right { position: relative; display: flex; align-items: center; gap: 10px; }
        @media (prefers-reduced-motion: reduce) { .c07-rain span { animation: none; } }
      `}</style>
    </div>
  );
}

/* ── 08 Isometric Slab ─────────────────────────────────────── */
function C08({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  return (
    <div className={`c08 ${w.state}`}>
      <div className="c08-slab">
        <span>{String(w.week).padStart(2, "0")}</span>
      </div>
      <div className="c08-body">
        <div className="c08-kicker">WEEK {w.week}</div>
        <h3>{w.title}</h3>
        <p>{w.description}</p>
      </div>
      <div className="c08-right">
        {w.state === "completed" && <Stars n={w.stars} />}
        <Cta state={w.state} />
      </div>
      <style jsx>{`
        .c08 {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 16px 20px;
          border-radius: 18px;
          background: linear-gradient(180deg, rgba(18, 25, 54, 0.9), rgba(9, 13, 32, 0.9));
          border: 1px solid ${C.border};
          border-bottom: 3px solid ${a}99;
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .c08:hover { transform: translateY(-3px); box-shadow: 0 14px 30px -16px ${a}; }
        .c08-slab {
          flex-shrink: 0;
          width: 56px;
          height: 56px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: linear-gradient(145deg, ${a}, ${a}55);
          box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.4), 0 7px 0 -2px ${a}33, 0 12px 20px -10px ${a};
          font-family: ${FONT_DISPLAY};
          font-size: 19px;
          font-weight: 900;
          color: ${C.dark};
        }
        .c08-body { flex: 1; min-width: 0; }
        .c08-kicker { font-family: ${FONT_MONO}; font-size: 9.5px; letter-spacing: 0.18em; color: ${a}; }
        .c08-body h3 { font-family: ${FONT_DISPLAY}; font-size: 17px; font-weight: 700; color: ${C.text}; margin: 2px 0 2px; }
        .c08-body p { font-family: ${FONT_BODY}; font-size: 12px; color: ${C.textMuted}; margin: 0; }
        .c08-right { display: flex; align-items: center; gap: 10px; }
        @media (prefers-reduced-motion: reduce) { .c08 { transition: none; } }
      `}</style>
    </div>
  );
}

/* ── 09 Signal Trace ───────────────────────────────────────── */
function C09({ w }: { w: Wk }) {
  const a = ACCENT[w.state];
  const amp = w.state === "current" ? 1 : w.state === "completed" ? 0.35 : 0.6;
  return (
    <div className={`c09 ${w.state}`}>
      <div className="c09-body">
        <div className="c09-kicker">
          CHANNEL {String(w.week).padStart(2, "0")} ·{" "}
          {w.state === "completed" ? "ARCHIVED" : w.state === "current" ? "LIVE" : "STANDBY"}
        </div>
        <h3>{w.title}</h3>
        <p>{w.description}</p>
      </div>
      <svg className="c09-wave" viewBox="0 0 240 60" preserveAspectRatio="none" aria-hidden>
        <path
          d={`M0 30 ${Array.from({ length: 12 })
            .map((_, i) => {
              const x = (i + 1) * 20;
              const h = 30 - (i % 2 ? -1 : 1) * 18 * amp * (0.4 + ((i * 7) % 10) / 14);
              return `L${x} ${h.toFixed(1)}`;
            })
            .join(" ")}`}
          fill="none"
          stroke={a}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      <div className="c09-right">
        {w.state === "completed" && <Stars n={w.stars} />}
        <Cta state={w.state} tone="ghost" />
      </div>
      <style jsx>{`
        .c09 {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 15px 20px;
          border-radius: 14px;
          border: 1px solid ${C.border};
          background: ${C.card};
          border-left: 3px solid ${a};
        }
        .c09.current { box-shadow: 0 0 30px -16px ${a}; }
        .c09-body { flex: 1; min-width: 0; }
        .c09-kicker { font-family: ${FONT_MONO}; font-size: 9.5px; letter-spacing: 0.16em; color: ${a}; }
        .c09-body h3 { font-family: ${FONT_DISPLAY}; font-size: 16.5px; font-weight: 700; color: ${C.text}; margin: 3px 0 2px; }
        .c09-body p { font-family: ${FONT_BODY}; font-size: 12px; color: ${C.textMuted}; margin: 0; }
        .c09-wave { width: 150px; height: 46px; flex-shrink: 0; opacity: 0.85; }
        .c09-right { display: flex; align-items: center; gap: 10px; }
      `}</style>
    </div>
  );
}

/* ── 10 Skill-Tree Node ────────────────────────────────────── */
function C10({ w, last }: { w: Wk; last: boolean }) {
  const a = ACCENT[w.state];
  return (
    <div className={`c10 ${w.state}`}>
      <div className="c10-rail">
        <div className="c10-hex">
          <svg width="46" height="52" viewBox="0 0 46 52" aria-hidden>
            <polygon
              points="23,2 44,14 44,38 23,50 2,38 2,14"
              fill="rgba(5,8,22,0.9)"
              stroke={a}
              strokeWidth="2"
            />
          </svg>
          <span>{w.week}</span>
        </div>
        {!last && <i className="c10-link" />}
      </div>
      <div className="c10-card">
        <h3>{w.title}</h3>
        <p>{w.description}</p>
        <div className="c10-foot">
          <Icons state={w.state} n={4} />
          <span className="c10-spacer" />
          {w.state === "completed" && <Stars n={w.stars} />}
          <Cta state={w.state} tone="ghost" />
        </div>
      </div>
      <style jsx>{`
        .c10 { display: flex; gap: 16px; }
        .c10-rail { position: relative; display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
        .c10-hex { position: relative; display: grid; place-items: center; }
        .c10-hex svg { display: block; filter: drop-shadow(0 0 10px ${a}55); }
        .c10-hex span {
          position: absolute;
          font-family: ${FONT_DISPLAY};
          font-size: 15px;
          font-weight: 800;
          color: ${a};
        }
        .c10-link { flex: 1; width: 2px; background: linear-gradient(${a}88, ${a}22); margin-top: 2px; }
        .c10-card {
          flex: 1;
          min-width: 0;
          padding: 14px 18px;
          border-radius: 14px;
          border: 1px solid ${C.border};
          background: ${C.card};
          margin-bottom: 10px;
        }
        .c10.current .c10-card { border-color: ${a}66; box-shadow: 0 0 28px -16px ${a}; }
        .c10-card h3 { font-family: ${FONT_DISPLAY}; font-size: 16.5px; font-weight: 700; color: ${C.text}; margin: 0; }
        .c10-card p { font-family: ${FONT_BODY}; font-size: 12px; color: ${C.textMuted}; margin: 3px 0 9px; }
        .c10-foot { display: flex; align-items: center; gap: 10px; }
        .c10-spacer { flex: 1; }
      `}</style>
    </div>
  );
}

/* ── page ──────────────────────────────────────────────────── */

const CONCEPTS: { n: string; name: string; note: string; render: (w: Wk, i: number, len: number) => React.ReactNode }[] = [
  { n: "01", name: "Terminal Line", note: "A real shell prompt. Typed command, blinking caret on the live week.", render: (w) => <C01 w={w} /> },
  { n: "02", name: "Mission Dossier", note: "A classified file with a tab and a status stamp. Leans on the agent story.", render: (w) => <C02 w={w} /> },
  { n: "03", name: "Circuit Trace", note: "A circuit runs through the row, with an energy pulse on the live week.", render: (w) => <C03 w={w} /> },
  { n: "04", name: "Holo Panel", note: "HUD corner brackets, outlined numeral, a slow scan sweep.", render: (w) => <C04 w={w} /> },
  { n: "05", name: "Code Block", note: "The week IS a snippet, with gutter line numbers and a live cursor.", render: (w) => <C05 w={w} /> },
  { n: "06", name: "Reactor Core", note: "A charging ring carries this week's own progress, not just the course total.", render: (w) => <C06 w={w} /> },
  { n: "07", name: "Data Stream", note: "Binary rain behind the row, heavier on the week you are on.", render: (w) => <C07 w={w} /> },
  { n: "08", name: "Isometric Slab", note: "A chunky pressable block. The most toy-like, the most tappable.", render: (w) => <C08 w={w} /> },
  { n: "09", name: "Signal Trace", note: "A comms channel. The waveform's amplitude reads as the state.", render: (w) => <C09 w={w} /> },
  { n: "10", name: "Skill-Tree Node", note: "Hex nodes wired together, so twenty weeks read as one route.", render: (w, i, len) => <C10 w={w} last={i === len - 1} /> },
];

export default function WeekCardConcepts() {
  const [only, setOnly] = useState<string | null>(null);
  const shown = only ? CONCEPTS.filter((c) => c.n === only) : CONCEPTS;

  return (
    <main>
      <header className="hd">
        <h1>Week card, ten designs</h1>
        <p>
          Each one is shown three times, as the week you are on, a week you have not started, and a
          finished week, because a design has to hold all three. Reply with a number.
        </p>
        <div className="picker">
          <button onClick={() => setOnly(null)} className={only === null ? "on" : ""}>
            All
          </button>
          {CONCEPTS.map((c) => (
            <button key={c.n} onClick={() => setOnly(c.n)} className={only === c.n ? "on" : ""}>
              {c.n}
            </button>
          ))}
        </div>
      </header>

      {shown.map((c) => (
        <section key={c.n}>
          <div className="lbl">
            <span className="num">{c.n}</span>
            <span className="nm">{c.name}</span>
            <span className="nt">{c.note}</span>
          </div>
          <div className="rows">{WEEKS.map((w, i) => (
            <div key={w.week}>{c.render(w, i, WEEKS.length)}</div>
          ))}</div>
        </section>
      ))}

      <style jsx>{`
        main {
          min-height: 100vh;
          background:
            radial-gradient(900px 500px at 15% -10%, rgba(54, 214, 255, 0.07), transparent 60%),
            radial-gradient(800px 500px at 85% 0%, rgba(139, 108, 255, 0.07), transparent 60%),
            ${C.pageBg};
          padding: 40px 24px 90px;
          font-family: ${FONT_BODY};
        }
        .hd { max-width: 980px; margin: 0 auto 34px; }
        .hd h1 {
          font-family: ${FONT_DISPLAY};
          font-size: 30px;
          font-weight: 800;
          color: ${C.text};
          margin: 0 0 8px;
        }
        .hd p { color: ${C.textSoft}; font-size: 14px; margin: 0 0 16px; max-width: 70ch; line-height: 1.6; }
        .picker { display: flex; flex-wrap: wrap; gap: 6px; }
        .picker button {
          font-family: ${FONT_MONO};
          font-size: 11px;
          color: ${C.textSoft};
          background: rgba(13, 19, 44, 0.7);
          border: 1px solid ${C.border};
          border-radius: 8px;
          padding: 6px 11px;
          cursor: pointer;
        }
        .picker button.on { color: ${C.dark}; background: ${C.cyan}; border-color: ${C.cyan}; font-weight: 700; }
        section { max-width: 980px; margin: 0 auto 46px; }
        .lbl { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        .num {
          font-family: ${FONT_MONO};
          font-size: 12px;
          font-weight: 700;
          color: ${C.dark};
          background: ${C.cyan};
          border-radius: 6px;
          padding: 2px 8px;
        }
        .nm { font-family: ${FONT_DISPLAY}; font-size: 18px; font-weight: 700; color: ${C.text}; }
        .nt { font-size: 12.5px; color: ${C.textMuted}; }
        .rows { display: flex; flex-direction: column; gap: 12px; }
      `}</style>
    </main>
  );
}
