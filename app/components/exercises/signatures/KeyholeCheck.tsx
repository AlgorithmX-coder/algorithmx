"use client";

/**
 * PEEK BEFORE YOU WALK: Week 16 (QR Codes & Links: Don't Take the Bait)
 * concept game, rebuilt as a data-driven, TAP-ONLY, UNTIMED concept game to the
 * Learn-Loop standard (the same conversion the Great Climb-Out got for Week 10,
 * the Calm-Down Console for Week 11, Read Your Own Trail for Week 12 and the
 * Day Jug for Week 13).
 *
 * The old Keyhole Check asked the child to DRAG a key onto a door and then spot
 * the ONE tooth that disagreed. Nothing is dragged any more, and the tooth is
 * gone on purpose: "spot the single difference in a lookalike" is already the
 * verb of Week 4 (the lookalike sender), Week 9 (the copycat app) and Week 14
 * (what changed between two pictures). A fourth would be a repeat.
 *
 * THE NEW VERB IS POSSESSION, NOT COMPARISON: does this sender have a key on
 * your ring AT ALL?
 *
 * The child stands in The Doorway Maze with a KEYRING of the people and places
 * they actually know hanging under the corridor. Doors come one at a time. Every
 * door wears a bright, friendly sign (the paint is identical on the honest doors
 * and the strangers' doors, so the paint can never be the tell) and claims a
 * sender. The child hunts the ring for that sender:
 *
 *   TAP 1 (not judged, changeable): lift a key off the ring, or lift the NO KEY
 *     tag. The lifted key floats up to the door's keyhole. Tapping another key
 *     swaps it; tapping the lifted one puts it back.
 *   TAP 2 (the only judged tap): the one button under the door. It is NOT a
 *     second question: it reads OPEN IT when a key is lifted and CHAIN IT when
 *     the NO KEY tag is lifted, so the whole decision lives in tap 1 and tap 2
 *     is the child committing to it.
 *
 *   Right call: the door swings open on warm light (a key on the ring) or the
 *     chains slam across it (no key on the ring), and Sarah says "That's right!"
 *     + the door's `why` in one take.
 *   Wrong call: the door rattles, the shared teach panel speaks "Not quite." +
 *     the door's `explanation`, the key goes back on the ring with that choice
 *     marked, and the SAME door waits for the retry. No door already checked is
 *     ever taken back.
 *
 * There is no timer, no dragging, no tooth-hunting and no fail state: the only
 * thing that ever moves the maze on is a tap. The last door raises the "MAZE
 * CHECKED!" ribbon, then the complete beat speaks the payoff. Concept 2: a door
 * you cannot match to somebody you actually know does not get opened, however
 * good the sign looks.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the shared intro (`threat`);
 * Sarah speaks the how-to once as the board appears (`coachLines`), then the
 * keyring labels once (so the child hears who is on their ring), then each
 * door's `readAloud` as the door arrives (audio only, `recordedOnly`, the board
 * held while she speaks and released by the shared spoken gate); a right call
 * speaks through VerdictVoice, a wrong one through WrongAnswerPanel; the
 * complete beat speaks the payoff, and it is held back until Sarah has finished
 * (the Week 9 bug). Round 1 guides the MECHANIC only: the ring breathes and the
 * band says what to do, never which key.
 *
 * EVERY spoken string comes from the week file. The clip generator reads the
 * week, never this engine, so the defaults below exist for one reason only: to
 * keep the legacy signature mount (`{ onComplete, narration, accent }`)
 * compiling and playable with no content file.
 *
 * Layout: the header, prompt strip, corridor panel, keyring band and hint all
 * fit the owner's 1414x771 window (the corridor shrinks with the window), and
 * the keyring wraps rather than scrolling sideways at 400px.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the words
// she reads are already on the strip, on the door and on the ring), the same
// recipe as the Day Jug and Read Your Own Trail.
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

export interface RingKey { id: string; label: string; icon: string; }
export interface MazeDoor {
  id: string;
  claim: string;            // what the door says: "From: Mum"
  sign: string;             // the friendly paint around it
  icon: string;
  readAloud: string;        // spoken as the door slides in
  keyId: string | null;     // which keyring key matches, or null for no key
  why: string;
  explanation: string;
}
export interface KeyholeCheckProps {
  keyring?: RingKey[];      // optional: built-in defaults keep the legacy registry mount working
  doors?: MazeDoor[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  ringLabel?: string;       // default "YOUR KEYRING"
  openLabel?: string;       // default "OPEN IT"
  chainLabel?: string;      // default "CHAIN IT"
  askPrompt?: string;       // default "Is this sender on your ring?"
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

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const FRAME_MAX_W = 860;
const FRAME_PAD_Y = 16;
/**
 * ExerciseFrame gives a DOM board no side padding of its own and its corners
 * are rounded by 28px, so a flush board collides with the curve and with the
 * frame's corner ornaments. The whole column is inset instead (the same fix
 * BelieveOMeter now carries).
 */
const BOARD_INSET_X = 22;
const BOARD_GAP = 8;
const HEADER_H = 28;
const STRIP_H = 40;

/**
 * Window height that is not the corridor: lesson HUD 64 + stage padding 80 +
 * frame padding 32 + header 28 + gaps 24 + strip 40 + keyring band 152 + hint
 * room 70 + 10 spare. At 1414x771 the corridor takes its full height and
 * nothing needs a scroll.
 */
