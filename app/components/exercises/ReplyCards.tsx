"use client";

/**
 * ReplyCards — the one-decision SELECT drill: a moment lands, three uniform
 * choices, tap the one a hero would take.
 *
 * SKINS.
 *
 * `skin: "cards"` (the default, untouched), plus the `"doors"`, `"levers"` and
 * `"balloons"` re-skins: an incoming chat message lands and three reply cards
 * fan out below it. Tap the safe reply → it slots into the chat with a green
 * glow and the next round arrives. Tap a risky one → it bounces back and
 * teaches via WrongAnswerPanel. One decision per round, no meter, no branching
 * — deliberately the calm single-shot counterpart to ChatSimulator's
 * escalating conversation. Every pixel, string and timing of those four skins
 * is exactly as it shipped, because the weeks that still mount them have not
 * been rebuilt yet.
 *
 * `skin: "speaker"` is the Week 14 Megaphone Rule, for The Listening House. The
 * child is standing in a room with a smart speaker on the side, its ear-light
 * softly on, and an everyday moment lands: Dad wants the tablet password, the
 * surprise party needs planning, a friend wants the club word. The three cards
 * are no longer replies to type — they are things the child could SAY OUT
 * LOUD, right here, with the speaker listening. Pick the one that keeps it off
 * the air (write it down and pass it over, whisper it in another room, save it
 * for tomorrow) and it joins the KEPT OFF THE AIR shelf, which fills up round
 * by round.
 *
 * The lesson is the CHANNEL, not the content: Week 2 owns what counts as
 * private, and this never re-teaches it. Every option here is about the same
 * already-private thing; what differs is whether it goes through the air in a
 * room with ears. Things a child would never type, people say out loud without
 * thinking — that is the whole novelty of this beat.
 *
 * Tone (the owner's Week 14 rule): curious, never creepy. The speaker is a
 * friendly helper with a warm light, never a red eye and never a spy. It is
 * drawn small and calm, it never "reacts" to a wrong pick, and nothing on
 * screen suggests the child's own home is against them. Knowing where the ears
 * are is the power; the device is fine.
 *
 * Nothing races the child in any skin: tap-only, untimed, one decision in play,
 * no lose state, and a wrong pick costs nothing but Sarah explaining it.
 *
 * Learn-Loop wiring (all skins): Raccoon boast in the intro (`threat`), Sarah's
 * how-to once and every round's `readAloud` spoken as the moment lands
 * (audio-only, `recordedOnly`, taps held while she speaks, released by the
 * shared SPOKEN_GATE_MAX_MS and by the master mute), a one-take spoken verdict
 * on every pick ("That's right!" + that option's `why` via VerdictVoice; a
 * wrong pick: WrongAnswerPanel speaks "Not quite." + that option's
 * `explanation`), hint tiers, and a payoff on the complete beat gated on
 * `!verdict.speaking` so it can never cut Sarah off. The next round is opened
 * from the verdict's own callback, for exactly the same reason. Rounds and the
 * options inside them are each shuffled once, so authored order is never a tell.
 *
 * A synchronous ref latch shuts the row the instant a card is tapped, because
 * `speaking` only closes once React has re-rendered and a quick second tap
 * inside that window would restart the verdict and cut Sarah off mid-sentence
 * (the real Week 12 bug). The latch is released from the verdict callback on a
 * right pick and at once on a wrong one, so a retry is always one tap.
 *
 * Round 1 guides the MECHANIC only: all three cards breathe together, equally,
 * so the glow says "tap one of these", never which one. Every card wears the
 * same paper, size and ink, every round.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each round's `readAloud`, each
 * option's `why` and `explanation`, `hints`, `completeNarration`). The clip
 * generator reads the WEEK FILE, so anything left to a component default is
 * never recorded and plays as silence, with no error anywhere. Which field is
 * spoken where:
 *   - the moment lands -> `round.readAloud`
 *   - a SAFE pick      -> `option.why`         (after the shared "That's right!")
 *   - a RISKY pick     -> `option.explanation` (after the shared "Not quite.")
 * A line in the wrong one of those three is silent even when it is not empty.
 *
 * Authoring (speaker skin): three or four rounds, three options each (a
 * two-item list always comes back reversed, so the shuffle needs three), one
 * `isSafe` per round. Keep `message` to about two short lines (it is the
 * moment), an option `text` to about 40 characters (it is a thing said out
 * loud), `readAloud` to one sentence, and `why` and `explanation` to one
 * kid-sized sentence each — every option needs an `explanation`, including the
 * safe one, so a re-tap is never silent. `keptLabel` is the short chip the safe
 * pick puts on the shelf ("the tablet password"); it is never spoken. Every
 * icon must be in PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + room row 132 + gap 12 + ask row 20 + gap 8 + cards
 * 132 + gap 12 + shelf 104 + strip 28 + hint gap 8 = ~521px, so the room, all
 * three cards and the shelf are on screen without a scroll. At 400px the cards
 * fall into one column, the speaker sits above the moment, and nothing scrolls
 * sideways.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as TrackBack / NightFall.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface ReplyOption {
  text: string;
  isSafe: boolean;
  /** SPOKEN on a SAFE pick, after the shared "That's right!". Week file only. */
  why?: string;
  /** SPOKEN on a RISKY pick after "Not quite.", and shown in the panel. */
  explanation: string;
}

