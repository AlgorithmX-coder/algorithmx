"use client";

/*
 * Shared Pixar 2.5D scene components.
 *
 * All scenes (Mission Brief, Welcome, Boss Battle, Graduation, etc.)
 * compose from these primitives. No WebGL — pure HTML/CSS/SVG with
 * framer-motion for entrance animations.
 *
 * Usage:
 *   <SceneFrame>
 *     <SunsetBackdrop variant="dusk" />
 *     <DistantRidges variant="dusk" />
 *     <StarField />
 *     <FloatingParticles />
 *     <WoodFloor variant="dusk" />
 *     ...your scene content (positioned with absolute layout)
 *     <CharacterPortrait src="..." name="ADAM" side="left" />
 *     <SceneTitle title="..." />
 *     <PrimaryButton onClick={...}>Continue →</PrimaryButton>
 *     <Vignette />
 *     <SceneKeyframes />
 *   </SceneFrame>
 */

import { ReactNode, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  COLOR,
  FONT_STACK,
  PALETTE,
  type PaletteKey,
  SHADOW,
  SPRING,
  gradientFromStops,
} from "./tokens";

/* ───────────────────────── SCENE FRAME ───────────────────────── */

export function SceneFrame({
  children,
  height = "min(82vh, 760px)",
}: {
  children: ReactNode;
  height?: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 28,
        overflow: "hidden",
        background: "#1a0d1f",
        boxShadow: SHADOW.sceneFrame,
        fontFamily: FONT_STACK,
      }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── PARALLAX HOOK ───────────────────────── */

export function useMouseParallax() {
  const [px, setPx] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setPx({ x, y });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);
  return px;
}

/* ───────────────────────── SUNSET BACKDROP ───────────────────────── */

