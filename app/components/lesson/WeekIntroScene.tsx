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
 */

import { useEffect, useMemo, useRef, useState } from "react";
import PixIcon from "@/app/components/lesson/PixIcon";

interface WeekIntroSceneProps {
  title: string;
  tagline: string;
  audioSrc: string;
  accent?: string;
  points?: { icon: string; label: string }[];
  commanderName?: string;
  onBegin: () => void;
}

// A safety net: if the audio never loads/ends (blocked autoplay + no tap,
// network, etc.), unlock "Let's go!" after this long so a child is never stuck.
const UNLOCK_SAFETY_MS = 30000;

export default function WeekIntroScene({
  title,
  tagline,
  audioSrc,
  accent = "#00e5ff",
  points = [],
  commanderName = "MISSION COMMAND",
  onBegin,
}: WeekIntroSceneProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(false); // ATLAS finished (or safety fired)
  const [, setTick] = useState(0);
  const reduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const bars = useMemo(() => Array.from({ length: 20 }), []);
  const barH = (i: number) =>
    playing && !reduce
      ? 4 + Math.abs(Math.sin((audioRef.current?.currentTime ?? 0) * 3 + i * 0.5)) * 14
      : 4;

  // Waveform ticker + lifecycle.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setTick((n) => n + 1);
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

  // ATLAS starts straight away. Coming from the video usually carries a user
  // gesture so play() is allowed; if it's blocked, the first tap starts him.
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      a.play().then(() => setPlaying(true)).catch(() => {
        done = false;
      });
    };
    start();
    const onGesture = () => {
      if (a.paused && !heard) start();
      window.removeEventListener("pointerdown", onGesture);
    };
    window.addEventListener("pointerdown", onGesture);
    const safety = window.setTimeout(() => setHeard(true), UNLOCK_SAFETY_MS);
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.clearTimeout(safety);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(18px, 3.2vh, 34px)",
        padding: "24px",
        textAlign: "center",
        background:
          "radial-gradient(900px 500px at 50% -8%, rgba(36,20,66,0.9) 0%, rgba(10,12,32,0) 60%), linear-gradient(180deg, #070912 0%, #0d1030 100%)",
        color: "#eef2ff",
        fontFamily: "inherit",
        overflow: "hidden",
      }}
    >
      {/* soft accent aura */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 620,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(ellipse, ${accent}22 0%, transparent 70%)`,
          filter: "blur(20px)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 640 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 4,
            color: accent,
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          ◇ Mission Briefing ◇
        </div>
        <h1
          style={{
            fontSize: "clamp(30px, 5.4vw, 54px)",
            fontWeight: 900,
            lineHeight: 1.02,
            margin: "0 0 12px",
            letterSpacing: -0.5,
            textShadow: `0 0 34px ${accent}55`,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "clamp(15px, 2.2vw, 19px)",
            color: "#aeb8e8",
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
          background: "linear-gradient(180deg, rgba(23,28,54,0.92), rgba(14,18,40,0.92))",
          border: `1px solid ${accent}44`,
          borderLeft: `4px solid ${accent}`,
          borderRadius: 18,
          padding: "14px 20px 14px 14px",
          boxShadow: `0 18px 50px -20px rgba(0,0,0,0.7), 0 0 40px ${accent}18`,
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
        <audio ref={audioRef} preload="auto" src={audioSrc} />
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
                background: "rgba(18,22,48,0.8)",
                border: `1px solid ${accent}33`,
                borderRadius: 999,
                padding: "8px 16px 8px 10px",
                fontSize: 14,
                fontWeight: 700,
                color: "#e6ebff",
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
    </div>
  );
}
