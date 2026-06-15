"use client";

/**
 * CyberIcon - futuristic AI-themed SVG icon set replacing emojis.
 *
 * The user wants the cyber-themed app to drop Apple/system emojis
 * everywhere in favour of a single cohesive icon language: clean
 * line-art SVG, cyan/violet gradient stroke, optional pulse-breathing,
 * optional chromatic-edge shimmer for hero icons.
 *
 * One component, one prop API:
 *   <CyberIcon name="shield" size={28} accent="cyan" glow />
 *
 * The accent colours bind to the cyberTokens palette so the whole set
 * always reads as part of the Cyber Heroes Lab system. Adding a new
 * glyph means adding one entry to the GLYPHS map below - no per-icon
 * components, no separate files.
 */

import { CYBER_PALETTE } from "@/app/components/scene/cyberTokens";
import { useId } from "react";

export type CyberIconName =
  | "shield"
  | "lock"
  | "unlock"
  | "key"
  | "brain"
  | "bolt"
  | "trophy"
  | "star"
  | "sparkle"
  | "eye"
  | "target"
  | "vault"
  | "mail"
  | "swords"
  | "scope"
  | "compass"
  | "gem"
  | "rocket"
  | "scroll"
  | "wand"
  | "rainbow"
  | "graduation"
  | "film"
  | "goggles"
  | "flask"
  | "wave"
  | "cake"
  | "palette"
  | "chip"
  | "network"
  | "alert"
  | "ai-spark"
  | "family"
  | "flame"
  | "clock"
  | "chevron";

export type CyberIconAccent =
  | "cyan"
  | "cosmic"
  | "neon"
  | "lime"
  | "amber"
  | "electric";

const ACCENT_PAIRS: Record<CyberIconAccent, [string, string]> = {
  cyan:     [CYBER_PALETTE.cyan,    CYBER_PALETTE.cosmic],
  cosmic:   [CYBER_PALETTE.cosmic,  CYBER_PALETTE.neon],
  neon:     [CYBER_PALETTE.neon,    CYBER_PALETTE.cosmic],
  lime:     [CYBER_PALETTE.lime,    CYBER_PALETTE.cyan],
  amber:    [CYBER_PALETTE.amber,   CYBER_PALETTE.ember],
  electric: [CYBER_PALETTE.electric, CYBER_PALETTE.cyan],
};

export interface CyberIconProps {
  name: CyberIconName;
  /** Pixel size - applied to both width + height. */
  size?: number;
  /** Accent gradient colour pair. Default cyan. */
  accent?: CyberIconAccent;
  /** Adds an outer drop-shadow glow halo. Default true. */
  glow?: boolean;
  /** Adds a slow pulse-breathing animation. Default false. */
  pulse?: boolean;
  /** Class name for layout integration. */
  className?: string;
  /** Inline style override (used to shift / nudge in flex layouts). */
  style?: React.CSSProperties;
  /** Optional title for accessibility. Default omits the title. */
  title?: string;
}

/**
 * Glyph paths - every icon is rendered inside a 24×24 viewBox with
 * `stroke="url(#g)"`, `fill="none"`, `strokeWidth=1.6`, `strokeLinecap`
 * + `strokeLinejoin` "round". Some glyphs have `<path fill="url(#g)" />`
 * for filled accents (gem facets, eye pupil, etc.).
 *
 * Keeping the paths as render functions (not strings) lets each glyph
 * weave in a few coloured fills without losing the gradient stroke.
 */
