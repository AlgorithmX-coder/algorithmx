"use client";

import { Fragment, type CSSProperties, type ReactNode } from "react";
import { CopilotMark, Protected } from "../../office/apps/Copilot";
import { W } from "../../tokens";
import { AppWindow, FakeButton, FigureFrame, Part, type PartInfo } from "./parts";

/* Copilot, drawn the way it looks, with every part numbered (Module 12):
 * the whole Copilot pane, a reply being drafted with Copilot in Outlook, a
 * good prompt taken apart (what you want, who it's for, the tone, the
 * facts), a draft checked against the facts with its mistakes lit, Excel
 * with Copilot explaining a formula, a paste with the personal details
 * lit, and work Copilot beside a free AI tool. A lesson opens on one whole
 * picture; later cards pass `focus` to light only the parts they teach, and
 * `what` to say what a part means there.
 *
 * Phone-first: the pane, the draft and the prompt are one column with a
 * gutter on the left for their badges, so every badge a card names shows
 * at 390 wide. Only the email being checked and the Excel sheet are wider
 * than a phone; they scroll inside the frame, which opens on the lit part.
 * A part around words wraps the words only, never the punctuation beside
 * them, and keeps a few pixels clear of its neighbours. */

type What<K extends string> = Partial<Record<K, string>>;
function withWhat<K extends string>(parts: Record<K, PartInfo>, what?: What<K>): Record<K, PartInfo> {
  const info = { ...parts };
  for (const k of Object.keys(what ?? {}) as K[]) info[k] = { ...info[k], what: what![k]! };
  return info;
}

/* Words that must not be split across lines: "30 sacks", "Friday 13 November". */
const nb = (s: string) => s.replace(/ /g, " ").replace(/-/g, "‑");

const bubble: CSSProperties = { padding: "9px 12px", borderRadius: "12px 12px 4px 12px", background: W.copilotSoft, fontSize: 14, lineHeight: 1.5 };
const card: CSSProperties = { padding: "11px 12px", borderRadius: 10, background: W.page, border: `1px solid ${W.edge}`, boxShadow: "0 2px 8px -4px rgba(0,0,0,0.12)" };
const draftBox: CSSProperties = { whiteSpace: "pre-wrap", padding: "9px 11px", borderLeft: `3px solid ${W.copilot}`, background: W.copilotTint, borderRadius: 4, fontSize: 14, lineHeight: 1.55 };
const chip: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, border: "1px solid #d6d1f0", background: W.page, fontSize: 12.5, whiteSpace: "nowrap" };
const small: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 5, border: `1px solid ${W.edge}`, background: W.page, fontSize: 12.5, whiteSpace: "nowrap" };
/* the warning under an answer, with room inside its outline */
const noteText: CSSProperties = { display: "inline-block", padding: "3px 6px", fontSize: 12, color: W.muted };
/* a part drawn round a few words in a sentence: clear of the words beside it */
const inWords: CSSProperties = { borderRadius: 4, margin: "0 4px 0 5px", outlineOffset: 0 };
const ref = (name: string) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, background: W.chrome, fontSize: 12, color: W.body }}>
    <b style={{ color: W.copilot, fontSize: 11 }}>1</b> {name}
  </span>
);

/* One line of text that never wraps, with room above it for the badges
 * of the parts lit in it (a badge sits 32px above its part). */
const Line = ({ children, gap = 36 }: { children: ReactNode; gap?: number }) => <div style={{ marginTop: gap, whiteSpace: "nowrap", lineHeight: 1.6 }}>{children}</div>;

/* Words that must not be split, inside a sentence: the amounts, days,
 * dates, times and order numbers. */
const keep = (s: string) => s.replace(/\b(\d+ (?:sacks|packs|pallets)|(?:Monday|Tuesday|Wednesday|Thursday|Friday) \d+ November|before \d+:\d+|order \d+)\b/g, (m) => nb(m));

/* The left gutter a one-column figure keeps for its badges. */
const GUTTER = 40;

/* ── the whole Copilot pane ─────────────────────────────────────────── */

export type PanePart = "header" | "shield" | "asked" | "answer" | "refs" | "buttons" | "note" | "suggest" | "box";

