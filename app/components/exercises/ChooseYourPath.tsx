"use client";

/*
 * ChooseYourPath - Pixar 2.5D commercial polish.
 *
 * Game logic preserved (typed scenario text, two doors, pick to open,
 * see consequence, review correct answer, advance). Visuals fully
 * rebuilt: warm dusk backdrop, wooden adventure doors with brass
 * handles, parchment review panels, raccoon "gotcha" pop on unsafe
 * picks, design-token typography and motion.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
// KEPT + FLAGGED: correctAnswerBurst (richer burst than fx.correct;
// replacing would shrink the celebration and add an unwanted toast)
// and wrongAnswerShake (no toolkit equivalent for body-level shake).
import {
  correctAnswerBurst,
  wrongAnswerShake,
} from "@/app/lib/celebrations";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat from "@/app/components/lesson/ExerciseBeats";
import PixIcon from "@/app/components/lesson/PixIcon";
import { COLOR, SHADOW, SPRING } from "@/app/components/scene/tokens";

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
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const DEFAULT_SCENARIOS: Scenario[] = [
  {
    setup: "A stranger online asks: \"What's your name? I want to be your friend!\"",
    choices: [
      { text: "Tell them your full name", isSafe: false, consequence: "The stranger now knows your real name. They could find your social media or trick your friends." },
      { text: "Don't tell them and tell an adult", isSafe: true, consequence: "Smart! You protected your identity. Real friends don't need to ask strangers for their name online." },
    ],
  },
  {
    setup: "A website pop-up says: \"YOU WON A FREE PHONE! Click here to claim it!\"",
    choices: [
      { text: "Click the link to claim your prize", isSafe: false, consequence: "It was a scam! The link tried to steal your information." },
      { text: "Close the pop-up and tell a parent", isSafe: true, consequence: "Great thinking! Pop-ups offering free prizes are almost always scams." },
    ],
  },
  {
    setup: "Your friend says: \"Tell me your password, I'll help you with the game level!\"",
    choices: [
      { text: "Share your password - they're your friend", isSafe: false, consequence: "Even friends shouldn't know your password. They might accidentally share it or their account could get hacked." },
      { text: "Say no - passwords are secret", isSafe: true, consequence: "Perfect! Your password is YOUR secret. Nobody else should know it except your parents." },
    ],
  },
  {
    setup: "You find a USB stick on the playground. What do you do?",
    choices: [
      { text: "Plug it into your computer to see what's on it", isSafe: false, consequence: "The USB had a virus on it! Hackers sometimes leave USB sticks around hoping someone will plug them in." },
      { text: "Give it to a teacher and don't plug it in", isSafe: true, consequence: "Smart move! Unknown USB sticks can contain viruses. Always give them to an adult." },
    ],
  },
];

const STYLES = `
@keyframes cypDoorSlideL {
  from { opacity: 0; transform: translateX(-60px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes cypDoorSlideR {
  from { opacity: 0; transform: translateX(60px); }
  to   { opacity: 1; transform: translateX(0); }
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
  0%,100% { box-shadow: 0 0 18px rgba(74,154,106,0.55); }
  50%     { box-shadow: 0 0 34px rgba(74,154,106,0.85); }
}
@keyframes cypCursorBlink {
  0%,100% { opacity: 1; }
  50% { opacity: 0; }
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

// Both portals are visually IDENTICAL pre-decision - fixes a giveaway
// the user spotted where the darker door always happened to be the
// safe one (data ordering bug + shade difference between doors). Now
// they're the same cyan/cosmic cyber portal; shading is symmetric.
const DOOR_PALETTE_CYBER = {
  body: "linear-gradient(180deg, #1a2147 0%, #252d5e 50%, #0f1530 100%)",
  rim: "rgba(0, 229, 255, 0.55)",
  panel: "linear-gradient(180deg, #252d5e, #0f1530)",
  handle: "#00e5ff",
};
const DOOR_PALETTE = [DOOR_PALETTE_CYBER, DOOR_PALETTE_CYBER];

export default function ChooseYourPath({
  scenarios,
  introNarration,
  onComplete,
  onCorrect,
  onWrong,
}: ChooseYourPathProps) {
  useEffect(ensureStyles, []);

  // Toolkit hooks. `intensity` gates big-FX calls so strict
  // reduced-motion users skip the burst/shake; comfort and default
  // users still get them (intensity 0.45 or 1 both satisfy > 0).
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();

  const list = useMemo(() => scenarios ?? DEFAULT_SCENARIOS, [scenarios]);

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("setup");
  const [typed, setTyped] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [finished, setFinished] = useState(false);

  const resetExercise = () => {
    setIdx(0);
    setPhase("setup");
    setTyped(0);
    setPicked(null);
    setCorrectCount(0);
    setParticles([]);
    setFinished(false);
    setShowIntro(true);
  };
  const particleIdRef = useRef(0);
  const typeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rawScenario = list[idx] ?? null;
  // Stable per-scenario shuffle of the choice order. Was a giveaway
  // because every authored scenario had isSafe at index 1, so the
  // "right" door was always the answer. useMemo keyed on idx keeps
  // the shuffle stable inside a single scenario but re-rolls between.
  const scenario = useMemo(() => {
    if (!rawScenario) return null;
    const out = rawScenario.choices.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return { ...rawScenario, choices: out };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, list]);

  // Type out setup text
  useEffect(() => {
    if (showIntro) return;
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
  }, [idx, scenario, showIntro]);

  const pickDoor = (choiceIdx: number) => {
    if (!scenario) return;
    if (phase !== "setup" && phase !== "choice") return;
    if (phase === "setup") {
      if (typeTimerRef.current) clearInterval(typeTimerRef.current);
      setTyped(scenario.setup.length);
    }
    setPicked(choiceIdx);
    setPhase("consequence");
    const choice = scenario.choices[choiceIdx];
    audio.select();
    if (choice.isSafe) {
      audio.correct();
      // Kept helper - intensity-gated so strict reduced-motion skips it.
      if (intensity > 0) void correctAnswerBurst();
      setCorrectCount((n) => n + 1);
      onCorrect?.();
      const burst: Particle[] = [];
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 100 + Math.random() * 80;
        burst.push({
          id: ++particleIdRef.current,
          dx: Math.cos(a) * r,
          dy: Math.sin(a) * r - 50,
          colour: ["#00e5ff", "#7c5cff", "#a0ffb0", "#7eff97"][i % 4],
          delay: Math.random() * 120,
        });
      }
      setParticles(burst);
    } else {
      audio.wrong();
      // Kept helper - intensity-gated as above. The legacy helper
      // also plays its own hard-wrong cue alongside the body shake;
      // preserved (double-cue) so the wrong moment doesn't get softer.
      if (intensity > 0) wrongAnswerShake();
      onWrong?.();
    }
    window.setTimeout(() => setPhase("review"), 2200);
  };

  const next = () => {
    audio.tap();
    if (idx + 1 >= list.length) {
      setFinished(true);
      return;
    }
    setIdx((n) => n + 1);
  };

  if (!scenario) return null;

  const typedText = scenario.setup.slice(0, typed);
  const showDoors = !!scenario;
  const stars =
    correctCount === list.length
      ? 3
      : correctCount >= Math.ceil(list.length * 0.75)
        ? 2
        : 1;

  if (finished) {
    return (
      <FinishOverlay
        correctCount={correctCount}
        total={list.length}
        stars={stars}
        onContinue={() => {
          audio.tap();
          onComplete(correctCount);
        }}
        onRetry={() => {
          audio.select();
          resetExercise();
        }}
      />
    );
  }

  const picking = phase === "choice";
  const revealing = phase === "consequence" || phase === "review";
  const pickedChoice = picked !== null ? scenario.choices[picked] : null;
  const correctIdx = scenario.choices.findIndex((c) => c.isSafe);

  return (
    <ExerciseFrame
      maxWidth={1200}
      padding="22px 22px 26px"
      decor={false}
      background="linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)"
      style={{
        boxShadow: SHADOW.sceneFrame,
        color: COLOR.cream,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      {/* Sun glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "30%",
          right: "20%",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,250,220,0.55) 0%, rgba(255,200,130,0.2) 40%, transparent 75%)",
          filter: "blur(6px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Title */}
      <h2
        style={{
          position: "relative",
          zIndex: 1,
          margin: "0 0 8px",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 24,
          fontWeight: 900,
          letterSpacing: "-0.01em",
          color: "#eaf2ff",
          textShadow: "0 2px 10px rgba(8, 10, 22, 0.6)",
        }}
      >
        Choose Your{" "}
        <span
          style={{
            background: "linear-gradient(120deg, #00e5ff, #7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Path
        </span>
      </h2>

      {/* Scenario badge */}
      <div
        style={{
          position: "relative",
          fontSize: 11,
          letterSpacing: 5,
          color: "#00e5ff",
          fontWeight: 800,
          textTransform: "uppercase",
          padding: "5px 14px",
          background: "rgba(15, 21, 48, 0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 999,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(0, 229, 255, 0.4)",
          zIndex: 1,
        }}
      >
        ✦ Scenario {idx + 1} of {list.length} ✦
      </div>

      {/* Setup text */}
      <div
        style={{
          position: "relative",
          fontSize: 21,
          fontWeight: 700,
          margin: "12px auto 16px",
          maxWidth: 680,
          lineHeight: 1.35,
          minHeight: 60,
          color: "#e8edff",
          textShadow: "0 2px 8px rgba(8, 10, 22, 0.65)",
          zIndex: 1,
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
              background: "#00e5ff",
              verticalAlign: "middle",
              animation: "cypCursorBlink 0.8s ease-in-out infinite",
            }}
          />
        )}
      </div>

      {scenario.image && (
        <img
          src={scenario.image}
          alt=""
          style={{
            width: 92,
            height: "auto",
            filter: "drop-shadow(0 10px 30px rgba(8, 10, 22, 0.65))",
            marginBottom: 10,
            position: "relative",
            zIndex: 1,
          }}
        />
      )}

      {showDoors && (
        <div
          style={{
            display: "flex",
            gap: 22,
            justifyContent: "center",
            flexWrap: "wrap",
            perspective: 900,
            position: "relative",
            zIndex: 1,
          }}
        >
          {scenario.choices.map((c, i) => {
            const isPicked = picked === i;
            const palette = DOOR_PALETTE[i] || DOOR_PALETTE[0];
            const willOpen = revealing && isPicked;
            return (
              <div
                key={i}
                style={{
                  width: 240,
                  perspective: 900,
                  minHeight: 260,
                  position: "relative",
                }}
              >
                {/* Reveal behind door */}
                {willOpen && <RevealPanel choice={c} />}

                {/* The door itself */}
                <button
                  type="button"
                  aria-label={`Choose: ${c.text}`}
                  onClick={() => picking && pickDoor(i)}
                  disabled={!picking}
                  onMouseEnter={() => picking && audio.hover()}
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
                    borderRadius: 14,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    justifyContent: "stretch",
                    background: palette.body,
                    borderStyle: "solid",
                    borderWidth: 4,
                    borderColor: palette.rim,
                    color: COLOR.cream,
                    cursor: picking ? "pointer" : "default",
                    boxShadow:
                      "0 18px 40px -10px rgba(20, 8, 5, 0.7), 0 0 0 1px rgba(0, 229, 255, 0.15) inset, 0 -6px 0 rgba(0, 0, 0, 0.35) inset",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                    fontFamily: "inherit",
                    overflow: "hidden",
                  }}
                  onMouseOver={(e) => {
                    if (!picking) return;
                    const t = e.currentTarget;
                    t.style.transform = "translateY(-4px)";
                    t.style.boxShadow =
                      "0 24px 50px -10px rgba(20, 8, 5, 0.85), 0 0 0 1px rgba(255, 230, 190, 0.3) inset, 0 -6px 0 rgba(0, 0, 0, 0.35) inset, 0 0 30px rgba(255, 200, 100, 0.4)";
                  }}
                  onMouseOut={(e) => {
                    const t = e.currentTarget;
                    t.style.transform = "";
                    t.style.boxShadow =
                      "0 18px 40px -10px rgba(20, 8, 5, 0.7), 0 0 0 1px rgba(0, 229, 255, 0.15) inset, 0 -6px 0 rgba(0, 0, 0, 0.35) inset";
                  }}
                >
                  {/* Clean, identical choice card. Both look the SAME before a
                      pick (no giveaway): a glowing door emblem so it reads
                      instantly as "a path you choose", the option text as the
                      hero, and an obvious tap affordance. Replaces the old CSS
                      pseudo-door (empty panels + a floating brass dot) that read
                      as nothing. */}
                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "18px 16px 16px",
                      gap: 10,
                    }}
                  >
                    {/* Door emblem in a glowing portal ring */}
                    <div
                      aria-hidden
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 26,
                        background:
                          "radial-gradient(circle at 50% 36%, rgba(125,240,255,0.32), rgba(15,21,48,0.92))",
                        border: `2px solid ${palette.rim}`,
                        boxShadow:
                          "0 0 18px rgba(0,229,255,0.45), inset 0 0 12px rgba(0,229,255,0.22)",
                      }}
                    >
                      <PixIcon emoji="🚪" size={32} />
                    </div>

                    {/* Option text — the hero */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        color: "#eef4ff",
                        fontSize: 17,
                        fontWeight: 800,
                        lineHeight: 1.3,
                        textShadow: "0 2px 6px rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      {c.text}
                    </div>

                    {/* Tap affordance — identical on both */}
                    <div
                      style={{
                        width: "100%",
                        padding: "9px 10px",
                        borderRadius: 10,
                        flexShrink: 0,
                        background: "rgba(0, 229, 255, 0.12)",
                        border: "1px solid rgba(0, 229, 255, 0.4)",
                        color: "#7df0ff",
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      Tap to choose →
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Particles */}
      {pickedChoice?.isSafe && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "55%",
            pointerEvents: "none",
            zIndex: 5,
          }}
        >
          {particles.map((p) => (
            <span
              key={p.id}
              style={
                {
                  position: "absolute",
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: p.colour,
                  boxShadow: `0 0 10px ${p.colour}`,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  animation: `cypParticle 1.1s ease-out ${p.delay}ms forwards`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Review */}
      {phase === "review" && (
        <div
          style={{
            marginTop: 24,
            animation: "cypFade 0.4s ease-out both",
            maxWidth: 620,
            position: "relative",
            zIndex: 2,
          }}
        >
          {pickedChoice && !pickedChoice.isSafe && (
            <div
              style={{
                fontSize: 11,
                color: "#00e5ff",
                marginBottom: 12,
                letterSpacing: 4,
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              ✦ What you should have done ✦
            </div>
          )}
          {pickedChoice && !pickedChoice.isSafe && correctIdx >= 0 && (
            <div
              style={{
                display: "inline-block",
                padding: "12px 20px",
                borderRadius: 14,
                background: "rgba(74, 154, 106, 0.2)",
                borderStyle: "solid",
                borderWidth: 2,
                borderColor: "#7eff97",
                color: "#e8edff",
                fontSize: 15,
                fontWeight: 700,
                animation: "cypPulseGlow 1.8s ease-in-out infinite",
                marginBottom: 18,
              }}
            >
              ✓ {scenario.choices[correctIdx].text}
            </div>
          )}
          <div style={{ marginTop: 6 }}>
            <motion.button
              type="button"
              onClick={next}
              whileHover={{ y: -3, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING.snappy}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "14px 36px",
                fontSize: 16,
                fontWeight: 800,
                color: COLOR.goldDark,
                background: `linear-gradient(135deg, ${COLOR.goldLight}, ${COLOR.goldMid})`,
                borderRadius: 999,
                fontFamily: "inherit",
                letterSpacing: 0.5,
                boxShadow: SHADOW.primaryButton,
              }}
            >
              Continue →
            </motion.button>
          </div>
        </div>
      )}

      {showIntro && (
        <ExerciseIntroBeat
          title="Choose Your Path"
          logo="/cyberheroes/logos/choose-path.png"
          welcome="Your fourth challenge!"
          subtitle="You'll face real online situations. Pick a door to see what happens - choose wisely!"
          icon="🚪"
          narration={introNarration}
          character={introNarration?.speaker ?? "layla"}
          onDismiss={() => setShowIntro(false)}
        />
      )}
      {fx.layer()}
    </ExerciseFrame>
  );
}

/* ───────────────────────── REVEAL PANEL ───────────────────────── */

function RevealPanel({ choice }: { choice: ChoiceOption }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        borderRadius: 14,
        background: choice.isSafe
          ? "linear-gradient(180deg, rgba(255, 250, 220, 0.95), rgba(168, 227, 187, 0.95))"
          : "linear-gradient(180deg, rgba(255, 230, 215, 0.95), rgba(244, 168, 154, 0.95))",
        borderStyle: "solid",
        borderWidth: 3,
        borderColor: choice.isSafe ? "#4a9a6a" : "#ff7a59",
        animation: "cypRevealIn 0.6s ease-out 0.3s both",
        boxShadow: choice.isSafe
          ? "0 0 30px rgba(74, 154, 106, 0.5)"
          : "0 0 30px rgba(255, 95, 179, 0.5)",
        color: COLOR.inkDeep,
      }}
    >
      <div
        style={{
          fontSize: 50,
          marginBottom: 8,
          color: choice.isSafe ? "#4a9a6a" : "#ff7a59",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.15)",
        }}
      >
        {choice.isSafe ? "✓" : "✗"}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.4,
          textAlign: "center",
        }}
      >
        {choice.consequence}
      </div>
      {!choice.isSafe && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 14,
            fontSize: 42,
            animation: "cypRaccoonPop 1s ease-out forwards",
            filter: "drop-shadow(0 0 16px rgba(255, 95, 179, 0.55))",
          }}
        >
          <PixIcon emoji="🦝" size={42} />
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── FINISH OVERLAY ───────────────────────── */

