"use client";

/**
 * RequestInspector — the "why are they asking?" drill (INSPECT).
 *
 * A cheerful app sign-up form arrives. Before the child may decide
 * anything, they must tap every inspect zone — who's asking, what they
 * want, whether the app NEEDS it, and what happens if they type it in.
 * Only then do the decision buttons unlock: "Looks fair" or "Too nosy!".
 *
 * Generalises the PhishInspector inspect-zones pattern with data-driven
 * zones and a form-card skin. Lane-clean: these apps LOOK legit — the
 * lesson is need-vs-want, not spotting fakes (that's Week 4's inspector).
 *
 * Sarah reads each clue aloud as it is tapped (audio-only, recordedOnly so
 * un-recorded weeks stay silent), and a request may carry an optional
 * `nudge` she speaks once every clue is open, holding the verdict buttons
 * until she finishes. Requests are shuffled per play (no sequence); the
 * four zones keep their fixed order because they ARE the procedure.
 */

import { useEffect, useMemo, useRef, useState } from "react";
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
import GameButton from "@/app/components/lesson/GameButton";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as PauseDecide / SignBingo.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;

// A held gate (verdict buttons waiting on Sarah) can never stick: InfoNarration
// fires onDone on end / error / blocked / no-recording, but not when the master
// mute stops it, so every hold also releases on mute and after this max.
const SPOKEN_GATE_MAX_MS = 15000;

export interface InspectZone {
  id: string;
  label: string;
  note: string;
  isRedFlag: boolean;
}

export interface InspectRequest {
  id: string;
  appName: string;
  appIcon: string;
  tagline: string;
  asksFor: string[];
  isNosy: boolean;
  zones: InspectZone[];
  verdictNote: string;
  /** Optional "Think!" line Sarah says once every clue is open, before the
   *  verdict. Read aloud; the verdict buttons unlock when she finishes.
   *  Omit for today's behaviour (opt-in per request). */
  nudge?: string;
}

