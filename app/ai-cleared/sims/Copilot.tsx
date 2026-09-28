"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
export type { SimMessage, SimProps } from "./types";

/* A recreation of Microsoft 365 Copilot's chat surface in its native light
 * look: the rail of chats and pages on the left, a tenant label, the blue
 * send button, replies as plain cards. Nominative use in training: the tool
 * is named, no vendor logo or wordmark artwork is used, and every simulator
 * carries the "Practice tenant" label. The chrome is deliberately the
 * vendor's, not the console's, so habits transfer. */

const C = {
  bg: "#ffffff",
  rail: "#f5f5f5",
  edge: "#e1e1e1",
  ink: "#242424",
  muted: "#616161",
  faint: "#8a8a8a",
  bubble: "#f0f0f0",
  blue: "#0f6cbd",
  blueSoft: "#e8f1fb",
  font: "'Segoe UI', 'Segoe UI Web', -apple-system, system-ui, Helvetica, Arial, sans-serif",
};

function Icon({ d, size = 18, stroke = C.muted }: { d: string; size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

export default function CopilotSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact }: SimProps) {
  const account = tier === "enterprise" ? `${firmName} · work account` : tier === "consumer-paid" ? "Copilot Pro · personal account" : "Personal account · free";
  const accountDot = tier === "enterprise" ? "#13a10e" : "#c19c00";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const empty = messages.length === 0;
  const scale = compact ? 0.78 : 1;

  return (
    <div className={compact ? "sim-copilot sim-compact" : "sim-copilot"} style={{ display: "grid", gridTemplateColumns: compact ? "120px minmax(0, 1fr)" : "200px minmax(0, 1fr)", minHeight: compact ? 200 : 520, fontSize: compact ? 11 : 14, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.5, colorScheme: "light" }}>
      {/* rail */}
      <aside className="sim-copilot-rail" style={{ background: C.rail, borderRight: `1px solid ${C.edge}`, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 6px 12px", fontWeight: 600, fontSize: 15 }}>
          <span aria-hidden style={{ width: 20, height: 20, borderRadius: 6, background: `linear-gradient(135deg, #2f7ee6, #33c1b7 60%, #f2b64a)` }} />
          Copilot
        </div>
        {[
          { label: "New chat", d: "M12 5v14M5 12h14" },
          { label: "Chats", d: "M4 5h16v11H8l-4 4V5z" },
          { label: "Pages", d: "M7 3h7l5 5v13H7V3zM14 3v5h5" },
          { label: "Agents", d: "M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21a8 8 0 0 1 16 0" },
        ].map((it, i) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 6, background: i === 0 ? "#e9e9e9" : "transparent", color: C.ink, fontSize: 13.5 }}>
            <Icon d={it.d} size={16} />
            {it.label}
          </div>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.edge}`, fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: accountDot }} />
            {account}
          </span>
          <span style={{ alignSelf: "flex-start", padding: "2px 7px", borderRadius: 4, background: C.blueSoft, color: C.blue, fontWeight: 600, fontSize: 11, letterSpacing: "0.02em" }}>Practice tenant</span>
        </div>
      </aside>

      {/* stage */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: `1px solid ${C.edge}`, fontSize: 13, color: C.muted }}>
          <span>{tier === "enterprise" ? "Work" : "Chat"}</span>
          <span className="sim-copilot-tenant" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#c7e0f4", color: "#0f4a80", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{learnerName.slice(0, 1).toUpperCase()}</span>
            {learnerName}
          </span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {empty && (
            <div style={{ margin: "auto 0", padding: "28px 0 8px" }}>
              <div style={{ fontSize: 26 * scale, fontWeight: 600, letterSpacing: "-0.01em", background: "linear-gradient(90deg, #1b6ec2, #23a2a0)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
                Hi {learnerName}, how can I help today?
              </div>
              <div style={{ marginTop: 6, color: C.muted }}>Ask a question, draft an email, or summarise a file from your work account.</div>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ maxWidth: "82%", background: C.bubble, borderRadius: 14, padding: "10px 14px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
              </div>
            ) : (
              <div key={m.id} style={{ display: "flex", gap: 10, maxWidth: "92%" }}>
                <span aria-hidden style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, marginTop: 2, background: `linear-gradient(135deg, #2f7ee6, #33c1b7 60%, #f2b64a)` }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>Copilot</div>
                  <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {m.text}
                    {m.pending && <span aria-label="writing" style={{ display: "inline-block", width: 8, height: 14, marginLeft: 2, verticalAlign: "text-bottom", background: C.blue, opacity: 0.6, borderRadius: 1 }} />}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        <div style={{ padding: "8px 16px 14px" }}>
          {status && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{status}</div>}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, border: `1px solid ${C.edge}`, borderRadius: 12, padding: "8px 8px 8px 12px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <span title="Add content" style={{ display: "inline-flex", padding: 6 }}><Icon d="M12 5v14M5 12h14" /></span>
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
              style={{ flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 14, lineHeight: 1.5, padding: "6px 0" }}
            />
            <span title="Voice" style={{ display: "inline-flex", padding: 6 }}><Icon d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4" /></span>
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send"
              style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: canSend ? C.blue : "#d6d6d6", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}
            >
              <Icon d="M4 12h15M13 6l6 6-6 6" stroke="#fff" />
            </button>
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: C.faint, textAlign: "center" }}>Copilot practice tenant. Nothing you send here is stored.</div>
        </div>
      </div>
    </div>
  );
}
