"use client";

import { useEffect, useMemo, useRef, useState } from "react";
// playSound KEPT for the "pop" cue (safe-email-through) which has no
// useGameAudio facade equivalent. Flagged in migration report.
import { playSound } from "@/app/lib/sounds";
// KEPT + FLAGGED: correctAnswerBurst (no toolkit equivalent),
// intensity-gated below via intensityRef.
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import ExerciseIntroBeat from "@/app/components/lesson/ExerciseBeats";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import { PixarFinishOverlay } from "@/app/components/scene";
// useComfortMode KEPT (not collapsed into useMotionIntensity). Reason:
// comfortRef.current feeds game-timing logic (line ~449: parallel-card
// cap; line ~476: card-speed halving). useMotionIntensity would
// conflate OS reduced-motion with the user comfort toggle, changing
// difficulty for prefers-reduced-motion users. Flagged in report.
import { useComfortMode } from "@/app/lib/comfortMode";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import {
  setupHiDpiCanvas,
  scaledParticleCount,
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";

export interface SpamEmail {
  sender: string;
  subject: string;
  isPhishing: boolean;
  clue: string;
  /** Sarah's reason on a RIGHT answer ("That's right!" + why). Defaults to the clue. */
  why?: string;
}

export interface SpamBlasterProps {
  emails?: SpamEmail[];
  /** Intro card copy overrides (defaults keep the Week 1-era Spam Blaster skin). */
  introTitle?: string;
  introDescription?: string;
  /** In-canvas goal headline override (default "⚡ ZAP THE VIRUS EMAILS! ⚡"). */
  headline?: string;
  /** HUD label for phishing emails that slipped through (default "VIRUSES"). */
  missLabel?: string;
  /** Intro card icon (default "📧"; PixIcon key). */
  introIcon?: string;
  /** Tiered wrong-try hints (defaults keep the Week 1 email copy). */
  hints?: { tier1: string; tier2: string; tier2Example?: string; tier3?: string };
  /** Spoken, paced intro. When present the rich narrated ExerciseIntroBeat
   *  replaces the legacy ExerciseIntro card. */
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Spot-the-Danger boast folded into the narrated intro (Learn Loop). */
  threat?: { raccoonLine: string };
  /** Spoken "you're protected" payoff read on the finish overlay (recorded only). */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /**
   * Per-week copy so a re-theme is a genuine re-theme (owner rule: never copy
   * an exercise). Templates may use {sender}, {subject} and {clue}. Defaults keep
   * the Week 4-era email skin.
   */
  copy?: SpamBlasterCopy;
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  /** See CyberScanner.onHintReached - same tier semantics. */
  onHintReached?: (tier: 1 | 2 | 3) => void;
}

export interface SpamBlasterCopy {
  /** Device app-bar title drawn in the monitor (default "◆ AlgorithmX Mail"). */
  deviceTitle?: string;
  /** Label of the safe pile (default "INBOX"). */
  inboxLabel?: string;
  /** Singular / plural word for tricks that got through (default "VIRUS"/"VIRUSES"). */
  missWord?: string;
  missWordPlural?: string;
  /** Status when nothing got through (default "ALL CLEAR"). */
  clearLabel?: string;
  /** Floater + wrong panel when the child zaps a SAFE card. */
  safeFloater?: string;
  safeWrongTitle?: string;
  safeWrongExplanation?: string;
  safeWrongTip?: string;
  /** Wrong panel when a TRICK reaches the device. */
  missTitle?: string;
  missExplanation?: string;
  missClueFallback?: string;
  missTip?: string;
  /** Finish overlay title + the "delivered" word in its subline. */
  finishTitle?: string;
  deliveredWord?: string;
}

const DEFAULT_COPY: Required<SpamBlasterCopy> = {
  deviceTitle: "◆ AlgorithmX Mail",
  inboxLabel: "INBOX",
  missWord: "VIRUS",
  missWordPlural: "VIRUSES",
  clearLabel: "ALL CLEAR",
  safeFloater: "OOPS! That was a real email!",
  safeWrongTitle: "That email was real!",
  safeWrongExplanation:
    '"{sender}" was a normal email - not phishing. Only zap messages that look like tricks (free prizes, URGENT password demands, scary pop-ups).',
  safeWrongTip: "Real friends, teachers and parents are NOT bait. Read the sender first.",
  missTitle: "A phishing email got through!",
  missExplanation: '"{subject}" from "{sender}" was bait. {clue}',
  missClueFallback: "Look for scare tactics, urgent passwords or free prizes.",
  missTip: "Phishing emails try to RUSH or REWARD you. Slow down and check.",
  finishTitle: "DEFENCE COMPLETE!",
  deliveredWord: "Delivered",
};

const DEFAULT_EMAILS: SpamEmail[] = [
  { sender: "Prize Central", subject: "YOU WON A FREE iPHONE!", isPhishing: true, clue: "Too good to be true" },
  { sender: "Security Team", subject: "URGENT: Enter your password NOW!", isPhishing: true, clue: "Real banks never ask for passwords" },
  { sender: "Sam", subject: "Funny video from school!", isPhishing: false, clue: "" },
  { sender: "V-Bucks Giveaway", subject: "FREE 10,000 V-BUCKS! Click here!", isPhishing: true, clue: "Free offers are usually scams" },
  { sender: "School Admin", subject: "Reminder: PE kit tomorrow", isPhishing: false, clue: "" },
  { sender: "Your School", subject: "Your school needs your password", isPhishing: true, clue: "Schools never ask for passwords by email" },
  { sender: "Mrs Johnson", subject: "Homework reminder for Monday", isPhishing: false, clue: "" },
  { sender: "Lucky Visitor", subject: "CONGRATULATIONS! You are our 1,000,000th visitor!", isPhishing: true, clue: "No website tracks visitors this way" },
  { sender: "Grandma", subject: "Happy birthday next week!", isPhishing: false, clue: "" },
  { sender: "Account Security", subject: "Verify your account or it will be DELETED", isPhishing: true, clue: "Scare tactics = phishing" },
];

const CANVAS_W = 720;
const CANVAS_H = 500;
/**
 * Owner, 2026-10-17: "the messages are coming in too quick and you can't see
 * them all as well, so you struggle to read... make it clear on the message
 * on what it's saying so they can see it And to have a bit more time to
 * decide."
 *
 * The card was 180x60, which fits about 26 characters on its one subject
 * line. Week 2's subjects run to a median of 37 characters and a longest of
 * 44, so NINE of its eleven cards were drawn truncated: "Use your REAL NAME
 * a...". The cut-off half is the entire basis of the decision, and the child
 * was being asked to judge a message they were not shown.
 *
 * So the card now fits the text instead of cutting it: wider, taller, and the
 * subject wraps to two lines. Sized against the real content (44 characters
 * at 11px is ~2 lines here), not guessed.
 */
const EMAIL_W = 236;
const EMAIL_H = 78;
const MONITOR_X = CANVAS_W / 2;
const MONITOR_Y = CANVAS_H - 95;
const MONITOR_W = 200;
const MONITOR_H = 140;

// CYBER TURRET - fires DOWN from the top of the play area at viruses
// (the user wanted the firing source at the top, not the bottom-
// monitor only). The monitor stays for the inbox readout; the turret
// is the active "you're aiming this" element.
const TURRET_X = CANVAS_W / 2;
const TURRET_Y = 90;

interface LiveEmail {
  idx: number;
  sender: string;
  subject: string;
  isPhishing: boolean;
  clue: string;
  why?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  alive: boolean;
  resolved: boolean;
  // Shrink phase when entering the monitor (safe success)
  enteringMonitor: boolean;
  scale: number;
}

interface Fragment {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  life: number;
  colour: string;
  size: number;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
  colour: string;
  bornAt: number;
  duration: number;
}

interface ClueBubble {
  id: number;
  x: number;
  y: number;
  text: string;
  bornAt: number;
}

/**
 * How fast a packet crosses the screen.
 *
 * Owner, 2026-10-17: "the messages are coming in too quick... so you struggle
 * to read. So maybe slow them down... And to have a bit more time to decide."
 *
 * This used to ramp 0.75, 1, 1.4, 1.8, so by the eighth packet they travelled
 * 2.4 times as fast as the opening one. Week 2 authors eleven of them, so a
 * child spent the last four at full speed. Together with three cards on
 * screen at once (below) and a flat spawn gap, that is a game that races a
 * six-year-old, which the kid-first contract in the build standard rules out
 * in as many words.
 *
 * The ramp stays - it should still build - but it tops out at 1.2 rather than
 * 1.8, so the last packet is a third faster than the first instead of nearly
 * two and a half times.
 */
function speedForIndex(i: number) {
  // First email flies slower than base - a learning lap after the intro.
  if (i === 0) return 0.7;
  if (i < 4) return 0.85;
  if (i < 7) return 1;
  return 1.2;
}

/**
 * How many packets may share the screen.
 *
 * Was 1, then 2, then 3. Three cards on a 720x500 canvas is what buried "Dad
 * - Pizza for dinner tonig..." underneath "...nder - Share your location
 * so...", with neither readable. Two is the ceiling now, and the cards are
 * larger than they were, so even two need the extra spacing below.
 */
function maxParallel(i: number) {
  if (i < 4) return 1;
  return 2;
}

/**
 * How long to wait before sending the next one.
 *
 * Was a flat 2500ms however fast the packets were travelling, so as the speed
 * ramped the distance between them closed and they bunched. Scaling the gap
 * by the speed keeps the SPACING even all the way through, which is what a
 * child actually experiences.
 *
 * Reading time also scales with how much there is to read: a 44-character
 * subject needs longer than a 12-character one, and giving every packet the
 * same flight regardless was part of why the long ones felt impossible.
 */
function spawnGapMs(i: number, subjectLength: number) {
  const base = 2600 / speedForIndex(i);
  const toRead = Math.min(1200, Math.max(0, subjectLength - 20) * 26);
  return Math.round(base + toRead);
}

export default function SpamBlaster({
  emails,
  introTitle,
  introDescription,
  headline,
  missLabel,
  introIcon,
  hints,
  introNarration,
  threat,
  completeNarration,
  copy,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
}: SpamBlasterProps) {
  const list = useMemo(() => emails ?? DEFAULT_EMAILS, [emails]);
  const headlineText = headline ?? "⚡ ZAP THE VIRUS EMAILS! ⚡";
  const missLabelText = missLabel ?? "VIRUSES";
  const cp = useMemo(() => ({ ...DEFAULT_COPY, ...(copy ?? {}) }), [copy]);
  const fill = (tpl: string, em: { sender: string; subject: string; clue: string }) =>
    tpl
      .replace(/\{sender\}/g, em.sender)
      .replace(/\{subject\}/g, em.subject)
      .replace(/\{clue\}/g, em.clue || cp.missClueFallback);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const comfort = useComfortMode();
  const comfortRef = useRef(comfort.enabled);
  useEffect(() => {
    comfortRef.current = comfort.enabled;
  }, [comfort.enabled]);
  // Toolkit hooks. `intensityRef` mirrors intensity so the rAF/game
  // loops can read the current value without stale closures.
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const intensityRef = useRef(intensity);
  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  // Pause-on-wrong overlay. While `feedback` is set, the game loop
  // stops moving emails and spawning, and pointer input is ignored.
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  // Spoken verdicts (owner 2026-09-12): a zap = "That's right!" + the clue;
  // a real email zapped / a phish that got through speaks via the panel. The
  // game holds while she speaks, exactly as it does for the panel.
  const verdict = useVerdictVoice();
  const pausedRef = useRef(false);
  const [wrongCount, setWrongCount] = useState(0);

  /**
   * The hint gets a reading window, and the game holds while it is up.
   *
   * Owner, 2026-10-17: "The bigger hint is blocking the screen."
   *
   * It was pinned `bottom: 12` across the full width, which is exactly where
   * the Hero Vault sits. Worse than the overlap was the timing: the hint
   * arrives BECAUSE the child is struggling, it lands on the thing they are
   * being asked to watch, and the grabs keep flying while it is up. The help
   * actively cost them the round.
   *
   * Moving it is not available - the canvas has a HUD on top, the vault at
   * the bottom and the packets in between, so every position covers
   * something. So the rule from the register applies the other way round: it
   * may not cover LIVE gameplay, so while it is up there is no live
   * gameplay. The game holds, exactly as it already does for the wrong-answer
   * panel and for a spoken verdict, then the hint clears and play resumes.
   *
   * The window scales with how much there is to read, for the same reason
   * the spawn gap does.
   */
  const [hintHolding, setHintHolding] = useState(false);
  useEffect(() => {
    pausedRef.current = !!feedback || verdict.speaking || hintHolding;
  }, [feedback, verdict.speaking, hintHolding]);

  useEffect(() => {
    if (wrongCount === 0 || feedback) return;
    const tierText =
      wrongCount === 1 ? hints?.tier1 : wrongCount === 2 ? hints?.tier2 : hints?.tier3 ?? hints?.tier2;
    /* ~55ms a character is an unhurried read-aloud pace for this age, with a
     * floor so a short hint still lands and a ceiling so the hold never feels
     * like the game has frozen. */
    const ms = Math.min(9000, Math.max(3600, (tierText ?? "").length * 55));
    setHintHolding(true);
    const t = window.setTimeout(() => setHintHolding(false), ms);
    return () => window.clearTimeout(t);
  }, [wrongCount, feedback, hints]);

  // Hint-tier emission. Same convention as CyberScanner: tier 1 at
  // first wrong, tier 2 at second, tier 3 at third or more. Hook
  // dedupes by max-per-screen so over-emit is safe.
  useEffect(() => {
    if (!onHintReached) return;
    if (wrongCount === 0) return;
    const tier: 1 | 2 | 3 = wrongCount === 1 ? 1 : wrongCount === 2 ? 2 : 3;
    onHintReached(tier);
  }, [wrongCount, onHintReached]);

  const state = useRef({
    spawnedIdx: 0,
    nextSpawnAt: 0,
    live: [] as LiveEmail[],
    fragments: [] as Fragment[],
    floaters: [] as Floater[],
    clues: [] as ClueBubble[],
    bullets: [] as {
      id: number;
      sx: number; sy: number;
      tx: number; ty: number;
      bornAt: number;
      duration: number;
      colour: string;
      kind: "phishing" | "safe";
    }[],
    bulletId: 0,
    fragmentId: 0,
    floaterId: 0,
    clueId: 0,
    zapped: 0,
    totalPhishing: 0,
    inbox: 0,
    totalSafe: 0,
    viruses: 0,
    streak: 0,
    bestStreak: 0,
    monitorFlashColour: null as string | null,
    monitorFlashUntil: 0,
    monitorShakeUntil: 0,
    finished: false,
    // Crosshair tracking - follows mouse position over canvas so the
    // kid feels they're actively aiming. Null when cursor is off-canvas.
    cursorX: null as number | null,
    cursorY: null as number | null,
  });

  const [render, setRender] = useState(0);

  useEffect(() => {
    const s = state.current;
    s.totalPhishing = list.filter((e) => e.isPhishing).length;
    s.totalSafe = list.length - s.totalPhishing;
  }, [list]);

  // Track mouse position for the aiming crosshair
  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    state.current.cursorX = (e.clientX - rect.left) * scale;
    state.current.cursorY = (e.clientY - rect.top) * scale;
  };
  const onPointerLeave = () => {
    state.current.cursorX = null;
    state.current.cursorY = null;
  };

  // Hit test on canvas pointer
  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    // Swallow pointer input while the wrong-answer panel is open.
    if (pausedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;

    // find front-most live email under point
    const s = state.current;
    const hit = [...s.live]
      .reverse()
      .find(
        (em) =>
          !em.resolved &&
          em.alive &&
          Math.abs(x - em.x) < (EMAIL_W / 2) * em.scale &&
          Math.abs(y - em.y) < (EMAIL_H / 2) * em.scale
      );
    if (!hit) return;

    // Fire a visible laser bullet from the monitor (the user's "device")
    // up at the email. The actual zap/nudge logic runs after the bullet
    // travels for ~140ms so the visual feedback feels causal.
    const now = performance.now();
    const phishing = hit.isPhishing;
    state.current.bullets.push({
      id: ++state.current.bulletId,
      // Fire from the cyber turret at the TOP - bullet travels DOWN
      // to the email's mid-fall position. (Old bullet source was the
      // monitor at the bottom firing UP, which the user said felt
      // like a different metaphor.)
      sx: TURRET_X,
      sy: TURRET_Y + 18,
      tx: hit.x,
      ty: hit.y,
      bornAt: now,
      duration: 140,
      colour: phishing ? "#ff5577" : "#00e5ff",
      kind: phishing ? "phishing" : "safe",
    });
    audio.tap();
    window.setTimeout(() => {
      if (phishing) zapPhishing(hit);
      else nudgeSafe(hit);
    }, 140);
  };

  const spawnFragments = (em: LiveEmail, colour: string, count: number) => {
    const s = state.current;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 4;
      s.fragments.push({
        id: ++s.fragmentId,
        x: em.x,
        y: em.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        life: 700,
        colour,
        size: 6 + Math.random() * 8,
      });
    }
  };

  const addFloater = (text: string, x: number, y: number, colour: string, duration = 900) => {
    const s = state.current;
    s.floaters.push({
      id: ++s.floaterId,
      x,
      y,
      text,
      colour,
      bornAt: performance.now(),
      duration,
    });
  };

  const addClue = (text: string, x: number, y: number) => {
    const s = state.current;
    s.clues.push({
      id: ++s.clueId,
      x,
      y,
      text: `Clue: ${text}`,
      bornAt: performance.now(),
    });
  };

  const zapPhishing = (em: LiveEmail) => {
    const s = state.current;
    if (em.resolved) return;
    em.resolved = true;
    em.alive = false;
    spawnFragments(em, "#ef4444", scaledParticleCount(10 + Math.floor(Math.random() * 4)));
    addFloater("ZAP!", em.x, em.y, "#ff5fb3", 800);
    if (em.clue) addClue(em.clue, em.x, em.y - 40);
    s.zapped += 1;
    s.streak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
    audio.correct();
    onCorrect?.();
    verdict.say("right", em.why ?? (em.clue || null));
  };

  const nudgeSafe = (em: LiveEmail) => {
    addFloater(cp.safeFloater, em.x, em.y - 30, "#ffd158", 1100);
    audio.wrong();
    state.current.streak = 0;
    onWrong?.();
    // NB: do NOT perturb em.vx here. A velocity kick could knock the real
    // email off its path to the monitor so it never resolves; combined with
    // the off-screen reclaim below that used to be a hard dead-end. The email
    // keeps its course and delivers to the monitor normally.
    setWrongCount((n) => n + 1);
    setFeedback({
      title: cp.safeWrongTitle,
      explanation: fill(cp.safeWrongExplanation, em),
      tip: cp.safeWrongTip,
    });
  };

  const pinPhishingHit = (em: LiveEmail) => {
    const s = state.current;
    em.resolved = true;
    em.alive = false;
    s.viruses += 1;
    s.streak = 0;
    s.monitorFlashColour = "#ef4444";
    s.monitorFlashUntil = performance.now() + 380;
    s.monitorShakeUntil = performance.now() + 380;
    addFloater("HACKED!", MONITOR_X, MONITOR_Y - MONITOR_H / 2 - 20, "#ef4444", 1200);
    audio.wrong();
    onWrong?.();
    setWrongCount((n) => n + 1);
    setFeedback({
      title: cp.missTitle,
      explanation: fill(cp.missExplanation, em),
      tip: cp.missTip,
    });
  };

  const gotIt = () => {
    setFeedback(null);
  };

  const safeDelivered = (em: LiveEmail) => {
    const s = state.current;
    em.resolved = true;
    em.alive = false;
    s.inbox += 1;
    s.streak += 1;
    s.bestStreak = Math.max(s.bestStreak, s.streak);
    s.monitorFlashColour = "#7eff97";
    s.monitorFlashUntil = performance.now() + 280;
    playSound("pop");
    onCorrect?.();
    // A real email reached the inbox: a quiet right call, spoken when authored.
    if (em.why) verdict.say("right", em.why);
  };

  const resetExercise = () => {
    state.current = {
      spawnedIdx: 0,
      nextSpawnAt: 0,
      live: [],
      fragments: [],
      floaters: [],
      clues: [],
      bullets: [],
      bulletId: 0,
      fragmentId: 0,
      floaterId: 0,
      clueId: 0,
      zapped: 0,
      totalPhishing: list.filter((e) => e.isPhishing).length,
      inbox: 0,
      totalSafe: list.length - list.filter((e) => e.isPhishing).length,
      viruses: 0,
      streak: 0,
      bestStreak: 0,
      monitorFlashColour: null,
      monitorFlashUntil: 0,
      monitorShakeUntil: 0,
      finished: false,
      cursorX: null,
      cursorY: null,
    };
    setShowIntro(true);
    setResetKey((k) => k + 1);
    setRender((n) => n + 1);
    setFeedback(null);
    setWrongCount(0);
  };

  useEffect(() => {
    if (showIntro) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Hi-DPI setup: previously the canvas buffer was pinned to 720×500
    // and CSS-stretched, which gave soft email text on Retina. Now we
    // size the buffer to logical * dpr and scale the context once.
    const setup = setupHiDpiCanvas(canvas, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    if (!setup) return;
    const ctx = setup.ctx;

    let running = true;
    let lastTime = performance.now();
    // Longer lead-in after the intro dismisses - 2 s grace before first email.
    state.current.nextSpawnAt = performance.now() + 2000;

    const onVis = () => {
      // After tab return, rebaseline so emails don't teleport.
      if (document.hidden) lastTime = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    const trySpawn = (now: number) => {
      const s = state.current;
      if (s.spawnedIdx >= list.length) return;
      const aliveCount = s.live.filter((e) => e.alive && !e.resolved).length;
      // Comfort mode caps simultaneous targets at 1 - no parallel
      // moving objects, no perceptual overload.
      const cap = comfortRef.current ? 1 : maxParallel(s.spawnedIdx);
      if (aliveCount >= cap) return;
      if (now < s.nextSpawnAt) return;
      const em = list[s.spawnedIdx];
      /* The band a side-entering packet may fly through.
       *
       * It used to start at y=60 with the card's own half-height added on
       * top, so a card's top edge could reach y=21 - straight across the goal
       * headline drawn at y=56. Caught on the first frame of a verification
       * run: "Kitten Quiz" sitting over "ZAP THE RACCOON'S GRABS!". The
       * taller card from W2-9 made it worse, because the half-height grew
       * with it.
       *
       * So the band is derived from the real geometry rather than a literal:
       * it begins below the headline with clearance and ends above the vault,
       * so a packet can never spawn on top of either. */
      const HEADLINE_BOTTOM = 56 + 14;
      const laneTop = HEADLINE_BOTTOM + EMAIL_H / 2 + 10;
      const laneBottom = MONITOR_Y - MONITOR_H / 2 - EMAIL_H / 2 - 10;
      const laneSpan = Math.max(40, laneBottom - laneTop);

      // random edge spawn
      const edge = Math.floor(Math.random() * 4);
      let x = 0;
      let y = 0;
      if (edge === 0) {
        x = -EMAIL_W;
        y = laneTop + Math.random() * laneSpan;
      } else if (edge === 1) {
        x = CANVAS_W + EMAIL_W;
        y = laneTop + Math.random() * laneSpan;
      } else if (edge === 2) {
        x = 60 + Math.random() * (CANVAS_W - 120);
        y = -EMAIL_H;
      } else {
        x = 60 + Math.random() * (CANVAS_W - 120);
        y = -EMAIL_H - 40;
      }
      const dx = MONITOR_X - x;
      const dy = MONITOR_Y - MONITOR_H / 2 - y;
      const len = Math.max(1, Math.hypot(dx, dy));
      // Comfort mode reduces approach speed so children have time to
      // read both the sender and the subject before deciding.
      const speed =
        speedForIndex(s.spawnedIdx) * (comfortRef.current ? 0.5 : 1);
      s.live.push({
        idx: s.spawnedIdx,
        sender: em.sender,
        subject: em.subject,
        isPhishing: em.isPhishing,
        clue: em.clue,
        why: em.why,
        x,
        y,
        vx: (dx / len) * speed,
        vy: (dy / len) * speed,
        speed,
        alive: true,
        resolved: false,
        enteringMonitor: false,
        scale: 1,
      });
      s.spawnedIdx += 1;
      // Gap scales with BOTH the speed and how much there is to read, so the
      // spacing a child sees stays even and a long subject gets longer to be
      // read in. Comfort mode stretches it further, as it does the speed.
      s.nextSpawnAt =
        now + spawnGapMs(s.spawnedIdx, (em.subject ?? "").length) * (comfortRef.current ? 1.4 : 1);
    };

    /**
     * The Hero Vault.
     *
     * Owner, 2026-10-17: "The Hero Vault, I think we can make it look much
     * cooler. And much more modern."
     *
     * It used to be a fake app window: a bezel, a title bar with three
     * traffic-light dots, placeholder "message rows" drawn as grey stripes,
     * and a footer status bar. That is a 2010 screenshot of a mail client,
     * and none of it meant anything - the stripes were decoration standing in
     * for messages the child never reads.
     *
     * It is now a DEVICE: a glass shell with a lit aperture at the top where
     * packets actually land, a segmented capacity meter that fills as
     * treasures are kept safe, and an under-glow that reacts when a grab gets
     * through. Everything drawn now carries information.
     *
     * The readout stays - it is the diegetic one kept when the duplicate
     * third counter was removed - but it reads as part of the device rather
     * than as a window's chrome.
     */
    const drawMonitor = (now: number) => {
      const s = state.current;
      const flashing = s.monitorFlashColour && now < s.monitorFlashUntil;
      const shakeAmt = now < s.monitorShakeUntil ? (Math.random() - 0.5) * 6 : 0;
      const mx = MONITOR_X + shakeAmt;
      const my = MONITOR_Y + (now < s.monitorShakeUntil ? (Math.random() - 0.5) * 4 : 0);
      const left = mx - MONITOR_W / 2;
      const top = my - MONITOR_H / 2;
      /* `monitorFlashColour` is nullable and `flashing` already proves it is
         set; the fallback keeps the type honest without a non-null assertion. */
      const accentHue = (flashing && s.monitorFlashColour) || "#00e5ff";
      const breathe = 0.5 + 0.5 * Math.sin(now * 0.0016);

      /* Under-glow: the vault sits in its own pool of light, so it reads as
       * an object standing on the floor rather than a rectangle pasted on. */
      const pool = ctx.createRadialGradient(mx, my + MONITOR_H / 2, 4, mx, my + MONITOR_H / 2, MONITOR_W * 0.95);
      pool.addColorStop(0, flashing ? "rgba(239,68,68,0.34)" : "rgba(0,229,255,0.22)");
      pool.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = pool;
      ctx.fillRect(mx - MONITOR_W, my - 10, MONITOR_W * 2, MONITOR_H);

      /* Shell: a soft vertical gradient with a lit top edge, which is what
       * separates a modern device from a flat box. */
      const shell = ctx.createLinearGradient(0, top, 0, top + MONITOR_H);
      shell.addColorStop(0, "rgba(38,52,104,0.97)");
      shell.addColorStop(0.5, "rgba(17,24,56,0.98)");
      shell.addColorStop(1, "rgba(9,13,30,0.99)");
      ctx.fillStyle = shell;
      roundRect(ctx, left, top, MONITOR_W, MONITOR_H, 20);
      ctx.fill();

      ctx.strokeStyle = flashing ? accentHue : "rgba(125,240,255,0.55)";
      ctx.lineWidth = flashing ? 3 : 1.6;
      roundRect(ctx, left, top, MONITOR_W, MONITOR_H, 20);
      ctx.stroke();

      /* A highlight along the top edge only - the cheapest way to say glass. */
      ctx.strokeStyle = "rgba(255,255,255,0.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left + 18, top + 1.5);
      ctx.lineTo(left + MONITOR_W - 18, top + 1.5);
      ctx.stroke();

      /* THE APERTURE. Packets fly at the vault and vanish; there was never
       * anywhere for them to GO. This is the slot they land in, and it
       * brightens as it accepts one. */
      const slotW = MONITOR_W * 0.56;
      const slotX = mx - slotW / 2;
      const slotY = top + 13;
      ctx.fillStyle = "rgba(4,8,22,0.95)";
      roundRect(ctx, slotX, slotY, slotW, 9, 5);
      ctx.fill();
      const slotGlow = ctx.createLinearGradient(slotX, 0, slotX + slotW, 0);
      slotGlow.addColorStop(0, "rgba(0,229,255,0)");
      slotGlow.addColorStop(0.5, `rgba(125,240,255,${0.5 + breathe * 0.4})`);
      slotGlow.addColorStop(1, "rgba(0,229,255,0)");
      ctx.fillStyle = slotGlow;
      roundRect(ctx, slotX + 2, slotY + 2.5, slotW - 4, 4, 2);
      ctx.fill();

      /* Label, set in the lesson's own face rather than Courier. */
      ctx.font = "800 11px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(190,214,255,0.92)";
      ctx.fillText(cp.deviceTitle.replace(/^[^A-Za-z]+/, ""), mx, slotY + 17);

      /* CAPACITY METER: one segment per treasure that can be kept safe, so
       * the child can see how much is secured at a glance. This replaces
       * three grey placeholder "message rows" that stood for nothing. */
      const total = Math.max(1, s.totalSafe);
      const gap = 3;
      const meterW = MONITOR_W - 44;
      const segW = (meterW - gap * (total - 1)) / total;
      const meterX = mx - meterW / 2;
      const meterY = top + MONITOR_H * 0.56;
      for (let i = 0; i < total; i++) {
        const on = i < s.inbox;
        const x = meterX + i * (segW + gap);
        ctx.fillStyle = on ? "rgba(126,255,151,0.92)" : "rgba(125,240,255,0.13)";
        roundRect(ctx, x, meterY, segW, 7, 3);
        ctx.fill();
        if (on) {
          ctx.strokeStyle = "rgba(126,255,151,0.5)";
          ctx.lineWidth = 1;
          roundRect(ctx, x, meterY, segW, 7, 3);
          ctx.stroke();
        }
      }

      /* The readout. Kept because it is the device showing its own contents;
       * the duplicate floating copy above the vault was removed separately. */
      ctx.font = "800 10px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "rgba(126,255,151,0.95)";
      ctx.fillText(`${cp.inboxLabel} ${s.inbox}/${s.totalSafe}`, mx, meterY + 13);

      /* Breach line: only drawn when something actually got through, so a
       * clean run shows a clean device rather than a permanent status bar. */
      if (s.viruses > 0) {
        ctx.font = "800 9px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(252,165,165,0.95)";
        ctx.fillText(
          `${s.viruses} ${s.viruses > 1 ? cp.missWordPlural : cp.missWord} GOT IN`,
          mx,
          meterY + 27,
        );
      }

      /* Feet, so it stands on the floor grid instead of floating. */
      ctx.fillStyle = "rgba(125,240,255,0.22)";
      roundRect(ctx, mx - 46, my + MONITOR_H / 2, 92, 7, 3);
      ctx.fill();
      ctx.fillStyle = "rgba(125,240,255,0.12)";
      roundRect(ctx, mx - 68, my + MONITOR_H / 2 + 7, 136, 5, 2);
      ctx.fill();

      if (flashing) {
        ctx.shadowColor = accentHue;
        ctx.shadowBlur = 30;
        ctx.strokeStyle = accentHue;
        ctx.lineWidth = 3;
        roundRect(ctx, left, top, MONITOR_W, MONITOR_H, 20);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // There used to be a third "KEPT SAFE 2/5" floating above the vault.
      // The same figure was already in the HUD top-right AND on the device
      // itself, so one board carried it three times over - noise on a game a
      // child is reading at speed. Removed, as the duplicate streak readout
      // was before it.
    };

    const drawEmail = (em: LiveEmail) => {
      ctx.save();
      ctx.translate(em.x, em.y);
      ctx.scale(em.scale, em.scale);

      // HOLOGRAPHIC ENVELOPE - translucent dark glass body, animated
      // chromatic edge, soft scan-line texture. Reads as "incoming
      // intel data packet" rather than a stock email card.
      const now = performance.now();
      const phase = (now + em.idx * 173) / 320;

      // Glass body
      const bodyGrad = ctx.createLinearGradient(0, -EMAIL_H / 2, 0, EMAIL_H / 2);
      bodyGrad.addColorStop(0, "rgba(15, 21, 48, 0.88)");
      bodyGrad.addColorStop(1, "rgba(8, 10, 22, 0.96)");
      ctx.fillStyle = bodyGrad;
      roundRect(ctx, -EMAIL_W / 2, -EMAIL_H / 2, EMAIL_W, EMAIL_H, 10);
      ctx.fill();

      // Faint scan-lines (CRT phosphor texture)
      ctx.save();
      ctx.beginPath();
      roundRect(ctx, -EMAIL_W / 2, -EMAIL_H / 2, EMAIL_W, EMAIL_H, 10);
      ctx.clip();
      ctx.strokeStyle = "rgba(0, 229, 255, 0.06)";
      ctx.lineWidth = 1;
      for (let yy = -EMAIL_H / 2; yy < EMAIL_H / 2; yy += 3) {
        ctx.beginPath();
        ctx.moveTo(-EMAIL_W / 2, yy);
        ctx.lineTo(EMAIL_W / 2, yy);
        ctx.stroke();
      }
      ctx.restore();

      // Animated chromatic border - cyan core with violet/pink ghost
      ctx.shadowColor = "#7c5cff";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = "rgba(124, 92, 255, 0.45)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, -EMAIL_W / 2 - 1, -EMAIL_H / 2, EMAIL_W, EMAIL_H, 10);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(0, 229, 255, 0.7)";
      ctx.lineWidth = 1.5;
      roundRect(ctx, -EMAIL_W / 2, -EMAIL_H / 2, EMAIL_W, EMAIL_H, 10);
      ctx.stroke();

      // Top corner data tags - "PKT" id + faint pulse dot
      ctx.fillStyle = "rgba(0, 229, 255, 0.65)";
      ctx.font = "800 8px ui-monospace, 'JetBrains Mono', Menlo, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(`PKT-${(em.idx % 999).toString().padStart(3, "0")}`, -EMAIL_W / 2 + 8, -EMAIL_H / 2 + 5);
      // Live pulse dot top-right
      const pulseAlpha = 0.5 + 0.5 * Math.sin(phase);
      ctx.fillStyle = `rgba(126, 255, 151, ${pulseAlpha})`;
      ctx.beginPath();
      ctx.arc(EMAIL_W / 2 - 10, -EMAIL_H / 2 + 9, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Envelope glyph (left side, holographic violet stroke)
      ctx.save();
      ctx.translate(-EMAIL_W / 2 + 22, 4);
      ctx.strokeStyle = "rgba(125, 240, 255, 0.85)";
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 6;
      ctx.lineWidth = 2;
      roundRect(ctx, -14, -10, 28, 20, 3);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-14, -10);
      ctx.lineTo(0, 4);
      ctx.lineTo(14, -10);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();

      // Sender + subject text - bright cream + slate cream
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#e8edff";
      // Fit by MEASURED width, not character count: 22 upper-case characters
      // ("type your HOME ADDRESS") overflow the card where 22 lower-case ones fit
      // (Abdullah, W2 item 4a). Text may use the card up to 8px from its edge.
      const textMaxW = EMAIL_W - 44 - 8;
      const fitText = (text: string, maxW: number) => {
        if (ctx.measureText(text).width <= maxW) return text;
        let t = text;
        while (t.length > 1 && ctx.measureText(t.trimEnd() + "…").width > maxW) t = t.slice(0, -1);
        return t.trimEnd() + "…";
      };
      /**
       * Break the subject on WORD boundaries across at most two lines.
       *
       * The old code cut the subject mid-word with an ellipsis, which hid the
       * half the child needed ("Use your REAL NAME a..."). Wrapping keeps the
       * whole message on the card. Only if a subject still will not fit in
       * two lines does the second line get trimmed, and that is a signal the
       * line was authored too long rather than something to paper over.
       */
      const wrapText = (text: string, maxW: number, maxLines: number) => {
        const words = text.split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let line = "";
        for (const word of words) {
          const next = line ? `${line} ${word}` : word;
          if (ctx.measureText(next).width <= maxW || !line) {
            line = next;
          } else {
            lines.push(line);
            line = word;
            if (lines.length === maxLines) break;
          }
        }
        if (lines.length < maxLines && line) lines.push(line);
        // Anything that did not fit gets folded into the last line, trimmed.
        if (lines.length === maxLines) {
          const used = lines.join(" ").length;
          if (used < text.length) lines[maxLines - 1] = fitText(lines[maxLines - 1] + " " + text.slice(used).trim(), maxW);
        }
        return lines;
      };
      ctx.font = "700 13px 'Space Grotesk', sans-serif";
      ctx.fillText(fitText(em.sender, textMaxW), -EMAIL_W / 2 + 44, -EMAIL_H / 2 + 20);
      ctx.fillStyle = "rgba(197, 205, 240, 0.85)";
      ctx.font = "500 11px 'Space Grotesk', sans-serif";
      wrapText(em.subject, textMaxW, 2).forEach((line, i) => {
        ctx.fillText(line, -EMAIL_W / 2 + 44, -EMAIL_H / 2 + 40 + i * 14);
      });

      // Bottom-edge "scanning..." progress shimmer (animated thin bar)
      const scanLen = (Math.abs(Math.sin(phase * 0.6)) * (EMAIL_W - 16));
      const scanGrad = ctx.createLinearGradient(-EMAIL_W / 2 + 8, EMAIL_H / 2 - 4, -EMAIL_W / 2 + 8 + scanLen, EMAIL_H / 2 - 4);
      scanGrad.addColorStop(0, "rgba(0, 229, 255, 0)");
      scanGrad.addColorStop(0.5, "rgba(0, 229, 255, 0.7)");
      scanGrad.addColorStop(1, "rgba(0, 229, 255, 0)");
      ctx.fillStyle = scanGrad;
      ctx.fillRect(-EMAIL_W / 2 + 8, EMAIL_H / 2 - 4, scanLen, 1.5);

      ctx.restore();
    };

    const checkFinished = () => {
      const s = state.current;
      if (s.finished) return;
      if (s.spawnedIdx >= list.length && s.live.every((e) => !e.alive)) {
        s.finished = true;
        // Intensity-gated: strict reduced-motion skips the burst.
        if (intensityRef.current > 0) void correctAnswerBurst();
        setRender((n) => n + 1);
      }
    };

    const tick = (now: number) => {
      if (!running) return;
      // True-pause when tab hidden - no update, no draw, just re-arm
      // rAF. Saves the CPU work the throttled loop would do.
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(50, now - lastTime);
      lastTime = now;
      const frames = dt / (1000 / 60);
      const s = state.current;

      // Pause-on-wrong: freeze spawning and movement while the
      // wrong-answer panel is open. The render still paints the
      // last frame so the canvas isn't blank behind the overlay.
      if (!pausedRef.current) {
        trySpawn(now);

        for (const em of s.live) {
          if (!em.alive) continue;
          if (em.resolved) continue;
          em.x += em.vx * frames;
          em.y += em.vy * frames;

          // Check if reached monitor
          const dx = em.x - MONITOR_X;
          const dy = em.y - (MONITOR_Y - MONITOR_H / 4);
          if (Math.abs(dx) < MONITOR_W / 2 - 10 && Math.abs(dy) < MONITOR_H / 2 - 10) {
            if (em.isPhishing) {
              pinPhishingHit(em);
            } else {
              em.enteringMonitor = true;
              safeDelivered(em);
            }
          }

          // Off-screen reclaim: a real email knocked off-course (or any email
          // that drifts past the monitor) must never fly away forever, or
          // checkFinished (every email resolved) can never fire and the child
          // is stuck with no way forward. Retire any live email that leaves
          // the play area well beyond its spawn edge.
          const off = EMAIL_W * 2;
          if (em.x < -off || em.x > CANVAS_W + off || em.y < -off || em.y > CANVAS_H + off) {
            em.resolved = true;
            em.alive = false;
          }
        }

        // entering-monitor shrink (after resolved safe)
        for (const em of s.live) {
          if (em.enteringMonitor && em.resolved) {
            em.scale *= Math.pow(0.86, frames);
            if (em.scale < 0.05) em.alive = false;
          }
        }
      }

      // fragments
      s.fragments = s.fragments
        .map((f) => ({
          ...f,
          x: f.x + f.vx * frames,
          y: f.y + f.vy * frames,
          vy: f.vy + 0.3 * frames,
          rot: f.rot + f.rotSpeed * frames,
          life: f.life - dt,
        }))
        .filter((f) => f.life > 0);

      // floaters + clues + bullets
      s.floaters = s.floaters.filter((f) => now - f.bornAt < f.duration);
      s.clues = s.clues.filter((c) => now - c.bornAt < 1500);
      s.bullets = s.bullets.filter((b) => now - b.bornAt < b.duration);

      // ── DRAW ──
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      /**
       * The arena behind the vault.
       *
       * Owner, 2026-10-17: "the TV behind it, we could do a better job of
       * creating it."
       *
       * It was a flat radial wash, a field of drifting 1s and 0s, a wire
       * grid of straight lines meeting at a point, and two expanding rings.
       * Four effects all at the same brightness, none of them describing the
       * space the packets travel through, and the binary rain competed with
       * the one thing the child has to read - the cards.
       *
       * What it draws now is DEPTH, quietly: a deep ground, a horizon bloom
       * sitting behind the vault so the vault is the brightest thing on the
       * board, a floor whose lines fade with distance, and a soft converging
       * lane that shows where the packets are heading. Everything is dimmer
       * than a packet card, deliberately, because the card is the content.
       */
      const horizonY = CANVAS_H * 0.46;

      /* Ground: sky above the horizon, floor below, so there is a world
       * rather than a wash. */
      const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
      sky.addColorStop(0, "#070a1c");
      sky.addColorStop(1, "#141d45");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, CANVAS_W, horizonY);

      const floor = ctx.createLinearGradient(0, horizonY, 0, CANVAS_H);
      floor.addColorStop(0, "#16204e");
      floor.addColorStop(1, "#070a18");
      ctx.fillStyle = floor;
      ctx.fillRect(0, horizonY, CANVAS_W, CANVAS_H - horizonY);

      /* Horizon bloom, centred on the vault. This is what makes the vault
       * read as the destination instead of just another object. */
      const bloom = ctx.createRadialGradient(MONITOR_X, horizonY, 0, MONITOR_X, horizonY, CANVAS_W * 0.62);
      bloom.addColorStop(0, "rgba(64,120,255,0.34)");
      bloom.addColorStop(0.45, "rgba(40,70,170,0.14)");
      bloom.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      /* A bright seam along the horizon itself. */
      const seam = ctx.createLinearGradient(0, 0, CANVAS_W, 0);
      seam.addColorStop(0, "rgba(125,240,255,0)");
      seam.addColorStop(0.5, "rgba(125,240,255,0.5)");
      seam.addColorStop(1, "rgba(125,240,255,0)");
      ctx.fillStyle = seam;
      ctx.fillRect(0, horizonY - 1, CANVAS_W, 1.6);

      /* Floor lines that FADE with distance. The old grid drew every line at
       * one alpha, which is why it read as a flat diagram rather than a
       * surface going away from you. */
      for (let i = -9; i <= 9; i++) {
        const t = Math.abs(i) / 9;
        ctx.strokeStyle = `rgba(104,150,255,${0.20 * (1 - t * 0.72)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(MONITOR_X, horizonY);
        ctx.lineTo(MONITOR_X + i * 118, CANVAS_H + 10);
        ctx.stroke();
      }
      const drift = (now / 2600) % 1;
      for (let i = 0; i < 9; i++) {
        const t = (i + drift) / 9;
        const yLine = horizonY + t * t * (CANVAS_H - horizonY);
        ctx.strokeStyle = `rgba(104,150,255,${0.045 + t * 0.16})`;
        ctx.lineWidth = t < 0.5 ? 1 : 1.3;
        ctx.beginPath();
        ctx.moveTo(0, yLine);
        ctx.lineTo(CANVAS_W, yLine);
        ctx.stroke();
      }

      /* Quiet drifting motes, replacing the field of 1s and 0s. Binary rain
       * says "computer" at the cost of legibility; these say "space" and
       * stay well under the cards. */
      for (let i = 0; i < 16; i++) {
        const seed = i * 97;
        const x = (seed * 7.3) % CANVAS_W;
        const y = ((now / 26 + seed * 3) % (CANVAS_H + 40)) - 20;
        const a = 0.05 + 0.08 * (0.5 + 0.5 * Math.sin(now * 0.0011 + i));
        ctx.fillStyle = `rgba(170,205,255,${a})`;
        ctx.beginPath();
        ctx.arc(x, y, i % 3 === 0 ? 1.6 : 1, 0, Math.PI * 2);
        ctx.fill();
      }

      /* One slow ring at the vault, instead of two racing ones. It marks
       * where packets are going without pulling the eye off them. */
      const ringPhase = (now / 2600) % 1;
      ctx.strokeStyle = `rgba(125,240,255,${0.26 * (1 - ringPhase)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(MONITOR_X, MONITOR_Y - MONITOR_H * 0.1, 34 + ringPhase * 190, 0, Math.PI * 2);
      ctx.stroke();

      drawMonitor(now);

      // draw emails
      for (const em of s.live) {
        if (em.alive) drawEmail(em);
      }

      // fragments
      for (const f of s.fragments) {
        const alpha = Math.max(0, f.life / 700);
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        ctx.fillStyle = f.colour;
        ctx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // bullets - laser/zap projectiles fired from the monitor toward
      // the email the user clicked. The whole shot animates over its
      // `duration`, drawing both the in-flight head and a fading tail
      // along the path.
      for (const b of s.bullets) {
        const t = Math.min(1, (now - b.bornAt) / b.duration);
        const hx = b.sx + (b.tx - b.sx) * t;
        const hy = b.sy + (b.ty - b.sy) * t;
        // Trail
        ctx.save();
        ctx.strokeStyle = b.colour;
        ctx.lineCap = "round";
        ctx.shadowColor = b.colour;
        ctx.shadowBlur = 16;
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.moveTo(b.sx, b.sy);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        // Bright core
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.95;
        const tailX = b.sx + (b.tx - b.sx) * Math.max(0, t - 0.35);
        const tailY = b.sy + (b.ty - b.sy) * Math.max(0, t - 0.35);
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        // Glowing head
        ctx.fillStyle = "#ffffff";
        ctx.shadowBlur = 24;
        ctx.beginPath();
        ctx.arc(hx, hy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = b.colour;
        ctx.beginPath();
        ctx.arc(hx, hy, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // floaters
      for (const f of s.floaters) {
        const age = now - f.bornAt;
        const alpha = Math.max(0, 1 - age / f.duration);
        const dy = -age * 0.06;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.colour;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 3;
        ctx.font = "900 19px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(f.text, f.x, f.y + dy);
        ctx.fillText(f.text, f.x, f.y + dy);
      }
      // clue bubbles
      for (const c of s.clues) {
        const age = now - c.bornAt;
        const alpha = Math.max(0, 1 - age / 1500);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "rgba(15,23,42,0.9)";
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.font = "700 12px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const w = ctx.measureText(c.text).width + 24;
        roundRect(ctx, c.x - w / 2, c.y - 14, w, 28, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fde68a";
        ctx.fillText(c.text, c.x, c.y);
      }
      ctx.globalAlpha = 1;

      // HUD
      ctx.font = "800 13px 'Space Grotesk', sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "#fca5a5";
      ctx.fillText(`ZAPPED ${s.zapped}/${s.totalPhishing}`, 14, 12);
      ctx.textAlign = "right";
      ctx.fillStyle = "#a0ffb0";
      ctx.fillText(`${cp.inboxLabel} ${s.inbox}/${s.totalSafe}`, CANVAS_W - 14, 12);
      ctx.textAlign = "center";
      ctx.fillStyle = s.viruses > 0 ? "#ef4444" : "#4b5563";
      ctx.fillText(`${missLabelText} ${s.viruses}`, CANVAS_W / 2, 12);
      // The ONLY streak readout. It used to appear at x3 and up, with a second
      // one printed under the meter at y 85 - which is exactly where the turret
      // mount is drawn (y 84 to 106, same centre line), so the turret painted
      // over it and the child read "STREA  x2" (Abdullah, W2 retest). One
      // readout, up here where nothing is drawn on top of it, and from the
      // first zap so the meter filling always has a number beside it.
      if (s.streak >= 1) {
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(s.streak >= 5 ? `MAX STREAK x${s.streak}` : `STREAK x${s.streak}`, CANVAS_W / 2, 30);
      }

      // CROSSHAIR / AIMING RETICULE - follows mouse position so the kid
      // feels they're operating a turret. Cyan ring + cross-hair
      // arms + faint guideline back to the firing monitor at the
      // bottom (only drawn when cursor is over a virus to avoid
      // visual noise on idle hover).
      if (s.cursorX !== null && s.cursorY !== null && !s.finished) {
        const cx = s.cursorX;
        const cy = s.cursorY;
        const overTarget = s.live.some(
          (em) =>
            em.alive &&
            !em.resolved &&
            Math.abs(cx - em.x) < (EMAIL_W / 2) * em.scale &&
            Math.abs(cy - em.y) < (EMAIL_H / 2) * em.scale &&
            em.isPhishing
        );
        ctx.save();
        // Outer ring
        ctx.strokeStyle = overTarget ? "#ff5577" : "#00e5ff";
        ctx.lineWidth = 1.6;
        ctx.shadowColor = overTarget ? "#ff5577" : "#00e5ff";
        ctx.shadowBlur = overTarget ? 16 : 10;
        ctx.beginPath();
        ctx.arc(cx, cy, overTarget ? 22 : 18, 0, Math.PI * 2);
        ctx.stroke();
        // Inner dot
        ctx.fillStyle = overTarget ? "#ff5577" : "#00e5ff";
        ctx.beginPath();
        ctx.arc(cx, cy, 2, 0, Math.PI * 2);
        ctx.fill();
        // Cross-hair arms (4 short lines)
        ctx.beginPath();
        const arm = overTarget ? 14 : 10;
        const gap = 6;
        ctx.moveTo(cx - arm - gap, cy); ctx.lineTo(cx - gap, cy);
        ctx.moveTo(cx + gap, cy); ctx.lineTo(cx + arm + gap, cy);
        ctx.moveTo(cx, cy - arm - gap); ctx.lineTo(cx, cy - gap);
        ctx.moveTo(cx, cy + gap); ctx.lineTo(cx, cy + arm + gap);
        ctx.stroke();
        // When over a virus, draw a guideline from the firing
        // monitor at the bottom up to the crosshair so the kid sees
        // the firing path before they tap.
        if (overTarget) {
          ctx.strokeStyle = "rgba(255, 80, 100, 0.45)";
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 6]);
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.moveTo(TURRET_X, TURRET_Y + 18);
          ctx.lineTo(cx, cy);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        ctx.restore();
      }

      // Big glowing instruction prompt at the top - the user wanted
      // this to make the goal unmissable. Pulses softly, RGB-split
      // chromatic shimmer (cyan + neon-pink) for the holographic feel.
      const promptPulse = 0.7 + 0.3 * Math.sin(now / 380);
      ctx.save();
      ctx.font = "900 22px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const promptY = 56;
      const promptX = CANVAS_W / 2;
      // Cyan ghost behind the text
      ctx.fillStyle = "rgba(0, 229, 255, 0.6)";
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 18 * promptPulse;
      ctx.fillText(headlineText, promptX - 1.5, promptY);
      // Neon-pink ghost on the other side
      ctx.fillStyle = "rgba(255, 95, 179, 0.5)";
      ctx.shadowColor = "#ff5fb3";
      ctx.shadowBlur = 18 * promptPulse;
      ctx.fillText(headlineText, promptX + 1.5, promptY);
      // Bright white core
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#e8edff";
      ctx.fillText(headlineText, promptX, promptY);
      ctx.restore();

      // CYBER TURRET - sits below the prompt, points down at incoming
      // viruses. Inverted-U mount + barrel that swivels toward the
      // crosshair if the kid is hovering over a target. Fires the
      // existing bullet from this position.
      const turretAimX = s.cursorX !== null && s.cursorX > 0 && s.cursorX < CANVAS_W ? s.cursorX : TURRET_X;
      const turretAimY = s.cursorY !== null && s.cursorY > TURRET_Y ? s.cursorY : TURRET_Y + 200;
      const turretAngle = Math.atan2(turretAimY - (TURRET_Y + 8), turretAimX - TURRET_X);
      ctx.save();
      // Mount base (cylindrical)
      const mountGrad = ctx.createLinearGradient(TURRET_X - 28, TURRET_Y - 6, TURRET_X + 28, TURRET_Y + 18);
      mountGrad.addColorStop(0, "#1a2147");
      mountGrad.addColorStop(0.5, "#252d5e");
      mountGrad.addColorStop(1, "#1a2147");
      ctx.fillStyle = mountGrad;
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.roundRect(TURRET_X - 28, TURRET_Y - 6, 56, 22, 6);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Mount rivets
      ctx.fillStyle = "#00e5ff";
      ctx.beginPath();
      ctx.arc(TURRET_X - 22, TURRET_Y + 5, 1.5, 0, Math.PI * 2);
      ctx.arc(TURRET_X + 22, TURRET_Y + 5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Pivot dome
      ctx.translate(TURRET_X, TURRET_Y + 8);
      const domeGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
      domeGrad.addColorStop(0, "#7df0ff");
      domeGrad.addColorStop(1, "#00e5ff");
      ctx.fillStyle = domeGrad;
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Barrel - rotates toward aim
      ctx.rotate(turretAngle);
      const barrelGrad = ctx.createLinearGradient(0, -4, 22, 4);
      barrelGrad.addColorStop(0, "#7c5cff");
      barrelGrad.addColorStop(1, "#00e5ff");
      ctx.fillStyle = barrelGrad;
      ctx.shadowColor = "#7c5cff";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(0, -3.5, 22, 7, 2);
      ctx.fill();
      // Barrel tip glow
      ctx.fillStyle = "#7df0ff";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(22, 0, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // STREAK METER - fills as the kid maintains a correct-zap chain.
      // Sits below the prompt, full at streak >=5. Pulses when full.
      const streakPct = Math.min(1, s.streak / 5);
      if (streakPct > 0) {
        const meterX = CANVAS_W / 2 - 80;
        const meterY = 76;
        const meterW = 160;
        const meterH = 6;
        ctx.save();
        // Track
        ctx.fillStyle = "rgba(0, 229, 255, 0.12)";
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") ctx.roundRect(meterX, meterY, meterW, meterH, 3);
        else ctx.rect(meterX, meterY, meterW, meterH);
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 229, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();
        // Fill
        const fillW = meterW * streakPct;
        const fillGrad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
        fillGrad.addColorStop(0, "#00e5ff");
        fillGrad.addColorStop(1, "#7c5cff");
        ctx.fillStyle = fillGrad;
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = streakPct >= 1 ? 14 + 4 * Math.sin(now / 180) : 8;
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") ctx.roundRect(meterX, meterY, fillW, meterH, 3);
        else ctx.rect(meterX, meterY, fillW, meterH);
        ctx.fill();
        ctx.shadowBlur = 0;
        // NO label under the bar. It sat at y 85 on the centre line, and the
        // turret mount is drawn at y 84 to 106 on that same line, so the turret
        // covered the middle of it and the child read "STREA  x2". The number
        // lives in the gold readout at y 30 instead, which nothing overlaps;
        // the bar here carries the progress on its own.
        ctx.restore();
      }

      // EDGE FLASH - red border flash when the kid wrongly zaps a
      // legit email. Driven off monitorFlashColour === "#ff5577" or
      // similar; uses monitorFlashUntil for timing.
      const edgeFlashActive =
        s.monitorFlashColour && now < s.monitorFlashUntil &&
        (s.monitorFlashColour === "#ff5577" || s.monitorFlashColour === "#ef4444");
      if (edgeFlashActive) {
        const t = (s.monitorFlashUntil - now) / 280;
        const alpha = Math.max(0, Math.min(1, t)) * 0.85;
        ctx.save();
        ctx.strokeStyle = `rgba(255, 80, 100, ${alpha})`;
        ctx.lineWidth = 8;
        ctx.shadowColor = "#ff5577";
        ctx.shadowBlur = 24;
        ctx.strokeRect(2, 2, CANVAS_W - 4, CANVAS_H - 4);
        ctx.restore();
      }

      checkFinished();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVis);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, showIntro, resetKey]);

  const s = state.current;
  const total = list.length;
  const stars = s.viruses === 0 ? 3 : s.viruses === 1 ? 2 : 1;
  const accuracy = total > 0 ? Math.round(((s.zapped + s.inbox) / total) * 100) : 0;

  return (
    <ExerciseFrame
      maxWidth={1400}
      aspectRatio={{ w: 720, h: 500 }}
      reserve={220}
      background="linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)"
      touchActionNone
      style={{
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          cursor: "crosshair",
        }}
        aria-label="Spam Blaster game"
      />
      {s.finished && (
        <PixarFinishOverlay
          title={cp.finishTitle}
          accuracy={accuracy}
          subline={`Zapped ${s.zapped}/${s.totalPhishing} · ${cp.deliveredWord} ${s.inbox}/${s.totalSafe} · ${missLabelText} ${s.viruses}`}
          stars={stars}
          onContinue={() => {
            audio.tap();
            onComplete(s.zapped + s.inbox);
          }}
          onRetry={() => {
            audio.select();
            resetExercise();
          }}
        />
      )}
      {/* Spoken payoff on the finish overlay (audio only; the guard holds Continue). */}
      {s.finished && completeNarration && (
        <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          <InfoNarration
            key="blaster-complete"
            speaker={completeNarration.speaker ?? "adam"}
            lines={completeNarration.lines}
            recordedOnly
          />
        </div>
      )}
      {showIntro &&
        (introNarration ? (
          <ExerciseIntroBeat
            title={introTitle ?? "Spam Blaster!"}
            subtitle={introDescription ?? "ZAP the tricks - let the real ones through!"}
            icon={introIcon ?? "📧"}
            narration={introNarration}
            character={introNarration.speaker}
            threat={threat}
            onDismiss={() => setShowIntro(false)}
          />
        ) : (
          <ExerciseIntro
            title={introTitle ?? "Spam Blaster!"}
            description={
              introDescription ??
              "Emails are flying toward your computer! ZAP the phishing emails but let the real ones through!"
            }
            icon={introIcon ?? "📧"}
            controls="Click on phishing emails to zap them"
            onStart={() => setShowIntro(false)}
          />
        ))}

      {/* Tiered hint - shown below the canvas after wrong tries */}
      {/* Only while the game is HELD for it (see hintHolding). Once play
          resumes the hint clears, so it can never sit on top of a packet the
          child is trying to read or the vault they are defending. */}
      {hintHolding && wrongCount > 0 && !feedback && !s.finished && (
        <div style={{ position: "absolute", left: 12, right: 12, bottom: 12, zIndex: 10 }}>
          {wrongCount === 1 && (
            <HintBubble
              tier={1}
              speaker="layla"
              text={hints?.tier1 ?? "Slow down and read the SENDER first. Friends, teachers and family are real. 'Prize Central' or 'Account Security' usually means trouble."}
            />
          )}
          {wrongCount === 2 && (
            <HintBubble
              tier={2}
              speaker="layla"
              text={hints?.tier2 ?? "Phishing has three big signs: (1) free prize, (2) URGENT or scary message, (3) asks for your password."}
              example={hints ? hints.tier2Example : "'YOU WON A FREE iPHONE' / 'URGENT: enter your password' = bait"}
            />
          )}
          {wrongCount >= 3 && (
            <HintBubble
              tier={3}
              speaker="adam"
              text={hints?.tier3 ?? hints?.tier2 ?? "Quick rule: If a message rushes you, scares you, or offers free stuff for nothing - it's phishing. Zap it. Real messages are calm and from people you know."}
            />
          )}
        </div>
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker="layla"
          onContinue={gotIt}
        />
      )}

      {/* `render` is read so state-bumps trigger re-render for the finish overlay */}
      <span style={{ display: "none" }}>{render}</span>
      {fx.layer()}
      {verdict.element}
    </ExerciseFrame>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

