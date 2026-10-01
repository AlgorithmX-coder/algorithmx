"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
import { ActionRow, AttachmentChip, Icon, ICONS, Lite, TypingDots, initialOf } from "./shared";
export type { SimMessage, SimProps } from "./types";

/* Microsoft 365 Copilot, as it looks in the browser on a work account: the
 * left app rail (Home, Chat, Notebooks, Agents, Create, Pages), the
 * Work | Web pill at the top, the gradient greeting with prompt cards, the
 * "Message Copilot" composer, and Microsoft's own line under replies:
 * "AI-generated content may be incorrect". A personal account swaps the
 * tenant line and the Work pill. No vendor logo: a gradient tile stands in
 * for the mark. */

const C = {
  bg: "#ffffff",
  rail: "#f5f5f5",
  edge: "#e5e5e5",
  ink: "#242424",
  muted: "#616161",
  faint: "#8a8a8a",
  bubble: "#f0f0f0",
  card: "#fafafa",
  blue: "#0f6cbd",
  blueSoft: "#ebf3fc",
  mark: "linear-gradient(135deg, #2f7ee6 0%, #33c1b7 55%, #f2b64a 100%)",
  font: "'Segoe UI', 'Segoe UI Web', -apple-system, system-ui, Helvetica, Arial, sans-serif",
};

const PROMPTS = [
  { k: "Draft", t: "an email to my team about next week's plan" },
  { k: "Summarise", t: "the key points from a document" },
  { k: "Prepare", t: "for my next meeting with talking points" },
];