export interface ReplyRound {
  id: string;
  from: string;
  fromIcon: string;
  message: string;
  /** SPOKEN as the moment lands. Week file only, or it plays as silence. */
  readAloud?: string;
  /** Speaker skin: the short chip a safe pick puts on the shelf. Never spoken. */
  keptLabel?: string;
  /** 3-4 options; exactly one isSafe. */
  replies: ReplyOption[];
}

export interface ReplyCardsProps {
  rounds: ReplyRound[];
  /** Visual skin: fanned chat cards (default), tall kindness DOORS (W5), brass LEVERS (W8), bobbing BALLOONS (W18) or the W14 smart SPEAKER room. */
  skin?: "cards" | "doors" | "levers" | "balloons" | "speaker";
  /** Intro copy overrides (re-theme per week). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** In-game copy overrides (defaults keep the W3 chat skin). */
  pickLabel?: string;
  roundNoun?: string;
  correctToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  scoreNoun?: string;
  /** Speaker skin chrome (never spoken): the device's name plate. */
  deviceLabel?: string;
  /** Speaker skin chrome (never spoken): the moment's eyebrow. */
  situationLabel?: string;
  /** Speaker skin chrome (never spoken): the shelf the safe picks fill up. */
  airLabel?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const CARD_TILT = [-4, 0, 4, -2];
const EMPTY_REPLIES: ReplyOption[] = [];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px), speaker skin. */
const ROOM_MIN_H = 132;
const SAY_MIN_H = 124;
const SAY_MIN_W = 190;
const SHELF_MIN_H = 86;
/** Paints, speaker skin. A lamp-lit evening room with one friendly device. */
const ROOM_BG = "linear-gradient(180deg, #2f1f10 0%, #241708 58%, #180f06 100%)";
const ROOM_BOARD = "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.42) 100%)";
const SAY_PAPER = "#fff6e8";
const SAY_INK = "#2a1f18";
const EAR_HUE = "#45e3ff";
const ROOM_INK = "#fff3e2";

