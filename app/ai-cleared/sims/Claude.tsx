"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
import { AttachmentChip, Icon, ICONS, Lite, TypingDots, initialOf } from "./shared";

/* Claude as it looks in the browser in late 2026: the cream sidebar with
 * the collapse icon and the serif "Claude" wordmark, the chat / code
 * toggle, New, Projects, Artifacts, Scheduled, Design, Customize, the
 * "Recents" list and the account row at the foot ("Name · Plan"); the
 * serif greeting with the small terracotta spark; the white prompt card
 * with "How can I help you today?", "+" bottom-left, the mic and voice
 * controls bottom-right, and the Project and model (Opus 5.5 · Medium)
 * pickers under the card; replies in a plain thread with no avatar; and
 * Anthropic's own line: "Claude can make mistakes. Please double-check
 * responses." The plan in the account row is the tier tell: Free, Pro,
 * or the firm's Team workspace. No vendor logo artwork. */

const C = {
  bg: "#faf9f5",
  rail: "#f3f1ea",
  railOn: "#e8e5db",
  edge: "#e4e0d4",
  ink: "#29261b",
  muted: "#6b675c",
  faint: "#9b968a",
  bubble: "#eeebe2",
  terracotta: "#d97757",
  serif: "'Tiempos Text', Georgia, 'Times New Roman', serif",
  font: "-apple-system, 'Segoe UI', 'Söhne', Helvetica, Arial, sans-serif",
};

const RECENT = ["Board summary draft", "Clause 9 wording", "Reply to a complaint", "Holiday policy questions"];

function Spark({ size = 16, colour = C.terracotta }: { size?: number; colour?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={colour} aria-hidden>
      <path d="M12 2l1.4 6.2L18 5.5l-3.3 4.9L21 12l-6.3 1.6 3.3 4.9-4.6-2.7L12 22l-1.4-6.2L6 18.5l3.3-4.9L3 12l6.3-1.6L6 5.5l4.6 2.7z" />
    </svg>
  );
}

function RailItem({ d, label, scale = 1, on, trailing }: { d: string; label: string; scale?: number; on?: boolean; trailing?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: on ? C.railOn : "transparent", color: C.ink, fontSize: 13.5 * scale, fontWeight: on ? 600 : 400 }}>
      <Icon d={d} size={16 * scale} stroke={C.ink} strokeWidth={1.6} />
      {label}
      {trailing && <span style={{ marginLeft: "auto", display: "inline-flex", color: C.muted }}><Icon d={ICONS.plus} size={14 * scale} strokeWidth={1.8} /></span>}
    </div>
  );
}

