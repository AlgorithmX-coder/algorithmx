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
 */

import { useEffect, useMemo, useRef, useState } from "react";
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
import ExerciseIntro from "./ExerciseIntro";
import ExerciseHowTo from "./ExerciseHowTo";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import { COLOR, SHADOW, SPRING } from "@/app/components/scene/tokens";
import HintBubble from "@/app/components/lesson/HintBubble";

export interface MemoryPair {
  term: string;
  match: string;
  /** Hex accent. Defaults will pull from a Pixar-warm palette. */
  colour: string;
}

export interface MemoryMatchProps {
  pairs?: MemoryPair[];
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
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
}: MemoryMatchProps) {
  useEffect(ensureStyles, []);

  const pairList = useMemo(() => pairs ?? DEFAULT_PAIRS, [pairs]);

  const [cards, setCards] = useState<Card[]>(() => buildDeck(pairList));

  const [showIntro, setShowIntro] = useState(true);
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
  type Phase = "playing" | "phase-a-finished" | "rebuild" | "done";
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
    setFlippedIdxs((prev) => {
      const now = [...prev, idx];
      if (now.length === 2) checkMatch(now[0], now[1]);
      return now;
    });
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
        setMatchedPairIds((prev) => {
          if (prev.includes(a.pairId)) return prev;
          const nn = [...prev, a.pairId];
          if (nn.length >= pairList.length && !completedRef.current) {
            triggerFinish();
          }
          return nn;
        });
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((bb) => Math.max(bb, ns));
          return ns;
        });
        setFlippedIdxs([]);
        lockRef.current = false;
        onCorrect?.();
      }, 320);
    } else {
      audio.wrong();
      setStreak(0);
      setShakeIdxs([aIdx, bIdx]);
      setMismatchCount((n) => n + 1);
      onWrong?.();
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

  /** Kick off Phase B: flip every card face-down again, reset the
   *  prompt index, and switch into rebuild mode. */
  const startRebuild = () => {
    audio.tap();
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
      background="linear-gradient(180deg, #0f1530 0%, #1a2147 55%, #080a16 100%)"
      style={{
        boxShadow:
          "0 30px 60px -20px rgba(0, 0, 0, 0.7), 0 0 32px rgba(0, 229, 255, 0.18), 0 0 0 1px rgba(0, 229, 255, 0.22) inset",
        color: "#e8edff",
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
      <PixarBackdrop />

      <div style={{ position: "relative", zIndex: 1, padding: "0 18px" }}>
        <ExerciseHowTo
          title="Memory Match"
          steps={[
            { glyph: "🧠", text: "Flip two cards to find a matching pair" },
            { glyph: "🔗", text: "Match the term to its meaning" },
            { glyph: "⚡", text: "Fewer flips = more stars" },
          ]}
          accent="#3a7bff"
        />
        <div style={{ height: 14 }} />
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
            background: "rgba(8, 10, 22, 0.7)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: 14,
            border: "1px solid rgba(0, 229, 255, 0.28)",
            boxShadow: "0 0 18px rgba(0, 229, 255, 0.18)",
            color: "#e8edff",
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
                  color: "#00e5ff",
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
                  color: "#00e5ff",
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
              borderRadius: 16,
              background:
                "linear-gradient(135deg, rgba(0, 229, 255, 0.95), rgba(124, 92, 255, 0.92))",
              boxShadow:
                "0 12px 28px -8px rgba(8, 10, 22, 0.55), 0 0 24px rgba(0, 229, 255, 0.35), inset 0 0 0 1px rgba(125, 240, 255, 0.6)",
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
                color: "#080a16",
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
              text="Try to remember WHERE you saw each meaning. Tap two that go together - a word and what it means."
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
                  <CardBack faceDown={!showFace} disabled={c.matched || c.flipped} />
                  <CardFront
                    text={c.text}
                    colour={c.colour}
                    matched={c.matched}
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

      {finished && (
        <FinishOverlay
          mm={mm}
          ss={ss}
          flipCount={flipCount}
          bestStreak={bestStreak}
          stars={stars}
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
        <ExerciseIntro
          title="Memory Match"
          description="Flip the cards and match each term with its meaning! Fewer flips earn more stars."
          icon="🧠"
          controls="Click cards to flip them"
          onStart={() => setShowIntro(false)}
        />
      )}

      {/* Phase A → Phase B transition card. Pops over the cleared
          board after the wave celebration finishes. The cards are
          still face-up behind the dim, so the kid sees what they're
          about to commit to memory. */}
      {phase === "phase-a-finished" && <PhaseTransitionCard onStart={startRebuild} />}

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
            color: "rgba(125, 240, 255, 0.55)",
            textTransform: "uppercase",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          Tap the face-down card you remember
        </div>
      )}
      {fx.layer()}
      </div>
    </ExerciseFrame>
  );
}

