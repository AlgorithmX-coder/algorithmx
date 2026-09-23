"use client";

/**
 * TrackBack: the EVERYTHING YOU DO LEAVES A TRACK drill (Week 12, "Track Back").
 *
 * A line of prints crosses the fresh snow, one for every ordinary thing the
 * child did online this week: searched for a game, liked a post, posted a
 * photo at the park, joined a club chat. Nothing on this trail is naughty. The
 * child taps the next print and the low sun thaws it: the print opens into the
 * action that made it, and Sarah reads it out. Then one question, the only
 * judged tap of the round: WHAT DOES THIS TRACK TELL A STRANGER ABOUT YOU?
 * Three uniform cards answer it, and the right one names the fact the track
 * really adds (not the action again, the fact a stranger now owns). That fact
 * is stamped into the WHAT YOUR TRAIL SAYS panel and stays there, so the panel
 * fills print by print until, at the last one, the trail has quietly spelled
 * out a small profile of the child who walked it. That growing panel IS the
 * lesson: no single print is the problem, the trail is.
 *
 * Why it is not the Clue Board, the Reveal Board or Who Would Know (owner: "we
 * never copy an exercise"): the Clue Board hunts clues inside ONE photo, the
 * Reveal Board flips tiles to uncover a hidden picture, and Who Would Know
 * asks which source could check a claim. Here the child walks a line of their
 * own ordinary days, one print at a time, and the thing being judged is what a
 * stranger LEARNS from an action that was completely fine to do. The collected
 * facts are never deleted and never scored; they accumulate, because that is
 * what tracks do.
 *
 * Nothing races the child: tap-only, untimed, no lose state, no penalty for a
 * wrong card beyond Sarah explaining it, and the child is never told off for
 * anything on the trail.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every print's `readAloud` spoken as it thaws (audio-only, `recordedOnly`,
 * taps held, released by the shared SPOKEN_GATE_MAX_MS), a one-take spoken
 * verdict on the card ("That's right!" + that card's `why` via VerdictVoice;
 * wrong: WrongAnswerPanel speaks "Not quite." + that card's `explanation`),
 * hint tiers per print, and a payoff on the complete beat gated on
 * `!verdict.speaking` so it can never cut Sarah off. The next print is opened
 * from the verdict's own callback, so no payoff can cut her off either. Prints
 * walk in authored order (the trail is a walk through one week); the three
 * cards are shuffled per print. Print 1 guides the MECHANIC only: the next
 * print in the snow breathes until it is tapped, then all three cards breathe
 * together, which shows what to do and hides which one is right.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each print's `readAloud`, each
 * option's `why` and `explanation`, `hints`, `completeNarration`). The clip
 * generator reads the WEEK FILE, so anything left to a component default is
 * never recorded and plays as silence, with no error anywhere.
 *
 * Authoring: exactly one option per print has `isRight: true`, and three
 * options a print (a two-item list always comes back reversed, so the shuffle
 * needs three). Keep a print `label` to about 34 characters (it is the thawed
 * action), a card `label` to about 30 (it is also the fact printed into the
 * trail panel, so write it as a FACT: "which park you play in"), `readAloud` to
 * one sentence, and `why` and `explanation` to one kid-sized sentence each.
 * `why` is what Sarah says on the right card; `explanation` is the calm teach
 * line for a wrong one, so every option needs one. Every icon must be in
 * PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + trail 56 + gap 12 + print card 114 + gap 12 + ask
 * row 20 + gap 8 + cards 104 + gap 12 + says panel 108 + strip 28 + hint gap 8
 * = ~547px, so the trail, the thawed print, all three cards and the panel are
 * on screen without a scroll. At 400px the cards fall into one column and the
 * trail pips shrink, and nothing scrolls sideways.
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
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as DrillRun / WhoKnows.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface TrackPrint { id: string; label: string; icon: string; readAloud: string; options: { id: string; label: string; icon: string; isRight: boolean; why?: string; explanation: string }[]; }
export interface TrackBackProps {
  prints: TrackPrint[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  trailLabel?: string;        // default "THE TRAIL"
  saysLabel?: string;         // default "WHAT YOUR TRAIL SAYS"
  askPrompt?: string;         // default "What does this track tell a stranger?"
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

type TrackOption = TrackPrint["options"][number];

/** Fixed chrome copy the props above do not cover (never spoken, so it can
 *  safely live here). Warm on purpose: a track is not a telling-off. */
