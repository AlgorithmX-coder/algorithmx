"use client";

/*
 * MissionBriefScene — Pixar 2.5D storybook briefing.
 *
 * Pure HTML/CSS/SVG + framer-motion. No WebGL, no R3F, no three.js.
 * The "3D feel" comes from layered depth: parallax sky, painted ridges,
 * stacked-CSS pedestal with beam, perspective-tilted mission cards,
 * and floating dust motes. Bulletproof rendering — no GPU contention,
 * no context loss, deterministic layout.
 *
 * Contract preserved with parent LessonPlayer Case 1:
 *   - phase: 0..3, mission cards reveal sequentially
 *   - onAccept(): fires when user taps "Accept Mission"
 *   - missions: length 3, see Mission type below
 */

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

/* ───────────────────────── PUBLIC API ───────────────────────── */

export type Mission = {
  icon: string;
  text: string;
  colour: string;
  glow: string;
};

export interface MissionBriefSceneProps {
  phase: number;
  onAccept: () => void;
  missions: Mission[];
  title?: string;
  subtitle?: string;
}

export default function MissionBriefScene({
  phase,
  onAccept,
  missions,
  title = "YOUR MISSION",
}: MissionBriefSceneProps) {
  // Subtle mouse-parallax for storybook depth
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

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(82vh, 760px)",
        borderRadius: 28,
        overflow: "hidden",
        background: "#1a0d1f",
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <SkyBackdrop px={px} />
      <DistantRidges px={px} />
      <StarField />
      <FloatingParticles />
      <WoodFloor />
      <HoloPedestal />
      <BeamRays />

      <MissionCardsRow missions={missions} phase={phase} />

      <CharacterPortrait src="/characters/adam.png" name="ADAM" side="left" />
      <CharacterPortrait src="/characters/layla.png" name="LAYLA" side="right" />

      <TitlePlate title={title} />
      <ProgressDots phase={phase} />
      <AcceptButton phase={phase} onAccept={onAccept} />

      <Vignette />
      <KeyframeStyles />
    </div>
  );
}

/* ───────────────────────── SKY BACKDROP ───────────────────────── */

function SkyBackdrop({ px }: { px: { x: number; y: number } }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: -20,
        zIndex: 0,
        background:
          "linear-gradient(180deg, " +
          "#1f0f2e 0%, " +
          "#3a1a4a 25%, " +
          "#a04a4a 55%, " +
          "#e88550 78%, " +
          "#f9c27a 92%, " +
          "#fde2b5 100%)",
        transform: `translate(${px.x * -4}px, ${px.y * -2}px)`,
        transition: "transform 0.5s ease-out",
      }}
    >
      {/* Sun glow — top right */}
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
    </div>
  );
}

/* ───────────────────────── DISTANT RIDGES ───────────────────────── */

function DistantRidges({ px }: { px: { x: number; y: number } }) {
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
        transform: `translateX(${px.x * -8}px)`,
        transition: "transform 0.5s ease-out",
      }}
    >
      <svg
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {/* Far ridge */}
        <path
          d="M0,240 L0,160 Q60,140 120,150 Q200,120 280,140 Q360,110 460,135 Q540,105 640,130 Q740,100 840,125 Q940,95 1040,115 Q1130,135 1200,120 L1200,240 Z"
          fill="#3a1a3e"
          opacity="0.65"
        />
        {/* Mid ridge */}
        <path
          d="M0,240 L0,180 Q90,150 180,170 Q280,135 380,165 Q480,145 580,170 Q680,140 780,165 Q880,145 980,170 Q1090,150 1200,165 L1200,240 Z"
          fill="#5a2540"
          opacity="0.75"
        />
        {/* Near ridge */}
        <path
          d="M0,240 L0,205 Q120,180 240,195 Q360,170 480,195 Q600,175 720,200 Q840,180 960,205 Q1080,185 1200,205 L1200,240 Z"
          fill="#2a1230"
          opacity="0.9"
        />
      </svg>
    </div>
  );
}

/* ───────────────────────── STAR FIELD ───────────────────────── */

function StarField() {
  // Stable positions via memo (not random per render)
  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        left: (i * 37 + 13) % 100,
        top: ((i * 19 + 7) % 35),
        size: 1 + ((i * 11) % 3) * 0.5,
        opacity: 0.4 + ((i * 7) % 5) / 10,
        delay: (i * 0.13) % 4,
      })),
    []
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