function FinishOverlay({
  correctCount,
  total,
  stars,
  onContinue,
  onRetry,
}: {
  correctCount: number;
  total: number;
  stars: number;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <ExerciseFrame
      maxWidth={1200}
      padding={32}
      background="linear-gradient(180deg, #2a1240 0%, #1a2147 50%, #252d5e 100%)"
      style={{
        boxShadow: SHADOW.sceneFrame,
        color: COLOR.cream,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          minHeight: 500,
          maxHeight: "calc(100vh - 140px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 5,
          color: "#00e5ff",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        ✦ Story Complete ✦
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          background:
            "linear-gradient(135deg, #00e5ff, #7c5cff, #3a7bff)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 1,
        }}
      >
        WISE HERO!
      </div>
      <div style={{ fontSize: 16, marginTop: 8, opacity: 0.92 }}>
        You made <strong style={{ color: "#a0ffb0" }}>{correctCount}</strong> safe
        choice{correctCount === 1 ? "" : "s"} out of {total}
      </div>
      <div style={{ display: "flex", gap: 4, margin: "14px 0" }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{
              opacity: i < stars ? 1 : 0.25,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              ...SPRING.bouncy,
              delay: 0.3 + i * 0.18,
            }}
            style={{
              fontSize: 40,
              filter:
                i < stars
                  ? "drop-shadow(0 0 14px rgba(255, 200, 100, 0.7))"
                  : "grayscale(0.6)",
            }}
          >
            ★
          </motion.span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 12,
        }}
      >
        <motion.button
          type="button"
          onClick={onContinue}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "14px 36px",
            fontSize: 16,
            fontWeight: 800,
            color: COLOR.goldDark,
            background: `linear-gradient(135deg, ${COLOR.goldLight}, ${COLOR.goldMid})`,
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.primaryButton,
          }}
        >
          Continue →
        </motion.button>
        <motion.button
          type="button"
          onClick={onRetry}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 800,
            color: COLOR.cream,
            background: "rgba(15, 21, 48, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.drop,
          }}
        >
          ↻ Try Again
        </motion.button>
      </div>
      </motion.div>
    </ExerciseFrame>
  );
}
