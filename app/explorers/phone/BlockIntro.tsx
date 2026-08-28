"use client";

/**
 * BLOCK INTRO — one comprehensive briefing screen per block, spoken by ATLAS
 * (ARC Command; a man's voice, not WREN). Data-driven and THEMED per block
 * (accent = the block's classification colour; code-rain tinted to match), so
 * each of the four block openings matches its block's world. Self-contained
 * styling. The ATLAS voice plays from a dedicated <audio> (not the WREN engine).
 */

import { useEffect, useRef, useState } from "react";
import { MatrixRain } from "../MatrixRain";
import type { BlockIntroData } from "./blockIntroData";

const DISP = `"Oswald", "Arial Narrow", "Segoe UI", sans-serif`;
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;
const BODY = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
.bi{ --ground:#0A0C10; --panel:#12161C; --panel2:#171C24; --edge:#232B36; --ink:#ECEFF3; --dim:#9BA6B2; --faint:#5E6874; }
.bi *{ box-sizing:border-box }
.bi ::selection{ background:var(--acc); color:#0b0b0b }
.bi .disp{ font-family:${DISP}; font-weight:600; text-transform:uppercase }
.bi .playbtn{ transition:transform .12s, box-shadow .2s }
.bi .playbtn:hover{ transform:scale(1.05); box-shadow:0 0 24px rgba(var(--accRGB),.4) }
.bi .playbtn:focus-visible{ outline:2px solid var(--acc); outline-offset:3px }
.bi .cta:hover{ filter:brightness(1.08) }
.bi .cta:focus-visible{ outline:2px solid var(--ink); outline-offset:2px }
.bi .file{ transition:border-color .2s, transform .12s }
.bi .file:hover{ transform:translateY(-2px) }
@keyframes bi-pulse{ 0%,100%{opacity:1} 50%{opacity:.45} }
.bi .dot{ animation:bi-pulse 1.6s infinite }
@media (prefers-reduced-motion: reduce){ .bi *{ animation:none !important; transition:none !important } }
`;

export default function BlockIntro({ data, onBegin }: { data: BlockIntroData; onBegin: () => void }) {
  const t = data.theme;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [label, setLabel] = useState("Play the briefing");
  const [tick, setTick] = useState(0);
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const fmt = (s: number) => { s = Math.max(0, s | 0); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };

  useEffect(() => {
    const a = audioRef.current; if (!a) return;
    const onMeta = () => setLabel(`Play the briefing · ${fmt(a.duration)}`);
    const onTime = () => { setTick((n) => n + 1); if (a.duration) setLabel(`${data.commander.name} speaking · ${fmt(a.currentTime)} / ${fmt(a.duration)}`); };
    const onEnd = () => { setPlaying(false); setLabel("Replay the briefing"); };
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    return () => { a.removeEventListener("loadedmetadata", onMeta); a.removeEventListener("timeupdate", onTime); a.removeEventListener("ended", onEnd); a.pause(); };
  }, [data.commander.name]);

  const toggle = () => { const a = audioRef.current; if (!a) return; if (a.paused) { a.play().then(() => setPlaying(true)).catch(() => {}); } else { a.pause(); setPlaying(false); } };

  const bars = Array.from({ length: 26 });
  const barH = (i: number) => {
    const ct = audioRef.current?.currentTime ?? 0;
    return playing && !reduce ? 4 + Math.abs(Math.sin(ct * 3 + i * 0.5)) * 15 : 5;
  };

  return (
    <main
      className="bi"
      style={{
        // theme vars
        ["--acc" as string]: t.accent, ["--acc-hi" as string]: t.accentHi, ["--accRGB" as string]: t.accentRGB,
        minHeight: "100vh", background: "radial-gradient(1200px 600px at 50% -8%, #1a2230 0%, rgba(26,34,48,0) 58%), #0A0C10",
        color: "var(--ink)", fontFamily: BODY, lineHeight: 1.62, position: "relative", overflowX: "hidden",
      }}
    >
      <style>{CSS}</style>
      <MatrixRain reduced={!!reduce} opacity={0.1} colors={t.matrix} head={t.accentHi} />
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* classification band */}
        <div style={{ position: "sticky", top: 0, zIndex: 30, background: "linear-gradient(180deg,#0c0e12,#0a0c10)", borderBottom: "1px solid var(--edge)", fontFamily: MONO, fontSize: 11, letterSpacing: ".22em", color: "var(--dim)", textTransform: "uppercase" }}>
          <Wrap style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 38, gap: 12 }}>
            <span style={{ color: t.accent, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 7 }}>
              <span className="dot" style={{ width: 8, height: 8, background: t.accent, borderRadius: "50%", boxShadow: `0 0 8px ${t.accent}`, display: "block" }} />
              {t.classification}
            </span>
            <span style={{ color: "var(--faint)" }}>{data.commander.org} · CLEARANCE UPGRADE</span>
          </Wrap>
        </div>

        {/* hero */}
        <header style={{ padding: "60px 0 38px" }}>
          <Wrap>
            <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".34em", color: t.accent, textTransform: "uppercase", margin: "0 0 14px" }}>Mission briefing · authorized: Agent</p>
            <div className="disp" style={{ fontWeight: 700, fontSize: 15, letterSpacing: ".5em", color: "var(--dim)", marginBottom: 2 }}>{data.block}</div>
            <h1 className="disp" style={{ fontSize: "clamp(46px, 9vw, 100px)", lineHeight: 0.92, margin: "0 0 18px", textWrap: "balance", background: "linear-gradient(180deg,#fff 0%, #cdd4dc 60%, #97a1ac 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {data.title.map((l, i) => <span key={i} style={{ display: "block" }}>{l}</span>)}
            </h1>
            <p style={{ fontSize: "clamp(17px,2.4vw,21px)", color: "var(--dim)", maxWidth: "52ch", margin: 0 }} dangerouslySetInnerHTML={{ __html: data.thesis }} />

            {/* ATLAS voice player */}
            <div style={{ marginTop: 32, display: "flex", alignItems: "center", gap: 18, background: "linear-gradient(180deg,var(--panel2),var(--panel))", border: "1px solid var(--edge)", borderLeft: `3px solid ${t.accent}`, borderRadius: 12, padding: "16px 20px", maxWidth: 560, boxShadow: playing ? `0 0 22px rgba(${t.accentRGB},.28)` : "none" }}>
              <button className="playbtn" onClick={toggle} aria-label={playing ? "Pause the briefing" : "Play the briefing"}
                style={{ flex: "0 0 auto", width: 56, height: 56, borderRadius: "50%", border: `1px solid ${t.accent}`, background: `radial-gradient(circle at 40% 35%, rgba(${t.accentRGB},.22), #14110a)`, color: t.accentHi, fontSize: 20, display: "grid", placeItems: "center", cursor: "pointer" }}>
                {playing ? "❚❚" : "▶"}
              </button>
              <div style={{ minWidth: 0 }}>
                <div className="disp" style={{ fontWeight: 600, fontSize: 16, letterSpacing: ".06em", color: "var(--ink)" }}>
                  {data.commander.name} <span style={{ color: t.accent, fontSize: 11, fontFamily: MONO, letterSpacing: ".16em", marginLeft: 8 }}>{data.commander.org}</span>
                </div>
                <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 1 }}>{label}</div>
                <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 3, height: 22, marginTop: 8 }}>
                  {bars.map((_, i) => <i key={i} style={{ width: 3, height: barH(i), background: playing ? t.accent : "#7C8CA0", borderRadius: 2, display: "block", transition: "height .1s" }} data-k={tick} />)}
                </div>
              </div>
            </div>
            <audio ref={audioRef} preload="auto" src={data.audio} />
          </Wrap>
        </header>

        {/* the shift */}
        <Section>
          <p style={kicker(t.accent)}>{data.shift.kicker}</p>
          <p className="disp" style={{ fontSize: "clamp(24px,4.4vw,38px)", fontWeight: 600, lineHeight: 1.08, margin: "0 0 14px", textWrap: "balance", color: "var(--ink)", textTransform: "none" }} dangerouslySetInnerHTML={{ __html: emHtml(data.shift.lede, t.accent) }} />
          <p style={{ color: "var(--dim)", maxWidth: "64ch", margin: 0 }} dangerouslySetInnerHTML={{ __html: data.shift.body }} />
        </Section>

        {/* dossier */}
        <Section>
          <p style={kicker(t.accent)}>{data.filesKicker}</p>
          <p className="disp" style={{ fontSize: "clamp(24px,4.4vw,38px)", fontWeight: 600, margin: "0 0 20px", color: "var(--ink)", textTransform: "none" }}>The dossier</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }} className="bi-files">
            {data.files.map((f) => (
              <div key={f.caseNo} className="file" style={{ background: "linear-gradient(180deg,var(--panel2),var(--panel))", border: "1px solid var(--edge)", borderRadius: 10, padding: "18px 18px 16px", position: "relative", overflow: "hidden" }}>
                <span style={{ position: "absolute", inset: "0 auto 0 0", width: 3, background: `rgba(${t.accentRGB},.55)`, display: "block" }} />
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".14em", color: "var(--faint)" }}>{f.caseNo}</div>
                <div style={{ display: "inline-block", fontFamily: MONO, fontSize: 10.5, letterSpacing: ".12em", color: t.accent, border: `1px solid rgba(${t.accentRGB},.5)`, borderRadius: 4, padding: "1px 7px", margin: "8px 0 6px" }}>{f.codename}</div>
                <h3 className="disp" style={{ fontSize: 22, margin: "0 0 6px", color: "var(--ink)", fontWeight: 600, textTransform: "none" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "var(--dim)", margin: 0 }}>{f.blurb}</p>
              </div>
            ))}
            <div className="file" style={{ display: "grid", placeItems: "center", textAlign: "center", border: "1px dashed var(--edge)", borderRadius: 10, padding: 18 }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".16em", color: t.accent }}>CEREMONY</div>
                <div className="disp" style={{ fontSize: 19, marginTop: 6, color: "var(--ink)", textTransform: "none" }}>Clear all five</div>
                <p style={{ fontSize: 13, color: "var(--dim)", margin: "4px 0 0" }}>{data.ceremony.replace("Clear all five and ", "and ")}</p>
              </div>
            </div>
          </div>
        </Section>

        {/* skills */}
        <Section>
          <p style={kicker(t.accent)}>By the end of this block</p>
          <p className="disp" style={{ fontSize: "clamp(24px,4.4vw,38px)", fontWeight: 600, margin: "0 0 18px", color: "var(--ink)", textTransform: "none" }}>You'll walk away able to…</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "var(--edge)", border: "1px solid var(--edge)", borderRadius: 10, overflow: "hidden" }}>
            {data.skills.map((s) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--panel)", padding: "14px 18px", flexWrap: "wrap" }}>
                <span style={{ flex: "0 0 auto", width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${t.accent}`, color: t.accent, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700 }}>✓</span>
                <b className="disp" style={{ fontWeight: 600, letterSpacing: ".03em", color: "var(--ink)", fontSize: 16, textTransform: "none" }}>{s.name}</b>
                <span style={{ color: "var(--dim)", fontSize: 14 }}>{s.desc}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* handoff */}
        <Section last>
          <div style={{ background: "linear-gradient(180deg,var(--panel2),var(--panel))", border: "1px solid var(--edge)", borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
            <p className="disp" style={{ fontWeight: 600, fontSize: "clamp(22px,4vw,30px)", color: "var(--ink)", margin: "0 0 8px", textTransform: "none" }} dangerouslySetInnerHTML={{ __html: emHtml(data.handoff, t.accent) }} />
            <button className="cta" onClick={onBegin} style={{ display: "inline-flex", alignItems: "center", gap: 9, marginTop: 18, fontFamily: DISP, fontWeight: 600, fontSize: 16, letterSpacing: ".05em", textTransform: "uppercase", color: "#14110a", background: `linear-gradient(180deg,${t.accentHi},${t.accent})`, border: 0, borderRadius: 8, padding: "13px 28px", cursor: "pointer" }}>{data.beginLabel}</button>
            <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".16em", color: "var(--faint)", marginTop: 16, textTransform: "uppercase" }}>— {data.commander.signoff}</div>
          </div>
        </Section>
      </div>

      <style>{`@media (max-width:680px){ .bi-files{ grid-template-columns:1fr !important } }`}</style>
    </main>
  );
}

function Wrap({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px", ...style }}>{children}</div>;
}
function Section({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <section style={{ borderTop: "1px solid var(--edge)", padding: last ? "34px 0 60px" : "34px 0" }}><Wrap>{children}</Wrap></section>;
}
function kicker(acc: string): React.CSSProperties {
  return { fontFamily: MONO, fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: acc, margin: "0 0 10px" };
}
function emHtml(s: string, acc: string) {
  return s.replace(/<em>/g, `<em style="color:${acc};font-style:normal">`);
}
