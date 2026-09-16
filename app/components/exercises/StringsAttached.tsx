"use client";

/**
 * StringsAttached — the CONNECT drill (Week 4, "Strings Attached").
 *
 * Three prize balloons float over a carnival counter, each on a string. Four
 * tokens sit on the counter: your password, your money, your tap, and nothing.
 * The child taps a balloon (Sarah reads its offer), then taps the token its
 * string really leads to. The string snaps taut to the token: right, and a
 * scam balloon pops to show the Raccoon's paw print behind the prize, while a
 * fair offer floats on with a green ribbon; wrong, and the string snaps back
 * while Sarah teaches, the balloon staying selected so the retry is one tap.
 *
 * Why it is not a select drill (owner: "we never copy an exercise"): the answer
 * is a two-tap LINK between two things on the board, every balloon and every
 * token are visible together, tokens are reused across balloons (two scams can
 * both want money), the child chooses which balloon to work on, and the board
 * accumulates strings. Nothing in the library connects things.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the intro (`threat`), Sarah
 * speaks the how-to once as the board appears and reads each offer as its
 * balloon is tapped (audio-only, `recordedOnly`, taps held), every connection
 * gets a spoken one-take verdict (right: "That's right!" + why; wrong: "Not
 * quite." + nudge), round 1 glows the first balloon with a one-line strip,
 * hint tiers escalate per board, and the complete beat speaks the payoff.
 * Boards are dealt so each holds at least one fair offer (so "everything is a
 * scam" never wins), then shuffled per play; icons are uniform (no giveaway).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";

const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;

// A held gate can never stick (see ClueStamper).
const SPOKEN_GATE_MAX_MS = 15000;
const PER_BOARD = 3;

export type StringsWant = "password" | "money" | "tap" | "nothing";

export interface StringsOffer {
  id: string;
  text: string;
  readAloud: string;
  wants: StringsWant;
  why: string;
  nudge: string;
}

export interface StringsAttachedProps {
  offers: StringsOffer[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  tokenLabels?: Partial<Record<StringsWant, string>>;
  scamToast?: string;
  fairToast?: string;
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

/** The four counter tokens: fixed order and icons on every board (not content). */
const TOKENS: { id: StringsWant; icon: string; label: string }[] = [
  { id: "password", icon: "🔑", label: "Your password" },
  { id: "money", icon: "💰", label: "Your money" },
  { id: "tap", icon: "👆", label: "Your tap" },
  { id: "nothing", icon: "✅", label: "Nothing, it's real" },
];
const TOKEN_INDEX: Record<StringsWant, number> = { password: 0, money: 1, tap: 2, nothing: 3 };

// Board geometry in percent (the string overlay is a 0-100 viewBox).
const BOARD_H = 400;
const BALLOON_TOP = 4;
const BALLOON_H = 44; // % of board height
const TOKEN_TOP = 74;
const balloonX = (i: number, n: number) => ((i + 0.5) / n) * 100;
const tokenX = (j: number) => ((j + 0.5) / TOKENS.length) * 100;

/** Deal boards of three with at least one fair offer on each. The two pools
 *  arrive already shuffled (useShuffledOnce, once per play, hydration-safe),
 *  so the fair offer's slot rotates per board and the scams fill the rest:
 *  random every play, never the authored order, and never a board of only
 *  scams. Falls back to plain chunks when the mix can't be met. */
function dealBoards(fair: StringsOffer[], scams: StringsOffer[], total: number): StringsOffer[][] {
  const boardCount = Math.ceil(total / PER_BOARD);
  if (fair.length < boardCount || fair.length + scams.length !== total) {
    const all = [...fair, ...scams];
    return Array.from({ length: boardCount }, (_, b) => all.slice(b * PER_BOARD, (b + 1) * PER_BOARD));
  }
  const boards: StringsOffer[][] = Array.from({ length: boardCount }, () => []);
  fair.forEach((o, i) => boards[i % boardCount].push(o));
  let b = 0;
  for (const s of scams) {
    while (boards[b].length >= PER_BOARD) b = (b + 1) % boardCount;
    boards[b].push(s);
    b = (b + 1) % boardCount;
  }
  // Rotate each board so the fair offer is not always first (its position
  // follows the shuffled pool order, so it differs per play).
  return boards.map((board, i) => {
    const k = (fair[i]?.id.length ?? i) % Math.max(1, board.length);
    return [...board.slice(k), ...board.slice(0, k)];
  });
}

