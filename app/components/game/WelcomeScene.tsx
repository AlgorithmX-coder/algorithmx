"use client";

/*
 * WelcomeScene - Case 0 post-video reveal.
 *
 * Cinematic incident-report moment: stormy dusk sky, polaroid-framed
 * Adam-and-Layla-hacked photo with red "TRANSMISSION INTERCEPTED" stamp,
 * raccoon glyph, and a big call to action. Sets up the week's stakes.
 *
 * Pure HTML/CSS + framer-motion. No WebGL.
 */

import { motion } from "motion/react";
import {
  FloatingParticles,
  SceneFrame,
  SceneKeyframes,
  SceneTitle,
  StarField,
  Vignette,
  COLOR,
  SHADOW,
  SPRING,
} from "@/app/components/scene";

export interface WelcomeSceneProps {
  onContinue: () => void;
  /** Title shown over the polaroid. Defaults to "WEEK 1 BEGINS". */
  title?: string;
  /** Subtitle pill above the title. Defaults to "INCIDENT REPORT". */
  badge?: string;
  /** Photo to feature inside the polaroid frame. */
  photoSrc?: string;
  /** Caption beneath the polaroid. */
  caption?: string;
  /** Continue-button label. */
  ctaLabel?: string;
}

export default function WelcomeScene({
  onContinue,
  title = "ALERT INCOMING",
  badge = "Incident Report",
  photoSrc = "/characters/adam-layla-hacked.png",
  caption = "Adam and Layla just got hacked by the Hacker Raccoon. They need YOUR help.",
  ctaLabel = "I'll Save Them →",
}: WelcomeSceneProps) {
  return (
    <SceneFrame>
      {/* Cyber backdrop - transparent layers over the lesson page's
          dark navy bg, with cyan/cosmic nebula bleeds + drifting
          particles in cyber palette. The Pixar warm scene layers are
          preserved on the marketing home; this scene runs inside the
          cyber app surface. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(15, 21, 48, 0.4) 0%, rgba(8, 10, 22, 0.7) 100%)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", left: "-15%", top: "-10%", width: "60vw", height: "70vh", background: "radial-gradient(ellipse, rgba(0, 229, 255, 0.18) 0%, rgba(0, 229, 255, 0.06) 40%, transparent 70%)", filter: "blur(48px)", pointerEvents: "none" }} />
      <div aria-hidden style={{ position: "absolute", right: "-10%", top: "30%", width: "55vw", height: "60vh", background: "radial-gradient(ellipse, rgba(124, 92, 255, 0.20) 0%, rgba(124, 92, 255, 0.06) 40%, transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
      <StarField count={60} />
      <FloatingParticles count={20} />

      {/* Lightning flash overlay - subtle, periodic */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 50% 18%, rgba(255, 220, 200, 0.18) 0%, transparent 55%)",
          mixBlendMode: "screen",
          animation: "lightningFlash 6s ease-in-out infinite",
        }}
      />

      <SceneTitle title={title} badge={badge} />

      {/* Centerpiece: polaroid + caption.
          Lifted from top:52% to top:44% so the caption + the bottom
          CTA button don't collide on shorter viewports. */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%, -50%)",
          zIndex: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <Polaroid src={photoSrc} />
        <CaptionPlaque text={caption} />
      </div>

      {/* Floating raccoon glyph in the corner - the antagonist's calling card.
          Drop-shadow was harsh red; switched to coral/pink so the antagonist
          still reads as "warning" without breaking the cyber palette. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ ...SPRING.bouncy, delay: 0.9 }}
        style={{
          position: "absolute",
          top: 120,
          right: 60,
          fontSize: 78,
          filter:
            "drop-shadow(0 0 24px rgba(255, 95, 179, 0.55)) drop-shadow(0 0 48px rgba(255, 122, 89, 0.32))",
          zIndex: 7,
          animation: "raccoonTaunt 3s ease-in-out infinite",
        }}
      >
        🦝
      </motion.div>

      {/* Cyber-styled CTA - replaces PrimaryButton (warm gold gradient)
          for the cyber app surface. Position absolute at the bottom
          centre, above the lesson page's bottom edge. */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
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
          {ctaLabel}
        </motion.button>
      </div>

      <Vignette />
      <SceneKeyframes />
      <style>{`
        @keyframes lightningFlash {
          0%, 92%, 100% { opacity: 0; }
          93%, 95% { opacity: 1; }
          94% { opacity: 0.4; }
        }
        @keyframes raccoonTaunt {
          0%, 100% { transform: translateY(0) rotate(-4deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes polaroidIn {
          from { opacity: 0; transform: rotate(-12deg) scale(0.7) translateY(40px); }
          to { opacity: 1; transform: rotate(-3deg) scale(1) translateY(0); }
        }
        @keyframes stampSlam {
          0% { opacity: 0; transform: translate(-50%, -50%) rotate(-30deg) scale(2.4); }
          70% { opacity: 1; transform: translate(-50%, -50%) rotate(-12deg) scale(0.95); }
          100% { opacity: 0.92; transform: translate(-50%, -50%) rotate(-12deg) scale(1); }
        }
      `}</style>
    </SceneFrame>
  );
}

