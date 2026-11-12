"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
import { AttachmentChip, Icon, ICONS, Lite, TypingDots, initialOf } from "./shared";

/* ChatGPT as it looks in the browser in late 2026: the pale sidebar with
 * the product switcher ("ChatGPT", or the firm's workspace name on a
 * Business account) and the collapse icon, New chat, Search chats, Images,
 * Projects and GPTs, the chat list, and the account row at the foot (with
 * "Upgrade plan" above it on the free tier); the model picker top-left of
 * the pane; "Where should we begin?" over a centred pill prompt box with
 * "+", "Ask ChatGPT", the mic and the round send button; replies in a
 * plain thread with no avatar; and OpenAI's own line under the box:
 * "ChatGPT can make mistakes. Check important info." No vendor logo. */

const C = {
  bg: "#ffffff",
  rail: "#f9f9f9",
  railOn: "#ececec",
  edge: "#e3e3e3",
  ink: "#0d0d0d",
  muted: "#5d5d5d",
  faint: "#8f8f8f",
  bubble: "#f4f4f4",
  pill: "#f1f1f1",
  font: "-apple-system, 'Segoe UI', 'Söhne', Helvetica, Arial, sans-serif",
};

const RECENT = ["Chase invoice draft", "Reference letter wording", "Meeting notes tidy-up"];

function RailItem({ d, label, scale = 1, on }: { d: string; label: string; scale?: number; on?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 10, background: on ? C.railOn : "transparent", color: C.ink, fontSize: 13.5 * scale }}>
      <Icon d={d} size={17 * scale} stroke={C.ink} strokeWidth={1.6} />
      {label}
    </div>
  );
}

