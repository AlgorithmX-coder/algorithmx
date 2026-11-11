"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { BRIEFS, describePersonal, findPersonal, markPrompt, respond } from "../office/copilot";
import { display, evaluate } from "../office/formula";
import Excel, { type ExcelDoc } from "../office/apps/Excel";
import { Composer, CopilotChat, CopilotMark, DraftPanel, Lit, Protected, SidePane } from "../office/apps/Copilot";
import type { CopilotTurn, Grid } from "../office/types";
import { OFFICE_CSS } from "../office/ui";
import { D, W } from "../tokens";
import type { LabProps } from "./types";
import { Button, Cross, Kicker, StepBar, Tick, Workspace, shuffle } from "./ui";

/* Module 12's Try labs, each run on the office's own Copilot look-alike
 * (office/apps/Copilot), scripted by office/copilot:
 *
 * - TrustLab: ask Copilot six things, and judge each answer: good to use
 *   after a read, or a guess to check (lesson 1).
 * - PromptLab: Draft with Copilot in an Outlook reply, marked live on the
 *   facts, the reader and the tone (lesson 2).
 * - ExplainLab: Excel with Copilot down the side: get a formula explained,
 *   then write one like it yourself (lesson 3).
 * - PasteLab: take the personal details out of a paste before it goes,
 *   and decide when not to paste at all (lesson 5).
 * Lesson 4's checking practice runs in the shared ComposeLab. */

let seq = 0;
const turnOf = (a: Omit<CopilotTurn, "id">): CopilotTurn => ({ ...a, id: `lab-${++seq}` });

const jobBox: CSSProperties = { whiteSpace: "pre-wrap", background: D.accentSoft, border: `1px solid ${D.accentEdge}`, borderRadius: 14, padding: "13px 16px", fontSize: 16.5, lineHeight: 1.6, color: D.body };

function TheJob({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ ...jobBox, ...style }}>
      <Kicker style={{ marginBottom: 6 }}>The job</Kicker>
      <div>{children}</div>
    </div>
  );
}

function Feedback({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <div role="status" style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: ok ? D.goodSoft : D.badSoft, border: `1px solid ${ok ? D.goodEdge : D.badEdge}`, color: D.body, fontSize: 16.5, lineHeight: 1.55 }}>
      {ok ? <Tick /> : <Cross />}
      <div>{children}</div>
    </div>
  );
}

