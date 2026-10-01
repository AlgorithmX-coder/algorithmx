"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
import { ActionRow, AttachmentChip, Icon, ICONS, Lite, TypingDots, initialOf } from "./shared";

/* Claude in the browser: the cream sidebar (New chat, Chats, Projects,
 * Artifacts, Recents), the serif greeting with the small spark mark, the
 * white composer card with "How can I help you today?", the "+" and tools
 * controls, the model picker and the terracotta send button, and
 * Anthropic's own line under it: "Claude can make mistakes. Please
 * double-check responses." The plan shows in the account block: Free, Pro,
 * or the firm's Team workspace. No vendor logo. */

const C = {
  bg: "#faf9f5",
  rail: "#f0eee6",
  edge: "#e5e1d5",
  ink: "#29261b",
  muted: "#6b675c",
  faint: "#9b968a",
  bubble: "#ebe8df",
  terracotta: "#da7756",
  terracottaSoft: "#f5e6dd",
  serif: "Georgia, 'Times New Roman', 'Tiempos Text', serif",
  font: "-apple-system, 'Segoe UI', 'Söhne', Helvetica, Arial, sans-serif",
};

function Mark({ size = 16, colour = C.terracotta }: { size?: number; colour?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={colour} aria-hidden>
      <path d="M12 2l1.4 6.2L18 5.5l-3.3 4.9L21 12l-6.3 1.6 3.3 4.9-4.6-2.7L12 22l-1.4-6.2L6 18.5l3.3-4.9L3 12l6.3-1.6L6 5.5l4.6 2.7z" />
    </svg>
  );
}

export default function ClaudeSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact, attachment }: SimProps) {
  const plan = tier === "enterprise" ? `${firmName} · Team` : tier === "consumer-paid" ? "Pro plan" : "Free plan";
  const model = tier === "consumer-free" ? "Claude Sonnet 4.5" : "Claude Opus 4.5";
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  const empty = messages.length === 0;
  const s = compact ? 0.78 : 1;

  return (
    <div className={compact ? "sim-claude sim-compact" : "sim-claude"} style={{ display: "grid", gridTemplateColumns: compact ? "150px minmax(0, 1fr)" : "236px minmax(0, 1fr)", minHeight: compact ? 220 : 560, fontSize: compact ? 11 : 14.5, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.55, colorScheme: "light" }}>
      <aside className="sim-claude-rail" style={{ background: C.rail, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 12px", fontFamily: C.serif, fontSize: 18 * s, color: C.ink }}>
          <Mark size={16 * s} colour={C.ink} />
          Claude
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8, color: C.terracotta, fontSize: 13.5 * s, fontWeight: 600 }}>
          <span style={{ width: 22 * s, height: 22 * s, borderRadius: "50%", background: C.terracotta, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon d={ICONS.plus} size={13} stroke="#fff" strokeWidth={2.2} /></span>
          New chat
        </div>
        {[
          { label: "Chats", d: ICONS.chat },
          { label: "Projects", d: ICONS.folder },
          { label: "Artifacts", d: ICONS.page },
        ].map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, color: C.ink, fontSize: 13.5 * s }}>
            <Icon d={it.d} size={16} stroke={C.muted} />
            {it.label}
          </div>
        ))}
        <div style={{ fontSize: 12 * s, color: C.faint, padding: "14px 10px 4px" }}>Recents</div>
        {["Board summary draft", "Clause 9 wording", "Reply to a complaint"].map((t, i) => (
          <div key={t} style={{ padding: "6px 10px", borderRadius: 8, background: i === 0 ? "#e6e2d6" : "transparent", color: C.ink, fontSize: 13 * s, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${C.edge}`, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px" }}>
            <span style={{ width: 26 * s, height: 26 * s, borderRadius: "50%", background: C.terracotta, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 * s, fontWeight: 700, flexShrink: 0 }}>{initialOf(learnerName)}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13 * s, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learnerName}</span>
              <span style={{ display: "block", fontSize: 11.5 * s, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plan}</span>
            </span>
          </div>
          <span style={{ alignSelf: "flex-start", marginLeft: 8, padding: "2px 7px", borderRadius: 4, background: C.terracottaSoft, color: C.terracotta, fontWeight: 600, fontSize: 11 * s }}>Practice tenant</span>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", fontSize: 13 * s, color: C.muted }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>{empty ? "New chat" : "Chat"} <Icon d={ICONS.chevron} size={14} stroke={C.faint} /></span>
          <span>{plan}</span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: compact ? "10px 16px" : "16px 11%", display: "flex", flexDirection: "column", gap: 18 }}>
          {empty && (
            <div style={{ margin: "auto 0", textAlign: "center", padding: compact ? "10px 0" : "36px 0 16px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: C.serif, fontSize: 30 * s, color: C.ink, letterSpacing: "-0.01em" }}>
                <Mark size={26 * s} />
                {greet}, {learnerName}
              </div>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ maxWidth: "74%", background: C.bubble, borderRadius: 16, padding: "10px 16px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
              </div>
            ) : (
              <div key={m.id} style={{ display: "flex", gap: 12, maxWidth: "94%" }}>
                <span style={{ flexShrink: 0, marginTop: 3, width: 22, height: 22, borderRadius: "50%", background: C.terracotta, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Mark size={12} colour="#fff" /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  {m.pending && !m.text ? <TypingDots colour={C.terracotta} /> : <Lite text={m.text} />}
                  {m.pending && m.text && <span aria-label="writing" style={{ display: "inline-block", width: 8, height: 15, marginLeft: 2, verticalAlign: "text-bottom", background: C.terracotta, opacity: 0.7, borderRadius: 1 }} />}
                  {!m.pending && m.text && <ActionRow colour={C.faint} items={["copy", "thumbUp", "thumbDown", "refresh"]} />}
                </div>
              </div>
            ),
          )}
        </div>

        <div style={{ padding: compact ? "6px 12px 10px" : "6px 11% 12px" }}>
          {status && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{status}</div>}
          {attachment && <AttachmentChip title={attachment.title} kind={attachment.kind} colour={C.muted} edge={C.edge} />}
          <div style={{ display: "flex", flexDirection: "column", background: "#fff", border: `1px solid ${C.edge}`, borderRadius: 16, padding: "12px 12px 10px 16px", boxShadow: "0 4px 18px rgba(41,38,27,0.06)" }}>
            <textarea
              aria-label="Message Claude"
              value={draft}
              readOnly={composerLocked}
              onChange={(e) => onDraftChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canSend) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="How can I help you today?"
              rows={Math.min(6, Math.max(1, draft.split("\n").length))}
              style={{ resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15 * s, lineHeight: 1.5, padding: "2px 0 10px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-flex", padding: 5, color: C.muted, border: `1px solid ${C.edge}`, borderRadius: 8 }}><Icon d={ICONS.plus} size={16} /></span>
              <span style={{ display: "inline-flex", padding: 5, color: C.muted, border: `1px solid ${C.edge}`, borderRadius: 8 }}><Icon d={ICONS.sliders} size={16} /></span>
              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5 * s, color: C.muted }}>{model} <Icon d={ICONS.chevron} size={14} stroke={C.faint} /></span>
              <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send" style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: canSend ? C.terracotta : "#e9c9b9", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}>
                <Icon d={ICONS.arrowUp} size={17} stroke="#fff" strokeWidth={2.2} />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5 * s, color: C.faint, textAlign: "center" }}>Claude can make mistakes. Please double-check responses. · Practice tenant, nothing is stored.</div>
        </div>
      </div>
    </div>
  );
}
