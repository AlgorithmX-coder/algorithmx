"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  badgeEarnedCelebration,
} from "@/app/lib/celebrations";
import { playSound } from "@/app/lib/sounds";
import ExerciseIntroBeat from "@/app/components/lesson/ExerciseBeats";

type Sender = "stranger" | "narrator";

type ChatMessage = {
  sender: Sender;
  text: string;
  delay?: number;
};

type ChoiceOption = {
  text: string;
  isSafe: boolean;
  feedback: string;
};

type ChoiceGroup = {
  triggerAfterMessage: number;
  options: ChoiceOption[];
};

type ChatSimulatorProps = {
  title?: string;
  /** Header display name (defaults to "Unknown User"). */
  chatTitle?: string;
  scenario: string;
  messages: ChatMessage[];
  choices: ChoiceGroup[];
  /** Spoken, paced intro explaining the task before the chat starts. */
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number, total: number) => void;
};

type ShownMsg = {
  id: number;
  sender: Sender;
  text: string;
  tone?: "good" | "bad";
};

type Phase = "active" | "complete";

const STYLES = `
@keyframes csStrangerIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: none; } }
@keyframes csNarratorIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
@keyframes csTypingDot { 0%,60%,100% { opacity: 0.25; transform: translateY(0); } 30% { opacity: 1; transform: translateY(-3px); } }
@keyframes csChoiceIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes csShakeX { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
@keyframes csSummaryIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
`;

