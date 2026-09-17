"use client";

/**
 * PausePower: the STOP THE BELT AND TAKE THE WHEEL drill (Week 10, "Pause Power").
 *
 * Every round is one moment on the glowing video burrow. A player fills the
 * board: the show is rolling, the belt bar under it creeps along, and on the
 * player's chrome sits the round's body bell, the signal the child's own body
 * is sending them (dry blinky eyes, a jiggly leg, the sky gone dark outside).
 * The round has two stages and neither one is timed.
 *
 * 1. HOLD. One big PAUSE button. The child presses and HOLDS it and the belt
 *    bar drains while held. Let go early and the bar simply refills: nothing
 *    is lost, nothing fails, and there is no countdown and no clock anywhere
 *    on the board. When the bar empties the belt stops and the player goes
 *    quiet.
 * 2. PICK. Three uniform cards arrive under the quiet player: "What happens
 *    next?" Exactly one is the belt's own pick (let the next one roll); the
 *    others are the child's. Tapping one of the child's cards is right (Sarah:
 *    "That's right!" + that card's `why`); tapping the belt's card teaches
 *    ("Not quite." + its `explanation` through WrongAnswerPanel) and the pick
 *    stage waits for the retry with every card still out.
 *
 * Why it is not the Pause Button, the Day Jug, Goodnight Gadgets or the
 * True-Price Lever (owner: "we never copy an exercise"): the Pause Button
 * stages a message on a device and asks for one of two moves, the Day Jug
 * pours a finite day between four cups, Goodnight Gadgets puts gadgets to bed
 * for the night, and the lever is held to print a receipt the child then
 * judges. The verb here is STOP THE BELT: the child physically holds the
 * autoplay conveyor still with their own finger until it runs out, and only a
 * stopped belt hands them the choice. The hold IS the lesson, and the pick
 * afterwards is theirs, never the belt's.
 *
 * The hold is a kid-first primitive, so it is forgiving: a generous hold
 * (HOLD_MS), a visible draining bar, a slow refill on release, no penalty and
 * no score attached to the hold at all. Mouse, pen and touch all work through
 * pointer events with pointer capture plus a window backstop, and a keyboard
 * path holds on Enter or Space while the button has focus.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once and every round's `setup` read aloud as the round opens (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), a
 * one-take spoken verdict on the pick ("That's right!" + why via VerdictVoice;
 * wrong: WrongAnswerPanel speaks "Not quite." + the card's explanation), hint
 * tiers per round, a spoken payoff on the complete beat that is gated on
 * `!verdict.speaking` so it can never cut Sarah off. Rounds play in authored
 * order; the three cards are shuffled per round. Round 1 guides the MECHANIC
 * only: the PAUSE button breathes until the belt stops, and the cards never
 * glow. Tap-only, no timer, no lose state.
 *
 * Authoring: exactly 3 cards a round, at least one with `isMine: true` (more
 * may be), each label about 26 characters or fewer (two lines on a card).
 * `setup` is the line Sarah reads as the round opens and is printed in the
 * player's caption bar; `bell` is the body signal printed on the chrome
 * (about 34 characters). Every card icon must be in PixIcon's MAP.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 +
 * board 26 (padding and border) + player 298 (chrome 42, screen 176, belt 44,
 * gaps 20, padding and border 26) + gap 14 + action slot 130 (prompt 22 + gap
 * 8 + cards 100) + strip 28 + hint gap 8 = ~543px, so the player, the PAUSE
 * button, all three cards and the strip are on screen without a scroll. At
 * 400px the cards fall into one column and nothing scrolls sideways.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as UndoTest / TestDrive.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface PauseCard { id: string; label: string; icon: string; isMine: boolean; why: string; explanation: string; }
export interface PauseRound { id: string; setup: string; bell: string; cards: PauseCard[]; }
export interface PausePowerProps {
  rounds: PauseRound[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  holdLabel?: string;     // default "HOLD TO PAUSE"
  pausedLabel?: string;   // default "PAUSED"
  nextPrompt?: string;    // default "What happens next?"
  completeTitle?: string; completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void; onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/** Fixed copy the props above do not cover (the interface is the contract with
 *  week content; these three are engine chrome, not authored content). */
