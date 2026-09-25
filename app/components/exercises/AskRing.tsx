"use client";

/**
 * AskRing: the ASK AND RESPECT drill (Week 8, "The Ask Ring").
 *
 * A photo sits in the middle of the board and the friends who are IN it sit
 * around it on a ring: the same round face token for everyone, a name plate,
 * and a dim stone under each. Nothing about a friend shows their answer until
 * the child asks. Tap a friend to ASK: a speech bubble gives their answer in
 * their own words and Sarah reads it. A yes lights the stone green and that
 * friend is settled. A no turns the stone amber and two identical buttons
 * appear by that friend, "Leave them out" and "Don't post it", with the sides
 * flipped at random on every no. The right move is the friend's own call:
 * leaving someone out crops them from the post (settled); not posting keeps
 * the whole photo private and ends the round there, no POST needed. POST
 * lights up only once every face is a yes or left out.
 *
 * Why it is not the inspectors, the Lobby Doors or the Growth Rings (owner:
 * "we never copy an exercise"): nothing is judged real or fake, nobody is let
 * in or kept out of anything, and nothing is revealed in a set order; the
 * verbs are ASK, then RESPECT the answer. The post itself is locked behind the
 * child gathering a yes (or a respectful fix) face by face.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once, every round read aloud as it arrives and every friend's answer read as
 * they give it (audio-only, `recordedOnly`, taps held), a spoken verdict on
 * every right move and on POST ("That's right!" + why via VerdictVoice; wrong:
 * WrongAnswerPanel speaks "Not quite." + the friend's teach line and the two
 * buttons stay for the retry), hint tiers per round, a spoken payoff on the
 * complete beat. Rounds play in authored order; the friends' seats on the ring
 * are shuffled per round. Round 1 guides the MECHANIC only: the first friend
 * breathes until someone is asked, then POST breathes once it is ready; the
 * two answer buttons never glow. Tap-only, no timer, no lose state.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce, fisherYates } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as OddsJar / ChatFixer.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface AskFriend { id: string; name: string; answer: "yes" | "no"; says: string; readAloud: string; noMove?: "leaveOut" | "dontPost"; why?: string; whyWrong?: string }
export interface AskRound { id: string; caption: string; photoIcon: string; readAloud: string; friends: AskFriend[]; why: string }
export interface AskRingProps {
  rounds: AskRound[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  postLabel?: string; leaveOutLabel?: string; dontPostLabel?: string; yesChip?: string; noChip?: string; leftOutChip?: string; keptChip?: string;
  postToast?: string; keptToast?: string; wrongTitle?: string; completeTitle?: string; completeLine?: string;
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

/** The two respectful moves after a no. The index here is what `onAnswered`
 *  reports (0 = leave them out, 1 = don't post it), whatever side it sat on. */
type Move = "leaveOut" | "dontPost";
const MOVES: Move[] = ["leaveOut", "dontPost"];
/** A friend's state this round. Absent = not asked yet. */
type FriendState = "yes" | "no" | "leftOut" | "kept";

