"use client";

/**
 * Phish Inspector.
 *
 * The deliberate cousin of SpamBlaster's reaction-speed turret. Each
 * email opens fullscreen; before the ZAP / SAFE decision buttons
 * unlock, the child must tap each of 4 inspect zones and read what
 * the analysis reveals:
 *
 *   1. WHO sent it?        (sender analysis)
 *   2. WHAT'S the link?    (URL / click target)
 *   3. HOW does it sound?  (urgency / pressure)
 *   4. WHAT'S it promising? (offer / threat)
 *
 * Each zone flips from a magnifying-glass icon to either a green ✓
 * (no red flag) or a red ⚠ (red flag) + a short kid-friendly note.
 * After all 4 are inspected the decision row appears. Wrong decision
 * pauses with a WrongAnswerPanel explanation.
 *
 * Teaches the mental model of phishing literacy: SLOW DOWN, LOOK AT
 * THESE FOUR THINGS, then decide. Replaces "every scary message =
 * delete" with "every message gets inspected".
 *
 * Skin "inbox" (default, Week 4 "The Barker's Booth"): the item opens as a
 * message card in a dark inbox.
 *
 * Skin "doorway" (Week 16, "A Door You Can't See Through"): the SAME four
 * checks and the same decide-only-after-all-four mechanic, repainted as a
 * door in the Doorway Maze. The card becomes a wooden door in a stone jamb:
 * the painted SIGN across the top is what the door promises, and the brass
 * ADDRESS PLATE screwed on below is where it actually opens. The four
 * inspect zones become four brass studs set into the door. Nothing about the
 * mechanic moves - only paint and the layout of the card.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, {
  ExerciseCompleteBeat,
} from "@/app/components/lesson/ExerciseBeats";
import GameButton from "@/app/components/lesson/GameButton";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration (the text Sarah reads is already on screen).
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

/** Visual skin. "inbox" = the original message card (Week 4). "doorway" =
 *  Week 16's door-in-a-stone-jamb repaint. Paint and layout only. */
export type PhishInspectorSkin = "inbox" | "doorway";

export interface PhishEmail {
  id: string;
  sender: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  /** Learn-Loop weeks: Sarah reads the message as it opens (one clip). */
  readAloud?: string;
  /** Sarah's reason on a correct verdict ("That's right!" + why). */
  why?: string;
  /** The wrong-answer panel's explanation (falls back to the generic line). */
  whyWrong?: string;
  inspections: {
    senderNote: string;
    senderIsRedFlag: boolean;
    linkText: string;
    linkNote: string;
    linkIsRedFlag: boolean;
    urgencyNote: string;
    urgencyIsRedFlag: boolean;
    claimNote: string;
    claimIsRedFlag: boolean;
  };
}

