"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { playSound } from "@/app/lib/sounds";
import {
  correctAnswerBurst,
  badgeEarnedCelebration,
} from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";

export interface PasswordLabProps {
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

type IngredientId = "upper" | "lower" | "digits" | "symbols" | "length";

interface Ingredient {
  id: IngredientId;
  label: string;
  icon: string;
  colour: string;
  bg: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    id: "upper",
    label: "UPPERCASE",
    icon: "A",
    colour: "#ef4444",
    bg: "linear-gradient(135deg, #ef4444, #b91c1c)",
  },
  {
    id: "lower",
    label: "lowercase",
    icon: "abc",
    colour: "#3b82f6",
    bg: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
  },
  {
    id: "digits",
    label: "Numbers",
    icon: "123",
    colour: "#22c55e",
    bg: "linear-gradient(135deg, #22c55e, #15803d)",
  },
  {
    id: "symbols",
    label: "Symbols",
    icon: "@#$",
    colour: "#a855f7",
    bg: "linear-gradient(135deg, #a855f7, #7e22ce)",
  },
  {
    id: "length",
    label: "Make it LONG (8+)",
    icon: "⇤⇥",
    colour: "#f97316",
    bg: "linear-gradient(135deg, #f97316, #c2410c)",
  },
];

const STAGE_LIQUID_COLOURS = [
  "#475569", // grey
  "#1d4ed8",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "linear-gradient(180deg, #fbbf24, #ef4444, #a855f7, #3b82f6)",
];

const METER_SEGMENTS = [
  { colour: "#ef4444", label: "WEAK" },
  { colour: "#f97316", label: "GETTING THERE" },
  { colour: "#facc15", label: "GOOD" },
  { colour: "#22c55e", label: "STRONG" },
  { colour: "#4ade80", label: "SUPER STRONG!" },
];

const FINAL_PASSWORD = "Tr0pic4l$unR1se!";

