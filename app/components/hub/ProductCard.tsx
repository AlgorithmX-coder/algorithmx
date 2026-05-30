"use client";

/**
 * Hub product card — premium tile per Product on /hub.
 *
 * Three visual variants driven by (status, owned):
 *   - owned     → hero card: chromatic halo, brighter border, "Enter →" CTA.
 *   - active    → standard card: cyan glow, "Purchase £X" CTA.
 *   - coming    → muted card: dimmed surface, "Coming soon" pill, waitlist link.
 *
 * Server passes a precomputed `ctaHref` + `ctaLabel` so this client component
 * stays focused on motion + presentation, never decides product routing.
 *
 * Honors prefers-reduced-motion: skips lift / float / entrance translate.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { CYBER_PALETTE, CYBER_GRAD, CYBER_SHADOW } from "@/app/components/scene/cyberTokens";
import WaitlistMiniButton from "./WaitlistMiniButton";

const C = CYBER_PALETTE;

export type ProductCardVariant = "owned" | "active" | "coming";

export interface ProductCardProps {
  /** Catalog slug — used by the waitlist mini-button when variant === "coming". */
  slug: string;
  name: string;
  emoji: string;
  ageRange: string;
  duration: string;
  weeksCount: number;
  /** Pence; formatted as £xx.xx for the CTA label by the server. */
  priceGBP: number;
  variant: ProductCardVariant;
  /** href for the primary CTA (Enter / Purchase). Ignored for "coming". */
  ctaHref: string;
  /** Pre-formatted label, eg "Enter →" or "Purchase £99". */
  ctaLabel: string;
  /**
   * Optional href to the product's public marketing landing page. When
   * set the card renders a stylish "View course →" secondary link
   * under the primary CTA (or under the waitlist button for the
   * `coming` variant). When null/undefined the link is omitted — used
   * to gate the link to products that actually have a landing page.
   */
  landingHref?: string | null;
  /** Entrance stagger index (0,1,2,…). */
  index?: number;
}

