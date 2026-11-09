"use client";

import { useEffect, useState } from "react";
import { D } from "../tokens";
import type { LearnCard, QuizQuestion, Topic, TryScore } from "./types";
import { Button, Cross, StepBar, Tick, card, shuffle } from "./ui";

/* One Desk Ready lesson: intro -> learn (one card per screen) -> try it ->
 * three quick questions -> done. Large type, one obvious button per
 * screen, and the page returns to the top on every step (in-lesson moves
 * are client state, not route changes). */

type Phase = "intro" | "learn" | "try" | "check" | "done";

/* The owner's soft gate from Cyber Pro: below this the learner is offered
 * another go, but can always carry on. */
const PASS = 0.8;

function Examples({ c }: { c: LearnCard }) {
  if (!c.good && !c.bad) return null;
  const box = (ok: boolean, label: string, items: NonNullable<LearnCard["good"]>) => (
    <div style={{ borderRadius: 14, padding: "14px 16px", background: ok ? D.goodSoft : D.badSoft, border: `1px solid ${ok ? "rgba(27,122,67,0.25)" : "rgba(179,38,30,0.22)"}` }}>
      <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 16, color: ok ? D.good : D.bad }}>
        {ok ? <Tick /> : <Cross />}
        {label}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "grid", gap: 10 }}>
        {items.map((e) => (
          <li key={e.text}>
            <span style={{ display: "block", whiteSpace: "pre-wrap", background: D.panel, borderRadius: 10, padding: "9px 12px", fontSize: 17, color: D.ink, border: `1px solid ${D.edgeSoft}` }}>{e.text}</span>
            {e.note && <span style={{ display: "block", marginTop: 5, fontSize: 15.5, color: D.muted }}>{e.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div style={{ marginTop: 18, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))" }}>
      {c.good && box(true, "Do this", c.good)}
      {c.bad && box(false, "Not this", c.bad)}
    </div>
  );
}

function Question({ q, onRight }: { q: QuizQuestion; onRight: () => void }) {
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
      <p style={{ margin: 0, fontSize: 19, lineHeight: 1.45, fontWeight: 700, color: D.ink }}>{q.q}</p>
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {order.map((i) => {
          const was = tried.includes(i);
          const right = was && i === q.answer;
          const wrong = was && i !== q.answer;
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={solved || was}
              style={{
                textAlign: "left",
                minHeight: 52,
                padding: "13px 16px",
                borderRadius: 12,
                fontSize: 17,
                lineHeight: 1.45,
                fontFamily: D.sans,
                color: D.ink,
                cursor: solved || was ? "default" : "pointer",
                background: right ? D.goodSoft : wrong ? D.badSoft : D.panel,
                border: `2px solid ${right ? D.good : wrong ? D.bad : D.edge}`,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              {right && <Tick />}
              {wrong && <Cross />}
              <span>{q.options[i]}</span>
            </button>
          );
        })}
      </div>
      {last !== null && (
        <div role="status" style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: last === q.answer ? D.goodSoft : D.badSoft, fontSize: 16.5, lineHeight: 1.5, color: D.body }}>
          <b>{last === q.answer ? "Right. " : "Not quite. "}</b>
          {q.reasons[last]}
          {last !== q.answer && " Try another answer."}
        </div>
      )}
    </div>
  );
}

export default function TopicPlayer({
  topic,
  index,
  total,
  onFinish,
  onBack,
  next,
}: {
  topic: Topic;
  index: number; // 0-based position in the module
  total: number;
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

  const header = (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <Button kind="plain" onClick={onBack}>
        &larr; Back to the module
      </Button>
      <span style={{ fontSize: 15, color: D.faint }}>
        Lesson {index + 1} of {total}
      </span>
    </div>
  );

  if (phase === "intro") {
    return (
      <div>
        {header}
        <div style={{ ...card, marginTop: 12 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: D.accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>About {topic.minutes} minutes</p>
          <h1 style={{ margin: "8px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: "clamp(1.7rem, 4.5vw, 2.3rem)", lineHeight: 1.15, color: D.ink }}>{topic.title}</h1>
          <p style={{ margin: "14px 0 0", fontSize: 19, lineHeight: 1.6, color: D.body }}>{topic.brief}</p>
          <ol style={{ margin: "18px 0 0", paddingLeft: 22, fontSize: 17, lineHeight: 1.8, color: D.body }}>
            <li>Read {topic.learn.length} short screens</li>
            <li>Try it yourself: {topic.tryIt.title.toLowerCase()}</li>
            <li>Answer {topic.check.length} quick questions</li>
          </ol>
          <div style={{ marginTop: 22 }}>
            <Button onClick={() => setPhase("learn")}>Start the lesson</Button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "learn") {
    const c = topic.learn[learnAt];
    const lastCard = learnAt + 1 === topic.learn.length;
    return (
      <div>
        {header}
        <div style={{ marginTop: 12 }}>
          <StepBar at={learnAt + 1} of={topic.learn.length} label="Screen" />
        </div>
        <div style={{ ...card, marginTop: 14 }}>
          <h2 style={{ margin: 0, fontFamily: D.display, fontWeight: 700, fontSize: "clamp(1.45rem, 3.8vw, 1.9rem)", lineHeight: 1.2, color: D.ink }}>{c.heading}</h2>
          {c.body.map((p) => (
            <p key={p} style={{ margin: "14px 0 0", fontSize: 19, lineHeight: 1.6, color: D.body }}>
              {p}
            </p>
          ))}
          <Examples c={c} />
          {c.tip && (
            <p style={{ margin: "18px 0 0", padding: "12px 14px", borderRadius: 12, background: D.accentSoft, fontSize: 17, lineHeight: 1.55, color: D.body }}>
              <b style={{ color: D.accent }}>Tip: </b>
              {c.tip}
            </p>
          )}
        </div>
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {learnAt > 0 && (
            <Button kind="secondary" onClick={() => setLearnAt(learnAt - 1)}>
              Back
            </Button>
          )}
          <Button onClick={() => (lastCard ? setPhase("try") : setLearnAt(learnAt + 1))}>{lastCard ? "Now try it" : "Next"}</Button>
        </div>
      </div>
    );
  }

  if (phase === "try") {
    return (
      <div>
        {header}
        <div style={{ ...card, marginTop: 12 }}>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: D.accent, textTransform: "uppercase", letterSpacing: "0.04em" }}>Try it yourself</p>
          <h2 style={{ margin: "6px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: "clamp(1.45rem, 3.8vw, 1.9rem)", lineHeight: 1.2, color: D.ink }}>{topic.tryIt.title}</h2>
          <p style={{ margin: "10px 0 18px", fontSize: 18, lineHeight: 1.55, color: D.body }}>{topic.tryIt.intro}</p>
          <Lab
            key={tryKey}
            onDone={(score) => {
              setTryDone(true);
              setTryScore(score ?? null);
            }}
          />
        </div>
        {tryDone && lowScore && tryScore && (
          <div role="status" style={{ marginTop: 16, padding: "14px 16px", borderRadius: 14, background: D.warnSoft, fontSize: 17, lineHeight: 1.5, color: D.body }}>
            You got {tryScore.correct} of {tryScore.total}. That is fine: this is how you learn. Have another go to lock it in, or carry on if you are happy.
          </div>
        )}
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
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
        {!tryDone && <p style={{ margin: "10px 0 0", fontSize: 15.5, color: D.faint }}>Finish the task above to carry on.</p>}
      </div>
    );
  }

  if (phase === "check") {
    const lastQ = qAt + 1 === topic.check.length;
    return (
      <div>
        {header}
        <div style={{ marginTop: 12 }}>
          <StepBar at={qAt + 1} of={topic.check.length} label="Question" />
        </div>
        <div style={{ ...card, marginTop: 14 }}>
          <Question key={qAt} q={topic.check[qAt]} onRight={() => setQSolved(true)} />
        </div>
        <div style={{ marginTop: 16 }}>
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
      </div>
    );
  }

  return (
    <div>
      {header}
      <div style={{ ...card, marginTop: 12, textAlign: "center", padding: "30px 22px" }}>
        <span aria-hidden style={{ display: "inline-flex", width: 64, height: 64, borderRadius: "50%", background: D.goodSoft, alignItems: "center", justifyContent: "center" }}>
          <Tick size={34} />
        </span>
        <h2 style={{ margin: "14px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.1rem)", color: D.ink }}>Lesson finished</h2>
        <p style={{ margin: "8px 0 0", fontSize: 18, color: D.muted }}>{topic.title}</p>
        <div style={{ textAlign: "left", maxWidth: 560, margin: "22px auto 0" }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: D.ink }}>Remember:</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "10px 0 0", display: "grid", gap: 10 }}>
            {topic.takeaways.map((t) => (
              <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 17.5, lineHeight: 1.5, color: D.body }}>
                <Tick />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          <Button onClick={next.go}>{next.label}</Button>
        </div>
      </div>
    </div>
  );
}
