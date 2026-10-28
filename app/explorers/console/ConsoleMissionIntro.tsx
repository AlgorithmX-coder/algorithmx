"use client";

/**
 * CONSOLE MISSION INTRO — Block 3's own skin for the per-mission ATLAS
 * briefing (MissionIntro.tsx's generic version). Owner: "create them based
 * off the theme of the actual interface of the UI, so it looks
 * coordinated" — every block gets its OWN briefing chrome matching that
 * block's runtime, not one universal template recoloured. This one reuses
 * ConsoleRuntime's exact tokens (palette, sharp R.panel/card/btn radius
 * scale, MONO font, terminal titlebar, bracket CTAs, the HubField galaxy
 * backdrop) so a Block 3 mission's briefing and its actual console feel
 * like the same machine, not two different apps stitched together.
 */

import { useEffect, useRef, useState } from "react";
import { HubStarfield, HubEnergy } from "./HubField";
import { useArrowAdvance, SkipButton } from "../engine/arrowAdvance";
import type { MissionIntroData } from "../missionIntroData";
import { ACTOR_PORTRAIT } from "../actorPortraits";

const C = {
  page: "#050402", ink: "#F4ECD8", dim: "#B39B6E", faint: "#877857",
  chip: "#1a1409", chipedge: "#43371c", edge: "#3a2f16",
  mint: "#4FD98A",
};
const R = { panel: 3, card: 2, btn: 2 };
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
.cmi *{box-sizing:border-box}
@keyframes cmi-led{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes cmi-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
.cmi-cursor{display:inline-block;width:7px;height:1em;background:currentColor;vertical-align:text-bottom;animation:cmi-blink 1s step-end infinite;margin-left:1px}
.cmi-play{transition:border-color .15s,box-shadow .15s}
.cmi-play:hover{box-shadow:0 0 14px var(--acc)}
.cmi-cta:hover{filter:brightness(1.08)}
.cmi-cta:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
@media (prefers-reduced-motion: reduce){.cmi *{animation-duration:.001ms !important}}
`;

export default function ConsoleMissionIntro({ data, onBegin }: { data: MissionIntroData; onBegin: () => void }) {
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

  // Same autoplay-with-gesture-fallback as MissionIntro/BlockIntro — see
  // BlockIntro.tsx's identical effect for the full reasoning.
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
  const acc = t.accent;
  const portrait = ACTOR_PORTRAIT[data.codename];

  return (
    <main className="cmi" style={{ minHeight: "100dvh", background: C.page, color: C.ink, fontFamily: UI, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden", position: "relative", ["--acc" as string]: acc }}>
      <style>{CSS}</style>
      <HubStarfield accent={acc} reduced={!!reduce} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(760px 880px at 50% 50%, rgba(5,4,2,0.4), rgba(5,4,2,0.12) 68%, rgba(5,4,2,0.32))" }} />
      <HubEnergy accent={acc} reduced={!!reduce} />
      <SkipButton />

      <div style={{ width: "100%", maxWidth: 760, maxHeight: "calc(100dvh - 30px)", background: "rgba(10,8,4,0.74)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: R.panel, border: `1px solid ${acc}70`, boxShadow: `0 0 0 1px #000, 0 24px 70px rgba(0,0,0,.7), inset 0 0 60px ${acc}0c`, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* titlebar */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 15px", borderBottom: `1px solid ${C.edge}`, background: "linear-gradient(180deg,rgba(28,22,12,0.85),rgba(14,11,5,0.7))", fontFamily: MONO }}>
          <span aria-hidden style={{ display: "flex", gap: 5, marginRight: 2 }}>
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6A4D99", display: "block" }} />
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFB23E99", display: "block" }} />
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#4FD98A99", display: "block" }} />
          </span>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: acc, boxShadow: `0 0 8px ${acc}`, animation: reduce ? "none" : "cmi-led 1.6s infinite", display: "block" }} />
          <span style={{ fontSize: 11.5, letterSpacing: ".16em", color: acc, fontWeight: 600 }}>ARC · MISSION BRIEFING<span className="cmi-cursor" aria-hidden /></span>
          <span style={{ marginLeft: "auto", fontSize: 10.5, letterSpacing: ".12em", color: C.faint }}>{data.caseNumber} · {data.codename}</span>
        </div>

        <div style={{ padding: "20px 22px 22px", overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px", minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: acc, fontWeight: 700, marginBottom: 8 }}>[ {data.caseNumber} · {data.codename} ]</div>
              <div style={{ fontSize: "clamp(28px,5vw,40px)", fontWeight: 800, letterSpacing: "-.01em", color: C.ink, textShadow: `0 2px 20px ${acc}40`, marginBottom: 10, lineHeight: 1.02 }}>{data.title}</div>
              <p style={{ fontSize: 14.5, color: C.dim, lineHeight: 1.5, margin: 0, maxWidth: "52ch" }}>{data.thesis}</p>
            </div>
            {portrait && (
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span aria-hidden style={{ position: "relative", display: "block", width: 72, height: 72, overflow: "hidden", background: "#0c0a05", border: `2px solid ${acc}`, borderRadius: R.card, boxShadow: `0 0 16px ${acc}88` }}>
                  <img src={portrait} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%" }} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".12em", color: C.faint, textTransform: "uppercase" }}>Threat actor</span>
              </div>
            )}
          </div>
          <div style={{ height: 16 }} />

          {/* ATLAS player — terminal module */}
          <div style={{ display: "flex", alignItems: "center", gap: 13, background: C.chip, border: `1px solid ${C.chipedge}`, borderLeft: `3px solid ${acc}`, borderRadius: R.card, padding: "11px 15px 11px 12px", marginBottom: 14 }}>
            <button className="cmi-play" onClick={toggle} aria-label={playing ? "Pause briefing" : "Play briefing"}
              style={{ flex: "0 0 auto", width: 42, height: 42, borderRadius: R.card, border: `1px solid ${acc}`, background: `radial-gradient(circle at 40% 35%, ${acc}2e, #14110a)`, color: acc, fontSize: 15, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {playing ? "❚❚" : "▶"}
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".03em" }}>ATLAS <span style={{ color: acc, fontSize: 10, letterSpacing: ".14em" }}>ARC CMD</span></div>
              <div style={{ fontSize: 11.5, color: C.faint, marginTop: 1, fontFamily: MONO }}>{label}</div>
              <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 2.5, height: 14, marginTop: 5 }}>
                {bars.map((_, i) => <i key={i} style={{ width: 2.5, height: barH(i), background: playing ? acc : "#4a4030", borderRadius: 1, display: "block", transition: "height .1s" }} />)}
              </div>
            </div>
            <audio ref={audioRef} preload="auto" src={data.audio} />
          </div>

          {/* OUT THERE — a sys-readout style box, matching Console's own log lines */}
          <div style={{ fontFamily: MONO, fontSize: 13, lineHeight: 1.55, color: "#E8D9B8", background: "#0c0a05", border: `1px solid ${C.edge}`, borderLeft: `3px solid ${acc}`, borderRadius: R.card, padding: "11px 14px", marginBottom: 16 }}>
            <span style={{ color: C.faint }}>&gt; </span>{data.realWorld}
          </div>

          {/* skills checklist — sharp chips */}
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: acc, marginBottom: 8 }}>// by the end, you'll be able to</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
            {data.skills.map((s) => (
              <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: R.card, padding: "6px 11px" }}>
                <span style={{ color: acc, fontWeight: 700 }}>✓</span>{s}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.faint, textTransform: "uppercase" }}>ATLAS · ARC COMMAND</div>
            <button className="cmi-cta" onClick={onBegin} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: ".04em", color: "#14110a", background: acc, border: 0, borderRadius: R.btn, padding: "13px 24px", cursor: "pointer" }}>
              [ {data.beginLabel} ]
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
