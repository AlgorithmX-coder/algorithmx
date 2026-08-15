"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { T } from "./tokens";
import LessonPlayer from "./LessonPlayer";
import { lessonCheckpointKey, type LessonCheckpoint, type WeekManifest } from "./types";

/* A week is a group of topics. This shell shows the week "map" (the five
 * topics, their status, and what each covers), then hands one topic at a
 * time to the LessonPlayer. Progress is derived from each topic's own
 * saved checkpoint, so resume just works. */

type Status = "done" | "active" | "todo";

function StatusDot({ status, n }: { status: Status; n: number }) {
  if (status === "done") {
    return (
      <span style={{ width: 34, height: 34, borderRadius: 10, background: T.greenSoft, border: `1px solid ${T.green}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4 4L19 7" /></svg>
      </span>
    );
  }
  const cyan = status === "active";
  return (
    <span style={{ width: 34, height: 34, borderRadius: 10, background: cyan ? T.cyanSoft : T.panel, border: `1px solid ${cyan ? T.cyan : T.edge}`, color: cyan ? T.cyan : T.faint, fontFamily: T.mono, fontWeight: 700, fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
  );
}

export default function WeekPlayer({ week }: { week: WeekManifest }) {
  const [active, setActive] = useState<number | null>(null);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const [startedIds, setStartedIds] = useState<string[]>([]);
  const [restored, setRestored] = useState(false);

  const recompute = useCallback(() => {
    const done: string[] = [];
    const started: string[] = [];
    for (const t of week.topics) {
      try {
        const raw = localStorage.getItem(lessonCheckpointKey(t.id));
        if (!raw) continue;
        const cp = JSON.parse(raw) as LessonCheckpoint;
        if (cp.id !== t.id) continue;
        if (cp.phase === "done") done.push(t.id);
        else if (cp.phase !== "intro") started.push(t.id);
      } catch { /* ignore corrupt checkpoint */ }
    }
    setDoneIds(done);
    setStartedIds(started);
  }, [week.topics]);

  useEffect(() => { recompute(); setRestored(true); }, [recompute]);

  const totalMins = useMemo(() => week.topics.reduce((s, t) => s + t.minutes, 0), [week.topics]);
  const doneCount = doneIds.length;
  const allDone = doneCount === week.topics.length;
  const nextIdx = week.topics.findIndex((t) => !doneIds.includes(t.id));
  const resumeIdx = nextIdx === -1 ? 0 : nextIdx;

  const statusOf = (topicId: string, i: number): Status => {
    if (doneIds.includes(topicId)) return "done";
    if (i === resumeIdx || startedIds.includes(topicId)) return "active";
    return "todo";
  };

  if (active !== null) {
    const topic = week.topics[active];
    return (
      <LessonPlayer
        key={topic.id}
        lesson={topic}
        topicIndex={active}
        topicCount={week.topics.length}
        weekTitle={week.title}
        onComplete={() => {
          recompute();
          const next = active + 1;
          if (next < week.topics.length) setActive(next);
          else setActive(null);
        }}
        onExit={() => { recompute(); setActive(null); }}
      />
    );
  }

  return (
    <div className="pro-week">
      <style>{`
        .pro-week { min-height: 100vh; color: ${T.body}; font-family: ${T.sans};
          background:
            radial-gradient(1100px 560px at 50% -8%, rgba(139,109,255,0.13), transparent 60%),
            radial-gradient(820px 460px at 90% 2%, rgba(53,214,240,0.08), transparent 55%),
            ${T.bg}; }
        .pro-week :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .pro-week-shell { max-width: 860px; margin: 0 auto; padding: 20px 24px 90px; }
        .pro-week-head { display: flex; align-items: center; gap: 12px; padding: 6px 0 18px; border-bottom: 1px solid ${T.edge}; }
        .pro-week-eyebrow { display: inline-flex; align-items: center; gap: 9px; font-family: ${T.mono}; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: ${T.primary}; margin-bottom: 15px; }
        .pro-week-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: ${T.primary}; box-shadow: 0 0 10px ${T.primary}; }
        .pro-week-h1 { font-family: ${T.display}; font-size: 40px; font-weight: 700; line-height: 1.12; letter-spacing: -0.01em; margin: 0 0 14px; color: ${T.ink}; text-wrap: balance; }
        .pro-week-intro { font-size: 18px; line-height: 1.6; color: ${T.muted}; max-width: 62ch; margin: 0 0 22px; }
        .pro-week-meta { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 13px; color: ${T.muted}; margin-bottom: 6px; }
        .pro-week-meta b { color: ${T.ink}; }
        .pro-week-sep { width: 3px; height: 3px; border-radius: 50%; background: ${T.faint}; }
        .pro-progress-track { height: 7px; border-radius: 99px; background: ${T.panel}; border: 1px solid ${T.edge}; overflow: hidden; margin: 14px 0 4px; }
        .pro-progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, ${T.primary}, ${T.cyan}); transition: width 300ms ease; }

        .pro-topics { list-style: none; margin: 26px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .pro-topic { width: 100%; text-align: left; display: flex; gap: 16px; align-items: flex-start; background: ${T.panel}; border: 1px solid ${T.edge}; border-radius: 14px; padding: 16px 18px; cursor: pointer; transition: border-color 150ms ease, background 150ms ease, transform 150ms ease; }
        .pro-topic:hover { border-color: ${T.primary}; background: ${T.bgRaise}; }
        .pro-topic-title { font-family: ${T.display}; font-size: 17px; font-weight: 700; color: ${T.ink}; line-height: 1.3; }
        .pro-topic-sub { font-size: 14px; line-height: 1.5; color: ${T.muted}; margin-top: 4px; max-width: 58ch; }
        .pro-topic-tags { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 10px; }
        .pro-topic-tag { font-family: ${T.mono}; font-size: 10.5px; letter-spacing: 0.04em; color: ${T.muted}; background: ${T.panelSoft}; border: 1px solid ${T.edge}; border-radius: 6px; padding: 3px 8px; }
        .pro-topic-meta { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-family: ${T.mono}; font-size: 11px; color: ${T.faint}; }
        .pro-topic-status { font-family: ${T.mono}; font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 6px; }

        .pro-week-cta { display: inline-flex; align-items: center; gap: 10px; font-family: ${T.display}; font-size: 16px; font-weight: 700; color: #fff; background: linear-gradient(135deg, ${T.primary}, ${T.cyan}); border: none; border-radius: 12px; padding: 15px 28px; cursor: pointer; box-shadow: 0 8px 26px rgba(139,109,255,0.34); transition: transform 160ms ease, box-shadow 160ms ease; }
        .pro-week-cta:hover { transform: translateY(-1px); box-shadow: 0 12px 32px rgba(139,109,255,0.44); }
        .pro-week-done { background: ${T.greenSoft}; border: 1px solid ${T.green}66; border-radius: 14px; padding: 18px 20px; margin-bottom: 22px; }
        @media (prefers-reduced-motion: reduce) { .pro-topic, .pro-week-cta { transition: none; } .pro-week-cta:hover { transform: none; } }
        @media (max-width: 520px) { .pro-week-h1 { font-size: 30px; } }
      `}</style>

      <div className="pro-week-shell">
        <header className="pro-week-head" style={{ justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{week.weekLabel}</span>
          </div>
          <a href="/pro" style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", color: T.muted, textDecoration: "none" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
            All modules
          </a>
        </header>

        <main style={{ marginTop: 34 }}>
          <div className="pro-week-eyebrow"><span className="pro-week-eyebrow-dot" />{week.act}</div>
          <h1 className="pro-week-h1">{week.title}</h1>
          <p className="pro-week-intro">{week.intro}</p>

          <div className="pro-week-meta">
            <span><b>{week.topics.length} topics</b></span>
            <span className="pro-week-sep" />
            <span><b>~{Math.round(totalMins / 60 * 10) / 10} hrs</b> total</span>
            <span className="pro-week-sep" />
            <span><b>{doneCount} / {week.topics.length}</b> done</span>
          </div>
          <div className="pro-progress-track"><div className="pro-progress-fill" style={{ width: `${(doneCount / week.topics.length) * 100}%` }} /></div>

          {restored && allDone && (
            <div className="pro-week-done" style={{ marginTop: 22 }}>
              <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.18em", color: T.green, fontWeight: 700 }}>WEEK COMPLETE</span>
              <div style={{ fontFamily: T.display, fontSize: 20, fontWeight: 700, color: T.ink, marginTop: 6, marginBottom: 10 }}>You finished all {week.topics.length} topics of {week.weekLabel}.</div>
              <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.green, marginBottom: 8 }}>You can now</div>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
                {week.outcomes.map((o, i) => <li key={i} style={{ fontSize: 15, color: T.body, lineHeight: 1.55 }}>{o}</li>)}
              </ul>
              <a href="/pro" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, fontFamily: T.display, fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, borderRadius: 10, padding: "11px 22px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
                Back to all modules
              </a>
            </div>
          )}

          {/* the five topics */}
          <ol className="pro-topics">
            {week.topics.map((t, i) => {
              const st = statusOf(t.id, i);
              return (
                <li key={t.id}>
                  <button className="pro-topic" onClick={() => setActive(i)}>
                    <StatusDot status={st} n={i + 1} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <span className="pro-topic-title">{t.title}</span>
                        <span className="pro-topic-status" style={{
                          color: st === "done" ? T.green : st === "active" ? T.cyan : T.faint,
                          background: st === "done" ? T.greenSoft : st === "active" ? T.cyanSoft : T.panelSoft,
                        }}>{st === "done" ? "Done" : st === "active" ? (startedIds.includes(t.id) ? "Resume" : "Start") : "Up next"}</span>
                      </div>
                      <div className="pro-topic-sub">{t.promise}</div>
                      <div className="pro-topic-meta">
                        <span>~{t.minutes} min</span>
                        <span className="pro-week-sep" />
                        <span>{t.learn.length} ideas</span>
                        <span className="pro-week-sep" />
                        <span>{t.cases.length} real case{t.cases.length === 1 ? "" : "s"}</span>
                        <span className="pro-week-sep" />
                        <span>1 lab</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>

          <div style={{ marginTop: 28, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <button className="pro-week-cta" onClick={() => setActive(resumeIdx)}>
              {allDone ? "Review the week" : doneCount > 0 ? `Continue: topic ${resumeIdx + 1}` : "Start topic 1"}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
            <span style={{ fontSize: 13, color: T.faint, maxWidth: "38ch", lineHeight: 1.45 }}>Work through the topics in order, or jump to any one. Your place is saved as you go.</span>
          </div>
        </main>
      </div>
    </div>
  );
}