const HEIGHT_RESERVE_PX = 500;
const MAX_SCENE_H = 270;
const MIN_SCENE_H = 180;

/** Room the keyring band needs under the corridor (ring row + commit slot). */
const BAND_MIN_H = 152;
/** The commit slot keeps its height whether or not a key is lifted, so the
 *  ring never jumps under a six-year-old's finger. */
const COMMIT_SLOT_H = 50;
/** The little maze map pinned inside the top of the corridor. */
const MAP_STRIP_H = 26;

/** The tag that stands for "nobody on my ring sent this". */
const NO_KEY_ID = "__no-key__";
const NO_KEY_LABEL = "NO KEY";
const NO_KEY_ICON = "✋";

const RATTLE_MS = 760;
const RATTLE_MS_REDUCED = 260;
const NEXT_DOOR_MS = 840;
const CLEARED_MS = 1500;

const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const WARM_GOLD = "#ffc46e";
const STEEL = "#9fb0d6";
const DEFAULT_TINT = "#b44dff";

const WRONG_TITLE_STRANGER = "No key on your ring opens that one";
const WRONG_TITLE_KNOWN = "That sender IS on your keyring";
const FALLBACK_EXPLANATION =
  "Read the sender on the door again, then hunt your whole ring for that same name.";

/* ------------------------------------------------------------------ */
/* Default content (the legacy signature mount)                       */
/* ------------------------------------------------------------------ */

/*
 * The child's ring holds the people and places they really know. It deliberately
 * holds MORE keys than the doors need (nobody writes to Zak this run), so the
 * child has to hunt the ring for the sender instead of ticking keys off in turn.
 *
 * PixIcon only has 3D art for the emoji in its MAP, so every icon here is one of
 * those; anything else would fall back to a flat system emoji beside them.
 */
const KEYRING: RingKey[] = [
  { id: "mum", label: "Mum", icon: "🏠" },
  { id: "school", label: "My school", icon: "🏫" },
  { id: "club", label: "My swim club", icon: "🏅" },
  { id: "zak", label: "My friend Zak", icon: "💬" },
];

/*
 * Authoring rule for a door: `keyId` names a key that is ON the ring, or is null
 * when nobody on the ring sent it. `why` is spoken when the child gets the door
 * right (whichever way it was right) and `explanation` when they get it wrong
 * (whichever way it was wrong), so both have to read sensibly on their own.
 *
 * The sign is the friendly paint, and it is deliberately just as cheerful on the
 * honest doors as on the strangers' ones: paint is never the tell, the ring is.
 * Two of the five doors DO open, so "check the ring" can never collapse into
 * "chain everything".
 */
const DOORS: MazeDoor[] = [
  {
    id: "mum-photos",
    claim: "From: Mum",
    sign: "Photos from the weekend!",
    icon: "✉️",
    readAloud:
      "First door, Cyber Hero. The sign says photos from the weekend, and the door says it is from Mum. Look down at your keyring. Is that sender on it?",
    keyId: "mum",
    why: "Mum is right there on your ring, so you HAVE a key for her. A door you can match to somebody you really know is a door you can open.",
    explanation:
      "Have another look along your ring. Mum is on it, so there is a key for this one. Lift Mum's key and open the door.",
  },
  {
    id: "prize-palace",
    claim: "From: Prize Palace",
    sign: "YOU WON! Tap to collect your free coins!",
    icon: "🎁",
    readAloud:
      "This door is covered in glitter and it says you have won free coins. It says it is from Prize Palace. Look down at your keyring. Is that sender on it?",
    keyId: null,
    why: "Nobody called Prize Palace is anywhere on your ring, so there is no key for them. Chain it, and the glitter stays outside where it belongs.",
    explanation:
      "Hunt your whole ring again. There is no Prize Palace key on it, and a shiny sign cannot make one appear. Lift the NO KEY tag instead.",
  },
  {
    id: "games-hub-code",
    claim: "From: Games Hub",
    sign: "Scan this code for 500 free coins!",
    icon: "📱",
    readAloud:
      "This door is made of dots, a code somebody stuck up at the bus stop. It says it is from Games Hub. Look down at your keyring. Is that sender on it?",
    keyId: null,
    why: "A code is a door you cannot see through, and Games Hub is not on your ring. No key, no walking through, Cyber Hero.",
    explanation:
      "A code being easy to scan does not put it on your ring. There is no Games Hub key hanging there, so this one gets the NO KEY tag.",
  },
  {
    id: "club-partner",
    claim: "From: your swim club's new prize partner",
    sign: "Free kit for every swimmer. Scan me!",
    icon: "🏆",
    readAloud:
      "Careful with this one. It says it is from your swim club's new prize partner. Look down at your keyring, and read that sender slowly. Is THAT sender on it?",
    keyId: null,
    why: "Your swim club is on your ring, but a prize partner is not your swim club. That is somebody else standing next to a name you know, and there is no key for them.",
    explanation:
      "Read the sender one more time. Your club is on your ring, but this door is from somebody ELSE who says they know your club, and that somebody has no key.",
  },
  {
    id: "school-letter",
    claim: "From: My school",
    sign: "Sports day letter for your grown-up",
    icon: "🏫",
    readAloud:
      "Last door. It is a plain little door with a letter for your grown-up, and it says it is from your school. Look down at your keyring. Is that sender on it?",
    keyId: "school",
    why: "Your school is on your ring, so that door is yours to walk through. Checking every door never meant chaining every door.",
    explanation:
      "Not every door in the maze is the Raccoon's. Your school IS on your ring, so lift its key and walk through.",
  },
];