export interface RequestInspectorProps {
  requests: InspectRequest[];
  hints?: { tier1: string; tier2: string };
  /** Card chip + intro re-dress (default the W2 sign-up-form skin). */
  badgeLabel?: string;
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Verdict button labels (defaults: "Looks fair - OK!" / "Too nosy - close it!"). */
  fairLabel?: string;
  nosyLabel?: string;
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

export default function RequestInspector({
  requests,
  hints,
  badgeLabel,
  introTitle,
  introSubtitle,
  introIcon,
  fairLabel,
  nosyLabel,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: RequestInspectorProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [inspected, setInspected] = useState<Set<string>>(new Set());
  const [decided, setDecided] = useState<null | "fair" | "nosy">(null);
  // Exercise-wide wrong count: drives the star rating + the reported hint tier.
  const [wrongCount, setWrongCount] = useState(0);
  // Per-request wrong count: drives the VISIBLE hint bubble, so request 1's
  // hint can never linger onto request 2 (the stale-hint bug).
  const [reqWrong, setReqWrong] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Read-aloud: the zone whose note Sarah is reading, and whether her voice is
  // still going (holds further taps + the verdict until she finishes).
  const [readZone, setReadZone] = useState<string | null>(null);
  const [zoneSpeaking, setZoneSpeaking] = useState(false);
  // Think nudge: true once Sarah has finished the nudge (or it never needed
  // to play), which unlocks the verdict buttons.
  const [nudgeDone, setNudgeDone] = useState(false);

  // NO SEQUENCE (owner rule): the forms arrive in a random order every play.
  // The four zones inside a form keep their fixed order: they are the procedure.
  const order = useShuffledOnce(requests);
  const total = requests.length;
  const finished = idx >= total;
  const req = order[idx];
  const allInspected = req ? req.zones.every((z) => inspected.has(z.id)) : false;
  const readNote = req && readZone ? req.zones.find((z) => z.id === readZone)?.note : undefined;
  const nudgeText = req?.nudge;
  // The Think nudge shows once every clue is open, before the verdict, and only
  // after Sarah has finished the last clue (so two lines never talk over each
  // other). Opt-in per request: no `nudge` = today's behaviour.
  const showNudge = !!nudgeText && allInspected && !decided && !zoneSpeaking;
  // The verdict waits while Sarah reads a clue, and until the nudge is done.
  const verdictHeld = zoneSpeaking || (!!nudgeText && !nudgeDone);

  // Reset per request when advancing (clues, verdict, hint, read-aloud, nudge).
  useEffect(() => {
    setInspected(new Set());
    setDecided(null);
    setReqWrong(0);
    setReadZone(null);
    setZoneSpeaking(false);
    setNudgeDone(false);
  }, [idx]);

  // Safety releases for the spoken gates (see SPOKEN_GATE_MAX_MS).
  useEffect(() => {
    if (!zoneSpeaking) return;
    const id = window.setTimeout(() => setZoneSpeaking(false), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [zoneSpeaking]);
  useEffect(() => {
    if (!showNudge || nudgeDone) return;
    // Muted = the nudge never plays, so nothing to wait for.
    if (isAudioMuted()) {
      setNudgeDone(true);
      return;
    }
    const id = window.setTimeout(() => setNudgeDone(true), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [showNudge, nudgeDone]);
  useEffect(
    () =>
      subscribeAudioMute((muted) => {
        if (!muted) return;
        setZoneSpeaking(false);
        setNudgeDone(true);
      }),
    [],
  );

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const inspect = (zone: InspectZone) => {
    if (inspected.has(zone.id) || decided || showIntro || zoneSpeaking) return;
    setHasInteracted(true);
    audio.tap();
    fx.toast(
      zone.isRedFlag
        ? { text: "RED FLAG!", tone: "danger" }
        : { text: "Looks ok", tone: "xp" },
    );
    setInspected((prev) => new Set(prev).add(zone.id));
    // Sarah reads the revealed clue aloud (owner: "read out the inspections
    // as you click"); the click-guard holds further taps until she finishes.
    // Muted = she never starts, so don't wait on her.
    setReadZone(zone.id);
    if (!isAudioMuted()) setZoneSpeaking(true);
  };

  const decide = (refuse: boolean) => {
    if (!req || !allInspected || decided || verdictHeld) return;
    const wasCorrect = refuse === req.isNosy;
    onAnswered?.({
      questionKey: `inspect-${req.id}`,
      selectedIndex: refuse ? 1 : 0,
      correctIndex: req.isNosy ? 1 : 0,
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      fx.correct({ xp: 25, text: req.isNosy ? "TOO NOSY!" : "FAIR ASK!" });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setDecided(refuse ? "nosy" : "fair");
      window.setTimeout(() => setIdx((i) => i + 1), reduce ? 700 : 1400);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      setReqWrong((n) => n + 1);
      setFeedback({
        title: req.isNosy ? "Careful - that one was TOO NOSY" : "That one was actually a fair ask",
        explanation: req.verdictNote,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  const zoneColour = useMemo(
    () => (zone: InspectZone) =>
      !inspected.has(zone.id)
        ? { border: "#7df0ff55", text: "#7df0ff", bg: "rgba(0,179,255,0.08)" }
        : zone.isRedFlag
          ? { border: "#ff5fb3aa", text: "#ff9bcb", bg: "rgba(255,95,179,0.1)" }
          : { border: "#34d399aa", text: "#a0ffb0", bg: "rgba(52,211,153,0.1)" },
    [inspected],
  );

  return (
    <ExerciseFrame maxWidth={760} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Nosy Form"}
          subtitle={introSubtitle ?? "Inspect every clue, then decide: fair ask... or too nosy?"}
          icon={introIcon ?? "❓"}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {req && (
        <AnimatePresence mode="wait">
          <motion.div
            key={req.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {/* App form card */}
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "2px solid rgba(122,140,255,0.4)",
                boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  background: "linear-gradient(135deg, #2a3573 0%, #1c2450 100%)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: 7,
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.18)",
                  }}
                >
                  <PixIcon emoji={req.appIcon} size={30} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "#fff7e6" }}>{req.appName}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#b9c4f7" }}>{req.tagline}</div>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.07em",
                    color: "#9fb1ff",
                    padding: "3px 9px",
                    borderRadius: 999,
                    border: "1px solid rgba(159,177,255,0.4)",
                  }}
                >
                  {badgeLabel ?? "SIGN-UP FORM"}
                </span>
              </div>
              <div
                style={{
                  padding: "12px 14px 14px",
                  background: "linear-gradient(180deg, #f4f6ff 0%, #e6ebff 100%)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {req.asksFor.map((field) => (
                  <div key={field}>
                    <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: "0.05em", color: "#39406b", textTransform: "uppercase" }}>
                      {field}
                    </div>
                    <div
                      style={{
                        marginTop: 3,
                        height: 30,
                        borderRadius: 8,
                        background: "#ffffff",
                        border: "1.5px solid #b9c2e8",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 10px",
                        color: "#8b93bd",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      type here…
                    </div>
                  </div>
                ))}
              </div>
              {decided && (
                <motion.div
                  initial={reduce ? false : { scale: 1.6, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: -7 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      padding: "8px 22px",
                      borderRadius: 12,
                      fontSize: 26,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      background: decided === "nosy" ? "rgba(60,8,32,0.88)" : "rgba(8,42,24,0.88)",
                      border: `3px solid ${decided === "nosy" ? "#ff5fb3" : "#7eff97"}`,
                      color: decided === "nosy" ? "#ff9bcb" : "#7eff97",
                    }}
                  >
                    {decided === "nosy" ? "CLOSED!" : "FAIR ASK ✓"}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Inspect zones */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              {req.zones.map((zone) => {
                const c = zoneColour(zone);
                const open = inspected.has(zone.id);
                return (
                  <motion.button
                    key={zone.id}
                    onClick={() => inspect(zone)}
                    disabled={open || !!decided || showIntro || zoneSpeaking}
                    animate={open && !reduce ? { scale: [1, 1.04, 1] } : undefined}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 12,
                      cursor: open ? "default" : "pointer",
                      touchAction: "manipulation",
                      background: c.bg,
                      border: `1.5px solid ${c.border}`,
                      color: c.text,
                      fontFamily: "inherit",
                      minHeight: 64,
                    }}
                    aria-label={open ? `${zone.label}: ${zone.note}` : `Inspect: ${zone.label}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 900 }}>
                      <PixIcon emoji={open ? (zone.isRedFlag ? "🚫" : "✅") : "🔍"} size={18} />
                      {zone.label}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 700, lineHeight: 1.35, color: open ? undefined : "#7d8cc9" }}>
                      {open ? zone.note : "Tap to inspect"}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Sarah reads the tapped clue aloud. Audio-only (the note is on
                the zone card); keyed per request + zone so each tap is its own
                read. recordedOnly = un-recorded weeks stay silent, no robot. */}
            {readNote && (
              <div aria-hidden style={AUDIO_ONLY_STYLE}>
                <InfoNarration
                  key={`ri-zone-${req.id}-${readZone}`}
                  speaker="adam"
                  lines={[readNote]}
                  accent="#7df0ff"
                  recordedOnly
                  onDone={() => setZoneSpeaking(false)}
                />
              </div>
            )}

            {/* Sarah's "Think!" nudge: every clue is open, one last prompt
                before the verdict (opt-in per request via `nudge`). Spoken
                audio-only; the verdict buttons unlock when she finishes. */}
            <AnimatePresence>
              {showNudge && nudgeText && (
                <motion.div
                  key={`nudge-${req.id}`}
                  role="status"
                  aria-live="polite"
                  initial={reduce ? false : { opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, y: -6 }}
                  style={{ display: "flex", justifyContent: "center", paddingBottom: 6 }}
                >
                  <div
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      maxWidth: 520,
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "rgba(15, 21, 48, 0.95)",
                      border: "2px solid #7df0ff",
                      boxShadow: "0 0 16px rgba(125, 240, 255, 0.35)",
                      color: "#e7ecff",
                      fontFamily:
                        "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                      fontSize: 14,
                      lineHeight: 1.4,
                      fontWeight: 700,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        border: "2px solid #7df0ff",
                        flexShrink: 0,
                        background: "rgba(15, 21, 48, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PixIcon emoji="🧠" size={22} />
                    </div>
                    <div style={{ textAlign: "left", flex: 1 }}>
                      <div
                        style={{
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 800,
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          color: "#7df0ff",
                          textTransform: "uppercase",
                          marginBottom: 2,
                        }}
                      >
                        Think!
                      </div>
                      <div>{nudgeText}</div>
                    </div>
                    {/* Speech-bubble tail pointing down at the verdict buttons */}
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        left: "50%",
                        bottom: -9,
                        width: 14,
                        height: 14,
                        transform: "translateX(-50%) rotate(45deg)",
                        background: "rgba(15, 21, 48, 0.95)",
                        borderRight: "2px solid #7df0ff",
                        borderBottom: "2px solid #7df0ff",
                      }}
                    />
                  </div>
                  <div aria-hidden style={AUDIO_ONLY_STYLE}>
                    <InfoNarration
                      key={`ri-nudge-${req.id}`}
                      speaker="adam"
                      lines={[nudgeText]}
                      accent="#7df0ff"
                      recordedOnly
                      onDone={() => setNudgeDone(true)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decision buttons — unlocked only after full inspection (and
                after Sarah has finished the last clue / the Think nudge) */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", opacity: allInspected ? 1 : 0.5 }}>
              <GameButton
                variant="success"
                size="lg"
                disabled={!allInspected || !!decided || verdictHeld}
                onClick={() => decide(false)}
              >
                ✅ {fairLabel ?? "Looks fair - OK!"}
              </GameButton>
              <GameButton
                variant="danger"
                size="lg"
                disabled={!allInspected || !!decided || verdictHeld}
                onClick={() => decide(true)}
              >
                ✋ {nosyLabel ?? "Too nosy - close it!"}
              </GameButton>
            </div>
            {!allInspected && (
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#7d8cc9" }}>
                Inspect all {req.zones.length} clues to unlock your decision · Form{" "}
                {Math.min(idx + 1, total)} of {total}
              </div>
            )}

            {/* Hint bubble is PER REQUEST (reqWrong), never the exercise-wide
                count: a wrong answer on form 1 must not haunt form 2. */}
            <div style={{ padding: reqWrong > 0 ? "2px 4px 0" : 0 }}>
              {reqWrong === 1 && hints && <HintBubble tier={1} speaker="adam" text={hints.tier1} />}
              {reqWrong >= 2 && hints && <HintBubble tier={2} speaker="adam" text={hints.tier2} />}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {coachLines && !showIntro && !hasInteracted && !finished && (
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
          title="Every form inspected!"
          stars={stars}
          statLines={[
            `${correctCount}/${total} verdicts right first try`,
            "Nosy forms closed, fair asks approved.",
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
