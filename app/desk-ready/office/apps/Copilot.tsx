"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { W } from "../../tokens";
import { describePersonal, findPersonal, respond, type Personal } from "../copilot";
import { newId } from "../store";
import type { CopilotHost, CopilotPaneContext, CopilotTurn, OfficeState } from "../types";
import { TitleBar } from "../ui";
import type { OfficeAppProps } from "./registry";

/* Copilot, for Module 12: the chat a learner asks for a draft, an
 * explanation or a summary, drawn the way Microsoft 365 Copilot looks (the
 * mark, "Ask Copilot", suggested prompts, answers with Copy, Insert and
 * Regenerate, and "AI-generated content may be incorrect."). Its answers
 * are scripted (../copilot), never a live model.
 *
 * It comes three ways, as the real one does:
 * - its own app on the taskbar (CopilotApp), a full chat;
 * - a pane down the side of Excel (CopilotPane, host "excel");
 * - "Draft with Copilot" inside an Outlook reply (DraftCard, host
 *   "outlook"), whose Keep it puts the draft into the email.
 *
 * Every question and answer goes into the office record (state.copilot),
 * so a job's checks read exactly what was sent. The box a learner types
 * or pastes into lights up any personal details as they go (AI-4), but
 * never stops them sending: keeping them out is the learner's job. */

/* ── the mark ───────────────────────────────────────────────────────── */

export function CopilotMark({ size = 28 }: { size?: number }) {
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: "50%", background: W.copilotMark, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35)" }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" style={{ display: "block" }}>
        <path d="M12 2 C12.8 7.6 16.4 11.2 22 12 C16.4 12.8 12.8 16.4 12 22 C11.2 16.4 7.6 12.8 2 12 C7.6 11.2 11.2 7.6 12 2 Z" fill="#ffffff" />
      </svg>
    </span>
  );
}

const Icon = {
  copy: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden style={{ display: "inline-block" }}>
      <rect x="8" y="8" width="12" height="13" rx="2" />
      <path d="M16 8 V5 A2 2 0 0 0 14 3 H6 A2 2 0 0 0 4 5 V15 A2 2 0 0 0 6 17 H8" />
    </svg>
  ),
  insert: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden style={{ display: "inline-block" }}>
      <path d="M12 3 V15 M7 10 L12 15 L17 10" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19 H20" strokeLinecap="round" />
    </svg>
  ),
  again: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden style={{ display: "inline-block" }}>
      <path d="M20 12 A8 8 0 1 1 17.7 6.3" strokeLinecap="round" />
      <path d="M20 4 V9 H15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  send: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: "inline-block" }}>
      <path d="M3.4 20.4 L21 12 L3.4 3.6 L3.4 10.2 L15 12 L3.4 13.8 Z" />
    </svg>
  ),
  doc: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden style={{ display: "inline-block" }}>
      <path d="M6 2 H14 L19 7 V22 H6 Z" strokeLinejoin="round" />
      <path d="M14 2 V7 H19" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden style={{ display: "inline-block" }}>
      <path d="M12 2 L20 5 V11 C20 16 16.5 20 12 22 C7.5 20 4 16 4 11 V5 Z" strokeLinejoin="round" />
      <path d="M8.5 12 L11 14.5 L15.5 9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  paste: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden style={{ display: "inline-block" }}>
      <rect x="5" y="4" width="14" height="18" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
    </svg>
  ),
};

/* "Protected": the shield a work account's Copilot shows. */
export function Protected({ label = "Protected" }: { label?: string }) {
  return (
    <span title="Signed in with your work account" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "#e7f4ea", color: "#0e700e", fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap" }}>
      {Icon.shield}
      {label}
    </span>
  );
}

/* ── text with its personal details lit ─────────────────────────────── */

const MARK: CSSProperties = { background: "#fde2e4", color: "inherit", borderRadius: 3, boxShadow: "inset 0 -2px 0 #c4314b" };

