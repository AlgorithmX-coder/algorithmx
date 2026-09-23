"use client";

/**
 * LogOutFlick: the SWEEP, LOCK, THEN LOOK BACK drill (Week 18, concept 2).
 *
 * This week's old screen-4 signature, rebuilt to the Learn-Loop standard and
 * CONVERTED TO TAP-ONLY. The original asked the child to press a card and swipe
 * it downward fast enough to register as a flick. That is a gesture with a
 * velocity threshold in it, which is the one thing a six year old on a tablet
 * cannot produce on demand, and a child who cannot flick simply cannot finish.
 * Everything else about it was right and all of it stays: the shared tablet
 * covered in the child's open cards, the door light, the goblin paw that
 * sneaks one card back open behind them, and the amber light that will not go
 * green until they turn round and deal with it.
 *
 * The lesson is a RITUAL, not a quiz, and that is deliberate. Leaving a shared
 * device is four moves in a fixed order: close everything, log out, lock it,
 * then look back and check again. A child who has done it in that order a few
 * times has a habit; a child who has answered questions about it has a fact.
 * So most taps here are not judged at all, and the one judged moment is the one
 * that matters: pressing LOCK IT while cards are still open. That is exactly
 * the mistake real people make, so it is the mistake the game is built around,
 * and it costs nothing but Sarah pointing at what is still lit up.
 *
 * THE GOBLIN IS NOT A PUNISHMENT. He arrives AFTER a correct lock, every time,
 * scripted and unavoidable, because the point is not that the child did
 * something wrong. The point is that a shared device can change behind your
 * back, so looking again is part of the job rather than a sign you failed at
 * it. Sarah's line on the amber light says exactly that.
 *
 * Verb: CLEAR A BOARD, COMMIT, THEN BE SHOWN IT IS NOT DONE. Nothing else in
 * the library has a second act. It is NOT a judged queue (the Glass Check, the
 * Rope Line are): the cards are not right or wrong, they are simply open. It is
 * NOT a two-bin sort (Hook Sort is, one beat earlier this same week): nothing is
 * carried anywhere and there is only one place for a card to go. It is NOT a
 * hunt among decoys (Button Hunt is, one beat later this same week): every card
 * is real, every card must go, and none of them is a trap. It is NOT the Friend
 * Panner's collect-then-commit (Week 17): there is no picking, the whole board
 * always has to come down.
 *
 * Nothing races the child: tap-only, untimed, no lose state, no red hard-fail.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and each card's `logOut` line as it goes (audio-only, `recordedOnly`, released
 * by the shared SPOKEN_GATE_MAX_MS), a one-take spoken verdict on the two
 * committed moments (the lock, via VerdictVoice, and the early lock through
 * WrongAnswerPanel), and a payoff on the complete beat gated on
 * `!verdict.speaking` so it can never cut Sarah off. A synchronous ref latch
 * shuts the lock the instant it is pressed, because `canTap` only closes once
 * React re-renders on `verdict.speaking` and a quick second tap would otherwise
 * restart the verdict and cut Sarah off (the real Week 12 bug).
 *
 * The CARDS are shuffled every play. Which card the goblin reopens is picked
 * from the same shuffled deck, so the look-back is never in the same place.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each card's `logOut`, `lockWhy`,
 * `earlyLockExplanation`, `goblinLine`, `lookBackWhy`, `hints`,
 * `completeNarration`). The clip generator reads the WEEK FILE, so anything
 * left to a component default is never recorded and plays as silence, with no
 * error anywhere. Each card's `label` and `detail` are READ ON SCREEN, never
 * spoken.
 *
 * Authoring: three or four cards reads best. Every card must be something the
 * CHILD left open, never somebody else's (that is concept 4's ground, and
 * mixing them here teaches a child to close their sister's things "to be
 * tidy"). Keep `label` to about 14 characters and `detail` to about 40.
 * Every icon must be in PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 + light row 44 + tablet 300 + gap 12 + lock 66 + strip 28 + hint gap 8 =
 * ~523px, so the light, the tablet and the lock are on screen without a scroll.
 * At 400px the cards fall to one column and nothing scrolls sideways.
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

export interface OpenCard {
  id: string;
  /** What the card is. Read on screen, never spoken. */
  label: string;
  /** The little line under it. Read on screen, never spoken. */
  detail: string;
  icon: string;
  /** SPOKEN as this card is logged out. One kid-sized sentence. */
  logOut: string;
}

