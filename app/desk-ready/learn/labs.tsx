"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { D, W } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace, darkInput, shuffle } from "./ui";

/* The Try engines. Content configures them (app/desk-ready/lessons), so a
 * new lesson never touches this file. Owner rules carried over from the
 * Pro UAT rounds:
 * - no answer tells: option order is shuffled ONCE per mount, held in a
 *   useState initializer (never useMemo over an inline prop, which
 *   reshuffled mid-activity on Pro);
 * - onDone fires on COMPLETION, with a score where one exists, so the
 *   player's 80% soft gate can offer another go. */

/* ------------------------------------------------------------------ */
/* Choice: pick the best option, one question at a time.               */
/* ------------------------------------------------------------------ */

export interface ChoiceOption {
  text: string;
  correct?: boolean;
  why: string;
}

export interface ChoiceStep {
  prompt: string;
  /* Optional context shown above the options, e.g. the email being
   * replied to: plain text, or a drawn figure (learn/figures). */
  context?: string;
  figure?: ReactNode;
  options: ChoiceOption[];
}

function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div role="status" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: ok ? D.goodSoft : D.badSoft, border: `1px solid ${ok ? D.goodEdge : D.badEdge}`, color: D.body, fontSize: 16.5, lineHeight: 1.55 }}>
      {ok ? <Tick /> : <Cross />}
      <div>{children}</div>
    </div>
  );
}

const contextBox: CSSProperties = { whiteSpace: "pre-wrap", background: D.glass, border: `1px solid ${D.edge}`, borderRadius: 14, padding: "13px 16px", fontSize: 16.5, lineHeight: 1.6, color: D.body, marginTop: 12 };

/* "The job": the scenario a practice task sets, in the course's accent. */
const jobBox: CSSProperties = { ...contextBox, background: D.accentSoft, border: `1px solid ${D.accentEdge}` };

/* A glass answer row; green or red once it has been picked. */
function optionLook(right: boolean, wrong: boolean): CSSProperties {
  return {
    background: right ? D.goodSoft : wrong ? D.badSoft : D.glass,
    border: `1px solid ${right ? D.good : wrong ? D.bad : D.edge}`,
    borderRadius: 14,
    color: D.ink,
    fontFamily: D.sans,
  };
}

/* The panel a Send or Check result shows in: green when everything passes,
 * amber while there is still something to fix. The lit top edge follows. */
function resultPanel(pass: boolean): CSSProperties {
  return {
    marginTop: 16,
    position: "relative",
    background: pass ? D.goodSoft : D.warnSoft,
    border: `1px solid ${pass ? D.goodEdge : D.warnEdge}`,
    borderRadius: 16,
    padding: "18px 18px 20px",
    color: D.body,
    ["--acc" as string]: pass ? D.good : D.warn,
  } as CSSProperties;
}

/* Inside a practice app the shell's pale placeholder would vanish on white. */
const APP_INPUT_CSS = `.dr-app-input.dr-app-input::placeholder { color: ${W.muted}; opacity: 1; }`;

