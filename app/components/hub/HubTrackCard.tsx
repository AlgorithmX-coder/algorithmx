"use client";

/**
 * HubTrackCard — one track tile on the redesigned /hub dashboard.
 *
 * Every card is the SAME SIZE (the grid stretches them and a shared
 * minHeight equalises them), regardless of whether it's the live track
 * or a coming-soon one — the bottom action block is pinned with a flex
 * spacer so headers/taglines/pills align across the row.
 *
 * Variants:
 *   - live + owned   → ACTIVE badge, progress block (rank + %), gradient
 *                      "Enter" CTA → dashboard, "View course" link.
 *   - live + unowned → ACTIVE badge, outline "Get started" CTA → purchase,
 *                      "View course" link (no progress block yet).
 *   - coming         → COMING SOON badge, "we're building this" caption,
 *                      inline waitlist button, "View course" link.
 *
 * Client component: hover lift, the rotating conic halo on the live card,
 * the on-mount progress-bar fill, and the inline WaitlistMiniButton all
 * need state/motion. The server passes plain precomputed props.
 */

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CYBER_PALETTE,
  CYBER_GRAD,
  CYBER_SHADOW,
} from "@/app/components/scene/cyberTokens";
import {
  CyberIcon,
  type CyberIconName,
  type CyberIconAccent,
} from "@/app/components/CyberIcon";
import WaitlistMiniButton from "@/app/components/hub/WaitlistMiniButton";

const C = CYBER_PALETTE;
const FONT_DISPLAY = "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif";
const FONT_BODY = "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif";
const FONT_MONO = "ui-monospace, 'JetBrains Mono', Menlo, monospace";

export interface HubTrackCardProps {
  slug: string;
  name: string;
  tagline: string;
  iconName: CyberIconName;
  accent: CyberIconAccent;
  accentHex: string;
  /** Scene-art banner path (the SAME source as the /cybersecurity track
   *  card); replaces the flat CyberIcon emblem when set. */
  illustration?: string;
  /** Per-track focal crop for the scene banner (background-position). */
  scenePosition?: string;
  ageRange: string;
  duration: string;
  weeksCount: number;
  status: "ACTIVE" | "COMING_SOON";
  owned: boolean;
  landingHref: string | null;
  /** Primary CTA for the live track (dashboard when owned, purchase otherwise). */
  enterHref: string;
  enterLabel: string;
  /** Owned-only: overall completion 0–100 and a rank label ("Level 4 · Defender"). */
  progressPct?: number | null;
  rankLabel?: string | null;
  index: number;
}

