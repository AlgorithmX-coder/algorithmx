"use client";

/**
 * BLOCK INTRO — one comprehensive briefing per block, spoken by ATLAS (ARC
 * Command; a man's voice, not WREN). Designed to sit on a SINGLE SCREEN,
 * aggregated: a kid takes the whole block in at a glance, presses play to hear
 * ATLAS, and goes — no scrolling. Data-driven and THEMED per block (accent =
 * the block's classification colour; code-rain tinted to match). The ATLAS
 * voice plays from a dedicated <audio> (not the WREN engine).
 */

import { useEffect, useRef, useState } from "react";
import { MatrixRain } from "../MatrixRain";
import type { BlockIntroData } from "./blockIntroData";

const DISP = `"Oswald", "Arial Narrow", "Segoe UI", sans-serif`;
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;
const BODY = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
.bi{ --ground:#0A0C10; --panel:#12161C; --panel2:#171C24; --edge:#232B36; --ink:#ECEFF3; --dim:#9BA6B2; --faint:#5E6874; min-height:100vh; min-height:100dvh; }
.bi *{ box-sizing:border-box }
.bi ::selection{ background:var(--acc); color:#0b0b0b }
.bi .disp{ font-family:${DISP}; font-weight:600; text-transform:uppercase }
.bi .play{ transition:transform .12s, box-shadow .2s }
.bi .play:hover{ transform:scale(1.05); box-shadow:0 0 22px rgba(var(--accRGB),.4) }
.bi .play:focus-visible{ outline:2px solid var(--acc); outline-offset:3px }
.bi .cta:hover{ filter:brightness(1.08) }
.bi .cta:focus-visible{ outline:2px solid var(--ink); outline-offset:2px }
.bi .file{ transition:border-color .15s, transform .12s }
.bi .file:hover{ transform:translateY(-2px); border-color:rgba(var(--accRGB),.6) }
@media (prefers-reduced-motion: reduce){ .bi *{ animation:none !important; transition:none !important } }
@media (max-width:760px){ .bi-files{ grid-template-columns:repeat(2,1fr) !important } .bi-title{ font-size:34px !important } }
@media (max-width:460px){ .bi-files{ grid-template-columns:1fr !important } }
`;

export default function BlockIntro({ data, onBegin }: { data: BlockIntroData; onBegin: () => void }) {
  const t = data.theme;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState("Play the briefing");
  const [, setTick] = useState(0);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  // Fast test mode (?fast=1): don't auto-play ATLAS, so testing is voice-free.
  const fast = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fast") === "1";
  const fmt = (s: number) => { s = Math.max(0, s | 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onMeta = () => setLabel(`Briefing · ${fmt(a.duration)}`);
    const onTime = () => { setTick((n) => n + 1); if (a.duration) setLabel(`${data.commander.name} · ${fmt(a.currentTime)} / ${fmt(a.duration)}`); };
    const onEnd = () => { setPlaying(false); setLabel("Replay briefing"); };
    a.addEventListener("loadedmetadata", onMeta); a.addEventListener("timeupdate", onTime); a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("timeupdate", onTime); a.removeEventListener("ended", onEnd); a.pause(); };
  }, [data.commander.name]);

  // ATLAS starts speaking straight away. Arriving from the map carries a user
  // gesture, so play() is allowed immediately; on a cold deep-link autoplay is
  // blocked, so the first tap anywhere starts him instead.
  useEffect(() => {
    const a = audioRef.current; if (!a || fast) return; // fast test mode: no auto-play
    let alive = true, done = false;
    const start = () => { if (done || !alive) return; done = true; a.play().then(() => { if (alive) setPlaying(true); else a.pause(); }).catch(() => { done = false; }); };
    start();
    const onGesture = () => { if (alive && a.paused) start(); window.removeEventListener("pointerdown", onGesture); };
    window.addEventListener("pointerdown", onGesture);
    // On leave, stop ATLAS for good — a play() still in flight must not bleed over WREN in the phone.
    return () => { alive = false; window.removeEventListener("pointerdown", onGesture); try { a.pause(); } catch {} };
  }, []);

  const toggle = () => { const a = audioRef.current; if (!a) return; if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {}); else { a.pause(); setPlaying(false); } };
  const bars = Array.from({ length: 22 });
  const barH = (i: number) => (playing && !reduce ? 3 + Math.abs(Math.sin((audioRef.current?.currentTime ?? 0) * 3 + i * 0.5)) * 13 : 4);

  const acc = t.accent, accHi = t.accentHi;

  return (
    <main
      className="bi"
      style={{
        ["--acc" as string]: acc, ["--acc-hi" as string]: accHi, ["--accRGB" as string]: t.accentRGB,
        overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
        background: "radial-gradient(1000px 520px at 50% -6%, #241033 0%, rgba(36,16,51,0) 58%), #0A0C10",
        color: "#ECEFF3", fontFamily: BODY, position: "relative", padding: "16px",
      }}
    >
      <style>{CSS}</style>
      <MatrixRain reduced={!!reduce} opacity={0.1} colors={t.matrix} head={accHi} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 1000, maxHeight: "calc(100vh - 24px)", display: "flex", flexDirection: "column", gap: 14, background: "linear-gradient(180deg, rgba(19,22,28,.72), rgba(10,12,16,.72))", border: "1px solid #232B36", borderRadius: 16, padding: "clamp(16px, 3vw, 26px)", backdropFilter: "blur(4px)" }}>

        {/* top strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase", color: "#9BA6B2" }}>
          <span style={{ color: acc, display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 7, height: 7, background: acc, borderRadius: "50%", boxShadow: `0 0 8px ${acc}`, display: "block" }} />{t.classification} · Clearance Upgrade</span>
          <span style={{ color: "#5E6874" }}>{data.commander.org}</span>
        </div>

        {/* title + thesis + player, in a row on wide screens */}
        <div style={{ display: "flex", gap: 22, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            <div className="disp" style={{ fontWeight: 700, fontSize: 13, letterSpacing: ".45em", color: "#9BA6B2" }}>{data.block}</div>
            <h1 className="bi-title disp" style={{ fontWeight: 700, fontSize: "clamp(38px, 6.4vw, 68px)", lineHeight: 0.9, margin: "4px 0 8px", background: "linear-gradient(180deg,#fff 0%, #cdd4dc 62%, #97a1ac 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {data.title.join(" ")}
            </h1>
            <p style={{ fontSize: "clamp(14px,1.7vw,17px)", color: "#9BA6B2", margin: 0, maxWidth: "44ch" }} dangerouslySetInnerHTML={{ __html: data.thesis }} />
          </div>

          {/* ATLAS player */}
          <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 13, background: "linear-gradient(180deg,#171C24,#12161C)", border: "1px solid #232B36", borderLeft: `3px solid ${acc}`, borderRadius: 12, padding: "11px 15px 11px 12px" }}>
            <button className="play" onClick={toggle} onPointerDown={(e) => e.stopPropagation()} aria-label={playing ? "Pause briefing" : "Play briefing"}
              style={{ flex: "0 0 auto", width: 48, height: 48, borderRadius: "50%", border: `1px solid ${acc}`, background: `radial-gradient(circle at 40% 35%, rgba(${t.accentRGB},.22), #14110a)`, color: accHi, fontSize: 17, display: "grid", placeItems: "center", cursor: "pointer" }}>
              {playing ? "❚❚" : "▶"}
            </button>
            <div>
              <div className="disp" style={{ fontWeight: 600, fontSize: 15, letterSpacing: ".05em" }}>{data.commander.name} <span style={{ color: acc, fontSize: 10, fontFamily: MONO, letterSpacing: ".14em" }}>ARC CMD</span></div>
              <div style={{ fontSize: 12, color: "#9BA6B2", marginTop: 1 }}>{label}</div>
              <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 2.5, height: 16, marginTop: 6 }}>
                {bars.map((_, i) => <i key={i} style={{ width: 2.5, height: barH(i), background: playing ? acc : "#4a5563", borderRadius: 2, display: "block", transition: "height .1s" }} />)}
              </div>
            </div>
            <audio ref={audioRef} preload="auto" src={data.audio} />
          </div>
        </div>

        {/* the five cases — one aggregated row */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: acc, marginBottom: 7 }}>{data.filesKicker}</div>
          <div className="bi-files" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9 }}>
            {data.files.map((f) => (
              <div key={f.caseNo} className="file" style={{ background: "linear-gradient(180deg,#171C24,#12161C)", border: "1px solid #232B36", borderRadius: 9, padding: "11px 11px 10px", position: "relative", overflow: "hidden", minWidth: 0 }}>
                <span style={{ position: "absolute", inset: "0 auto 0 0", width: 3, background: `rgba(${t.accentRGB},.55)`, display: "block" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: "#5E6874" }}>{f.caseNo}</span>
                  <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: ".08em", color: acc, border: `1px solid rgba(${t.accentRGB},.5)`, borderRadius: 3, padding: "0 5px" }}>{f.codename}</span>
                </div>
                <div className="disp" style={{ fontSize: 15, color: "#ECEFF3", fontWeight: 600, textTransform: "none", lineHeight: 1.05, marginBottom: 3 }}>{f.title}</div>
                <div style={{ fontSize: 11.5, color: "#9BA6B2", lineHeight: 1.3 }}>{f.blurb}</div>
              </div>
            ))}
          </div>
        </div>

        {/* skills + begin, one row */}
        <div style={{ display: "flex", gap: 18, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", marginTop: 2 }}>
          <div style={{ flex: "1 1 300px", minWidth: 0 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: acc, marginBottom: 7 }}>By the end, you'll be able to</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {data.skills.map((s) => (
                <span key={s.name} className="disp" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, letterSpacing: ".02em", textTransform: "none", color: "#ECEFF3", background: "#12161C", border: "1px solid #232B36", borderRadius: 999, padding: "6px 12px" }}>
                  <span style={{ color: acc, fontWeight: 700 }}>✓</span>{s.name}
                </span>
              ))}
            </div>
          </div>
          <div style={{ flex: "0 0 auto", textAlign: "right" }}>
            <button className="cta" onClick={onBegin} style={{ fontFamily: DISP, fontWeight: 600, fontSize: 17, letterSpacing: ".05em", textTransform: "uppercase", color: "#14110a", background: `linear-gradient(180deg,${accHi},${acc})`, border: 0, borderRadius: 9, padding: "14px 30px", cursor: "pointer" }}>{data.beginLabel}</button>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".12em", color: "#5E6874", marginTop: 8, textTransform: "uppercase" }}>— {data.commander.signoff}</div>
          </div>
        </div>

      </div>
    </main>
  );
}
