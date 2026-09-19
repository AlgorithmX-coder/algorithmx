"use client";

/**
 * RadioRoll: the NAME YOUR TEAM drill (Week 11, "The Radio Roll").
 *
 * The lighthouse keeps one warm radio, and the radio has a dial. The child
 * turns the dial to a channel (the dial is never judged, it just tunes, and
 * Sarah reads the channel out as it lights up) and then taps the one big CALL
 * button. That is the only judged tap in the whole game. Tune to a trusted
 * grown-up and they answer warmly in the radio window, in their own words,
 * and their name lands on the team board along the bottom. Tune to a channel
 * that cannot help and nothing frightening happens at all: it is just static,
 * or a voice that cannot help from there, or someone the child only knows
 * from online. Sarah says why that channel is no help, the channel stays on
 * the dial wearing "no help", and the radio waits. Nothing is lost, nobody is
 * blamed, and there is no timer, no lose state and no way to get the child
 * into trouble for turning the dial.
 *
 * The win is not a score. The win is a board at the bottom of the screen with
 * three real people on it, in the child's own lighthouse: "these are the
 * grown-ups who have got you".
 *
 * Why it is not the Ask Ring or Who Would Know (owner: "we never copy an
 * exercise"): the Ask Ring asks every friend in a photo about one picture and
 * never judges an ask, and Who Would Know weighs one wild claim against the
 * source that could really check it. Here nothing is being checked and nothing
 * is being weighed. The child is building a keepsake: a roster of their own
 * people, assembled one warm answer at a time, and the same board fills across
 * the whole game rather than resetting every round.
 *
 * Sensitive week: NO Raccoon in this beat (there is deliberately no `threat`
 * prop on this engine), no alarm colours, no scary sound, and every wrong
 * channel is a shrug, never a scare.
 *
 * Learn-Loop wiring: Sarah's how-to once as the radio warms up, every channel
 * label read aloud as the dial lands on it (audio-only, `recordedOnly`, taps
 * held, released by the shared SPOKEN_GATE_MAX_MS), a one-take spoken verdict
 * on CALL ("That's right!" + that grown-up's `why` via VerdictVoice, which is
 * the same sentence printed in the radio window, so there is never a second
 * voice over the first; no help: WrongAnswerPanel speaks "Not quite." + that
 * channel's `explanation`), hint tiers, and a payoff on the complete beat that
 * is gated on `!verdict.speaking` so it can never cut Sarah off. The dial is
 * shuffled once per play, so the team is never in the same place twice. The
 * first call guides the MECHANIC only: the CALL button breathes, and the strip
 * says to turn the dial first. Tap-only, untimed, no lose state.
 *
 * Authoring: give the dial at least `teamSize` channels with `isTeam: true`
 * (three is the shipped shape) and a few that cannot help. Keep a label to
 * about 22 characters, `why` and `explanation` to one kid-sized sentence each.
 * `why` is what the grown-up says back, in their voice; `explanation` is the
 * calm teach line for a channel that is no help, so every channel needs one.
 * Every icon must be in PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + radio 170 (eyebrow 16, window 84, tick strip 18,
 * gaps 16, padding and border 36) + gap 12 + CALL 78 + gap 12 + team board 108
 * (label 16, gap 6, slots 86) + strip 28 + hint gap 8 = ~481px, so the radio,
 * the CALL button, the whole team board and the strip are on screen without a
 * scroll. At 400px the team slots wrap into one column and nothing scrolls
 * sideways.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as WhoKnows / PausePower.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface RadioChannel { id: string; label: string; icon: string; isTeam: boolean; why: string; explanation: string; }
export interface RadioRollProps {
  channels: RadioChannel[];
  teamSize?: number;              // default 3: how many must be found
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  dialLabel?: string;             // default "TUNE THE RADIO"
  callLabel?: string;             // default "CALL"
  teamLabel?: string;             // default "MY TEAM"
  completeTitle?: string; completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void; onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/** Fixed copy the props above do not cover (engine chrome, not authored
 *  content). Warm on purpose: a channel that cannot help is a shrug. */
