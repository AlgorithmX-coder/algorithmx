"use client";

/**
 * FriendPanner: the FOLLOWERS ARE NOT FRIENDS drill (Week 17, concept 3).
 *
 * This week's old screen-4 signature, rebuilt to the Learn-Loop standard and
 * CONVERTED TO TAP-ONLY. The original asked the child to shake a gold pan by
 * wiggle-dragging it or hammering taps at it, which is a wrist game, not a
 * thinking game, and it is the one input a six year old on a tablet cannot
 * reliably produce. It also carried all of its own content hardcoded, which
 * under the Learn-Loop rules means Sarah never said a word of it. The pan
 * stays, the river stays, the gold stays, and its one really good line stays
 * too: do you know them OFF the screen? The shaking is gone.
 *
 * What replaces it is the verb the concept actually wants. A follower count is
 * a number that goes up on its own; a friend is somebody a child could name,
 * place and describe. So the child is handed the river a scoop at a time and
 * PICKS OUT the gold with their fingers, as many or as few per scoop as they
 * think, and only then tips the pan and lets the rest wash through. Choosing
 * several things and then committing to the lot is a decision no other engine in
 * the library asks for, and it is the right shape here, because the lesson is
 * not about any one person in the scoop. It is about the RATIO: two hundred and
 * some followers, and a handful of actual friends. A game that judged one card
 * at a time could never show a child that, and the counters along the top do it
 * without a word being said.
 *
 * The gold test is deliberately simple and deliberately not about niceness:
 * could you point this person out to a grown-up and say where you know them
 * from? Sam from football, yes. Your nana, yes. "SuperFan2000", who is lovely
 * and funny and replies to everything, no, because "lovely in the comments" is
 * not a place you have ever met anybody. That last kind is the fool's gold, and
 * every scoop must have one, because the ones that glitter are the whole reason
 * this lesson exists.
 *
 * Verb: PICK SEVERAL, THEN COMMIT THE LOT. It is NOT a one-at-a-time judged
 * queue (the Glass Check, the Rope Line, Week 16's doorways are): nothing is
 * judged until the child tips, and until then every pebble can go back. It is
 * NOT a two-bin sort (Hook Sort is): there is one pan and one river, the child
 * never carries anything anywhere, and the river is not a bin, it is what
 * happens to whatever was not chosen. It is NOT a free-order board (the Frost
 * Mirror, this same week, is): a scoop is finished all at once and cannot be
 * half-answered. It is NOT a memory or matching game (Week 1's and Week 13's
 * are): every pebble says who it is, in writing, the whole time.
 *
 * Nothing races the child: tap-only, untimed, no lose state, nothing falls, and
 * a scoop tipped wrong costs nothing beyond Sarah explaining that scoop and the
 * pebbles staying exactly where they were so the picks can be fixed.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * as the river opens and each scoop's `readAloud` spoken as it arrives (audio-
 * only, `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS),
 * a one-take spoken verdict on the tip ("That's right!" + that scoop's `why` via
 * VerdictVoice; a wrong tip: WrongAnswerPanel speaks "Not quite." + that scoop's
 * `explanation`), hint tiers per scoop, and a payoff on the complete beat gated
 * on `!verdict.speaking` so it can never cut Sarah off. The next scoop arrives
 * from the verdict's own callback, so no payoff can cut her off either. A
 * synchronous ref latch shuts the tip lever the instant it is pressed, because
 * `canTap` only closes once React re-renders on `verdict.speaking` and a quick
 * second tap would otherwise restart the verdict and cut Sarah off (the real
 * Week 12 bug).
 *
 * The SCOOPS are shuffled every play, and so are the pebbles inside each scoop,
 * so the gold is never in the same place twice.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each scoop's `readAloud`, its `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads the
 * WEEK FILE, so anything left to a component default is never recorded and plays
 * as silence, with no error anywhere. Every pebble's `name` and `who` are READ
 * ON SCREEN, never spoken. `why` is spoken ONLY when the scoop was tipped right
 * and `explanation` ONLY when it was wrong, so a line in the wrong field is
 * silent even though the field is full.
 *
 * Authoring: three scoops of four pebbles reads best (two to four scoops, three
 * to five pebbles each). EVERY scoop needs at least one gold and at least one
 * fool's gold: a scoop that is all river teaches a child to tip an empty pan,
 * and a scoop with no glitter in it teaches nothing at all. A gold pebble's
 * `who` must name a PLACE the child knows them from ("Kicks with you at
 * football"), and a fool's gold pebble's `who` must be warm and useless
 * ("Replies to every single post with a heart"), because that contrast is the
 * entire skill. A scoop's `why` has to walk its own pebbles, not talk about
 * friendship in general. Keep `name` to about 16 characters and `who` to about
 * 40. Every icon must be in PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 + counters 46 + river 286 (pan 246 plus chrome) + gap 12 + tip lever 74 +
 * strip 28 + hint gap 8 = ~519px, so the counters, the pan and the lever are on
 * screen without a scroll. At 400px the pebbles fall to one column and nothing
 * scrolls sideways.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion, AnimatePresence } from "motion/react";
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
// she reads is already on screen), same recipe as GlassCheck / FrostMirror.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface RiverPebble {
  id: string;
  /** Who they are called. Read on screen, never spoken. */
  name: string;
  /**
   * Where the child knows them from, or the warm useless thing that stands in
   * for it. Read on screen, never spoken. This line IS the test.
   */
  who: string;
  icon: string;
  /** True when the child could point them out and say where they know them. */
  gold: boolean;
}