export interface PhishInspectorProps {
  emails: PhishEmail[];
  /** Visual skin: the W4 message card (default) or W16's maze door. */
  skin?: PhishInspectorSkin;
  hints?: { tier1: string; tier2: string };
  /** Intro copy overrides + spoken paced narration (week re-dress). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Zone label overrides so a re-dress can rename the 4 inspect zones
   *  (e.g. banner ads: "Who's selling?" / "What's the button?"). */
  zoneLabels?: Partial<Record<"sender" | "link" | "urgency" | "claim", string>>;
  /** The sub-line under each closed zone ("Check the sender"); a re-dress
   *  overrides these alongside the labels. */
  zoneQuestions?: Partial<Record<"sender" | "link" | "urgency" | "claim", string>>;
  /** Learn-Loop copy (Week 4 "The Barker's Booth"). */
  headerLabel?: string;
  zapLabel?: string;
  safeLabel?: string;
  zapToast?: string;
  safeToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  /* ── On-screen labels (never spoken; safe to leave at their defaults). ── */
  /** The word before the counter: "Message 1 / 5". */
  counterLabel?: string;
  /** The line under the locked decision row. */
  unlockHint?: string;
  /** The big stamp shown after a correct-or-not decision. */
  zapBanner?: string;
  safeBanner?: string;
  /** Inbox skin only: the "From:" prefix and the "now" timestamp on the card. */
  senderLabel?: string;
  timeLabel?: string;
  /** Doorway skin only: the tiny captions over the sign and the plate. */
  signCaption?: string;
  plateCaption?: string;
  /** The how-to, spoken once as the first message opens (audio only). */
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

type ZoneId = "sender" | "link" | "urgency" | "claim";
type Phase = "intro" | "active" | "finished";

const ZONE_META: Record<ZoneId, { label: string; question: string; icon: string }> = {
  sender:  { label: "Who sent it?",      question: "Check the sender", icon: "👤" },
  link:    { label: "What's the link?",  question: "Look at the link", icon: "🔗" },
  urgency: { label: "How does it sound?", question: "Listen to the tone", icon: "⏱️" },
  claim:   { label: "What's it promising?", question: "Check the offer", icon: "🎁" },
};

/* ── Skin paint. Every "inbox" value is the literal the file shipped with;
      only the "doorway" column is new. ── */
const SKINS = {
  inbox: {
    frameBg: "linear-gradient(180deg, #050a1a 0%, #1a1f4d 100%)",
    cardBg: "rgba(8, 10, 22, 0.85)",
    cardBorder: "1px solid rgba(125, 240, 255, 0.25)",
    cardRadius: 12,
    closedBg: "rgba(15, 21, 48, 0.7)",
    closedBorder: "rgba(125, 240, 255, 0.3)",
    closedText: "#7df0ff",
    zoneRadius: 12,
    noteText: "#e2e8f0",
  },
  doorway: {
    // A stone corridor receding into the dark; the door is the only warm thing.
    frameBg: "radial-gradient(120% 90% at 50% 0%, #2c3a4e 0%, #18222f 48%, #0a0f16 100%)",
    // Dark oiled wood inside a brass-rimmed jamb.
    cardBg: "linear-gradient(180deg, #4a3722 0%, #2e2216 62%, #241a11 100%)",
    cardBorder: "3px solid #d9a441",
    cardRadius: 16,
    // Brass studs on wood: warm and clearly lifted off the door.
    closedBg: "rgba(20, 15, 9, 0.88)",
    closedBorder: "rgba(217, 164, 65, 0.85)",
    closedText: "#ffdc9b",
    zoneRadius: 10,
    noteText: "#fff3dc",
  },
} as const;

export default function PhishInspector({
  emails,
  skin = "inbox",
  hints,
  introTitle,
  introSubtitle,
  introIcon = "🔍",
  introNarration,
  zoneLabels,
  zoneQuestions,
  headerLabel = "🔍 Phish Inspector",
  zapLabel = "ZAP it!",
  safeLabel = "Mark SAFE",
  zapToast = "ZAPPED!",
  safeToast = "STAYED SAFE!",
  wrongTitle,
  completeTitle = "Inspector training complete!",
  completeLine,
  counterLabel = "Message",
  unlockHint = "Tap all 4 clues to open the buttons",
  zapBanner = "⚡ ZAPPED!",
  safeBanner = "✓ SAFE",
  senderLabel = "From:",
  timeLabel = "now",
  signCaption = "WHAT THE SIGN SAYS",
  plateCaption = "WHERE IT REALLY OPENS",
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: PhishInspectorProps) {
  const intensity = useMotionIntensity();
  const fx = useExerciseFeedback();
  const audio = useGameAudio();
  const accent = useLessonTheme()?.accent ?? "#7df0ff";
  const door = skin === "doorway";
  const sk = SKINS[skin];
  // Both content voices are Sarah; in-game read-alouds are recorded under "adam".
  const voice = "adam" as const;

  const [phase, setPhase] = useState<Phase>("intro");
  // Read-aloud chain (Learn-Loop): the how-to once, the message as it opens,
  // then each inspection note as its zone is tapped. Taps are held meanwhile.
  const [narr, setNarr] = useState<"howto" | "read" | "zone" | "idle">("idle");
  const [zoneLine, setZoneLine] = useState<string | null>(null);
  // Spoken verdicts (owner 2026-09-12): "That's right!" + why on a correct
  // verdict, and the next message waits for Sarah. Wrong verdicts speak
  // through the WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  // Synchronous mirror of `narr !== "idle"`. Two zone taps inside one tick both
  // read the stale state and the second read-aloud clobbers the first; the ref
  // is written before React re-renders, so the second tap is refused.
  const narrRef = useRef(false);
  useEffect(() => {
    if (narr === "idle") { narrRef.current = false; return; }
    narrRef.current = true;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) { narrRef.current = false; setNarr("idle"); } }), []);
  const [emailIdx, setEmailIdx] = useState(0);
  const [inspected, setInspected] = useState<Record<ZoneId, boolean>>({
    sender: false,
    link: false,
    urgency: false,
    claim: false,
  });
  const [decided, setDecided] = useState(false);
  // Synchronous latch on the judged tap. `decided` is state, so two taps in
  // the same tick both read the old value and both score; this ref closes
  // that window. Cleared when the next door opens AND after a wrong call.
  const judgingRef = useRef(false);
  const [wrongTotal, setWrongTotal] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(0);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  const [correctCount, setCorrectCount] = useState(0);

