/**
 * Access Layer — auth-local design tokens.
 *
 * The marketing site and the in-app "cyber" world have their own loud,
 * multi-hue palettes (see ./scene/cyberTokens.ts). The auth pages are a
 * different surface: a premium "AI access layer". This module keeps that
 * language self-contained and disciplined so the redesign can't be
 * polluted by the playful hues (neon pink, lime) used elsewhere.
 *
 * Three colours carry meaning. Nothing else glows:
 *   base   — deep indigo / blue-black, the void the engine sits in
 *   cyan   — system ACTIVITY (a field is live, a status is online)
 *   violet — the PREMIUM ACCENT (brand chrome, the core at rest)
 *
 * Maps onto the "AI/Chatbot Platform" colour guidance: violet primary
 * (#7C3AED / #A78BFA) + cyan interaction (#06B6D4-class) on a dark base.
 */

import { STREAMS } from "./streams";

export const ACCESS = {
  /* ── Base depths (deepest → panel) — deep warm-indigo, charcoal/violet,
   *    not cold blue-black. Dark and premium. ── */
  void: "#08060e",        // page edges, deepest
  abyss: "#0e0a1c",       // page base
  indigo: "#171327",      // raised base / column wash
  slab: "rgba(20, 16, 34, 0.72)",      // glass slab fill
  slabSolid: "#130f22",   // opaque fallback for the slab
  field: "rgba(15, 11, 27, 0.66)",     // input fill

  /* ── Meaningful accents ── */
  cyan: "#36dbff",        // system activity (primary signal)
  cyanSoft: "#8fe9ff",    // soft activity tint
  cyanDeep: "#0a91c4",    // pressed / deep activity
  violet: "#8b6cff",      // premium accent (brand, core at rest)
  violetSoft: "#b4a4ff",  // soft accent tint
  violetDeep: "#5b3fd6",  // deep accent

  /* ── Power-up light states — interpolate between these for the
   *    "filling the form charges the machine" language. ── */
  dormant: "#2b3352",     // low, cool — ~12% energy, machine at rest
  charged: "#5fd4ff",     // full cyan/violet energy

  /* ── Structure ── */
  line: "rgba(150, 168, 224, 0.14)",   // idle hairlines / borders
  lineSoft: "rgba(150, 168, 224, 0.08)",
  lineActive: "rgba(54, 219, 255, 0.55)",

  /* ── Text — the whole ramp sits a step brighter than the classic
   *    60/45/30% greys: the busy code-rain backdrop eats low-contrast
   *    text, so even "muted" must clearly beat it. ── */
  textBright: "#eef2ff",
  text: "#ced5f0",
  textSoft: "#aab4dc",
  textMuted: "#8690bd",

  /* ── Semantic (used sparingly, only when it means something) ── */
  warn: "#f4b878",        // calm amber for errors — never harsh red
  warnSoft: "#ffd9a8",
} as const;

/* ───────────────────────── STREAM ACCENTS ───────────────────────── */

/**
 * The six AlgorithmX stream accent colours, keyed by stream id, promoted
 * to first-class palette tokens. The single source of truth is
 * `streams.ts` — these are re-exported (not duplicated) so palette
 * consumers have one import and the hexes never drift.
 */
export const STREAM_ACCENT: Record<string, string> = Object.fromEntries(
  STREAMS.map((s) => [s.id, s.color]),
);

/* ───────────────────────── GRADIENTS ───────────────────────── */

export const ACCESS_GRAD = {
  /** Page wash — indigo bleeding up from the top of a near-black void. */
  page:
    `radial-gradient(ellipse 120% 80% at 50% -20%, rgba(91, 63, 214, 0.18) 0%, transparent 55%),` +
    `radial-gradient(ellipse 90% 70% at 50% 120%, rgba(10, 145, 196, 0.12) 0%, transparent 50%),` +
    `linear-gradient(180deg, ${ACCESS.abyss} 0%, ${ACCESS.void} 100%)`,

  /** Brand mark / key chrome — restrained two-stop, violet → cyan. */
  brand: `linear-gradient(120deg, ${ACCESS.violetSoft} 0%, ${ACCESS.cyan} 100%)`,

  /** The execute-access button at rest — a deliberate dark control with
   *  a single violet→cyan hairline of activity, not a rainbow fill. */
  execute: `linear-gradient(120deg, ${ACCESS.violetDeep} 0%, ${ACCESS.cyanDeep} 100%)`,

  /** Execute button when armed (form valid). Brighter, ready to fire. */
  executeArmed: `linear-gradient(120deg, ${ACCESS.violet} 0%, ${ACCESS.cyan} 100%)`,
} as const;

/* ───────────────────────── TYPOGRAPHY ───────────────────────── */

export const ACCESS_FONT = {
  /** Display — already loaded site-wide. Confident, geometric. */
  display: "'Space Grotesk', system-ui, -apple-system, sans-serif",
  /** Body — highly readable. */
  body: "'DM Sans', 'Inter', system-ui, -apple-system, sans-serif",
  /** Mono — system / status / terminal voice. */
  mono: "ui-monospace, 'JetBrains Mono', 'Fira Code', Menlo, monospace",
} as const;

/* ───────────────────────── HELPERS ───────────────────────── */

/** Hex → rgba with alpha. */
export function rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
