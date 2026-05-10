"use client";

import { type CSSProperties, useEffect, useState } from "react";
import { playSound } from "@/app/lib/sounds";

/**
 * OnboardingOverlay - 4-step "how to play" carousel that fires on a
 * brand-new save slot, immediately after the boot intro finishes.
 * Real game tutorials orient the kid before dropping them in case 0;
 * without this, they hit the lesson cold with no expectations.
 *
 * Renders a centered card with: kicker (STEP 1 / 4), animated icon,
 * heading, body line, and Next / Skip controls. Locks pointer events
 * on the page behind the dim layer.
 *
 * Each step is keyboard-navigable: Right Arrow / Space = next,
 * Esc = skip.
 */

interface Step {
  /** Big emoji icon. */
  icon: string;
  /** Bold heading. */
  title: string;
  /** Plain-language body, kid-readable. */
  body: string;
  /** Hex accent driving the card border + icon glow. */
  accent: string;
}

const STEPS: Step[] = [
  {
    icon: "🦝",
    title: "Welcome to the Academy",
    body: "A bad guy called the Hacker Raccoon is causing trouble online. You're going to train to stop him - by learning the same tricks real cyber heroes use.",
    accent: "#7c5cff",
  },
  {
    icon: "🧠",
    title: "Each Case is a New Skill",
    body: "You'll play 17 short cases. Each one teaches one big idea - strong passwords, spotting fake emails, locking your accounts. Quick, fun, and you keep going at your pace.",
    accent: "#00e5ff",
  },
  {
    icon: "⭐",
    title: "Earn Stars and XP",
    body: "Right answers fill your XP bar and unlock badges. Get a streak going for bigger rewards. The world reacts when you do something amazing.",
    accent: "#ffd158",
  },
  {
    icon: "⌨️",
    title: "Quick Controls",
    body: "Tap or click to play. Press ESC to pause. Press F to go fullscreen. The pause menu has volume sliders and other settings - you can change them any time.",
    accent: "#ff5fb3",
  },
];

const ONBOARDED_KEY = "algorithmx-onboarded-v1";

export function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(ONBOARDED_KEY) !== "true";
  } catch {
    return false;
  }
}

function markOnboarded(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ONBOARDED_KEY, "true");
  } catch {
    /* ignore */
  }
}

export interface OnboardingOverlayProps {
  /** Player display name to personalise the kicker. */
  heroName: string;
  /** Called when the player either finishes or skips. */
  onComplete: () => void;
}