export const PANE_PARTS: Record<PanePart, PartInfo> = {
  header: { n: 1, name: "Copilot", what: "Its mark and name. Open it from the taskbar, or with the Copilot button in Outlook, Word or Excel." },
  shield: { n: 2, name: "Protected", what: "You're signed in with your work account, so your company's data protection covers what you type. The rules on what you may paste still apply." },
  asked: { n: 3, name: "What you asked", what: "Your prompt, exactly as you sent it. Copilot doesn't know your business: only what you tell it, the files it can see, and general knowledge." },
  answer: { n: 4, name: "Copilot's answer", what: "A draft, a summary or an explanation. Written fast and sounding sure of itself, even when it's wrong." },
  refs: { n: 5, name: "References", what: "What it read to answer: an email, a file. No reference means it's going on general knowledge." },
  buttons: { n: 6, name: "Copy, Insert, Regenerate", what: "Copy copies it, for you to paste. Insert puts it straight into your email or document. Regenerate asks for another wording." },
  note: { n: 7, name: "\"May be incorrect\"", what: "Copilot's own warning, under every answer. It means it: you check before you use." },
  suggest: { n: 8, name: "Suggested prompts", what: "Ideas for what to ask next. Clicking one usually sends it to Copilot straight away, so read it before you click." },
  box: { n: 9, name: "The prompt box", what: "Where you type, or paste, what you want. Enter sends it." },
};

export function CopilotFigure({ focus, title = "The Copilot pane", what, note }: { focus?: PanePart[]; title?: string; what?: What<PanePart>; note?: string }) {
  return (
    <FigureFrame info={withWhat(PANE_PARTS, what)} focus={focus} title={title} note={note}>
      <div style={{ maxWidth: 520, margin: "0 auto", background: W.copilotTint, borderRadius: 10, border: `1px solid ${W.edge}`, boxShadow: W.float }}>
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 48, rowGap: 18, padding: `10px 44px 10px ${GUTTER}px`, background: W.page, borderBottom: `1px solid ${W.edge}`, borderRadius: "10px 10px 0 0" }}>
          <Part k="header" block={false} badge="left">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "2px 4px" }}>
              <CopilotMark size={24} />
              <b style={{ fontSize: 15.5, fontWeight: 600 }}>Copilot</b>
            </span>
          </Part>
          <Part k="shield" block={false} badge="left">
            <Protected />
          </Part>
          <span style={{ position: "absolute", right: 14, top: 12, color: W.muted, fontSize: 15 }}>✕</span>
        </div>
        <div style={{ display: "grid", gap: 16, padding: `16px 14px 14px ${GUTTER}px` }}>
          <Part k="asked" badge="left">
            <div style={bubble}>{keep("Write a short, friendly reply to Sarah. The two missing pallets from order 4417 arrive tomorrow before 10:00.")}</div>
          </Part>
          <div style={{ display: "grid", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>
              <CopilotMark size={20} /> Copilot
            </span>
            <div style={{ ...card, display: "grid", gap: 12, marginLeft: -2 }}>
              <Part k="answer" badge="left">
                <div style={draftBox}>{keep("Hi Sarah,\n\nGood news: the two missing pallets from order 4417 arrive tomorrow before 10:00.\n\nThanks,\nJordan")}</div>
              </Part>
              <Part k="refs" block={false} badge="left" style={{ justifySelf: "start" }}>
                <span style={{ display: "inline-flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "2px 4px", fontSize: 12, color: W.muted }}>
                  1 reference {ref("Delivery 4417 is two pallets short")}
                </span>
              </Part>
              <Part k="buttons" block={false} badge="left" style={{ justifySelf: "start" }}>
                <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, padding: 2 }}>
                  <span style={small}>⧉ Copy</span>
                  <span style={small}>⤓ Insert</span>
                  <span style={small}>↻ Regenerate</span>
                </span>
              </Part>
            </div>
            <Part k="note" block={false} badge="left" style={{ justifySelf: "start", marginTop: 12 }}>
              <span style={noteText}>AI-generated content may be incorrect.</span>
            </Part>
          </div>
        </div>
        <div style={{ display: "grid", gap: 16, padding: `14px 14px 16px ${GUTTER}px`, borderTop: `1px solid ${W.edge}` }}>
          <Part k="suggest" badge="left" style={{ justifySelf: "start" }}>
            <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, padding: 2 }}>
              <span style={chip}>Make it shorter</span>
              <span style={chip}>Make it more formal</span>
              <span style={chip}>Explain a formula</span>
            </span>
          </Part>
          <Part k="box" badge="left">
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, border: "1px solid #d6d1f0", background: W.page, color: W.faint, fontSize: 14.5 }}>
              <span style={{ flex: 1 }}>Ask Copilot</span>
              <span style={{ color: W.copilot }}>➤</span>
            </div>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── a reply, drafted with Copilot in Outlook ───────────────────────── */

