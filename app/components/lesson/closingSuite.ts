"use client";

/**
 * One palette for the four screens that close every week.
 *
 * Owner, 2026-10-17, on the Week Complete screen: "the last two, three
 * screenshots that I've sent, maybe set up a theme with them. Because they
 * always end up at the end of the week. So maybe have them all designed
 * according to that week."
 *
 * Every week finishes with the same four screens, in the same order, inside
 * about a minute:
 *
 *   1. boss Mission Report      QuizBoss
 *   2. Mission Debrief          MissionDebrief
 *   3. Stickers Unlocked        StickerUnlock
 *   4. Badge / Week Complete    DynamicLesson
 *
 * They were written at four different times and it showed: a mono terminal
 * readout, a rainbow card row, gold boxes under floating light cones, and a
 * purple card. A child met all four back to back and the week ended on a
 * stylistic shrug. Worse, `weekThemes.ts` already carries a palette for every
 * week and not one of the four ever asked for it, so twenty different worlds
 * all finished identically.
 *
 * So the four share this, and this takes the week's colour. One design, one
 * lookup, twenty distinct endings.
 *
 * THE RULE THAT CONSTRAINS ALL OF IT, carried over from weekThemes.ts: a
 * theme only ever changes NEUTRAL chrome. Green stays correct, red stays
 * wrong, GOLD STAYS REWARD. So the frame, the ground, the rules and the
 * glows take the week's colour, while the badge, the sticker art, the XP
 * figure and the tick marks keep their own meaning in every week. A child who
 * learns that gold means "you earned this" must not find it means something
 * else in week 9.
 */

import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";

/** Gold. The reward colour, identical in all twenty weeks, never themed. */
export const REWARD = "#f5c451";
export const REWARD_DIM = "rgba(245, 196, 81, 0.42)";

/** Semantic pair, also never themed. */
export const RIGHT = "#34d399";
export const WRONG = "#b4566a";

export interface ClosingPalette {
  /** The week's accent, or the house violet for an un-themed week. */
  accent: string;
  /** Accent as "r,g,b", for building tints without string surgery. */
  accentRGB: string;
  /** Page-level ground behind the closing card. */
  deepBg: string;
  /** The card itself. */
  cardBg: string;
  cardEdge: string;
  /** An inner panel sitting on the card: the report, a stat tile. */
  panelBg: string;
  panelEdge: string;
  /** The hairline that separates a header from its body. */
  rule: string;
  /** Soft light behind the card. */
  glow: string;
  /** Small caps label above a title. */
  eyebrow: string;
  /** Body copy on the card. */
  text: string;
  textDim: string;
}

/* The house look, used by any week with no theme entry. Matches what the
 * closing screens rendered before this existed, so an un-themed week looks
 * exactly as it always did. */
const HOUSE = {
  accent: "#a06aff",
  accentRGB: "160, 106, 255",
  deepBg: "#05061a",
};

export function closingPalette(theme: {
  accent?: string;
  accentRGB?: string;
  deepBg?: string;
} | null): ClosingPalette {
  const accent = theme?.accent ?? HOUSE.accent;
  const accentRGB = theme?.accentRGB ?? HOUSE.accentRGB;
  const deepBg = theme?.deepBg ?? HOUSE.deepBg;

  return {
    accent,
    accentRGB,
    deepBg,
    /* The card is the week's colour laid thinly over its own deep ground, so
     * it belongs to the world the child has just spent 45 minutes in rather
     * than floating on top of it. */
    cardBg: `linear-gradient(180deg, rgba(${accentRGB}, 0.14) 0%, rgba(${accentRGB}, 0.05) 42%, rgba(6, 9, 26, 0.92) 100%)`,
    cardEdge: `rgba(${accentRGB}, 0.46)`,
    panelBg: `rgba(${accentRGB}, 0.08)`,
    panelEdge: `rgba(${accentRGB}, 0.30)`,
    rule: `rgba(${accentRGB}, 0.26)`,
    glow: `radial-gradient(circle, rgba(${accentRGB}, 0.30) 0%, rgba(${accentRGB}, 0) 68%)`,
    eyebrow: `rgba(${accentRGB}, 0.95)`,
    text: "#eef2ff",
    textDim: "rgba(214, 222, 255, 0.78)",
  };
}