/* ───────────────────────── POLAROID ───────────────────────── */

function Polaroid({ src }: { src: string }) {
  return (
    <div
      style={{
        position: "relative",
        padding: "14px 14px 50px",
        background: "linear-gradient(180deg, #faf3e3 0%, #f0e3c5 100%)",
        borderRadius: 6,
        boxShadow:
          "0 28px 60px -16px rgba(20, 6, 12, 0.7), 0 0 0 1px rgba(60, 30, 15, 0.3)",
        animation: "polaroidIn 0.9s 0.5s cubic-bezier(.2,.8,.2,1) backwards",
      }}
    >
      <div
        style={{
          width: "min(50vw, 380px)",
          aspectRatio: "4 / 3",
          backgroundImage: `url(${src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          borderRadius: 2,
          filter: "saturate(0.9) contrast(1.05)",
        }}
      />
      {/* Red TRANSMISSION INTERCEPTED stamp */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "44%",
          transform: "translate(-50%, -50%) rotate(-12deg)",
          padding: "8px 22px",
          borderStyle: "solid",
          borderWidth: 4,
          borderColor: "rgba(220, 40, 40, 0.85)",
          color: "rgba(220, 40, 40, 0.85)",
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          fontWeight: 900,
          fontSize: 18,
          letterSpacing: 4,
          textTransform: "uppercase",
          background: "rgba(255, 230, 220, 0.08)",
          textShadow: "0 0 8px rgba(220, 40, 40, 0.4)",
          opacity: 0,
          animation: "stampSlam 0.6s 1.2s cubic-bezier(.4, 1.6, .4, 1) forwards",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        ✕ Hacked
      </div>
      {/* Polaroid caption (handwritten feel) */}
      <div
        style={{
          marginTop: 10,
          textAlign: "center",
          fontFamily: "'Caveat', 'Comic Sans MS', cursive",
          fontSize: 22,
          color: "#3b2615",
          letterSpacing: 1,
        }}
      >
        Wk 1, Day 0 - Adam & Layla
      </div>
    </div>
  );
}

/* ───────────────────────── CAPTION PLAQUE ───────────────────────── */

function CaptionPlaque({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING.gentle, delay: 1.4 }}
      style={{
        maxWidth: 540,
        padding: "12px 22px",
        // Was warm purple-brown bg + warm cream border (Pixar leftover).
        // Now cyber-glass: deep navy translucent + cyan border, matches
        // every other plaque/banner across the cyber lesson surface.
        background: "rgba(8, 10, 22, 0.78)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "rgba(125, 240, 255, 0.45)",
        borderRadius: 16,
        color: COLOR.cream,
        fontSize: 16,
        fontWeight: 600,
        textAlign: "center",
        lineHeight: 1.4,
        boxShadow:
          "0 12px 28px -8px rgba(8, 10, 22, 0.7), 0 0 22px rgba(0, 229, 255, 0.18)",
      }}
    >
      {text}
    </motion.div>
  );
}
