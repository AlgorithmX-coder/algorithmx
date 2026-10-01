"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
import { ActionRow, AttachmentChip, Icon, ICONS, Lite, TypingDots, initialOf } from "./shared";

/* Gemini in the browser: the left nav (menu, New chat, Explore Gems,
 * Recent, Settings and help), "Gemini" with the model picker top-left, the
 * gradient "Hello, Name" greeting, the rounded composer with "+", "Ask
 * Gemini", the Deep Research and Canvas chips and the mic, and Google's
 * own line under it: "Gemini can make mistakes, so double-check it".
 * Enterprise shows the Workspace domain at the bottom of the nav; a paid
 * personal plan shows a Pro pill by the name. No vendor logo: a four-point
 * spark in the Gemini gradient stands in. */

const C = {
  bg: "#ffffff",
  rail: "#f0f4f9",
  edge: "#e3e8ee",
  ink: "#1f1f1f",
  muted: "#444746",
  faint: "#747775",
  composer: "#f0f4f9",
  bubble: "#f0f4f9",
  blue: "#0b57d0",
  grad: "linear-gradient(74deg, #4285f4 0%, #9b72cb 40%, #d96570 100%)",
  font: "'Google Sans', 'Google Sans Text', Roboto, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
};

const SPARK = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 2c.6 5.5 4.5 9.4 10 10-5.5.6-9.4 4.5-10 10-.6-5.5-4.5-9.4-10-10 5.5-.6 9.4-4.5 10-10z'/></svg>\")";

function Spark({ size = 20 }: { size?: number }) {
  return <span aria-hidden style={{ display: "inline-block", width: size, height: size, background: C.grad, WebkitMaskImage: SPARK, maskImage: SPARK, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }} />;
}

