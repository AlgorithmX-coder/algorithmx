"use client";

/**
 * WeekIntroScene — a warm "mission commander" briefing that plays right after
 * the intro video, one per week. Narrated by ATLAS, a steady man's voice
 * (ElevenLabs "Daniel"), distinct from Sarah the in-lesson coach.
 *
 * Built for ages 6–9: big friendly title, ATLAS auto-plays a short welcome
 * (play/pause + waveform), three picture-chips of what's coming, and a big
 * "Let's go!" button. The button stays gently locked ("Listen…") until ATLAS
 * finishes, so children hear the briefing — matching the narration-lock rule
 * used elsewhere in the lessons — with a safety timeout so nobody is stuck.
 *
 * Each week sits on its own live-moving WeekIntroBackdrop (a distinct motion
 * per week, coloured from WEEK_THEMES) inside a HUD frame, so every briefing
 * looks like its own futuristic "world" while the layout stays identical.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import PixIcon from "@/app/components/lesson/PixIcon";
import WeekIntroBackdrop from "@/app/components/lesson/WeekIntroBackdrop";
import { WEEK_THEMES } from "@/app/lesson/weekContent/weekThemes";

interface WeekIntroSceneProps {
  title: string;
  tagline: string;
  audioSrc: string;
  accent?: string;
  points?: { icon: string; label: string }[];
  commanderName?: string;
  /** Drives the per-week live backdrop + themed base gradient. */
  weekNumber?: number;
  onBegin: () => void;
}

// A safety net: if the audio never loads/ends (blocked autoplay + no tap,
// network, etc.), unlock "Let's go!" after this long so a child is never stuck.
const UNLOCK_SAFETY_MS = 30000;

// One L-shaped HUD corner bracket for the briefing frame.
function HudBracket({ pos, accent }: { pos: "tl" | "tr" | "bl" | "br"; accent: string }) {
  const v: React.CSSProperties = { position: "absolute", width: 34, height: 34, pointerEvents: "none", zIndex: 2 };
  const bt = `2px solid ${accent}66`;
  if (pos === "tl") Object.assign(v, { top: 16, left: 16, borderTop: bt, borderLeft: bt, borderTopLeftRadius: 8 });
  if (pos === "tr") Object.assign(v, { top: 16, right: 16, borderTop: bt, borderRight: bt, borderTopRightRadius: 8 });
  if (pos === "bl") Object.assign(v, { bottom: 16, left: 16, borderBottom: bt, borderLeft: bt, borderBottomLeftRadius: 8 });
  if (pos === "br") Object.assign(v, { bottom: 16, right: 16, borderBottom: bt, borderRight: bt, borderBottomRightRadius: 8 });
  return <span aria-hidden style={v} />;
}