export function Lit({ text, found }: { text: string; found: Personal[] }) {
  const out: ReactNode[] = [];
  let at = 0;
  found.forEach((p, i) => {
    if (p.start > at) out.push(text.slice(at, p.start));
    out.push(
      <mark key={i} title={`Personal: ${p.kind}`} style={MARK}>
        {text.slice(p.start, p.end)}
      </mark>,
    );
    at = p.end;
  });
  out.push(text.slice(at));
  return <>{out}</>;
}

/* ── the box you type or paste into ─────────────────────────────────── */

/* A textarea over a copy of its own text with the personal details marked,
 * so they light up as you type. The box grows with its text and the frame
 * around both scrolls, so the two layers never drift apart. */
function Composer({
  value,
  setValue,
  onSend,
  placeholder,
  known,
  clip,
  maxHeight,
  big,
}: {
  value: string;
  setValue: (v: string) => void;
  onSend: () => void;
  placeholder: string;
  known: string[];
  clip?: { label: string; text: string };
  maxHeight: number;
  big?: boolean;
}) {
  const box = useRef<HTMLTextAreaElement>(null);
  const found = findPersonal(value, known);
  useLayoutEffect(() => {
    const t = box.current;
    if (!t) return;
    t.style.height = "0px";
    t.style.height = `${Math.max(big ? 56 : 44, t.scrollHeight)}px`;
  }, [value, big]);
  const paste = () => {
    if (!clip) return;
    const t = box.current;
    const at = t ? t.selectionStart : value.length;
    const end = t ? t.selectionEnd : value.length;
    const lead = value.slice(0, at);
    const glue = lead && !lead.endsWith("\n") ? "\n" : "";
    setValue(`${lead}${glue}${clip.text}${value.slice(end)}`);
    requestAnimationFrame(() => t?.focus());
  };
  const text: CSSProperties = { margin: 0, padding: "12px 14px", fontFamily: W.font, fontSize: big ? 16 : 15, lineHeight: 1.5, letterSpacing: "normal", whiteSpace: "pre-wrap", overflowWrap: "anywhere", wordBreak: "normal", boxSizing: "border-box", width: "100%", border: "none" };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, padding: 4, borderRadius: 12, border: `1px solid ${found.length ? "#e8a3ab" : "#d6d1f0"}`, background: W.page, boxShadow: "0 2px 10px -4px rgba(80,60,180,0.25)" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 0, maxHeight, overflowY: "auto" }}>
          <div aria-hidden style={{ ...text, position: "absolute", inset: 0, color: "transparent", pointerEvents: "none" }}>
            <Lit text={value} found={found} />
            {"\n"}
          </div>
          <textarea
            ref={box}
            aria-label={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={placeholder}
            rows={1}
            style={{ ...text, position: "relative", display: "block", resize: "none", overflow: "hidden", outline: "none", background: "transparent", color: W.ink, caretColor: W.ink }}
          />
        </div>
        <button type="button" onClick={onSend} disabled={!value.trim()} aria-label="Send" title="Send (Enter)" className="of-btn" style={{ width: 40, height: 40, flexShrink: 0, border: "none", borderRadius: 8, background: value.trim() ? W.copilot : "transparent", color: value.trim() ? "#fff" : W.faint, cursor: value.trim() ? "pointer" : "default", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          {Icon.send}
        </button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6, fontSize: 12.5, color: W.muted }}>
        {clip && (
          <button type="button" onClick={paste} className="of-btn" title="Puts the list in the box, as Ctrl+V would after copying it" style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 34, padding: "2px 10px", border: `1px solid ${W.edge}`, borderRadius: 6, background: W.page, color: W.ink, fontFamily: W.font, fontSize: 13.5, cursor: "pointer" }}>
            {Icon.paste} Paste: {clip.label}
          </button>
        )}
        <span>Enter sends. Shift+Enter starts a new line.</span>
      </div>
      {found.length > 0 && (
        <p role="status" style={{ margin: "8px 0 0", padding: "8px 10px", borderRadius: 8, background: "#fdf0f1", border: "1px solid #f1c3c9", color: "#8a1c2b", fontSize: 13.5, lineHeight: 1.45 }}>
          <b>Personal details in your message:</b> {describePersonal(found)}. Copilot gets whatever you send.
        </p>
      )}
    </div>
  );
}

