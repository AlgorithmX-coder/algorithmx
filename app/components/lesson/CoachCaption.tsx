"use client";

/**
 * CoachCaption - a transient, in-exercise "teach-once" coach line.
 *
 * The narrated intro explains the task before play; this reinforces the
 * FIRST action at the moment it matters ("Go on, tap any word to begin!"),
 * then gets out of the way. Per the brief: teach the first rep, don't
 * narrate every tap - so an exercise mounts this once and it auto-dismisses
 * after a short readable dwell (or sooner, when the child acts and the
 * parent stops rendering it).
 *
 * Plays the pre-recorded Sarah line (same manifest pipeline as
 * InfoNarration) when available + auto-read is on; the caption shows
 * regardless, so it's still useful before audio is generated or when muted.
 * Renders as an unobtrusive bottom-center coach toast.
 *
 * NO-SKIP (owner rule: the child must never be able to click while a
 * narrator speaks): while the clip plays, a NarrationClickGuard swallows
 * taps on the whole lesson. `playing` goes true when we commit to play,
 * false on ended / error / pause, with a safety timeout of about the clip's
 * duration (12s until the duration is known) so it can never stick. The
 * guard's own "Listening" pill is hidden - this caption IS the indicator,
 * so it stays on screen for as long as the voice is still sounding.
 */

import { useEffect, useRef, useState } from "react";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import NarrationClickGuard from "@/app/components/lesson/NarrationClickGuard";

const NARRATION_VOLUME = 0.5;
const MANIFEST_URL = "/audio/voice/manifest.json";
/** Guard backstop before the clip's real duration is known. */
const GUARD_FALLBACK_MS = 12000;
/** Air after the reported clip duration before the backstop lifts the guard. */
const GUARD_PAD_MS = 1500;

interface Entry {
  speaker: string;
  text: string;
  file: string;
}
let cache: { entries: Entry[] } | null = null;
let promise: Promise<{ entries: Entry[] } | null> | null = null;
async function loadManifest(): Promise<{ entries: Entry[] } | null> {
  if (cache) return cache;
  if (promise) return promise;
  promise = (async () => {
    try {
      const r = await fetch(MANIFEST_URL, { cache: "no-cache" });
      if (!r.ok) return null;
      cache = (await r.json()) as { entries: Entry[] };
      return cache;
    } catch {
      return null;
    }
  })();
  return promise;
}

function joinKey(lines: string[]): string {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
function stripTags(s: string): string {
  return s.replace(/\[[^\]]*\]/g, "").replace(/\s+/g, " ").trim();
}

export interface CoachCaptionProps {
  lines: string[];
  speaker?: "adam" | "layla";
  /** Change to re-show + re-play (e.g. a step id). Defaults to a one-shot. */
  triggerKey?: string | number;
}

export default function CoachCaption({
  lines,
  speaker = "layla",
  triggerKey,
}: CoachCaptionProps) {
  const [visible, setVisible] = useState(true);
  // True while the recorded line is sounding (or committed to start). Drives
  // the click-guard below.
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!lines || lines.length === 0) return;
    setVisible(true);
    let cancelled = false;
    let safety: number | null = null;

    // Lift the guard (once) on any end-of-voice signal.
    const clearSafety = () => {
      if (safety !== null) {
        window.clearTimeout(safety);
        safety = null;
      }
    };
    const stopGuard = () => {
      clearSafety();
      if (!cancelled) setPlaying(false);
    };
    const armSafety = (ms: number) => {
      clearSafety();
      safety = window.setTimeout(stopGuard, ms);
    };

    if (!isAudioMuted()) {
      void loadManifest().then((m) => {
        if (cancelled || !m) return;
        const key = joinKey(lines);
        const e = m.entries.find((x) => x.speaker === speaker && x.text === key);
        if (!e) return;
        try {
          const el = new Audio(e.file);
          el.volume = NARRATION_VOLUME;
          audioRef.current = el;
          el.addEventListener("ended", stopGuard, { once: true });
          el.addEventListener("error", stopGuard, { once: true });
          // pause = the master mute (or cleanup) cut the line short.
          el.addEventListener("pause", stopGuard);
          // Backstop: tighten to the real clip length once it's known.
          el.addEventListener(
            "loadedmetadata",
            () => {
              if (cancelled) return;
              if (Number.isFinite(el.duration) && el.duration > 0) {
                armSafety(Math.round(el.duration * 1000) + GUARD_PAD_MS);
              }
            },
            { once: true },
          );
          // Guard up NOW (the pre-roll before sound), so a fast tap can't
          // slip through; a rejected play() drops it straight away.
          armSafety(GUARD_FALLBACK_MS);
          setPlaying(true);
          el.play().catch(stopGuard);
        } catch {
          stopGuard();
        }
      });
    }

    // Master mute stops this coach line immediately.
    const unsub = subscribeAudioMute((muted) => {
      if (muted && audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          /* noop */
        }
      }
    });

    // Dwell scales with caption length, capped so it never lingers.
    const caption = stripTags(lines.join(" "));
    const dwell = Math.min(3200 + caption.length * 45, 9000);
    const id = window.setTimeout(() => {
      if (!cancelled) setVisible(false);
    }, dwell);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
      clearSafety();
      unsub();
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch {
          /* noop */
        }
        audioRef.current = null;
      }
      setPlaying(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  if (!lines || lines.length === 0) return null;
  // Stay on screen while the voice is still sounding, even past the dwell:
  // the caption is the speaker indicator (the guard's pill is hidden).
  if (!visible && !playing) return null;
  const caption = lines.map(stripTags).filter(Boolean).join(" ");

  return (
    <>
      <NarrationClickGuard active={playing} hidePill />
      <div
        role="status"
        style={{
          position: "fixed",
          left: "50%",
          bottom: 88,
          transform: "translateX(-50%)",
          zIndex: 60,
          maxWidth: "min(92vw, 520px)",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 18px",
          borderRadius: 999,
          background: "rgba(10, 16, 38, 0.92)",
          border: "1px solid rgba(125, 240, 255, 0.5)",
          boxShadow:
            "0 16px 40px -12px rgba(8,10,22,0.8), 0 0 22px rgba(0,229,255,0.3)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#eaf2ff",
          animation: "coachCaptionIn 0.35s ease-out both",
          pointerEvents: "none",
        }}
      >
        <style>{`@keyframes coachCaptionIn {from{opacity:0;transform:translate(-50%,14px)}to{opacity:1;transform:translate(-50%,0)}}`}</style>
        <span style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>
          <span aria-hidden style={{ marginRight: 6 }}>
            🔊
          </span>
          {caption}
        </span>
      </div>
    </>
  );
}
