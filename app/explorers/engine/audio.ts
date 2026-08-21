"use client";

/**
 * The Signal Room UI audio family — restrained and mechanical
 * (art doc §9): latch clicks, relay switches, the stamp thunk.
 * Success is pitched confident, not celebratory; errors are a dull
 * thud, never a buzzer. Tiny WebAudio synths for the slice; real
 * assets route through SoundManager later (never raw `new Audio()` —
 * the Heroes lesson).
 */

import { useCallback, useMemo, useRef, useSyncExternalStore } from "react";
import type { SignalAudio } from "./types";

/* ---- "is WREN speaking" signal, so the UI can lock clicks while she talks -- */
let speaking = false;
let safetyTimer: ReturnType<typeof setTimeout> | null = null;
const speakListeners = new Set<() => void>();
function setSpeaking(v: boolean) {
  if (speaking === v) return;
  speaking = v;
  speakListeners.forEach((l) => l());
}
export function subscribeSpeaking(l: () => void) {
  speakListeners.add(l);
  return () => { speakListeners.delete(l); };
}
export function isWrenSpeaking() {
  return speaking;
}
/** React hook: true while a WREN line is playing. */
export function useWrenSpeaking() {
  return useSyncExternalStore(subscribeSpeaking, isWrenSpeaking, () => false);
}

/*
 * WREN voice player. Deliberately self-implements the two rules that
 * make raw `new Audio()` safe here (the documented Heroes trap):
 * volume is capped at the coach level (0.55) and playback is gated by
 * the caller's voice toggle. A new line always cuts the previous one.
 */
let wrenEl: HTMLAudioElement | null = null;

function clearSafety() {
  if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
}

export function playWren(url: string, enabled: boolean, onEnded?: () => void) {
  if (typeof window === "undefined" || !enabled) return;
  try {
    wrenEl?.pause();
    clearSafety();
    wrenEl = new Audio(url);
    wrenEl.volume = 0.55;
    setSpeaking(true); // lock the UI while she talks
    const done = () => { setSpeaking(false); clearSafety(); };
    // Narrator-led lessons advance when the clip finishes. `ended` fires only on
    // natural completion, never on pause()/stop, so auto-advance can't double-fire.
    wrenEl.onended = () => { done(); onEnded?.(); };
    wrenEl.onerror = done;
    // Refine the unlock to the real clip length once known; hard cap as a backstop
    // so a stuck/blocked clip can never leave the UI locked forever.
    wrenEl.onloadedmetadata = () => {
      if (!wrenEl) return;
      const ms = Number.isFinite(wrenEl.duration) ? wrenEl.duration * 1000 + 900 : 20000;
      clearSafety();
      safetyTimer = setTimeout(done, ms);
    };
    safetyTimer = setTimeout(done, 20000);
    void wrenEl.play().catch(() => done()); // autoplay blocked -> don't lock
  } catch {
    setSpeaking(false); /* audio unavailable — mission plays silent */
  }
}

export function stopWren() {
  try {
    wrenEl?.pause();
  } catch {}
  clearSafety();
  setSpeaking(false);
}

export function useSignalAudio(): SignalAudio {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensure = () => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      try {
        ctxRef.current = new AudioContext();
      } catch {
        return null;
      }
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  };

  const tone = useCallback(
    (freq: number, dur: number, type: OscillatorType, gain: number, when = 0) => {
      const ctx = ensure();
      if (!ctx) return;
      const t0 = ctx.currentTime + when;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },
    [],
  );

  return useMemo<SignalAudio>(
    () => ({
      click: () => tone(1150, 0.05, "square", 0.025),
      latch: () => {
        tone(660, 0.07, "sine", 0.06);
        tone(880, 0.09, "sine", 0.05, 0.06);
      },
      thud: () => tone(110, 0.09, "sine", 0.08),
      stamp: () => {
        tone(85, 0.13, "sine", 0.11);
        tone(320, 0.04, "square", 0.03, 0.01);
      },
    }),
    [tone],
  );
}