export default function OnboardingOverlay({
  heroName,
  onComplete,
}: OnboardingOverlayProps) {
  const [idx, setIdx] = useState(0);

  const finish = () => {
    markOnboarded();
    playSound("levelUp");
    onComplete();
  };

  const next = () => {
    if (idx < STEPS.length - 1) {
      setIdx((i) => i + 1);
      playSound("select");
    } else {
      finish();
    }
  };

  const skip = () => {
    markOnboarded();
    playSound("back");
    onComplete();
  };

  /* Keyboard navigation. Capture phase + stopImmediatePropagation so
   * the pause-menu ESC handler (also bound to window) doesn't fire
   * underneath us when the kid hits Escape inside the onboarding. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        e.stopImmediatePropagation();
        next();
      } else if (e.key === "ArrowLeft") {
        if (idx > 0) {
          e.preventDefault();
          e.stopImmediatePropagation();
          setIdx((i) => i - 1);
          playSound("back");
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        skip();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [idx]);

  /* Keyframes once. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-onboard-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-onboard-bg-in { 0%{opacity:0;} 100%{opacity:1;} }
@keyframes ax-onboard-card-in { 0%{opacity:0;transform:translateY(16px) scale(0.96);filter:blur(6px);} 100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0);} }
@keyframes ax-onboard-icon-pop { 0%{opacity:0;transform:scale(0.6) rotate(-10deg);} 60%{opacity:1;transform:scale(1.08) rotate(2deg);} 100%{opacity:1;transform:scale(1) rotate(0);} }
@keyframes ax-onboard-icon-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-6px);} }
`;
    document.head.appendChild(el);
  }, []);

  const step = STEPS[idx];

  return (
    <div style={hostStyle} role="dialog" aria-modal="true">
      <div style={dimStyle} aria-hidden />
      <div
        style={{
          ...cardStyle,
          borderColor: `${step.accent}55`,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${step.accent}33 inset`,
        }}
        key={idx}
      >
        <div style={kickerRowStyle}>
          <span style={{ ...kickerStyle, color: step.accent }}>
            STEP {idx + 1} OF {STEPS.length}
          </span>
          <button
            onClick={skip}
            style={skipButtonStyle}
            onMouseDown={() => playSound("hover")}
          >
            SKIP →
          </button>
        </div>

        <div
          style={{
            ...iconStyle,
            color: step.accent,
            textShadow: `0 0 32px ${step.accent}99`,
            animation:
              "ax-onboard-icon-pop 480ms cubic-bezier(0.16,1,0.3,1) both, ax-onboard-icon-float 3.6s 700ms ease-in-out infinite",
          }}
          aria-hidden
        >
          {step.icon}
        </div>

        <h2 style={titleStyle}>
          {idx === 0 ? `Hello, ${heroName} -` : ""}{" "}
          <span style={{ color: step.accent }}>{step.title}</span>
        </h2>

        <p style={bodyStyle}>{step.body}</p>

        <div style={dotsRowStyle} aria-hidden>
          {STEPS.map((_, i) => (
            <span
              key={i}
              style={{
                ...dotStyle,
                background: i === idx ? step.accent : "rgba(255,255,255,0.16)",
                width: i === idx ? 22 : 6,
              }}
            />
          ))}
        </div>

        <div style={buttonRowStyle}>
          {idx > 0 && (
            <button
              onClick={() => {
                setIdx((i) => i - 1);
                playSound("back");
              }}
              style={secondaryButtonStyle}
              onMouseDown={() => playSound("hover")}
            >
              ← Back
            </button>
          )}
          <button
            onClick={next}
            style={{
              ...primaryButtonStyle,
              background: `linear-gradient(135deg, ${step.accent}, #7c5cff)`,
            }}
            onMouseDown={() => playSound("click")}
          >
            {idx === STEPS.length - 1 ? "BEGIN MISSION →" : "NEXT →"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */

const hostStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 10600,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "system-ui, -apple-system, sans-serif",
  animation: "ax-onboard-bg-in 320ms ease-out both",
};

const dimStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(ellipse at center, rgba(15,21,48,0.78) 0%, rgba(4,5,13,0.96) 70%)",
  backdropFilter: "blur(10px)",
};

const cardStyle: CSSProperties = {
  position: "relative",
  width: "min(520px, 92vw)",
  background:
    "linear-gradient(180deg, rgba(15,21,48,0.95) 0%, rgba(10,8,32,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 22,
  padding: 28,
  display: "flex",
  flexDirection: "column",
  gap: 14,
  textAlign: "center",
  color: "#e8edff",
  animation:
    "ax-onboard-card-in 480ms cubic-bezier(0.16,1,0.3,1) both",
};

const kickerRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const kickerStyle: CSSProperties = {
  fontSize: 11,
  letterSpacing: 4,
  fontWeight: 800,
  textTransform: "uppercase",
};

const skipButtonStyle: CSSProperties = {
  background: "transparent",
  color: "rgba(232,237,255,0.55)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 999,
  padding: "4px 10px",
  fontSize: 10,
  letterSpacing: 2,
  cursor: "pointer",
  fontWeight: 700,
  textTransform: "uppercase",
};

const iconStyle: CSSProperties = {
  fontSize: 64,
  lineHeight: 1,
  marginTop: 8,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 900,
  letterSpacing: 1,
  lineHeight: 1.2,
};

const bodyStyle: CSSProperties = {
  margin: 0,
  fontSize: 14,
  lineHeight: 1.55,
  color: "rgba(232,237,255,0.85)",
};

const dotsRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  marginTop: 4,
};

const dotStyle: CSSProperties = {
  height: 6,
  borderRadius: 999,
  transition: "all 280ms cubic-bezier(0.16,1,0.3,1)",
};

const buttonRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  marginTop: 8,
};

const primaryButtonStyle: CSSProperties = {
  flex: 1,
  border: "none",
  borderRadius: 999,
  padding: "12px 18px",
  fontSize: 13,
  fontWeight: 800,
  letterSpacing: 2,
  color: "#04050d",
  cursor: "pointer",
  textTransform: "uppercase",
  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
};

const secondaryButtonStyle: CSSProperties = {
  background: "transparent",
  color: "#e8edff",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 999,
  padding: "12px 16px",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 2,
  cursor: "pointer",
  textTransform: "uppercase",
};
