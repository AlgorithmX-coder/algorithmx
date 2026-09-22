"use client";

/**
 * SettingsSwitch — the find-and-flip settings drill (SCENE/FIND, Week 6+).
 *
 * A realistic settings panel with toggle rows. Some rows are already safe;
 * the child must find the UNSAFE ones and flip them. Flipping a risky
 * setting to safe = a satisfying clunk + teach line; tapping an
 * already-safe row teaches gently why it's fine as-is. All unsafe rows
 * flipped → the panel seals with a shield stamp.
 *
 * Reusable across weeks via the header props: W6 game-lobby settings,
 * W14 smart-device privacy, W17 social-profile lockdown, W19 family
 * device rounds.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * TWO PATHS THROUGH THIS FILE (read this before editing)
 *
 * 1. THE LEGACY PATH. Weeks 17 and 19 are not yet rebuilt. Their rows carry
 *    a `note` and nothing else, and they get exactly the flow they have
 *    always had: no read-alouds, no spoken verdict on a flip, no settled
 *    tags, hint tier 1 on every wrong tap, the indigo panel, the visible
 *    CoachCaption. Nothing below may change that.
 *
 * 2. THE LEARN-LOOP PATH. A week that authors `readAloud` / `why` /
 *    `explanation` on its rows turns the loop on (`loop` below). Then:
 *    Sarah reads every row out as it is tapped (audio-only, `recordedOnly`,
 *    taps held, released by the shared SPOKEN_GATE_MAX_MS), a flip gets a
 *    one-take spoken verdict ("That's right!" + that row's `why` via
 *    VerdictVoice), a row that was already fine speaks through
 *    WrongAnswerPanel ("Not quite." + that row's `explanation`), hint tiers
 *    escalate, an already-explained safe row is a friendly nothing rather
 *    than a second wrong for the same tile, and the panel seal is held from
 *    the verdict's own callback so no payoff can cut Sarah off.
 *
 *    A synchronous ref latch shuts the panel the instant a row is tapped:
 *    `speaking` only closes once React has re-rendered on `verdict.speaking`,
 *    and a quick second tap inside that window would otherwise restart the
 *    verdict and cut Sarah off mid-sentence (the real Week 12 bug). It is
 *    cleared on advance AND after a wrong answer.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each row's `readAloud`, `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads
 * the WEEK FILE, so anything left to a component default is never recorded
 * and plays as silence, with no error anywhere. Which field is spoken in
 * which branch:
 *
 *    RISKY row, tapped (the right call)  -> `why`          (VerdictVoice)
 *    SAFE row, tapped (already fine)     -> `explanation`  (WrongAnswerPanel)
 *    either, as the row is tapped        -> `readAloud`    (InfoNarration)
 *
 * A teach line put in the wrong one of those two fields is SILENT even when
 * it is not empty. `note` is the legacy name for `explanation` and is only
 * read when `explanation` is absent.
 *
 * Skins are PAINT ONLY (a skin can never carry a spoken word): "panel" is
 * the shipped Weeks 6 / 17 / 19 indigo settings panel, untouched; "house" is
 * Week 14's Listening House wall plate — a warm oak console under a lamp,
 * cream device cards with engraved plates, a physical sliding paddle switch
 * instead of a phone pill, and a lit readout per device. DEVICE SWITCHES
 * ONLY: this is hardware on a shelf, a speaker or a TV, never an account
 * screen (Week 17 owns account privacy). Tone: curious, never creepy — the
 * settled state is warm and sleepy, not a threat cleared.
 *
 * Nothing races the child: tap-only, untimed, no timer, no lose state.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40,
 * so the stage holds ~627px before it grows): header 26 + marginBottom 10 +
 * faceplate 46 + five cards at 64 + gaps = ~360 + strip 30 + hint gap 8 =
 * ~444px, so the whole console is on screen without a scroll. At 400px the
 * readout chip wraps under the value and nothing scrolls sideways.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as NightFall / LobbyDoors.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface SettingRow {
  id: string;
  /** Setting label ("Who can join my game"). */
  label: string;
  /** Current value shown on the row ("Anyone in the world"). */
  value: string;
  /** The safe value it flips to ("Friends only"). */
  safeValue?: string;
  /** Emoji rendered via PixIcon on the row. Must be in PixIcon's MAP. */
  icon: string;
  /** True = starts risky and must be flipped. */
  isRisky: boolean;
  /**
   * LEGACY (Weeks 17 and 19, not yet rebuilt): the teach copy for a row that
   * was already fine. Superseded by `explanation`, which is read first. Kept
   * so those two un-rebuilt weeks keep their exact wording and flow.
   */
  note?: string;
  /**
   * SPOKEN as the row is tapped (InfoNarration, audio only). One short
   * sentence. Authoring any of `readAloud` / `why` / `explanation` on any row
   * turns the whole Learn-Loop layer on for this mount.
   */
  readAloud?: string;
  /**
   * SPOKEN on a RISKY row, after the flip: "That's right!" + this line
   * (VerdictVoice, one take). Silent if it is put in `explanation` instead.
   */
  why?: string;
  /**
   * SPOKEN on a SAFE row: "Not quite." + this line (WrongAnswerPanel). The
   * gentle "this one is already doing its job" teach. Silent if it is put in
   * `why` instead.
   */
  explanation?: string;
}