const EMPTY_FRIENDS: AskFriend[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
const PLATE_FONT = "'JetBrains Mono', 'Cascadia Mono', ui-monospace, Menlo, monospace";
/** One face for every friend: nothing on the token hints at their answer. */
const FACE = "👤";
/** Seat geometry (px): the token column, the bubble column, the photo card. */
const TOKEN_COL_W = 96;
const SAY_MIN_W = 118;
const SAY_MAX_W = 176;
const SEAT_MIN_H = 176;
const SEAT_W = TOKEN_COL_W + 8 + SAY_MAX_W;
const PHOTO_W = 236;
/** Photo paper and the print on it. */
const PAPER = "#fff6e8";
const PRINT = "linear-gradient(160deg, #3d3550 0%, #1b1726 100%)";
/** The stone under each friend: dim until they answer. */
const STONE: Record<FriendState | "idle", { bg: string; glow: string }> = {
  idle: { bg: "radial-gradient(ellipse at 50% 35%, #555b72 0%, #2a2e3d 78%)", glow: "inset 0 -2px 3px rgba(0,0,0,0.5)" },
  yes: { bg: "radial-gradient(ellipse at 50% 35%, #c2ffd4 0%, #34d399 58%, #15803d 100%)", glow: "0 0 14px rgba(52,211,153,0.85), 0 0 4px rgba(52,211,153,0.95)" },
  no: { bg: "radial-gradient(ellipse at 50% 35%, #ffe9b0 0%, #ffb020 58%, #b86e00 100%)", glow: "0 0 14px rgba(255,176,32,0.8), 0 0 4px rgba(255,176,32,0.9)" },
  leftOut: { bg: "radial-gradient(ellipse at 50% 35%, #8d92a2 0%, #4e525d 78%)", glow: "none" },
  kept: { bg: "radial-gradient(ellipse at 50% 35%, #cfc4ff 0%, #8b7bd8 58%, #4c3f8f 100%)", glow: "0 0 14px rgba(139,123,216,0.75), 0 0 4px rgba(139,123,216,0.9)" },
};
/** Corner crop marks drawn round a left-out token (longhand widths only, so
 *  nothing mixes with a border shorthand). */
const CROP_CORNERS: CSSProperties[] = [
  { top: 0, left: 0, borderTopWidth: 2, borderRightWidth: 0, borderBottomWidth: 0, borderLeftWidth: 2 },
  { top: 0, right: 0, borderTopWidth: 2, borderRightWidth: 2, borderBottomWidth: 0, borderLeftWidth: 0 },
  { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomWidth: 2, borderLeftWidth: 2 },
  { bottom: 0, right: 0, borderTopWidth: 0, borderRightWidth: 2, borderBottomWidth: 2, borderLeftWidth: 0 },
];

export default function AskRing({
  rounds,
  introTitle = "The Ask Ring",
  introSubtitle = "Ask every face in the photo before you post it.",
  introIcon = "📸",
  postLabel = "POST",
  leaveOutLabel = "Leave them out",
  dontPostLabel = "Don't post it",
  yesChip = "Yes!",
  noChip = "No thanks",
  leftOutChip = "Left out",
  keptChip = "Kept private",
  postToast = "POSTED, EVERY YES!",
  keptToast = "KEPT. THEIR CALL.",
  wrongTitle = "Their face, their call",
  completeTitle = "Every face asked!",
  completeLine = "A yes from every face, or it does not fly.",
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
}: AskRingProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#ffb347";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Read-aloud chain: the how-to once as the board appears, each round as it
  // arrives, then each friend's answer as they give it. Taps are held while
  // she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // What "read" plays: null = the round as it arrives, else the id of the
  // friend who just answered.
  const [readFriend, setReadFriend] = useState<string | null>(null);
  // "sealed" = the round is settled (posted, or kept after a don't-post): the
  // seal lands on the photo while Sarah says why, then the next round arrives.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  const [outcome, setOutcome] = useState<"posted" | "kept" | null>(null);
  const [answers, setAnswers] = useState<Record<string, FriendState>>({});
  // Which side each no's two buttons sit on, decided when that friend says no.
  const [moveOrder, setMoveOrder] = useState<Record<string, Move[]>>({});
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [askedCount, setAskedCount] = useState(0);
  const [postedCount, setPostedCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  // The board element and its width: the ring needs room for a seat on each
  // side of the photo, and a narrow frame lists the seats under it instead.
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);
  const [boardW, setBoardW] = useState(0);

  // Authored order for the rounds; the seats are shuffled per round so the
  // first seat is never the authored first friend.
  const finished = idx >= rounds.length;
  const round = rounds[idx];
  const shuffled = useShuffledOnce(round?.friends ?? EMPTY_FRIENDS, { key: round?.id ?? "done" });
  // The shuffle lands in a layout effect, so the first render of a new round
  // can still hold the last round's seats: use the authored list for it.
  const seats =
    round && shuffled.length === round.friends.length && shuffled.every((f) => round.friends.some((g) => g.id === f.id))
      ? shuffled
      : round?.friends ?? EMPTY_FRIENDS;
  const stateOf = (f: AskFriend): FriendState | undefined => answers[f.id];
  const askedThisRound = seats.filter((f) => stateOf(f) !== undefined).length;
  // Every face answered AND settled: a yes, a crop, or a no that keeps the
  // whole photo off the internet. (A photo with nobody in it has nobody to ask.)
  const allAsked = seats.every((f) => {
    const st = stateOf(f);
    return st === "yes" || st === "leftOut" || st === "kept";
  });
  const anyKept = seats.some((f) => stateOf(f) === "kept");
  // POST stays reachable only when every face is a yes or left out. One
  // don't-post no keeps the photo off the internet, so POST never lights.
  const allSettled = allAsked && !anyKept;
  const pending = seats.find((f) => stateOf(f) === "no") ?? null;
  const readTarget = readFriend ? seats.find((f) => f.id === readFriend) ?? null : null;
  // Round 1 teaches the mechanic only: the first seat breathes until someone
  // is asked, then POST breathes once every face is settled.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why; POST and a kept photo
  // wait for her before the next round. Wrong moves speak through
  // WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || phase === "sealed";

  // Safety releases for the spoken gate (never leave the board held).
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

  // Track the board's width (before paint, so the layout never flashes).
  useIsoLayoutEffect(() => {
    if (!boardEl) return;
    const measure = () => setBoardW(boardEl.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(boardEl);
    return () => ro.disconnect();
  }, [boardEl]);

  const startBoard = () => {
    setShowIntro(false);
    setReadFriend(null);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    setAnswers({});
    setMoveOrder({});
    setReadFriend(null);
    setRoundWrongs(0);
    setOutcome(null);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  // ASK: the answer shows in their bubble and on their stone, and Sarah reads it.
  const ask = (f: AskFriend) => {
    if (!round || speaking || phase !== "play" || stateOf(f) !== undefined) return;
    const yes = f.answer === "yes";
    if (yes) audio.heal();
    else audio.cardFlip();
    setAnswers((a) => ({ ...a, [f.id]: yes ? "yes" : "no" }));
    // A fair coin flip for the two buttons' sides (a two-item useShuffledOnce
    // would always swap, which is a pattern, not a flip).
    if (!yes) setMoveOrder((m) => ({ ...m, [f.id]: fisherYates(MOVES) }));
    setAskedCount((n) => n + 1);
    if (f.readAloud && !isAudioMuted()) {
      setReadFriend(f.id);
      setNarr("read");
    }
  };

  // RESPECT: the move after a no. Right = that friend's own call.
  const chooseMove = (f: AskFriend, move: Move) => {
    if (!round || speaking || phase !== "play" || stateOf(f) !== "no") return;
    const want: Move = f.noMove ?? "leaveOut";
    const right = move === want;
    onAnswered?.({
      questionKey: `ask-${round.id}-${f.id}`,
      selectedIndex: MOVES.indexOf(move),
      correctIndex: MOVES.indexOf(want),
      wasCorrect: right,
    });
    if (right && move === "leaveOut") {
      fx.correct({ xp: 20 });
      onCorrect?.();
      setAnswers((a) => ({ ...a, [f.id]: "leftOut" }));
      // Sarah: "That's right!" + why; the board waits for her, then the child
      // carries on asking.
      verdict.say("right", f.why);
    } else if (right) {
      fx.correct({ xp: 20 });
      onCorrect?.();
      setAnswers((a) => ({ ...a, [f.id]: "kept" }));
      // Their call keeps the photo off the internet, but it does NOT end the
      // round: everyone else in the photo still gets asked. Sealing here was
      // the bug - the unasked friends never got a turn, and on Week 20 two of
      // the three authored answers could never be heard.
      verdict.say("right", f.why);
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the two
      // buttons stay so the retry is one tap.
      setFeedback({ title: wrongTitle, explanation: f.whyWrong ?? "", tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  // Every face asked, and at least one no that covers the whole photo: it
  // stays off the internet. This waits for Sarah so it can never cut off the
  // line she is in the middle of, and phase flips to "sealed" on the first
  // pass so it cannot fire twice.
  useEffect(() => {
    if (!round || phase !== "play" || !allAsked || !anyKept || speaking) return;
    fx.correct({ xp: 25, text: keptToast });
    onCorrect?.();
    setKeptCount((k) => k + 1);
    setOutcome("kept");
    setPhase("sealed");
    verdict.say("right", round.why, () => {
      window.setTimeout(advance, reduce ? 200 : 900);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, phase, allAsked, anyKept, speaking]);

  // POST: only reachable once every face is a yes or left out.
  const post = () => {
    if (!round || speaking || phase !== "play" || !allSettled) return;
    onAnswered?.({ questionKey: `post-${round.id}`, selectedIndex: 0, correctIndex: 0, wasCorrect: true });
    fx.correct({ xp: 25, text: postToast });
    onCorrect?.();
    setPostedCount((n) => n + 1);
    setOutcome("posted");
    setPhase("sealed");
    verdict.say("right", round.why, () => {
      window.setTimeout(advance, reduce ? 200 : 900);
    });
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const postReady = allSettled && phase === "play";
  const postGlow = guided && postReady && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "arGuide 1.4s ease-in-out infinite" }
      : {};
  const toAsk = seats.filter((f) => stateOf(f) === undefined).length;
  const strip =
    phase === "sealed"
      ? outcome === "kept"
        ? keptToast
        : postToast
      : pending
        ? `${pending.name} said no. Pick the move that respects them`
        : allSettled
          ? guided
            ? `Round 1: every face is settled. Tap ${postLabel}`
            : `Every face is settled. Tap ${postLabel}`
          : guided && askedThisRound === 0
            ? "Round 1: tap the glowing friend to ask them"
            : `Ask every face before you post. ${toAsk} more to go`;

  // The ring: an odd seat out goes on top of the photo, the rest split left
  // and right. A narrow board lists every seat under the photo instead.
  const topSeat = seats.length % 2 === 1 ? seats[Math.floor(seats.length / 2)] : null;
  const sideSeats = topSeat ? seats.filter((f) => f !== topSeat) : seats;
  const leftN = Math.ceil(sideSeats.length / 2);
  const leftSeats = sideSeats.slice(0, leftN);
  const rightSeats = sideSeats.slice(leftN);
  // Wide needs a squeezed seat on each side plus the centre column at its
  // fullest (the photo, or the top seat at full width), the gaps and padding.
  const seatMinW = TOKEN_COL_W + 8 + SAY_MIN_W;
  const wideMin =
    (leftSeats.length ? seatMinW : 0) + (rightSeats.length ? seatMinW : 0) + Math.max(PHOTO_W, topSeat ? SEAT_W : 0) + 28 + 24 + 8;
  const wide = boardW === 0 || boardW >= wideMin;

  /** One seat on the ring: the tap-to-ask token column, and their bubble. */
  const renderSeat = (f: AskFriend, side: "left" | "right"): ReactNode => {
    if (!round) return null;
    const st = stateOf(f);
    const asked = st !== undefined;
    const leftOut = st === "leftOut";
    const canAsk = !asked && phase === "play";
    const glow = guided && askedThisRound === 0 && seats[0]?.id === f.id && canAsk && !speaking;
    const stone = STONE[st ?? "idle"];
    const order = moveOrder[f.id] ?? MOVES;
    const chip =
      st === "yes"
        ? { icon: "👍", text: yesChip, ink: "#9dfbbd", rim: "rgba(52,211,153,0.6)", bg: "rgba(52,211,153,0.16)" }
        : st === "no"
          ? { icon: "✋", text: noChip, ink: "#ffd68a", rim: "rgba(255,176,32,0.6)", bg: "rgba(255,176,32,0.16)" }
          : st === "leftOut"
            ? { icon: null, text: leftOutChip, ink: "#d5d8e2", rim: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.08)" }
            : st === "kept"
              ? { icon: "🔒", text: keptChip, ink: "#d9d0ff", rim: "rgba(139,123,216,0.6)", bg: "rgba(139,123,216,0.18)" }
              : null;
    return (
      <div
        key={`${round.id}-${f.id}`}
        style={{
          display: "flex",
          flexDirection: side === "left" ? "row-reverse" : "row",
          alignItems: "flex-start",
          gap: 8,
          // A steady footprint: a bubble arriving never nudges the ring.
          width: SEAT_W,
          maxWidth: "100%",
          minHeight: SEAT_MIN_H,
        }}
      >
        {/* The token column is the ask button: face, name plate, stone, chip. */}
        <button
          type="button"
          aria-label={`Ask ${f.name}`}
          onClick={() => ask(f)}
          disabled={speaking || !canAsk}
          style={{
            flexShrink: 0,
            width: TOKEN_COL_W,
            padding: "4px 2px",
            background: "transparent",
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            color: "#fff7e6",
            fontFamily: KID_FONT,
            cursor: canAsk && !speaking ? "pointer" : "default",
            touchAction: "manipulation",
          }}
        >
          <span
            style={{
              position: "relative",
              width: 76,
              height: 76,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              // Every token the same face and paint until the child's own
              // choice greys a left-out friend.
              background: leftOut
                ? "radial-gradient(circle at 50% 32%, #4b4e59 0%, #25272f 72%)"
                : "radial-gradient(circle at 50% 32%, #515c93 0%, #1d2352 72%)",
              border: `2px solid ${leftOut ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.3)"}`,
              boxShadow: "0 10px 20px -12px rgba(0,0,0,0.9)",
              transition: "background 250ms ease, border-color 250ms ease",
              ...guideStyle(glow),
            }}
          >
            <span style={{ display: "grid", placeItems: "center", opacity: leftOut ? 0.35 : 1, filter: leftOut ? "grayscale(1)" : undefined }}>
              <PixIcon emoji={FACE} size={46} />
            </span>
            {leftOut && (
              <motion.span
                aria-hidden
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.35 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 18 }}
                style={{ position: "absolute", inset: -9, pointerEvents: "none" }}
              >
                {CROP_CORNERS.map((c, k) => (
                  <span key={k} style={{ position: "absolute", width: 15, height: 15, borderStyle: "solid", borderColor: "#fff7e6", ...c }} />
                ))}
              </motion.span>
            )}
          </span>
          <span
            style={{
              maxWidth: "100%",
              padding: "2px 9px",
              borderRadius: 8,
              background: "rgba(8,10,22,0.7)",
              border: "1px solid rgba(255,255,255,0.18)",
              fontFamily: PLATE_FONT,
              fontSize: 14,
              fontWeight: 700,
              lineHeight: 1.3,
              overflowWrap: "anywhere",
              opacity: leftOut ? 0.6 : 1,
            }}
          >
            {f.name}
          </span>
          <span
            aria-hidden
            style={{ width: 46, height: 12, borderRadius: "50%", background: stone.bg, boxShadow: stone.glow, transition: "background 250ms ease, box-shadow 250ms ease" }}
          />
          <span style={{ minHeight: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {chip && (
              <motion.span
                key={st}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 18 }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: chip.bg,
                  border: `1px solid ${chip.rim}`,
                  color: chip.ink,
                  fontFamily: LABEL_FONT,
                  fontSize: 10.5,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  whiteSpace: "nowrap",
                }}
              >
                {chip.icon && <PixIcon emoji={chip.icon} size={13} />}
                {chip.text}
              </motion.span>
            )}
          </span>
        </button>

        {/* Their bubble (after they are asked) and, for a no, the two moves. */}
        <div
          style={{
            flex: "1 1 auto",
            minWidth: SAY_MIN_W,
            maxWidth: SAY_MAX_W,
            display: "flex",
            flexDirection: "column",
            alignItems: side === "left" ? "flex-end" : "flex-start",
            gap: 6,
            paddingTop: 8,
          }}
        >
          {asked ? (
            <motion.div
              key={`says-${round.id}-${f.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, x: side === "left" ? 10 : -10 }}
              animate={{ opacity: leftOut ? 0.55 : 1, scale: 1, x: 0 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 340, damping: 22 }}
              style={{
                padding: "9px 12px",
                borderRadius: side === "left" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                background: "#fff7e6",
                color: "#231a14",
                fontFamily: KID_FONT,
                fontSize: 15,
                fontWeight: 800,
                lineHeight: 1.3,
                textAlign: "left",
                overflowWrap: "anywhere",
                boxShadow: "0 8px 18px -10px rgba(0,0,0,0.8)",
              }}
            >
              {f.says}
            </motion.div>
          ) : (
            <div
              aria-hidden
              style={{
                display: "grid",
                placeItems: "center",
                width: 54,
                height: 34,
                borderRadius: side === "left" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                border: "1.5px dashed rgba(255,255,255,0.22)",
                opacity: 0.8,
              }}
            >
              <PixIcon emoji="❓" size={18} />
            </div>
          )}

          {st === "no" && phase === "play" && (
            <motion.div
              key={`moves-${round.id}-${f.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}
            >
              {order.map((move) => {
                const label = move === "leaveOut" ? leaveOutLabel : dontPostLabel;
                return (
                  <motion.button
                    key={move}
                    type="button"
                    aria-label={`${label}: ${f.name}`}
                    onClick={() => chooseMove(f, move)}
                    disabled={speaking}
                    whileTap={speaking || reduce ? undefined : { scale: 0.96 }}
                    style={{
                      width: "100%",
                      minHeight: 44,
                      padding: "8px 10px",
                      borderRadius: 12,
                      // The two moves wear the same paint: nothing here can
                      // hint at which one respects this friend.
                      background: "rgba(255,255,255,0.09)",
                      border: "2px solid rgba(255,255,255,0.24)",
                      color: "#fff7e6",
                      fontFamily: KID_FONT,
                      fontSize: 15,
                      fontWeight: 800,
                      lineHeight: 1.2,
                      textAlign: "center",
                      cursor: speaking ? "wait" : "pointer",
                      touchAction: "manipulation",
                    }}
                  >
                    {label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  const photo: ReactNode = round ? (
    <div style={{ position: "relative" }}>
      {/* The ring itself, drawn round the photo and under the seats. */}
      {wide && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: "-34px -92px",
            zIndex: -1,
            borderRadius: "50%",
            border: `2px dashed ${accent}44`,
            boxShadow: `inset 0 0 36px ${accent}18, 0 0 30px ${accent}10`,
            pointerEvents: "none",
          }}
        />
      )}
      <motion.div
        key={`photo-${round.id}`}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, rotate: -6 }}
        animate={{ opacity: 1, scale: 1, rotate: -2 }}
        transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 220, damping: 20 }}
        style={{
          position: "relative",
          width: PHOTO_W,
          padding: "10px 10px 12px",
          borderRadius: 5,
          background: PAPER,
          boxShadow: "0 22px 40px -18px rgba(0,0,0,0.9)",
        }}
      >
        <div style={{ height: 180, borderRadius: 3, background: PRINT, display: "grid", placeItems: "center" }}>
          <PixIcon emoji={round.photoIcon} size={92} />
        </div>
        <div
          style={{
            marginTop: 8,
            color: "#2a1f18",
            fontFamily: KID_FONT,
            fontSize: 16,
            fontWeight: 800,
            lineHeight: 1.25,
            textAlign: "center",
            overflowWrap: "anywhere",
          }}
        >
          {round.caption}
        </div>

        {/* The seal lands only once the round is settled (never before). */}
        <AnimatePresence>
          {phase === "sealed" && outcome && (
            <motion.div
              key={`seal-${outcome}`}
              initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -20 }}
              animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -6 }}
              exit={{ opacity: 0, x: "-50%" }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
              style={{
                position: "absolute",
                left: "50%",
                top: 74,
                width: "92%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "7px 8px",
                borderRadius: 10,
                border: "4px double #34d399",
                color: "#a0ffb0",
                background: "rgba(8,10,22,0.9)",
                fontFamily: LABEL_FONT,
                fontWeight: 900,
                fontSize: 13,
                letterSpacing: "0.08em",
                lineHeight: 1.2,
                textTransform: "uppercase",
                textAlign: "center",
                boxShadow: "0 0 18px rgba(52,211,153,0.5)",
                zIndex: 3,
              }}
            >
              <PixIcon emoji={outcome === "kept" ? "🔒" : "📣"} size={18} />
              <span>{outcome === "kept" ? keptToast : postToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  ) : null;

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

      {/* Sarah's read-alouds (audio only): the how-to once, each round, each answer. */}
      {!showIntro && !finished && round && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="ar-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && !readTarget && (
            <InfoNarration key={`ar-read-${round.id}`} speaker={voice} lines={[round.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && readTarget && (
            <InfoNarration
              key={`ar-ask-${round.id}-${readTarget.id}`}
              speaker={voice}
              lines={[readTarget.readAloud]}
              accent={accent}
              recordedOnly
              onDone={() => setNarr("idle")}
            />
          )}
        </div>
      )}

      {!showIntro && !finished && round && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Round {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </span>
          </div>

          {/* The board: the photo in the middle, its faces around it. Isolated
              so the ring can sit under the seats but over the board's paint. */}
          <div
            ref={setBoardEl}
            style={{
              position: "relative",
              isolation: "isolate",
              margin: "0 14px",
              padding: "14px 12px 14px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
            }}
          >
            {wide ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
                  gridTemplateRows: topSeat ? "auto auto" : "auto",
                  columnGap: 14,
                  rowGap: 10,
                  alignItems: "center",
                }}
              >
                {leftSeats.length > 0 && (
                  <div style={{ gridColumn: 1, gridRow: "1 / -1", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                    {leftSeats.map((f) => renderSeat(f, "left"))}
                  </div>
                )}
                {topSeat && <div style={{ gridColumn: 2, gridRow: 1, display: "flex", justifyContent: "center" }}>{renderSeat(topSeat, "right")}</div>}
                <div style={{ gridColumn: 2, gridRow: topSeat ? 2 : 1, justifySelf: "center", padding: "10px 0" }}>{photo}</div>
                {rightSeats.length > 0 && (
                  <div style={{ gridColumn: 3, gridRow: "1 / -1", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
                    {rightSeats.map((f) => renderSeat(f, "right"))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                {photo}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>{seats.map((f) => renderSeat(f, "right"))}</div>
              </div>
            )}
          </div>

          {/* On-board instructions + POST, which lights only when every face is settled. */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, marginBottom: 10, padding: "0 16px" }}>
              {strip}
            </div>
            <span style={{ display: "inline-block", borderRadius: 16, ...guideStyle(postGlow) }}>
              <GameButton variant="primary" size="lg" icon="📣" onClick={post} disabled={speaking || !postReady} aria-label={postLabel} style={{ minWidth: 170 }}>
                {postLabel}
              </GameButton>
            </span>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes arGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${askedCount} friend${askedCount === 1 ? "" : "s"} asked, ${postedCount} posted, ${keptCount} kept`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