export default function ReplyCards({
  rounds,
  skin = "cards",
  introTitle,
  introSubtitle,
  introIcon,
  pickLabel,
  roundNoun,
  correctToast,
  wrongTitle,
  completeTitle,
  completeLine,
  scoreNoun,
  deviceLabel,
  situationLabel,
  airLabel,
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
}: ReplyCardsProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  const room = skin === "speaker";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [sent, setSent] = useState<number | null>(null); // reply index slotted into the chat
  const [wrongCount, setWrongCount] = useState(0);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Read-aloud chain: the how-to once as the room opens, then each moment as it
  // lands. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // Speaker skin: the secrets kept off the air, in the order the child kept them.
  const [kept, setKept] = useState<{ id: string; label: string }[]>([]);

  // Anti-sequence: the messages land in a random order, and each round's reply
  // cards are fanned out in a random order (authored data keeps the safe reply
  // in a predictable spot).
  const shownRounds = useShuffledOnce(rounds);
  const finished = idx >= shownRounds.length;
  const round = shownRounds[idx];
  const replies = useShuffledOnce(round?.replies ?? EMPTY_REPLIES, { key: round?.id ?? "done" });

  // Spoken verdicts: Sarah says "That's right!" + why, and the next moment waits
  // for her. Risky picks speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || sent !== null;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the row synchronously.
  const handlingRef = useRef(false);

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const startBoard = () => {
    setShowIntro(false);
    if (isAudioMuted()) {
      setNarr("idle");
      return;
    }
    // The chat skins keep their visible CoachCaption, which plays that same
    // clip itself, so only the speaker room speaks the how-to through this
    // chain - otherwise the two would talk over each other.
    setNarr(room && coachLines ? "howto" : shownRounds[0]?.readAloud ? "read" : "idle");
  };

  // The only place idx ever moves, so the per-round state is cleared here
  // rather than from an effect that watches it, and Sarah is handed the next
  // moment's read-aloud in the same beat.
  const advance = () => {
    const next = idx + 1;
    setIdx(next);
    setSent(null);
    setRoundWrongs(0);
    setNarr(!isAudioMuted() && shownRounds[next]?.readAloud ? "read" : "idle");
  };

  const pick = (i: number) => {
    if (!round || sent !== null || showIntro) return;
    if (speaking) return;
    // Synchronous: a second tap in the same frame must never reach the verdict.
    if (handlingRef.current) return;
    handlingRef.current = true;
    setHasInteracted(true);
    const reply = replies[i];
    const correctIndex = replies.findIndex((r) => r.isSafe);
    onAnswered?.({
      questionKey: `reply-${round.id}`,
      selectedIndex: i,
      correctIndex,
      wasCorrect: reply.isSafe,
    });
    if (reply.isSafe) {
      audio.correct();
      fx.correct({ xp: 25, text: correctToast ?? "SAFE REPLY!" });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setSent(i);
      setKept((prev) => [...prev, { id: round.id, label: round.keptLabel ?? round.from }]);
      // Sarah: "That's right!" + this option's why, then the next moment. Moving
      // on from her callback is what keeps a payoff from ever cutting her off.
      verdict.say("right", reply.why, () => {
        handlingRef.current = false;
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      const w = roundWrongs + 1;
      setRoundWrongs(w);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; every card
      // stays out and the same moment waits, so the retry is one tap.
      setFeedback({
        title: wrongTitle ?? "Hmm - that reply isn't safe",
        explanation: reply.explanation,
        tip: w >= 2 ? hints?.tier2 : hints?.tier1,
      });
      handlingRef.current = false;
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  /* ────────────────────────── SPEAKER SKIN ────────────────────────── */
  // Round 1 teaches the mechanic only: all three cards breathe together, so the
  // glow can never point at an answer.
  const guided = room && idx === 0 && !hasInteracted && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "rcGuide 1.4s ease-in-out infinite" }
      : {};
  const roomStrip =
    sent !== null
      ? "Kept off the air. Nice work, Cyber Hero"
      : roundWrongs > 0
        ? "Have another think. Which one never goes through the air?"
        : guided
          ? "Tap what you would say out loud here"
          : "Tap what you would say out loud";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* The device: small, calm and friendly. A warm mesh body and one soft light
     ring, breathing slowly. Never a red eye, never a reaction to a wrong pick. */
  const device: ReactNode = (
    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, width: 92 }}>
      <div style={{ position: "relative", width: 62, height: 74 }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            top: 8,
            borderRadius: "26px 26px 16px 16px",
            background: "linear-gradient(180deg, #57493c 0%, #3b3027 60%, #2a211a 100%)",
            border: "2px solid rgba(255,201,138,0.4)",
            boxShadow: "inset 0 2px 0 rgba(255,255,255,0.12)",
            backgroundSize: "6px 6px",
          }}
        />
        <motion.span
          aria-hidden
          animate={reduce ? { opacity: 0.85 } : { opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.2, repeat: reduce ? 0 : Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            left: 7,
            right: 7,
            top: 4,
            height: 14,
            borderRadius: 999,
            background: `linear-gradient(180deg, ${EAR_HUE}, rgba(69,227,255,0.25))`,
            boxShadow: `0 0 16px ${EAR_HUE}aa`,
          }}
        />
        <span
          aria-hidden
          style={{ position: "absolute", left: 0, right: 0, bottom: 10, display: "grid", placeItems: "center" }}
        >
          <PixIcon emoji="💬" size={22} />
        </span>
      </div>
      <span
        style={{
          fontFamily: LABEL_FONT,
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: EAR_HUE,
          textAlign: "center",
          lineHeight: 1.25,
          overflowWrap: "anywhere",
        }}
      >
        {deviceLabel ?? "Smart speaker"}
      </span>
    </div>
  );

  /** One thing the child could say out loud. Same paper, size and ink, always. */
  const renderSay = (r: ReplyOption, i: number): ReactNode => {
    const chosen = sent === i;
    return (
      <motion.button
        key={`${round?.id ?? "r"}-${i}`}
        type="button"
        aria-label={r.text}
        onClick={() => pick(i)}
        onPointerEnter={() => audio.hover()}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : 0.1 + i * 0.08 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${SAY_MIN_W}px`,
          minWidth: 0,
          minHeight: SAY_MIN_H,
          padding: "12px 14px",
          // A speech bubble, because this is a thing SAID, not typed.
          borderRadius: "18px 18px 18px 5px",
          background: SAY_PAPER,
          border: `3px solid ${chosen ? "#16a34a" : "#ffffff"}`,
          boxShadow: chosen
            ? "0 0 20px rgba(22,163,74,0.5), inset 0 0 0 1.5px rgba(42,31,24,0.14)"
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
          color: SAY_INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: KID_FONT,
          fontSize: 15,
          fontWeight: 800,
          lineHeight: 1.25,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(guided),
        }}
      >
        <span style={{ overflowWrap: "anywhere" }}>{r.text}</span>
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

  /** KEPT OFF THE AIR: the shelf the safe picks fill up, round by round. */
  const shelf: ReactNode = (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="🤫" size={16} />
        <span>{airLabel ?? "KEPT OFF THE AIR"}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,243,226,0.65)" }}>
          {kept.length} of {shownRounds.length}
        </span>
      </div>
      <div
        role="status"
        aria-label={airLabel ?? "KEPT OFF THE AIR"}
        style={{
          minHeight: SHELF_MIN_H,
          borderRadius: 16,
          border: kept.length ? `2px solid ${accent}aa` : "2px dashed rgba(255,243,226,0.18)",
          background: kept.length ? `${accent}1c` : "rgba(0,0,0,0.18)",
          padding: "10px 12px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          alignContent: "center",
          justifyContent: kept.length ? "flex-start" : "center",
          gap: 8,
          color: ROOM_INK,
          fontFamily: KID_FONT,
          transition: "border-color 220ms ease, background 220ms ease",
        }}
      >
        {kept.length === 0 ? (
          <span style={{ opacity: 0.55, fontFamily: LABEL_FONT, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
            Nothing on the shelf yet
          </span>
        ) : (
          kept.map((k, i) => (
            <motion.span
              key={k.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 20, delay: i === kept.length - 1 ? 0.1 : 0 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                maxWidth: "100%",
                padding: "6px 11px 6px 7px",
                borderRadius: 999,
                background: "rgba(10,7,4,0.6)",
                border: `1.5px solid ${accent}`,
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1.2,
                overflowWrap: "anywhere",
              }}
            >
              <PixIcon emoji="🤫" size={18} />
              {k.label}
            </motion.span>
          ))
        )}
      </div>
    </div>
  );

  const roomBoard: ReactNode = round ? (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Side padding keeps the header clear of the frame's corner ornaments. */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
          <PixIcon emoji={introIcon ?? "💬"} size={16} />
          {introTitle ?? "The Safe Reply"}
        </span>
        <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffc98a" }}>
          {roundNoun ?? "Message"} {Math.min(idx + 1, shownRounds.length)} of {shownRounds.length}
        </span>
      </div>

      {/* The board: the room, the three things you could say, the shelf. Inset
          22px so it never collides with the frame's rounded corners. */}
      <div
        style={{
          margin: "0 22px",
          padding: 12,
          borderRadius: 18,
          background: ROOM_BOARD,
          border: `1px solid ${accent}44`,
          boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* The room: the device on the side, the moment in the middle */}
        <div
          style={{
            width: "100%",
            minHeight: ROOM_MIN_H,
            borderRadius: 18,
            background: "radial-gradient(ellipse at 50% 40%, rgba(255,201,138,0.2) 0%, rgba(255,201,138,0.05) 60%, transparent 76%)",
            border: "1.5px solid rgba(255,201,138,0.28)",
            padding: "12px 14px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          {device}
          <AnimatePresence mode="wait">
            <motion.div
              key={round.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.28 }}
              style={{ flex: "1 1 260px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
                <PixIcon emoji={round.fromIcon} size={16} />
                {situationLabel ?? round.from}
              </span>
              <span
                style={{
                  fontFamily: KID_FONT,
                  fontSize: 16.5,
                  fontWeight: 800,
                  lineHeight: 1.35,
                  color: ROOM_INK,
                  overflowWrap: "anywhere",
                }}
              >
                {round.message}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
            <PixIcon emoji="❓" size={16} />
            {pickLabel ?? "Pick your reply"}
          </div>
          <div
            role="group"
            aria-label={pickLabel ?? "Pick your reply"}
            style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
          >
            {replies.map(renderSay)}
          </div>
        </div>

        {shelf}
      </div>

      {/* On-board instructions: the current beat, in the child's words. */}
      <div style={{ textAlign: "center", marginTop: 12 }}>
        <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
          {roomStrip}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
        {roundWrongs > 0 && hints && (
          <HintBubble tier={roundWrongs >= 2 ? 2 : 1} speaker={voice} text={roundWrongs >= 2 ? hints.tier2 : hints.tier1} />
        )}
      </div>

      <style>{`
        @keyframes rcGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
      `}</style>
    </div>
  ) : null;

  return (
    <ExerciseFrame maxWidth={room ? 860 : 720} background={room ? ROOM_BG : undefined} decor>
      {fx.layer()}
      {verdict.element}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Safe Reply"}
          subtitle={introSubtitle ?? "A message lands. Pick the reply a hero would send."}
          icon={introIcon ?? "💬"}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each moment as
          it lands. Every line comes from the week file, never from a default. */}
      {!showIntro && !finished && round && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration
              key="rc-howto"
              speaker={coachLines.speaker ?? voice}
              lines={coachLines.lines}
              accent={accent}
              recordedOnly
              onDone={() => setNarr(!isAudioMuted() && round.readAloud ? "read" : "idle")}
            />
          )}
          {narr === "read" && round.readAloud && (
            <InfoNarration key={`rc-read-${round.id}`} speaker={voice} lines={[round.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {room && !showIntro && roomBoard}

      {round && !room && (
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            {/* Incoming message bubble */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span
                style={{
                  display: "inline-flex",
                  padding: 7,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  flexShrink: 0,
                }}
              >
                <PixIcon emoji={round.fromIcon} size={30} />
              </span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: "#9fb1ff", marginBottom: 4 }}>
                  {round.from}
                </div>
                <motion.div
                  initial={reduce ? false : { scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 22 }}
                  style={{
                    maxWidth: 460,
                    padding: "12px 16px",
                    borderRadius: "4px 18px 18px 18px",
                    background: "rgba(124,92,255,0.16)",
                    border: "1.5px solid rgba(124,92,255,0.5)",
                    color: "#e6e1ff",
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: 1.4,
                  }}
                >
                  {round.message}
                </motion.div>
              </div>
            </div>

            {/* The child's sent reply slots in here */}
            {sent !== null && (
              <motion.div
                initial={reduce ? false : { y: 24, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <div
                  style={{
                    maxWidth: 460,
                    padding: "12px 16px",
                    borderRadius: "18px 4px 18px 18px",
                    background: "rgba(52,211,153,0.18)",
                    border: "2px solid #34d399",
                    boxShadow: "0 0 26px -4px rgba(52,211,153,0.65)",
                    color: "#c9ffd9",
                    fontSize: 16,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  {replies[sent].text} <span style={{ color: "#7eff97" }}>✓</span>
                </div>
              </motion.div>
            )}

            {/* Fanned reply cards */}
            {sent === null && (
              <div>
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "#7d8cc9",
                    margin: "4px 0 10px",
                  }}
                >
                  ▼ {pickLabel ?? "Pick your reply"} · {roundNoun ?? "Message"} {Math.min(idx + 1, shownRounds.length)} of {shownRounds.length} ▼
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${replies.length}, minmax(0,1fr))`,
                    gap: 12,
                    alignItems: "stretch",
                  }}
                >
                  {replies.map((r, i) => (
                    <motion.button
                      key={i}
                      type="button"
                      onClick={() => pick(i)}
                      disabled={speaking}
                      onPointerEnter={() => audio.hover()}
                      initial={reduce ? false : { y: 30, opacity: 0, rotate: 0 }}
                      animate={{
                        y: 0,
                        opacity: 1,
                        rotate: reduce || skin !== "cards" ? 0 : CARD_TILT[i % CARD_TILT.length],
                      }}
                      transition={{ delay: reduce ? 0 : 0.08 * i, type: "spring", stiffness: 260, damping: 20 }}
                      whileHover={reduce ? undefined : { y: -6, rotate: 0, scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      style={
                        skin === "balloons"
                          ? {
                              position: "relative",
                              minHeight: 148,
                              padding: "22px 16px 30px",
                              // balloon silhouette: round top, gathered base
                              borderRadius: "50% 50% 46% 46% / 58% 58% 40% 40%",
                              border: "2.5px solid rgba(255,138,171,0.6)",
                              background:
                                "radial-gradient(circle at 32% 26%, rgba(255,255,255,0.28), transparent 42%), linear-gradient(180deg, rgba(255,95,179,0.3) 0%, rgba(84,18,52,0.94) 100%)",
                              color: "#ffe3f0",
                              fontSize: 14.5,
                              fontWeight: 900,
                              lineHeight: 1.35,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              boxShadow: "0 16px 34px -18px rgba(255,95,179,0.85)",
                              touchAction: "manipulation",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                            }
                          : skin === "levers"
                          ? {
                              position: "relative",
                              minHeight: 176,
                              padding: "16px 14px 14px",
                              borderRadius: 16,
                              border: "2.5px solid rgba(255, 209, 88, 0.55)",
                              background:
                                "linear-gradient(180deg, rgba(64,48,16,0.94) 0%, rgba(32,23,8,0.96) 100%)",
                              color: "#ffe9b3",
                              fontSize: 15,
                              fontWeight: 900,
                              letterSpacing: "0.04em",
                              lineHeight: 1.35,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              boxShadow: "0 16px 34px -18px rgba(255,209,88,0.75)",
                              touchAction: "manipulation",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "flex-end",
                              gap: 10,
                              textAlign: "center",
                            }
                          : skin === "doors"
                          ? {
                              position: "relative",
                              minHeight: 168,
                              padding: "26px 24px 16px 12px",
                              borderRadius: "48px 48px 10px 10px",
                              border: "2.5px solid rgba(255, 209, 88, 0.6)",
                              background:
                                "linear-gradient(180deg, rgba(255,209,88,0.18) 0%, rgba(84,52,18,0.92) 100%)",
                              color: "#fff3d6",
                              fontSize: 14.5,
                              fontWeight: 800,
                              lineHeight: 1.35,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              boxShadow: "0 16px 34px -18px rgba(255,209,88,0.85)",
                              touchAction: "manipulation",
                            }
                          : {
                              minHeight: 108,
                              padding: "14px 12px",
                              borderRadius: 16,
                              border: "2px solid rgba(125,240,255,0.5)",
                              background: "linear-gradient(165deg, rgba(0,229,255,0.16), rgba(12,18,48,0.9))",
                              color: "#eaf9ff",
                              fontSize: 14.5,
                              fontWeight: 800,
                              lineHeight: 1.35,
                              cursor: "pointer",
                              fontFamily: "inherit",
                              boxShadow: "0 14px 30px -18px rgba(0,229,255,0.8)",
                              touchAction: "manipulation",
                            }
                      }
                    >
                      {skin === "doors" && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            right: 12,
                            top: "52%",
                            width: 9,
                            height: 9,
                            borderRadius: "50%",
                            background: "#ffd158",
                            boxShadow: "0 0 8px rgba(255,209,88,0.9)",
                          }}
                        />
                      )}
                      {skin === "balloons" && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            left: "50%",
                            bottom: -22,
                            width: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          {/* knot + curling string — identical on every balloon */}
                          <span
                            style={{
                              width: 10,
                              height: 8,
                              marginLeft: -5,
                              borderRadius: "0 0 6px 6px",
                              background: "rgba(255,138,171,0.85)",
                            }}
                          />
                          <span
                            style={{
                              width: 2,
                              height: 16,
                              marginLeft: -1,
                              borderRadius: 2,
                              background: "rgba(255,227,240,0.55)",
                            }}
                          />
                        </span>
                      )}
                      {skin === "levers" && (
                        <span
                          aria-hidden
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            marginBottom: 2,
                          }}
                        >
                          {/* brass knob, shaft and base plate — identical on both levers */}
                          <span
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: "50%",
                              background: "radial-gradient(circle at 35% 30%, #ffe9b3, #d99a1f 72%)",
                              boxShadow: "0 0 12px rgba(255,209,88,0.65)",
                            }}
                          />
                          <span
                            style={{
                              width: 7,
                              height: 42,
                              borderRadius: 4,
                              background: "linear-gradient(180deg, #caa64a, #8a6a1f)",
                            }}
                          />
                          <span
                            style={{
                              width: 58,
                              height: 10,
                              borderRadius: 4,
                              background: "#6b521a",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                            }}
                          />
                        </span>
                      )}
                      {r.text}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ padding: wrongCount > 0 ? "2px 4px 0" : 0 }}>
              {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
              {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* The chat skins keep their visible teach-once caption; the speaker room
          speaks its how-to instead (audio only), so the two never stack. */}
      {!room && coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
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
          title={completeTitle ?? "Every reply a hero reply!"}
          stars={stars}
          statLines={[
            `${correctCount}/${shownRounds.length} ${scoreNoun ?? "safe replies"} first try`,
            completeLine ?? "Never meet. Never send. Tell a grown-up.",
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
