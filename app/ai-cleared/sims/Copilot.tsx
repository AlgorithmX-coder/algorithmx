"use client";

import { useEffect, useRef } from "react";
import type { SimProps } from "./types";
import { AttachmentChip, Icon, ICONS, Lite, TypingDots, initialOf } from "./shared";
export type { SimMessage, SimProps } from "./types";

/* Microsoft 365 Copilot as it looks in the browser since the 2026
 * redesign, on a work account: the collapsible left pane ("Copilot"
 * wordmark, waffle, New, Search, Library, Plugins, Automations, pinned
 * agents, recent chats, the account row at the foot), the Work IQ and
 * Auto model controls top-left, the green data-protection shield top-
 * right, a centred greeting with the prompt box under it and the content
 * pills (Files, Emails, People, Meetings) beneath that, replies in a plain
 * thread with no avatar, and Microsoft's own line under the box: "AI-
 * generated content may be incorrect". A personal account loses Work IQ
 * and the shield, gains the Personal badge and (free tier) the Upgrade
 * button, which is the tell Module 1 teaches. No vendor logo or wordmark
 * artwork: the name is set in type. */

const C = {
  bg: "#ffffff",
  rail: "#f5f5f5",
  railOn: "#e6e6e6",
  edge: "#e3e3e3",
  ink: "#1b1b1b",
  muted: "#5f5f5f",
  faint: "#8c8c8c",
  bubble: "#f2f2f2",
  pill: "#f0f0f0",
  chipEdge: "#dadada",
  green: "#107c10",
  font: "'Segoe UI', 'Segoe UI Web', -apple-system, system-ui, Helvetica, Arial, sans-serif",
};

const WORK_PILLS = ["Files", "Emails", "People", "Meetings"];
const HOME_PILLS = ["Learn", "Explain", "Rewrite", "Create"];
const RECENT = ["Chase invoice draft", "Q3 board pack summary", "Onboarding checklist"];

function RailItem({ d, label, on, scale = 1, bold }: { d: string; label: string; on?: boolean; scale?: number; bold?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", borderRadius: 8, background: on ? C.railOn : "transparent", color: C.ink, fontSize: 13.5 * scale, fontWeight: bold ? 600 : 400 }}>
      <Icon d={d} size={17 * scale} stroke={C.ink} strokeWidth={on ? 2 : 1.6} />
      {label}
    </div>
  );
}

function Seg({ items, on, scale = 1 }: { items: string[]; on: string; scale?: number }) {
  return (
    <span style={{ display: "inline-flex", background: C.pill, borderRadius: 10, padding: 3, gap: 2 }}>
      {items.map((it) => (
        <span key={it} style={{ padding: `${4 * scale}px ${12 * scale}px`, borderRadius: 8, background: it === on ? "#ffffff" : "transparent", boxShadow: it === on ? "0 1px 3px rgba(0,0,0,0.12)" : "none", color: C.ink, fontSize: 13 * scale, fontWeight: it === on ? 600 : 400, whiteSpace: "nowrap" }}>{it}</span>
      ))}
    </span>
  );
}

