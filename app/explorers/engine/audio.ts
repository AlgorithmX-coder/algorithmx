"use client";

/**
 * The Signal Room UI audio family — restrained and mechanical
 * (art doc §9): latch clicks, relay switches, the stamp thunk.
 * Success is pitched confident, not celebratory; errors are a dull
 * thud, never a buzzer. Tiny WebAudio synths for the slice; real
 * assets route through SoundManager later (never raw `new Audio()` —
 * the Heroes lesson).
 */

import { useCallback, useMemo, useRef } from "react";
import type { SignalAudio } from "./types";

/*
 * WREN voice player. Deliberately self-implements the two rules that
 * make raw `new Audio()` safe here (the documented Heroes trap):
 * volume is capped at the coach level (0.55) and playback is gated by
 * the caller's voice toggle. A new line always cuts the previous one.
 */
let wrenEl: HTMLAudioElement | null = null;

export function playWren(url: string, enabled: boolean) {
  if (typeof window === "undefined" || !enabled) return;
  try {
    wrenEl?.pause();
    wrenEl = new Audio(url);
    wrenEl.volume = 0.55;
    void wrenEl.play().catch(() => {});
  } catch {
    /* audio unavailable — mission plays silent */
  }
}

export function stopWren() {
  try {
    wrenEl?.pause();
  } catch {}
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
