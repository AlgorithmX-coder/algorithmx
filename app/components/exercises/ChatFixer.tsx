"use client";

/**
 * ChatFixer — the SWAP drill (Week 6, "The Chat Fixer").
 *
 * A neon game-chat window. The child's outgoing message sits in the composer
 * as a row of word tiles above a SEND button. Most messages are pure game talk;
 * some carry ONE word that gives something private away (a real name, a
 * school, a street, an age). The child taps the leaky word, picks a safe swap
 * from three chips, then taps SEND. A clean message is sent as it is: knowing
 * when NOTHING needs fixing is half the skill.
 *
 * Why it is not the inspectors or the stampers (owner: "we never copy an
 * exercise"): the verb is SWAP. Nothing is judged real/fake and nothing is
 * marked; the child EDITS their own words and the send is the commit.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every message read aloud as it arrives (audio-only, `recordedOnly`, taps
 * held), a spoken verdict on every send (right: "That's right!" + why in one
 * take via VerdictVoice; wrong: WrongAnswerPanel speaks "Not quite." + the
 * teach line), hint tiers per message, a spoken payoff on the complete beat,
 * messages shuffled per play, chips shuffled per message. Round 1 teaches
 * itself: the leaky word (or SEND, on a clean first message) breathes until
 * tapped. Tap-only, no timer, no lose state. Every tile and every chip wears
 * the same paint: no colour, icon, side or order hints at the answer.
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
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as ClueStamper / NameTagCheck.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface ChatFixerChip {
  text: string;
  isSafe: boolean;
  /** Sarah's teach line when this chip is picked (unsafe chips only). */
  whyWrong: string;
}

export interface ChatFixerMessage {
  id: string;
  /** The outgoing message, one word (or short phrase) per tile. */
  tiles: string[];
  /** Index of the tile that gives something away. Omit for a clean message. */
  leakIndex?: number;
  /** Sarah's read-aloud as the message lands in the composer. */
  readAloud: string;
  /** Three swaps for the leaky tile, exactly one `isSafe`. Required when
   *  `leakIndex` is set. */
  chips?: ChatFixerChip[];
  /** Sarah's reason on a correct send ("That's right!" + why). */
  why: string;
  /** Sarah's teach line on a wrong send (the leak still in). */
  whyWrong: string;
}