const PRINT_TOAST = "TRACK READ!";
const WRONG_TITLE = "That is not what this track adds";
const FROZEN_HINT = "Tap the next print in the snow";
const SAYS_EMPTY = "Nothing yet. Read a track to start filling this in";
const THAWED_EYEBROW = "THIS TRACK";

const EMPTY_OPTIONS: TrackOption[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const PIP = 34;
const PRINT_MIN_H = 92;
const CARD_MIN_H = 104;
const CARD_MIN_W = 190;
const SAYS_MIN_H = 86;
/** Paints. Fresh snow under a low sun: bright, cold, and it keeps everything. */
const SNOW_BG = "linear-gradient(180deg, rgba(226,240,255,0.16) 0%, rgba(226,240,255,0.05) 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const READ_BLUE = "#9fd2ff";

export default function TrackBack({
  prints,
  introTitle = "Track Back",
  introSubtitle = "Every print in the snow is something you did. Tap one and see what it says.",
  introIcon = "📍",
  trailLabel = "THE TRAIL",
  saysLabel = "WHAT YOUR TRAIL SAYS",
  askPrompt = "What does this track tell a stranger?",
  completeTitle = "Trail read!",
  completeLine = "Nothing you did was wrong, Cyber Hero. Put the prints together and they still say a lot.",
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
}: TrackBackProps) {
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
  // Read-aloud chain: the how-to once as the walk starts, then each print's
  // line as it thaws. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // The current print: frozen until it is tapped, then thawed and asking.
  const [thawed, setThawed] = useState(false);
  // The card that named the fact, once it was the right one.
  const [named, setNamed] = useState<string | null>(null);
  // Facts collected so far, in the order the trail gave them up.
  const [says, setSays] = useState<{ id: string; label: string; icon: string }[]>([]);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [printWrongs, setPrintWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The prints walk in AUTHORED order (the trail is a walk through one week);
  // only the three cards inside a print are shuffled.
  const finished = idx >= prints.length;
  const p = prints[idx];
  const deck = useShuffledOnce(p?.options ?? EMPTY_OPTIONS, { key: p?.id ?? "done" });
  const sealed = named !== null;
  // Print 1 teaches the mechanic only: the next print breathes, then all three
  // cards breathe together, so the glow says "tap one of these", never which.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why, and the next print waits
  // for her. Wrong cards speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || sealed;

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

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "idle");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    setThawed(false);
    setNamed(null);
    setPrintWrongs(0);
    setNarr("idle");
  };

  /* ───────── THAW: the unjudged tap that opens the print ───────── */
  const thaw = () => {
    if (!p || thawed || speaking) return;
    audio.cardFlip();
    setThawed(true);
    // Sarah reads what made this print as it opens; the cards are already on
    // the board but held until she has finished.
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── NAME IT: the only judged tap of the print ───────── */
  const nameIt = (o: TrackOption) => {
    if (!p || speaking || sealed || !thawed) return;
    onAnswered?.({
      questionKey: `trackback-${p.id}`,
      // Indexes are into the print's AUTHORED option list, whatever slot the
      // shuffle put a card in, so the dashboard always reads the same numbers.
      selectedIndex: p.options.findIndex((x) => x.id === o.id),
      correctIndex: p.options.findIndex((x) => x.isRight),
      wasCorrect: o.isRight,
    });
    if (o.isRight) {
      fx.correct({ xp: 25, text: PRINT_TOAST });
      onCorrect?.();
      setNamed(o.id);
      // The fact joins the trail panel and stays there: that panel filling up
      // is the whole point of the walk.
      setSays((prev) => [...prev, { id: `${p.id}-${o.id}`, label: o.label, icon: o.icon }]);
      // Sarah: "That's right!" + this card's why, then the next print. Walking
      // on from her callback is what keeps a payoff from ever cutting her off.
      verdict.say("right", o.why ?? "", () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const pw = printWrongs + 1;
      setPrintWrongs(pw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; every
      // card stays out and the same print waits, so the retry is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: o.explanation, tip: pw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = printWrongs >= 2 ? hints?.tier2 : printWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (printWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "tbGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = sealed
    ? "That fact just joined your trail"
    : !thawed
      ? guided
        ? "Print 1: tap the print in the snow"
        : FROZEN_HINT
      : guided
        ? "Now tap what this track tells a stranger"
        : printWrongs > 0
          ? "Have another think. What does a stranger LEARN from it?"
          : "Tap what this track tells a stranger about you";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The trail: the prints across the snow, left to right ───────── */
  const trail: ReactNode = (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="📍" size={16} />
        <span>{trailLabel}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
          {Math.min(idx + (sealed ? 1 : 0), prints.length)} of {prints.length}
        </span>
      </div>
      <div role="list" aria-label={trailLabel} style={{ display: "flex", alignItems: "center", width: "100%" }}>
        {prints.map((pr, i) => {
          const done = i < idx || (i === idx && sealed);
          const now = i === idx && !sealed;
          const tappable = now && !thawed && !speaking;
          const pipStyle: CSSProperties = {
            position: "relative",
            zIndex: 1,
            width: PIP,
            height: PIP,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            padding: 0,
            background: done ? "rgba(159,210,255,0.22)" : now ? `${accent}2e` : "rgba(255,255,255,0.08)",
            border: `2px solid ${done ? READ_BLUE : now ? accent : "rgba(255,247,230,0.24)"}`,
            boxShadow: now && !reduce ? `0 0 14px ${accent}88` : "none",
            color: done ? READ_BLUE : "rgba(255,247,230,0.6)",
            fontFamily: LABEL_FONT,
            fontSize: 13,
            fontWeight: 900,
            lineHeight: 1,
            transition: "background 240ms ease, border-color 240ms ease",
          };
          return (
            <div
              key={pr.id}
              role="listitem"
              aria-label={done ? `${pr.label}, read` : now ? "this print" : "a print further along"}
              style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", justifyContent: "center", alignItems: "center", minHeight: PIP }}
            >
              {/* Half connectors, so the prints read as one line crossing snow. */}
              {i > 0 && (
                <span aria-hidden style={{ position: "absolute", top: "50%", left: 0, width: "50%", height: 2, marginTop: -1, background: i <= idx ? READ_BLUE : "rgba(255,247,230,0.18)" }} />
              )}
              {i < prints.length - 1 && (
                <span aria-hidden style={{ position: "absolute", top: "50%", left: "50%", width: "50%", height: 2, marginTop: -1, background: done ? READ_BLUE : "rgba(255,247,230,0.18)" }} />
              )}
              {tappable ? (
                <motion.button
                  type="button"
                  aria-label={FROZEN_HINT}
                  onClick={thaw}
                  whileTap={reduce ? undefined : { scale: 0.94 }}
                  style={{ ...pipStyle, cursor: "pointer", touchAction: "manipulation", ...guideStyle(true) }}
                >
                  <PixIcon emoji="👆" size={20} />
                </motion.button>
              ) : (
                <span aria-hidden style={pipStyle}>
                  {/* A print only shows what made it once it has thawed: the
                      snow gives nothing away before the tap. */}
                  {done || (now && thawed) ? <PixIcon emoji={pr.icon} size={20} /> : i + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ───────── The print itself: frozen, then thawed into the action ───────── */
  const printCard: ReactNode = p ? (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="🔍" size={16} />
        <span>{THAWED_EYEBROW}</span>
      </div>
      <div
        role="status"
        style={{
          minHeight: PRINT_MIN_H,
          borderRadius: 18,
          background: SNOW_BG,
          border: thawed ? "1.5px solid rgba(159,210,255,0.55)" : "2px dashed rgba(226,240,255,0.32)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          color: "#fff7e6",
          transition: "border-color 240ms ease, background 240ms ease",
        }}
      >
        <AnimatePresence mode="wait">
          {thawed ? (
            <motion.div
              key={`thaw-${p.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.28 }}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(8,6,14,0.4)",
                  border: "2px solid rgba(159,210,255,0.6)",
                }}
              >
                <PixIcon emoji={p.icon} size={32} />
              </span>
              <span style={{ flex: 1, minWidth: 0, fontFamily: KID_FONT, fontSize: 16.5, fontWeight: 800, lineHeight: 1.3, overflowWrap: "anywhere" }}>
                {p.label}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key={`frozen-${p.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.22 }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", opacity: 0.75 }}
            >
              <PixIcon emoji="👆" size={26} />
              <span style={{ fontFamily: LABEL_FONT, fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", textAlign: "center", overflowWrap: "anywhere" }}>
                {FROZEN_HINT}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  ) : null;

  /* ───────── One answer card. Same paper, size and ink, every print ───────── */
  const renderCard = (o: TrackOption, order: number): ReactNode => {
    if (!p) return null;
    const chosen = named === o.id;
    const glow = guided && thawed && !sealed && !speaking;
    return (
      <motion.button
        key={`${p.id}-${o.id}`}
        type="button"
        aria-label={o.label}
        onClick={() => nameIt(o)}
        disabled={speaking || !thawed}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: thawed ? 1 : 0.5, y: 0, scale: 1 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : 0.1 + order * 0.08 }}
        whileTap={speaking || !thawed || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${CARD_MIN_W}px`,
          minWidth: 0,
          minHeight: CARD_MIN_H,
          padding: "10px 12px",
          borderRadius: 16,
          // Every card wears the same paper, size and ink, every print: nothing
          // may hint at the fact before the tap.
          background: PAPER,
          border: `3px solid ${chosen ? "#16a34a" : "#ffffff"}`,
          boxShadow: chosen
            ? "0 0 20px rgba(22,163,74,0.5), inset 0 0 0 1.5px rgba(42,31,24,0.14)"
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
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
          cursor: !thawed ? "default" : speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease, opacity 240ms ease",
          ...guideStyle(glow),
        }}
      >
        <PixIcon emoji={o.icon} size={32} />
        <span style={{ overflowWrap: "anywhere" }}>{o.label}</span>
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

  /* ───────── WHAT YOUR TRAIL SAYS: the profile the walk spells out ───────── */
  const saysPanel: ReactNode = (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="👀" size={16} />
        <span>{saysLabel}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
          {says.length} of {prints.length}
        </span>
      </div>
      <div
        role="status"
        aria-label={saysLabel}
        style={{
          minHeight: SAYS_MIN_H,
          borderRadius: 16,
          border: says.length ? `2px solid ${accent}aa` : "2px dashed rgba(255,255,255,0.18)",
          background: says.length ? `${accent}1c` : "rgba(0,0,0,0.18)",
          padding: "10px 12px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          alignContent: "center",
          justifyContent: says.length ? "flex-start" : "center",
          gap: 8,
          color: "#fff7e6",
          fontFamily: KID_FONT,
          transition: "border-color 220ms ease, background 220ms ease",
        }}
      >
        {says.length === 0 ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: 0.6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>
            <PixIcon emoji="❓" size={20} />
            {SAYS_EMPTY}
          </span>
        ) : (
          says.map((fact, i) => (
            <motion.span
              key={fact.id}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 20, delay: i === says.length - 1 ? 0.1 : 0 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                maxWidth: "100%",
                padding: "6px 11px 6px 7px",
                borderRadius: 999,
                background: "rgba(8,10,22,0.55)",
                border: `1.5px solid ${accent}`,
                fontSize: 13.5,
                fontWeight: 800,
                lineHeight: 1.2,
                overflowWrap: "anywhere",
              }}
            >
              <PixIcon emoji={fact.icon} size={20} />
              {fact.label}
            </motion.span>
          ))
        )}
      </div>
    </div>
  );

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

      {/* Sarah's read-alouds (audio only): the how-to once, then each print as
          it thaws. Every line comes from the week file, never from a default. */}
      {!showIntro && !finished && p && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="tb-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`tb-read-${p.id}`} speaker={voice} lines={[p.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && p && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Print {Math.min(idx + 1, prints.length)} of {prints.length}
            </span>
          </div>

          {/* The board: the trail, the print, the three cards, the panel. Inset
              22px so it never collides with the frame's rounded corners. */}
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
            {trail}
            {printCard}

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              <div
                role="group"
                aria-label={askPrompt}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {deck.map(renderCard)}
              </div>
            </div>

            {saysPanel}
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
            @keyframes tbGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${says.length} thing${says.length === 1 ? "" : "s"} a stranger could learn from ${prints.length} ordinary print${prints.length === 1 ? "" : "s"}`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