const DEFAULT_INTRO_SUBTITLE =
  "Every door in the maze promises something lovely. Your keyring only holds the people and places you really know.";
const DEFAULT_COMPLETE_LINE =
  "A door you cannot match to somebody you know does not get opened, however good the sign looks.";
const DEFAULT_HINTS = {
  tier1: "Read the sender ON the door, then hunt down your whole keyring for that same name.",
  tier2: "If that sender is not on your ring, there is no key for it. Lift the NO KEY tag and chain the door.",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// A read-aloud only starts when there is something to say and the lesson is not
// muted, so the spoken gate never waits on a clip that cannot play.
const canRead = (text?: string) => !isAudioMuted() && !!text;

/** The corridor height for a window: never taller than the design, never so
 *  short the door stops reading. Read through useSyncExternalStore, so a
 *  resize re-renders with no effect-driven state. */
const sceneHeightFor = (vh: number) => Math.round(clamp(vh - HEIGHT_RESERVE_PX, MIN_SCENE_H, MAX_SCENE_H));
const subscribeViewport = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};
const readSceneH = () => sceneHeightFor(window.innerHeight);
const serverSceneH = () => MAX_SCENE_H;

/**
 * The id the door is actually answered with. A `keyId` that names nothing on the
 * ring would otherwise be an unanswerable door, so it falls back to the NO KEY
 * tag: an authoring slip costs the week a teaching point, never a dead end.
 */
const answerIdFor = (door: MazeDoor | undefined, ring: readonly RingKey[]) =>
  door?.keyId && ring.some((k) => k.id === door.keyId) ? door.keyId : NO_KEY_ID;

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

type Narr = "howto" | "ring" | "door" | "idle";
type Phase = "check" | "cleared";
type DoorFx = null | "open" | "chained" | "rattle";