export interface SettingsSwitchProps {
  /**
   * Visual skin. "panel" (default) = the shipped Weeks 6 / 17 / 19 indigo
   * settings panel, untouched. "house" = Week 14's Listening House wall
   * plate: warm oak console, cream device cards, a sliding paddle switch.
   * Paint and layout only — every word still comes from the props below.
   */
  skin?: "panel" | "house";
  /** Panel title (e.g. "Mega Blasters — Settings"). */
  panelTitle: string;
  rows: SettingRow[];
  introTitle: string;
  introSubtitle?: string;
  introIcon?: string;
  /** "house": the icon on the console faceplate. Default "⚙️". */
  panelIcon?: string;
  /** "house": the counter word beside flipped/total. Default "SECURED". */
  securedLabel?: string;
  /** fx.correct toast on a flip. Default "LOCKED IN!". */
  flipToast?: string;
  /** WrongAnswerPanel title on an already-safe row. Never spoken. */
  wrongTitle?: string;
  /** "house": the strip under the console once the child is playing. */
  askPrompt?: string;
  /** "house": the strip before the first tap. The MECHANIC only, never
   *  which row. */
  guidedPrompt?: string;
  /** "house" readouts: a device still listening, one settled, one that was
   *  already doing its job right. */
  awakeLabel?: string;
  settledLabel?: string;
  fineLabel?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** The how-to. Learn-Loop: spoken once as the panel appears (audio only).
   *  Legacy: the visible CoachCaption, unchanged. */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken payoff on the complete screen. */
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

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** "house" paints. The cards are cream paper on a deep oak console, so a row
 *  that can be tapped is never painted on a ground anywhere near its own
 *  shade (the Week 12 seven-levels-of-grey lesson). */
const HOUSE_WALL = "linear-gradient(180deg, #33261a 0%, #241a12 58%, #150e09 100%)";
const HOUSE_PLATE = "linear-gradient(180deg, #6b4c2e 0%, #4d3620 100%)";
const HOUSE_CARD = "#fdf3e3";
const HOUSE_CARD_SETTLED = "#eef6ea";
const HOUSE_INK = "#241c14";
const HOUSE_AWAKE = "#a8600f";
const HOUSE_SETTLED = "#3f6b3a";
const HOUSE_BRASS = "#e6b877";

export default function SettingsSwitch({
  skin = "panel",
  panelTitle,
  rows,
  introTitle,
  introSubtitle,
  introIcon = "⚙️",
  panelIcon = "⚙️",
  securedLabel = "SECURED",
  flipToast = "LOCKED IN!",
  wrongTitle = "That one's already safe!",
  askPrompt = "Tap a switch that never stops listening, and flip it",
  guidedPrompt = "Tap any switch on the panel to take a look",
  awakeLabel = "EARS ON",
  settledLabel = "ASLEEP",
  fineLabel = "JUST RIGHT",
  completeTitle = "Panel secured!",
  completeLine = "Locked down like a pro.",
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
}: SettingsSwitchProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#45e3ff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker: that is the bug that shipped
  // two games silent (PR #271 / #272).
  const voice = "adam" as const;
  // Week 14's Listening House wall plate. Paint and layout only.
  const isHouse = skin === "house";

  const [showIntro, setShowIntro] = useState(true);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [finished, setFinished] = useState(false);
  // Read-aloud chain: the how-to once as the panel appears, then the row that
  // has just been tapped. Taps are held while she speaks. Learn-Loop only.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [reading, setReading] = useState<SettingRow | null>(null);
  // Safe rows the child has already had explained: tapping one again is a
  // friendly nothing, never a second wrong for the same tile. Learn-Loop only.
  const [settled, setSettled] = useState<string[]>([]);

  // Anti-sequence: the settings rows are listed in a random order every play
  // (authored panels alternate risky/safe rows).
  const shownRows = useShuffledOnce(rows);
  const riskyTotal = useMemo(() => rows.filter((r) => r.isRisky).length, [rows]);
  const flippedCount = flipped.size;

  /**
   * The Learn-Loop layer is ON only when the week has authored the lines it
   * speaks. Weeks 17 and 19 pass rows with `note` alone, so they keep the
   * exact legacy flow and nothing new below can reach them.
   */
  const loop = useMemo(
    () => rows.some((r) => !!r.readAloud || !!r.why || !!r.explanation),
    [rows],
  );

  // Spoken verdicts: Sarah says "That's right!" + the row's why once the row
  // has been read out. A row that was already fine speaks through
  // WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || finished;
  // `speaking` only closes once React has re-rendered, so a quick second tap
  // landed inside that window and restarted the verdict, cutting Sarah off
  // mid-sentence (the Week 12 bug). This latch shuts the panel synchronously.
  const handlingRef = useRef(false);
  // The row being read out, whether it was the last risky one on the panel,
  // and the wrong count AT THE TAP (the state has already moved on by the time
  // Sarah has finished reading, so the hint tier has to travel with it).
  const pendingRef = useRef<{ row: SettingRow; last: boolean; wrongs: number } | null>(null);

  /* ───────── Sarah's verdict, once the row has been read out ───────── */
  const resolve = useCallback(
    (row: SettingRow, last: boolean, wrongs: number) => {
      pendingRef.current = null;
      const seal = () => {
        if (last) window.setTimeout(() => setFinished(true), reduce ? 500 : 1200);
      };
      if (row.isRisky) {
        if (loop && row.why) {
          // Sarah: "That's right!" + this row's why. The panel seal is held
          // from her callback, so the payoff can never cut her off.
          verdict.say("right", row.why, () => {
            handlingRef.current = false;
            seal();
          });
          return;
        }
        handlingRef.current = false;
        seal();
        return;
      }
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the row
      // has not moved and the panel waits, so the next tap is free.
      setFeedback({
        title: wrongTitle,
        explanation: row.explanation ?? row.note ?? "",
        tip: loop ? (wrongs >= 2 ? hints?.tier2 : hints?.tier1) : hints?.tier1,
      });
      handlingRef.current = false;
    },
    [loop, reduce, verdict, wrongTitle, hints?.tier1, hints?.tier2],
  );

  // The safety releases below fire outside React's own callbacks, so they need
  // the latest `resolve` without re-subscribing on every render.
  const resolveRef = useRef(resolve);
  useEffect(() => {
    resolveRef.current = resolve;
  }, [resolve]);
  /** Let the panel go, and finish any verdict the read-aloud was holding. */
  const releaseRead = useCallback(() => {
    setNarr("idle");
    const p = pendingRef.current;
    if (p) resolveRef.current(p.row, p.last, p.wrongs);
  }, []);

  // Safety releases for the spoken gate (never leave the panel held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(releaseRead, SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr, releaseRead]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) releaseRead(); }), [releaseRead]);

  // Hint tiers reported once each (for the parent dashboard).
  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const startBoard = () => {
    setShowIntro(false);
    if (loop) setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "idle");
  };

