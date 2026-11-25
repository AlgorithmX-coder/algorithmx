"use client";

import { useEffect, useRef, useState } from "react";
import { AXE } from "./content";
import { reduced } from "./fx";

/* The hero object: the real recruitment trailer inside a holographic glass
 * frame (lit rim, corner marks, a scan band every 6 s) under the live
 * frame's title bar (traffic lights, RECRUITMENT and // ARC SECURE FEED
 * typing in with a cursor, LIVE with the pulsing red bar).
 *
 * The video behaviour is the live IntroVideo's, kept to the letter (OWNER
 * RULE: every redesign keeps the hero video playing with the live rules):
 * autoplays MUTED (the only autoplay browsers allow) and unmutes on the
 * visitor's first STRONG gesture anywhere on the page (pointerdown, keydown,
 * touchstart; a move or scroll cannot lift the block and trying used to
 * freeze the video). If the unmuted play is refused it falls back to muted
 * so the trailer keeps playing (captions are burned in). No mute button, no
 * controls. Plays once, then pauses on frame 0 under the PLAY overlay; a
 * click replays with sound. Reduced motion: no autoplay, tap to play. */

const V = AXE.hero.video, TB = V.titlebar;
const EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

export default function HoloFrame() {
  const ref = useRef<HTMLVideoElement | null>(null);
  const manual = useRef(false);
  const endedRef = useRef(false);
  const [ended, setEndedState] = useState(false);
  const setEnded = (v: boolean) => { endedRef.current = v; setEndedState(v); };
  const [typed, setTyped] = useState<{ a: string; b: string; cur: boolean }>({ a: "", b: "", cur: true });

  /* the title bar types in from the content strings */
  useEffect(() => {
    const s1 = TB.label, s2 = TB.sub;
    let i = 0, j = 0, t = 0;
    if (reduced()) { t = window.setTimeout(() => setTyped({ a: s1, b: s2, cur: false }), 0); return () => window.clearTimeout(t); }
    const t2 = () => { if (j <= s2.length) { setTyped({ a: s1, b: s2.slice(0, j++), cur: true }); t = window.setTimeout(t2, 34); } else t = window.setTimeout(() => setTyped({ a: s1, b: s2, cur: false }), 1400); };
    const t1 = () => { if (i <= s1.length) { setTyped({ a: s1.slice(0, i++), b: "", cur: true }); t = window.setTimeout(t1, 46); } else t = window.setTimeout(t2, 260); };
    t = window.setTimeout(t1, 900);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (reduced()) {
      // show the play button instead of autoplaying
      const id = window.setTimeout(() => setEnded(true), 0);
      return () => window.clearTimeout(id);
    }
    v.muted = true;
    // If the browser blocks even muted autoplay, surface a play button
    // (otherwise there is no affordance to start it).
    v.play().catch(() => setEnded(true));
    let soundOn = false;
    const remove = () => EVENTS.forEach((e) => window.removeEventListener(e, unmute));
    const unmute = () => {
      const vid = ref.current;
      if (!vid || manual.current || soundOn) { remove(); return; }
      if (endedRef.current) return; // holding on PLAY: the click itself replays with sound
      vid.muted = false;
      vid.play().then(() => { soundOn = true; remove(); }).catch(() => {
        vid.muted = true;
        vid.play().catch(() => {});
      });
    };
    EVENTS.forEach((e) => window.addEventListener(e, unmute, { passive: true }));
    return remove;
  }, []);

  const onEnded = () => {
    // The trailer plays once, then holds on a replay button.
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
    v.play().catch((err: unknown) => {
      if (err && typeof err === "object" && (err as { name?: string }).name === "NotAllowedError") v.muted = true;
      v.play().catch(() => {});
    });
  };

  return (
    <div className="stage">
      <div className="holo">
        <span className="scan" aria-hidden="true" />
        <span className="corner tl" aria-hidden="true" /><span className="corner tr" aria-hidden="true" /><span className="corner bl" aria-hidden="true" /><span className="corner br" aria-hidden="true" />
        <div className="hbar">
          <span className="dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="lab"><b>{typed.a}</b><span>{typed.b}</span>{typed.cur && <span className="cur" aria-hidden="true" />}</span>
          <span className="live"><i className="wave" aria-hidden="true" />{TB.live}</span>
        </div>
        <div className={`vwrap${ended ? " ended" : ""}`} onClick={ended ? replay : undefined}>
          <video
            ref={ref}
            src={V.src}
            poster={V.poster}
            playsInline
            muted
            preload="auto"
            onEnded={onEnded}
            aria-label={V.ariaLabel}
          />
          {ended && (
            <button type="button" className="playov" aria-label={V.replay.label} onClick={(e) => { e.stopPropagation(); replay(); }}>
              <span className="ring"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg></span>
              <span>{V.replay.label}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
