"use client";

/**
 * Starts a faint ambient bed on the /dashboard and fades it out on unmount.
 * A tiny client island so the server-rendered dashboard page can have looping
 * atmosphere without becoming a client component itself - the same trick as
 * PlayHubAmbientOnMount.
 *
 * The track is bgmDashboard, which points at bgm-lesson.mp3 - the music that
 * used to play during the Week-1 lesson. It sits under a dedicated, faint
 * (0.04) registry key so bringing it back here does NOT re-enable the lesson
 * bed (which was deliberately silenced under the narration voice).
 *
 * Mute is honored for free: playBGM routes through Howler, and the app's
 * audioMute store flips Howler's global mute - so entering while muted stays
 * silent, and un-muting brings the bed in. Browsers that block autoplay will
 * start it on the first user interaction (Howler auto-unlocks the context).
 */

import { useEffect } from "react";
import { playBGM, stopBGM } from "@/app/lib/sounds";

export default function PlayDashboardAmbientOnMount() {
  useEffect(() => {
    playBGM("bgmDashboard");
    return () => {
      stopBGM(600);
    };
  }, []);

  return null;
}
