"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
export type { SimMessage, SimProps } from "./types";

/* A recreation of Gemini's chat surface in its native light look: the pale
 * blue rail on the left, the product name top-left with its tier pill, a
 * gradient greeting, a rounded pale composer. Nominative use in training:
 * the tool is named, no vendor logo or wordmark artwork is used, and every
 * simulator carries the "Practice tenant" label. The chrome is
 * deliberately the vendor's, not the console's, so habits transfer. */

const C = {
  bg: "#ffffff",
  rail: "#f0f4f9",
  edge: "#e3e8ee",
  ink: "#1f1f1f",
  muted: "#444746",
  faint: "#747775",
  bubble: "#f0f4f9",
  composer: "#f0f4f9",
  railActive: "#d3e3fd",
  blue: "#4285f4",
  purple: "#9b72cb",
  red: "#d96570",
  gradient: "linear-gradient(74deg, #4285f4 0%, #9b72cb 40%, #d96570 100%)",
  pillBg: "#e8f0fe",
  pillInk: "#1967d2",
  sendOff: "#c4c7c5",
  font: "'Google Sans', Roboto, -apple-system, 'Segoe UI', system-ui, Helvetica, Arial, sans-serif",
};

function Icon({ d, size = 18, stroke = C.muted }: { d: string; size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

/* Four-point sparkle in the greeting gradient: the reply mark. */
function Sparkle({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="sim-gemini-spark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.blue} />
          <stop offset="45%" stopColor={C.purple} />
          <stop offset="100%" stopColor={C.red} />
        </linearGradient>
      </defs>
      <path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z" fill="url(#sim-gemini-spark)" />
    </svg>
  );
}

function domainFor(firmName: string): string {
  const stem = firmName.toLowerCase().replace(/[^a-z]/g, "");
  return `${stem || "workspace"}.co.uk`;
}

export default function GeminiSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact }: SimProps) {
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const empty = messages.length === 0;
  const scale = compact ? 0.78 : 1;
  const initial = learnerName.slice(0, 1).toUpperCase();

  return (
    <div className={compact ? "sim-gemini sim-compact" : "sim-gemini"} style={{ display: "grid", gridTemplateColumns: compact ? "120px minmax(0, 1fr)" : "220px minmax(0, 1fr)", minHeight: compact ? 200 : 520, fontSize: compact ? 11 : 14, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.5, colorScheme: "light" }}>
      {/* rail */}
      <aside className="sim-gemini-rail" style={{ background: C.rail, padding: "14px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 6px 12px", fontWeight: 500, fontSize: 18, color: C.muted }}>
          Gemini
          {tier === "consumer-paid" && (
            <span style={{ padding: "1px 7px", borderRadius: 6, background: C.pillBg, color: C.pillInk, fontSize: 11, fontWeight: 600, letterSpacing: "0.01em" }}>Advanced</span>
          )}
        </div>
        {[
          { label: "New chat", d: "M4 20h4l10-10-4-4L4 16v4zM13 7l4 4" },
          { label: "Explore Gems", d: "M12 3l3 6 6 1-4.5 4.5L18 21l-6-3-6 3 1.5-6.5L3 10l6-1 3-6z" },
        ].map((it) => (
          <div key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 20, color: C.ink, fontSize: 13.5 }}>
            <Icon d={it.d} size={16} />
            {it.label}
          </div>
        ))}
        <div style={{ marginTop: 14, padding: "0 10px 4px", fontSize: 12, color: C.muted, fontWeight: 600 }}>Recent</div>
        <div style={{ padding: "7px 10px", borderRadius: 20, background: C.railActive, color: C.ink, fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Reference request</div>
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: `1px solid ${C.edge}`, fontSize: 12, color: C.muted, display: "flex", flexDirection: "column", gap: 6 }}>
          {tier === "enterprise" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minWidth: 0 }}>
              <Icon d="M3 21V7l9-4 9 4v14M9 21v-6h6v6" size={14} />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Workspace · {domainFor(firmName)}</span>
            </span>
          )}
          <span style={{ alignSelf: "flex-start", padding: "2px 7px", borderRadius: 4, background: C.pillBg, color: C.pillInk, fontWeight: 600, fontSize: 11, letterSpacing: "0.02em" }}>Practice tenant</span>
        </div>
      </aside>

      {/* stage */}
      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "10px 16px", fontSize: 13, color: C.muted }}>
          <span aria-hidden style={{ width: 28, height: 28, borderRadius: "50%", background: C.blue, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600 }}>{initial}</span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {empty && (
            <div style={{ margin: "auto 0", padding: "28px 0 8px" }}>
              <div style={{ fontSize: 32 * scale, fontWeight: 500, letterSpacing: "-0.01em", background: C.gradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", display: "inline-block" }}>
                Hello, {learnerName}
              </div>
              <div style={{ fontSize: 24 * scale, fontWeight: 500, color: C.sendOff, letterSpacing: "-0.01em" }}>How can I help you today?</div>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ maxWidth: "78%", background: C.bubble, borderRadius: "20px 4px 20px 20px", padding: "10px 16px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
              </div>
            ) : (
              <div key={m.id} style={{ display: "flex", gap: 12, maxWidth: "92%" }}>
                <span aria-hidden style={{ flexShrink: 0, display: "inline-flex", marginTop: 1 }}><Sparkle size={22} /></span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>Gemini</div>
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
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, background: C.composer, borderRadius: 28, padding: "8px 10px 8px 12px" }}>
            <span title="Add" style={{ display: "inline-flex", padding: 7 }}><Icon d="M12 5v14M5 12h14" /></span>
            <textarea
              aria-label="Message Gemini"
              value={draft}
              readOnly={composerLocked}
              onChange={(e) => onDraftChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && canSend) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Ask Gemini"
              rows={Math.min(6, Math.max(1, draft.split("\n").length))}
              style={{ flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15, lineHeight: 1.5, padding: "6px 0" }}
            />
            <span title="Voice" style={{ display: "inline-flex", padding: 7 }}><Icon d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v4" /></span>
            <button
              type="button"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send"
              style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}
            >
              <Icon d="M4 12h15M13 6l6 6-6 6" size={20} stroke={canSend ? C.ink : C.sendOff} />
            </button>
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: C.faint, textAlign: "center" }}>Gemini practice tenant. Nothing you send here is stored.</div>
        </div>
      </div>
    </div>
  );
}
