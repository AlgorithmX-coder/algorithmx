"use client";

import type { CSSProperties, ReactNode } from "react";
import { CopilotMark, Protected } from "../../office/apps/Copilot";
import { W } from "../../tokens";
import { AppWindow, FakeButton, FigureFrame, Part, type PartInfo } from "./parts";

/* Copilot, drawn the way it looks, with every part numbered (Module 12):
 * the whole Copilot pane, a reply being drafted with Copilot in Outlook, a
 * good prompt taken apart (facts, reader, tone), a draft checked against
 * the facts with its mistakes lit, Excel with Copilot explaining a
 * formula, and a paste with the personal details lit. A lesson opens on
 * one whole picture; later cards pass `focus` to light only the parts they
 * teach, and `what` to say what a part means there. */

type What<K extends string> = Partial<Record<K, string>>;
function withWhat<K extends string>(parts: Record<K, PartInfo>, what?: What<K>): Record<K, PartInfo> {
  const info = { ...parts };
  for (const k of Object.keys(what ?? {}) as K[]) info[k] = { ...info[k], what: what![k]! };
  return info;
}

const bubble: CSSProperties = { padding: "9px 12px", borderRadius: "12px 12px 4px 12px", background: W.copilotSoft, fontSize: 14, lineHeight: 1.5 };
const card: CSSProperties = { padding: "11px 12px", borderRadius: 10, background: W.page, border: `1px solid ${W.edge}`, boxShadow: "0 2px 8px -4px rgba(0,0,0,0.12)" };
const draftBox: CSSProperties = { whiteSpace: "pre-wrap", padding: "9px 11px", borderLeft: `3px solid ${W.copilot}`, background: W.copilotTint, borderRadius: 4, fontSize: 14, lineHeight: 1.55 };
const chip: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, border: "1px solid #d6d1f0", background: W.page, fontSize: 12.5, whiteSpace: "nowrap" };
const small: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 5, border: `1px solid ${W.edge}`, background: W.page, fontSize: 12.5, whiteSpace: "nowrap" };
const noteText: CSSProperties = { fontSize: 12, color: W.muted };
const ref = (name: string) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, background: W.chrome, fontSize: 12, color: W.body }}>
    <b style={{ color: W.copilot, fontSize: 11 }}>1</b> {name}
  </span>
);

/* One line of text that never wraps, with room above it for the badges
 * of the parts lit in it (a badge sits 32px above its part). */
const Line = ({ children, gap = 36 }: { children: ReactNode; gap?: number }) => <div style={{ marginTop: gap, whiteSpace: "nowrap", lineHeight: 1.6 }}>{children}</div>;

/* ── the whole Copilot pane ─────────────────────────────────────────── */

export type PanePart = "header" | "shield" | "asked" | "answer" | "refs" | "buttons" | "note" | "suggest" | "box";

export const PANE_PARTS: Record<PanePart, PartInfo> = {
  header: { n: 1, name: "Copilot", what: "Its mark and name. Open it from the taskbar, or with the Copilot button in Outlook, Word or Excel." },
  shield: { n: 2, name: "Protected", what: "You're signed in with your work account, so your company's data protection covers what you type. The rules on what you may paste still apply." },
  asked: { n: 3, name: "What you asked", what: "Your prompt, exactly as you sent it. Copilot only knows what's in here and in the files it can see." },
  answer: { n: 4, name: "Copilot's answer", what: "A draft, a summary or an explanation. Written fast and sounding sure of itself, even when it's wrong." },
  refs: { n: 5, name: "References", what: "What it read to answer: an email, a file. No reference means it's going on its own general knowledge." },
  buttons: { n: 6, name: "Copy, Insert, Regenerate", what: "Copy it, put it straight into your email or document, or ask for another wording." },
  note: { n: 7, name: "\"May be incorrect\"", what: "Copilot's own warning, under every answer. It means it: you check before you use." },
  suggest: { n: 8, name: "Suggested prompts", what: "Ideas for what to ask next. Click one to put it in the box." },
  box: { n: 9, name: "The prompt box", what: "Where you type, or paste, what you want. Enter sends it." },
};