export type DraftPart = "button" | "reply" | "prompt" | "generate" | "draft" | "keep" | "note" | "original";

export const DRAFT_PARTS: Record<DraftPart, PartInfo> = {
  button: { n: 1, name: "Copilot", what: "In your reply's bar, beside Send. It opens Draft with Copilot, right inside your email." },
  reply: { n: 2, name: "Your reply", what: "You pressed Reply on Imran's email, so it's already addressed to him, with Re: and his subject." },
  prompt: { n: 3, name: "Your prompt", what: "What you want written. The better this is, the better the draft: what you want, who it's for, the tone and the facts." },
  generate: { n: 4, name: "Generate", what: "Copilot writes a draft from your prompt, in a few seconds." },
  draft: { n: 5, name: "The draft", what: "Copilot's attempt. It reads well. That doesn't make it right." },
  keep: { n: 6, name: "Keep it, Regenerate, Discard", what: "Keep it puts the draft into your email, for you to check and edit. Regenerate asks for another wording." },
  note: { n: 7, name: "\"May be incorrect\"", what: "The warning under every draft. You're the one who presses Send." },
  original: { n: 8, name: "The email you're answering", what: "Imran's email, underneath your reply. Copilot can read it, and it's what your reply has to answer." },
};

export const KENT_PROMPT = "Write a reply to Imran Ahmed, a customer at Kent Bakery. Keep it short and friendly. Confirm his flour order is now 30 sacks, delivered on Thursday 12 November, before 10:00.";
export const KENT_DRAFT = "Hi Imran,\n\nThanks for getting in touch. Good news: your flour order is now 30 sacks, and we'll have it with you on Friday 13 November, before 10:00.\n\nWe'd also like to give you 10% off this order, as a thank you.\n\nBest wishes,\nNorthfield Supplies";

const outlookField: CSSProperties = { display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "4px 10px", borderBottom: `1px solid ${W.edge}`, fontSize: 14 };

export function DraftFigure({ focus, title = "Draft with Copilot, in an Outlook reply", what, note }: { focus?: DraftPart[]; title?: string; what?: What<DraftPart>; note?: string }) {
  return (
    <FigureFrame info={withWhat(DRAFT_PARTS, what)} focus={focus} title={title} note={note} minWidth={380}>
      <AppWindow app="Outlook" colour={W.outlook} title="Re: Thursday's flour">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", padding: `9px 12px 9px ${GUTTER}px`, background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <FakeButton primary>➤ Send</FakeButton>
          <Part k="button" block={false} badge="right" style={{ marginRight: 36 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, padding: "3px 12px 3px 6px", borderRadius: 5, border: `1px solid ${W.copilot}`, background: W.copilotSoft, fontSize: 13.5 }}>
              <CopilotMark size={20} /> Copilot
            </span>
          </Part>
          <FakeButton>📎 Attach</FakeButton>
        </div>
        <div style={{ padding: `8px 12px 0 ${GUTTER}px` }}>
          <Part k="reply">
            <div>
              <div style={outlookField}>
                <span style={{ width: 54, color: W.muted }}>To</span>
                <span style={{ padding: "2px 10px", borderRadius: 12, background: W.select }}>Imran Ahmed</span>
              </div>
              <div style={outlookField}>
                <span style={{ width: 54, color: W.muted }}>Subject</span>
                <span>Re: Thursday&apos;s flour</span>
              </div>
            </div>
          </Part>
        </div>
        <div style={{ margin: `16px 6px 0 ${GUTTER}px`, padding: 2, borderRadius: 10, background: W.copilotMark }}>
          <div style={{ padding: "11px 8px 14px", borderRadius: 8, background: W.page, display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap: 22 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14.5 }}>
              <CopilotMark size={20} /> Draft with Copilot
            </span>
            <Part k="prompt" badge="left" style={{ marginLeft: -4 }}>
              <div style={{ padding: "8px 8px", border: "1px solid #d6d1f0", borderRadius: 6, fontSize: 14, lineHeight: 1.5 }}>{keep(KENT_PROMPT)}</div>
            </Part>
            <Part k="generate" block={false} badge="left" style={{ justifySelf: "start", marginLeft: -4 }}>
              <span style={{ display: "inline-flex", minHeight: 30, alignItems: "center", padding: "3px 14px", borderRadius: 5, background: W.copilot, color: "#fff", fontWeight: 700, fontSize: 13.5 }}>Generate</span>
            </Part>
            <Part k="draft" badge="left" style={{ marginLeft: -4 }}>
              <div style={draftBox}>{keep(KENT_DRAFT)}</div>
            </Part>
            <Part k="keep" block={false} badge="left" style={{ justifySelf: "start", marginLeft: -4 }}>
              <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6, padding: 2 }}>
                <span style={{ ...small, background: W.copilot, color: "#fff", border: "none", fontWeight: 700 }}>Keep it</span>
                <span style={small}>↻ Regenerate</span>
                <span style={small}>Discard</span>
              </span>
            </Part>
            <Part k="note" block={false} badge="left" style={{ justifySelf: "start", marginLeft: -4 }}>
              <span style={noteText}>AI-generated content may be incorrect.</span>
            </Part>
          </div>
        </div>
        <div style={{ padding: `16px 12px 18px ${GUTTER}px` }}>
          <Part k="original" badge="left">
            <div style={{ padding: "8px 12px", borderLeft: `3px solid ${W.edge}`, color: W.muted, fontSize: 13, lineHeight: 1.5 }}>
              <b>From:</b> Imran Ahmed · 09:12
              <br />
              Can you confirm Thursday&apos;s flour change?
            </div>
          </Part>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── a good prompt, taken apart ─────────────────────────────────────── */

