"use client";

/**
 * SIGNAL MISSION INTRO — Block 1's own skin for the per-mission ATLAS
 * briefing (MissionIntro.tsx's generic version). Same principle as Console's
 * ConsoleMissionIntro: reuse the Signal Room's OWN tokens (T/MONO/BODY from
 * engine/tokens.ts) and its OWN living background (BlockBackdrop, the exact
 * canvas world already running inside this mission's real gameplay) so the
 * briefing and the mission it opens read as one machine, not a universal
 * template recoloured per block.
 */

import { useEffect, useRef, useState } from "react";
import { BlockBackdrop } from "../BlockBackdrop";
import { useArrowAdvance, SkipButton } from "./arrowAdvance";
import { T, MONO, BODY, BAND_BY_CLASSIFICATION } from "./tokens";
import type { MissionIntroData } from "../missionIntroData";
import { ACTOR_PORTRAIT } from "../actorPortraits";

const CSS = `
.smi *{box-sizing:border-box}
.smi ::selection{background:var(--acc);color:#04070c}
@keyframes smi-scan{0%{background-position:0 0}100%{background-position:0 48px}}
.smi-scan{animation:smi-scan 3.2s linear infinite}
.smi-play{transition:transform .12s,box-shadow .2s}
.smi-play:hover{transform:scale(1.05);box-shadow:0 0 22px rgba(var(--accRGB),.4)}
.smi-play:focus-visible{outline:2px solid var(--acc);outline-offset:3px}
.smi-cta:hover{filter:brightness(1.08)}
.smi-cta:focus-visible{outline:2px solid ${T.textPrimary};outline-offset:2px}
@media (prefers-reduced-motion: reduce){.smi *{animation:none !important;transition:none !important}}
`;

