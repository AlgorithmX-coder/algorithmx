"use client";

/**
 * WAR ROOM MISSION INTRO — Block 4's own skin for the per-mission ATLAS
 * briefing. Same principle as the other three blocks: reuse THE WAR ROOM's
 * own palette (violet, IBM Plex Mono, evidence-board chip styling) and its
 * own living background (BlockBackdrop, the case's real canvas world),
 * framed as a case file pinned to the board — a dossier, not a terminal or
 * a phone — matching the CONNECT/PIN board this block's gameplay runs on.
 */

import { useEffect, useRef, useState } from "react";
import { BlockBackdrop } from "../BlockBackdrop";
import { useArrowAdvance, SkipButton } from "../engine/arrowAdvance";
import type { MissionIntroData } from "../missionIntroData";

const C = {
  page: "#0a0812", ink: "#ECE8F7", dim: "#A99BD0", faint: "#7e72a1",
  panel: "#130f22", edge: "#332a52", chip: "#1e1836", chipedge: "#3a2f5e",
  violet: "#B98BFF", violetHi: "#D4B8FF",
};
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.wmi *{box-sizing:border-box}
@keyframes wmi-led{0%,100%{opacity:.4}50%{opacity:1}}
.wmi-pin{filter:drop-shadow(0 2px 3px rgba(0,0,0,.6))}
.wmi-play{transition:transform .12s,box-shadow .2s}
.wmi-play:hover{transform:scale(1.05);box-shadow:0 0 20px var(--acc)}
.wmi-cta:hover{filter:brightness(1.08)}
.wmi-cta:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
@media (prefers-reduced-motion: reduce){.wmi *{animation:none !important;transition:none !important}}
`;

export default function WarRoomMissionIntro({ data, onBegin }: { data: MissionIntroData; onBegin: () => void }) {
  useArrowAdvance();
  const t = data.theme;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState("Play the briefing");
  const [, setTick] = useState(0);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const fast = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fast") === "1";
  const fmt = (s: number) => { s = Math.max(0, s | 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onMeta = () => setLabel(`Briefing · ${fmt(a.duration)}`);
    const onTime = () => { setTick((n) => n + 1); if (a.duration) setLabel(`ATLAS · ${fmt(a.currentTime)} / ${fmt(a.duration)}`); };
    const onEnd = () => { setPlaying(false); setLabel("Replay briefing"); };
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
  const bars = Array.from({ length: 18 });
  const barH = (i: number) => (playing && !reduce ? 3 + Math.abs(Math.sin((audioRef.current?.currentTime ?? 0) * 3 + i * 0.5)) * 12 : 4);
  const acc = t.accent, accHi = t.accentHi;

  return (
    <main className="wmi" style={{ minHeight: "100dvh", background: C.page, color: C.ink, fontFamily: UI, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden", position: "relative", ["--acc" as string]: acc }}>
      <style>{CSS}</style>
      <BlockBackdrop variant={t.backdrop} colors={t.matrix} accent={acc} accentHi={accHi} reduced={!!reduce} opacity={0.48} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(800px 900px at 50% 46%, rgba(10,8,18,0.3), rgba(10,8,18,0.1) 64%, rgba(10,8,18,0.55) 100%)` }} />
      <SkipButton />

      {/* dossier card, pinned-to-board feel: slight tilt, pin dot at top */}
      <div style={{ width: "100%", maxWidth: 780, maxHeight: "calc(100dvh - 30px)", background: "rgba(19,15,34,0.78)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: 10, border: `1px solid ${C.edge}`, boxShadow: `0 24px 70px rgba(0,0,0,.65), inset 0 0 60px ${acc}0c`, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <span aria-hidden className="wmi-pin" style={{ position: "absolute", top: -7, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${accHi}, ${acc})`, border: "1px solid rgba(0,0,0,.4)", zIndex: 2 }} />

        {/* case-board header */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 10px", borderBottom: `1px solid ${C.edge}`, fontFamily: MONO }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, letterSpacing: ".22em", textTransform: "uppercase", color: acc, fontWeight: 700 }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: acc, boxShadow: `0 0 8px ${acc}`, display: "block" }} />
            {t.classification} · CASE BOARD
          </span>
          <span style={{ fontSize: 10.5, letterSpacing: ".1em", color: C.faint }}>{data.caseNumber} · {data.codename}</span>
        </div>

        <div style={{ padding: "20px 24px 24px", overflowY: "auto" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".26em", textTransform: "uppercase", color: acc, fontWeight: 700, marginBottom: 8 }}>[ {data.caseNumber} · {data.codename} ]</div>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.02, margin: "0 0 10px", color: C.ink, textShadow: `0 2px 20px ${acc}3c` }}>{data.title}</h1>
          <p style={{ fontSize: 14.5, color: C.dim, lineHeight: 1.5, margin: "0 0 16px", maxWidth: "54ch" }}>{data.thesis}</p>

          {/* ATLAS player */}
          <div style={{ display: "flex", alignItems: "center", gap: 13, background: C.chip, border: `1px solid ${C.chipedge}`, borderLeft: `3px solid ${acc}`, borderRadius: 8, padding: "11px 15px 11px 12px", marginBottom: 14 }}>
            <button className="wmi-play" onClick={toggle} aria-label={playing ? "Pause briefing" : "Play briefing"}
              style={{ flex: "0 0 auto", width: 42, height: 42, borderRadius: "50%", border: `1px solid ${acc}`, background: `radial-gradient(circle at 40% 35%, ${acc}2e, ${C.page})`, color: accHi, fontSize: 15, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {playing ? "❚❚" : "▶"}
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".03em" }}>ATLAS <span style={{ color: acc, fontSize: 10, letterSpacing: ".14em" }}>ARC CMD</span></div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 1, fontFamily: MONO }}>{label}</div>
              <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 2.5, height: 14, marginTop: 5 }}>
                {bars.map((_, i) => <i key={i} style={{ width: 2.5, height: barH(i), background: playing ? acc : C.chipedge, borderRadius: 1, display: "block", transition: "height .1s" }} />)}
              </div>
            </div>
            <audio ref={audioRef} preload="auto" src={data.audio} />
          </div>

          {/* OUT THERE — evidence-note styled stakes */}
          <div style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.55, color: C.ink, background: C.panel, border: `1px solid ${C.edge}`, borderLeft: `3px solid ${acc}`, borderRadius: 8, padding: "11px 14px", marginBottom: 16 }}>
            <span style={{ color: C.faint }}>case note &gt; </span>{data.realWorld}
          </div>

          {/* skills checklist */}
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: acc, marginBottom: 8 }}>By the end, you&rsquo;ll be able to</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
            {data.skills.map((s) => (
              <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 8, padding: "6px 11px" }}>
                <span style={{ color: acc, fontWeight: 700 }}>✓</span>{s}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.faint, textTransform: "uppercase" }}>ATLAS · ARC COMMAND</div>
            <button className="wmi-cta" onClick={onBegin} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: ".04em", color: C.page, background: `linear-gradient(180deg,${accHi},${acc})`, border: 0, borderRadius: 8, padding: "13px 24px", cursor: "pointer" }}>
              {data.beginLabel}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
