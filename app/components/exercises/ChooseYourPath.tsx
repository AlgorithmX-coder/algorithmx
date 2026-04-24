"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import {
  correctAnswerBurst,
  wrongAnswerShake,
} from "@/app/lib/celebrations";

export interface ChoiceOption {
  text: string;
  isSafe: boolean;
  consequence: string;
}

export interface Scenario {
  setup: string;
  image?: string;
  choices: ChoiceOption[];
}

export interface ChooseYourPathProps {
  scenarios?: Scenario[];
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    setup: "A stranger online asks: \"What's your name? I want to be your friend!\"",
    choices: [
      {
        text: "Tell them your full name",
        isSafe: false,
        consequence:
          "The stranger now knows your real name. They could find your social media or trick your friends.",
      },
      {
        text: "Don't tell them and tell an adult",
        isSafe: true,
        consequence:
          "Smart! You protected your identity. Real friends don't need to ask strangers for their name online.",
      },
    ],
  },
  {
    setup:
      "A website pop-up says: \"YOU WON A FREE PHONE! Click here to claim it!\"",
    choices: [
      {
        text: "Click the link to claim your prize",
        isSafe: false,
        consequence:
          "It was a scam! The link tried to steal your information.",
      },
      {
        text: "Close the pop-up and tell a parent",
        isSafe: true,
        consequence:
          "Great thinking! Pop-ups offering free prizes are almost always scams.",
      },
    ],
  },
  {
    setup:
      "Your friend says: \"Tell me your password, I'll help you with the game level!\"",
    choices: [
      {
        text: "Share your password — they're your friend",
        isSafe: false,
        consequence:
          "Even friends shouldn't know your password. They might accidentally share it or their account could get hacked.",
      },
      {
        text: "Say no — passwords are secret",
        isSafe: true,
        consequence:
          "Perfect! Your password is YOUR secret. Nobody else should know it except your parents.",
      },
    ],
  },
  {
    setup: "You find a USB stick on the playground. What do you do?",
    choices: [
      {
        text: "Plug it into your computer to see what's on it",
        isSafe: false,
        consequence:
          "The USB had a virus on it! Hackers sometimes leave USB sticks around hoping someone will plug them in.",
      },
      {
        text: "Give it to a teacher and don't plug it in",
        isSafe: true,
        consequence:
          "Smart move! Unknown USB sticks can contain viruses. Always give them to an adult.",
      },
    ],
  },
];

