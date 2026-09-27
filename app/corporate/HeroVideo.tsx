"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The corporate hero's photographic loop: a bank of desks in an ordinary
 * open-plan office, six seconds, no audio, made for this page (owner pick
 * 2026-09-27, "the desk row"). The poster is the same frame, so the still
 * and the first frame of the loop are identical and nothing jumps.
 *
 * Accessibility: a "Pause video" control (WCAG 2.2.2) stops the loop and is
 * remembered across visits; it starts paused under prefers-reduced-motion,
 * where the poster stands in. The loop also stops on hidden tabs, which the
 * browser does for a muted autoplaying video on its own.
 */
const MOTION_KEY = "ax-corporate-motion";

export default function HeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let start = false;
    try {
      const stored = window.localStorage.getItem(MOTION_KEY);
      if (stored === "paused") start = true;
      else if (stored !== "playing" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) start = true;
    } catch {}
    /* set-state in an effect is the point here: the stored choice can only be
       read on the client, and the server render must match the first client
       render (playing). */
    const id = window.setTimeout(() => setPaused(start), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (paused) v.pause();
    else v.play().catch(() => {});
  }, [paused]);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    try {
      window.localStorage.setItem(MOTION_KEY, next ? "paused" : "playing");
    } catch {}
  };

  return (
    <>
      <video
        ref={ref}
        className="corp-hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/corporate/desk-row.jpg"
        aria-hidden
        tabIndex={-1}
      >
        <source src="/corporate/desk-row.mp4" type="video/mp4" />
      </video>
      <button
        type="button"
        className="corp-hero-pause"
        onClick={toggle}
        aria-pressed={paused}
        aria-label={paused ? "Play the background video" : "Pause the background video"}
      >
        <span aria-hidden className="corp-hero-pause-ico">{paused ? "▶" : "❚❚"}</span>
        <span>{paused ? "Play video" : "Pause video"}</span>
      </button>
    </>
  );
}