export default function ChatGPTSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact, attachment }: SimProps) {
  const work = tier === "enterprise";
  const plan = work ? `${firmName} · Business workspace` : tier === "consumer-paid" ? "Personal · Plus" : "Personal · Free";
  const model = tier === "consumer-free" ? "ChatGPT" : "ChatGPT 5.5";
  const avatar = work ? "#1f9d55" : tier === "consumer-paid" ? "#7a5af8" : "#9c9c9c";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  const empty = messages.length === 0;
  const s = compact ? 0.78 : 1;
  const lines = Math.min(6, Math.max(1, draft.split("\n").length));
  const multi = lines > 1;

  const composer = (
    <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
      {status && <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 6 }}>{status}</div>}
      {attachment && <AttachmentChip title={attachment.title} kind={attachment.kind} colour={C.muted} edge={C.edge} />}
      <div style={{ display: "flex", flexDirection: multi ? "column" : "row", alignItems: multi ? "stretch" : "center", gap: multi ? 4 : 10, border: `1px solid ${C.edge}`, borderRadius: multi ? 26 : 999, padding: multi ? "12px 10px 8px 18px" : "8px 8px 8px 18px", background: "#fff", boxShadow: "0 2px 14px rgba(0,0,0,0.07)" }}>
        {!multi && <span aria-hidden style={{ display: "inline-flex", color: C.ink, flexShrink: 0 }}><Icon d={ICONS.plus} size={20 * s} stroke={C.ink} strokeWidth={1.6} /></span>}
        <textarea
          aria-label="Message ChatGPT"
          value={draft}
          readOnly={composerLocked}
          onChange={(e) => onDraftChange?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && canSend) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Ask ChatGPT"
          rows={lines}
          style={{ flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15.5 * s, lineHeight: 1.5, padding: multi ? "0 0 6px" : "4px 0" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {multi && <span aria-hidden style={{ display: "inline-flex", padding: 4, color: C.ink }}><Icon d={ICONS.plus} size={20 * s} stroke={C.ink} strokeWidth={1.6} /></span>}
          <span aria-hidden title="Dictate" style={{ marginLeft: "auto", display: "inline-flex", padding: 4, color: C.ink }}><Icon d={ICONS.mic} size={19 * s} stroke={C.ink} strokeWidth={1.6} /></span>
          <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send" style={{ width: 34 * s, height: 34 * s, borderRadius: "50%", border: "none", background: canSend ? C.ink : "#e4e4e4", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}>
            <Icon d={ICONS.arrowUp} size={18 * s} stroke={canSend ? "#fff" : "#9a9a9a"} strokeWidth={2.2} />
          </button>
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: 11.5 * s, color: C.faint, textAlign: "center" }}>ChatGPT can make mistakes. Check important info.</div>
    </div>
  );

  return (
    <div className={compact ? "sim-chatgpt sim-compact" : "sim-chatgpt"} style={{ display: "grid", gridTemplateColumns: compact ? "150px minmax(0, 1fr)" : "248px minmax(0, 1fr)", gridTemplateRows: "minmax(0, 1fr)", minHeight: compact ? 220 : 560, fontSize: compact ? 11 : 14.5, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.55, colorScheme: "light" }}>
      <aside className="sim-chatgpt-rail" style={{ background: C.rail, borderRight: `1px solid ${C.edge}`, padding: "10px 8px 12px", display: "flex", flexDirection: "column", gap: 1, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "4px 8px 12px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: 15 * s, color: C.ink, minWidth: 0 }}>
            <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{work ? firmName : "ChatGPT"}</span>
            <Icon d={ICONS.chevron} size={13 * s} stroke={C.muted} strokeWidth={2} />
          </span>
          <Icon d={ICONS.sidebar} size={17 * s} stroke={C.muted} strokeWidth={1.6} />
        </div>
        <RailItem d={ICONS.pencilSquare} label="New chat" scale={s} />
        <RailItem d={ICONS.search} label="Search chats" scale={s} />
        <RailItem d={ICONS.image} label="Images" scale={s} />
        <div style={{ height: 10 }} />
        <RailItem d={ICONS.folder} label="Projects" scale={s} />
        <RailItem d={ICONS.gem} label="GPTs" scale={s} />
        <div style={{ fontSize: 12 * s, color: C.faint, padding: "14px 10px 4px" }}>Chats</div>
        {RECENT.map((t) => (
          <div key={t} style={{ padding: "7px 10px", borderRadius: 10, color: C.ink, fontSize: 13.5 * s, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {tier === "consumer-free" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", borderRadius: 10 }}>
              <Icon d={ICONS.sparkle} size={17 * s} stroke={C.ink} strokeWidth={1.6} />
              <span style={{ minWidth: 0, lineHeight: 1.3 }}>
                <span style={{ display: "block", fontSize: 13.5 * s, color: C.ink }}>Upgrade plan</span>
                <span style={{ display: "block", fontSize: 11.5 * s, color: C.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>More access to the best models</span>
              </span>
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 10px", borderRadius: 10 }}>
            <span style={{ width: 26 * s, height: 26 * s, borderRadius: "50%", background: avatar, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 * s, fontWeight: 700, flexShrink: 0 }}>{initialOf(learnerName)}</span>
            <span style={{ minWidth: 0, lineHeight: 1.3 }}>
              <span style={{ display: "block", fontSize: 13.5 * s, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learnerName}</span>
              <span style={{ display: "block", fontSize: 11.5 * s, color: C.faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plan}</span>
            </span>
          </div>
          <span style={{ alignSelf: "flex-start", marginLeft: 10, padding: "2px 7px", borderRadius: 4, background: C.railOn, color: C.muted, fontWeight: 600, fontSize: 10.5 * s, letterSpacing: "0.02em" }}>Practice tenant</span>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 16 * s, fontWeight: 600, color: C.muted }}>
            {model}
            <Icon d={ICONS.chevron} size={15 * s} stroke={C.faint} strokeWidth={2} />
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14, color: C.ink }}>
            {tier === "consumer-free" && <span style={{ fontSize: 12.5 * s, fontWeight: 600, color: "#fff", background: C.ink, borderRadius: 999, padding: "5px 12px" }}>Upgrade</span>}
            <Icon d={ICONS.chat} size={17 * s} strokeWidth={1.6} dash="2.5 2.5" />
            <span style={{ width: 28 * s, height: 28 * s, borderRadius: "50%", background: avatar, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 * s, fontWeight: 700 }}>{initialOf(learnerName)}</span>
          </span>
        </div>

        {empty ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: compact ? "10px 16px 18px" : "24px 28px 40px" }}>
            <div style={{ textAlign: "center", fontSize: 28 * s, fontWeight: 500, color: C.ink, letterSpacing: "-0.01em", marginBottom: 22 * s }}>Where should we begin?</div>
            {composer}
          </div>
        ) : (
          <>
            <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "16px 28px" }}>
              <div style={{ width: "100%", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                      <div style={{ maxWidth: "72%", background: C.bubble, borderRadius: 24, padding: "10px 18px", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 15.5 * s }}>{m.text}</div>
                      {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
                    </div>
                  ) : (
                    <div key={m.id} style={{ minWidth: 0, fontSize: 15.5 * s, lineHeight: 1.7 }}>
                      {m.pending && !m.text ? <TypingDots colour={C.ink} /> : <Lite text={m.text} />}
                      {m.pending && m.text && <span aria-label="writing" style={{ display: "inline-block", width: 10, height: 10, marginLeft: 3, borderRadius: "50%", background: C.ink, verticalAlign: "middle" }} />}
                      {!m.pending && m.text && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8, color: C.muted }}>
                          {(["copy", "thumbUp", "thumbDown", "speaker", "refresh", "share"] as const).map((k) => (
                            <span key={k} style={{ display: "inline-flex", padding: 5, borderRadius: 6 }}><Icon d={ICONS[k]} size={16} strokeWidth={1.6} /></span>
                          ))}
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
