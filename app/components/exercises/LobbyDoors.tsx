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
 *
 * Every spoken string already arrives through props, and nothing below is a
 * component default that gets read aloud: each player's `readAloud`, `why`
 * and `whyWrong`, the toggle card's `readAloud` and `why`, `introNarration`,
 * `coachLines`, `threat.raccoonLine` and `completeNarration`. Which field is
 * spoken in which branch:
 *
 *    RIGHT call on a player  -> `why`       (VerdictVoice: "That's right!" + it)
 *    WRONG call on a player  -> `whyWrong`  (WrongAnswerPanel: "Not quite." + it)
 *    the settings-card flip  -> `why`       (VerdictVoice)
 *    each arrival, the card  -> `readAloud` (InfoNarration, audio only)
 *
 * A teach line put in the wrong one of those two per-player fields is SILENT
 * even when it is not empty.
 *
 * Skins are PAINT ONLY (the clip generator reads the week file, so a skin can
 * never carry a spoken word): "lobby" is Week 6's neon arcade lobby, shipped
 * and untouched; "hall" is Week 14's Listening House hallway at bedtime, its
 * second and final outing. Warm lamplight on oak instead of neon on black:
 * panelled house doors with brass room plates and light spilling out of them,
 * cream paper cards with a handwritten label, a brass wall switch instead of
 * the glass pill, and a warm plaster hall over a wainscot instead of the
 * arcade's dark glass. Same gatekeep mechanic on both; every word is a prop.
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
  /** Optional per-arrival emoji on the avatar disc. Falls back to
   *  `avatarEmoji`, then to the shared "🎮". Must be in PixIcon's MAP.
   *  Paint only: never spoken. */
  icon?: string;
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
  /**
   * Visual skin. "lobby" (default) = Week 6's neon arcade lobby, untouched.
   * "hall" = Week 14's Listening House hallway at bedtime: panelled house
   * doors with brass room plates, cream paper cards, a brass wall switch.
   * Paint and layout only — every word still comes from the props below.
   */
  skin?: "lobby" | "hall";
  /** Usually 2: wave 1 friendsOnly=false (mixed), wave 2 friendsOnly=true. */
  waves: LobbyWave[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  letInLabel?: string;
  denyLabel?: string;
  badgeLabel?: string;
  toggleLabel?: string;
  /** The emoji beside the board header. Default "🚪". Never spoken. */
  boardIcon?: string;
  /** The emoji on every arrival's avatar disc, unless the arrival sets its
   *  own `icon`. Default "🎮". Never spoken. */
  avatarEmoji?: string;
  /** The emoji inside the badge tag. Default "🏅". Never spoken. */
  badgeEmoji?: string;
  /** The three lane plates. Default ["Door 1", "Door 2", "Door 3"]. */
  doorLabels?: [string, string, string];
  /** The kicker over the settings card. Default "Lobby settings". */
  settingsKicker?: string;
  /** What a wave is called on the footer strip. Default "Wave". */
  roundLabel?: string;
  /** What one arrival is called in the counter. Default "Player". */
  unitLabel?: string;
  /** The footer strip before the setting is on. Default "Open lobby". */
  openLabel?: string;
  /** The footer strip once it is on. Default `${toggleLabel} lobby`. */
  guardedLabel?: string;
  /** The on-board strip once the setting is on and the card is still up.
   *  Default `${toggleLabel} is ON. Your lobby is guarded.`. */
  guardedStrip?: string;
  /** The round-1 strip. Teaches the MECHANIC only, never which button. */
  guidedStrip?: string;
  /** Complete-beat tally wording: [singular, plural] and the verb for each
   *  side. Defaults ["friend","friends"] / "welcomed" and
   *  ["stranger","strangers"] / "kept out". Never spoken. */
  welcomedNoun?: [string, string];
  welcomedVerb?: string;
  deniedNoun?: [string, string];
  deniedVerb?: string;
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

/* ── "hall" paints (Week 14). Warm lamplight on oak: a cream card that can be
      tapped is never painted on a ground near its own shade. ── */
/** Three lamplit doorways down the hall, the same three on every play. */
const HALL_HUES = ["#ffc98a", "#f0b972", "#d9a463"];
/** The calmer glow once the house switch is guarding. */
const HALL_CALM = "#a8d8b0";
/** The hall itself: warm plaster over an oak wainscot. */
const HALL_WALL = "linear-gradient(180deg, #3a2b1d 0%, #2b1f14 62%, #1b130c 100%)";
const HALL_FRAME = "linear-gradient(180deg, #2d2015 0%, #1d140c 55%, #120c07 100%)";
const HALL_PAPER = "#fdf3e3";
const HALL_INK = "#241c14";
const HALL_BRASS = "#e6b877";
const HALL_PLATE_FONT = KID_FONT;

export default function LobbyDoors({
  skin = "lobby",
  waves,
  introTitle = "The Lobby Doors",
  introSubtitle = "Check for the team badge, then let them in or keep them out.",
  introIcon = "🚪",
  letInLabel = "LET IN",
  denyLabel = "DENY",
  badgeLabel = "TEAM BADGE",
  toggleLabel = "Friends only",
  boardIcon = "🚪",
  avatarEmoji = AVATAR,
  badgeEmoji = "🏅",
  doorLabels,
  settingsKicker = "Lobby settings",
  roundLabel = "Wave",
  unitLabel = "Player",
  openLabel = "Open lobby",
  guardedLabel,
  guardedStrip,
  guidedStrip = "Round 1: the glowing button is the right call. Tap it!",
  welcomedNoun = ["friend", "friends"],
  welcomedVerb = "welcomed",
  deniedNoun = ["stranger", "strangers"],
  deniedVerb = "kept out",
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
  // Week 14's Listening House hallway. Paint and layout only: the mechanic,
  // the order of play and every spoken line are identical on both skins.
  const isHall = skin === "hall";
  const hues = isHall ? HALL_HUES : DOOR_HUES;
  const calmHue = isHall ? HALL_CALM : CALM_HUE;
  const plates = doorLabels ?? ["Door 1", "Door 2", "Door 3"];
  // The one colour the board paints itself with: the theme accent on the
  // arcade lobby, warm brass in the hall (a cyan rim on oak reads cold).
  const tone = isHall ? HALL_BRASS : accent;

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
        ? guardedStrip ?? `${toggleLabel} is ON. Your lobby is guarded.`
        : `Tap the button to turn ${toggleLabel} ON`
      : guided
        ? guidedStrip
        : `Look for the ${badgeLabel}, then tap ${letInLabel} or ${denyLabel}`;

  /* The switch, on the board header and again on the settings card. "lobby":
     a glass pill. "hall": a brass wall plate with a rocker that swings. */
  const pill = isHall ? (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "4px 10px 4px 6px",
        borderRadius: 6,
        border: `2px solid ${friendsOn ? HALL_CALM : "rgba(230,184,119,0.5)"}`,
        background: friendsOn ? "rgba(168,216,176,0.16)" : "rgba(230,184,119,0.10)",
        boxShadow: "inset 0 1px 0 rgba(255,236,200,0.3)",
        color: friendsOn ? HALL_CALM : HALL_BRASS,
        fontFamily: LABEL_FONT,
        fontSize: 10,
        fontWeight: 900,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {/* The rocker on the plate: it swings, it does not slide. */}
      <span style={{ position: "relative", width: 18, height: 26, borderRadius: 3, background: "linear-gradient(180deg, #f3e2c4, #cfae7d)", border: "1px solid rgba(63,44,24,0.45)", overflow: "hidden" }}>
        <motion.span
          animate={{ y: friendsOn ? 13 : 0 }}
          transition={{ duration: reduce ? 0 : 0.2 }}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 13, background: friendsOn ? HALL_CALM : "rgba(63,44,24,0.35)" }}
        />
      </span>
      {toggleLabel}: {friendsOn ? "ON" : "OFF"}
    </span>
  ) : (
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
    <ExerciseFrame maxWidth={820} decor background={isHall ? HALL_FRAME : undefined}>
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
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: isHall ? HALL_BRASS : accent }}>
              {boardIcon} {introTitle}
            </span>
            {pill}
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: isHall ? "#e8d6bb" : "#c9b8ff" }}>
              {unitLabel} {Math.min(served + 1, total)} of {total}
            </span>
          </div>

          {/* The lobby: three doors, one arrival. */}
          <div
            style={{
              margin: "0 14px",
              padding: "12px 12px 14px",
              borderRadius: 18,
              background: isHall ? HALL_WALL : "linear-gradient(180deg, rgba(10,12,34,0.94) 0%, rgba(16,10,40,0.96) 100%)",
              border: `1px solid ${(calm ? calmHue : tone)}55`,
              boxShadow: isHall
                ? `0 18px 40px -22px rgba(0,0,0,0.85), inset 0 2px 0 rgba(255,236,200,0.14)`
                : `0 18px 40px -22px rgba(0,0,0,0.8), 0 0 28px ${(calm ? CALM_HUE : accent)}22`,
              color: isHall ? "#fff3df" : "#fff7e6",
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
              {hues.map((laneHue, i) => {
                const hue = calm ? calmHue : laneHue;
                const active = i === doorIdx && phase !== "settings";
                const open = active && phase === "sealed" && choice === "in";
                return <Door key={i} hue={hue} label={plates[i]} active={active} open={open} reduce={reduce} hall={isHall} />;
              })}

              {phase === "settings" && toggleCard ? (
                /* The settings card: one big button that flips Friends only ON. */
                <div
                  style={{
                    gridColumn: "1 / -1",
                    marginTop: 4,
                    padding: "14px 16px 16px",
                    borderRadius: 16,
                    background: isHall ? "rgba(255,243,223,0.10)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${calmHue}66`,
                    boxShadow: isHall ? "inset 0 1px 0 rgba(255,236,200,0.22)" : `0 0 24px ${CALM_HUE}22`,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: calmHue, marginBottom: 6 }}>
                    <PixIcon emoji="⚙️" size={14} /> {settingsKicker}
                  </div>
                  <div style={{ fontFamily: KID_FONT, fontSize: 20, fontWeight: 900, marginBottom: 6 }}>{toggleCard.title}</div>
                  <p style={{ margin: "0 auto 12px", maxWidth: 460, fontFamily: KID_FONT, fontSize: 15, fontWeight: 650, lineHeight: 1.4, color: isHall ? "#f8ecd9" : "#e7ecff" }}>
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
                    // "hall": a cream paper card on the dark hall, so the thing
                    // being judged is never near its ground in luminance.
                    background: isHall ? HALL_PAPER : "rgba(255,255,255,0.07)",
                    border: isHall ? "2px solid rgba(63,44,24,0.35)" : "1px solid rgba(255,255,255,0.16)",
                    boxShadow: "0 14px 30px -18px rgba(0,0,0,0.8)",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    minWidth: 0,
                    color: isHall ? HALL_INK : undefined,
                  }}
                >
                  <div style={{ width: 56, height: 56, borderRadius: "50%", display: "grid", placeItems: "center", background: isHall ? "radial-gradient(circle at 50% 32%, #fffaf0 0%, #e2cfae 72%)" : "radial-gradient(circle at 50% 32%, #46508a 0%, #1a2150 70%)", border: isHall ? "2px solid rgba(63,44,24,0.3)" : "2px solid rgba(255,255,255,0.28)" }}>
                    <PixIcon emoji={player.icon ?? avatarEmoji} size={36} />
                  </div>
                  <div style={{ padding: "4px 10px", borderRadius: 8, background: isHall ? "rgba(63,44,24,0.10)" : "rgba(8,10,22,0.7)", border: isHall ? "1px solid rgba(63,44,24,0.28)" : "1px solid rgba(255,255,255,0.18)", fontFamily: isHall ? HALL_PLATE_FONT : PLATE_FONT, fontSize: 14, fontWeight: 700, maxWidth: "100%", overflowWrap: "anywhere", textAlign: "center" }}>
                    {player.name}
                  </div>
                  {/* The badge row keeps its height whether or not there is a badge, so the card never jumps. */}
                  <div style={{ minHeight: 26, display: "flex", alignItems: "center" }}>
                    {player.hasBadge && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: isHall ? 6 : 999, background: "linear-gradient(135deg, #ffe9a8, #f5c96b)", border: "1px solid #c99a4a", color: "#3a2a08", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", boxShadow: isHall ? "inset 0 1px 0 rgba(255,255,255,0.6)" : "0 0 12px rgba(245,201,107,0.55)" }}>
                        <PixIcon emoji={badgeEmoji} size={14} /> {badgeLabel}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </div>

            <div style={{ marginTop: 10, textAlign: "center", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: calm ? calmHue : isHall ? "rgba(255,243,223,0.6)" : "rgba(255,247,230,0.5)" }}>
              {roundLabel} {Math.min(pos.w + 1, waves.length)} of {waves.length} · {calm ? guardedLabel ?? `${toggleLabel} lobby` : openLabel}
            </div>
          </div>

          {/* On-board instructions + the two calls (identical buttons, sides swapped per player). */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: tone, marginBottom: 10, padding: "0 16px" }}>
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
                      style={{ display: "inline-block", borderRadius: 14, boxShadow: glow ? `0 0 0 5px ${tone}55, 0 0 26px ${tone}99` : undefined }}
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
            `${welcomed} ${welcomed === 1 ? welcomedNoun[0] : welcomedNoun[1]} ${welcomedVerb}, ${denied} ${denied === 1 ? deniedNoun[0] : deniedNoun[1]} ${deniedVerb}`,
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
 *  the active glow change.
 *
 *  `hall` (Week 14) draws the same lane as a panelled house door instead: a
 *  brass room plate over an oak frame, two moulded panels with a rail
 *  between them, and warm lamplight spilling out of the gap when it opens.
 *  Same geometry, same open/active states, different joinery. */
function Door({ hue, label, active, open, reduce, hall }: { hue: string; label: string; active: boolean; open: boolean; reduce: boolean; hall?: boolean }) {
  const slide = reduce ? { duration: 0.2 } : { type: "spring" as const, stiffness: 170, damping: 22 };
  if (hall) {
    return (
      <div
        aria-hidden
        style={{
          position: "relative",
          height: 150,
          borderRadius: "10px 10px 3px 3px",
          border: `3px solid ${active ? "#7d5a36" : "#5a4026"}`,
          background: "linear-gradient(180deg, #4a3520 0%, #33240f 100%)",
          boxShadow: active
            ? `0 0 0 3px ${hue}2e, 0 10px 26px -14px rgba(0,0,0,0.9)`
            : "0 8px 20px -16px rgba(0,0,0,0.9)",
          overflow: "hidden",
          transition: "box-shadow 300ms ease, border-color 300ms ease",
        }}
      >
        {/* The brass room plate, screwed to the frame above the door. */}
        <div
          style={{
            position: "absolute",
            top: 6,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "2px 9px",
            borderRadius: 3,
            background: "linear-gradient(180deg, #f0d3a0, #c79c5c)",
            border: "1px solid rgba(63,44,24,0.5)",
            fontFamily: LABEL_FONT,
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#3a2a08",
            opacity: active ? 1 : 0.72,
            maxWidth: "88%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </div>
        {/* The doorway. The lamplight behind it shows through as the leaves part. */}
        <div style={{ position: "absolute", left: "14%", right: "14%", top: 30, bottom: 0, borderRadius: "6px 6px 0 0", background: `linear-gradient(180deg, ${hue}cc, ${hue}55)`, border: "1px solid rgba(63,44,24,0.55)", borderBottom: "none", overflow: "hidden", display: "flex" }}>
          <motion.div
            animate={{ x: open ? "-100%" : "0%" }}
            transition={slide}
            style={{ flex: 1, background: "linear-gradient(90deg, #7a5730 0%, #5e4022 100%)", borderRight: "1px solid rgba(24,16,8,0.6)", boxShadow: "inset -2px 0 0 rgba(255,236,200,0.14), inset 0 0 0 3px rgba(0,0,0,0.12)" }}
          />
          <motion.div
            animate={{ x: open ? "100%" : "0%" }}
            transition={slide}
            style={{ flex: 1, background: "linear-gradient(270deg, #7a5730 0%, #5e4022 100%)", borderLeft: "1px solid rgba(24,16,8,0.6)", boxShadow: "inset 2px 0 0 rgba(255,236,200,0.14), inset 0 0 0 3px rgba(0,0,0,0.12)" }}
          />
        </div>
      </div>
    );
  }
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