export default function ProductCard({
  slug,
  name,
  emoji,
  ageRange,
  duration,
  weeksCount,
  variant,
  ctaHref,
  ctaLabel,
  landingHref,
  index = 0,
}: ProductCardProps) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);

  /* ──────── variant-driven visual tokens ──────── */
  const isOwned = variant === "owned";
  const isComing = variant === "coming";

  const surface = isComing
    ? "linear-gradient(180deg, rgba(30, 36, 70, 0.55) 0%, rgba(12, 16, 36, 0.7) 100%)"
    : CYBER_GRAD.card;

  const border = isOwned
    ? `1.5px solid ${C.cyan}`
    : isComing
      ? `1px solid rgba(125, 240, 255, 0.10)`
      : `1px solid rgba(125, 240, 255, 0.22)`;

  const shadow = isOwned
    ? CYBER_SHADOW.cardHero
    : isComing
      ? "0 8px 22px -10px rgba(0, 0, 0, 0.55)"
      : CYBER_SHADOW.cardCyan;

  /* CTA appearance differs per variant. Owned gets the brand gradient, active
     gets a cyan outline, coming has no CTA (waitlist sits in its own slot). */
  const ctaBg = isOwned ? CYBER_GRAD.hero : "rgba(8, 10, 22, 0.55)";
  const ctaColor = isOwned ? C.abyss : C.cyan;
  const ctaBorder = isOwned ? "none" : `1px solid ${C.cyan}88`;
  const ctaShadow = isOwned ? CYBER_SHADOW.buttonGlow : "none";

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: 0.15 + index * 0.08,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileHover={reduced || isComing ? undefined : { y: -4 }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        padding: "26px 22px 22px",
        borderRadius: 22,
        background: surface,
        border,
        boxShadow: shadow,
        backdropFilter: "blur(8px)",
        opacity: isComing ? 0.78 : 1,
        transition: "box-shadow 280ms ease, border-color 280ms ease",
        minHeight: 340,
        overflow: "hidden",
      }}
    >
      {/* Owned-card chromatic edge halo — only on the hero card so it stays
          unmistakably "the one you're in". Sits behind content via z-index. */}
      {isOwned && !reduced && (
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: -1,
            borderRadius: 22,
            padding: 1.5,
            background: CYBER_GRAD.holoConic,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: 0.55,
            pointerEvents: "none",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity }}
        />
      )}

      {/* Status pill (top-right) — only for non-default variants */}
      {(isOwned || isComing) && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            fontSize: 10,
            letterSpacing: 2,
            fontWeight: 800,
            fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            padding: "4px 10px",
            borderRadius: 999,
            color: isOwned ? C.abyss : C.textSoft,
            background: isOwned
              ? CYBER_GRAD.hero
              : "rgba(8, 10, 22, 0.6)",
            border: isOwned ? "none" : `1px solid ${C.textMuted}55`,
            zIndex: 1,
          }}
        >
          {isOwned ? "ACTIVE" : "COMING SOON"}
        </div>
      )}

      {/* Emoji — big and floaty. Subtle hover lift for active/owned. */}
      <motion.div
        animate={hover && !reduced && !isComing ? { y: -3, scale: 1.04 } : { y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        style={{
          fontSize: 64,
          lineHeight: 1,
          marginBottom: 18,
          filter: isComing
            ? "grayscale(0.4) drop-shadow(0 4px 18px rgba(0,0,0,0.45))"
            : `drop-shadow(0 8px 22px ${C.cyan}55)`,
        }}
        aria-hidden
      >
        {emoji}
      </motion.div>

      {/* Name */}
      <h2
        style={{
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          color: C.textBright,
          margin: 0,
          marginBottom: 10,
          textShadow: isOwned ? `0 0 18px ${C.cyan}66` : "0 1px 8px rgba(8,10,22,0.6)",
        }}
      >
        {name}
      </h2>

      {/* Meta row — ageRange, duration, weeks */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <MetaPill label={`Ages ${ageRange}`} accent={C.cyan} />
        <MetaPill label={duration} accent={C.cosmicSoft} />
        {weeksCount > 0 && (
          <MetaPill label={`${weeksCount} weeks`} accent={C.lime} />
        )}
      </div>

      {/* Spacer pushes the CTA to the bottom regardless of meta wrapping */}
      <div style={{ flexGrow: 1 }} />

      {/* CTA row */}
      {isComing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: C.textSoft,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            We&apos;re building this track now.
          </span>
          <WaitlistMiniButton productSlug={slug} />
          {landingHref && (
            <ViewCourseLink href={landingHref} name={name} variant={variant} />
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Link
            href={ctaHref}
            aria-label={`${ctaLabel} — ${name}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 18px",
              borderRadius: 12,
              background: ctaBg,
              color: ctaColor,
              border: ctaBorder,
              boxShadow: hover && !reduced && isOwned ? CYBER_SHADOW.buttonGlow : ctaShadow,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 15,
              letterSpacing: "0.01em",
              textDecoration: "none",
              transition: "transform 180ms ease, box-shadow 220ms ease",
              transform: hover && !reduced ? "translateY(-1px)" : "none",
              outlineOffset: 3,
            }}
          >
            {ctaLabel}
          </Link>
          {landingHref && (
            <ViewCourseLink href={landingHref} name={name} variant={variant} />
          )}
        </div>
      )}
    </motion.article>
  );
}

/**
 * "View course →" secondary link — text-style, visually subordinate
 * to the primary CTA. Accent color tracks the card variant so it
 * sits inside the card's visual language without competing with the
 * primary CTA. Honors reduced-motion (transform on hover only).
 */
function ViewCourseLink({
  href,
  name,
  variant,
}: {
  href: string;
  name: string;
  variant: ProductCardVariant;
}) {
  const reduced = useReducedMotion();
  const [linkHover, setLinkHover] = useState(false);

  // Accent: owned → cyan (matches halo), active → cyan, coming →
  // cyanSoft (lighter so it doesn't compete with the bright waitlist
  // button above it).
  const accent =
    variant === "coming" ? C.cyanSoft : variant === "owned" ? C.cyan : C.cyan;

  return (
    <Link
      href={href}
      aria-label={`View course — ${name}`}
      onMouseEnter={() => setLinkHover(true)}
      onMouseLeave={() => setLinkHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 12px",
        borderRadius: 10,
        background: linkHover ? `${accent}14` : "transparent",
        color: accent,
        border: `1px solid ${accent}33`,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: 12.5,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        textDecoration: "none",
        transition: "background 180ms ease, border-color 180ms ease, transform 180ms ease",
        transform: linkHover && !reduced ? "translateY(-1px)" : "none",
        outlineOffset: 2,
      }}
    >
      View course
      <span
        aria-hidden
        style={{
          transition: "transform 180ms ease",
          transform: linkHover && !reduced ? "translateX(2px)" : "none",
        }}
      >
        →
      </span>
    </Link>
  );
}

/* ─────────────── helpers ─────────────── */

function MetaPill({ label, accent }: { label: string; accent: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 0.4,
        fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
        color: accent,
        background: "rgba(8, 10, 22, 0.55)",
        border: `1px solid ${accent}44`,
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