export default function KeyholeCheck({
  keyring = KEYRING,
  doors = DOORS,
  introTitle = "Peek Before You Walk",
  introSubtitle = DEFAULT_INTRO_SUBTITLE,
  introIcon = "🚪",
  ringLabel = "YOUR KEYRING",
  openLabel = "OPEN IT",
  chainLabel = "CHAIN IT",
  askPrompt = "Is this sender on your ring?",
  completeTitle = "You checked every door!",
  completeLine = DEFAULT_COMPLETE_LINE,
  hints = DEFAULT_HINTS,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: KeyholeCheckProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const tint = useLessonTheme()?.accent ?? DEFAULT_TINT;
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker (that left games silent).
  const voice = "adam" as const;
  const sceneH = useSyncExternalStore(subscribeViewport, readSceneH, serverSceneH);

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Doors already checked: their pips go gold and stay gold, so the child can
  // see how much of the maze they have walked.
  const [checked, setChecked] = useState(0);
  // Read-aloud chain: the how-to once as the board appears ("howto"), then every
  // key on the ring once ("ring", which one = ringRead), then each door's
  // read-aloud as it arrives ("door"). Taps are held while she speaks.
  const [narr, setNarr] = useState<Narr>("idle");
  const [ringRead, setRingRead] = useState(0);
  const [phase, setPhase] = useState<Phase>("check");
  /** Tap 1: the key (or the NO KEY tag) lifted off the ring. Not judged. */
  const [picked, setPicked] = useState<string | null>(null);
  const [doorFx, setDoorFx] = useState<DoorFx>(null);
  // Choices already committed wrongly on this door: marked after the teach, so
  // the retry narrows instead of repeating.
  const [marked, setMarked] = useState<readonly string[]>([]);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [doorWrongs, setDoorWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  /** Shuts a door the instant it is answered, before React re-renders. */
  const answeringRef = useRef(false);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const total = Math.max(1, doors.length);
  const finished = idx >= doors.length;
  const door: MazeDoor | undefined = doors[idx];

  // The ring is muddled once per play, never left in the authored order (the
  // anti-sequence rule), but it is the SAME ring on every door: re-ordering it
  // between doors would make the child re-learn their own keyring each time.
  const shuffledRing = useShuffledOnce(keyring, { key: "ring" });
  // useShuffledOnce re-shuffles in a layout effect, so for one pre-paint commit
  // it still holds the previous list. Fall back to the authored ring for that
  // commit, so nothing reads a key that is not there.
  const ring =
    shuffledRing.length === keyring.length && shuffledRing.every((k) => keyring.includes(k)) ? shuffledRing : keyring;

  const answerId = answerIdFor(door, ring);

  // Spoken verdicts: Sarah says "That's right!" + why and the next door waits
  // for her. Wrong calls speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;
  const canTap = !showIntro && !finished && !!door && !speaking && doorFx !== "rattle" && phase === "check";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr, ringRead]);
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

  /* ---------------- the read-aloud chain ---------------- */

  const readDoor = (d: MazeDoor | undefined) => {
    setNarr(canRead(d?.readAloud) ? "door" : "idle");
  };
  /** The ring is read out once, at the start: these are the people you know. */
  const readRingThenDoor = () => {
    setRingRead(0);
    if (canRead(ring[0]?.label)) setNarr("ring");
    else readDoor(doors[0]);
  };
  const onRingDone = () => {
    const next = ringRead + 1;
    if (next < ring.length && canRead(ring[next]?.label)) setRingRead(next);
    else readDoor(doors[0]);
  };

  /* ---------------- beats ---------------- */

  const startBoard = () => {
    setShowIntro(false);
    if (isAudioMuted()) {
      setNarr("idle");
      return;
    }
    if (coachLines) setNarr("howto");
    else readRingThenDoor();
  };

  const advance = () => {
    const next = idx + 1;
    setIdx(next);
    setMarked([]);
    setPicked(null);
    setDoorFx(null);
    setDoorWrongs(0);
    answeringRef.current = false;
    if (next < doors.length) readDoor(doors[next]);
    else setNarr("idle");
  };

  /* ---------------- tap 1: lift a key off the ring (not judged) ---------------- */

  const lift = (id: string) => {
    if (!canTap || marked.includes(id)) return;
    // Lifting is free and reversible: tapping the lifted key puts it back.
    setPicked((prev) => (prev === id ? null : id));
    audio.select();
  };

  /* ---------------- tap 2: the only judged tap ---------------- */

  const commit = () => {
    if (!door || !canTap || !picked) return;
    // `canTap` only closes once React has re-rendered on verdict.speaking, so a
    // quick second tap landed inside that window and restarted the verdict,
    // cutting Sarah off mid-sentence. This latch shuts the door synchronously;
    // `advance` reopens it, and so does a wrong answer (the door waits).
    if (answeringRef.current) return;
    answeringRef.current = true;

    // Reported in the AUTHORED ring order, never the muddled one, so the parent
    // dashboard reads the same indices on every play.
    const choiceIds = [...keyring.map((k) => k.id), NO_KEY_ID];
    const wasCorrect = picked === answerId;
    onAnswered?.({
      questionKey: `door-${door.id}`,
      selectedIndex: choiceIds.indexOf(picked),
      correctIndex: choiceIds.indexOf(answerId),
      wasCorrect,
    });

    if (wasCorrect) {
      // fx.correct plays its own chime (no audio.correct() here).
      fx.correct({ xp: 25 });
      onCorrect?.();
      const done = idx + 1;
      setChecked(done);
      setDoorFx(answerId === NO_KEY_ID ? "chained" : "open");
      later(() => audio.drop(), reduce ? 40 : 200);
      const out = done >= total;
      if (out) {
        setPhase("cleared");
        later(() => audio.unlock(), reduce ? 120 : 560);
      }
      // Sarah: "That's right!" + why, one take; then a beat and the next door.
      verdict.say("right", door.why, () => later(advance, reduce ? 200 : out ? CLEARED_MS : NEXT_DOOR_MS));
      return;
    }

    // Wrong: the door rattles on its hinges, then the teach panel (it speaks
    // "Not quite." + explanation itself). The key goes back on the ring, that
    // choice is marked, and the SAME door waits. Every door already checked
    // stays checked.
    audio.wrong();
    onWrong?.();
    setDoorFx("rattle");
    setTotalWrongs((n) => n + 1);
    const prior = doorWrongs;
    setDoorWrongs(prior + 1);
    const tried = picked;
    const panel = {
      title: answerId === NO_KEY_ID ? WRONG_TITLE_STRANGER : WRONG_TITLE_KNOWN,
      explanation: door.explanation || FALLBACK_EXPLANATION,
      tip: prior >= 1 ? hints.tier2 : hints.tier1,
    };
    later(
      () => {
        setDoorFx(null);
        setPicked(null);
        setMarked((prev) => [...prev, tried]);
        setFeedback(panel);
        // the same door waits, so the child must be able to tap again
        answeringRef.current = false;
      },
      reduce ? RATTLE_MS_REDUCED : RATTLE_MS,
    );
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const score = stars === 3 ? 100 : stars === 2 ? 70 : 40;
  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(score);
  };

  /* ---------------- render values ---------------- */

  const cleared = phase === "cleared";
  const remaining = Math.max(0, total - checked);
  // Round 1 teaches the MECHANIC only: the whole ring breathes, equally, so the
  // glow can never point at a key.
  const guided = idx === 0 && doorWrongs === 0 && canTap;
  const stripText = cleared ? "MAZE CHECKED!" : door?.readAloud ?? "";
  const stripIcon = cleared ? "🎉" : "🔍";
  const bandLine = cleared
    ? "EVERY DOOR CHECKED"
    : guided
      ? picked
        ? "Round 1: now tap the button under the door"
        : "Round 1: lift a key, or the NO KEY tag"
      : doorWrongs > 0
        ? "Try another one, Cyber Hero"
        : remaining === 1
          ? "1 door left to check"
          : `${remaining} doors left to check`;
  const hintText = doorWrongs >= 2 ? hints.tier2 : doorWrongs === 1 ? hints.tier1 : undefined;
  const hintTier = (doorWrongs >= 2 ? 2 : 1) as 1 | 2;
  const readingKey = narr === "ring" ? ring[ringRead]?.label ?? "" : "";
  const liftedKey = picked && picked !== NO_KEY_ID ? ring.find((k) => k.id === picked) : undefined;
  const commitLabel = picked === NO_KEY_ID ? chainLabel : openLabel;
  const doorH = Math.max(120, sceneH - MAP_STRIP_H - 26);

  return (
    <ExerciseFrame maxWidth={FRAME_MAX_W} padding={`${FRAME_PAD_Y}px 0`} decor>
      {fx.layer()}
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, the ring once, then
          each door's read-aloud as it arrives. Every block is gated on
          `!showIntro`: a board narration that starts while the intro overlay is
          still up clobbers the intro's clip, and the intro's "I'm ready" button
          then never unlocks (SignBingo W14, SenderLineup W15). */}
      {!showIntro && !finished && door && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration
              key="khc-howto"
              speaker={coachLines.speaker ?? voice}
              lines={coachLines.lines}
              accent={tint}
              recordedOnly
              onDone={readRingThenDoor}
            />
          )}
          {narr === "ring" && readingKey && (
            <InfoNarration
              key={`khc-ring-${ringRead}`}
              speaker={voice}
              lines={[readingKey]}
              accent={tint}
              recordedOnly
              onDone={onRingDone}
            />
          )}
          {narr === "door" && door.readAloud && (
            <InfoNarration
              key={`khc-door-${door.id}`}
              speaker={voice}
              lines={[door.readAloud]}
              accent={tint}
              recordedOnly
              onDone={() => setNarr("idle")}
            />
          )}
        </div>
      )}

      {/* The whole board is inset: flush content collided with the frame's 28px
          rounded corners and its corner ornaments. */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: BOARD_GAP,
          padding: `0 ${BOARD_INSET_X}px`,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ------------ header ------------ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            minHeight: HEADER_H,
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
              color: "#e7ddff",
            }}
          >
            <PixIcon emoji={introIcon} size={20} />
            {introTitle}
          </span>
          <span
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: tint,
              whiteSpace: "nowrap",
            }}
          >
            Door {Math.min(idx + 1, doors.length)} of {doors.length}
          </span>
        </div>

        {/* ------------ the prompt strip (every word Sarah reads) ------------ */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
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
              background: cleared ? "rgba(52,211,153,0.16)" : `${tint}1f`,
              border: `1px solid ${cleared ? GOOD_GREEN : `${tint}66`}`,
              color: "#f3eeff",
              fontSize: 16,
              fontWeight: 800,
              lineHeight: 1.3,
              textAlign: "center",
            }}
          >
            <PixIcon emoji={stripIcon} size={22} style={{ flexShrink: 0 }} />
            <span style={{ overflowWrap: "anywhere" }}>{stripText}</span>
          </div>
        </div>

        {/* ------------ the corridor: the door + the keyring band ------------ */}
        <div
          style={{
            position: "relative",
            borderRadius: 20,
            overflow: "hidden",
            background: "#100b2b",
            border: `2px solid ${tint}3d`,
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)",
          }}
        >
          {/* ---- the corridor scene ---- */}
          <div style={{ position: "relative", height: sceneH }}>
            <Corridor tint={tint} />

            {/* the maze map: one pip per door, gold once checked */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 6,
                height: MAP_STRIP_H - 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                zIndex: 6,
              }}
            >
              {doors.map((d, i) => (
                <span
                  key={d.id}
                  aria-hidden
                  title={d.claim}
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 15,
                    height: 18,
                    borderRadius: "3px 3px 2px 2px",
                    border: `1.5px solid ${i < checked ? WARM_GOLD : i === idx && !finished ? "#ffffff" : `${tint}80`}`,
                    background:
                      i < checked
                        ? "rgba(255,196,110,0.85)"
                        : i === idx && !finished
                          ? `${tint}55`
                          : "rgba(20,14,50,0.8)",
                    boxShadow: i < checked ? `0 0 10px ${WARM_GOLD}80` : "none",
                    transition: "background 320ms ease, border-color 320ms ease",
                  }}
                />
              ))}
            </div>

            {/* ---- THE DOOR ---- */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: MAP_STRIP_H,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 7,
                perspective: 900,
              }}
            >
              {door && !finished && (
                <MazeDoorPanel
                  key={door.id}
                  door={door}
                  height={doorH}
                  tint={tint}
                  reduce={reduce}
                  fx={doorFx}
                  liftedIcon={picked === NO_KEY_ID ? NO_KEY_ICON : liftedKey?.icon}
                  liftedLabel={picked === NO_KEY_ID ? NO_KEY_LABEL : liftedKey?.label}
                  askPrompt={askPrompt}
                />
              )}
            </div>

            {/* a soft vignette so the corridor reads as one lit surface */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 8,
                pointerEvents: "none",
                background: "radial-gradient(ellipse at 50% 46%, transparent 54%, rgba(9,6,26,0.55) 100%)",
              }}
            />

            {/* the last door: the ribbon drops across the corridor */}
            {cleared && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 240, damping: 18, delay: 0.3 }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 10,
                  zIndex: 9,
                  display: "flex",
                  justifyContent: "center",
                  padding: "0 12px",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    maxWidth: "94%",
                    padding: "9px 18px",
                    borderRadius: 16,
                    border: "3px solid #7dffb0",
                    background: `linear-gradient(180deg, ${GOOD_GREEN} 0%, #0e9f6e 100%)`,
                    color: "#053b2a",
                    fontSize: 21,
                    fontWeight: 900,
                    letterSpacing: "0.03em",
                    lineHeight: 1.2,
                    textAlign: "center",
                    boxShadow: "0 18px 46px -18px rgba(9,60,40,0.75)",
                  }}
                >
                  <PixIcon emoji="🚪" size={28} style={{ flexShrink: 0 }} />
                  <span style={{ overflowWrap: "anywhere" }}>MAZE CHECKED!</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* ---- the keyring band: the people and places you really know ---- */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              minHeight: BAND_MIN_H,
              boxSizing: "border-box",
              padding: "7px 10px 10px",
              background: "linear-gradient(180deg, rgba(9,6,26,0.62) 0%, rgba(9,6,26,0.92) 46%)",
              borderTop: `1px solid ${tint}2e`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 6,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: cleared ? GOOD_GREEN : tint,
                minHeight: 14,
                textAlign: "center",
              }}
            >
              <span>{ringLabel}</span>
              <span style={{ color: "#cfc2ee", letterSpacing: "0.08em" }}>{bandLine}</span>
            </div>

            {/* Once the maze is checked there is nothing left to lift. */}
            {!cleared && (
              <>
                <div
                  role="group"
                  aria-label={askPrompt}
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    borderRadius: 16,
                    padding: 2,
                    animation: guided && !picked && !reduce ? "khcGuide 1.6s ease-in-out infinite" : undefined,
                    boxShadow: guided && !picked ? `0 0 0 3px ${tint}55, 0 0 18px ${tint}66` : undefined,
                  }}
                >
                  {ring.map((k, i) => (
                    <RingTile
                      key={k.id}
                      icon={k.icon}
                      label={k.label}
                      order={i}
                      tint={tint}
                      reduce={reduce}
                      held={!canTap}
                      marked={marked.includes(k.id)}
                      lifted={picked === k.id}
                      onPick={() => lift(k.id)}
                    />
                  ))}
                  {/* The NO KEY tag wears exactly the same paint, size and chrome
                      as every key, so the ring never hints that this is the
                      answer: on two of the five default doors it is wrong. */}
                  <RingTile
                    icon={NO_KEY_ICON}
                    label={NO_KEY_LABEL}
                    order={ring.length}
                    tint={tint}
                    reduce={reduce}
                    held={!canTap}
                    marked={marked.includes(NO_KEY_ID)}
                    lifted={picked === NO_KEY_ID}
                    onPick={() => lift(NO_KEY_ID)}
                  />
                </div>

                {/* the commit slot: it keeps its height whether or not a key is
                    lifted, so the ring never jumps under a small finger */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: COMMIT_SLOT_H,
                    marginTop: 4,
                  }}
                >
                  {picked ? (
                    <motion.button
                      type="button"
                      onClick={commit}
                      disabled={!canTap}
                      aria-label={commitLabel}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 20 }}
                      whileTap={!canTap || reduce ? undefined : { scale: 0.96 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        minHeight: 44,
                        padding: "8px 24px",
                        borderRadius: 14,
                        border: `2px solid ${WARM_GOLD}`,
                        background: "linear-gradient(180deg, #4a2f86 0%, #2c1a5c 100%)",
                        color: "#fff4dd",
                        fontFamily: "inherit",
                        fontSize: 17,
                        fontWeight: 900,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: canTap ? "pointer" : "wait",
                        opacity: canTap ? 1 : 0.8,
                        boxShadow: `0 10px 26px -12px ${WARM_GOLD}, inset 0 0 20px rgba(255,255,255,0.06)`,
                        touchAction: "manipulation",
                      }}
                    >
                      <PixIcon emoji={picked === NO_KEY_ID ? "🔒" : "🔓"} size={24} style={{ flexShrink: 0 }} />
                      <span>{commitLabel}</span>
                    </motion.button>
                  ) : (
                    <span
                      style={{
                        color: "#b6a8da",
                        fontSize: 13.5,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        textAlign: "center",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {askPrompt}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ------------ the tiered hint ------------ */}
        {hintText && !cleared && (
          <div style={{ maxWidth: 560, width: "100%", margin: "0 auto" }}>
            <HintBubble tier={hintTier} speaker={voice} text={hintText} />
          </div>
        )}

        <style>{`
          @keyframes khcGuide { 0%,100% { box-shadow: 0 0 0 3px ${tint}55, 0 0 16px ${tint}66 } 50% { box-shadow: 0 0 0 7px ${tint}22, 0 0 30px ${tint} } }
          @keyframes khcHole { 0%,100% { box-shadow: 0 0 0 2px rgba(255,196,110,0.5), 0 0 14px ${WARM_GOLD}88 } 50% { box-shadow: 0 0 0 5px rgba(255,196,110,0.18), 0 0 26px ${WARM_GOLD} } }
        `}</style>
      </div>

      {/* ------------ overlays ------------ */}
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

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => setFeedback(null)}
        />
      )}

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          line is still speaking would cut her off (the Week 9 bug). */}
      {finished && !showIntro && !speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${doors.length} door${doors.length === 1 ? "" : "s"} checked, ${totalWrongs === 0 ? "nothing forced" : totalWrongs === 1 ? "1 second look" : `${totalWrongs} second looks`}`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={complete}
        />
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* The corridor                                                       */
/* ------------------------------------------------------------------ */

/**
 * The maze around the door: a violet passage with side doors receding into the
 * dark on both walls, so the child can feel there are always more doors coming.
 * Purely decorative and identical on every round: nothing here ever hints at an
 * answer.
 */
function Corridor({ tint }: { tint: string }) {
  const depths = [0.2, 0.46, 0.7];
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* back wall + floor */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, #1a1348 0%, #251d66 52%, #100b2b 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "26%",
          background: "linear-gradient(180deg, rgba(58,40,120,0.9) 0%, rgba(22,14,54,0.95) 100%)",
          borderTop: `1px solid ${tint}33`,
        }}
      />
      {/* the corridor lamps overhead */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: "42%",
          background: `radial-gradient(ellipse at 50% -10%, ${tint}4d 0%, transparent 62%)`,
        }}
      />
      {/* side doors receding on both walls */}
      {depths.map((d, i) =>
        [0, 1].map((side) => {
          const h = 96 * (1 - d * 0.62);
          const x = side === 0 ? 3 + d * 12 : 97 - d * 12;
          return (
            <div
              key={`${i}-${side}`}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${30 + d * 10}%`,
                width: h * 0.34,
                height: h,
                transform: `translateX(-50%) skewY(${side === 0 ? 10 : -10}deg)`,
                borderRadius: "6px 6px 2px 2px",
                background: "linear-gradient(180deg, rgba(38,26,92,0.95) 0%, rgba(20,13,52,0.95) 100%)",
                border: `1px solid ${tint}33`,
                opacity: 0.55 - d * 0.22,
              }}
            />
          );
        }),
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* One door of the maze                                               */
/* ------------------------------------------------------------------ */