/** The same, read from context, for a component already inside the lesson. */
export function useClosingPalette(): ClosingPalette {
  return closingPalette(useLessonTheme());
}

/**
 * The ground a closing scene sits on.
 *
 * The closing scenes each had a FIXED purple gradient written into
 * DynamicLesson, which is the plainest reason twenty different worlds all
 * finished identically. A themed week now ends on its own colour; a week
 * with no theme keeps the exact gradient it always had, so nothing moves for
 * the weeks that have not been given a world yet.
 */
export function closingGround(
  theme: { deepBg?: string; accentRGB?: string } | null,
  fallbackTo: string,
): string {
  if (!theme?.deepBg) return `linear-gradient(180deg, #050a1a 0%, ${fallbackTo} 100%)`;
  const rgb = theme.accentRGB ?? HOUSE.accentRGB;
  return `linear-gradient(180deg, ${theme.deepBg} 0%, rgba(${rgb}, 0.22) 100%)`;
}

/* ─────────────────────── telling cards apart ─────────────────────── */

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: h * 60, s, l };
}

function hslToCss(h: number, s: number, l: number) {
  return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

/**
 * Five shades of ONE colour, rather than five unrelated colours.
 *
 * The Mission Debrief gave every card its own authored accent - cyan, green,
 * gold, pink, purple - so five weeks' worth of palettes landed on one screen
 * no matter which week it was. The owner, asked for the row to be designed
 * "according to the week", which means the cards still have to be TOLD APART,
 * just within the week's own world.
 *
 * So hue stays put and lightness walks: a run of related shades that reads as
 * one family at a glance and still gives each card its own identity. The hue
 * drifts by a few degrees across the row as well, which stops the darkest and
 * lightest ends looking like the same colour at different brightnesses.
 */
export function cardShade(accent: string, index: number, count: number): string {
  const m = accent.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!m) return accent;
  const { h, s } = rgbToHsl(parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16));
  const span = Math.max(1, count - 1);
  const t = index / span;

  /**
   * Owner, 2026-10-17, looking at the themed debrief: "look at the second
   * screenshot. It still looks like its the same one."
   *
   * They were right, and the cause was arithmetic. The first version walked
   * lightness from the accent's own value and then clamped at 0.74. Week 2's
   * accent (#9d7bff) is already light, so cards 3, 4 and 5 all pinned to the
   * ceiling and resolved to the SAME colour - five cards in one flat violet,
   * which reads as less designed than the rainbow it replaced.
   *
   * So the walk no longer starts from the accent's lightness. It spans a
   * fixed, deliberately wide band, which guarantees five distinguishable
   * steps whatever the week's accent happens to be, and the hue rotates far
   * enough that the ends do not read as one colour dimmed.
   */
  const lightness = 0.46 + t * 0.26;        // 46% -> 72%, always five steps
  const hue = (h + (t - 0.5) * 54 + 360) % 360;
  const sat = Math.min(0.92, Math.max(0.52, s));
  return hslToCss(hue, sat, lightness);
}

/**
 * Shared type scale, so the four screens agree on what a title is.
 *
 * They disagreed before: the debrief title, the sticker title and the week
 * title were three different sizes and weights, which is most of why they
 * read as three products rather than one ending.
 */
export const CLOSING_TYPE = {
  eyebrow: {
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: "0.22em",
    textTransform: "uppercase" as const,
  },
  title: {
    fontSize: "clamp(1.7rem, 3.6vw, 2.3rem)",
    fontWeight: 900,
    letterSpacing: "-0.01em",
    lineHeight: 1.08,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.45,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  cardBody: {
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.4,
  },
} as const;