/* ───────────────────────── PHASE TRANSITION CARD ─────────────
 * Modal-style overlay that pops between Phase A and Phase B. Same
 * visual language as ExerciseIntro but smaller and re-themed for
 * "level 2" - gold-rimmed plum card with a brain glyph and a single
 * START button. */

function PhaseTransitionCard({ onStart }: { onStart: () => void }) {
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
        background:
          "linear-gradient(180deg, rgba(15, 21, 48, 0.85) 0%, rgba(4, 5, 13, 0.92) 100%)",
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
          padding: "26px 28px 22px",
          borderRadius: 22,
          background:
            "linear-gradient(180deg, rgba(15, 21, 48, 0.92), rgba(4, 5, 13, 0.95))",
          border: "1px solid rgba(0, 229, 255, 0.42)",
          boxShadow:
            "0 30px 60px -20px rgba(8,10,22,0.7), 0 0 36px rgba(124, 92, 255, 0.25)",
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
            color: "#00e5ff",
            textTransform: "uppercase",
            padding: "4px 14px",
            background: "rgba(8, 10, 22, 0.55)",
            border: "1px solid rgba(0, 229, 255, 0.4)",
            borderRadius: 999,
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
            filter:
              "drop-shadow(0 0 18px rgba(0, 229, 255, 0.65)) drop-shadow(0 0 32px rgba(124, 92, 255, 0.4))",
          }}
        >
          🧠
        </div>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 900,
            background:
              "linear-gradient(135deg, #7df0ff, #00e5ff, #7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "4px 0 6px",
            letterSpacing: 0.3,
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
          }}
        >
          Rebuild From Memory!
        </h2>
        <p
          style={{
            fontSize: 15,
            color: "#c5cdf0",
            opacity: 0.92,
            margin: "0 0 18px",
            lineHeight: 1.55,
          }}
        >
          The cards are flipping face-down again. We&apos;ll show you a
          term - tap the card you remember holds the matching meaning.
          Hit them all in one go for a 3-star finish!
        </p>
        <button
          type="button"
          onClick={onStart}
          style={{
            height: 46,
            padding: "0 28px",
            border: "none",
            borderRadius: 999,
            background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
            color: "#080a16",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: 0.5,
            cursor: "pointer",
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
            boxShadow:
              "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
          }}
        >
          Start Memory Test →
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
}: {
  text: string;
  colour: string;
  matched: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        background:
          "linear-gradient(180deg, #fffaf0 0%, #fdebcb 100%)",
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: matched ? "#4a9a6a" : `${colour}88`,
        boxShadow: matched
          ? `0 0 22px ${colour}66, inset 0 0 18px ${colour}44, 0 12px 24px -8px rgba(8, 10, 22, 0.55)`
          : `0 8px 18px -6px rgba(8, 10, 22, 0.5), inset 0 0 0 1px ${colour}33`,
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        padding: 0,
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Top accent ribbon */}
      <div
        style={{
          height: 6,
          background: `linear-gradient(90deg, ${colour}aa, ${colour}, ${colour}aa)`,
        }}
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
      {/* Matched green check */}
      {matched && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#4a9a6a",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 900,
            boxShadow: "0 0 12px rgba(74, 154, 106, 0.6)",
          }}
        >
          ✓
        </div>
      )}
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
  onContinue,
  onRetry,
}: {
  mm: string;
  ss: string;
  flipCount: number;
  bestStreak: number;
  stars: number;
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
        background:
          "linear-gradient(180deg, rgba(15, 21, 48, 0.95) 0%, rgba(4, 5, 13, 0.96) 100%)",
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
          color: "#00e5ff",
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
          background:
            "linear-gradient(135deg, #00e5ff, #7c5cff, #3a7bff)",
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
            background: "rgba(15, 21, 48, 0.65)",
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
  const s = shuffle(raw);
  return s.map((c, idx) => ({ ...c, waveDelay: idx * 0.05 }));
}
