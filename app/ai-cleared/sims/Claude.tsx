"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
export type { SimMessage, SimProps } from "./types";

/* A recreation of Claude's chat surface in its native cream look: the warm
 * rail on the left, a serif greeting with a small terracotta mark, a white
 * composer card with the model chip and a terracotta send square.
 * Nominative use in training: the tool is named, no vendor logo or
 * wordmark artwork is used, and every simulator carries the "Practice
 * tenant" label. The chrome is deliberately the vendor's, not the
 * console's, so habits transfer. */

const C = {
  bg: "#faf9f5",
  rail: "#f0eee6",
  edge: "#e5e1d5",
  ink: "#29261b",
  muted: "#6b6656",
  faint: "#9a9484",
  bubble: "#f0eee6",
  composer: "#ffffff",
  railActive: "#e6e2d6",
  terra: "#da7756",
  terraOff: "#e9c8b8",
  terraSoft: "#f8e8e0",
  font: "-apple-system, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif",
  serif: "Georgia, 'Times New Roman', serif",
};

function Icon({ d, size = 18, stroke = C.muted }: { d: string; size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/* Six-arm asterisk-like mark in terracotta, drawn as strokes. */
function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={C.terra} strokeWidth="2.4" strokeLinecap="round" aria-hidden>
      <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />
    </svg>
  );
}

export default function ClaudeSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact }: SimProps) {
  const account = tier === "enterprise" ? `${firmName} · Team` : tier === "consumer-paid" ? "Pro plan" : "Free plan";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const empty = messages.length === 0;
  const scale = compact ? 0.78 : 1;
  const initial = learnerName.slice(0, 1).toUpperCase();

  return (
    <div className={compact ? "sim-claude sim-compact" : "sim-claude"} style={{ display: "grid", gridTemplateColumns: compact ? "120px minmax(0, 1fr)" : "220px minmax(0, 1fr)", minHeight: compact ? 200 : 520, fontSize: compact ? 11 : 14, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.5, colorScheme: "light" }}>
      {/* rail */}
      <aside className="sim-claude-rail" style={{ background: C.rail, borderRight: `1px solid ${C.edge}`, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 6px 12px", fontWeight: 600, fontSize: 15, fontFamily: C.serif }}>
          <Mark size={16} />
          Claude
        </div>
        {[
          { label: "New chat", d: "M12 5v14M5 12h14" },
          { label: "Projects", d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" },
        ].map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 8px", borderRadius: 8, color: C.ink, fontSize: 13.5 }}>
            <Icon d={it.d} size={16} />
            {it.label}
          </div>
        ))}
        <div style={{ marginTop: 14, padding: "0 8px 4px", fontSize: 11.5, color: C.faint, fontWeight: 600 }}>Recents</div>
        <div style={{ padding: "7px 8px", borderRadius: 8, background: C.railActive, color: C.ink, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Board summary draft</div>
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.edge}`, fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span aria-hidden style={{ flexShrink: 0, width: 24, height: 24, borderRadius: "50%", background: C.terra, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{initial}</span>
            <span style={{ display: "flex", flexDirection: "column", minWidth: 0, lineHeight: 1.3 }}>
              <span style={{ color: C.ink, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learnerName}</span>
              <span style={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{account}</span>
            </span>
          </span>
          <span style={{ alignSelf: "flex-start", padding: "2px 7px", borderRadius: 4, background: C.terraSoft, color: C.terra, fontWeight: 600, fontSize: 11, letterSpacing: "0.02em" }}>Practice tenant</span>
        </div>
      </aside>

      {/* stage */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", fontSize: 13, color: C.muted }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {empty ? "New chat" : "Chat"}
            <Icon d="M6 9l6 6 6-6" size={14} stroke={C.faint} />
          </span>
          <span>{account}</span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {empty && (
            <div style={{ margin: "auto 0", padding: "28px 0 8px", textAlign: "center" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 30 * scale, fontWeight: 400, letterSpacing: "-0.01em", fontFamily: C.serif, color: C.ink }}>
                <Mark size={26 * scale} />
                Good afternoon, {learnerName}
              </div>
              <div style={{ marginTop: 6, color: C.muted }}>How can I help you today?</div>
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
                <span aria-hidden style={{ flexShrink: 0, width: 22, height: 22, borderRadius: "50%", marginTop: 2, background: C.terra }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>Claude</div>
                  <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {m.text}
                    {m.pending && <span aria-label="writing" style={{ display: "inline-block", width: 8, height: 14, marginLeft: 2, verticalAlign: "text-bottom", background: C.terra, opacity: 0.7, borderRadius: 1 }} />}
                  </div>
                </div>
              </div>
            ),
          )}
        </div>

        <div style={{ padding: "8px 16px 14px" }}>
          {status && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{status}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, background: C.composer, border: `1px solid ${C.edge}`, borderRadius: 16, padding: "10px 10px 8px 14px", boxShadow: "0 1px 3px rgba(41,38,27,0.06)" }}>
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
              style={{ width: "100%", minWidth: 0, resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15, lineHeight: 1.5, padding: "2px 0" }}
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span title="Attach" style={{ display: "inline-flex", padding: 4 }}><Icon d="M12 5v14M5 12h14" size={16} /></span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8, fontSize: 12.5, color: C.muted, fontWeight: 500 }}>
                  Claude
                  <Icon d="M6 9l6 6 6-6" size={12} stroke={C.faint} />
                </span>
              </span>
              <button
                type="button"
                onClick={onSend}
                disabled={!canSend}
                aria-label="Send"
                style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: canSend ? C.terra : C.terraOff, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}
              >
                <Icon d="M12 19V5M6 11l6-6 6 6" stroke="#fff" />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: C.faint, textAlign: "center" }}>Claude practice tenant. Nothing you send here is stored.</div>
        </div>
      </div>
    </div>
  );
}
