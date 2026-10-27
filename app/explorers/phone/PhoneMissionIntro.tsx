"use client";

/**
 * PHONE MISSION INTRO — Block 2's own skin for the per-mission ATLAS
 * briefing. Same principle as Console/Signal's versions: reuse THE PHONE's
 * own palette (PINK identity, dark chrome, message-thread chip styling) and
 * its own living background (BlockBackdrop, the exact per-case world this
 * mission's gameplay already runs on), framed as an incoming ARC transmission
 * landing on the lock screen before the thread opens — a phone, not a
 * terminal, so the briefing itself looks like a message you're about to open.
 */

import { useEffect, useRef, useState } from "react";
import { BlockBackdrop } from "../BlockBackdrop";
import { useArrowAdvance, SkipButton } from "../engine/arrowAdvance";
import type { MissionIntroData } from "../missionIntroData";

const C = {
  page: "#0d0d12", ink: "#F3F4F7", dim: "#9A9AA6", faint: "#7a7a88",
  chrome: "#17171f", line: "#232330", chip: "#1c1c26", chipedge: "#33333f",
  pink: "#FF3D8A", pinkHi: "#FF74AE",
};
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.pmi *{box-sizing:border-box}
@keyframes pmi-led{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes pmi-pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.28);opacity:.55}}
.pmi-dot{animation:pmi-pulse 1.4s ease-in-out infinite}
.pmi-play{transition:transform .12s,box-shadow .2s}
.pmi-play:hover{transform:scale(1.06);box-shadow:0 0 20px var(--acc)}
.pmi-cta:hover{filter:brightness(1.08)}
.pmi-cta:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
@media (prefers-reduced-motion: reduce){.pmi *{animation:none !important;transition:none !important}}
`;

export default function PhoneMissionIntro({ data, onBegin }: { data: MissionIntroData; onBegin: () => void }) {
  useArrowAdvance();
  const t = data.theme;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState("Tap to play");
  const [, setTick] = useState(0);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const fast = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fast") === "1";
  const fmt = (s: number) => { s = Math.max(0, s | 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onMeta = () => setLabel(`Voice note · ${fmt(a.duration)}`);
    const onTime = () => { setTick((n) => n + 1); if (a.duration) setLabel(`ATLAS · ${fmt(a.currentTime)} / ${fmt(a.duration)}`); };
    const onEnd = () => { setPlaying(false); setLabel("Replay"); };
    a.addEventListener("loadedmetadata", onMeta); a.addEventListener("timeupdate", onTime); a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("timeupdate", onTime); a.removeEventListener("ended", onEnd); a.pause(); };
  }, []);

  useEffect(() => {
    const a = audioRef.current; if (!a || fast) return;
    let alive = true, done = false;
    const start = () => { if (done || !alive) return; done = true; a.play().then(() => { if (alive) setPlaying(true); else a.pause(); }).catch(() => { done = false; }); };
    let backstop: number | null = null;
    const onReady = () => { a.removeEventListener("canplaythrough", onReady); if (backstop !== null) window.clearTimeout(backstop); start(); };
    if (a.readyState >= 3) start(); else { a.addEventListener("canplaythrough", onReady); backstop = window.setTimeout(onReady, 1500); }
    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    const onGesture = () => { if (alive && a.paused) start(); events.forEach((e) => window.removeEventListener(e, onGesture)); };
    events.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
    return () => { alive = false; a.removeEventListener("canplaythrough", onReady); if (backstop !== null) window.clearTimeout(backstop); events.forEach((e) => window.removeEventListener(e, onGesture)); try { a.pause(); } catch {} };
  }, [data.audio]);

  const toggle = () => { const a = audioRef.current; if (!a) return; if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {}); else { a.pause(); setPlaying(false); } };
  const bars = Array.from({ length: 16 });
  const barH = (i: number) => (playing && !reduce ? 3 + Math.abs(Math.sin((audioRef.current?.currentTime ?? 0) * 3 + i * 0.5)) * 11 : 4);
  const acc = t.accent, accHi = t.accentHi;

  return (
    <main className="pmi" style={{ minHeight: "100dvh", background: C.page, color: C.ink, fontFamily: UI, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden", position: "relative", ["--acc" as string]: acc }}>
      <style>{CSS}</style>
      <BlockBackdrop variant={t.backdrop} colors={t.matrix} accent={acc} accentHi={accHi} reduced={!!reduce} opacity={0.46} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(640px 820px at 50% 8%, ${acc}1c, rgba(13,13,18,0) 60%), radial-gradient(900px 700px at 50% 100%, rgba(13,13,18,.55), rgba(13,13,18,.1) 60%)` }} />
      <SkipButton />

      {/* phone-shaped card: tall rounded panel, notch-style top bar */}
      <div style={{ width: "100%", maxWidth: 420, maxHeight: "calc(100dvh - 30px)", background: "rgba(23,23,31,0.86)", backdropFilter: "blur(9px)", WebkitBackdropFilter: "blur(9px)", borderRadius: 28, border: `1px solid ${C.line}`, boxShadow: `0 0 0 6px rgba(0,0,0,0.5), 0 30px 70px rgba(0,0,0,.65), inset 0 0 50px ${acc}10`, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* status bar */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px 6px", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: C.faint }}>
          <span>ARC SECURE LINE</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden className="pmi-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: acc, display: "block" }} />
            {data.caseNumber}
          </span>
        </div>

        <div style={{ padding: "6px 22px 24px", overflowY: "auto" }}>
          {/* incoming-message style header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: `radial-gradient(circle at 38% 32%, ${acc}55, ${C.chrome})`, border: `1px solid ${acc}`, display: "grid", placeItems: "center", fontFamily: MONO, fontWeight: 700, fontSize: 12, color: accHi }}>A</div>
            <div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13 }}>ATLAS <span style={{ color: acc, fontSize: 10, letterSpacing: ".1em" }}>ARC CMD</span></div>
              <div style={{ fontSize: 11, color: C.faint }}>{data.codename} · new transmission</div>
            </div>
          </div>

          {/* message bubble: title + thesis */}
          <div style={{ background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: "4px 16px 16px 16px", padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: acc, fontWeight: 700, marginBottom: 7 }}>{data.caseNumber} · {data.codename}</div>
            <div style={{ fontWeight: 800, fontSize: "clamp(22px,6vw,28px)", lineHeight: 1.06, marginBottom: 8 }}>{data.title}</div>
            <p style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.48, margin: 0 }}>{data.thesis}</p>
          </div>

          {/* ATLAS voice-note player, styled like a phone voice message */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, background: C.chrome, border: `1px solid ${C.chipedge}`, borderLeft: `3px solid ${acc}`, borderRadius: "4px 16px 16px 16px", padding: "10px 14px 10px 11px", marginBottom: 12 }}>
            <button className="pmi-play" onClick={toggle} aria-label={playing ? "Pause" : "Play"}
              style={{ flex: "0 0 auto", width: 38, height: 38, borderRadius: "50%", border: `1px solid ${acc}`, background: `radial-gradient(circle at 40% 35%, ${acc}2e, ${C.page})`, color: accHi, fontSize: 14, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {playing ? "❚❚" : "▶"}
            </button>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 2.5, height: 13 }}>
                {bars.map((_, i) => <i key={i} style={{ width: 2.5, height: barH(i), background: playing ? acc : C.chipedge, borderRadius: 1, display: "block", transition: "height .1s" }} />)}
              </div>
              <div style={{ fontSize: 10.5, color: C.faint, marginTop: 3, fontFamily: MONO }}>{label}</div>
            </div>
            <audio ref={audioRef} preload="auto" src={data.audio} />
          </div>

          {/* real-world stakes, styled as a flagged note */}
          <div style={{ background: `${acc}14`, border: `1px solid ${acc}44`, borderRadius: 12, padding: "11px 14px", marginBottom: 16 }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", color: acc, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>Out there</div>
            <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.46, color: C.ink }}>{data.realWorld}</p>
          </div>

          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: acc, marginBottom: 8 }}>By the end, you&rsquo;ll be able to</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
            {data.skills.map((s) => (
              <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 999, padding: "5px 10px" }}>
                <span style={{ color: acc, fontWeight: 700 }}>✓</span>{s}
              </span>
            ))}
          </div>

          <button className="pmi-cta" onClick={onBegin} style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 14.5, letterSpacing: ".04em", color: "#17171f", background: `linear-gradient(180deg,${accHi},${acc})`, border: 0, borderRadius: 14, padding: "14px 20px", cursor: "pointer" }}>
            {data.beginLabel}
          </button>
          <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.faint, marginTop: 10, textTransform: "uppercase" }}>ATLAS · ARC COMMAND</div>
        </div>
      </div>
    </main>
  );
}
