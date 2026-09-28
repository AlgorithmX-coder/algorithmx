"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
import { ActionRow, Icon, ICONS, Lite, TypingDots, initialOf } from "./shared";

/* ChatGPT in its default light look: the sidebar with New chat, Search
 * chats, Library, GPTs, Projects and the chat list, the model picker
 * top-left, "What can I help with?" in the middle, the pill composer with
 * "+", Tools, "Ask anything", the mic and the black round send button, and
 * OpenAI's own line under it: "ChatGPT can make mistakes. Check important
 * info." The tier shows in the account block at the bottom of the sidebar:
 * Free, Plus, or the firm's Business workspace. No vendor logo. */

const C = {
  bg: "#ffffff",
  rail: "#f9f9f9",
  edge: "#e5e5e5",
  ink: "#0d0d0d",
  muted: "#5d5d5d",
  faint: "#8f8f8f",
  bubble: "#f1f1f1",
  hover: "#ececec",
  black: "#0d0d0d",
  font: "-apple-system, 'Segoe UI', 'Söhne', Helvetica, Arial, sans-serif",
};

export default function ChatGPTSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact }: SimProps) {
  const plan = tier === "enterprise" ? `${firmName} · Business workspace` : tier === "consumer-paid" ? "Personal · Plus" : "Personal · Free";
  const model = tier === "consumer-free" ? "ChatGPT" : "ChatGPT 5";
  const avatar = tier === "enterprise" ? "#1f9d55" : tier === "consumer-paid" ? "#7a5af8" : "#9c9c9c";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  const empty = messages.length === 0;
  const s = compact ? 0.78 : 1;

  return (
    <div className={compact ? "sim-chatgpt sim-compact" : "sim-chatgpt"} style={{ display: "grid", gridTemplateColumns: compact ? "150px minmax(0, 1fr)" : "248px minmax(0, 1fr)", minHeight: compact ? 220 : 560, fontSize: compact ? 11 : 14.5, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.55, colorScheme: "light" }}>
      <aside className="sim-chatgpt-rail" style={{ background: C.rail, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 10px" }}>
          <span aria-hidden style={{ width: 24 * s, height: 24 * s, borderRadius: "50%", border: `2px solid ${C.ink}`, display: "inline-block", position: "relative" }}>
            <span style={{ position: "absolute", inset: 5, borderRadius: "50%", border: `2px solid ${C.ink}` }} />
          </span>
          <Icon d={ICONS.sliders} size={16} stroke={C.muted} />
        </div>
        {[
          { label: "New chat", d: ICONS.pencilSquare },
          { label: "Search chats", d: ICONS.search },
          { label: "Library", d: ICONS.image },
        ].map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 9px", borderRadius: 8, color: C.ink, fontSize: 13.5 * s }}>
            <Icon d={it.d} size={17} stroke={C.ink} />
            {it.label}
          </div>
        ))}
        <div style={{ height: 8 }} />
        {[
          { label: "GPTs", d: ICONS.gem },
          { label: "Projects", d: ICONS.folder },
        ].map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 9px", borderRadius: 8, color: C.ink, fontSize: 13.5 * s }}>
            <Icon d={it.d} size={17} stroke={C.ink} />
            {it.label}
          </div>
        ))}
        <div style={{ fontSize: 12 * s, color: C.faint, padding: "14px 9px 4px" }}>Chats</div>
        {["Chase invoice draft", "Reference letter wording", "Meeting notes tidy-up"].map((t, i) => (
          <div key={t} style={{ padding: "7px 9px", borderRadius: 8, background: i === 0 ? C.hover : "transparent", color: C.ink, fontSize: 13.5 * s, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 10, borderTop: `1px solid ${C.edge}`, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px" }}>
            <span style={{ width: 26 * s, height: 26 * s, borderRadius: "50%", background: avatar, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 * s, fontWeight: 700, flexShrink: 0 }}>{initialOf(learnerName)}</span>
            <span style={{ minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 13 * s, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learnerName}</span>
              <span style={{ display: "block", fontSize: 11.5 * s, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{plan}</span>
            </span>
          </div>
          <span style={{ alignSelf: "flex-start", marginLeft: 8, padding: "2px 7px", borderRadius: 4, background: "#eaeaea", color: C.muted, fontWeight: 600, fontSize: 11 * s }}>Practice tenant</span>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 16 * s, fontWeight: 600, color: C.ink }}>
            {model}
            <Icon d={ICONS.chevron} size={16} stroke={C.faint} />
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            {tier === "consumer-free" && <span style={{ fontSize: 12.5 * s, fontWeight: 600, color: "#fff", background: C.black, borderRadius: 999, padding: "5px 11px" }}>Upgrade</span>}
            <span style={{ width: 28 * s, height: 28 * s, borderRadius: "50%", background: avatar, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 * s, fontWeight: 700 }}>{initialOf(learnerName)}</span>
          </span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: compact ? "10px 16px" : "16px 12%", display: "flex", flexDirection: "column", gap: 18 }}>
          {empty && (
            <div style={{ margin: "auto 0", textAlign: "center", padding: compact ? "10px 0" : "40px 0 20px" }}>
              <div style={{ fontSize: 28 * s, fontWeight: 500, color: C.ink, letterSpacing: "-0.01em" }}>What can I help with?</div>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ maxWidth: "70%", background: C.bubble, borderRadius: 20, padding: "10px 18px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
              </div>
            ) : (
              <div key={m.id} style={{ minWidth: 0 }}>
                {m.pending && !m.text ? <TypingDots colour={C.ink} /> : <Lite text={m.text} />}
                {m.pending && m.text && <span aria-label="writing" style={{ display: "inline-block", width: 9, height: 9, marginLeft: 3, borderRadius: "50%", background: C.ink, verticalAlign: "middle" }} />}
                {!m.pending && m.text && <ActionRow colour={C.faint} items={["copy", "thumbUp", "thumbDown", "speaker", "refresh"]} />}
              </div>
            ),
          )}
        </div>

        <div style={{ padding: compact ? "6px 12px 10px" : "6px 12% 12px" }}>
          {status && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{status}</div>}
          <div style={{ display: "flex", flexDirection: "column", border: `1px solid ${C.edge}`, borderRadius: 26, padding: "10px 10px 8px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", background: "#fff" }}>
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
              placeholder="Ask anything"
              rows={Math.min(6, Math.max(1, draft.split("\n").length))}
              style={{ resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15 * s, lineHeight: 1.5, padding: "2px 0 6px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-flex", padding: 5, color: C.ink }}><Icon d={ICONS.plus} size={18} /></span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, border: `1px solid ${C.edge}`, fontSize: 12.5 * s, color: C.muted }}><Icon d={ICONS.sliders} size={14} /> Tools</span>
              <span style={{ marginLeft: "auto", display: "inline-flex", padding: 5, color: C.ink }}><Icon d={ICONS.mic} size={18} /></span>
              <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: canSend ? C.black : "#d9d9d9", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}>
                <Icon d={ICONS.arrowUp} size={18} stroke="#fff" strokeWidth={2.2} />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5 * s, color: C.faint, textAlign: "center" }}>ChatGPT can make mistakes. Check important info. · Practice tenant, nothing is stored.</div>
        </div>
      </div>
    </div>
  );
}
