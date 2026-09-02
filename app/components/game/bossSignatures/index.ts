import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Per-week BOSS SIGNATURE mechanics — one bespoke, climactic mini-battle
 * unique to a week's showdown (the boss counterpart to the per-week signature
 * mini-games). A boss phase uses `{ kind: "signature", mechanic: "<key>" }`;
 * ShowdownBoss mounts the matching component below inside the fight and passes
 * the standard contract. Add a new one by dropping its component in this folder
 * and registering one line here.
 *
 * The point: every boss fights on its OWN distinctive board instead of
 * reshuffling the shared deflectSort/counterCard/shieldHold mechanics.
 */

export type BossSignatureJudge = (
  key: string,
  wasCorrect: boolean,
  selectedIndex: number,
  correctIndex: number,
  teachOnWrong?: { title: string; explanation: string },
  at?: { x: number; y: number },
) => void;

export interface BossSignatureProps {
  /** Mechanic-specific data authored on the week's signature phase def. */
  config?: Record<string, unknown>;
  /** Week palette accent (hex) for the board's chrome. */
  accent: string;
  /**
   * Report a correct/wrong beat. Feeds the engine's score, combo streak and
   * hit juice exactly like the shared phases (pass the pointer `at` for the
   * floating "+100"/burst to land on the tap).
   */
  judge: BossSignatureJudge;
  /** Call once when the attack is beaten → the weak-point question → gear pop. */
  done: () => void;
  /** Comfort / reduced-motion mode — skip big scale pops and shakes. */
  reduce: boolean;
}

export const BOSS_SIGNATURES: Record<string, ComponentType<BossSignatureProps>> = {
  // Week 4 · Scams — reel in the Bargainster's lures: cut the hooked scams
  // (each hides a tell), let the real mail drift by.
  w4Bargainster: dynamic(() => import("./W4Bargainster"), { ssr: false }),
};
