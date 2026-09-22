"use client";

/*
 * MemoryMatch - Pixar 2.5D commercial polish.
 *
 * Game logic preserved (flip two cards, match the pair, mismatched
 * cards flip back, all-matched triggers a wave celebration). Visuals
 * fully redesigned: sunset backdrop with drifting motes (replaces the
 * neural-network SVG), parchment card backs with a golden ribbon
 * seal (replaces the hex-grid + chip glyph), warm paper card fronts
 * tinted by pair colour, design-token typography, polished finish
 * overlay with star pop.
 *
 * Skins (paint only - the clip generator reads the week file, so nothing
 * a skin supplies is ever spoken): "cyber" is the shipped Weeks 1 / 7 look,
 * untouched; "station" is Week 13's Power Station control room - brushed
 * steel wall under a bench lamp, a busbar with charge travelling along it,
 * charge-cell card backs on a riveted rack, and enamel name plates with a
 * colour spine. Third and final outing of the twenty weeks, so it looks
 * like neither of the first two.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
// playSound KEPT for the three sounds with no useGameAudio facade
// equivalent: "pop", "sortCorrect", "confetti". Flagged in report.
import { playSound } from "@/app/lib/sounds";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
// KEPT + FLAGGED: correctAnswerBurst (streak-aware burst not available
// from fx.correct/fx.unlock) and badgeEarnedCelebration (no toolkit
// equivalent). Both intensity-gated below.
import {
  badgeEarnedCelebration,
  correctAnswerBurst,
} from "@/app/lib/celebrations";
import ExerciseIntroBeat from "@/app/components/lesson/ExerciseBeats";
import ExerciseHowTo from "./ExerciseHowTo";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import { COLOR, SHADOW, SPRING } from "@/app/components/scene/tokens";
import HintBubble from "@/app/components/lesson/HintBubble";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";

export interface MemoryPair {
  term: string;
  match: string;
  /** Hex accent. Defaults will pull from a Pixar-warm palette. */
  colour: string;
  /** Sarah's reason on a match ("That's right!" + why). */
  why?: string;
}

export interface MemoryMatchProps {
  pairs?: MemoryPair[];
  /** Visual skin. "cyber" (default) = the shipped Weeks 1 / 7 look, untouched.
   *  "station" = Week 13's Power Station control room: brushed-steel wall,
   *  battery-cell card backs and enamel name plates. Paint only - every word
   *  on the board still comes from the props below. */
  skin?: "cyber" | "station";
  /** Intro copy overrides (defaults keep the Week 1 skin). */
  introTitle?: string;
  introSubtitle?: string;
  introWelcome?: string;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Spoken explanation for the phase-2 "Rebuild From Memory" mini-game. */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Spoken "you're protected" payoff read on the finish overlay (recorded only). */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  /** See CyberScanner.onHintReached. MemoryMatch shows the hint when
   * mismatchCount >= 3, so this fires tier 2 / 3 only. */
  onHintReached?: (tier: 1 | 2 | 3) => void;
}

const DEFAULT_PAIRS: MemoryPair[] = [
  // Pair text simplified for ages 6-9. "2FA" and "dangerous traffic"
  // were too jargon-y; concrete, kid-readable phrases now.
  { term: "Strong Password", match: "Tr0pic4l$unR1se!", colour: "#7eff97" },
  { term: "Phishing", match: "A fake email that wants to trick you", colour: "#ff5fb3" },
  { term: "Two-Step Lock", match: "A second check to prove it's you", colour: "#00e5ff" },
  { term: "Firewall", match: "Stops bad stuff getting in", colour: "#3a7bff" },
  { term: "Digital Footprint", match: "Everything you do online", colour: "#7c5cff" },
  { term: "Private Info", match: "Your name, address, phone", colour: "#ff7a59" },
];

interface Card {
  id: string;
  pairId: number;
  text: string;
  colour: string;
  flipped: boolean;
  matched: boolean;
  waveDelay: number;
}