function Results({ pass, title, rows, children }: { pass: boolean; title: string; rows: { label: string; ok: boolean; hint?: string }[]; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [title, rows.length]);
  return (
    <div ref={ref} role="status" className="dr-glass" style={{ marginTop: 16, position: "relative", background: pass ? D.goodSoft : D.warnSoft, border: `1px solid ${pass ? D.goodEdge : D.warnEdge}`, borderRadius: 16, padding: "18px 18px 20px", color: D.body, ["--acc" as string]: pass ? D.good : D.warn } as CSSProperties}>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>{title}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 10 }}>
        {rows.map((r) => (
          <li key={r.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 16.5, lineHeight: 1.45 }}>
            {r.ok ? <Tick /> : <Cross />}
            <span>
              <b style={{ color: D.ink }}>{r.label}</b>
              {!r.ok && r.hint && <span style={{ display: "block", color: D.muted }}>{r.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

function Done({ children }: { children: ReactNode }) {
  return (
    <div role="status" style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "13px 16px", borderRadius: 14, background: D.goodSoft, border: `1px solid ${D.goodEdge}`, fontSize: 16.5, lineHeight: 1.55, color: D.body }}>
      <Tick />
      <span>{children}</span>
    </div>
  );
}

/* A light Copilot window on the dark stage. */
function CopilotWindow({ children, height }: { children: ReactNode; height?: number }) {
  return (
    <div className="of-office" style={{ height, display: "flex", flexDirection: "column", borderRadius: 10, overflow: "hidden", boxShadow: W.float, background: W.copilotTint, colorScheme: "light", fontFamily: W.font, color: W.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: W.page, borderBottom: `1px solid ${W.edge}`, flexWrap: "wrap" }}>
        <CopilotMark size={24} />
        <b style={{ fontSize: 15.5, fontWeight: 600 }}>Copilot</b>
        <Protected />
        <span style={{ marginLeft: "auto", fontSize: 13, color: W.muted }}>Practice only. Nothing is really sent.</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
      <style>{OFFICE_CSS}</style>
    </div>
  );
}

/* ── Lesson 1: what it's good at, and where it guesses ──────────────── */

interface Round {
  prompt: string;
  reply: string;
  refs?: string[];
  /* true: fine to use after a read. false: it's guessing, check it. */
  trust: boolean;
  why: string;
}

const ROUNDS: Round[] = [
  { prompt: 'Make this sound more polite: "Send me the rota."', reply: "Could you send me the rota when you have a moment, please? Thank you.", trust: true, why: "Rewording is what it's best at. Read it through, and it's ready to use." },
  { prompt: "What time does Kent Bakery's delivery van arrive on Thursdays?", reply: "Kent Bakery's van usually arrives at 08:30 on Thursdays.", trust: false, why: "Copilot has no way of knowing that. There's no reference, and it still sounds sure: it made it up. Check the delivery log, or ask Sarah." },
  { prompt: "Summarise this: Hi all, the car park is being resurfaced on Saturday 14 November, so please park on Mill Lane that day. The gates open at 07:00 as usual. Thanks, Facilities", reply: "The car park is being resurfaced on Saturday 14 November. Park on Mill Lane that day. The gates still open at 07:00.", trust: true, why: "Summarising text you've given it is a strength. A quick look that the date still matches, and it's good." },
  { prompt: "What is 15 cases at £18.00 each, plus VAT?", reply: "15 cases at £18.00 is £270.00. VAT at 20% is £54.00, so the total is £314.00.", trust: false, why: "The total is wrong: £270.00 plus £54.00 is £324.00. AI can get sums wrong and sound certain. Do money in Excel, or on a calculator." },
  { prompt: "Explain what Cc means in an email.", reply: "Cc stands for carbon copy. People on the Cc line get a copy of the email to keep them in the loop, but they aren't expected to act on it. The people on the To line are the ones who need to reply or do something.", trust: true, why: "Explaining a general idea is a strength. This is right, and clear." },
  { prompt: "What did Priya agree with Harlow Packaging on the phone yesterday?", reply: "Priya agreed a 5% discount on Harlow Packaging's next order.", trust: false, why: "It wasn't on the call, and it has nothing to read about it. It invented an answer that sounds likely. Ask Priya." },
];

export function TrustLab({ onDone }: LabProps) {
  const [order] = useState(() => shuffle(ROUNDS.map((_, i) => i)));
  const [at, setAt] = useState(0);
  const [turn, setTurn] = useState<CopilotTurn | null>(null);
  const [pick, setPick] = useState<boolean | null>(null);
  const [right, setRight] = useState(0);
  const [finished, setFinished] = useState(false);
  const round = ROUNDS[order[at]];
  const choose = (trust: boolean) => {
    if (pick !== null) return;
    setPick(trust);
    if (trust === round.trust) setRight((n) => n + 1);
  };
  const next = () => {
    if (at + 1 < ROUNDS.length) {
      setAt(at + 1);
      setTurn(null);
      setPick(null);
    } else {
      setFinished(true);
      onDone({ correct: right, total: ROUNDS.length });
    }
  };
  if (finished) return <Done>All done. You judged {right} of {ROUNDS.length} answers right. The pattern: trust it with words you&apos;ve given it, check it on facts, numbers and anything it couldn&apos;t know.</Done>;
  return (
    <div>
      <StepBar at={at + 1} of={ROUNDS.length} label="Question" />
      <TheJob style={{ marginTop: 14 }}>Click the suggested prompt to put it in the box, then press Send. Read Copilot&apos;s answer, and decide whether you can use it.</TheJob>
      <Workspace style={{ marginTop: 14 }}>
        <CopilotWindow>
          <CopilotChat key={at} turns={turn ? [turn] : []} onAsk={(p) => setTurn(turnOf({ host: "app", prompt: p, kind: "help", reply: round.reply, refs: round.refs }))} layout="pane" suggestions={[{ label: round.prompt, fill: round.prompt }]} greeting="What would you like to ask?" placeholder="Ask Copilot" />
        </CopilotWindow>
      </Workspace>
      {turn && (
        <div style={{ marginTop: 16 }}>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: D.ink }}>Can you use this answer?</p>
          <div style={{ marginTop: 10, display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
            {[
              { trust: true, label: "Yes, after a quick read" },
              { trust: false, label: "No: it's guessing, so check it" },
            ].map((o) => {
              const picked = pick === o.trust;
              const isRight = pick !== null && o.trust === round.trust;
              return (
                <button key={o.label} type="button" disabled={pick !== null} onClick={() => choose(o.trust)} className="dr-option" style={{ minHeight: 54, padding: "12px 16px", fontSize: 16.5, fontWeight: 600, textAlign: "left", borderRadius: 14, fontFamily: D.sans, color: D.ink, cursor: pick !== null ? "default" : "pointer", background: isRight ? D.goodSoft : picked ? D.badSoft : D.glass, border: `1px solid ${isRight ? D.good : picked ? D.bad : D.edge}` }}>
                  {o.label}
                </button>
              );
            })}
          </div>
          {pick !== null && (
            <>
              <Feedback ok={pick === round.trust}>
                <b>{pick === round.trust ? "Right. " : "Not this time. "}</b>
                {round.why}
              </Feedback>
              <div style={{ marginTop: 16 }}>
                <Button onClick={next}>{at + 1 < ROUNDS.length ? "Next question" : "Finish"}</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Lesson 2: a prompt with the facts, the reader and the tone ─────── */

const OAK_NOTE = "Rita Fenwick at Oak Street Deli has emailed: can we add 10 packs of napkins to her order for Wednesday 11 November? Sarah says yes: they'll go on the van that gets there before 12:00.";

export function PromptLab({ onDone }: LabProps) {
  const brief = BRIEFS["oak-napkins"];
  const [turns, setTurns] = useState<CopilotTurn[]>([]);
  const [shown, setShown] = useState<CopilotTurn | null>(null);
  const [body, setBody] = useState("");
  const [finished, setFinished] = useState(false);
  const weak = turns.filter((t) => t.kind === "vague").length;
  const generate = (prompt: string) => {
    const t = turnOf(respond(prompt, { host: "outlook", brief: brief.id, weakSoFar: weak }));
    setTurns((ts) => [...ts, t]);
    setShown(t);
  };
  const regenerate = () => {
    if (!shown) return;
    const variant = (shown.variant ?? 0) + 1;
    const t = { ...shown, ...respond(shown.prompt, { host: "outlook", brief: brief.id, variant, weakSoFar: weak }), id: shown.id, variant };
    setTurns((ts) => ts.map((x) => (x.id === t.id ? t : x)));
    setShown(t);
  };
  const m = shown ? markPrompt(shown.prompt, brief) : null;
  const good = shown?.kind === "draft";
  const tries = turns.findIndex((t) => t.kind === "draft") + 1;
  const finish = () => {
    setFinished(true);
    onDone({ correct: tries <= 1 ? 3 : tries === 2 ? 2 : 1, total: 3 });
  };
  if (finished) return <Done>Done. That&apos;s the recipe: the facts, who it&apos;s for, and the tone. It works for any email you ask Copilot for.</Done>;
  return (
    <div>
      <TheJob>{OAK_NOTE}{"\n\n"}Reply to Rita using Draft with Copilot. Write your prompt, then press Generate.</TheJob>
      <Workspace style={{ marginTop: 14 }}>
        <div className="of-office" style={{ borderRadius: 10, overflow: "hidden", boxShadow: W.float, background: W.page, colorScheme: "light", fontFamily: W.font, color: W.ink }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 38, padding: "0 12px", background: W.outlook, color: "#fff", fontSize: 14 }}>
            <b>Outlook</b>
            <span style={{ opacity: 0.9 }}>Re: Napkins for Wednesday</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, padding: "4px 14px", borderBottom: `1px solid ${W.edge}`, fontSize: 15 }}>
            <span style={{ width: 60, color: W.muted }}>To</span>
            <span style={{ padding: "2px 10px", borderRadius: 14, background: W.select }}>Rita Fenwick</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, padding: "4px 14px", borderBottom: `1px solid ${W.edge}`, fontSize: 15 }}>
            <span style={{ width: 60, color: W.muted }}>Subject</span>Re: Napkins for Wednesday
          </div>
          <DraftPanel turn={shown} onGenerate={generate} onRegenerate={regenerate} onKeep={() => shown && setBody(shown.reply)} onDiscard={() => setShown(null)} />
          <textarea aria-label="Email message" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your email. Keep it puts Copilot's draft here." rows={6} style={{ display: "block", width: "100%", boxSizing: "border-box", border: "none", borderTop: `1px solid ${W.edge}`, marginTop: 10, padding: "12px 14px", fontFamily: W.font, fontSize: 15.5, lineHeight: 1.55, color: W.ink, background: W.page, resize: "vertical", outline: "none" }} />
          <style>{OFFICE_CSS}</style>
        </div>
      </Workspace>
      {m && shown && (
        <Results
          pass={good}
          title={good ? "That prompt has all three." : "Copilot needs more to go on. Add what's missing and Generate again:"}
          rows={[
            { label: "The facts: 10 packs, Wednesday 11 November, before 12:00", ok: m.facts, hint: m.wrongTip ?? `Missing: ${m.missing.join(", ")}.` },
            { label: "Who it's for: Rita at Oak Street Deli", ok: m.reader, hint: "Name the reader, so it writes to her." },
            { label: "The tone: friendly, polite, short or formal", ok: m.tone, hint: "Say how it should sound." },
          ]}
        >
          {good && (
            <>
              <p style={{ margin: "14px 0 0", fontSize: 16.5, lineHeight: 1.55 }}>
                Now read the draft against the note above. <b style={{ color: D.ink }}>Did you spot it?</b> It says Thursday 12 November. Rita&apos;s order is for Wednesday. A good prompt gets a good draft, not a perfect one: lesson 4 is all about catching this.
              </p>
              <div style={{ marginTop: 16 }}>
                <Button onClick={finish}>Finish</Button>
              </div>
            </>
          )}
        </Results>
      )}
    </div>
  );
}

/* ── Lesson 3: explain a formula, then use it ───────────────────────── */

const ORDERS: string[][] = [
  ["Customer", "Item", "Value"],
  ["Kent Bakery", "Flour (sacks)", "£360.00"],
  ["Oak Street Deli", "Napkins", "£54.00"],
  ["Bright Cafe", "Paper cups", "£270.00"],
  ["Kent Bakery", "Paper bags", "£64.00"],
  ["Oak Street Deli", "Paper cups", "£90.00"],
  ["Bright Cafe", "Lids", "£228.00"],
  ["Kent Bakery", "Flour (sacks)", "£180.00"],
  ["Oak Street Deli", "Paper bags", "£48.00"],
  ["", "", ""],
  ["Kent Bakery total", "", '=SUMIF(A2:A9,"Kent Bakery",C2:C9)'],
  ["Oak Street Deli total", "", ""],
  ["", "", ""],
  ["", "", ""],
];

export function ExplainLab({ onDone }: LabProps) {
  const [doc, setDoc] = useState<ExcelDoc>(() => ({ fileId: null, name: "Orders this week.xlsx", path: null, tabs: [{ name: "Sheet1", grid: ORDERS.map((r) => [...r]) }], active: 0, widths: [170, 120, 100], dirty: false }));
  const [turns, setTurns] = useState<CopilotTurn[]>([]);
  const [result, setResult] = useState<boolean[] | null>(null);
  const [finished, setFinished] = useState(false);
  const g: Grid = doc.tabs[0].grid;
  const ask = (prompt: string, ctx: { grid?: Grid; cell?: { name: string; raw: string } }) => setTurns((ts) => [...ts, turnOf(respond(prompt, { host: "excel", grid: ctx.grid, cell: ctx.cell, fileName: doc.name }))]);
  const oak = g[11]?.[2] ?? "";
  const rules = [
    { label: "You asked Copilot to explain the formula", hint: "Press Copilot on the ribbon. Click C11, then the suggestion Explain the formula in C11, then Send." },
    { label: "C12 holds a SUMIF for Oak Street Deli", hint: 'Click C12 and type =SUMIF(A2:A9,"Oak Street Deli",C2:C9). Copy Kent Bakery\'s and change the name.' },
    { label: "It gives Oak Street Deli's total: £192.00", hint: "Check the name is spelled exactly as in column A, in quotes, and the ranges are the same as C11: A2:A9 and C2:C9." },
  ];
  const check = () => {
    const asked = turns.some((t) => t.kind === "explain");
    const isSumif = /^=\s*SUMIF\(.*oak street deli/i.test(oak.trim());
    const v = evaluate(g, 11, 2);
    setResult([asked, isSumif, isSumif && v === 192]);
  };
  const pass = !!result && result.every(Boolean);
  if (finished) return <Done>Done. Copilot explained it; you used it. That&apos;s the right way round.</Done>;
  return (
    <div>
      <TheJob>{'Daniel totals each customer\'s orders with SUMIF. Kent Bakery\'s is in C11. Ask Copilot what that formula does (press Copilot on the ribbon). Then write one like it in C12 for Oak Street Deli, and press Check my sheet.'}</TheJob>
      <Workspace style={{ marginTop: 14 }}>
        <div style={{ overflowX: "auto" }}>
          <div className="of-office" style={{ minWidth: 720, height: 620, borderRadius: 8, overflow: "hidden", boxShadow: W.float, colorScheme: "light" }}>
            <Excel
              practice
              doc={doc}
              onChange={(tabs, active) => setDoc((d) => ({ ...d, tabs, active }))}
              onSave={() => {}}
              onSaveAs={() => {}}
              onClose={() => {}}
              pane={(ctx) => <SidePane turns={turns} onAsk={(p) => ask(p, ctx)} ctx={ctx} />}
            />
          </div>
        </div>
        <style>{OFFICE_CSS}</style>
      </Workspace>
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <Button onClick={check}>Check my sheet</Button>
        {oak.trim().startsWith("=") && <span style={{ fontSize: 16, color: D.muted }}>C12 shows {display(g, 11, 2)}</span>}
      </div>
      {result && (
        <Results pass={pass} title={pass ? "Spot on: Oak Street Deli's orders come to £192.00." : "Nearly there. Fix these, then check again:"} rows={rules.map((r, i) => ({ ...r, ok: result[i] }))}>
          <div style={{ marginTop: 16 }}>
            <Button
              kind={pass ? "primary" : "plain"}
              onClick={() => {
                setFinished(true);
                onDone({ correct: result.filter(Boolean).length, total: rules.length });
              }}
            >
              {pass ? "Finish" : "Skip this one for now"}
            </Button>
          </div>
        </Results>
      )}
    </div>
  );
}

/* ── Lesson 5: what must never go in ────────────────────────────────── */

type PasteTask =
  | {
      kind: "clean";
      scenario: string;
      text: string;
      /* Each personal detail, and how to tell it's gone. */
      gone: { label: string; test: RegExp }[];
      /* What must still be there for the summary to make sense. */
      keep: { label: string; test: RegExp; hint: string };
    }
  | { kind: "decide"; scenario: string; text: string; options: { text: string; correct?: boolean; why: string }[] };

const TASKS: PasteTask[] = [
  {
    kind: "clean",
    scenario: "Daniel wants this complaint summarised for the team meeting. Take every personal detail out of the box, keep what the complaint is about, then press Send.",
    text: "Summarise this complaint: Rita Fenwick (0116 496 0583, rita.fenwick@oakstreetdeli.example) from Oak Street Deli, 31 Oak Street, Leicester, says the napkins came at 14:00 on Tuesday, after the lunch rush. She wants morning deliveries from now on.",
    gone: [
      { label: "Rita's name", test: /\brita\b|\bfenwick\b/i },
      { label: "Her phone number", test: /0116\s*496\s*0583/ },
      { label: "Her email address", test: /@/ },
      { label: "The street address", test: /31\s+Oak Street/i },
    ],
    keep: { label: "It still says what went wrong: the napkins came late, and she wants mornings", test: /napkin[\s\S]*(late|14:00|lunch)|((late|14:00|lunch)[\s\S]*napkin)/i, hint: "Keep the complaint itself: the napkins came at 14:00, after the lunch rush." },
  },
  {
    kind: "clean",
    scenario: "Priya wants a polite chaser drafted for this overdue invoice. Take out the personal and payment details first, then Send.",
    text: "Write a polite chaser: Bright Cafe owes £432.00 on invoice NS-2207, now 14 days late. Our contact is Leah Morgan on 07700 900115. The card on file ends 6612.",
    gone: [
      { label: "Leah's name", test: /\bleah\b|\bmorgan\b/i },
      { label: "Her phone number", test: /07700\s*900\s*115/ },
      { label: "The card digits", test: /6612/ },
    ],
    keep: { label: "It still has what the chaser needs: the invoice, the amount and how late", test: /NS-?2207[\s\S]*432|432[\s\S]*NS-?2207/i, hint: "Keep invoice NS-2207 and the £432.00. Copilot needs those to write the chaser." },
  },
  {
    kind: "decide",
    scenario: "Emma in HR asks you to get Copilot to check the spelling in this before it goes to the managers. What do you do?",
    text: "October overtime: Jordan Miles, 12 hours, £186.00. Sam Okoye, 8 hours, £124.00. Pay date 27 November. NI numbers on the attached sheet.",
    options: [
      { text: "Don't paste it in. Check the spelling yourself.", correct: true, why: "It's pay. Pay, payroll and anything like an NI number never go into an AI tool, even at work. A short note like this is quick to check by eye." },
      { text: "Paste it in, but swap the names for Person A and B.", why: "The pay figures are still payroll. Some things don't go in at all, with or without names." },
      { text: "Paste it in: it's only a spelling check.", why: "What you're asking for doesn't matter. Whatever you paste is sent, and this is people's pay." },
    ],
  },
];

export function PasteLab({ onDone }: LabProps) {
  const [at, setAt] = useState(0);
  const [values, setValues] = useState(() => TASKS.map((t) => t.text));
  const [sent, setSent] = useState<(string | null)[]>(() => TASKS.map(() => null));
  const [picked, setPicked] = useState<number[]>([]);
  const [scores, setScores] = useState<{ correct: number; total: number }[]>(() => TASKS.map(() => ({ correct: 0, total: 0 })));
  const [finished, setFinished] = useState(false);
  const [order] = useState(() => TASKS.map((t) => (t.kind === "decide" ? shuffle(t.options.map((_, i) => i)) : [])));
  const task = TASKS[at];
  const next = () => {
    if (at + 1 < TASKS.length) {
      setAt(at + 1);
      setPicked([]);
      return;
    }
    const total = scores.reduce((n, s) => n + s.total, 0);
    const correct = scores.reduce((n, s) => n + s.correct, 0);
    setFinished(true);
    onDone({ correct, total });
  };
  const score = (s: { correct: number; total: number }) => setScores((xs) => xs.map((x, i) => (i === at ? s : x)));
  if (finished) return <Done>Done. Names, numbers, addresses, card digits and pay stay out. Swap a name for &ldquo;Customer A&rdquo; and the summary works just as well.</Done>;

  if (task.kind === "decide") {
    const last = picked[picked.length - 1];
    const solved = picked.some((i) => task.options[i].correct);
    return (
      <div>
        <StepBar at={at + 1} of={TASKS.length} label="Task" />
        <TheJob style={{ marginTop: 14 }}>{task.scenario}</TheJob>
        <Workspace style={{ marginTop: 14 }}>
          <CopilotWindow>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #e8a3ab", background: W.page, fontSize: 15.5, lineHeight: 1.55 }}>
                <Lit text={task.text} found={findPersonal(task.text)} />
              </div>
            </div>
          </CopilotWindow>
        </Workspace>
        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          {order[at].map((i) => {
            const o = task.options[i];
            const tried = picked.includes(i);
            return (
              <button
                key={i}
                type="button"
                disabled={solved || tried}
                onClick={() => {
                  if (picked.length === 0) score({ correct: o.correct ? 1 : 0, total: 1 });
                  setPicked((p) => [...p, i]);
                }}
                className="dr-option"
                style={{ textAlign: "left", minHeight: 54, padding: "14px 18px", fontSize: 17, lineHeight: 1.5, borderRadius: 14, fontFamily: D.sans, color: D.ink, cursor: solved || tried ? "default" : "pointer", background: tried ? (o.correct ? D.goodSoft : D.badSoft) : D.glass, border: `1px solid ${tried ? (o.correct ? D.good : D.bad) : D.edge}`, display: "flex", gap: 10 }}
              >
                {tried && (o.correct ? <Tick /> : <Cross />)}
                <span>{o.text}</span>
              </button>
            );
          })}
        </div>
        {last !== undefined && (
          <Feedback ok={!!task.options[last].correct}>
            <b>{task.options[last].correct ? "Right. " : "Not quite. "}</b>
            {task.options[last].why}
            {!task.options[last].correct && " Have another go."}
          </Feedback>
        )}
        {solved && (
          <div style={{ marginTop: 16 }}>
            <Button onClick={next}>{at + 1 < TASKS.length ? "Next task" : "Finish"}</Button>
          </div>
        )}
      </div>
    );
  }

  const value = values[at];
  const went = sent[at];
  const rows = went === null ? [] : [...task.gone.map((g) => ({ label: `${g.label} is out`, ok: !g.test.test(went), hint: `Delete it from the box before you send.` })), { label: task.keep.label, ok: task.keep.test.test(went), hint: task.keep.hint }];
  const pass = rows.length > 0 && rows.every((r) => r.ok);
  const left = went === null ? [] : findPersonal(went);
  return (
    <div>
      <StepBar at={at + 1} of={TASKS.length} label="Task" />
      <TheJob style={{ marginTop: 14 }}>{task.scenario}</TheJob>
      <Workspace style={{ marginTop: 14 }}>
        <CopilotWindow>
          <div style={{ padding: "14px 16px 16px" }}>
            <Composer
              value={value}
              setValue={(v) => setValues((vs) => vs.map((x, i) => (i === at ? v : x)))}
              onSend={() => {
                setSent((ss) => ss.map((x, i) => (i === at ? value : x)));
                const r = [...task.gone.map((g) => !g.test.test(value)), task.keep.test.test(value)];
                score({ correct: r.filter(Boolean).length, total: r.length });
              }}
              placeholder="Ask Copilot"
              known={[]}
              maxHeight={260}
              big
            />
          </div>
        </CopilotWindow>
      </Workspace>
      {went !== null && (
        <Results pass={pass} title={pass ? "Nothing personal went in, and Copilot still has what it needs." : "Not yet. Here's what went in:"} rows={rows}>
          <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 12, background: W.page, color: W.ink, fontFamily: W.font, fontSize: 15, lineHeight: 1.55 }}>
            <b style={{ display: "block", fontSize: 12.5, color: W.muted, letterSpacing: "0.04em", marginBottom: 4 }}>WHAT YOU SENT TO COPILOT</b>
            <Lit text={went} found={left} />
            {left.length > 0 && <span style={{ display: "block", marginTop: 6, fontSize: 13.5, color: "#a4262c" }}>It had {describePersonal(left)} in it.</span>}
          </div>
          <div style={{ marginTop: 16 }}>
            {pass ? (
              <Button onClick={next}>{at + 1 < TASKS.length ? "Next task" : "Finish"}</Button>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <span style={{ fontSize: 16, color: D.muted }}>Edit the box above and press Send again.</span>
                <Button kind="plain" onClick={next}>
                  Skip this one for now
                </Button>
              </span>
            )}
          </div>
        </Results>
      )}
    </div>
  );
}