/**
 * The door the child is standing in front of. Its SIGN is the friendly paint
 * (bright on every door, honest or not, so paint is never the tell) and its
 * CLAIM is the sender it says it is from. Under them sits the keyhole, and
 * whatever the child has lifted off their ring floats beside it.
 *
 * The door is a DOM element, not SVG, so swinging it on `rotateY` needs no
 * `transform-box` fix: the hinge is a plain `transformOrigin` on the left edge
 * and the parent supplies the perspective. Nothing here animates scale or y
 * against a static translate.
 */
function MazeDoorPanel({
  door,
  height,
  tint,
  reduce,
  fx,
  liftedIcon,
  liftedLabel,
  askPrompt,
}: {
  door: MazeDoor;
  height: number;
  tint: string;
  reduce: boolean;
  fx: DoorFx;
  liftedIcon?: string;
  liftedLabel?: string;
  askPrompt: string;
}) {
  const open = fx === "open";
  const chained = fx === "chained";
  const rattling = fx === "rattle";
  const signH = Math.round(clamp(height * 0.3, 44, 72));

  return (
    <div style={{ position: "relative", width: "min(330px, 66%)", height }}>
      {/* the warm room behind the door, revealed when it swings */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "16px 16px 6px 6px",
          background: `radial-gradient(ellipse at 50% 60%, ${WARM_GOLD} 0%, #b9742c 52%, #2a1a12 100%)`,
          opacity: open ? 1 : 0,
          boxShadow: open ? `0 0 70px ${WARM_GOLD}99` : "none",
          transition: "opacity 420ms ease",
        }}
      />

      <motion.div
        animate={
          reduce
            ? { rotateY: open ? -40 : 0 }
            : rattling
              ? { x: [0, -8, 7, -5, 4, 0], rotateY: 0 }
              : { rotateY: open ? -64 : 0, x: 0 }
        }
        transition={
          reduce ? { duration: 0.2 } : rattling ? { duration: 0.44 } : { type: "spring", stiffness: 90, damping: 16 }
        }
        style={{
          position: "absolute",
          inset: 0,
          transformOrigin: "left center",
          transformStyle: "preserve-3d",
          display: "flex",
          flexDirection: "column",
          gap: 6,
          boxSizing: "border-box",
          padding: 10,
          borderRadius: "16px 16px 6px 6px",
          border: `3px solid ${rattling ? BAD_RED : chained ? STEEL : `${tint}b3`}`,
          background: "linear-gradient(180deg, #3a2a6e 0%, #241848 58%, #1a1036 100%)",
          boxShadow: rattling
            ? `0 0 30px ${BAD_RED}88`
            : "0 18px 40px -20px rgba(6,3,20,0.95), inset 0 0 26px rgba(255,255,255,0.05)",
          transition: "border-color 260ms ease, box-shadow 260ms ease",
        }}
      >
        {/* the sign: the friendly paint, just as cheerful on every door */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minHeight: signH,
            boxSizing: "border-box",
            padding: "6px 9px",
            borderRadius: 12,
            background: "linear-gradient(135deg, #ffd166 0%, #ff9ad5 52%, #7df0ff 100%)",
            color: "#2b1a44",
            fontSize: 12.5,
            fontWeight: 900,
            lineHeight: 1.2,
            textAlign: "left",
            boxShadow: "0 6px 16px -10px rgba(0,0,0,0.8)",
          }}
        >
          <PixIcon emoji={door.icon} size={26} style={{ flexShrink: 0 }} />
          <span style={{ overflowWrap: "anywhere" }}>{door.sign}</span>
        </div>

        {/* the claim: the sender the door says it is from */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            boxSizing: "border-box",
            padding: "5px 8px",
            borderRadius: 9,
            background: "rgba(10,6,26,0.72)",
            border: `1px solid ${tint}59`,
            color: "#f1eaff",
            fontSize: 13.5,
            fontWeight: 900,
            lineHeight: 1.2,
            textAlign: "center",
          }}
        >
          <span style={{ overflowWrap: "anywhere" }}>{door.claim}</span>
        </div>

        {/* the keyhole, and whatever the child has lifted off the ring */}
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: 34,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <div
            aria-hidden
            style={{
              display: "grid",
              placeItems: "center",
              width: 30,
              height: 30,
              flexShrink: 0,
              borderRadius: "50%",
              background: "rgba(8,5,20,0.9)",
              border: "2px solid rgba(255,196,110,0.55)",
              animation: !liftedIcon && !reduce && !open && !chained ? "khcHole 1.9s ease-in-out infinite" : undefined,
            }}
          >
            <svg width={12} height={16} viewBox="0 0 12 16" aria-hidden>
              <circle cx={6} cy={5} r={4} fill="#0a0514" />
              <path d="M4 8 L8 8 L9.5 15 L2.5 15 Z" fill="#0a0514" />
            </svg>
          </div>

          {liftedIcon ? (
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 20 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                minWidth: 0,
                padding: "5px 10px",
                borderRadius: 11,
                border: `2px solid ${WARM_GOLD}`,
                background: "linear-gradient(180deg, rgba(74,47,134,0.96) 0%, rgba(34,20,72,0.96) 100%)",
                color: "#fff3dc",
                fontSize: 12.5,
                fontWeight: 900,
                lineHeight: 1.15,
                boxShadow: `0 0 18px ${WARM_GOLD}66`,
              }}
            >
              <PixIcon emoji={liftedIcon} size={20} style={{ flexShrink: 0 }} />
              <span style={{ overflowWrap: "anywhere" }}>{liftedLabel}</span>
            </motion.div>
          ) : (
            <span
              style={{
                color: "#b9a9e0",
                fontSize: 11.5,
                fontWeight: 800,
                lineHeight: 1.2,
                overflowWrap: "anywhere",
                textAlign: "left",
              }}
            >
              {askPrompt}
            </span>
          )}
        </div>
      </motion.div>

      {/* the chains: they slam across a door nobody on the ring sent */}
      {chained && (
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }}>
          {[0.36, 0.64].map((y, i) => (
            <motion.div
              key={y}
              initial={reduce ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 18, delay: i * 0.1 }}
              style={{
                position: "absolute",
                left: -8,
                right: -8,
                top: `${y * 100}%`,
                height: 13,
                borderRadius: 7,
                background: `repeating-linear-gradient(90deg, ${STEEL} 0px, #e8eeff 6px, ${STEEL} 12px)`,
                boxShadow: "0 4px 12px -6px rgba(0,0,0,0.9)",
              }}
            />
          ))}
          <motion.div
            initial={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 300, damping: 16, delay: 0.22 }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "42%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <PixIcon emoji="🔒" size={38} />
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The keyring                                                        */
/* ------------------------------------------------------------------ */

