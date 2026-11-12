"use client";

import { useEffect, useRef, useState } from "react";
import { W } from "../../tokens";
import { SPEED } from "../admin";
import type { PhoneCall } from "../types";
/* ── Module 11: Staying safe at work ── */
import { newId } from "../store";
import { reach } from "../safety";
import type { PhoneEntry } from "../types";
/* ── end Module 11 ── */
import type { OfficeAppProps } from "./registry";

/* The desk phone, for the office jobs (Module 10, criterion ADM-4): the
 * phone system's app on the computer, as many offices have now. A call
 * that rings when the job opens pops up over whatever is on screen; the
 * learner answers it and the call plays out, word by word, the way a
 * recorded call's transcript does. Every answered call stays in Recent
 * calls, where the recording can be played again or read in full. There
 * is no sound: the words are the call. */

export const PHONE_COLOUR = "#00698f";

/* An unknown caller (just a number) gets a plain handset, not "01". */
const initials = (name: string) =>
  /^[\d\s+]+$/.test(name)
    ? "☎"
    : name
    .replace(/^(Mr|Mrs|Ms|Miss|Dr)\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: "50%", background: PHONE_COLOUR, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>
      {initials(name)}
    </span>
  );
}

/* A recorded call: play, pause, start again, and the words as they are
 * said. `auto` starts it playing (a call just answered). "Show all the
 * words" puts the whole call on screen at once, for a fast reader or a
 * second look. */