/* ── one answer ─────────────────────────────────────────────────────── */

const isDraft = (t: CopilotTurn) => t.kind === "draft" || t.kind === "vague";

function smallBtn(): CSSProperties {
  return { display: "inline-flex", alignItems: "center", gap: 6, minHeight: 34, padding: "2px 10px", border: `1px solid ${W.edge}`, borderRadius: 6, background: W.page, color: W.ink, fontFamily: W.font, fontSize: 13.5, cursor: "pointer" };
}

function Tip({ turn, onUse }: { turn: CopilotTurn; onUse?: (p: string) => void }) {
  if (!turn.tip && !turn.example) return null;
  return (
    <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 8, background: "#fff4ce", border: "1px solid #ecd58a", fontSize: 14, lineHeight: 1.5, color: W.ink }}>
      <b style={{ display: "block", fontSize: 11.5, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7a5b00", marginBottom: 2 }}>Desk Ready tip</b>
      {turn.tip}
      {turn.example && (
        <>
          <span style={{ display: "block", marginTop: 8 }}>Here&apos;s a prompt that works. Read what it gives, then send it:</span>
          <q style={{ display: "block", margin: "6px 0 0", padding: "8px 10px", borderRadius: 6, background: W.page, border: `1px solid ${W.edge}`, quotes: "none" }}>{turn.example}</q>
          {onUse && (
            <button type="button" onClick={() => onUse(turn.example ?? "")} className="of-btn" style={{ ...smallBtn(), marginTop: 8 }}>
              Use this prompt
            </button>
          )}
        </>
      )}
    </div>
  );
}

function Answer({ turn, onCopy, copied, onInsert, insertLabel, onRegenerate, onUse }: { turn: CopilotTurn; onCopy: () => void; copied: boolean; onInsert?: () => void; insertLabel: string; onRegenerate?: () => void; onUse?: (p: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <CopilotMark size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ padding: "12px 14px", borderRadius: 12, background: W.page, border: `1px solid ${W.edge}`, boxShadow: "0 2px 8px -4px rgba(0,0,0,0.12)" }}>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.55, color: W.ink, ...(isDraft(turn) ? { padding: "10px 12px", borderLeft: `3px solid ${W.copilot}`, background: W.copilotTint, borderRadius: 4 } : {}) }}>{turn.reply}</div>
          {!!turn.refs?.length && (
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, marginTop: 10, fontSize: 12.5, color: W.muted }}>
              <span>
                {turn.refs.length} reference{turn.refs.length > 1 ? "s" : ""}
              </span>
              {turn.refs.map((r, i) => (
                <span key={r} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, background: W.chrome, color: W.body }}>
                  <b style={{ fontSize: 11, color: W.copilot }}>{i + 1}</b>
                  {Icon.doc}
                  {r}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            <button type="button" onClick={onCopy} className="of-btn" style={smallBtn()}>
              {Icon.copy} {copied ? "Copied" : "Copy"}
            </button>
            {onInsert && (
              <button type="button" onClick={onInsert} className="of-btn" style={smallBtn()}>
                {Icon.insert} {insertLabel}
              </button>
            )}
            {onRegenerate && (
              <button type="button" onClick={onRegenerate} className="of-btn" style={smallBtn()} title="Ask for a different wording">
                {Icon.again} Regenerate
              </button>
            )}
          </div>
        </div>
        <p style={{ margin: "6px 2px 0", fontSize: 12.5, color: W.muted }}>AI-generated content may be incorrect.</p>
        <Tip turn={turn} onUse={onUse} />
      </div>
    </div>
  );
}

