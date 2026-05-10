"use client";

/*
 * GraduationScene - Case 17 certificate reveal.
 *
 * Triumphant golden-hour scene. Spring-mounted gold medal, ribbon
 * banner with the hero's name in script, week and date plate,
 * starburst rating, and a confetti burst. Continue / Download
 * actions sit at the bottom.
 */

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  COLOR,
  FloatingParticles,
  SHADOW,
  SPRING,
  SceneFrame,
  SceneKeyframes,
  SceneTitle,
  StarField,
  Vignette,
} from "@/app/components/scene";

export interface GraduationSceneProps {
  childName: string;
  weekNumber: number;
  weekTitle: string;
  starsCount: 1 | 2 | 3;
  totalCoins: number;
  isMilestoneWeek?: boolean;
  onContinue: () => void;
  onDownloadCertificate?: () => void;
}

export default function GraduationScene({
  childName,
  weekNumber,
  weekTitle,
  starsCount,
  totalCoins,
  isMilestoneWeek = false,
  onContinue,
  onDownloadCertificate,
}: GraduationSceneProps) {
  const today = useMemo(
    () =>
      new Date().toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  return (
    <SceneFrame>
      {/* Cosmic atmosphere - bridges the boss-flow tone (cosmic violet
          / coral / pink) into the warm-gold victory accents. Replaces
          the older Pixar Sunset/Ridges/WoodFloor layers that felt
          like a daytime tonal break after the cosmic boss arena. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 70%, #2a0d2e 0%, #1a1f4d 35%, #0f1530 70%, #04050d 100%)",
          pointerEvents: "none",
        }}
      />
      {/* Cosmic cloud blobs - top-left violet, top-right pink, bottom warm-gold horizon */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-12%",
          left: "-12%",
          width: 640,
          height: 640,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124, 92, 255, 0.32) 0%, transparent 65%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-8%",
          right: "-12%",
          width: 540,
          height: 540,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 95, 179, 0.26) 0%, transparent 65%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-15%",
          left: "20%",
          width: 720,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255, 178, 80, 0.30) 0%, transparent 65%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />
      <StarField count={45} />
      <FloatingParticles count={45} />

      <ConfettiBurst />

      <SceneTitle
        title={isMilestoneWeek ? "CERTIFIED CYBER HERO" : "WEEK COMPLETE"}
        badge={isMilestoneWeek ? "Certificate of Achievement" : "Badge Earned"}
      />

      {/* Hero medal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4, rotate: -25, y: 40 }}
        animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
        transition={{ ...SPRING.bouncy, delay: 0.4 }}
        style={{
          position: "absolute",
          left: "50%",
          top: "30%",
          transform: "translate(-50%, 0)",
          zIndex: 6,
        }}
      >
        <Medal weekNumber={weekNumber} milestone={isMilestoneWeek} />
      </motion.div>

      {/* Ribbon with hero name */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING.gentle, delay: 0.85 }}
        style={{
          position: "absolute",
          left: "50%",
          top: "62%",
          transform: "translate(-50%, 0)",
          zIndex: 6,
          textAlign: "center",
        }}
      >
        <Ribbon name={childName} />
        <div
          style={{
            marginTop: 14,
            color: COLOR.cream,
            fontSize: 14,
            letterSpacing: 1,
            opacity: 0.9,
          }}
        >
          Week {weekNumber}: {weekTitle}
        </div>
        <div
          style={{
            marginTop: 4,
            color: "#ffd58a",
            fontSize: 12,
            letterSpacing: 2,
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            opacity: 0.85,
          }}
        >
          {today}
        </div>
        <Stars count={starsCount} />
      </motion.div>

      {/* Coin chip top-right */}
      <motion.div
        initial={{ opacity: 0, x: 30, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ ...SPRING.bouncy, delay: 1.0 }}
        style={{
          position: "absolute",
          top: 28,
          right: 28,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 16px",
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.22), rgba(251,191,36,0.22))",
          borderStyle: "solid",
          borderWidth: 1,
          borderColor: "rgba(245,158,11,0.55)",
          borderRadius: 14,
          boxShadow: "0 0 20px rgba(245,158,11,0.35)",
          zIndex: 8,
        }}
      >
        <span style={{ fontSize: 24 }}>🪙</span>
        <div style={{ textAlign: "left" }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              color: "#fcd34d",
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            }}
          >
            TOTAL COINS
          </div>
          <div style={{ color: "#fef3c7", fontWeight: 900, fontSize: 18 }}>
            {totalCoins}
          </div>
        </div>
      </motion.div>

      {/* Action buttons - Continue centered, Download to the right when milestone */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ ...SPRING.bouncy, delay: 1.1 }}
        style={{
          position: "absolute",
          bottom: 36,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9,
        }}
      >
        <motion.button
          onClick={onContinue}
          whileHover={{ y: -3, scale: 1.04, boxShadow: "0 0 32px rgba(0, 229, 255, 0.85), 0 14px 28px -6px rgba(0, 229, 255, 0.55), 0 0 0 1px rgba(125, 240, 255, 0.7) inset" }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "16px 38px",
            fontSize: 18,
            fontWeight: 800,
            color: "#080a16",
            background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
            borderRadius: 999,
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: 1,
            textTransform: "uppercase",
            boxShadow: "0 0 24px rgba(0, 229, 255, 0.55), 0 8px 20px -6px rgba(0, 229, 255, 0.45), 0 0 0 1px rgba(125, 240, 255, 0.6) inset",
          }}
        >
          Continue →
        </motion.button>
      </motion.div>
      {isMilestoneWeek && onDownloadCertificate && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING.gentle, delay: 1.3 }}
          style={{
            position: "absolute",
            bottom: 36,
            right: 130,
            zIndex: 9,
          }}
        >
          <button
            onClick={onDownloadCertificate}
            style={{
              border: "none",
              cursor: "pointer",
              padding: "14px 24px",
              fontSize: 14,
              fontWeight: 800,
              color: COLOR.cream,
              background: "rgba(50, 20, 35, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: 999,
              fontFamily: "inherit",
              letterSpacing: 0.5,
              boxShadow: SHADOW.drop,
            }}
          >
            Download Certificate ↓
          </button>
        </motion.div>
      )}

      <Vignette />
      <SceneKeyframes />
      <style>{`
        @keyframes medalShine {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0.7; }
        }
        @keyframes starPop {
          0% { opacity: 0; transform: scale(0) rotate(-180deg); }
          70% { opacity: 1; transform: scale(1.25) rotate(10deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }
      `}</style>
    </SceneFrame>
  );
}

