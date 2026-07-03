"use client";

/**
 * Starts the Cyber HQ ambient bed (bgmHub) on mount and fades it out on
 * unmount. A tiny client island so the server-rendered hub page can have
 * looping music without becoming a client component itself — the same
 * trick as PlaySignatureOnMount.
 *
 * Mute is honored for free: playBGM routes through Howler, and the app's
 * audioMute store flips Howler's global mute — so entering while muted
 * stays silent, and un-muting brings the bed in.
 */

import { useEffect } from "react";
import { playBGM, stopBGM } from "@/app/lib/sounds";

export default function PlayHubAmbientOnMount() {
  useEffect(() => {
    playBGM("bgmHub");
    return () => {
      stopBGM(600);
    };
  }, []);

  return null;
}