export function CopilotFigure({ focus, title = "The Copilot pane", what, note }: { focus?: PanePart[]; title?: string; what?: What<PanePart>; note?: string }) {
  return (
    <FigureFrame info={withWhat(PANE_PARTS, what)} focus={focus} title={title} note={note} minWidth={430}>
      <div style={{ maxWidth: 560, margin: "0 auto", background: W.copilotTint, borderRadius: 10, border: `1px solid ${W.edge}`, boxShadow: W.float, overflow: "visible" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px 10px 46px", background: W.page, borderBottom: `1px solid ${W.edge}`, borderRadius: "10px 10px 0 0" }}>
          <Part k="header" block={false} badge="left">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, paddingRight: 4 }}>
              <CopilotMark size={24} />
              <b style={{ fontSize: 15.5, fontWeight: 600 }}>Copilot</b>
            </span>
          </Part>
          <Part k="shield" block={false} badge="right">
            <Protected />
          </Part>
          <span style={{ marginLeft: "auto", color: W.muted, fontSize: 15 }}>✕</span>
        </div>
        <div style={{ display: "grid", gap: 14, padding: "16px 46px 14px 46px" }}>
          <Part k="asked" badge="right" style={{ justifySelf: "end", maxWidth: "88%" }}>
            <div style={bubble}>Write a short, friendly reply to Sarah. The two missing pallets from order 4417 arrive tomorrow before 10:00.</div>
          </Part>
          <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
            <CopilotMark size={24} />
            <div style={{ flex: 1, minWidth: 0, display: "grid", gap: 6 }}>
              <div style={{ ...card, display: "grid", gap: 9 }}>
                <Part k="answer" badge="left" style={{ marginLeft: -6 }}>
                  <div style={draftBox}>{"Hi Sarah,\n\nGood news: the two missing pallets from order 4417 arrive tomorrow before 10:00. I'll check them in when they do.\n\nThanks,\nJordan"}</div>
                </Part>
                <Part k="refs" block={false} badge="right" style={{ justifySelf: "start" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: W.muted, paddingRight: 2 }}>
                    1 reference {ref("Delivery 4417 is two pallets short")}
                  </span>
                </Part>
                <Part k="buttons" block={false} badge="right" style={{ justifySelf: "start" }}>
                  <span style={{ display: "inline-flex", gap: 6 }}>
                    <span style={small}>⧉ Copy</span>
                    <span style={small}>⤓ Insert</span>
                    <span style={small}>↻ Regenerate</span>
                  </span>
                </Part>
              </div>
              <Part k="note" block={false} badge="right" style={{ justifySelf: "start" }}>
                <span style={noteText}>AI-generated content may be incorrect.</span>
              </Part>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gap: 10, padding: "12px 46px 16px 46px", borderTop: `1px solid ${W.edge}` }}>
          <Part k="suggest" badge="left" style={{ justifySelf: "start" }}>
            <span style={{ display: "inline-flex", flexWrap: "wrap", gap: 6 }}>
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

export type DraftPart = "reply" | "button" | "prompt" | "generate" | "draft" | "keep" | "note" | "original";

export const DRAFT_PARTS: Record<DraftPart, PartInfo> = {
  reply: { n: 1, name: "Your reply", what: "You pressed Reply on Imran's email, so it's already addressed to him, with Re: and his subject." },
  button: { n: 2, name: "Copilot", what: "In the reply's bar. It opens Draft with Copilot, right inside your email." },
  prompt: { n: 3, name: "Your prompt", what: "What you want written. The better this is, the better the draft: the facts, who it's for, and the tone." },
  generate: { n: 4, name: "Generate", what: "Copilot writes a draft from your prompt, in a second or two." },
  draft: { n: 5, name: "The draft", what: "Copilot's attempt. It reads well. That doesn't make it right." },
  keep: { n: 6, name: "Keep it, Regenerate, Discard", what: "Keep it puts the draft into your email, for you to check and edit. Regenerate asks for another wording." },
  note: { n: 7, name: "\"May be incorrect\"", what: "The warning under every draft. You're the one who presses Send." },
  original: { n: 8, name: "The email you're answering", what: "Imran's email, underneath your reply. Copilot can read it, and it's what your reply has to answer." },
};