export interface LogOutFlickProps {
  cards: OpenCard[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Chrome, never spoken. */
  tabletLabel?: string;
  lockLabel?: string;
  lockedLabel?: string;
  openCountLabel?: string;
  greenLabel?: string;
  amberLabel?: string;
  redLabel?: string;
  /** SPOKEN the first time the board is locked with every card closed. */
  lockWhy?: string;
  /** SPOKEN when LOCK IT is pressed with cards still open. */
  earlyLockExplanation?: string;
  /** SPOKEN as the goblin paw reopens a card. */
  goblinLine?: string;
  /** SPOKEN on the final lock, after the look-back. */
  lookBackWhy?: string;
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
const SWEEP_TOAST = "LOGGED OUT!";
const LOCK_TOAST = "LOCKED!";
const WRONG_TITLE = "Have another look at the tablet";

/**
 * The LEGACY SIGNATURE MOUNT's fallback cards, and nothing else. Week 18 plays
 * this engine as a regular data-driven exercise and passes every card from its
 * week file. These lines live in this component rather than in a week file, so
 * the clip generator never sees them and Sarah never reads them (the Week 11
 * re-theme trap). If a week ever renders this set, it has forgotten `cards`.
 */
const DEFAULT_CARDS: OpenCard[] = [
  { id: "legacy-game", label: "Game", detail: "Still logged in as you", icon: "🎮", logOut: "Game logged out. Now nobody can play as you." },
  { id: "legacy-message", label: "Message", detail: "Half written, still open", icon: "💬", logOut: "Message closed. Your words stay yours." },
  { id: "legacy-photos", label: "Photos", detail: "Your gallery, wide open", icon: "📸", logOut: "Gallery closed. Your pictures are private again." },
];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

/** Geometry (px). */
const CARD_MIN_H = 118;
const LOCK_MIN_H = 66;

/** Paints. A warm locker room, and one bright tablet in the middle of it. */
const ROOM = "linear-gradient(180deg, #2a2338 0%, #1f1a2c 60%, #171322 100%)";
const TABLET_SHELL = "linear-gradient(180deg, #3b3550 0%, #2b2640 100%)";
const CARD_OPEN = "linear-gradient(160deg, #fff8ec 0%, #f6e7cd 100%)";
const CARD_SHUT = "linear-gradient(160deg, #3a3a44 0%, #2c2c34 100%)";
const INK = "#2e2417";
const GREEN = "#16a34a";
const AMBER = "#e0a13a";
const RED = "#c2554d";

/** Where the ritual has got to. */
type Phase = "sweep" | "locked-early" | "goblin" | "lookback" | "done";

export default function LogOutFlick({
  cards,
  introTitle = "Lock Before You Leave",
  introSubtitle = "The shared tablet is covered in your open cards. Close every one, then lock it.",
  introIcon = "🔒",
  tabletLabel = "THE SHARED TABLET",
  lockLabel = "LOCK IT AND GO",
  lockedLabel = "LOCKED",
  openCountLabel = "STILL OPEN",
  greenLabel = "GREEN: SAFE TO LEAVE",
  amberLabel = "AMBER: LOOK BACK",
  redLabel = "RED: STILL OPEN",
  lockWhy = "Every card shut and the tablet locked. That is the whole sweep.",
  earlyLockExplanation = "Look at the tablet. There are still cards lit up on it, and locking now leaves every one of them open underneath.",
  goblinLine = "Wait. Something just opened behind you.",
  lookBackWhy = "You turned round and checked. That is the bit almost everybody forgets.",
  completeTitle = "Locked and safe!",
  completeLine = "Close, lock, then look back, Cyber Hero. That last bit is the one that counts.",
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
}: LogOutFlickProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const deck = useShuffledOnce(cards?.length ? cards : DEFAULT_CARDS, { key: "log-out-flick" });

  const [showIntro, setShowIntro] = useState(true);
  const [narr, setNarr] = useState<"howto" | "card" | "goblin" | "idle">("idle");
  /** The card whose logOut line is playing. */
  const [speakingCard, setSpeakingCard] = useState<string | null>(null);
  /** Cards still open on the tablet. */
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [phase, setPhase] = useState<Phase>("sweep");
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [wrongs, setWrongs] = useState(0);
  /** Which card the goblin reopens. Chosen from the shuffled deck, so the
   *  look-back is never in the same place twice. */
  const goblinCard = useMemo(() => deck[deck.length > 1 ? deck.length - 1 : 0], [deck]);

  // Everything starts open.
  useEffect(() => { setOpen(new Set(deck.map((c) => c.id))); }, [deck]);

  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;
  const handlingRef = useRef(false);
  const allShut = open.size === 0;

  // Safety releases for the spoken gate (never leave the room held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => { setNarr("idle"); setSpeakingCard(null); }, SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) { setNarr("idle"); setSpeakingCard(null); } }), []);

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongs >= 2 ? 2 : wrongs >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongs, onHintReached]);

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() || !coachLines ? "idle" : "howto");
  };

  /* ───────── Closing a card. Not judged: every card has to go. ───────── */
  const closeCard = (c: OpenCard) => {
    if (speaking || !open.has(c.id)) return;
    audio.select();
    fx.correct({ xp: 10, text: SWEEP_TOAST });
    setOpen((s) => { const n = new Set(s); n.delete(c.id); return n; });
    setSpeakingCard(c.id);
    setNarr(isAudioMuted() ? "idle" : "card");
  };

  /* ───────── THE LOCK: the one judged moment in the sweep ───────── */
  const lock = () => {
    if (speaking || phase === "done") return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const right = allShut;
    onAnswered?.({
      questionKey: `logoutflick-lock-${phase === "lookback" ? "final" : "first"}`,
      // 0 means "locked with everything shut", 1 means "locked too early".
      selectedIndex: right ? 0 : 1,
      correctIndex: 0,
      wasCorrect: right,
    });
    if (!right) {
      // The mistake the whole game is built around: locking over open cards.
      audio.wrong();
      onWrong?.();
      setWrongs((n) => n + 1);
      setFeedback({ title: WRONG_TITLE, explanation: earlyLockExplanation, tip: wrongs >= 1 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
      return;
    }
    audio.select();
    fx.correct({ xp: 25, text: LOCK_TOAST });
    onCorrect?.();
    if (phase === "sweep") {
      // First clean lock. Sarah says so, and THEN the goblin arrives: he is
      // scripted and unavoidable, so this is never a comment on the child.
      verdict.say("right", lockWhy, () => {
        handlingRef.current = false;
        setPhase("goblin");
        setOpen(new Set([goblinCard.id]));
        setNarr(isAudioMuted() ? "idle" : "goblin");
        window.setTimeout(() => setPhase("lookback"), reduce ? 200 : 900);
      });
    } else {
      // The final lock, after the look-back.
      verdict.say("right", lookBackWhy, () => {
        handlingRef.current = false;
        setPhase("done");
      });
    }
  };

  const stars = wrongs === 0 ? 3 : wrongs <= 2 ? 2 : 1;
  const hintText = wrongs >= 2 ? hints?.tier2 : wrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (wrongs >= 2 ? 2 : 1) as 1 | 2;
  const light: { label: string; tint: string } =
    phase === "done" ? { label: greenLabel, tint: GREEN }
      : phase === "goblin" || phase === "lookback" ? { label: amberLabel, tint: AMBER }
        : allShut ? { label: greenLabel, tint: GREEN }
          : { label: redLabel, tint: RED };
  const strip =
    phase === "done" ? "Green light. That tablet is safe to walk away from"
      : phase === "goblin" || phase === "lookback"
        ? open.size > 0 ? "Amber light. One card is open again. Close it, then lock up" : "Amber light. Lock it one more time"
        : allShut ? "Every card shut. Now lock it and go"
          : wrongs > 0 ? "Close the cards that are still lit up first" : "Tap every open card to log it out";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800,
    letterSpacing: "0.2em", textTransform: "uppercase", color: accent,
  };

  const renderCard = (c: OpenCard) => {
    const isOpen = open.has(c.id);
    const justReopened = (phase === "goblin" || phase === "lookback") && isOpen;
    return (
      <motion.button
        key={c.id}
        type="button"
        aria-label={`${c.label}: ${c.detail}`}
        onClick={() => closeCard(c)}
        disabled={speaking || !isOpen}
        animate={
          justReopened && !reduce
            ? { scale: [1, 1.06, 1], boxShadow: [`0 0 0 3px ${AMBER}77`, `0 0 22px ${AMBER}`, `0 0 0 3px ${AMBER}77`] }
            : { scale: 1 }
        }
        transition={justReopened ? { duration: 1.2, repeat: Infinity } : { duration: 0.3 }}
        whileTap={speaking || !isOpen || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          minHeight: CARD_MIN_H,
          padding: "12px 11px",
          borderRadius: 14,
          background: isOpen ? CARD_OPEN : CARD_SHUT,
          border: `3px solid ${isOpen ? (justReopened ? AMBER : "#ffffff") : "#4a4a55"}`,
          boxShadow: isOpen ? "0 10px 20px -12px rgba(0,0,0,0.85)" : "inset 0 2px 8px rgba(0,0,0,0.5)",
          color: isOpen ? INK : "#8d8b96",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 5, textAlign: "center", fontFamily: KID_FONT,
          cursor: speaking || !isOpen ? "default" : "pointer",
          touchAction: "manipulation",
          transition: "background 300ms ease, border-color 220ms ease, color 300ms ease",
        }}
      >
        <PixIcon emoji={c.icon} size={28} style={isOpen ? undefined : { filter: "grayscale(0.9) opacity(0.5)" }} />
        <span style={{ fontSize: 14, fontWeight: 900, lineHeight: 1.15 }}>{c.label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.22, opacity: 0.74, overflowWrap: "anywhere" }}>
          {isOpen ? c.detail : lockedLabel}
        </span>
        {!isOpen && (
          <span aria-hidden style={{ position: "absolute", top: 5, right: 5 }}>
            <PixIcon emoji="🔒" size={20} />
          </span>
        )}
      </motion.button>
    );
  };

  const cardBeingRead = speakingCard ? deck.find((c) => c.id === speakingCard) : null;

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

      {/* Sarah's read-alouds (audio only). Gated on !showIntro, always: a board
          line that starts while the intro card is still open clobbers the
          intro's own clip and the "I'm ready" button never appears (the
          SignBingo / SenderLineup bug). Every line comes from the week file. */}
      {!showIntro && phase !== "done" && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="lof-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "card" && cardBeingRead && (
            <InfoNarration key={`lof-card-${cardBeingRead.id}`} speaker={voice} lines={[cardBeingRead.logOut]} accent={accent} recordedOnly onDone={() => { setNarr("idle"); setSpeakingCard(null); }} />
          )}
          {narr === "goblin" && (
            <InfoNarration key="lof-goblin" speaker={voice} lines={[goblinLine]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && phase !== "done" && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              {openCountLabel} {open.size}
            </span>
          </div>

          <div
            style={{
              margin: "0 22px", padding: "12px", borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}
          >
            {/* THE DOOR LIGHT. Red while cards are open, amber after the goblin,
                green only when the tablet is genuinely clear. */}
            <div
              style={{
                width: "100%", minHeight: 40, borderRadius: 12,
                background: "rgba(0,0,0,0.34)", border: `2px solid ${light.tint}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "border-color 320ms ease",
              }}
            >
              <motion.span
                aria-hidden
                animate={reduce ? {} : { opacity: [1, 0.45, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                style={{ width: 14, height: 14, borderRadius: 999, background: light.tint, boxShadow: `0 0 12px ${light.tint}` }}
              />
              <span style={{ fontFamily: LABEL_FONT, fontSize: 11.5, fontWeight: 900, letterSpacing: "0.16em", textTransform: "uppercase", color: light.tint }}>
                {light.label}
              </span>
            </div>

            {/* THE ROOM, with the shared tablet lying on the bench. */}
            <div
              style={{
                width: "100%", borderRadius: 16, background: ROOM,
                border: "1.5px solid rgba(255,247,230,0.18)", padding: "12px 10px 14px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
              }}
            >
              <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
                <PixIcon emoji="📱" size={15} />
                <span>{tabletLabel}</span>
              </div>
              <div
                style={{
                  width: "100%", borderRadius: 18, background: TABLET_SHELL,
                  border: "3px solid rgba(255,247,230,0.26)",
                  boxShadow: "0 18px 34px -18px rgba(0,0,0,0.95)", padding: 10,
                  display: "grid", gap: 8,
                }}
                className="lofCardGrid"
              >
                {deck.map(renderCard)}
              </div>
            </div>

            {/* THE LOCK. Pressing it over open cards is the one judged mistake. */}
            <motion.button
              type="button"
              onClick={lock}
              disabled={speaking}
              animate={allShut && !speaking && !reduce ? { boxShadow: [`0 0 0 3px ${accent}55`, `0 0 0 7px ${accent}22`, `0 0 0 3px ${accent}55`] } : {}}
              transition={{ duration: 1.4, repeat: Infinity }}
              whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
              style={{
                width: "100%", maxWidth: 420, minHeight: LOCK_MIN_H, borderRadius: 14,
                background: allShut ? "linear-gradient(180deg, #ffe9a8 0%, #f5c854 100%)" : "rgba(255,247,230,0.1)",
                border: `3px solid ${allShut ? "#ffdf8e" : "rgba(255,247,230,0.22)"}`,
                color: allShut ? INK : "rgba(255,247,230,0.62)",
                fontFamily: KID_FONT, fontSize: 16, fontWeight: 900, letterSpacing: "0.04em",
                display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 9,
                cursor: speaking ? "default" : "pointer", touchAction: "manipulation",
                transition: "background 240ms ease, color 240ms ease, border-color 240ms ease",
              }}
            >
              <PixIcon emoji="🔒" size={24} />
              {lockLabel}
            </motion.button>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            .lofCardGrid { grid-template-columns: repeat(${Math.min(deck.length, 4)}, minmax(0, 1fr)); }
            @media (max-width: 760px) { .lofCardGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
            @media (max-width: 430px) { .lofCardGrid { grid-template-columns: minmax(0, 1fr); } }
          `}</style>
        </div>
      )}

      <AnimatePresence>
        {feedback && (
          <WrongAnswerPanel
            title={feedback.title}
            explanation={feedback.explanation}
            tip={feedback.tip}
            onContinue={() => setFeedback(null)}
          />
        )}
      </AnimatePresence>

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          verdict is still speaking would cut her off (the Week 9 bug). */}
      {phase === "done" && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${deck.length} cards closed, locked twice, and the sneaky one caught on the way out`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
