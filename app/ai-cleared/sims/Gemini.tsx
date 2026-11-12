"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
import { AttachmentChip, Icon, ICONS, Lite, TypingDots, initialOf } from "./shared";

/* Gemini in the browser after the 2026 "Neural Expressive" redesign: the
 * white nav with the collapse icon, New chat, Search chats, Library, Gems,
 * Notebooks, the Recent list, and Settings & help plus the account row at
 * the foot; the model picker top-left of the pane ("Gemini 3.1 Pro"),
 * temporary chat and the avatar top-right; the four-point spark over
 * "Hi Name, what's on your mind?" with the soft blue glow behind a white
 * pill prompt box ("+", "Ask Gemini", mic, the blue Live button); replies
 * in a plain thread; and Google's own line under the box: "Gemini is AI
 * and can make mistakes, including about people." Enterprise shows the
 * Workspace domain at the foot of the nav; a paid personal plan shows Pro
 * under the name; free shows an Upgrade button top-right. No vendor logo:
 * the spark is drawn here. */

const C = {
  bg: "#ffffff",
  rail: "#ffffff",
  railOn: "#e9eef6",
  edge: "#e3e8ee",
  ink: "#1f1f1f",
  muted: "#444746",
  faint: "#747775",
  bubble: "#f0f4f9",
  blue: "#0b57d0",
  blueSoft: "#d3e3fd",
  grad: "linear-gradient(135deg, #4285f4 0%, #9b72cb 45%, #d96570 100%)",
  font: "'Google Sans', 'Google Sans Text', Roboto, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif",
};

const SPARK = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='M12 2c.6 5.5 4.5 9.4 10 10-5.5.6-9.4 4.5-10 10-.6-5.5-4.5-9.4-10-10 5.5-.6 9.4-4.5 10-10z'/></svg>\")";
const RECENT = ["Reference request", "Tidy up these minutes", "Holiday policy questions"];

function Spark({ size = 20 }: { size?: number }) {
  return <span aria-hidden style={{ display: "inline-block", width: size, height: size, background: C.grad, WebkitMaskImage: SPARK, maskImage: SPARK, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }} />;
}

function RailItem({ d, label, scale = 1, on }: { d: string; label: string; scale?: number; on?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 999, background: on ? C.railOn : "transparent", color: C.ink, fontSize: 13.5 * scale }}>
      <Icon d={d} size={17 * scale} stroke={C.ink} strokeWidth={1.5} />
      {label}
    </div>
  );
}