const STYLES = `
@keyframes plBubbleRise {
  0%   { transform: translate(-50%, 0) scale(0.9); opacity: 0; }
  15%  { opacity: 0.85; }
  80%  { opacity: 0.55; }
  100% { transform: translate(-50%, -160px) scale(1.35); opacity: 0; }
}
@keyframes plSteam {
  0%   { transform: translate(-50%, 0) scale(0.8); opacity: 0; }
  20%  { opacity: 0.5; }
  100% { transform: translate(-50%, -140px) scale(2); opacity: 0; }
}
@keyframes plCardBob {
  0%,100% { transform: translateY(0) rotate(var(--tilt, 0deg)); }
  50%     { transform: translateY(-6px) rotate(var(--tilt, 0deg)); }
}
@keyframes plSplash {
  0%   { transform: translate(-50%, 0) scale(1); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--sx, 0px)), var(--sy, -120px)) scale(0.4); opacity: 0; }
}
@keyframes plSegmentPop {
  0%   { transform: scaleY(0.3); }
  60%  { transform: scaleY(1.2); }
  100% { transform: scaleY(1); }
}
@keyframes plPotionRise {
  0%   { transform: translate(-50%, 80px) scale(0.2); opacity: 0; }
  100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
}
@keyframes plGlowPulse {
  0%,100% { opacity: 0.5; }
  50%     { opacity: 1; }
}
@keyframes plFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-password-lab-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

interface Splash {
  id: number;
  colour: string;
  angle: number;
  distance: number;
  duration: number;
}

export default function PasswordLab({
  onComplete,
  onCorrect,
  onWrong,
}: PasswordLabProps) {
  useEffect(ensureStyles, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const cauldronRef = useRef<HTMLDivElement | null>(null);
  const splashIdRef = useRef(0);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [showIntro, setShowIntro] = useState(true);
  const [added, setAdded] = useState<IngredientId[]>([]);
  const [drag, setDrag] = useState<{
    id: IngredientId;
    x: number;
    y: number;
  } | null>(null);
  const [splashes, setSplashes] = useState<Splash[]>([]);
  const [completed, setCompleted] = useState(false);
  const [shake, setShake] = useState(false);

  const resetExercise = () => {
    setAdded([]);
    setDrag(null);
    setSplashes([]);
    setCompleted(false);
    setShake(false);
    setShowIntro(true);
  };

  const remaining = useMemo(
    () => INGREDIENTS.filter((i) => !added.includes(i.id)),
    [added]
  );
  const strength = added.length;
  const liquidColour = STAGE_LIQUID_COLOURS[strength];
  const isRainbow = strength === 5;

  const spawnSplash = useCallback((colour: string, count: number) => {
    const burst: Splash[] = [];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
      burst.push({
        id: ++splashIdRef.current,
        colour,
        angle,
        distance: 60 + Math.random() * 80,
        duration: 450 + Math.random() * 350,
      });
    }
    setSplashes((prev) => [...prev, ...burst]);
    window.setTimeout(() => {
      const ids = new Set(burst.map((b) => b.id));
      setSplashes((prev) => prev.filter((s) => !ids.has(s.id)));
    }, 900);
  }, []);

  const tryAddAt = useCallback(
    (id: IngredientId, x: number, y: number) => {
      const cauldron = cauldronRef.current;
      if (!cauldron) return false;
      const r = cauldron.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const within = Math.abs(dx) < r.width / 2 + 20 && Math.abs(dy) < r.height / 2 + 20;
      if (!within) return false;

      const ing = INGREDIENTS.find((i) => i.id === id);
      if (!ing) return false;
      setAdded((prev) => (prev.includes(id) ? prev : [...prev, id]));
      spawnSplash(ing.colour, 10 + Math.floor(Math.random() * 4));
      playSound("pour");
      playSound("sortCorrect");
      onCorrect?.();
      return true;
    },
    [spawnSplash, onCorrect]
  );

  const handlePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    id: IngredientId
  ) => {
    if (added.includes(id) || completed || showIntro) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    // Capture where in the card the user grabbed — so the card stays under
    // that exact point instead of centring on the cursor.
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - (rect.left + rect.width / 2),
      y: e.clientY - (rect.top + rect.height / 2),
    };
    setDrag({ id, x: e.clientX, y: e.clientY });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setDrag({ id: drag.id, x: e.clientX, y: e.clientY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    // Drop test uses the card's true centre (pointer minus the grab offset),
    // not the raw pointer, so the drop sweet-spot matches the rendered card.
    const cardCx = e.clientX - dragOffsetRef.current.x;
    const cardCy = e.clientY - dragOffsetRef.current.y;
    const ok = tryAddAt(drag.id, cardCx, cardCy);
    if (!ok) {
      setShake(true);
      window.setTimeout(() => setShake(false), 250);
      onWrong?.();
    }
    setDrag(null);
  };

  useEffect(() => {
    if (added.length === 5 && !completed) {
      setCompleted(true);
      playSound("confetti");
      playSound("badgeEarned");
      void correctAnswerBurst();
      void badgeEarnedCelebration();
      spawnSplash("#fbbf24", 28);
    }
  }, [added.length, completed, spawnSplash]);

  const [bubbleTick, setBubbleTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setBubbleTick((n) => n + 1), 450);
    return () => window.clearInterval(id);
  }, []);
  const bubbleCount = 4 + Math.min(8, strength * 2);
  const bubbles = useMemo(
    () =>
      Array.from({ length: bubbleCount }).map((_, i) => ({
        key: `${bubbleTick}-${i}`,
        left: 15 + Math.random() * 70,
        size: 8 + Math.random() * 12,
        delay: Math.random() * 600,
        duration: 1000 + Math.random() * 900,
      })),
    [bubbleTick, bubbleCount]
  );

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{
        position: "relative",
        width: "100%",
        minHeight: 520,
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 24,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% 40%, rgba(59,130,246,0.15), transparent 55%), linear-gradient(180deg, #0b1225 0%, #070a18 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "18px 16px 28px",
        color: "#e2e8f0",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontSize: 13,
          letterSpacing: 2,
          color: "#7dd3fc",
          textTransform: "uppercase",
          fontWeight: 700,
        }}
      >
        Password Lab
      </div>
      <div
        style={{
          textAlign: "center",
          fontSize: 22,
          fontWeight: 800,
          margin: "4px 0 18px",
          background: "linear-gradient(135deg, #60a5fa, #a855f7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Drag ingredients into the cauldron!
      </div>

      {/* Ingredient tray */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
          padding: "0 8px 18px",
        }}
      >
        {INGREDIENTS.map((ing, i) => {
          const inCauldron = added.includes(ing.id);
          const dragging = drag?.id === ing.id;
          const tilt = ((i % 2 === 0 ? 1 : -1) * (i + 1)) * 0.8;
          return (
            <div
              key={ing.id}
              onPointerDown={(e) => handlePointerDown(e, ing.id)}
              style={
                {
                  "--tilt": `${tilt}deg`,
                  width: 130,
                  height: 82,
                  borderRadius: 16,
                  background: ing.bg,
                  color: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  textAlign: "center",
                  cursor: inCauldron ? "default" : "grab",
                  boxShadow: inCauldron
                    ? "none"
                    : `0 6px 22px ${ing.colour}55, 0 0 0 1px rgba(255,255,255,0.08) inset`,
                  opacity: inCauldron ? 0.25 : 1,
                  transform: dragging ? "scale(1.1) rotate(-4deg)" : undefined,
                  transition: dragging
                    ? "none"
                    : "transform 0.25s ease, box-shadow 0.25s ease",
                  animation: inCauldron
                    ? "none"
                    : `plCardBob ${2.4 + i * 0.3}s ease-in-out ${i * 0.15}s infinite`,
                  pointerEvents: inCauldron ? "none" : "auto",
                } as React.CSSProperties
              }
            >
              <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 4 }}>
                {ing.icon}
              </div>
              <div>{ing.label}</div>
            </div>
          );
        })}
      </div>

      {/* Cauldron */}
      <div
        style={{
          position: "relative",
          width: 260,
          height: 220,
          margin: "12px auto 0",
          animation: shake ? "plCardBob 0.25s linear" : undefined,
        }}
      >
        {/* Outer glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: -40,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(251,191,36,${0.08 + strength * 0.06}) 0%, transparent 60%)`,
            filter: "blur(12px)",
            transition: "background 0.6s ease",
            pointerEvents: "none",
          }}
        />

        {/* Steam */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: -20,
            width: 180,
            height: 80,
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              style={{
                position: "absolute",
                left: `${30 + i * 18}%`,
                bottom: 0,
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.25)",
                filter: "blur(6px)",
                animation: `plSteam ${2.2 + i * 0.4}s ease-out ${i * 0.45}s infinite`,
              }}
            />
          ))}
        </div>

        {/* Cauldron body */}
        <div
          ref={cauldronRef}
          style={{
            position: "absolute",
            left: 0,
            top: 40,
            width: "100%",
            height: 170,
            borderRadius: "40% 40% 60% 60% / 20% 20% 80% 80%",
            background:
              "linear-gradient(180deg, #1e293b 0%, #0f172a 55%, #000 100%)",
            boxShadow:
              "inset 0 6px 18px rgba(255,255,255,0.08), inset 0 -20px 30px rgba(0,0,0,0.8), 0 10px 40px rgba(0,0,0,0.6)",
            border: "3px solid #475569",
            overflow: "hidden",
          }}
        >
          {/* Liquid */}
          <div
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              bottom: 6,
              height: `${30 + strength * 14}%`,
              borderRadius: "40% 40% 60% 60% / 20% 20% 80% 80%",
              background: isRainbow
                ? (liquidColour as string)
                : (liquidColour as string),
              boxShadow:
                "inset 0 4px 10px rgba(255,255,255,0.25), inset 0 -8px 18px rgba(0,0,0,0.3)",
              transition: "height 0.5s ease, background 0.6s ease",
            }}
          />
          {/* Bubbles */}
          {bubbles.map((b) => (
            <span
              key={b.key}
              style={{
                position: "absolute",
                left: `${b.left}%`,
                bottom: `${Math.min(20 + strength * 10, 65)}%`,
                width: b.size,
                height: b.size,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.9), rgba(255,255,255,0.2) 55%, transparent)",
                animation: `plBubbleRise ${b.duration}ms ease-out ${b.delay}ms both`,
                pointerEvents: "none",
              }}
            />
          ))}
          {/* Rim highlight */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 8,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.25), transparent)",
            }}
          />
          {/* Splashes */}
          {splashes.map((s) => (
            <span
              key={s.id}
              style={
                {
                  position: "absolute",
                  left: "50%",
                  top: 12,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: s.colour,
                  boxShadow: `0 0 12px ${s.colour}`,
                  "--sx": `${Math.cos(s.angle) * s.distance}px`,
                  "--sy": `${Math.sin(s.angle) * s.distance - 120}px`,
                  animation: `plSplash ${s.duration}ms ease-out forwards`,
                  pointerEvents: "none",
                } as React.CSSProperties
              }
            />
          ))}

          {/* Final potion bottle */}
          {completed && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "18%",
                width: 110,
                transform: "translateX(-50%)",
                animation: "plPotionRise 0.8s cubic-bezier(0.18,1.5,0.4,1) both",
                pointerEvents: "none",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: 120,
                  borderRadius: "30px 30px 50px 50% / 22px 22px 60px 60px",
                  background:
                    "linear-gradient(180deg, rgba(253,224,71,0.7), rgba(236,72,153,0.6), rgba(59,130,246,0.7))",
                  border: "2px solid rgba(255,255,255,0.6)",
                  boxShadow:
                    "0 0 30px rgba(253,224,71,0.55), inset 0 4px 10px rgba(255,255,255,0.4)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: -14,
                    transform: "translateX(-50%)",
                    width: 30,
                    height: 18,
                    background: "#64748b",
                    borderRadius: 4,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Strength meter */}
      <div
        style={{
          margin: "24px auto 0",
          maxWidth: 420,
          padding: "0 16px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 6,
            justifyContent: "center",
            alignItems: "flex-end",
            height: 30,
          }}
        >
          {METER_SEGMENTS.map((seg, idx) => {
            const lit = idx < strength;
            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: 18 + idx * 3,
                  borderRadius: 6,
                  background: lit ? seg.colour : "rgba(255,255,255,0.1)",
                  boxShadow: lit
                    ? `0 0 14px ${seg.colour}, inset 0 0 8px rgba(255,255,255,0.4)`
                    : "none",
                  transformOrigin: "bottom",
                  animation: lit ? "plSegmentPop 0.4s ease-out both" : "none",
                  transition: "background 0.3s ease",
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            marginTop: 10,
            fontWeight: 800,
            fontSize: 15,
            color:
              strength === 0
                ? "#64748b"
                : METER_SEGMENTS[Math.max(0, strength - 1)].colour,
            letterSpacing: 1.5,
          }}
        >
          {strength === 0 ? "EMPTY" : METER_SEGMENTS[strength - 1].label}
        </div>
      </div>

      {/* Completion overlay — absolute positioned so it fits within the exercise
          container viewport cap instead of stacking below and getting clipped. */}
      {completed && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(5,8,18,0.94)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 15,
            padding: 24,
            textAlign: "center",
            animation: "plFadeIn 0.5s ease-out both",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 10 }}>🧪✨</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 900,
              background:
                "linear-gradient(135deg, #fbbf24, #ef4444, #a855f7, #3b82f6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
            }}
          >
            PERFECT PASSWORD CREATED!
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: "'Courier New', monospace",
              fontSize: 22,
              padding: "10px 18px",
              background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(253,224,71,0.5)",
              borderRadius: 12,
              display: "inline-block",
              color: "#fde68a",
              boxShadow: "0 0 26px rgba(253,224,71,0.35)",
            }}
          >
            {FINAL_PASSWORD}
          </div>
          <div style={{ marginTop: 18, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                onComplete(5);
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
            <button
              type="button"
              onClick={() => {
                playSound("select");
                resetExercise();
              }}
              style={{
                background: "transparent",
                color: "#93c5fd",
                fontWeight: 700,
                borderRadius: 14,
                padding: "12px 24px",
                fontSize: 14,
                border: "2px solid rgba(96,165,250,0.55)",
                cursor: "pointer",
              }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
      )}

      {showIntro && (
        <ExerciseIntro
          title="Password Laboratory"
          description="Drag each ingredient into the cauldron to brew the perfect password potion!"
          icon="🧪"
          controls="Drag and drop the cards"
          onStart={() => setShowIntro(false)}
        />
      )}

      {/* Dragging ghost — rendered via portal to document.body so it escapes
          any transformed ancestor (ScreenTransition, 3D arena) and the fixed
          position actually uses the viewport as its reference frame. */}
      {drag &&
        typeof document !== "undefined" &&
        (() => {
          const ing = INGREDIENTS.find((i) => i.id === drag.id);
          if (!ing) return null;
          return createPortal(
            <div
              style={{
                position: "fixed",
                left: drag.x - dragOffsetRef.current.x,
                top: drag.y - dragOffsetRef.current.y,
                transform: "translate(-50%, -50%) scale(1.12) rotate(-5deg)",
                width: 130,
                height: 82,
                borderRadius: 16,
                background: ing.bg,
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                boxShadow: `0 16px 40px ${ing.colour}99`,
                zIndex: 9999,
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{ing.icon}</div>
              <div>{ing.label}</div>
            </div>,
            document.body
          );
        })()}
    </div>
  );
}
