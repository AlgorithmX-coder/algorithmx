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
 * Client component because the entrance animation and hover lift
 * need motion + state.
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
  /** Accent colour the card leans into (status pill + top rule). */
  accent: string;
  /** Entrance stagger index. */
  index: number;
  /** Optional character art that replaces the emoji slot on this card.
   *  Used by the live Cyber Heroes track to signal its animated, story-
   *  led format. Passed as a public-folder path (e.g. "/characters/...").
   *  Other tracks omit this and keep the emoji as their identifier. */
  characterImage?: string;
  /** Feature tag rendered with the character art (defaults to the Heroes cast line). */
  kicker?: string;
  /** Per-track CSS filter for the art layer (dark cinematic sources need a lift). */
  imageFilter?: string;
  /** Per-track opacity override for the art layer. */
  imageOpacity?: number;
  /** Per-track background-position for the art layer. The default crop
   *  ("right 75%") was tuned for the Heroes art; bright scenes with a
   *  centred subject want their own focal point. */
  imagePosition?: string;
  /** "light" swaps the heavy diagonal scrim for a gentler one so bright,
   *  colourful sources stay visibly bright; text protection moves to the
   *  radial pool behind the copy. "split" is for art that already bakes a
   *  dark left half + bright right half (the Cyber Ops console): a fast
   *  left-to-clear diagonal that protects the text column and leaves the
   *  bright right untouched. Default keeps the original treatment. */
  scrim?: "default" | "light" | "split";
  /** Caps the width of the copy stack (kicker, ages, title, blurb) so it
   *  stays in a left column clear of scene art that lives on the right
   *  (e.g. the Cyber Ops split scene). Omit to let copy run full width. */
  contentMaxWidth?: number;
  /** Branded course-name lockup (glyph + wordmark in the course's own
   *  display font — the logo system from the track landings' navs).
   *  Rendered inside the title <h3> in place of the plain `name`; the
   *  lockup carries the course name as real text so semantics and
   *  screen-reader output are unchanged. Omit to render `name`. */
  lockup?: React.ReactNode;
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
  accent,
  index,
  characterImage,
  kicker,
  imageFilter,
  imageOpacity,
  imagePosition,
  scrim,
  contentMaxWidth,
  lockup,
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
        /* isolation creates a clean stacking context so the
         *  characterImage layer's z-index doesn't escape the card,
         *  and overflow:hidden clips it to the rounded corners.
         *  Only applied when characterImage is set so other cards'
         *  behaviour (e.g. unclipped hover shadows) is untouched. */
        isolation: characterImage ? "isolate" : undefined,
        overflow: characterImage ? "hidden" : undefined,
        /* Translucent frosted fill — more see-through + a stronger blur
         *  so the cosmic backdrop reads through the glass and the card
         *  feels seated in the scene rather than stamped on top. */
        background:
          "linear-gradient(180deg, rgba(16,19,30,0.58) 0%, rgba(10,12,20,0.46) 100%)",
        backdropFilter: "blur(22px) saturate(1.3)",
        WebkitBackdropFilter: "blur(22px) saturate(1.3)",
        /* No hard accent rule across the top (that was the "sharp" tell).
         *  Identity now comes from a soft accent halo below; the border
         *  is just a whisper to catch the edge. */
        border: "1px solid rgba(232,237,255,0.06)",
        borderRadius: 24,
        padding: "34px 30px 30px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        /* Diffuse, spread-negative shadows: a soft dark seat with no crisp
         *  edge + a gentle accent aura that melts into the space behind. */
        boxShadow: hover
          ? `0 30px 72px -28px rgba(0,0,0,0.55), 0 0 66px -12px ${accent}4d`
          : `0 22px 56px -30px rgba(0,0,0,0.5), 0 0 46px -16px ${accent}2e`,
        transform: hover && !reduced ? "translateY(-4px)" : "translateY(0)",
        transition:
          "transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Atmospheric background layer — animated-world ambience for the
       *  one track that has it. The full character image fills the card
       *  at low opacity, with a heavy diagonal dark scrim that fades
       *  from solid dark-glass on the lower-left (where the headline
       *  and blurb live) to mostly clear on the upper-right (where the
       *  scene shows through under the status pill). Reads as a glimpse
       *  into the show, not a stamped-on picture. */}
      {characterImage && (
        <>
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${characterImage})`,
              backgroundSize: "cover",
              /* Pull the focal point toward the right-lower portion
               *  of the source so Adam and Layla settle into the
               *  centre-right of the card, well away from the headline
               *  and blurb stack on the left. */
              backgroundPosition: imagePosition ?? "right 75%",
              /* Bumped 0.32 → 0.48 so the characters are recognisable
               *  without becoming the dominant visual; the scrim below
               *  picks up the readability slack. */
              opacity: imageOpacity ?? 0.48,
              filter: imageFilter,
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              /* Three layered scrims:
               *  - 110° diagonal: near-solid dark glass on the left
               *    (text zone) → almost-clear on the upper-right
               *    (where the scene shows through)
               *  - vertical bottom darkener: extra protection for
               *    the price/CTA row
               *  - radial pool behind title+blurb: a soft ellipse
               *    centred over the main copy area that quietly
               *    boosts contrast there without touching the
               *    upper-right corner or the lower-right where Adam
               *    and Layla settle. Text reads at any image bright-
               *    ness; characters stay softly visible. */
              background:
                scrim === "split"
                  ? /* Split treatment: the art already carries a dark left
                     *  half (text) and a bright right half (the console),
                     *  so the scrim only needs a quick left-to-clear pass
                     *  to firm up the copy — it must NOT reach across and
                     *  dim the bright right, so it clears fully by ~66%. */
                    "linear-gradient(97deg, " +
                    "rgba(13,15,24,0.80) 0%, " +
                    "rgba(13,15,24,0.62) 34%, " +
                    "rgba(13,15,24,0.24) 50%, " +
                    "rgba(13,15,24,0) 66%), " +
                    "linear-gradient(180deg, " +
                    "rgba(13,15,24,0) 60%, " +
                    "rgba(13,15,24,0.34) 100%)"
                  : scrim === "light"
                  ? /* Light treatment for bright sources: the diagonal
                     *  falls off much faster (clear from ~60% across),
                     *  and the radial pool behind the copy carries the
                     *  text-contrast load instead. */
                    "radial-gradient(ellipse 66% 50% at 30% 54%, " +
                    "rgba(13,15,24,0.60) 0%, " +
                    "rgba(13,15,24,0.32) 60%, " +
                    "rgba(13,15,24,0) 100%), " +
                    "linear-gradient(110deg, " +
                    "rgba(13,15,24,0.93) 0%, " +
                    "rgba(13,15,24,0.80) 26%, " +
                    "rgba(13,15,24,0.38) 54%, " +
                    "rgba(13,15,24,0.06) 82%, " +
                    "rgba(13,15,24,0) 100%), " +
                    "linear-gradient(180deg, " +
                    "rgba(13,15,24,0) 0%, " +
                    "rgba(13,15,24,0) 60%, " +
                    "rgba(13,15,24,0.28) 100%)"
                  : "radial-gradient(ellipse 62% 44% at 30% 54%, " +
                    "rgba(13,15,24,0.42) 0%, " +
                    "rgba(13,15,24,0.20) 60%, " +
                    "rgba(13,15,24,0) 100%), " +
                    "linear-gradient(110deg, " +
                    "rgba(13,15,24,0.97) 0%, " +
                    "rgba(13,15,24,0.90) 28%, " +
                    "rgba(13,15,24,0.58) 56%, " +
                    "rgba(13,15,24,0.22) 88%, " +
                    "rgba(13,15,24,0.14) 100%), " +
                    "linear-gradient(180deg, " +
                    "rgba(13,15,24,0) 0%, " +
                    "rgba(13,15,24,0) 55%, " +
                    "rgba(13,15,24,0.32) 100%)",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
        </>
      )}

      {/* Header row — the course nameplate leads the card (lockup as
       *  the <h3>), with its age group chip right beside it and the
       *  status pill on the far right. Emoji stays as the fallback
       *  identifier for cards without scene art or a lockup. */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        {!characterImage && !lockup && (
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
        )}
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
          {lockup ?? name}
        </h3>
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: isLive ? "var(--lv2-ink)" : accent,
            /* On scene cards the "Coming soon" pill floats over bright art
             *  (the Cyber Ops console glow), so a transparent pill would
             *  wash out — give it a dark translucent chip + shadow there.
             *  Plain cards keep the original transparent outline. */
            background: isLive
              ? accent
              : characterImage
              ? "rgba(13,15,26,0.62)"
              : "transparent",
            border: isLive ? "none" : `1px solid ${accent}66`,
            padding: isLive ? "3px 10px" : characterImage ? "4px 11px" : "2px 9px",
            borderRadius: 999,
            marginLeft: "auto",
            textShadow:
              !isLive && characterImage ? "0 1px 3px rgba(0,0,0,0.55)" : undefined,
            backdropFilter: !isLive && characterImage ? "blur(3px)" : undefined,
            WebkitBackdropFilter:
              !isLive && characterImage ? "blur(3px)" : undefined,
          }}
        >
          {isLive ? "Live now" : "Coming soon"}
        </span>
      </div>

      {/* Age chip — solid accent fill so the band is the card's loudest
       *  cue after the nameplate itself (parents scan for their child's
       *  age first). Sits on its OWN line directly under the nameplate
       *  on every card — identical position across all four, and always
       *  inside the scrim-protected text column so it can never collide
       *  with the scene art at any card width. */}
      <span
        style={{
          position: "relative",
          zIndex: 1,
          alignSelf: "flex-start",
          marginTop: -6,
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 12.5,
          fontWeight: 800,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--lv2-ink)",
          background: accent,
          padding: "5px 13px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          boxShadow: `0 0 18px ${accent}59, inset 0 1px 0 rgba(255,255,255,0.28)`,
        }}
      >
        Ages {ageRange}
      </span>

      {/* Animation-led feature tag — only renders for tracks that have
       *  character art behind them. Reads as a premium feature label,
       *  not a loud badge: small mono caps, accent-tinted text, no
       *  fill. Sits between the header row and the AGES block.
       *
       *  Slightly enlarged (10 → 11.5px) and tracking pulled in (0.24
       *  → 0.18em) for cleaner legibility against the brighter
       *  background image; opacity at full so it reads on first scan
       *  but the small size + mono treatment keep it subtle. */}
      {characterImage && (
        <p
          style={{
            position: "relative",
            zIndex: 1,
            margin: "-4px 0 -4px",
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11.5,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: accent,
            textShadow: "0 1px 4px rgba(4,5,13,0.6)",
            maxWidth: contentMaxWidth,
          }}
        >
          {kicker ?? <>Animation-led · Adam &amp; Layla</>}
        </p>
      )}

      {/* Duration meta line (the age group moved up beside the
       *  nameplate; keeping the big numeral here too would say the
       *  same thing twice). */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: contentMaxWidth,
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(232,237,255,0.5)",
          textShadow: characterImage ? "0 1px 4px rgba(4,5,13,0.6)" : undefined,
        }}
      >
        {duration}
        {weeksCount > 0 ? `  ·  ${weeksCount} weeks` : ""}
      </div>

      <p
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "var(--lv2-font-display)",
          fontSize: 14.5,
          lineHeight: 1.55,
          color: characterImage ? "rgba(238,242,255,0.92)" : "rgba(232,237,255,0.78)",
          /* Copy floats over scene art on characterImage cards — a soft
           *  dark halo keeps it legible where the art runs bright. */
          textShadow: characterImage ? "0 1px 8px rgba(4,5,13,0.85), 0 0 2px rgba(4,5,13,0.6)" : undefined,
          margin: 0,
          flex: 1,
          maxWidth: contentMaxWidth,
        }}
      >
        {blurb}
      </p>

      {/* Price + CTA row */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
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
