"use client";

import { useCallback, useEffect, useState } from "react";
import { SoundManager } from "@/app/lib/sounds";

export function useSound() {
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return SoundManager.getInstance().isMuted();
  });

  // Preload SFX once on first mount of any consumer
  useEffect(() => {
    const mgr = SoundManager.getInstance();
    mgr.preloadSFX();
    // Keep local state in sync if another consumer flipped it
    setMuted(mgr.isMuted());
  }, []);

  const play = useCallback((key: string) => {
    SoundManager.getInstance().play(key);
  }, []);

  const playVoice = useCallback((path: string): Promise<void> => {
    return SoundManager.getInstance().playVoice(path);
  }, []);

  const playBGM = useCallback((track: string) => {
    SoundManager.getInstance().playBGM(track);
  }, []);

  const stopBGM = useCallback((fadeOut?: number) => {
    SoundManager.getInstance().stopBGM(fadeOut);
  }, []);

  const toggleMute = useCallback(() => {
    const mgr = SoundManager.getInstance();
    const next = !mgr.isMuted();
    mgr.setMuted(next);
    setMuted(next);
  }, []);

  return { play, playVoice, playBGM, stopBGM, muted, toggleMute };
}

// Alias for consumers that expect this name
export const useSoundManager = useSound;
