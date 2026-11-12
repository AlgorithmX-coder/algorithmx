"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ExcelResultCard, ExcelTest, type ExcelRun } from "../office/apps/AgencyExcel";
import { TypingResultCard, TypingTest } from "../office/apps/AgencyTyping";
import { EXCEL_TASKS, type TypingScore } from "../office/agency";
import { OFFICE_CSS } from "../office/ui";
import { D, W } from "../tokens";
import { CvLine } from "./figures/cv";
import { MiniAd } from "./figures/jobsites";
import type { LabProps } from "./types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace, shuffle } from "./ui";

/* Module 13's Try labs: write a line of experience in office words, spot a
 * fake job advert, a short typing test and Excel test in the agency's own
 * test centre, and get ready for a video interview (fix the set-up, then
 * put an answer in STAR order). The CV lab runs in the office's own Word
 * (WordLab) and lives in the lesson file. */

const jobBox: CSSProperties = { whiteSpace: "pre-wrap", background: D.accentSoft, border: `1px solid ${D.accentEdge}`, borderRadius: 14, padding: "13px 16px", fontSize: 16.5, lineHeight: 1.6, color: D.body };

function resultPanel(pass: boolean): CSSProperties {
  return { marginTop: 16, position: "relative", background: pass ? D.goodSoft : D.warnSoft, border: `1px solid ${pass ? D.goodEdge : D.warnEdge}`, borderRadius: 16, padding: "18px 18px 20px", color: D.body, ["--acc" as string]: pass ? D.good : D.warn } as CSSProperties;
}

function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div role="status" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: ok ? D.goodSoft : D.badSoft, border: `1px solid ${ok ? D.goodEdge : D.badEdge}`, color: D.body, fontSize: 16.5, lineHeight: 1.55 }}>
      {ok ? <Tick /> : <Cross />}
      <div>{children}</div>
    </div>
  );
}

function useReveal<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (dep) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [dep]);
  return ref;
}

/* ------------------------------------------------------------------ */
/* Lesson 1: put a line of experience into office words.               */
/* ------------------------------------------------------------------ */

const VERBS = new Set(
  "achieved answered arranged assisted balanced booked built calculated cared checked cleaned coached collected completed controlled coordinated counted created dealt delivered drove filed fixed flagged found gave greeted guided handled helped kept labelled led listened logged looked made managed met monitored organised ordered packed paid picked planned prepared priced processed ran recorded reduced replied reported resolved restocked sent served set showed sold solved sorted spotted stocked supervised supported taught took trained typed updated used welcomed won worked wrote budgeted chased cut drew grew loaded measured opened closed covered phoned rang read raised saved scheduled shared signed spoke stored tidied tracked translated unloaded weighed".split(" "),
);

const NUMBER = /\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|hundred|dozen|daily|weekly|monthly|every (day|week|month|shift|morning))\b/i;

export interface LineTask {
  before: string;
  role: string;
  hint: string;
  example: string;
}

const firstWord = (s: string) => (s.trim().split(/\s+/)[0] ?? "").toLowerCase().replace(/[^a-z]/g, "");
const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
const flat = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const LINE_RULES: { label: string; test: (line: string, t: LineTask) => boolean; hint: string }[] = [
  { label: "Starts with a doing word", test: (l) => VERBS.has(firstWord(l)) || /ed$/.test(firstWord(l)), hint: "Start with what you did: Handled, Kept, Organised, Checked, Logged. Not \"I\", and never \"Responsible for\"." },
  { label: "Gives a number: how many, how often or how much", test: (l) => NUMBER.test(l), hint: "Add a true number: \"for up to 200 customers a day\", \"40 pallets a shift\", \"every morning\"." },
  { label: "Says enough to picture it: 8 to 30 words", test: (l) => words(l) >= 8 && words(l) <= 30, hint: "Say what the task was, and what it led to. One line, not a paragraph." },
  { label: "Says it in a new way, not the plain version", test: (l, t) => !!l.trim() && !flat(l).includes(flat(t.before)), hint: "Start again from what you actually did, in office words." },
];

