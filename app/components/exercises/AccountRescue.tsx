"use client";

/**
 * Account Rescue Mission.
 *
 * Three account tiles (e.g. Roblox / School / Email) all start with
 * the same password. One of them was just hacked - the Raccoon icon
 * pulses on that account. The child has to:
 *
 *   1. Tap each account.
 *   2. Pick a NEW password from the shared bank.
 *   3. Make sure every account ends up with a DIFFERENT password.
 *
 * Practical uniqueness drill. Teaches the rule taught on the
 * uniqueness info screen, but actively rather than via recognition.
 *
 * Persists per-account assignments by bank-id (no raw text). Tracks
 * whether any duplicates were attempted en route.
 *
 * Skins: "rescue" (default, the password drill above, byte-identical to the
 * original) and "moves" (Week 5): each tile is a MOMENT, the bank holds HERO
 * MOVES, and a moment with `correctMoveId` accepts only its own move (a wrong
 * move teaches through WrongAnswerPanel and is never assigned). The "moves"
 * skin is also what a five-case review board wants: five call-outs, five
 * powers, one each (the uniqueness rule makes the pairing a bijection). Give
 * such a board `tileLayout="wrap"` so five tiles wrap instead of crushing to
 * five columns on a phone, plus its own `duplicateToast` and `countLabel` so
 * no password wording leaks into it.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the intro (`threat`),
 * Sarah speaks the how-to once as the board appears (`coachLines`) and reads
 * a moment aloud when its tile becomes active (`readAloud`, audio-only,
 * `recordedOnly`, taps held), every correct pick gets a spoken verdict with
 * its reason ("That's right!" + `why` via the shared VerdictVoice), a wrong
 * move speaks through WrongAnswerPanel, and the complete beat speaks the
 * "you're protected" payoff (`completeNarration`).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, {
  ExerciseCompleteBeat,
} from "@/app/components/lesson/ExerciseBeats";
import GameButton from "@/app/components/lesson/GameButton";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
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

const UI_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const MONO_FONT = "'JetBrains Mono', monospace";

// "read" is only ever entered for a tile that has something to read, so the
// spoken gate can never wait on a clip that does not exist (mute-aware).
const readOrIdle = (acc: { readAloud?: string } | null | undefined): "read" | "idle" =>
  !isAudioMuted() && acc?.readAloud ? "read" : "idle";

export interface RescueAccount {
  id: string;
  label: string;
  icon?: string;
  /** Sarah's read-aloud when this tile becomes active (audio only). */
  readAloud?: string;
  /** "moves" skin: the ONE bank id this moment accepts. Absent = any pick. */
  correctMoveId?: string;
  /** Sarah's reason on a correct pick ("That's right!" + why). */
  why?: string;
  /** WrongAnswerPanel explanation on a wrong move (spoken by the panel). */
  whyWrong?: string;
}

export interface RescuePassword {
  id: string;
  text: string;
  /** PixIcon shown before the text in the bank ("moves" skin only). */
  icon?: string;
}