export interface RiverScoop {
  id: string;
  /** Chrome over the pan for this scoop. Read on screen, never spoken. */
  label: string;
  /** Spoken as the scoop lands in the pan. Never says which are gold. */
  readAloud: string;
  pebbles: RiverPebble[];
  /** SPOKEN when the scoop is tipped right. Walks its own pebbles. */
  why: string;
  /** SPOKEN when the scoop is tipped wrong. */
  explanation: string;
}

export interface FriendPannerProps {
  scoops: RiverScoop[];
  /**
   * The follower number on the profile, which never changes however much gold
   * the child finds. That is exactly why it is on screen.
   */
  followerCount?: number;
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Chrome, never spoken. */
  followersLabel?: string;
  friendsLabel?: string;
  panLabel?: string;
  tipLabel?: string;
  emptyTipLabel?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/** Fixed chrome copy the props do not cover (never spoken). */
const TIP_TOAST = "PANNED IT!";
const WRONG_TITLE = "Have another look in the pan";
const EMPTY_PEBBLES: RiverPebble[] = [];

/**
 * The LEGACY SIGNATURE MOUNT's fallback river, and nothing else.
 *
 * Week 17 plays this engine as a regular data-driven exercise and passes every
 * scoop from its week file. This set exists only so the old
 * `{ type: "signature", mechanic: "friendPanner" }` route still mounts something
 * playable if anything ever reaches it. It is deliberately NOT what ships: its
 * lines live in this component rather than in a week file, so the clip generator
 * never sees them and Sarah never reads them (the Week 11 re-theme trap). If a
 * week ever renders this set, that week has forgotten its `scoops` prop.
 */
const DEFAULT_SCOOPS: RiverScoop[] = [
  {
    id: "legacy-1",
    label: "A scoop from the river",
    readAloud: "Here comes a scoop. Look at who is in your pan.",
    why: "You knew Maya from school and Sam from football. SuperFan2000 is lovely, but you have never met them anywhere.",
    explanation: "Check the little line under each name. It has to say WHERE you know them from.",
    pebbles: [
      { id: "legacy-maya", name: "Maya", who: "Sits next to you at school", icon: "🏫", gold: true },
      { id: "legacy-sam", name: "Sam", who: "Kicks with you at football", icon: "🎮", gold: true },
      { id: "legacy-fan", name: "SuperFan2000", who: "Replies to every post with a heart", icon: "💬", gold: false },
      { id: "legacy-gamer", name: "GamerBuddy99", who: "Sends you a hundred stars a day", icon: "⭐", gold: false },
    ],
  },
];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

/** Geometry (px). */
const PEBBLE_MIN_H = 104;
const LEVER_MIN_H = 62;

/** Paints. Every pebble wears the same river stone until the pan is tipped: a
 *  pebble that looks golden before the tip has told the child the answer. */
const RIVER = "linear-gradient(180deg, #14324a 0%, #102941 58%, #0c1f33 100%)";
const PAN_COPPER = "linear-gradient(180deg, #d9a05e 0%, #b97f42 58%, #96632f 100%)";
const PAN_EDGE = "#7a4f24";
const STONE = "linear-gradient(160deg, #f0efe6 0%, #ddd9c9 54%, #cbc6b3 100%)";
const STONE_GOLD = "linear-gradient(160deg, #ffeeb4 0%, #f5d477 54%, #e0b64c 100%)";
const INK = "#2b2415";
const GOLD = "#e0b64c";

export default function FriendPanner({
  scoops,
  followerCount = 214,
  introTitle = "The Friend Panner",
  introSubtitle = "The Feed river is full of followers. Pick out the gold, then tip the rest away.",
  introIcon = "💎",
  followersLabel = "FOLLOWERS",
  friendsLabel = "GOLD FOUND",
  panLabel = "IN YOUR PAN",
  tipLabel = "TIP THE PAN",
  emptyTipLabel = "PICK YOUR GOLD FIRST",
  completeTitle = "Panned to the gold!",
  completeLine = "That is the real number, Cyber Hero. Small, and every single one of them yours.",
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
}: FriendPannerProps) {
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
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  /** The pebbles pressed into the pan's dimples, this scoop. */
  const [picked, setPicked] = useState<Set<string>>(() => new Set());
  /** Set once this scoop has been tipped correctly (it washes, then moves on). */
  const [tipped, setTipped] = useState(false);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [scoopWrongs, setScoopWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  /** Gold banked across every scoop so far: the number the week is about. */
  const [goldFound, setGoldFound] = useState(0);

  // The SCOOPS are shuffled every play; so are the pebbles inside each one, so
  // the gold is never in the same dimple twice.
  const deck = useShuffledOnce(scoops?.length ? scoops : DEFAULT_SCOOPS, { key: "friend-panner" });
  const finished = deck.length > 0 && idx >= deck.length;
  const scoop = deck[idx];
  const pebbles = useShuffledOnce(scoop?.pebbles ?? EMPTY_PEBBLES, { key: `friend-panner-${scoop?.id ?? "none"}` });

  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || tipped;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the lever synchronously.
  const handlingRef = useRef(false);
  // Scoop 1 guides the MECHANIC only: the lever breathes once something is in
  // the pan, so the glow says "you tip it with this", never who is gold.
  const guided = idx === 0;

  // Safety releases for the spoken gate (never leave the river held).
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

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    handlingRef.current = false;
    setIdx((i) => i + 1);
    setPicked(new Set());
    setTipped(false);
    setScoopWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── Pressing a pebble into the pan, or taking it back out ───────── */
  const togglePebble = (p: RiverPebble) => {
    if (speaking) return;
    audio.select();
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(p.id)) next.delete(p.id);
      else next.add(p.id);
      return next;
    });
  };

  /* ───────── THE TIP: the only judged moment in the scoop ───────── */
  const tip = () => {
    if (!scoop || speaking || picked.size === 0) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const wantIds = pebbles.filter((p) => p.gold).map((p) => p.id);
    const right = wantIds.length === picked.size && wantIds.every((id) => picked.has(id));
    onAnswered?.({
      questionKey: `friendpanner-${scoop.id}`,
      // A scoop is one answer: how many pebbles were committed against how many
      // were gold. The dashboard reads those two numbers for every play.
      selectedIndex: picked.size,
      correctIndex: wantIds.length,
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: TIP_TOAST });
      onCorrect?.();
      setTipped(true);
      setGoldFound((n) => n + wantIds.length);
      // Sarah: "That's right!" + this scoop's why, then the next scoop lands.
      // Moving on from her callback is what keeps a payoff from ever cutting
      // her off.
      verdict.say("right", scoop.why, () => {
        window.setTimeout(advance, reduce ? 250 : 1100);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const sw = scoopWrongs + 1;
      setScoopWrongs(sw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself. The
      // pebbles stay exactly as the child left them, so they fix their picks
      // rather than starting the scoop again from nothing.
      setFeedback({ title: WRONG_TITLE, explanation: scoop.explanation, tip: sw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = scoopWrongs >= 2 ? hints?.tier2 : scoopWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (scoopWrongs >= 2 ? 2 : 1) as 1 | 2;
  const totalGold = useMemo(
    () => deck.reduce((n, s) => n + s.pebbles.filter((p) => p.gold).length, 0),
    [deck],
  );
  const strip = tipped
    ? "Washed through. The next scoop is coming"
    : scoopWrongs > 0
      ? "Have another think. Could you say WHERE you know each one from?"
      : picked.size === 0
        ? guided
          ? "Scoop 1: tap everyone you actually know off the screen"
          : "Tap everyone you actually know off the screen"
        : "Happy with your picks? Tip the pan and wash the rest away";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── One counter along the top ───────── */
  const counter = (label: string, value: string, tint: string) => (
    <div
      style={{
        flex: "1 1 130px",
        minWidth: 0,
        padding: "7px 12px",
        borderRadius: 12,
        background: "rgba(0,0,0,0.34)",
        border: `1px solid ${tint}66`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
      }}
    >
      <span style={{ fontFamily: LABEL_FONT, fontSize: 9, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,247,230,0.66)" }}>
        {label}
      </span>
      <span style={{ fontFamily: KID_FONT, fontSize: 22, fontWeight: 900, lineHeight: 1.05, color: tint, fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
    </div>
  );

  /* ───────── One pebble in the pan ───────── */
  const renderPebble = (p: RiverPebble) => {
    const inPan = picked.has(p.id);
    // Only AFTER the tip does a pebble show what it was. Before that every
    // pebble wears the same river stone, or the game is over on sight.
    const revealed = tipped;
    return (
      <motion.button
        key={p.id}
        type="button"
        aria-label={`${p.name}: ${p.who}`}
        aria-pressed={inPan}
        onClick={() => togglePebble(p)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.94 }}
        animate={
          revealed && !p.gold
            ? reduce
              ? { opacity: 0.15 }
              : { opacity: 0.12, y: 26, scale: 0.9 }
            : { opacity: 1, y: 0, scale: inPan ? 1.04 : 1 }
        }
        transition={{ duration: 0.3 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          minHeight: PEBBLE_MIN_H,
          padding: "10px 9px",
          borderRadius: 999,
          // Every pebble wears the same stone until the pan is tipped.
          background: revealed && p.gold ? STONE_GOLD : STONE,
          border: `3px solid ${inPan ? GOLD : "rgba(255,255,255,0.7)"}`,
          boxShadow: inPan
            ? `0 0 20px ${GOLD}99, inset 0 0 0 2px rgba(43,36,21,0.16)`
            : "0 10px 18px -12px rgba(0,0,0,0.9), inset 0 0 0 2px rgba(43,36,21,0.12)",
          color: INK,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          textAlign: "center",
          fontFamily: KID_FONT,
          cursor: speaking ? "default" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease, background 320ms ease",
        }}
      >
        <PixIcon emoji={p.icon} size={24} />
        <span style={{ fontSize: 13.5, fontWeight: 900, lineHeight: 1.15, overflowWrap: "anywhere" }}>{p.name}</span>
        <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.22, opacity: 0.74, overflowWrap: "anywhere" }}>{p.who}</span>
        {inPan && !revealed && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
            style={{ position: "absolute", top: -6, right: -4, display: "grid", placeItems: "center" }}
          >
            <PixIcon emoji="✊" size={22} />
          </motion.span>
        )}
      </motion.button>
    );
  };

  return (
    <ExerciseFrame maxWidth={880} decor>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each scoop as
          it lands. Gated on !showIntro, always: a board line that starts while
          the intro card is still open clobbers the intro's own clip and the
          "I'm ready" button never appears (the SignBingo / SenderLineup bug).
          Every line comes from the week file. */}
      {!showIntro && !finished && scoop && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="fp-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`fp-read-${scoop.id}`} speaker={voice} lines={[scoop.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && scoop && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Scoop {Math.min(idx + 1, deck.length)} of {deck.length}
            </span>
          </div>

          {/* The board: the counters, the river with the pan in it, the lever.
              Inset 22px so it never collides with the frame's rounded corners. */}
          <div
            style={{
              margin: "0 22px",
              padding: "12px 12px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* THE TWO NUMBERS. The follower count never moves however much gold
                the child finds, and that gap is the entire lesson, said without
                anybody having to say it. */}
            <div style={{ width: "100%", display: "flex", gap: 8 }}>
              {counter(followersLabel, String(followerCount), "#9fb4d8")}
              {counter(friendsLabel, `${goldFound}`, GOLD)}
            </div>

            {/* THE RIVER, with the pan held in it. */}
            <div
              style={{
                width: "100%",
                borderRadius: 16,
                background: RIVER,
                border: "1.5px solid rgba(255,247,230,0.18)",
                padding: "10px 10px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
                <PixIcon emoji="🌀" size={15} />
                <span>{panLabel}</span>
                <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.7)", letterSpacing: "0.1em" }}>
                  {scoop.label}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={scoop.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, y: 26, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.32 }}
                  style={{ width: "100%" }}
                >
                  {/* THE PAN. Same copper dish, same dimples, every scoop. */}
                  <div
                    style={{
                      width: "100%",
                      borderRadius: "22px 22px 90px 90px",
                      background: PAN_COPPER,
                      border: `5px solid ${PAN_EDGE}`,
                      boxShadow: "inset 0 8px 20px rgba(0,0,0,0.3), 0 16px 30px -18px rgba(0,0,0,0.95)",
                      padding: "14px 14px 22px",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 8,
                    }}
                  >
                    {pebbles.map(renderPebble)}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* THE LEVER. One tap, and whatever was not picked washes away. */}
            <motion.button
              type="button"
              onClick={tip}
              disabled={speaking || picked.size === 0}
              animate={
                guided && picked.size > 0 && !speaking && !reduce
                  ? { boxShadow: [`0 0 0 3px ${accent}55`, `0 0 0 7px ${accent}22`, `0 0 0 3px ${accent}55`] }
                  : {}
              }
              transition={{ duration: 1.4, repeat: Infinity }}
              whileTap={speaking || picked.size === 0 || reduce ? undefined : { scale: 0.97 }}
              style={{
                width: "100%",
                maxWidth: 420,
                minHeight: LEVER_MIN_H,
                borderRadius: 14,
                background: picked.size === 0 ? "rgba(255,247,230,0.1)" : PAN_COPPER,
                border: `3px solid ${picked.size === 0 ? "rgba(255,247,230,0.22)" : "#f0c98a"}`,
                color: picked.size === 0 ? "rgba(255,247,230,0.5)" : INK,
                fontFamily: KID_FONT,
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: "0.04em",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                cursor: speaking || picked.size === 0 ? "default" : "pointer",
                touchAction: "manipulation",
                transition: "background 240ms ease, color 240ms ease, border-color 240ms ease",
              }}
            >
              <PixIcon emoji="🌀" size={24} />
              {picked.size === 0 ? emptyTipLabel : `${tipLabel} (${picked.size} kept)`}
            </motion.button>
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
          verdict is still speaking would cut her off (the Week 9 bug). The two
          numbers land side by side, which is the whole concept in one line. */}
      {finished && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${followerCount} followers. ${totalGold} friends.`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