const BELT_LABEL = "THE BELT";
const PICK_TOAST = "YOU PICKED!";
const WRONG_TITLE = "That one is the belt's pick";

const EMPTY_CARDS: PauseCard[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** How long a full hold takes (ms). Generous on purpose: a child's finger
 *  slips, and a short hold would feel like a reflex test. */
const HOLD_MS = 1100;
const HOLD_MS_REDUCED = 800;
/** How long an untouched belt takes to creep back to full (ms). Slower than
 *  the drain, so letting go by accident costs almost nothing. */
const REFILL_MS = 2000;
/** Longest frame step we act on, so a backgrounded tab never drains in one go. */
const MAX_STEP_MS = 64;
/** Grace period after the belt stops before a card tap counts. Invisible to
 *  the child, and never a countdown: it only swallows a tap-through. */
const TAP_THROUGH_MS = 300;
/** Geometry (px). */
const PLAYER_W = 560;
const SCREEN_H = 176;
const BELT_H = 22;
const ACTION_H = 130;
const CARD_MIN_H = 100;
const CARD_MIN_W = 190;
/** Paints. */
const DEVICE = "linear-gradient(180deg, #1b2344 0%, #0d1128 100%)";
const SCREEN = "radial-gradient(120% 120% at 50% 20%, #17224a 0%, #080c1c 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";

export default function PausePower({
  rounds,
  introTitle = "Pause Power",
  introSubtitle = "Your body rings a bell. Hold the pause button until the belt stops, then you pick what happens next.",
  introIcon = "⏸️",
  holdLabel = "HOLD TO PAUSE",
  pausedLabel = "PAUSED",
  nextPrompt = "What happens next?",
  completeTitle = "You took the wheel!",
  completeLine = "When your body rings a bell, stop the belt. What happens next is yours to pick, Cyber Hero.",
  hints,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: PausePowerProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Read-aloud chain: the how-to once as the board appears, then each round's
  // setup as it opens. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "hold" = the belt is rolling and the PAUSE button is live; "pick" = the
  // belt is stopped and the three cards are out.
  const [stage, setStage] = useState<"hold" | "pick">("hold");
  // The PAUSE button is being held right now (pointer or keyboard).
  const [held, setHeld] = useState(false);
  // The card the child picked, once it was theirs: the check lands while Sarah
  // says why, then the next moment arrives.
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // How much belt is left: 1 = rolling, 0 = stopped. A motion value, so the
  // bar drains at screen refresh without re-rendering the board every frame.
  const belt = useMotionValue(1);
  const beltWidth = useTransform(belt, (v) => `${Math.max(0, Math.min(1, v)) * 100}%`);
  const heldRef = useRef(false);
  // True for a heartbeat after the belt stops. The cards land where the PAUSE
  // button was, so a finger still down at that moment gets a short, invisible
  // grace period (a stray tap-through must never score as a wrong pick).
  const tapGuard = useRef(false);

  // Authored order for the moments; the three cards are shuffled per round so
  // the belt's own pick is never in one slot.
  const finished = idx >= rounds.length;
  const r = rounds[idx];
  const deck = useShuffledOnce(r?.cards ?? EMPTY_CARDS, { key: r?.id ?? "done" });
  const sealed = picked !== null;
  // Round 1 teaches the mechanic only: the PAUSE button breathes, nothing else.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why and the next moment waits
  // for her. Wrong picks speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || sealed;

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Read by the belt tick, so a hold that is taken back mid-drain (Sarah
  // starts speaking, a beat settles) lets go instead of draining on.
  const speakingRef = useRef(false);
  useEffect(() => {
    speakingRef.current = speaking;
  }, [speaking]);

  // Hint tiers reported once each (for the parent dashboard).
  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = totalWrongs >= 2 ? 2 : totalWrongs >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [totalWrongs, onHintReached]);

  // The belt: drains while the button is held, creeps back when it is not.
  // Never a countdown, never a fail: it only ever ends the HOLD stage.
  const drainMs = reduce ? HOLD_MS_REDUCED : HOLD_MS;
  useEffect(() => {
    if (stage !== "hold") return;
    // Nothing to animate: the belt is full and no finger is on the button.
    if (!held && belt.get() >= 1) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(MAX_STEP_MS, now - last);
      last = now;
      if (heldRef.current && speakingRef.current) {
        // The board was taken back mid-hold: let go, keep the bar where it is.
        heldRef.current = false;
        setHeld(false);
        return;
      }
      if (heldRef.current) {
        const next = Math.max(0, belt.get() - dt / drainMs);
        belt.set(next);
        if (next <= 0) {
          // The belt has run out: it stops, the player goes quiet, the choice
          // is handed to the child.
          heldRef.current = false;
          setHeld(false);
          tapGuard.current = true;
          window.setTimeout(() => {
            tapGuard.current = false;
          }, TAP_THROUGH_MS);
          setStage("pick");
          audio.transition();
          return;
        }
      } else {
        const next = Math.min(1, belt.get() + dt / REFILL_MS);
        belt.set(next);
        if (next >= 1) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [stage, held, belt, drainMs, audio]);

  // Backstop: a pointer that lifts off the button (lost capture, a drag off
  // the page, the window losing focus) still ends the hold.
  useEffect(() => {
    if (!held) return;
    const stop = () => {
      heldRef.current = false;
      setHeld(false);
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    window.addEventListener("blur", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
      window.removeEventListener("blur", stop);
    };
  }, [held]);

  const startBoard = () => {
    setShowIntro(false);
    belt.set(1);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    heldRef.current = false;
    setHeld(false);
    belt.set(1);
    setStage("hold");
    setPicked(null);
    setRoundWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── HOLD: the only untimed, unjudged, unloseable stage ───────── */
  const beginHold = () => {
    if (!r || speaking || stage !== "hold" || heldRef.current) return;
    audio.tap();
    heldRef.current = true;
    setHeld(true);
  };
  const endHold = () => {
    if (!heldRef.current) return;
    heldRef.current = false;
    setHeld(false);
  };
  const pointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!r || speaking || stage !== "hold") return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort; the window backstop covers a miss */
    }
    beginHold();
  };
  // Keyboard hold: Enter or Space down = press, up = release. Both are
  // prevented so the browser's own click-on-key never fires a second time.
  const keyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    if (e.repeat) return;
    beginHold();
  };
  const keyUp = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== " " && e.key !== "Enter") return;
    e.preventDefault();
    endHold();
  };

  /* ───────── PICK: the only judged tap ───────── */
  const pick = (c: PauseCard) => {
    if (!r || speaking || stage !== "pick" || sealed) return;
    if (tapGuard.current) return;
    const right = c.isMine;
    onAnswered?.({
      questionKey: `pausepower-${r.id}`,
      // Indexes into the round's AUTHORED card list, whatever slot the
      // shuffle put the card in.
      selectedIndex: r.cards.findIndex((x) => x.id === c.id),
      correctIndex: r.cards.findIndex((x) => x.isMine),
      wasCorrect: right,
    });
    if (right) {
      fx.correct({ xp: 25, text: PICK_TOAST });
      onCorrect?.();
      setPicked(c.id);
      // Sarah: "That's right!" + this card's why; the check lands under her,
      // then the next moment arrives.
      verdict.say("right", c.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; every
      // card stays out, so the retry is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: c.explanation, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const rolling = stage === "hold";
  const holdGlow = guided && rolling && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "ppGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = sealed
    ? PICK_TOAST
    : rolling
      ? guided
        ? "Round 1: press and HOLD the pause button until the belt stops"
        : held
          ? "Keep holding. The belt is stopping"
          : "Your body rang a bell. Hold the pause button"
      : "The belt is stopped. Tap the one YOU want";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The player: chrome, screen, belt ───────── */
  const player: ReactNode = r ? (
    <div
      style={{
        width: PLAYER_W,
        maxWidth: "100%",
        borderRadius: 24,
        background: DEVICE,
        border: `2px solid ${accent}88`,
        boxShadow: `0 0 0 3px ${accent}1f, 0 18px 36px -20px rgba(0,0,0,0.9)`,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        color: "#fff7e6",
      }}
    >
      {/* Chrome: the body bell the child is being asked to notice. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 42, padding: "0 2px" }}>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(255,209,88,0.14)",
            border: "1.5px solid rgba(255,209,88,0.6)",
            color: "#ffe3a3",
            fontFamily: KID_FONT,
            fontSize: 14,
            fontWeight: 800,
            lineHeight: 1.2,
          }}
        >
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              display: "grid",
              placeItems: "center",
              animation: rolling && !reduce ? "ppBell 2.2s ease-in-out infinite" : undefined,
              transformOrigin: "50% 15%",
            }}
          >
            <PixIcon emoji="🔔" size={22} />
          </span>
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{r.bell}</span>
        </span>
      </div>

      {/* Screen: the show rolling in the burrow, then quiet once it is stopped. */}
      <div
        style={{
          position: "relative",
          height: SCREEN_H,
          borderRadius: 18,
          overflow: "hidden",
          background: SCREEN,
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        {/* Drifting light, so a rolling show reads as moving without any clock. */}
        {rolling && !reduce && (
          <span aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  top: `${8 + i * 26}%`,
                  left: 0,
                  width: "34%",
                  height: 46,
                  borderRadius: 40,
                  filter: "blur(16px)",
                  background: i === 1 ? `${accent}55` : "rgba(255,209,88,0.28)",
                  animation: `ppDrift ${5.5 + i * 1.7}s linear infinite`,
                  animationDelay: `${i * 1.1}s`,
                }}
              />
            ))}
          </span>
        )}
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "42%",
            transform: "translate(-50%, -50%)",
            display: "grid",
            placeItems: "center",
            width: 92,
            height: 92,
            borderRadius: "50%",
            background: `radial-gradient(circle at 50% 45%, ${accent}4d 0%, rgba(8,12,28,0) 70%)`,
            opacity: rolling ? 1 : 0.25,
            transition: "opacity 300ms ease",
          }}
        >
          <PixIcon emoji="🎮" size={46} />
        </span>

        {/* Caption bar: the line Sarah reads as the moment opens. */}
        <span
          style={{
            position: "relative",
            margin: 8,
            padding: "8px 12px",
            borderRadius: 12,
            background: "rgba(6,9,22,0.78)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#fff7e6",
            fontFamily: KID_FONT,
            fontSize: 14.5,
            fontWeight: 700,
            lineHeight: 1.3,
            overflowWrap: "anywhere",
          }}
        >
          {r.setup}
        </span>

        {/* The quiet player: it only ever arrives because the child held on. */}
        <AnimatePresence>
          {!rolling && (
            <motion.span
              key={`paused-${r.id}`}
              role="status"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 340, damping: 18 }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: "rgba(5,8,20,0.72)",
                backdropFilter: "blur(3px)",
                WebkitBackdropFilter: "blur(3px)",
                pointerEvents: "none",
              }}
            >
              <PixIcon emoji="⏸️" size={54} />
              <span style={{ fontFamily: LABEL_FONT, fontSize: 20, fontWeight: 900, letterSpacing: "0.22em", color: "#9dfbbd", textShadow: "0 0 18px rgba(52,211,153,0.5)" }}>
                {pausedLabel}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* The belt: a length, not a clock. It creeps while it rolls, drains
          while the button is held, and creeps back when the finger lifts. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 34, padding: "0 2px" }}>
        <span style={{ ...eyebrowStyle, flexShrink: 0 }}>{BELT_LABEL}</span>
        <span
          aria-hidden
          style={{
            position: "relative",
            flex: 1,
            minWidth: 0,
            height: BELT_H,
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.16)",
            boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          <motion.span
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: beltWidth,
              borderRadius: 999,
              // Belt slats: a 90deg repeating gradient, so creeping it by
              // exactly one 28px period loops seamlessly.
              background: rolling
                ? `repeating-linear-gradient(90deg, ${accent} 0 14px, ${accent}99 14px 28px)`
                : "repeating-linear-gradient(90deg, #7c8496 0 14px, #5a6274 14px 28px)",
              animation: rolling && !reduce ? "ppCreep 0.9s linear infinite" : undefined,
              boxShadow: rolling ? `0 0 14px ${accent}66` : "none",
            }}
          />
        </span>
        <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center", opacity: rolling ? 1 : 0.45 }}>
          <PixIcon emoji={rolling ? "🎮" : "✋"} size={22} />
        </span>
      </div>
    </div>
  ) : null;

  /* ───────── The action slot: the PAUSE button, then the three cards ───────── */
  const renderCard = (c: PauseCard, order: number): ReactNode => {
    if (!r) return null;
    const chosen = picked === c.id;
    return (
      <motion.button
        key={`${r.id}-${c.id}`}
        type="button"
        aria-label={c.label}
        onClick={() => pick(c)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : order * 0.08 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${CARD_MIN_W}px`,
          minWidth: 0,
          minHeight: CARD_MIN_H,
          padding: "10px 12px",
          borderRadius: 16,
          // Every card wears the same paper, size and ink, every round: the
          // belt's own pick looks exactly like the child's own choices.
          background: PAPER,
          border: "3px solid #ffffff",
          boxShadow: "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          fontFamily: KID_FONT,
          fontSize: 15,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
        }}
      >
        <PixIcon emoji={c.icon} size={30} />
        <span style={{ overflowWrap: "anywhere" }}>{c.label}</span>
        {chosen && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
            style={{ position: "absolute", top: -10, right: -8, display: "grid", placeItems: "center" }}
          >
            <PixIcon emoji="✅" size={26} />
          </motion.span>
        )}
      </motion.button>
    );
  };

  const action: ReactNode = r ? (
    <div style={{ width: "100%", minHeight: ACTION_H, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
      {rolling ? (
        <button
          type="button"
          aria-label={holdLabel}
          aria-pressed={held}
          disabled={speaking}
          onPointerDown={pointerDown}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onLostPointerCapture={endHold}
          onKeyDown={keyDown}
          onKeyUp={keyUp}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            width: 300,
            maxWidth: "100%",
            minHeight: 78,
            padding: "14px 20px",
            borderRadius: 22,
            background: held
              ? `linear-gradient(180deg, ${accent} 0%, ${accent}cc 100%)`
              : `linear-gradient(180deg, ${accent}dd 0%, ${accent}88 100%)`,
            border: `3px solid ${held ? "#ffffff" : `${accent}`}`,
            color: "#08122c",
            fontFamily: LABEL_FONT,
            fontSize: 17,
            fontWeight: 900,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            lineHeight: 1.1,
            cursor: speaking ? "wait" : "pointer",
            transform: held && !reduce ? "translateY(3px) scale(0.98)" : "none",
            transition: "transform 90ms ease-out, background 160ms ease, border-color 160ms ease",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            opacity: speaking ? 0.7 : 1,
            ...guideStyle(holdGlow),
          }}
        >
          <PixIcon emoji="⏸️" size={30} />
          <span>{holdLabel}</span>
        </button>
      ) : (
        <>
          <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <PixIcon emoji="❓" size={16} />
            {nextPrompt}
          </div>
          <div
            role="group"
            aria-label={nextPrompt}
            style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
          >
            {deck.map(renderCard)}
          </div>
        </>
      )}
    </div>
  ) : null;

  return (
    <ExerciseFrame maxWidth={860} decor>
      {fx.layer()}
      {verdict.element}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each moment. */}
      {!showIntro && !finished && r && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="pp-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`pp-read-${r.id}`} speaker={voice} lines={[r.setup]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && r && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Round {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </span>
          </div>

          {/* The board: the player, and under it the PAUSE button or the cards. */}
          <div
            style={{
              margin: "0 14px",
              padding: "12px 12px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 14,
            }}
          >
            {player}
            {action}
          </div>

          {/* On-board instructions: the current beat, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes ppGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
            @keyframes ppCreep { from { background-position: 0 0 } to { background-position: 28px 0 } }
            @keyframes ppBell { 0%,72%,100% { transform: rotate(0deg) } 76% { transform: rotate(-13deg) } 82% { transform: rotate(11deg) } 88% { transform: rotate(-7deg) } 94% { transform: rotate(4deg) } }
            @keyframes ppDrift { from { transform: translateX(-40%) } to { transform: translateX(330%) } }
          `}</style>
        </div>
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => setFeedback(null)}
        />
      )}

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          verdict is still speaking would cut her off (the Week 9 bug). */}
      {finished && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${rounds.length} belt${rounds.length === 1 ? "" : "s"} stopped, ${rounds.length} pick${rounds.length === 1 ? "" : "s"} made by you`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
