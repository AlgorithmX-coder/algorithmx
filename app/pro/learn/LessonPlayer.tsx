"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { T } from "./tokens";
import {
  FIVE_CONTROLS,
  lessonCheckpointKey,
  type CaseCard,
  type LearnCard,
  type LessonCheckpoint,
  type LessonManifest,
  type LessonPhase,
} from "./types";

/* The engine that runs one lesson through Learn -> See -> Try -> Check.
 * Structure only; every word of content comes from the manifest.
 * Warm, spacious, adult-beginner tone. Resume via localStorage.
 *
 * A persistent outline rail (desktop) shows the four stages and the
 * learner's place, so it reads as a course, not a slideshow. */

const STAGES: { key: Exclude<LessonPhase, "intro" | "done">; label: string; sub: string }[] = [
  { key: "learn", label: "Learn", sub: "the idea" },
  { key: "see", label: "See", sub: "a real case" },
  { key: "try", label: "Try", sub: "hands on" },
  { key: "check", label: "Check", sub: "prove it" },
];
const STAGE_ORDER = STAGES.map((s) => s.key);

/* --- the outline rail --- */
function TickDot({ state }: { state: "done" | "current" | "upcoming" }) {
  if (state === "done") {
    return (
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.greenSoft, border: `1px solid ${T.green}`, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3.5" aria-hidden><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    );
  }
  if (state === "current") {
    return <span style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${T.cyan}`, background: T.cyanSoft, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.cyan }} /></span>;
  }
  return <span style={{ width: 20, height: 20, borderRadius: "50%", border: `1.5px solid ${T.edge}`, flexShrink: 0 }} />;
}

function Rail({ phase, learnIdx, learnCount, onGo }: { phase: LessonPhase; learnIdx: number; learnCount: number; onGo: (p: LessonPhase) => void }) {
  const idx = STAGE_ORDER.indexOf(phase as (typeof STAGE_ORDER)[number]);
  return (
    <div style={{ position: "sticky", top: 22 }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: T.faint, marginBottom: 16 }}>Your progress</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {STAGES.map((s, i) => {
          const state: "done" | "current" | "upcoming" = i < idx ? "done" : i === idx ? "current" : "upcoming";
          const reached = i <= idx;
          return (
            <div key={s.key}>
              <button onClick={() => reached && onGo(s.key)} disabled={!reached}
                style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", textAlign: "left", background: "transparent", border: "none", padding: "7px 0", cursor: reached ? "pointer" : "default" }}>
                <TickDot state={state} />
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontFamily: T.display, fontSize: 14.5, fontWeight: 700, color: state === "upcoming" ? T.faint : T.ink }}>{s.label}</span>
                  <span style={{ fontSize: 11.5, color: state === "current" ? T.cyan : T.faint }}>{s.sub}</span>
                </span>
              </button>
              {/* sub-steps for the multi-part Learn stage */}
              {s.key === "learn" && i === idx && learnCount > 1 && (
                <div style={{ marginLeft: 9, paddingLeft: 15, borderLeft: `1px solid ${T.edge}`, display: "flex", flexDirection: "column", gap: 5, padding: "4px 0 8px 15px" }}>
                  {Array.from({ length: learnCount }, (_, k) => (
                    <span key={k} style={{ fontSize: 12, fontFamily: T.mono, color: k === learnIdx ? T.cyan : k < learnIdx ? T.muted : T.faint }}>
                      {k < learnIdx ? "✓ " : k === learnIdx ? "→ " : "• "}Idea {k + 1}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- inline diagrams (SVG, theme-driven) --- */
function Diagram({ kind }: { kind: NonNullable<LearnCard["diagram"]> }) {
  if (kind === "hash-oneway") {
    return (
      <svg viewBox="0 0 420 96" role="img" aria-label="A password goes one way through a hash into a fingerprint; the reverse is blocked" style={{ width: "100%", maxWidth: 420, height: "auto" }}>
        <rect x="4" y="30" width="120" height="36" rx="8" fill={T.primarySoft} stroke={T.primary} />
        <text x="64" y="53" fill={T.ink} fontFamily="monospace" fontSize="13" textAnchor="middle">hunter2</text>
        <rect x="164" y="24" width="92" height="48" rx="8" fill={T.panel} stroke={T.edge} />
        <text x="210" y="46" fill={T.muted} fontFamily="monospace" fontSize="10" textAnchor="middle">hash()</text>
        <text x="210" y="60" fill={T.faint} fontFamily="monospace" fontSize="9" textAnchor="middle">one way</text>
        <rect x="296" y="30" width="120" height="36" rx="8" fill={T.cyanSoft} stroke={T.cyan} />
        <text x="356" y="53" fill={T.ink} fontFamily="monospace" fontSize="12" textAnchor="middle">f52e9a...</text>
        <path d="M124 48 H164" stroke={T.green} strokeWidth="2" markerEnd="url(#ar)" />
        <path d="M296 48 H256" stroke={T.red} strokeWidth="2" strokeDasharray="4 4" />
        <line x1="270" y1="40" x2="282" y2="56" stroke={T.red} strokeWidth="2" />
        <defs>
          <marker id="ar" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0 0 L6 3 L0 6 Z" fill={T.green} />
          </marker>
        </defs>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 420 96" role="img" aria-label="Changing one letter of the input changes the entire fingerprint" style={{ width: "100%", maxWidth: 420, height: "auto" }}>
      <text x="10" y="30" fill={T.body} fontFamily="monospace" fontSize="12">hunter2  {"->"}  f52e9a1c...</text>
      <text x="10" y="66" fill={T.body} fontFamily="monospace" fontSize="12">hunter3  {"->"}  </text>
      <text x="150" y="66" fill={T.cyan} fontFamily="monospace" fontSize="12" fontWeight="700">9b0c74ef...</text>
      <text x="10" y="88" fill={T.faint} fontFamily="monospace" fontSize="10">one character changed, the whole fingerprint changed</text>
    </svg>
  );
}

function ControlTag({ control }: { control: CaseCard["control"] }) {
  return (
    <span style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", color: T.amber, background: T.amberSoft, border: `1px solid ${T.amber}55`, borderRadius: 5, padding: "3px 8px" }}>
      Cyber Essentials: {FIVE_CONTROLS[control]}
    </span>
  );
}

/* A clean company identity mark (monogram in the brand colour). Scales
 * to any company incl. those with no usable logo; real brand SVGs can
 * be swapped in per case later. */
function CaseLogo({ org, color, size = 40 }: { org: string; color?: string; size?: number }) {
  const initial = (org.replace(/[^A-Za-z0-9]/g, "")[0] ?? "?").toUpperCase();
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: size * 0.24, background: color ?? T.primary, color: "#fff", fontFamily: T.display, fontWeight: 700, fontSize: size * 0.44, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}>
      {initial}
    </span>
  );
}

/* A sourced press-coverage card: the real headline, outlet and date,
 * with a link to the original. Never a copyrighted article screenshot. */
function NewsCard({ news }: { news: NonNullable<CaseCard["news"]> }) {
  const inner = (
    <>
      <div style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint, marginBottom: 6 }}>In the news</div>
      <div style={{ fontSize: 14.5, fontWeight: 700, color: T.ink, lineHeight: 1.4 }}>&ldquo;{news.headline}&rdquo;</div>
      <div style={{ fontSize: 12, color: T.muted, marginTop: 5 }}>{news.outlet} &middot; {news.date}{news.url ? " ›" : ""}</div>
    </>
  );
  const style: React.CSSProperties = { display: "block", background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 9, padding: "12px 15px", textDecoration: "none" };
  return news.url
    ? <a href={news.url} target="_blank" rel="noopener noreferrer" style={style}>{inner}</a>
    : <div style={style}>{inner}</div>;
}

export default function LessonPlayer({ lesson }: { lesson: LessonManifest }) {
  const [phase, setPhase] = useState<LessonPhase>("intro");
  const [learnIdx, setLearnIdx] = useState(0);
  const [didTry, setDidTry] = useState(false);
  const [explainDraft, setExplainDraft] = useState("");
  const [explainRevealed, setExplainRevealed] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<(number | null)[]>(() => lesson.check.quiz.map(() => null));
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(lessonCheckpointKey(lesson.id));
      if (raw) {
        const cp = JSON.parse(raw) as LessonCheckpoint;
        if (cp.id === lesson.id) {
          setPhase(cp.phase);
          setDidTry(cp.didTry);
          setExplainDraft(cp.explainDraft ?? "");
          if (Array.isArray(cp.quizAnswers) && cp.quizAnswers.length === lesson.check.quiz.length) {
            setQuizAnswers(cp.quizAnswers);
          }
        }
      }
    } catch {
      /* corrupt checkpoint: start fresh */
    }
    setRestored(true);
  }, [lesson.id, lesson.check.quiz.length]);

  useEffect(() => {
    if (!restored) return;
    const cp: LessonCheckpoint = { id: lesson.id, phase, didTry, explainDraft, quizAnswers };
    try { localStorage.setItem(lessonCheckpointKey(lesson.id), JSON.stringify(cp)); } catch { /* ignore */ }
  }, [restored, lesson.id, phase, didTry, explainDraft, quizAnswers]);

  const onDidTry = useCallback(() => setDidTry(true), []);
  const Lab = lesson.lab.component;
  const heroCase = lesson.cases[0];

  const quizDone = useMemo(() => quizAnswers.every((a) => a !== null), [quizAnswers]);
  const inLesson = phase !== "intro" && phase !== "done";

  const btn = (label: string, onClick: () => void, opts?: { disabled?: boolean; ghost?: boolean }) => (
    <button onClick={onClick} disabled={opts?.disabled}
      style={{
        fontFamily: T.display, fontSize: 14, fontWeight: 700, letterSpacing: "0.03em",
        padding: "12px 24px", borderRadius: 10, cursor: opts?.disabled ? "not-allowed" : "pointer",
        color: opts?.ghost ? T.muted : "#fff",
        background: opts?.ghost ? "transparent" : `linear-gradient(135deg, ${T.primary}, ${T.cyan})`,
        border: opts?.ghost ? `1px solid ${T.edge}` : "none",
        opacity: opts?.disabled ? 0.5 : 1,
      }}>
      {label}
    </button>
  );

  return (
    <div className="pro-learn" style={{ minHeight: "100vh", background: T.bg, color: T.body, fontFamily: T.sans }}>
      <style>{`
        .pro-learn :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .pro-learn ::selection { background: ${T.primary}; color: #fff; }
        .pro-learn textarea::placeholder, .pro-learn input::placeholder { color: ${T.muted}; }
        .pro-learn p { margin: 0 0 14px; }
        .pro-learn .quiz-opt:not([disabled]):hover { border-color: ${T.primary}; background: ${T.primarySoft}; }
        .pro-shell { display: flex; justify-content: center; gap: 34px; max-width: 760px; margin: 0 auto; padding: 20px 24px 90px; }
        .pro-shell.with-rail { max-width: 1000px; }
        .pro-rail { display: none; }
        .pro-main { flex: 1 1 auto; min-width: 0; max-width: 720px; }
        .pro-topbar { display: flex; align-items: center; gap: 8px; }
        @media (min-width: 940px) {
          .pro-rail { display: block; width: 208px; flex-shrink: 0; }
          .pro-topbar { display: none; }
        }
      `}</style>

      <div className={`pro-shell${inLesson ? " with-rail" : ""}`}>
        {inLesson && (
          <aside className="pro-rail">
            <Rail phase={phase} learnIdx={learnIdx} learnCount={lesson.learn.length} onGo={(p) => setPhase(p)} />
          </aside>
        )}

        <div className="pro-main">
          {/* header */}
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "6px 0 18px", borderBottom: `1px solid ${T.edge}`, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
              <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>{lesson.weekLabel}</span>
            </div>
            {inLesson && (
              <div className="pro-topbar">
                {STAGES.map((s, i) => {
                  const idx = STAGE_ORDER.indexOf(phase as (typeof STAGE_ORDER)[number]);
                  return (
                    <span key={s.key} style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.1em", color: i === idx ? T.cyan : i < idx ? T.green : T.faint }}>
                      {s.label.toUpperCase()}{i < STAGES.length - 1 ? " ·" : ""}
                    </span>
                  );
                })}
              </div>
            )}
          </header>

          {/* INTRO */}
          {phase === "intro" && (
            <main style={{ marginTop: "5vh" }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.primary, marginBottom: 14 }}>{lesson.act}</div>
              <h1 style={{ fontFamily: T.display, fontSize: 34, fontWeight: 700, lineHeight: 1.2, margin: "0 0 16px", color: T.ink }}>{lesson.title}</h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: T.body, maxWidth: "60ch" }}>{lesson.promise}</p>

              {/* the hook: a real company teased up front, with its logo and press coverage */}
              {heroCase && (
                <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderLeft: `3px solid ${T.red}`, borderRadius: "0 12px 12px 0", padding: "16px 20px", margin: "24px 0", maxWidth: "62ch" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.red, marginBottom: 12 }}>This week&apos;s true story</div>
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <CaseLogo org={heroCase.org} color={heroCase.brandColor} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: T.ink, lineHeight: 1.4 }}>{heroCase.org} <span style={{ color: T.muted, fontWeight: 400, fontFamily: T.mono, fontSize: 13 }}>{heroCase.year}</span></div>
                      <div style={{ fontSize: 14.5, color: T.body, marginTop: 4, lineHeight: 1.5 }}>{heroCase.headline}. You will see exactly how, and how one measure would have stopped it.</div>
                    </div>
                  </div>
                  {heroCase.news && <div style={{ marginTop: 14 }}><NewsCard news={heroCase.news} /></div>}
                </div>
              )}

              {/* how this works: the four steps, so they know the shape */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "8px 0 26px", maxWidth: "62ch" }}>
                {STAGES.map((s, i) => (
                  <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, background: T.panelSoft, border: `1px solid ${T.edge}`, borderRadius: 9, padding: "8px 13px" }}>
                    <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.primary }}>{i + 1}</span>
                    <span style={{ fontFamily: T.display, fontSize: 13.5, fontWeight: 700, color: T.ink }}>{s.label}</span>
                    <span style={{ fontSize: 12, color: T.muted }}>{s.sub}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 20, margin: "0 0 30px", fontSize: 13.5, color: T.muted }}>
                <span><b style={{ color: T.ink }}>~{lesson.minutes} min</b> this session</span>
                <span style={{ maxWidth: "48ch" }}><b style={{ color: T.ink }}>Why it matters:</b> {lesson.role}</span>
              </div>
              {btn("Start the lesson", () => setPhase("learn"))}
            </main>
          )}

          {/* LEARN */}
          {phase === "learn" && (() => {
            const card = lesson.learn[learnIdx];
            const last = learnIdx === lesson.learn.length - 1;
            return (
              <main style={{ marginTop: 26 }}>
                <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, marginBottom: 10 }}>Idea {learnIdx + 1} of {lesson.learn.length}</div>
                <h2 style={{ fontFamily: T.display, fontSize: 25, fontWeight: 700, lineHeight: 1.25, margin: "0 0 16px", color: T.ink }}>{card.heading}</h2>
                {card.body.map((p, i) => <p key={i} style={{ fontSize: 16.5, lineHeight: 1.75, color: T.body, maxWidth: "62ch" }}>{p}</p>)}
                {card.analogy && (
                  <div style={{ background: T.primarySoft, borderLeft: `3px solid ${T.primary}`, borderRadius: "0 10px 10px 0", padding: "14px 18px", margin: "18px 0", maxWidth: "62ch" }}>
                    <div style={{ fontSize: 16, color: T.ink, lineHeight: 1.6 }}>{card.analogy.plain}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 11.5, letterSpacing: "0.1em", textTransform: "uppercase", color: T.primary, marginTop: 8 }}>the real term: {card.analogy.realTerm}</div>
                  </div>
                )}
                {card.diagram && (
                  <div style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "18px 20px", margin: "18px 0", maxWidth: "62ch" }}>
                    <Diagram kind={card.diagram} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
                  {learnIdx > 0 && btn("Back", () => setLearnIdx((i) => i - 1), { ghost: true })}
                  {last ? btn("See it happen for real", () => setPhase("see")) : btn("Next idea", () => setLearnIdx((i) => i + 1))}
                </div>
              </main>
            );
          })()}

          {/* SEE */}
          {phase === "see" && (
            <main style={{ marginTop: 26 }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.cyan, marginBottom: 8 }}>Real cases, real record</div>
              <h2 style={{ fontFamily: T.display, fontSize: 25, fontWeight: 700, margin: "0 0 8px", color: T.ink }}>{lesson.seeHeading ?? "The real record"}</h2>
              <p style={{ fontSize: 15, color: T.muted, maxWidth: "60ch", marginBottom: 22 }}>Everything below is the documented public record. As you read, ask the question we will ask of every breach in this course: which basic measure would have stopped it?</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {lesson.cases.map((c, i) => (
                  <article key={i} style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "20px 22px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <CaseLogo org={c.org} color={c.brandColor} size={34} />
                      <div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                          <span style={{ fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink }}>{c.org}</span>
                          <span style={{ fontFamily: T.mono, fontSize: 12, color: T.muted }}>{c.year}</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.cyan, marginTop: 1 }}>{c.headline}</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.65, color: T.body }}>{c.whatHappened}</p>
                    <div style={{ background: T.redSoft, borderRadius: 8, padding: "10px 14px", margin: "6px 0 12px" }}>
                      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.red, marginBottom: 4 }}>THE MISSED MEASURE</div>
                      <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.55 }}>{c.theMissedMeasure}</div>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.65, color: T.body }}><b style={{ color: T.ink }}>What it cost:</b> {c.theCost}</p>
                    {c.news && <div style={{ marginTop: 12 }}><NewsCard news={c.news} /></div>}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                      <ControlTag control={c.control} />
                      <span style={{ fontSize: 11, color: T.faint, fontStyle: "italic" }}>{c.source}</span>
                    </div>
                  </article>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 26 }}>
                {btn("Back", () => setPhase("learn"), { ghost: true })}
                {btn("Now try it yourself", () => setPhase("try"))}
              </div>
            </main>
          )}

          {/* TRY */}
          {phase === "try" && (
            <main style={{ marginTop: 26 }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.green, marginBottom: 8 }}>Your turn, hands on</div>
              <h2 style={{ fontFamily: T.display, fontSize: 25, fontWeight: 700, margin: "0 0 8px", color: T.ink }}>{lesson.lab.title}</h2>
              <p style={{ fontSize: 15, color: T.muted, maxWidth: "60ch", marginBottom: 18 }}>{lesson.lab.intro ?? "This runs entirely in your own browser. Nothing you do here is sent anywhere."}</p>

              {/* prominent, numbered instructions — written for a total beginner */}
              <div style={{ background: T.panel, border: `1px solid ${T.cyan}44`, borderRadius: 12, padding: "16px 20px", marginBottom: 18 }}>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: T.cyan, marginBottom: 12 }}>Follow these steps</div>
                <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                  {lesson.lab.prompts.map((p, i) => (
                    <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", background: T.cyanSoft, border: `1px solid ${T.cyan}66`, color: T.cyan, fontFamily: T.mono, fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                      <span style={{ fontSize: 15, color: T.body, lineHeight: 1.55, paddingTop: 1 }}>{p}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "20px 22px" }}>
                <Lab onDidTry={onDidTry} />
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 26, alignItems: "center" }}>
                {btn("I've had a go", () => setPhase("check"), { disabled: !didTry })}
                {!didTry && <span style={{ fontSize: 13, color: T.muted }}>have a go above to continue</span>}
              </div>
            </main>
          )}

          {/* CHECK */}
          {phase === "check" && (
            <main style={{ marginTop: 26 }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.primary, marginBottom: 8 }}>Make it stick</div>
              <h2 style={{ fontFamily: T.display, fontSize: 25, fontWeight: 700, margin: "0 0 18px", color: T.ink }}>Explain it back</h2>
              <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "18px 20px", marginBottom: 24 }}>
                <p style={{ fontSize: 15.5, color: T.body, lineHeight: 1.6 }}>{lesson.check.explain.prompt}</p>
                <textarea value={explainDraft} onChange={(e) => setExplainDraft(e.target.value)} rows={4} placeholder="In your own words..."
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical", background: T.bgRaise, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 8, fontFamily: T.sans, fontSize: 15, lineHeight: 1.6, padding: "11px 13px" }} />
                {!explainRevealed ? (
                  <button onClick={() => setExplainRevealed(true)} disabled={explainDraft.trim().length < 10}
                    style={{ marginTop: 10, fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: explainDraft.trim().length < 10 ? T.faint : T.cyan, background: "transparent", border: `1px solid ${explainDraft.trim().length < 10 ? T.edge : T.cyan}66`, borderRadius: 7, padding: "8px 14px", cursor: explainDraft.trim().length < 10 ? "not-allowed" : "pointer" }}>
                    {explainDraft.trim().length < 10 ? "write a little first" : "REVEAL A MODEL ANSWER"}
                  </button>
                ) : (
                  <div style={{ marginTop: 12, background: T.greenSoft, border: `1px solid ${T.green}55`, borderRadius: 8, padding: "12px 15px" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.green, marginBottom: 6 }}>A STRONG ANSWER LOOKS LIKE</div>
                    <div style={{ fontSize: 14.5, color: T.body, lineHeight: 1.6 }}>{lesson.check.explain.modelAnswer}</div>
                  </div>
                )}
              </div>

              <h3 style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, margin: "0 0 14px", color: T.ink }}>Quick checks</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {lesson.check.quiz.map((que, qi) => {
                  const chosen = quizAnswers[qi];
                  return (
                    <div key={qi} style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "16px 18px" }}>
                      <div style={{ fontSize: 15.5, fontWeight: 700, color: T.ink, marginBottom: 12 }}>{que.q}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {que.options.map((opt, oi) => {
                          const answered = chosen !== null;
                          const isChosen = chosen === oi;
                          const isCorrect = oi === que.answer;
                          let border: string = T.edgeSoft, bg: string = T.panelSoft, fg: string = T.ink;
                          if (answered && isCorrect) { border = T.green; bg = T.greenSoft; fg = T.ink; }
                          else if (answered && isChosen && !isCorrect) { border = T.red; bg = T.redSoft; fg = T.ink; }
                          else if (answered) { fg = T.muted; }
                          return (
                            <button key={oi} className="quiz-opt" onClick={() => { if (chosen === null) setQuizAnswers((a) => a.map((v, i) => i === qi ? oi : v)); }}
                              disabled={answered}
                              style={{ textAlign: "left", fontFamily: T.sans, fontSize: 15, fontWeight: 600, lineHeight: 1.45, color: fg, background: bg, border: `1px solid ${border}`, borderRadius: 9, padding: "12px 15px", cursor: answered ? "default" : "pointer" }}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {chosen !== null && (
                        <div style={{ fontSize: 13.5, color: T.muted, marginTop: 10, lineHeight: 1.55 }}>{que.why}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 26, alignItems: "center" }}>
                {btn("Finish the lesson", () => setPhase("done"), { disabled: !quizDone })}
                {!quizDone && <span style={{ fontSize: 13, color: T.muted }}>answer the checks to finish</span>}
              </div>
            </main>
          )}

          {/* DONE */}
          {phase === "done" && (
            <main style={{ marginTop: 34 }}>
              <div style={{ background: T.greenSoft, border: `1px solid ${T.green}66`, borderRadius: 12, padding: "16px 20px", marginBottom: 22 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.18em", color: T.green, fontWeight: 600 }}>LESSON COMPLETE</span>
                <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 700, color: T.ink, marginTop: 6 }}>{lesson.wrap.headline ?? "Lesson complete. Well done."}</div>
              </div>

              <h3 style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, margin: "0 0 12px", color: T.ink }}>What you learned</h3>
              <ul style={{ margin: "0 0 24px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                {lesson.wrap.takeaways.map((t, i) => <li key={i} style={{ fontSize: 15.5, color: T.body, lineHeight: 1.6 }}>{t}</li>)}
              </ul>

              <div style={{ background: T.panel, border: `1px solid ${T.primary}44`, borderRadius: 12, padding: "18px 20px", marginBottom: 18 }}>
                <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.primary, marginBottom: 8 }}>Your first real project</div>
                <div style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: T.ink, marginBottom: 8 }}>{lesson.wrap.project.name}</div>
                <p style={{ fontSize: 15, color: T.body, lineHeight: 1.65 }}>{lesson.wrap.project.blurb}</p>
              </div>

              {lesson.wrap.ethicsNote && (
                <div style={{ background: T.amberSoft, border: `1px solid ${T.amber}55`, borderRadius: 12, padding: "16px 20px" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: T.amber, marginBottom: 8 }}>Ground rule, from day one</div>
                  <p style={{ fontSize: 14.5, color: T.body, lineHeight: 1.65 }}>{lesson.wrap.ethicsNote}</p>
                </div>
              )}

              <div style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/pro" style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, letterSpacing: "0.03em", padding: "12px 24px", borderRadius: 10, color: "#fff", textDecoration: "none", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})` }}>Back to the course</a>
                {btn("Review the lesson", () => { setPhase("intro"); setLearnIdx(0); }, { ghost: true })}
              </div>
            </main>
          )}
        </div>
      </div>
    </div>
  );
}
