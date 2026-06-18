"use client";

/**
 * Password Hospital - the first commercial-quality exercise built
 * natively on the new toolkit.
 *
 * Educational shift: moves the child from RECOGNITION (CyberScanner /
 * WeakSorter) to CONSTRUCTION. The child can already spot a weak
 * password; here they learn to *fix* one.
 *
 * Per-patient loop:
 *   1. Diagnose - tap one of 4 reason buttons. Wrong picks pause via
 *      WrongAnswerPanel; HintBubble escalates after repeated wrongs.
 *   2. Repair - tap action cards from a toolbox. Each action mutates
 *      the working password string and re-scores it. A strength meter
 *      animates from RED -> YELLOW -> GREEN.
 *   3. Discharge - once the meter crosses the healed threshold, the
 *      DISCHARGE button enables. Tap to fire the "HEALED!" stamp +
 *      next patient.
 *
 * Toolkit usage (proves the new pattern for future exercises):
 *   - <ExerciseFrame> for the chrome
 *   - <ExerciseIntroBeat> + <ExerciseCompleteBeat> for bookends
 *   - useExerciseFeedback() for all correct/wrong/unlock juice
 *     (audio + confetti + toast layer in one place)
 *   - useGameAudio() for taps + soft hint chime
 *   - useMotionIntensity() for comfort-mode-aware animation
 *   - <GameButton variant="quiz"> for diagnosis buttons
 *   - <GameButton variant="success"> for repair action cards
 *   - <GameButton variant="primary"> for DISCHARGE
 *   - <WrongAnswerPanel> for diagnosis mis-picks
 *   - <HintBubble> for the tiered hints
 *
 * Persistence:
 *   - One QuestionResponse per diagnosis attempt with key
 *     "hospital-{patientId}-diagnosis".
 *   - One QuestionResponse per patient when healed with key
 *     "hospital-{patientId}-healed" (wasCorrect = always true once
 *     they discharge - the act of discharging IS the success).
 *   - Working password text is NEVER persisted - only stable ids.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, {
  ExerciseCompleteBeat,
} from "@/app/components/lesson/ExerciseBeats";
import GameButton from "@/app/components/lesson/GameButton";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";

/* ─────────────── Types from week-content ─────────────── */

export interface HospitalReason {
  id: string;
  label: string;
}

export interface HospitalPatient {
  id: string;
  password: string;
  primaryReason: string;
  chartNote?: string;
  diagnosisExplanation: string;
  recommendedActions: string[];
}

export interface HospitalHints {
  diagnosisTier1: string;
  diagnosisTier2: string;
  repairTier1: string;
  repairTier2: string;
}

export interface PasswordHospitalProps {
  reasons: HospitalReason[];
  patients: HospitalPatient[];
  hints?: HospitalHints;
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  /**
   * Per-event analytics + persistence hook. `key` is a stable id
   * shaped as "hospital-{patientId}-{phase}" where phase is
   * "diagnosis" or "healed". No raw password text is ever passed.
   */
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number; // index into reasons[] for diagnosis; 0 for healed
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
}

/* ─────────────── Repair toolbox ─────────────── */

type RepairActionId =
  | "addLetters"
  | "addNumber"
  | "addSymbol"
  | "mixCase"
  | "removePersonal"
  | "scramble";

interface RepairAction {
  id: RepairActionId;
  label: string;
  icon: string;
  /** True if applying this action will improve the given password meaningfully. */
  applies: (pw: string) => boolean;
  /** Transform the working password. */
  apply: (pw: string) => string;
}

const RANDOM_LETTERS = "bdfghjklmnprstvwxz";
const RANDOM_VOWELS = "aeiouy";
const SYMBOL_POOL = ["!", "@", "#", "$", "%", "&", "*", "?"];
const NAME_LIKE = /\b(sam|maya|john|alex|emma|leo|ben|noah|mia|amy|adam|layla|josh|sara|tom|liz)\b/i;
const YEAR_LIKE = /\b(19\d{2}|20[0-3]\d)\b/;
const SHORT_DATE_LIKE = /(?:\d{4}|\d{2}\/\d{2}|\d{2}-\d{2})/;
const KEYBOARD_PATTERNS = [
  "qwerty",
  "qwert",
  "asdfg",
  "asdf",
  "zxcvb",
  "zxcv",
  "12345",
  "1234",
  "0987",
];

function randomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomChar(s: string): string {
  return s[Math.floor(Math.random() * s.length)];
}

const REPAIR_ACTIONS: Record<RepairActionId, RepairAction> = {
  addLetters: {
    id: "addLetters",
    label: "Add letters",
    icon: "🔡",
    applies: () => true,
    apply: (pw) => {
      // Add 3 letters - alternating consonant/vowel for readability.
      const add =
        randomChar(RANDOM_LETTERS) +
        randomChar(RANDOM_VOWELS) +
        randomChar(RANDOM_LETTERS);
      return pw + add;
    },
  },
  addNumber: {
    id: "addNumber",
    label: "Add a number",
    icon: "🔢",
    applies: (pw) => !/\d/.test(pw),
    apply: (pw) => pw + String(Math.floor(Math.random() * 90) + 10), // 2-digit
  },
  addSymbol: {
    id: "addSymbol",
    label: "Add a symbol",
    icon: "✨",
    applies: (pw) => !/[!@#$%^&*?]/.test(pw),
    apply: (pw) => pw + randomFrom(SYMBOL_POOL),
  },
  mixCase: {
    id: "mixCase",
    label: "Mix UPPER + lower",
    icon: "Aa",
    applies: (pw) => !(/[a-z]/.test(pw) && /[A-Z]/.test(pw)),
    apply: (pw) => {
      // Capitalise every other letter starting from the second.
      return pw
        .split("")
        .map((ch, i) => (/[a-z]/i.test(ch) && i % 2 === 1 ? ch.toUpperCase() : ch.toLowerCase()))
        .join("");
    },
  },
  removePersonal: {
    id: "removePersonal",
    label: "Remove name + date",
    icon: "🗑️",
    applies: (pw) => NAME_LIKE.test(pw) || YEAR_LIKE.test(pw) || SHORT_DATE_LIKE.test(pw),
    apply: (pw) =>
      pw
        .replace(NAME_LIKE, "")
        .replace(YEAR_LIKE, "")
        .replace(SHORT_DATE_LIKE, "")
        .replace(/\s+/g, ""),
  },
  scramble: {
    id: "scramble",
    label: "Scramble pattern",
    icon: "🔀",
    applies: (pw) => {
      const lower = pw.toLowerCase();
      return KEYBOARD_PATTERNS.some((p) => lower.includes(p));
    },
    apply: (pw) => {
      // Shuffle the letters - breaks any keyboard run.
      const arr = pw.split("");
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.join("");
    },
  },
};

const REPAIR_ORDER: RepairActionId[] = [
  "addLetters",
  "addNumber",
  "addSymbol",
  "mixCase",
  "removePersonal",
  "scramble",
];

/* ─────────────── Strength heuristic ─────────────── */

interface StrengthScore {
  score: number; // 0..100
  hasUpper: boolean;
  hasLower: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  hasPersonal: boolean;
  hasKeyboardPattern: boolean;
  isCommonWord: boolean;
}

const COMMON_WORDS = [
  "password", "football", "dragon", "monkey", "letmein", "iloveyou",
  "qwerty", "abc123", "starwars", "minecraft", "roblox", "fortnite",
];

function scorePassword(pw: string): StrengthScore {
  const lower = pw.toLowerCase();
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[!@#$%^&*?]/.test(pw);
  const hasPersonal = NAME_LIKE.test(pw) || YEAR_LIKE.test(pw);
  const hasKeyboardPattern = KEYBOARD_PATTERNS.some((p) => lower.includes(p));
  const isCommonWord = COMMON_WORDS.some((w) => lower === w || lower.startsWith(w));

  let score = 0;
  score += Math.min(40, pw.length * 4); // length up to 40 pts
  if (hasUpper) score += 12;
  if (hasLower) score += 8;
  if (hasDigit) score += 12;
  if (hasSymbol) score += 14;
  if (isCommonWord) score -= 25;
  if (hasPersonal) score -= 18;
  if (hasKeyboardPattern) score -= 22;
  score = Math.max(0, Math.min(100, score));
  return {
    score,
    hasUpper,
    hasLower,
    hasDigit,
    hasSymbol,
    hasPersonal,
    hasKeyboardPattern,
    isCommonWord,
  };
}

const HEALED_THRESHOLD = 65;

function strengthLabel(score: number): { text: string; colour: string } {
  if (score < 25) return { text: "VERY WEAK", colour: "#ef4444" };
  if (score < 45) return { text: "WEAK", colour: "#f97316" };
  if (score < 60) return { text: "GETTING THERE", colour: "#fbbf24" };
  if (score < 80) return { text: "STRONG", colour: "#7eff97" };
  return { text: "SUPER STRONG", colour: "#34d399" };
}

/* ─────────────── Component ─────────────── */

type Phase = "intro" | "diagnosis" | "repair" | "healed" | "finished";

export default function PasswordHospital({
  reasons,
  patients,
  hints,
  onComplete,
  onCorrect,
  onWrong,
  onAnswered,
  onHintReached,
}: PasswordHospitalProps) {
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [patientIdx, setPatientIdx] = useState(0);
  const [currentPassword, setCurrentPassword] = useState("");
  const [wrongDiagOnCurrent, setWrongDiagOnCurrent] = useState(0);
  const [unhelpfulRepairsOnCurrent, setUnhelpfulRepairsOnCurrent] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  const [healedCount, setHealedCount] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [stampKey, setStampKey] = useState(0);
  const advanceTimerRef = useRef<number | null>(null);

  const patient = patients[patientIdx];
  const score = useMemo(() => scorePassword(currentPassword), [currentPassword]);
  const isHealed = score.score >= HEALED_THRESHOLD;
  const meter = strengthLabel(score.score);

  // Initialise / reset working password whenever we move to a new patient.
  useEffect(() => {
    if (!patient) return;
    setCurrentPassword(patient.password);
    setWrongDiagOnCurrent(0);
    setUnhelpfulRepairsOnCurrent(0);
  }, [patient]);

  // Clean up the auto-advance timer if the component unmounts mid-beat.
  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) {
        window.clearTimeout(advanceTimerRef.current);
      }
    },
    []
  );

  /* ─── Diagnosis phase ─── */

  const handleDiagnosis = useCallback(
    (reasonId: string, index: number) => {
      if (!patient || feedback) return;
      const correctIndex = reasons.findIndex((r) => r.id === patient.primaryReason);
      const wasCorrect = reasonId === patient.primaryReason;
      onAnswered?.({
        questionKey: `hospital-${patient.id}-diagnosis`,
        selectedIndex: index,
        correctIndex: correctIndex < 0 ? 0 : correctIndex,
        wasCorrect,
      });
      if (wasCorrect) {
        fx.correct({ xp: 10, text: "DIAGNOSED!" });
        onCorrect?.();
        setPhase("repair");
      } else {
        audio.wrong();
        onWrong?.();
        setWrongTotal((n) => n + 1);
        const nextWrong = wrongDiagOnCurrent + 1;
        setWrongDiagOnCurrent(nextWrong);
        const correctReasonLabel =
          reasons.find((r) => r.id === patient.primaryReason)?.label ?? "the right reason";
        setFeedback({
          title: `Not quite - it's "${correctReasonLabel}"`,
          explanation: patient.diagnosisExplanation,
          tip: "Look at the password again - what stands out about it?",
        });
        if (nextWrong === 1) onHintReached?.(1);
        if (nextWrong === 2) onHintReached?.(2);
        if (nextWrong >= 3) onHintReached?.(3);
      }
    },
    [
      patient,
      reasons,
      feedback,
      fx,
      audio,
      onAnswered,
      onCorrect,
      onWrong,
      wrongDiagOnCurrent,
      onHintReached,
    ]
  );

  /* ─── Repair phase ─── */

  const handleRepair = useCallback(
    (actionId: RepairActionId) => {
      if (!patient || feedback || phase !== "repair") return;
      const action = REPAIR_ACTIONS[actionId];
      const wouldHelp = patient.recommendedActions.includes(actionId) || action.applies(currentPassword);
      const prevScore = score.score;
      const next = action.apply(currentPassword);
      setCurrentPassword(next);
      const newScore = scorePassword(next).score;
      const delta = newScore - prevScore;
      audio.tap();

      if (delta >= 8) {
        // Meaningful improvement.
        audio.heal(); // repair sparkle as the password gets stronger
        fx.toast({
          text: `+${Math.round(delta)} STRENGTH`,
          tone: "bonus",
          durationMs: 700,
        });
      } else if (delta <= 0 && !wouldHelp) {
        // Action didn't help this patient.
        const nextUnhelpful = unhelpfulRepairsOnCurrent + 1;
        setUnhelpfulRepairsOnCurrent(nextUnhelpful);
        fx.toast({
          text: "Try a different fix",
          tone: "danger",
          durationMs: 700,
        });
        if (nextUnhelpful >= 2) onHintReached?.(2);
        if (nextUnhelpful >= 3) onHintReached?.(3);
      } else {
        fx.toast({
          text: `+${Math.max(1, Math.round(delta))}`,
          tone: "xp",
          durationMs: 600,
        });
      }
    },
    [
      patient,
      feedback,
      phase,
      currentPassword,
      score.score,
      fx,
      audio,
      unhelpfulRepairsOnCurrent,
      onHintReached,
    ]
  );

  /* ─── Discharge / heal ─── */

  const discharge = useCallback(() => {
    if (!patient || phase !== "repair" || !isHealed) return;
    onAnswered?.({
      questionKey: `hospital-${patient.id}-healed`,
      selectedIndex: 0,
      correctIndex: 0,
      wasCorrect: true,
    });
    onCorrect?.();
    fx.unlock({ xp: 25, text: "HEALED!" });
    setHealedCount((n) => n + 1);
    setStampKey((k) => k + 1);
    setPhase("healed");

    // Hold the healed stamp for a beat, then advance.
    advanceTimerRef.current = window.setTimeout(
      () => {
        const nextIdx = patientIdx + 1;
        if (nextIdx >= patients.length) {
          setPhase("finished");
        } else {
          setPatientIdx(nextIdx);
          setPhase("diagnosis");
        }
      },
      intensity === 0 ? 700 : 1600
    );
  }, [
    patient,
    phase,
    isHealed,
    patientIdx,
    patients.length,
    fx,
    onAnswered,
    onCorrect,
    intensity,
  ]);

  /* ─── Hint tier display ─── */

  const diagnosisHintTier =
    wrongDiagOnCurrent >= 2 ? 2 : wrongDiagOnCurrent === 1 ? 1 : 0;
  const repairHintTier =
    unhelpfulRepairsOnCurrent >= 3 ? 3 : unhelpfulRepairsOnCurrent === 2 ? 2 : 0;

  /* ─── Finished overlay ─── */

  if (phase === "finished") {
    const stars =
      wrongTotal === 0 ? 3 : wrongTotal <= 2 ? 2 : 1;
    return (
      <ExerciseFrame maxWidth={1100} padding={28}>
        <ExerciseCompleteBeat
          title="Hospital cleared!"
          stars={stars}
          statLines={[
            `${healedCount} of ${patients.length} patients discharged`,
            wrongTotal === 0
              ? "Spotless diagnosis - no wrong picks!"
              : `${wrongTotal} wrong diagnosis ${wrongTotal === 1 ? "pick" : "picks"} on the way`,
          ]}
          onContinue={() => onComplete(healedCount)}
        />
      </ExerciseFrame>
    );
  }

  /* ─── Render ─── */

  return (
    <ExerciseFrame maxWidth={1100} padding={24}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "#7eff97",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          ➕ Password Hospital
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#cbd5e1",
          }}
        >
          Patient {Math.min(patientIdx + 1, patients.length)} / {patients.length}
        </span>
      </div>

      {/* Patient bed card */}
      {patient && (
        <PatientCard
          patient={patient}
          currentPassword={currentPassword}
          score={score}
          intensity={intensity}
          phase={phase}
          stampKey={stampKey}
        />
      )}

      {/* Strength meter */}
      {patient && (
        <StrengthMeter score={score.score} meter={meter} intensity={intensity} />
      )}

      {/* Hint row (reserves layout space) */}
      <div style={{ minHeight: 56, marginBottom: 12, marginTop: 12 }}>
        {phase === "diagnosis" && diagnosisHintTier > 0 && hints && (
          <HintBubble
            tier={diagnosisHintTier as 1 | 2 | 3}
            speaker="adam"
            text={
              diagnosisHintTier === 1 ? hints.diagnosisTier1 : hints.diagnosisTier2
            }
          />
        )}
        {phase === "repair" && repairHintTier > 0 && hints && (
          <HintBubble
            tier={(repairHintTier === 3 ? 3 : 2) as 2 | 3}
            speaker="layla"
            text={repairHintTier === 3 ? hints.repairTier2 : hints.repairTier1}
          />
        )}
      </div>

      {/* Diagnosis buttons OR Repair toolbox */}
      {phase === "diagnosis" && patient && (
        <DiagnosisRow
          reasons={reasons}
          onPick={handleDiagnosis}
          disabled={!!feedback}
        />
      )}
      {phase === "repair" && patient && (
        <RepairToolbox
          onApply={handleRepair}
          onDischarge={discharge}
          canDischarge={isHealed}
          intensity={intensity}
        />
      )}

      {/* Intro beat */}
      {phase === "intro" && (
        <ExerciseIntroBeat
          title="Password Hospital"
          subtitle="Diagnose each weak password, then repair it back to full strength."
          icon="🏥"
          onDismiss={() => setPhase("diagnosis")}
        />
      )}

      {/* Wrong-diagnosis pause */}
      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker="layla"
          onContinue={() => setFeedback(null)}
        />
      )}

      {/* Self-rendered toast layer from useExerciseFeedback */}
      {fx.layer()}
    </ExerciseFrame>
  );
}

