"use client";

/**
 * SpeakerDiary: the IT KEEPS A COPY drill (Week 14, "The Speaker Diary").
 *
 * A smart speaker keeps a diary, and today's page is open on the table. Every
 * entry starts as a MOMENT the child already remembers: "you asked for a song",
 * "Dad said the word that sounds like its name", "nobody said anything at all".
 * The moment is not the surprise. The surprise is sealed under it, and the
 * child lifts the seal to see WHAT IT WROTE DOWN: the speaker's own line, in
 * the speaker's own words, already on the page. Only then comes the one judged
 * tap of the entry: a reason stamp pressed into the margin, saying why that
 * line is in the diary at all.
 *
 * A stamped entry does not go away. It settles into the page with its written
 * line and its stamp, and the next entry opens underneath it, so the page fills
 * as the afternoon goes on. By the last entry the child is looking at a
 * document, not a scoreboard: an ordinary afternoon, written down by something
 * that was only ever trying to help. That is the whole lesson, and it is said
 * with curiosity, never with alarm. A speaker is a helper worth KNOWING about.
 *
 * Verb: OPEN A KEPT RECORD, READ WHAT IT WROTE, AND STAMP WHY IT IS THERE.
 * Why it is not Track Back, the Drill Run, Who Would Know, the Trail Planner or
 * the Day Jug (owner: "we never copy an exercise"): every one of those puts a
 * situation on screen and asks the child to pick the right card about it. Here
 * the thing on screen is a document that already exists and already has the
 * answer written in it. The evidence is revealed by the child's own first tap
 * and lands BEFORE any judgement, the stamps are pressed into the margin of a
 * page rather than chosen from a card row, and nothing is cleared away: the
 * page keeps every entry, its written line and its stamp, exactly as a diary
 * does. It is also not a bin sort (there is no bin and no sorting) and not a
 * hunt among decoy buttons (there are no decoy controls: the only tappable
 * thing before the reveal is the entry itself).
 *
 * Nothing races the child: tap-only, untimed, no lose state, no penalty for a
 * wrong stamp beyond Sarah explaining it, and nothing in here says a speaker
 * is a monster. It is a helper with a habit worth knowing about.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every entry's `readAloud` spoken as the entry opens (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), a
 * one-take spoken verdict on the stamp ("That's right!" + that stamp's `why`
 * via VerdictVoice; a wrong stamp: WrongAnswerPanel speaks "Not quite." + that
 * stamp's `explanation`), hint tiers per entry, and a payoff on the complete
 * beat gated on `!verdict.speaking` so it can never cut Sarah off. The next
 * entry is opened from the verdict's own callback, so no payoff can cut her off
 * either. A synchronous ref latch shuts the stamps the instant one is pressed,
 * because `canTap` only closes once React re-renders on `verdict.speaking` and
 * a quick second tap would otherwise restart the verdict and cut Sarah off (the
 * real Week 12 bug).
 *
 * Entries run in AUTHORED order (a diary is one afternoon, in order); only the
 * stamps inside an entry are shuffled. Entry 1 guides the MECHANIC only: the
 * seal breathes until it is lifted, then all three stamps breathe together,
 * which shows what to do and never which stamp is right.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each entry's `readAloud`, each
 * option's `why` and `explanation`, `hints`, `completeNarration`). The clip
 * generator reads the WEEK FILE, so anything left to a component default is
 * never recorded and plays as silence, with no error anywhere. `moment` and
 * `wrote` are READ ON THE PAGE, never spoken: put the spoken sentence in
 * `readAloud`. `why` is spoken ONLY on the right stamp and `explanation` ONLY
 * on a wrong one, so a line in the wrong field is silent even though the field
 * is full.
 *
 * Authoring: four entries reads best (three to five works), and three stamps an
 * entry (a two-item list always comes back reversed, so the shuffle needs
 * three). Exactly one stamp per entry has `isRight: true`. Keep `moment` to
 * about 40 characters, `wrote` to about 60 (it is the speaker's own written
 * line, so write it as one), a stamp `label` to about 24, and `readAloud`,
 * `why` and `explanation` to one kid-sized sentence each. Every icon must be in
 * PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + page eyebrow 22 + page 300 (capped, it scrolls
 * inside itself once the afternoon is long) + gap 12 + ask row 20 + gap 8 +
 * stamps 104 + strip 28 + hint gap 8 = ~537px, so the whole page and all three
 * stamps are on screen without a scroll. At 400px the stamps fall into one
 * column and the entry times tuck above the moment, and nothing scrolls
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

export interface DiaryEntry {
  id: string;
  moment: string;          // what happened in the room, on the page
  icon: string;
  readAloud: string;       // spoken as the entry opens
  wrote: string;           // what the diary actually wrote down, revealed on the tap
  options: { id: string; label: string; icon: string; isRight: boolean; why: string; explanation: string }[];
}
export interface SpeakerDiaryProps {
  entries: DiaryEntry[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  diaryLabel?: string;      // default "TODAY'S DIARY"
  wroteLabel?: string;      // default "WHAT IT WROTE DOWN"
  askPrompt?: string;       // default "Why is this in the diary?"
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

type DiaryOption = DiaryEntry["options"][number];

/** Fixed chrome copy the props above do not cover (never spoken, so it can
 *  safely live here). Curious on purpose: a diary is not an accusation. */
