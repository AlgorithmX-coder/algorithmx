"use client";

/**
 * LobbyDoors — the GATEKEEP drill (Week 6, "The Lobby Doors").
 *
 * A tap-only remake of the old drag "Lobby Keeper". Three neon lobby doors
 * stand across the top of the child's game lobby. Players arrive ONE AT A
 * TIME and stand at a door: a name plate, the same avatar for everyone, and a
 * TEAM BADGE only on players the child really knows. The child checks for the
 * badge, then taps LET IN or DENY. Wave 1 is an open lobby (mixed players).
 * Between waves a settings card offers ONE big button that flips Friends only
 * ON; in wave 2 the doors glow a calmer colour and every arrival wears a
 * badge, so the child SEES the setting doing the guarding for them.
 *
 * Why it is not the inspectors (owner: "we never copy an exercise"): nothing
 * is revealed or judged real/fake; the child is the bouncer of their own
 * lobby, and the second half changes the game itself (a setting) instead of
 * asking the same question again.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once and every player read aloud as they arrive (audio-only, `recordedOnly`,
 * taps held), a spoken verdict on every call (right: "That's right!" + why in
 * one take via VerdictVoice; wrong: WrongAnswerPanel speaks "Not quite." + the
 * teach line), hint tiers per player, a spoken payoff on the complete beat.
 * Players come in the AUTHORED order within a wave (the queue is the lesson);
 * the LET IN / DENY sides swap per player so position never encodes the
 * answer. Round 1 teaches itself: the right button breathes until tapped.
 * Nothing moves on a timer; nobody drifts; there is no lose state.
 */

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { fisherYates } from "@/app/lib/gameEngine/useShuffledOnce";
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

export interface LobbyPlayer {
  id: string;
  name: string;
  /** True for a real teammate (the child knows them): they wear the badge. */
  hasBadge: boolean;
  /** Sarah's read-aloud as the player steps up to the door. */
  readAloud: string;
  /** Sarah's reason on a correct call ("That's right!" + why). */
  why: string;
  /** Sarah's teach line on a wrong call. */
  whyWrong: string;
}

export interface LobbyWave {
  id: string;
  /** True once Friends only is guarding: every arrival is badged by authoring. */
  friendsOnly: boolean;
  /** Played in this order (the queue is the lesson; never shuffled). */
  players: LobbyPlayer[];
}

export interface LobbyToggleCard {
  title: string;
  text: string;
  buttonLabel: string;
  /** Sarah's read-aloud as the card appears. */
  readAloud: string;
  /** Sarah's reason after the flip ("That's right!" + why). */
  why: string;
}

