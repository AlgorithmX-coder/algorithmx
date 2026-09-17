"use client";

/**
 * PasscodeForge — the lock-forging BUILD drill (Week 18).
 *
 * An anvil, a code bar with empty slots, and a GUESS-O-METER. One slot
 * at a time, three glowing metal blanks are offered — each stamped with
 * a digit pair and the little story a guesser would read off it ("starts
 * 1-2-3-4!", "your birth year — the family knows it"). Hammer the blank
 * with nothing to guess: CLANG, the pair stamps into the code bar and
 * the meter climbs. Forge every slot → the padlock clicks shut.
 *
 * Deliberately NOT a W1 password re-teach: the lesson is HAVING a lock
 * on a device, and not making its code guessable. Distinct from
 * usernameBuilder (category slot picks) and dayBalancer (swap-to-level):
 * sequential forging with a quality meter and a physical strike beat.
 *
 * Learn-Loop wiring (every new prop optional; a week that passes none of
 * them renders exactly as before): the Raccoon's boast folds into the intro
 * (`threat`), Sarah speaks the how-to once as the board appears and reads
 * each round aloud as its blanks land (audio-only, `recordedOnly`, taps
 * held), every guess-proof strike gets a spoken verdict with its reason
 * ("That's right!" + `why`) and the next round waits for her, a guessable
 * strike keeps the WrongAnswerPanel (which speaks "Not quite." + the
 * explanation itself), and the complete beat can speak the payoff. The
 * "stones" skin renders each blank as a word label with an optional PixIcon
 * (icons fill the code bar) and reports the finished bar as a path.
 */

import { useEffect, useRef, useState } from "react";
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
// she reads is already on screen), same recipe as ClueStamper.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface ForgeOption {
  /** The digit pair stamped on the metal blank, e.g. "58" (a word label in
   *  the "stones" skin). */
  digits: string;
  /** The kid-readable tell under the digits (what a guesser would see). */
  tell: string;
  /** True = nothing to guess; exactly one per round. */
  isStrong: boolean;
  /** Shown in the WrongAnswerPanel when a guessable blank is hammered. */
  explanation: string;
  /** Sarah's reason on a guess-proof strike ("That's right!" + why).
   *  Optional: the shared lead alone when absent. */
  why?: string;
  /** PixIcon emoji shown above the label when present (and, in the "stones"
   *  skin, in the code bar once forged). */
  icon?: string;
}

export interface ForgeRound {
  id: string;
  /** Round prompt, e.g. "Forge the FIRST pair". */
  prompt: string;
  /** 3 metal blanks; exactly one isStrong. */
  options: ForgeOption[];
  /** Sarah's read-aloud as this round's blanks land (audio only, taps held).
   *  Optional: no read when absent. */
  readAloud?: string;
}