  /* ───────── The only judged tap: a row on the panel ───────── */
  const tap = (row: SettingRow, idx: number) => {
    if (showIntro || finished || flipped.has(row.id)) return;
    if (loop) {
      if (speaking) return;
      // A safe row already explained is settled: a friendly nothing.
      if (settled.includes(row.id)) {
        audio.tap();
        return;
      }
      if (handlingRef.current) return;
      handlingRef.current = true;
    }
    setHasInteracted(true);
    onAnswered?.({
      questionKey: `setting-${row.id}`,
      selectedIndex: idx,
      correctIndex: row.isRisky ? idx : -1,
      wasCorrect: row.isRisky,
    });

    let last = false;
    let wrongs = wrongCount;
    if (row.isRisky) {
      audio.correct();
      fx.correct({ xp: 25, text: flipToast });
      onCorrect?.();
      const next = new Set(flipped);
      next.add(row.id);
      setFlipped(next);
      last = next.size >= riskyTotal;
    } else {
      audio.wrong();
      onWrong?.();
      wrongs = wrongCount + 1;
      setWrongCount(wrongs);
      if (loop) setSettled((prev) => (prev.includes(row.id) ? prev : [...prev, row.id]));
    }

    // Sarah reads the row out as it is tapped, and the verdict follows when
    // she has finished, so the two are never on top of each other.
    if (!loop || !row.readAloud || isAudioMuted()) {
      resolve(row, last, wrongs);
      return;
    }
    pendingRef.current = { row, last, wrongs };
    setReading(row);
    setNarr("read");
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  // The first tap teaches the MECHANIC only: every card breathes together, the
  // already-fine ones included, so the glow can never point at an answer.
  const guided = loop && !hasInteracted && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? {
          boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`,
          animation: reduce ? undefined : "ssGuide 1.4s ease-in-out infinite",
        }
      : {};

  return (
    <ExerciseFrame maxWidth={760} decor background={isHouse ? HOUSE_WALL : undefined}>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each row as it
          is tapped. Every line comes from the week file. */}
      {loop && !showIntro && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="ss-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && reading?.readAloud && (
            <InfoNarration
              key={`ss-read-${reading.id}-${flipped.size}-${settled.length}`}
              speaker={voice}
              lines={[reading.readAloud]}
              accent={accent}
              recordedOnly
              onDone={releaseRead}
            />
          )}
        </div>
      )}

      {isHouse ? (
        /* ───────── Week 14: the Listening House wall plate ─────────
           A warm oak console on the shelf, cream device cards, a sliding
           paddle switch per device. Hardware on a shelf: a speaker, a TV, a
           toy. Never an account screen (Week 17 owns account privacy). */
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: HOUSE_BRASS, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <PixIcon emoji="🏠" size={15} /> {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
              {flippedCount}/{riskyTotal} {securedLabel}
            </span>
          </div>

          {/* The console. Inset 22px so it never touches the frame corners. */}
          <div
            style={{
              margin: "0 22px",
              borderRadius: 16,
              overflow: "hidden",
              background: HOUSE_PLATE,
              border: "2px solid #7d5a36",
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.85), inset 0 2px 0 rgba(255,236,200,0.22), inset 0 0 0 1px ${accent}14`,
            }}
          >
            {/* The faceplate: the device name on a brass plate, and the little
                grille of holes the ears sit behind. */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "linear-gradient(180deg, rgba(255,236,200,0.16), rgba(0,0,0,0.12))", borderBottom: "2px solid rgba(0,0,0,0.28)" }}>
              <PixIcon emoji={panelIcon} size={22} />
              <div style={{ fontFamily: KID_FONT, fontSize: 15.5, fontWeight: 900, color: "#fff3df", minWidth: 0, overflowWrap: "anywhere" }}>{panelTitle}</div>
              <span
                aria-hidden
                style={{
                  marginLeft: "auto",
                  width: 54,
                  height: 16,
                  flexShrink: 0,
                  borderRadius: 4,
                  backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.5) 1.2px, transparent 1.4px)",
                  backgroundSize: "7px 7px",
                  opacity: 0.8,
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 10 }}>
              {shownRows.map((row, i) => {
                const isFlipped = flipped.has(row.id);
                const quiet = !row.isRisky || isFlipped;
                const tag = !row.isRisky ? fineLabel : isFlipped ? settledLabel : awakeLabel;
                const done = isFlipped || settled.includes(row.id);
                return (
                  <motion.button
                    key={row.id}
                    type="button"
                    onClick={() => tap(row, i)}
                    onPointerEnter={() => !done && audio.hover()}
                    disabled={showIntro || finished || isFlipped}
                    animate={isFlipped && !reduce ? { scale: [1, 1.015, 1] } : {}}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      padding: "9px 11px",
                      textAlign: "left",
                      fontFamily: KID_FONT,
                      cursor: isFlipped ? "default" : "pointer",
                      borderRadius: 11,
                      // Cream paper on deep oak: a tappable card is never
                      // painted on a ground near its own shade.
                      background: quiet ? HOUSE_CARD_SETTLED : HOUSE_CARD,
                      border: `2px solid ${quiet ? "rgba(63,107,58,0.45)" : "rgba(168,96,15,0.5)"}`,
                      color: HOUSE_INK,
                      touchAction: "manipulation",
                      ...guideStyle(guided),
                    }}
                  >
                    {/* The device, sitting in its socket on the shelf. */}
                    <span
                      aria-hidden
                      style={{
                        width: 40,
                        height: 40,
                        flexShrink: 0,
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                        background: "radial-gradient(circle at 50% 34%, #fffaf0 0%, #e8d6bb 78%)",
                        border: "1px solid rgba(63,44,24,0.28)",
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
                      }}
                    >
                      <PixIcon emoji={row.icon} size={26} />
                    </span>

                    <span style={{ minWidth: 0, flex: 1, display: "block" }}>
                      <span style={{ display: "block", fontSize: 14.5, fontWeight: 900, color: HOUSE_INK, overflowWrap: "anywhere" }}>{row.label}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginTop: 2 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 750, color: quiet ? HOUSE_SETTLED : HOUSE_AWAKE, overflowWrap: "anywhere" }}>
                          {isFlipped && row.safeValue ? row.safeValue : row.value}
                        </span>
                        {/* The lit readout on the device's own little screen. */}
                        <span
                          style={{
                            fontFamily: LABEL_FONT,
                            fontSize: 9.5,
                            fontWeight: 900,
                            letterSpacing: "0.14em",
                            textTransform: "uppercase",
                            padding: "2px 7px",
                            borderRadius: 4,
                            whiteSpace: "nowrap",
                            color: quiet ? "#eaf7e6" : "#fff1dd",
                            background: quiet ? HOUSE_SETTLED : HOUSE_AWAKE,
                          }}
                        >
                          {tag}
                        </span>
                      </span>
                    </span>

                    <Paddle on={quiet} reduce={reduce} />
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              padding: "0 22px",
              fontFamily: LABEL_FONT,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: HOUSE_BRASS,
            }}
          >
            {guided ? guidedPrompt : askPrompt}
          </div>

          <style>{`
            @keyframes ssGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
          `}</style>
        </div>
      ) : (
        <>
          {/* Settings panel */}
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              border: "2px solid rgba(122,140,255,0.4)",
              boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                background: "linear-gradient(135deg, #2a3573 0%, #1c2450 100%)",
              }}
            >
              <PixIcon emoji="⚙️" size={24} />
              <div style={{ fontSize: 16, fontWeight: 900, color: "#fff7e6" }}>{panelTitle}</div>
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
                {flippedCount}/{riskyTotal} SECURED
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {shownRows.map((row, i) => {
                const safe = !row.isRisky || flipped.has(row.id);
                const justFlipped = flipped.has(row.id);
                return (
                  <motion.button
                    key={row.id}
                    type="button"
                    onClick={() => tap(row, i)}
                    onPointerEnter={() => !safe && audio.hover()}
                    disabled={showIntro || finished || justFlipped}
                    animate={justFlipped && !reduce ? { scale: [1, 1.015, 1] } : {}}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "13px 16px",
                      textAlign: "left",
                      fontFamily: "inherit",
                      cursor: justFlipped ? "default" : "pointer",
                      background: safe
                        ? "linear-gradient(90deg, rgba(52,211,153,0.10), rgba(12,18,48,0.92))"
                        : "linear-gradient(90deg, rgba(239,68,68,0.12), rgba(12,18,48,0.92))",
                      border: "none",
                      borderBottom: "1px solid rgba(122,140,255,0.18)",
                      touchAction: "manipulation",
                    }}
                  >
                    <PixIcon emoji={row.icon} size={26} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 900, color: "#eaf9ff" }}>{row.label}</div>
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: safe ? "#a0ffb0" : "#ff9b9b",
                        }}
                      >
                        {justFlipped && row.safeValue ? row.safeValue : row.value}
                      </div>
                    </div>
                    {/* the toggle */}
                    <div
                      aria-hidden
                      style={{
                        width: 46,
                        height: 24,
                        borderRadius: 999,
                        flexShrink: 0,
                        position: "relative",
                        background: safe ? "rgba(52,211,153,0.5)" : "rgba(239,68,68,0.4)",
                        border: `1.5px solid ${safe ? "#34d399" : "#ef4444"}`,
                        transition: "background 250ms ease, border-color 250ms ease",
                      }}
                    >
                      <span
                        style={{
                          position: "absolute",
                          top: 2,
                          left: safe ? 24 : 2,
                          width: 17,
                          height: 17,
                          borderRadius: "50%",
                          background: "#fff",
                          transition: "left 250ms ease",
                        }}
                      />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: 12,
              fontSize: 12,
              fontWeight: 700,
              color: "#7d8cc9",
            }}
          >
            Tap the RISKY settings to flip them safe — the green ones are already fine
          </div>
        </>
      )}

      <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker={voice} text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker={voice} text={hints.tier2} />}
      </div>

      {/* The legacy how-to caption. The Learn-Loop path speaks the same lines
          audio-only instead (the panel already shows what to do). */}
      {!loop && coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker ?? voice} />
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
            `All ${riskyTotal} risky settings flipped safe`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(loop ? (stars === 3 ? 100 : stars === 2 ? 70 : 40) : riskyTotal)}
        />
      )}
    </ExerciseFrame>
  );
}