export default function ClaudeSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact, attachment }: SimProps) {
  const work = tier === "enterprise";
  const plan = work ? "Team" : tier === "consumer-paid" ? "Pro" : "Free";
  const model = tier === "consumer-free" ? "Sonnet 5" : "Opus 5.5";
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  const empty = messages.length === 0;
  const s = compact ? 0.78 : 1;
  const lines = Math.min(6, Math.max(1, draft.split("\n").length));

  const composer = (
    <div style={{ width: "100%", maxWidth: 740, margin: "0 auto" }}>
      {status && <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 6 }}>{status}</div>}
      {attachment && <AttachmentChip title={attachment.title} kind={attachment.kind} colour={C.muted} edge={C.edge} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#ffffff", border: `1px solid ${C.edge}`, borderRadius: 16, padding: "12px 12px 10px 16px", boxShadow: "0 4px 18px rgba(41,38,27,0.06)" }}>
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
          rows={lines}
          style={{ resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15.5 * s, lineHeight: 1.5, padding: "0 0 10px" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span aria-hidden style={{ display: "inline-flex", padding: 4, color: C.ink }}><Icon d={ICONS.plus} size={18 * s} stroke={C.ink} strokeWidth={1.6} /></span>
          <span aria-hidden style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 2, color: C.muted }}>
            <Icon d={ICONS.mic} size={17 * s} strokeWidth={1.6} />
            <Icon d={ICONS.chevron} size={12 * s} strokeWidth={2} />
          </span>
          {!canSend && <span aria-hidden style={{ display: "inline-flex", padding: 4, color: C.ink }}><Icon d={ICONS.wave} size={17 * s} strokeWidth={1.8} /></span>}
          <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send" style={{ width: 32 * s, height: 32 * s, borderRadius: 9, border: "none", background: C.terracotta, display: canSend ? "inline-flex" : "none", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Icon d={ICONS.arrowUp} size={17 * s} stroke="#fff" strokeWidth={2.2} />
          </button>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "8px 14px 0", fontSize: 13 * s, color: C.muted }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>Project <Icon d={ICONS.chevron} size={12 * s} strokeWidth={2} /></span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span><span style={{ color: C.ink }}>{model}</span> <span style={{ marginLeft: 6 }}>Medium</span></span>
          <span aria-hidden style={{ width: 34 * s, height: 12 * s, borderRadius: 999, background: C.railOn, display: "inline-block" }} />
        </span>
      </div>
      <div style={{ marginTop: 8, fontSize: 11.5 * s, color: C.faint, textAlign: "center" }}>Claude can make mistakes. Please double-check responses.</div>
    </div>
  );

  return (
    <div className={compact ? "sim-claude sim-compact" : "sim-claude"} style={{ display: "grid", gridTemplateColumns: compact ? "150px minmax(0, 1fr)" : "236px minmax(0, 1fr)", gridTemplateRows: "minmax(0, 1fr)", minHeight: compact ? 220 : 560, fontSize: compact ? 11 : 14.5, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.55, colorScheme: "light" }}>
      <aside className="sim-claude-rail" style={{ background: C.rail, borderRight: `1px solid ${C.edge}`, padding: "10px 8px 10px", display: "flex", flexDirection: "column", gap: 2, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "2px 6px 10px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: C.serif, fontSize: 19 * s, color: C.ink }}>
            <Icon d={ICONS.sidebar} size={16 * s} stroke={C.muted} strokeWidth={1.6} />
            Claude
          </span>
          <span aria-hidden style={{ display: "inline-flex", border: `1px solid ${C.edge}`, borderRadius: 8, overflow: "hidden" }}>
            <span style={{ display: "inline-flex", padding: "3px 7px", background: "#fff", color: C.ink }}><Icon d={ICONS.chat} size={13 * s} strokeWidth={1.8} /></span>
            <span style={{ display: "inline-flex", padding: "3px 7px", color: C.muted }}><Icon d={ICONS.sliders} size={13 * s} strokeWidth={1.8} /></span>
          </span>
        </div>
        <RailItem d={ICONS.plus} label="New" scale={s} on />
        <RailItem d={ICONS.folder} label="Projects" scale={s} />
        <RailItem d={ICONS.page} label="Artifacts" scale={s} trailing />
        <RailItem d={ICONS.clock} label="Scheduled" scale={s} />
        <RailItem d={ICONS.image} label="Design" scale={s} />
        <RailItem d={ICONS.briefcase} label="Customize" scale={s} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12 * s, color: C.muted, padding: "14px 10px 4px" }}>Recents <Icon d={ICONS.chevron} size={11 * s} strokeWidth={2} /></div>
        {RECENT.map((t) => (
          <div key={t} style={{ padding: "6px 10px", borderRadius: 8, color: C.ink, fontSize: 13.5 * s, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", minWidth: 0 }}>
            <span style={{ width: 24 * s, height: 24 * s, borderRadius: "50%", background: "#6f6ae0", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11 * s, fontWeight: 700, flexShrink: 0 }}>{initialOf(learnerName)}</span>
            <span style={{ minWidth: 0, lineHeight: 1.3 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13.5 * s, color: C.ink, whiteSpace: "nowrap", overflow: "hidden" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{learnerName}</span>
                <span style={{ color: C.muted }}>· {plan}</span>
                <Icon d={ICONS.chevron} size={11 * s} stroke={C.muted} strokeWidth={2} />
              </span>
              {work && <span style={{ display: "block", fontSize: 11.5 * s, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firmName}</span>}
            </span>
          </div>
          <span style={{ alignSelf: "flex-start", marginLeft: 6, padding: "2px 7px", borderRadius: 4, background: C.railOn, color: C.muted, fontWeight: 600, fontSize: 10.5 * s, letterSpacing: "0.02em" }}>Practice tenant</span>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "10px 16px", color: C.muted }}>
          <Icon d={ICONS.settings} size={16 * s} strokeWidth={1.6} />
        </div>

        {empty ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: compact ? "10px 16px 18px" : "24px 28px 40px" }}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, fontFamily: C.serif, fontSize: 32 * s, color: C.ink, letterSpacing: "-0.01em", marginBottom: 22 * s }}>
              <Spark size={30 * s} />
              {greet}, {learnerName}
            </div>
            {composer}
          </div>
        ) : (
          <>
            <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "16px 28px" }}>
              <div style={{ width: "100%", maxWidth: 740, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                      <div style={{ maxWidth: "76%", background: C.bubble, borderRadius: 16, padding: "10px 16px", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 15.5 * s }}>{m.text}</div>
                      {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
                    </div>
                  ) : (
                    <div key={m.id} style={{ minWidth: 0, fontSize: 15.5 * s, lineHeight: 1.7 }}>
                      {m.pending && !m.text ? <TypingDots colour={C.terracotta} /> : <Lite text={m.text} />}
                      {m.pending && m.text && <span aria-label="writing" style={{ display: "inline-block", width: 8, height: 15, marginLeft: 2, verticalAlign: "text-bottom", background: C.terracotta, opacity: 0.7, borderRadius: 1 }} />}
                      {!m.pending && m.text && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, color: C.muted }}>
                          {(["copy", "thumbUp", "thumbDown"] as const).map((k) => (
                            <span key={k} style={{ display: "inline-flex", padding: 5, borderRadius: 6 }}><Icon d={ICONS[k]} size={16} strokeWidth={1.6} /></span>
                          ))}
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 6, fontSize: 12.5 }}><Icon d={ICONS.refresh} size={15} strokeWidth={1.6} /> Retry <Icon d={ICONS.chevron} size={11} strokeWidth={2} /></span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
            <div style={{ padding: "6px 28px 12px" }}>{composer}</div>
          </>
        )}
      </div>
    </div>
  );
}