export function SunsetBackdrop({
  variant = "dusk",
  parallax = { x: 0, y: 0 },
  showSun = true,
}: {
  variant?: PaletteKey;
  parallax?: { x: number; y: number };
  showSun?: boolean;
}) {
  const stops = PALETTE[variant].sky;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: -20,
        zIndex: 0,
        background: gradientFromStops(stops),
        transform: `translate(${parallax.x * -4}px, ${parallax.y * -2}px)`,
        transition: "transform 0.5s ease-out",
      }}
    >
      {showSun && (
        <div
          style={{
            position: "absolute",
            top: "32%",
            right: "22%",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,250,220,1) 0%, rgba(255,220,150,0.7) 18%, rgba(255,160,90,0.3) 50%, rgba(255,160,90,0) 100%)",
            filter: "blur(2px)",
            animation: "sunPulse 6s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

/* ───────────────────────── DISTANT RIDGES ───────────────────────── */

export function DistantRidges({
  variant = "dusk",
  parallax = { x: 0, y: 0 },
}: {
  variant?: PaletteKey;
  parallax?: { x: number; y: number };
}) {
  const p = PALETTE[variant];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: "32%",
        height: "32%",
        zIndex: 1,
        pointerEvents: "none",
        transform: `translateX(${parallax.x * -8}px)`,
        transition: "transform 0.5s ease-out",
      }}
    >
      <svg
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <path
          d="M0,240 L0,160 Q60,140 120,150 Q200,120 280,140 Q360,110 460,135 Q540,105 640,130 Q740,100 840,125 Q940,95 1040,115 Q1130,135 1200,120 L1200,240 Z"
          fill={p.ridgeFar}
          opacity="0.65"
        />
        <path
          d="M0,240 L0,180 Q90,150 180,170 Q280,135 380,165 Q480,145 580,170 Q680,140 780,165 Q880,145 980,170 Q1090,150 1200,165 L1200,240 Z"
          fill={p.ridgeMid}
          opacity="0.75"
        />
        <path
          d="M0,240 L0,205 Q120,180 240,195 Q360,170 480,195 Q600,175 720,200 Q840,180 960,205 Q1080,185 1200,205 L1200,240 Z"
          fill={p.ridgeNear}
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

/* ───────────────────────── STAR FIELD ───────────────────────── */

export function StarField({ count = 50 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 37 + 13) % 100,
        top: (i * 19 + 7) % 35,
        size: 1 + ((i * 11) % 3) * 0.5,
        opacity: 0.4 + ((i * 7) % 5) / 10,
        delay: (i * 0.13) % 4,
      })),
    [count]
  );
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff7e6",
            opacity: s.opacity,
            boxShadow: `0 0 ${s.size * 3}px rgba(255, 240, 200, 0.6)`,
            animation: `starTwinkle ${3 + (i % 3)}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── FLOATING PARTICLES (dust motes) ───────────────────────── */

export function FloatingParticles({ count = 28 }: { count?: number }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: (i * 41 + 17) % 100,
        top: 30 + ((i * 23) % 60),
        size: 2 + ((i * 7) % 4),
        duration: 8 + ((i * 5) % 8),
        delay: (i * 0.43) % 8,
        drift: ((i * 13) % 30) - 15,
      })),
    [count]
  );
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      {motes.map((m, i) => (
        <span
          key={i}
          style={
            {
              position: "absolute",
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              borderRadius: "50%",
              background: "rgba(255, 220, 170, 0.85)",
              boxShadow: `0 0 ${m.size * 4}px rgba(255, 200, 140, 0.6)`,
              animation: `moteFloat ${m.duration}s ease-in-out ${m.delay}s infinite`,
              "--moteDrift": `${m.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ───────────────────────── WOOD FLOOR ───────────────────────── */

export function WoodFloor({
  variant = "dusk",
}: {
  variant?: PaletteKey;
}) {
  const p = PALETTE[variant];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        bottom: "-8%",
        transform: "translateX(-50%)",
        width: "150%",
        height: "55%",
        zIndex: 2,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50% / 24%",
          background:
            `radial-gradient(ellipse at 50% 30%, ${p.floorCenter} 0%, ${p.floorMid} 32%, ${p.floorEdge} 95%)`,
          boxShadow: "inset 0 -40px 80px rgba(20, 8, 24, 0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50% / 24%",
          background:
            "repeating-conic-gradient(from 0deg at 50% 28%, transparent 0deg, rgba(60, 30, 10, 0.06) 1deg, transparent 3deg)",
          mixBlendMode: "multiply",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

/* ───────────────────────── CHARACTER PORTRAIT ───────────────────────── */

export function CharacterPortrait({
  src,
  name,
  side,
  delay = 0.55,
}: {
  src: string;
  name: string;
  side: "left" | "right";
  delay?: number;
}) {
  const isLeft = side === "left";
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ ...SPRING.bouncy, delay }}
      style={{
        position: "absolute",
        bottom: 22,
        left: isLeft ? 22 : undefined,
        right: isLeft ? undefined : 22,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        zIndex: 7,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: "50%",
          overflow: "hidden",
          background: "#fde2b5",
          boxShadow: SHADOW.portraitRing,
          animation: "portraitBob 3.4s ease-in-out infinite",
        }}
      >
        <div
          role="img"
          aria-label={name}
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${src})`,
            backgroundSize: "180% auto",
            backgroundPosition: "center 18%",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
      <div
        style={{
          padding: "3px 12px",
          background: "rgba(50, 20, 35, 0.7)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(255, 220, 180, 0.4)",
          borderRadius: 999,
          color: COLOR.cream,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 2.5,
        }}
      >
        {name}
      </div>
    </motion.div>
  );
}

/* ───────────────────────── SCENE TITLE ───────────────────────── */

export function SceneTitle({
  title,
  badge = "Mission Briefing",
  delay = 0.3,
}: {
  title: string;
  badge?: string | null;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: 28,
        left: 0,
        right: 0,
        textAlign: "center",
        zIndex: 8,
        pointerEvents: "none",
      }}
    >
      {badge && (
        <div
          style={{
            display: "inline-block",
            padding: "6px 20px",
            background: "rgba(255, 219, 168, 0.22)",
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: "rgba(255, 232, 195, 0.55)",
            borderRadius: 999,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: COLOR.cream,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 5,
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          ✦ {badge} ✦
        </div>
      )}
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(32px, 4.6vw, 54px)",
          fontWeight: 900,
          color: "#fff7e6",
          letterSpacing: 0.5,
          lineHeight: 1,
          whiteSpace: "nowrap",
          textShadow:
            "0 4px 18px rgba(80, 30, 10, 0.65), 0 0 36px rgba(255, 178, 110, 0.45)",
        }}
      >
        {title}
      </h1>
    </motion.div>
  );
}

/* ───────────────────────── PROGRESS DOTS ───────────────────────── */

export function ProgressDots({
  count,
  active,
}: {
  count: number;
  active: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        top: 28,
        right: 28,
        display: "flex",
        gap: 8,
        zIndex: 8,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background:
              active > i
                ? "linear-gradient(135deg, #ffe1ad, #ff9b4a)"
                : "rgba(255, 219, 168, 0.18)",
            boxShadow: active > i ? "0 0 14px rgba(255,170,90,0.7)" : "none",
            transition: "all 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── PRIMARY BUTTON ───────────────────────── */

export function PrimaryButton({
  onClick,
  children,
  visible = true,
  position = "bottom-center",
}: {
  onClick: () => void;
  children: ReactNode;
  visible?: boolean;
  position?: "bottom-center" | "bottom-right" | "static";
}) {
  const wrapStyle: React.CSSProperties =
    position === "bottom-center"
      ? {
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9,
          pointerEvents: visible ? "auto" : "none",
        }
      : position === "bottom-right"
        ? {
            position: "absolute",
            bottom: 30,
            right: 130,
            zIndex: 9,
            pointerEvents: visible ? "auto" : "none",
          }
        : {
            zIndex: 9,
            pointerEvents: visible ? "auto" : "none",
          };

  return (
    <div style={wrapStyle}>
      <motion.div
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.button
          onClick={onClick}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "16px 38px",
            fontSize: 18,
            fontWeight: 800,
            color: COLOR.goldDark,
            background: `linear-gradient(135deg, ${COLOR.goldLight}, ${COLOR.goldMid})`,
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.primaryButton,
          }}
        >
          {children}
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── VIGNETTE ───────────────────────── */

export function Vignette() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        background:
          `radial-gradient(ellipse at center, transparent 50%, ${COLOR.vignette} 100%)`,
      }}
    />
  );
}

/* ───────────────────────── SHARED KEYFRAMES ───────────────────────── */

export function SceneKeyframes() {
  return (
    <style>{`
      @keyframes sunPulse {
        0%, 100% { opacity: 0.92; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.04); }
      }
      @keyframes starTwinkle {
        0%, 100% { opacity: 0.4; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.2); }
      }
      @keyframes moteFloat {
        0% { transform: translate(0, 0); opacity: 0; }
        15% { opacity: 1; }
        85% { opacity: 1; }
        100% { transform: translate(var(--moteDrift, 0), -120px); opacity: 0; }
      }
      @keyframes pedestalGlow {
        0%, 100% { opacity: 0.85; filter: blur(2px); }
        50% { opacity: 1; filter: blur(4px); }
      }
      @keyframes beamShimmer {
        0%, 100% { opacity: 0.85; }
        50% { opacity: 1; }
      }
      @keyframes cardGlow {
        0%, 100% { opacity: 0.55; }
        50% { opacity: 0.85; }
      }
      @keyframes cardBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-4px); }
      }
      @keyframes portraitBob {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
    `}</style>
  );
}

/* ───────────────────────── RE-EXPORTS ───────────────────────── */

export { COLOR, FONT_STACK, PALETTE, SHADOW, SPRING } from "./tokens";
export type { PaletteKey } from "./tokens";
