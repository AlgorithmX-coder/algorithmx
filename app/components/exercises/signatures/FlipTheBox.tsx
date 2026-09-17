"use client";

/**
 * FLIP THE BOX: Week 9 (Apps & Downloads) signature exercise, rebuilt as a
 * data-driven, tap-only concept game to the Learn-Loop standard.
 *
 * An app arrives as a 3D cardboard box rolling in on a conveyor belt. The
 * FRONT always looks perfect (a shiny name, FREE!, five stars). The other three
 * sides carry the truth: who MADE it, what the REVIEWS really say, and what it
 * ASKS FOR on your device, next to the app's job. The child taps the big arrows
 * to turn the box one side at a time (a swipe works too, as an extra). INSTALL
 * and BIN stay locked until all four sides of this box have been seen.
 *
 * Concept (Week 9, concept 3, "Why does it need that?"): an app gets the
 * permissions its JOB needs and not one more, so the ASKS side is the heart of
 * every box. A fishy maker or fishy reviews also mean BIN.
 *
 *   Right call: the box is crushed (BIN) or lifted in (INSTALL) under a green
 *     stamp while Sarah says "That's right!" + the box's `why`, then the next
 *     box rolls in.
 *   Wrong call: a red stamp, then the shared teach panel (Sarah: "Not quite."
 *     + `whyWrong`), then the box turns to the side that gives it away
 *     (`wrongFace`), ringed, with its clues marked. The child calls the SAME
 *     box again. No timer, no lose state.
 *
 * Uniform choices: every side of every box wears the same cardboard paint, and
 * the two decision buttons wear the same paint and size (their sides are
 * flipped at random per box). Clue marks and the green or red stamps appear
 * only AFTER the child commits. Round 1 guides the MECHANIC only: the arrow
 * that shows the next unseen side breathes; the decision buttons never glow.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the shared intro
 * (`threat`); Sarah speaks the how-to once as the board appears (`coachLines`),
 * then each box's front as it rolls in and each side the first time the child
 * turns to it (audio-only, `recordedOnly`, the board held while she speaks); a
 * right call speaks through VerdictVoice, a wrong one through WrongAnswerPanel;
 * the complete beat speaks the payoff (`completeNarration`). Boxes play in
 * authored order. The defaults below keep the legacy signature mount
 * (`{ onComplete, narration, accent }`) working.
 *
 * Layout: the box scales with the window (height first) so the board, the
 * prompt strip and both decision buttons fit a 1414x771 window with no scroll.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { fisherYates } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on the box), same recipe as the Developing Tray.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export type FlipFaceKey = "front" | "maker" | "reviews" | "asks";
export type FlipMove = "install" | "bin";
/** The MAKER or REVIEWS side of a box. */
export interface FlipBoxFace {
  /** Optional big line (the maker's name, or the review count); `text` then sits under it. */
  title?: string;
  /** The words on this side: the facts a detective notices. */
  text: string;
  /** Sarah reads this the first time the child turns to this side. */
  readAloud: string;
  /** This side gives the app away. Marked only AFTER a wrong call, never before. */
  fishy: boolean;
}
/** One permission row on the ASKS side. */
export interface FlipBoxAsk { label: string; icon: string; fishy: boolean }
export interface FlipBoxApp {
  id: string;
  /** The FRONT (always looks perfect): name, PixIcon emoji, tagline, stars (default 5). */
  name: string; icon: string; tagline: string; stars?: number;
  /** Sarah reads the front as the box rolls in. */
  readAloud: string;
  maker: FlipBoxFace;
  reviews: FlipBoxFace;
  /** The ASKS side: the app's job line ("Its job: make light"), up to 4 rows, and its read-aloud. */
  asks: { job?: string; items: FlipBoxAsk[]; readAloud: string };
  rightMove: FlipMove;
  /** Sarah's reason on a right call ("That's right!" + why). */
  why: string;
  /** Sarah's teach on a wrong call ("Not quite." + whyWrong, via WrongAnswerPanel). */
  whyWrong: string;
  /** The side the teach turns to. Default: asks if any ask is fishy, else reviews, else maker, else asks. */
  wrongFace?: "maker" | "reviews" | "asks";
}
export interface FlipTheBoxProps {
  boxes?: FlipBoxApp[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  faceLabels?: Partial<Record<FlipFaceKey, string>>;
  installLabel?: string; binLabel?: string;
  installToast?: string; binToast?: string;
  wrongTitle?: string; wrongStamp?: string;
  completeTitle?: string; completeLine?: string;
  /** The on-board strip while sides are unseen, then once all 4 are seen (default names both button labels). */
  turnPrompt?: string; decidePrompt?: string;
  hints?: { tier1: string; tier2: string };
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
  onComplete: (score?: number) => void;
  onCorrect?: () => void; onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  /** selectedIndex / correctIndex: 0 = install, 1 = bin (whatever side the button sat on). */
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const FACE_ORDER: readonly FlipFaceKey[] = ["front", "maker", "reviews", "asks"];
const FRONT_ONLY: readonly FlipFaceKey[] = ["front"];
const MOVES: readonly FlipMove[] = ["install", "bin"];

/*
 * Box geometry at scale 1. Every length on the box and in the scene is
 * multiplied by the box scale `k` (see boxScaleFor).
 */
const CUBE_W = 248;
const CUBE_H = 288;
const PERSPECTIVE = 900;
/** The front side sits CUBE_W/2 toward the viewer, so perspective draws it this much bigger. */
const FRONT_POP = PERSPECTIVE / (PERSPECTIVE - CUBE_W / 2);
/** Scene: the belt, the box standing on it, and head room for a mid-turn corner. */
const SCENE_H = 372;
const BELT_H = 50;
/** Cube box bottom above the scene bottom: the drawn front then rests 18px up, on the belt. */
const BOX_BOTTOM = 41;

/* Fixed (unscaled) board pieces around the scene. */
const FRAME_MAX_W = 860;
const FRAME_PAD_X = 22;
const FRAME_PAD_Y = 16;
const BOARD_GAP = 8;
const HEADER_H = 28;
const STRIP_H = 40;
const BUTTONS_H = 58;
const ARROW_SIZE = 58;
/** Side room an arrow takes from the scene (it may overlap the box edge a little on a phone). */
const ARROW_ROOM = 44;
/**
 * Window height that is not the scene: lesson HUD 64 + stage padding 80 +
 * frame padding 32 + header 28 + three gaps 24 + strip 40 + buttons 58 + 14
 * spare. At 1414x771 the scene gets its full 372px and the frame is 554px tall.
 */
const HEIGHT_RESERVE_PX = 340;
const MIN_SCALE = 0.6;

const SWIPE_PX = 32; // release distance that turns the box (forgiving)
const DRAG_MAX = 90;
const WRONG_STAMP_MS = 1000;
const WRONG_STAMP_MS_REDUCED = 450;
const ROLL_MS = 900;
const NEXT_BOX_MS = 900;

const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const AMBER = "#ffb347";
const CYAN = "#7df0ff";

/* ------------------------------------------------------------------ */
/* Default content (the legacy signature mount)                       */
/* ------------------------------------------------------------------ */

const BOXES: FlipBoxApp[] = [
  {
    id: "torch-pro",
    name: "Torch Pro",
    icon: "💡",
    tagline: "FREE!",
    stars: 5,
    readAloud: "Here comes Torch Pro. Free, with five shiny stars! Turn the box and check every side.",
    maker: {
      title: "Bright Beam Apps",
      text: "Made 6 other apps. In the shop for 4 years.",
      readAloud: "Made by Bright Beam Apps. They made six other apps, and they have been in the shop for four years.",
      fishy: false,
    },
    reviews: {
      title: "9,120 reviews",
      text: "Lots of different people, over lots of years.",
      readAloud: "Over nine thousand reviews, from lots of different people, over lots of years.",
      fishy: false,
    },
    asks: {
      job: "Its job: make light",
      items: [
        { icon: "💡", label: "The light", fishy: false },
        { icon: "👪", label: "Your contacts", fishy: true },
        { icon: "📸", label: "Your photos", fishy: true },
      ],
      readAloud: "Its job is to make light. It asks for the light, your contacts and your photos.",
    },
    rightMove: "bin",
    why: "A torch only needs the light. Your contacts and your photos are not part of its job, so Torch Pro goes in the bin.",
    whyWrong: "Look at what it asks for. A torch needs the light, but it also wants your contacts and your photos. Making light never needs those.",
    wrongFace: "asks",
  },
  {
    id: "snap-sketch",
    name: "Snap Sketch",
    icon: "🎨",
    tagline: "FREE!",
    stars: 5,
    readAloud: "Next is Snap Sketch. Take a photo, then draw on it! Turn the box and check every side.",
    maker: {
      title: "Crayon Cloud",
      text: "Made 9 other apps. In the shop for 6 years.",
      readAloud: "Made by Crayon Cloud. They made nine other apps, and they have been in the shop for six years.",
      fishy: false,
    },
    reviews: {
      title: "31,400 reviews",
      text: "Kids and grown-ups, over many years.",
      readAloud: "Over thirty thousand reviews, from kids and grown-ups, over many years.",
      fishy: false,
    },
    asks: {
      job: "Its job: photos you draw on",
      items: [
        { icon: "📸", label: "The camera", fishy: false },
        { icon: "📥", label: "Save to your photos", fishy: false },
      ],
      readAloud: "Its job is photos you can draw on. It asks for the camera, and to save to your photos.",
    },
    rightMove: "install",
    why: "Snap Sketch takes photos, so it needs the camera and a place to save them. Every ask fits its job, so it is safe to install.",
    whyWrong: "This one was safe! A photo drawing app needs the camera and your photos, because that is its job. The maker and the reviews check out too.",
    wrongFace: "asks",
  },
  {
    id: "mega-pet-gems",
    name: "Mega Pet Gems",
    icon: "💎",
    tagline: "FREE GEMS!",
    stars: 5,
    readAloud: "Last is Mega Pet Gems. Free gems! Turn the box and check every side.",
    maker: {
      title: "TotallyRealApps4U",
      text: "Made 0 other apps. Joined the shop yesterday.",
      readAloud: "Made by Totally Real Apps For You. They made no other apps, and they joined the shop yesterday.",
      fishy: true,
    },
    reviews: {
      title: "2 reviews",
      text: "Both say the very same words.",
      readAloud: "Just two reviews, and both of them say the very same words.",
      fishy: true,
    },
    asks: {
      job: "Its job: look after a pet",
      items: [
        { icon: "💬", label: "Your messages", fishy: true },
        { icon: "📍", label: "Where you are", fishy: true },
      ],
      readAloud: "Its job is looking after a pet. It asks for your messages, and where you are.",
    },
    rightMove: "bin",
    why: "Looking after a pet never needs your messages or where you are. With a brand new maker and copy-paste reviews too, it goes in the bin.",
    whyWrong: "Look at what it asks for. A pet game wants your messages and where you are. Feeding a pet never needs those.",
    wrongFace: "asks",
  },
];

const DEFAULT_FACE_LABELS: Record<FlipFaceKey, string> = {
  front: "FRONT",
  maker: "MAKER",
  reviews: "REVIEWS",
  asks: "ASKS FOR",
};
// The subtitle and decide prompt defaults name the button labels, so a week
// that relabels the buttons never gets a prompt naming the wrong button.
const defaultIntroSubtitle = (install: string, bin: string) => `Turn each app box to see all 4 sides. Then tap ${install} or ${bin}.`;
const DEFAULT_TURN_PROMPT = "Tap the arrows to turn the box. See all 4 sides!";
const defaultDecidePrompt = (install: string, bin: string) => `All 4 sides seen. ${install}, or ${bin}?`;
const DEFAULT_HINTS = {
  tier1: "Say the app's job out loud, then check every ask against it.",
  tier2: "An ask its job does not need, a brand new maker or copy-paste reviews means BIN IT.",
};
const DEFAULT_COMPLETE_LINE = "Check every side, and ask: does its job need that?";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const mod4 = (n: number) => ((n % 4) + 4) % 4;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
/** A length at box scale `k`, rounded to a tenth of a pixel. */
const sc = (n: number, k: number) => Math.round(n * k * 10) / 10;

// A read-aloud is only started when there is something to say and the lesson
// is not muted, so the spoken gate never waits on a clip that cannot play.
const canRead = (text?: string) => !isAudioMuted() && !!text;

const sideReadAloud = (box: FlipBoxApp, face: FlipFaceKey) =>
  face === "front" ? box.readAloud : face === "maker" ? box.maker.readAloud : face === "reviews" ? box.reviews.readAloud : box.asks.readAloud;

/** The side a wrong call's teach turns to. */
const tellFace = (box: FlipBoxApp): FlipFaceKey =>
  box.wrongFace ?? (box.asks.items.some((a) => a.fishy) ? "asks" : box.reviews.fishy ? "reviews" : box.maker.fishy ? "maker" : "asks");

/** Signed quarter turns (-1, 0, 1 or 2) from rotation `rot` to `face`. */
const turnsTo = (rot: number, face: FlipFaceKey) => {
  const d = mod4(FACE_ORDER.indexOf(face) - mod4(rot));
  return d === 3 ? -1 : d;
};

/**
 * The box scale for a window: as big as the design (1) where it fits, smaller
 * on a short or narrow window, never below MIN_SCALE. Read through
 * useSyncExternalStore, so a resize re-renders with no effect-driven state.
 */
function boxScaleFor(vw: number, vh: number): number {
  const byHeight = (vh - HEIGHT_RESERVE_PX) / SCENE_H;
  const stagePadX = clamp(vw * 0.03, 12, 24);
  const sceneW = Math.min(FRAME_MAX_W, vw - stagePadX * 2) - FRAME_PAD_X * 2;
  const byWidth = (sceneW - ARROW_ROOM * 2) / (CUBE_W * FRONT_POP);
  return Math.round(clamp(Math.min(byHeight, byWidth), MIN_SCALE, 1) * 100) / 100;
}
const subscribeViewport = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const readBoxScale = () => boxScaleFor(window.innerWidth, window.innerHeight);
const serverBoxScale = () => 1;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

type Narr = "howto" | "front" | "face" | "idle";
type Status = "inspect" | "wrong" | "crush" | "installed";

export default function FlipTheBox({
  boxes = BOXES,
  introTitle = "Flip the Box",
  introSubtitle,
  introIcon = "🔍",
  faceLabels,
  installLabel = "INSTALL",
  binLabel = "BIN IT",
  installToast = "INSTALLED!",
  binToast = "BINNED!",
  wrongTitle = "Take another look",
  wrongStamp = "WAIT!",
  completeTitle = "Every box checked!",
  completeLine = DEFAULT_COMPLETE_LINE,
  turnPrompt = DEFAULT_TURN_PROMPT,
  decidePrompt,
  hints = DEFAULT_HINTS,
  narration,
  coachLines,
  threat,
  completeNarration,
  accent,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: FlipTheBoxProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const themeAccent = useLessonTheme()?.accent;
  const tint = accent ?? themeAccent ?? CYAN;
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker (that left games silent).
  const voice = "adam" as const;
  const labels: Record<FlipFaceKey, string> = {
    front: faceLabels?.front ?? DEFAULT_FACE_LABELS.front,
    maker: faceLabels?.maker ?? DEFAULT_FACE_LABELS.maker,
    reviews: faceLabels?.reviews ?? DEFAULT_FACE_LABELS.reviews,
    asks: faceLabels?.asks ?? DEFAULT_FACE_LABELS.asks,
  };
  const k = useSyncExternalStore(subscribeViewport, readBoxScale, serverBoxScale);
  const stripControls = useAnimationControls();

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Quarter turns so far, unbounded, so the spring always takes the short way.
  const [rot, setRot] = useState(0);
  // Live swipe offset (px) while a finger drags the box (an extra; taps do it all).
  const [drag, setDrag] = useState(0);
  // Sides of the current box the child has seen (the front, as it rolls in).
  const [seen, setSeen] = useState<readonly FlipFaceKey[]>(FRONT_ONLY);
  // Read-aloud chain: the how-to once as the board appears ("howto"), each
  // box's front as it rolls in ("front"), each side the first time the child
  // turns to it ("face", which side = readFace). Taps are held while she speaks.
  const [narr, setNarr] = useState<Narr>("idle");
  const [readFace, setReadFace] = useState<FlipFaceKey | null>(null);
  // "wrong" = the red stamp before the teach panel; "crush" / "installed" = a
  // right call, sealed while Sarah says why.
  const [status, setStatus] = useState<Status>("inspect");
  // After a wrong call: the side the teach turned to (ringed, clues marked).
  const [teachFace, setTeachFace] = useState<FlipFaceKey | null>(null);
  // INSTALL / BIN sides for the current box (a fair flip per box).
  const [order, setOrder] = useState<readonly FlipMove[]>(MOVES);
  // Belt rolls while a box rides in (a counter, so overlapping rolls never cut short).
  const [rolling, setRolling] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [boxWrongs, setBoxWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [installedCount, setInstalledCount] = useState(0);
  const [binnedCount, setBinnedCount] = useState(0);

  const dragRef = useRef({ startX: 0, active: false });
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const finished = idx >= boxes.length;
  const box: FlipBoxApp | undefined = boxes[idx];
  const currentFace = FACE_ORDER[mod4(rot)];
  const allSeen = seen.length >= FACE_ORDER.length;
  // Round 1 teaches the mechanic only: the arrow to the next unseen side breathes.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why and the next box waits
  // for her. Wrong calls speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;
  const canTurn = !showIntro && !finished && !!box && !speaking && status === "inspect";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Hint tiers reported once each (for the parent dashboard).
  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = totalWrongs >= 2 ? 2 : totalWrongs >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [totalWrongs, onHintReached]);

  /* ---------------- beats ---------------- */

  const rollBelt = () => {
    if (reduce) return;
    setRolling((n) => n + 1);
    later(() => setRolling((n) => Math.max(0, n - 1)), ROLL_MS);
  };

  const startBoard = () => {
    setShowIntro(false);
    // A fair coin flip for the two buttons' sides (a two-item useShuffledOnce
    // always swaps, which is a pattern, not a flip).
    setOrder(fisherYates(MOVES));
    rollBelt();
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : canRead(boxes[0]?.readAloud) ? "front" : "idle");
  };

  const advance = () => {
    const next = idx + 1;
    setIdx(next);
    setRot(0);
    setDrag(0);
    setSeen(FRONT_ONLY);
    setStatus("inspect");
    setTeachFace(null);
    setReadFace(null);
    setBoxWrongs(0);
    if (next < boxes.length) {
      setOrder(fisherYates(MOVES));
      rollBelt();
      setNarr(canRead(boxes[next].readAloud) ? "front" : "idle");
    } else {
      setNarr("idle");
    }
  };

  /* Turn the box one side (the arrows; a swipe lands here too). */
  const turn = (dir: 1 | -1) => {
    if (!box || !canTurn) return;
    const next = rot + dir;
    const face = FACE_ORDER[mod4(next)];
    audio.cardFlip();
    setRot(next);
    if (seen.includes(face)) return;
    setSeen([...seen, face]);
    if (canRead(sideReadAloud(box, face))) {
      setReadFace(face);
      setNarr("face");
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canTurn) return;
    dragRef.current = { startX: e.clientX, active: true };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is a nicety, not a requirement */
    }
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    setDrag(clamp(e.clientX - dragRef.current.startX, -DRAG_MAX, DRAG_MAX));
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    const dx = e.clientX - dragRef.current.startX;
    setDrag(0);
    if (Math.abs(dx) > SWIPE_PX) turn(dx < 0 ? 1 : -1);
  };
  const onPointerCancel = () => {
    dragRef.current.active = false;
    setDrag(0);
  };

  /* INSTALL or BIN: the only judged tap. */
  const choose = (move: FlipMove) => {
    if (!box || !canTurn) return;
    if (!allSeen) {
      // Locked until every side is seen: a gentle nudge at the prompt, never a verdict.
      audio.hover();
      if (!reduce) void stripControls.start({ x: [0, -6, 6, -4, 4, 0], transition: { duration: 0.4 } });
      return;
    }
    const right = move === box.rightMove;
    onAnswered?.({
      questionKey: `flip-${box.id}`,
      selectedIndex: MOVES.indexOf(move),
      correctIndex: MOVES.indexOf(box.rightMove),
      wasCorrect: right,
    });

    if (right) {
      // fx.correct plays its own chime (no audio.correct() here).
      fx.correct({ xp: 25 });
      onCorrect?.();
      setTeachFace(null);
      if (move === "bin") {
        setStatus("crush");
        setBinnedCount((n) => n + 1);
        later(() => audio.drop(), reduce ? 80 : 300); // the crunch as the press lands
      } else {
        setStatus("installed");
        setInstalledCount((n) => n + 1);
      }
      // Sarah: "That's right!" + why, one take; then a short beat and the next box.
      verdict.say("right", box.why, () => later(advance, reduce ? 200 : NEXT_BOX_MS));
      return;
    }

    // Wrong: the red stamp, then the teach panel (it speaks "Not quite." +
    // whyWrong itself). Closing it turns the box to the side that tells.
    audio.wrong();
    onWrong?.();
    setTotalWrongs((n) => n + 1);
    const prior = boxWrongs;
    setBoxWrongs(prior + 1);
    setTeachFace(null);
    setStatus("wrong");
    const panel = { title: wrongTitle, explanation: box.whyWrong, tip: prior >= 1 ? hints.tier2 : hints.tier1 };
    later(() => setFeedback(panel), reduce ? WRONG_STAMP_MS_REDUCED : WRONG_STAMP_MS);
  };

  // The teach panel closes: turn to the side that gives it away, ring it, mark
  // its clues, and let the child call the same box again.
  const closePanel = () => {
    setFeedback(null);
    setStatus("inspect");
    if (!box) return;
    const target = tellFace(box);
    const d = turnsTo(rot, target);
    if (d !== 0) {
      audio.cardFlip();
      setRot(rot + d);
    }
    setTeachFace(target);
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const score = stars === 3 ? 100 : stars === 2 ? 70 : 40;
  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(score);
  };

  /* ---------------- render values ---------------- */

  const sceneH = sc(SCENE_H, k);
  const cubeW = sc(CUBE_W, k);
  const cubeH = sc(CUBE_H, k);
  const arrowBottom = sc(BOX_BOTTOM + CUBE_H / 2, k) - ARROW_SIZE / 2;
  const beltRolling = rolling > 0 && !reduce;
  const sealed = status === "crush" || status === "installed";
  // After a wrong call the ring stays with the side that tells: it shows
  // whenever that side faces the child, and goes with the box.
  const ringOn = !!teachFace && teachFace === currentFace && status === "inspect";
  // Round 1: the arrow toward the next unseen side breathes (turning right first).
  const nextDir: 1 | -1 | 0 = allSeen
    ? 0
    : !seen.includes(FACE_ORDER[mod4(rot + 1)])
      ? 1
      : !seen.includes(FACE_ORDER[mod4(rot - 1)])
        ? -1
        : 1;
  const guideDir = guided && canTurn ? nextDir : 0;
  const arrowsDim = showIntro || finished || !box || status !== "inspect";
  const decisionHeld = showIntro || finished || !box || speaking || status !== "inspect";
  const strip =
    status === "crush"
      ? binToast
      : status === "installed"
        ? installToast
        : allSeen
          ? decidePrompt ?? defaultDecidePrompt(installLabel, binLabel)
          : turnPrompt;
  const stripIcon = sealed ? "✅" : allSeen ? "❓" : "👆";
  const readingText = narr === "face" && box && readFace ? sideReadAloud(box, readFace) : "";

  return (
    <ExerciseFrame maxWidth={FRAME_MAX_W} padding={`${FRAME_PAD_Y}px ${FRAME_PAD_X}px`} decor>
      {fx.layer()}
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, each box's front as it rolls in, each side the first time it is turned to. */}
      {!showIntro && !finished && box && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="ftb-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={tint} recordedOnly onDone={() => setNarr(canRead(box.readAloud) ? "front" : "idle")} />
          )}
          {narr === "front" && box.readAloud && (
            <InfoNarration key={`ftb-front-${box.id}`} speaker={voice} lines={[box.readAloud]} accent={tint} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "face" && readFace && readingText && (
            <InfoNarration key={`ftb-face-${box.id}-${readFace}`} speaker={voice} lines={[readingText]} accent={tint} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: BOARD_GAP,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ------------ header: the game, the sides seen, the box count ------------ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            minHeight: HEADER_H,
            // Side padding keeps the header clear of the frame's corner ornaments.
            padding: "0 16px",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#dbeaff",
              whiteSpace: "nowrap",
            }}
          >
            <PixIcon emoji={introIcon} size={20} />
            {introTitle}
          </span>
          <div role="list" aria-label="Sides of the box" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {FACE_ORDER.map((face) => {
              const isSeen = seen.includes(face);
              const isCurrent = face === currentFace && !showIntro && !finished;
              return (
                <span
                  key={face}
                  role="listitem"
                  aria-label={`${labels[face]}: ${isSeen ? "seen" : "not seen yet"}`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    height: 26,
                    boxSizing: "border-box",
                    padding: "0 10px",
                    borderRadius: 999,
                    border: `2px solid ${isCurrent ? tint : isSeen ? "rgba(52,211,153,0.55)" : "rgba(159,180,232,0.3)"}`,
                    background: isSeen ? "rgba(52,211,153,0.12)" : "rgba(12,20,44,0.5)",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    color: isSeen ? "#a7f3d0" : "#8fa3d6",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isSeen && <PixIcon emoji="✅" size={14} />}
                  {labels[face]}
                </span>
              );
            })}
          </div>
          <span style={{ fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: tint, whiteSpace: "nowrap" }}>
            Box {Math.min(idx + 1, boxes.length)} of {boxes.length}
          </span>
        </div>

        {/* ------------ the conveyor: belt, box, arrows ------------ */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: sceneH,
            // Clip top and bottom (the crusher waits up top), but let a box roll
            // in from the frame edge and the arrow glow spill sideways.
            clipPath: "inset(0px -40px)",
          }}
        >
          {/* belt */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: sc(BELT_H, k),
              borderRadius: 14,
              background: "linear-gradient(180deg, #1b2344 0%, #131a35 100%)",
              border: "1.5px solid rgba(125,240,255,0.18)",
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={beltRolling ? { backgroundPositionX: ["0px", "-64px"] } : { backgroundPositionX: "0px" }}
              transition={beltRolling ? { repeat: Infinity, duration: 0.4, ease: "linear" } : { duration: 0.2 }}
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "repeating-linear-gradient(90deg, rgba(125,240,255,0.14) 0 22px, transparent 22px 64px)",
              }}
            />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: sc(6, k), display: "flex", justifyContent: "space-around" }}>
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span key={i} style={{ width: sc(10, k), height: sc(10, k), borderRadius: "50%", background: "rgba(159,180,232,0.35)" }} />
              ))}
            </div>
          </div>

          {/* the box, keyed per app so it rides the belt in and out */}
          <AnimatePresence mode="wait">
            {!showIntro && box && (
              <motion.div
                key={box.id}
                initial={reduce ? { opacity: 0 } : { x: 520, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { x: -520, opacity: 0 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 150, damping: 20 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: sc(BOX_BOTTOM, k),
                  width: cubeW,
                  height: cubeH,
                  marginLeft: -cubeW / 2,
                }}
              >
                {/* soft shadow on the belt */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: -sc(34, k),
                    width: sc(CUBE_W * 1.25, k),
                    height: sc(24, k),
                    marginLeft: -sc(CUBE_W * 1.25, k) / 2,
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%)",
                  }}
                />

                {status === "crush" && <Piston k={k} reduce={reduce} />}

                {/* squash shell: pressed flat on BIN, lifted on INSTALL */}
                <motion.div
                  animate={
                    status === "crush"
                      ? { scaleY: 0.1, y: 0, scale: 1 }
                      : status === "installed"
                        ? { scaleY: 1, y: -sc(12, k), scale: 1.02 }
                        : { scaleY: 1, y: 0, scale: 1 }
                  }
                  transition={
                    status === "crush"
                      ? reduce
                        ? { duration: 0.2 }
                        : { delay: 0.06, duration: 0.25, ease: "easeIn" }
                      : { type: "spring", stiffness: 260, damping: 18 }
                  }
                  style={{ width: "100%", height: "100%", transformOrigin: "50% 100%" }}
                >
                  {/* the 3D stage: the arrows turn it; a swipe here does too */}
                  <div
                    role="group"
                    aria-roledescription="app box"
                    aria-label={`${box.name}: ${labels[currentFace]} side`}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
                    style={{
                      width: "100%",
                      height: "100%",
                      perspective: sc(PERSPECTIVE, k),
                      cursor: canTurn ? "grab" : "default",
                      // Vertical pans still scroll the page on a phone.
                      touchAction: "pan-y",
                    }}
                  >
                    <motion.div
                      animate={{ rotateY: -rot * 90 + drag * 0.3 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 170, damping: 19 }}
                      style={{ width: "100%", height: "100%", position: "relative", transformStyle: "preserve-3d" }}
                    >
                      {FACE_ORDER.map((face, i) => (
                        <div
                          key={face}
                          aria-hidden={face !== currentFace}
                          style={{
                            position: "absolute",
                            inset: 0,
                            transform: `rotateY(${i * 90}deg) translateZ(${sc(CUBE_W / 2, k)}px)`,
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                          }}
                        >
                          <Face box={box} face={face} k={k} label={labels[face]} marked={ringOn && teachFace === face} />
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>

                {/* after a wrong call: the side that tells, ringed round its drawn edge */}
                {ringOn && (
                  <motion.div
                    aria-hidden
                    animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
                    transition={reduce ? undefined : { repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                    style={{
                      position: "absolute",
                      top: -sc(33, k),
                      bottom: -sc(33, k),
                      left: -sc(30, k),
                      right: -sc(30, k),
                      borderRadius: sc(24, k),
                      border: `4px dashed ${AMBER}`,
                      pointerEvents: "none",
                      zIndex: 2,
                    }}
                  />
                )}

                {/* stamps land only after the child commits */}
                <AnimatePresence>
                  {status === "wrong" && <Stamp key="stamp-wrong" color={BAD_RED} text={wrongStamp} k={k} reduce={reduce} />}
                  {status === "crush" && (
                    <Stamp key="stamp-bin" color={GOOD_GREEN} text={binToast} k={k} top="30%" delay={reduce ? 0.1 : 0.45} reduce={reduce} />
                  )}
                  {status === "installed" && <Stamp key="stamp-install" color={GOOD_GREEN} text={installToast} k={k} reduce={reduce} />}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          <TurnArrow side="left" label="Turn the box left" onTurn={() => turn(-1)} disabled={!canTurn} dim={arrowsDim} glow={guideDir === -1} bottom={arrowBottom} tint={tint} reduce={reduce} />
          <TurnArrow side="right" label="Turn the box right" onTurn={() => turn(1)} disabled={!canTurn} dim={arrowsDim} glow={guideDir === 1} bottom={arrowBottom} tint={tint} reduce={reduce} />
        </div>

        {/* ------------ the prompt strip ------------ */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0 12px" }}>
          <motion.div
            animate={stripControls}
            aria-live="polite"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              minHeight: STRIP_H,
              boxSizing: "border-box",
              padding: "6px 18px",
              borderRadius: 14,
              background: `${tint}1a`,
              border: `1px solid ${tint}59`,
              color: "#eef6ff",
              fontSize: 16,
              fontWeight: 800,
              lineHeight: 1.3,
              textAlign: "center",
            }}
          >
            <PixIcon emoji={stripIcon} size={22} />
            {strip}
          </motion.div>
        </div>

        {/* ------------ the decision: two identical buttons, sides flipped per box ------------ */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", minHeight: BUTTONS_H, padding: "0 12px" }}>
          {order.map((move) => {
            const label = move === "install" ? installLabel : binLabel;
            return (
              <DecisionButton
                key={move}
                label={label}
                ariaLabel={box ? `${label}: ${box.name}` : label}
                locked={!allSeen}
                held={decisionHeld}
                sealed={(status === "crush" && move === "bin") || (status === "installed" && move === "install")}
                reduce={reduce}
                onClick={() => choose(move)}
              />
            );
          })}
        </div>

        <style>{`
          @keyframes ftbGuide { 0%,100% { box-shadow: 0 0 0 3px ${tint}55, 0 0 16px ${tint}77 } 50% { box-shadow: 0 0 0 7px ${tint}22, 0 0 30px ${tint} } }
        `}</style>
      </div>

      {/* ------------ overlays ------------ */}
      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle ?? defaultIntroSubtitle(installLabel, binLabel)}
          icon={introIcon}
          narration={narration}
          threat={threat}
          character={narration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={closePanel}
        />
      )}

      {finished && !showIntro && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[`${installedCount} installed, ${binnedCount} in the bin`, completeLine]}
          narration={completeNarration}
          onContinue={complete}
        />
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Box sides                                                          */
/* ------------------------------------------------------------------ */

type Mark = "good" | "bad" | null;
const markBorder = (mark: Mark, rest: string) => (mark === "bad" ? BAD_RED : mark === "good" ? GOOD_GREEN : rest);

/**
 * One side of the box. Every side of every box wears the same cardboard and
 * the same chips: the words are the clues. `marked` (after a wrong call only)
 * rings each clue green (fits) or red (gives it away).
 */
function Face({
  box,
  face,
  k,
  label,
  marked,
}: {
  box: FlipBoxApp;
  face: FlipFaceKey;
  k: number;
  label: string;
  marked: boolean;
}) {
  const base: CSSProperties = {
    position: "relative",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    borderRadius: sc(16, k),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: sc(face === "asks" ? 6 : 8, k),
    padding: `${sc(26, k)}px ${sc(14, k)}px ${sc(14, k)}px`,
    textAlign: "center",
    background: "linear-gradient(180deg, #c9955c 0%, #a9763f 100%)",
    border: "2px solid rgba(74,46,18,0.7)",
    boxShadow: "inset 0 0 34px rgba(74,46,18,0.35)",
    overflow: "hidden",
    color: "#3a2408",
  };

  if (face === "front") {
    const stars = clamp(Math.round(box.stars ?? 5), 0, 5);
    return (
      <div style={base}>
        <Tape k={k} />
        {/* the glossy shop sticker: the too-good-to-be-true listing */}
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: sc(14, k),
            padding: `${sc(16, k)}px ${sc(12, k)}px`,
            background: "linear-gradient(180deg, #223058 0%, #16203f 100%)",
            border: "2px solid rgba(125,240,255,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: sc(7, k),
          }}
        >
          <PixIcon emoji={box.icon} size={sc(58, k)} />
          <div style={{ fontSize: sc(21, k), fontWeight: 900, lineHeight: 1.15, color: "#eaf6ff", overflowWrap: "anywhere" }}>{box.name}</div>
          <div
            style={{
              padding: `${sc(3, k)}px ${sc(12, k)}px`,
              // Rounded, not a pill, so a two-line tagline still looks right.
              borderRadius: sc(12, k),
              background: "linear-gradient(180deg, #ffd158, #f08c1a)",
              color: "#3a2408",
              fontSize: sc(14, k),
              fontWeight: 900,
              lineHeight: 1.25,
              letterSpacing: "0.04em",
              overflowWrap: "anywhere",
            }}
          >
            {box.tagline}
          </div>
          <div role="img" aria-label={`${stars} stars`} style={{ display: "flex", gap: sc(3, k) }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} style={{ display: "inline-flex", opacity: i < stars ? 1 : 0.22 }}>
                <PixIcon emoji="⭐" size={sc(20, k)} />
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (face === "maker" || face === "reviews") {
    const side = face === "maker" ? box.maker : box.reviews;
    const mark: Mark = marked ? (side.fishy ? "bad" : "good") : null;
    return (
      <div style={base}>
        <Tape k={k} />
        <FaceTag text={label} k={k} />
        <PixIcon emoji={face === "maker" ? "🕵️" : "💬"} size={sc(40, k)} />
        {side.title && <div style={{ fontSize: sc(20, k), fontWeight: 900, lineHeight: 1.15, overflowWrap: "anywhere" }}>{side.title}</div>}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: sc(6, k),
            width: "100%",
            boxSizing: "border-box",
            padding: `${sc(side.title ? 7 : 10, k)}px ${sc(10, k)}px`,
            borderRadius: sc(12, k),
            background: "rgba(255,244,222,0.8)",
            border: `2px solid ${markBorder(mark, "rgba(74,46,18,0.3)")}`,
            // With no title line, the words are the whole side: set them bigger.
            fontSize: sc(side.title ? 14 : 17, k),
            fontWeight: side.title ? 800 : 900,
            lineHeight: 1.3,
          }}
        >
          {mark && <PixIcon emoji={mark === "bad" ? "⚠️" : "✅"} size={sc(18, k)} style={{ flexShrink: 0 }} />}
          <span style={{ overflowWrap: "anywhere" }}>{side.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div style={base}>
      <Tape k={k} />
      <FaceTag text={label} k={k} />
      {box.asks.job && (
        <div style={{ fontSize: sc(13.5, k), fontWeight: 800, lineHeight: 1.25, color: "#4a2e12", overflowWrap: "anywhere" }}>{box.asks.job}</div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: sc(6, k), width: "100%" }}>
        {box.asks.items.map((item, i) => {
          const mark: Mark = marked ? (item.fishy ? "bad" : "good") : null;
          return (
            <div
              key={`${item.label}-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: sc(8, k),
                boxSizing: "border-box",
                padding: `${sc(6, k)}px ${sc(10, k)}px`,
                borderRadius: sc(12, k),
                background: "rgba(58,36,8,0.6)",
                // Always 2px, so a mark never shifts the row.
                border: `2px solid ${markBorder(mark, "transparent")}`,
                color: "#ffe9cf",
                fontSize: sc(15, k),
                fontWeight: 900,
                lineHeight: 1.2,
              }}
            >
              <PixIcon emoji={item.icon} size={sc(22, k)} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, textAlign: "left", overflowWrap: "anywhere" }}>{item.label}</span>
              {mark && <PixIcon emoji={mark === "bad" ? "🚫" : "✅"} size={sc(18, k)} style={{ flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Tape({ k }: { k: number }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "58%",
        height: sc(20, k),
        background: "rgba(240,225,200,0.5)",
        borderBottom: "1.5px dashed rgba(120,90,50,0.5)",
      }}
    />
  );
}

function FaceTag({ text, k }: { text: string; k: number }) {
  return (
    <div
      style={{
        padding: `${sc(4, k)}px ${sc(12, k)}px`,
        borderRadius: 999,
        background: "rgba(58,36,8,0.75)",
        color: "#ffd9ad",
        fontSize: sc(12, k),
        fontWeight: 900,
        letterSpacing: "0.1em",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene pieces                                                       */
/* ------------------------------------------------------------------ */

/** The crusher: drops from above the scene, presses the box flat, lifts away. */
function Piston({ k, reduce }: { k: number; reduce: boolean }) {
  const rodH = sc(130, k);
  const headH = sc(40, k);
  const total = rodH + headH;
  // Start with the head well above the drawn box top; press to the flattened top.
  const startY = -(total + sc(83, k));
  const pressY = sc(CUBE_H - 31, k) - total;
  return (
    <motion.div
      aria-hidden
      initial={{ y: startY }}
      animate={reduce ? { y: pressY } : { y: [startY, pressY, pressY, startY + sc(40, k)] }}
      transition={reduce ? { duration: 0.15 } : { duration: 1.3, times: [0, 0.24, 0.55, 1], ease: "easeInOut" }}
      style={{
        position: "absolute",
        left: "50%",
        top: 0,
        width: sc(160, k),
        marginLeft: -sc(80, k),
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: sc(26, k),
          height: rodH,
          margin: "0 auto",
          background: "linear-gradient(90deg, #6b7699, #aab4d4, #6b7699)",
          borderRadius: 6,
        }}
      />
      <div
        style={{
          width: "100%",
          height: headH,
          boxSizing: "border-box",
          borderRadius: 10,
          border: "2px solid #2a2f4a",
          background: "repeating-linear-gradient(45deg, #ffd158 0 16px, #2a2f4a 16px 32px)",
          boxShadow: "0 10px 24px -8px rgba(0,0,0,0.6)",
        }}
      />
    </motion.div>
  );
}

function Stamp({
  color,
  text,
  k,
  top = "34%",
  delay = 0,
  reduce,
}: {
  color: string;
  text: string;
  k: number;
  top?: string;
  delay?: number;
  reduce: boolean;
}) {
  return (
    /* The outer div owns the centring transform; framer would overwrite it on
     * the animated element, so the spring lives on the inner motion.div. */
    <div style={{ position: "absolute", top, left: "50%", transform: "translateX(-50%)", zIndex: 4, pointerEvents: "none" }}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { scale: 2.4, opacity: 0, rotate: -18 }}
        animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: -10 }}
        exit={{ opacity: 0 }}
        transition={reduce ? { delay, duration: 0.15 } : { delay, type: "spring", stiffness: 420, damping: 16 }}
        style={{
          padding: `${sc(10, k)}px ${sc(22, k)}px`,
          borderRadius: 14,
          border: `5px solid ${color}`,
          color,
          background: "rgba(8,10,22,0.82)",
          fontSize: sc(text.length > 12 ? 22 : 30, k),
          fontWeight: 900,
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          boxShadow: `0 0 34px -6px ${color}`,
        }}
      >
        {text}
      </motion.div>
    </div>
  );
}

function TurnArrow({
  side,
  label,
  onTurn,
  disabled,
  dim,
  glow,
  bottom,
  tint,
  reduce,
}: {
  side: "left" | "right";
  label: string;
  onTurn: () => void;
  /** Not tappable right now (Sarah speaking, a call being judged, intro). */
  disabled: boolean;
  /** Faded: turning is not part of this moment at all. */
  dim: boolean;
  /** Round 1 guide: this arrow shows the next unseen side. */
  glow: boolean;
  bottom: number;
  tint: string;
  reduce: boolean;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onTurn}
      disabled={disabled}
      whileTap={disabled || reduce ? undefined : { scale: 0.88 }}
      style={{
        position: "absolute",
        left: side === "left" ? 8 : undefined,
        right: side === "right" ? 8 : undefined,
        bottom,
        width: ARROW_SIZE,
        height: ARROW_SIZE,
        boxSizing: "border-box",
        padding: 0,
        borderRadius: "50%",
        border: `2.5px solid ${glow ? tint : "rgba(125,240,255,0.55)"}`,
        background: "rgba(12,20,44,0.8)",
        color: "#bfe8ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "inherit",
        cursor: disabled ? (dim ? "default" : "wait") : "pointer",
        opacity: dim ? 0.35 : 1,
        boxShadow: glow ? `0 0 0 3px ${tint}66, 0 0 22px ${tint}88` : "0 8px 18px rgba(0,0,0,0.35)",
        animation: glow && !reduce ? "ftbGuide 1.4s ease-in-out infinite" : undefined,
        transition: "opacity 200ms ease, border-color 200ms ease",
        touchAction: "manipulation",
        zIndex: 5,
      }}
    >
      <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden>
        <path
          d={side === "left" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}

/**
 * INSTALL and BIN: the exact same paint and size in every state until a right
 * call seals one. Locked (sides still unseen) they stay tappable, so a tap can
 * nudge the child back to the arrows.
 */
function DecisionButton({
  label,
  ariaLabel,
  locked,
  held,
  sealed,
  reduce,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  locked: boolean;
  /** Sarah speaking, a call being judged, or no box on the belt. */
  held: boolean;
  /** The right call, shown only after it was made. */
  sealed: boolean;
  reduce: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-disabled={locked || undefined}
      onClick={onClick}
      disabled={held}
      whileTap={held || locked || reduce ? undefined : { scale: 0.95 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        boxSizing: "border-box",
        minWidth: 196,
        minHeight: BUTTONS_H,
        padding: "10px 28px",
        borderRadius: 18,
        border: `2px solid ${sealed ? GOOD_GREEN : locked ? "rgba(159,180,232,0.3)" : "rgba(191,232,255,0.6)"}`,
        background: locked
          ? "linear-gradient(180deg, #222c50 0%, #19213f 100%)"
          : "linear-gradient(180deg, #2d4178 0%, #1d2b58 100%)",
        color: locked ? "#8fa3d6" : "#eef7ff",
        fontFamily: "inherit",
        fontSize: 19,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: held ? "wait" : "pointer",
        opacity: held && !sealed && !locked ? 0.6 : 1,
        boxShadow: sealed ? "0 0 20px rgba(52,211,153,0.55)" : "0 8px 20px rgba(0,0,0,0.35)",
        transition: "opacity 200ms ease, border-color 200ms ease, box-shadow 200ms ease, background 200ms ease, color 200ms ease",
        touchAction: "manipulation",
      }}
    >
      {locked ? <PixIcon emoji="🔒" size={22} /> : sealed ? <PixIcon emoji="✅" size={22} /> : null}
      {label}
    </motion.button>
  );
}