export type PromptPart = "ask" | "reader" | "tone" | "facts";

export const PROMPT_PARTS: Record<PromptPart, PartInfo> = {
  ask: { n: 1, name: "What you want", what: "A reply, an email, a summary. Start with the job: \"Write a reply\"." },
  reader: { n: 2, name: "Who it's for", what: "The reader, and who they are to you: a customer, your manager, a supplier. It changes the greeting and the wording." },
  tone: { n: 3, name: "The tone", what: `How it should sound: short, friendly, polite, formal. Without it you get stiff, ${nb("middle-of-the-road")} wording.` },
  facts: { n: 4, name: "The facts", what: "Every number, day, date and time it needs. Copilot may guess them from the email you're answering, and a guess reads just like a fact. Give it every one." },
};

const PROMPT: [PromptPart, string, string][] = [
  ["ask", "Write a reply", "#e6f0fb"],
  ["reader", "to Imran Ahmed, a customer at Kent Bakery.", "#e7f4ea"],
  ["tone", "Keep it short and friendly.", "#fdf1d8"],
  ["facts", "Confirm his flour order is now 30 sacks, delivered on Thursday 12 November, before 10:00.", "#f3e8fb"],
];

export function PromptFigure({ focus, title = "A good prompt, part by part", what, note }: { focus?: PromptPart[]; title?: string; what?: What<PromptPart>; note?: string }) {
  return (
    <FigureFrame info={withWhat(PROMPT_PARTS, what)} focus={focus} title={title} note={note}>
      <div style={{ maxWidth: 620, margin: "0 auto", padding: `14px 14px 18px ${GUTTER}px`, borderRadius: 12, border: "1px solid #d6d1f0", background: W.page, boxShadow: W.float }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: W.muted }}>
          <CopilotMark size={20} /> Draft with Copilot
        </span>
        <div style={{ display: "grid", gap: 14, marginTop: 14, fontSize: 17, lineHeight: 1.5 }}>
          {PROMPT.map(([k, text, colour]) => (
            <Part key={k} k={k} badge="left" style={{ justifySelf: "start" }}>
              <span style={{ display: "block", padding: "3px 8px", borderRadius: 4, background: colour }}>{keep(text)}</span>
            </Part>
          ))}
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── a draft checked against the facts ──────────────────────────────── */

export type CheckPart = "facts" | "draft" | "qty" | "time" | "day" | "offer" | "send";

export const CHECK_PARTS: Record<CheckPart, PartInfo> = {
  facts: { n: 1, name: "The facts", what: "Where they really come from: Sarah's email. Not Copilot, and not your memory." },
  draft: { n: 2, name: "Copilot's draft", what: "In your reply now, ready to check line by line." },
  qty: { n: 3, name: "It matches: the amount", what: `${nb("30 sacks")}, as in Sarah's email. Tick it off.` },
  time: { n: 4, name: "It matches: the time", what: `${nb("Before 10:00")}, as in Sarah's email. Tick it off too.` },
  day: { n: 5, name: "A wrong day", what: `${nb("Friday 13 November")}. Sarah said ${nb("Thursday 12 November")}. AI slips on days and dates, and sounds just as sure.` },
  offer: { n: 6, name: "Something nobody said", what: "A 10% discount. Nobody agreed to one: Sarah said same price per sack. AI fills gaps with things that sound nice." },
  send: { n: 7, name: "Send", what: "Yours to press, once it's right. Once it's gone, the customer holds you to every word, not Copilot." },
};

const lit = (k: CheckPart, text: string, ok: boolean) => (
  <Part k={k} block={false} badge="top" style={inWords}>
    <span style={{ padding: "1px 4px", borderRadius: 4, background: ok ? "#dff6dd" : "#fde2e4", boxShadow: ok ? "inset 0 -2px 0 #107c10" : "inset 0 -2px 0 #c4314b" }}>{nb(text)}</span>
  </Part>
);

/* `fixed`: the same draft after checking: the right day, and no discount. */
export function CheckFigure({ focus, title = "Checking the draft against the facts", what, note, fixed }: { focus?: CheckPart[]; title?: string; what?: What<CheckPart>; note?: string; fixed?: boolean }) {
  const fact = (text: string) => (
    <li style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
      <span style={{ color: "#107c10", fontWeight: 700 }}>✓</span>
      {text}
    </li>
  );
  return (
    <FigureFrame info={withWhat(CHECK_PARTS, what)} focus={focus} title={title} note={note}>
      {/* side by side on a wide screen; on a phone the facts sit on top and the
       * email keeps its width, scrolling sideways inside the frame */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "22px 22px", alignItems: "flex-start" }}>
        <Part k="facts" badge="top" style={{ marginTop: 26, flex: "0 0 220px" }}>
          <div style={{ padding: "12px 14px", borderRadius: 8, background: W.paper, border: `1px solid ${W.edge}`, fontSize: 14, lineHeight: 1.5 }}>
            <b style={{ display: "block", fontSize: 12.5, color: W.muted, marginBottom: 6 }}>FROM SARAH&apos;S EMAIL</b>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
              {fact("30 sacks of flour")}
              {fact("Thursday 12 November")}
              {fact("First van, before 10:00")}
              {fact("Same price per sack")}
            </ul>
          </div>
        </Part>
        <div style={{ flex: "1 1 430px", minWidth: 430 }}>
          <AppWindow app="Outlook" colour={W.outlook} title="Re: Thursday's flour">
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px 9px 46px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
              <Part k="send" block={false} badge="left">
                <FakeButton primary>➤ Send</FakeButton>
              </Part>
            </div>
            <div style={{ padding: "8px 18px 18px 46px" }}>
              <Part k="draft" badge="left" holds={["qty", "time", "day", "offer"]}>
                <div style={{ fontSize: 14.5, padding: "4px 4px 6px" }}>
                  <Line gap={10}>Hi Imran,</Line>
                  <Line>
                    <span>Good news: your flour order is now</span>
                    {lit("qty", "30 sacks", true)}
                    <span>,</span>
                  </Line>
                  <Line>
                    <span>delivered on</span>
                    {fixed ? lit("day", "Thursday 12 November", true) : lit("day", "Friday 13 November", false)}
                    <span>,</span>
                    {lit("time", "before 10:00", true)}
                    <span>.</span>
                  </Line>
                  {!fixed && <Line>{lit("offer", "We'd also like to give you 10% off this order.", false)}</Line>}
                  <Line gap={fixed ? 18 : 14}>Best wishes,</Line>
                </div>
              </Part>
            </div>
          </AppWindow>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── Excel, with Copilot explaining a formula ───────────────────────── */

export type ExcelAiPart = "button" | "bar" | "column" | "cell" | "pane" | "question" | "explain" | "note";

export const EXCEL_AI_PARTS: Record<ExcelAiPart, PartInfo> = {
  button: { n: 1, name: "Copilot on the ribbon", what: "Opens Copilot down the side of Excel, where it can see the sheet that's open." },
  bar: { n: 2, name: "The formula bar", what: "Shows what's really in the selected cell: the formula, not just its answer." },
  column: { n: 3, name: "Column F, Status", what: "What the formula looks through: every row of column F. Three of them say Late." },
  cell: { n: 4, name: "The cell", what: "D9, where the count goes. You type the formula here yourself, and Excel shows the answer: 3." },
  pane: { n: 5, name: "The Copilot pane", what: "Copilot, beside your sheet. It reads the sheet to answer. The cross at its top right closes it." },
  question: { n: 6, name: "Your question", what: "The formula, pasted in, and what you want to know about it." },
  explain: { n: 7, name: "The explanation", what: "What each piece means, in plain words. Read it, then use the formula yourself." },
  note: { n: 8, name: "\"May be incorrect\"", what: "Explaining is a strength. Counting for you isn't: check any number it gives you." },
};

/* Columns C to G of the log; A and B (the date and the delivery note) are
 * hidden, as Excel shows it, with the double line. */
const LOG_COLS = [
  { col: "C", head: "Supplier", w: 112 },
  { col: "D", head: "Booked", w: 48 },
  { col: "E", head: "Arrived", w: 48 },
  { col: "F", head: "Status", w: 56 },
  { col: "G", head: "Notes", w: 132 },
] as const;
const LOG_ROWS: string[][] = [
  ["Harlow Packaging", "08:30", "08:40", "On time", ""],
  ["Brightwater Cups", "09:00", "11:20", "Late", "Van broke down"],
  ["Kent Flour Mills", "09:30", "09:25", "On time", "Rang to say he'd be late"],
  ["Harlow Packaging", "10:00", "13:40", "Late", "2 pallets short"],
  ["Fenwick Foods", "09:00", "08:45", "On time", ""],
  ["Kent Flour Mills", "09:30", "11:50", "Late", ""],
  ["", "", "", "", ""],
  ["Late so far", "3", "", "", ""],
];

export function ExcelCopilotFigure({ focus, title = "Excel, with Copilot down the side", what, note = "Columns A and B, the date and the delivery note, are hidden here to save space: the double line in the headings shows where.", done = true }: { focus?: ExcelAiPart[]; title?: string; what?: What<ExcelAiPart>; note?: string; done?: boolean }) {
  const cellS: CSSProperties = { padding: "0 6px", height: 26, display: "flex", alignItems: "center", borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, fontSize: 12, whiteSpace: "nowrap", overflow: "hidden", boxSizing: "border-box" };
  const head: CSSProperties = { ...cellS, justifyContent: "center", background: W.sunk, color: W.muted, fontSize: 12 };
  const rowsN = LOG_ROWS.length + 1;
  return (
    <FigureFrame info={withWhat(EXCEL_AI_PARTS, what)} focus={focus} title={title} note={note} minWidth={450}>
      <AppWindow app="Excel" colour={W.excel} title="2026-11-06 Deliveries this week.xlsx">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", padding: `8px 12px 8px ${GUTTER}px`, background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <Part k="button" block={false} badge="left">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, padding: "3px 12px 3px 6px", borderRadius: 5, border: `1px solid ${W.copilot}`, background: W.copilotSoft, fontSize: 13.5 }}>
              <CopilotMark size={20} /> Copilot
            </span>
          </Part>
          <FakeButton>Save</FakeButton>
          <FakeButton>⏷ Filter</FakeButton>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "stretch" }}>
          {/* the sheet: wider than a phone, so it scrolls in the frame there */}
          <div style={{ flex: "1 1 440px", minWidth: 440, padding: "12px 12px 16px 30px" }}>
            <Part k="bar">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ width: 40, padding: "4px 6px", border: `1px solid ${W.edge}` }}>D9</span>
                <i style={{ fontFamily: "serif", color: W.muted }}>fx</i>
                <span style={{ flex: 1, padding: "4px 8px", border: `1px solid ${W.edge}`, fontFamily: "Consolas, ui-monospace, monospace", whiteSpace: "nowrap" }}>{done ? '=COUNTIF(F:F,"Late")' : ""}</span>
              </div>
            </Part>
            <div style={{ marginTop: 40, display: "flex", borderLeft: `1px solid ${W.edge}`, borderTop: `1px solid ${W.edge}`, width: "fit-content" }}>
              {/* row numbers, with the hidden columns' double line on their right */}
              <div style={{ width: 24, borderRight: `3px double ${W.faint}` }}>
                <span style={head} />
                {Array.from({ length: rowsN - 1 }, (_, i) => (
                  <span key={i} style={head}>
                    {i + 2}
                  </span>
                ))}
              </div>
              {LOG_COLS.map((c, ci) => {
                const column = (
                  <div style={{ width: c.w }}>
                    <span style={{ ...head, ...(c.col === "F" ? { background: "#cfe6d8", color: W.excel, fontWeight: 700 } : {}) }}>{c.col}</span>
                    <b style={{ ...cellS, background: "#e6f2ea" }}>{c.head}</b>
                    {LOG_ROWS.map((row, ri) => {
                      const v = row[ci];
                      const count = c.col === "D" && ri === LOG_ROWS.length - 1;
                      const late = c.col === "F" && v === "Late";
                      const cell = (
                        <span key={ri} style={{ ...cellS, justifyContent: count || c.col === "D" || c.col === "E" ? "flex-end" : "flex-start", color: c.col === "G" ? W.body : undefined, fontWeight: late ? 600 : 400, ...(count ? { outline: `2px solid ${W.excel}`, outlineOffset: -2 } : {}) }}>
                          {count ? (done ? "3" : "") : v}
                        </span>
                      );
                      return count ? (
                        <Part key={ri} k="cell" badge="right" style={{ borderRadius: 0 }}>
                          {cell}
                        </Part>
                      ) : (
                        cell
                      );
                    })}
                  </div>
                );
                return c.col === "F" ? (
                  <Part key={c.col} k="column" badge="top" style={{ borderRadius: 0 }}>
                    {column}
                  </Part>
                ) : (
                  <Fragment key={c.col}>{column}</Fragment>
                );
              })}
            </div>
          </div>
          {/* the pane: beside the sheet on a laptop, under it on a phone */}
          <div style={{ flex: "1 1 250px", minWidth: 0, maxWidth: "min(340px, calc(100vw - 130px))", borderLeft: `1px solid ${W.edge}`, background: W.copilotTint, padding: "38px 14px 14px 14px" }}>
            <Part k="pane" badge="top" holds={["question", "explain", "note"]}>
              <div style={{ display: "grid", gap: 38, padding: 4 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14 }}>
                  <CopilotMark size={20} /> Copilot
                  <span style={{ marginLeft: "auto", color: W.muted, fontWeight: 400, fontSize: 14 }}>✕</span>
                </span>
                <Part k="question" badge="top">
                  <div style={{ ...bubble, fontSize: 13 }}>What does =COUNTIF(F:F,&quot;Late&quot;) do?</div>
                </Part>
                <Part k="explain" badge="top">
                  <div style={{ ...card, fontSize: 13, lineHeight: 1.5 }}>
                    It counts how many cells in column F, the Status column, say exactly &quot;Late&quot;.
                    <br />• COUNTIF: count the cells that match.
                    <br />• F:F: every row of column F.
                    <br />• &quot;Late&quot;: what to look for.
                  </div>
                </Part>
                <Part k="note" block={false} badge="top" style={{ justifySelf: "start" }}>
                  <span style={noteText}>AI-generated content may be incorrect.</span>
                </Part>
              </div>
            </Part>
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── a paste, with the personal details lit ─────────────────────────── */