/** "house" skin only: the physical sliding paddle on a device's own switch, a
 *  chunky rounded rectangle, deliberately nothing like a phone's pill toggle.
 *  Slides across and goes green once the ear is asleep. */
function Paddle({ on, reduce }: { on: boolean; reduce: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        position: "relative",
        display: "block",
        width: 56,
        height: 28,
        flexShrink: 0,
        borderRadius: 7,
        background: on ? "linear-gradient(180deg, #cfe6c6, #a8c79e)" : "linear-gradient(180deg, #f2d7ae, #ddb47a)",
        border: `2px solid ${on ? "#4d7145" : "#a4701f"}`,
        boxShadow: "inset 0 2px 0 rgba(255,255,255,0.65), inset 0 -2px 0 rgba(0,0,0,0.12)",
        overflow: "hidden",
      }}
    >
      <motion.span
        animate={{ x: on ? 25 : 0 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 340, damping: 26 }}
        style={{
          position: "absolute",
          top: 2,
          left: 2,
          width: 23,
          height: 20,
          borderRadius: 5,
          background: "linear-gradient(180deg, #fffaf0 0%, #d9c8ab 100%)",
          border: "1px solid rgba(63,44,24,0.35)",
          boxShadow: "0 2px 3px rgba(0,0,0,0.25)",
        }}
      />
    </span>
  );
}