  // Anti-sequence: the inbox opens its emails in a random order every play
  // (authored lists alternate phish/real). The 4 inspect zones are the fixed
  // checking procedure and stay in place; ZAP / SAFE keep their sides.
  const shownEmails = useShuffledOnce(emails);
  const email = shownEmails[emailIdx];
  const allInspected = useMemo(
    () => inspected.sender && inspected.link && inspected.urgency && inspected.claim,
    [inspected]
  );

  // Move to the next message: reset the per-message state in the same event
  // (never in an effect), and Sarah reads the new message as it opens.
  const openEmail = useCallback((next: number) => {
    judgingRef.current = false;
    setEmailIdx(next);
    setInspected({ sender: false, link: false, urgency: false, claim: false });
    setDecided(false);
    setWrongOnCurrent(0);
    if (!isAudioMuted()) { narrRef.current = true; setNarr("read"); }
  }, []);

  const speaking = narr !== "idle" || verdict.speaking;

  const handleInspect = useCallback(
    (zone: ZoneId) => {
      if (!email || feedback || decided || speaking) return;
      if (inspected[zone]) return;
      if (narrRef.current || judgingRef.current) return;
      audio.tap();
      setInspected((prev) => ({ ...prev, [zone]: true }));
      // Sarah reads the note that opens (audio only, taps held).
      const note =
        zone === "sender"
          ? email.inspections.senderNote
          : zone === "link"
            ? email.inspections.linkNote
            : zone === "urgency"
              ? email.inspections.urgencyNote
              : email.inspections.claimNote;
      if (note && !isAudioMuted()) {
        narrRef.current = true;
        setZoneLine(note);
        setNarr("zone");
      }
      // Subtle juice: red-flag reveals get a danger toast, green reveals
      // get a soft xp toast.
      const isRedFlag =
        zone === "sender"
          ? email.inspections.senderIsRedFlag
          : zone === "link"
            ? email.inspections.linkIsRedFlag
            : zone === "urgency"
              ? email.inspections.urgencyIsRedFlag
              : email.inspections.claimIsRedFlag;
      if (isRedFlag) {
        fx.toast({
          text: "RED FLAG!",
          tone: "danger",
          durationMs: 700,
        });
      } else {
        fx.toast({
          text: "Looks ok",
          tone: "xp",
          durationMs: 600,
        });
      }
    },
    [email, feedback, decided, inspected, audio, fx, speaking]
  );