export function LineLab({ tasks, onDone }: LabProps & { tasks: LineTask[] }) {
  const [at, setAt] = useState(0);
  const [lines, setLines] = useState<string[]>(() => tasks.map(() => ""));
  const [results, setResults] = useState<(boolean[] | null)[]>(() => tasks.map(() => null));
  const [finished, setFinished] = useState(false);
  const task = tasks[at];
  const line = lines[at];
  const result = results[at];
  const allPass = !!result && result.every(Boolean);
  const ref = useReveal<HTMLDivElement>(result);

  const check = () => setResults((rs) => rs.map((r, i) => (i === at ? LINE_RULES.map((rule) => rule.test(line, task)) : r)));
  const next = () => {
    if (at + 1 < tasks.length) return setAt(at + 1);
    setFinished(true);
    onDone({ correct: results.reduce((n, r) => n + (r ? r.filter(Boolean).length : 0), 0), total: tasks.length * LINE_RULES.length });
  };

  if (finished) return <Feedback ok>Done. Keep the lines you liked: they can go straight on your own CV.</Feedback>;

  return (
    <div>
      {tasks.length > 1 && <StepBar at={at + 1} of={tasks.length} label="Line" />}
      <div style={{ ...jobBox, marginTop: tasks.length > 1 ? 14 : 0 }}>
        <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
        <div>
          Here is how someone first wrote their {task.role}. Write it as one line for the Experience part of a CV: a doing word, the task in office words, a number, and what it led to. {task.hint}
        </div>
      </div>
      <Workspace style={{ marginTop: 14, display: "grid", gap: 12 }}>
        <CvLine label="Before">{task.before}</CvLine>
        <label style={{ display: "block", background: "#fff", borderRadius: 6, padding: "12px 16px", boxShadow: W.float, colorScheme: "light" }}>
          <span style={{ display: "block", fontFamily: W.font, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: W.muted }}>In office words</span>
          <span style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 6 }}>
            <span aria-hidden style={{ color: "#000", fontSize: 18, lineHeight: "30px" }}>
              •
            </span>
            <textarea
              aria-label="Your line, in office words"
              className="m13-line"
              value={line}
              onChange={(e) => setLines((ls) => ls.map((x, i) => (i === at ? e.target.value : x)))}
              rows={2}
              placeholder="Start with a doing word, like Handled"
              style={{ flex: 1, minWidth: 0, resize: "vertical", border: `1px solid ${W.edge}`, borderRadius: 4, padding: "6px 8px", fontFamily: W.font, fontSize: 16.5, lineHeight: 1.45, color: "#000", background: "#fff" }}
            />
          </span>
        </label>
      </Workspace>
      <style>{`.m13-line::placeholder { color: ${W.muted}; opacity: 1; }`}</style>
      <div style={{ marginTop: 14 }}>
        <Button onClick={check} disabled={!line.trim()}>
          Check my line
        </Button>
      </div>
      {result && (
        <div ref={ref} role="status" className="dr-glass" style={resultPanel(allPass)}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>{allPass ? "That line would hold its own on a CV." : "Nearly there. Fix these, then check again:"}</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 10 }}>
            {LINE_RULES.map((rule, i) => (
              <li key={rule.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 16.5, lineHeight: 1.45 }}>
                {result[i] ? <Tick /> : <Cross />}
                <span>
                  <b style={{ color: D.ink }}>{rule.label}</b>
                  {!result[i] && <span style={{ display: "block", color: D.muted }}>{rule.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          {allPass && (
            <p style={{ margin: "14px 0 0", fontSize: 16, lineHeight: 1.55, color: D.body }}>
              <b style={{ color: D.ink }}>Another way to say it:</b> {task.example}
            </p>
          )}
          <div style={{ marginTop: 16 }}>
            {allPass ? (
              <Button onClick={next}>{at + 1 < tasks.length ? "Next line" : "Finish"}</Button>
            ) : (
              <Button kind="plain" onClick={next}>
                Skip this one for now
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lesson 3: real job, or a scam? One advert at a time.                */
/* ------------------------------------------------------------------ */

export interface AdItem {
  ad: { title: string; employer: string; location: string; pay: string; hours: string; text: string; apply: string };
  scam: boolean;
  why: string;
}

export function AdvertLab({ items, onDone }: LabProps & { items: AdItem[] }) {
  const [order] = useState(() => shuffle(items.map((_, i) => i)));
  const [at, setAt] = useState(0);
  const [pick, setPick] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);
  const item = items[order[at]];
  const ref = useReveal<HTMLDivElement>(pick !== null ? `${at}` : null);

  const choose = (scam: boolean) => {
    if (pick !== null) return;
    setPick(scam);
    if (scam === item.scam) setRight((n) => n + 1);
  };
  const next = () => {
    if (at + 1 < items.length) {
      setAt(at + 1);
      setPick(null);
      return;
    }
    setFinished(true);
    onDone({ correct: right, total: items.length });
  };

  if (finished) {
    return (
      <Feedback ok>
        All done. You got <b>{right} of {items.length}</b> right. When an advert asks you for money, or for bank details before a job offer, walk away.
      </Feedback>
    );
  }

  const choice = (label: string, scam: boolean) => {
    const isRight = pick !== null && scam === item.scam;
    const isWrong = pick === scam && scam !== item.scam;
    return (
      <button
        type="button"
        onClick={() => choose(scam)}
        disabled={pick !== null}
        className="dr-option"
        style={{ minHeight: 54, padding: "12px 16px", fontSize: 16.5, fontWeight: 600, borderRadius: 14, cursor: pick !== null ? "default" : "pointer", fontFamily: D.sans, color: D.ink, background: isRight ? D.goodSoft : isWrong ? D.badSoft : D.glass, border: `1px solid ${isRight ? D.good : isWrong ? D.bad : D.edge}` }}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      <StepBar at={at + 1} of={items.length} label="Advert" />
      <Workspace style={{ marginTop: 14 }}>
        <div style={{ colorScheme: "light", maxWidth: 560 }}>
          <MiniAd ad={item.ad} />
        </div>
      </Workspace>
      <p style={{ margin: "14px 0 0", fontSize: 16, color: D.muted }}>Would you apply, or report it?</p>
      <div style={{ marginTop: 10, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
        {choice("Looks real: apply", false)}
        {choice("Looks like a scam: report it", true)}
      </div>
      {pick !== null && (
        <div ref={ref}>
          <Feedback ok={pick === item.scam}>
            <b>{pick === item.scam ? "Right. " : item.scam ? "It's a scam. " : "It looks real. "}</b>
            {item.why}
          </Feedback>
          <div style={{ marginTop: 16 }}>
            <Button onClick={next}>{at + 1 < items.length ? "Next advert" : "Finish"}</Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lesson 4: a one-minute typing test, then three Excel test tasks,    */
/* in the agency's own test pages.                                     */
/* ------------------------------------------------------------------ */

const SHORT_PASSAGE = [
  "Thank you for your email about the delivery on Friday. I have checked with the warehouse and the boxes will leave our site by ten in the morning. The driver will call you when he is twenty minutes away. If you need to change the time, please let me know before three o'clock tomorrow.",
  "I have also attached a copy of your invoice. Payment is due within thirty days of the date at the top. If you have any questions about it, I will be happy to help.",
];

const LAB_TASKS = EXCEL_TASKS.filter((t) => [1, 3, 5].includes(t.n));

export function TestsLab({ onDone }: LabProps) {
  const [stage, setStage] = useState<"typing" | "typed" | "excel" | "done">("typing");
  const [typing, setTyping] = useState<TypingScore | null>(null);
  const [excel, setExcel] = useState<ExcelRun | null>(null);
  const [key, setKey] = useState(0);

  const finish = (run: ExcelRun) => {
    setExcel(run);
    setStage("done");
    const typed = typing && typing.accuracy >= 90 ? 1 : 0;
    onDone({ correct: typed + run.right.length, total: 1 + LAB_TASKS.length });
  };

  return (
    <div>
      <StepBar at={stage === "typing" || stage === "typed" ? 1 : 2} of={2} label="Test" />
      <div style={{ ...jobBox, marginTop: 14 }}>
        <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
        <div>
          {stage === "typing" || stage === "typed"
            ? "A one-minute typing test, the way an agency runs it. Click in the box and type the letter. The clock starts with your first key. Aim for every word right before you aim for speed."
            : "Now three tasks from an agency's Excel test. Each names the cell to use. Click it, then type. When you're done, press Finish practice."}
        </div>
      </div>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ background: W.page, borderRadius: 8, boxShadow: W.float, colorScheme: "light", overflow: "hidden" }}>
          {stage === "typing" && (
            <div style={{ padding: 14 }}>
              <TypingTest
                key={key}
                seconds={60}
                practice
                passage={SHORT_PASSAGE}
                height={150}
                onFinish={(r) => {
                  setTyping(r);
                  setStage("typed");
                }}
              />
            </div>
          )}
          {stage === "typed" && typing && (
            <div style={{ padding: 14 }}>
              <TypingResultCard r={typing} practice />
            </div>
          )}
          {stage === "excel" && (
            <div style={{ height: "calc(520px + max(0px, 640px - 100vw) * 0.9)" }}>
              <ExcelTest practice tasks={LAB_TASKS} onFinish={finish} />
            </div>
          )}
          {stage === "done" && excel && (
            <div style={{ padding: 14 }}>
              <ExcelResultCard run={excel} practice tasks={LAB_TASKS} />
            </div>
          )}
        </div>
        <style>{OFFICE_CSS}</style>
      </Workspace>
      {stage === "typed" && (
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
          <Button onClick={() => setStage("excel")}>On to the Excel tasks</Button>
          <Button
            kind="secondary"
            onClick={() => {
              setKey((k) => k + 1);
              setStage("typing");
            }}
          >
            Type it again
          </Button>
        </div>
      )}
      {stage === "done" && <Feedback ok>Done. In the office job you&apos;ll take Pennyford&apos;s full tests: three minutes of typing, and all ten Excel tasks in fifteen minutes.</Feedback>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Lesson 5: fix the set-up, then put an answer in STAR order.          */
/* ------------------------------------------------------------------ */

interface Fix {
  id: string;
  label: string;
  good: boolean;
  why: string;
}

const FIXES: Fix[] = [
  { id: "raise", label: "Put the laptop on two books", good: true, why: "Now the camera is level with your eyes, not looking up your nose." },
  { id: "turn", label: "Turn to face the window", good: true, why: "The daylight is on your face now, not behind you." },
  { id: "tidy", label: "Move the washing out of shot", good: true, why: "A plain wall behind you: nothing to look at but you." },
  { id: "mic", label: "Unmute the microphone", good: true, why: "They'll hear you from your first hello." },
  { id: "camoff", label: "Turn the camera off", good: false, why: "Keep it on: they need to see you, just as in a room." },
  { id: "late", label: "Join exactly at 10:00", good: false, why: "Join five minutes early, so a slow link or an update doesn't make you late." },
];

/* Your own picture before the call, drawn from what's been fixed. */
function Preview({ done }: { done: Set<string> }) {
  const low = !done.has("raise");
  const back = !done.has("turn");
  const mess = !done.has("tidy");
  const muted = !done.has("mic");
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 420, aspectRatio: "4 / 3", borderRadius: 8, overflow: "hidden", background: back ? "#f4f1ea" : "#e9e4dc", boxShadow: W.float }}>
      <svg viewBox="0 0 160 120" width="100%" height="100%" aria-hidden style={{ display: "block" }}>
        {back && <rect x="54" y="6" width="52" height="50" fill="#fffbe6" stroke="#e6dcc0" />}
        {mess && (
          <g>
            <line x1="8" y1="34" x2="46" y2="34" stroke="#999" strokeWidth="1.5" />
            <rect x="12" y="34" width="9" height="16" fill="#d94f4f" />
            <rect x="24" y="34" width="7" height="20" fill="#4f7fd9" />
            <rect x="34" y="34" width="10" height="13" fill="#f2c94c" />
          </g>
        )}
        {!mess && <rect x="126" y="40" width="10" height="22" rx="4" fill="#6d9b6a" />}
        <g transform={low ? "translate(0 22)" : undefined} style={back ? { filter: "brightness(0.3)" } : undefined}>
          <path d="M30 124 C34 98 56 88 80 88 C104 88 126 98 130 124 Z" fill="#7a4b8c" />
          <rect x="71" y="70" width="18" height="22" rx="6" fill="#e8b896" />
          {low ? <ellipse cx="80" cy="56" rx="26" ry="22" fill="#e8b896" /> : <circle cx="80" cy="52" r="24" fill="#e8b896" />}
          {low ? <ellipse cx="80" cy="70" rx="7" ry="3" fill="#b07f63" /> : <path d="M70 60 Q80 66 90 60" stroke="#8a5a44" strokeWidth="2" fill="none" />}
          {!low && (
            <g>
              <circle cx="71" cy="49" r="2.4" fill="#3b2a20" />
              <circle cx="89" cy="49" r="2.4" fill="#3b2a20" />
            </g>
          )}
          <path d="M56 52 C55 32 68 24 80 24 C94 24 106 32 104 52 C100 40 92 36 80 36 C68 36 60 40 56 52 Z" fill="#5a3825" />
        </g>
        {back && <rect x="0" y="0" width="160" height="120" fill="#fff8e1" opacity="0.25" />}
      </svg>
      <span style={{ position: "absolute", left: 8, bottom: 8, display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 8px", borderRadius: 4, background: "rgba(0,0,0,0.6)", color: "#fff", fontFamily: W.font, fontSize: 13 }}>
        {muted ? "Microphone off" : "Microphone on"}
      </span>
    </div>
  );
}

const STAR_SETS: { question: string; parts: [string, string, string, string] }[] = [
  {
    question: "Tell me about a time you dealt with an unhappy customer.",
    parts: [
      "At the shop, a regular came in angry because her Christmas order hadn't arrived.",
      "I needed to calm things down and get her order to her before the weekend.",
      "I listened without arguing, rang the supplier while she waited, and booked a delivery for Friday morning.",
      "She had it on Friday, thanked the manager, and kept ordering from us.",
    ],
  },
  {
    question: "Tell me about a time you had a lot to do at once.",
    parts: [
      "On my placement, three jobs landed on my desk on the same Monday morning.",
      "Each one had a deadline before lunch, and one was a possible scam email.",
      "I reported the scam first, then did the delivery report, then booked the meeting, ticking each off a list.",
      "All three were done by 11:30, and my manager asked me to show a new starter how I'd done it.",
    ],
  },
];

const STAR_NAMES = ["Situation", "Task", "Action", "Result"] as const;
const STAR_SAYS = ["where you were and what was going on", "what you had to do", "what you did, step by step", "how it ended"];

export function InterviewLab({ onDone }: LabProps) {
  const [stage, setStage] = useState<"setup" | "star" | "done">("setup");
  const [done, setDone] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<Fix | null>(null);
  const [wrongFixes, setWrongFixes] = useState(0);
  const [q, setQ] = useState(0);
  const [orders] = useState(() => STAR_SETS.map(() => shuffle([0, 1, 2, 3])));
  const [placed, setPlaced] = useState<number[]>([]);
  const [slip, setSlip] = useState<number | null>(null);
  const [firstTry, setFirstTry] = useState(0);
  const [missed, setMissed] = useState(false);
  const goodLeft = FIXES.filter((f) => f.good && !done.has(f.id)).length;
  const set = STAR_SETS[q];
  const complete = placed.length === 4;
  const ref = useReveal<HTMLDivElement>(last?.id ?? null);

  const press = (f: Fix) => {
    setLast(f);
    if (!f.good) {
      setWrongFixes((n) => n + 1);
      return;
    }
    setDone((d) => new Set(d).add(f.id));
  };

  const place = (i: number) => {
    if (complete || placed.includes(i)) return;
    if (i === placed.length) {
      if (!missed) setFirstTry((n) => n + 1);
      setPlaced([...placed, i]);
      setSlip(null);
      setMissed(false);
    } else {
      setSlip(i);
      setMissed(true);
    }
  };

  const nextQuestion = () => {
    if (q + 1 < STAR_SETS.length) {
      setQ(q + 1);
      setPlaced([]);
      setSlip(null);
      setMissed(false);
      return;
    }
    setStage("done");
    const setupScore = Math.max(0, 4 - wrongFixes);
    onDone({ correct: setupScore + firstTry, total: 4 + STAR_SETS.length * 4 });
  };

  if (stage === "done") return <Feedback ok>Done. Before a real interview: test the link the day before, set up like this, and have two true STAR stories ready.</Feedback>;

  if (stage === "setup") {
    return (
      <div>
        <StepBar at={1} of={2} label="Part" />
        <div style={{ ...jobBox, marginTop: 14 }}>
          <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
          <div>Your video interview starts at 10:00. This is your camera picture at 9:52. Put right the four things wrong with it. Not every button helps.</div>
        </div>
        <Workspace style={{ marginTop: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 16, alignItems: "start" }}>
            <Preview done={done} />
            <div style={{ display: "grid", gap: 8 }}>
              {FIXES.map((f) => {
                const on = done.has(f.id);
                const bad = last?.id === f.id && !f.good;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => press(f)}
                    disabled={on}
                    className="dr-option"
                    style={{ textAlign: "left", minHeight: 48, padding: "10px 14px", borderRadius: 12, fontFamily: D.sans, fontSize: 16, color: D.ink, cursor: on ? "default" : "pointer", background: on ? D.goodSoft : bad ? D.badSoft : D.glass, border: `1px solid ${on ? D.good : bad ? D.bad : D.edge}`, display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {on ? <Tick size={16} /> : bad ? <Cross size={16} /> : <span aria-hidden style={{ width: 16 }} />}
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </Workspace>
        {last && (
          <div ref={ref}>
            <Feedback ok={last.good}>{last.why}</Feedback>
          </div>
        )}
        <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
          <Button onClick={() => setStage("star")} disabled={goodLeft > 0}>
            Join the interview
          </Button>
          {goodLeft > 0 && <span style={{ fontSize: 15.5, color: D.muted }}>{goodLeft} more to put right</span>}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepBar at={2} of={2} label="Part" />
      <div style={{ ...jobBox, marginTop: 14 }}>
        <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
        <div>
          Question {q + 1} of {STAR_SETS.length}. Helen asks: <b style={{ color: D.ink }}>&ldquo;{set.question}&rdquo;</b> Here is a good answer, jumbled. Click its parts in STAR order: Situation, Task, Action, Result.
        </div>
      </div>
      <ol style={{ listStyle: "none", margin: "14px 0 0", padding: 0, display: "grid", gap: 8 }}>
        {STAR_NAMES.map((name, i) => (
          <li key={name} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 14px", borderRadius: 12, background: placed[i] !== undefined ? D.goodSoft : D.glass, border: `1px ${placed[i] !== undefined ? "solid" : "dashed"} ${placed[i] !== undefined ? D.goodEdge : D.edge}`, minHeight: 48 }}>
            <b style={{ flexShrink: 0, width: 28, height: 28, borderRadius: 8, background: placed[i] !== undefined ? D.good : D.glassStrong, color: placed[i] !== undefined ? "#06261a" : D.ink, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{name[0]}</b>
            <span style={{ fontSize: 16, lineHeight: 1.5, color: placed[i] !== undefined ? D.body : D.faint }}>{placed[i] !== undefined ? set.parts[placed[i]] : `${name}: ${STAR_SAYS[i]}`}</span>
          </li>
        ))}
      </ol>
      {!complete && (
        <>
          <p style={{ margin: "16px 0 0", fontSize: 16, color: D.muted }}>Pick the {STAR_NAMES[placed.length]}:</p>
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            {orders[q]
              .filter((i) => !placed.includes(i))
              .map((i) => (
                <button key={i} type="button" onClick={() => place(i)} className="dr-option" style={{ textAlign: "left", minHeight: 54, padding: "12px 16px", borderRadius: 14, fontFamily: D.sans, fontSize: 16.5, lineHeight: 1.5, color: D.ink, cursor: "pointer", background: slip === i ? D.badSoft : D.glass, border: `1px solid ${slip === i ? D.bad : D.edge}` }}>
                  {set.parts[i]}
                </button>
              ))}
          </div>
          {slip !== null && (
            <Feedback ok={false}>
              That one is the <b>{STAR_NAMES[slip]}</b>: it says {STAR_SAYS[slip]}. Look for the {STAR_NAMES[placed.length]} first: {STAR_SAYS[placed.length]}.
            </Feedback>
          )}
        </>
      )}
      {complete && (
        <>
          <Feedback ok>That&apos;s the answer in STAR order. Said out loud, it takes about a minute or two: long enough to be real, short enough to keep them listening.</Feedback>
          <div style={{ marginTop: 16 }}>
            <Button onClick={nextQuestion}>{q + 1 < STAR_SETS.length ? "Next question" : "Finish"}</Button>
          </div>
        </>
      )}
    </div>
  );
}

