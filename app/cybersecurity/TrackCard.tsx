"use client";

/**
 * TrackCard - one card per cybersecurity track on /cybersecurity.
 *
 * Browse-not-buy: the primary CTA is "View course →" linking to the
 * track's marketing landing page (where the actual purchase lives).
 * COMING_SOON tracks render the same card but with a softer status
 * pill and the same View-course link — families can still read the
 * track page even before launch.
 *
 * Client component because the entrance animation, hover lift, and
 * optional "great fit for {name}" highlight need motion + state.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export interface TrackCardProps {
  slug: string;
  emoji: string;
  name: string;
  ageRange: string;
  duration: string;
  /** Pence; formatted by the parent as £xx. */
  priceLabel: string;
  weeksCount: number;
  status: "ACTIVE" | "COMING_SOON";
  /** One-line "what it covers" — not in DB, parent passes the right copy. */
  blurb: string;
  /** /cyberheroes etc. — guaranteed non-null on this page (every cyber
   *  track has a landing). */
  landingHref: string;
  /** Names of any signed-in user's children whose age fits this band.
   *  Empty array when none. */
  fitForChildren: string[];
  /** Accent colour the card leans into (status pill + top rule). */
  accent: string;
  /** Entrance stagger index. */
  index: number;
}

export default function TrackCard({
  emoji,
  name,
  ageRange,
  duration,
  priceLabel,
  weeksCount,
  status,
  blurb,
  landingHref,
  fitForChildren,
  accent,
  index,
}: TrackCardProps) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  const isLive = status === "ACTIVE";

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: "rgba(13,15,24,0.72)",
        backdropFilter: "blur(14px) saturate(1.4)",
        WebkitBackdropFilter: "blur(14px) saturate(1.4)",
        border: "1px solid rgba(232,237,255,0.08)",
        borderTop: `2px solid ${accent}`,
        borderRadius: 20,
        padding: "30px 28px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: hover
          ? `0 1px 3px rgba(0,0,0,0.4), 0 22px 56px ${accent}33`
          : "0 1px 3px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.28)",
        transform: hover && !reduced ? "translateY(-4px)" : "translateY(0)",
        transition:
          "transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Header row — emoji + status pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <span
          aria-hidden
          style={{
            fontSize: 36,
            lineHeight: 1,
            filter: `drop-shadow(0 0 12px ${accent}77)`,
          }}
        >
          {emoji}
        </span>
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: isLive ? "var(--lv2-ink)" : accent,
            background: isLive ? accent : "transparent",
            border: isLive ? "none" : `1px solid ${accent}66`,
            padding: isLive ? "3px 10px" : "2px 9px",
            borderRadius: 999,
            marginLeft: "auto",
          }}
        >
          {isLive ? "Live now" : "Coming soon"}
        </span>
      </div>

      {/* AGES (display prominence) + duration */}
      <div>
        <div
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(232,237,255,0.5)",
            marginBottom: 4,
          }}
        >
          // Ages
        </div>
        <div
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: "2rem",
            fontWeight: 500,
            letterSpacing: "-0.02em",
            color: accent,
            lineHeight: 1.05,
          }}
        >
          {ageRange}
        </div>
        <div
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(232,237,255,0.5)",
            marginTop: 6,
          }}
        >
          {duration}
          {weeksCount > 0 ? `  ·  ${weeksCount} weeks` : ""}
        </div>
      </div>

      {/* Track name */}
      <h3
        style={{
          fontFamily: "var(--lv2-font-display)",
          fontSize: "1.45rem",
          fontWeight: 500,
          color: "var(--lv2-paper)",
          margin: 0,
          letterSpacing: "-0.018em",
          lineHeight: 1.15,
        }}
      >
        {name}
      </h3>

      <p
        style={{
          fontFamily: "var(--lv2-font-display)",
          fontSize: 14.5,
          lineHeight: 1.55,
          color: "rgba(232,237,255,0.78)",
          margin: 0,
          flex: 1,
        }}
      >
        {blurb}
      </p>

      {/* Optional "great fit for {name}" highlight — soft, friendly,
       *  never blocks layout. Only renders when the signed-in parent
       *  has a ChildProfile whose age falls in this track's range. */}
      {fitForChildren.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: `${accent}15`,
            border: `1px solid ${accent}55`,
            borderRadius: 10,
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: accent,
          }}
        >
          <span aria-hidden>★</span>
          <span>
            Great fit for{" "}
            {fitForChildren
              .map((n) => n.split(/\s+/)[0])
              .join(", ")}
          </span>
        </div>
      )}

      {/* Price + CTA row */}
      <div
        style={{
          borderTop: "1px solid rgba(232,237,255,0.08)",
          paddingTop: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(232,237,255,0.45)",
            }}
          >
            // From
          </div>
          <div
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "1.35rem",
              fontWeight: 500,
              color: "var(--lv2-paper)",
              letterSpacing: "-0.01em",
            }}
          >
            {priceLabel}
          </div>
        </div>

        <Link
          href={landingHref}
          style={{
            background: accent,
            color: "var(--lv2-ink)",
            padding: "12px 18px",
            borderRadius: 999,
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: `0 8px 24px ${accent}55`,
          }}
        >
          View course
          <span aria-hidden>→</span>
        </Link>
      </div>
    </motion.article>
  );
}