export default function WeekIntroScene({
  title,
  tagline,
  audioSrc,
  accent = "#00e5ff",
  points = [],
  commanderName = "MISSION COMMAND",
  weekNumber = 0,
  onBegin,
}: WeekIntroSceneProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false); // ATLAS finished (or safety fired)
  const [curTime, setCurTime] = useState(0); // drives the waveform (no ref-in-render)
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const theme = WEEK_THEMES[weekNumber];
  const baseBg =
    theme?.bgGradient ??
    "linear-gradient(180deg, #070912 0%, #0d1030 100%)";
  const deepBg = theme?.deepBg ?? "#070912";

  const bars = useMemo(() => Array.from({ length: 20 }), []);
  const barH = (i: number) =>
    playing && !reduce ? 4 + Math.abs(Math.sin(curTime * 3 + i * 0.5)) * 14 : 4;

  // Waveform ticker + lifecycle.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurTime(a.currentTime);
    const onEnd = () => {
      setPlaying(false);
      setHeard(true);
    };
    const onErr = () => setHeard(true); // don't trap kids if audio fails
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnd);
    a.addEventListener("error", onErr);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnd);
      a.removeEventListener("error", onErr);
      a.pause();
    };
  }, []);

  // ATLAS starts on his own. Coming from the video carries a user gesture so
  // play() is allowed; on a fresh deep-link (no gesture yet) autoplay policy
  // blocks it, so we ALSO retry the instant the clip is ready and on the very
  // first interaction of any kind — so he speaks without the child tapping.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let started = false;
    const tryPlay = () => {
      if (started) return;
      a.play()
        .then(() => {
          started = true;
          setPlaying(true);
        })
        .catch(() => {
          /* blocked until a gesture / ready — the listeners below retry */
        });
    };
    tryPlay();
    a.addEventListener("canplay", tryPlay);
    a.addEventListener("loadeddata", tryPlay);
    const events: (keyof WindowEventMap)[] = ["pointerdown", "keydown", "touchstart", "click"];
    const onGesture = () => tryPlay();
    events.forEach((e) => window.addEventListener(e, onGesture, true));
    const safety = window.setTimeout(() => setHeard(true), UNLOCK_SAFETY_MS);
    return () => {
      a.removeEventListener("canplay", tryPlay);
      a.removeEventListener("loadeddata", tryPlay);
      events.forEach((e) => window.removeEventListener(e, onGesture, true));
      window.clearTimeout(safety);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) a.play().then(() => setPlaying(true)).catch(() => {});
    else {
      a.pause();
      setPlaying(false);
    }
  };

  return (
    <div
      style={{
        // Self-sizing (NOT position:absolute) so it has real height inside
        // LessonStage's content-driven wrapper — an absolute inset:0 child
        // there collapses to zero height and renders blank.
        position: "relative",
        width: "100%",
        minHeight: "min(88vh, 820px)",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(18px, 3.2vh, 34px)",
        padding: "clamp(24px, 4vh, 44px) 24px",
        textAlign: "center",
        background: `${baseBg}, ${deepBg}`,
        color: "#eef2ff",
        fontFamily: "inherit",
        overflow: "hidden",
      }}
    >
      {/* live-moving, per-week backdrop */}
      <WeekIntroBackdrop weekNumber={weekNumber} accent={accent} />

      {/* top + bottom vignette so text stays crisp over the motion */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(120% 80% at 50% 42%, transparent 40%, rgba(4,6,16,0.55) 100%)",
        }}
      />

      {/* soft accent aura */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "16%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 660,
          height: 340,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accent}26 0%, transparent 70%)`,
          filter: "blur(26px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <HudBracket pos="tl" accent={accent} />
      <HudBracket pos="tr" accent={accent} />
      <HudBracket pos="bl" accent={accent} />
      <HudBracket pos="br" accent={accent} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 660 }}>
        {/* HUD eyebrow: live dot + mission briefing + week tag */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            color: accent,
            textTransform: "uppercase",
            marginBottom: 14,
            padding: "6px 14px",
            borderRadius: 999,
            border: `1px solid ${accent}33`,
            background: "rgba(0,0,0,0.28)",
            backdropFilter: "blur(4px)",
          }}
        >
          <span
            aria-hidden
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: accent,
              boxShadow: `0 0 10px ${accent}`,
              animation: reduce ? undefined : "wiBlink 1.4s ease-in-out infinite",
            }}
          />
          Mission Briefing
          {weekNumber > 0 && (
            <span style={{ color: "#9aa6c8", letterSpacing: 2 }}>
              {" "}
              · WK {String(weekNumber).padStart(2, "0")}
            </span>
          )}
        </div>

        <h1
          style={{
            fontSize: "clamp(30px, 5.4vw, 54px)",
            fontWeight: 900,
            lineHeight: 1.02,
            margin: "0 0 12px",
            letterSpacing: -0.5,
            textShadow: `0 0 40px ${accent}66`,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "clamp(15px, 2.2vw, 19px)",
            color: "#c2cbf0",
            margin: 0,
            lineHeight: 1.35,
          }}
        >
          {tagline}
        </p>
      </div>

      {/* ATLAS player */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "linear-gradient(180deg, rgba(23,28,54,0.72), rgba(14,18,40,0.72))",
          border: `1px solid ${accent}44`,
          borderLeft: `4px solid ${accent}`,
          borderRadius: 18,
          padding: "14px 20px 14px 14px",
          boxShadow: `0 18px 50px -20px rgba(0,0,0,0.7), 0 0 40px ${accent}18`,
          backdropFilter: "blur(8px)",
        }}
      >
        <button
          type="button"
          onClick={toggle}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={playing ? "Pause the briefing" : "Play the briefing"}
          style={{
            flex: "0 0 auto",
            width: 62,
            height: 62,
            borderRadius: "50%",
            border: `2px solid ${accent}`,
            background: `radial-gradient(circle at 40% 35%, ${accent}33, #0b1230)`,
            color: "#fff",
            fontSize: 22,
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
          }}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>
            {commanderName}
          </div>
          <div style={{ fontSize: 12, color: "#8b95c9", marginTop: 2 }}>
            {playing ? "Speaking…" : heard ? "Briefing complete" : "Tap ▶ to listen"}
          </div>
          <div
            aria-hidden
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              height: 18,
              marginTop: 8,
            }}
          >
            {bars.map((_, i) => (
              <i
                key={i}
                style={{
                  width: 3,
                  height: barH(i),
                  background: playing ? accent : "#3a4577",
                  borderRadius: 2,
                  display: "block",
                  transition: "height .1s",
                }}
              />
            ))}
          </div>
        </div>
        <audio ref={audioRef} preload="auto" autoPlay src={audioSrc} />
      </div>

      {/* what we'll do — picture chips */}
      {points.length > 0 && (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
            maxWidth: 640,
          }}
        >
          {points.slice(0, 3).map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                background: "rgba(18,22,48,0.66)",
                border: `1px solid ${accent}33`,
                borderRadius: 999,
                padding: "8px 16px 8px 10px",
                fontSize: 14,
                fontWeight: 700,
                color: "#e6ebff",
                backdropFilter: "blur(6px)",
              }}
            >
              <PixIcon emoji={p.icon} size={26} />
              {p.label}
            </div>
          ))}
        </div>
      )}

      {/* Let's go! — gently locked until ATLAS finishes */}
      <button
        type="button"
        onClick={heard ? onBegin : undefined}
        aria-disabled={!heard}
        style={{
          position: "relative",
          zIndex: 1,
          fontSize: 20,
          fontWeight: 900,
          letterSpacing: 0.5,
          color: heard ? "#04122a" : "#8b95c9",
          background: heard
            ? `linear-gradient(180deg, ${accent}, ${accent}cc)`
            : "rgba(20,26,54,0.9)",
          border: heard ? "none" : `1px solid ${accent}33`,
          borderRadius: 16,
          padding: "16px 40px",
          cursor: heard ? "pointer" : "default",
          boxShadow: heard ? `0 12px 30px -10px ${accent}` : "none",
          transition: "all .3s ease",
        }}
      >
        {heard ? "Let's go! →" : "🔊 Listen…"}
      </button>

      <style>{`@keyframes wiBlink { 0%,100% { opacity: 1 } 50% { opacity: 0.25 } }`}</style>
    </div>
  );
}