const JOIN_TOAST = "THEY JOINED YOUR TEAM!";
const NO_HELP_TITLE = "No help on that channel";
const NO_HELP_TAG = "NO HELP";
const ON_TEAM_TAG = "ON YOUR TEAM";
const EMPTY_SLOT = "Someone who has got you";

const EMPTY_CHANNELS: RadioChannel[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const RADIO_W = 560;
const WINDOW_H = 84;
const CALL_H = 78;
const SLOT_MIN_H = 86;
const SLOT_MIN_W = 150;
/** How long the warm answer sits in the window after Sarah finishes (ms). */
const SETTLE_MS = 900;
const SETTLE_MS_REDUCED = 200;
/** Paints. A warm wooden set on a dark coast: nothing here is an alarm. */
const RADIO_BODY = "linear-gradient(180deg, #33261c 0%, #180f0b 100%)";
const RADIO_WINDOW = "radial-gradient(120% 130% at 50% 18%, rgba(255,209,88,0.2) 0%, rgba(12,8,16,0.96) 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";

export default function RadioRoll({
  channels,
  teamSize = 3,
  introTitle = "The Radio Roll",
  introSubtitle = "Turn the dial, then tap CALL. Find the grown-ups who have got you.",
  introIcon = "📣",
  dialLabel = "TUNE THE RADIO",
  callLabel = "CALL",
  teamLabel = "MY TEAM",
  completeTitle = "Your team is on the board!",
  completeLine = "When something feels wrong, you tell one of these people. They have got you, Cyber Hero.",
  hints,
  introNarration,
  coachLines,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: RadioRollProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  // Read-aloud chain: the how-to once as the radio warms up, then the channel
  // label every time the dial lands. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "tune" | "idle">("idle");
  // Which slot on the dial the needle is sitting on (index into the shuffled
  // dial). Turning the dial is never judged.
  const [tuned, setTuned] = useState(0);
  // Bumped on every tune so the same channel can be read out twice.
  const [tuneSeq, setTuneSeq] = useState(0);
  // The grown-ups who have answered, in the order they joined.
  const [team, setTeam] = useState<RadioChannel[]>([]);
  // The one answering right now: their warm words sit in the window while
  // Sarah speaks them, then the radio goes quiet again.
  const [answering, setAnswering] = useState<RadioChannel | null>(null);
  // Channels already called that had no help (by channel id).
  const [noHelpIds, setNoHelpIds] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  // Wrongs since the last grown-up joined (drives the hint tier on the board).
  const [sinceJoin, setSinceJoin] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The dial is shuffled once per play, so the team is never in the same place
  // twice. The authored list stays the reference for the dashboard indexes.
  const dial = useShuffledOnce(channels ?? EMPTY_CHANNELS, { key: "radio-dial" });
  const here: RadioChannel | undefined = dial[tuned];
  // Never ask for more team than the week actually authored.
  const teamTotal = channels.filter((c) => c.isTeam).length;
  const needed = Math.max(1, Math.min(teamSize, teamTotal));
  const finished = team.length >= needed;
  const teamIds = new Set(team.map((c) => c.id));
  const calls = team.length + noHelpIds.size;
  // The first call teaches the mechanic only: the CALL button breathes, and
  // the strip says to turn the dial first. No channel is ever glowed.
  const guided = calls === 0;

  // Spoken verdicts: Sarah says "That's right!" + the grown-up's own words,
  // and the radio waits for her. No-help calls speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || answering !== null;
  // The board stays up while the last grown-up is still answering: the payoff
  // only mounts once the team is full AND Sarah has finished (the Week 9 bug).
  const settled = finished && answering === null && !verdict.speaking;

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
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "tune");
  };

  /* ───────── TUNE: never judged, never wrong, never lost ───────── */
  const tune = (dir: 1 | -1) => {
    if (speaking || finished || dial.length === 0) return;
    audio.tap();
    setTuned((i) => (i + dir + dial.length) % dial.length);
    setTuneSeq((n) => n + 1);
    setNarr(isAudioMuted() ? "idle" : "tune");
  };

  /* ───────── CALL: the only judged tap ───────── */
  const call = () => {
    if (!here || speaking || finished) return;
    const already = teamIds.has(here.id) || noHelpIds.has(here.id);
    if (already) return;
    onAnswered?.({
      questionKey: `radioroll-slot${team.length + 1}`,
      // Indexes are into the AUTHORED channel list, whatever slot the shuffle
      // put a channel in, so the dashboard always reads the same numbers.
      selectedIndex: channels.indexOf(here),
      correctIndex: channels.findIndex((c) => c.isTeam && !teamIds.has(c.id)),
      wasCorrect: here.isTeam,
    });
    if (here.isTeam) {
      fx.correct({ xp: 25, text: JOIN_TOAST });
      onCorrect?.();
      setAnswering(here);
      setTeam((prev) => [...prev, here]);
      setSinceJoin(0);
      // Sarah: "That's right!" + this grown-up's own words (the same sentence
      // printed in the radio window), then the radio goes quiet. Clearing from
      // her callback is what keeps a payoff from ever cutting her off.
      verdict.say("right", here.why, () => {
        window.setTimeout(() => setAnswering(null), reduce ? SETTLE_MS_REDUCED : SETTLE_MS);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setNoHelpIds((prev) => new Set(prev).add(here.id));
      setTotalWrongs((n) => n + 1);
      const sj = sinceJoin + 1;
      setSinceJoin(sj);
      // WrongAnswerPanel speaks "Not quite." + this calm teach line itself. The
      // channel stays on the dial, so the retry is one turn and one tap.
      setFeedback({ title: NO_HELP_TITLE, explanation: here.explanation, tip: sj >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = sinceJoin >= 2 ? hints?.tier2 : sinceJoin === 1 ? hints?.tier1 : undefined;
  const hintTier = (sinceJoin >= 2 ? 2 : 1) as 1 | 2;
  const onTeam = here ? teamIds.has(here.id) : false;
  const ruledOut = here ? noHelpIds.has(here.id) : false;
  const callable = !!here && !onTeam && !ruledOut && !finished;
  const callGlow = guided && callable && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "rrGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = answering
    ? JOIN_TOAST
    : guided
      ? "Turn the dial to a channel, then tap CALL"
      : onTeam
        ? "They are already on your team. Turn the dial"
        : ruledOut
          ? "No help there. Turn the dial and try another"
          : sinceJoin > 0
            ? "Who is a grown-up who really looks after you? Call them"
            : `Keep going. ${needed - team.length} more on your team`;

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The radio: dial, window, tick strip ───────── */
  const arrow = (dir: 1 | -1): ReactNode => (
    <button
      type="button"
      aria-label={dir === 1 ? "Turn the dial forward" : "Turn the dial back"}
      onClick={() => tune(dir)}
      disabled={speaking || finished}
      style={{
        flexShrink: 0,
        width: 52,
        height: 52,
        borderRadius: 16,
        display: "grid",
        placeItems: "center",
        background: "rgba(255,209,88,0.12)",
        border: "2px solid rgba(255,209,88,0.5)",
        color: "#ffe3a3",
        fontFamily: LABEL_FONT,
        fontSize: 20,
        fontWeight: 900,
        lineHeight: 1,
        cursor: speaking || finished ? "wait" : "pointer",
        touchAction: "manipulation",
        opacity: speaking || finished ? 0.55 : 1,
        transition: "opacity 160ms ease, background 160ms ease",
      }}
    >
      {dir === 1 ? "›" : "‹"}
    </button>
  );

  const radio: ReactNode = here ? (
    <div
      style={{
        width: RADIO_W,
        maxWidth: "100%",
        borderRadius: 24,
        background: RADIO_BODY,
        border: `2px solid ${accent}88`,
        boxShadow: `0 0 0 3px ${accent}1f, 0 18px 36px -20px rgba(0,0,0,0.9)`,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        color: "#fff7e6",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="📣" size={16} />
        <span>{dialLabel}</span>
      </div>

      {/* Dial row: turn back, the lit window, turn forward. */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {arrow(-1)}
        <div
          role="status"
          style={{
            flex: 1,
            minWidth: 0,
            minHeight: WINDOW_H,
            borderRadius: 18,
            background: RADIO_WINDOW,
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.55)",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            overflow: "hidden",
          }}
        >
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              width: 52,
              height: 52,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "rgba(8,6,14,0.5)",
              border: `2px solid ${answering ? "#7ee2a8" : "rgba(255,209,88,0.55)"}`,
              transition: "border-color 220ms ease",
            }}
          >
            <PixIcon emoji={answering ? answering.icon : here.icon} size={34} />
          </span>
          <AnimatePresence mode="wait">
            {answering ? (
              // The grown-up answers in their own words, which is exactly the
              // sentence Sarah is speaking: one voice, one line, no echo.
              <motion.span
                key={`ans-${answering.id}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.24 }}
                style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}
              >
                <span style={{ ...eyebrowStyle, color: "#7ee2a8", overflowWrap: "anywhere" }}>{answering.label}</span>
                <span style={{ fontFamily: KID_FONT, fontSize: 14.5, fontWeight: 700, lineHeight: 1.3, color: "#fff7e6", overflowWrap: "anywhere" }}>
                  &ldquo;{answering.why}&rdquo;
                </span>
              </motion.span>
            ) : (
              <motion.span
                key={`ch-${here.id}-${tuneSeq}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.22 }}
                style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}
              >
                <span style={{ ...eyebrowStyle, color: "rgba(255,227,163,0.75)" }}>
                  Channel {tuned + 1} of {dial.length}
                </span>
                <span style={{ fontFamily: KID_FONT, fontSize: 17, fontWeight: 800, lineHeight: 1.2, color: "#fff7e6", overflowWrap: "anywhere" }}>
                  {here.label}
                </span>
                {(onTeam || ruledOut) && (
                  <span
                    style={{
                      alignSelf: "flex-start",
                      marginTop: 1,
                      padding: "2px 8px",
                      borderRadius: 999,
                      fontFamily: LABEL_FONT,
                      fontSize: 9.5,
                      fontWeight: 900,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      background: onTeam ? "rgba(126,226,168,0.16)" : "rgba(255,255,255,0.1)",
                      border: `1px solid ${onTeam ? "rgba(126,226,168,0.6)" : "rgba(255,255,255,0.25)"}`,
                      color: onTeam ? "#a7f0c4" : "rgba(255,247,230,0.7)",
                    }}
                  >
                    {onTeam ? ON_TEAM_TAG : NO_HELP_TAG}
                  </span>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {arrow(1)}
      </div>

      {/* Tick strip: where the needle is sitting on the dial. Every tick looks
          the same until a channel has actually been called. */}
      <div aria-hidden style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, minHeight: 18 }}>
        {dial.map((c, i) => {
          const joined = teamIds.has(c.id);
          const dead = noHelpIds.has(c.id);
          const at = i === tuned;
          return (
            <span
              key={c.id}
              style={{
                width: at ? 6 : 3,
                height: at ? 18 : joined || dead ? 12 : 9,
                borderRadius: 3,
                background: joined ? "#7ee2a8" : dead ? "rgba(255,247,230,0.25)" : at ? accent : "rgba(255,209,88,0.45)",
                boxShadow: at ? `0 0 10px ${accent}aa` : "none",
                transition: "height 180ms ease, background 220ms ease",
              }}
            />
          );
        })}
      </div>
    </div>
  ) : null;

  /* ───────── CALL: one big button, the only judged tap ───────── */
  const callButton: ReactNode = (
    <button
      type="button"
      aria-label={callLabel}
      onClick={call}
      disabled={speaking || !callable}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        width: 300,
        maxWidth: "100%",
        minHeight: CALL_H,
        padding: "14px 20px",
        borderRadius: 22,
        background: callable
          ? `linear-gradient(180deg, ${accent}dd 0%, ${accent}88 100%)`
          : "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.05) 100%)",
        border: `3px solid ${callable ? accent : "rgba(255,255,255,0.22)"}`,
        color: callable ? "#0c1020" : "rgba(255,247,230,0.7)",
        fontFamily: LABEL_FONT,
        fontSize: 18,
        fontWeight: 900,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        lineHeight: 1.1,
        cursor: speaking ? "wait" : callable ? "pointer" : "default",
        touchAction: "manipulation",
        opacity: speaking ? 0.7 : 1,
        transition: "background 180ms ease, border-color 180ms ease, opacity 160ms ease",
        ...guideStyle(callGlow),
      }}
    >
      <PixIcon emoji="📣" size={30} />
      <span>{onTeam ? ON_TEAM_TAG : ruledOut ? NO_HELP_TAG : callLabel}</span>
    </button>
  );

  /* ───────── The team board: the keepsake this whole game is for ───────── */
  const teamBoard: ReactNode = (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="👪" size={16} />
        <span>{teamLabel}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
          {team.length} of {needed}
        </span>
      </div>
      <div
        role="list"
        aria-label={teamLabel}
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
      >
        {Array.from({ length: needed }, (_, i) => {
          const member = team[i];
          return (
            <motion.div
              key={member ? `m-${member.id}` : `slot-${i}`}
              role="listitem"
              aria-label={member ? member.label : EMPTY_SLOT}
              initial={member && !reduce ? { opacity: 0, y: 12, scale: 0.96 } : false}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 340, damping: 20 }}
              style={{
                flex: `1 1 ${SLOT_MIN_W}px`,
                minWidth: 0,
                minHeight: SLOT_MIN_H,
                padding: "10px 12px",
                borderRadius: 16,
                // A filled slot is warm paper. An empty one is a quiet outline,
                // never a gap that looks like a mistake.
                background: member ? PAPER : "rgba(0,0,0,0.2)",
                border: member ? "3px solid #ffffff" : "2px dashed rgba(255,247,230,0.28)",
                boxShadow: member ? "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)" : "none",
                color: member ? INK : "rgba(255,247,230,0.55)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                textAlign: "center",
                fontFamily: KID_FONT,
                fontSize: 14,
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              <PixIcon emoji={member ? member.icon : "❓"} size={member ? 32 : 24} />
              <span style={{ overflowWrap: "anywhere" }}>{member ? member.label : EMPTY_SLOT}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

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
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then every channel
          the dial lands on. */}
      {!showIntro && !settled && here && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="rr-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("tune")} />
          )}
          {narr === "tune" && (
            <InfoNarration key={`rr-tune-${tuneSeq}-${here.id}`} speaker={voice} lines={[here.label]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !settled && here && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Team {team.length} of {needed}
            </span>
          </div>

          {/* The board: the radio, the CALL button, the team. Inset 22px so it
              never collides with the frame's rounded corners. */}
          <div
            style={{
              margin: "0 22px",
              padding: "12px 12px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            {radio}
            {callButton}
            {teamBoard}
          </div>

          {/* On-board instructions: the current beat, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes rrGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          verdict is still speaking would cut her off (the Week 9 bug). */}
      {settled && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${team.length} trusted grown-up${team.length === 1 ? "" : "s"} on your team`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
