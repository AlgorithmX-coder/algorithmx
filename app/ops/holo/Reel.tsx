"use client";

import { useEffect, useRef, useState } from "react";
import { AXO } from "./content";

/* The reel: the real Cyber Ops trailer inside the holographic glass frame
 * (lit rim, corner marks, the 6 s scan) under the panel's title bar.
 *
 * The playback rules are the ones the page it replaces shipped, unchanged
 * (OWNER RULE: every redesign keeps the hero video playing):
 * - autoplays MUTED on mount (the only autoplay browsers allow), plays once,
 *   no controls, no loop;
 * - the page's FIRST strong gesture (tap / key / touch) anywhere turns the
 *   sound on; a move or scroll cannot lift the block. If unmuted play is
 *   still refused we fall back to muted so the film keeps PLAYING instead
 *   of freezing on a frame;
 * - after `ended` a Replay button appears over the stage and restarts the
 *   film WITH sound (the click itself is the strong gesture). */
export default function Reel() {
  const reelRef = useRef<HTMLVideoElement | null>(null);
  const [reelDone, setReelDone] = useState(false);
  const M = AXO.hero.media, V = M.video;
  const at = M.titleBar.title.indexOf("@");

  useEffect(() => {
    const v = reelRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
    const evs = ["pointerdown", "keydown", "touchstart"] as const;
    let soundOn = false;
    const unmute = () => {
      const vid = reelRef.current;
      if (!vid || soundOn) { cleanup(); return; }
      vid.muted = false;
      vid.play().then(() => { soundOn = true; cleanup(); }).catch(() => {
        vid.muted = true;
        vid.play().catch(() => {});
      });
    };
    const cleanup = () => evs.forEach((e) => window.removeEventListener(e, unmute));
    evs.forEach((e) => window.addEventListener(e, unmute, { passive: true }));
    return cleanup;
  }, []);

  return (
    <div className="stage">
      <div className="holo">
        <span className="scan" aria-hidden="true" />
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        <div className="hbar">
          <span className="dots"><i /><i /><i /></span>
          <span className="lab"><b>{M.titleBar.title.slice(0, at)}</b>{M.titleBar.title.slice(at)}</span>
          <span className="badge">{M.titleBar.badge}</span>
        </div>
        <div className="vwrap">
          <video
            ref={reelRef}
            src={V.src}
            poster={V.poster}
            playsInline
            muted
            preload="auto"
            aria-label={V.ariaLabel}
            onEnded={() => setReelDone(true)}
          />
          {reelDone && (
            <button
              type="button"
              className="replay"
              onClick={() => {
                const v = reelRef.current;
                if (!v) return;
                v.currentTime = 0;
                v.muted = false;
                setReelDone(false);
                v.play().catch(() => {});
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              {V.replayLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