/**
 * One thing hanging on the child's ring: a key for somebody they know, or the
 * NO KEY tag. Every tile wears the same paint, the same size and the same
 * chrome, so the ring never hints at the answer. A tile only changes once the
 * child has lifted it, or has committed to it and heard why it was wrong.
 */
function RingTile({
  icon,
  label,
  order,
  tint,
  reduce,
  held,
  marked,
  lifted,
  onPick,
}: {
  icon: string;
  label: string;
  /** Position on the ring: drives which side it swings in from. */
  order: number;
  tint: string;
  reduce: boolean;
  /** Sarah is speaking, or the maze is checked: not tappable right now. */
  held: boolean;
  /** Already committed on this door and taught: out of the running. */
  marked: boolean;
  /** Lifted off the ring and waiting at the keyhole. */
  lifted: boolean;
  onPick: () => void;
}) {
  const fromLeft = order % 2 === 0;
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: fromLeft ? -22 : 22, y: 8 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={
        reduce
          ? { duration: 0.2, delay: order * 0.04 }
          : { type: "spring", stiffness: 220, damping: 22, delay: 0.08 + order * 0.08 }
      }
      style={{ flex: "1 1 118px", minWidth: 0, maxWidth: 156 }}
    >
      <motion.button
        type="button"
        aria-label={label}
        aria-pressed={lifted}
        aria-disabled={marked || undefined}
        onClick={onPick}
        disabled={held || marked}
        animate={reduce ? undefined : { y: lifted ? -4 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 22 }}
        whileTap={held || marked || reduce ? undefined : { scale: 0.96 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          width: "100%",
          minHeight: 60,
          boxSizing: "border-box",
          padding: "7px 8px",
          borderRadius: 14,
          border: `2px solid ${marked ? BAD_RED : lifted ? WARM_GOLD : `${tint}80`}`,
          background: marked
            ? "linear-gradient(180deg, rgba(60,20,34,0.9) 0%, rgba(30,12,22,0.95) 100%)"
            : lifted
              ? "linear-gradient(180deg, rgba(88,58,150,0.96) 0%, rgba(44,26,92,0.96) 100%)"
              : "linear-gradient(180deg, rgba(42,30,86,0.95) 0%, rgba(22,14,50,0.96) 100%)",
          color: marked ? "#ffd2d2" : "#f2ecff",
          textAlign: "center",
          fontFamily: "inherit",
          fontSize: 12.5,
          fontWeight: 800,
          lineHeight: 1.2,
          cursor: marked ? "default" : held ? "wait" : "pointer",
          opacity: marked ? 0.72 : held ? 0.85 : 1,
          boxShadow: marked
            ? "none"
            : lifted
              ? `0 0 0 3px ${WARM_GOLD}44, 0 10px 24px -14px ${WARM_GOLD}`
              : `0 10px 24px -14px ${tint}, inset 0 0 18px rgba(255,255,255,0.04)`,
          transition: "border-color 220ms ease, background 220ms ease, opacity 220ms ease",
          touchAction: "manipulation",
        }}
      >
        <span aria-hidden style={{ display: "grid", placeItems: "center", width: 28, height: 28 }}>
          <PixIcon emoji={marked ? "🚫" : icon} size={26} />
        </span>
        <span style={{ width: "100%", minWidth: 0, overflowWrap: "anywhere" }}>{label}</span>
      </motion.button>
    </motion.div>
  );
}