export interface AccountRescueProps {
  /** "rescue" (default) = the password drill; "moves" = moments + hero moves. */
  skin?: "rescue" | "moves";
  /** The reused password shown in the story strip and on unassigned tiles ("rescue" skin). */
  sharedPassword?: string;
  /** The tile that shows LEAKED ("rescue") or NEEDS YOU ("moves"). */
  leakedAccountId?: string;
  accounts: RescueAccount[];
  passwordBank: RescuePassword[];
  hints?: { tier1: string; tier2: string };
  /** "moves" skin: the story line in the strip where the shared password sat (warm amber). */
  storyLine?: string;
  /** "moves" skin: the pulsing chip on the `leakedAccountId` tile. Default "NEEDS YOU". */
  needsLabel?: string;
  /** Tile grid: "row" (default) = one column per tile; "wrap" = wrap at narrow widths (5+ tiles). */
  tileLayout?: "row" | "wrap";
  /** The toast when a bank entry is already used elsewhere. Default: the password wording. */
  duplicateToast?: string;
  /** The word after the header count ("3 / 5 secured"). Default "secured". */
  countLabel?: string;
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Header eyebrow. Default "🛡 Account Rescue". */
  headerLabel?: string;
  /** Bank prompt prefix, followed by the active tile's label. Default "Pick a new password for". */
  bankPrompt?: string;
  /** Bank prompt when no tile is active. Default "Tap an account first ↑". */
  bankIdle?: string;
  /** Finish button before / after every tile is done. */
  finishLabel?: string;
  finishReadyLabel?: string;
  /** Chip under a done tile. Default "✓ SECURED". */
  securedLabel?: string;
  /** fx toasts on a pick / on finishing. */
  pickToast?: string;
  allToast?: string;
  completeTitle?: string;
  completeLine?: string;
  /** WrongAnswerPanel title on a wrong move. Default "Not the move for this moment". */
  wrongTitle?: string;
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

type Phase = "intro" | "active" | "secured" | "finished";

export default function AccountRescue({
  skin = "rescue",
  sharedPassword,
  leakedAccountId,
  accounts,
  passwordBank,
  hints,
  storyLine,
  needsLabel = "NEEDS YOU",
  tileLayout = "row",
  duplicateToast = "That one's already in use - pick a different password",
  countLabel = "secured",
  introTitle = "Account Rescue Mission",
  introSubtitle = "The Raccoon hacked one account - and you used the same password on others! Give every account a different new one.",
  introIcon = "🛡",
  headerLabel = "🛡 Account Rescue",
  bankPrompt = "Pick a new password for",
  bankIdle = "Tap an account first ↑",
  finishLabel = "Secure all accounts",
  finishReadyLabel = "Mission complete →",
  securedLabel = "✓ SECURED",
  pickToast = "SECURED!",
  allToast = "ALL ACCOUNTS SECURED!",
  completeTitle = "Accounts rescued!",
  completeLine,
  wrongTitle = "Not the move for this moment",
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: AccountRescueProps) {
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;
  const moves = skin === "moves";

  const [phase, setPhase] = useState<Phase>("intro");
  // Map of accountId -> chosen password bank id. Empty until assigned.
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    () => Object.fromEntries(accounts.map((a) => [a.id, null]))
  );
  // Which account is currently focused for password-picking.
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [duplicateAttempts, setDuplicateAttempts] = useState(0);
  // "moves" skin: wrong moves (never assigned). Counts with duplicates for hints + stars.
  const [wrongPicks, setWrongPicks] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  // Read-aloud chain: the how-to once as the board appears, then the active
  // tile's moment as it becomes active. Taps are held while she speaks.
  // "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);

  // Spoken verdicts: Sarah says "That's right!" + why on every correct pick.
  // Wrong moves speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;
  const mistakes = duplicateAttempts + wrongPicks;

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  const securedCount = useMemo(
    () => Object.values(assignments).filter((v) => v !== null).length,
    [assignments]
  );
  const allSecured = securedCount === accounts.length;
  // All-secured AND all-distinct? Should always be true if duplicates
  // are blocked at assignment time, but check defensively.
  const allDistinct = useMemo(() => {
    const used = Object.values(assignments).filter(Boolean);
    return new Set(used).size === used.length;
  }, [assignments]);

  const activeAccount = activeAccountId
    ? accounts.find((a) => a.id === activeAccountId) ?? null
    : null;

  const startBoard = () => {
    setPhase("active");
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "idle");
  };

  const handleAccountTap = useCallback(
    (accountId: string) => {
      if (phase !== "active" || speaking) return;
      audio.tap();
      setActiveAccountId(accountId);
      // A new active tile: Sarah reads its moment (re-tapping the same tile does not repeat it).
      if (accountId !== activeAccountId) {
        setNarr(readOrIdle(accounts.find((a) => a.id === accountId)));
      }
    },
    [phase, speaking, audio, accounts, activeAccountId]
  );

