"use client";

/**
 * Landing hero intro video, terminal-framed. Autoplays MUTED on entry
 * (the only autoplay browsers allow), unmutes on the visitor's first
 * gesture anywhere, plays twice, then holds on a REPLAY button. Tapping
 * the video or the button re-plays with sound. Mirrors the Cyber Heroes
 * hero-video pattern. Reduced-motion: no autoplay, tap to play.
 */

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { MONO, T } from "@/app/explorers/engine/tokens";

const SRC = "/explorers/scene-save-the-day.mp4";
const G = "#3BF57E";

export function IntroVideo({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const plays = useRef(0);
  const manual = useRef(false);
  const [ended, setEnded] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced) {
      setEnded(true); // show the play button instead of autoplaying
      return;
    }
    v.muted = true;
    v.play().catch(() => {});
    const unmute = () => {
      const vid = ref.current;
      if (vid && !manual.current) {
        vid.muted = false;
        setMuted(false);
        if (vid.paused) vid.play().catch(() => {});
      }
      window.removeEventListener("pointerdown", unmute);
      window.removeEventListener("keydown", unmute);
    };
    window.addEventListener("pointerdown", unmute);
    window.addEventListener("keydown", unmute);
    return () => {
      window.removeEventListener("pointerdown", unmute);
      window.removeEventListener("keydown", unmute);
    };
  }, [reduced]);

  const onEnded = () => {
    const v = ref.current;
    if (!manual.current && plays.current === 0) {
      plays.current = 1;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    } else {
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
      setEnded(true);
    }
  };

  const replay = () => {
    const v = ref.current;
    if (!v) return;
    manual.current = true;
    v.muted = false;
    setMuted(false);
    v.currentTime = 0;
    setEnded(false);
    v.play().catch(() => {});
  };

  const toggleMute = (e: MouseEvent) => {
    e.stopPropagation();
    const v = ref.current;
    if (!v) return;
    manual.current = true;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };

  return (
    <div style={{ border: `1px solid ${G}44`, borderRadius: 8, overflow: "hidden", background: "rgba(6,14,10,0.72)", boxShadow: `0 0 30px ${G}22` }}>
      {/* terminal titlebar */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderBottom: `1px solid ${G}22`, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em", color: T.textSecondary }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff5f56" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#ffbd2e" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#27c93f" }} />
        <span style={{ marginLeft: 8, color: G }}>RECRUITMENT</span>
        <span style={{ color: T.textDisabled }}>// ARC SECURE FEED</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, color: "#ff5f56" }}>
          <span className="cx-wave" style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff5f56" }} />LIVE
        </span>
      </div>

      {/* video */}
      <div style={{ position: "relative", cursor: ended ? "pointer" : "default", background: "#000" }} onClick={ended ? replay : undefined}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video
          ref={ref}
          src={SRC}
          playsInline
          muted
          preload="auto"
          onEnded={onEnded}
          style={{ width: "100%", display: "block", aspectRatio: "16 / 10", objectFit: "cover" }}
        />

        {/* replay overlay */}
        {ended && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(4,8,6,0.55)" }}>
            <span style={{ width: 64, height: 64, borderRadius: "50%", border: `2px solid ${G}`, background: "rgba(0,0,0,0.5)", color: G, fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 18px ${G}66` }}>▶</span>
            <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: G }}>REPLAY WITH SOUND</span>
          </div>
        )}

        {/* mute toggle */}
        {!ended && (
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            style={{ position: "absolute", bottom: 10, right: 10, fontFamily: MONO, fontSize: 10, letterSpacing: "0.08em", color: muted ? T.textSecondary : G, background: "rgba(0,0,0,0.55)", border: `1px solid ${muted ? T.hairline : G}`, borderRadius: 3, padding: "5px 9px", cursor: "pointer" }}
          >
            {muted ? "🔇 TAP FOR SOUND" : "🔊 SOUND ON"}
          </button>
        )}
      </div>
    </div>
  );
}