export default function CopilotSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact, attachment, pane }: SimProps) {
  const work = tier === "enterprise";
  const account = work ? `${firmName} · work account` : tier === "consumer-paid" ? "Copilot Pro · personal account" : "Personal account";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  const empty = messages.length === 0;
  const s = compact ? 0.78 : 1;

  return (
    <div className={compact ? "sim-copilot sim-compact" : pane ? "sim-copilot sim-pane" : "sim-copilot"} style={{ display: "grid", gridTemplateColumns: compact ? "150px minmax(0, 1fr)" : pane ? "minmax(0, 1fr)" : "232px minmax(0, 1fr)", minHeight: compact ? 220 : pane ? 0 : 560, height: pane ? "100%" : undefined, fontSize: compact ? 11 : pane ? 13.5 : 14, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: pane ? 0 : 12, overflow: "hidden", border: pane ? "none" : `1px solid ${C.edge}`, borderLeft: pane ? `1px solid ${C.edge}` : undefined, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.5, colorScheme: "light" }}>
      {!pane && <aside className="sim-copilot-rail" style={{ background: C.rail, borderRight: `1px solid ${C.edge}`, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 12px", fontWeight: 600, fontSize: 15 * s }}>
          <span aria-hidden style={{ width: 22 * s, height: 22 * s, borderRadius: 6, background: C.mark }} />
          Copilot
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 6, background: "#ffffff", border: `1px solid ${C.edge}`, color: C.ink, fontSize: 13 * s, marginBottom: 10 }}>
          <Icon d={ICONS.pencilSquare} size={15} stroke={C.muted} />
          New chat
        </div>
        {[
          { label: "Home", d: ICONS.home },
          { label: "Chat", d: ICONS.chat, on: true },
          { label: "Notebooks", d: ICONS.book },
          { label: "Agents", d: ICONS.agents },
          { label: "Create", d: ICONS.image },
          { label: "Pages", d: ICONS.page },
        ].map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 6, background: it.on ? "#e9e9e9" : "transparent", color: C.ink, fontSize: 13 * s, fontWeight: it.on ? 600 : 400 }}>
            <Icon d={it.d} size={16} stroke={C.muted} />
            {it.label}
          </div>
        ))}
        <div style={{ fontSize: 11 * s, color: C.faint, padding: "12px 10px 4px", letterSpacing: "0.02em" }}>Recent</div>
        {["Chase invoice draft", "Q3 board pack summary", "Onboarding checklist"].map((t) => (
          <div key={t} style={{ padding: "6px 10px", borderRadius: 6, color: C.ink, fontSize: 13 * s, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.edge}`, fontSize: 12 * s, color: C.muted, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: work ? "#13a10e" : "#c19c00", flexShrink: 0 }} />
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{account}</span>
          </span>
          <span style={{ alignSelf: "flex-start", padding: "2px 7px", borderRadius: 4, background: C.blueSoft, color: C.blue, fontWeight: 600, fontSize: 11 * s, letterSpacing: "0.02em" }}>Practice tenant</span>
        </div>
      </aside>}

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, height: pane ? "100%" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: pane ? "8px 12px" : "10px 16px", borderBottom: `1px solid ${C.edge}` }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13 * s, color: pane ? C.ink : C.muted, fontWeight: pane ? 600 : 400 }}>
            <span style={{ width: 22 * s, height: 22 * s, borderRadius: 6, background: C.mark }} aria-hidden />
            Copilot
          </span>
          {pane && <span style={{ display: "inline-flex", alignItems: "center", gap: 10, color: C.muted }}><span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: C.blueSoft, color: C.blue, fontWeight: 600 }}>Practice tenant</span><Icon d={ICONS.more} size={16} /><span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>×</span></span>}
          <span style={{ display: "inline-flex", border: `1px solid ${C.edge}`, borderRadius: 999, padding: 2, fontSize: 12.5 * s }}>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: work ? C.ink : "transparent", color: work ? "#fff" : C.muted, fontWeight: 600 }}>Work</span>
            <span style={{ padding: "4px 12px", borderRadius: 999, background: work ? "transparent" : C.ink, color: work ? C.muted : "#fff", fontWeight: 600 }}>Web</span>
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 * s, color: C.muted }}>
            <span style={{ width: 24 * s, height: 24 * s, borderRadius: "50%", background: "#c7e0f4", color: "#0f4a80", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 * s, fontWeight: 700 }}>{initialOf(learnerName)}</span>
            {learnerName}
          </span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: compact ? "14px 16px" : pane ? "14px 14px" : "22px 28px", display: "flex", flexDirection: "column", gap: pane ? 12 : 16 }}>
          {empty && (
            <div style={{ margin: "auto 0", padding: compact ? "10px 0" : "24px 0 8px" }}>
              <div style={{ fontSize: 26 * s, fontWeight: 600, letterSpacing: "-0.01em", background: "linear-gradient(90deg, #1b6ec2, #23a2a0)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Hi {learnerName}, how can I help today?
              </div>
              {!compact && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10, marginTop: 18 }}>
                  {PROMPTS.map((p) => (
                    <div key={p.k} style={{ background: C.card, border: `1px solid ${C.edge}`, borderRadius: 10, padding: "12px 13px", fontSize: 13, color: C.muted, minHeight: 64 }}>
                      <b style={{ color: C.ink, display: "block", marginBottom: 2 }}>{p.k}</b>
                      {p.t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ maxWidth: "78%", background: C.bubble, borderRadius: 14, padding: "10px 14px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
              </div>
            ) : (
              <div key={m.id} style={{ display: "flex", gap: 12, maxWidth: "92%" }}>
                <span aria-hidden style={{ flexShrink: 0, width: 24, height: 24, borderRadius: 6, marginTop: 2, background: C.mark }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 4 }}>Copilot</div>
                  {m.pending && !m.text ? <TypingDots colour={C.blue} /> : <Lite text={m.text} />}
                  {m.pending && m.text && <span aria-label="writing" style={{ display: "inline-block", width: 8, height: 14, marginLeft: 2, verticalAlign: "text-bottom", background: C.blue, opacity: 0.6, borderRadius: 1 }} />}
                  {!m.pending && m.text && (
                    <>
                      <ActionRow colour={C.faint} items={["copy", "thumbUp", "thumbDown", "speaker"]} />
                      <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>AI-generated content may be incorrect</div>
                    </>
                  )}
                </div>
              </div>
            ),
          )}
        </div>

        <div style={{ padding: compact ? "6px 12px 10px" : pane ? "6px 12px 10px" : "6px 28px 14px" }}>
          {status && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{status}</div>}
          {attachment && <AttachmentChip title={attachment.title} kind={attachment.kind} colour={C.muted} edge={C.edge} />}
          <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${C.edge}`, borderRadius: 12, padding: "10px 10px 8px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <textarea
              aria-label="Message Copilot"
              value={draft}
              readOnly={composerLocked}
              onChange={(e) => onDraftChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canSend) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Message Copilot"
              rows={Math.min(6, Math.max(1, draft.split("\n").length))}
              style={{ resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 14 * s, lineHeight: 1.5, padding: "2px 0 6px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span title="Add content" style={{ display: "inline-flex", padding: 5, color: C.muted }}><Icon d={ICONS.plus} size={17} /></span>
              <span title="Attach" style={{ display: "inline-flex", padding: 5, color: C.muted }}><Icon d={ICONS.attach} size={16} /></span>
              <span style={{ marginLeft: "auto", display: "inline-flex", padding: 5, color: C.muted }}><Icon d={ICONS.mic} size={17} /></span>
              <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send" style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: canSend ? C.blue : "#e0e0e0", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}>
                <Icon d={ICONS.arrowRight} size={16} stroke="#fff" strokeWidth={2} />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 11 * s, color: C.faint, textAlign: "center" }}>Copilot practice tenant. Nothing you send here is stored.</div>
        </div>
      </div>
    </div>
  );
}