/* ─────────────── Sub-components ─────────────── */

function PatientCard({
  patient,
  currentPassword,
  score,
  intensity,
  phase,
  stampKey,
}: {
  patient: HospitalPatient;
  currentPassword: string;
  score: StrengthScore;
  intensity: number;
  phase: Phase;
  stampKey: number;
}) {
  const tone =
    score.score >= 65
      ? { border: "rgba(126, 255, 151, 0.6)", bg: "rgba(126, 255, 151, 0.1)", text: "#a0ffb0" }
      : score.score >= 45
        ? { border: "rgba(251, 191, 36, 0.55)", bg: "rgba(251, 191, 36, 0.1)", text: "#fde047" }
        : { border: "rgba(255, 95, 179, 0.55)", bg: "rgba(255, 95, 179, 0.1)", text: "#ff9bcb" };

  return (
    <motion.div
      key={patient.id}
      initial={intensity === 0 ? false : { x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={
        intensity === 0
          ? { duration: 0 }
          : { type: "spring", stiffness: 280, damping: 26 }
      }
      style={{
        position: "relative",
        padding: "20px 18px",
        marginBottom: 12,
        background: tone.bg,
        border: `2px solid ${tone.border}`,
        borderRadius: 18,
        textAlign: "center",
        transition:
          "background 240ms ease-out, border-color 240ms ease-out, color 240ms ease-out",
        overflow: "hidden",
      }}
    >
      {/* Chart note */}
      {patient.chartNote && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "#94a3b8",
            marginBottom: 8,
            letterSpacing: "0.06em",
          }}
        >
          📋 {patient.chartNote}
        </div>
      )}

      {/* Original */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "#64748b",
          letterSpacing: "0.06em",
          marginBottom: 4,
          textTransform: "uppercase",
        }}
      >
        admitted as
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 16,
          color: "#94a3b8",
          textDecoration: "line-through",
          marginBottom: 10,
          wordBreak: "break-all",
        }}
      >
        {patient.password}
      </div>

      {/* Working password */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 26,
          fontWeight: 700,
          color: tone.text,
          letterSpacing: "0.04em",
          wordBreak: "break-all",
          minHeight: 36,
        }}
      >
        {currentPassword || "·"}
      </div>

      {/* HEALED stamp */}
      <AnimatePresence>
        {phase === "healed" && (
          <motion.div
            key={stampKey}
            initial={
              intensity === 0
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.4, rotate: -30 }
            }
            animate={
              intensity === 0
                ? { opacity: 1 }
                : { opacity: 1, scale: 1, rotate: -6 }
            }
            exit={{ opacity: 0 }}
            transition={
              intensity === 0
                ? { duration: 0.2 }
                : { type: "spring", stiffness: 380, damping: 14 }
            }
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                padding: "10px 22px",
                border: "4px solid #7eff97",
                borderRadius: 10,
                color: "#7eff97",
                background: "rgba(15, 21, 48, 0.9)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                boxShadow: "0 0 28px rgba(126, 255, 151, 0.55)",
              }}
            >
              ✓ HEALED!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StrengthMeter({
  score,
  meter,
  intensity,
}: {
  score: number;
  meter: { text: string; colour: string };
  intensity: number;
}) {
  return (
    <div
      style={{
        marginBottom: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          fontFamily: "'JetBrains Mono', monospace",
          color: "#94a3b8",
          letterSpacing: "0.1em",
          marginBottom: 4,
        }}
      >
        <span>STRENGTH</span>
        <span style={{ color: meter.colour, fontWeight: 800 }}>{meter.text}</span>
      </div>
      <div
        style={{
          position: "relative",
          height: 14,
          background: "rgba(15, 23, 42, 0.85)",
          border: "1px solid rgba(148, 163, 184, 0.25)",
          borderRadius: 7,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            background: `linear-gradient(90deg, ${meter.colour}, ${meter.colour}cc)`,
            boxShadow: `0 0 12px ${meter.colour}88`,
            transition:
              intensity === 0
                ? "width 100ms linear"
                : "width 380ms cubic-bezier(0.16, 1, 0.3, 1), background 240ms ease-out, box-shadow 240ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

function DiagnosisRow({
  reasons,
  onPick,
  disabled,
}: {
  reasons: HospitalReason[];
  onPick: (reasonId: string, index: number) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 14,
          color: "#cbd5e1",
          textAlign: "center",
          margin: "0 0 12px",
        }}
      >
        Step 1 - what&apos;s wrong with this password?
      </div>
      <div
        role="group"
        aria-label="Diagnosis options"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}
      >
        {reasons.map((r, i) => (
          <GameButton
            key={r.id}
            variant="quiz"
            size="lg"
            disabled={disabled}
            onClick={() => onPick(r.id, i)}
            style={{ minHeight: 64, justifyContent: "flex-start", textAlign: "left" }}
          >
            {r.label}
          </GameButton>
        ))}
      </div>
    </div>
  );
}

function RepairToolbox({
  onApply,
  onDischarge,
  canDischarge,
  intensity,
}: {
  onApply: (id: RepairActionId) => void;
  onDischarge: () => void;
  canDischarge: boolean;
  intensity: number;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 14,
          color: "#cbd5e1",
          textAlign: "center",
          margin: "0 0 12px",
        }}
      >
        Step 2 - tap a fix to repair the password.
      </div>
      <div
        role="group"
        aria-label="Repair toolbox"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {REPAIR_ORDER.map((id) => {
          const a = REPAIR_ACTIONS[id];
          return (
            <GameButton
              key={id}
              variant="success"
              size="md"
              onClick={() => onApply(id)}
              icon={a.icon}
              style={{ minHeight: 56, justifyContent: "flex-start" }}
            >
              {a.label}
            </GameButton>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 4,
        }}
      >
        <GameButton
          variant="primary"
          size="lg"
          disabled={!canDischarge}
          onClick={onDischarge}
          icon={canDischarge ? "🎉" : "🔒"}
          style={{
            minWidth: 220,
            opacity: canDischarge ? 1 : 0.55,
            transition: intensity === 0 ? "none" : "opacity 240ms ease-out",
          }}
        >
          {canDischarge ? "Discharge patient →" : "Keep repairing"}
        </GameButton>
      </div>
    </div>
  );
}
