"use client";

/**
 * MISSION INTRO — the per-case equivalent of BlockIntro, one per mission
 * instead of one per block. Same visual language (ATLAS player, "OUT THERE"
 * stakes box, themed backdrop) deliberately, so the two feel like one
 * family of screens at different zoom levels — block-wide, then
 * case-specific — rather than two unrelated designs. Differences from
 * BlockIntro: no five-case preview grid (nothing to preview for one case),
 * the checklist is this ONE case's own skill list, and the top strip reads
 * "MISSION BRIEFING" rather than "CLEARANCE UPGRADE" — nothing about a
 * single mission raises your clearance level.
 */

import { useEffect, useRef, useState } from "react";
import { BlockBackdrop } from "./BlockBackdrop";
import { useArrowAdvance, SkipButton } from "./engine/arrowAdvance";
import type { MissionIntroData } from "./missionIntroData";

const DISP = `"Oswald", "Arial Narrow", "Segoe UI", sans-serif`;
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;
const BODY = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
.mi{ --ground:#0A0C10; --panel:#12161C; --panel2:#171C24; --edge:#232B36; --ink:#ECEFF3; --dim:#9BA6B2; --faint:#6f7b89; min-height:100vh; min-height:100dvh; }
.mi *{ box-sizing:border-box }
.mi ::selection{ background:var(--acc); color:#0b0b0b }
.mi .disp{ font-family:${DISP}; font-weight:600; text-transform:uppercase }
.mi .play{ transition:transform .12s, box-shadow .2s }
.mi .play:hover{ transform:scale(1.05); box-shadow:0 0 22px rgba(var(--accRGB),.4) }
.mi .play:focus-visible{ outline:2px solid var(--acc); outline-offset:3px }
.mi .cta:hover{ filter:brightness(1.08) }
.mi .cta:focus-visible{ outline:2px solid var(--ink); outline-offset:2px }
@media (prefers-reduced-motion: reduce){ .mi *{ animation:none !important; transition:none !important } }
@media (max-width:460px){ .mi-title{ font-size:34px !important } }
`;

export default function MissionIntro({ data, onBegin }: { data: MissionIntroData; onBegin: () => void }) {
  useArrowAdvance(); // ArrowRight: fast-forward through narration for UAT
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

  // Same autoplay-with-gesture-fallback pattern as BlockIntro — see that
  // file's identical effect for the full reasoning (cold deep-links have no
  // user gesture, so the browser blocks autoplay; the first touch of any
  // kind starts ATLAS instead).
  useEffect(() => {
    const a = audioRef.current; if (!a || fast) return;
    let alive = true, done = false;
    const start = () => { if (done || !alive) return; done = true; a.play().then(() => { if (alive) setPlaying(true); else a.pause(); }).catch(() => { done = false; }); };
    let backstop: number | null = null;
    const onReady = () => { a.removeEventListener("canplaythrough", onReady); if (backstop !== null) window.clearTimeout(backstop); start(); };
    if (a.readyState >= 3) {
      start();
    } else {
      a.addEventListener("canplaythrough", onReady);
      backstop = window.setTimeout(onReady, 1500);
    }
    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    const onGesture = () => { if (alive && a.paused) start(); events.forEach((e) => window.removeEventListener(e, onGesture)); };
    events.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
    return () => { alive = false; a.removeEventListener("canplaythrough", onReady); if (backstop !== null) window.clearTimeout(backstop); events.forEach((e) => window.removeEventListener(e, onGesture)); try { a.pause(); } catch {} };
  }, [data.audio]);

  const toggle = () => { const a = audioRef.current; if (!a) return; if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {}); else { a.pause(); setPlaying(false); } };
  const bars = Array.from({ length: 22 });
  const barH = (i: number) => (playing && !reduce ? 3 + Math.abs(Math.sin((audioRef.current?.currentTime ?? 0) * 3 + i * 0.5)) * 13 : 4);

  const acc = t.accent, accHi = t.accentHi;

  return (
    <main
      className="mi"
      style={{
        ["--acc" as string]: acc, ["--acc-hi" as string]: accHi, ["--accRGB" as string]: t.accentRGB,
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(1000px 520px at 50% -6%, #241033 0%, rgba(36,16,51,0) 58%), #0A0C10",
        color: "#ECEFF3", fontFamily: BODY, position: "relative", padding: "16px",
      }}
    >
      <style>{CSS}</style>
      <SkipButton />
      <BlockBackdrop variant={t.backdrop} colors={t.matrix} accent={acc} accentHi={accHi} reduced={!!reduce} opacity={0.6} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 840, maxHeight: "calc(100vh - 24px)", display: "flex", flexDirection: "column", gap: 14, background: "linear-gradient(180deg, rgba(19,22,28,.72), rgba(10,12,16,.72))", border: "1px solid #232B36", borderRadius: 16, padding: "clamp(16px, 3vw, 26px)", backdropFilter: "blur(4px)" }}>

        {/* top strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "#9BA6B2" }}>
          <span style={{ color: acc, display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 7, height: 7, background: acc, borderRadius: "50%", boxShadow: `0 0 8px ${acc}`, display: "block" }} />{t.classification} · Mission Briefing</span>
          <span style={{ color: "#6f7b89" }}>{data.caseNumber} · {data.codename}</span>
        </div>

        {/* title + thesis + player */}
        <div style={{ display: "flex", gap: 22, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <div className="disp" style={{ fontWeight: 700, fontSize: 13, letterSpacing: ".3em", color: "#9BA6B2" }}>{data.caseNumber} · {data.codename}</div>
            <h1 className="mi-title disp" style={{ fontWeight: 700, fontSize: "clamp(34px, 5.6vw, 56px)", lineHeight: 0.95, margin: "4px 0 8px", background: "linear-gradient(180deg,#fff 0%, #cdd4dc 62%, #97a1ac 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {data.title}
            </h1>
            <p style={{ fontSize: "clamp(13.5px,1.6vw,16px)", color: "#9BA6B2", margin: 0, maxWidth: "46ch" }}>{data.thesis}</p>
          </div>

          {/* ATLAS player */}
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 13, background: "linear-gradient(180deg,#171C24,#12161C)", border: "1px solid #232B36", borderLeft: `3px solid ${acc}`, borderRadius: 12, padding: "11px 15px 11px 12px" }}>
            <button className="play" onClick={toggle} onPointerDown={(e) => e.stopPropagation()} aria-label={playing ? "Pause briefing" : "Play briefing"}
              style={{ flex: "0 0 auto", width: 48, height: 48, borderRadius: "50%", border: `1px solid ${acc}`, background: `radial-gradient(circle at 40% 35%, rgba(${t.accentRGB},.22), #14110a)`, color: accHi, fontSize: 17, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {playing ? "❚❚" : "▶"}
            </button>
            <div>
              <div className="disp" style={{ fontWeight: 600, fontSize: 15, letterSpacing: ".05em" }}>ATLAS <span style={{ color: acc, fontSize: 10, fontFamily: MONO, letterSpacing: ".14em" }}>ARC CMD</span></div>
              <div style={{ fontSize: 12, color: "#9BA6B2", marginTop: 1 }}>{label}</div>
              <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 2.5, height: 16, marginTop: 6 }}>
                {bars.map((_, i) => <i key={i} style={{ width: 2.5, height: barH(i), background: playing ? acc : "#4a5563", borderRadius: 2, display: "block", transition: "height .1s" }} />)}
              </div>
            </div>
            <audio ref={audioRef} preload="auto" src={data.audio} />
          </div>
        </div>

        {/* real-world stakes */}
        {data.realWorld && (
          <div style={{ display: "flex", gap: 11, alignItems: "flex-start", background: `linear-gradient(90deg, rgba(${t.accentRGB},.10), rgba(${t.accentRGB},.02))`, border: `1px solid rgba(${t.accentRGB},.28)`, borderLeft: `3px solid ${acc}`, borderRadius: 9, padding: "11px 15px" }}>
            <span aria-hidden style={{ flex: "0 0 auto", fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", color: acc, marginTop: 2, textTransform: "uppercase" }}>OUT THERE</span>
            <p style={{ margin: 0, fontSize: "clamp(12.5px,1.5vw,14.5px)", lineHeight: 1.45, color: "#C7D0DA" }}>{data.realWorld}</p>
          </div>
        )}

        {/* this case's own skills + begin, one row */}
        <div style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginTop: 2 }}>
          <div style={{ flex: "1 1 300px", minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: acc, marginBottom: 7 }}>By the end, you'll be able to</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.skills.map((s) => (
                <span key={s} className="disp" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: ".02em", textTransform: "none", color: "#ECEFF3", background: "#12161C", border: "1px solid #232B36", borderRadius: 999, padding: "6px 11px" }}>
                  <span style={{ color: acc, fontWeight: 700 }}>✓</span>{s}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flex: "0 0 auto", textAlign: "right" }}>
            <button className="cta" onClick={onBegin} style={{ fontFamily: DISP, fontWeight: 600, fontSize: 17, letterSpacing: ".05em", textTransform: "uppercase", color: "#14110a", background: `linear-gradient(180deg,${accHi},${acc})`, border: 0, borderRadius: 9, padding: "14px 30px", cursor: "pointer" }}>{data.beginLabel}</button>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", color: "#6f7b89", marginTop: 8, textTransform: "uppercase" }}>— ATLAS · ARC COMMAND</div>
          </div>
        </div>

      </div>
    </main>
  );
}