const STYLES = `
@keyframes cypBgDrift {
  from { background-position: 0 0; }
  to   { background-position: 60px 60px; }
}
@keyframes cypDoorSlideL {
  from { opacity: 0; transform: translateX(-60px) rotateY(25deg); }
  to   { opacity: 1; transform: translateX(0) rotateY(0); }
}
@keyframes cypDoorSlideR {
  from { opacity: 0; transform: translateX(60px) rotateY(-25deg); }
  to   { opacity: 1; transform: translateX(0) rotateY(0); }
}
@keyframes cypDoorOpen {
  from { transform: perspective(900px) rotateY(0); }
  to   { transform: perspective(900px) rotateY(-110deg); }
}
@keyframes cypRevealIn {
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes cypParticle {
  0%   { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--dx, 0), var(--dy, -120px)) scale(0.3); }
}
@keyframes cypRaccoonPop {
  0%   { opacity: 0; transform: translate(-50%, 30px) scale(0.5); }
  40%  { opacity: 1; transform: translate(-50%, 0) scale(1); }
  100% { opacity: 0; transform: translate(-50%, -8px) scale(0.9); }
}
@keyframes cypFade {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
@keyframes cypPulseGlow {
  0%,100% { box-shadow: 0 0 18px rgba(74,222,128,0.5); }
  50%     { box-shadow: 0 0 34px rgba(74,222,128,0.9); }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-choose-path-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

type Phase = "setup" | "choice" | "consequence" | "review";

interface Particle {
  id: number;
  dx: number;
  dy: number;
  colour: string;
  delay: number;
}

export default function ChooseYourPath({
  scenarios,
  onComplete,
  onCorrect,
  onWrong,
}: ChooseYourPathProps) {
  useEffect(ensureStyles, []);

  const list = useMemo(() => scenarios ?? DEFAULT_SCENARIOS, [scenarios]);

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [typed, setTyped] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [finished, setFinished] = useState(false);
  const particleIdRef = useRef(0);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scenario = list[idx] ?? null;

  // Type out setup text
  useEffect(() => {
    if (!scenario) return;
    setPhase("setup");
    setTyped(0);
    setPicked(null);
    setParticles([]);
    const chars = scenario.setup;
    if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    const t = setInterval(() => {
      setTyped((n) => {
        if (n >= chars.length) {
          if (typeTimerRef.current) clearInterval(typeTimerRef.current);
          window.setTimeout(() => setPhase("choice"), 350);
          return n;
        }
        return n + 2;
      });
    }, 32);
    typeTimerRef.current = t;
    return () => {
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
    };
  }, [idx, scenario]);

  const pickDoor = (choiceIdx: number) => {
    if (!scenario || phase !== "choice") return;
    setPicked(choiceIdx);
    setPhase("consequence");
    const choice = scenario.choices[choiceIdx];
    playSound("select");
    if (choice.isSafe) {
      playSound("correct");
      void correctAnswerBurst();
      setCorrectCount((n) => n + 1);
      onCorrect?.();
      // green particle burst
      const burst: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 100 + Math.random() * 80;
        burst.push({
          id: ++particleIdRef.current,
          dx: Math.cos(a) * r,
          dy: Math.sin(a) * r - 50,
          colour: ["#4ade80", "#86efac", "#22d3ee", "#fde68a"][i % 4],
          delay: Math.random() * 120,
        });
      }
      setParticles(burst);
    } else {
      playSound("wrong");
      wrongAnswerShake();
      onWrong?.();
    }
    // After 2.2s, move to review (show what the correct option was)
    window.setTimeout(() => setPhase("review"), 2200);
  };

  const next = () => {
    playSound("click");
    if (idx + 1 >= list.length) {
      setFinished(true);
      return;
    }
    setIdx((n) => n + 1);
  };

  if (!scenario) return null;

  const typedText = scenario.setup.slice(0, typed);
  const showDoors = phase !== "setup";
  const stars =
    correctCount === list.length
      ? 3
      : correctCount >= Math.ceil(list.length * 0.75)
        ? 2
        : 1;

  if (finished) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: 500,
          borderRadius: 24,
          overflow: "hidden",
          background:
            "radial-gradient(circle at 50% 40%, rgba(96,165,250,0.15), transparent 60%), linear-gradient(180deg, #0a0e2a 0%, #04050f 100%)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#e2e8f0",
          padding: 32,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          animation: "cypFade 0.4s ease-out both",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            background: "linear-gradient(135deg, #60a5fa, #a855f7, #fbbf24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          STORY COMPLETE!
        </div>
        <div style={{ fontSize: 18, marginTop: 8 }}>
          You made {correctCount} safe choice{correctCount === 1 ? "" : "s"} out
          of {list.length}
        </div>
        <div style={{ fontSize: 40, margin: "14px 0" }}>
          {"★".repeat(stars)}
          <span style={{ color: "rgba(148,163,184,0.4)" }}>
            {"★".repeat(3 - stars)}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            onComplete(correctCount);
          }}
          style={{
            background: "linear-gradient(135deg, #f97316, #f59e0b)",
            color: "#fff",
            fontWeight: 800,
            borderRadius: 14,
            padding: "14px 36px",
            fontSize: 17,
            border: "none",
            cursor: "pointer",
            boxShadow: "0 0 18px rgba(249,115,22,0.5)",
          }}
        >
          Continue &rarr;
        </button>
      </div>
    );
  }

  const picking = phase === "choice";
  const revealing = phase === "consequence" || phase === "review";
  const pickedChoice = picked !== null ? scenario.choices[picked] : null;
  const correctIdx = scenario.choices.findIndex((c) => c.isSafe);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        minHeight: 520,
        borderRadius: 24,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 30%, rgba(96,165,250,0.12), transparent 60%), linear-gradient(180deg, #0a0e2a 0%, #04050f 100%), repeating-linear-gradient(45deg, transparent 0 30px, rgba(96,165,250,0.02) 30px 32px)",
        backgroundSize: "cover, cover, 60px 60px",
        animation: "cypBgDrift 18s linear infinite",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#e2e8f0",
        padding: "28px 20px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontSize: 12,
          letterSpacing: 3,
          color: "#7dd3fc",
          fontWeight: 800,
          textTransform: "uppercase",
        }}
      >
        Scenario {idx + 1} / {list.length}
      </div>
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          margin: "12px auto 22px",
          maxWidth: 680,
          lineHeight: 1.35,
          minHeight: 80,
        }}
      >
        {typedText}
        {phase === "setup" && (
          <span
            style={{
              display: "inline-block",
              width: 10,
              height: 22,
              marginLeft: 4,
              background: "#93c5fd",
              verticalAlign: "middle",
              animation: "cypFade 0.6s ease-in-out infinite alternate",
            }}
          />
        )}
      </div>

      {scenario.image && (
        <img
          src={scenario.image}
          alt=""
          style={{
            width: 120,
            height: "auto",
            filter: "drop-shadow(0 10px 30px rgba(59,130,246,0.35))",
            marginBottom: 18,
          }}
        />
      )}

      {showDoors && (
        <div
          style={{
            display: "flex",
            gap: 36,
            justifyContent: "center",
            flexWrap: "wrap",
            perspective: 900,
          }}
        >
          {scenario.choices.map((c, i) => {
            const isPicked = picked === i;
            const tint = i === 0 ? "#3b82f6" : "#a855f7";
            const willOpen = revealing && isPicked;
            return (
              <div
                key={i}
                style={{
                  width: 250,
                  perspective: 900,
                  minHeight: 320,
                  position: "relative",
                }}
              >
                {/* Revealed content (behind the door) */}
                {willOpen && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 18,
                      borderRadius: 18,
                      background: c.isSafe
                        ? "radial-gradient(circle at 50% 40%, rgba(74,222,128,0.35), rgba(5,15,8,0.9))"
                        : "radial-gradient(circle at 50% 40%, rgba(239,68,68,0.3), rgba(20,6,6,0.9))",
                      border: `2px solid ${c.isSafe ? "#4ade80" : "#ef4444"}`,
                      animation: "cypRevealIn 0.6s ease-out 0.3s both",
                      boxShadow: c.isSafe
                        ? "0 0 24px rgba(74,222,128,0.5)"
                        : "0 0 24px rgba(239,68,68,0.5)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 48,
                        marginBottom: 6,
                      }}
                    >
                      {c.isSafe ? "✓" : "✗"}
                    </div>
                    <div
                      style={{
                        color: c.isSafe ? "#bbf7d0" : "#fecaca",
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: 1.4,
                      }}
                    >
                      {c.consequence}
                    </div>
                    {!c.isSafe && (
                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: 14,
                          fontSize: 42,
                          animation:
                            "cypRaccoonPop 1s ease-out forwards",
                        }}
                      >
                        🦝
                      </div>
                    )}
                  </div>
                )}

                {/* The door itself (closes to open during reveal) */}
                <button
                  type="button"
                  aria-label={`Choose: ${c.text}`}
                  onClick={() => picking && pickDoor(i)}
                  disabled={!picking}
                  onMouseEnter={() => picking && playSound("hover")}
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "left center",
                    animation: willOpen
                      ? "cypDoorOpen 0.7s cubic-bezier(0.3,1.5,0.4,1) forwards"
                      : i === 0
                        ? "cypDoorSlideL 0.45s ease-out both"
                        : "cypDoorSlideR 0.45s ease-out both",
                    animationDelay: picking ? `${i * 0.12}s` : "0s",
                    width: "100%",
                    borderRadius: 18,
                    padding: 18,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: `linear-gradient(180deg, rgba(12,18,34,0.95), rgba(5,8,18,0.98)), linear-gradient(135deg, ${tint}33, transparent)`,
                    border: `2px solid ${tint}`,
                    color: "#e2e8f0",
                    cursor: picking ? "pointer" : "default",
                    boxShadow: `0 12px 30px ${tint}33, inset 0 0 22px ${tint}22`,
                    transition:
                      "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    fontFamily: "inherit",
                  }}
                  onMouseOver={(e) => {
                    if (!picking) return;
                    const t = e.currentTarget;
                    t.style.transform =
                      i === 0
                        ? "perspective(900px) rotateY(5deg) translateY(-4px)"
                        : "perspective(900px) rotateY(-5deg) translateY(-4px)";
                    t.style.boxShadow = `0 20px 40px ${tint}55, inset 0 0 28px ${tint}44`;
                  }}
                  onMouseOut={(e) => {
                    const t = e.currentTarget;
                    t.style.transform = "";
                    t.style.boxShadow = `0 12px 30px ${tint}33, inset 0 0 22px ${tint}22`;
                  }}
                >
                  <div
                    style={{
                      fontSize: 56,
                      fontWeight: 900,
                      color: tint,
                      textShadow: `0 0 20px ${tint}`,
                      opacity: 0.75,
                      marginTop: 10,
                    }}
                  >
                    ?
                  </div>
                  {/* Crack of light */}
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: 30,
                      bottom: 30,
                      width: 6,
                      marginLeft: -3,
                      background: `linear-gradient(180deg, transparent, ${tint}88, transparent)`,
                      filter: "blur(3px)",
                      opacity: 0.5,
                    }}
                  />
                  <div style={{ lineHeight: 1.35, padding: "0 4px 6px" }}>
                    {c.text}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Particle burst on safe pick */}
      {pickedChoice?.isSafe && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "55%",
            pointerEvents: "none",
          }}
        >
          {particles.map((p) => (
            <span
              key={p.id}
              style={
                {
                  position: "absolute",
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: p.colour,
                  boxShadow: `0 0 8px ${p.colour}`,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  animation: `cypParticle 1.1s ease-out ${p.delay}ms forwards`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Review section (shows correct answer + continue) */}
      {phase === "review" && (
        <div
          style={{
            marginTop: 26,
            animation: "cypFade 0.4s ease-out both",
            maxWidth: 620,
          }}
        >
          {pickedChoice && !pickedChoice.isSafe && (
            <div
              style={{
                fontSize: 14,
                color: "#cbd5e1",
                marginBottom: 12,
                letterSpacing: 1,
              }}
            >
              WHAT SHOULD YOU HAVE DONE?
            </div>
          )}
          {pickedChoice && !pickedChoice.isSafe && correctIdx >= 0 && (
            <div
              style={{
                display: "inline-block",
                padding: "12px 18px",
                borderRadius: 14,
                background: "rgba(34,197,94,0.12)",
                border: "2px solid #4ade80",
                color: "#bbf7d0",
                fontSize: 15,
                fontWeight: 700,
                animation: "cypPulseGlow 1.8s ease-in-out infinite",
                marginBottom: 16,
              }}
            >
              ✓ {scenario.choices[correctIdx].text}
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            <button
              type="button"
              onClick={next}
              style={{
                background: "linear-gradient(135deg, #f97316, #f59e0b)",
                color: "#fff",
                fontWeight: 800,
                borderRadius: 14,
                padding: "14px 36px",
                fontSize: 17,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 18px rgba(249,115,22,0.5)",
              }}
            >
              Continue &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
