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
 * Warm, spacious, adult-beginner tone. Resume via localStorage. */

const PHASES: { key: LessonPhase; label: string }[] = [
  { key: "learn", label: "LEARN" },
  { key: "see", label: "SEE" },
  { key: "try", label: "TRY" },
  { key: "check", label: "CHECK" },
];

function Progress({ phase }: { phase: LessonPhase }) {
  const order = PHASES.map((p) => p.key);
  const active = order.indexOf(phase as (typeof order)[number]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      {PHASES.map((p, i) => (
        <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", color: i === active ? T.cyan : i < active ? T.green : T.faint }}>
            {p.label}
          </span>
          {i < PHASES.length - 1 && <span aria-hidden style={{ width: 20, height: 1, background: i < active ? T.green : T.edge }} />}
        </div>
      ))}
    </div>
  );
}

/* --- simple inline diagrams (SVG, theme-driven) --- */
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

  const quizDone = useMemo(() => quizAnswers.every((a) => a !== null), [quizAnswers]);

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
    <div style={{ minHeight: "100vh", background: T.bg, color: T.body, fontFamily: T.sans }}>
      <style>{`
        .pro-learn :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .pro-learn ::selection { background: ${T.primary}; color: #fff; }
        .pro-learn textarea::placeholder { color: ${T.faint}; }
        .pro-learn p { margin: 0 0 14px; }
        .pro-learn .quiz-opt:not([disabled]):hover { border-color: ${T.primary}; background: ${T.primarySoft}; }
      `}</style>

      <div className="pro-learn" style={{ maxWidth: 760, margin: "0 auto", padding: "20px 24px 80px" }}>
        {/* header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "6px 0 18px", borderBottom: `1px solid ${T.edge}`, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>{lesson.weekLabel}</span>
          </div>
          {phase !== "intro" && phase !== "done" && <Progress phase={phase} />}
        </header>

        {/* INTRO */}
        {phase === "intro" && (
          <main style={{ marginTop: "7vh" }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: T.primary, marginBottom: 14 }}>{lesson.act}</div>
            <h1 style={{ fontFamily: T.display, fontSize: 34, fontWeight: 700, lineHeight: 1.2, margin: "0 0 16px", color: T.ink }}>{lesson.title}</h1>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: T.body, maxWidth: "60ch" }}>{lesson.promise}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, margin: "22px 0 30px", fontSize: 13.5, color: T.muted }}>
              <span><b style={{ color: T.ink }}>~{lesson.minutes} min</b> this session</span>
              <span style={{ maxWidth: "46ch" }}><b style={{ color: T.ink }}>Where it leads:</b> {lesson.role}</span>
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
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint, marginBottom: 10 }}>Idea {learnIdx + 1} of {lesson.learn.length}</div>
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
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                    <span style={{ fontFamily: T.display, fontSize: 19, fontWeight: 700, color: T.ink }}>{c.org}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 12, color: T.faint }}>{c.year}</span>
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 700, color: T.cyan, marginBottom: 12 }}>{c.headline}</div>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: T.body }}>{c.whatHappened}</p>
                  <div style={{ background: T.redSoft, borderRadius: 8, padding: "10px 14px", margin: "6px 0 12px" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.red, marginBottom: 4 }}>THE MISSED MEASURE</div>
                    <div style={{ fontSize: 14.5, color: T.ink, lineHeight: 1.55 }}>{c.theMissedMeasure}</div>
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: T.body }}><b style={{ color: T.ink }}>What it cost:</b> {c.theCost}</p>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
              <div style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "20px 22px" }}>
                <Lab onDidTry={onDidTry} />
              </div>
              <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 7 }}>
                {lesson.lab.prompts.map((p, i) => <li key={i} style={{ fontSize: 14.5, color: T.body, lineHeight: 1.55 }}>{p}</li>)}
              </ul>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 26, alignItems: "center" }}>
              {btn("I've had a go", () => setPhase("check"), { disabled: !didTry })}
              {!didTry && <span style={{ fontSize: 13, color: T.faint }}>type a password above to continue</span>}
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
                        else if (answered) { fg = T.muted; } // unpicked options dim once answered
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
              {!quizDone && <span style={{ fontSize: 13, color: T.faint }}>answer the checks to finish</span>}
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

            <div style={{ marginTop: 26 }}>
              {btn("Review the lesson", () => { setPhase("intro"); setLearnIdx(0); }, { ghost: true })}
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
