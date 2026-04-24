"use client";

import { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  badgeEarnedCelebration,
} from "@/app/lib/celebrations";
import { playSound } from "@/app/lib/sounds";

type Email = {
  from: string;
  fromEmail: string;
  subject: string;
  preview: string;
  body: string;
  isPhishing: boolean;
  clues: string[];
};

type InboxSimulatorProps = {
  title?: string;
  emails: Email[];
  onComplete: (score: number, total: number) => void;
};

type AnswerState = "correct" | "wrong" | undefined;

const STYLES = `
@keyframes isSlideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: none; } }
@keyframes isClueIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
@keyframes isShakeX { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes isEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes isPulseGood { 0%,100% { box-shadow: 0 0 0 rgba(52,211,153,0); } 50% { box-shadow: 0 0 18px rgba(52,211,153,0.4); } }
@keyframes isHighlightBg { 0% { background: rgba(245,158,11,0); } 30% { background: rgba(245,158,11,0.5); } 100% { background: rgba(245,158,11,0.25); } }
`;

let stylesInjected = false;
function ensureStyles() {
  if (typeof document === "undefined" || stylesInjected) return;
  const el = document.createElement("style");
  el.id = "ax-inbox-simulator-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

// Deterministic faux-timestamps so the inbox feels alive without hydration mismatch
function fauxTimestamp(index: number): string {
  const slots = ["2 min ago", "14 min ago", "1 hr ago", "3 hrs ago", "Yesterday", "2 days ago", "Mon", "Sun"];
  return slots[index % slots.length];
}

// Pick a per-sender avatar colour. Phishing senders get a warmer/darker red tone.
function avatarColor(email: Email, index: number): string {
  if (email.isPhishing) return "#7f1d1d"; // deep red
  const palette = ["#60a5fa", "#34d399", "#f59e0b", "#a78bfa", "#06b6d4", "#14b8a6"];
  return palette[index % palette.length];
}

function ShieldIcon({ size = 28, color = "#34d399" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function WarningIcon({ size = 14, color = "#ef4444" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function CheckCircle({ size = 16, color = "#34d399" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function XCircle({ size = 16, color = "#ef4444" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

/**
 * Renders the email body with any text fragments that match a clue wrapped in
 * a highlighted <mark>. Case-insensitive substring matching.
 */
function renderHighlightedBody(body: string, highlightTerms: string[]): React.ReactNode {
  if (highlightTerms.length === 0) return body;
  // Build regex of terms escaped for regex
  const escaped = highlightTerms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .filter(Boolean);
  if (escaped.length === 0) return body;
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = body.split(pattern);
  return parts.map((part, i) => {
    if (!part) return null;
    const isMatch = escaped.some((term) =>
      new RegExp(`^${term}$`, "i").test(part),
    );
    if (!isMatch) return <span key={i}>{part}</span>;
    return (
      <mark
        key={i}
        style={{
          background: "rgba(245,158,11,0.35)",
          color: "#f1f5f9",
          padding: "0 3px",
          borderRadius: 3,
          animation: "isHighlightBg 0.6s ease-out both",
        }}
      >
        {part}
      </mark>
    );
  });
}

export default function InboxSimulator({
  title,
  emails,
  onComplete,
}: InboxSimulatorProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(() =>
    emails.map(() => undefined),
  );
  const [feedbackKey, setFeedbackKey] = useState(0);
  const [feedbackKind, setFeedbackKind] = useState<"correct" | "wrong" | null>(null);
  const [phase, setPhase] = useState<"active" | "complete">("active");
  const [highlightClues, setHighlightClues] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeFiredRef = useRef(false);
  const celebrationFiredRef = useRef(false);

  useEffect(() => {
    ensureStyles();
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const score = useMemo(
    () => answers.filter((a) => a === "correct").length,
    [answers],
  );
  const answeredCount = useMemo(
    () => answers.filter((a) => a !== undefined).length,
    [answers],
  );
  const allDone = answeredCount === emails.length && emails.length > 0;

  useEffect(() => {
    if (!allDone || completeFiredRef.current) return;
    completeFiredRef.current = true;
    playSound("confetti");
    if (score === emails.length && !celebrationFiredRef.current) {
      celebrationFiredRef.current = true;
      void badgeEarnedCelebration();
    }
    onComplete(score, emails.length);
    setPhase("complete");
  }, [allDone, score, emails.length, onComplete]);

  const currentEmail = emails[selectedIdx];
  const currentAnswer = answers[selectedIdx];
  const locked = currentAnswer !== undefined;

  const recordAnswer = useCallback(
    (choseSafe: boolean) => {
      if (!currentEmail || locked) return;
      const isCorrect = choseSafe ? !currentEmail.isPhishing : currentEmail.isPhishing;

      setAnswers((prev) => {
        const next = [...prev];
        next[selectedIdx] = isCorrect ? "correct" : "wrong";
        return next;
      });
      setFeedbackKind(isCorrect ? "correct" : "wrong");
      setFeedbackKey((k) => k + 1);
      setHighlightClues(!isCorrect);

      if (isCorrect) {
        playSound("correct");
        void correctAnswerBurst();
      } else {
        playSound("wrong");
        wrongAnswerShake();
      }

      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = setTimeout(() => {
        // Advance to the next unanswered email if there is one
        const nextUnansweredIdx = findNextUnanswered(selectedIdx, [
          ...answers.slice(0, selectedIdx),
          isCorrect ? "correct" : "wrong",
          ...answers.slice(selectedIdx + 1),
        ]);
        if (nextUnansweredIdx !== -1) {
          setSelectedIdx(nextUnansweredIdx);
          setFeedbackKind(null);
          setHighlightClues(false);
        } else {
          // All answered — phase flip handled by the allDone effect above
          setFeedbackKind(null);
          setHighlightClues(false);
        }
      }, 2500);
    },
    [currentEmail, locked, selectedIdx, answers],
  );

  const progressPct = emails.length === 0 ? 0 : (answeredCount / emails.length) * 100;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        background: "#0d1220",
        border: "1px solid rgba(96,165,250,0.14)",
        borderRadius: 20,
        overflow: "hidden",
        color: "#f1f5f9",
        fontFamily: "'Nunito', sans-serif",
        boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
        position: "relative",
      }}
    >
      {/* Progress bar (top) */}
      <div style={{ height: 3, background: "rgba(255,255,255,0.05)" }}>
        <div
          style={{
            height: "100%",
            width: `${progressPct}%`,
            background: "linear-gradient(90deg, #60a5fa, #34d399)",
            transition: "width 0.6s cubic-bezier(0.16,1,0.3,1)",
            boxShadow: "0 0 10px rgba(52,211,153,0.5)",
          }}
        />
      </div>

      {/* Optional title strip */}
      {title && (
        <div
          style={{
            padding: "12px 20px",
            textAlign: "center",
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#f1f5f9",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {title}
        </div>
      )}

      {/* App chrome */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: "rgba(96,165,250,0.06)",
          borderBottom: "1px solid rgba(96,165,250,0.1)",
        }}
      >
        <div
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            color: "#60a5fa",
          }}
        >
          📧 CyberMail
        </div>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: 999,
            background: "rgba(96,165,250,0.12)",
            border: "1px solid rgba(96,165,250,0.2)",
            color: "#60a5fa",
            letterSpacing: "0.06em",
          }}
        >
          Inbox ({emails.length})
        </span>
      </div>

      {phase === "complete" ? (
        <CompletionPanel
          score={score}
          total={emails.length}
          onContinue={() => {
            /* parent drives continuation via onComplete already */
          }}
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 3fr)",
            minHeight: 480,
          }}
        >
          {/* ── Email list (left) ── */}
          <div
            style={{
              borderRight: "1px solid rgba(255,255,255,0.05)",
              overflowY: "auto",
              maxHeight: 620,
            }}
          >
            {emails.map((email, i) => {
              const a = answers[i];
              const unread = a === undefined;
              const isSelected = i === selectedIdx;
              return (
                <EmailListRow
                  key={i}
                  email={email}
                  index={i}
                  answer={a}
                  selected={isSelected}
                  unread={unread}
                  onClick={() => {
                    if (i !== selectedIdx) playSound("emailOpen");
                    if (unread || isSelected) {
                      setSelectedIdx(i);
                      setFeedbackKind(null);
                      setHighlightClues(false);
                    } else {
                      setSelectedIdx(i);
                    }
                  }}
                />
              );
            })}
          </div>

          {/* ── Email detail (right) ── */}
          <div style={{ position: "relative", padding: "20px 24px" }}>
            {currentEmail ? (
              <EmailDetail
                email={currentEmail}
                emailIndex={selectedIdx}
                locked={locked}
                highlightClues={highlightClues && currentAnswer === "wrong"}
                onSafe={() => recordAnswer(true)}
                onPhishing={() => recordAnswer(false)}
              />
            ) : (
              <div style={{ textAlign: "center", color: "#64748b", padding: 40 }}>
                Select an email to review.
              </div>
            )}

            {/* Feedback overlay */}
            {feedbackKind && currentEmail && (
              <FeedbackOverlay
                key={`fb-${feedbackKey}`}
                kind={feedbackKind}
                isPhishing={currentEmail.isPhishing}
                clues={currentEmail.clues}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── helpers & sub-components ─────────────────── */
function findNextUnanswered(fromIdx: number, state: AnswerState[]): number {
  const n = state.length;
  for (let i = 1; i <= n; i++) {
    const probe = (fromIdx + i) % n;
    if (state[probe] === undefined) return probe;
  }
  return -1;
}

function EmailListRow({
  email,
  index,
  answer,
  selected,
  unread,
  onClick,
}: {
  email: Email;
  index: number;
  answer: AnswerState;
  selected: boolean;
  unread: boolean;
  onClick: () => void;
}) {
  const color = avatarColor(email, index);
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        background: selected ? "rgba(96,165,250,0.08)" : "transparent",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        borderLeft: `3px solid ${unread ? "#60a5fa" : "transparent"}`,
        padding: "14px 16px",
        textAlign: "left",
        cursor: "pointer",
        color: "#f1f5f9",
        fontFamily: "'Nunito', sans-serif",
        transition: "background 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 2 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: color,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#fff",
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 14,
          }}
          aria-hidden
        >
          {email.from.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: unread ? 800 : 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {email.from}
            </span>
            <span style={{ fontSize: 12, color: "#64748b", flexShrink: 0 }}>
              {fauxTimestamp(index)}
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: unread ? "#e2e8f0" : "#94a3b8",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
          >
            {email.subject}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginTop: 2,
            }}
          >
            {email.preview}
          </div>
        </div>
        {answer === "correct" && <CheckCircle size={16} color="#34d399" />}
        {answer === "wrong" && <XCircle size={16} color="#ef4444" />}
      </div>
    </button>
  );
}

function EmailDetail({
  email,
  emailIndex,
  locked,
  highlightClues,
  onSafe,
  onPhishing,
}: {
  email: Email;
  emailIndex: number;
  locked: boolean;
  highlightClues: boolean;
  onSafe: () => void;
  onPhishing: () => void;
}) {
  // Convert body to React nodes; if highlightClues is on, highlight any clue text matches.
  // Paragraph-split on blank lines.
  const paragraphs = useMemo(() => email.body.split(/\n\n+/), [email.body]);

  return (
    <div key={`detail-${emailIndex}`} style={{ animation: "isEnter 0.3s cubic-bezier(0.16,1,0.3,1) both" }}>
      <div style={{ marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <h2
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 18,
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {email.subject}
        </h2>
        <div style={{ fontSize: 14, color: "#cbd5e1", marginTop: 6, fontWeight: 600 }}>
          {email.from}{" "}
          <span style={{ color: "#64748b", fontWeight: 400 }}>
            &lt;{email.fromEmail}&gt;
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
          {fauxTimestamp(emailIndex)}
        </div>
      </div>

      <div
        style={{
          fontSize: 15,
          lineHeight: 1.7,
          color: "#94a3b8",
          whiteSpace: "pre-line",
        }}
      >
        {paragraphs.map((para, i) => (
          <p key={i} style={{ margin: i === 0 ? "0 0 12px" : "0 0 12px" }}>
            {highlightClues ? renderHighlightedBody(para, email.clues) : para}
          </p>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10, marginTop: 20 }}>
        <ActionButton
          label="✅ Safe Email"
          tone="good"
          disabled={locked}
          onClick={onSafe}
        />
        <ActionButton
          label="🚨 Phishing Alert!"
          tone="bad"
          disabled={locked}
          onClick={onPhishing}
        />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  tone,
  disabled,
  onClick,
}: {
  label: string;
  tone: "good" | "bad";
  disabled: boolean;
  onClick: () => void;
}) {
  const accent = tone === "good" ? "#34d399" : "#ef4444";
  const bg = tone === "good" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)";
  const glow = tone === "good" ? "rgba(52,211,153,0.35)" : "rgba(239,68,68,0.35)";
  const [hover, setHover] = useState(false);
  const style: CSSProperties = {
    height: 50,
    width: "100%",
    borderRadius: 14,
    border: `1px solid ${hover && !disabled ? accent : `${accent}55`}`,
    background: bg,
    color: "#f1f5f9",
    fontFamily: "'Fredoka', 'Nunito', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    cursor: disabled ? "default" : "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
    boxShadow: hover && !disabled ? `0 0 18px ${glow}` : "none",
    transform: hover && !disabled ? "translateY(-1px)" : "none",
    opacity: disabled ? 0.55 : 1,
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
    >
      {label}
    </button>
  );
}

function FeedbackOverlay({
  kind,
  isPhishing,
  clues,
}: {
  kind: "correct" | "wrong";
  isPhishing: boolean;
  clues: string[];
}) {
  const isGood = kind === "correct";
  const accent = isGood ? "#34d399" : "#ef4444";
  const bg = isGood ? "rgba(52,211,153,0.14)" : "rgba(239,68,68,0.14)";
  const title = isGood ? "✅ CORRECT!" : "❌ Look closer!";

  // Helper line explaining the scenario
  const explainer = isGood
    ? isPhishing
      ? "Red flags spotted:"
      : "This one really is safe. Nice work."
    : isPhishing
      ? "That was phishing. Red flags you missed:"
      : "Actually, this one was safe — no real threat.";

  return (
    <div
      aria-live="polite"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        padding: "18px 24px",
        background: bg,
        borderBottom: `2px solid ${accent}`,
        backdropFilter: "blur(6px)",
        animation: "isSlideDown 0.4s cubic-bezier(0.16,1,0.3,1) both",
        color: "#f1f5f9",
      }}
    >
      <div
        style={{
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 18,
          color: accent,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 14, color: "#cbd5e1", marginBottom: clues.length ? 10 : 0 }}>
        {explainer}
      </div>
      {clues.length > 0 && (isGood ? isPhishing : isPhishing) && (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
          {clues.map((clue, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "#f1f5f9",
                animation: `isClueIn 0.3s cubic-bezier(0.16,1,0.3,1) ${i * 0.2}s both`,
              }}
            >
              <WarningIcon size={14} color="#f59e0b" />
              <span>{clue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CompletionPanel({
  score,
  total,
  onContinue,
}: {
  score: number;
  total: number;
  onContinue: () => void;
}) {
  const perfect = score === total && total > 0;
  return (
    <div
      style={{
        padding: "40px 28px",
        textAlign: "center",
        animation: "isEnter 0.5s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          margin: "0 auto 16px",
          borderRadius: "50%",
          background: "rgba(52,211,153,0.1)",
          border: "1px solid rgba(52,211,153,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: perfect ? "isPulseGood 1.6s ease-in-out infinite" : undefined,
        }}
      >
        <ShieldIcon size={44} color="#34d399" />
      </div>
      <h3
        style={{
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 26,
          margin: "0 0 6px",
          background: perfect
            ? "linear-gradient(135deg, #f59e0b, #34d399)"
            : "linear-gradient(135deg, #60a5fa, #34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {perfect ? "🏆 PERFECT! No phishing got past you!" : "Mission Complete!"}
      </h3>
      <p style={{ color: "#94a3b8", fontSize: 15, margin: "0 0 22px" }}>
        You identified <strong style={{ color: "#f1f5f9" }}>{score}/{total}</strong> threats.
      </p>
      <button
        type="button"
        onClick={onContinue}
        style={{
          padding: "14px 32px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #f97316, #f59e0b)",
          color: "#fff",
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(249,115,22,0.4)",
          letterSpacing: "0.01em",
        }}
      >
        Continue →
      </button>
    </div>
  );
}

export type { InboxSimulatorProps, Email };
