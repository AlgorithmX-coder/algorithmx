"use client";

/**
 * Gentle "next-track is around the corner" banner on /hub.
 *
 * Surfaces ONLY when a child's age is within 1 year of an unowned ACTIVE
 * product's ageMin — the server computes this and decides whether to mount
 * the banner at all. This component is presentation: motion entrance, soft
 * cosmic glow, no overlay/blocker. A non-intrusive nudge, not a modal.
 *
 * Reduced-motion: skips the entrance translate; stays opaque immediately.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { CYBER_PALETTE, CYBER_GRAD } from "@/app/components/scene/cyberTokens";

const C = CYBER_PALETTE;

export default function AgeProgressionBanner({
  childName,
  productName,
  ctaHref,
}: {
  childName: string;
  productName: string;
  ctaHref: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.aside
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      role="note"
      aria-label="Age progression suggestion"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
        padding: "16px 20px",
        borderRadius: 18,
        background:
          "linear-gradient(135deg, rgba(124, 92, 255, 0.18) 0%, rgba(0, 229, 255, 0.10) 100%)",
        border: `1px solid ${C.cosmicSoft}55`,
        boxShadow: `0 0 22px rgba(124, 92, 255, 0.22), 0 0 0 1px ${C.cosmic}22 inset`,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        aria-hidden
        style={{
          flexShrink: 0,
          width: 42,
          height: 42,
          borderRadius: 12,
          background: CYBER_GRAD.heroSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          boxShadow: `0 0 18px ${C.cosmic}55`,
        }}
      >
        ✨
      </div>

      <p
        style={{
          flex: 1,
          minWidth: 220,
          margin: 0,
          color: C.textBright,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontSize: 14.5,
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: C.cyanSoft, fontWeight: 800 }}>{childName}</strong>{" "}
        is almost ready for{" "}
        <strong style={{ color: C.textBright, fontWeight: 800 }}>{productName}</strong>.
        Take a peek →
      </p>

      <Link
        href={ctaHref}
        style={{
          flexShrink: 0,
          display: "inline-flex",
          alignItems: "center",
          padding: "8px 14px",
          borderRadius: 10,
          background: "rgba(8, 10, 22, 0.6)",
          border: `1px solid ${C.cyan}88`,
          color: C.cyan,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: "0.01em",
          textDecoration: "none",
          textShadow: `0 0 10px ${C.cyan}aa`,
        }}
      >
        See the track
      </Link>
    </motion.aside>
  );
}