  const handleDecision = useCallback(
    (zapped: boolean) => {
      if (!email || feedback || decided || speaking) return;
      if (judgingRef.current) return;
      judgingRef.current = true;
      const wasCorrect = zapped === email.isPhishing;
      // correctIndex: 0 for ZAP if phishing, 1 for SAFE if legit.
      const correctIndex = email.isPhishing ? 0 : 1;
      const selectedIndex = zapped ? 0 : 1;
      onAnswered?.({
        questionKey: `phish-${email.id}-decision`,
        selectedIndex,
        correctIndex,
        wasCorrect,
      });
      if (wasCorrect) {
        setCorrectCount((n) => n + 1);
        onCorrect?.();
        fx.correct({
          xp: 15,
          text: zapped ? zapToast : safeToast,
          tone: zapped ? "danger" : "xp",
        });
        setDecided(true);
        // Sarah says "That's right!" + why; the next message waits for her
        // (instant when there is no reason or the week is un-recorded).
        const advance = () => {
          window.setTimeout(
            () => {
              const next = emailIdx + 1;
              if (next >= shownEmails.length) {
                setPhase("finished");
              } else {
                openEmail(next);
              }
            },
            intensity === 0 ? 400 : 900
          );
        };
        if (email.why) verdict.say("right", email.why, advance);
        else advance();
      } else {
        onWrong?.();
        audio.wrong();
        setWrongTotal((n) => n + 1);
        const nextWrong = wrongOnCurrent + 1;
        setWrongOnCurrent(nextWrong);
        const correctChoice = email.isPhishing ? zapLabel : safeLabel;
        // WrongAnswerPanel speaks "Not quite." + this explanation itself.
        setFeedback({
          title: wrongTitle ?? (email.isPhishing
            ? "That was a phishing trick"
            : "That was a real email!"),
          explanation: email.whyWrong ?? (email.isPhishing
            ? "You inspected the red flags - the right call was ZAP. The Raccoon would have got your password."
            : `"${email.sender}" was a normal email. You'd want to keep it - the answer was SAFE.`),
          tip: `Look at all 4 clues together. Red flags mean ${correctChoice}.`,
        });
        // A wrong call leaves the child on the same door, so the latch has to
        // reopen for their retry.
        judgingRef.current = false;
        if (nextWrong === 1) onHintReached?.(1);
        if (nextWrong >= 2) onHintReached?.(2);
      }
    },
    [
      email,
      feedback,
      decided,
      emailIdx,
      shownEmails.length,
      wrongOnCurrent,
      fx,
      audio,
      intensity,
      onCorrect,
      onWrong,
      onAnswered,
      onHintReached,
      speaking,
      verdict,
      openEmail,
      zapToast,
      safeToast,
      zapLabel,
      safeLabel,
      wrongTitle,
    ]
  );

