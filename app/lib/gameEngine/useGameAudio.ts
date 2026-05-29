"use client";

/**
 * Typed audio facade for exercises and the boss.
 *
 * Replaces scattered `playSound("foo")` string literals across the
 * codebase with a single typed surface: `audio.correct()`,
 * `audio.wrong()`, etc. Sound names live here, not at call sites, so
 * a future audiosprite migration is a 1-file change.
 *
 * Also debounces hover to ~120ms (matches GameButton's existing
 * behaviour) and centralises the "use softWrong for kid-friendly
 * exercises" rule so we don't keep regressing to the sharp buzzer.
 *
 * Volume is intentionally NOT comfort-mode aware here - that lives in
 * SoundManager's category scaling. This module is about events.
 */

import { useMemo } from "react";
import { playSound, stopBGM, playBGM } from "@/app/lib/sounds";
import { playSoftWrong, playBossHit, playVictoryStinger, playDefeatStinger } from "@/app/lib/gameEngine/audio";

let lastHoverAt = 0;
const HOVER_DEBOUNCE_MS = 120;

export interface GameAudio {
  // UI
  hover: () => void;
  tap: () => void;
  transition: () => void;
  back: () => void;
  select: () => void;
  // Feedback (kid-friendly defaults)
  correct: () => void;
  wrong: () => void;                 // soft variant
  hardWrong: () => void;             // sharp variant (only for danger contexts)
  streak: (n: number) => void;
  hint: () => void;
  // Reward
  xpTick: () => void;
  unlock: () => void;
  badgeEarned: () => void;
  levelUp: () => void;
  starEarned: () => void;
  // Boss
  bossHit: () => void;
  bossRoar: () => void;
  bossDefeated: () => void;
  bossPhaseChange: () => void;
  victory: () => void;
  defeat: () => void;
  // BGM
  bgmLesson: () => void;
  bgmBattle: () => void;
  bgmVictory: () => void;
  stopBgm: () => void;
}

/**
 * Stable, memoised game-audio facade. Safe to consume from a hook deps
 * array (the returned object identity is stable across renders for
 * the lifetime of the component).
 */
export function useGameAudio(): GameAudio {
  return useMemo<GameAudio>(
    () => ({
      hover: () => {
        const now = performance.now();
        if (now - lastHoverAt < HOVER_DEBOUNCE_MS) return;
        lastHoverAt = now;
        playSound("hover");
      },
      tap: () => playSound("click"),
      transition: () => playSound("transition"),
      back: () => playSound("back"),
      select: () => playSound("select"),

      // Default `wrong` is the SOFT variant. Use `hardWrong` only when
      // the context legitimately calls for a sharper cue (e.g. boss
      // taking heavy damage). The previous default of `playSound("wrong")`
      // was too punishing for ages 6-9 learning exercises.
      correct: () => playSound("correct"),
      wrong: () => playSoftWrong(),
      hardWrong: () => playSound("wrong"),
      streak: (n: number) => {
        if (n >= 7) playSound("streak7");
        else if (n >= 5) playSound("streak5");
        else if (n >= 3) playSound("streak3");
      },
      hint: () => playSound("reveal"),

      xpTick: () => playSound("xpGain"),
      unlock: () => playSound("lock"),
      badgeEarned: () => playSound("badgeEarned"),
      levelUp: () => playSound("levelUp"),
      starEarned: () => playSound("starEarned"),

      bossHit: () => playBossHit(),
      bossRoar: () => playSound("bossRoar"),
      bossDefeated: () => playSound("bossDefeated"),
      bossPhaseChange: () => playSound("phaseChange"),
      victory: () => playVictoryStinger(),
      defeat: () => playDefeatStinger(),

      bgmLesson: () => playBGM("bgmLesson"),
      bgmBattle: () => playBGM("bgmBattle"),
      bgmVictory: () => playBGM("bgmVictory"),
      stopBgm: () => stopBGM(),
    }),
    []
  );
}
