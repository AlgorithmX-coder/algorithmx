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

/* ---- "is WREN speaking" signal, so the UI can lock clicks while she talks.
   (The block films run their own lock — they cover the screen and disable SKIP
   locally while playing — so they don't need this shared signal.) ------------ */
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
/*
 * ONE persistent <audio> element carries every WREN line. Browsers (iOS Safari
 * especially) "bless" the specific element a user gesture first plays, and then
 * only that element is allowed to play programmatically — so a fresh `new Audio()`
 * per line came out silent. Reusing the primed element is what fixes it.
 */
let wrenEl: HTMLAudioElement | null = null;
function getWrenEl(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  if (!wrenEl) wrenEl = new Audio();
  return wrenEl;
}

function clearSafety() {
  if (safetyTimer) { clearTimeout(safetyTimer); safetyTimer = null; }
}

/*
 * Autoplay unlock. Browsers swallow audio until the page has a user gesture they
 * recognise, so WREN's opening line came out silent ("needs a click to activate")
 * while later ones played. On the first pointer/key/touch anywhere we prime the
 * shared element inside that gesture. And if the opening line was already tried
 * and blocked — e.g. a link that lands straight on a narrated screen, before any
 * tap — we replay THAT exact line for real on the priming tap, so the very first
 * line is never lost. This module loads before the first click, so that click is
 * the one that primes it.
 */
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
let audioPrimed = false;
/** A first line blocked before any gesture; replayed for real on the priming tap. */
let pendingFirst: { url: string; enabled: boolean; onEnded?: () => void } | null = null;
function primeAudio() {
  if (audioPrimed || typeof window === "undefined") return;
  audioPrimed = true;
  if (pendingFirst) {
    // The opening line was blocked before this gesture — play it for real now.
    // If the user's tap also advanced the screen, the next line's playWren will
    // supersede this replay, so we never talk over the new screen.
    const p = pendingFirst;
    pendingFirst = null;
    playWren(p.url, p.enabled, p.onEnded);
    return;
  }
  const el = getWrenEl();
  if (!el) return;
  try {
    el.src = SILENT_WAV;
    el.volume = 0;
    void el.play().catch(() => {});
  } catch {}
}
if (typeof window !== "undefined") {
  const onFirstGesture = () => {
    primeAudio();
    window.removeEventListener("pointerdown", onFirstGesture, true);
    window.removeEventListener("touchstart", onFirstGesture, true);
    window.removeEventListener("keydown", onFirstGesture, true);
  };
  window.addEventListener("pointerdown", onFirstGesture, true);
  window.addEventListener("touchstart", onFirstGesture, true);
  window.addEventListener("keydown", onFirstGesture, true);
}

export function playWren(url: string, enabled: boolean, onEnded?: () => void) {
  if (typeof window === "undefined" || !enabled) return;
  const el = getWrenEl();
  if (!el) { setSpeaking(false); return; }
  pendingFirst = null; // a newer line supersedes any blocked opening line
  try {
    el.pause();
    clearSafety();
    el.onended = null;
    el.onerror = null;
    el.onloadedmetadata = null;
    el.src = url;
    el.volume = 0.55;
    setSpeaking(true); // lock the UI while she talks
    const done = () => { setSpeaking(false); clearSafety(); };
    // Narrator-led lessons advance when the clip finishes. `ended` fires only on
    // natural completion, never on pause()/stop, so auto-advance can't double-fire.
    el.onended = () => { done(); onEnded?.(); };
    el.onerror = done;
    // Refine the unlock to the real clip length once known; hard cap as a backstop
    // so a stuck/blocked clip can never leave the UI locked forever.
    el.onloadedmetadata = () => {
      // duration + margin once known; a generous backstop otherwise. Must exceed
      // the longest clip (~24s test intro) so `speaking` never clears mid-clip.
      const ms = Number.isFinite(el.duration) ? el.duration * 1000 + 900 : 60000;
      clearSafety();
      safetyTimer = setTimeout(done, ms);
    };
    safetyTimer = setTimeout(done, 60000);
    void el.play().catch(() => {
      done(); // autoplay blocked -> don't lock
      // Blocked before the first gesture: remember this line so the priming tap
      // can replay it, and the opening line is never lost.
      if (!audioPrimed) pendingFirst = { url, enabled, onEnded };
    });
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

/**
 * WREN's "not quite, look again" nudge on a wrong practice answer. Generic and
 * answer-free, so one small set serves every practice in every case. Rotates
 * variants so it isn't the same line twice, and NEVER interrupts a clip already
 * playing (so rapid wrong taps can't stack or spam it).
 */
const NUDGES = ["/audio/wren/nudge-1.mp3", "/audio/wren/nudge-2.mp3", "/audio/wren/nudge-3.mp3"];
let nudgeIdx = 0;
export function playWrenNudge(enabled: boolean) {
  if (!enabled || speaking) return;
  const url = NUDGES[nudgeIdx % NUDGES.length];
  nudgeIdx += 1;
  playWren(url, true);
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
