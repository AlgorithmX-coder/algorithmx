"use client";

/**
 * Pop-up Panic.
 *
 * Skin "popup" (W7/W20): a sequence of fake scary pop-ups. Each one has a
 * tempting OK button and a small but always-tappable X. The child has to
 * find and tap the X every time. Teaches the "close it, tell a grown-up,
 * don't engage" instinct that phishing relies on people NOT having.
 *
 * Skin "request" (Week 3, "Red-Flag Requests"): requests pop up from a new
 * online "friend" one at a time. Most are red flags (secrets, photos, gifts
 * for info, "don't tell your parents"); a few are perfectly fine asks
 * (favourite game, a rematch). The child judges each one: RED FLAG, or
 * FRIENDLY. The two verdict buttons look identical and swap sides per
 * request, so the answer never lives in a colour or a position.
 *
 * Not a reaction-speed game - untimed. The urgency is theatrical:
 * countdown numbers, scary icons, but tapping the wrong button is
 * met with a calm explanation, never a loss state.
 *
 * Learn-Loop wiring (owner standards, 2026-09-11): the Raccoon's boast folds
 * into the intro (`threat`); Sarah reads the how-to once as the board appears,
 * each request as it pops, and its why after a correct call (audio-only,
 * `recordedOnly`), holding taps while she speaks; a visible action strip; a
 * spoken `completeNarration` payoff. Pop-ups are shuffled per play.
 */

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, {
  ExerciseCompleteBeat,
} from "@/app/components/lesson/ExerciseBeats";
import GameButton from "@/app/components/lesson/GameButton";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;

const SPOKEN_GATE_MAX_MS = 15000;

export type PopupPanicSkin = "popup" | "request";

export interface PopupPanicPopup {
  id: string;
  title: string;
  body?: string;
  icon?: string;
  whyTrick: string;
  /** Request skin: false = a perfectly fine, friendly ask (default true = red flag). */
  isRedFlag?: boolean;
  /** Request skin: who the request is from. */
  from?: string;
}