const STYLES = `
/* Bug 2 fix - decorative keyframes used to bake rotateY(180deg) into
   every frame so the flipped state would survive the shake/pop. That
   meant when one of these animations fired DURING the 0.45s flip
   transition, the animation took over the transform property entirely
   and snapped the card to its (animation-defined) rotateY(180deg) start
   pose, killing the in-flight flip mid-rotation.

   Now the keyframes only animate translate/scale - the rotateY flip
   lives on a SEPARATE inner element, so the two never fight. */
@keyframes mmShake {
  0%,100% { transform: translateX(0); }
  25%  { transform: translateX(-6px); }
  75%  { transform: translateX(6px); }
}
@keyframes mmPop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.12); }
  100% { transform: scale(1); }
}
@keyframes mmWave {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.18); }
}
@keyframes mmBurst {
  0%   { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--dx, 0), var(--dy, -80px)) scale(0.3); }
}
@keyframes mmFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
@keyframes mmSealSpin {
  to { transform: rotate(360deg); }
}
@keyframes mmMoteRise {
  0% { transform: translate(0, 0); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translate(var(--mx, 0), var(--my, -180px)); opacity: 0; }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-memory-match-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  colour: string;
}

export default function MemoryMatch({
  pairs,
  skin = "cyber",
  introTitle,
  introSubtitle,
  introWelcome,
  introNarration,
  threat,
  coachLines,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
}: MemoryMatchProps) {
  useEffect(ensureStyles, []);

  // Week 13's Power Station control room. Paint and layout only: no skin ever
  // supplies a word, because the clip generator reads the week file, not here.
  const isStation = skin === "station";

  const pairList = useMemo(() => pairs ?? DEFAULT_PAIRS, [pairs]);
  // Spoken verdicts (owner 2026-09-12): a match = "That's right!" + the pair's
  // why. A MISMATCH IS SILENT (owner 2026-09-14): turning over two cards that
  // don't pair is how the child gathers information in a memory game, not a
  // wrong answer, so Sarah never comments on it. The board still shakes, buzzes
  // and flips the cards back.
  const verdict = useVerdictVoice();

  const [cards, setCards] = useState<Card[]>(() => buildDeck(pairList));

  const [showIntro, setShowIntro] = useState(true);
  const [memoriseSecs, setMemoriseSecs] = useState<number | null>(null);
  const [flippedIdxs, setFlippedIdxs] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [flipCount, setFlipCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [shakeIdxs, setShakeIdxs] = useState<number[]>([]);
  const [popIdxs, setPopIdxs] = useState<number[]>([]);
  const [waveOn, setWaveOn] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mismatchCount, setMismatchCount] = useState(0);

  // Hint-tier emission. MemoryMatch surfaces the HintBubble after
  // 3 mismatches (tier 2) and escalates at 5+ (tier 3). Tier 1 isn't
  // used here - the mechanic itself is the gentlest feedback already.
  useEffect(() => {
    if (!onHintReached) return;
    if (mismatchCount < 3) return;
    const tier: 1 | 2 | 3 = mismatchCount >= 5 ? 3 : 2;
    onHintReached(tier);
  }, [mismatchCount, onHintReached]);
  // Toolkit hooks. `reduce` preserves the original threshold by
  // mapping comfort/prefersReducedMotion to intensity < 1.
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  /* ─── PHASE B: REBUILD FROM MEMORY ─────────────────────────────
   * After all pairs are matched in Phase A, we don't go straight to
   * the FinishOverlay any more. Instead the kid faces a memory-recall
   * test: every card flips face-down again, a term is shown at the
   * top of the grid, and the kid taps the face-down card they think
   * holds the matching meaning. Cycles through all 6 terms.
   *
   * Same content, completely different mechanic - adds ~60-90s to
   * the screen without being "more questions". */
  type Phase = "playing" | "phase-a-finished" | "memorise" | "rebuild" | "done";
  const [phase, setPhase] = useState<Phase>("playing");
  const [rebuildPromptIdx, setRebuildPromptIdx] = useState(0);
  const [rebuildHits, setRebuildHits] = useState(0);
  const [rebuildAttempts, setRebuildAttempts] = useState(0);
  const rebuildLockRef = useRef(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstIdRef = useRef(0);
  const lockRef = useRef(false);
  const completedRef = useRef(false);
  const pairsFound = matchedPairIds.length;

  const resetExercise = () => {
    setCards(buildDeck(pairList));
    setFlippedIdxs([]);
    setMatchedPairIds([]);
    setFlipCount(0);
    setElapsedMs(0);
    setStreak(0);
    setBestStreak(0);
    setBursts([]);
    setShakeIdxs([]);
    setPopIdxs([]);
    setWaveOn(false);
    setFinished(false);
    setPhase("playing");
    setRebuildPromptIdx(0);
    setRebuildHits(0);
    setRebuildAttempts(0);
    rebuildLockRef.current = false;
    lockRef.current = false;
    completedRef.current = false;
    startTimeRef.current = performance.now();
    setShowIntro(true);
  };

  // Timer
  useEffect(() => {
    startTimeRef.current = performance.now();
    timerRef.current = window.setInterval(() => {
      setElapsedMs(performance.now() - startTimeRef.current);
    }, 200) as unknown as ReturnType<typeof setInterval>;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (finished && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [finished]);

  const flip = (idx: number) => {
    if (lockRef.current) return;
    if (showIntro) return;
    const c = cards[idx];
    if (!c || c.flipped || c.matched || finished) return;
    playSound("cardFlip");
    setFlipCount((n) => n + 1);
    setCards((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], flipped: true };
      return next;
    });
    // Pure updater: just record the flip. Resolving the pair (which fires
    // onCorrect/onWrong -> parent state) happens in the effect below, never
    // inside this updater (React runs updaters during render).
    setFlippedIdxs((prev) => [...prev, idx]);
  };

  const addBurst = (idx: number, colour: string) => {
    const el = document.querySelector<HTMLDivElement>(
      `[data-mm-card="${idx}"]`
    );
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const parent = el.closest<HTMLDivElement>("[data-mm-root]");
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const x = cx - pr.left;
    const y = cy - pr.top;
    const add: Burst[] = [];
    for (let i = 0; i < 8; i++) {
      add.push({ id: ++burstIdRef.current, x, y, colour });
    }
    setBursts((prev) => [...prev, ...add]);
    window.setTimeout(() => {
      const ids = new Set(add.map((b) => b.id));
      setBursts((prev) => prev.filter((b) => !ids.has(b.id)));
    }, 1100);
  };

  const checkMatch = (aIdx: number, bIdx: number) => {
    const a = cards[aIdx];
    const b = cards[bIdx];
    if (!a || !b) return;
    lockRef.current = true;
    if (a.pairId === b.pairId) {
      window.setTimeout(() => {
        // Single celebratory cue - used to fire two stacked sounds
        // ("correct" + "sortCorrect") which clipped on slower audio
        // contexts. The sortCorrect chime is the more rewarding one.
        playSound("sortCorrect");
        addBurst(aIdx, a.colour);
        addBurst(bIdx, b.colour);
        setCards((prev) => {
          const next = prev.slice();
          next[aIdx] = { ...next[aIdx], matched: true };
          next[bIdx] = { ...next[bIdx], matched: true };
          return next;
        });
        setPopIdxs([aIdx, bIdx]);
        window.setTimeout(() => setPopIdxs([]), 450);
        // Whether this match completes the board, computed OUTSIDE the state
        // updater: React may replay updaters, so firing the finish in there
        // could run it twice (and did run it before Sarah had spoken).
        const completesBoard =
          !matchedPairIds.includes(a.pairId) &&
          matchedPairIds.length + 1 >= pairList.length;
        setMatchedPairIds((prev) =>
          prev.includes(a.pairId) ? prev : [...prev, a.pairId]
        );
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((bb) => Math.max(bb, ns));
          return ns;
        });
        setFlippedIdxs([]);
        onCorrect?.();
        // The last pair's explanation used to be chopped off mid-sentence by the
        // jump into the memorise phase (owner 2026-09-14). The board now waits
        // for Sarah to finish before the game moves on.
        verdict.say("right", pairList[a.pairId]?.why ?? null, () => {
          lockRef.current = false;
          if (completesBoard && !completedRef.current) triggerFinish();
        });
      }, 320);
    } else {
      // Owner 2026-09-14: the buzzer, the card shake and the whole-screen
      // shake (fired via onWrong -> addWrong -> ScreenShake) were "annoying and
      // repetitive" here, because in a concentration game a mismatch is a
      // necessary probe rather than a mistake. The only feedback now is the
      // soft flip of the cards turning back, which is the signal a memory game
      // is supposed to give. onWrong is deliberately NOT called, so a mismatch
      // no longer shakes the screen or counts against the screen's stars; the
      // game still tracks mismatchCount for its own star rating.
      playSound("cardFlip");
      setStreak(0);
      setMismatchCount((n) => n + 1);
      window.setTimeout(() => {
        setShakeIdxs([]);
        setCards((prev) => {
          const next = prev.slice();
          next[aIdx] = { ...next[aIdx], flipped: false };
          next[bIdx] = { ...next[bIdx], flipped: false };
          return next;
        });
        setFlippedIdxs([]);
        lockRef.current = false;
      }, 1200);
    }
  };

  // Resolve the pair once two cards are face-up. Runs in an effect, NOT inside
  // the setFlippedIdxs updater, so the mismatch side effects (streak, shake and
  // onWrong -> parent setState) never fire during render.
  useEffect(() => {
    if (flippedIdxs.length === 2) checkMatch(flippedIdxs[0], flippedIdxs[1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flippedIdxs]);

  const triggerFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    window.setTimeout(() => {
      setWaveOn(true);
      playSound("sortCorrect");
      // Pass best streak so the finale burst scales with how cleanly
      // the kid solved the board - perfect run = full-screen party.
      // Gated for strict reduced-motion users.
      if (intensity > 0) void correctAnswerBurst(bestStreak);
      window.setTimeout(() => {
        setWaveOn(false);
        // Phase A complete - pivot to the memory-rebuild transition
        // card instead of jumping straight to the FinishOverlay. The
        // overlay still fires, but only after Phase B is also done.
        setPhase("phase-a-finished");
      }, 1600);
    }, 500);
  };

  /** Phase A → "memorise": keep the matched board face-up and give the
   *  child a 10-second window to memorise where everything is BEFORE the
   *  cards flip down for the recall test. */
  const startMemorise = () => {
    audio.tap();
    // Owner 2026-09-14: phase B used to reuse the exact positions from the
    // matching game, so a child could coast on leftover position memory instead
    // of actually memorising. Deal the board again HERE, before the memorise
    // window, so what they study is a fresh arrangement. (Shuffling at
    // startRebuild instead would make the memorise window pointless.)
    setCards((prev) => shuffle(prev));
    setMemoriseSecs(10);
    setPhase("memorise");
  };

  /** Kick off Phase B: flip every card face-down again, reset the
   *  prompt index, and switch into rebuild mode. */
  const startRebuild = () => {
    setMemoriseSecs(null);
    setCards((prev) =>
      prev.map((c) => ({ ...c, flipped: false, matched: false }))
    );
    setFlippedIdxs([]);
    setRebuildPromptIdx(0);
    setRebuildHits(0);
    setRebuildAttempts(0);
    rebuildLockRef.current = false;
    setPhase("rebuild");
  };

  // 10-second "memorise" countdown: the matched board stays face-up; each
  // tick decrements, and at 0 the cards flip down and the recall test begins.
  useEffect(() => {
    if (phase !== "memorise" || memoriseSecs === null) return;
    if (memoriseSecs <= 0) {
      startRebuild();
      return;
    }
    const id = window.setTimeout(
      () => setMemoriseSecs((s) => (s === null ? null : s - 1)),
      1000
    );
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, memoriseSecs]);

  /** Click handler for rebuild mode - flips ONE card and checks it
   *  against the currently-prompted term's meaning. Right answer
   *  locks the card face-up and advances; wrong answer flips back
   *  after a short reveal. */
  const rebuildClick = (idx: number) => {
    if (rebuildLockRef.current) return;
    const card = cards[idx];
    if (!card || card.flipped || card.matched) return;
    rebuildLockRef.current = true;
    setRebuildAttempts((n) => n + 1);
    setFlipCount((n) => n + 1);
    playSound("cardFlip");

    // Flip the clicked card so its face is visible.
    setCards((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], flipped: true };
      return next;
    });

    const promptPair = pairList[rebuildPromptIdx];
    const isCorrect = card.text === promptPair.match;

    if (isCorrect) {
      window.setTimeout(() => {
        audio.correct();
        playSound("sortCorrect");
        addBurst(idx, card.colour);
        setCards((prev) => {
          const next = prev.slice();
          next[idx] = { ...next[idx], matched: true };
          return next;
        });
        setPopIdxs([idx]);
        window.setTimeout(() => setPopIdxs([]), 450);
        setRebuildHits((n) => n + 1);
        onCorrect?.();

        const nextPrompt = rebuildPromptIdx + 1;
        // Owner 2026-09-15: Sarah stays SILENT on a correct recall. She already
        // explained every pair in phase 1; here the child just wants to keep
        // going. A short beat lets the card pop land, then the next prompt.
        window.setTimeout(() => {
          if (nextPrompt >= pairList.length) {
            // Phase B complete - celebrate, then open the FinishOverlay
            setPhase("done");
            playSound("confetti");
            if (intensity > 0) void badgeEarnedCelebration();
            window.setTimeout(() => setFinished(true), 1400);
          } else {
            setRebuildPromptIdx(nextPrompt);
          }
          rebuildLockRef.current = false;
        }, 700);
      }, 280);
    } else {
      // Wrong card - let the kid see what it actually was for ~1.1s,
      // then flip it back face-down so they can try again.
      audio.wrong();
      setShakeIdxs([idx]);
      onWrong?.();
      // Silent on a wrong card, same reason as the pair mismatch above.
      window.setTimeout(() => {
        setShakeIdxs([]);
        setCards((prev) => {
          const next = prev.slice();
          next[idx] = { ...next[idx], flipped: false };
          return next;
        });
        rebuildLockRef.current = false;
      }, 1200);
    }
  };

  const totalPairs = pairList.length;
  const totalCards = totalPairs * 2;
  const cols = totalCards >= 16 ? 4 : totalCards >= 12 ? 4 : 3;

  // Combined Phase A + Phase B scoring. Phase A: efficient matching
  // (low Phase-A flips). Phase B: memory recall accuracy. Both must
  // be excellent for 3 stars; either weak drops to 2 or 1.
  const phaseAStars = flipCount <= 14 ? 3 : flipCount <= 20 ? 2 : 1;
  const phaseBStars =
    rebuildAttempts === 0
      ? 0
      : rebuildHits / Math.max(1, rebuildAttempts) >= 0.95
      ? 3
      : rebuildHits / Math.max(1, rebuildAttempts) >= 0.7
      ? 2
      : 1;
  const stars = phaseBStars > 0 ? Math.min(phaseAStars, phaseBStars) : phaseAStars;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const ss = (totalSeconds % 60).toString().padStart(2, "0");

  return (
    <ExerciseFrame
      maxWidth={600}
      padding="0 0 22px"
      background={
        isStation
          ? "linear-gradient(180deg, #191410 0%, #241d16 52%, #0c0a07 100%)"
          : "linear-gradient(180deg, #0f1530 0%, #1a2147 55%, #080a16 100%)"
      }
      style={{
        boxShadow: isStation
          ? "0 30px 60px -20px rgba(0, 0, 0, 0.75), 0 0 34px rgba(255, 193, 77, 0.16), 0 0 0 1px rgba(255, 193, 77, 0.26) inset"
          : "0 30px 60px -20px rgba(0, 0, 0, 0.7), 0 0 32px rgba(0, 229, 255, 0.18), 0 0 0 1px rgba(0, 229, 255, 0.22) inset",
        color: isStation ? "#f6efe2" : "#e8edff",
      }}
    >
      {/* Inner wrapper keeps the data-mm-root hook used by addBurst's
          parent.getBoundingClientRect() positioning math. The wrapper
          fills its parent so the calculated coords match what they
          were when the outer div carried the attribute itself. */}
      <div
        data-mm-root
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
      {isStation ? <StationBackdrop /> : <PixarBackdrop />}

      <div style={{ position: "relative", zIndex: 1, padding: "0 18px" }}>
        <ExerciseHowTo
          title="Memory Match"
          steps={[
            { glyph: "🧠", text: "Flip two cards to find a matching pair" },
            { glyph: "🔗", text: "Match the term to its meaning" },
            { glyph: "⚡", text: "Fewer flips = more stars" },
          ]}
          accent={isStation ? "#ffc14d" : "#3a7bff"}
        />
        <div style={{ height: 14 }} />
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <h2
            style={{
              margin: "0 0 4px",
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: "-0.01em",
              color: isStation ? "#fff4e0" : "#eaf2ff",
            }}
          >
            {(() => {
              // Use the caller's title (e.g. "Cyber Word Match") if set, else
              // the default. Keep the two-tone look by accenting the LAST word.
              const words = (introTitle ?? "Memory Match").split(" ");
              const last = words.pop() ?? "";
              const head = words.join(" ");
              return (
                <>
                  {head ? head + " " : ""}
                  <span
                    style={{
                      background: isStation ? "linear-gradient(120deg, #ffc14d, #7eff97)" : "linear-gradient(120deg, #00e5ff, #7c5cff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {last}
                  </span>
                </>
              );
            })()}
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: isStation ? "#c3b49a" : "#94a3b8" }}>
            Flip two cards to find a word and its matching meaning. Remember where they are!{" "}
            <span aria-hidden>✦</span>
          </p>
        </div>
        {/* HUD */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1,
            padding: "8px 14px",
            // "station": a riveted meter strip bolted to the control-room wall.
            background: isStation ? "rgba(20, 16, 12, 0.82)" : "rgba(8, 10, 22, 0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: isStation ? 8 : 14,
            border: isStation ? "2px solid rgba(255, 193, 77, 0.38)" : "1px solid rgba(0, 229, 255, 0.28)",
            boxShadow: isStation ? "inset 0 2px 0 rgba(255, 236, 200, 0.14)" : "0 0 18px rgba(0, 229, 255, 0.18)",
            color: isStation ? "#f6efe2" : "#e8edff",
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          }}
        >
          {phase === "rebuild" ? (
            <>
              <span style={{ color: "#a0ffb0" }}>
                ROUND {Math.min(rebuildPromptIdx + 1, totalPairs)}/{totalPairs}
              </span>
              <span style={{ color: "#fcd34d" }}>HITS {rebuildHits}/{rebuildAttempts || 0}</span>
              <span
                style={{
                  color: isStation ? "#ffc14d" : "#00e5ff",
                  fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  fontSize: 11,
                }}
              >
                Phase 2 - Memory
              </span>
            </>
          ) : (
            <>
              <span style={{ color: "#a0ffb0" }}>
                PAIRS {pairsFound}/{totalPairs}
              </span>
              <span style={{ color: "#fcd34d" }}>FLIPS {flipCount}</span>
              <span
                style={{
                  color: isStation ? "#ffc14d" : "#00e5ff",
                  fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                }}
              >
                {mm}:{ss}
              </span>
              {streak >= 2 && (
                <span style={{ color: "#ff5fb3" }}>STREAK x{streak}</span>
              )}
            </>
          )}
        </div>

        {/* Rebuild-mode prompt banner - shows the term the kid is
            looking for, big and centred above the grid. */}
        {phase === "rebuild" && rebuildPromptIdx < pairList.length && (
          <div
            key={`prompt-${rebuildPromptIdx}`}
            style={{
              marginBottom: 14,
              padding: "12px 18px",
              borderRadius: isStation ? 8 : 16,
              // "station": a stamped brass job card clipped to the wall.
              background: isStation
                ? "linear-gradient(135deg, rgba(255, 193, 77, 0.96), rgba(226, 158, 58, 0.94))"
                : "linear-gradient(135deg, rgba(0, 229, 255, 0.95), rgba(124, 92, 255, 0.92))",
              boxShadow: isStation
                ? "0 12px 26px -10px rgba(0, 0, 0, 0.7), inset 0 0 0 2px rgba(120, 78, 20, 0.45)"
                : "0 12px 28px -8px rgba(8, 10, 22, 0.55), 0 0 24px rgba(0, 229, 255, 0.35), inset 0 0 0 1px rgba(125, 240, 255, 0.6)",
              textAlign: "center",
              animation: "mmFadeIn 0.45s ease-out",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "rgba(58, 26, 6, 0.7)",
                fontWeight: 800,
                textTransform: "uppercase",
                marginBottom: 2,
              }}
            >
              Find the meaning of
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: isStation ? "#2b1d08" : "#080a16",
                letterSpacing: 0.5,
                lineHeight: 1.15,
                fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
              }}
            >
              {pairList[rebuildPromptIdx].term}
            </div>
          </div>
        )}

        {/* Tiered hint: after a few mismatches Adam steps in. */}
        {mismatchCount >= 3 && matchedPairIds.length < pairList.length && (
          <div style={{ padding: "0 12px 12px" }}>
            <HintBubble
              tier={mismatchCount >= 5 ? 3 : 2}
              speaker="adam"
              text="Remember where each card was. Tap a cyber word, then the meaning that matches it."
            />
          </div>
        )}

        {/* Card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 10,
            perspective: 900,
          }}
        >
          {cards.map((c, idx) => {
            const showFace = c.flipped || c.matched;
            // Comfort mode (or OS-level prefers-reduced-motion) drops
            // the shake on mismatch and the wave on completion. The
            // pop on match stays - it's a quick celebratory accent,
            // not a motion-trigger.
            const extraAnim =
              waveOn && c.matched && !reduce
                ? `mmWave 0.5s ease-out ${c.waveDelay}s`
                : popIdxs.includes(idx)
                  ? "mmPop 0.4s ease-out"
                  : shakeIdxs.includes(idx) && !reduce
                    ? "mmShake 0.35s ease-in-out 2"
                    : undefined;
            const jSeed =
              (c.id.charCodeAt(0) +
                c.id.charCodeAt(c.id.length - 1) +
                idx * 37) %
              360;
            const jRot = ((jSeed % 11) - 5) * 1.0;
            const jX = ((jSeed % 7) - 3) * 1.2;
            const jY = (((jSeed >> 3) % 7) - 3) * 1.2;
            const baseTransform = `translate(${jX}px, ${jY}px) rotate(${jRot}deg)`;
            return (
              // Outer wrapper - owns the click handler, the static
              // jitter (baseTransform), and the decorative shake/pop/
              // wave animation.  Crucially this layer does NOT touch
              // rotateY, so when the animation runs it can't clobber
              // the in-flight flip transition on the inner flipper.
              <div
                key={c.id}
                data-mm-card={idx}
                onClick={() => (phase === "rebuild" ? rebuildClick(idx) : flip(idx))}
                style={{
                  cursor: c.matched ? "default" : "pointer",
                  aspectRatio: "5 / 4",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transform: baseTransform,
                  animation: extraAnim,
                  zIndex: c.matched ? 1 : 2,
                }}
              >
                {/* Inner flipper - owns the 3D rotateY flip and its
                    transition.  Clean transform property, no animation,
                    so the 0.45s flip always runs to completion. */}
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    transformStyle: "preserve-3d",
                    transition:
                      "transform 0.45s cubic-bezier(0.4, 1.2, 0.4, 1)",
                    transform: showFace ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {isStation ? (
                    <StationCardBack disabled={c.matched || c.flipped} />
                  ) : (
                    <CardBack faceDown={!showFace} disabled={c.matched || c.flipped} />
                  )}
                  <CardFront
                    text={c.text}
                    colour={c.colour}
                    matched={c.matched}
                    station={isStation}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bursts on match */}
        {bursts.map((b, i) => {
          const angle =
            ((i % 8) / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
          const r = 50 + Math.random() * 30;
          return (
            <span
              key={b.id}
              style={
                {
                  position: "absolute",
                  left: b.x,
                  top: b.y,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: b.colour,
                  boxShadow: `0 0 12px ${b.colour}`,
                  pointerEvents: "none",
                  "--dx": `${Math.cos(angle) * r}px`,
                  "--dy": `${Math.sin(angle) * r - 30}px`,
                  animation: "mmBurst 1s ease-out forwards",
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      {/* Spoken payoff on the finish overlay (audio only; the guard holds Continue). */}
      {finished && completeNarration && (
        <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          <InfoNarration
            key="mm-complete"
            speaker={completeNarration.speaker ?? "adam"}
            lines={completeNarration.lines}
            recordedOnly
          />
        </div>
      )}
      {finished && (
        <FinishOverlay
          mm={mm}
          ss={ss}
          flipCount={flipCount}
          bestStreak={bestStreak}
          stars={stars}
          station={isStation}
          onContinue={() => {
            audio.tap();
            onComplete(stars);
          }}
          onRetry={() => {
            audio.select();
            resetExercise();
          }}
        />
      )}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "Memory Match"}
          logo="/cyberheroes/logos/memory-match.png"
          welcome={introWelcome ?? "Your first challenge!"}
          subtitle={
            introSubtitle ??
            "Flip the cards and match each term with its meaning! Fewer flips earn more stars."
          }
          icon="🧠"
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker ?? "adam"}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Phase A → Phase B transition card. Pops over the cleared
          board after the wave celebration finishes. The cards are
          still face-up behind the dim, so the kid sees what they're
          about to commit to memory. */}
      {phase === "phase-a-finished" && (
        <PhaseTransitionCard onStart={startMemorise} coachLines={coachLines} station={isStation} />
      )}
      {phase === "memorise" && <MemoriseCountdown secs={memoriseSecs ?? 0} station={isStation} />}

      {/* Tiny "do you remember?" reminder while rebuild is active.
          Sits at the bottom of the frame so it doesn't crowd the
          term-prompt banner up top. */}
      {phase === "rebuild" && rebuildPromptIdx < pairList.length && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 6,
            textAlign: "center",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: isStation ? "rgba(255, 193, 77, 0.6)" : "rgba(125, 240, 255, 0.55)",
            textTransform: "uppercase",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          Tap the face-down card you remember
        </div>
      )}
      {fx.layer()}
      {verdict.element}
      </div>
    </ExerciseFrame>
  );
}

/* ───────────────────────── MEMORISE COUNTDOWN ─────────────
 * The 10-second window where the matched board stays face-up so the child
 * can memorise the layout before it flips down for the recall test. A
 * non-blocking top banner — the cards MUST stay visible behind it. */
function MemoriseCountdown({ secs, station }: { secs: number; station?: boolean }) {
  // Portalled to document.body and fixed to the viewport, exactly like the
  // narration guard's pill. The old version was absolutely positioned at the
  // top of the exercise frame, which is TALLER than the window: the child
  // either saw the whole board with the timer hidden behind the fixed HUD, or
  // saw the timer with the bottom row of cards cut off, and its translucent
  // gradient let the "how to play" chips bleed through the number either way.
  // A single compact strip under the HUD is always visible and never overlaps
  // the board it is asking the child to study.
  // No mounted-state dance is needed: the memorise phase can only begin
  // after the child taps, so this never renders during SSR or hydration.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      aria-live="polite"
      style={{
        position: "fixed",
        top: 76, // LessonHUD is fixed, 64px tall
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 60, // above lesson content, below the narration guard (88)
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "8px 20px",
        borderRadius: station ? 10 : 999,
        background: station ? "rgba(22,18,13,0.96)" : "rgba(8,12,30,0.96)",
        border: station ? "2px solid rgba(255,193,77,0.55)" : "1px solid rgba(125,240,255,0.5)",
        boxShadow: station
          ? "0 14px 34px -10px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,236,200,0.14)"
          : "0 14px 34px -10px rgba(0,0,0,0.75), 0 0 22px rgba(0,229,255,0.22)",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: station ? "#ffd894" : "#7df0ff" }}>
        <PixIcon emoji="🧠" size={18} />
        Memorise where the cards are!
      </span>
      <span style={{ fontSize: 30, fontWeight: 900, lineHeight: 1, color: "#ffd158", textShadow: "0 0 18px rgba(255,209,88,0.6)", fontVariantNumeric: "tabular-nums", minWidth: 26, textAlign: "center" }}>
        {secs}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(231,236,255,0.72)" }}>
        Then they flip over for the test…
      </span>
    </div>,
    document.body
  );
}

/* ───────────────────────── PHASE TRANSITION CARD ─────────────
 * Modal-style overlay that pops between Phase A and Phase B. Same
 * visual language as ExerciseIntro but smaller and re-themed for
 * "level 2" - gold-rimmed plum card with a brain glyph and a single
 * START button. */

function PhaseTransitionCard({
  onStart,
  coachLines,
  station,
}: {
  onStart: () => void;
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** "station" skin: the control-room palette instead of the cyber one. */
  station?: boolean;
}) {
  return (
    <div
      role="dialog"
      aria-label="Phase 2: Rebuild from Memory"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: station
          ? "linear-gradient(180deg, rgba(34, 28, 23, 0.86) 0%, rgba(10, 8, 6, 0.93) 100%)"
          : "linear-gradient(180deg, rgba(15, 21, 48, 0.85) 0%, rgba(4, 5, 13, 0.92) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        animation: "mmFadeIn 0.45s ease-out",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          maxHeight: "100%",
          overflowY: "auto",
          padding: "26px 28px 22px",
          borderRadius: station ? 12 : 22,
          // "station": a bolted steel job card, not a glass panel.
          background: station
            ? "linear-gradient(180deg, rgba(45, 38, 30, 0.95), rgba(14, 11, 8, 0.96))"
            : "linear-gradient(180deg, rgba(15, 21, 48, 0.92), rgba(4, 5, 13, 0.95))",
          border: station ? "2px solid rgba(255, 193, 77, 0.45)" : "1px solid rgba(0, 229, 255, 0.42)",
          boxShadow: station
            ? "0 30px 60px -20px rgba(0,0,0,0.8), inset 0 2px 0 rgba(255,236,200,0.14)"
            : "0 30px 60px -20px rgba(8,10,22,0.7), 0 0 36px rgba(124, 92, 255, 0.25)",
          textAlign: "center",
          color: "#e8edff",
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            letterSpacing: 4,
            fontWeight: 800,
            color: station ? "#ffc14d" : "#00e5ff",
            textTransform: "uppercase",
            padding: "4px 14px",
            background: station ? "rgba(20, 16, 12, 0.6)" : "rgba(8, 10, 22, 0.55)",
            border: station ? "1px solid rgba(255, 193, 77, 0.45)" : "1px solid rgba(0, 229, 255, 0.4)",
            borderRadius: station ? 6 : 999,
            marginBottom: 14,
          }}
        >
          Phase 2 of 2
        </div>
        <div
          style={{
            fontSize: 56,
            lineHeight: 1,
            marginBottom: 8,
            filter: station
              ? "drop-shadow(0 0 18px rgba(255, 193, 77, 0.6)) drop-shadow(0 0 32px rgba(255, 140, 40, 0.3))"
              : "drop-shadow(0 0 18px rgba(0, 229, 255, 0.65)) drop-shadow(0 0 32px rgba(124, 92, 255, 0.4))",
          }}
        >
          <PixIcon emoji="🧠" size={60} />
        </div>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 900,
            background: station
              ? "linear-gradient(135deg, #ffd894, #ffc14d, #7eff97)"
              : "linear-gradient(135deg, #7df0ff, #00e5ff, #7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "4px 0 6px",
            letterSpacing: 0.3,
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
          }}
        >
          Rebuild From Memory!
        </h2>
        {coachLines && coachLines.lines.length > 0 ? (
          // The NARRATOR (Sarah) briefs the task — autoplays, persistent,
          // shown as the ♪ narration block (no character face).
          <div style={{ textAlign: "left", margin: "2px 0 16px" }}>
            <InfoNarration
              lines={coachLines.lines}
              speaker={coachLines.speaker ?? "layla"}
            />
          </div>
        ) : (
          <p
            style={{
              fontSize: 15,
              color: station ? "#d9cdb8" : "#c5cdf0",
              opacity: 0.92,
              margin: "0 0 18px",
              lineHeight: 1.55,
            }}
          >
            First, take 10 seconds to memorise where all the cards are! Then
            they flip over and we&apos;ll test you — tap the card you remember
            holds each meaning. Hit them all in one go for a 3-star finish!
          </p>
        )}
        <button
          type="button"
          onClick={onStart}
          style={{
            height: 46,
            padding: "0 28px",
            border: "none",
            borderRadius: 999,
            background: station ? "linear-gradient(135deg, #ffc14d, #e29e3a)" : "linear-gradient(135deg, #00e5ff, #7c5cff)",
            color: station ? "#2b1d08" : "#080a16",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: 0.5,
            cursor: "pointer",
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
            boxShadow:
              "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
          }}
        >
          Start Memorising →
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── PIXAR BACKDROP ───────────────────────── */

function PixarBackdrop() {
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: (i * 47 + 11) % 100,
        top: 40 + ((i * 19) % 50),
        size: 2 + ((i * 5) % 4),
        duration: 8 + ((i * 3) % 6),
        delay: (i * 0.41) % 8,
        drift: ((i * 11) % 30) - 15,
      })),
    []
  );
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      {/* Cyber halo top-right - replaces the warm sun glow with a
          cosmic violet / cyan bleed matching the rest of the cyber app. */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "12%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0, 229, 255, 0.4) 0%, rgba(124, 92, 255, 0.18) 45%, transparent 80%)",
          filter: "blur(4px)",
        }}
      />
      {/* Drifting motes - cyan / cosmic / neon mix */}
      {motes.map((m, i) => {
        const c = i % 3 === 0 ? "0, 229, 255" : i % 3 === 1 ? "124, 92, 255" : "255, 95, 179";
        return (
          <span
            key={i}
            style={
              {
                position: "absolute",
                left: `${m.left}%`,
                top: `${m.top}%`,
                width: m.size,
                height: m.size,
                borderRadius: "50%",
                background: `rgba(${c}, 0.85)`,
                boxShadow: `0 0 ${m.size * 4}px rgba(${c}, 0.7)`,
                animation: `mmMoteRise ${m.duration}s ease-in-out ${m.delay}s infinite`,
                "--mx": `${m.drift}px`,
                "--my": "-180px",
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/* ───────────────────── STATION BACKDROP (Week 13) ─────────────────────
 * The Power Station control room: a brushed-steel wall, a warm lamp over the
 * bench, a busbar running the width of the board with charge travelling along
 * it, and two ghosted dials. Deliberately nothing like the cyber halo and
 * drifting motes of the Weeks 1 / 7 backdrop. */

function StationBackdrop() {
  const sparks = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => ({
        left: 4 + i * 14,
        delay: (i * 0.9) % 6,
        duration: 7 + ((i * 2) % 5),
      })),
    []
  );
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}
    >
      {/* Brushed-steel wall */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.5,
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0 2px, transparent 2px 6px)",
        }}
      />
      {/* Warm bench lamp, top-left */}
      <div
        style={{
          position: "absolute",
          top: "8%",
          left: "10%",
          width: 240,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 193, 77, 0.3) 0%, rgba(255, 140, 40, 0.12) 45%, transparent 78%)",
          filter: "blur(6px)",
        }}
      />
      {/* Two ghosted dials on the far wall */}
      {[
        { left: "72%", top: "16%", size: 120 },
        { left: "84%", top: "62%", size: 74 },
      ].map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            borderRadius: "50%",
            border: "3px solid rgba(255, 236, 200, 0.07)",
            boxShadow: "inset 0 0 0 6px rgba(255, 236, 200, 0.04)",
          }}
        />
      ))}
      {/* The busbar, with charge travelling along it */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "16%",
          height: 6,
          background:
            "linear-gradient(180deg, rgba(255, 236, 200, 0.16), rgba(120, 90, 50, 0.22))",
        }}
      />
      {sparks.map((s, i) => (
        <span
          key={`s-${i}`}
          style={
            {
              position: "absolute",
              left: `${s.left}%`,
              bottom: "16%",
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "rgba(255, 193, 77, 0.9)",
              boxShadow: "0 0 14px rgba(255, 193, 77, 0.8)",
              animation: `mmMoteRise ${s.duration}s ease-in-out ${s.delay}s infinite`,
              "--mx": "26px",
              "--my": "-120px",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ───────────────────── STATION CARD BACK (Week 13) ─────────────────────
 * A charge cell on the rack: steel shell, four charge bars and a bolt badge.
 * The cyber card back (below) is untouched for Weeks 1 and 7. */

function StationCardBack({ disabled }: { disabled: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 8,
        background: "linear-gradient(160deg, #7a6b59 0%, #665646 60%, #5b4e40 100%)",
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: "rgba(255, 193, 77, 0.35)",
        boxShadow:
          "0 12px 26px -10px rgba(0,0,0,0.75), inset 0 2px 0 rgba(255,236,200,0.16)",
        backfaceVisibility: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        overflow: "hidden",
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 18px 32px -10px rgba(0,0,0,0.85), inset 0 2px 0 rgba(255,236,200,0.22), 0 0 18px rgba(255,193,77,0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 12px 26px -10px rgba(0,0,0,0.75), inset 0 2px 0 rgba(255,236,200,0.16)";
      }}
    >
      {/* Rivets at the four corners */}
      {[
        { top: 5, left: 5 },
        { top: 5, right: 5 },
        { bottom: 5, left: 5 },
        { bottom: 5, right: 5 },
      ].map((p, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            ...p,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "rgba(255, 236, 200, 0.28)",
            boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.6)",
          }}
        />
      ))}
      {/* The cell: charge bars behind a bolt badge */}
      <svg width="62%" height="62%" viewBox="0 0 60 60" aria-hidden style={{ position: "relative", zIndex: 1 }}>
        <defs>
          <linearGradient id="mmCellBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9aa2b6" />
            <stop offset="100%" stopColor="#4d5464" />
          </linearGradient>
        </defs>
        {/* Cap */}
        <rect x="25" y="5" width="10" height="5" rx="1.5" fill="url(#mmCellBody)" />
        {/* Shell */}
        <rect x="14" y="10" width="32" height="44" rx="4" fill="url(#mmCellBody)" stroke="rgba(20,16,12,0.8)" strokeWidth="1.2" />
        {/* Charge bars */}
        <g>
          {[16, 25, 34, 43].map((y, i) => (
            <rect
              key={y}
              x="19"
              y={y}
              width="22"
              height="6"
              rx="1.5"
              fill={i === 0 ? "rgba(255,193,77,0.9)" : i === 1 ? "rgba(255,193,77,0.6)" : "rgba(20,16,12,0.45)"}
            />
          ))}
        </g>
        {/* Bolt badge */}
        <path
          d="M 32 18 L 25 33 L 30 33 L 27 45 L 36 29 L 31 29 Z"
          fill="rgba(255, 236, 200, 0.92)"
          stroke="rgba(120, 78, 20, 0.6)"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

/* ───────────────────────── CARD BACK ───────────────────────── */

function CardBack({
  faceDown,
  disabled,
}: {
  faceDown: boolean;
  disabled: boolean;
}) {
  void faceDown;
  // Tech-themed card back: deep plum board, faint gold circuit grid,
  // diagonal trace lines, four corner solder pads, and a glowing
  // micro-chip with a keyhole at the centre. Still warm Pixar palette
  // (no cyan / cyber-blue) - the tech feel comes from the form, not
  // the colour temperature.
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 14,
        background:
          "linear-gradient(135deg, #0f1530 0%, #1f0820 55%, #150610 100%)",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "rgba(0, 229, 255, 0.32)",
        boxShadow:
          "0 12px 28px -8px rgba(8, 10, 22, 0.7), inset 0 0 0 1px rgba(0, 229, 255, 0.18), 0 0 0 1px rgba(8, 10, 22, 0.55)",
        backfaceVisibility: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        overflow: "hidden",
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 18px 36px -8px rgba(8, 10, 22, 0.8), inset 0 0 0 1px rgba(0, 229, 255, 0.32), 0 0 18px rgba(124, 92, 255, 0.35)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 12px 28px -8px rgba(8, 10, 22, 0.7), inset 0 0 0 1px rgba(0, 229, 255, 0.18), 0 0 0 1px rgba(8, 10, 22, 0.55)";
      }}
    >
      {/* Faint warm circuit grid - the technical texture */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.55,
          backgroundImage:
            "linear-gradient(rgba(0, 229, 255, 0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 229, 255, 0.10) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />

      {/* Diagonal circuit traces from the four corners into the chip */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.55,
        }}
      >
        <g
          fill="none"
          stroke="rgba(124, 92, 255, 0.65)"
          strokeWidth="0.8"
          strokeLinecap="round"
        >
          {/* Top-left → chip */}
          <path d="M 6 6 L 6 28 L 30 28 L 38 36" />
          {/* Top-right → chip */}
          <path d="M 94 6 L 94 28 L 70 28 L 62 36" />
          {/* Bottom-left → chip */}
          <path d="M 6 94 L 6 72 L 30 72 L 38 64" />
          {/* Bottom-right → chip */}
          <path d="M 94 94 L 94 72 L 70 72 L 62 64" />
        </g>
        {/* Solder pads at the four outer corners */}
        <g fill="rgba(0, 229, 255, 0.85)">
          <circle cx="6" cy="6" r="1.6" />
          <circle cx="94" cy="6" r="1.6" />
          <circle cx="6" cy="94" r="1.6" />
          <circle cx="94" cy="94" r="1.6" />
        </g>
      </svg>

      {/* Glowing halo behind the chip */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          width: "55%",
          height: "55%",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0, 229, 255, 0.55) 0%, rgba(255, 155, 74, 0.28) 45%, transparent 75%)",
          filter: "blur(8px)",
          animation: "mmSealSpin 10s linear infinite",
        }}
      />

      {/* Microchip with keyhole - the tech-themed centerpiece */}
      <svg
        width="56%"
        height="56%"
        viewBox="0 0 60 60"
        aria-hidden
        style={{ position: "relative", zIndex: 1 }}
      >
        <defs>
          <linearGradient id="mmChipBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7df0ff" />
            <stop offset="45%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#7c5cff" />
          </linearGradient>
          <linearGradient id="mmChipPin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#3a7bff" />
          </linearGradient>
        </defs>

        {/* Pins (4 per side, symmetric) */}
        <g fill="url(#mmChipPin)">
          {[18, 26, 34, 42].map((y) => (
            <rect key={`pl-${y}`} x="6" y={y - 1.5} width="6" height="3" rx="0.6" />
          ))}
          {[18, 26, 34, 42].map((y) => (
            <rect key={`pr-${y}`} x="48" y={y - 1.5} width="6" height="3" rx="0.6" />
          ))}
          {[18, 26, 34, 42].map((x) => (
            <rect key={`pt-${x}`} y="6" x={x - 1.5} height="6" width="3" rx="0.6" />
          ))}
          {[18, 26, 34, 42].map((x) => (
            <rect key={`pb-${x}`} y="48" x={x - 1.5} height="6" width="3" rx="0.6" />
          ))}
        </g>

        {/* Chip body - square with rounded corners, gold gradient */}
        <rect
          x="12"
          y="12"
          width="36"
          height="36"
          rx="5"
          fill="url(#mmChipBody)"
          stroke="rgba(120, 55, 10, 0.55)"
          strokeWidth="0.8"
        />
        {/* Inner bevel highlight */}
        <rect
          x="14"
          y="14"
          width="32"
          height="32"
          rx="4"
          fill="none"
          stroke="rgba(125, 240, 255, 0.7)"
          strokeWidth="0.6"
        />

        {/* Notch (chip orientation marker) - top-left */}
        <circle cx="18" cy="18" r="1.4" fill="rgba(80, 35, 5, 0.7)" />

        {/* Keyhole etched into the chip - padlock allegiance */}
        <g transform="translate(30, 30)">
          <circle r="4.5" fill="rgba(80, 35, 5, 0.85)" />
          <rect x="-1.2" y="3.4" width="2.4" height="5" rx="0.6" fill="rgba(80, 35, 5, 0.85)" />
          <circle r="1.4" fill="rgba(125, 240, 255, 0.55)" />
        </g>
      </svg>
    </div>
  );
}

/* ───────────────────────── CARD FRONT ───────────────────────── */

function CardFront({
  text,
  colour,
  matched,
  station,
}: {
  text: string;
  colour: string;
  matched: boolean;
  /** "station" skin: an enamel name plate instead of the warm paper card. */
  station?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: station ? 8 : 16,
        background: station
          ? "linear-gradient(180deg, #f2ece0 0%, #d9d1c2 100%)"
          : "linear-gradient(180deg, #fffaf0 0%, #fdebcb 100%)",
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: matched ? "#4a9a6a" : `${colour}88`,
        boxShadow: matched
          ? `0 0 22px ${colour}66, inset 0 0 18px ${colour}44, 0 12px 24px -8px rgba(8, 10, 22, 0.55)`
          : `0 8px 18px -6px rgba(8, 10, 22, 0.5), inset 0 0 0 1px ${colour}33`,
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        display: "flex",
        flexDirection: station ? "row" : "column",
        alignItems: "stretch",
        justifyContent: "center",
        padding: 0,
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Top accent ribbon - a riveted colour spine down the left on "station" */}
      <div
        style={
          station
            ? {
                width: 8,
                flexShrink: 0,
                background: `linear-gradient(180deg, ${colour}aa, ${colour}, ${colour}aa)`,
                boxShadow: "inset -1px 0 0 rgba(0,0,0,0.25)",
              }
            : {
                height: 6,
                background: `linear-gradient(90deg, ${colour}aa, ${colour}, ${colour}aa)`,
              }
        }
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.3,
          color: COLOR.inkDeep,
          wordBreak: "break-word",
          fontFamily: "inherit",
        }}
      >
        {text}
      </div>
      {/* No matched-check badge: it sat in the corner over the card text
          and hid the word during the 10s memorise phase, defeating the
          recall test. Matched cards are already marked by the green border
          + glow set on this element above. */}
    </div>
  );
}

/* ───────────────────────── FINISH OVERLAY ───────────────────────── */

function FinishOverlay({
  mm,
  ss,
  flipCount,
  bestStreak,
  stars,
  station,
  onContinue,
  onRetry,
}: {
  mm: string;
  ss: string;
  flipCount: number;
  bestStreak: number;
  stars: number;
  /** "station" skin: the control-room palette instead of the cyber one. */
  station?: boolean;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "absolute",
        inset: 0,
        background: station
          ? "linear-gradient(180deg, rgba(40, 33, 26, 0.95) 0%, rgba(10, 8, 6, 0.97) 100%)"
          : "linear-gradient(180deg, rgba(15, 21, 48, 0.95) 0%, rgba(4, 5, 13, 0.96) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: COLOR.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 28,
        gap: 4,
        zIndex: 20,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 5,
          color: station ? "#ffc14d" : "#00e5ff",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        ✦ All Pairs Matched ✦
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          background: station
            ? "linear-gradient(135deg, #ffd894, #ffc14d, #7eff97)"
            : "linear-gradient(135deg, #00e5ff, #7c5cff, #3a7bff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 1,
        }}
      >
        BRILLIANT!
      </div>
      <div style={{ marginTop: 6, fontSize: 16, opacity: 0.92 }}>
        Time {mm}:{ss} &nbsp;·&nbsp; Flips {flipCount}
      </div>
      {bestStreak >= 2 && (
        <div style={{ marginTop: 2, fontSize: 12, opacity: 0.7, letterSpacing: 1 }}>
          Best streak: {bestStreak}
        </div>
      )}
      <div style={{ display: "flex", gap: 4, margin: "12px 0" }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{
              opacity: i < stars ? 1 : 0.25,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              ...SPRING.bouncy,
              delay: 0.3 + i * 0.18,
            }}
            style={{
              fontSize: 38,
              filter:
                i < stars
                  ? "drop-shadow(0 0 14px rgba(255, 200, 100, 0.7))"
                  : "grayscale(0.6)",
            }}
          >
            ★
          </motion.span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 8,
        }}
      >
        <motion.button
          type="button"
          onClick={onContinue}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "14px 36px",
            fontSize: 16,
            fontWeight: 800,
            color: COLOR.goldDark,
            background:
              `linear-gradient(135deg, ${COLOR.goldLight}, ${COLOR.goldMid})`,
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.primaryButton,
          }}
        >
          Continue →
        </motion.button>
        <motion.button
          type="button"
          onClick={onRetry}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 800,
            color: COLOR.cream,
            background: station ? "rgba(34, 28, 23, 0.7)" : "rgba(15, 21, 48, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.drop,
          }}
        >
          ↻ Try Again
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── HELPERS ───────────────────────── */

function buildDeck(pairList: MemoryPair[]): Card[] {
  const raw: Card[] = [];
  pairList.forEach((p, i) => {
    raw.push({
      id: `p${i}-term`,
      pairId: i,
      text: p.term,
      colour: p.colour,
      flipped: false,
      matched: false,
      waveDelay: 0,
    });
    raw.push({
      id: `p${i}-match`,
      pairId: i,
      text: p.match,
      colour: p.colour,
      flipped: false,
      matched: false,
      waveDelay: 0,
    });
  });
  // Deal so NO pair lands adjacent — the matched pairs were ending up
  // side-by-side, which defeats the memory challenge. Reject any layout
  // where a pair's two cards are at array distance 1 (horizontal
  // neighbours) or 3/4 (vertical neighbours in the 3- and 4-column
  // responsive grids); retry, keeping the least-bad fallback.
  const ADJ = new Set([1, 3, 4]);
  let best = shuffle(raw);
  let bestBad = Infinity;
  for (let attempt = 0; attempt < 200; attempt++) {
    const s = shuffle(raw);
    const pos = new Map<number, number[]>();
    s.forEach((c, i) => {
      const a = pos.get(c.pairId);
      if (a) a.push(i);
      else pos.set(c.pairId, [i]);
    });
    let bad = 0;
    pos.forEach((idxs) => {
      if (idxs.length === 2 && ADJ.has(Math.abs(idxs[0] - idxs[1]))) bad++;
    });
    if (bad === 0) {
      best = s;
      break;
    }
    if (bad < bestBad) {
      bestBad = bad;
      best = s;
    }
  }
  return best.map((c, idx) => ({ ...c, waveDelay: idx * 0.05 }));
}