/* What you sent, as a bubble, with any personal details still lit, so you
 * can see afterwards exactly what went in. */
function Sent({ turn, known }: { turn: CopilotTurn; known: string[] }) {
  const found = findPersonal(turn.prompt, known);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      <div style={{ maxWidth: "88%", padding: "10px 14px", borderRadius: "14px 14px 4px 14px", background: W.copilotSoft, color: W.ink, fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
        <Lit text={turn.prompt} found={found} />
      </div>
      {found.length > 0 && <span style={{ marginTop: 4, fontSize: 12.5, color: "#a4262c", textAlign: "right" }}>This went to Copilot with {describePersonal(found)} in it.</span>}
    </div>
  );
}

/* ── the chat: list of answers, suggested prompts, the box ──────────── */

export interface Suggestion {
  label: string;
  /* What goes in the box when it is clicked; the learner finishes it. */
  fill: string;
}

export function CopilotChat({
  turns,
  onAsk,
  onRegenerate,
  onInsert,
  insertLabel = "Insert",
  suggestions = [],
  layout,
  known = [],
  clip,
  greeting = "Hi. How can I help?",
  placeholder = "Ask Copilot",
}: {
  turns: CopilotTurn[];
  onAsk: (prompt: string) => void;
  onRegenerate?: (t: CopilotTurn) => void;
  onInsert?: (text: string) => void;
  insertLabel?: string;
  suggestions?: Suggestion[];
  layout: "pane" | "app";
  known?: string[];
  clip?: { label: string; text: string };
  greeting?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const last = turns[turns.length - 1];
  useEffect(() => {
    const el = list.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, last?.reply]);
  const send = () => {
    if (!value.trim()) return;
    onAsk(value);
    setValue("");
  };
  const copy = (t: CopilotTurn) => {
    try {
      void navigator.clipboard?.writeText(t.reply).catch(() => {});
    } catch {
      /* no clipboard here: the button still says so */
    }
    setCopied(t.id);
    setTimeout(() => setCopied((c) => (c === t.id ? null : c)), 2000);
  };
  const app = layout === "app";
  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column", fontFamily: W.font, color: W.ink }}>
      <div ref={list} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: app ? "24px 24px 12px" : "14px 14px 8px" }}>
        <div style={{ maxWidth: app ? 760 : undefined, margin: "0 auto", display: "grid", gap: 16 }}>
          {turns.length === 0 && (
            <div style={{ textAlign: app ? "center" : "left", padding: app ? "28px 0 6px" : "4px 0" }}>
              <span style={{ display: "inline-flex" }}>
                <CopilotMark size={app ? 48 : 34} />
              </span>
              <p style={{ margin: "12px 0 0", fontSize: app ? 24 : 18, fontWeight: 600, lineHeight: 1.3 }}>{greeting}</p>
              <p style={{ margin: "6px auto 0", maxWidth: 520, fontSize: 14.5, lineHeight: 1.5, color: W.muted }}>Copilot can draft, summarise and explain. It can also get things wrong, so check what it gives you.</p>
              {suggestions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16, justifyContent: app ? "center" : "flex-start" }}>
                  {suggestions.map((s) => (
                    <button key={s.label} type="button" onClick={() => setValue(s.fill)} className="of-btn" style={{ minHeight: 38, padding: "6px 14px", borderRadius: 999, border: `1px solid #d6d1f0`, background: W.page, color: W.ink, fontFamily: W.font, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {turns.map((t) => (
            <div key={t.id} style={{ display: "grid", gap: 12 }}>
              <Sent turn={t} known={known} />
              {t.reply && (
                <Answer
                  turn={t}
                  copied={copied === t.id}
                  onCopy={() => copy(t)}
                  onInsert={onInsert && isDraft(t) ? () => onInsert(t.reply) : undefined}
                  insertLabel={insertLabel}
                  onRegenerate={onRegenerate && t === last ? () => onRegenerate(t) : undefined}
                  onUse={setValue}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: app ? "8px 24px 18px" : "8px 12px 12px", borderTop: app ? "none" : `1px solid ${W.edge}`, background: app ? "transparent" : W.copilotTint }}>
        <div style={{ maxWidth: app ? 760 : undefined, margin: "0 auto" }}>
          <Composer value={value} setValue={setValue} onSend={send} placeholder={placeholder} known={known} clip={clip} maxHeight={app ? 260 : 180} big={app} />
        </div>
      </div>
    </div>
  );
}

/* ── wired to the office record ─────────────────────────────────────── */

function useCopilot(state: OfficeState, dispatch: OfficeAppProps["dispatch"], host: CopilotHost, ctx?: CopilotPaneContext) {
  const turns = (state.copilot?.turns ?? []).filter((t) => t.host === host);
  const ask = (prompt: string, variant = 0) => {
    const a = respond(prompt, { host, state, replyTo: ctx?.replyTo, grid: ctx?.grid, fileName: ctx?.fileName, cell: ctx?.cell, variant });
    const turn: CopilotTurn = { ...a, id: newId("cp"), variant };
    dispatch({ type: "update", fn: (s) => ({ ...s, copilot: { ...(s.copilot ?? { turns: [] }), turns: [...(s.copilot?.turns ?? []), turn] } }) });
    return turn;
  };
  /* A new wording of the same answer, in place. */
  const regenerate = (t: CopilotTurn) => {
    const variant = (t.variant ?? 0) + 1;
    const a = respond(t.prompt, { host, state: { copilot: { ...(state.copilot ?? { turns: [] }), turns: (state.copilot?.turns ?? []).filter((x) => x.id !== t.id) } }, replyTo: ctx?.replyTo, grid: ctx?.grid, fileName: ctx?.fileName, cell: ctx?.cell, variant });
    dispatch({ type: "update", fn: (s) => ({ ...s, copilot: { ...(s.copilot ?? { turns: [] }), turns: (s.copilot?.turns ?? []).map((x) => (x.id === t.id ? { ...x, reply: a.reply, variant, tip: a.tip, example: a.example } : x)) } }) });
  };
  const known = state.copilot?.clip?.people?.flatMap((p) => [p, ...p.split(" ")]) ?? [];
  return { turns, ask, regenerate, known };
}

const APP_SUGGESTIONS: Suggestion[] = [
  { label: "Summarise some text", fill: "Summarise this:\n" },
  { label: "Draft an email", fill: "Write a reply to " },
  { label: "Explain a formula", fill: "Explain this formula: " },
];

/* The Copilot app on the taskbar: a chat, with earlier chats down the side. */
export function CopilotApp({ state, dispatch }: OfficeAppProps) {
  const { turns, ask, regenerate, known } = useCopilot(state, dispatch, "app");
  /* where each chat starts in the list; New chat starts another */
  const [starts, setStarts] = useState<number[]>([0]);
  const [open, setOpen] = useState(0);
  const from = starts[open] ?? 0;
  const to = starts[open + 1] ?? turns.length;
  const shown = turns.slice(from, to);
  const name = (i: number) => turns[starts[i]]?.prompt.split("\n")[0].trim() || "New chat";
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <TitleBar colour={W.copilot} app="Copilot" name="Microsoft 365 Copilot · you@northfieldsupplies.example">
        <Protected label="Work account, protected" />
      </TitleBar>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <nav aria-label="Chats" style={{ width: 210, flexShrink: 0, padding: "12px 10px", borderRight: `1px solid ${W.edge}`, background: W.chrome, overflowY: "auto" }}>
          <button
            type="button"
            className="of-btn"
            onClick={() => {
              if (!shown.length) return;
              setStarts((s) => [...s, turns.length]);
              setOpen(starts.length);
            }}
            style={{ width: "100%", minHeight: 40, display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", border: `1px solid ${W.edge}`, borderRadius: 8, background: W.page, fontFamily: W.font, fontSize: 14.5, fontWeight: 600, color: W.ink, cursor: "pointer" }}
          >
            <span aria-hidden style={{ fontSize: 18, lineHeight: 1, color: W.copilot }}>+</span> New chat
          </button>
          <p style={{ margin: "16px 6px 6px", fontSize: 12.5, color: W.muted }}>Today</p>
          {starts.map((_, i) => (
            <button key={i} type="button" className={i === open ? "of-row on" : "of-row"} onClick={() => setOpen(i)} style={{ width: "100%", minHeight: 38, textAlign: "left", padding: "6px 10px", border: "none", borderRadius: 6, background: i === open ? W.copilotSoft : "transparent", fontFamily: W.font, fontSize: 14, color: W.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {name(i)}
            </button>
          ))}
        </nav>
        <div style={{ flex: 1, minWidth: 0, background: `linear-gradient(180deg, ${W.copilotTint}, ${W.page} 60%)` }}>
          <CopilotChat turns={shown} onAsk={(p) => ask(p)} onRegenerate={regenerate} layout="app" suggestions={APP_SUGGESTIONS} known={known} clip={state.copilot?.clip} placeholder="Message Copilot" />
        </div>
      </div>
    </div>
  );
}

/* Copilot down the side of Excel. */
function ExcelPane({ state, dispatch, ctx }: OfficeAppProps & { ctx: CopilotPaneContext }) {
  const { turns, ask, regenerate, known } = useCopilot(state, dispatch, "excel", ctx);
  const sel = ctx.cell?.raw.trim().startsWith("=") ? ctx.cell : undefined;
  const suggestions: Suggestion[] = [{ label: "Explain a formula", fill: "Explain this formula: " }, ...(sel ? [{ label: `Explain the formula in ${sel.name}`, fill: `Explain the formula in ${sel.name}` }] : [])];
  return (
    <aside aria-label="Copilot" style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", borderLeft: `1px solid ${W.edge}`, background: W.copilotTint, fontFamily: W.font }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px 8px 14px", borderBottom: `1px solid ${W.edge}`, background: W.page }}>
        <CopilotMark size={24} />
        <b style={{ fontSize: 15.5, fontWeight: 600 }}>Copilot</b>
        <Protected />
        <button type="button" onClick={ctx.close} aria-label="Close Copilot" className="of-btn" style={{ marginLeft: "auto", width: 36, height: 36, border: "none", borderRadius: 6, background: "transparent", color: W.muted, fontSize: 16, cursor: "pointer" }}>
          ✕
        </button>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <CopilotChat turns={turns} onAsk={(p) => ask(p)} onRegenerate={regenerate} layout="pane" suggestions={suggestions} known={known} greeting="Hi. Ask me about this sheet." />
      </div>
    </aside>
  );
}

/* "Draft with Copilot" in an Outlook reply: say what to write, Generate,
 * then Keep it puts the draft into the email for you to check and edit. */
function DraftCard({ state, dispatch, ctx }: OfficeAppProps & { ctx: CopilotPaneContext }) {
  const { turns, ask, regenerate } = useCopilot(state, dispatch, "outlook", ctx);
  const [prompt, setPrompt] = useState("");
  const [shownId, setShownId] = useState<string | null>(null);
  const turn = turns.find((t) => t.id === shownId) ?? null;
  const generate = () => {
    if (!prompt.trim()) return;
    setShownId(ask(prompt).id);
  };
  return (
    <section aria-label="Draft with Copilot" style={{ margin: "12px 14px 4px", padding: 2, borderRadius: 12, background: W.copilotMark }}>
      <div style={{ padding: "12px 14px 14px", borderRadius: 10, background: W.page }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CopilotMark size={24} />
          <b style={{ fontSize: 15.5, fontWeight: 600 }}>Draft with Copilot</b>
          <button type="button" onClick={ctx.close} aria-label="Close Draft with Copilot" className="of-btn" style={{ marginLeft: "auto", width: 36, height: 36, border: "none", borderRadius: 6, background: "transparent", color: W.muted, fontSize: 16, cursor: "pointer" }}>
            ✕
          </button>
        </div>
        <label style={{ display: "block", marginTop: 10 }}>
          <span style={{ display: "block", fontSize: 13.5, color: W.muted, marginBottom: 6 }}>Tell Copilot what to write: the facts, who it&apos;s for, and how it should sound.</span>
          <textarea
            aria-label="What should Copilot write?"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                generate();
              }
            }}
            rows={3}
            placeholder="For example: Write a polite reply to ..."
            style={{ display: "block", width: "100%", boxSizing: "border-box", padding: "10px 12px", border: `1px solid #d6d1f0`, borderRadius: 8, fontFamily: W.font, fontSize: 15.5, lineHeight: 1.5, color: W.ink, background: W.page, resize: "vertical", outline: "none" }}
          />
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={generate} disabled={!prompt.trim()} className="of-btn" style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40, padding: "6px 16px", border: "none", borderRadius: 6, background: W.copilot, color: "#fff", fontFamily: W.font, fontSize: 15, fontWeight: 700, cursor: prompt.trim() ? "pointer" : "not-allowed", opacity: prompt.trim() ? 1 : 0.5 }}>
            Generate
          </button>
          <span style={{ fontSize: 13, color: W.muted }}>Enter generates. Shift+Enter starts a new line.</span>
        </div>
        {turn && (
          <div style={{ marginTop: 14 }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, color: W.muted }}>
              Your prompt: <i style={{ color: W.body }}>{turn.prompt}</i>
            </p>
            <div style={{ whiteSpace: "pre-wrap", padding: "12px 14px", borderRadius: 8, borderLeft: `3px solid ${W.copilot}`, background: W.copilotTint, fontSize: 15.5, lineHeight: 1.6 }}>{turn.reply}</div>
            {!!turn.refs?.length && (
              <p style={{ margin: "8px 0 0", fontSize: 12.5, color: W.muted, display: "flex", alignItems: "center", gap: 6 }}>
                1 reference
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 999, background: W.chrome, color: W.body }}>
                  {Icon.doc} {turn.refs[0]}
                </span>
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              <button
                type="button"
                onClick={() => {
                  ctx.insert?.(turn.reply);
                  ctx.close();
                }}
                className="of-btn"
                style={{ minHeight: 40, padding: "6px 16px", border: "none", borderRadius: 6, background: W.copilot, color: "#fff", fontFamily: W.font, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                Keep it
              </button>
              <button type="button" onClick={() => regenerate(turn)} className="of-btn" style={{ ...smallBtn(), minHeight: 40 }}>
                {Icon.again} Regenerate
              </button>
              <button type="button" onClick={() => setShownId(null)} className="of-btn" style={{ ...smallBtn(), minHeight: 40 }}>
                Discard
              </button>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 12.5, color: W.muted }}>AI-generated content may be incorrect.</p>
            <Tip turn={turn} onUse={setPrompt} />
          </div>
        )}
      </div>
    </section>
  );
}

/* The pane registered for Outlook and Excel (apps/registry `Pane`). */
export function CopilotPane(p: OfficeAppProps & { ctx: CopilotPaneContext }) {
  return p.ctx.host === "outlook" ? <DraftCard {...p} /> : <ExcelPane {...p} />;
}

/* The button that opens it, the same in Outlook's reply bar and Excel's ribbon. */
export function CopilotButton({ onClick, on, label = "Copilot" }: { onClick: () => void; on?: boolean; label?: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="of-btn" style={{ minHeight: 40, padding: "6px 14px 6px 8px", borderRadius: 6, border: `1px solid ${on ? W.copilot : W.edge}`, background: on ? W.copilotSoft : W.page, color: W.ink, fontFamily: W.font, fontSize: 15, fontWeight: 500, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, whiteSpace: "nowrap" }}>
      <CopilotMark size={22} />
      {label}
    </button>
  );
}
