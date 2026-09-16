"use client";

/**
 * NameTagCheck — the MARK drill (Week 4, "The Name Tag Check").
 *
 * The REAL sender's name tag sits on top, the sender to check hangs under it,
 * both split into the same aligned pieces (the name, the address, the ending).
 * The child compares piece by piece and taps any piece on the bottom tag that
 * does not match the one above it, marking it SWAPPED (tap again to lift), then
 * taps CLOSE THE BOOTH to commit the whole set. Zero marks is legal and
 * sometimes right: one of the cases IS the real sender. The verdict (real /
 * copycat) is never picked by the child; it is derived from the marks, so the
 * child sees that the pieces decide it.
 *
 * Why it is not the Clue Stamper (owner: "we never copy an exercise"): the
 * evidence is a side-by-side COMPARISON against a reference tag, not four
 * questions with answers; the pieces are letters and words the child must read
 * character by character (a 1 for an l, a 0 for an O), and the number of pieces
 * varies per case. No colour, icon, side, order or count hints at the answer
 * before the lock, and text is never upper-cased by CSS (that would hide the
 * very swaps the game teaches).
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and each case read aloud as it arrives (audio-only, `recordedOnly`, taps
 * held; the read never spells an address), a spoken verdict on every lock
 * (right: "That's right!" + rightWhy; wrong: WrongAnswerPanel speaks "Not
 * quite." + the first mismarked piece's teach and the marks are kept so the
 * retry is a one-piece fix), hint tiers per case (tier 3 flips the piece),
 * spoken payoff on the complete beat, cases shuffled per play.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonWeek } from "@/app/components/lesson/LessonWeekContext";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import { weekCharacterSrc, fallbackToShared } from "@/app/lib/weekCharacters";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";

const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
const SPOKEN_GATE_MAX_MS = 15000;

export interface NameTagChunk {
  text: string;
  isWrong: boolean;
  teach: string;
}

export interface NameTagCase {
  id: string;
  realChunks: string[];
  chunks: NameTagChunk[];
  readAloud: string;
  rightWhy: string;
}

export interface NameTagCheckProps {
  cases: NameTagCase[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  stampLabel?: string;
  closeLabel?: string;
  realSeal?: string;
  fakeSeal?: string;
  realToast?: string;
  fakeToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string; tier3?: string };
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

const DEFAULT_TIER3 = "Let me help. I fixed that one piece for you. Now close the booth.";
const mask = (idx: Iterable<number>) => { let m = 0; for (const i of idx) m |= 1 << i; return m; };
// Letters the copycats swap most: shown in a font where the swap is legible.
const TAG_FONT = "'JetBrains Mono', 'Cascadia Mono', ui-monospace, Menlo, monospace";

export default function NameTagCheck({
  cases,
  introTitle = "The Name Tag Check",
  introSubtitle = "The real sender's tag is on top. Mark every piece underneath that doesn't match, then close the booth.",
  introIcon = "🔍",
  stampLabel = "SWAPPED!",
  closeLabel = "CLOSE THE BOOTH",
  realSeal = "REAL SENDER",
  fakeSeal = "COPYCAT!",
  realToast = "BOOTH CLOSED: REAL SENDER!",
  fakeToast = "BOOTH CLOSED: COPYCAT!",
  wrongTitle = "Compare the pieces again!",
  completeTitle = "Every tag checked!",
  completeLine = "Copycats caught, real senders welcomed.",
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
}: NameTagCheckProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const week = useLessonWeek();
  const accent = useLessonTheme()?.accent ?? "#e84dff";
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [marked, setMarked] = useState<Set<number>>(() => new Set());
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [caseWrongs, setCaseWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [copycatsCaught, setCopycatsCaught] = useState(0);
  const [pendingFix, setPendingFix] = useState<number | null>(null);
  const [wobble, setWobble] = useState<{ i: number; key: number } | null>(null);

  const shown = useShuffledOnce(cases);
  const finished = idx >= shown.length;
  const c = shown[idx];
  const wantIdx = useMemo(() => new Set((c?.chunks ?? []).map((ch, i) => (ch.isWrong ? i : -1)).filter((i) => i >= 0)), [c]);
  const isCopycat = wantIdx.size > 0;

  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || phase === "sealed";

  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

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
    setIdx((i) => i + 1);
    setMarked(new Set());
    setCaseWrongs(0);
    setPendingFix(null);
    setWobble(null);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const toggle = (i: number) => {
    if (!c || speaking) return;
    audio.tap();
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
    if (i === pendingFix) setPendingFix(null);
  };

  const closeBooth = () => {
    if (!c || speaking) return;
    const match = marked.size === wantIdx.size && [...marked].every((i) => wantIdx.has(i));
    onAnswered?.({ questionKey: `tag-${c.id}`, selectedIndex: mask(marked), correctIndex: mask(wantIdx), wasCorrect: match });
    if (match) {
      audio.correct();
      fx.correct({ xp: 25, text: isCopycat ? fakeToast : realToast });
      onCorrect?.();
      if (isCopycat) setCopycatsCaught((n) => n + 1);
      setPhase("sealed");
      verdict.say("right", c.rightWhy, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const cw = caseWrongs + 1;
      setCaseWrongs(cw);
      // The first mismarked piece, left to right: a swapped piece left clean, or a matching piece marked.
      const mis = c.chunks.findIndex((ch, i) => marked.has(i) !== ch.isWrong);
      setPendingFix(mis >= 0 ? mis : null);
      const tip = cw >= 3 ? (hints?.tier3 ?? DEFAULT_TIER3) : cw === 2 ? hints?.tier2 : hints?.tier1;
      setFeedback({ title: wrongTitle, explanation: mis >= 0 ? c.chunks[mis].teach : "", tip });
    }
  };

  const closePanel = () => {
    setFeedback(null);
    if (pendingFix === null) return;
    if (caseWrongs >= 3) {
      const fix = pendingFix;
      setMarked((prev) => {
        const next = new Set(prev);
        if (next.has(fix)) next.delete(fix);
        else next.add(fix);
        return next;
      });
      setPendingFix(null);
      onHintReached?.(3);
    } else if (caseWrongs >= 2) {
      setWobble({ i: pendingFix, key: Date.now() });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = caseWrongs >= 3 ? (hints?.tier3 ?? DEFAULT_TIER3) : caseWrongs === 2 ? hints?.tier2 : caseWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (caseWrongs >= 3 ? 3 : caseWrongs === 2 ? 2 : 1) as 1 | 2 | 3;

  const tagShell = (top: boolean) => ({
    position: "relative" as const,
    borderRadius: 16,
    background: top ? "linear-gradient(180deg, #ffe9a8 0%, #f5c96b 100%)" : "linear-gradient(180deg, #fffaf0 0%, #f1e4cf 100%)",
    border: `2px solid ${top ? "#c99a4a" : "rgba(138,90,18,0.4)"}`,
    boxShadow: "0 14px 30px -18px rgba(0,0,0,0.7)",
    padding: "12px 14px 14px",
  });

  return (
    <ExerciseFrame maxWidth={820} decor>
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

      {!showIntro && !finished && c && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="nt-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`nt-read-${c.id}`} speaker={voice} lines={[c.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && c && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              🔍 Name Tag Check
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Tag {Math.min(idx + 1, shown.length)} of {shown.length}
            </span>
          </div>

          {/* The REAL tag: a reference, never tappable. */}
          <div style={tagShell(true)}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8a5a12", marginBottom: 8 }}>
              ✅ The real sender
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${c.realChunks.length}, minmax(0, 1fr))`, gap: 8 }}>
              {c.realChunks.map((t, i) => (
                <div key={i} style={{ borderRadius: 10, background: "rgba(255,255,255,0.55)", border: "2px solid rgba(138,90,18,0.25)", padding: "10px 8px", textAlign: "center", fontFamily: TAG_FONT, fontSize: 15, fontWeight: 700, color: "#2a1a08", wordBreak: "break-word", lineHeight: 1.25 }}>
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div aria-hidden style={{ textAlign: "center", color: accent, fontSize: 20, lineHeight: 1, margin: "6px 0" }}>⇣ compare ⇣</div>

          {/* The tag to check: identical pieces, tappable, nothing pre-marked. */}
          <div style={tagShell(false)}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8a5a12", marginBottom: 8 }}>
              ❓ The sender to check
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${c.chunks.length}, minmax(0, 1fr))`, gap: 8 }}>
              {c.chunks.map((ch, i) => {
                const on = marked.has(i);
                const sealed = phase === "sealed";
                const isWobbling = wobble?.i === i;
                return (
                  <motion.button
                    key={i}
                    type="button"
                    aria-label={`Piece: ${ch.text}${on ? `, marked ${stampLabel}` : ""}`}
                    aria-pressed={on}
                    onClick={() => toggle(i)}
                    disabled={speaking}
                    animate={isWobbling && !reduce ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
                    style={{
                      position: "relative",
                      borderRadius: 10,
                      // Every piece the same paper and ink on every case.
                      background: "#ffffff",
                      border: "2px solid rgba(138,90,18,0.35)",
                      padding: "10px 8px",
                      minHeight: 58,
                      textAlign: "center",
                      fontFamily: TAG_FONT,
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#2a1a08",
                      wordBreak: "break-word",
                      lineHeight: 1.25,
                      cursor: speaking ? "wait" : "pointer",
                      overflow: "hidden",
                    }}
                  >
                    {ch.text}
                    {sealed && <span aria-hidden style={{ position: "absolute", top: 4, right: 6, fontSize: 14 }}>{ch.isWrong ? "🐾" : "✅"}</span>}
                    <AnimatePresence>
                      {on && (
                        <motion.span
                          key="mark"
                          aria-hidden
                          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.6, rotate: -14 }}
                          animate={{ opacity: 1, scale: 1, rotate: -8 }}
                          exit={{ opacity: 0, transition: { duration: 0.12 } }}
                          transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 16 }}
                          style={{
                            position: "absolute",
                            left: "50%",
                            top: "50%",
                            x: "-50%",
                            y: "-50%",
                            padding: "3px 8px",
                            border: "3px solid #d5262e",
                            borderRadius: 6,
                            color: "#d5262e",
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 900,
                            fontSize: 13,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            background: "rgba(255,255,255,0.7)",
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {stampLabel}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>

            {/* The verdict seal lands only after a correct lock; the Raccoon pops out of a copycat. */}
            <AnimatePresence>
              {phase === "sealed" && (
                <motion.div
                  key="seal"
                  initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -20 }}
                  animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -6 }}
                  exit={{ opacity: 0, x: "-50%" }}
                  transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: -14,
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: `4px double ${isCopycat ? "#ff5fb3" : "#34d399"}`,
                    color: isCopycat ? "#d5262e" : "#137a45",
                    background: "rgba(255,255,255,0.9)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 900,
                    fontSize: 16,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    zIndex: 3,
                  }}
                >
                  {isCopycat ? "🐾 " : "✅ "}
                  {isCopycat ? fakeSeal : realSeal}
                </motion.div>
              )}
              {phase === "sealed" && isCopycat && (
                <motion.img
                  key="raccoon"
                  src={weekCharacterSrc(week ?? undefined, "raccoon", "taunt")}
                  onError={fallbackToShared("raccoon", "taunt")}
                  alt=""
                  aria-hidden
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 30 }}
                  animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  style={{ position: "absolute", right: -10, top: -40, height: 110, objectFit: "contain", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.6))", pointerEvents: "none", zIndex: 3 }}
                />
              )}
            </AnimatePresence>
          </div>

          <div style={{ textAlign: "center", marginTop: 22 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, marginBottom: 10 }}>
              Compare each piece with the one above · tap a piece that doesn&apos;t match · tap again to lift · then close the booth
            </div>
            <GameButton variant="primary" size="lg" icon="🎪" onClick={closeBooth} disabled={speaking}>
              {closeLabel}
            </GameButton>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>
        </div>
      )}

      {feedback && (
        <WrongAnswerPanel title={feedback.title} explanation={feedback.explanation} tip={feedback.tip} onContinue={closePanel} />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[`${shown.length}/${shown.length} tags checked`, `${copycatsCaught} copycat${copycatsCaught === 1 ? "" : "s"} caught`, completeLine]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