function FloatingParticles() {
  const motes = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: (i * 41 + 17) % 100,
        top: 30 + ((i * 23) % 60),
        size: 2 + ((i * 7) % 4),
        duration: 8 + ((i * 5) % 8),
        delay: (i * 0.43) % 8,
        drift: ((i * 13) % 30) - 15,
      })),
    []
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
          style={{
            position: "absolute",
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            borderRadius: "50%",
            background: "rgba(255, 220, 170, 0.85)",
            boxShadow: `0 0 ${m.size * 4}px rgba(255, 200, 140, 0.6)`,
            animation: `moteFloat ${m.duration}s ease-in-out ${m.delay}s infinite`,
            ["--moteDrift" as string]: `${m.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── WOODEN FLOOR ───────────────────────── */

function WoodFloor() {
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
      {/* Ground plane gradient (foreshortened circle via radial gradient) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50% / 24%",
          background:
            "radial-gradient(ellipse at 50% 30%, " +
            "#fdd9a5 0%, " +
            "#d68a4c 32%, " +
            "#8b4a22 60%, " +
            "#3a1a08 95%)",
          boxShadow: "inset 0 -40px 80px rgba(20, 8, 24, 0.5)",
        }}
      />
      {/* Floor grain — very subtle radial streaks via repeating gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50% / 24%",
          background:
            "repeating-conic-gradient(from 0deg at 50% 28%, " +
            "transparent 0deg, " +
            "rgba(60, 30, 10, 0.06) 1deg, " +
            "transparent 3deg)",
          mixBlendMode: "multiply",
          opacity: 0.7,
        }}
      />
    </div>
  );
}

/* ───────────────────────── HOLO PEDESTAL ───────────────────────── */

function HoloPedestal() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        bottom: "8%",
        transform: "translateX(-50%)",
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      {/* Drop shadow on floor */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: -12,
          transform: "translateX(-50%)",
          width: 280,
          height: 30,
          borderRadius: "50%",
          background: "rgba(20, 8, 24, 0.55)",
          filter: "blur(18px)",
        }}
      />
      {/* Outer flange (chamfer feel) */}
      <div
        style={{
          position: "relative",
          width: 280,
          height: 32,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 35%, #6b3818 0%, #3a1c0a 100%)",
          boxShadow:
            "0 6px 14px rgba(15, 6, 12, 0.55), inset 0 -3px 6px rgba(0,0,0,0.4)",
        }}
      />
      {/* Cylinder body */}
      <div
        style={{
          position: "relative",
          marginTop: -14,
          marginLeft: 18,
          width: 244,
          height: 56,
          background:
            "linear-gradient(90deg, #5a2e14 0%, #8b4a22 25%, #b06432 50%, #8b4a22 75%, #5a2e14 100%)",
          borderRadius: "8px / 4px",
          boxShadow: "inset 0 -8px 14px rgba(0,0,0,0.45)",
        }}
      />
      {/* Top inset disc */}
      <div
        style={{
          position: "relative",
          marginTop: -12,
          marginLeft: 22,
          width: 236,
          height: 28,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 35%, #5b2e14 0%, #3a1a08 100%)",
          boxShadow:
            "inset 0 4px 10px rgba(0,0,0,0.55), 0 -2px 0 rgba(255,210,160,0.15)",
        }}
      />
      {/* Glowing emissive top — pulses */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 56,
          transform: "translateX(-50%)",
          width: 200,
          height: 22,
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse at 50% 50%, #fff5cc 0%, #ffc97a 35%, #ff9b4a 70%, transparent 100%)",
          filter: "blur(2px)",
          animation: "pedestalGlow 2.4s ease-in-out infinite",
        }}
      />
      {/* Ring rim */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 60,
          transform: "translateX(-50%)",
          width: 220,
          height: 18,
          borderRadius: "50%",
          border: "2px solid rgba(255, 200, 130, 0.7)",
          boxShadow:
            "0 0 20px rgba(255, 180, 100, 0.5), inset 0 0 10px rgba(255, 200, 130, 0.3)",
        }}
      />
    </div>
  );
}

/* ───────────────────────── BEAM RAYS ───────────────────────── */

function BeamRays() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        left: "50%",
        bottom: "13%",
        transform: "translateX(-50%)",
        width: 400,
        height: "60%",
        zIndex: 3,
        pointerEvents: "none",
        clipPath: "polygon(38% 0%, 62% 0%, 88% 100%, 12% 100%)",
        background:
          "linear-gradient(to top, " +
          "rgba(255, 200, 130, 0) 0%, " +
          "rgba(255, 220, 160, 0.4) 35%, " +
          "rgba(255, 240, 200, 0.7) 75%, " +
          "rgba(255, 250, 220, 0.92) 100%)",
        mixBlendMode: "screen",
        animation: "beamShimmer 3.6s ease-in-out infinite",
      }}
    />
  );
}

/* ───────────────────────── MISSION CARDS ───────────────────────── */

function MissionCardsRow({
  missions,
  phase,
}: {
  missions: Mission[];
  phase: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: "38%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 22,
        zIndex: 6,
        pointerEvents: "none",
        perspective: "1200px",
      }}
    >
      {missions.map((m, i) => (
        <MissionCard
          key={i}
          mission={m}
          index={i}
          visible={phase > i}
          isMiddle={i === Math.floor((missions.length - 1) / 2)}
        />
      ))}
    </div>
  );
}

function MissionCard({
  mission,
  index,
  visible,
  isMiddle,
}: {
  mission: Mission;
  index: number;
  visible: boolean;
  isMiddle: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.6, rotateX: 30 }}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1, rotateX: 0 }
          : { opacity: 0, y: 50, scale: 0.6, rotateX: 30 }
      }
      transition={{
        type: "spring",
        stiffness: 220,
        damping: 22,
        delay: visible ? index * 0.08 : 0,
      }}
      style={{
        position: "relative",
        width: 196,
        height: 154,
        transformStyle: "preserve-3d",
        transform: isMiddle ? "translateY(-18px) scale(1.08)" : undefined,
      }}
    >
      {/* Outer glow halo */}
      <div
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: 28,
          background: `radial-gradient(ellipse at 50% 50%, ${mission.glow} 0%, transparent 70%)`,
          filter: "blur(8px)",
          opacity: 0.7,
          animation: `cardGlow 3.${index}s ease-in-out infinite`,
        }}
      />
      {/* Card body */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 18,
          background:
            "linear-gradient(180deg, #fffaf0 0%, #fdf0db 100%)",
          boxShadow:
            `0 18px 40px -12px rgba(40, 18, 8, 0.55), ` +
            `0 0 0 1px ${mission.colour}55 inset, ` +
            `0 -3px 0 ${mission.colour}33 inset, ` +
            `0 0 30px ${mission.glow}`,
          overflow: "hidden",
          animation: `cardBob 4.${index}s ease-in-out infinite`,
        }}
      >
        {/* Top accent stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: `linear-gradient(90deg, ${mission.colour}aa, ${mission.colour}, ${mission.colour}aa)`,
          }}
        />
        {/* Emoji icon */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 44,
            lineHeight: 1,
            filter: `drop-shadow(0 0 18px ${mission.glow})`,
          }}
        >
          {mission.icon}
        </div>
        {/* Objective label */}
        <div
          style={{
            position: "absolute",
            top: 76,
            left: 0,
            right: 0,
            textAlign: "center",
            color: "#7a3a52",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          OBJECTIVE 0{index + 1}
        </div>
        {/* Mission text */}
        <div
          style={{
            position: "absolute",
            top: 94,
            left: 12,
            right: 12,
            textAlign: "center",
            color: "#3b2615",
            fontSize: 13,
            fontWeight: 700,
            lineHeight: 1.25,
          }}
        >
          {mission.text}
        </div>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── CHARACTER PORTRAIT ───────────────────────── */

function CharacterPortrait({
  src,
  name,
  side,
}: {
  src: string;
  name: string;
  side: "left" | "right";
}) {
  const isLeft = side === "left";
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -30 : 30, scale: 0.85 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.55 }}
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
          boxShadow:
            "0 0 0 4px rgba(255, 230, 190, 0.85), " +
            "0 0 0 6px rgba(140, 70, 30, 0.5), " +
            "0 14px 28px -8px rgba(50, 20, 5, 0.65), " +
            "0 0 24px rgba(255, 178, 110, 0.45)",
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
          border: "1px solid rgba(255, 220, 180, 0.4)",
          borderRadius: 999,
          color: "#ffe9c8",
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

/* ───────────────────────── TITLE PLATE ───────────────────────── */

function TitlePlate({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
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
      <div
        style={{
          display: "inline-block",
          padding: "6px 20px",
          background: "rgba(255, 219, 168, 0.22)",
          border: "1px solid rgba(255, 232, 195, 0.55)",
          borderRadius: 999,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          color: "#ffe9c8",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 5,
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        ✦ Mission Briefing ✦
      </div>
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

function ProgressDots({ phase }: { phase: number }) {
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
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background:
              phase > i
                ? "linear-gradient(135deg, #ffe1ad, #ff9b4a)"
                : "rgba(255, 219, 168, 0.18)",
            boxShadow: phase > i ? "0 0 14px rgba(255,170,90,0.7)" : "none",
            transition: "all 0.4s ease",
          }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── ACCEPT BUTTON ───────────────────────── */

function AcceptButton({
  phase,
  onAccept,
}: {
  phase: number;
  onAccept: () => void;
}) {
  const visible = phase >= 3;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 30,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <motion.div
        initial={false}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.button
          onClick={onAccept}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 18 }}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "16px 38px",
            fontSize: 18,
            fontWeight: 800,
            color: "#3a1a06",
            background: "linear-gradient(135deg, #ffd58a, #ff9b4a)",
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow:
              "0 18px 36px -10px rgba(255,120,40,0.7), " +
              "0 0 0 1px rgba(255,235,200,0.6) inset, " +
              "0 -3px 0 rgba(180,80,30,0.45) inset",
          }}
        >
          Accept Mission →
        </motion.button>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── VIGNETTE ───────────────────────── */

function Vignette() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 5,
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse at center, transparent 50%, rgba(20, 8, 24, 0.55) 100%)",
      }}
    />
  );
}

/* ───────────────────────── KEYFRAMES ───────────────────────── */

function KeyframeStyles() {
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
