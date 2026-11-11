"use client";

import { useEffect, useState, type ReactNode } from "react";
import { D } from "../tokens";
import type { LearnCard, QuizQuestion, Topic, TryScore } from "./types";
import { Button, Cross, Kicker, StepBar, Tick, card, shuffle } from "./ui";

/* One Desk Ready lesson: intro -> learn (one idea per screen) -> try it in a
 * pretend app -> three quick questions -> done. Dark glass, a stage tracker
 * across the top, one obvious button per screen, and the page returns to
 * the top on every step (in-lesson moves are client state, not routes).
 * Styles that need hovers or animation are in LESSON_CSS; the shell's own
 * classes come from SHELL_CSS on the host page. */

type Phase = "intro" | "learn" | "try" | "check" | "done";

/* The owner's soft gate from Cyber Pro: below this the learner is offered
 * another go, but can always carry on. */
const PASS = 0.8;

const STAGES: { phase: Phase; label: string }[] = [
  { phase: "learn", label: "Learn" },
  { phase: "try", label: "Try it" },
  { phase: "check", label: "Check" },
  { phase: "done", label: "Done" },
];
const ORDER: Phase[] = ["intro", "learn", "try", "check", "done"];

function StageTracker({ phase }: { phase: Phase }) {
  const at = ORDER.indexOf(phase);
  return (
    <ol className="tp-stages" aria-label="Lesson stages">
      {STAGES.map((s, i) => {
        const idx = i + 1;
        const state = at > idx || (phase === "done" && s.phase === "done") ? "done" : at === idx ? "now" : "todo";
        return (
          <li key={s.phase} className={`tp-stage ${state}`} aria-current={state === "now" ? "step" : undefined}>
            <span className="tp-stage-dot" aria-hidden>
              {state === "done" ? <Tick size={11} color={D.ground} /> : idx}
            </span>
            {s.label}
          </li>
        );
      })}
    </ol>
  );
}