export default function StringsAttached({
  offers,
  introTitle = "Strings Attached",
  introSubtitle = "Every prize has a string. Follow it to what the offer really wants.",
  introIcon = "🎈",
  tokenLabels,
  scamToast = "STRING FOLLOWED: A TRICK!",
  fairToast = "NO STRINGS: A REAL ONE!",
  completeTitle = "Every string followed!",
  completeLine = "You saw what each prize really wanted.",
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
}: StringsAttachedProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#e84dff";
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  // Anti-sequence: both pools shuffle once per play (after mount, so a
  // ?screen= deep-link's server render matches), then the boards are dealt
  // from them with at least one fair offer each.
  const fairPool = useShuffledOnce(useMemo(() => offers.filter((o) => o.wants === "nothing"), [offers]));
  const scamPool = useShuffledOnce(useMemo(() => offers.filter((o) => o.wants !== "nothing"), [offers]));
  const boards = useMemo(() => dealBoards(fairPool, scamPool, offers.length), [fairPool, scamPool, offers.length]);
  const [boardIdx, setBoardIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  // Strings the child has drawn: balloon id -> token. Right ones stay, a wrong
  // one is shown taut while Sarah teaches, then snaps back.
  const [strings, setStrings] = useState<Record<string, StringsWant>>({});
  const [done, setDone] = useState<Record<string, "scam" | "fair">>({});
  const [pendingWrong, setPendingWrong] = useState<string | null>(null);
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [readId, setReadId] = useState<string | null>(null);
  const [boardWrongs, setBoardWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [scamsExposed, setScamsExposed] = useState(0);
  const [fairKept, setFairKept] = useState(0);
  const [guidedTaps, setGuidedTaps] = useState(0);

  const board = boards[boardIdx];
  const finished = boardIdx >= boards.length;
  const boardDone = !!board && board.every((o) => done[o.id]);
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking;
  // Round 1 teaches itself: the first balloon glows until the child has made
  // the two taps once.
  const guided = boardIdx === 0 && guidedTaps < 2;

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

  // A finished board gets its breath, then the next one floats in.
  useEffect(() => {
    if (!boardDone || speaking) return;
    const id = window.setTimeout(() => {
      setBoardIdx((i) => i + 1);
      setSelected(null);
      setStrings({});
      setDone({});
      setBoardWrongs(0);
    }, reduce ? 300 : 1100);
    return () => window.clearTimeout(id);
  }, [boardDone, speaking, reduce]);

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "idle");
  };

  const tapBalloon = (o: StringsOffer) => {
    if (speaking || done[o.id]) return;
    audio.select();
    setSelected(o.id);
    setGuidedTaps((n) => (n === 0 ? 1 : n));
    if (!isAudioMuted()) {
      setReadId(o.id);
      setNarr("read");
    }
  };

  const tapToken = (t: StringsWant) => {
    if (speaking || !selected || !board) return;
    const o = board.find((x) => x.id === selected);
    if (!o || done[o.id]) return;
    const right = o.wants === t;
    setGuidedTaps(2);
    setStrings((s) => ({ ...s, [o.id]: t }));
    onAnswered?.({ questionKey: `strings-${o.id}`, selectedIndex: TOKEN_INDEX[t], correctIndex: TOKEN_INDEX[o.wants], wasCorrect: right });
    if (right) {
      audio.correct();
      const fair = o.wants === "nothing";
      fx.correct({ xp: 20, text: fair ? fairToast : scamToast });
      onCorrect?.();
      if (fair) setFairKept((n) => n + 1);
      else setScamsExposed((n) => n + 1);
      setDone((d) => ({ ...d, [o.id]: fair ? "fair" : "scam" }));
      setSelected(null);
      verdict.say("right", o.why);
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      setBoardWrongs((n) => n + 1);
      setPendingWrong(o.id);
      // The wrong string stays taut while Sarah teaches, then snaps back; the
      // balloon stays selected so the retry is one tap on a token.
      verdict.say("wrong", o.nudge, () => {
        setStrings((s) => {
          const next = { ...s };
          delete next[o.id];
          return next;
        });
        setPendingWrong(null);
      });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = boardWrongs >= 2 ? hints?.tier2 : boardWrongs === 1 ? hints?.tier1 : undefined;
  const selectedOffer = board?.find((o) => o.id === selected) ?? null;
  const readOffer = useMemo(() => offers.find((o) => o.id === readId) ?? null, [offers, readId]);

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

      {/* Sarah's read-alouds (audio only): the how-to once, then each tapped balloon. */}
      {!showIntro && !finished && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="sa-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && readOffer && (
            <InfoNarration key={`sa-read-${readOffer.id}`} speaker={voice} lines={[readOffer.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && board && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Board counter */}
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              🎈 Strings Attached
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Board {Math.min(boardIdx + 1, boards.length)} of {boards.length}
            </span>
          </div>

          {/* The board: balloons above, strings between, the counter below. */}
          <div
            style={{
              position: "relative",
              height: BOARD_H,
              borderRadius: 20,
              overflow: "hidden",
              background: "linear-gradient(180deg, rgba(60,10,51,0.85) 0%, rgba(30,5,25,0.92) 70%, rgba(90,40,20,0.9) 70.5%, rgba(60,26,12,0.95) 100%)",
              border: `1px solid ${accent}55`,
              boxShadow: "0 18px 40px -22px rgba(0,0,0,0.7)",
            }}
          >
            {/* Strings */}
            <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }}>
              {board.map((o, i) => {
                const bx = balloonX(i, board.length);
                const y0 = BALLOON_TOP + BALLOON_H;
                const to = strings[o.id];
                if (to === undefined) {
                  // A loose string dangles under every balloon, so the strings are visible before any tap.
                  return <line key={o.id} x1={bx} y1={y0} x2={bx + (i % 2 ? 2 : -2)} y2={y0 + 10} stroke="rgba(255,255,255,0.45)" strokeWidth={0.5} strokeDasharray="1.2 1.2" vectorEffect="non-scaling-stroke" />;
                }
                const tx = tokenX(TOKEN_INDEX[to]);
                const isWrong = pendingWrong === o.id;
                const isDone = !!done[o.id];
                return (
                  <motion.line
                    key={o.id + "-" + to}
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduce ? 0 : 0.35 }}
                    x1={bx}
                    y1={y0}
                    x2={tx}
                    y2={TOKEN_TOP}
                    stroke={isDone ? (done[o.id] === "fair" ? "#7eff97" : "#ff9bcb") : isWrong ? "#ff5f5f" : "#ffe27a"}
                    strokeWidth={isDone ? 2 : 1.5}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    style={{ filter: "drop-shadow(0 0 4px rgba(255,226,122,0.6))" }}
                  />
                );
              })}
            </svg>

            {/* Balloons */}
            {board.map((o, i) => {
              const isSel = selected === o.id;
              const state = done[o.id];
              const glow = guided && i === 0 && !state;
              return (
                <motion.button
                  key={o.id}
                  type="button"
                  aria-label={`Prize: ${o.text}${state ? ", done" : isSel ? ", selected" : ""}`}
                  aria-pressed={isSel}
                  onClick={() => tapBalloon(o)}
                  disabled={speaking || !!state}
                  animate={
                    state
                      ? { y: state === "fair" ? -6 : 0, scale: state === "scam" ? 0.92 : 1 }
                      : isSel
                        ? { y: -8, scale: 1.04 }
                        : reduce
                          ? { y: 0, scale: 1 }
                          : { y: [0, -5, 0], scale: 1 }
                  }
                  transition={state || isSel || reduce ? { type: "spring", stiffness: 240, damping: 18 } : { duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    left: `calc(${balloonX(i, board.length)}% - ${100 / board.length / 2 - 2}%)`,
                    width: `${100 / board.length - 4}%`,
                    top: `${BALLOON_TOP}%`,
                    height: `${BALLOON_H}%`,
                    borderRadius: "48% 48% 44% 44% / 60% 60% 40% 40%",
                    // Every balloon the same paint: nothing here can hint at the answer.
                    background: state === "scam"
                      ? "linear-gradient(180deg, #3b1236 0%, #24081f 100%)"
                      : "linear-gradient(180deg, #ffe9a8 0%, #f5c96b 60%, #e0a94a 100%)",
                    border: `2px solid ${state === "fair" ? "#7eff97" : state === "scam" ? "#ff9bcb" : isSel ? "#ffffff" : "#b8823a"}`,
                    boxShadow: glow
                      ? `0 0 0 4px ${accent}aa, 0 0 26px ${accent}`
                      : isSel
                        ? "0 0 0 3px rgba(255,255,255,0.7), 0 14px 30px -14px rgba(0,0,0,0.8)"
                        : "0 14px 30px -14px rgba(0,0,0,0.8), inset 0 -10px 20px rgba(0,0,0,0.12)",
                    color: state === "scam" ? "#ff9bcb" : "#3a1a34",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    cursor: speaking || state ? "default" : "pointer",
                    fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                    zIndex: 2,
                    animation: glow && !reduce ? "saGuide 1.4s ease-in-out infinite" : undefined,
                  }}
                >
                  {state === "scam" ? (
                    <>
                      <span aria-hidden style={{ fontSize: 30 }}>🐾</span>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textTransform: "uppercase" }}>The Raccoon!</span>
                    </>
                  ) : (
                    <>
                      <PixIcon emoji="📣" size={26} />
                      <span style={{ fontSize: 14, fontWeight: 800, lineHeight: 1.25, textAlign: "center" }}>{o.text}</span>
                      {state === "fair" && <span aria-hidden style={{ fontSize: 16 }}>🎀</span>}
                    </>
                  )}
                </motion.button>
              );
            })}

            {/* The counter with its four tokens */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${TOKEN_TOP}%`,
                bottom: 0,
                display: "grid",
                gridTemplateColumns: `repeat(${TOKENS.length}, 1fr)`,
                gap: 8,
                padding: "10px 10px 12px",
                zIndex: 2,
              }}
            >
              {TOKENS.map((t) => {
                const armed = !!selectedOffer && !speaking;
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    aria-label={`String leads to: ${tokenLabels?.[t.id] ?? t.label}`}
                    onClick={() => tapToken(t.id)}
                    disabled={!armed}
                    whileTap={armed && !reduce ? { scale: 0.96 } : undefined}
                    style={{
                      borderRadius: 14,
                      // Identical tokens on every board: same wood, same rim.
                      background: "linear-gradient(180deg, #fff6e6 0%, #f1dfc2 100%)",
                      border: `2px solid ${armed ? accent : "rgba(138,90,18,0.35)"}`,
                      boxShadow: armed ? `0 0 14px ${accent}66` : "none",
                      color: "#2a1a08",
                      padding: "6px 6px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 3,
                      cursor: armed ? "pointer" : "default",
                      opacity: armed || Object.keys(done).length === board.length ? 1 : 0.85,
                      fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                      transition: "border-color 200ms ease, box-shadow 200ms ease",
                    }}
                  >
                    <PixIcon emoji={t.icon} size={26} />
                    <span style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2, textAlign: "center" }}>{tokenLabels?.[t.id] ?? t.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* On-board instructions: the current step, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16 }}>
              {guided
                ? "Round 1: tap the glowing prize, then tap what its string really leads to"
                : selectedOffer
                  ? "Now tap the token this prize really wants"
                  : boardDone
                    ? "Board cleared!"
                    : "Tap a prize to hear it, then tap what it really wants"}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={boardWrongs >= 2 ? 2 : 1} speaker={voice} text={hintText} />}
          </div>
          <style>{`@keyframes saGuide { 0%,100% { box-shadow: 0 0 0 4px ${accent}66, 0 0 18px ${accent}88 } 50% { box-shadow: 0 0 0 7px ${accent}22, 0 0 30px ${accent} } }`}</style>
        </div>
      )}

      <AnimatePresence>
        {finished && (
          <ExerciseCompleteBeat
            title={completeTitle}
            stars={stars}
            statLines={[`${scamsExposed} trick${scamsExposed === 1 ? "" : "s"} exposed`, `${fairKept} real offer${fairKept === 1 ? "" : "s"} kept`, completeLine]}
            narration={completeNarration}
            onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
          />
        )}
      </AnimatePresence>
    </ExerciseFrame>
  );
}