export default function GeminiSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact, attachment }: SimProps) {
  const work = tier === "enterprise";
  const domain = (firmName.toLowerCase().replace(/[^a-z]/g, "") || "workspace") + ".co.uk";
  const model = tier === "consumer-free" ? "Gemini 3.5 Flash" : "Gemini 3.1 Pro";
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
    <div style={{ width: "100%", maxWidth: 760, margin: "0 auto", position: "relative" }}>
      {status && <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 6 }}>{status}</div>}
      {attachment && <AttachmentChip title={attachment.title} kind={attachment.kind} colour={C.muted} edge={C.edge} />}
      <div style={{ display: "flex", flexDirection: multi ? "column" : "row", alignItems: multi ? "stretch" : "center", gap: multi ? 4 : 12, background: "#ffffff", border: `1px solid ${C.edge}`, borderRadius: multi ? 28 : 999, padding: multi ? "14px 12px 10px 20px" : "9px 10px 9px 20px", boxShadow: "0 4px 18px rgba(11,87,208,0.10)" }}>
        {!multi && <span aria-hidden style={{ display: "inline-flex", color: C.ink, flexShrink: 0 }}><Icon d={ICONS.plus} size={22 * s} stroke={C.ink} strokeWidth={1.5} /></span>}
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
          rows={lines}
          style={{ flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15.5 * s, lineHeight: 1.5, padding: multi ? "0 0 8px" : "4px 0" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {multi && <span aria-hidden style={{ display: "inline-flex", padding: 4, color: C.ink }}><Icon d={ICONS.plus} size={22 * s} stroke={C.ink} strokeWidth={1.5} /></span>}
          <span aria-hidden title="Dictate" style={{ marginLeft: "auto", display: "inline-flex", padding: 4, color: C.ink }}><Icon d={ICONS.mic} size={20 * s} stroke={C.ink} strokeWidth={1.5} /></span>
          {!canSend && <span aria-hidden title="Gemini Live" style={{ width: 36 * s, height: 36 * s, borderRadius: "50%", background: C.blue, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon d={ICONS.wave} size={16 * s} stroke="#fff" strokeWidth={2} /></span>}
          <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send" style={{ width: 36 * s, height: 36 * s, borderRadius: "50%", border: "none", background: C.blue, display: canSend ? "inline-flex" : "none", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <Icon d={ICONS.arrowUp} size={18 * s} stroke="#fff" strokeWidth={2.2} />
          </button>
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 11.5 * s, color: C.faint, textAlign: "center" }}>Gemini is AI and can make mistakes, including about people.</div>
    </div>
  );

  return (
    <div className={compact ? "sim-gemini sim-compact" : "sim-gemini"} style={{ display: "grid", gridTemplateColumns: compact ? "150px minmax(0, 1fr)" : "240px minmax(0, 1fr)", gridTemplateRows: "minmax(0, 1fr)", minHeight: compact ? 220 : 560, fontSize: compact ? 11 : 14.5, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: 12, overflow: "hidden", border: `1px solid ${C.edge}`, background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.55, colorScheme: "light" }}>
      <aside className="sim-gemini-rail" style={{ background: C.rail, borderRight: `1px solid ${C.edge}`, padding: "12px 10px 12px", display: "flex", flexDirection: "column", gap: 2, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 10px 14px", color: C.muted }}>
          <span style={{ fontSize: 15 * s, fontWeight: 500, color: C.ink }}>Gemini</span>
          <Icon d={ICONS.sidebar} size={17 * s} stroke={C.muted} strokeWidth={1.5} />
        </div>
        <RailItem d={ICONS.pencilSquare} label="New chat" scale={s} on />
        <RailItem d={ICONS.search} label="Search chats" scale={s} />
        <RailItem d={ICONS.image} label="Library" scale={s} />
        <RailItem d={ICONS.sparkle} label="Gems" scale={s} />
        <RailItem d={ICONS.book} label="Notebooks" scale={s} />
        <div style={{ fontSize: 12.5 * s, color: C.muted, padding: "14px 12px 4px", fontWeight: 500 }}>Recent</div>
        {RECENT.map((t) => (
          <div key={t} style={{ padding: "7px 12px", borderRadius: 999, color: C.ink, fontSize: 13 * s, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
        ))}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6, paddingTop: 10 }}>
          <RailItem d={ICONS.settings} label="Settings & help" scale={s} />
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px", minWidth: 0 }}>
            <span style={{ width: 26 * s, height: 26 * s, borderRadius: "50%", background: C.blue, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 * s, fontWeight: 600, flexShrink: 0 }}>{initialOf(learnerName)}</span>
            <span style={{ minWidth: 0, lineHeight: 1.3 }}>
              <span style={{ display: "block", fontSize: 13.5 * s, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learnerName}</span>
              {work ? (
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5 * s, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><Icon d={ICONS.briefcase} size={12 * s} strokeWidth={1.6} /> Workspace · {domain}</span>
              ) : tier === "consumer-paid" ? (
                <span style={{ display: "block", fontSize: 11.5 * s, color: C.muted }}>Pro</span>
              ) : null}
            </span>
          </div>
          <span style={{ alignSelf: "flex-start", marginLeft: 12, padding: "2px 7px", borderRadius: 4, background: C.blueSoft, color: C.blue, fontWeight: 600, fontSize: 10.5 * s, letterSpacing: "0.02em" }}>Practice tenant</span>
        </div>
      </aside>

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, position: "relative" }}>
        {empty && !compact && <div aria-hidden style={{ position: "absolute", left: "50%", top: "50%", width: 640, height: 420, transform: "translate(-50%, -46%)", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(66,133,244,0.28), rgba(155,114,203,0.10) 60%, transparent 100%)", filter: "blur(28px)", pointerEvents: "none" }} />}
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 15 * s, color: C.muted, padding: "5px 10px", borderRadius: 8 }}>
            {model}
            <Icon d={ICONS.chevron} size={14 * s} stroke={C.faint} strokeWidth={2} />
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14, color: C.muted }}>
            {tier === "consumer-free" && <span style={{ fontSize: 12.5 * s, fontWeight: 500, color: C.blue, background: C.blueSoft, borderRadius: 999, padding: "6px 14px" }}>Upgrade</span>}
            <Icon d={ICONS.chat} size={18 * s} strokeWidth={1.5} dash="2.5 2.5" />
            <span style={{ width: 30 * s, height: 30 * s, borderRadius: "50%", background: C.blue, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 * s, fontWeight: 600 }}>{initialOf(learnerName)}</span>
          </span>
        </div>

        {empty ? (
          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: compact ? "10px 16px 18px" : "24px 28px 40px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 * s, marginBottom: 24 * s }}>
              <Spark size={30 * s} />
              <div style={{ fontSize: 30 * s, fontWeight: 400, color: C.ink, letterSpacing: "-0.01em", textAlign: "center" }}>Hi {learnerName}, what&rsquo;s on your mind?</div>
            </div>
            {composer}
          </div>
        ) : (
          <>
            <div ref={logRef} style={{ position: "relative", flex: 1, overflowY: "auto", padding: "16px 28px" }}>
              <div style={{ width: "100%", maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                      <div style={{ maxWidth: "74%", background: C.bubble, borderRadius: 22, borderTopRightRadius: 6, padding: "10px 18px", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 15.5 * s }}>{m.text}</div>
                      {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
                    </div>
                  ) : (
                    <div key={m.id} style={{ minWidth: 0, fontSize: 15.5 * s, lineHeight: 1.7 }}>
                      {m.pending && !m.text ? <TypingDots colour="#9b72cb" /> : <Lite text={m.text} />}
                      {m.pending && m.text && <span aria-label="writing" style={{ display: "inline-block", width: 8, height: 15, marginLeft: 2, verticalAlign: "text-bottom", background: C.blue, opacity: 0.6, borderRadius: 1 }} />}
                      {!m.pending && m.text && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: C.muted }}>
                          {(["thumbUp", "thumbDown", "share", "copy", "more"] as const).map((k) => (
                            <span key={k} style={{ display: "inline-flex", padding: 5, borderRadius: 999 }}><Icon d={ICONS[k]} size={16} strokeWidth={k === "more" ? 2.4 : 1.6} /></span>
                          ))}
                          <span style={{ marginLeft: "auto", display: "inline-flex", padding: 5, borderRadius: 999 }}><Icon d={ICONS.speaker} size={16} strokeWidth={1.6} /></span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
            <div style={{ position: "relative", padding: "6px 28px 12px" }}>{composer}</div>
          </>
        )}
      </div>
    </div>
  );
}