export const KENT_PROMPT = "Write a short, friendly reply to Imran Ahmed at Kent Bakery. Confirm his flour order is now 30 sacks, delivered on Thursday 12 November, before 10:00.";
export const KENT_DRAFT = "Hi Imran,\n\nThanks for getting in touch. Good news: your flour order is now 30 sacks, and we'll have it with you on Friday 13 November, before 10:00.\n\nWe'd also like to give you 10% off this order, as a thank you.\n\nBest wishes,\nNorthfield Supplies";

const outlookField: CSSProperties = { display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "4px 10px", borderBottom: `1px solid ${W.edge}`, fontSize: 14 };

export function DraftFigure({ focus, title = "Draft with Copilot, in an Outlook reply", what, note }: { focus?: DraftPart[]; title?: string; what?: What<DraftPart>; note?: string }) {
  return (
    <FigureFrame info={withWhat(DRAFT_PARTS, what)} focus={focus} title={title} note={note} minWidth={440}>
      <AppWindow app="Outlook" colour={W.outlook} title="Re: Thursday's flour">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", padding: "9px 12px 9px 46px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <FakeButton primary>➤ Send</FakeButton>
          <FakeButton>📎 Attach file</FakeButton>
          <Part k="button" block={false} badge="right">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, padding: "3px 12px 3px 6px", borderRadius: 5, border: `1px solid ${W.copilot}`, background: W.copilotSoft, fontSize: 13.5 }}>
              <CopilotMark size={20} /> Copilot
            </span>
          </Part>
        </div>
        <div style={{ padding: "6px 22px 0 46px" }}>
          <Part k="reply">
            <div>
              <div style={outlookField}>
                <span style={{ width: 54, color: W.muted }}>To</span>
                <span style={{ padding: "2px 10px", borderRadius: 12, background: W.select }}>Imran Ahmed</span>
              </div>
              <div style={outlookField}>
                <span style={{ width: 54, color: W.muted }}>Subject</span>Re: Thursday&apos;s flour
              </div>
            </div>
          </Part>
        </div>
        <div style={{ margin: "14px 22px 0 46px", padding: 2, borderRadius: 10, background: W.copilotMark }}>
          <div style={{ padding: "11px 12px 12px", borderRadius: 8, background: W.page, display: "grid", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14.5 }}>
              <CopilotMark size={20} /> Draft with Copilot
            </span>
            <Part k="prompt" badge="left" style={{ marginLeft: -2 }}>
              <div style={{ padding: "8px 10px", border: "1px solid #d6d1f0", borderRadius: 6, fontSize: 14, lineHeight: 1.5 }}>{KENT_PROMPT}</div>
            </Part>
            <Part k="generate" block={false} badge="right" style={{ justifySelf: "start" }}>
              <span style={{ display: "inline-flex", minHeight: 30, alignItems: "center", padding: "3px 14px", borderRadius: 5, background: W.copilot, color: "#fff", fontWeight: 700, fontSize: 13.5 }}>Generate</span>
            </Part>
            <Part k="draft" badge="left" style={{ marginLeft: -2 }}>
              <div style={draftBox}>{KENT_DRAFT}</div>
            </Part>
            <Part k="keep" block={false} badge="right" style={{ justifySelf: "start" }}>
              <span style={{ display: "inline-flex", gap: 6 }}>
                <span style={{ ...small, background: W.copilot, color: "#fff", border: "none", fontWeight: 700 }}>Keep it</span>
                <span style={small}>↻ Regenerate</span>
                <span style={small}>Discard</span>
              </span>
            </Part>
            <Part k="note" block={false} badge="right" style={{ justifySelf: "start" }}>
              <span style={noteText}>AI-generated content may be incorrect.</span>
            </Part>
          </div>
        </div>
        <div style={{ padding: "14px 22px 18px 46px" }}>
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

export type PromptPart = "ask" | "tone" | "reader" | "facts";

export const PROMPT_PARTS: Record<PromptPart, PartInfo> = {
  ask: { n: 1, name: "What you want", what: "A reply, an email, a summary. Start with the job: \"Write a reply\"." },
  tone: { n: 2, name: "The tone", what: "How it should sound: short, friendly, polite, formal. Without it you get stiff, middle-of-the-road wording." },
  reader: { n: 3, name: "Who it's for", what: "The reader, and who they are to you: a customer, your manager, a supplier. It changes the greeting and the wording." },
  facts: { n: 4, name: "The facts", what: "Every number, day, date and time it needs. Copilot can't know them. Leave one out and it writes round it, or makes one up." },
};

