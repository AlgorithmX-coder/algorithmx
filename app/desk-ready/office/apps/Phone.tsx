"use client";

import { useEffect, useRef, useState } from "react";
import { W } from "../../tokens";
import { SPEED } from "../admin";
import type { PhoneCall } from "../types";
import type { OfficeAppProps } from "./registry";

/* The desk phone, for the office jobs (Module 10, criterion ADM-4): the
 * phone system's app on the computer, as many offices have now. A call
 * that rings when the job opens pops up over whatever is on screen; the
 * learner answers it and the call plays out, word by word, the way a
 * recorded call's transcript does. Every answered call stays in Recent
 * calls, where the recording can be played again or read in full. There
 * is no sound: the words are the call. */

export const PHONE_COLOUR = "#00698f";

const initials = (name: string) =>
  name
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

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setT((v) => Math.min(end, v + (x2 ? 0.2 : 0.1))), 100);
    return () => clearInterval(id);
  }, [playing, x2, end]);
  useEffect(() => {
    if (t >= end && playing) {
      setPlaying(false);
      if (!ended.current) {
        ended.current = true;
        onEnd?.();
      }
    }
  }, [t, end, playing, onEnd]);
  /* keep the newest words in view, inside the transcript box only */
  useEffect(() => {
    const el = box.current;
    if (el && playing) el.scrollTop = el.scrollHeight;
  }, [t, playing]);

  if (!lines.length) return <p style={{ margin: 0, padding: 18, fontSize: 15, color: W.muted }}>This call wasn&apos;t recorded.</p>;
  const shown = lines.filter((l) => l.at <= t);
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 0, fontFamily: W.font }}>
      {/* the player */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => {
            if (t >= end) setT(0);
            setPlaying((p) => !p);
          }}
          className="of-btn"
          aria-label={playing ? "Pause the recording" : "Play the recording"}
          style={{ minHeight: 42, padding: "0 18px", border: "none", borderRadius: 21, background: PHONE_COLOUR, color: "#fff", fontFamily: W.font, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
        >
          <span aria-hidden>{playing ? "❚❚" : "▶"}</span> {playing ? "Pause" : t > 0 && t < end ? "Carry on" : t >= end ? "Play again" : "Play the recording"}
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
      <div ref={box} aria-live="polite" style={{ marginTop: 12, flex: 1, minHeight: 120, maxHeight: 360, overflowY: "auto", padding: "12px 14px", borderRadius: 8, background: "#f7f9fa", border: `1px solid ${W.edge}`, display: "grid", gap: 10, alignContent: "start" }}>
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
export default function Phone({ state, active }: OfficeAppProps) {
  const calls = state.phone?.calls ?? [];
  const answered = state.phone?.answered ?? [];
  const live = calls.filter((c) => !c.ringing || answered.includes(c.id));
  const [sel, setSel] = useState<string | null>(null);
  const chosen = live.find((c) => c.id === sel) ?? live.find((c) => c.lines?.length) ?? live[0];
  const ringing = calls.find((c) => c.ringing && !answered.includes(c.id));
  /* a call just answered plays straight away */
  const [justAnswered, setJustAnswered] = useState<string | null>(null);
  const seen = useRef(answered);
  useEffect(() => {
    const fresh = answered.find((id) => !seen.current.includes(id));
    seen.current = answered;
    if (fresh) {
      setSel(fresh);
      setJustAnswered(fresh);
    }
  }, [answered]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 40, padding: "0 12px", background: PHONE_COLOUR, color: "#fff", fontSize: 14, flexShrink: 0 }}>
        <b>Phone</b>
        <span style={{ opacity: 0.92 }}>Northfield Supplies · Your extension 431</span>
        <span style={{ marginLeft: "auto", fontSize: 12.5, opacity: 0.85 }}>Some calls are recorded for training</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <nav aria-label="Recent calls" style={{ width: 290, flexShrink: 0, borderRight: `1px solid ${W.edge}`, background: W.chrome, overflowY: "auto" }}>
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
        </nav>
        <section aria-label="The call" style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "20px 24px" }}>
          {ringing && !live.length ? (
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
