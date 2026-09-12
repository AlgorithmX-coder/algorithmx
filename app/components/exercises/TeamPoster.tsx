"use client";

/**
 * TeamPoster — the poster-building BUILD drill (Week 11 debut).
 *
 * A warm poster with empty slots and a tray of candidate tiles below.
 * Tap a tile that belongs → it flies up onto the next open slot with a
 * glow; tap one that doesn't → a gentle teach panel explains why the
 * poster is only for the real team. The poster completes when every
 * belonging tile is placed. Special tiles (e.g. the Childline number)
 * get a golden frame so they stand out on the finished poster.
 *
 * Re-dressable via the copy props (W11 My-Team poster; W19 family-rules
 * quilt is the earmarked reuse). Skin "case" (Week 3, "The Case Board"):
 * a detective's cork board with pinned clue cards - the whole-week review
 * where true fake-friend clues get pinned and the Raccoon's decoys get
 * turned away.
 *
 * Learn-Loop wiring (owner standards, 2026-09-11): the Raccoon's boast folds
 * into the intro (`threat`); Sarah reads each pinned tile's `note` aloud as
 * it lands (audio-only, `recordedOnly`), holding the tray until she finishes
 * (`speakNotes`); a spoken `completeNarration` payoff. The tray is shuffled
 * per play (never the authored order).
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;

const SPOKEN_GATE_MAX_MS = 15000;

export type TeamPosterSkin = "poster" | "case";

export interface PosterTile {
  id: string;
  /** Big label on the tile (e.g. "Mum or Dad", "Childline 0800 1111"). */
  label: string;
  /** Optional small line under the label. */
  detail?: string;
  /** Emoji rendered via PixIcon on the tile. */
  icon: string;
  /** True = belongs on the poster. */
  isTeam: boolean;
  /** Golden frame on the poster (e.g. the Childline tile). */
  special?: boolean;
  /** Teach copy: why it belongs / why it doesn't. */
  note: string;
}