export interface PasscodeForgeProps {
  rounds: ForgeRound[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Label over the quality meter (default GUESS-O-METER). */
  meterLabel?: string;
  /** Meter status once every slot is forged (default "GUESS-PROOF!"). */
  meterDoneLabel?: string;
  /** Meter status word after the "n/N" count (default "FORGED"). */
  meterCountLabel?: string;
  strikeToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  /** Visual skin. "forge" (default) = the W18 digit pairs; "stones" = word
   *  labels on the blanks, icons in the code bar, "Path: ..." on complete. */
  skin?: "forge" | "stones";
  /** Emoji before the round prompt. Default "🔨". */
  promptIcon?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** The how-to, spoken once as the board appears (audio only). */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
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

const EMPTY_OPTIONS: ForgeOption[] = [];

export default function PasscodeForge({
  rounds,
  introTitle,
  introSubtitle,
  introIcon,
  meterLabel,
  meterDoneLabel,
  meterCountLabel,
  strikeToast,
  wrongTitle,
  completeTitle,
  completeLine,
  skin = "forge",
  promptIcon = "🔨",
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
}: PasscodeForgeProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#ffd158";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key (the
  // intro / how-to / complete blocks keep their own authored speaker).
  const voice = "adam" as const;
  const stones = skin === "stones";
  // Legacy mode (W18-style data: default skin and no read-aloud on any round):
  // the how-to is the on-screen CoachCaption exactly as before the Learn-Loop
  // wiring, and is NOT also spoken through the audio-only chain.
  const legacy = skin === "forge" && !rounds.some((r) => !!r.readAloud);

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Each forged slot: the blank's label and (when it had one) its icon.
  const [forged, setForged] = useState<{ text: string; icon?: string }[]>([]);
  // Read-aloud chain: the how-to once as the board appears, then each round as
  // its blanks land. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "struck" = a guess-proof strike: the stamp lands while Sarah says why,
  // then the next round slides in after the strike beat.
  const [phase, setPhase] = useState<"play" | "struck">("play");
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [roundClean, setRoundClean] = useState(true);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  // Legacy mode only: the CoachCaption leaves on the child's first strike.
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = idx >= rounds.length;
  const round = rounds[idx];
  // Anti-sequence: the three metal blanks of each round are dealt in a random
  // order (authored data keeps the guess-proof one in a predictable spot). The
  // rounds themselves stay in order: "first pair, second pair..." IS the code bar.
  const roundOptions = useShuffledOnce(round?.options ?? EMPTY_OPTIONS, { key: round?.id ?? "done" });

  // Spoken verdicts: Sarah says "That's right!" + why and the next round waits
  // for her. Wrong strikes speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || phase === "struck";

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

  // "read" only when the round has a read-aloud (and sound is on); otherwise
  // straight to idle so the board is never held on a clip that does not exist.
  const readOf = (r: ForgeRound | undefined): "read" | "idle" => (!isAudioMuted() && r?.readAloud ? "read" : "idle");

  const startBoard = () => {
    setShowIntro(false);
    setNarr(legacy || isAudioMuted() ? "idle" : coachLines ? "howto" : readOf(round));
  };

  const strike = (i: number) => {
    if (!round || showIntro || finished || speaking) return;
    setHasInteracted(true);
    const option = roundOptions[i];
    const correctIndex = roundOptions.findIndex((o) => o.isStrong);
    onAnswered?.({
      questionKey: `forge-${round.id}`,
      selectedIndex: i,
      correctIndex,
      wasCorrect: option.isStrong,
    });
    if (option.isStrong) {
      audio.correct();
      fx.correct({ xp: 25, text: strikeToast ?? "CLANG! GUESS-PROOF!" });
      onCorrect?.();
      if (roundClean) setFirstTryCount((n) => n + 1);
      setForged((f) => [...f, { text: option.digits, icon: option.icon }]);
      setPhase("struck");
      // Sarah: "That's right!" + the blank's why; the stamp lands under her,
      // then the strike beat, then the next round slides in (and is read
      // aloud if it has a line).
      const next = rounds[idx + 1];
      verdict.say("right", option.why ?? null, () => {
        window.setTimeout(() => {
          setIdx((n) => n + 1);
          setRoundClean(true);
          setPhase("play");
          setNarr(readOf(next));
        }, reduce ? 500 : 1000);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setRoundClean(false);
      setWrongCount((n) => n + 1);
      // WrongAnswerPanel speaks "Not quite." + this explanation itself.
      setFeedback({
        title: wrongTitle ?? "A guesser would crack that one!",
        explanation: option.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  const forgedText = forged.map((f) => f.text);

  return (
    <ExerciseFrame maxWidth={760} decor>
      {fx.layer()}
      {verdict.element}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Passcode Forge"}
          subtitle={introSubtitle ?? "Hammer a lock code onto the tablet - pick the metal with NOTHING for a guesser to read."}
          icon={introIcon ?? "🔨"}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each round. */}
      {!showIntro && !finished && round && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="pf-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr(readOf(round))} />
          )}
          {narr === "read" && round.readAloud && (
            <InfoNarration key={`pf-read-${round.id}`} speaker={voice} lines={[round.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {/* Code bar: one slot per round */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        {!stones && <PixIcon emoji={finished ? "🔒" : "🔓"} size={30} />}
        {rounds.map((r, i) => {
          const done = i < forged.length;
          const f = forged[i];
          // "stones" skin: a forged slot shows the blank's icon when it had
          // one, else its word label at 12px; the empty "· ·" stays as is.
          const slotIcon = stones && done ? f?.icon : undefined;
          const slotWord = stones && done && !slotIcon;
          return (
            <motion.div
              key={r.id}
              animate={done && !reduce && i === forged.length - 1 ? { scale: [1.25, 1] } : {}}
              style={{
                minWidth: 72,
                maxWidth: stones ? 132 : undefined,
                minHeight: stones ? 46 : undefined,
                display: stones ? "grid" : undefined,
                placeItems: stones ? "center" : undefined,
                padding: stones ? "6px 8px" : "10px 0",
                textAlign: "center",
                borderRadius: 12,
                border: done ? "2.5px solid #ffd158" : "2.5px dashed rgba(125,140,201,0.5)",
                background: done
                  ? "linear-gradient(180deg, rgba(255,209,88,0.22), rgba(64,44,10,0.9))"
                  : "rgba(20,16,40,0.6)",
                color: done ? "#ffe9b0" : "#7d8cc9",
                fontSize: slotWord ? 12 : 22,
                fontWeight: 900,
                letterSpacing: slotWord ? "normal" : "0.14em",
                lineHeight: slotWord ? 1.2 : undefined,
                boxShadow: done ? "0 0 20px -6px rgba(255,209,88,0.8)" : "none",
              }}
            >
              {done ? (slotIcon ? <PixIcon emoji={slotIcon} size={22} /> : f.text) : "· ·"}
            </motion.div>
          );
        })}
      </div>

      {/* Guess-o-meter */}
      <div style={{ maxWidth: 420, margin: "0 auto 16px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "#7d8cc9",
            marginBottom: 4,
          }}
        >
          <span>{meterLabel ?? "GUESS-O-METER"}</span>
          <span style={{ color: forged.length >= rounds.length ? "#7eff97" : "#ffd158" }}>
            {forged.length >= rounds.length ? (meterDoneLabel ?? "GUESS-PROOF!") : `${forged.length}/${rounds.length} ${meterCountLabel ?? "FORGED"}`}
          </span>
        </div>
        <div
          style={{
            height: 12,
            borderRadius: 999,
            background: "rgba(20,16,40,0.8)",
            border: "1px solid rgba(125,140,201,0.4)",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${(forged.length / rounds.length) * 100}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
            style={{
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #ffd158, #7eff97)",
              boxShadow: "0 0 14px rgba(255,209,88,0.7)",
            }}
          />
        </div>
      </div>

      {/* The anvil: current round's metal blanks */}
      {round && (
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={reduce ? false : { y: 26, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: -26, opacity: 0 }}
          >
            <div
              style={{
                textAlign: "center",
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#ffe9b0",
                marginBottom: 12,
              }}
            >
              {promptIcon} {round.prompt} · {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${roundOptions.length}, minmax(0,1fr))`,
                gap: 12,
                maxWidth: 620,
                margin: "0 auto",
              }}
            >
              {roundOptions.map((o, i) => (
                <motion.button
                  key={`${round.id}-${o.digits}`}
                  type="button"
                  onClick={() => strike(i)}
                  onPointerEnter={() => audio.hover()}
                  disabled={speaking}
                  initial={reduce ? false : { y: 24, opacity: 0 }}
                  // Motion owns this button's opacity (the deal-in fade), so the
                  // held look lives in `animate`, not `style`.
                  animate={{ y: 0, opacity: speaking ? 0.85 : 1 }}
                  transition={{ delay: reduce ? 0 : 0.07 * i, type: "spring", stiffness: 260, damping: 20 }}
                  whileHover={reduce ? undefined : { y: -4, scale: 1.03 }}
                  whileTap={speaking ? undefined : { scale: 0.95 }}
                  style={{
                    minHeight: 128,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    padding: "14px 10px",
                    borderRadius: 14,
                    // raw metal blank fresh off the fire
                    border: "2.5px solid rgba(255,169,88,0.55)",
                    background: "linear-gradient(180deg, rgba(84,52,20,0.94), rgba(38,22,8,0.96))",
                    color: "#ffe9b0",
                    cursor: speaking ? "wait" : "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 14px 30px -18px rgba(255,169,88,0.8)",
                    touchAction: "manipulation",
                  }}
                >
                  {o.icon && <PixIcon emoji={o.icon} size={30} />}
                  {stones ? (
                    <span style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3, textAlign: "center" }}>{o.digits}</span>
                  ) : (
                    <span style={{ fontSize: 30, fontWeight: 900, letterSpacing: "0.2em" }}>{o.digits}</span>
                  )}
                  <span style={{ fontSize: 12.5, fontWeight: 800, lineHeight: 1.35, color: "#e8c99a", textAlign: "center" }}>
                    {o.tell}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div style={{ maxWidth: 560, margin: "10px auto 0" }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker="adam" text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="adam" text={hints.tier2} />}
      </div>

      {legacy && coachLines && !showIntro && !hasInteracted && !finished && (
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

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "The lock clicks shut!"}
          stars={stars}
          statLines={[
            stones
              ? `Path: ${forgedText.join(" · ")}`
              : `Code forged: ${forgedText.join(" · ")} — ${firstTryCount}/${rounds.length} clean strikes`,
            completeLine ?? "A device with a front door - and a code nobody can stumble into.",
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(forged.length)}
        />
      )}
    </ExerciseFrame>
  );
}
