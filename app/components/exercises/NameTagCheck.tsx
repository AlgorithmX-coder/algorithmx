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
 *
 * Skins (`skin` prop): "tag" is Week 4's carnival name tags (default,
 * unchanged). "app" is Week 9's "The Whisker Check": the two tags become two
 * app-store listing cards, the REAL app on top and the app to check under it,
 * each an optional app icon tile (`appIcon`) beside the pieces laid out as
 * listing rows (name / maker / downloads) with a small caption per row
 * (`pieceLabels`). The rows line up card to card so each piece sits in the
 * same place as its twin. Marking, closing, judging, narration, verdict voice,
 * questionKeys and aria-labels are identical on both skins, and piece text is
 * never upper-cased on either.
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
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

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
  /** App skin: the app's icon (a PixIcon emoji), drawn as the icon tile on
   *  BOTH listing cards. Optional: no tile when absent. Ignored on the tag skin. */
  appIcon?: string;
}

/** "tag" = Week 4's carnival name tags (default); "app" = Week 9's app-store listing cards. */
export type NameTagCheckSkin = "tag" | "app";

export interface NameTagCheckProps {
  cases: NameTagCase[];
  /** Visual skin: "tag" (Week 4, default) or "app" (Week 9). Every copy prop
   *  below defaults per skin (tag = Week 4's words, app = APP_COPY). */
  skin?: NameTagCheckSkin;
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
  /** App skin: a small caption per piece row, by piece index (e.g. ["Name",
   *  "Maker", "Downloads"]), shown on both cards. Default none. Ignored on the tag skin. */
  pieceLabels?: string[];
  /** Eyebrow over the top card. Default "The real sender" (tag) / "The real app" (app). */
  realLabel?: string;
  /** Eyebrow over the bottom card. Default "The sender to check" (tag) / "The app to check" (app). */
  checkLabel?: string;
  /** The header counter's noun ("Tag 2 of 4"). Default "Tag" (tag) / "App" (app). */
  itemLabel?: string;
  /** The instruction strip above the commit button. Default the Week 4 strip
   *  (tag) / APP_COPY.boardPrompt (app). */
  boardPrompt?: string;
  /** Complete-beat count line after "4/4". Default "tags checked" (tag) / "apps checked" (app). */
  doneLabel?: string;
  /** Complete-beat count of copycats caught, shown as "<n> <one|many>".
   *  Default { one: "copycat caught", many: "copycats caught" } (both skins). */
  caughtLabel?: { one: string; many: string };
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
const LABEL_FONT = "'Space Grotesk', sans-serif";

/** Week 4's words: the tag skin's defaults (exactly the values it always had). */
const TAG_COPY = {
  introTitle: "The Name Tag Check",
  introSubtitle: "The real sender's tag is on top. Mark every piece underneath that doesn't match, then close the booth.",
  introIcon: "🔍",
  stampLabel: "SWAPPED!",
  closeLabel: "CLOSE THE BOOTH",
  realSeal: "REAL SENDER",
  fakeSeal: "COPYCAT!",
  realToast: "BOOTH CLOSED: REAL SENDER!",
  fakeToast: "BOOTH CLOSED: COPYCAT!",
  wrongTitle: "Compare the pieces again!",
  completeTitle: "Every tag checked!",
  completeLine: "Copycats caught, real senders welcomed.",
  realLabel: "The real sender",
  checkLabel: "The sender to check",
  itemLabel: "Tag",
  boardPrompt: "Compare each piece with the one above · tap a piece that doesn't match · tap again to lift · then close the booth",
  doneLabel: "tags checked",
  tier3: DEFAULT_TIER3,
};

/** Week 9's words: the app skin's defaults. */
const APP_COPY: typeof TAG_COPY = {
  introTitle: "The Whisker Check",
  introSubtitle: "The real app is on top. Mark every piece underneath that doesn't match, then check the app.",
  introIcon: "📱",
  stampLabel: "SWAPPED!",
  closeLabel: "CHECK THE APP",
  realSeal: "REAL APP",
  fakeSeal: "COPYCAT!",
  realToast: "CHECKED: REAL APP!",
  fakeToast: "CHECKED: COPYCAT!",
  wrongTitle: "Compare the pieces again!",
  completeTitle: "Every app checked!",
  completeLine: "Copycats caught, real apps welcomed.",
  realLabel: "The real app",
  checkLabel: "The app to check",
  itemLabel: "App",
  boardPrompt: "Compare each row with the real app · tap a piece that doesn't match · tap again to lift · then check the app",
  doneLabel: "apps checked",
  tier3: "Let me help. I fixed that one piece for you. Now check the app.",
};

const DEFAULT_CAUGHT = { one: "copycat caught", many: "copycats caught" };

/** App skin: the caption column's width, the same on both cards so the rows line up. */
const APP_CAPTION_W = 86;

export default function NameTagCheck({
  cases,
  skin,
  introTitle: introTitleProp,
  introSubtitle: introSubtitleProp,
  introIcon: introIconProp,
  stampLabel: stampLabelProp,
  closeLabel: closeLabelProp,
  realSeal: realSealProp,
  fakeSeal: fakeSealProp,
  realToast: realToastProp,
  fakeToast: fakeToastProp,
  wrongTitle: wrongTitleProp,
  completeTitle: completeTitleProp,
  completeLine: completeLineProp,
  pieceLabels,
  realLabel: realLabelProp,
  checkLabel: checkLabelProp,
  itemLabel: itemLabelProp,
  boardPrompt: boardPromptProp,
  doneLabel: doneLabelProp,
  caughtLabel = DEFAULT_CAUGHT,
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
  const app = skin === "app";
  // Copy: a prop wins, else the skin's default (the tag skin's are Week 4's exact words).
  const copy = app ? APP_COPY : TAG_COPY;
  const introTitle = introTitleProp ?? copy.introTitle;
  const introSubtitle = introSubtitleProp ?? copy.introSubtitle;
  const introIcon = introIconProp ?? copy.introIcon;
  const stampLabel = stampLabelProp ?? copy.stampLabel;
  const closeLabel = closeLabelProp ?? copy.closeLabel;
  const realSeal = realSealProp ?? copy.realSeal;
  const fakeSeal = fakeSealProp ?? copy.fakeSeal;
  const realToast = realToastProp ?? copy.realToast;
  const fakeToast = fakeToastProp ?? copy.fakeToast;
  const wrongTitle = wrongTitleProp ?? copy.wrongTitle;
  const completeTitle = completeTitleProp ?? copy.completeTitle;
  const completeLine = completeLineProp ?? copy.completeLine;
  const realLabel = realLabelProp ?? copy.realLabel;
  const checkLabel = checkLabelProp ?? copy.checkLabel;
  const itemLabel = itemLabelProp ?? copy.itemLabel;
  const boardPrompt = boardPromptProp ?? copy.boardPrompt;
  const doneLabel = doneLabelProp ?? copy.doneLabel;

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
      const tip = cw >= 3 ? (hints?.tier3 ?? copy.tier3) : cw === 2 ? hints?.tier2 : hints?.tier1;
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
  const hintText = caseWrongs >= 3 ? (hints?.tier3 ?? copy.tier3) : caseWrongs === 2 ? hints?.tier2 : caseWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (caseWrongs >= 3 ? 3 : caseWrongs === 2 ? 2 : 1) as 1 | 2 | 3;

  const tagShell = (top: boolean) => ({
    position: "relative" as const,
    borderRadius: 16,
    background: top ? "linear-gradient(180deg, #ffe9a8 0%, #f5c96b 100%)" : "linear-gradient(180deg, #fffaf0 0%, #f1e4cf 100%)",
    border: `2px solid ${top ? "#c99a4a" : "rgba(138,90,18,0.4)"}`,
    boxShadow: "0 14px 30px -18px rgba(0,0,0,0.7)",
    padding: "12px 14px 14px",
  });

  /* ── App skin paint (Week 9): two app-store listing cards ── */
  const hasCaptions = app && !!pieceLabels?.length;
  /** A listing card: the REAL app's (top) is tinted steel blue, the app to check is plain white. Same on every case. */
  const listingShell = (top: boolean): React.CSSProperties => ({
    position: "relative",
    borderRadius: 18,
    background: top ? "linear-gradient(180deg, #e6efff 0%, #cddffb 100%)" : "linear-gradient(180deg, #ffffff 0%, #eef3fb 100%)",
    border: `2px solid ${top ? "#6f9fe6" : "rgba(43,127,255,0.32)"}`,
    boxShadow: "0 14px 30px -18px rgba(0,0,0,0.7)",
    padding: "9px 14px 11px",
  });
  const listingEyebrow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    color: "#2a5aa8",
    marginBottom: 6,
  };
  /** The app's icon tile: the same art on both cards (a copycat wears the real icon). */
  const appTile = (emoji: string) => (
    <span
      aria-hidden
      style={{
        display: "grid",
        placeItems: "center",
        width: 56,
        height: 56,
        flexShrink: 0,
        borderRadius: 15,
        background: "linear-gradient(135deg, #7db6ff 0%, #2b7fff 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.5), 0 4px 10px rgba(43,127,255,0.4)",
      }}
    >
      <PixIcon emoji={emoji} size={40} />
    </span>
  );
  /** A row's caption ("Name", "Maker"): fixed width on both cards so the rows line up. Never upper-cased. */
  const rowCaption = (i: number) =>
    hasCaptions ? (
      <span style={{ flexShrink: 0, width: APP_CAPTION_W, fontFamily: LABEL_FONT, fontSize: 11.5, fontWeight: 800, letterSpacing: "0.03em", color: "#5a7bb5", textAlign: "left" }}>
        {pieceLabels?.[i] ?? ""}
      </span>
    ) : null;
  /** Piece text on both cards: the swap-legible font, left-aligned, never upper-cased. */
  const pieceTextStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    fontFamily: TAG_FONT,
    fontSize: 15.5,
    fontWeight: 700,
    color: "#10223f",
    wordBreak: "break-word",
    lineHeight: 1.25,
    textAlign: "left",
  };

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