/* ───────────────────────── MEDAL ───────────────────────── */

function Medal({
  weekNumber,
  milestone,
}: {
  weekNumber: number;
  milestone: boolean;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: 168,
        height: 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Ribbon top */}
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "32px solid transparent",
          borderRight: "32px solid transparent",
          borderTop: "64px solid #c43c3c",
          marginLeft: -22,
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%) rotate(-14deg)",
          transformOrigin: "top center",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
        }}
      />
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: "32px solid transparent",
          borderRight: "32px solid transparent",
          borderTop: "64px solid #ec4444",
          marginLeft: 22,
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%) rotate(14deg)",
          transformOrigin: "top center",
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
        }}
      />
      {/* Medal disc */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: "50%",
          transform: "translateX(-50%)",
          width: 152,
          height: 152,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 28%, #fff5cc 0%, #ffd158 35%, #d48a18 80%, #8b4a08 100%)",
          boxShadow:
            "0 18px 40px -8px rgba(80, 30, 5, 0.7), inset 0 0 0 6px rgba(255, 245, 200, 0.45), inset 0 -8px 14px rgba(120, 60, 0, 0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
          animation: "medalShine 4s ease-in-out infinite",
        }}
      >
        {/* Inner notched bezel */}
        <div
          style={{
            position: "absolute",
            inset: 16,
            borderRadius: "50%",
            borderStyle: "solid",
            borderWidth: 2,
            borderColor: "rgba(140, 70, 5, 0.45)",
            background:
              "radial-gradient(circle at 32% 28%, #fff0c2 0%, #ffd158 50%, #c87a18 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: 3,
              fontWeight: 800,
              color: "#7a3a08",
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            }}
          >
            WEEK
          </div>
          <div
            style={{
              fontSize: 56,
              lineHeight: 1,
              fontWeight: 900,
              color: "#5a2a05",
              textShadow: "0 2px 0 rgba(255,240,180,0.5)",
            }}
          >
            {weekNumber}
          </div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              fontWeight: 800,
              color: "#7a3a08",
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              marginTop: 2,
            }}
          >
            {milestone ? "MILESTONE" : "HERO"}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── RIBBON ───────────────────────── */

function Ribbon({ name }: { name: string }) {
  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        padding: "10px 56px",
        background:
          "linear-gradient(180deg, #c43c3c 0%, #a32828 50%, #7a1818 100%)",
        color: "#fff5d4",
        fontFamily: "'Caveat', 'Comic Sans MS', cursive",
        fontSize: 36,
        fontWeight: 700,
        letterSpacing: 1,
        textShadow: "0 2px 4px rgba(0,0,0,0.4)",
        boxShadow: "0 14px 28px -8px rgba(60, 10, 10, 0.65)",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: -18,
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: "26px solid transparent",
          borderBottom: "26px solid transparent",
          borderRight: "20px solid #7a1818",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: -18,
          top: "50%",
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: "26px solid transparent",
          borderBottom: "26px solid transparent",
          borderLeft: "20px solid #7a1818",
        }}
      />
      {name}
    </div>
  );
}

/* ───────────────────────── STARS ───────────────────────── */

function Stars({ count }: { count: 1 | 2 | 3 }) {
  return (
    <div
      style={{
        marginTop: 12,
        display: "flex",
        gap: 8,
        justifyContent: "center",
      }}
    >
      {[0, 1, 2].map((i) => {
        const earned = i < count;
        return (
          <span
            key={i}
            style={{
              fontSize: 32,
              opacity: earned ? 1 : 0.25,
              filter: earned
                ? "drop-shadow(0 0 14px rgba(255, 200, 100, 0.65))"
                : "grayscale(0.7)",
              animation: earned
                ? `starPop 0.5s ${1.0 + i * 0.18}s cubic-bezier(.4,1.6,.4,1) backwards`
                : undefined,
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

/* ───────────────────────── CONFETTI ───────────────────────── */

function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: (i * 17 + 5) % 100,
        delay: (i * 0.07) % 4,
        duration: 4 + ((i * 5) % 6),
        rotate: (i * 23) % 360,
        size: 6 + ((i * 3) % 8),
        color: ["#ff9b4a", "#ffd58a", "#ec4444", "#a78bfa", "#22d3ee", "#fcd34d"][
          i % 6
        ],
      })),
    []
  );
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 0.5,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confettiFall ${p.duration}s linear ${p.delay}s infinite`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}
