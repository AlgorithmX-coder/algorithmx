"use client";

/*
 * OutroScene — Case 18 lesson outro / next-week teaser.
 *
 * Reflective sunset mood. "Adventure complete" message, optional outro
 * video framed in a Pixar plate, next-week teaser card, two action
 * CTAs (Back to Dashboard / Play Again).
 */

import { useState } from "react";
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

export interface OutroSceneProps {
  /** Hero name (e.g. childName). */
  childName?: string;
  /** Total coins earned this lesson. */
  totalCoins: number;
  /** Title of the next week's lesson, shown as a teaser card. */
  nextWeekTitle?: string;
  /** Path to the outro video. If null/missing, shows the celebrate fallback. */
  videoSrc?: string | null;
  /** Fallback image when video is unavailable. */
  fallbackImageSrc?: string;
  /** Primary action — usually navigate to dashboard. */
  onBackToDashboard: () => void;
  /** Secondary action — replay this week. */
  onPlayAgain: () => void;
}

export default function OutroScene({
  childName = "Cyber Hero",
  totalCoins,
  nextWeekTitle = "Private Info: Guard Your Secrets",
  videoSrc = "/videos/module-01-outro.mp4",
  fallbackImageSrc = "/characters/celebrating.png",
  onBackToDashboard,
  onPlayAgain,
}: OutroSceneProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <SceneFrame>
      {/* Cosmic atmosphere — same lineage as the rest of Week 1's
          cosmic-cyber theme. Replaces the older Pixar SunsetBackdrop
          / DistantRidges / WoodFloor triplet that felt like a daytime
          tonal break after the cosmic graduation scene. */}
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
      <StarField count={50} />
      <FloatingParticles count={32} />

      <SceneTitle title="ADVENTURE COMPLETE" badge={`Goodbye, ${childName}`} />

      {/* Centerpiece: video plate or celebrate fallback */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ ...SPRING.gentle, delay: 0.4 }}
        style={{
          position: "absolute",
          left: "50%",
          top: "26%",
          transform: "translateX(-50%)",
          zIndex: 6,
          width: "min(56vw, 420px)",
        }}
      >
        {videoSrc && !videoFailed ? (
          <VideoPlate src={videoSrc} onError={() => setVideoFailed(true)} />
        ) : (
          <CelebrationPlate src={fallbackImageSrc} />
        )}
      </motion.div>

      {/* Next-week teaser */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING.gentle, delay: 0.85 }}
        style={{
          position: "absolute",
          left: "50%",
          top: "70%",
          transform: "translateX(-50%)",
          zIndex: 7,
          textAlign: "center",
        }}
      >
        <NextWeekCard title={nextWeekTitle} coins={totalCoins} />
      </motion.div>

      {/* Actions — cosmic CTA matches the boss-flow style */}
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
          onClick={onBackToDashboard}
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
          Back to Dashboard 🏠
        </motion.button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING.gentle, delay: 1.1 }}
        style={{
          position: "absolute",
          bottom: 36,
          right: 130,
          zIndex: 9,
        }}
      >
        <button
          onClick={onPlayAgain}
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
          ↻ Play Again
        </button>
      </motion.div>

      <Vignette />
      <SceneKeyframes />
    </SceneFrame>
  );
}

/* ───────────────────────── VIDEO PLATE ───────────────────────── */

function VideoPlate({
  src,
  onError,
}: {
  src: string;
  onError: () => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        padding: 8,
        borderRadius: 22,
        background: "linear-gradient(135deg, #6b3818, #8b4a22)",
        boxShadow: "0 24px 50px -16px rgba(40, 18, 5, 0.7)",
      }}
    >
      <video
        controls
        playsInline
        preload="metadata"
        src={src}
        onError={onError}
        style={{
          width: "100%",
          display: "block",
          borderRadius: 14,
          background: "#000",
        }}
      />
    </div>
  );
}

/* ───────────────────────── CELEBRATION PLATE ───────────────────────── */

function CelebrationPlate({ src }: { src: string }) {
  return (
    <div
      style={{
        position: "relative",
        padding: 12,
        borderRadius: 22,
        background: "linear-gradient(135deg, #ffe4a3, #ffb058 60%, #c87a18)",
        boxShadow:
          "0 24px 50px -12px rgba(80, 40, 5, 0.6), 0 0 40px rgba(255, 178, 80, 0.35)",
      }}
    >
      <div
        style={{
          aspectRatio: "4 / 3",
          width: "100%",
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: 14,
          borderStyle: "solid",
          borderWidth: 3,
          borderColor: "rgba(255, 245, 200, 0.6)",
        }}
      />
    </div>
  );
}

/* ───────────────────────── NEXT-WEEK CARD ───────────────────────── */

function NextWeekCard({ title, coins }: { title: string; coins: number }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 18,
        padding: "12px 22px",
        background: "rgba(50, 20, 35, 0.7)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "rgba(255, 200, 160, 0.4)",
        borderRadius: 18,
        boxShadow: SHADOW.drop,
        color: COLOR.cream,
        textAlign: "left",
      }}
    >
      <div
        style={{
          fontSize: 24,
          filter: "drop-shadow(0 0 12px rgba(255, 178, 110, 0.7))",
        }}
      >
        🪙
      </div>
      <div>
        <div
          style={{
            fontSize: 10,
            letterSpacing: 2.5,
            opacity: 0.7,
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          }}
        >
          {coins} COINS · NEXT UP
        </div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
      </div>
    </div>
  );
}