export interface LobbyDoorsProps {
  /** Usually 2: wave 1 friendsOnly=false (mixed), wave 2 friendsOnly=true. */
  waves: LobbyWave[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  letInLabel?: string;
  denyLabel?: string;
  badgeLabel?: string;
  toggleLabel?: string;
  /** Shown between waves while Friends only is still OFF. */
  toggleCard?: LobbyToggleCard;
  /** fx.correct toasts. */
  letInToast?: string;
  denyToast?: string;
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

type Pick = "in" | "deny";

/** Three neon lanes, the same three on every play (not content). */
const DOOR_HUES = ["#38e1ff", "#ff5df1", "#ffd166"];
/** The calmer glow once Friends only is guarding. */
const CALM_HUE = "#7ee8c8";
/** One avatar for every player: nothing on the player hints at the answer
 *  except the badge itself, which is the evidence. */
const AVATAR = "🎮";
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
const PLATE_FONT = "'JetBrains Mono', 'Cascadia Mono', ui-monospace, Menlo, monospace";

export default function LobbyDoors({
  waves,
  introTitle = "The Lobby Doors",
  introSubtitle = "Check for the team badge, then let them in or keep them out.",
  introIcon = "🚪",
  letInLabel = "LET IN",
  denyLabel = "DENY",
  badgeLabel = "TEAM BADGE",
  toggleLabel = "Friends only",
  toggleCard,
  letInToast = "WELCOME!",
  denyToast = "DENIED!",
  wrongTitle = "Check the badge again!",
  completeTitle = "Lobby safe!",
  completeLine = "Only real friends got in.",
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
}: LobbyDoorsProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#38e1ff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [pos, setPos] = useState({ w: 0, p: 0 });
  // Read-aloud chain: the how-to once as the board appears, then each player
  // (or the settings card) as it arrives. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "sealed" = a correct call: the door answers while Sarah says why, then the
  // next player steps up. "settings" = the Friends only card between waves.
  const [phase, setPhase] = useState<"play" | "sealed" | "settings">("play");
  const [choice, setChoice] = useState<Pick | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [playerWrongs, setPlayerWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [welcomed, setWelcomed] = useState(0);
  const [denied, setDenied] = useState(0);
  const [guidedTaps, setGuidedTaps] = useState(0);
  const [friendsOn, setFriendsOn] = useState(false);
  // Which side LET IN sits on, per player position: balanced (about half left,
  // half right) then shuffled, decided when the board opens (a callback, never
  // a state initializer, so the server and first client render agree). A
  // two-item useShuffledOnce would always return the reversed order, so the
  // sides would never vary; this is the PauseDecide precedent instead.
  const [inOnRight, setInOnRight] = useState<boolean[]>([]);

  const wave = waves[pos.w];
  const player = wave?.players[pos.p];
  const finished = pos.w >= waves.length;
  const served = waves.slice(0, pos.w).reduce((n, wv) => n + wv.players.length, 0) + pos.p;
  const total = waves.reduce((n, wv) => n + wv.players.length, 0);
  const doorIdx = served % DOOR_HUES.length;
  const calm = friendsOn || !!wave?.friendsOnly;
  // Round 1 teaches itself: the right button breathes until the child taps it.
  const guided = served === 0 && guidedTaps === 0;
  const flipped = inOnRight[served] ?? false;

  // Spoken verdicts: Sarah says "That's right!" + why and the next player
  // waits for her. Wrong calls speak through WrongAnswerPanel.
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

  const startBoard = () => {
    setShowIntro(false);
    const flip = Math.random() < 0.5;
    setInOnRight(fisherYates(Array.from({ length: total }, (_, i) => (i % 2 === 1) !== flip)));
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setChoice(null);
    setPlayerWrongs(0);
    setPhase("play");
    const nextP = pos.p + 1;
    if (wave && nextP < wave.players.length) {
      setPos({ w: pos.w, p: nextP });
      setNarr(isAudioMuted() ? "idle" : "read");
      return;
    }
    const nextW = pos.w + 1;
    setPos({ w: nextW, p: 0 });
    if (nextW >= waves.length) {
      setNarr("idle");
      return;
    }
    // Between waves: the settings card, while Friends only is still OFF.
    if (toggleCard && !friendsOn) setPhase("settings");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const decide = (pick: Pick) => {
    if (!wave || !player || speaking || phase !== "play") return;
    const right = player.hasBadge ? pick === "in" : pick === "deny";
    onAnswered?.({
      questionKey: `lobby-${wave.id}-${player.id}`,
      selectedIndex: pick === "in" ? 0 : 1,
      correctIndex: player.hasBadge ? 0 : 1,
      wasCorrect: right,
    });
    if (right) {
      fx.correct({ xp: 25, text: player.hasBadge ? letInToast : denyToast });
      onCorrect?.();
      if (player.hasBadge) setWelcomed((n) => n + 1);
      else setDenied((n) => n + 1);
      setGuidedTaps((n) => (n === 0 ? 1 : n));
      setChoice(pick);
      setPhase("sealed");
      // Sarah: "That's right!" + the player's why; the door answers under her,
      // then the next player steps up.
      verdict.say("right", player.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const pw = playerWrongs + 1;
      setPlayerWrongs(pw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself.
      setFeedback({ title: wrongTitle, explanation: player.whyWrong, tip: pw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const flipFriendsOnly = () => {
    if (!toggleCard || speaking || friendsOn) return;
    setFriendsOn(true);
    fx.correct({ xp: 15, text: `${toggleLabel.toUpperCase()}: ON` });
    onCorrect?.();
    verdict.say("right", toggleCard.why, () => {
      window.setTimeout(() => {
        setPhase("play");
        setNarr(isAudioMuted() ? "idle" : "read");
      }, reduce ? 200 : 700);
    });
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = playerWrongs >= 2 ? hints?.tier2 : playerWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (playerWrongs >= 2 ? 2 : 1) as 1 | 2;
  const buttons: { pick: Pick; label: string }[] = flipped
    ? [{ pick: "deny", label: denyLabel }, { pick: "in", label: letInLabel }]
    : [{ pick: "in", label: letInLabel }, { pick: "deny", label: denyLabel }];
  const strip =
    phase === "settings"
      ? friendsOn
        ? `${toggleLabel} is ON. Your lobby is guarded.`
        : `Tap the button to turn ${toggleLabel} ON`
      : guided
        ? "Round 1: the glowing button is the right call. Tap it!"
        : `Look for the ${badgeLabel}, then tap ${letInLabel} or ${denyLabel}`;

  const pill = (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px 4px 6px",
        borderRadius: 999,
        border: `1px solid ${friendsOn ? CALM_HUE : "rgba(255,255,255,0.25)"}`,
        background: friendsOn ? `${CALM_HUE}22` : "rgba(255,255,255,0.06)",
        boxShadow: friendsOn ? `0 0 14px ${CALM_HUE}66` : "none",
        color: friendsOn ? CALM_HUE : "rgba(255,247,230,0.6)",
        fontFamily: LABEL_FONT,
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      <span style={{ position: "relative", width: 26, height: 14, borderRadius: 999, background: friendsOn ? CALM_HUE : "rgba(255,255,255,0.2)" }}>
        <motion.span
          animate={{ x: friendsOn ? 12 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ position: "absolute", top: 2, left: 2, width: 10, height: 10, borderRadius: "50%", background: friendsOn ? "#04140f" : "#fff" }}
        />
      </span>
      {toggleLabel}: {friendsOn ? "ON" : "OFF"}
    </span>
  );

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

      {/* Sarah's read-alouds (audio only): the how-to once, then each player or the settings card. */}
      {!showIntro && !finished && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="ld-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && phase === "settings" && toggleCard && (
            <InfoNarration key={`ld-toggle-${pos.w}`} speaker={voice} lines={[toggleCard.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && phase !== "settings" && player && (
            <InfoNarration key={`ld-read-${player.id}`} speaker={voice} lines={[player.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && wave && player && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              🚪 {introTitle}
            </span>
            {pill}
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Player {Math.min(served + 1, total)} of {total}
            </span>
          </div>

          {/* The lobby: three doors, one arrival. */}
          <div
            style={{
              margin: "0 14px",
              padding: "12px 12px 14px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(10,12,34,0.94) 0%, rgba(16,10,40,0.96) 100%)",
              border: `1px solid ${(calm ? CALM_HUE : accent)}55`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), 0 0 28px ${(calm ? CALM_HUE : accent)}22`,
              color: "#fff7e6",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
              {DOOR_HUES.map((laneHue, i) => {
                const hue = calm ? CALM_HUE : laneHue;
                const active = i === doorIdx && phase !== "settings";
                const open = active && phase === "sealed" && choice === "in";
                return <Door key={i} hue={hue} label={`Door ${i + 1}`} active={active} open={open} reduce={reduce} />;
              })}

              {phase === "settings" && toggleCard ? (
                /* The settings card: one big button that flips Friends only ON. */
                <div
                  style={{
                    gridColumn: "1 / -1",
                    marginTop: 4,
                    padding: "14px 16px 16px",
                    borderRadius: 16,
                    background: "rgba(255,255,255,0.06)",
                    border: `1px solid ${CALM_HUE}66`,
                    boxShadow: `0 0 24px ${CALM_HUE}22`,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: CALM_HUE, marginBottom: 6 }}>
                    <PixIcon emoji="⚙️" size={14} /> Lobby settings
                  </div>
                  <div style={{ fontFamily: KID_FONT, fontSize: 20, fontWeight: 900, marginBottom: 6 }}>{toggleCard.title}</div>
                  <p style={{ margin: "0 auto 12px", maxWidth: 460, fontFamily: KID_FONT, fontSize: 15, fontWeight: 650, lineHeight: 1.4, color: "#e7ecff" }}>
                    {toggleCard.text}
                  </p>
                  <div style={{ marginBottom: 12 }}>{pill}</div>
                  <GameButton variant="primary" size="lg" onClick={flipFriendsOnly} disabled={speaking || friendsOn}>
                    {toggleCard.buttonLabel}
                  </GameButton>
                </div>
              ) : (
                /* The arrival, standing at the active door. */
                <motion.div
                  key={player.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                  animate={
                    phase === "sealed" && choice === "in"
                      ? reduce ? { opacity: 0 } : { opacity: 0, y: -110, x: 0, scale: 0.55, rotate: 0 }
                      : phase === "sealed" && choice === "deny"
                        ? reduce ? { opacity: 0 } : { opacity: 0, x: 90, y: 0, scale: 1, rotate: 6 }
                        : { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }
                  }
                  transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 200, damping: 20, delay: phase === "sealed" ? 0.3 : 0 }}
                  style={{
                    gridColumn: doorIdx + 1,
                    marginTop: -6,
                    padding: "10px 10px 8px",
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.16)",
                    boxShadow: "0 14px 30px -18px rgba(0,0,0,0.8)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    minWidth: 0,
                  }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center", background: "radial-gradient(circle at 50% 32%, #46508a 0%, #1a2150 70%)", border: "2px solid rgba(255,255,255,0.28)" }}>
                    <PixIcon emoji={AVATAR} size={36} />
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(8,10,22,0.7)", border: "1px solid rgba(255,255,255,0.18)", fontFamily: PLATE_FONT, fontSize: 14, fontWeight: 700, maxWidth: "100%", overflowWrap: "anywhere", textAlign: "center" }}>
                    {player.name}
                  </div>
                  {/* The badge row keeps its height whether or not there is a badge, so the card never jumps. */}
                  <div style={{ minHeight: 26, display: "flex", alignItems: "center" }}>
                    {player.hasBadge && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: "linear-gradient(135deg, #ffe9a8, #f5c96b)", border: "1px solid #c99a4a", color: "#3a2a08", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", boxShadow: "0 0 12px rgba(245,201,107,0.55)" }}>
                        <PixIcon emoji="🏅" size={14} /> {badgeLabel}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            <div style={{ marginTop: 10, textAlign: "center", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: calm ? CALM_HUE : "rgba(255,247,230,0.5)" }}>
              Wave {Math.min(pos.w + 1, waves.length)} of {waves.length} · {calm ? `${toggleLabel} lobby` : "Open lobby"}
            </div>
          </div>

          {/* On-board instructions + the two calls (identical buttons, sides swapped per player). */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, marginBottom: 10, padding: "0 16px" }}>
              {strip}
            </div>
            {phase !== "settings" && (
              <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
                {buttons.map((b) => {
                  const right = player.hasBadge ? b.pick === "in" : b.pick === "deny";
                  const glow = guided && right && !speaking;
                  return (
                    <motion.div
                      key={b.pick}
                      animate={glow && !reduce ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                      transition={glow && !reduce ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
                      style={{ display: "inline-block", borderRadius: 14, boxShadow: glow ? `0 0 0 5px ${accent}55, 0 0 26px ${accent}99` : undefined }}
                    >
                      <GameButton variant="primary" size="lg" onClick={() => decide(b.pick)} disabled={speaking} style={{ minWidth: 170 }}>
                        {b.label}
                      </GameButton>
                    </motion.div>
                  );
                })}
              </div>
            )}
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
          statLines={[
            `${welcomed} friend${welcomed === 1 ? "" : "s"} welcomed, ${denied} stranger${denied === 1 ? "" : "s"} kept out`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}

/** One neon lobby door: a marquee label and two panels that slide apart when
 *  a badged player is let in. Identical build on every lane; only the hue and
 *  the active glow change. */
function Door({ hue, label, active, open, reduce }: { hue: string; label: string; active: boolean; open: boolean; reduce: boolean }) {
  const slide = reduce ? { duration: 0.2 } : { type: "spring" as const, stiffness: 170, damping: 22 };
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        height: 150,
        borderRadius: "16px 16px 6px 6px",
        border: `2px solid ${hue}${active ? "" : "66"}`,
        background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.28) 100%)",
        boxShadow: active ? `0 0 0 3px ${hue}33, 0 0 28px ${hue}77` : `0 0 12px ${hue}22`,
        overflow: "hidden",
        transition: "box-shadow 300ms ease, border-color 300ms ease",
      }}
    >
      <div style={{ position: "absolute", top: 7, left: 0, right: 0, textAlign: "center", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: hue, opacity: active ? 1 : 0.7 }}>
        {label}
      </div>
      <div style={{ position: "absolute", left: "18%", right: "18%", top: 30, bottom: 0, borderRadius: "12px 12px 0 0", background: `${hue}1f`, border: `1px solid ${hue}55`, borderBottom: "none", overflow: "hidden", display: "flex" }}>
        <motion.div
          animate={{ x: open ? "-100%" : "0%" }}
          transition={slide}
          style={{ flex: 1, background: `linear-gradient(90deg, ${hue}66, ${hue}2a)`, borderRight: `1px solid ${hue}99` }}
        />
        <motion.div
          animate={{ x: open ? "100%" : "0%" }}
          transition={slide}
          style={{ flex: 1, background: `linear-gradient(270deg, ${hue}66, ${hue}2a)`, borderLeft: `1px solid ${hue}99` }}
        />
      </div>
    </div>
  );
}
