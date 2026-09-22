"use client";

/**
 * SignBingo — the bingo SELECT drill (Week 13 card skin, Week 1 vault skin).
 *
 * One scene at a time plays ("Maya blinks and blinks - her eyes feel like
 * sandpaper...") and the child taps the sign the scene is showing. A right
 * tap stamps that square; a wrong tap teaches gently and the same scene
 * replays. All four stamped → BINGO!
 *
 * SKINS (owner rule: a reuse must be a genuine re-theme, never a copy):
 *   - "card"  (W13 Break-Sign Bingo, W6 Game Zone Bingo): a bingo card that
 *             fills square by square.
 *   - "vault" (W1 Hero Power Bingo): four brass dials around a vault door; a
 *             correct tap turns the dial, slides its bolt home into the door
 *             and lights the socket. Four bolts home = the vault is sealed and
 *             the Raccoon is locked out. Owner picked this board from three
 *             concept mocks (2026-09-11).
 *   - "house" (W14 The Listening House): the hall table by lamplight. The
 *             Scout's wooden check-card lies on the oak with a cream card of
 *             the week's powers; a moment happens somewhere in the house and
 *             the child presses the brass stamp onto the power that answers
 *             it. Each pressed ticket goes brass, and the card fills up. No
 *             arcade neon, no watchers, no red eyes: this is a warm, curious
 *             room where the gadgets are helpers you KNOW about.
 *
 * Deliberately unlike buttonHunt (find controls among decoys) and
 * quickCheck recall (one question): this is a match-the-scene-to-the-
 * sign board that fills up piece by piece.
 *
 * CRITICAL for the week author: the clip generator reads the WEEK FILE, so a
 * spoken string left to a component default is never recorded and plays as
 * SILENCE with nothing erroring. Which field is spoken where (all skins):
 *   - the moment arrives -> `round.scene` (audio-only, recordedOnly, taps held)
 *   - a RIGHT press      -> `round.why`   (after the shared "That's right!")
 *   - a WRONG press      -> `round.note`  (after the shared "Not quite.",
 *                                          spoken by WrongAnswerPanel)
 * A line in the wrong one of those three is silent even when it is full.
 * Everything the "house" skin adds is PAINT AND LAYOUT only: no spoken string
 * lives in a house default.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "@/app/lib/sounds";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration, { hasRecordedBlock } from "@/app/components/lesson/InfoNarration";
import VerdictVoice from "@/app/components/lesson/VerdictVoice";
import GameButton from "@/app/components/lesson/GameButton";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

/* ── HOUSE skin paints (W14, The Listening House) ────────────────────────────
 * A lamp-lit hall table: dark oak, warm brass, cream card stock. The luminance
 * ladder is deliberate (a W12 board shipped with only 7 L* between its floor
 * and its walls and a child could not read it):
 *   table  #241608  L* ~11  |  oak frame #5a3818  L* ~27
 *   stock  #e3cea4  L* ~84  |  ticket    #fffdf6  L* ~99   (15 apart)
 *   pressed ticket  #8a5a1c L* ~43 with cream ink            (41 from stock)
 * so a stampable ticket, a pressed one and the card behind them never blur. */
const HOUSE_TABLE = "radial-gradient(ellipse at 50% -12%, rgba(255,215,154,0.30), transparent 56%), radial-gradient(ellipse at 50% 118%, rgba(107,66,31,0.36), transparent 62%), linear-gradient(180deg, #33200f 0%, #241608 58%, #170d05 100%)";
const HOUSE_OAK = "linear-gradient(180deg, #7b4f28 0%, #5a3818 55%, #42280f 100%)";
const HOUSE_STOCK = "#e3cea4";
const HOUSE_TICKET = "#fffdf6";
const HOUSE_PRESSED = "linear-gradient(165deg, #b9822f 0%, #8a5a1c 45%, #6b4310 100%)";
const HOUSE_INK = "#3a2512";
const HOUSE_BRASS = "#e7bd63";
const HOUSE_LAMP = "#ffe6bd";

export interface BingoSign {
  id: string;
  /** Square label ("Dry, scratchy eyes"). */
  label: string;
  /** Emoji rendered via PixIcon on the square. */
  icon: string;
}

export interface BingoRound {
  id: string;
  /** The mini scene played above the card. Read aloud by Sarah. */
  scene: string;
  /** Emoji badge on the scene card. */
  sceneIcon?: string;
  /** Which sign this scene shows. */
  signId: string;
  /** Teach copy on a wrong tap for this scene. */
  note: string;
  /** Positive explanation on a CORRECT tap - WHY this move shows that power.
   *  Shown + read aloud by Sarah before advancing (teach-on-success). When
   *  omitted, a correct tap advances immediately (legacy behaviour). */
  why?: string;
}

export type SignBingoSkin = "card" | "vault" | "house";

