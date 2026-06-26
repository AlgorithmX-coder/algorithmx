"use client";

/**
 * Master audio mute for the lesson — ONE control for ALL audio.
 *
 * Game sounds run through SoundManager (Howler), but the spoken
 * narration + coach voice use raw <audio>, which bypasses Howler. So a
 * single mute needs to drive both: this store persists the flag, flips
 * SoundManager, and notifies subscribers (the narration players) so the
 * voice stops the instant you mute — and autoplay stays off while muted.
 *
 * Audio plays by DEFAULT (muted = false). The HUD mute button is the
 * single visible control across the whole week.
 */

import { SoundManager } from "@/app/lib/sounds";

// Same key SoundManager persists to, so the two never disagree.
const KEY = "algorithmx-muted";
type Listener = (muted: boolean) => void;
const listeners = new Set<Listener>();

export function isAudioMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function setAudioMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  // SoundManager.setMuted persists to KEY + flips Howler for game sounds.
  try {
    SoundManager.getInstance().setMuted(muted);
  } catch {
    // Fallback persist if the manager isn't ready yet.
    try {
      window.localStorage.setItem(KEY, muted ? "true" : "false");
    } catch {
      /* noop */
    }
  }
  // Notify the voice players (raw <audio>) so they stop / un-gate.
  listeners.forEach((l) => l(muted));
}

export function subscribeAudioMute(cb: Listener): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
