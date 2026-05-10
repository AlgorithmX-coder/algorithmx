"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { playSound } from "@/app/lib/sounds";
import {
  correctAnswerBurst,
  badgeEarnedCelebration,
} from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import { COLOR, SHADOW, SPRING } from "@/app/components/scene/tokens";

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
    colour: "#7c5cff",
    bg: "linear-gradient(135deg, #7c5cff, #3a7bff)",
  },
  {
    id: "digits",
    label: "Numbers",
    icon: "123",
    colour: "#7eff97",
    bg: "linear-gradient(135deg, #7eff97, #15803d)",
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
  "#1a1f4d", // empty - cosmic deep
  "#3a1a3e", // 1 - cosmic plum
  "#7c5cff", // 2 - cosmic violet
  "#a06aff", // 3 - lighter violet
  "#ff5fb3", // 4 - cosmic pink
  "linear-gradient(180deg, #ffd158, #ff5fb3, #7c5cff, #00e5ff)", // 5 - cosmic rainbow
];

const METER_SEGMENTS = [
  { colour: "#ff5fb3", label: "WEAK" },
  { colour: "#ff7a59", label: "GETTING THERE" },
  { colour: "#ffd158", label: "GOOD" },
  { colour: "#7eff97", label: "STRONG" },
  { colour: "#7df0ff", label: "SUPER STRONG!" },
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

  /* PHASE B - BUILD-YOUR-OWN PASSWORD SANDBOX
     After the cauldron-mixing tutorial completes, the kid drops into
     a personal password builder: pick word / number / symbol blocks
     to compose their own password, save it, and that exact string
     surfaces later in CrackTheCode and the Boss Battle as "your
     password". Adds agency + meaningful continuity. */
  type LabPhase = "playing" | "sandbox" | "done";
  const [labPhase, setLabPhase] = useState<LabPhase>("playing");
  const [builtPwd, setBuiltPwd] = useState<string[]>([]);

  const resetExercise = () => {
    setAdded([]);
    setDrag(null);
    setSplashes([]);
    setCompleted(false);
    setShake(false);
    setShowIntro(true);
    setLabPhase("playing");
    setBuiltPwd([]);
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
    // Capture where in the card the user grabbed - so the card stays under
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
        borderRadius: 28,
        overflow: "hidden",
        background:
          // Was a violet halo at the bottom + a warm cream halo at the
          // top - two competing colour temperatures inside one cauldron
          // scene.  Replaced the warm cream halo with a cyan halo so the
          // sky reads cool-on-cool.
          "radial-gradient(ellipse at 50% 80%, rgba(124, 92, 255, 0.45), transparent 60%)," +
          "radial-gradient(ellipse at 50% 20%, rgba(125, 240, 255, 0.4), transparent 55%)," +
          "linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)",
        boxShadow: SHADOW.sceneFrame,
        padding: "20px 18px 30px",
        color: COLOR.cream,
        userSelect: "none",
        touchAction: "none",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Magical lab backdrop - drifting alchemy runes & floor lights */}
      <style>{`
        @keyframes plRuneDrift { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.18; } 50% { transform: translateY(-14px) rotate(8deg); opacity: 0.45; } }
        @keyframes plSteam { 0% { transform: translate(-50%, 0) scale(0.6); opacity: 0; } 18% { opacity: 0.55; } 100% { transform: translate(calc(-50% + var(--sx, 0px)), -130px) scale(2.4); opacity: 0; } }
        @keyframes plFireFlicker { 0%,100% { transform: translateX(-50%) scaleY(1) scaleX(1); opacity: 0.85; } 50% { transform: translateX(-50%) scaleY(1.18) scaleX(0.9); opacity: 1; } }
        @keyframes plSpark { 0% { transform: translateY(0); opacity: 0; } 18% { opacity: 1; } 100% { transform: translateY(-160px) translateX(var(--sx, 12px)); opacity: 0; } }
        @keyframes plRimGlow { 0%,100% { box-shadow: 0 0 18px rgba(160,106,255,0.55), 0 0 40px rgba(0,229,255,0.35); } 50% { box-shadow: 0 0 30px rgba(160,106,255,0.85), 0 0 60px rgba(247,193,214,0.45); } }
      `}</style>
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        {["✦", "🜨", "🜂", "✧", "⚗", "☉", "✦"].map((r, i) => (
          <span
            key={`r-${i}`}
            style={{
              position: "absolute",
              left: `${(i * 14 + 6) % 95}%`,
              top: `${(i * 21 + 8) % 80}%`,
              fontSize: 22 + (i % 3) * 8,
              color: i % 2 === 0 ? "#00e5ff" : "#7c5cff",
              opacity: 0.32,
              filter: `drop-shadow(0 0 10px ${i % 2 === 0 ? "#00e5ff" : "#7c5cff"})`,
              animation: `plRuneDrift ${10 + (i % 4) * 3}s ease-in-out ${i * 1.4}s infinite`,
            }}
          >
            {r}
          </span>
        ))}
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          fontSize: 11,
          letterSpacing: 5,
          color: "#00e5ff",
          textTransform: "uppercase",
          fontWeight: 800,
          padding: "5px 16px",
          background: "rgba(15, 21, 48, 0.55)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderRadius: 999,
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(0, 229, 255, 0.4)",
          display: "inline-block",
          margin: "0 auto",
        }}
      >
        ✦ Password Laboratory ✦
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          fontSize: 22,
          fontWeight: 800,
          margin: "8px 0 18px",
          color: "#e8edff",
          textShadow:
            "0 4px 12px rgba(8, 10, 22, 0.7), 0 0 20px rgba(124, 92, 255, 0.45)",
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

        {/* Steam wisps rising above the cauldron */}
        {Array.from({ length: 6 }).map((_, i) => {
          const sx = ((i % 3) - 1) * 24;
          const dur = 3.4 + (i % 3) * 0.8;
          const delay = i * 0.55;
          return (
            <span
              key={`steam-${i}`}
              aria-hidden
              style={{
                position: "absolute",
                left: `calc(50% + ${(i * 17) % 80 - 40}px)`,
                top: 18,
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0))",
                filter: "blur(3px)",
                animation: `plSteam ${dur}s ease-in-out ${delay}s infinite`,
                ["--sx" as string]: `${sx}px`,
                pointerEvents: "none",
              } as React.CSSProperties}
            />
          );
        })}

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
              "linear-gradient(180deg, #3a1a3e 0%, #0f1530 55%, #000 100%)",
            boxShadow:
              "inset 0 6px 18px rgba(255,255,255,0.08), inset 0 -20px 30px rgba(0,0,0,0.8), 0 10px 40px rgba(0,0,0,0.6)",
            border: "3px solid #475569",
            overflow: "hidden",
            animation: "plRimGlow 3s ease-in-out infinite",
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
                    "linear-gradient(180deg, rgba(253,224,71,0.7), rgba(236,72,153,0.6), rgba(124,92,255,0.7))",
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

      {/* Completion overlay - absolute positioned so it fits within the exercise
          container viewport cap instead of stacking below and getting clipped. */}
      {completed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15, 21, 48, 0.95) 0%, rgba(4, 5, 13, 0.96) 100%)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 15,
            padding: 28,
            textAlign: "center",
            color: COLOR.cream,
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
            ✦ Brewed Successfully ✦
          </div>
          <div style={{ fontSize: 56, margin: "4px 0" }}>🧪✨</div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              background:
                "linear-gradient(135deg, #00e5ff, #7c5cff, #3a7bff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
            }}
          >
            PERFECT POTION!
          </div>
          <div
            style={{
              marginTop: 12,
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              fontSize: 20,
              padding: "12px 22px",
              background: "rgba(4, 5, 13, 0.85)",
              borderStyle: "solid",
              borderWidth: 2,
              borderColor: "rgba(125, 240, 255, 0.55)",
              borderRadius: 14,
              display: "inline-block",
              color: "#00e5ff",
              boxShadow: "0 0 30px rgba(124, 92, 255, 0.45)",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {FINAL_PASSWORD}
          </div>
          <div style={{ display: "flex", gap: 4, margin: "16px 0 4px" }}>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  ...SPRING.bouncy,
                  delay: 0.3 + i * 0.18,
                }}
                style={{
                  fontSize: 38,
                  filter: "drop-shadow(0 0 14px rgba(255, 200, 100, 0.7))",
                }}
              >
                ★
              </motion.span>
            ))}
          </div>
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <motion.button
              type="button"
              onClick={() => {
                playSound("click");
                // Phase A done → advance to the Build-Your-Own
                // password sandbox instead of completing immediately.
                setLabPhase("sandbox");
              }}
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
              Build YOUR Password →
            </motion.button>
            <motion.button
              type="button"
              onClick={() => {
                playSound("select");
                resetExercise();
              }}
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

      {/* PHASE B - Build-Your-Own Password sandbox overlay */}
      {labPhase === "sandbox" && (
        <BuildPasswordSandbox
          built={builtPwd}
          setBuilt={setBuiltPwd}
          onSave={(pwd) => {
            try {
              /* Slot-aware so Adam's saved password doesn't bleed
               * into Layla's CrackTheCode + boss screen. */
              const id = window.localStorage.getItem(
                "algorithmx-active-slot-v1",
              );
              const key = id
                ? `ax-w1-saved-password::${id}`
                : "ax-w1-saved-password";
              window.localStorage.setItem(key, pwd);
            } catch {}
            playSound("confetti");
            setLabPhase("done");
            // Brief celebratory beat before parent's onComplete fires.
            window.setTimeout(() => onComplete(5), 600);
          }}
        />
      )}

      {/* Dragging ghost - rendered via portal to document.body so it escapes
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

/* ───────────────────────── BUILD-YOUR-OWN PASSWORD ─────────────────
 * Phase B sandbox. Kid clicks word / number / symbol blocks to compose
 * their own password, sees the strength meter respond live, then hits
 * "Save my password". The string is persisted to localStorage under
 * `ax-w1-saved-password` so CrackTheCode (Case 7) and the Boss Battle
 * (Case 15) can surface it back as "your password" - adds personal
 * continuity through the rest of the lesson.
 *
 * Pure JSX/CSS. Uses the cyber palette + glassy sandbox card. */

const BUILD_WORDS = ["Tiger", "Dragon", "Robot", "Pixel", "Comet", "Ninja"];
const BUILD_NUMBERS = ["7", "42", "99", "23"];
const BUILD_SYMBOLS = ["!", "@", "#", "$", "&"];

function BuildPasswordSandbox({
  built,
  setBuilt,
  onSave,
}: {
  built: string[];
  setBuilt: (next: string[]) => void;
  onSave: (pwd: string) => void;
}) {
  const pwd = built.join("");
  // Strength heuristic: characters + variety of categories.
  const hasWord = built.some((b) => /^[A-Za-z]+$/.test(b));
  const hasNum = built.some((b) => /^\d+$/.test(b));
  const hasSym = built.some((b) => /^[!@#$&]+$/.test(b));
  const cats = (hasWord ? 1 : 0) + (hasNum ? 1 : 0) + (hasSym ? 1 : 0);
  const strength = Math.min(
    100,
    Math.round((pwd.length / 12) * 60) + cats * 13,
  );
  const tier =
    strength >= 80 ? "STRONG" : strength >= 50 ? "MEDIUM" : pwd.length > 0 ? "WEAK" : "EMPTY";
  const tierColour =
    tier === "STRONG" ? "#7eff97" : tier === "MEDIUM" ? "#ffd58a" : tier === "WEAK" ? "#ff5fb3" : "#7df0ff";
  const canSave = pwd.length >= 6 && cats >= 2;

  const addBlock = (val: string) => {
    if (built.length >= 6) return;
    setBuilt([...built, val]);
    playSound("pop");
  };
  const removeLast = () => {
    if (built.length === 0) return;
    setBuilt(built.slice(0, -1));
    playSound("click");
  };

  return (
    <div
      role="dialog"
      aria-label="Build Your Password"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background:
          "linear-gradient(180deg, rgba(15, 21, 48, 0.88) 0%, rgba(8, 10, 22, 0.95) 100%)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: "plBuildIn 0.4s ease-out both",
      }}
    >
      <div
        style={{
          maxWidth: 580,
          width: "100%",
          padding: "24px 24px 22px",
          borderRadius: 22,
          background:
            "linear-gradient(180deg, rgba(15, 21, 48, 0.85), rgba(8, 10, 22, 0.92))",
          border: "1px solid rgba(0, 229, 255, 0.45)",
          boxShadow:
            "0 30px 60px -20px rgba(0, 0, 0, 0.7), 0 0 32px rgba(0, 229, 255, 0.25)",
          color: "#e8edff",
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <span
            style={{
              display: "inline-block",
              fontSize: 11,
              letterSpacing: 4,
              fontWeight: 800,
              color: "#ffd58a",
              textTransform: "uppercase",
              padding: "4px 14px",
              background: "rgba(8, 10, 22, 0.55)",
              border: "1px solid rgba(0, 229, 255, 0.4)",
              borderRadius: 999,
            }}
          >
            Phase 2 of 2
          </span>
        </div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 900,
            background: "linear-gradient(135deg, #7df0ff, #00e5ff, #7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "4px 0 4px",
            letterSpacing: 0.3,
            textAlign: "center",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          Build YOUR Password!
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#c5cdf0",
            opacity: 0.92,
            margin: "0 0 14px",
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          Pick blocks to make your own. Mix words, numbers, and symbols
          for a strong one. We&apos;ll use it later in the lesson!
        </p>

        {/* Live password readout */}
        <div
          style={{
            position: "relative",
            minHeight: 60,
            background: "rgba(8, 10, 22, 0.72)",
            border: `1px solid ${tierColour}`,
            borderRadius: 14,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
            flexWrap: "wrap",
            boxShadow: `0 0 18px ${tierColour}33`,
          }}
        >
          {built.length === 0 ? (
            <span style={{ color: "rgba(125, 240, 255, 0.45)", fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace", fontSize: 14 }}>
              click blocks below to build…
            </span>
          ) : (
            built.map((b, i) => (
              <span
                key={i}
                style={{
                  padding: "4px 10px",
                  borderRadius: 8,
                  background: "rgba(0, 229, 255, 0.18)",
                  border: "1px solid rgba(0, 229, 255, 0.55)",
                  fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                  fontSize: 16,
                  color: "#e8edff",
                  fontWeight: 800,
                }}
              >
                {b}
              </span>
            ))
          )}
        </div>

        {/* Strength bar + tier */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div
            style={{
              flex: 1,
              height: 8,
              borderRadius: 999,
              background: "rgba(0, 229, 255, 0.12)",
              overflow: "hidden",
              border: "1px solid rgba(0, 229, 255, 0.22)",
            }}
          >
            <div
              style={{
                width: `${strength}%`,
                height: "100%",
                background: `linear-gradient(90deg, #00e5ff, ${tierColour})`,
                boxShadow: `0 0 10px ${tierColour}`,
                transition: "width 0.3s ease, background 0.3s ease",
              }}
            />
          </div>
          <span
            style={{
              fontSize: 11,
              letterSpacing: 2,
              fontWeight: 800,
              color: tierColour,
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              minWidth: 60,
              textAlign: "right",
            }}
          >
            {tier}
          </span>
        </div>

        {/* Block tray - three rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {[
            { label: "WORDS", items: BUILD_WORDS, accent: "#00e5ff" },
            { label: "NUMBERS", items: BUILD_NUMBERS, accent: "#7c5cff" },
            { label: "SYMBOLS", items: BUILD_SYMBOLS, accent: "#ff5fb3" },
          ].map((row) => (
            <div key={row.label}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 2,
                  fontWeight: 800,
                  color: row.accent,
                  fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                  marginBottom: 4,
                }}
              >
                {row.label}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {row.items.map((it) => (
                  <button
                    key={it}
                    type="button"
                    onClick={() => addBlock(it)}
                    disabled={built.length >= 6}
                    style={{
                      padding: "6px 12px",
                      borderRadius: 8,
                      background: `${row.accent}1a`,
                      border: `1px solid ${row.accent}66`,
                      color: row.accent,
                      fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                      fontSize: 14,
                      fontWeight: 800,
                      cursor: built.length >= 6 ? "default" : "pointer",
                      opacity: built.length >= 6 ? 0.4 : 1,
                      transition: "transform 0.15s ease, background 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (built.length >= 6) return;
                      (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                      (e.currentTarget as HTMLButtonElement).style.background = `${row.accent}33`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.transform = "";
                      (e.currentTarget as HTMLButtonElement).style.background = `${row.accent}1a`;
                    }}
                  >
                    {it}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={removeLast}
            disabled={built.length === 0}
            style={{
              padding: "12px 22px",
              borderRadius: 999,
              background: "rgba(15, 21, 48, 0.65)",
              border: "1px solid rgba(125, 240, 255, 0.32)",
              color: "#c5cdf0",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: 13,
              cursor: built.length === 0 ? "default" : "pointer",
              opacity: built.length === 0 ? 0.4 : 1,
              letterSpacing: 0.5,
            }}
          >
            ← Undo
          </button>
          <button
            type="button"
            onClick={() => canSave && onSave(pwd)}
            disabled={!canSave}
            style={{
              padding: "12px 26px",
              borderRadius: 999,
              border: "none",
              background: canSave
                ? "linear-gradient(135deg, #00e5ff, #7c5cff)"
                : "rgba(15, 21, 48, 0.65)",
              color: canSave ? "#080a16" : "rgba(197, 205, 240, 0.5)",
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 14,
              cursor: canSave ? "pointer" : "default",
              letterSpacing: 1,
              textTransform: "uppercase",
              boxShadow: canSave
                ? "0 0 24px rgba(0, 229, 255, 0.55), 0 8px 18px -4px rgba(124, 92, 255, 0.45)"
                : "none",
            }}
          >
            {canSave ? "💾 Save My Password →" : "Add a number + symbol"}
          </button>
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "rgba(125, 240, 255, 0.55)",
            marginTop: 12,
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            letterSpacing: 1,
          }}
        >
          {built.length}/6 blocks · stays on this device only
        </p>
      </div>
      <style>{`
        @keyframes plBuildIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
