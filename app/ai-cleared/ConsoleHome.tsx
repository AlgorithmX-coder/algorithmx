import Link from "next/link";
import { K } from "./engine/tokens";
import { TRACK_LABEL, type Track } from "./engine/types";
import type { CourseMapEntry } from "./engine/ClearedPlayer";
import Frame from "./Frame";
import CourseAside from "./CourseAside";
import TrackChange from "./TrackChange";

/* The course home: a progress ring, the five modules as glass cards with
 * their state, the certificate once the course is complete, and the
 * one-time desk change. */
export default function ConsoleHome({
  firmName,
  contactName,
  contactRole,
  learnerName,
  track,
  trackLocked,
  modules,
  resumeN,
  complete,
}: {
  firmName: string;
  contactName?: string | null;
  contactRole?: string | null;
  learnerName: string;
  track: Track;
  trackLocked: boolean;
  modules: (CourseMapEntry & { phaseLabel?: string })[];
  resumeN: number | null;
  complete: boolean;
}) {
  const done = modules.filter((m) => m.done).length;
  const pct = Math.round((done / modules.length) * 100);
  const r = 34;
  const c = 2 * Math.PI * r;
  const next = modules.find((m) => m.n === resumeN);

  return (
    <Frame
      firmName={firmName}
      meta={<span className="cf-meta">{learnerName} · {TRACK_LABEL[track]} <TrackChange current={track} locked={trackLocked} /></span>}
      aside={<CourseAside firmName={firmName} contactName={contactName} contactRole={contactRole} learnerName={learnerName} done={modules.filter((m) => m.done).map((m) => m.n)} showModules={false} showWindow />}
    >
      <span className="cf-eyebrow">
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: K.ok, boxShadow: `0 0 0 3px ${K.okSoft}` }} />
        Practice data only
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", marginBottom: 6 }}>
        <svg width="88" height="88" viewBox="0 0 88 88" role="img" aria-label={`${pct} percent of the course cleared`} style={{ flexShrink: 0 }}>
          <defs>
            <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0a7085" />
              <stop offset="58%" stopColor="#5744c9" />
              <stop offset="100%" stopColor="#a5117f" />
            </linearGradient>
          </defs>
          <circle cx="44" cy="44" r={r} fill="none" stroke={K.edge} strokeWidth="7" />
          <circle cx="44" cy="44" r={r} fill="none" stroke="url(#ring)" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - done / modules.length)} transform="rotate(-90 44 44)" style={{ transition: "stroke-dashoffset 600ms ease" }} />
          <text x="44" y="49" textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" fontSize="15" fontWeight="700" fill={K.ink}>{pct}%</text>
        </svg>
        <div>
          <h1 className="cf-h1" style={{ marginBottom: 6 }}>{complete ? <>You are <span className="cf-grad">AI Cleared</span>.</> : done === 0 ? <>Hello, {learnerName}. Let&rsquo;s get you <span className="cf-grad">cleared</span>.</> : <>{done} of {modules.length} cleared, {learnerName}.</>}</h1>
          <p className="cf-note">{complete ? "Every module passed. Your certificate is ready below." : next ? `Next up: Module ${next.n}, ${next.title}, about ${next.minutes} minutes.` : "Five short modules, about ninety minutes in all."}</p>
        </div>
      </div>

      {complete && (
        <Link href="/ai-cleared/certificate" className="ch-cert">
          <span className="ch-cert-stamp">Course cleared</span>
          <span className="ch-cert-text">Your certificate is ready. Download it, or send the verify link to your manager.</span>
          <span className="ch-cert-go">Open</span>
        </Link>
      )}

      <ol className="ch-list">
        {modules.map((m) => {
          const state = m.done ? "done" : m.available ? (m.n === resumeN ? "next" : "open") : "locked";
          const inner = (
            <>
              <span className={`ch-n ${state}`}>{m.done ? "✓" : m.n}</span>
              <span className="ch-body">
                <b>{m.title}</b>
                <small>{m.minutes} min{m.phaseLabel ? ` · ${m.phaseLabel}` : ""}{state === "locked" ? " · coming with the next release" : ""}</small>
              </span>
              <span className={`ch-go ${state}`}>{m.done ? "Cleared" : state === "next" ? (m.phaseLabel ? "Resume" : "Start") : state === "open" ? "Open" : "Locked"}</span>
            </>
          );
          return (
            <li key={m.n}>
              {state === "locked" ? <div className={`ch-card ${state}`}>{inner}</div> : <Link href={`/ai-cleared/m/${m.n}`} className={`ch-card ${state}`}>{inner}</Link>}
            </li>
          );
        })}
      </ol>

      <style>{`
        .ch-list { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .ch-card { display: flex; align-items: center; gap: 16px; padding: 16px 18px; background: ${K.glass}; backdrop-filter: blur(16px); border: 1px solid ${K.glassEdge}; border-radius: 16px; text-decoration: none; transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease; }
        a.ch-card:hover { transform: translateY(-2px); box-shadow: ${K.lift}; border-color: rgba(87,68,201,0.4); }
        .ch-card.next { border-color: transparent; background: ${K.glassStrong}; box-shadow: 0 0 0 1px rgba(87,68,201,0.35), ${K.glow}; }
        .ch-card.locked { opacity: 0.6; }
        .ch-n { flex-shrink: 0; width: 36px; height: 36px; border-radius: 12px; border: 1px solid ${K.edge}; font-family: ${K.mono}; font-size: 13px; display: inline-flex; align-items: center; justify-content: center; color: ${K.muted}; background: ${K.panel}; }
        .ch-n.done, .ch-n.next { border-color: transparent; color: ${K.onAccent}; background: ${K.grad}; }
        .ch-body { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
        .ch-body b { color: ${K.ink}; font-size: 16px; font-weight: 600; }
        .ch-body small { color: ${K.muted}; font-size: 13px; }
        .ch-go { font-size: 13.5px; font-weight: 600; white-space: nowrap; color: ${K.muted}; }
        .ch-go.done { color: ${K.ok}; }
        .ch-go.next { color: ${K.onAccent}; background: ${K.grad}; border-radius: 999px; padding: 6px 13px; }
        .ch-cert { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 18px; padding: 16px 18px; background: ${K.glassStrong}; border: 1px solid transparent; border-radius: 16px; text-decoration: none; box-shadow: 0 0 0 1px rgba(14,122,69,0.4), 0 10px 34px rgba(14,122,69,0.16); }
        .ch-cert-stamp { font-family: ${K.mono}; font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: ${K.onAccent}; background: ${K.ok}; border-radius: 6px; padding: 5px 9px; white-space: nowrap; }
        .ch-cert-text { color: ${K.ink}; font-size: 15px; flex: 1 1 240px; }
        .ch-cert-go { color: ${K.ok}; font-weight: 600; white-space: nowrap; }
      `}</style>
    </Frame>
  );
}