  const handlePasswordPick = useCallback(
    (bankId: string) => {
      if (phase !== "active" || !activeAccountId || speaking) return;
      const account = accounts.find((a) => a.id === activeAccountId);

      // Check duplicates: if this password is already used by another
      // account, block + nudge.
      const otherEntries = Object.entries(assignments).filter(
        ([accId]) => accId !== activeAccountId
      );
      const isDuplicate = otherEntries.some(([, id]) => id === bankId);
      if (isDuplicate) {
        audio.wrong();
        onWrong?.();
        const newDup = duplicateAttempts + 1;
        setDuplicateAttempts(newDup);
        fx.toast({
          text: duplicateToast,
          tone: "danger",
          durationMs: 1100,
        });
        const total = newDup + wrongPicks;
        if (total >= 1) {
          setHintShown(true);
          onHintReached?.(total >= 2 ? 2 : 1);
        }
        onAnswered?.({
          questionKey: `rescue-${activeAccountId}-duplicate`,
          selectedIndex: 0,
          correctIndex: 0,
          wasCorrect: false,
        });
        return;
      }

      // "moves" skin: a moment with its own move accepts only that move. A
      // wrong move is never assigned; WrongAnswerPanel teaches (and speaks).
      if (account?.correctMoveId && bankId !== account.correctMoveId) {
        audio.wrong();
        onWrong?.();
        const newWrong = wrongPicks + 1;
        setWrongPicks(newWrong);
        const total = duplicateAttempts + newWrong;
        setHintShown(true);
        onHintReached?.(total >= 2 ? 2 : 1);
        onAnswered?.({
          questionKey: `rescue-${activeAccountId}-move`,
          selectedIndex: passwordBank.findIndex((p) => p.id === bankId),
          correctIndex: passwordBank.findIndex((p) => p.id === account.correctMoveId),
          wasCorrect: false,
        });
        setFeedback({
          title: wrongTitle,
          explanation: account.whyWrong ?? "Each moment needs its own hero move. Read it again and pick the move that fits.",
          tip: hints?.tier1,
        });
        return;
      }

      // Assign + record.
      const nextAssignments = { ...assignments, [activeAccountId]: bankId };
      setAssignments(nextAssignments);
      audio.tap();
      fx.correct({ xp: 8, text: pickToast });
      onCorrect?.();
      onAnswered?.({
        questionKey: `rescue-${activeAccountId}-assigned`,
        selectedIndex: account?.correctMoveId ? passwordBank.findIndex((p) => p.id === bankId) : 0,
        correctIndex: account?.correctMoveId ? passwordBank.findIndex((p) => p.id === account.correctMoveId) : 0,
        wasCorrect: true,
      });

      // Auto-advance focus: pick the next unassigned account so the
      // child doesn't have to tap a fresh account between picks.
      const nextUnassigned = accounts.find(
        (a) => nextAssignments[a.id] === null
      );
      setActiveAccountId(nextUnassigned ? nextUnassigned.id : null);
      // Sarah: "That's right!" + this moment's why; input is held while she
      // speaks, then the next active tile's moment is read.
      verdict.say("right", account?.why ?? null, () => {
        setNarr(readOrIdle(nextUnassigned));
      });
    },
    [
      phase,
      activeAccountId,
      speaking,
      assignments,
      duplicateAttempts,
      wrongPicks,
      fx,
      audio,
      accounts,
      passwordBank,
      pickToast,
      duplicateToast,
      wrongTitle,
      hints,
      verdict,
      onCorrect,
      onWrong,
      onHintReached,
      onAnswered,
    ]
  );

  const handleFinish = useCallback(() => {
    if (!allSecured || !allDistinct || speaking) return;
    setPhase("secured");
    fx.unlock({ xp: 30, text: allToast });
    window.setTimeout(
      () => setPhase("finished"),
      intensity === 0 ? 800 : 1600
    );
  }, [allSecured, allDistinct, speaking, fx, allToast, intensity]);

  /* ─── Finished ─── */
  if (phase === "finished") {
    const stars = mistakes === 0 ? 3 : mistakes <= 1 ? 2 : 1;
    const statLines = moves
      ? [
          `${accounts.length} of ${accounts.length} moments answered with a hero move`,
          completeLine ??
            (mistakes === 0
              ? "Every hero move right first time!"
              : `${mistakes} retr${mistakes === 1 ? "y" : "ies"} on the way. Now you know the moves.`),
        ]
      : [
          `${accounts.length} of ${accounts.length} secured with unique passwords`,
          completeLine ??
            (duplicateAttempts === 0
              ? "Not once tried to reuse a password!"
              : `${duplicateAttempts} time${duplicateAttempts === 1 ? "" : "s"} you tried to reuse - that's exactly what the Raccoon wants.`),
        ];
    return (
      <ExerciseFrame maxWidth={900} padding={28}>
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={statLines}
          narration={completeNarration}
          onContinue={() => onComplete(securedCount)}
        />
      </ExerciseFrame>
    );
  }

  /* ─── Active ─── */
  const tileCursor = phase === "active" ? (speaking ? "wait" : "pointer") : "default";