export function ChoiceLab({ steps, onDone }: LabProps & { steps: ChoiceStep[] }) {
  const [order] = useState(() => steps.map((s) => shuffle(s.options.map((_, i) => i))));
  const [at, setAt] = useState(0);
  const [picked, setPicked] = useState<number[]>([]); // option indices tried on this step
  const [firstTry, setFirstTry] = useState(0);
  const [finished, setFinished] = useState(false);

  const step = steps[at];
  const solved = picked.some((i) => step.options[i].correct);
  const last = picked.length ? picked[picked.length - 1] : null;

  function pick(i: number) {
    if (solved) return;
    if (picked.length === 0 && step.options[i].correct) setFirstTry((n) => n + 1);
    setPicked((p) => [...p, i]);
  }

  function next() {
    if (at + 1 < steps.length) {
      setAt(at + 1);
      setPicked([]);
    } else {
      setFinished(true);
      onDone({ correct: firstTry, total: steps.length });
    }
  }

  if (finished) {
    return (
      <Feedback ok>
        All done. You got <b>{firstTry} of {steps.length}</b> right first time.
      </Feedback>
    );
  }

  return (
    <div>
      {steps.length > 1 && <StepBar at={at + 1} of={steps.length} label="Question" />}
      <p style={{ margin: "16px 0 0", fontSize: 18, lineHeight: 1.5, fontWeight: 700, color: D.ink }}>{step.prompt}</p>
      {step.figure}
      {step.context && <div style={contextBox}>{step.context}</div>}
      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {order[at].map((i) => {
          const o = step.options[i];
          const tried = picked.includes(i);
          const showRight = tried && o.correct;
          const showWrong = tried && !o.correct;
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(i)}
              disabled={solved || tried}
              className="dr-option"
              style={{
                textAlign: "left",
                minHeight: 54,
                padding: "14px 18px",
                fontSize: 17,
                lineHeight: 1.5,
                cursor: solved || tried ? "default" : "pointer",
                ...optionLook(!!showRight, showWrong),
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              {showRight && <Tick />}
              {showWrong && <Cross />}
              <span>{o.text}</span>
            </button>
          );
        })}
      </div>
      {last !== null && (
        <Feedback ok={!!step.options[last].correct}>
          {step.options[last].correct ? <b>Right. </b> : <b>Not quite. </b>}
          {step.options[last].why}
          {!step.options[last].correct && " Have another go."}
        </Feedback>
      )}
      {solved && (
        <div style={{ marginTop: 16 }}>
          <Button onClick={next}>{at + 1 < steps.length ? "Next question" : "Finish"}</Button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sort: put each item in the right group, one card at a time.         */
/* ------------------------------------------------------------------ */

export interface SortItem {
  text: string;
  bucket: number;
  why: string;
}

export function SortLab({ buckets, items, onDone }: LabProps & { buckets: string[]; items: SortItem[] }) {
  const [order] = useState(() => shuffle(items.map((_, i) => i)));
  const [at, setAt] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);

  const item = items[order[at]];

  function choose(b: number) {
    if (choice !== null) return;
    setChoice(b);
    if (b === item.bucket) setRight((n) => n + 1);
  }

  function next() {
    if (at + 1 < items.length) {
      setAt(at + 1);
      setChoice(null);
    } else {
      setFinished(true);
      onDone({ correct: right, total: items.length });
    }
  }

  if (finished) {
    return (
      <Feedback ok>
        All sorted. You got <b>{right} of {items.length}</b> right.
      </Feedback>
    );
  }

  return (
    <div>
      <StepBar at={at + 1} of={items.length} label="Card" />
      <div className="dr-glass" style={{ position: "relative", marginTop: 16, padding: "26px 20px", borderRadius: 18, background: D.card, border: `1px solid ${D.edgeStrong}`, boxShadow: D.lift, textAlign: "center", fontSize: 21, fontWeight: 600, lineHeight: 1.4, color: D.ink }}>
        {item.text}
      </div>
      <p style={{ margin: "14px 0 0", fontSize: 16, color: D.muted }}>Where does it belong?</p>
      <div style={{ marginTop: 10, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))" }}>
        {buckets.map((b, i) => {
          const isRight = choice !== null && i === item.bucket;
          const isWrongPick = choice === i && i !== item.bucket;
          return (
            <button
              key={b}
              type="button"
              onClick={() => choose(i)}
              disabled={choice !== null}
              className="dr-option"
              style={{
                minHeight: 54,
                padding: "12px 16px",
                fontSize: 16.5,
                fontWeight: 600,
                cursor: choice !== null ? "default" : "pointer",
                ...optionLook(isRight, isWrongPick),
              }}
            >
              {b}
            </button>
          );
        })}
      </div>
      {choice !== null && (
        <>
          <Feedback ok={choice === item.bucket}>
            {choice === item.bucket ? <b>Right. </b> : <b>It goes in &ldquo;{buckets[item.bucket]}&rdquo;. </b>}
            {item.why}
          </Feedback>
          <div style={{ marginTop: 16 }}>
            <Button onClick={next}>{at + 1 < items.length ? "Next card" : "Finish"}</Button>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compose: write an email in a pretend Outlook window and press Send. */
/* Nothing is sent: Send runs the task's checks and shows what to fix. */
/* ------------------------------------------------------------------ */

export interface Draft {
  to: string;
  subject: string;
  body: string;
}

export interface Rule {
  /* What a good email does, in the learner's words ("Says which order"). */
  label: string;
  test: (d: Draft) => boolean;
  /* Shown when the check fails: how to fix it. */
  hint: string;
}

export interface ComposeTask {
  scenario: string;
  to: string;
  /* Which fields the learner writes; the rest are shown filled in. */
  write: ("subject" | "body")[];
  prefill?: { subject?: string; body?: string };
  rules: Rule[];
}

function InboxWindow({ children, onSend }: { children: ReactNode; onSend: () => void }) {
  return (
    <div style={{ border: `1px solid ${W.edge}`, borderRadius: 12, overflow: "hidden", background: W.page, color: W.ink, fontFamily: W.font, boxShadow: W.float, colorScheme: "light" }}>
      <style>{APP_INPUT_CSS}</style>
      <div style={{ background: W.outlook, color: D.onAccent, padding: "8px 14px", fontSize: 14, fontWeight: 700 }}>New message</div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: `1px solid ${W.edge}`, background: W.chrome }}>
        <button
          type="button"
          onClick={onSend}
          style={{ minHeight: 44, padding: "8px 22px", borderRadius: 8, border: "none", background: W.outlook, color: D.onAccent, fontFamily: W.font, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden style={{ display: "inline-block" }}>
            <path d="M3 11 L21 3 L14 21 L11 13 Z" strokeLinejoin="round" />
          </svg>
          Send
        </button>
        <span style={{ fontSize: 15, color: W.muted }}>Practice only. Nothing is really sent.</span>
      </div>
      {children}
    </div>
  );
}

/* After Send or Check, bring the feedback into view: on a phone it lands
 * below the fold and a learner would think nothing happened. */
function useRevealOnChange<T extends HTMLElement>(dep: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (dep) ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [dep]);
  return ref;
}

const fieldRow: CSSProperties = { display: "flex", alignItems: "center", gap: 10, padding: "6px 14px", borderBottom: `1px solid ${W.edge}`, minHeight: 50, background: W.page };
const fieldLabel: CSSProperties = { width: 66, flexShrink: 0, fontSize: 15.5, color: W.muted };
const fieldInput: CSSProperties = { flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: W.font, fontSize: 17, color: W.ink, padding: "8px 0" };

export function ComposeLab({ tasks, onDone }: LabProps & { tasks: ComposeTask[] }) {
  const [at, setAt] = useState(0);
  const [drafts, setDrafts] = useState<Draft[]>(() => tasks.map((t) => ({ to: t.to, subject: t.prefill?.subject ?? "", body: t.prefill?.body ?? "" })));
  const [results, setResults] = useState<(boolean[] | null)[]>(() => tasks.map(() => null));
  const [finished, setFinished] = useState(false);

  const task = tasks[at];
  const draft = drafts[at];
  const result = results[at];
  const allPass = !!result && result.every(Boolean);
  const resultRef = useRevealOnChange<HTMLDivElement>(result);

  function edit(field: "subject" | "body", value: string) {
    setDrafts((ds) => ds.map((d, i) => (i === at ? { ...d, [field]: value } : d)));
  }

  function send() {
    const r = task.rules.map((rule) => rule.test(draft));
    setResults((rs) => rs.map((x, i) => (i === at ? r : x)));
  }

  function next() {
    if (at + 1 < tasks.length) {
      setAt(at + 1);
      return;
    }
    const total = tasks.reduce((n, t) => n + t.rules.length, 0);
    const correct = results.reduce((n, r) => n + (r ? r.filter(Boolean).length : 0), 0);
    setFinished(true);
    onDone({ correct, total });
  }

  if (finished) {
    return (
      <Feedback ok>
        Done. Every email you wrote here stays here: nothing was sent.
      </Feedback>
    );
  }

  return (
    <div>
      {tasks.length > 1 && <StepBar at={at + 1} of={tasks.length} label="Email" />}
      <div style={{ ...jobBox, marginTop: tasks.length > 1 ? 14 : 0 }}>
        <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
        <div>{task.scenario}</div>
      </div>
      <Workspace style={{ marginTop: 14 }}>
        <InboxWindow onSend={send}>
          <div style={fieldRow}>
            <span style={fieldLabel}>To</span>
            <span style={{ fontSize: 16, color: W.ink, background: W.select, borderRadius: 99, padding: "4px 12px", overflowWrap: "anywhere" }}>{draft.to}</span>
          </div>
          <label style={fieldRow}>
            <span style={fieldLabel}>Subject</span>
            {task.write.includes("subject") ? (
              <input className="dr-app-input" value={draft.subject} onChange={(e) => edit("subject", e.target.value)} placeholder="Type the subject here" style={fieldInput} />
            ) : (
              <span style={{ ...fieldInput, color: W.body }}>{draft.subject}</span>
            )}
          </label>
          {task.write.includes("body") ? (
            <textarea
              className="dr-app-input"
              aria-label="Email message"
              value={draft.body}
              onChange={(e) => edit("body", e.target.value)}
              placeholder="Type your email here"
              rows={9}
              style={{ ...fieldInput, display: "block", width: "100%", boxSizing: "border-box", padding: "14px", resize: "vertical", lineHeight: 1.55, background: W.page }}
            />
          ) : (
            <div style={{ padding: 14, minHeight: 60, fontSize: 16, color: W.muted, background: W.page }}>You only need the subject line for this one.</div>
          )}
        </InboxWindow>
      </Workspace>

      {result && (
        <div ref={resultRef} role="status" className="dr-glass" style={resultPanel(allPass)}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>
            {allPass ? "That email is ready to send." : "Nearly there. Fix these, then press Send again:"}
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 10 }}>
            {task.rules.map((rule, i) => (
              <li key={rule.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 16.5, lineHeight: 1.45 }}>
                {result[i] ? <Tick /> : <Cross />}
                <span>
                  <b style={{ color: D.ink }}>{rule.label}</b>
                  {!result[i] && <span style={{ display: "block", color: D.muted }}>{rule.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {allPass ? (
              <Button onClick={next}>{at + 1 < tasks.length ? "Next email" : "Finish"}</Button>
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
/* Signature: build your own email signature and see it under an email. */
/* ------------------------------------------------------------------ */

interface SigFields {
  name: string;
  role: string;
  company: string;
  phone: string;
  extra: string;
}

const SIG_FIELDS: { key: keyof SigFields; label: string; placeholder: string; optional?: boolean }[] = [
  { key: "name", label: "Your full name", placeholder: "Dave Morris" },
  { key: "role", label: "Your job title", placeholder: "Stock Administrator" },
  { key: "company", label: "Company name", placeholder: "Northfield Foods Ltd" },
  { key: "phone", label: "Work phone number", placeholder: "01632 960 418" },
  { key: "extra", label: "Anything else? (you can leave this empty)", placeholder: "", optional: true },
];

/* Pictographic emoji, so "Have a great day 😊" is caught. */
const EMOJI = /\p{Extended_Pictographic}/u;

export function SignatureLab({ onDone }: LabProps) {
  const [f, setF] = useState<SigFields>({ name: "", role: "", company: "", phone: "", extra: "" });
  const [checked, setChecked] = useState<boolean[] | null>(null);
  const checkedRef = useRevealOnChange<HTMLUListElement>(checked);

  const rules: { label: string; ok: (s: SigFields) => boolean; hint: string }[] = [
    { label: "Your full name", ok: (s) => s.name.trim().split(/\s+/).length >= 2, hint: "Use your first name and surname, so people know exactly who you are." },
    { label: "Your job title", ok: (s) => s.role.trim().length >= 3, hint: "Add your job title, so people know what you can help with. Make one up for practice if you need to." },
    { label: "Your company", ok: (s) => s.company.trim().length >= 2, hint: "Add the company name." },
    { label: "A phone number", ok: (s) => s.phone.replace(/\D/g, "").length >= 10, hint: "Add a full phone number with the area code, about 11 digits." },
    {
      label: "Nothing extra to distract",
      ok: (s) => !EMOJI.test(Object.values(s).join(" ")) && s.extra.trim().split(/\s+/).filter(Boolean).length <= 8 && !/["“”]/.test(s.extra),
      hint: "Leave out quotes, emojis and long sayings. A work signature is just who you are and how to reach you.",
    },
  ];

  function check() {
    const r = rules.map((rule) => rule.ok(f));
    setChecked(r);
    onDone({ correct: r.filter(Boolean).length, total: r.length });
  }

  const lines = [f.name, f.role, f.company, f.phone, f.extra].map((x) => x.trim()).filter(Boolean);

  return (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", alignItems: "start" }}>
      <div style={{ display: "grid", gap: 14 }}>
        {SIG_FIELDS.map((field) => (
          <label key={field.key} style={{ display: "grid", gap: 6 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: D.ink }}>{field.label}</span>
            <input
              value={f[field.key]}
              onChange={(e) => setF({ ...f, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              style={darkInput}
            />
          </label>
        ))}
        <div>
          <Button onClick={check}>Check my signature</Button>
        </div>
      </div>

      <div>
        <p style={{ margin: "0 0 8px", fontSize: 15.5, color: D.muted }}>How it looks under an email:</p>
        <Workspace>
          <div style={{ border: `1px solid ${W.edge}`, borderRadius: 12, background: W.page, padding: "16px 18px", fontFamily: W.font, fontSize: 16.5, lineHeight: 1.6, color: W.body, boxShadow: W.float, colorScheme: "light" }}>
            <div>Hi Sarah,</div>
            <div style={{ marginTop: 8 }}>The stock count for aisle 4 is attached.</div>
            <div style={{ marginTop: 12 }}>Kind regards,</div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${W.edge}` }}>
              {lines.length ? (
                lines.map((l, i) => (
                  <div key={i} style={i === 0 ? { fontWeight: 700, color: W.ink } : undefined}>
                    {l}
                  </div>
                ))
              ) : (
                <div style={{ color: W.muted }}>Your signature appears here as you type.</div>
              )}
            </div>
          </div>
        </Workspace>

        {checked && (
          <ul ref={checkedRef} role="status" style={{ listStyle: "none", margin: "16px 0 0", padding: "16px 18px", display: "grid", gap: 10, background: D.glass, border: `1px solid ${D.edge}`, borderRadius: 16, color: D.body }}>
            {rules.map((rule, i) => (
              <li key={rule.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 16.5, lineHeight: 1.45 }}>
                {checked[i] ? <Tick /> : <Cross />}
                <span>
                  <b style={{ color: D.ink }}>{rule.label}</b>
                  {!checked[i] && <span style={{ display: "block", color: D.muted }}>{rule.hint}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