      {!showIntro && !finished && c && !app && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              🔍 Name Tag Check
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              {`${itemLabel} `}{Math.min(idx + 1, shown.length)} of {shown.length}
            </span>
          </div>

          {/* The REAL tag: a reference, never tappable. */}
          <div style={tagShell(true)}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8a5a12", marginBottom: 8 }}>
              {`✅ ${realLabel}`}
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
              {`❓ ${checkLabel}`}
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
              {boardPrompt}
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

      {/* App skin (Week 9): the same drill on two app-store listing cards. */}
      {!showIntro && !finished && c && app && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#a8ccff" }}>
              {`${itemLabel} ${Math.min(idx + 1, shown.length)} of ${shown.length}`}
            </span>
          </div>

          {/* The REAL app's listing: a reference, never tappable. */}
          <div style={listingShell(true)}>
            <div style={listingEyebrow}>
              <PixIcon emoji="✅" size={14} />
              {realLabel}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              {c.appIcon && appTile(c.appIcon)}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                {c.realChunks.map((t, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 36, padding: "5px 10px", borderRadius: 10, background: "rgba(255,255,255,0.72)", border: "2px solid rgba(43,127,255,0.16)" }}
                  >
                    {rowCaption(i)}
                    <span style={pieceTextStyle}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div aria-hidden style={{ textAlign: "center", color: accent, fontSize: 18, lineHeight: 1, margin: "5px 0" }}>⇣ compare ⇣</div>

          {/* The app to check: the same rows, tappable, nothing pre-marked. */}
          <div style={listingShell(false)}>
            <div style={listingEyebrow}>
              <PixIcon emoji="❓" size={14} />
              {checkLabel}
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              {c.appIcon && appTile(c.appIcon)}
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
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
                      whileTap={speaking || reduce ? undefined : { scale: 0.98 }}
                      style={{
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        minHeight: 46,
                        padding: "6px 10px",
                        borderRadius: 10,
                        // Every row the same paper and ink on every case.
                        background: "#ffffff",
                        border: "2px solid rgba(43,127,255,0.3)",
                        color: "#10223f",
                        cursor: speaking ? "wait" : "pointer",
                        overflow: "hidden",
                        textAlign: "left",
                      }}
                    >
                      {rowCaption(i)}
                      <span style={pieceTextStyle}>{ch.text}</span>
                      {/* Post-lock only: which pieces were swapped (warning) or matched (tick). */}
                      {sealed && (
                        <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center" }}>
                          <PixIcon emoji={ch.isWrong ? "⚠️" : "✅"} size={20} />
                        </span>
                      )}
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
                              right: sealed ? 40 : 12,
                              top: "50%",
                              y: "-50%",
                              padding: "3px 8px",
                              border: "3px solid #d5262e",
                              borderRadius: 6,
                              color: "#d5262e",
                              fontFamily: LABEL_FONT,
                              fontWeight: 900,
                              fontSize: 13,
                              letterSpacing: "0.12em",
                              textTransform: "uppercase",
                              background: "rgba(255,255,255,0.6)",
                              mixBlendMode: "multiply",
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
            </div>

            {/* The verdict seal lands only after a correct lock; the Raccoon pops out of a copycat. */}
            <AnimatePresence>
              {phase === "sealed" && (
                <motion.div
                  key="seal"
                  initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -20 }}
                  animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -6 }}
                  // A short fade, so the seal never lingers over the next app.
                  exit={{ opacity: 0, x: "-50%", transition: { duration: 0.12 } }}
                  transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: -14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 14px",
                    borderRadius: 10,
                    border: `4px double ${isCopycat ? "#ff5fb3" : "#34d399"}`,
                    color: isCopycat ? "#d5262e" : "#137a45",
                    background: "rgba(255,255,255,0.92)",
                    fontFamily: LABEL_FONT,
                    fontWeight: 900,
                    fontSize: 16,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    zIndex: 3,
                  }}
                >
                  <PixIcon emoji={isCopycat ? "⚠️" : "✅"} size={20} />
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
                  exit={{ opacity: 0, transition: { duration: 0.12 } }}
                  transition={{ type: "spring", stiffness: 260, damping: 16 }}
                  style={{ position: "absolute", right: -10, top: -40, height: 110, objectFit: "contain", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.6))", pointerEvents: "none", zIndex: 3 }}
                />
              )}
            </AnimatePresence>
          </div>

          <div style={{ textAlign: "center", marginTop: 20 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, marginBottom: 8, padding: "0 12px" }}>
              {boardPrompt}
            </div>
            <GameButton variant="primary" size="lg" icon="🔍" onClick={closeBooth} disabled={speaking}>
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
          statLines={[`${shown.length}/${shown.length} ${doneLabel}`, `${copycatsCaught} ${copycatsCaught === 1 ? caughtLabel.one : caughtLabel.many}`, completeLine]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