const seg = (k: PromptPart, text: string, colour: string, noBadge = false) => (
  <Part k={k} block={false} badge="top" noBadge={noBadge} style={{ borderRadius: 4 }}>
    <span style={{ padding: "1px 3px", borderRadius: 4, background: colour }}>{text}</span>
  </Part>
);

export function PromptFigure({ focus, title = "A good prompt, part by part", what, note }: { focus?: PromptPart[]; title?: string; what?: What<PromptPart>; note?: string }) {
  return (
    <FigureFrame info={withWhat(PROMPT_PARTS, what)} focus={focus} title={title} note={note} minWidth={560}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "14px 16px 18px 46px", borderRadius: 12, border: "1px solid #d6d1f0", background: W.page, boxShadow: W.float }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: W.muted }}>
          <CopilotMark size={20} /> Draft with Copilot
        </span>
        <div style={{ fontSize: 18, paddingBottom: 4 }}>
          <Line>
            {seg("ask", "Write a", "#e6f0fb")} {seg("tone", "short, friendly", "#fdf1d8")} {seg("ask", "reply", "#e6f0fb", true)} {seg("reader", "to Imran Ahmed at Kent Bakery.", "#e7f4ea")}
          </Line>
          <Part k="facts" badge="left" style={{ marginTop: 12, marginLeft: 0 }}>
            <div style={{ padding: "2px 4px", borderRadius: 4, background: "#f3e8fb", lineHeight: 1.6 }}>
              Confirm his flour order is now 30 sacks,
              <br />
              delivered on Thursday 12 November, before 10:00.
            </div>
          </Part>
        </div>
      </div>
    </FigureFrame>
  );
}

/* ── a draft checked against the facts ──────────────────────────────── */

export type CheckPart = "facts" | "draft" | "match" | "day" | "offer" | "send";

export const CHECK_PARTS: Record<CheckPart, PartInfo> = {
  facts: { n: 1, name: "The facts", what: "Where they really come from: Sarah's email. Not Copilot, and not your memory." },
  draft: { n: 2, name: "Copilot's draft", what: "Now in your reply, ready to check line by line." },
  match: { n: 3, name: "What matches", what: "30 sacks and before 10:00 agree with Sarah's email. Tick them off as you go." },
  day: { n: 4, name: "A wrong day", what: "Friday 13 November. Sarah said Thursday 12 November. AI slips on days and dates, and sounds just as sure." },
  offer: { n: 5, name: "Something nobody said", what: "A 10% discount. Nobody agreed one: Sarah said same price. AI fills gaps with things that sound nice." },
  send: { n: 6, name: "Send", what: "Yours to press. Once it's gone, the customer holds you to every word, not Copilot." },
};

const lit = (k: CheckPart, text: string, ok: boolean, noBadge = false) => (
  <Part k={k} block={false} badge="top" noBadge={noBadge} style={{ borderRadius: 4 }}>
    <span style={{ padding: "1px 3px", borderRadius: 4, background: ok ? "#dff6dd" : "#fde2e4", boxShadow: ok ? "inset 0 -2px 0 #107c10" : "inset 0 -2px 0 #c4314b" }}>{text}</span>
  </Part>
);