export default function GeminiSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact, attachment }: SimProps) {
  const domain = (firmName.toLowerCase().replace(/[^a-z]/g, "") || "workspace") + ".co.uk";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  const empty = messages.length === 0;
  const s = compact ? 0.78 : 1;

  return (
    <div className={compact ? "sim-gemini sim-compact" : "sim-gemini"} style={{ display: "grid", gridTemplateColumns: compact ? "150px minmax(0, 1fr)" : "240px minmax(0, 1fr)", minHeight: compact ? 220 : 560, fontSize: compact ? 11 : 14.5, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.55, colorScheme: "light" }}>
      <aside className="sim-gemini-rail" style={{ background: C.rail, padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 8px 14px", color: C.muted }}>
          <Icon d={ICONS.menu} size={18} stroke={C.muted} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 999, background: "#dde3ea", color: C.ink, fontSize: 13.5 * s, fontWeight: 500, alignSelf: "flex-start" }}>
          <Icon d={ICONS.pencilSquare} size={16} stroke={C.ink} />
          New chat
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", color: C.ink, fontSize: 13.5 * s }}>
          <Icon d={ICONS.gem} size={16} stroke={C.ink} />
          Explore Gems
        </div>
        <div style={{ fontSize: 12.5 * s, color: C.muted, padding: "12px 12px 4px", fontWeight: 500 }}>Recent</div>
        {["Reference request", "Tidy up these minutes", "Holiday policy questions"].map((t, i) => (
          <div key={t} style={{ padding: "7px 12px", borderRadius: 999, background: i === 0 ? "#d3e3fd" : "transparent", color: C.ink, fontSize: 13 * s, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
        ))}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8, paddingTop: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px", color: C.ink, fontSize: 13 * s }}>
            <Icon d={ICONS.settings} size={16} stroke={C.ink} />
            Settings &amp; help
          </div>
          {tier === "enterprise" && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px", fontSize: 12 * s, color: C.muted }}>
              <Icon d={ICONS.briefcase} size={14} stroke={C.muted} />
              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Workspace · {domain}</span>
            </div>
          )}
          <span style={{ alignSelf: "flex-start", marginLeft: 12, padding: "2px 7px", borderRadius: 4, background: "#d3e3fd", color: C.blue, fontWeight: 600, fontSize: 11 * s }}>Practice tenant</span>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 * s, fontWeight: 500, color: C.muted }}>Gemini</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 * s, color: C.muted, border: `1px solid ${C.edge}`, borderRadius: 8, padding: "3px 8px" }}>
              {tier === "consumer-free" ? "2.5 Flash" : "2.5 Pro"}
              <Icon d={ICONS.chevron} size={14} stroke={C.faint} />
            </span>
            {tier === "consumer-paid" && <span style={{ fontSize: 12 * s, fontWeight: 600, color: "#fff", background: C.blue, borderRadius: 999, padding: "3px 9px" }}>Pro</span>}
          </span>
          <span style={{ width: 30 * s, height: 30 * s, borderRadius: "50%", background: C.blue, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 * s, fontWeight: 600 }}>{initialOf(learnerName)}</span>
        </div>

        <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: compact ? "10px 16px" : "16px 10%", display: "flex", flexDirection: "column", gap: 18 }}>
          {empty && (
            <div style={{ margin: "auto 0", padding: compact ? "10px 0" : "30px 0 10px" }}>
              <div style={{ fontSize: 32 * s, fontWeight: 500, letterSpacing: "-0.01em", background: C.grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", lineHeight: 1.2 }}>Hello, {learnerName}</div>
              <div style={{ fontSize: 26 * s, color: "#c4c7c5", fontWeight: 500, marginTop: 2 }}>How can I help you today?</div>
            </div>
          )}
          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                <div style={{ maxWidth: "72%", background: C.bubble, borderRadius: 20, borderTopRightRadius: 6, padding: "10px 18px", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{m.text}</div>
                {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
              </div>
            ) : (
              <div key={m.id} style={{ display: "flex", gap: 14, maxWidth: "94%" }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}><Spark size={22} /></span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  {m.pending && !m.text ? <TypingDots colour="#9b72cb" /> : <Lite text={m.text} />}
                  {m.pending && m.text && <span aria-label="writing" style={{ display: "inline-block", width: 8, height: 15, marginLeft: 2, verticalAlign: "text-bottom", background: C.blue, opacity: 0.6, borderRadius: 1 }} />}
                  {!m.pending && m.text && <ActionRow colour={C.faint} items={["thumbUp", "thumbDown", "share", "copy", "more"]} />}
                </div>
              </div>
            ),
          )}
        </div>

        <div style={{ padding: compact ? "6px 12px 10px" : "6px 10% 12px" }}>
          {status && <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{status}</div>}
          {attachment && <AttachmentChip title={attachment.title} kind={attachment.kind} colour={C.muted} edge={C.edge} />}
          <div style={{ display: "flex", flexDirection: "column", background: C.composer, borderRadius: 28, padding: "12px 12px 8px 18px" }}>
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
              style={{ resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15 * s, lineHeight: 1.5, padding: "2px 0 8px" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ display: "inline-flex", padding: 5, color: C.ink }}><Icon d={ICONS.plus} size={19} /></span>
              {!compact && (
                <>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, border: `1px solid ${C.edge}`, background: "#fff", fontSize: 12.5, color: C.muted }}><Icon d={ICONS.search} size={14} /> Deep Research</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", borderRadius: 999, border: `1px solid ${C.edge}`, background: "#fff", fontSize: 12.5, color: C.muted }}><Icon d={ICONS.page} size={14} /> Canvas</span>
                </>
              )}
              <span style={{ marginLeft: "auto", display: "inline-flex", padding: 5, color: C.ink }}><Icon d={ICONS.mic} size={19} /></span>
              <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send" style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: canSend ? C.ink : "transparent", color: canSend ? "#fff" : "#9aa0a6", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}>
                <Icon d={ICONS.arrowRight} size={18} stroke={canSend ? "#fff" : "#9aa0a6"} strokeWidth={2} />
              </button>
            </div>
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5 * s, color: C.faint, textAlign: "center" }}>Gemini can make mistakes, so double-check it · Practice tenant, nothing is stored.</div>
        </div>
      </div>
    </div>
  );
}