const STAMP_TOAST = "ENTRY EXPLAINED!";
const WRONG_TITLE = "That is not why this one is in here";
const SEAL_HINT = "Tap to see what it wrote";
const STAMP_EYEBROW = "PRESS A REASON STAMP";

/** The clock down the margin of the page. Chrome only, never spoken: a diary
 *  with times on it reads as a document instead of a list of questions. */
const ENTRY_TIMES = ["4:05", "4:17", "4:32", "4:48", "5:03", "5:21", "5:40"];

const EMPTY_OPTIONS: DiaryOption[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const PAGE_MAX_H = 300;
const STAMP_MIN_H = 104;
const STAMP_MIN_W = 190;
/** Paints. Warm paper on a dark table: a tappable thing is never painted on a
 *  ground anywhere near its own shade. */
const PAPER = "#fff6e8";
const PAGE = "#fdf3e1";
const INK = "#2a1f18";
const FAINT_INK = "rgba(42,31,24,0.62)";
const RULE = "rgba(42,31,24,0.10)";
const MARGIN_RED = "#d8705f";
const QUOTE_BLUE = "#2d6ea8";
const STAMP_GREEN = "#16a34a";

export default function SpeakerDiary({
  entries,
  introTitle = "The Speaker Diary",
  introSubtitle = "The speaker keeps a diary. Open today's page and see what it wrote.",
  introIcon = "📋",
  diaryLabel = "TODAY'S DIARY",
  wroteLabel = "WHAT IT WROTE DOWN",
  askPrompt = "Why is this in the diary?",
  completeTitle = "Page read!",
  completeLine = "A speaker is a helper, Cyber Hero. Now you KNOW it keeps a copy too.",
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
}: SpeakerDiaryProps) {
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
  // Read-aloud chain: the how-to once as the page opens, then each entry's line
  // as its seal is lifted. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // The current entry: sealed until it is tapped, then open and asking.
  const [opened, setOpened] = useState(false);
  // The stamp pressed into the margin, once it was the right one.
  const [stamped, setStamped] = useState<string | null>(null);
  // Stamps already pressed, keyed by entry: the page keeps them for good.
  const [pressed, setPressed] = useState<Record<string, { label: string; icon: string }>>({});
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [entryWrongs, setEntryWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // Entries run in AUTHORED order (the diary is one afternoon, in order); only
  // the three stamps inside an entry are shuffled.
  const finished = idx >= entries.length;
  const entry = entries[idx];
  const deck = useShuffledOnce(entry?.options ?? EMPTY_OPTIONS, { key: entry?.id ?? "done" });
  const sealed = stamped !== null;
  // Entry 1 teaches the mechanic only: the seal breathes, then all three stamps
  // breathe together, so the glow says "press one of these", never which.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why, and the next entry waits
  // for her. Wrong stamps speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || sealed;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the stamps synchronously.
  const handlingRef = useRef(false);

  // The page scrolls itself to the entry the child is working on, so a long
  // afternoon never hides the open entry below the fold.
  const pageRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [idx, opened, stamped]);

  // Safety releases for the spoken gate (never leave the page held).
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
    handlingRef.current = false;
    setIdx((i) => i + 1);
    setOpened(false);
    setStamped(null);
    setEntryWrongs(0);
    setNarr("idle");
  };

  /* ───────── LIFT THE SEAL: the unjudged tap that opens the entry ───────── */
  const openEntry = () => {
    if (!entry || opened || speaking) return;
    audio.cardFlip();
    setOpened(true);
    // Sarah reads the entry out as the seal lifts; the stamps are already on
    // the table but held until she has finished.
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── PRESS A STAMP: the only judged tap of the entry ───────── */
  const press = (o: DiaryOption) => {
    if (!entry || speaking || sealed || !opened) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    onAnswered?.({
      questionKey: `speakerdiary-${entry.id}`,
      // Indexes are into the entry's AUTHORED option list, whatever slot the
      // shuffle put a stamp in, so the dashboard always reads the same numbers.
      selectedIndex: entry.options.findIndex((x) => x.id === o.id),
      correctIndex: entry.options.findIndex((x) => x.isRight),
      wasCorrect: o.isRight,
    });
    if (o.isRight) {
      audio.drop();
      fx.correct({ xp: 25, text: STAMP_TOAST });
      onCorrect?.();
      setStamped(o.id);
      // The stamp settles into the margin and stays there: the page keeps every
      // entry it has ever written, which is the whole point of the page.
      setPressed((prev) => ({ ...prev, [entry.id]: { label: o.label, icon: o.icon } }));
      // Sarah: "That's right!" + this stamp's why, then the next entry. Opening
      // it from her callback is what keeps a payoff from ever cutting her off.
      verdict.say("right", o.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const ew = entryWrongs + 1;
      setEntryWrongs(ew);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; every
      // stamp stays out and the same entry waits, so the retry is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: o.explanation, tip: ew >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = entryWrongs >= 2 ? hints?.tier2 : entryWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (entryWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "sdGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = sealed
    ? "Stamped. That entry stays on the page"
    : !opened
      ? guided
        ? "Entry 1: tap the entry to see what it wrote"
        : SEAL_HINT
      : guided
        ? "Now press the stamp that says why it is in here"
        : entryWrongs > 0
          ? "Have another think. Why did it keep THIS one?"
          : "Press the stamp that says why it is in here";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };
  const timeStyle: CSSProperties = {
    flexShrink: 0,
    width: 46,
    fontFamily: LABEL_FONT,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.04em",
    color: MARGIN_RED,
    paddingTop: 3,
  };
  const timeFor = (i: number) => ENTRY_TIMES[i] ?? `#${i + 1}`;

  /* ───────── The quote block: the speaker's own written line ───────── */
  const wroteBlock = (text: string, small: boolean): ReactNode => (
    <div
      style={{
        marginTop: 6,
        padding: small ? "6px 9px" : "9px 12px",
        borderRadius: 10,
        borderLeft: `4px solid ${QUOTE_BLUE}`,
        background: "rgba(45,110,168,0.10)",
        color: INK,
        display: "flex",
        flexDirection: "column",
        gap: small ? 2 : 4,
      }}
    >
      {!small && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 9.5, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: QUOTE_BLUE }}>
          <PixIcon emoji="💬" size={14} />
          {wroteLabel}
        </span>
      )}
      <span
        style={{
          fontFamily: KID_FONT,
          fontSize: small ? 12.5 : 15,
          fontWeight: small ? 600 : 700,
          fontStyle: "italic",
          lineHeight: 1.35,
          overflowWrap: "anywhere",
        }}
      >
        {`"${text}"`}
      </span>
    </div>
  );

  /* ───────── One settled entry: moment, written line, stamp ───────── */
  const settledEntry = (e: DiaryEntry, i: number): ReactNode => {
    const mark = pressed[e.id];
    return (
      <div
        key={e.id}
        role="listitem"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "8px 10px 10px",
          borderBottom: `1px solid ${RULE}`,
          opacity: 0.92,
        }}
      >
        <span aria-hidden style={timeStyle}>{timeFor(i)}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: KID_FONT, fontSize: 13.5, fontWeight: 800, color: FAINT_INK, lineHeight: 1.25, overflowWrap: "anywhere" }}>
            <PixIcon emoji={e.icon} size={20} />
            {e.moment}
          </span>
          {wroteBlock(e.wrote, true)}
        </div>
        {mark && (
          <span
            aria-label={mark.label}
            style={{
              flexShrink: 0,
              maxWidth: 132,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 9px",
              borderRadius: 8,
              border: `2px solid ${STAMP_GREEN}`,
              background: "rgba(22,163,74,0.12)",
              color: "#14532d",
              fontFamily: LABEL_FONT,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              lineHeight: 1.15,
              transform: "rotate(-4deg)",
              overflowWrap: "anywhere",
            }}
          >
            <PixIcon emoji={mark.icon} size={16} />
            {mark.label}
          </span>
        )}
      </div>
    );
  };

  /* ───────── The entry being worked on: sealed, then open ───────── */
  const liveEntry: ReactNode = entry ? (
    <div
      role="listitem"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "10px 10px 12px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.55)",
        boxShadow: `inset 0 0 0 2px ${accent}33`,
      }}
    >
      <span aria-hidden style={timeStyle}>{timeFor(idx)}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: KID_FONT, fontSize: 16, fontWeight: 900, color: INK, lineHeight: 1.25, overflowWrap: "anywhere" }}>
          <PixIcon emoji={entry.icon} size={26} />
          {entry.moment}
        </span>
        <AnimatePresence mode="wait">
          {opened ? (
            <motion.div
              key={`open-${entry.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.28 }}
            >
              {wroteBlock(entry.wrote, false)}
              {sealed && pressed[entry.id] && (
                // Centred by a zero-height flex strip, never by a static
                // translate: this stamp animates scale, and the two would fight.
                <span aria-hidden style={{ display: "flex", justifyContent: "flex-start", marginTop: 8 }}>
                  <motion.span
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.7, rotate: -14 }}
                    animate={{ opacity: 1, scale: 1, rotate: -4 }}
                    transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 360, damping: 15 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "6px 11px",
                      borderRadius: 9,
                      border: `2.5px solid ${STAMP_GREEN}`,
                      background: "rgba(22,163,74,0.14)",
                      color: "#14532d",
                      fontFamily: LABEL_FONT,
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    <PixIcon emoji="✅" size={18} />
                    {pressed[entry.id].label}
                  </motion.span>
                </span>
              )}
            </motion.div>
          ) : (
            <motion.button
              key={`seal-${entry.id}`}
              type="button"
              aria-label={SEAL_HINT}
              onClick={openEntry}
              disabled={speaking}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.22 }}
              whileTap={speaking || reduce ? undefined : { scale: 0.98 }}
              style={{
                marginTop: 8,
                width: "100%",
                minHeight: 48,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(42,31,24,0.07)",
                border: `2px dashed ${INK}59`,
                color: INK,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 9,
                fontFamily: LABEL_FONT,
                fontSize: 11.5,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                textAlign: "center",
                cursor: speaking ? "wait" : "pointer",
                touchAction: "manipulation",
                ...guideStyle(guided && !speaking),
              }}
            >
              <PixIcon emoji="👆" size={22} />
              <span style={{ overflowWrap: "anywhere" }}>{SEAL_HINT}</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  ) : null;

  /* ───────── One reason stamp. Same paper, size and ink, every entry ───────── */
  const renderStamp = (o: DiaryOption, order: number): ReactNode => {
    if (!entry) return null;
    const chosen = stamped === o.id;
    const glow = guided && opened && !sealed && !speaking;
    return (
      <motion.button
        key={`${entry.id}-${o.id}`}
        type="button"
        aria-label={o.label}
        onClick={() => press(o)}
        disabled={speaking || !opened}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: opened ? 1 : 0.5, y: 0, scale: 1 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : 0.1 + order * 0.08 }}
        whileTap={speaking || !opened || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${STAMP_MIN_W}px`,
          minWidth: 0,
          minHeight: STAMP_MIN_H,
          padding: "10px 12px",
          borderRadius: 12,
          // Every stamp wears the same paper, size and ink, every entry:
          // nothing may hint at the reason before the tap.
          background: PAPER,
          border: `3px solid ${chosen ? STAMP_GREEN : "#ffffff"}`,
          // The dotted inner rule is what makes it a rubber stamp rather than
          // one more answer card.
          boxShadow: chosen
            ? `0 0 20px ${STAMP_GREEN}80, inset 0 0 0 2px rgba(42,31,24,0.22)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(42,31,24,0.16)",
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
          cursor: !opened ? "default" : speaking ? "wait" : "pointer",
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each entry as
          its seal is lifted. Every line comes from the week file. */}
      {!showIntro && !finished && entry && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="sd-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`sd-read-${entry.id}`} speaker={voice} lines={[entry.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && entry && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Entry {Math.min(idx + 1, entries.length)} of {entries.length}
            </span>
          </div>

          {/* The board: the page and the stamp tray. Inset 22px so it never
              collides with the frame's rounded corners. */}
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
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
                <PixIcon emoji="📋" size={16} />
                <span>{diaryLabel}</span>
                <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                  {Math.min(idx + (sealed ? 1 : 0), entries.length)} of {entries.length} explained
                </span>
              </div>

              {/* THE PAGE. Ruled cream paper with a red margin, filling entry by
                  entry: the document IS the board, not a question above a row
                  of cards. It scrolls inside itself, never the lesson stage. */}
              <div
                ref={pageRef}
                role="list"
                aria-label={diaryLabel}
                style={{
                  width: "100%",
                  maxHeight: PAGE_MAX_H,
                  overflowY: "auto",
                  borderRadius: 14,
                  background: `repeating-linear-gradient(180deg, ${PAGE} 0px, ${PAGE} 25px, ${RULE} 25px, ${RULE} 26px)`,
                  border: "2px solid rgba(255,255,255,0.75)",
                  boxShadow: "0 14px 28px -16px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(42,31,24,0.08)",
                  padding: "10px 12px 12px 10px",
                  borderLeft: `6px solid ${MARGIN_RED}`,
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {entries.slice(0, idx).map((e, i) => settledEntry(e, i))}
                {liveEntry}
              </div>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              <div
                role="group"
                aria-label={STAMP_EYEBROW}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {deck.map(renderStamp)}
              </div>
            </div>
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
            @keyframes sdGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${entries.length} entr${entries.length === 1 ? "y" : "ies"} in one afternoon, and the speaker wrote down every one`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