export function CheckFigure({ focus, title = "Checking the draft against the facts", what, note }: { focus?: CheckPart[]; title?: string; what?: What<CheckPart>; note?: string }) {
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
            <Part k="draft" badge="left" holds={["match", "day", "offer"]}>
              <div style={{ fontSize: 14.5, padding: "4px 4px 6px" }}>
                <Line gap={10}>Hi Imran,</Line>
                <Line>Good news: your flour order is now {lit("match", "30 sacks", true)},</Line>
                <Line>
                  delivered on {lit("day", "Friday 13 November", false)}, {lit("match", "before 10:00", true, true)}.
                </Line>
                <Line>{lit("offer", "We'd also like to give you 10% off this order.", false)}</Line>
                <Line gap={12}>Best wishes,</Line>
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

export type ExcelAiPart = "button" | "cell" | "bar" | "column" | "pane" | "question" | "explain" | "note";

export const EXCEL_AI_PARTS: Record<ExcelAiPart, PartInfo> = {
  button: { n: 1, name: "Copilot on the ribbon", what: "Opens Copilot down the side of Excel, where it can see the sheet that's open." },
  cell: { n: 2, name: "The cell", what: "D15, where the count goes. You type the formula here yourself." },
  bar: { n: 3, name: "The formula bar", what: "Shows what's really in the selected cell: the formula, not just its answer." },
  column: { n: 4, name: "Column F, Status", what: "What the formula looks through: every row of column F." },
  pane: { n: 5, name: "The Copilot pane", what: "Copilot, beside your sheet. It reads the sheet to answer." },
  question: { n: 6, name: "Your question", what: "The formula, pasted in, and what you want to know about it." },
  explain: { n: 7, name: "The explanation", what: "What each piece means, in plain words. Read it, then use the formula yourself." },
  note: { n: 8, name: "\"May be incorrect\"", what: "Explaining is a strength. Counting for you isn't: check any number it gives you." },
};

export function ExcelCopilotFigure({ focus, title = "Excel, with Copilot down the side", what, note, done = true }: { focus?: ExcelAiPart[]; title?: string; what?: What<ExcelAiPart>; note?: string; done?: boolean }) {
  const rows: [string, string, string][] = [
    ["Harlow Packaging", "08:30", "On time"],
    ["Brightwater Cups", "09:00", "Late"],
    ["Kent Flour Mills", "09:30", "On time"],
    ["Harlow Packaging", "10:00", "Late"],
    ["Kent Flour Mills", "09:30", "Late"],
  ];
  const cellS: CSSProperties = { padding: "0 6px", height: 26, display: "flex", alignItems: "center", borderRight: `1px solid ${W.edge}`, borderBottom: `1px solid ${W.edge}`, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden" };
  const head: CSSProperties = { ...cellS, justifyContent: "center", background: W.sunk, color: W.muted, fontSize: 12 };
  const cols = "30px 128px 56px 70px";
  return (
    <FigureFrame info={withWhat(EXCEL_AI_PARTS, what)} focus={focus} title={title} note={note} minWidth={720}>
      <AppWindow app="Excel" colour={W.excel} title="2026-11 Delivery log.xlsx">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", padding: "8px 12px 8px 14px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <FakeButton primary colour={W.excel}>
            File ▾
          </FakeButton>
          <FakeButton>Save</FakeButton>
          <FakeButton>⏷ Filter</FakeButton>
          <Part k="button" block={false} badge="right">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, padding: "3px 12px 3px 6px", borderRadius: 5, border: `1px solid ${W.copilot}`, background: W.copilotSoft, fontSize: 13.5 }}>
              <CopilotMark size={20} /> Copilot
            </span>
          </Part>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 0, padding: "10px 12px 16px 46px" }}>
            <Part k="bar">
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                <span style={{ width: 46, padding: "4px 6px", border: `1px solid ${W.edge}` }}>D15</span>
                <i style={{ fontFamily: "serif", color: W.muted }}>fx</i>
                <span style={{ flex: 1, padding: "4px 8px", border: `1px solid ${W.edge}`, fontFamily: "Consolas, ui-monospace, monospace" }}>{done ? '=COUNTIF(F:F,"Late")' : ""}</span>
              </div>
            </Part>
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: cols, borderLeft: `1px solid ${W.edge}`, borderTop: `1px solid ${W.edge}`, width: "fit-content" }}>
              <span style={head} />
              <span style={head}>C</span>
              <span style={head}>D</span>
              <span style={{ ...head, background: "#cfe6d8", color: W.excel, fontWeight: 700 }}>F</span>
              <span style={head}>1</span>
              <b style={{ ...cellS, background: "#e6f2ea" }}>Supplier</b>
              <b style={{ ...cellS, background: "#e6f2ea" }}>Booked</b>
              <b style={{ ...cellS, background: "#e6f2ea" }}>Status</b>
              {rows.map(([s, b, st], i) => (
                <span key={i} style={{ display: "contents" }}>
                  <span style={head}>{i + 2}</span>
                  <span style={cellS}>{s}</span>
                  <span style={cellS}>{b}</span>
                  <span style={cellS}>{st}</span>
                </span>
              ))}
              <span style={head}>15</span>
              <span style={cellS}>Late in November</span>
              <Part k="cell" block={false} badge="right" style={{ borderRadius: 0 }}>
                <span style={{ ...cellS, justifyContent: "flex-end", outline: `2px solid ${W.excel}`, outlineOffset: -2, height: 26 }}>{done ? "3" : ""}</span>
              </Part>
              <span style={cellS} />
            </div>
            <Part k="column" block={false} badge="right" style={{ marginLeft: 214, marginTop: 8 }}>
              <span style={{ display: "inline-block", fontSize: 12, color: W.excel, fontWeight: 600, padding: "2px 4px" }}>▲ every row of F</span>
            </Part>
          </div>
          <div style={{ width: 300, flexShrink: 0, borderLeft: `1px solid ${W.edge}`, background: W.copilotTint, padding: "10px 12px 14px 40px", alignSelf: "stretch" }}>
            <Part k="pane" badge="corner" holds={["question", "explain", "note"]}>
              <div style={{ display: "grid", gap: 10 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 14 }}>
                  <CopilotMark size={20} /> Copilot
                </span>
                <Part k="question" badge="left" style={{ justifySelf: "end" }}>
                  <div style={{ ...bubble, fontSize: 13 }}>What does =COUNTIF(F:F,&quot;Late&quot;) do?</div>
                </Part>
                <Part k="explain" badge="left">
                  <div style={{ ...card, fontSize: 13, lineHeight: 1.5 }}>
                    It counts how many cells in column F, the Status column, say exactly &quot;Late&quot;.
                    <br />• COUNTIF: count the cells that match.
                    <br />• F:F: every row of column F.
                    <br />• &quot;Late&quot;: what to look for.
                  </div>
                </Part>
                <Part k="note" block={false} badge="left" style={{ justifySelf: "start" }}>
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
  card: { n: 4, name: "Card digits", what: "Even the last four. Anything to do with payment stays out." },
  address: { n: 5, name: "An address", what: "Where someone lives or works. Leave it out, or just say the town." },
  warning: { n: 6, name: "The warning line", what: "The office's paste box spots details like these and lights them up. It won't stop you sending. That's your job." },
  clean: { n: 7, name: "What to send instead", what: "The same complaint, with nobody in it. Copilot can summarise this just as well." },
};