  /* ─── Finished ─── */
  if (phase === "finished") {
    const stars = wrongTotal === 0 ? 3 : wrongTotal <= 1 ? 2 : 1;
    return (
      <ExerciseFrame maxWidth={900} padding={28}>
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${correctCount} of ${shownEmails.length} messages decided correctly`,
            completeLine ?? (wrongTotal === 0
              ? "Spotted every trick first time!"
              : `${wrongTotal} wrong decision${wrongTotal === 1 ? "" : "s"} along the way.`),
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(correctCount)}
        />
      </ExerciseFrame>
    );
  }

  /* ─── Active ─── */
  if (!email) return null;

  return (
    <ExerciseFrame
      maxWidth={1000}
      padding={24}
      background={sk.frameBg}
    >
      {verdict.element}
      {/* Sarah's read-alouds (audio only): the how-to once, the message as it
          opens, each inspection note as its zone is tapped. */}
      {phase === "active" && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="pi-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr(email.readAloud ? "read" : "idle")} />
          )}
          {narr === "read" && email.readAloud && (
            <InfoNarration key={`pi-read-${email.id}`} speaker={voice} lines={[email.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "zone" && zoneLine && (
            <InfoNarration key={`pi-zone-${email.id}-${zoneLine.slice(0, 24)}`} speaker={voice} lines={[zoneLine]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 11,
            letterSpacing: "0.16em",
            color: accent,
            textTransform: "uppercase",
            fontWeight: 800,
          }}
        >
          {headerLabel}
        </span>
        <span
          style={{
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#cbd5e1",
          }}
        >
          {counterLabel} {emailIdx + 1} / {shownEmails.length}
        </span>
      </div>

      {/* Email card / maze door. Same three pieces of content either way; the
          doorway skin re-stacks them as sign -> promise -> address plate. */}
      <div
        style={{
          padding: door ? "12px 16px 14px" : "14px 16px",
          marginBottom: 12,
          background: sk.cardBg,
          border: sk.cardBorder,
          borderRadius: sk.cardRadius,
          color: door ? sk.noteText : "#e2e8f0",
          fontFamily: "'DM Sans', sans-serif",
          position: door ? "relative" : undefined,
          boxShadow: door
            ? "0 20px 44px -22px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255, 225, 175, 0.16)"
            : undefined,
        }}
      >
        {door ? (
          <>
            {/* The brass handle, so the card reads as a door at a glance. */}
            <span
              aria-hidden
              style={{
                position: "absolute",
                right: 10,
                top: "50%",
                width: 13,
                height: 13,
                marginTop: -6,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #ffe4a8, #b8822c)",
                boxShadow: "0 0 10px rgba(255, 208, 130, 0.5)",
              }}
            />
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9.5,
                lineHeight: 1,
                letterSpacing: "0.18em",
                color: "#d9a441",
                marginBottom: 4,
              }}
            >
              {signCaption}
            </div>
            {/* The painted sign: big, bright, and promising. */}
            <div
              style={{
                padding: "8px 14px",
                marginBottom: 10,
                borderRadius: 8,
                background: "linear-gradient(180deg, #fff4dd 0%, #f2ddb4 100%)",
                border: "2px solid #8a5a12",
                color: "#3a2708",
                fontWeight: 900,
                fontSize: 16,
                lineHeight: 1.3,
                textAlign: "center",
              }}
            >
              {email.subject}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.45, color: "#f6e6c9", marginBottom: 10 }}>
              {email.body}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9.5,
                lineHeight: 1,
                letterSpacing: "0.18em",
                color: "#d9a441",
                marginBottom: 4,
              }}
            >
              {plateCaption}
            </div>
            {/* The brass address plate screwed on below the sign. */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: "7px 12px",
                borderRadius: 6,
                background: "linear-gradient(180deg, #e3bf78 0%, #b98f38 100%)",
                border: "2px solid #6d4c14",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45)",
                color: "#241703",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: "0.02em",
                wordBreak: "break-word",
              }}
            >
              <span style={{ minWidth: 0 }}>{email.sender}</span>
              <span aria-hidden style={{ fontSize: 13, opacity: 0.75 }}>🔩</span>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 11,
                color: "#94a3b8",
                marginBottom: 6,
                fontFamily: "'JetBrains Mono', monospace",
                letterSpacing: "0.04em",
              }}
            >
              <span>{senderLabel} <span style={{ color: "#cbd5e1" }}>{email.sender}</span></span>
              <span style={{ color: "#64748b" }}>{timeLabel}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: "#fff7e6" }}>
              {email.subject}
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: "#cbd5e1" }}>
              {email.body}
            </div>
          </>
        )}
      </div>

      {/* 4-zone inspector grid */}
      <div
        role="group"
        aria-label="Inspect 4 zones"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
          marginBottom: 14,
        }}
      >
        {(Object.keys(ZONE_META) as ZoneId[]).map((zone) => {
          const meta = {
            ...ZONE_META[zone],
            label: zoneLabels?.[zone] ?? ZONE_META[zone].label,
            question: zoneQuestions?.[zone] ?? ZONE_META[zone].question,
          };
          const isOpen = inspected[zone];
          const isRedFlag =
            zone === "sender"
              ? email.inspections.senderIsRedFlag
              : zone === "link"
                ? email.inspections.linkIsRedFlag
                : zone === "urgency"
                  ? email.inspections.urgencyIsRedFlag
                  : email.inspections.claimIsRedFlag;
          const noteText =
            zone === "sender"
              ? email.inspections.senderNote
              : zone === "link"
                ? `${email.inspections.linkText} - ${email.inspections.linkNote}`
                : zone === "urgency"
                  ? email.inspections.urgencyNote
                  : email.inspections.claimNote;
          const accent = isOpen
            ? isRedFlag
              ? { bg: "rgba(239, 68, 68, 0.12)", border: "rgba(255, 95, 179, 0.65)", text: "#ff9bcb" }
              : { bg: "rgba(126, 255, 151, 0.1)", border: "rgba(126, 255, 151, 0.55)", text: "#a0ffb0" }
            : { bg: sk.closedBg, border: sk.closedBorder, text: sk.closedText };
          return (
            <motion.button
              key={zone}
              type="button"
              onClick={() => handleInspect(zone)}
              disabled={isOpen || decided || phase !== "active" || speaking}
              initial={false}
              animate={
                isOpen
                  ? { scale: intensity === 0 ? 1 : [1, 1.04, 1], transition: { duration: 0.35 } }
                  : { scale: 1 }
              }
              style={{
                position: "relative",
                padding: "12px 14px",
                minHeight: 88,
                borderRadius: sk.zoneRadius,
                background: accent.bg,
                border: `2px solid ${accent.border}`,
                boxShadow: door ? "inset 0 1px 0 rgba(255, 228, 176, 0.18)" : undefined,
                color: accent.text,
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                textAlign: "left",
                cursor: !isOpen && phase === "active" && !decided ? "pointer" : "default",
                transition: "all 220ms ease-out",
                touchAction: "manipulation",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 22 }}>
                  {isOpen ? (isRedFlag ? "⚠" : "✓") : "🔍"}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  {meta.label}
                </span>
              </div>
              {isOpen ? (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: sk.noteText,
                    lineHeight: 1.4,
                  }}
                >
                  {noteText}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 13,
                    color: accent.text,
                    fontWeight: 700,
                  }}
                >
                  {meta.question}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Hint */}
      <div style={{ minHeight: 56, marginBottom: 12 }}>
        {wrongOnCurrent > 0 && hints && (
          <HintBubble
            tier={wrongOnCurrent >= 2 ? 2 : 1}
            speaker="layla"
            text={wrongOnCurrent >= 2 ? hints.tier2 : hints.tier1}
          />
        )}
      </div>

      {/* Decision row - only enabled once all 4 inspected */}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          opacity: allInspected ? 1 : 0.5,
          transition: "opacity 240ms ease-out",
        }}
      >
        <GameButton
          variant="danger"
          size="lg"
          icon="⚡"
          disabled={!allInspected || decided || phase !== "active" || speaking}
          onClick={() => handleDecision(true)}
          style={{ minWidth: 160 }}
        >
          {zapLabel}
        </GameButton>
        <GameButton
          variant="success"
          size="lg"
          icon="✅"
          disabled={!allInspected || decided || phase !== "active" || speaking}
          onClick={() => handleDecision(false)}
          style={{ minWidth: 160 }}
        >
          {safeLabel}
        </GameButton>
      </div>

      {!allInspected && (
        <div
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "#94a3b8",
            marginTop: 8,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {unlockHint}
        </div>
      )}

      {phase === "intro" && (
        <ExerciseIntroBeat
          title={introTitle ?? "Phish Inspector"}
          subtitle={
            introSubtitle ??
            "Don't just react - INSPECT. Tap each of the 4 zones, then decide if it's safe or a trick."
          }
          icon={introIcon}
          narration={introNarration}
          threat={threat}
          overlay
          character={introNarration?.speaker}
          onDismiss={() => {
            setPhase("active");
            const next = isAudioMuted() ? "idle" : coachLines ? "howto" : email.readAloud ? "read" : "idle";
            narrRef.current = next !== "idle";
            setNarr(next);
          }}
        />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker="layla"
          onContinue={() => setFeedback(null)}
        />
      )}

      <AnimatePresence>
        {decided && phase === "active" && (
          <motion.div
            initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
            animate={intensity === 0 ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              background: "rgba(8, 10, 22, 0.5)",
              backdropFilter: "blur(3px)",
            }}
          >
            <div
              style={{
                padding: "16px 24px",
                background: email.isPhishing
                  ? "linear-gradient(135deg, #ff5fb3, #ef4444)"
                  : "linear-gradient(135deg, #7eff97, #34d399)",
                color: "#0f1530",
                borderRadius: 12,
                fontWeight: 900,
                fontSize: 20,
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.06em",
                boxShadow: "0 0 32px rgba(0, 0, 0, 0.4)",
              }}
            >
              {email.isPhishing ? zapBanner : safeBanner}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {fx.layer()}
    </ExerciseFrame>
  );
}