function MetaPill({ label, accent }: { label: string; accent: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 0.3,
        fontFamily: FONT_MONO,
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

export default function HubTrackCard({
  slug,
  name,
  tagline,
  iconName,
  accent,
  accentHex,
  illustration,
  scenePosition,
  ageRange,
  duration,
  weeksCount,
  status,
  owned,
  landingHref,
  enterHref,
  enterLabel,
  progressPct,
  rankLabel,
  index,
}: HubTrackCardProps) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [viewHover, setViewHover] = useState(false);
  const [barFill, setBarFill] = useState(0);

  const isLive = status === "ACTIVE";
  const isComing = status === "COMING_SOON";
  const showProgress = isLive && owned && typeof progressPct === "number";

  useEffect(() => {
    if (!showProgress) return;
    // setTimeout (even at 0ms) defers the state update out of the effect
    // body so it animates from 0 without a synchronous cascading render.
    const delay = reduced ? 0 : 220 + index * 80;
    const t = setTimeout(() => setBarFill(progressPct ?? 0), delay);
    return () => clearTimeout(t);
  }, [showProgress, progressPct, reduced, index]);

  // Scene-banner cards use a solid navy so the banner's vertical fade
  // melts seamlessly into the card body — a translucent gradient would
  // show a seam under the opaque scene art.
  const surface = illustration
    ? "#111a3e"
    : isComing
    ? "linear-gradient(180deg, rgba(30, 36, 70, 0.5) 0%, rgba(12, 16, 36, 0.66) 100%)"
    : CYBER_GRAD.card;

  const border = isLive
    ? `1.5px solid ${accentHex}`
    : "1px solid rgba(125, 240, 255, 0.10)";

  const shadow = isLive
    ? `0 18px 44px -14px rgba(0,0,0,0.7), 0 0 30px -4px ${accentHex}44, 0 0 0 1px ${accentHex}33 inset`
    : "0 10px 26px -12px rgba(0,0,0,0.6)";

  const enterIsGradient = isLive && owned;

  return (
    <motion.article
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: 0.1 + index * 0.07,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: "24px 22px 22px",
        borderRadius: 22,
        background: surface,
        border,
        boxShadow:
          hover && !reduced
            ? `${shadow}, 0 26px 60px -18px rgba(0,0,0,0.7)`
            : shadow,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        opacity: isComing ? 0.92 : 1,
        minHeight: 380,
        overflow: "hidden",
        transform: hover && !reduced ? "translateY(-5px)" : "translateY(0)",
        transition:
          "transform 280ms cubic-bezier(0.16,1,0.3,1), box-shadow 280ms ease",
      }}
    >
      {/* Rotating conic halo — only on the live track, for the glowing
          border the mockup gives the active card. */}
      {isLive && !reduced && (
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
            opacity: 0.5,
            pointerEvents: "none",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 24, ease: "linear", repeat: Infinity }}
        />
      )}

      {/* Status badge */}
      <span
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 2,
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: 800,
          fontFamily: FONT_MONO,
          padding: "4px 10px",
          borderRadius: 999,
          color: isLive ? C.abyss : C.textSoft,
          background: isLive ? CYBER_GRAD.hero : "rgba(8,10,22,0.6)",
          border: isLive ? "none" : `1px solid ${C.textMuted}55`,
        }}
      >
        {isLive ? "ACTIVE" : "COMING SOON"}
      </span>

      {/* Scene-art banner — the SAME art as the /cybersecurity track card,
          brought onto the hub so the two surfaces read as one family. It
          bleeds to the card edges as a cover image, cropped to a per-track
          focal point, and melts into the solid card navy through a
          vertical fade (the status badge sits over its top-right). */}
      {illustration ? (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            margin: "-24px -22px 0",
            height: 152,
            overflow: "hidden",
          }}
        >
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${illustration})`,
              backgroundSize: "cover",
              backgroundPosition: scenePosition ?? "center",
              filter: "saturate(1.06)",
            }}
          />
          {/* soft vignette + fade to the solid card navy (#111a3e) so the
              banner has no hard bottom edge and the seam disappears */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(130% 100% at 34% 16%, transparent 50%, rgba(8,10,22,0.42) 100%), " +
                "linear-gradient(180deg, rgba(17,26,62,0) 40%, rgba(17,26,62,0.62) 74%, #111a3e 100%)",
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "relative",
            zIndex: 1,
            width: 64,
            height: 64,
            borderRadius: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `radial-gradient(circle at 50% 40%, ${accentHex}22, rgba(8,10,22,0.35) 70%)`,
            border: `1px solid ${accentHex}33`,
            marginBottom: 2,
          }}
        >
          <CyberIcon name={iconName} size={36} accent={accent} glow pulse={isLive} />
        </div>
      )}

      {/* Name */}
      <h3
        style={{
          position: "relative",
          zIndex: 1,
          margin: 0,
          fontFamily: FONT_DISPLAY,
          fontSize: 21,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
          color: C.textBright,
          textShadow: isLive ? `0 0 18px ${accentHex}55` : "0 1px 8px rgba(8,10,22,0.6)",
        }}
      >
        {name}
      </h3>

      {/* Tagline */}
      <p
        style={{
          position: "relative",
          zIndex: 1,
          margin: 0,
          fontFamily: FONT_BODY,
          fontSize: 14,
          lineHeight: 1.55,
          fontWeight: 500,
          color: C.textSoft,
        }}
      >
        {tagline}
      </p>

      {/* Meta pills */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <MetaPill label={`Ages ${ageRange}`} accent={C.cyan} />
        <MetaPill label={duration} accent={C.cosmicSoft} />
        {weeksCount > 0 && <MetaPill label={`${weeksCount} weeks`} accent={C.lime} />}
      </div>

      {/* Spacer pushes the action block to the bottom so all cards align. */}
      <div style={{ flexGrow: 1, minHeight: 8 }} />

      {/* ── Bottom action block ── */}
      {isComing ? (
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(8,10,22,0.4)",
              border: "1px dashed rgba(125, 240, 255, 0.16)",
              color: C.textSoft,
              fontFamily: FONT_BODY,
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            <CyberIcon name="lock" size={16} accent="cosmic" glow={false} />
            We&apos;re building this track now.
          </div>
          <WaitlistMiniButton productSlug={slug} />
          {landingHref && (
            <ViewCourseLink
              href={landingHref}
              hover={viewHover}
              setHover={setViewHover}
              reduced={!!reduced}
              accent={C.cyanSoft}
            />
          )}
        </div>
      ) : (
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {showProgress && (
            <div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", color: C.cyanSoft, marginBottom: 9 }}>
                Your Adventure Path
              </div>
              {/* Node trail: earned rank ★ → locked steps → treasure chest. */}
              <div style={{ display: "flex", alignItems: "center", marginBottom: 11 }}>
                {ADVENTURE_NODES.map((kind, i) => (
                  <Fragment key={i}>
                    <PathNode kind={kind} cyan={C.cyan} />
                    {i < ADVENTURE_NODES.length - 1 && (
                      <span aria-hidden style={{ flex: 1, height: 0, borderTop: `2px dotted ${C.cyan}55`, margin: "0 3px" }} />
                    )}
                  </Fragment>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: C.cyanSoft }}>
                  {rankLabel ?? "Cyber Rookie"}
                </span>
                <span style={{ fontFamily: FONT_DISPLAY, fontSize: 12.5, fontWeight: 700, color: C.textSoft }}>
                  {progressPct}% Complete
                </span>
              </div>
              <div style={{ width: "100%", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ width: `${barFill}%`, height: "100%", borderRadius: 999, background: CYBER_GRAD.hero, boxShadow: `0 0 14px ${accentHex}88`, transition: reduced ? "none" : "width 1.1s cubic-bezier(0.34,1.56,0.64,1)" }} />
              </div>
            </div>
          )}

          <Link
            href={enterHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 18px",
              borderRadius: 12,
              background: enterIsGradient ? CYBER_GRAD.hero : "rgba(8,10,22,0.55)",
              color: enterIsGradient ? C.abyss : C.cyan,
              border: enterIsGradient ? "none" : `1px solid ${C.cyan}88`,
              boxShadow:
                enterIsGradient && hover && !reduced ? CYBER_SHADOW.buttonGlow : "none",
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: "0.01em",
              textDecoration: "none",
              transform: hover && !reduced ? "translateY(-1px)" : "none",
              transition: "transform 180ms ease, box-shadow 220ms ease",
            }}
          >
            {enterLabel}
            <CyberIcon name="chevron" size={16} accent="cyan" glow={false} />
          </Link>

          {landingHref && (
            <ViewCourseLink
              href={landingHref}
              hover={viewHover}
              setHover={setViewHover}
              reduced={!!reduced}
              accent={C.cyan}
            />
          )}
        </div>
      )}
    </motion.article>
  );
}

function ViewCourseLink({
  href,
  hover,
  setHover,
  reduced,
  accent,
}: {
  href: string;
  hover: boolean;
  setHover: (v: boolean) => void;
  reduced: boolean;
  accent: string;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "12px 14px",
        borderRadius: 10,
        background: hover ? `${accent}14` : "transparent",
        color: accent,
        border: `1px solid ${accent}33`,
        fontFamily: FONT_BODY,
        fontWeight: 700,
        fontSize: 12.5,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        textDecoration: "none",
        transition: "background 180ms ease, border-color 180ms ease, transform 180ms ease",
        transform: hover && !reduced ? "translateY(-1px)" : "none",
      }}
    >
      Explore Course
      <span aria-hidden style={{ transform: hover && !reduced ? "translateX(2px)" : "none", transition: "transform 180ms ease" }}>→</span>
    </Link>
  );
}

/** The active card's "Adventure Path" node trail: earned ★ → locked → chest. */
const ADVENTURE_NODES = ["star", "dot", "lock", "lock", "chest"] as const;

function LockGlyph() {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10.5" width="14" height="9" rx="2" stroke="rgba(125,240,255,0.55)" strokeWidth="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="rgba(125,240,255,0.55)" strokeWidth="2" />
    </svg>
  );
}

function PathNode({ kind, cyan }: { kind: string; cyan: string }) {
  if (kind === "chest") {
    return (
      <span style={{ flexShrink: 0, width: 34, height: 34, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/hub/chest.png" alt="" width={34} height={34} style={{ width: 34, height: 34, objectFit: "contain", filter: "drop-shadow(0 0 7px rgba(253,224,71,0.65))" }} />
      </span>
    );
  }
  const earned = kind === "star";
  return (
    <span
      style={{
        flexShrink: 0,
        width: 28,
        height: 28,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: earned ? "radial-gradient(circle at 40% 32%, #fff0bf, #fbbf24 58%, #b8862a)" : "rgba(8,10,22,0.7)",
        border: earned ? "1.5px solid #fff3c4" : `1.5px solid ${cyan}33`,
        boxShadow: earned ? "0 0 12px rgba(253,224,71,0.6)" : "none",
      }}
    >
      {kind === "star" && <span style={{ fontSize: 14, lineHeight: 1, color: "#7a4d00" }}>★</span>}
      {kind === "lock" && <LockGlyph />}
    </span>
  );
}