export interface SignBingoProps {
  signs: BingoSign[];
  rounds: BingoRound[];
  /** Board dressing: "card" (W13/W6 bingo card, default), "vault" (W1 brass
   *  dials around a vault door, bolts slide home; needs exactly 4 signs) or
   *  "house" (W14 the hall table: a wooden check-card of the powers, pressed
   *  with a brass stamp; any number of signs, laid out on a wrapping grid). */
  skin?: SignBingoSkin;
  /** Vault skin ONLY: the short prompt Sarah reads after every move ("Which power did that
   *  move use? Turn its dial."), so the board always tells the child what to do.
   *  Ignored by the card and house skins - the generator only records this pairing
   *  for a `skin: "vault"` board, so a value here would be silent anywhere else. */
  roundPrompt?: string;
  /** House skin ONLY: the printed line under the check-card telling the child what
   *  to do. VISUAL ONLY - never read aloud, so its default is safe. */
  actionLine?: string;
  /** House skin ONLY: the Raccoon's boast on the intro beat (shown as TEXT in
   *  his voice, never spoken by Sarah). Deliberately house-gated: W1 and W6 are
   *  LIVE and W6's week file already carries a `threat` that this engine has
   *  never rendered, so honouring it everywhere would change a shipped week. */
  threat?: { raccoonLine: string };
  /** Copy overrides (defaults keep the W13 body-bell skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  cardTitle?: string;
  stampToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Spoken Sarah acknowledgment on the complete screen. */
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

export default function SignBingo({
  signs,
  rounds,
  skin = "card",
  roundPrompt,
  actionLine,
  threat,
  introTitle,
  introSubtitle,
  introIcon,
  cardTitle,
  stampToast,
  wrongTitle,
  completeTitle,
  completeLine,
  hints,
  introNarration,
  coachLines,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: SignBingoProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [roundIdx, setRoundIdx] = useState(0);
  const [stamped, setStamped] = useState<Set<string>>(new Set());
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(false);
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Teach-on-success: after a correct tap, hold on a "why" beat (Sarah explains
  // the reasoning) with a gated Next before advancing.
  const [explain, setExplain] = useState<null | { why: string; key: number }>(null);
  const [whyDone, setWhyDone] = useState(false);
  // Vault skin pacing (owner: "slow the speed down"): after a correct tap the dial
  // turn, bolt slide and socket light play out on a clear board BEFORE the why
  // panel dims it; the fourth bolt gets the wheel turn + door glow first; the
  // final Next gives the door a seal moment before the complete beat.
  const [bolting, setBolting] = useState(false);
  const [sealing, setSealing] = useState(false);
  // Vault skin narration chain per round (owner: "I need instructions from Sarah"):
  // how-to once (coach line) -> the move -> "turn its dial" prompt. Audio only,
  // sequenced so two lines never overlap; the guard holds the dials throughout.
  const [narr, setNarr] = useState<"howto" | "scene" | "prompt" | "done">("scene");

  // Anti-sequence: the bingo squares are dealt in a random layout AND the
  // scenes play in a random order (authored data pairs scene N with square N,
  // a diagonal giveaway).
  const shownSigns = useShuffledOnce(signs);
  const shownRounds = useShuffledOnce(rounds);
  const finished = roundIdx >= shownRounds.length;
  const round = shownRounds[roundIdx];
  const vault = skin === "vault";
  const house = skin === "house";
  const prompt = roundPrompt ?? (vault ? "Which power did that move use? Tap its dial." : undefined);
  // 7c: one recorded take of [move, prompt] when it exists (two separate clips
  // back to back sounded like two different tones of Sarah). Resolved per round.
  const [oneTakeFor, setOneTakeFor] = useState<{ id: string; ok: boolean } | null>(null);
  useEffect(() => {
    if (!vault || !round || !prompt) return;
    let cancelled = false;
    const id = round.id;
    void hasRecordedBlock("adam", [round.scene, prompt]).then((ok) => {
      if (!cancelled) setOneTakeFor({ id, ok });
    });
    return () => {
      cancelled = true;
    };
  }, [vault, round, prompt]);
  const sceneOneTake = !vault || !round || !prompt ? false : oneTakeFor?.id === round.id ? oneTakeFor.ok : null;
  const hasCoach = !!coachLines;
  useEffect(() => {
    if (!vault) return;
    setNarr(roundIdx === 0 && hasCoach ? "howto" : "scene");
  }, [roundIdx, vault, hasCoach]);

  // Safety release: never leave the "why" beat's gated Next stuck behind a
  // narration that fails to fire onDone. The house skin uses the shared
  // SPOKEN_GATE_MAX_MS (45 s): at 12 s the release could hand a child the Next
  // button while Sarah was still mid-`why`, which is how a verdict gets cut
  // off. The vault and card skins keep their shipped 12 s exactly.
  useEffect(() => {
    if (!explain) return;
    const id = window.setTimeout(() => setWhyDone(true), house ? SPOKEN_GATE_MAX_MS : 12000);
    return () => window.clearTimeout(id);
  }, [explain, house]);

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  // 7d: the first round teaches the move by doing it: once Sarah has read the
  // move and the prompt, the right dial glows until the child taps.
  const guided = vault && !!round && roundIdx === 0 && stamped.size === 0 && !wrongOnCurrent && narr === "done" && !showIntro;

  // A judged tap only closes the board once React has re-rendered (`feedback` /
  // `explain` / `bolting` are state), so a fast second tap on a DIFFERENT square
  // landed inside that window, was judged against the same round and restarted
  // the verdict, cutting Sarah off mid-sentence. This latch shuts the handler
  // synchronously. Cleared on advance (the roundIdx effect below, i.e. once the
  // new round is on screen) and at once after a wrong press, so a retry is one tap.
  const handlingRef = useRef(false);
  useEffect(() => {
    handlingRef.current = false;
  }, [roundIdx]);

  const tap = (sign: BingoSign, idx: number) => {
    if (!round || showIntro || feedback || finished || bolting) return;
    setHasInteracted(true);
    // A square that's already stamped just wobbles - no penalty.
    if (stamped.has(sign.id)) {
      setWobbleId(sign.id);
      window.setTimeout(() => setWobbleId(null), 420);
      return;
    }
    // Synchronous: a second tap in the same frame must never reach the verdict.
    if (handlingRef.current) return;
    handlingRef.current = true;
    onAnswered?.({
      questionKey: `bingo-${round.id}`,
      selectedIndex: idx,
      correctIndex: shownSigns.findIndex((s) => s.id === round.signId),
      wasCorrect: sign.id === round.signId,
    });
    if (sign.id === round.signId) {
      audio.correct();
      fx.correct({ xp: 25, text: stampToast ?? (skin === "house" ? "STAMPED!" : skin === "vault" ? "BOLTED!" : "SIGN SPOTTED!") });
      onCorrect?.();
      if (!wrongOnCurrent) setFirstTryCount((n) => n + 1);
      setWrongOnCurrent(false);
      setStamped((prev) => new Set(prev).add(sign.id));
      // Teach-on-success: hold on Sarah's "why" before advancing. Without a
      // `why`, advance immediately (legacy).
      const goOn = () => {
        if (round.why) {
          setWhyDone(false);
          setExplain({ why: round.why, key: Date.now() });
        } else {
          setRoundIdx((i) => i + 1);
        }
      };
      if (skin === "vault") {
        // Let the dial turn, the bolt slide home and the socket light play out
        // (and the wheel turn on the fourth bolt) before the why panel dims the board.
        const lastBolt = stamped.size + 1 >= signs.length;
        setBolting(true);
        window.setTimeout(() => playSound("lock"), reduce ? 80 : 750);
        window.setTimeout(() => { setBolting(false); goOn(); }, reduce ? (lastBolt ? 900 : 500) : (lastBolt ? 2400 : 1700));
      } else {
        goOn();
      }
    } else {
      audio.wrong();
      onWrong?.();
      setWrongOnCurrent(true);
      setWrongCount((c) => {
        const v = c + 1;
        reportTier(v);
        return v;
      });
      setFeedback({
        title: wrongTitle ?? "Not that bell!",
        explanation: round.note,
        tip: hints?.tier1,
      });
      // WrongAnswerPanel holds the board and speaks "Not quite." + this note
      // itself; release the latch at once so the retry is a single tap.
      handlingRef.current = false;
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  const allBolted = stamped.size >= signs.length;
  const roundLabel = finished ? "SEALED" : `ROUND ${Math.min(roundIdx + 1, shownRounds.length)} OF ${shownRounds.length}`;

  // Vault skin geometry: a 760x350 board; door 240px centred, dials 130px in
  // the four corners, tracks run from each dial into a bolt socket on the door.
  const DIAL = 130;
  const dialSlots = [
    { left: 40, top: 46, side: "left" as const, trackTop: 101, trackLeft: 170, trackWidth: 92 },
    { left: 40, top: 174, side: "left" as const, trackTop: 229, trackLeft: 170, trackWidth: 92 },
    { left: 590, top: 46, side: "right" as const, trackTop: 101, trackLeft: 498, trackWidth: 92 },
    { left: 590, top: 174, side: "right" as const, trackTop: 229, trackLeft: 498, trackWidth: 92 },
  ];
  const socketLit = (i: number) => !!shownSigns[i] && stamped.has(shownSigns[i].id);

  return (
    <ExerciseFrame
      maxWidth={820}
      decor={!vault && !house}
      style={vault || house ? { position: "relative", overflow: "hidden" } : undefined}
      background={house ? HOUSE_TABLE : vault ? "radial-gradient(ellipse at 50% -20%, rgba(227,179,65,0.28), transparent 55%), radial-gradient(ellipse at 8% 110%, rgba(143,163,192,0.22), transparent 50%), radial-gradient(ellipse at 92% 110%, rgba(255,217,122,0.16), transparent 50%), linear-gradient(180deg, #171c26 0%, #232a38 52%, #0c0f15 100%)" : undefined}
    >
      {fx.layer()}

      {vault && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 760, margin: "0 auto 12px", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", color: "#e3b341", padding: "5px 10px", borderRadius: 999, border: "1px solid rgba(227,179,65,0.45)", background: "rgba(0,0,0,0.25)" }}>
            {(cardTitle ?? "HERO POWER BINGO").toUpperCase()} · FINAL DRILL
          </span>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", color: "#cfd6e6", padding: "5px 10px", borderRadius: 999, border: "1px solid rgba(207,214,230,0.25)", background: "rgba(0,0,0,0.25)" }}>
            {stamped.size} OF {signs.length} BOLTS HOME
          </span>
        </div>
      )}

      {/* HOUSE skin: the hall-table plate. Inset 22px so nothing sits flush in
          the ExerciseFrame corners. */}
      {house && (
        <div style={{ padding: "0 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", maxWidth: 620, margin: "0 auto 12px", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", color: HOUSE_LAMP, padding: "5px 11px", borderRadius: 999, border: `1px solid ${HOUSE_BRASS}66`, background: "rgba(0,0,0,0.3)" }}>
              <PixIcon emoji="🏠" size={15} />
              {(cardTitle ?? "THE SCOUT'S CHECK-CARD").toUpperCase()}
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", color: HOUSE_BRASS, padding: "5px 11px", borderRadius: 999, border: `1px solid ${HOUSE_BRASS}59`, background: "rgba(0,0,0,0.3)" }}>
              {stamped.size} OF {signs.length} STAMPED
            </span>
          </div>
        </div>
      )}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "Break-Sign Bingo"}
          subtitle={introSubtitle ?? "Four scenes, four body-bells. Tap the sign each scene is showing and fill the card!"}
          icon={introIcon ?? "🔔"}
          narration={introNarration}
          character={introNarration?.speaker}
          threat={house ? threat : undefined}
          // This game frame is wide (820px); without `overlay` the threat-less
          // intro renders as a big empty box inside it. overlay = clean modal.
          overlay
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Scene card */}
      {round && !finished && (
        <AnimatePresence mode="wait">
          <motion.div
            key={round.id}
            initial={reduce ? false : { y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? undefined : { y: -24, opacity: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              maxWidth: 620,
              margin: "0 auto 14px",
              padding: "13px 16px",
              borderRadius: 14,
              background: house
                ? "linear-gradient(176deg, #fffaf0 0%, #f6e8cd 100%)"
                : vault
                ? "linear-gradient(180deg, rgba(28,34,46,0.96), rgba(14,18,25,0.96))"
                : "rgba(0,229,255,0.08)",
              border: house ? "1.5px solid rgba(138,90,43,0.55)" : vault ? "1.5px solid rgba(227,179,65,0.55)" : "1px solid rgba(125,240,255,0.35)",
              boxShadow: house ? "0 16px 34px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.9)" : vault ? "0 18px 40px -22px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08)" : undefined,
              color: house ? HOUSE_INK : vault ? "#f3f5ff" : "#dff6ff",
              fontSize: 15,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            {house && (
              <span aria-hidden style={{ flex: "none", display: "grid", placeItems: "center", width: 26, height: 26, borderRadius: "50%", background: "radial-gradient(circle at 36% 30%, #ffeec2, #c8912f 62%, #7a5312 100%)", boxShadow: "0 3px 6px -2px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.7)" }} />
            )}
            {vault && (
              <span aria-hidden style={{ flex: "none", display: "grid", placeItems: "center", width: 40, height: 40, borderRadius: "50%", border: "2px solid #e3b341", background: "radial-gradient(circle at 40% 35%, #3a4356, #151a24)", fontSize: 18 }}>
                <PixIcon emoji="🔊" size={20} />
              </span>
            )}
            {round.sceneIcon && <PixIcon emoji={round.sceneIcon} size={34} />}
            <span style={{ flex: 1 }}>
              {house && <span style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", color: "#8a5a2b", fontWeight: 900, marginBottom: 3 }}>A MOMENT IN THE HOUSE</span>}
              {vault && <span style={{ display: "block", fontSize: 10, letterSpacing: "0.16em", color: "#e3b341", fontWeight: 900, marginBottom: 3 }}>SARAH READS</span>}
              {round.scene}
            </span>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Sarah reads the scene aloud (audio-only, visually hidden so it doesn't
          duplicate the scene card); the click-guard holds the squares until she
          finishes. recordedOnly = silent on un-recorded weeks (no robotic TTS).
          MUST wait for !showIntro, exactly as the vault path below does: the
          intro's no-skip gate hides "I'm ready" until ITS narration fires onDone,
          and a scene clip starting underneath the overlay clobbers that one, so
          the gate falls through to its 45s safety release and the child stares at
          a dead card. Latent on the card skin only because Week 6's scenes were
          never recorded; it bit Week 14 the moment its scenes were. */}
      {!vault && round && !showIntro && !finished && !feedback && !explain && (
        <div aria-hidden style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", pointerEvents: "none" }}>
          <InfoNarration key={`sb-scene-${round.id}`} speaker="adam" lines={[round.scene]} accent="#7df0ff" recordedOnly />
        </div>
      )}

      {/* Vault skin: Sarah's instructions ON the board, as a sequenced chain so no
          two lines overlap: the how-to once -> the move -> "turn its dial". */}
      {vault && round && !showIntro && !finished && !feedback && !explain && !bolting && (
        <div aria-hidden style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", pointerEvents: "none" }}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="sb-howto" speaker={coachLines.speaker ?? "adam"} lines={coachLines.lines} accent="#e3b341" recordedOnly onDone={() => setNarr("scene")} />
          )}
          {narr === "scene" && sceneOneTake === true && prompt && (
            <InfoNarration key={`sb-scene1-${round.id}`} speaker="adam" lines={[round.scene, prompt]} accent="#e3b341" recordedOnly onDone={() => setNarr("done")} />
          )}
          {narr === "scene" && sceneOneTake === false && (
            <InfoNarration key={`sb-scene-${round.id}`} speaker="adam" lines={[round.scene]} accent="#e3b341" recordedOnly onDone={() => setNarr(prompt ? "prompt" : "done")} />
          )}
          {narr === "prompt" && prompt && (
            <InfoNarration key={`sb-prompt-${round.id}-${wrongCount}`} speaker="adam" lines={[prompt]} accent="#e3b341" recordedOnly onDone={() => setNarr("done")} />
          )}
        </div>
      )}

      {/* Vault skin: the action, always visible on the board (not only in the intro). */}
      {vault && round && !finished && (
        <div style={{ textAlign: "center", margin: "-2px auto 12px", fontSize: 11.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#cfd6e6", opacity: 0.85 }}>
          <PixIcon emoji="👆" size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />
          {guided ? "Round 1: the glowing dial is the power this move used. Tap it!" : "Tap the dial for the power this move used"}
        </div>
      )}

      {/* ── VAULT skin: four brass dials around the door, bolts slide home ── */}
      {vault && (
        <div style={{ overflowX: "auto", margin: "0 auto" }}>
          <style>{`@keyframes sbGuide { 0%, 100% { box-shadow: 0 0 0 0 rgba(126,255,151,0.0), 0 16px 30px -14px rgba(0,0,0,0.9); } 50% { box-shadow: 0 0 0 8px rgba(126,255,151,0.55), 0 0 38px 10px rgba(126,255,151,0.45); } }`}</style>
          <div style={{ position: "relative", width: 760, height: 350, margin: "0 auto" }}>
            {/* door */}
            <motion.svg
              viewBox="0 0 300 300"
              aria-hidden
              animate={sealing && !reduce ? { scale: [1, 1.08, 1], rotate: [0, -2, 0] } : allBolted && !reduce ? { scale: [1, 1.04, 1] } : { scale: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                position: "absolute",
                left: 260,
                top: 55,
                width: 240,
                height: 240,
                filter: allBolted ? "drop-shadow(0 0 34px rgba(255,220,120,0.85))" : "drop-shadow(0 30px 40px rgba(0,0,0,0.7))",
                transition: "filter 600ms ease",
              }}
            >
              <defs>
                <radialGradient id="sbSteel" cx="45%" cy="35%" r="72%"><stop offset="0" stopColor="#5b6577" /><stop offset=".6" stopColor="#2c3444" /><stop offset="1" stopColor="#171c27" /></radialGradient>
                <linearGradient id="sbBrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe08a" /><stop offset=".5" stopColor="#e3b341" /><stop offset="1" stopColor="#8b6516" /></linearGradient>
                <linearGradient id="sbBrass2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe9a8" /><stop offset=".5" stopColor="#d9a736" /><stop offset="1" stopColor="#7a5812" /></linearGradient>
              </defs>
              <circle cx="150" cy="150" r="146" fill="url(#sbBrass)" />
              <circle cx="150" cy="150" r="132" fill="url(#sbSteel)" stroke="#0d1119" strokeWidth="3" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
                const a = (deg * Math.PI) / 180;
                return <circle key={deg} cx={150 + Math.cos(a) * 139} cy={150 + Math.sin(a) * 139} r="4.5" fill="#fff1c2" stroke="#7a5812" strokeWidth="1.5" />;
              })}
              <circle cx="150" cy="150" r="104" fill="none" stroke="url(#sbBrass2)" strokeWidth="4" opacity=".85" />
              {/* bolt sockets: lit once the matching dial is bolted */}
              {[
                { x: 14, y: 61, i: 0 },
                { x: 14, y: 221, i: 1 },
                { x: 258, y: 61, i: 2 },
                { x: 258, y: 221, i: 3 },
              ].map((s) => (
                <rect key={s.i} x={s.x} y={s.y} width="28" height="18" rx="4" fill={socketLit(s.i) ? "#ffe08a" : "#0a0d13"} stroke={socketLit(s.i) ? "#fff6d6" : "rgba(227,179,65,.55)"} strokeWidth="2" style={{ transition: "fill 300ms ease" }} />
              ))}
              {/* plaque */}
              <rect x="86" y="50" width="128" height="30" rx="8" fill="url(#sbBrass)" stroke="#fff1c2" strokeWidth="1.5" />
              <text x="150" y="70" textAnchor="middle" fontFamily="inherit" fontWeight="700" fontSize="13" letterSpacing="1.5" fill="#2b1d02">{roundLabel}</text>
              {/* wheel handle */}
              <motion.g animate={allBolted && !reduce ? { rotate: 180 } : { rotate: 0 }} transition={{ duration: 1.1, ease: "easeInOut" }} style={{ originX: "150px", originY: "150px" }}>
                <circle cx="150" cy="150" r="62" fill="none" stroke="url(#sbBrass2)" strokeWidth="11" />
                <g stroke="url(#sbBrass2)" strokeWidth="10" strokeLinecap="round">
                  <line x1="150" y1="150" x2="150" y2="92" />
                  <line x1="150" y1="150" x2="200" y2="179" />
                  <line x1="150" y1="150" x2="100" y2="179" />
                </g>
                <circle cx="150" cy="150" r="24" fill="url(#sbBrass)" stroke="#fff1c2" strokeWidth="2" />
                <circle cx="150" cy="150" r="9" fill="#2b1d02" opacity=".7" />
              </motion.g>
              <text x="150" y="242" textAnchor="middle" fontFamily="inherit" fontWeight="700" fontSize="10.5" letterSpacing="2" fill="#ffe08a">{allBolted ? "VAULT SEALED" : "BOLT EVERY POWER HOME"}</text>
            </motion.svg>

            {/* tracks + bolts */}
            {dialSlots.map((slot, i) => {
              const lit = socketLit(i);
              return (
                <div
                  key={`track-${i}`}
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: slot.trackLeft,
                    top: slot.trackTop,
                    width: slot.trackWidth,
                    height: 20,
                    borderRadius: 7,
                    background: "#0a0d13",
                    border: "1.5px solid rgba(227,179,65,0.35)",
                    boxShadow: "inset 0 3px 6px rgba(0,0,0,0.9)",
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    initial={false}
                    animate={{ width: lit ? "100%" : "0%" }}
                    transition={{ duration: reduce ? 0.2 : 0.9, delay: lit && !reduce ? 0.35 : 0, ease: "easeOut" }}
                    style={{
                      position: "absolute",
                      top: 2,
                      bottom: 2,
                      [slot.side === "left" ? "left" : "right"]: 2,
                      borderRadius: 5,
                      background: "linear-gradient(180deg, #ffe9a8 0%, #e3b341 50%, #9a7018 100%)",
                      boxShadow: "0 0 18px rgba(255,220,120,0.9)",
                    }}
                  />
                </div>
              );
            })}

            {/* dials: the four tap targets, identical in style (no giveaway) */}
            {shownSigns.slice(0, 4).map((s, i) => {
              const slot = dialSlots[i];
              const isStamped = stamped.has(s.id);
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  onClick={() => tap(s, i)}
                  onPointerEnter={() => audio.hover()}
                  disabled={!!feedback || !!explain || finished || bolting || sealing}
                  aria-label={`${s.label}${isStamped ? ", bolted" : ""}`}
                  animate={wobbleId === s.id && !reduce ? { rotate: [0, -4, 4, -2, 0] } : { rotate: 0 }}
                  whileHover={reduce || isStamped ? undefined : { y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    position: "absolute",
                    left: slot.left,
                    top: slot.top,
                    width: DIAL,
                    height: DIAL,
                    padding: 7,
                    borderRadius: "50%",
                    border: "none",
                    background: "linear-gradient(160deg, #ffe08a 0%, #e3b341 45%, #8b6516 100%)",
                    boxShadow: isStamped
                      ? "0 0 34px rgba(227,179,65,0.7), 0 16px 30px -14px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.5)"
                      : "0 16px 30px -14px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.5)",
                    cursor: isStamped ? "default" : "pointer",
                    fontFamily: "inherit",
                    ...(guided && s.id === round?.signId && !reduce ? { animation: "sbGuide 1.1s ease-in-out infinite" } : null),
                    ...(guided && s.id === round?.signId && reduce ? { outline: "4px solid #7eff97", outlineOffset: 3 } : null),
                    touchAction: "manipulation",
                  }}
                >
                  {/* pointer notch: turns a quarter when bolted */}
                  <motion.span
                    aria-hidden
                    initial={false}
                    animate={{ rotate: isStamped ? (slot.side === "left" ? 90 : -90) : 0 }}
                    transition={{ duration: reduce ? 0.2 : 0.8, ease: "easeOut" }}
                    style={{ position: "absolute", left: "50%", top: 3, width: 6, height: 16, marginLeft: -3, borderRadius: 3, background: isStamped ? "#ffe08a" : "#2b1d02", transformOrigin: `3px ${DIAL / 2 - 3}px`, boxShadow: "0 0 0 1.5px rgba(255,241,194,0.6)" }}
                  />
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: isStamped
                        ? "radial-gradient(circle at 45% 30%, #5b5230 0%, #32301f 55%, #1a1a12 100%)"
                        : "radial-gradient(circle at 45% 30%, #4d5668 0%, #2a3140 55%, #171c27 100%)",
                      boxShadow: "inset 0 6px 14px rgba(0,0,0,0.7)",
                      color: "#f7f8ff",
                      fontSize: 12.5,
                      fontWeight: 800,
                      lineHeight: 1.1,
                      padding: "0 10px",
                      textAlign: "center",
                    }}
                  >
                    <PixIcon emoji={s.icon} size={38} />
                    {s.label}
                  </span>
                  {isStamped && (
                    <motion.span
                      initial={reduce ? false : { scale: 1.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ position: "absolute", left: "50%", top: -10, transform: "translateX(-50%)", padding: "3px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.12em", whiteSpace: "nowrap", background: "linear-gradient(180deg, #ffe08a, #e3b341)", color: "#2b1d02", boxShadow: "0 6px 12px -6px rgba(0,0,0,0.8)" }}
                    >
                      BOLTED
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── HOUSE skin: the Scout's wooden check-card on the hall table ──
          Oak tray, brass rail, cream card stock, one ivory ticket per power.
          A pressed ticket goes brass and sinks into the stock, so the three
          surfaces (stock / stampable ticket / pressed ticket) stay far apart
          in luminance. Board inset 22px, grid wraps at phone width. */}
      {house && (
        <div style={{ padding: "0 22px" }}>
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              padding: 10,
              borderRadius: 20,
              background: HOUSE_OAK,
              border: "1px solid rgba(255,220,170,0.18)",
              boxShadow: "0 24px 46px -26px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,225,180,0.32)",
            }}
          >
            <div
              aria-hidden
              style={{
                height: 3,
                borderRadius: 2,
                margin: "0 8px 9px",
                background: "linear-gradient(90deg, rgba(231,189,99,0) 0%, #e7bd63 22%, #fff0cd 50%, #e7bd63 78%, rgba(231,189,99,0) 100%)",
              }}
            />
            <div
              style={{
                borderRadius: 13,
                padding: "14px 13px 13px",
                background: `repeating-linear-gradient(0deg, rgba(138,90,43,0.07) 0 1px, transparent 1px 26px), linear-gradient(180deg, #ecd9b5 0%, ${HOUSE_STOCK} 100%)`,
                boxShadow: "inset 0 2px 9px rgba(70,42,16,0.35)",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(142px, 1fr))", gap: 10 }}>
                {shownSigns.map((s, i) => {
                  const isStamped = stamped.has(s.id);
                  return (
                    <motion.button
                      key={s.id}
                      type="button"
                      onClick={() => tap(s, i)}
                      onPointerEnter={() => audio.hover()}
                      disabled={!!feedback || !!explain || finished || bolting || sealing}
                      aria-label={`${s.label}${isStamped ? ", stamped" : ""}`}
                      animate={wobbleId === s.id && !reduce ? { rotate: [0, -4, 4, -2, 0] } : { rotate: 0 }}
                      whileHover={reduce || isStamped ? undefined : { y: -3 }}
                      whileTap={{ scale: 0.97 }}
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 7,
                        minHeight: 104,
                        padding: "13px 9px",
                        borderRadius: 11,
                        border: isStamped ? "2.5px solid #5a3810" : "2.5px solid #8a5a2b",
                        background: isStamped ? HOUSE_PRESSED : HOUSE_TICKET,
                        color: isStamped ? "#fff6e2" : HOUSE_INK,
                        textShadow: isStamped ? "0 1px 2px rgba(48,28,4,0.75)" : undefined,
                        fontSize: 13.5,
                        fontWeight: 800,
                        lineHeight: 1.25,
                        fontFamily: "inherit",
                        cursor: isStamped ? "default" : "pointer",
                        boxShadow: isStamped
                          ? "inset 0 3px 9px rgba(56,32,4,0.6), 0 4px 10px -7px rgba(0,0,0,0.75)"
                          : "0 3px 0 #c9a16a, 0 13px 20px -14px rgba(0,0,0,0.75)",
                        touchAction: "manipulation",
                      }}
                    >
                      <PixIcon emoji={s.icon} size={34} />
                      {s.label}
                      {isStamped && (
                        <motion.span
                          initial={reduce ? false : { scale: 1.9, opacity: 0, rotate: -24 }}
                          animate={{ scale: 1, opacity: 1, rotate: -11 }}
                          transition={{ type: "spring", stiffness: 320, damping: 17 }}
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 6,
                            padding: "2px 8px",
                            borderRadius: 999,
                            border: "2px solid #fff0cd",
                            background: "rgba(48,28,6,0.5)",
                            color: "#fff6e2",
                            fontSize: 9.5,
                            fontWeight: 900,
                            letterSpacing: "0.1em",
                          }}
                        >
                          STAMPED
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
              {!finished && (
                <div style={{ textAlign: "center", marginTop: 11, fontSize: 11, fontWeight: 900, color: "#8a5a2b", letterSpacing: "0.12em" }}>
                  MOMENT {Math.min(roundIdx + 1, shownRounds.length)} OF {shownRounds.length}
                </div>
              )}
            </div>
          </div>

          {/* The brass stamp resting on the table: it dips each time a ticket
              is pressed. Decoration only, and still when motion is reduced. */}
          {round && !finished && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 9,
                maxWidth: 560,
                margin: "11px auto 0",
                fontSize: 11.5,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: HOUSE_LAMP,
                opacity: 0.9,
                textAlign: "center",
              }}
            >
              <motion.span
                key={`sb-stamp-${stamped.size}`}
                aria-hidden
                initial={reduce ? false : { y: -9, rotate: -14 }}
                animate={{ y: 0, rotate: 0 }}
                transition={{ type: "spring", stiffness: 430, damping: 15 }}
                style={{
                  display: "inline-grid",
                  placeItems: "center",
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: "linear-gradient(180deg, #f0c469 0%, #a9761f 100%)",
                  boxShadow: "0 4px 8px -4px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,246,222,0.8)",
                }}
              >
                <PixIcon emoji="👆" size={14} />
              </motion.span>
              <span>{actionLine ?? "Press the stamp on the power that answers it"}</span>
            </div>
          )}
        </div>
      )}

      {/* ── CARD skin: the 2x2 bingo card ── */}
      {!vault && !house && (
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "14px 14px 16px",
          borderRadius: 18,
          background: "linear-gradient(180deg, #12305c 0%, #0c1e42 100%)",
          border: "2px solid rgba(126,255,151,0.4)",
          boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ textAlign: "center", fontSize: 12, fontWeight: 900, letterSpacing: "0.14em", color: "#7eff97", marginBottom: 10 }}>
          {cardTitle ?? "BREAK-SIGN BINGO"} · {stamped.size}/{signs.length}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10 }}>
          {shownSigns.map((s, i) => {
            const isStamped = stamped.has(s.id);
            return (
              <motion.button
                key={s.id}
                type="button"
                onClick={() => tap(s, i)}
                onPointerEnter={() => audio.hover()}
                disabled={!!feedback || !!explain || finished || bolting || sealing}
                animate={wobbleId === s.id && !reduce ? { rotate: [0, -4, 4, -2, 0] } : { rotate: 0 }}
                whileHover={reduce || isStamped ? undefined : { y: -4 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  minHeight: 108,
                  padding: "14px 10px",
                  borderRadius: 14,
                  border: isStamped ? "2.5px solid #34d399" : "2px solid rgba(125,240,255,0.4)",
                  background: isStamped
                    ? "linear-gradient(165deg, rgba(52,211,153,0.28), rgba(9,40,32,0.9))"
                    : "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                  color: "#eaf9ff",
                  fontSize: 14,
                  fontWeight: 800,
                  lineHeight: 1.3,
                  fontFamily: "inherit",
                  cursor: isStamped ? "default" : "pointer",
                  boxShadow: isStamped ? "0 0 22px -6px rgba(52,211,153,0.8)" : "0 14px 30px -18px rgba(0,229,255,0.7)",
                  touchAction: "manipulation",
                }}
              >
                <PixIcon emoji={s.icon} size={34} />
                {s.label}
                {isStamped && (
                  <motion.div
                    initial={reduce ? false : { scale: 2, opacity: 0, rotate: -14 }}
                    animate={{ scale: 1, opacity: 1, rotate: -8 }}
                    style={{
                      position: "absolute",
                      top: 6,
                      right: 8,
                      padding: "3px 8px",
                      borderRadius: 8,
                      background: "#34d399",
                      color: "#04180f",
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.08em",
                    }}
                  >
                    ✓ SPOTTED
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
        {!finished && (
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 12, fontWeight: 800, color: "#7d8cc9", letterSpacing: "0.1em" }}>
            SCENE {Math.min(roundIdx + 1, shownRounds.length)} OF {shownRounds.length}
          </div>
        )}
      </div>
      )}

      <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
      </div>

      {/* Card skin only: the vault skin speaks its coach line inside the sequenced chain above. */}
      {coachLines && !vault && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => {
            setFeedback(null);
            // Vault skin: Sarah re-prompts after a wrong tap ("turn its dial").
            if (vault) setNarr("prompt");
          }}
        />
      )}

      {/* Teach-on-success: Sarah explains WHY that move showed the power. The
          InfoNarration reads it aloud (guard holds the screen); Next appears
          once she's finished (or the safety release fires). */}
      {explain && (
        <div
          style={
            house
              ? {
                  // House skin: the check-card fills the frame, so the "why" beat
                  // floats over it on a warm lamp-dim instead of falling below the fold.
                  position: "absolute",
                  inset: 0,
                  zIndex: 20,
                  display: "grid",
                  placeItems: "center",
                  padding: 22,
                  background: "rgba(28,16,6,0.74)",
                  backdropFilter: "blur(2px)",
                  textAlign: "center",
                }
              : vault
              ? {
                  // Vault skin: the board is tall, so the "why" beat floats over the
                  // door (dimmed) instead of stacking below the fold.
                  position: "absolute",
                  inset: 0,
                  zIndex: 20,
                  display: "grid",
                  placeItems: "center",
                  padding: 20,
                  background: "rgba(10,12,20,0.72)",
                  backdropFilter: "blur(2px)",
                  textAlign: "center",
                }
              : { maxWidth: 560, margin: "14px auto 0", textAlign: "center" }
          }
        >
          <div style={house ? { width: "100%", maxWidth: 560, padding: "18px 20px", borderRadius: 18, background: "linear-gradient(178deg, #fffaf0 0%, #f2e2c3 100%)", border: `2px solid ${HOUSE_BRASS}`, boxShadow: "0 24px 60px -24px rgba(0,0,0,0.9)", color: HOUSE_INK } : vault ? { width: "100%", maxWidth: 560, padding: "18px 20px", borderRadius: 18, background: "linear-gradient(180deg, rgba(28,34,46,0.98), rgba(14,18,25,0.98))", border: "1.5px solid rgba(227,179,65,0.55)", boxShadow: "0 24px 60px -24px rgba(0,0,0,0.9)" } : undefined}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              padding: "5px 14px",
              borderRadius: 999,
              background: house ? "rgba(138,90,43,0.12)" : vault ? "rgba(227,179,65,0.16)" : "rgba(126,255,151,0.14)",
              border: house ? "1px solid rgba(138,90,43,0.55)" : vault ? "1px solid rgba(227,179,65,0.6)" : "1px solid rgba(126,255,151,0.5)",
              color: house ? "#7a4d1f" : vault ? "#ffe08a" : "#a0ffb0",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.14em",
            }}
          >
            <PixIcon emoji="⭐" size={16} /> {house ? "STAMPED!" : vault ? "BOLT HOME!" : "SPOT ON!"}
          </div>
          <div style={{ textAlign: "left" }}>
            {/* Text on screen; the voice is the shared verdict ("That's right!" + why). */}
            <InfoNarration
              key={`sb-why-${explain.key}`}
              lines={[explain.why]}
              speaker="adam"
              accent={house ? "#8a5a2b" : vault ? "#e3b341" : "#7eff97"}
              recordedOnly
              autoPlay={false}
              guard={false}
            />
            <VerdictVoice key={`sb-vv-${explain.key}`} verdict="right" why={explain.why} onDone={() => setWhyDone(true)} />
          </div>
          {whyDone && (
            <div style={{ marginTop: 12 }}>
              <GameButton
                variant="primary"
                size="lg"
                onClick={() => {
                  setExplain(null);
                  setWhyDone(false);
                  if (vault && allBolted) {
                    // Seal moment: the door gets its pulse before the complete beat.
                    setSealing(true);
                    playSound("unlock");
                    window.setTimeout(() => setRoundIdx((i) => i + 1), reduce ? 400 : 1300);
                  } else if (vault) {
                    // A breath before the next move card slides in.
                    window.setTimeout(() => setRoundIdx((i) => i + 1), reduce ? 100 : 600);
                  } else {
                    setRoundIdx((i) => i + 1);
                  }
                }}
              >
                {stamped.size >= signs.length ? (house ? "See your check-card →" : vault ? "Seal the vault →" : "See your bingo →") : "Next →"}
              </GameButton>
            </div>
          )}
          </div>
        </div>
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "BINGO! Full card!"}
          stars={stars}
          statLines={[
            house
              ? `${firstTryCount}/${shownRounds.length} powers stamped first try`
              : `${firstTryCount}/${shownRounds.length} signs spotted first try`,
            completeLine ?? "Four body-bells learned - when one rings, it's break time.",
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(firstTryCount)}
        />
      )}
    </ExerciseFrame>
  );
}