  return (
    <ExerciseFrame
      maxWidth={1100}
      padding={24}
      background="linear-gradient(180deg, #0f1530 0%, #1a1f4d 100%)"
    >
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, then the active tile's moment. */}
      {phase === "active" && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="ar-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent="#7df0ff" recordedOnly onDone={() => setNarr(readOrIdle(activeAccount))} />
          )}
          {narr === "read" && activeAccount?.readAloud && (
            <InfoNarration key={`ar-read-${activeAccount.id}`} speaker={voice} lines={[activeAccount.readAloud]} accent="#7df0ff" recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: "#ff9bcb",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          {headerLabel}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: MONO_FONT,
            color: "#cbd5e1",
          }}
        >
          {securedCount} / {accounts.length} {countLabel}
        </span>
      </div>

      {/* Story strip */}
      {moves ? (
        storyLine && (
          <div
            style={{
              padding: "12px 16px",
              marginBottom: 16,
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: 12,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "#fcd34d",
              lineHeight: 1.4,
              textAlign: "center",
            }}
          >
            {storyLine}
          </div>
        )
      ) : (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 16,
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: 12,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "#fca5a5",
            lineHeight: 1.4,
            textAlign: "center",
          }}
        >
          <strong style={{ color: "#fde047" }}>🦝 The Raccoon</strong> hacked one
          of your accounts - and you used the same password{" "}
          <span
            style={{
              display: "inline-block",
              margin: "0 4px",
              padding: "1px 8px",
              background: "rgba(15, 21, 48, 0.8)",
              border: "1px solid rgba(255, 95, 179, 0.55)",
              borderRadius: 6,
              fontFamily: MONO_FONT,
              color: "#ff9bcb",
            }}
          >
            {sharedPassword}
          </span>{" "}
          on every account. Give each one a NEW, DIFFERENT password.
        </div>
      )}

      {/* Account tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            tileLayout === "wrap"
              ? "repeat(auto-fit, minmax(150px, 1fr))"
              : `repeat(${accounts.length}, 1fr)`,
          gap: 10,
          marginBottom: 16,
        }}
      >
        {accounts.map((a) => {
          const assignedBankId = assignments[a.id];
          const assignedPassword = assignedBankId
            ? passwordBank.find((p) => p.id === assignedBankId)
            : null;
          const isLeaked = a.id === leakedAccountId;
          const isSecured = assignedPassword !== null;
          const isActive = a.id === activeAccountId;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => handleAccountTap(a.id)}
              disabled={phase !== "active" || speaking}
              style={{
                position: "relative",
                padding: "16px 14px 14px",
                minHeight: 130,
                borderRadius: 14,
                background: isSecured
                  ? "linear-gradient(180deg, rgba(126, 255, 151, 0.14), rgba(15, 21, 48, 0.6))"
                  : isActive
                    ? "linear-gradient(180deg, rgba(0, 229, 255, 0.18), rgba(15, 21, 48, 0.7))"
                    : "rgba(15, 21, 48, 0.65)",
                border: isSecured
                  ? "2px solid rgba(126, 255, 151, 0.65)"
                  : isActive
                    ? "2px solid rgba(0, 229, 255, 0.7)"
                    : isLeaked
                      ? moves
                        ? "2px solid rgba(245, 158, 11, 0.6)"
                        : "2px solid rgba(239, 68, 68, 0.6)"
                      : "1.5px solid rgba(148, 163, 184, 0.3)",
                cursor: tileCursor,
                opacity: speaking ? 0.85 : undefined,
                color: "#e8edff",
                textAlign: "left",
                transition: "all 220ms ease-out",
                touchAction: "manipulation",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 22 }}>{a.icon ?? "🔒"}</span>
                <span
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}
                >
                  {a.label}
                </span>
              </div>
              {/* Leaked warning ("rescue") / needs-you chip ("moves") */}
              {isLeaked && !isSecured && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: moves ? "rgba(245, 158, 11, 0.9)" : "rgba(239, 68, 68, 0.85)",
                    color: moves ? "#1a1204" : "#fff",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    fontFamily: MONO_FONT,
                    animation:
                      intensity === 0
                        ? undefined
                        : moves
                          ? "rescueNeedsPulse 1.4s ease-in-out infinite"
                          : "rescueLeakedPulse 1.4s ease-in-out infinite",
                  }}
                >
                  {moves ? needsLabel : "🦝 LEAKED"}
                </div>
              )}
              {/* Password display ("rescue") / chosen move ("moves", empty until picked) */}
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 8px",
                  minHeight: moves ? 30 : undefined,
                  background: "rgba(8, 10, 22, 0.85)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 7,
                  fontFamily: moves ? UI_FONT : MONO_FONT,
                  fontSize: moves ? 13 : 12,
                  fontWeight: moves ? 700 : undefined,
                  color: isSecured ? "#a0ffb0" : "#ff9bcb",
                  textAlign: "center",
                  wordBreak: moves ? "break-word" : "break-all",
                }}
              >
                {assignedPassword ? assignedPassword.text : moves ? "" : sharedPassword}
              </div>
              {isSecured && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "#7eff97",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    fontFamily: MONO_FONT,
                    textAlign: "center",
                  }}
                >
                  {securedLabel}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <div style={{ minHeight: 56, marginBottom: 12 }}>
        {hintShown && hints && (
          <HintBubble
            tier={mistakes >= 2 ? 2 : 1}
            speaker="adam"
            text={mistakes >= 2 ? hints.tier2 : hints.tier1}
          />
        )}
      </div>

      {/* Password bank */}
      <div
        style={{
          padding: "12px 14px",
          background: "rgba(8, 10, 22, 0.55)",
          border: "1px solid rgba(125, 240, 255, 0.18)",
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontFamily: MONO_FONT,
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#7df0ff",
            textTransform: "uppercase",
            marginBottom: 8,
            fontWeight: 800,
          }}
        >
          {activeAccount
            ? `${bankPrompt} ${activeAccount.label}`
            : bankIdle}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 8,
          }}
        >
          {passwordBank.map((p) => {
            // Find which account (if any) has this password assigned.
            const usedByAccountId = Object.entries(assignments).find(
              ([, bankId]) => bankId === p.id
            )?.[0];
            const isUsed = usedByAccountId !== undefined;
            return (
              <GameButton
                key={p.id}
                variant={isUsed ? "ghost" : "success"}
                size="md"
                icon={moves ? p.icon : undefined}
                disabled={isUsed || !activeAccount || phase !== "active" || speaking}
                onClick={() => handlePasswordPick(p.id)}
                style={{
                  fontFamily: moves ? UI_FONT : MONO_FONT,
                  fontSize: moves ? 14 : 13,
                  minHeight: 44,
                  opacity: isUsed ? 0.4 : speaking ? 0.85 : 1,
                  // Only override the cursor while held (an undefined key would clobber GameButton's own).
                  ...(speaking && !isUsed && activeAccount && phase === "active" ? { cursor: "wait" as const } : {}),
                  justifyContent: "flex-start",
                  textAlign: "left",
                }}
              >
                {isUsed
                  ? `${p.text}  (in use)`
                  : p.text}
              </GameButton>
            );
          })}
        </div>
      </div>

      {/* Finish */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GameButton
          variant="primary"
          size="lg"
          disabled={!allSecured || !allDistinct || phase !== "active" || speaking}
          onClick={handleFinish}
          icon={allSecured ? "✅" : "🔒"}
          style={{ minWidth: 240 }}
        >
          {allSecured ? finishReadyLabel : finishLabel}
        </GameButton>
      </div>

      {/* Secured overlay flash */}
      <AnimatePresence>
        {phase === "secured" && (
          <motion.div
            initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={intensity === 0 ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              background: "rgba(8, 10, 22, 0.55)",
              backdropFilter: "blur(4px)",
            }}
          >
            <div
              style={{
                padding: "18px 28px",
                background: "linear-gradient(135deg, #7eff97, #34d399)",
                color: "#062019",
                borderRadius: 14,
                fontWeight: 900,
                fontSize: 20,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.06em",
                boxShadow: "0 0 36px rgba(126, 255, 151, 0.6)",
              }}
            >
              {moves ? `🛡 ${allToast}` : "🛡 ALL ACCOUNTS SECURED"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => setFeedback(null)}
        />
      )}

      {phase === "intro" && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          character={introNarration?.speaker}
          threat={threat}
          onDismiss={startBoard}
        />
      )}

      {fx.layer()}

      <style>{`
        @keyframes rescueLeakedPulse {
          0%,100% { transform: scale(1); box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
          50%     { transform: scale(1.08); box-shadow: 0 0 14px rgba(239, 68, 68, 0.7); }
        }
        @keyframes rescueNeedsPulse {
          0%,100% { transform: scale(1); box-shadow: 0 0 0 rgba(245, 158, 11, 0); }
          50%     { transform: scale(1.08); box-shadow: 0 0 14px rgba(245, 158, 11, 0.7); }
        }
      `}</style>
    </ExerciseFrame>
  );
}
