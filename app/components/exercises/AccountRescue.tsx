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
 */

import { useCallback, useMemo, useState } from "react";
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
import HintBubble from "@/app/components/lesson/HintBubble";

export interface RescueAccount {
  id: string;
  label: string;
  icon?: string;
}

export interface RescuePassword {
  id: string;
  text: string;
}

export interface AccountRescueProps {
  sharedPassword: string;
  leakedAccountId: string;
  accounts: RescueAccount[];
  passwordBank: RescuePassword[];
  hints?: { tier1: string; tier2: string };
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
  sharedPassword,
  leakedAccountId,
  accounts,
  passwordBank,
  hints,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: AccountRescueProps) {
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  // Map of accountId -> chosen password bank id. Empty until assigned.
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    () => Object.fromEntries(accounts.map((a) => [a.id, null]))
  );
  // Which account is currently focused for password-picking.
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [duplicateAttempts, setDuplicateAttempts] = useState(0);
  const [hintShown, setHintShown] = useState(false);

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

  const handleAccountTap = useCallback(
    (accountId: string) => {
      if (phase !== "active") return;
      audio.tap();
      setActiveAccountId(accountId);
    },
    [phase, audio]
  );

  const handlePasswordPick = useCallback(
    (bankId: string) => {
      if (phase !== "active" || !activeAccountId) return;

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
          text: "That one's already in use - pick a different password",
          tone: "danger",
          durationMs: 1100,
        });
        if (newDup >= 1) {
          setHintShown(true);
          onHintReached?.(newDup >= 2 ? 2 : 1);
        }
        onAnswered?.({
          questionKey: `rescue-${activeAccountId}-duplicate`,
          selectedIndex: 0,
          correctIndex: 0,
          wasCorrect: false,
        });
        return;
      }

      // Assign + record.
      const nextAssignments = { ...assignments, [activeAccountId]: bankId };
      setAssignments(nextAssignments);
      audio.tap();
      fx.correct({ xp: 8, text: "SECURED!" });
      onCorrect?.();
      onAnswered?.({
        questionKey: `rescue-${activeAccountId}-assigned`,
        selectedIndex: 0,
        correctIndex: 0,
        wasCorrect: true,
      });

      // Auto-advance focus: pick the next unassigned account so the
      // child doesn't have to tap a fresh account between picks.
      const nextUnassigned = accounts.find(
        (a) => nextAssignments[a.id] === null
      );
      setActiveAccountId(nextUnassigned ? nextUnassigned.id : null);
    },
    [
      phase,
      activeAccountId,
      assignments,
      duplicateAttempts,
      fx,
      audio,
      accounts,
      onCorrect,
      onWrong,
      onHintReached,
      onAnswered,
    ]
  );

  const handleFinish = useCallback(() => {
    if (!allSecured || !allDistinct) return;
    setPhase("secured");
    fx.unlock({ xp: 30, text: "ALL ACCOUNTS SECURED!" });
    window.setTimeout(
      () => setPhase("finished"),
      intensity === 0 ? 800 : 1600
    );
  }, [allSecured, allDistinct, fx, intensity]);

  /* ─── Finished ─── */
  if (phase === "finished") {
    const stars = duplicateAttempts === 0 ? 3 : duplicateAttempts <= 1 ? 2 : 1;
    return (
      <ExerciseFrame maxWidth={900} padding={28}>
        <ExerciseCompleteBeat
          title="Accounts rescued!"
          stars={stars}
          statLines={[
            `${accounts.length} of ${accounts.length} secured with unique passwords`,
            duplicateAttempts === 0
              ? "Not once tried to reuse a password!"
              : `${duplicateAttempts} time${duplicateAttempts === 1 ? "" : "s"} you tried to reuse - that's exactly what the Raccoon wants.`,
          ]}
          onContinue={() => onComplete(securedCount)}
        />
      </ExerciseFrame>
    );
  }

  /* ─── Active ─── */
  const activeAccount = activeAccountId
    ? accounts.find((a) => a.id === activeAccountId) ?? null
    : null;

  return (
    <ExerciseFrame
      maxWidth={1100}
      padding={24}
      background="linear-gradient(180deg, #0f1530 0%, #1a1f4d 100%)"
    >
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
          🛡 Account Rescue
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#cbd5e1",
          }}
        >
          {securedCount} / {accounts.length} secured
        </span>
      </div>

      {/* Story strip */}
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
            fontFamily: "'JetBrains Mono', monospace",
            color: "#ff9bcb",
          }}
        >
          {sharedPassword}
        </span>{" "}
        on every account. Give each one a NEW, DIFFERENT password.
      </div>

      {/* Account tiles */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${accounts.length}, 1fr)`,
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
              disabled={phase !== "active"}
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
                      ? "2px solid rgba(239, 68, 68, 0.6)"
                      : "1.5px solid rgba(148, 163, 184, 0.3)",
                cursor: phase === "active" ? "pointer" : "default",
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
              {/* Leaked warning */}
              {isLeaked && !isSecured && (
                <div
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    padding: "2px 8px",
                    borderRadius: 999,
                    background: "rgba(239, 68, 68, 0.85)",
                    color: "#fff",
                    fontSize: 9,
                    fontWeight: 900,
                    letterSpacing: "0.12em",
                    fontFamily: "'JetBrains Mono', monospace",
                    animation:
                      intensity === 0
                        ? undefined
                        : "rescueLeakedPulse 1.4s ease-in-out infinite",
                  }}
                >
                  🦝 LEAKED
                </div>
              )}
              {/* Password display */}
              <div
                style={{
                  marginTop: 8,
                  padding: "6px 8px",
                  background: "rgba(8, 10, 22, 0.85)",
                  border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 7,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  color: isSecured ? "#a0ffb0" : "#ff9bcb",
                  textAlign: "center",
                  wordBreak: "break-all",
                }}
              >
                {assignedPassword ? assignedPassword.text : sharedPassword}
              </div>
              {isSecured && (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 11,
                    color: "#7eff97",
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    fontFamily: "'JetBrains Mono', monospace",
                    textAlign: "center",
                  }}
                >
                  ✓ SECURED
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
            tier={duplicateAttempts >= 2 ? 2 : 1}
            speaker="adam"
            text={duplicateAttempts >= 2 ? hints.tier2 : hints.tier1}
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
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#7df0ff",
            textTransform: "uppercase",
            marginBottom: 8,
            fontWeight: 800,
          }}
        >
          {activeAccount
            ? `Pick a new password for ${activeAccount.label}`
            : "Tap an account first ↑"}
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
                disabled={isUsed || !activeAccount || phase !== "active"}
                onClick={() => handlePasswordPick(p.id)}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 13,
                  minHeight: 44,
                  opacity: isUsed ? 0.4 : 1,
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
          disabled={!allSecured || !allDistinct || phase !== "active"}
          onClick={handleFinish}
          icon={allSecured ? "✅" : "🔒"}
          style={{ minWidth: 240 }}
        >
          {allSecured ? "Mission complete →" : "Secure all accounts"}
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
              🛡 ALL ACCOUNTS SECURED
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "intro" && (
        <ExerciseIntroBeat
          title="Account Rescue Mission"
          subtitle="The Raccoon hacked one account - and you used the same password on others! Give every account a different new one."
          icon="🛡"
          onDismiss={() => setPhase("active")}
        />
      )}

      {fx.layer()}

      <style>{`
        @keyframes rescueLeakedPulse {
          0%,100% { transform: scale(1); box-shadow: 0 0 0 rgba(239, 68, 68, 0); }
          50%     { transform: scale(1.08); box-shadow: 0 0 14px rgba(239, 68, 68, 0.7); }
        }
      `}</style>
    </ExerciseFrame>
  );
}