export interface PopupPanicProps {
  popups: PopupPanicPopup[];
  /** Visual skin: scary browser pop-ups (default) or W3 chat requests. */
  skin?: PopupPanicSkin;
  hints?: { tier1: string; tier2: string; tier3: string };
  /** Intro copy overrides + spoken paced narration (week re-dress). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Board copy (request skin). */
  headerLabel?: string;
  boardPrompt?: string;
  flagLabel?: string;
  fineLabel?: string;
  flagToast?: string;
  fineToast?: string;
  wrongTitle?: string;
  wrongTip?: string;
  completeTitle?: string;
  completeLine?: string;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
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

type Phase = "intro" | "active" | "finished";

export default function PopupPanic({
  popups,
  skin = "popup",
  hints,
  introTitle,
  introSubtitle,
  introIcon,
  headerLabel,
  boardPrompt,
  flagLabel,
  fineLabel,
  flagToast,
  fineToast,
  wrongTitle,
  wrongTip,
  completeTitle,
  completeLine,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: PopupPanicProps) {
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();
  const request = skin === "request";
  const voice = introNarration?.speaker ?? "adam";

  const [phase, setPhase] = useState<Phase>("intro");
  const [popupIdx, setPopupIdx] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  // The popup keeps refreshing visually each render via a key bumped
  // on close. Avoids any chance of a "ghost" of the previous popup.
  const [popupRenderKey, setPopupRenderKey] = useState(0);
  // Request skin read-aloud chain: how-to once, the request as it pops, its
  // why after a correct call. Taps held while Sarah speaks.
  const [narr, setNarr] = useState<"howto" | "body" | "why" | "idle">("idle");
  // Request skin: the two identical verdict buttons swap sides per request.
  const [flip, setFlip] = useState(false);

  // Anti-sequence: the pop-ups fire in a random order every play so the
  // scare-script never plays the same way twice.
  const shownPopups = useShuffledOnce(popups);
  const popup = shownPopups[popupIdx];
  const speaking = request && narr !== "idle";

  useIsoLayoutEffect(() => {
    if (request) setFlip(Math.random() < 0.5);
  }, [request, popupIdx]);

  // Kick the read-aloud chain when the board appears / a new request pops.
  useEffect(() => {
    if (!request || phase !== "active" || !popup) return;
    if (isAudioMuted()) { setNarr("idle"); return; }
    setNarr(popupIdx === 0 && coachLines ? "howto" : "body");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, phase, popupIdx]);

  useEffect(() => {
    if (!speaking) return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [speaking, narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Hint tier rises when the same popup has been wrongly tapped multiple
  // times in a row.
  useEffect(() => {
    if (!onHintReached || wrongOnCurrent === 0) return;
    if (wrongOnCurrent >= 3) onHintReached(3);
    else if (wrongOnCurrent === 2) onHintReached(2);
    else onHintReached(1);
  }, [wrongOnCurrent, onHintReached]);

  const advance = useCallback(() => {
    const next = popupIdx + 1;
    if (next >= shownPopups.length) {
      setPhase("finished");
    } else {
      setPopupIdx(next);
      setPopupRenderKey((k) => k + 1);
    }
  }, [popupIdx, shownPopups.length]);

  const handleX = useCallback(() => {
    if (!popup || feedback) return;
    onAnswered?.({
      questionKey: `popup-${popup.id}`,
      selectedIndex: 0,
      correctIndex: 0,
      wasCorrect: true,
    });
    onCorrect?.();
    fx.correct({ xp: 10, text: "GOT IT!" });
    setClosedCount((n) => n + 1);
    if (wrongOnCurrent === 0) setFirstTryCount((n) => n + 1);
    setWrongOnCurrent(0);
    advance();
  }, [popup, feedback, fx, onCorrect, onAnswered, wrongOnCurrent, advance]);

  const handleOk = useCallback(() => {
    if (!popup || feedback) return;
    onAnswered?.({
      questionKey: `popup-${popup.id}`,
      selectedIndex: 1,
      correctIndex: 0,
      wasCorrect: false,
    });
    onWrong?.();
    audio.wrong();
    setWrongTotal((n) => n + 1);
    setWrongOnCurrent((n) => n + 1);
    setFeedback({
      title: "OK is the trap!",
      explanation: popup.whyTrick,
      tip: "Scary pop-ups want you to panic. The X (close) is always the right button.",
    });
  }, [popup, feedback, audio, onWrong, onAnswered]);

  // Request skin verdict: callFlag = the child says RED FLAG.
  const judge = useCallback(
    (callFlag: boolean) => {
      if (!popup || feedback || speaking) return;
      const isFlag = popup.isRedFlag !== false;
      const wasCorrect = callFlag === isFlag;
      onAnswered?.({
        questionKey: `popup-${popup.id}`,
        selectedIndex: callFlag ? 1 : 0,
        correctIndex: isFlag ? 1 : 0,
        wasCorrect,
      });
      if (wasCorrect) {
        audio.correct();
        onCorrect?.();
        fx.correct({ xp: 25, text: isFlag ? (flagToast ?? "RED FLAG SPOTTED!") : (fineToast ?? "FRIENDLY ASK!") });
        setClosedCount((n) => n + 1);
        if (wrongOnCurrent === 0) setFirstTryCount((n) => n + 1);
        setWrongOnCurrent(0);
        // Sarah explains the why, then the next request pops.
        if (!isAudioMuted()) setNarr("why");
        else window.setTimeout(advance, intensity === 0 ? 400 : 1100);
      } else {
        audio.wrong();
        onWrong?.();
        setWrongTotal((n) => n + 1);
        setWrongOnCurrent((n) => n + 1);
        setFeedback({
          title: wrongTitle ?? (isFlag ? "That one was a RED FLAG" : "That one was actually fine"),
          explanation: popup.whyTrick,
          tip: wrongTip ?? hints?.tier1,
        });
      }
    },
    [popup, feedback, speaking, audio, fx, onAnswered, onCorrect, onWrong, wrongOnCurrent, flagToast, fineToast, wrongTitle, wrongTip, hints, intensity, advance],
  );

  /* ─── Finished ─── */
  if (phase === "finished") {
    const stars = wrongTotal === 0 ? 3 : wrongTotal <= 2 ? 2 : 1;
    return (
      <ExerciseFrame maxWidth={900} padding={28}>
        <ExerciseCompleteBeat
          title={completeTitle ?? (request ? "Every request judged!" : "All pop-ups closed!")}
          stars={stars}
          statLines={[
            request
              ? `${firstTryCount} of ${shownPopups.length} called right first try`
              : `${closedCount} of ${shownPopups.length} dismissed`,
            completeLine ??
              (wrongTotal === 0
                ? (request ? "Not one red flag slipped past you." : "Not once fooled by an OK button.")
                : `${wrongTotal} ${request ? "slip" : "OK-trap"}${wrongTotal === 1 ? "" : "s"} along the way.`),
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(closedCount)}
        />
      </ExerciseFrame>
    );
  }

  const verdictButtons = [
    { flag: false, label: fineLabel ?? "Fine. Friendly ask!", icon: "💬" },
    { flag: true, label: flagLabel ?? "Red flag! No way.", icon: "🚫" },
  ];
  const ordered = flip ? [verdictButtons[1], verdictButtons[0]] : verdictButtons;

  /* ─── Active ─── */

  return (
    <ExerciseFrame
      maxWidth={900}
      padding={24}
      background={request ? "linear-gradient(180deg, #14122b 0%, #221a3a 100%)" : "linear-gradient(180deg, #0f1530 0%, #1a0f2a 100%)"}
    >
      {/* Header / progress */}
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
            color: request ? "#f5a623" : "#ff9bcb",
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          {headerLabel ?? (request ? "🚩 Red-Flag Requests" : "⚠ Pop-up Panic")}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#cbd5e1",
          }}
        >
          {Math.min(popupIdx + 1, shownPopups.length)} / {shownPopups.length}
        </span>
      </div>

      <p
        role="status"
        style={{
          textAlign: "center",
          color: "#cbd5e1",
          fontSize: 14,
          marginTop: 0,
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        {boardPrompt ? (
          boardPrompt
        ) : request ? (
          <>
            Read what the new friend is asking. Then tap: <strong style={{ color: "#ffd58a" }}>red flag</strong>, or{" "}
            <strong style={{ color: "#ffd58a" }}>friendly ask</strong>?
          </>
        ) : (
          <>
            Scary pop-ups are trying to trick you. Find the{" "}
            <strong style={{ color: "#7eff97" }}>X</strong> on each one to close it.
          </>
        )}
      </p>

      {/* Hint area (always reserves space) */}
      <div style={{ minHeight: 56, marginBottom: 12 }}>
        {wrongOnCurrent > 0 && hints && (
          <HintBubble
            tier={(wrongOnCurrent >= 3 ? 3 : wrongOnCurrent === 2 ? 2 : 1) as 1 | 2 | 3}
            speaker={voice}
            text={
              wrongOnCurrent >= 3
                ? hints.tier3
                : wrongOnCurrent === 2
                  ? hints.tier2
                  : hints.tier1
            }
          />
        )}
      </div>

      {/* Sarah's read-aloud chain (request skin, audio only). */}
      {request && phase === "active" && popup && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="pp-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent="#f5a623" recordedOnly onDone={() => setNarr("body")} />
          )}
          {narr === "body" && (
            <InfoNarration key={`pp-body-${popup.id}`} speaker={voice} lines={[popup.body ?? popup.title]} accent="#f5a623" recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "why" && (
            <InfoNarration
              key={`pp-why-${popup.id}`}
              speaker={voice}
              lines={[popup.whyTrick]}
              accent="#f5a623"
              recordedOnly
              onDone={() => {
                setNarr("idle");
                window.setTimeout(advance, intensity === 0 ? 200 : 500);
              }}
            />
          )}
        </div>
      )}

      {/* Faux browser frame / chat frame containing the popup */}
      <div
        style={{
          position: "relative",
          background: "rgba(8, 10, 22, 0.7)",
          border: request ? "1px solid rgba(245, 166, 35, 0.3)" : "1px solid rgba(255, 95, 179, 0.25)",
          borderRadius: 14,
          padding: 24,
          minHeight: 320,
          overflow: "hidden",
        }}
      >
        {/* "Browser desktop" placeholder behind the popup */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 16,
            border: "1px dashed rgba(255, 255, 255, 0.08)",
            borderRadius: 10,
            opacity: 0.4,
          }}
        />

        <AnimatePresence mode="wait">
          {popup && !request && (
            <motion.div
              key={`popup-${popupRenderKey}`}
              initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: -10 }}
              animate={intensity === 0 ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
              transition={
                intensity === 0
                  ? { duration: 0.18 }
                  : { type: "spring", stiffness: 340, damping: 22 }
              }
              style={{
                position: "relative",
                margin: "0 auto",
                maxWidth: 460,
                background: "linear-gradient(180deg, rgba(255, 95, 179, 0.12), rgba(15, 21, 48, 0.95))",
                border: "2.5px solid #ff5fb3",
                borderRadius: 14,
                padding: "20px 22px 22px",
                boxShadow:
                  "0 18px 48px rgba(239, 68, 68, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.04) inset",
                color: "#fff7e6",
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                animation:
                  intensity === 0
                    ? undefined
                    : "popupShake 380ms cubic-bezier(0.36, 0.07, 0.19, 0.97) 80ms",
              }}
            >
              {/* The X (close) button - small but reachable. */}
              <button
                type="button"
                aria-label="Close popup"
                onClick={handleX}
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: "rgba(15, 21, 48, 0.6)",
                  border: "1.5px solid rgba(126, 255, 151, 0.5)",
                  color: "#7eff97",
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 900,
                  fontFamily: "system-ui",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  touchAction: "manipulation",
                }}
              >
                ×
              </button>

              <div
                style={{
                  fontSize: 36,
                  textAlign: "center",
                  lineHeight: 1,
                  marginBottom: 8,
                  animation:
                    intensity === 0
                      ? undefined
                      : "popupIconPulse 1.4s ease-in-out infinite",
                }}
              >
                {popup.icon ?? "⚠️"}
              </div>
              <h3
                style={{
                  margin: "0 0 8px",
                  textAlign: "center",
                  fontSize: 18,
                  fontWeight: 900,
                  letterSpacing: "0.02em",
                  color: "#ffd158",
                  lineHeight: 1.25,
                  textShadow: "0 0 14px rgba(255, 209, 88, 0.35)",
                }}
              >
                {popup.title}
              </h3>
              {popup.body && (
                <p
                  style={{
                    margin: "0 0 16px",
                    textAlign: "center",
                    fontSize: 13,
                    color: "#cbd5e1",
                    lineHeight: 1.5,
                  }}
                >
                  {popup.body}
                </p>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 8,
                }}
              >
                {/* The OK button - tempting and large. This is the trap. */}
                <GameButton
                  variant="danger"
                  size="lg"
                  onClick={handleOk}
                  style={{ minWidth: 180 }}
                >
                  OK
                </GameButton>
              </div>
            </motion.div>
          )}

          {popup && request && (
            <motion.div
              key={`request-${popupRenderKey}`}
              initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 14 }}
              animate={intensity === 0 ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              transition={
                intensity === 0
                  ? { duration: 0.18 }
                  : { type: "spring", stiffness: 300, damping: 24 }
              }
              style={{
                position: "relative",
                margin: "0 auto",
                maxWidth: 520,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              {/* The request card: who + message bubble */}
              <div
                style={{
                  background: "linear-gradient(180deg, #2a2452 0%, #1d1a3a 100%)",
                  border: "2px solid rgba(245,166,35,0.55)",
                  borderRadius: 18,
                  padding: "14px 16px 16px",
                  boxShadow: "0 18px 44px -22px rgba(245,166,35,0.6)",
                  color: "#fff7e6",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ display: "inline-flex", padding: 6, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.3)" }}>
                    <PixIcon emoji={popup.icon ?? "💬"} size={26} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 900 }}>{popup.from ?? "New friend"}</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#c9b8ff", letterSpacing: "0.05em" }}>{popup.title}</div>
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.08em", color: "#f5a623", padding: "3px 8px", borderRadius: 999, border: "1px solid rgba(245,166,35,0.45)", whiteSpace: "nowrap" }}>
                    NEW MESSAGE
                  </span>
                </div>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "rgba(255,255,255,0.1)",
                    border: "1.5px solid rgba(255,255,255,0.3)",
                    fontSize: 16.5,
                    fontWeight: 800,
                    lineHeight: 1.4,
                  }}
                >
                  {popup.body ?? popup.title}
                </div>
              </div>

              {/* Two IDENTICAL verdict buttons, sides swapped per request. */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
                {ordered.map((b) => (
                  <motion.button
                    key={b.flag ? "flag" : "fine"}
                    type="button"
                    onClick={() => judge(b.flag)}
                    onPointerEnter={() => audio.hover()}
                    disabled={!!feedback || speaking}
                    whileHover={intensity === 0 || speaking ? undefined : { y: -3 }}
                    whileTap={speaking ? undefined : { scale: 0.96 }}
                    style={{
                      padding: "16px 12px",
                      borderRadius: 14,
                      border: "2px solid rgba(245,166,35,0.55)",
                      background: "linear-gradient(165deg, rgba(245,166,35,0.14), rgba(12,18,48,0.92))",
                      color: "#ffe6bd",
                      fontSize: 14.5,
                      fontWeight: 900,
                      fontFamily: "inherit",
                      cursor: speaking ? "wait" : "pointer",
                      opacity: speaking ? 0.75 : 1,
                      touchAction: "manipulation",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <PixIcon emoji={b.icon} size={20} />
                    {b.label}
                  </motion.button>
                ))}
              </div>

              {/* Sarah's why, shown while she reads it (teach-on-correct stays visible). */}
              <AnimatePresence>
                {narr === "why" && (
                  <motion.div
                    key={`why-${popup.id}`}
                    role="status"
                    initial={intensity === 0 ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={intensity === 0 ? undefined : { opacity: 0, y: -6 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "rgba(15, 21, 48, 0.95)",
                      border: "2px solid #f5a623",
                      boxShadow: "0 0 16px rgba(245,166,35,0.35)",
                      color: "#fff7e6",
                      fontSize: 14,
                      lineHeight: 1.4,
                      fontWeight: 700,
                    }}
                  >
                    <PixIcon emoji="💡" size={24} />
                    <span>{popup.whyTrick}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 800, color: "#9fb1ff", letterSpacing: "0.1em" }}>
                REQUEST {Math.min(popupIdx + 1, shownPopups.length)} OF {shownPopups.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Intro beat */}
      {phase === "intro" && (
        <ExerciseIntroBeat
          title={introTitle ?? (request ? "Red-Flag Requests" : "Pop-up Panic")}
          subtitle={
            introSubtitle ??
            (request
              ? "A new friend keeps asking for things. Some asks are fine. Some are red flags. Judge every one."
              : "Close every fake pop-up by tapping its X. Don't tap OK - that's the trick.")
          }
          icon={introIcon ?? (request ? "🚫" : "⚠️")}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          overlay={request}
          onDismiss={() => setPhase("active")}
        />
      )}

      {/* Wrong-answer panel */}
      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker={request ? voice : "layla"}
          onContinue={() => setFeedback(null)}
        />
      )}

      {fx.layer()}

      <style>{`
        @keyframes popupShake {
          0%   { transform: translate(0, 0) }
          15%  { transform: translate(-3px, 1px) }
          30%  { transform: translate(3px, -1px) }
          45%  { transform: translate(-2px, 1px) }
          60%  { transform: translate(2px, 0) }
          75%  { transform: translate(-1px, 0) }
          100% { transform: translate(0, 0) }
        }
        @keyframes popupIconPulse {
          0%,100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255, 95, 179, 0)) }
          50%     { transform: scale(1.08); filter: drop-shadow(0 0 12px rgba(255, 95, 179, 0.6)) }
        }
      `}</style>
    </ExerciseFrame>
  );
}