export function CallPlayer({ call, auto = false, you = "You", onEnd }: { call: PhoneCall; auto?: boolean; you?: string; onEnd?: () => void }) {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(auto);
  const [x2, setX2] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const ended = useRef(false);
  const lines = call.lines ?? [];
  const end = call.seconds;

  /* the call stops by itself when it reaches the end */
  const done = t >= end;
  const running = playing && !done;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((v) => Math.min(end, v + (x2 ? 0.2 : 0.1))), 100);
    return () => clearInterval(id);
  }, [running, x2, end]);
  useEffect(() => {
    if (done && !ended.current) {
      ended.current = true;
      onEnd?.();
    }
  }, [done, onEnd]);
  /* keep the newest words in view, inside the transcript box only */
  useEffect(() => {
    const el = box.current;
    if (el && running) el.scrollTop = el.scrollHeight;
  }, [t, running]);

  if (!lines.length) return <p style={{ margin: 0, padding: 18, fontSize: 15, color: W.muted }}>This call wasn&apos;t recorded.</p>;
  const shown = lines.filter((l) => l.at <= t);
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, fontFamily: W.font }}>
      {/* the player */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            if (done) {
              setT(0);
              setPlaying(true);
            } else setPlaying((p) => !p);
          }}
          className="of-btn"
          aria-label={running ? "Pause the recording" : "Play the recording"}
          style={{ minHeight: 42, padding: "0 18px", border: "none", borderRadius: 21, background: PHONE_COLOUR, color: "#fff", fontFamily: W.font, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <span aria-hidden>{running ? "❚❚" : "▶"}</span> {running ? "Pause" : t > 0 && !done ? "Carry on" : done ? "Play again" : "Play the recording"}
        </button>
        <div aria-hidden style={{ flex: "1 1 140px", height: 6, borderRadius: 3, background: W.sunk, position: "relative", overflow: "hidden" }}>
          <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(t / end) * 100}%`, background: PHONE_COLOUR, borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 13.5, color: W.muted, fontVariantNumeric: "tabular-nums" }} aria-label="Time into the call">
          {clock(t)} / {clock(end)}
        </span>
        <button type="button" onClick={() => setX2((v) => !v)} className="of-btn" aria-pressed={x2} title="Play twice as fast" style={{ minHeight: 34, padding: "0 10px", border: `1px solid ${x2 ? PHONE_COLOUR : W.edge}`, borderRadius: 6, background: x2 ? "rgba(0,105,143,0.08)" : W.page, fontFamily: W.font, fontSize: 13.5, color: W.ink, cursor: "pointer" }}>
          2x speed
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setT(end);
          }}
          className="of-btn"
          style={{ minHeight: 34, padding: "0 10px", border: `1px solid ${W.edge}`, borderRadius: 6, background: W.page, fontFamily: W.font, fontSize: 13.5, color: W.ink, cursor: "pointer" }}
        >
          Show all the words
        </button>
      </div>
      {/* the words */}
      <div ref={box} aria-live="polite" style={{ marginTop: 12, flex: 1, minHeight: 120, maxHeight: "min(56vh, 470px)", overflowY: "auto", padding: "12px 14px", borderRadius: 8, background: "#f7f9fa", border: `1px solid ${W.edge}`, display: "grid", gap: 10, alignContent: "start" }}>
        {shown.length === 0 && <p style={{ margin: 0, fontSize: 15, color: W.muted }}>Press play. The words appear as they are said.</p>}
        {shown.map((l, i) => {
          const typed = Math.max(1, Math.floor((t - l.at) * SPEED));
          const text = l.text.slice(0, typed);
          const them = l.who === "them";
          return (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 92, flexShrink: 0, fontSize: 12.5, fontWeight: 700, color: them ? PHONE_COLOUR : W.muted, paddingTop: 2 }}>
                {them ? call.name : you}
                <span style={{ display: "block", fontWeight: 400, color: W.faint, fontVariantNumeric: "tabular-nums" }}>{clock(l.at)}</span>
              </span>
              <span style={{ fontSize: 15.5, lineHeight: 1.5, color: them ? W.ink : W.body }}>
                {text}
                {text.length < l.text.length && <span aria-hidden style={{ display: "inline-block", width: 7, height: 15, marginLeft: 2, verticalAlign: "-2px", background: PHONE_COLOUR, opacity: 0.6 }} />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function wayText(c: PhoneCall) {
  return c.way === "in" ? "Rang you" : c.way === "out" ? "You rang" : "Missed call";
}

function WayIcon({ way }: { way: PhoneCall["way"] }) {
  const col = way === "missed" ? "#c4314b" : W.muted;
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <path d={way === "out" ? "M6 18 L18 6 M10 6 H18 V14" : "M18 6 L6 18 M6 10 V18 H14"} fill="none" stroke={col} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* The phone's window: recent calls on the left, the chosen call on the right. */
export default function Phone({ state, active, dispatch, job }: OfficeAppProps) {
  const calls = state.phone?.calls ?? [];
  const raw = state.phone?.answered;
  const answered = raw ?? [];
  const live = calls.filter((c) => !c.ringing || answered.includes(c.id));
  const [sel, setSel] = useState<string | null>(null);
  const chosen = live.find((c) => c.id === sel) ?? live.find((c) => c.lines?.length) ?? live[0];
  const ringing = calls.find((c) => c.ringing && !answered.includes(c.id));
  /* a call just answered plays straight away */
  const [justAnswered, setJustAnswered] = useState<string | null>(null);
  const [seen, setSeen] = useState(raw);
  /* Module 11: ring a saved number, or type one on the keypad */
  const book = state.phoneBook;
  const [tab, setTab] = useState<"recent" | "contacts" | "keypad">("recent");
  const dial = (number: string) => {
    const script = reach(number, state.dialable, book);
    const made = calls.filter((c) => c.way === "out" && c.id.startsWith("call-out")).length;
    const call: PhoneCall = { ...script, id: newId("call-out"), time: later(job.clock, 2 + made * 3), way: "out" };
    dispatch({ type: "update", fn: (s) => ({ ...s, phone: { calls: [call, ...(s.phone?.calls ?? [])], answered: s.phone?.answered ?? [] } }) });
    setSel(call.id);
    setJustAnswered(call.id);
    setTab("recent");
  };
  if (raw !== seen) {
    const fresh = (raw ?? []).find((id) => !(seen ?? []).includes(id));
    setSeen(raw);
    if (fresh) {
      setSel(fresh);
      setJustAnswered(fresh);
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 40, padding: "0 12px", background: PHONE_COLOUR, color: "#fff", fontSize: 14, flexShrink: 0 }}>
        <b>Phone</b>
        <span style={{ opacity: 0.92 }}>Northfield Supplies · Your extension 431</span>
        <span style={{ marginLeft: "auto", fontSize: 12.5, opacity: 0.85 }}>Some calls are recorded for training</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <nav aria-label={book ? "Calls and contacts" : "Recent calls"} style={{ width: 290, flexShrink: 0, borderRight: `1px solid ${W.edge}`, background: W.chrome, overflowY: "auto" }}>
          {book && <PhoneTabs tab={tab} setTab={setTab} />}
          {book && tab === "contacts" && <PhoneContacts book={book} onCall={dial} />}
          {book && tab === "keypad" && <Keypad onCall={dial} />}
          {tab === "recent" && (
          <>
          <p style={{ margin: 0, padding: "12px 14px 8px", fontSize: 13, fontWeight: 700, color: W.muted }}>Recent calls</p>
          {ringing && (
            <div style={{ margin: "0 8px 8px", padding: "10px 12px", borderRadius: 8, background: "rgba(0,105,143,0.1)", fontSize: 14, display: "flex", gap: 10, alignItems: "center" }}>
              <span className="ph-ring" aria-hidden style={{ width: 10, height: 10, borderRadius: "50%", background: "#13a10e", flexShrink: 0 }} />
              <span>
                <b>{ringing.company ?? ringing.name}</b> is ringing
              </span>
            </div>
          )}
          {live.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setSel(c.id);
                setJustAnswered(null);
              }}
              className={chosen?.id === c.id ? "of-row on" : "of-row"}
              style={{ width: "100%", display: "flex", gap: 10, alignItems: "center", textAlign: "left", padding: "10px 14px", border: "none", borderBottom: `1px solid ${W.edge}`, background: chosen?.id === c.id ? W.select : "transparent", fontFamily: W.font, color: W.ink }}
            >
              <Avatar name={c.name} size={36} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 6, fontSize: 14.5, fontWeight: 600 }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: c.way === "missed" ? "#c4314b" : W.ink }}>{c.name}</span>
                  <span style={{ fontWeight: 400, fontSize: 13, color: W.muted, flexShrink: 0 }}>{c.time}</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: W.muted, marginTop: 2 }}>
                  <WayIcon way={c.way} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.company ?? c.number}</span>
                  {!!c.lines?.length && <span style={{ marginLeft: "auto", flexShrink: 0, fontSize: 11.5, fontWeight: 700, color: PHONE_COLOUR }}>● Recorded</span>}
                </span>
              </span>
            </button>
          ))}
          </>
          )}
        </nav>
        <section aria-label="The call" style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "20px 24px" }}>
          {ringing ? (
            <Ringing call={ringing} />
          ) : chosen ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Avatar name={chosen.name} size={56} />
                <div>
                  <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600 }}>{chosen.name}</h2>
                  {chosen.company && <div style={{ fontSize: 15, color: W.body }}>{chosen.company}</div>}
                  <div style={{ fontSize: 14.5, color: W.muted, marginTop: 2 }}>
                    {chosen.number} · {wayText(chosen)} today at {chosen.time} · {clock(chosen.seconds)} long
                  </div>
                </div>
              </div>
              <CallPlayer key={`${chosen.id}-${justAnswered === chosen.id}`} call={chosen} auto={active && justAnswered === chosen.id} />
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 16, color: W.muted }}>No calls today.</p>
          )}
        </section>
      </div>
      <style>{RING_CSS}</style>
    </div>
  );
}

function Ringing({ call }: { call: PhoneCall }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, textAlign: "center", color: W.body }}>
      <span className="ph-ring" style={{ borderRadius: "50%" }}>
        <Avatar name={call.name} size={72} />
      </span>
      <b style={{ fontSize: 20, color: W.ink }}>{call.company ?? call.name}</b>
      <span style={{ fontSize: 15 }}>{call.number} is ringing. Answer it with the green button at the bottom of the screen.</span>
    </div>
  );
}

/* A call ringing: a box over the whole desktop, wherever the learner is,
 * until it is answered. Answering brings the phone to the front. */
export function PhoneRinging({ state, dispatch, show }: OfficeAppProps) {
  const answered = state.phone?.answered ?? [];
  const call = (state.phone?.calls ?? []).find((c) => c.ringing && !answered.includes(c.id));
  if (!call) return null;
  return (
    <div role="alertdialog" aria-label={`Incoming call from ${call.company ?? call.name}`} style={{ position: "absolute", right: 18, bottom: 66, zIndex: 35, width: 330, borderRadius: 10, background: "#1f2a30", color: "#fff", boxShadow: "0 24px 60px -14px rgba(0,0,0,0.6)", padding: "16px 16px 14px", fontFamily: W.font }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span className="ph-ring" style={{ borderRadius: "50%" }}>
          <Avatar name={call.name} size={46} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12.5, opacity: 0.75 }}>Incoming call</div>
          <b style={{ display: "block", fontSize: 17 }}>{call.company ?? call.name}</b>
          <span style={{ fontSize: 14, opacity: 0.9 }}>{call.number}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: "update", fn: (s) => ({ ...s, phone: { calls: s.phone?.calls ?? [], answered: [...(s.phone?.answered ?? []), call.id] } }) });
          show("phone");
        }}
        style={{ marginTop: 14, width: "100%", minHeight: 46, border: "none", borderRadius: 23, background: "#13a10e", color: "#fff", fontFamily: W.font, fontSize: 16, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10 }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block" }}>
          <path d="M6.6 10.8 a15 15 0 0 0 6.6 6.6 l2.2-2.2 a1 1 0 0 1 1-.25 a11.4 11.4 0 0 0 3.6.6 a1 1 0 0 1 1 1 V20 a1 1 0 0 1-1 1 A17 17 0 0 1 3 4 a1 1 0 0 1 1-1 h3.5 a1 1 0 0 1 1 1 c0 1.25.2 2.45.6 3.6 a1 1 0 0 1-.25 1 Z" fill="#fff" />
        </svg>
        Answer
      </button>
      <style>{RING_CSS}</style>
    </div>
  );
}

const RING_CSS = `
  @keyframes ph-ring { 0% { box-shadow: 0 0 0 0 rgba(19,161,14,0.55); } 70% { box-shadow: 0 0 0 14px rgba(19,161,14,0); } 100% { box-shadow: 0 0 0 0 rgba(19,161,14,0); } }
  .ph-ring { display: inline-flex; animation: ph-ring 1.4s ease-out infinite; }
  @media (prefers-reduced-motion: reduce) { .ph-ring { animation: none; } }
`;

/* ── Module 11: Staying safe at work ───────────────────────────────────
 * Making a call: the phone's saved contacts (the numbers the company
 * already holds) and a keypad. A call plays out like a recorded one and
 * lands in Recent calls, where a job's checks read who was rung. */

/* The office clock a few minutes on: "Wed 11 Nov, 08:40" + 2 = "08:42". */
function later(clockText: string, minutes: number): string {
  const m = clockText.match(/(\d{1,2}):(\d{2})/);
  if (!m) return "Just now";
  const t = Number(m[1]) * 60 + Number(m[2]) + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

type PhoneTab = "recent" | "contacts" | "keypad";

function PhoneTabs({ tab, setTab }: { tab: PhoneTab; setTab: (t: PhoneTab) => void }) {
  const tabs: [PhoneTab, string][] = [
    ["contacts", "Contacts"],
    ["recent", "Recent"],
    ["keypad", "Keypad"],
  ];
  return (
    <div role="tablist" aria-label="Phone" style={{ display: "flex", gap: 2, padding: "8px 8px 0", borderBottom: `1px solid ${W.edge}` }}>
      {tabs.map(([id, label]) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={tab === id}
          onClick={() => setTab(id)}
          className="of-row"
          style={{ flex: 1, minHeight: 40, border: "none", borderBottom: `3px solid ${tab === id ? PHONE_COLOUR : "transparent"}`, borderRadius: "4px 4px 0 0", background: "transparent", fontFamily: W.font, fontSize: 14.5, fontWeight: tab === id ? 700 : 400, color: tab === id ? W.ink : W.body, cursor: "pointer" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function CallIcon({ size = 16, colour = "#fff" }: { size?: number; colour?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M6.6 10.8 a15 15 0 0 0 6.6 6.6 l2.2-2.2 a1 1 0 0 1 1-.25 a11.4 11.4 0 0 0 3.6.6 a1 1 0 0 1 1 1 V20 a1 1 0 0 1-1 1 A17 17 0 0 1 3 4 a1 1 0 0 1 1-1 h3.5 a1 1 0 0 1 1 1 c0 1.25.2 2.45.6 3.6 a1 1 0 0 1-.25 1 Z" fill={colour} />
    </svg>
  );
}

/* The company's saved numbers, grouped, each with a Call button. */
function PhoneContacts({ book, onCall }: { book: PhoneEntry[]; onCall: (n: string) => void }) {
  const [q, setQ] = useState("");
  const shown = book.filter((b) => !q.trim() || [b.name, b.company ?? "", b.role ?? "", b.number].some((t) => t.toLowerCase().includes(q.trim().toLowerCase())));
  const groups = [...new Set(shown.map((b) => b.group))];
  return (
    <div>
      <div style={{ padding: "10px 10px 6px" }}>
        <input aria-label="Search contacts" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search contacts" style={{ width: "100%", minHeight: 38, padding: "0 10px", border: `1px solid ${W.edge}`, borderRadius: 6, fontFamily: W.font, fontSize: 14.5, color: W.ink, background: W.page, boxSizing: "border-box" }} />
      </div>
      {groups.map((g) => (
        <div key={g}>
          <p style={{ margin: 0, padding: "10px 14px 4px", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", color: W.muted }}>{g}</p>
          {shown
            .filter((b) => b.group === g)
            .map((b) => (
              <div key={b.number} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 10px 8px 14px", borderBottom: `1px solid ${W.edge}` }}>
                <Avatar name={b.name} size={32} />
                <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: W.muted, lineHeight: 1.35 }}>
                  <b style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: W.ink }}>{b.name}</b>
                  {[b.role, b.company !== b.name ? b.company : undefined].filter(Boolean).join(", ")}
                  <span style={{ display: "block", color: W.body, fontVariantNumeric: "tabular-nums" }}>{b.number}</span>
                </span>
                <button type="button" onClick={() => onCall(b.number)} aria-label={`Call ${b.name} on ${b.number}`} title={`Call ${b.number}`} className="of-btn" style={{ width: 38, height: 38, flexShrink: 0, border: "none", borderRadius: "50%", background: "#13a10e", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <CallIcon />
                </button>
              </div>
            ))}
        </div>
      ))}
      {!shown.length && <p style={{ margin: 0, padding: 14, fontSize: 14, color: W.muted }}>No contact matches.</p>}
    </div>
  );
}

/* A keypad: type or click a number, then Call. */
function Keypad({ onCall }: { onCall: (n: string) => void }) {
  const [n, setN] = useState("");
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];
  const digits = n.replace(/[^\d*#]/g, "");
  return (
    <div style={{ padding: "14px 16px 18px" }}>
      <input
        aria-label="Number to call"
        inputMode="tel"
        value={n}
        onChange={(e) => setN(e.target.value.replace(/[^\d\s*#+]/g, ""))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && digits) onCall(n.trim());
        }}
        placeholder="Type a number"
        style={{ width: "100%", minHeight: 46, padding: "0 12px", border: `1px solid ${W.edge}`, borderRadius: 6, fontFamily: W.font, fontSize: 20, letterSpacing: "0.04em", textAlign: "center", color: W.ink, background: W.page, boxSizing: "border-box", fontVariantNumeric: "tabular-nums" }}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12 }}>
        {keys.map((k) => (
          <button key={k} type="button" onClick={() => setN((v) => v + k)} className="of-btn" style={{ minHeight: 46, border: `1px solid ${W.edge}`, borderRadius: 8, background: W.page, fontFamily: W.font, fontSize: 19, color: W.ink, cursor: "pointer" }}>
            {k}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button type="button" onClick={() => setN((v) => v.slice(0, -1))} disabled={!n} className="of-btn" style={{ minHeight: 46, padding: "0 14px", border: `1px solid ${W.edge}`, borderRadius: 8, background: W.page, fontFamily: W.font, fontSize: 14.5, color: W.ink, cursor: n ? "pointer" : "default", opacity: n ? 1 : 0.5 }}>
          Delete
        </button>
        <button type="button" onClick={() => digits && onCall(n.trim())} disabled={!digits} style={{ flex: 1, minHeight: 46, border: "none", borderRadius: 23, background: "#13a10e", color: "#fff", fontFamily: W.font, fontSize: 16, fontWeight: 700, cursor: digits ? "pointer" : "default", opacity: digits ? 1 : 0.55, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <CallIcon size={18} /> Call
        </button>
      </div>
    </div>
  );
}
/* ── end Module 11 ── */
