"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
export type { SimMessage, SimProps } from "./types";

/* A recreation of ChatGPT's chat surface in its native dark look: the rail
 * of chats on the left, the model picker top-left, a pill composer with a
 * round white send button, replies as plain text. Nominative use in
 * training: the tool is named, no vendor logo or wordmark artwork is used,
 * and every simulator carries the "Practice tenant" label. The chrome is
 * deliberately the vendor's, not the console's, so habits transfer. */

const C = {
  bg: "#212121",
  rail: "#171717",
  edge: "rgba(255,255,255,0.1)",
  ink: "#ececec",
  muted: "#b4b4b4",
  faint: "#8e8e8e",
  bubble: "#2f2f2f",
  composer: "#303030",
  railActive: "rgba(255,255,255,0.06)",
  send: "#ffffff",
  sendInk: "#0d0d0d",
  sendOff: "#676767",
  badge: "rgba(255,255,255,0.08)",
  free: "#b4b4b4",
  plus: "#c9a8ff",
  team: "#8fd3a5",
  font: "-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
};

function Icon({ d, size = 18, stroke = C.muted }: { d: string; size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function ChatGPTSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact }: SimProps) {
  const account = tier === "enterprise" ? `${firmName} · Business workspace` : tier === "consumer-paid" ? "Personal · Plus" : "Personal · Free";
  const accountTint = tier === "enterprise" ? C.team : tier === "consumer-paid" ? C.plus : C.free;
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const empty = messages.length === 0;
  const scale = compact ? 0.78 : 1;
  const initial = learnerName.slice(0, 1).toUpperCase();

  return (
    <div className={compact ? "sim-chatgpt sim-compact" : "sim-chatgpt"} style={{ display: "grid", gridTemplateColumns: compact ? "120px minmax(0, 1fr)" : "220px minmax(0, 1fr)", minHeight: compact ? 200 : 520, fontSize: compact ? 11 : 14, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.5, colorScheme: "dark" }}>
      {/* rail */}
      <aside className="sim-chatgpt-rail" style={{ background: C.rail, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {[
          { label: "New chat", d: "M4 20h4l10-10-4-4L4 16v4zM13 7l4 4" },
          { label: "Search chats", d: "M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4" },
        ].map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 8, color: C.ink, fontSize: 13.5 }}>
            <Icon d={it.d} size={16} stroke={C.ink} />
            {it.label}
          </div>
        ))}
        <div style={{ marginTop: 14, padding: "0 8px 4px", fontSize: 11.5, color: C.faint, fontWeight: 600 }}>Today</div>
        <div style={{ padding: "7px 8px", borderRadius: 8, background: C.railActive, color: C.ink, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Chase invoice draft</div>
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.edge}`, fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span aria-hidden style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: accountTint, color: "#0d0d0d", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{initial}</span>
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.3 }}>
              <span style={{ color: C.ink, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learnerName}</span>
              <span style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{account}</span>
            </span>
          </span>
          <span style={{ alignSelf: "flex-start", padding: "2px 7px", borderRadius: 4, background: C.badge, color: C.ink, fontWeight: 600, fontSize: 11, letterSpacing: "0.02em" }}>Practice tenant</span>
        </div>
      </aside>

      {/* stage */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", fontSize: 15, color: C.ink }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
            ChatGPT
            <Icon d="M6 9l6 6 6-6" size={14} stroke={C.faint} />
          </span>
          <span aria-hidden style={{ width: 26, height: 26, borderRadius: "50%", background: accountTint, color: "#0d0d0d", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{initial}</span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>
          {empty && (
            <div style={{ margin: "auto 0", padding: "28px 0 8px", textAlign: "center" }}>
              <div style={{ fontSize: 26 * scale, fontWeight: 600, letterSpacing: "-0.01em", color: C.ink }}>What can I help with?</div>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ maxWidth: "78%", background: C.bubble, borderRadius: 18, padding: "10px 16px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
              </div>
            ) : (
              <div key={m.id} style={{ display: "flex", gap: 12, maxWidth: "92%" }}>
                <span aria-hidden style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", marginTop: 1, border: `1px solid ${C.ink}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.ink }} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>ChatGPT</div>
                  <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {m.text}
                    {m.pending && <span aria-label="writing" style={{ display: "inline-block", width: 10, height: 10, marginLeft: 4, borderRadius: "50%", background: C.ink, verticalAlign: "middle" }} />}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        <div style={{ padding: "8px 16px 14px" }}>
          {status && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{status}</div>}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, background: C.composer, borderRadius: 26, padding: "8px 8px 8px 12px" }}>
            <span title="Attach" style={{ display: "inline-flex", padding: 7 }}><Icon d="M12 5v14M5 12h14" stroke={C.ink} /></span>
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
              style={{ flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15, lineHeight: 1.5, padding: "6px 0" }}
            />
            <span title="Voice" style={{ display: "inline-flex", padding: 7 }}><Icon d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4" stroke={C.ink} /></span>
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send"
              style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: canSend ? C.send : C.sendOff, color: C.sendInk, display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}
            >
              <Icon d="M12 19V5M6 11l6-6 6 6" stroke={C.sendInk} />
            </button>
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: C.faint, textAlign: "center" }}>ChatGPT practice tenant. Nothing you send here is stored.</div>
        </div>
      </div>
    </div>
  );
}