export type PastePart = "name" | "phone" | "email" | "card" | "address" | "warning" | "clean";

export const PASTE_PARTS: Record<PastePart, PartInfo> = {
  name: { n: 1, name: "A name", what: "A real customer, by name. Swap it for \"Customer A\": the summary still makes sense." },
  phone: { n: 2, name: "A phone number", what: "Copilot never needs one to summarise. Delete it." },
  email: { n: 3, name: "An email address", what: "Personal, even at work. Delete it." },
  card: { n: 4, name: "Card digits", what: "Even the last four. Payment details stay out." },
  address: { n: 5, name: "An address", what: "Where someone lives or works. Leave it out, or just say the town." },
  warning: { n: 6, name: "The warning line", what: "The office's paste box spots details like these and lights them up. It won't stop you sending. That's your job." },
  clean: { n: 7, name: "What to send instead", what: "The same complaint, with nobody in it. Copilot can summarise this just as well." },
};

const pii = (k: PastePart, text: string) => (
  <Part k={k} block={false} badge="top" style={inWords}>
    <mark style={{ background: "#fde2e4", color: "inherit", borderRadius: 3, boxShadow: "inset 0 -2px 0 #c4314b", padding: "0 3px" }}>{nb(text)}</mark>
  </Part>
);

export function PasteFigure({ focus, title = `A paste, with the personal ${nb("details lit")}`, what, note }: { focus?: PastePart[]; title?: string; what?: What<PastePart>; note?: string }) {
  const box = (children: ReactNode, red: boolean) => <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${red ? "#e8a3ab" : "#d6d1f0"}`, background: W.page, fontSize: 15, lineHeight: 1.6, boxShadow: "0 2px 10px -4px rgba(80,60,180,0.25)" }}>{children}</div>;
  return (
    <FigureFrame info={withWhat(PASTE_PARTS, what)} focus={focus} title={title} note={note} minWidth={560}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gap: 12, paddingLeft: 30 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: W.muted }}>
          <CopilotMark size={20} /> About to send to Copilot
        </span>
        {box(
          <>
            <Line gap={4}>Summarise this complaint:</Line>
            <Line>
              {pii("name", "Leah Moss")}
              <span>(</span>
              {pii("phone", "07700 900214")}
              <span>,</span>
              {pii("email", "leah.moss@brightcafe.example")}
              <span>) says</span>
            </Line>
            <Line>
              <span>her</span>
              {pii("card", "card ending 5582")}
              <span>was charged twice for order 4429.</span>
            </Line>
            <Line>
              <span>Bright Cafe,</span>
              {pii("address", "4 Example Road")}
              <span>, Leicester.</span>
            </Line>
          </>,
          true,
        )}
        <Part k="warning">
          <p style={{ margin: 0, padding: "7px 10px", borderRadius: 8, background: "#fdf0f1", border: "1px solid #f1c3c9", color: "#8a1c2b", fontSize: 13.5, lineHeight: 1.45 }}>
            <b>Personal details in your message:</b> a name, a phone number, an email address, card digits and an address. Copilot gets whatever you send.
          </p>
        </Part>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, fontWeight: 600, color: W.muted }}>
          <CopilotMark size={20} /> Send this instead
        </span>
        <Part k="clean">
          {box(
            <>
              Summarise this complaint:
              <br />
              Customer A at Bright Cafe says their card was charged twice for order 4429.
            </>,
            false,
          )}
        </Part>
      </div>
    </FigureFrame>
  );
}

/* ── work Copilot, beside a free AI tool ────────────────────────────── */

export type ToolPart = "work" | "free";

export const TOOL_PARTS: Record<ToolPart, PartInfo> = {
  work: { n: 1, name: "Copilot at work", what: "Signed in with your work account: the shield says your company's data protection covers what you type." },
  free: { n: 2, name: "A free AI tool on the web", what: "No work account, no shield. It may keep what you type, and some use it to train their next version." },
};

export function ToolsFigure({ focus, title = "Work Copilot, and a free tool", what, note }: { focus?: ToolPart[]; title?: string; what?: What<ToolPart>; note?: string }) {
  const frame: CSSProperties = { borderRadius: 10, border: `1px solid ${W.edge}`, background: W.page, boxShadow: W.float, overflow: "hidden" };
  return (
    <FigureFrame info={withWhat(TOOL_PARTS, what)} focus={focus} title={title} note={note}>
      <div style={{ display: "grid", gap: 22, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 230px), 1fr))", paddingLeft: GUTTER - 10 }}>
        <Part k="work" badge="left">
          <div style={frame}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: `1px solid ${W.edge}` }}>
              <CopilotMark size={22} />
              <b style={{ fontSize: 15, fontWeight: 600 }}>Copilot</b>
              <Protected />
            </div>
            <p style={{ margin: 0, padding: "12px", fontSize: 13.5, color: W.muted, background: W.copilotTint }}>Signed in with your work account</p>
          </div>
        </Part>
        <Part k="free" badge="left">
          <div style={frame}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: W.chrome, borderBottom: `1px solid ${W.edge}`, fontSize: 13, color: W.muted }}>
              <span style={{ flex: 1, padding: "3px 10px", borderRadius: 999, background: W.page, border: `1px solid ${W.edge}` }}>free-ai-chat.example</span>
            </div>
            <div style={{ padding: 12, display: "grid", gap: 8 }}>
              <b style={{ fontSize: 15, fontWeight: 600 }}>Ask me anything</b>
              <span style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${W.edge}`, fontSize: 13.5, color: W.faint }}>Message</span>
            </div>
          </div>
        </Part>
      </div>
    </FigureFrame>
  );
}