export interface ChatFixerProps {
  messages: ChatFixerMessage[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Title bar of the chat window. Default "Game chat". */
  chatTitle?: string;
  /** Text on the commit button. Default "SEND". */
  sendLabel?: string;
  /** The on-board instruction under the composer. */
  tileHint?: string;
  /** fx.correct toasts. */
  cleanToast?: string;
  fixedToast?: string;
  /** WrongAnswerPanel title. */
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
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
  onAnswered?: (o: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const EMPTY_CHIPS: ChatFixerChip[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

export default function ChatFixer({
  messages,
  introTitle = "The Chat Fixer",
  introSubtitle = "Tap the word that gives something away, swap it, then send.",
  introIcon = "💬",
  chatTitle = "Game chat",
  sendLabel = "SEND",
  tileHint = "Tap the word that gives something away, or SEND if it is all game talk",
  cleanToast = "CLEAN! SENT.",
  fixedToast = "FIXED! SENT.",
  wrongTitle = "Hold on, that leaks",
  completeTitle = "Every message sent safely!",
  completeLine = "Game talk only. Nothing private got out.",
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
}: ChatFixerProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#38e1ff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Read-aloud chain: the how-to once as the board appears, then each message
  // as it arrives. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "sealed" = a correct send: the message lifts off while Sarah says why,
  // then the next one lands in the composer.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  const [chipsOpen, setChipsOpen] = useState(false);
  // The safe swap now sitting on the leaky tile (null = untouched).
  const [swapped, setSwapped] = useState<string | null>(null);
  const [wobble, setWobble] = useState<{ i: number; n: number } | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [msgWrongs, setMsgWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [guidedTaps, setGuidedTaps] = useState(0);
  // The last messages that went out, shown as sent bubbles above the composer.
  const [log, setLog] = useState<string[]>([]);
  const wobbleSeq = useRef(0);

  // Anti-sequence: messages come up in a random order every play; the three
  // chips are shuffled per message so the safe swap is never in one slot.
  const shown = useShuffledOnce(messages);
  const finished = idx >= shown.length;
  const c = shown[idx];
  const chips = useShuffledOnce(c?.chips ?? EMPTY_CHIPS, { key: c?.id ?? "done" });
  const leakAt =
    c && c.leakIndex !== undefined && c.leakIndex >= 0 && c.leakIndex < c.tiles.length ? c.leakIndex : null;
  const hasLeak = leakAt !== null;
  // Round 1 teaches itself: the leaky word (or SEND, on a clean message)
  // breathes until the child has made that first tap.
  const guided = idx === 0 && guidedTaps === 0;

  // Spoken verdicts: Sarah says "That's right!" + why and the next message
  // waits for her. Wrong sends speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || phase === "sealed";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // A wobble is a one-shot: clear it once played so the next tap re-triggers.
  useEffect(() => {
    if (!wobble) return;
    const id = window.setTimeout(() => setWobble(null), 450);
    return () => window.clearTimeout(id);
  }, [wobble]);

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
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    if (c) {
      const sent = c.tiles.map((t, i) => (i === leakAt && swapped !== null ? swapped : t)).join(" ");
      setLog((l) => [...l, sent].slice(-2));
    }
    setIdx((i) => i + 1);
    setSwapped(null);
    setChipsOpen(false);
    setMsgWrongs(0);
    setWobble(null);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const tapTile = (i: number) => {
    if (!c || speaking) return;
    if (i === leakAt) {
      audio.tap();
      setGuidedTaps((n) => (n === 0 ? 1 : n));
      setChipsOpen((o) => !o);
    } else {
      // A word that is fine just wobbles: no penalty, no teach.
      audio.hover();
      wobbleSeq.current += 1;
      setWobble({ i, n: wobbleSeq.current });
    }
  };

  const tapChip = (chip: ChatFixerChip) => {
    if (!c || speaking) return;
    onAnswered?.({
      questionKey: `chip-${c.id}`,
      selectedIndex: chips.indexOf(chip),
      correctIndex: chips.findIndex((k) => k.isSafe),
      wasCorrect: chip.isSafe,
    });
    if (chip.isSafe) {
      audio.heal();
      setSwapped(chip.text);
      setChipsOpen(false);
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      setMsgWrongs((n) => n + 1);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the
      // chips stay open so the retry is one tap.
      setFeedback({ title: wrongTitle, explanation: chip.whyWrong, tip: hints?.tier1 });
    }
  };

  const send = () => {
    if (!c || speaking) return;
    const right = hasLeak ? swapped !== null : swapped === null;
    onAnswered?.({
      questionKey: `send-${c.id}`,
      selectedIndex: swapped !== null ? 1 : 0,
      correctIndex: hasLeak ? 1 : 0,
      wasCorrect: right,
    });
    if (right) {
      fx.correct({ xp: 25, text: hasLeak ? fixedToast : cleanToast });
      onCorrect?.();
      setGuidedTaps((n) => (n === 0 ? 1 : n));
      setChipsOpen(false);
      setPhase("sealed");
      // Sarah: "That's right!" + the message's why; the bubble lifts off under
      // her, then the next message lands.
      verdict.say("right", c.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const mw = msgWrongs + 1;
      setMsgWrongs(mw);
      setFeedback({ title: wrongTitle, explanation: c.whyWrong, tip: mw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = msgWrongs >= 2 ? hints?.tier2 : msgWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (msgWrongs >= 2 ? 2 : 1) as 1 | 2;
  const sendGlow = guided && !hasLeak && !speaking;
  const strip = guided
    ? hasLeak
      ? "Round 1: tap the glowing word, it gives something away"
      : `Round 1: this one is all game talk. Tap ${sendLabel}`
    : chipsOpen
      ? "Pick the safe swap"
      : tileHint;

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

      {/* Sarah's read-alouds (audio only): the how-to once, then each message. */}
      {!showIntro && !finished && c && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="cf-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`cf-read-${c.id}`} speaker={voice} lines={[c.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && c && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              💬 {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Message {Math.min(idx + 1, shown.length)} of {shown.length}
            </span>
          </div>

          {/* The chat window */}
          <div
            style={{
              margin: "0 14px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(10,12,34,0.94) 0%, rgba(16,10,40,0.96) 100%)",
              border: `1px solid ${accent}66`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), 0 0 28px ${accent}22`,
              overflow: "hidden",
              color: "#fff7e6",
            }}
          >
            {/* Title bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: `${accent}14`, borderBottom: `1px solid ${accent}33` }}>
              <span aria-hidden style={{ display: "inline-flex", gap: 5 }}>
                {["#ff5fb3", "#ffd166", "#7eff97"].map((h) => (
                  <span key={h} style={{ width: 9, height: 9, borderRadius: "50%", background: h, boxShadow: `0 0 8px ${h}` }} />
                ))}
              </span>
              <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: accent }}>
                {chatTitle}
              </span>
            </div>

            {/* Sent bubbles: the last messages that went out. */}
            <div style={{ padding: "12px 14px 4px", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", minHeight: 44 }}>
              {log.length === 0 && (
                <span style={{ alignSelf: "center", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255,247,230,0.35)" }}>
                  Your team is waiting
                </span>
              )}
              {log.map((line, i) => (
                <div
                  key={`${i}-${line}`}
                  style={{
                    maxWidth: "80%",
                    padding: "6px 12px",
                    borderRadius: "14px 14px 4px 14px",
                    background: `${accent}22`,
                    border: `1px solid ${accent}44`,
                    fontSize: 13,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: "rgba(255,247,230,0.8)",
                    fontFamily: KID_FONT,
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* The composer: the child's own message as word tiles. */}
            <motion.div
              animate={phase === "sealed" && !reduce ? { y: -16, opacity: 0.4, scale: 0.98 } : { y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 240, damping: 20 }}
              style={{
                position: "relative",
                margin: "8px 14px 14px",
                padding: "12px 12px 14px",
                borderRadius: 14,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <div style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,247,230,0.55)", marginBottom: 8 }}>
                Your message
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                {c.tiles.map((t, i) => {
                  const isLeak = i === leakAt;
                  const on = isLeak && swapped !== null;
                  const glow = guided && isLeak && !on && !speaking;
                  const isWobbling = wobble?.i === i;
                  return (
                    <motion.button
                      key={`${c.id}-${i}`}
                      type="button"
                      aria-label={`Word: ${on ? swapped : t}${on ? ", swapped" : ""}`}
                      aria-pressed={isLeak && chipsOpen}
                      onClick={() => tapTile(i)}
                      disabled={speaking}
                      animate={
                        isWobbling && !reduce
                          ? { x: [0, -7, 7, -5, 5, 0], scale: 1 }
                          : glow && !reduce
                            ? { x: 0, scale: [1, 1.06, 1] }
                            : { x: 0, scale: 1 }
                      }
                      transition={glow && !isWobbling && !reduce ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.4 }}
                      whileTap={speaking || reduce ? undefined : { scale: 0.96 }}
                      style={{
                        position: "relative",
                        minHeight: 48,
                        padding: "10px 14px",
                        borderRadius: 12,
                        // Every tile the same paint on every message: nothing
                        // here can hint at the answer. Only the child's own swap
                        // (and the round-1 guide) lights one up.
                        background: on ? `${accent}26` : "rgba(255,255,255,0.08)",
                        border: `2px solid ${on || glow ? accent : "rgba(255,255,255,0.2)"}`,
                        boxShadow: glow ? `0 0 0 4px ${accent}55, 0 0 22px ${accent}99` : on ? `0 0 14px ${accent}66` : "none",
                        color: "#fff7e6",
                        fontFamily: KID_FONT,
                        fontSize: 17,
                        fontWeight: 800,
                        lineHeight: 1.2,
                        cursor: speaking ? "wait" : "pointer",
                      }}
                    >
                      {on ? swapped : t}
                    </motion.button>
                  );
                })}
              </div>

              {/* The three swaps, identical chips, shuffled per message. */}
              <AnimatePresence>
                {chipsOpen && leakAt !== null && (
                  <motion.div
                    key="chips"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.2 }}
                    style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed rgba(255,255,255,0.15)" }}
                  >
                    <div style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: accent, marginBottom: 8, textAlign: "center" }}>
                      Swap &ldquo;{c.tiles[leakAt]}&rdquo; for
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                      {chips.map((k) => (
                        <motion.button
                          key={k.text}
                          type="button"
                          aria-label={`Swap for: ${k.text}`}
                          onClick={() => tapChip(k)}
                          disabled={speaking}
                          whileTap={speaking || reduce ? undefined : { scale: 0.96 }}
                          style={{
                            minHeight: 44,
                            padding: "8px 16px",
                            borderRadius: 999,
                            background: "rgba(255,255,255,0.1)",
                            border: "2px solid rgba(255,255,255,0.24)",
                            color: "#fff7e6",
                            fontFamily: KID_FONT,
                            fontSize: 15,
                            fontWeight: 800,
                            cursor: speaking ? "wait" : "pointer",
                          }}
                        >
                          {k.text}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* The SENT seal lands only after a correct send. */}
              <AnimatePresence>
                {phase === "sealed" && (
                  <motion.div
                    key="seal"
                    initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -14 }}
                    animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -6 }}
                    exit={{ opacity: 0, x: "-50%" }}
                    transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      marginTop: -22,
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: "4px double #7eff97",
                      color: "#a0ffb0",
                      background: "rgba(8,10,22,0.82)",
                      fontFamily: LABEL_FONT,
                      fontWeight: 900,
                      fontSize: 18,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      boxShadow: "0 0 18px rgba(126,255,151,0.5)",
                      zIndex: 3,
                    }}
                  >
                    ✅ {hasLeak ? "Fixed and sent" : "Sent"}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* On-board instructions + the one commit button. */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, marginBottom: 10, padding: "0 16px" }}>
              {strip}
            </div>
            <motion.div
              animate={sendGlow && !reduce ? { scale: [1, 1.05, 1] } : { scale: 1 }}
              transition={sendGlow && !reduce ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
              style={{ display: "inline-block", borderRadius: 14, boxShadow: sendGlow ? `0 0 0 5px ${accent}55, 0 0 26px ${accent}99` : undefined }}
            >
              <GameButton variant="primary" size="lg" icon="🚀" onClick={send} disabled={speaking}>
                {sendLabel}
              </GameButton>
            </motion.div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>
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

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[`${shown.length} message${shown.length === 1 ? "" : "s"} sent safely`, completeLine]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