const GLYPHS: Record<CyberIconName, (gid: string) => React.ReactNode> = {
  /* SHIELD - hex-bevel silhouette + circuit cross + node dot */
  shield: (g) => (
    <>
      <path d="M12 2.5L3.5 5.6V12c0 5.4 3.7 8.6 8.5 9.5 4.8-.9 8.5-4.1 8.5-9.5V5.6L12 2.5z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <path d="M12 8v8M8 12h8" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.3" fill={`url(#${g})`} />
      <circle cx="12" cy="6.5" r="0.7" fill={`url(#${g})`} />
      <circle cx="12" cy="17.5" r="0.7" fill={`url(#${g})`} />
    </>
  ),
  /* LOCK - chunky padlock with keyhole */
  lock: (g) => (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M7.5 10.5V7a4.5 4.5 0 1 1 9 0v3.5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <circle cx="12" cy="15" r="1.5" fill={`url(#${g})`} />
      <path d="M12 16v2.4" stroke={`url(#${g})`} strokeWidth={1.6} strokeLinecap="round" />
    </>
  ),
  /* UNLOCK - same body but shackle is open */
  unlock: (g) => (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M7.5 10.5V7a4.5 4.5 0 0 1 8.7-1.6" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.5" fill={`url(#${g})`} />
      <path d="M12 16v2.4" stroke={`url(#${g})`} strokeWidth={1.6} strokeLinecap="round" />
    </>
  ),
  /* KEY - bow + bit + teeth */
  key: (g) => (
    <>
      <circle cx="6" cy="12" r="3.5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M9.2 12H21" stroke={`url(#${g})`} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M17 12v3M20 12v2.5" stroke={`url(#${g})`} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx="6" cy="12" r="0.9" fill={`url(#${g})`} />
    </>
  ),
  /* BRAIN - half-circle hemispheres + inner waves */
  brain: (g) => (
    <>
      <path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 7 19a3 3 0 0 0 5 .5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M15 4.5a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8A3 3 0 0 1 17 19a3 3 0 0 1-5 .5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M12 4.5v15.5" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M9 10c1 0 1.5 1 3 1s2-1 3-1" stroke={`url(#${g})`} strokeWidth={1.2} strokeLinecap="round" fill="none" />
    </>
  ),
  /* BOLT - angular lightning */
  bolt: (g) => (
    <path d="M13 2L4 13.5h6L9.5 22 20 10h-6l1-8z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
  ),
  /* TROPHY - cup + handles + base */
  trophy: (g) => (
    <>
      <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <path d="M7 6H4.5v2A3 3 0 0 0 7 11M17 6h2.5v2A3 3 0 0 1 17 11" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M9 15v3M15 15v3M7 21h10" stroke={`url(#${g})`} strokeWidth={1.6} strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.2" fill={`url(#${g})`} />
    </>
  ),
  /* STAR - 5-point with inner dot */
  star: (g) => (
    <>
      <path d="M12 3l2.6 5.4 5.9.6-4.4 4 1.3 5.8L12 16l-5.4 2.8L7.9 13 3.5 9l5.9-.6L12 3z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="0.8" fill={`url(#${g})`} />
    </>
  ),
  /* SPARKLE - 4-point burst */
  sparkle: (g) => (
    <>
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" stroke={`url(#${g})`} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M5.5 5.5l3 3M15.5 15.5l3 3M5.5 18.5l3-3M15.5 8.5l3-3" stroke={`url(#${g})`} strokeWidth={1.2} strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.6" fill={`url(#${g})`} />
    </>
  ),
  /* EYE - surveillance / detective */
  eye: (g) => (
    <>
      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7S2.5 12 2.5 12z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <circle cx="12" cy="12" r="3" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" />
      <circle cx="12" cy="12" r="1.4" fill={`url(#${g})`} />
    </>
  ),
  /* TARGET - concentric crosshair */
  target: (g) => (
    <>
      <circle cx="12" cy="12" r="9" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <circle cx="12" cy="12" r="5.5" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" />
      <circle cx="12" cy="12" r="2" fill={`url(#${g})`} />
      <path d="M12 1v3M12 20v3M1 12h3M20 12h3" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  /* VAULT - circular dial */
  vault: (g) => (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <circle cx="12" cy="12" r="4.5" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" />
      <circle cx="12" cy="12" r="1.3" fill={`url(#${g})`} />
      <path d="M12 7.5v-1M12 17.5v-1M16.5 12h1M6.5 12h-1" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  /* MAIL - envelope */
  mail: (g) => (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M3.5 6l8.5 6.5L20.5 6" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
    </>
  ),
  /* SWORDS - crossed blades (used for Boss Battle MISSION BRIEF) */
  swords: (g) => (
    <>
      <path d="M14.5 17.5L19 22l1.5-1.5L16 16M9.5 6.5L5 2 3.5 3.5 8 8" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M16 8L8 16M14 4l6 6-2 2-6-6 2-2zM10 20l-6-6 2-2 6 6-2 2z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
    </>
  ),
  /* SCOPE - magnifier */
  scope: (g) => (
    <>
      <circle cx="11" cy="11" r="6.5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M16 16l5 5" stroke={`url(#${g})`} strokeWidth={1.8} strokeLinecap="round" />
      <circle cx="11" cy="11" r="2.2" fill={`url(#${g})`} opacity="0.55" />
    </>
  ),
  /* COMPASS - needle + ring */
  compass: (g) => (
    <>
      <circle cx="12" cy="12" r="9" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M14.5 9.5L12 12l-2.5 2.5L12 12l2.5-2.5z" stroke={`url(#${g})`} strokeWidth={1.4} fill={`url(#${g})`} strokeLinejoin="round" />
      <path d="M9.5 9.5L12 12l2.5 2.5L12 12l-2.5-2.5z" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="0.8" fill={`url(#${g})`} />
    </>
  ),
  /* GEM - diamond facets */
  gem: (g) => (
    <>
      <path d="M12 2L4 9l8 13 8-13-8-7z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <path d="M4 9h16M9 9l3-7M15 9l-3-7M9 9l3 13M15 9l-3 13" stroke={`url(#${g})`} strokeWidth={1.2} strokeLinejoin="round" />
    </>
  ),
  /* ROCKET - body + window + flames */
  rocket: (g) => (
    <>
      <path d="M12 2c2.5 1.5 4.5 4 4.5 8 0 2-.5 4-1.5 5.5h-6c-1-1.5-1.5-3.5-1.5-5.5 0-4 2-6.5 4.5-8z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="1.8" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" />
      <path d="M9 15.5L7 21M15 15.5L17 21M12 16v5" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  /* SCROLL - rule book / parchment */
  scroll: (g) => (
    <>
      <path d="M5 4h12a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a2 2 0 0 1 1-2z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <path d="M5 4a2 2 0 0 0-1 2v10c0 1 1 2 2 2M9 9h7M9 12h7M9 15h5" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  /* WAND - magic stick + sparkle */
  wand: (g) => (
    <>
      <path d="M5 19l11-11" stroke={`url(#${g})`} strokeWidth={1.8} strokeLinecap="round" />
      <path d="M16 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" stroke={`url(#${g})`} strokeWidth={1.4} fill={`url(#${g})`} strokeLinejoin="round" />
      <circle cx="20" cy="11" r="0.9" fill={`url(#${g})`} />
      <circle cx="13" cy="18" r="0.9" fill={`url(#${g})`} />
    </>
  ),
  /* RAINBOW - three arches */
  rainbow: (g) => (
    <>
      <path d="M3 18a9 9 0 0 1 18 0" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M6 18a6 6 0 0 1 12 0" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M9 18a3 3 0 0 1 6 0" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </>
  ),
  /* GRADUATION - mortarboard + tassel */
  graduation: (g) => (
    <>
      <path d="M2 9l10-4 10 4-10 4-10-4z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <path d="M6 11v4c0 1.5 3 3 6 3s6-1.5 6-3v-4" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M21 9v5" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx="21" cy="15" r="1" fill={`url(#${g})`} />
    </>
  ),
  /* FILM - clapperboard */
  film: (g) => (
    <>
      <rect x="3" y="6" width="18" height="14" rx="1.5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M3 11h18" stroke={`url(#${g})`} strokeWidth={1.4} />
      <path d="M3 6l3.5-3M9 6l3.5-3M15 6l3.5-3" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
      <path d="M8 14l5 3-5 3v-6z" fill={`url(#${g})`} />
    </>
  ),
  /* GOGGLES - twin lenses + strap */
  goggles: (g) => (
    <>
      <circle cx="7" cy="13" r="3.5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <circle cx="17" cy="13" r="3.5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M10.5 13h3" stroke={`url(#${g})`} strokeWidth={1.6} strokeLinecap="round" />
      <path d="M3.5 13c-1-1-1-2.5-.5-3.5M20.5 13c1-1 1-2.5.5-3.5" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" strokeLinecap="round" />
      <circle cx="7" cy="13" r="1.2" fill={`url(#${g})`} />
      <circle cx="17" cy="13" r="1.2" fill={`url(#${g})`} />
    </>
  ),
  /* FLASK - alchemy / potion */
  flask: (g) => (
    <>
      <path d="M9 3h6v5l4 9a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3l4-9V3z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <path d="M8 13c1.5 1 4.5 1 8 0" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx="11" cy="16" r="0.6" fill={`url(#${g})`} />
      <circle cx="14" cy="18" r="0.6" fill={`url(#${g})`} />
    </>
  ),
  /* WAVE - hand wave */
  wave: (g) => (
    <>
      <path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M12 6.5a1.5 1.5 0 0 1 3 0V10" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <path d="M15 8a1.5 1.5 0 0 1 3 0v5c0 4-3 7-7 7s-6.5-2.5-7-5L4 13a1.5 1.5 0 0 1 2.6-1.5L9 14" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
    </>
  ),
  /* CAKE - birthday */
  cake: (g) => (
    <>
      <rect x="4" y="13" width="16" height="7" rx="1.5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M4 16h16" stroke={`url(#${g})`} strokeWidth={1.4} />
      <path d="M9 13v-3M12 13v-3M15 13v-3" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
      <circle cx="9" cy="9" r="0.9" fill={`url(#${g})`} />
      <circle cx="12" cy="9" r="0.9" fill={`url(#${g})`} />
      <circle cx="15" cy="9" r="0.9" fill={`url(#${g})`} />
    </>
  ),
  /* PALETTE - artist palette + paint dots */
  palette: (g) => (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.5 0 2-1 1.5-2-.5-1 .5-2 2-2H17a4 4 0 0 0 4-4 9 9 0 0 0-9-10z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <circle cx="8" cy="10" r="1" fill={`url(#${g})`} />
      <circle cx="12" cy="7" r="1" fill={`url(#${g})`} />
      <circle cx="16" cy="10" r="1" fill={`url(#${g})`} />
      <circle cx="8" cy="14" r="1" fill={`url(#${g})`} />
    </>
  ),
  /* CHIP - microchip with pins */
  chip: (g) => (
    <>
      <rect x="6" y="6" width="12" height="12" rx="1.5" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <rect x="9" y="9" width="6" height="6" rx="0.6" stroke={`url(#${g})`} strokeWidth={1.2} fill={`url(#${g})`} opacity="0.35" />
      <path d="M3 9h3M3 12h3M3 15h3M18 9h3M18 12h3M18 15h3M9 3v3M12 3v3M15 3v3M9 18v3M12 18v3M15 18v3" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
  /* NETWORK - central node + connected satellites */
  network: (g) => (
    <>
      <circle cx="12" cy="12" r="2.5" stroke={`url(#${g})`} strokeWidth={1.6} fill={`url(#${g})`} opacity="0.5" />
      <circle cx="4" cy="6" r="1.6" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" />
      <circle cx="20" cy="6" r="1.6" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" />
      <circle cx="4" cy="18" r="1.6" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" />
      <circle cx="20" cy="18" r="1.6" stroke={`url(#${g})`} strokeWidth={1.4} fill="none" />
      <path d="M5.3 7.1L9.8 10.6M18.7 7.1L14.2 10.6M5.3 16.9L9.8 13.4M18.7 16.9L14.2 13.4" stroke={`url(#${g})`} strokeWidth={1.2} strokeLinecap="round" />
    </>
  ),
  /* ALERT - triangle + bang */
  alert: (g) => (
    <>
      <path d="M12 3l10 17H2L12 3z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <path d="M12 9v5" stroke={`url(#${g})`} strokeWidth={1.8} strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill={`url(#${g})`} />
    </>
  ),
  /* FAMILY - two head+shoulders silhouettes (parent + child) */
  family: (g) => (
    <>
      <circle cx="8" cy="8.5" r="3" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M3 19.5v-1a5 5 0 0 1 10 0v1" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <circle cx="16.8" cy="9.5" r="2.4" stroke={`url(#${g})`} strokeWidth={1.5} fill="none" />
      <path d="M13.6 19.5v-.8a3.8 3.8 0 0 1 7.4 0v.8" stroke={`url(#${g})`} strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </>
  ),
  /* FLAME - streak / energy */
  flame: (g) => (
    <>
      <path d="M12 2.5c2.6 3.4 5 5.4 5 9.4a5 5 0 0 1-10 0c0-1.8.7-3.1 1.8-4.1.2 1.4 1 2.1 2 2.1 1.3 0 2-1 1.6-2.7C12 5.6 11 4.6 12 2.5z" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinejoin="round" />
      <circle cx="12" cy="15.5" r="1" fill={`url(#${g})`} />
    </>
  ),
  /* CLOCK - learning time */
  clock: (g) => (
    <>
      <circle cx="12" cy="12" r="9" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" />
      <path d="M12 7v5l3.4 2" stroke={`url(#${g})`} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  /* CHEVRON - directional / "go" */
  chevron: (g) => (
    <path d="M9 5.5l6.5 6.5L9 18.5" stroke={`url(#${g})`} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  ),
  /* AI-SPARK - diamond burst with halo (the "AI brain spark") */
  "ai-spark": (g) => (
    <>
      <path d="M12 2l1.8 6.5L20 10l-6.2 1.5L12 18l-1.8-6.5L4 10l6.2-1.5L12 2z" stroke={`url(#${g})`} strokeWidth={1.4} fill={`url(#${g})`} opacity="0.6" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="0.8" fill="white" opacity="0.85" />
      <path d="M5 19l1.5-1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 6.5L5 5" stroke={`url(#${g})`} strokeWidth={1.4} strokeLinecap="round" />
    </>
  ),
};

export function CyberIcon({
  name,
  size = 24,
  accent = "cyan",
  glow = true,
  pulse = false,
  className,
  style,
  title,
}: CyberIconProps) {
  // Stable gradient id per-instance so multiple icons on the same
  // page don't collide when re-rendering.
  const uid = useId().replace(/:/g, "");
  const gid = `cigrad-${name}-${uid}`;
  const [a, b] = ACCENT_PAIRS[accent];
  const render = GLYPHS[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      style={{
        display: "inline-block",
        flexShrink: 0,
        filter: glow ? `drop-shadow(0 0 8px ${a}aa)` : undefined,
        animation: pulse ? "ciPulse 2.4s ease-in-out infinite" : undefined,
        ...style,
      }}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={a} />
          <stop offset="100%" stopColor={b} />
        </linearGradient>
      </defs>
      {render(gid)}
      {title && <title>{title}</title>}
      {/* Pulse animation lives in a global style block so multiple icons
          share the same keyframes without redefining them. */}
      {pulse && (
        <style>{`@keyframes ciPulse{0%,100%{filter:drop-shadow(0 0 6px ${a}88)}50%{filter:drop-shadow(0 0 18px ${a})}}`}</style>
      )}
    </svg>
  );
}

/* ───────────────────────── EMOJI MAP ───────────────────────── *
 * Convenience map for places that currently store an emoji string.
 * Lets us swap by lookup without touching every call-site.
 *   emojiToCyberIcon("🛡️") → "shield"
 * Returns null when there's no clean cyber equivalent (preserves
 * the emoji as-is rather than picking a wrong glyph). */

const EMOJI_TO_NAME: Record<string, CyberIconName> = {
  "🛡️": "shield",
  "🛡": "shield",
  "🔒": "lock",
  "🔐": "lock",
  "🔓": "unlock",
  "🔑": "key",
  "🧠": "brain",
  "⚡": "bolt",
  "🏆": "trophy",
  "🌟": "star",
  "⭐": "star",
  "✨": "sparkle",
  "🕵️": "eye",
  "🕵": "eye",
  "👁️": "eye",
  "🎯": "target",
  "📧": "mail",
  "✉️": "mail",
  "✉": "mail",
  "⚔️": "swords",
  "⚔": "swords",
  "🔍": "scope",
  "🧭": "compass",
  "💎": "gem",
  "🚀": "rocket",
  "📜": "scroll",
  "📋": "scroll",
  "🪄": "wand",
  "🌈": "rainbow",
  "🎓": "graduation",
  "🎬": "film",
  "👓": "goggles",
  "🥽": "goggles",
  "⚗️": "flask",
  "⚗": "flask",
  "🧪": "flask",
  "👋": "wave",
  "🎂": "cake",
  "🎨": "palette",
  "💡": "ai-spark",
};

export function emojiToCyberIcon(emoji: string): CyberIconName | null {
  return EMOJI_TO_NAME[emoji] ?? null;
}

/** Render a CyberIcon if the emoji has a cyber equivalent, otherwise
 *  fall back to the emoji glyph itself. Useful for migrating
 *  data-driven icon strings like inventory items. */
export function CyberIconOrEmoji({
  emoji,
  size = 24,
  accent = "cyan",
  glow = true,
  pulse = false,
  className,
  style,
}: { emoji: string } & Omit<CyberIconProps, "name">) {
  const name = emojiToCyberIcon(emoji);
  if (name) {
    return (
      <CyberIcon
        name={name}
        size={size}
        accent={accent}
        glow={glow}
        pulse={pulse}
        className={className}
        style={style}
      />
    );
  }
  return (
    <span
      className={className}
      style={{ fontSize: size, lineHeight: 1, display: "inline-block", ...style }}
    >
      {emoji}
    </span>
  );
}