export default function SignalMissionIntro({ data, onBegin }: { data: MissionIntroData; onBegin: () => void }) {
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

  // Same autoplay-with-gesture-fallback pattern as ConsoleMissionIntro/BlockIntro.
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
  const bars = Array.from({ length: 20 });
  const barH = (i: number) => (playing && !reduce ? 3 + Math.abs(Math.sin((audioRef.current?.currentTime ?? 0) * 3 + i * 0.5)) * 12 : 4);
  const acc = t.accent, accHi = t.accentHi;
  const band = BAND_BY_CLASSIFICATION[t.classification as keyof typeof BAND_BY_CLASSIFICATION] ?? acc;
  const portrait = ACTOR_PORTRAIT[data.codename];

  return (
    <main className="smi" style={{ minHeight: "100dvh", background: T.inkBlack, color: T.textPrimary, fontFamily: BODY, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden", position: "relative", ["--acc" as string]: acc, ["--accRGB" as string]: t.accentRGB }}>
      <style>{CSS}</style>
      <BlockBackdrop variant={t.backdrop} colors={t.matrix} accent={acc} accentHi={accHi} reduced={!!reduce} opacity={0.5} />
      <div aria-hidden className="smi-scan" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.26) 0 1px, transparent 1px 4px)", opacity: 0.3 }} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: `radial-gradient(ellipse 82% 72% at 50% 34%, transparent 44%, ${acc}12 74%, rgba(3,5,12,0.9) 100%)` }} />
      <SkipButton />

      <div style={{ width: "100%", maxWidth: 820, maxHeight: "calc(100dvh - 30px)", background: "rgba(12,20,34,0.76)", backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)", borderRadius: 16, border: `1px solid ${T.hairline}`, boxShadow: `0 24px 70px rgba(0,0,0,.6), inset 0 0 60px ${acc}0c`, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* classification strip */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: `1px solid ${T.hairline}`, background: `linear-gradient(90deg, ${band}22, transparent 60%)`, fontFamily: MONO }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, letterSpacing: ".24em", textTransform: "uppercase", color: band, fontWeight: 700 }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: band, boxShadow: `0 0 8px ${band}`, display: "block" }} />
            {t.classification} · ARC MISSION BRIEFING
          </span>
          <span style={{ fontSize: 10.5, letterSpacing: ".1em", color: T.textSecondary }}>{data.caseNumber} · {data.codename}</span>
        </div>

        <div style={{ padding: "22px 24px 24px", overflowY: "auto" }}>
          <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 320px", minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".28em", textTransform: "uppercase", color: acc, fontWeight: 700, marginBottom: 8 }}>[ {data.caseNumber} · {data.codename} ]</div>
              <h1 style={{ fontWeight: 800, fontSize: "clamp(28px,5vw,42px)", lineHeight: 1.02, margin: "0 0 10px", letterSpacing: "-.01em", textShadow: `0 2px 24px ${acc}40` }}>{data.title}</h1>
              <p style={{ fontSize: 14.5, color: T.textSecondary, lineHeight: 1.5, margin: 0, maxWidth: "54ch" }}>{data.thesis}</p>
            </div>
            {portrait && (
              <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span
                  aria-hidden
                  style={{
                    position: "relative",
                    display: "block",
                    width: 72,
                    height: 72,
                    overflow: "hidden",
                    background: T.panelRaised,
                    border: `2px solid ${acc}`,
                    boxShadow: `0 0 16px ${acc}88`,
                    clipPath: "polygon(12px 0,calc(100% - 12px) 0,100% 12px,100% 100%,0 100%,0 12px)",
                  }}
                >
                  <img src={portrait} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 25%" }} />
                </span>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".12em", color: T.textSecondary, textTransform: "uppercase" }}>Threat actor</span>
              </div>
            )}
          </div>
          <div style={{ height: 16 }} />

          {/* ATLAS player */}
          <div style={{ display: "flex", alignItems: "center", gap: 13, background: T.panel, border: `1px solid ${T.hairline}`, borderLeft: `3px solid ${acc}`, borderRadius: 9, padding: "11px 15px 11px 12px", marginBottom: 14 }}>
            <button className="smi-play" onClick={toggle} aria-label={playing ? "Pause briefing" : "Play briefing"}
              style={{ flex: "0 0 auto", width: 44, height: 44, borderRadius: "50%", border: `1px solid ${acc}`, background: `radial-gradient(circle at 40% 35%, ${acc}2e, ${T.panelRaised})`, color: accHi, fontSize: 16, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {playing ? "❚❚" : "▶"}
            </button>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".03em" }}>ATLAS <span style={{ color: acc, fontSize: 10, letterSpacing: ".14em" }}>ARC CMD</span></div>
              <div style={{ fontSize: 11.5, color: T.textSecondary, marginTop: 1, fontFamily: MONO }}>{label}</div>
              <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 2.5, height: 14, marginTop: 5 }}>
                {bars.map((_, i) => <i key={i} style={{ width: 2.5, height: barH(i), background: playing ? acc : T.hairline, borderRadius: 1, display: "block", transition: "height .1s" }} />)}
              </div>
            </div>
            <audio ref={audioRef} preload="auto" src={data.audio} />
          </div>

          {/* OUT THERE — real-world stakes */}
          <div style={{ display: "flex", gap: 11, alignItems: "flex-start", background: `${acc}0f`, border: `1px solid ${acc}44`, borderLeft: `3px solid ${acc}`, borderRadius: 9, padding: "11px 15px", marginBottom: 16 }}>
            <span aria-hidden style={{ flex: "0 0 auto", fontFamily: MONO, fontSize: 10, letterSpacing: ".14em", color: acc, marginTop: 2, textTransform: "uppercase" }}>OUT THERE</span>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: T.textPrimary }}>{data.realWorld}</p>
          </div>

          {/* skills checklist */}
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: acc, marginBottom: 8 }}>By the end, you&rsquo;ll be able to</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 20 }}>
            {data.skills.map((s) => (
              <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: T.textPrimary, background: T.panel, border: `1px solid ${T.hairline}`, borderRadius: 999, padding: "6px 11px" }}>
                <span style={{ color: acc, fontWeight: 700 }}>✓</span>{s}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: T.textSecondary, textTransform: "uppercase" }}>ATLAS · ARC COMMAND</div>
            <button className="smi-cta" onClick={onBegin} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: ".04em", color: "#04070c", background: `linear-gradient(180deg,${accHi},${acc})`, border: 0, borderRadius: 9, padding: "13px 24px", cursor: "pointer" }}>
              {data.beginLabel}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