let stylesInjected = false;
function ensureStyles() {
  if (typeof document === "undefined" || stylesInjected) return;
  const el = document.createElement("style");
  el.id = "ax-chat-simulator-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

const TYPING_MS = 1000;
const DEFAULT_DELAY = 500;

function dangerStops(level: number): { label: string; color: string; bg: string } {
  if (level >= 0.66) return { label: "⚠️ HIGH", color: "#ef4444", bg: "rgba(239,68,68,0.14)" };
  if (level >= 0.33) return { label: "⚠️ RISING", color: "#f97316", bg: "rgba(249,115,22,0.12)" };
  return { label: "SAFE", color: "rgba(125,240,255,0.55)", bg: "rgba(148,163,184,0.08)" };
}

export default function ChatSimulator({
  title,
  chatTitle,
  scenario,
  messages,
  choices,
  introNarration,
  onComplete,
}: ChatSimulatorProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [shown, setShown] = useState<ShownMsg[]>([]);
  const [cursor, setCursor] = useState(0);
  const [typing, setTyping] = useState<null | { sender: Sender }>(null);
  const [waitingChoice, setWaitingChoice] = useState<ChoiceGroup | null>(null);
  const [answeredTriggers, setAnsweredTriggers] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<Phase>("active");
  const [shakeKey, setShakeKey] = useState(0);
  const [extraDanger, setExtraDanger] = useState(0);

  const idCounterRef = useRef(0);
  const nextMsgTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedOutRef = useRef<HTMLDivElement | null>(null);
  const completeFiredRef = useRef(false);
  const perfectFiredRef = useRef(false);

  const totalChoices = choices.length;

  useEffect(() => {
    ensureStyles();
  }, []);

  const pushShown = useCallback((msg: Omit<ShownMsg, "id">) => {
    idCounterRef.current += 1;
    const id = idCounterRef.current;
    setShown((prev) => [...prev, { ...msg, id }]);
  }, []);

  // Helper: find a choice group that should trigger AFTER message index `idx`
  const choiceForIndex = useCallback(
    (idx: number) => {
      const group = choices.find((c) => c.triggerAfterMessage === idx);
      if (!group) return null;
      if (answeredTriggers.has(idx)) return null;
      return group;
    },
    [choices, answeredTriggers],
  );

  // Clear any pending timers
  const clearTimers = useCallback(() => {
    if (nextMsgTimerRef.current) {
      clearTimeout(nextMsgTimerRef.current);
      nextMsgTimerRef.current = null;
    }
    if (revealTimerRef.current) {
      clearTimeout(revealTimerRef.current);
      revealTimerRef.current = null;
    }
  }, []);

  // Drive the message queue
  useEffect(() => {
    if (showIntro) return;
    if (phase !== "active") return;
    if (waitingChoice) return;
    if (typing) return;

    // If we've consumed all provided messages, conclude the conversation
    if (cursor >= messages.length) {
      // Add the closing narrator line once, then flip to complete
      const alreadyClosed = shown.some(
        (m) => m.sender === "narrator" && m.text === "Chat ended.",
      );
      if (!alreadyClosed) {
        nextMsgTimerRef.current = setTimeout(() => {
          pushShown({ sender: "narrator", text: "Chat ended." });
        }, 400);
        return;
      }
      // Flip to complete after a short beat
      nextMsgTimerRef.current = setTimeout(() => {
        setPhase("complete");
      }, 600);
      return;
    }

    const nextMsg = messages[cursor];
    const wait = nextMsg.delay ?? DEFAULT_DELAY;

    nextMsgTimerRef.current = setTimeout(() => {
      setTyping({ sender: nextMsg.sender });
      revealTimerRef.current = setTimeout(() => {
        setTyping(null);
        if (nextMsg.sender === "stranger") playSound("chatReceive");
        pushShown({ sender: nextMsg.sender, text: nextMsg.text });
        // After showing, check for a choice trigger on THIS index
        const group = choiceForIndex(cursor);
        if (group) {
          setWaitingChoice(group);
        }
        setCursor((c) => c + 1);
      }, nextMsg.sender === "stranger" ? TYPING_MS : 350);
    }, wait);

    return () => {
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, phase, waitingChoice, typing]);

  // Auto-scroll the feed to the bottom when new messages arrive
  useEffect(() => {
    const el = feedOutRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [shown, typing, waitingChoice]);

  // Handle a choice pick
  const handleChoice = useCallback(
    (opt: ChoiceOption) => {
      if (!waitingChoice) return;
      const triggerIdx = waitingChoice.triggerAfterMessage;

      // Show the child's own reply as a stranger-style outgoing bubble (player side).
      // We render it right-aligned below via a tone flag; reuse 'narrator' sender for simplicity would
      // be wrong - instead we insert it as a stranger-shaped bubble but mark it as "player". Keep it simple:
      // push a narrator bubble showing `You: …` styled subtly.
      pushShown({ sender: "narrator", text: `You: "${opt.text}"` });

      // Feedback narrator bubble
      pushShown({
        sender: "narrator",
        text: opt.feedback,
        tone: opt.isSafe ? "good" : "bad",
      });

      if (opt.isSafe) {
        playSound("correct");
        void correctAnswerBurst();
        setScore((s) => s + 1);
      } else {
        playSound("wrong");
        wrongAnswerShake();
        setShakeKey((k) => k + 1);
        setExtraDanger((d) => Math.min(0.5, d + 0.2));
      }

      setAnsweredTriggers((prev) => {
        const n = new Set(prev);
        n.add(triggerIdx);
        return n;
      });
      setWaitingChoice(null);
    },
    [waitingChoice, pushShown],
  );

  // Celebrate a perfect run the moment the chat wraps; onComplete itself
  // fires from the Summary's Continue button so the child reads their score.
  useEffect(() => {
    if (phase !== "complete") return;
    if (
      totalChoices > 0 &&
      score === totalChoices &&
      !perfectFiredRef.current
    ) {
      perfectFiredRef.current = true;
      playSound("confetti");
      void badgeEarnedCelebration();
    }
  }, [phase, score, totalChoices]);

  const handleContinue = useCallback(() => {
    if (completeFiredRef.current) return;
    completeFiredRef.current = true;
    onComplete(score, totalChoices);
  }, [onComplete, score, totalChoices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimers();
  }, [clearTimers]);

  // Danger computation: progress ratio + extra-danger accumulated from unsafe picks
  const dangerLevel = useMemo(() => {
    const progressRatio = messages.length === 0 ? 0 : cursor / messages.length;
    return Math.min(1, progressRatio * 0.7 + extraDanger);
  }, [cursor, messages.length, extraDanger]);
  const danger = dangerStops(dangerLevel);

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        background: "#0a0e1a",
        border: "2px solid",
        borderImage: "linear-gradient(180deg, #3b4a6a, #1a2030) 1",
        borderRadius: 36,
        overflow: "hidden",
        minHeight: 560,
        boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 8px #0a0e1a, inset 0 0 0 1px rgba(255,255,255,0.04)",
        color: "#f1f5f9",
        fontFamily: "'Nunito', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Phone status bar - iPhone-style with notch */}
      <div
        aria-hidden
        style={{
          position: "relative",
          height: 32,
          padding: "8px 18px 0",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          fontFamily: "'SF Pro Display', -apple-system, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: "#f8fafc",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        {/* Time (left) */}
        <span style={{ letterSpacing: "-0.02em" }}>9:41</span>

        {/* Notch (centre) */}
        <span
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 110,
            height: 22,
            background: "#000",
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}
        />

        {/* Status icons (right) */}
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          {/* Signal bars */}
          <span style={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
            {[3, 5, 7, 9].map((h) => (
              <span
                key={h}
                style={{
                  width: 2,
                  height: h,
                  borderRadius: 1,
                  background: "#f8fafc",
                }}
              />
            ))}
          </span>
          {/* Wi-Fi */}
          <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden>
            <path d="M7 9.5a1.1 1.1 0 1 0 0-2.2 1.1 1.1 0 0 0 0 2.2z" fill="#f8fafc" />
            <path d="M2.5 5.2a6.4 6.4 0 0 1 9 0" stroke="#f8fafc" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M0.6 3.2a9 9 0 0 1 12.8 0" stroke="#f8fafc" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>
          {/* Battery */}
          <span
            style={{
              width: 22,
              height: 10,
              borderRadius: 3,
              border: "1px solid rgba(248,250,252,0.5)",
              padding: 1,
              position: "relative",
            }}
          >
            <span style={{ position: "absolute", inset: 1, background: "#7eff97", borderRadius: 1, width: "78%" }} />
          </span>
        </span>
      </div>

      {/* Chat header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "rgba(0,229,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <span aria-hidden style={{ color: "rgba(125,240,255,0.55)", fontSize: 18, lineHeight: 1 }}>
          ‹
        </span>
        <div
          aria-hidden
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "rgba(148,163,184,0.2)",
            border: "1px solid rgba(148,163,184,0.35)",
            color: "rgba(125,240,255,0.55)",
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ?
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{chatTitle ?? "Unknown User"}</div>
          {title && (
            <div style={{ fontSize: 11, color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {title}
            </div>
          )}
        </div>
        <div
          aria-live="polite"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.08em",
            padding: "4px 10px",
            borderRadius: 999,
            color: danger.color,
            background: danger.bg,
            border: `1px solid ${danger.color}55`,
            transition: "color 0.6s, background 0.6s, border-color 0.6s",
            flexShrink: 0,
          }}
        >
          {danger.label}
        </div>
      </div>

      {/* Scenario banner */}
      {scenario && (
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: "rgba(245,158,11,0.05)",
            color: "#fcd34d",
            fontSize: 12,
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          {scenario}
        </div>
      )}

      {/* Chat body */}
      <div
        ref={feedOutRef}
        key={`feed-${shakeKey}`}
        style={{
          flex: 1,
          background: "#0a0e1a",
          padding: 12,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflowY: "auto",
          maxHeight: 320,
          animation: shakeKey > 0 ? "csShakeX 0.3s ease" : undefined,
          willChange: "transform",
        }}
      >
        {shown.length === 0 && !typing && (
          <div style={{ textAlign: "center", color: "#64748b", fontSize: 13, padding: 20 }}>
            Waiting for a message…
          </div>
        )}

        {shown.map((m) => (
          <MessageBubble key={m.id} msg={m} />
        ))}

        {typing && <TypingIndicator sender={typing.sender} />}
      </div>

      {/* Choice bar */}
      {waitingChoice && phase === "active" && (
        <div
          style={{
            background: "#0a0e1a",
            padding: "10px 12px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "#00e5ff",
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              letterSpacing: "0.1em",
              marginBottom: 2,
            }}
          >
            HOW DO YOU REPLY?
          </div>
          {waitingChoice.options.map((opt, i) => (
            <ChoiceCard
              key={i}
              option={opt}
              delay={i * 80}
              onPick={() => handleChoice(opt)}
            />
          ))}
        </div>
      )}

      {phase === "complete" && (
        <Summary score={score} total={totalChoices} onContinue={handleContinue} />
      )}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Uh-Oh Meter"
          subtitle="A chat is coming in. Watch the meter - and trust that funny feeling."
          icon="💬"
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────── sub-components ─────────────────── */
function MessageBubble({ msg }: { msg: ShownMsg }) {
  const isPlayer =
    msg.sender === "narrator" && msg.text.startsWith("You: ");
  if (msg.sender === "stranger") {
    return (
      <div
        style={{
          alignSelf: "flex-start",
          maxWidth: "80%",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: "16px 16px 16px 4px",
          padding: "10px 14px",
          fontSize: 14,
          lineHeight: 1.45,
          color: "#f1f5f9",
          animation: "csStrangerIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
          willChange: "opacity, transform",
        }}
      >
        {msg.text}
      </div>
    );
  }
  // Narrator / player reply
  if (isPlayer) {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          maxWidth: "80%",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          animation: "csNarratorIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #7c5cff, #7c5cff)",
            border: "1px solid rgba(0,229,255,0.45)",
            borderRadius: "16px 16px 4px 16px",
            padding: "10px 14px",
            fontSize: 14,
            lineHeight: 1.45,
            color: "#f8fafc",
            boxShadow: "0 4px 14px rgba(124,92,255,0.35)",
          }}
        >
          {msg.text.replace(/^You:\s*/, "")}
        </div>
        {/* Read receipts */}
        <span
          aria-hidden
          style={{
            alignSelf: "flex-end",
            fontSize: 10,
            color: "#00e5ff",
            letterSpacing: "-0.04em",
            marginRight: 4,
          }}
        >
          ✓✓
        </span>
      </div>
    );
  }

  const tone = msg.tone;
  const bg =
    tone === "good"
      ? "rgba(168,227,187,0.10)"
      : tone === "bad"
        ? "rgba(239,68,68,0.10)"
        : "rgba(0,229,255,0.06)";
  const border =
    tone === "good"
      ? "1px solid rgba(168,227,187,0.3)"
      : tone === "bad"
        ? "1px solid rgba(239,68,68,0.3)"
        : "1px solid rgba(0,229,255,0.12)";
  const color = tone === "good" ? "#a0ffb0" : tone === "bad" ? "#fca5a5" : "rgba(125,240,255,0.55)";

  return (
    <div
      style={{
        alignSelf: "center",
        textAlign: "center",
        width: "100%",
        background: bg,
        border,
        borderRadius: 12,
        padding: "8px 14px",
        fontSize: 13,
        color,
        fontStyle: "italic",
        lineHeight: 1.5,
        animation: "csNarratorIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      {msg.text}
    </div>
  );
}

function TypingIndicator({ sender }: { sender: Sender }) {
  const isStranger = sender === "stranger";
  const align: CSSProperties["alignSelf"] = isStranger ? "flex-start" : "center";
  const bg = isStranger ? "rgba(239,68,68,0.08)" : "rgba(0,229,255,0.06)";
  const border = isStranger ? "1px solid rgba(239,68,68,0.15)" : "1px solid rgba(0,229,255,0.12)";
  const radius = isStranger ? "16px 16px 16px 4px" : 12;
  const dotColor = isStranger ? "#fca5a5" : "#93c5fd";
  return (
    <div
      aria-hidden
      style={{
        alignSelf: align,
        background: bg,
        border,
        borderRadius: radius,
        padding: "8px 12px",
        display: "inline-flex",
        gap: 4,
        animation: "csStrangerIn 0.2s ease both",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: dotColor,
            animation: `csTypingDot 1.2s ease-in-out ${i * 0.15}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

function ChoiceCard({
  option,
  delay,
  onPick,
}: {
  option: ChoiceOption;
  delay: number;
  onPick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [picked, setPicked] = useState(false);

  const handle = () => {
    if (picked) return;
    setPicked(true);
    onPick();
  };

  // Subtle tint hints at the choice tone without giving the answer away.
  const hintTint = option.isSafe
    ? "linear-gradient(135deg, rgba(124,200,154,0.12), rgba(15,23,42,0.9))"
    : "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(15,23,42,0.9))";
  const border = picked
    ? option.isSafe
      ? "#7eff97"
      : "#ef4444"
    : hover
      ? "rgba(0,229,255,0.55)"
      : "rgba(255,255,255,0.1)";
  const shadow = picked
    ? option.isSafe
      ? "0 0 22px rgba(168,227,187,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
      : "0 0 22px rgba(239,68,68,0.55), inset 0 1px 0 rgba(255,255,255,0.15)"
    : hover
      ? "0 8px 22px rgba(0,0,0,0.4), 0 0 0 2px rgba(0,229,255,0.2)"
      : "0 3px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)";

  return (
    <button
      type="button"
      disabled={picked}
      onClick={handle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: "left",
        background: hintTint,
        border: `1.5px solid ${border}`,
        borderRadius: 999, // pill
        padding: "14px 22px",
        color: "#f1f5f9",
        fontFamily: "'Nunito', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        cursor: picked ? "default" : "pointer",
        transition: "border-color 0.25s, transform 0.2s, box-shadow 0.25s, filter 0.2s",
        boxShadow: shadow,
        transform: hover && !picked ? "translateY(-2px) scale(1.01)" : "none",
        filter: hover && !picked ? "brightness(1.08)" : "none",
        animation: `csChoiceIn 0.35s cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
      }}
    >
      {picked && option.isSafe && (
        <span style={{ color: "#7eff97", fontWeight: 800, marginRight: 6 }}>✅ </span>
      )}
      {option.text}
    </button>
  );
}

function Summary({
  score,
  total,
  onContinue,
}: {
  score: number;
  total: number;
  onContinue: () => void;
}) {
  const perfect = total > 0 && score === total;
  return (
    <div
      style={{
        padding: "18px 20px 22px",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        background:
          "linear-gradient(180deg, rgba(0,229,255,0.04), rgba(168,227,187,0.06))",
        textAlign: "center",
        animation: "csSummaryIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div
        style={{
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          letterSpacing: "-0.01em",
          color: "#f1f5f9",
          marginBottom: 6,
        }}
      >
        🛡️ Safety Score: {score}/{total}
      </div>
      <div style={{ fontSize: 13, color: "rgba(125,240,255,0.55)", marginBottom: 14, lineHeight: 1.5 }}>
        {perfect
          ? "You stayed safe! A real Cyber Hero!"
          : score > 0
            ? "Solid thinking. Review the tricky moments to spot them next time."
            : "Tricky one. Review the red flags - you'll catch them next time."}
      </div>
      <button
        type="button"
        onClick={onContinue}
        style={{
          padding: "10px 24px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #f97316, #f59e0b)",
          color: "#fff",
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(249,115,22,0.4)",
        }}
      >
        Continue →
      </button>
    </div>
  );
}

export type { ChatSimulatorProps, ChatMessage, ChoiceOption, ChoiceGroup };