export interface TeamPosterProps {
  tiles: PosterTile[];
  /** Visual skin: warm W11 poster (default) or the W3 detective cork board. */
  skin?: TeamPosterSkin;
  /** Copy overrides (re-theme per week; defaults keep the W11 team skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  posterTitle?: string;
  trayPrompt?: string;
  placedToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  /** Counter label under the board ("ON THE POSTER"). */
  countLabel?: string;
  /** Read each pinned tile's note aloud as it lands (recorded only). Default false. */
  speakNotes?: boolean;
  hints?: { tier1: string; tier2: string };
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

const SKINS = {
  poster: {
    boardBg: "linear-gradient(180deg, #fff7e6 0%, #ffe9c4 100%)",
    boardBorder: "3px solid #e8b64f",
    boardShadow: "0 18px 44px -20px rgba(0,0,0,0.75), 0 0 0 6px rgba(232,182,79,0.15)",
    titleColor: "#8a5a12",
    slotBorder: "rgba(138,90,18,0.4)",
    slotBg: "rgba(138,90,18,0.06)",
    slotMark: "rgba(138,90,18,0.45)",
    filledBorder: "#3fae5c",
    filledBg: "linear-gradient(165deg, #eaffef, #c8f5d4)",
    filledGlow: "0 0 20px -8px rgba(63,174,92,0.7)",
    filledText: "#2c5a1e",
    countColor: "#a5771f",
    pin: false,
    introTitle: "The My-Team Poster",
    introSubtitle: "Fill every slot with someone who's truly on your team - then it's up on the wall forever.",
    introIcon: "👪",
    posterTitle: "★ MY TEAM ★",
    trayPrompt: "Tap everyone who belongs on your team",
    placedToast: "ON THE TEAM!",
    wrongTitle: "Not for the poster",
    completeTitle: "Your team is ready!",
    completeLine: "Up on the wall - you are never, ever alone.",
    countLabel: "ON THE POSTER",
    accent: "#e8b64f",
  },
  case: {
    boardBg: "radial-gradient(circle at 20% 20%, #a8743f 0%, #8a5a2b 45%, #6f4520 100%)",
    boardBorder: "6px solid #3f2a17",
    boardShadow: "0 18px 44px -20px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(255,220,170,0.15)",
    titleColor: "#fff3d6",
    slotBorder: "rgba(255,240,210,0.45)",
    slotBg: "rgba(255,245,225,0.10)",
    slotMark: "rgba(255,240,210,0.6)",
    filledBorder: "#f5a623",
    filledBg: "linear-gradient(165deg, #fff9ea, #ffe9bf)",
    filledGlow: "0 8px 18px -8px rgba(0,0,0,0.6)",
    filledText: "#3a2a08",
    countColor: "#ffe0a3",
    pin: true,
    introTitle: "The Case Board",
    introSubtitle: "Pin every TRUE fake-friend clue to the board. Leave the Raccoon's decoys in the tray.",
    introIcon: "🔍",
    posterTitle: "🔍 MASK SPOTTER'S CASE BOARD",
    trayPrompt: "Tap a clue that belongs on the board",
    placedToast: "PINNED!",
    wrongTitle: "That's one of his decoys",
    completeTitle: "Case closed!",
    completeLine: "Every real clue pinned, every decoy left behind.",
    countLabel: "CLUES PINNED",
    accent: "#f5a623",
  },
} as const;

export default function TeamPoster({
  tiles,
  skin = "poster",
  introTitle,
  introSubtitle,
  introIcon,
  posterTitle,
  trayPrompt,
  placedToast,
  wrongTitle,
  completeTitle,
  completeLine,
  countLabel,
  speakNotes = false,
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
}: TeamPosterProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const sk = SKINS[skin];
  const voice = introNarration?.speaker ?? "adam";

  const [showIntro, setShowIntro] = useState(true);
  const [placedIds, setPlacedIds] = useState<string[]>([]);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [finished, setFinished] = useState(false);
  // Sarah reads the pinned tile's note; the tray waits for her.
  const [readTile, setReadTile] = useState<PosterTile | null>(null);
  const [noteSpeaking, setNoteSpeaking] = useState(false);
  // Case skin: the how-to is spoken inline (audio-only) with its text in the
  // tray prompt, instead of the floating CoachCaption toast, so nothing ever
  // sits on top of the bottom row of tiles (owner: captions never cover content).
  const inlineCoach = skin === "case";
  const [howto, setHowto] = useState(false);

  // Anti-sequence: the tray tiles are dealt in a random order every play
  // (authored lists alternate team/not-team). Poster slots fill in tap order.
  const shownTiles = useShuffledOnce(tiles);
  const teamTiles = shownTiles.filter((t) => t.isTeam);
  const placed = (id: string) => placedIds.includes(id);
  const allPlaced = teamTiles.length > 0 && placedIds.length >= teamTiles.length;

  useEffect(() => {
    if (!noteSpeaking) return;
    const id = window.setTimeout(() => setNoteSpeaking(false), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [noteSpeaking, readTile]);
  useEffect(() => {
    if (!howto) return;
    const id = window.setTimeout(() => setHowto(false), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [howto]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) { setNoteSpeaking(false); setHowto(false); } }), []);
  // Speak the how-to once as the board appears (case skin).
  useEffect(() => {
    if (!inlineCoach || showIntro || !coachLines || isAudioMuted()) return;
    setHowto(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inlineCoach, showIntro]);

  // Completion waits for the last spoken note so two voices never overlap.
  useEffect(() => {
    if (!allPlaced || finished || noteSpeaking) return;
    const t = window.setTimeout(() => setFinished(true), reduce ? 600 : 1400);
    return () => window.clearTimeout(t);
  }, [allPlaced, finished, noteSpeaking, reduce]);

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const held = noteSpeaking || howto;

  const tap = (tile: PosterTile, idx: number) => {
    if (showIntro || finished || placed(tile.id) || feedback || held) return;
    setHasInteracted(true);
    onAnswered?.({
      questionKey: `poster-${tile.id}`,
      selectedIndex: idx,
      correctIndex: idx,
      wasCorrect: tile.isTeam,
    });
    if (tile.isTeam) {
      audio.correct();
      fx.correct({ xp: 25, text: placedToast ?? sk.placedToast });
      onCorrect?.();
      setPlacedIds((prev) => [...prev, tile.id]);
      if (speakNotes && tile.note) {
        setReadTile(tile);
        if (!isAudioMuted()) setNoteSpeaking(true);
      }
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((c) => {
        const v = c + 1;
        reportTier(v);
        return v;
      });
      setFeedback({
        title: wrongTitle ?? sk.wrongTitle,
        explanation: tile.note,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  const cols = Math.min(teamTiles.length, skin === "case" ? 5 : 4);

  return (
    <ExerciseFrame maxWidth={820} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? sk.introTitle}
          subtitle={introSubtitle ?? sk.introSubtitle}
          icon={introIcon ?? sk.introIcon}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          overlay={skin === "case"}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Sarah's how-to (case skin) and the pinned clue's why (audio only; tray held). */}
      {inlineCoach && howto && coachLines && !showIntro && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          <InfoNarration
            key="tp-howto"
            speaker={coachLines.speaker ?? voice}
            lines={coachLines.lines}
            accent={sk.accent}
            recordedOnly
            onDone={() => setHowto(false)}
          />
        </div>
      )}
      {speakNotes && noteSpeaking && readTile && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          <InfoNarration
            key={`tp-note-${readTile.id}`}
            speaker={voice}
            lines={[readTile.note]}
            accent={sk.accent}
            recordedOnly
            onDone={() => setNoteSpeaking(false)}
          />
        </div>
      )}

      {/* The poster / board */}
      <div
        style={{
          maxWidth: skin === "case" ? 700 : 620,
          margin: "0 auto",
          borderRadius: 18,
          padding: "16px 16px 18px",
          background: sk.boardBg,
          border: sk.boardBorder,
          boxShadow: sk.boardShadow,
          position: "relative",
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 20,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: sk.titleColor,
            marginBottom: 12,
            textShadow: skin === "case" ? "0 2px 6px rgba(0,0,0,0.5)" : undefined,
          }}
        >
          {posterTitle ?? sk.posterTitle}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`,
            gap: 10,
          }}
        >
          {teamTiles.map((slotTile, slotIdx) => {
            const filledId = placedIds[slotIdx];
            const filled = filledId ? teamTiles.find((t) => t.id === filledId) : undefined;
            const tilt = skin === "case" ? ((slotIdx % 2 === 0 ? -1 : 1) * (1.5 + (slotIdx % 3))) : 0;
            return (
              <div
                key={slotTile.id}
                style={{
                  minHeight: 116,
                  borderRadius: skin === "case" ? 8 : 14,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 6px",
                  position: "relative",
                  transform: filled && tilt ? `rotate(${tilt}deg)` : undefined,
                  border: filled
                    ? `2.5px solid ${filled.special ? "#e8a413" : sk.filledBorder}`
                    : `2.5px dashed ${sk.slotBorder}`,
                  background: filled
                    ? filled.special
                      ? "linear-gradient(165deg, #fff3cf, #ffe08a)"
                      : sk.filledBg
                    : sk.slotBg,
                  boxShadow: filled
                    ? filled.special
                      ? "0 0 26px -6px rgba(232,164,19,0.8)"
                      : sk.filledGlow
                    : "none",
                }}
              >
                {filled && sk.pin && (
                  <span aria-hidden style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", display: "inline-flex" }}>
                    <PixIcon emoji="📌" size={20} />
                  </span>
                )}
                {filled ? (
                  <motion.div
                    initial={reduce ? false : { scale: 1.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}
                  >
                    <PixIcon emoji={filled.icon} size={34} />
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: sk.filledText, textAlign: "center", lineHeight: 1.25 }}>
                      {filled.label}
                    </span>
                    {filled.detail && (
                      <span style={{ fontSize: 10.5, fontWeight: 800, color: "#8a5a12", textAlign: "center" }}>{filled.detail}</span>
                    )}
                  </motion.div>
                ) : (
                  <span style={{ fontSize: 26, fontWeight: 900, color: sk.slotMark }}>?</span>
                )}
              </div>
            );
          })}
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 10,
            fontSize: 11.5,
            fontWeight: 800,
            letterSpacing: "0.08em",
            color: sk.countColor,
          }}
        >
          {placedIds.length}/{teamTiles.length} {countLabel ?? sk.countLabel}
        </div>
      </div>

      {/* The tray */}
      <div style={{ maxWidth: 680, margin: "16px auto 0" }}>
        <div
          role="status"
          style={{
            textAlign: "center",
            fontSize: 13.5,
            fontWeight: 800,
            color: howto ? "#ffe0a3" : "#cfe3ff",
            marginBottom: 10,
            transition: "color 0.3s",
          }}
        >
          {inlineCoach && howto && coachLines ? coachLines.lines.join(" ") : (trayPrompt ?? sk.trayPrompt)}
        </div>
        <div
          style={{
            display: "grid",
            // 9 clue cards on the case board read as a balanced 3x3; the poster keeps auto-fit.
            gridTemplateColumns: skin === "case" ? "repeat(3, minmax(0, 1fr))" : "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          <AnimatePresence>
            {shownTiles.map((tile, i) => {
              if (placed(tile.id)) return null;
              return (
                <motion.button
                  key={tile.id}
                  type="button"
                  onClick={() => tap(tile, i)}
                  onPointerEnter={() => audio.hover()}
                  disabled={showIntro || finished || !!feedback || held}
                  initial={reduce ? false : { y: 24, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { scale: 0.6, opacity: 0 }}
                  transition={{ delay: reduce ? 0 : 0.05 * i, type: "spring", stiffness: 260, damping: 22 }}
                  whileHover={reduce ? undefined : { y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 8px",
                    minHeight: 96,
                    borderRadius: 14,
                    border: "2px solid rgba(125,240,255,0.4)",
                    background: "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                    color: "#eaf9ff",
                    fontFamily: "inherit",
                    cursor: held ? "wait" : "pointer",
                    opacity: held ? 0.75 : 1,
                    boxShadow: "0 12px 26px -16px rgba(0,229,255,0.7)",
                    touchAction: "manipulation",
                  }}
                >
                  <PixIcon emoji={tile.icon} size={30} />
                  <span style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.25, textAlign: "center" }}>{tile.label}</span>
                  {tile.detail && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: "#9fb1ff", textAlign: "center" }}>{tile.detail}</span>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "10px auto 0" }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker={voice} text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker={voice} text={hints.tier2} />}
      </div>

      {!inlineCoach && coachLines && !showIntro && !hasInteracted && !finished && (
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
          title={completeTitle ?? sk.completeTitle}
          stars={stars}
          statLines={[
            `${teamTiles.length}/${teamTiles.length} ${(countLabel ?? sk.countLabel).toLowerCase()}`,
            completeLine ?? sk.completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(teamTiles.length)}
        />
      )}
    </ExerciseFrame>
  );
}
