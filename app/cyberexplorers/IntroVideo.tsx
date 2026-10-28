"use client";

/**
 * Landing hero intro trailer, terminal-framed. Autoplays MUTED (the only
 * autoplay browsers allow) and unmutes on the visitor's FIRST interaction
 * anywhere on the page (move, click, key, scroll, touch) - so sound comes
 * on within a split second and stays on. No mute button. Plays once, then
 * holds on a replay button. Reduced-motion: no autoplay, tap to play.
 */

import { useEffect, useRef, useState } from "react";
import { MONO, T } from "@/app/explorers/engine/tokens";

const SRC = "/explorers/trailer-cyberexplorers.mp4";
// The brand's own cyan (T.arcCyan) — this frame used a one-off green before,
// the only thing on the hero not matching the rest of the page's identity.
const G = "#34E1FF";

export function IntroVideo({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  const manual = useRef(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced) {
      setEnded(true); // show the play button instead of autoplaying
      return;
    }
    v.muted = true;
    // If the browser blocks even muted autoplay, surface a play button
    // (otherwise there is no affordance to start it).
    v.play().catch(() => setEnded(true));
    // Only STRONG gestures can lift the browser's unmuted-autoplay block; a
    // move or scroll cannot, and trying to unmute on those used to PAUSE the
    // video and leave it frozen. So listen for taps/keys only, and if the
    // unmuted play is still refused, fall back to muted so the trailer keeps
    // playing (captions are burned in) instead of freezing.
    const events = ["pointerdown", "keydown", "touchstart"];
    let soundOn = false;
    const unmute = () => {
      const vid = ref.current;
      if (!vid || manual.current || soundOn) { remove(); return; }
      vid.muted = false;
      vid.play().then(() => { soundOn = true; remove(); }).catch(() => {
        vid.muted = true;
        vid.play().catch(() => {});
      });
    };
    const remove = () => events.forEach((e) => window.removeEventListener(e, unmute));
    events.forEach((e) => window.addEventListener(e, unmute, { passive: true }));
    return remove;
  }, [reduced]);

  const onEnded = () => {
    // A ~45s trailer plays once, then holds on a replay button.
    const v = ref.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setEnded(true);
  };

  const replay = () => {
    const v = ref.current;
    if (!v) return;
    manual.current = true;
    v.muted = false;
    v.currentTime = 0;
    setEnded(false);
    v.play().catch(() => {});
  };

  return (
    <div style={{ position: "relative" }}>
      {/* targeting-ring glow behind the frame — the Signal Room HUD motif
          (the same corner-bracket/concentric-ring language carried through
          the case board and Watchlist) now reaches the marketing hero too */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "120%",
          height: "120%",
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${G}14 0%, transparent 62%)`,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
      <style>{`
        .iv-brk{position:absolute;width:16px;height:16px;z-index:3;pointer-events:none}
        .iv-brk.tl{top:-1px;left:-1px;border-top:2px solid ${G};border-left:2px solid ${G}}
        .iv-brk.tr{top:-1px;right:-1px;border-top:2px solid ${G};border-right:2px solid ${G}}
        .iv-brk.bl{bottom:-1px;left:-1px;border-bottom:2px solid ${G};border-left:2px solid ${G}}
        .iv-brk.br{bottom:-1px;right:-1px;border-bottom:2px solid ${G};border-right:2px solid ${G}}
        .iv-sweep{position:absolute;left:0;right:0;height:90px;top:-90px;z-index:1;pointer-events:none;background:linear-gradient(180deg, ${G}26, transparent);animation:ivSweep 4.2s linear infinite}
        @keyframes ivSweep{from{transform:translateY(0)}to{transform:translateY(340px)}}
        @media (prefers-reduced-motion: reduce){.iv-sweep{animation:none}}
      `}</style>
      <div style={{ position: "relative", border: `1px solid ${G}55`, borderRadius: 8, overflow: "hidden", background: "rgba(6,12,20,0.72)", boxShadow: `0 0 36px ${G}26` }}>
        <span className="iv-brk tl" aria-hidden />
        <span className="iv-brk tr" aria-hidden />
        <span className="iv-brk bl" aria-hidden />
        <span className="iv-brk br" aria-hidden />
        {!reduced && <span className="iv-sweep" aria-hidden />}

        {/* terminal titlebar */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 7, padding: "8px 12px", borderBottom: `1px solid ${G}22`, fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.08em", color: T.textSecondary }}>
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
        <div style={{ position: "relative", zIndex: 2, cursor: ended ? "pointer" : "default", background: "#000" }} onClick={ended ? replay : undefined}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={ref}
            src={SRC}
            poster="/explorers/trailer-poster.jpg"
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
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.1em", color: G }}>PLAY</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