function Examples({ c }: { c: LearnCard }) {
  if (!c.good && !c.bad) return null;
  const box = (ok: boolean, label: string, items: NonNullable<LearnCard["good"]>) => (
    <div className={ok ? "tp-ex good" : "tp-ex bad"}>
      <p className="tp-ex-head">
        <span className="tp-ex-icon">{ok ? <Tick size={14} color={D.ground} /> : <Cross size={13} color={D.ground} />}</span>
        {label}
      </p>
      <ul>
        {items.map((e) => (
          <li key={e.text}>
            <span className="tp-ex-text">{e.text}</span>
            {e.note && <span className="tp-ex-note">{e.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="tp-exs">
      {c.good && box(true, "Do this", c.good)}
      {c.bad && box(false, "Not this", c.bad)}
    </div>
  );
}

function Question({ q, n, of, onRight }: { q: QuizQuestion; n: number; of: number; onRight: () => void }) {
  const [order] = useState(() => shuffle(q.options.map((_, i) => i)));
  const [tried, setTried] = useState<number[]>([]);
  const solved = tried.includes(q.answer);
  const last = tried.length ? tried[tried.length - 1] : null;

  function pick(i: number) {
    if (solved || tried.includes(i)) return;
    setTried((t) => [...t, i]);
    if (i === q.answer) onRight();
  }

  return (
    <div>
      <Kicker>
        Question {n} of {of}
      </Kicker>
      <p className="tp-q">{q.q}</p>
      <div className="tp-opts">
        {order.map((i, k) => {
          const was = tried.includes(i);
          const right = was && i === q.answer;
          const wrong = was && i !== q.answer;
          return (
            <button key={i} type="button" onClick={() => pick(i)} disabled={solved || was} className={`tp-opt dr-option${right ? " right" : ""}${wrong ? " wrong" : ""}`}>
              <span className="tp-opt-key" aria-hidden>
                {right ? <Tick size={14} color={D.ground} /> : wrong ? <Cross size={13} color={D.ground} /> : String.fromCharCode(65 + k)}
              </span>
              <span>{q.options[i]}</span>
            </button>
          );
        })}
      </div>
      {last !== null && (
        <div role="status" className={last === q.answer ? "tp-say good" : "tp-say bad"}>
          <b>{last === q.answer ? "Right. " : "Not quite. "}</b>
          {q.reasons[last]}
          {last !== q.answer && " Try another answer."}
        </div>
      )}
    </div>
  );
}

function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`dr-glass ${className}`} style={{ ...card, marginTop: 16 }}>
      {children}
    </div>
  );
}

export default function TopicPlayer({
  topic,
  index,
  total,
  moduleLabel,
  onFinish,
  onBack,
  next,
}: {
  topic: Topic;
  index: number; // 0-based position in the module
  total: number;
  moduleLabel?: string;
  onFinish: () => void; // marks it done; the module decides what is next
  onBack: () => void;
  /* The button on the done screen: the next lesson, or the module page. */
  next: { label: string; go: () => void };
}) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [learnAt, setLearnAt] = useState(0);
  const [tryScore, setTryScore] = useState<TryScore | null>(null);
  const [tryDone, setTryDone] = useState(false);
  const [tryKey, setTryKey] = useState(0);
  const [qAt, setQAt] = useState(0);
  const [qSolved, setQSolved] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [phase, learnAt, qAt, tryKey]);

  const Lab = topic.tryIt.Lab;
  const lowScore = tryScore !== null && tryScore.total > 0 && tryScore.correct / tryScore.total < PASS;

  const top = (
    <div className="tp-top">
      <Button kind="plain" onClick={onBack} style={{ paddingLeft: 0 }}>
        &larr; Back to the module
      </Button>
      <StageTracker phase={phase} />
    </div>
  );

  let body: ReactNode;

  if (phase === "intro") {
    body = (
      <Panel className="tp-intro">
        <span className="tp-ghost" aria-hidden>
          {String(index + 1).padStart(2, "0")}
        </span>
        <Kicker>
          Lesson {index + 1} of {total} · about {topic.minutes} minutes
        </Kicker>
        {moduleLabel && <p className="tp-module">{moduleLabel}</p>}
        <h1 className="tp-h1">{topic.title}</h1>
        <p className="tp-brief">{topic.brief}</p>
        <ol className="tp-plan">
          <li>
            <span className="tp-plan-n">01</span>
            <b>Learn</b>
            <span>{topic.learn.length} short screens</span>
          </li>
          <li>
            <span className="tp-plan-n">02</span>
            <b>Try it</b>
            <span>{topic.tryIt.title}</span>
          </li>
          <li>
            <span className="tp-plan-n">03</span>
            <b>Check</b>
            <span>{topic.check.length} quick questions</span>
          </li>
        </ol>
        <div style={{ marginTop: 26 }}>
          <Button onClick={() => setPhase("learn")}>Start the lesson</Button>
        </div>
      </Panel>
    );
  } else if (phase === "learn") {
    const c = topic.learn[learnAt];
    const lastCard = learnAt + 1 === topic.learn.length;
    body = (
      <>
        <div style={{ marginTop: 18 }}>
          <StepBar at={learnAt + 1} of={topic.learn.length} label="Screen" />
        </div>
        <Panel>
          <h2 className="tp-h2">{c.heading}</h2>
          {c.body.map((p) => (
            <p key={p} className="tp-p">
              {p}
            </p>
          ))}
          {c.figure}
          <Examples c={c} />
          {c.tip && (
            <p className="tp-tip">
              <span className="tp-tip-icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
                  <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z" />
                </svg>
              </span>
              <span>
                <b>Tip: </b>
                {c.tip}
              </span>
            </p>
          )}
        </Panel>
        <div className="tp-actions">
          {learnAt > 0 && (
            <Button kind="secondary" onClick={() => setLearnAt(learnAt - 1)}>
              Back
            </Button>
          )}
          <Button onClick={() => (lastCard ? setPhase("try") : setLearnAt(learnAt + 1))}>{lastCard ? "Now try it" : "Next"}</Button>
        </div>
      </>
    );
  } else if (phase === "try") {
    body = (
      <>
        <Panel>
          <Kicker>Try it yourself</Kicker>
          <h2 className="tp-h2" style={{ marginTop: 8 }}>
            {topic.tryIt.title}
          </h2>
          <p className="tp-p" style={{ marginBottom: 20 }}>
            {topic.tryIt.intro}
          </p>
          <Lab
            key={tryKey}
            onDone={(score) => {
              setTryDone(true);
              setTryScore(score ?? null);
            }}
          />
        </Panel>
        {tryDone && lowScore && tryScore && (
          <div role="status" className="tp-say warn" style={{ marginTop: 16 }}>
            You got {tryScore.correct} of {tryScore.total}. That is fine: this is how you learn. Have another go to lock it in, or carry on if you are happy.
          </div>
        )}
        <div className="tp-actions">
          <Button kind="secondary" onClick={() => setPhase("learn")}>
            Read it again
          </Button>
          {tryDone && lowScore && (
            <Button
              kind="secondary"
              onClick={() => {
                setTryDone(false);
                setTryScore(null);
                setTryKey((k) => k + 1);
              }}
            >
              Have another go
            </Button>
          )}
          <Button onClick={() => setPhase("check")} disabled={!tryDone}>
            {lowScore ? "Carry on anyway" : "On to the questions"}
          </Button>
        </div>
        {!tryDone && <p className="tp-hint">Finish the task above to carry on.</p>}
      </>
    );
  } else if (phase === "check") {
    const lastQ = qAt + 1 === topic.check.length;
    body = (
      <>
        <div style={{ marginTop: 18 }}>
          <StepBar at={qAt + 1} of={topic.check.length} label="Question" />
        </div>
        <Panel>
          <Question key={qAt} q={topic.check[qAt]} n={qAt + 1} of={topic.check.length} onRight={() => setQSolved(true)} />
        </Panel>
        <div className="tp-actions">
          <Button
            disabled={!qSolved}
            onClick={() => {
              if (lastQ) {
                onFinish();
                setPhase("done");
              } else {
                setQAt(qAt + 1);
                setQSolved(false);
              }
            }}
          >
            {lastQ ? "Finish the lesson" : "Next question"}
          </Button>
        </div>
      </>
    );
  } else {
    body = (
      <Panel className="tp-done">
        <span className="tp-burst" aria-hidden>
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(76,195,138,0.18)" strokeWidth="6" />
            <circle className="tp-done-ring" cx="48" cy="48" r="40" fill="none" stroke={D.good} strokeWidth="6" strokeLinecap="round" pathLength="100" transform="rotate(-90 48 48)" />
            <path className="tp-done-tick" d="M31 49 L43 61 L66 36" fill="none" stroke={D.good} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
          </svg>
        </span>
        <Kicker color={D.good} style={{ marginTop: 14 }}>
          Lesson {index + 1} of {total} complete
        </Kicker>
        <h2 className="tp-h1" style={{ marginTop: 10 }}>
          Lesson finished
        </h2>
        <p className="tp-brief" style={{ marginTop: 8 }}>
          {topic.title}
        </p>
        <div className="tp-keep">
          <Kicker color={D.faint}>Remember</Kicker>
          <ul>
            {topic.takeaways.map((t) => (
              <li key={t}>
                <Tick color={D.good} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          <Button onClick={next.go}>{next.label}</Button>
        </div>
      </Panel>
    );
  }

  return (
    <div>
      {top}
      {body}
      <style>{LESSON_CSS}</style>
    </div>
  );
}

const LESSON_CSS = `
  .tp-top { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 18px; }
  .tp-stages { list-style: none; margin: 0; padding: 0; display: flex; align-items: center; gap: 6px; }
  .tp-stage { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px 6px 6px; border-radius: 999px; font-family: ${D.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: ${D.faint}; border: 1px solid ${D.edge}; background: ${D.glass}; }
  .tp-stage-dot { width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; background: rgba(255,255,255,0.08); color: ${D.faint}; }
  .tp-stage.now { color: ${D.ink}; border-color: var(--acc, ${D.accent}); background: color-mix(in srgb, var(--acc, ${D.accent}) 16%, transparent); box-shadow: 0 0 18px -6px var(--acc, ${D.accent}); }
  .tp-stage.now .tp-stage-dot { background: var(--acc, ${D.accent}); color: ${D.ground}; }
  .tp-stage.done { color: ${D.good}; border-color: ${D.goodEdge}; }
  .tp-stage.done .tp-stage-dot { background: ${D.good}; }
  @media (max-width: 640px) { .tp-stage { padding: 5px; } .tp-stage:not(.now) { font-size: 0; gap: 0; } }

  .tp-h1 { margin: 12px 0 0; font-family: ${D.display}; font-weight: 500; font-size: clamp(2rem, 4.6vw, 2.9rem); line-height: 1.06; letter-spacing: -0.03em; color: ${D.ink}; }
  .tp-h2 { margin: 0; font-family: ${D.display}; font-weight: 500; font-size: clamp(1.6rem, 3.6vw, 2.2rem); line-height: 1.12; letter-spacing: -0.025em; color: ${D.ink}; }
  .tp-module { margin: 10px 0 0; font-size: 15px; color: ${D.faint}; }
  .tp-brief { margin: 16px 0 0; max-width: 640px; font-size: 19px; line-height: 1.6; color: ${D.muted}; }
  .tp-p { margin: 16px 0 0; max-width: 700px; font-size: 19px; line-height: 1.65; color: ${D.body}; }
  .tp-ghost { position: absolute; right: 18px; top: -18px; z-index: -1; font-family: ${D.display}; font-size: 170px; font-weight: 700; letter-spacing: -0.05em; line-height: 1; color: var(--acc, ${D.accent}); opacity: 0.07; pointer-events: none; }
  .tp-plan { list-style: none; margin: 26px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr)); gap: 12px; }
  .tp-plan li { display: flex; flex-direction: column; gap: 4px; padding: 16px 16px 17px; border-radius: 16px; background: ${D.glass}; border: 1px solid ${D.edge}; }
  .tp-plan-n { font-family: ${D.mono}; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; color: var(--acc, ${D.accent}); }
  .tp-plan b { font-family: ${D.display}; font-size: 18px; font-weight: 600; color: ${D.ink}; }
  .tp-plan li > span:last-child { font-size: 15.5px; line-height: 1.45; color: ${D.muted}; }

  .tp-exs { margin-top: 22px; display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(min(100%, 290px), 1fr)); }
  .tp-ex { border-radius: 16px; padding: 16px 16px 17px; }
  .tp-ex.good { background: ${D.goodSoft}; border: 1px solid ${D.goodEdge}; box-shadow: 0 0 30px -18px ${D.good}; }
  .tp-ex.bad { background: ${D.badSoft}; border: 1px solid ${D.badEdge}; box-shadow: 0 0 30px -18px ${D.bad}; }
  .tp-ex-head { margin: 0; display: flex; align-items: center; gap: 9px; font-family: ${D.mono}; font-size: 12px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; }
  .tp-ex.good .tp-ex-head { color: ${D.good}; }
  .tp-ex.bad .tp-ex-head { color: ${D.bad}; }
  .tp-ex-icon { width: 22px; height: 22px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; }
  .tp-ex.good .tp-ex-icon { background: ${D.good}; }
  .tp-ex.bad .tp-ex-icon { background: ${D.bad}; }
  .tp-ex ul { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 10px; }
  .tp-ex-text { display: block; white-space: pre-wrap; padding: 10px 13px; border-radius: 11px; background: rgba(0,0,0,0.28); border: 1px solid rgba(255,255,255,0.08); font-size: 17px; line-height: 1.5; color: ${D.ink}; }
  .tp-ex-note { display: block; margin-top: 6px; font-size: 15px; line-height: 1.45; color: ${D.muted}; }
  .tp-tip { margin: 22px 0 0; display: flex; gap: 12px; align-items: flex-start; padding: 14px 16px; border-radius: 14px; background: ${D.accentSoft}; border: 1px solid ${D.accentEdge}; font-size: 17px; line-height: 1.55; color: ${D.body}; }
  .tp-tip b { color: ${D.accent}; }
  .tp-tip-icon { flex-shrink: 0; width: 30px; height: 30px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; color: ${D.accent}; background: rgba(127,178,255,0.14); }

  .tp-actions { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 10px; }
  .tp-hint { margin: 10px 0 0; font-size: 15.5px; color: ${D.faint}; }
  .tp-say { margin-top: 16px; padding: 14px 16px; border-radius: 14px; font-size: 17px; line-height: 1.55; color: ${D.body}; }
  .tp-say.good { background: ${D.goodSoft}; border: 1px solid ${D.goodEdge}; }
  .tp-say.good b { color: ${D.good}; }
  .tp-say.bad { background: ${D.badSoft}; border: 1px solid ${D.badEdge}; }
  .tp-say.bad b { color: ${D.bad}; }
  .tp-say.warn { background: ${D.warnSoft}; border: 1px solid ${D.warnEdge}; }

  .tp-q { margin: 12px 0 0; font-family: ${D.display}; font-size: clamp(1.3rem, 2.8vw, 1.6rem); line-height: 1.3; font-weight: 500; letter-spacing: -0.01em; color: ${D.ink}; }
  .tp-opts { margin-top: 18px; display: grid; gap: 10px; }
  .tp-opt { text-align: left; min-height: 56px; padding: 12px 16px; border-radius: 14px; display: flex; gap: 14px; align-items: center; font-family: ${D.sans}; font-size: 17.5px; line-height: 1.45; color: ${D.ink}; background: ${D.glass}; border: 1px solid ${D.edge}; cursor: pointer; }
  .tp-opt:disabled { cursor: default; }
  .tp-opt-key { flex-shrink: 0; width: 30px; height: 30px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; font-family: ${D.mono}; font-size: 13px; font-weight: 800; color: ${D.accent}; background: ${D.accentSoft}; border: 1px solid ${D.accentEdge}; }
  .tp-opt.right { background: ${D.goodSoft} !important; border-color: ${D.good} !important; box-shadow: 0 0 24px -12px ${D.good}; }
  .tp-opt.right .tp-opt-key { background: ${D.good}; border-color: ${D.good}; }
  .tp-opt.wrong { background: ${D.badSoft} !important; border-color: ${D.bad} !important; opacity: 0.85; }
  .tp-opt.wrong .tp-opt-key { background: ${D.bad}; border-color: ${D.bad}; }

  .tp-done { text-align: center; padding-top: 36px !important; padding-bottom: 32px !important; background: radial-gradient(60% 50% at 50% 0%, rgba(76,195,138,0.18), transparent 70%), ${D.card} !important; }
  .tp-burst { display: inline-block; filter: drop-shadow(0 0 18px rgba(76,195,138,0.55)); }
  .tp-burst svg { display: block; }
  .tp-done-ring { stroke-dasharray: 100; stroke-dashoffset: 0; }
  .tp-done-tick { stroke-dasharray: 100; stroke-dashoffset: 0; }
  @media (prefers-reduced-motion: no-preference) {
    .tp-done-ring { animation: tp-draw 0.9s cubic-bezier(.16,1,.3,1) both; }
    .tp-done-tick { animation: tp-draw 0.5s 0.7s cubic-bezier(.16,1,.3,1) both; }
  }
  @keyframes tp-draw { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
  .tp-done .tp-brief { margin-left: auto; margin-right: auto; }
  .tp-keep { text-align: left; max-width: 580px; margin: 26px auto 0; padding: 18px 20px; border-radius: 16px; background: ${D.glass}; border: 1px solid ${D.edge}; }
  .tp-keep ul { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 11px; }
  .tp-keep li { display: flex; gap: 10px; align-items: flex-start; font-size: 17.5px; line-height: 1.5; color: ${D.body}; }
`;