export default function CopilotSim({ firmName, learnerName, messages, draft, onDraftChange, onSend, canSend, composerLocked, status, tier = "enterprise", compact, attachment, pane }: SimProps) {
  const work = tier === "enterprise";
  const logRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);
  const empty = messages.length === 0;
  const s = compact ? 0.78 : 1;
  const lines = Math.min(6, Math.max(1, draft.split("\n").length));
  const multi = work || lines > 1;

  const composer = (
    <div style={{ width: "100%", maxWidth: pane ? undefined : 760, margin: "0 auto" }}>
      {status && <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 6 }}>{status}</div>}
      {attachment && <AttachmentChip title={attachment.title} kind={attachment.kind} colour={C.muted} edge={C.edge} />}
      <div style={{ display: "flex", flexDirection: multi ? "column" : "row", alignItems: multi ? "stretch" : "center", gap: multi ? 4 : 8, border: `1px solid ${C.edge}`, borderRadius: multi ? 24 : 999, padding: multi ? "12px 12px 8px 16px" : "6px 8px 6px 16px", background: "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}>
        {!multi && <span aria-hidden style={{ display: "inline-flex", color: C.ink, flexShrink: 0 }}><Icon d={ICONS.plus} size={18 * s} stroke={C.ink} strokeWidth={1.6} /></span>}
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
          rows={lines}
          style={{ flex: 1, minWidth: 0, resize: "none", border: "none", outline: "none", background: "transparent", color: C.ink, fontFamily: "inherit", fontSize: 15 * s, lineHeight: 1.5, padding: multi ? "0 0 6px" : "4px 0" }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          {multi && (
            <>
              <span aria-hidden title="Add content" style={{ display: "inline-flex", padding: 4, color: C.ink }}><Icon d={ICONS.plus} size={18 * s} stroke={C.ink} strokeWidth={1.6} /></span>
              {work && <Seg items={["Chat", "Cowork"]} on="Chat" scale={s} />}
            </>
          )}
          <span aria-hidden title="Voice" style={{ marginLeft: "auto", display: "inline-flex", padding: 4, color: C.ink }}><Icon d={ICONS.mic} size={18 * s} stroke={C.ink} strokeWidth={1.6} /></span>
          {!canSend && <span aria-hidden style={{ width: 32 * s, height: 32 * s, borderRadius: "50%", background: C.pill, color: C.ink, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon d={ICONS.wave} size={16 * s} stroke={C.ink} strokeWidth={1.8} /></span>}
          <button type="button" onClick={onSend} disabled={!canSend} aria-label="Send" style={{ width: 32 * s, height: 32 * s, borderRadius: "50%", border: "none", background: canSend ? C.ink : C.pill, color: canSend ? "#fff" : C.faint, display: canSend ? "inline-flex" : "none", alignItems: "center", justifyContent: "center", cursor: canSend ? "pointer" : "default", flexShrink: 0 }}>
            <Icon d={ICONS.arrowUp} size={16 * s} stroke="#fff" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );

  const pills = (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginTop: 18 * s }}>
      {(work ? WORK_PILLS : HOME_PILLS).map((p) => (
        <span key={p} style={{ padding: `${7 * s}px ${13 * s}px`, borderRadius: 999, border: `1px solid ${C.chipEdge}`, background: work ? C.pill : "#ffffff", color: C.ink, fontSize: 13 * s, whiteSpace: "nowrap" }}>{p}</span>
      ))}
      <span aria-hidden style={{ display: "inline-flex", alignItems: "center", padding: `0 ${6 * s}px`, color: C.muted }}><Icon d={ICONS.more} size={16 * s} strokeWidth={2.4} /></span>
    </div>
  );

  const disclaimer = <div style={{ marginTop: 8, fontSize: 12 * s, color: C.muted, textAlign: "center" }}>{work ? "AI-generated content may be incorrect" : "Copilot is an AI and may make mistakes."}</div>;

  return (
    <div className={compact ? "sim-copilot sim-compact" : pane ? "sim-copilot sim-pane" : "sim-copilot"} style={{ display: "grid", gridTemplateColumns: compact ? "150px minmax(0, 1fr)" : pane ? "minmax(0, 1fr)" : "232px minmax(0, 1fr)", gridTemplateRows: "minmax(0, 1fr)", minHeight: compact ? 220 : pane ? 0 : 560, height: pane ? "100%" : undefined, fontSize: compact ? 11 : pane ? 13.5 : 14, pointerEvents: compact ? "none" : undefined, userSelect: compact ? "none" : undefined, borderRadius: pane ? 0 : 12, overflow: "hidden", ...(pane ? { borderLeft: `1px solid ${C.edge}` } : { border: `1px solid ${C.edge}` }), background: C.bg, color: C.ink, fontFamily: C.font, lineHeight: 1.5, colorScheme: "light" }}>
      {!pane && (
        <aside className="sim-copilot-rail" style={{ background: C.rail, borderRight: `1px solid ${C.edge}`, padding: "10px 10px 12px", display: "flex", flexDirection: "column", gap: 2, minWidth: 0, minHeight: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 6px 10px" }}>
            <span style={{ fontWeight: 600, fontSize: 18 * s, letterSpacing: "-0.01em", color: C.ink }}>Copilot</span>
            <span style={{ display: "inline-flex", gap: 10, color: C.ink }}>
              <Icon d={ICONS.waffle} size={16 * s} strokeWidth={2.6} />
              <Icon d={ICONS.sidebar} size={16 * s} strokeWidth={1.6} />
            </span>
          </div>
          {work && !compact && <div style={{ marginBottom: 8 }}><Seg items={["Home", "Code", "Autopilot"]} on="Home" scale={s} /></div>}
          <RailItem d={ICONS.plusCircle} label={work ? "New" : "New chat"} on bold scale={s} />
          <RailItem d={ICONS.search} label="Search" scale={s} />
          <RailItem d={ICONS.library} label="Library" scale={s} />
          {work ? <RailItem d={ICONS.sliders} label="Plugins" scale={s} /> : <RailItem d={ICONS.book} label="Notebooks" scale={s} />}
          {work && <RailItem d={ICONS.bolt} label="Automations" scale={s} />}
          <RailItem d={ICONS.more} label="More" scale={s} />
          {work && (
            <>
              <div style={{ fontSize: 11.5 * s, color: C.muted, padding: "12px 10px 4px" }}>Pinned</div>
              <RailItem d={ICONS.globe} label="Researcher" scale={s} />
              <RailItem d={ICONS.sparkle} label="Analyst" scale={s} />
            </>
          )}
          <div style={{ fontSize: 11.5 * s, color: C.muted, padding: "12px 10px 4px" }}>Chats</div>
          {RECENT.map((t) => (
            <div key={t} style={{ padding: "6px 10px", borderRadius: 8, color: C.ink, fontSize: 13 * s, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t}</div>
          ))}
          <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 4px", fontSize: 13 * s, color: C.ink, minWidth: 0 }}>
              <span style={{ width: 24 * s, height: 24 * s, borderRadius: "50%", background: "#dcdcdc", color: C.ink, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10.5 * s, fontWeight: 600, flexShrink: 0 }}>{initialOf(learnerName)}</span>
              {!work && <span style={{ padding: "1px 6px", borderRadius: 4, background: C.ink, color: "#fff", fontSize: 10.5 * s, fontWeight: 600, flexShrink: 0 }}>Personal</span>}
              <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{learnerName}</span>
              <span style={{ marginLeft: "auto", display: "inline-flex", color: C.muted, flexShrink: 0 }}><Icon d={ICONS.settings} size={15 * s} /></span>
            </div>
            {work ? (
              <div style={{ padding: "0 4px", fontSize: 11.5 * s, color: C.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{firmName} · work account</div>
            ) : tier === "consumer-free" ? (
              <div style={{ textAlign: "center", padding: `${5 * s}px 0`, borderRadius: 6, border: `1px solid ${C.chipEdge}`, background: "#ffffff", fontSize: 12.5 * s, color: C.ink }}>Upgrade</div>
            ) : null}
            <span style={{ alignSelf: "flex-start", marginLeft: 4, padding: "2px 7px", borderRadius: 4, background: C.railOn, color: C.muted, fontWeight: 600, fontSize: 10.5 * s, letterSpacing: "0.02em" }}>Practice tenant</span>
          </div>
        </aside>
      )}

      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0, height: pane ? "100%" : undefined }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: pane ? "8px 12px" : "10px 16px", borderBottom: pane ? `1px solid ${C.edge}` : "none" }}>
          {pane ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, color: C.ink, fontWeight: 600 }}>Copilot</span>
          ) : (
            <>
              {work && <span style={{ padding: `${4 * s}px ${10 * s}px`, borderRadius: 6, background: C.pill, color: C.ink, fontSize: 13 * s, fontWeight: 500, whiteSpace: "nowrap" }}>Work IQ</span>}
              <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 13 * s, color: C.ink }}>Auto <Icon d={ICONS.chevron} size={13 * s} strokeWidth={2} /></span>
            </>
          )}
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 14, color: C.ink }}>
            {pane && <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: C.railOn, color: C.muted, fontWeight: 600 }}>Practice tenant</span>}
            {work && <span title="Enterprise data protection" style={{ display: "inline-flex", color: C.green }}><Icon d={ICONS.shieldCheck} size={18 * s} stroke={C.green} strokeWidth={1.7} /></span>}
            {!pane && <Icon d={ICONS.chat} size={17 * s} strokeWidth={1.6} dash="2.5 2.5" />}
            <Icon d={ICONS.more} size={17 * s} strokeWidth={2.4} />
            {pane && <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>×</span>}
          </span>
        </div>

        {empty ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: compact ? "10px 16px 18px" : pane ? "14px 14px" : "24px 28px 32px" }}>
            <div style={{ width: "100%", maxWidth: pane ? undefined : 760, margin: "0 auto" }}>
              <div style={{ fontSize: pane ? 20 : 26 * s, fontWeight: 400, letterSpacing: "-0.01em", color: C.ink, marginBottom: pane ? 14 : 22 * s, paddingLeft: pane ? 0 : 6 }}>Hi {learnerName}, how can I help?</div>
            </div>
            {composer}
            {!pane && pills}
          </div>
        ) : (
          <>
            <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: pane ? "14px 14px" : "16px 28px", display: "flex", flexDirection: "column", gap: pane ? 12 : 18 }}>
              <div style={{ width: "100%", maxWidth: pane ? undefined : 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: pane ? 12 : 18 }}>
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                      <div style={{ maxWidth: "80%", background: C.bubble, borderRadius: 18, padding: "10px 16px", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: 15 * s, lineHeight: 1.55 }}>{m.text}</div>
                      {m.panel && <div style={{ alignSelf: "stretch" }}>{m.panel}</div>}
                    </div>
                  ) : (
                    <div key={m.id} style={{ minWidth: 0, padding: "2px 4px", fontSize: 15 * s, lineHeight: 1.65 }}>
                      {m.pending && !m.text ? <TypingDots colour={C.muted} /> : <Lite text={m.text} />}
                      {m.pending && m.text && <span aria-label="writing" style={{ display: "inline-block", width: 8, height: 15, marginLeft: 2, verticalAlign: "text-bottom", background: C.ink, opacity: 0.5, borderRadius: 1 }} />}
                      {!m.pending && m.text && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, color: C.ink }}>
                          {(["copy", "thumbUp", "thumbDown", "refresh"] as const).map((k) => (
                            <span key={k} style={{ display: "inline-flex", padding: 5, borderRadius: 6 }}><Icon d={ICONS[k]} size={16} strokeWidth={1.5} /></span>
                          ))}
                          <span style={{ display: "inline-flex", padding: 5, borderRadius: 6 }}><Icon d={ICONS.more} size={16} strokeWidth={2.4} /></span>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </div>
            <div style={{ padding: pane ? "6px 12px 10px" : "6px 28px 12px" }}>
              {composer}
              {disclaimer}
            </div>
          </>
        )}
        {empty && !compact && <div style={{ padding: pane ? "0 12px 10px" : "0 28px 12px" }}>{disclaimer}</div>}
      </div>
    </div>
  );
}