const pii = (k: PastePart, text: string) => (
  <Part k={k} block={false} badge="top" style={{ borderRadius: 3 }}>
    <mark style={{ background: "#fde2e4", color: "inherit", borderRadius: 3, boxShadow: "inset 0 -2px 0 #c4314b", padding: "0 2px" }}>{text}</mark>
  </Part>
);

export function PasteFigure({ focus, title = "A paste, with the personal details lit", what, note }: { focus?: PastePart[]; title?: string; what?: What<PastePart>; note?: string }) {
  const box = (children: ReactNode, red: boolean) => <div style={{ padding: "10px 14px", borderRadius: 10, border: `1px solid ${red ? "#e8a3ab" : "#d6d1f0"}`, background: W.page, fontSize: 15, lineHeight: 1.6, boxShadow: "0 2px 10px -4px rgba(80,60,180,0.25)" }}>{children}</div>;
  return (
    <FigureFrame info={withWhat(PASTE_PARTS, what)} focus={focus} title={title} note={note} minWidth={600}>
      <div style={{ maxWidth: 640, margin: "0 auto", display: "grid", gap: 10, paddingLeft: 30 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: W.muted }}>
          <CopilotMark size={20} /> About to send to Copilot
        </span>
        {box(
          <>
            <Line gap={4}>Summarise this complaint:</Line>
            <Line>
              {pii("name", "Leah Moss")} ({pii("phone", "07700 900214")}, {pii("email", "leah.moss@brightcafe.example")}) says
            </Line>
            <Line>
              {pii("card", "card ending 4417")} was charged twice for order 4429.
            </Line>
            <Line>
              Bright Cafe, {pii("address", "14 Market Street")}, Leicester.
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
        <Part k="clean">{box(
            <>
              Summarise this complaint:
              <br />
              Customer A at Bright Cafe says their card was charged twice for order 4429.
            </>,
            false,
          )}</Part>
      </div>
    </FigureFrame>
  );
}
