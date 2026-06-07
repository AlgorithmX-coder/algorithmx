/**
 * AlgorithmX Cinematic Engine — Design Tokens
 * ===========================================
 *
 * The single source of truth for the colours, type ramp and surface
 * treatments the cinematic engine and its scenes draw from. Before this
 * module these values lived as inline hex literals scattered across the
 * Password Vault and ~14 other exercise files; centralising them here
 * means every future PLAY scene shares one visual identity and a restyle
 * is a one-file change.
 *
 * Values are sourced verbatim from what is already on screen — the
 * Password Vault's scene work and the Cyber Heroes palette — so adopting
 * these tokens is a pure refactor with no visual drift.
 *
 * Nothing is refactored to consume these tokens in this module; later
 * engine batches and scenes import from here.
 */

/* ────────────────────────────────────────────────────────────── */
/* BRAND — the colour-psychology system                           */
/* ────────────────────────────────────────────────────────────── */

/**
 * The four brand colours, chosen for their learning-psychology roles.
 * Use these for product-level semantics (primary actions, success /
 * progress, interactive / gamification accents, reward highlights)
 * rather than raw scene atmosphere (use {@link COSMIC} for that).
 */
export const BRAND = {
  /** Primary — trust, focus, the default "go" colour. */
  blue: "#3b82f6",
  /** Success / progress — completion, correctness, forward motion. */
  green: "#10b981",
  /** Interactive / gamification — taps, play affordances, energy. */
  orange: "#f97316",
  /** Highlight / reward — earned moments, emphasis, shine. */
  amber: "#f59e0b",
} as const;

/* ────────────────────────────────────────────────────────────── */
/* COSMIC — the scene-atmosphere palette                          */
/* ────────────────────────────────────────────────────────────── */

/**
 * The deep-space palette the Password Vault scene is built from. These
 * are the glow accents and navy depth-stops used for vault doors, locks,
 * beams, confetti, reveal chambers and gradient backdrops. Reach for
 * these inside a cinematic scene; reach for {@link BRAND} for product UI.
 */
export const COSMIC = {
  /** Primary scene glow (locks, edges, beams). */
  cyan: "#00e5ff",
  /** Secondary glow / depth accent. */
  cosmicViolet: "#7c5cff",
  /** Celebration / rare-event accent. */
  neonPink: "#ff5fb3",
  /** Success energy / active-lock glow. */
  lime: "#7eff97",
  /** Reward / treasure highlight (the universal "you earned it" cue). */
  gold: "#fde047",

  // Deep-navy gradient depth stops (lightest panel → deepest abyss).
  /** Panel base / lightest navy. */
  navy0: "#0f1530",
  /** Panel surface. */
  navy1: "#1a2147",
  /** Card surface (brightest navy). */
  navy2: "#252d5e",
  /** Deepest abyss stop. */
  abyss: "#04050d",
} as const;

/* ────────────────────────────────────────────────────────────── */
/* TYPE — the font ramp                                           */
/* ────────────────────────────────────────────────────────────── */

/**
 * The three font stacks used across cinematic scenes. `display` for big
 * headlines and labels, `mono` for HUD / status / stencil text, `body`
 * for the rounded child-friendly reading copy. Stacks are copied from
 * the Password Vault so existing scenes match exactly.
 */
export const TYPE = {
  /** Display headlines, rule labels, button text. */
  display: "'Space Grotesk', sans-serif",
  /** HUD readouts, stencil labels, status panels, recap chips. */
  mono: "'JetBrains Mono', monospace",
  /** Child-friendly body / reading copy. */
  body: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
} as const;

/* ────────────────────────────────────────────────────────────── */
/* SURFACE — shared backgrounds, gradients & shadows              */
/* ────────────────────────────────────────────────────────────── */

/**
 * Reusable surface treatments. `cosmicCardBg` and `cosmicShadow` are the
 * literal values currently hardcoded in `ExerciseFrame.tsx` (copied here
 * so a future ExerciseFrame migration is non-breaking). `pageGradient`
 * is the deep-space backdrop the scenes sit on.
 */
export const SURFACE = {
  /** The cosmic card background gradient (from ExerciseFrame.tsx). */
  cosmicCardBg:
    "linear-gradient(180deg, #0f1530 0%, #1a2147 55%, #252d5e 100%)",
  /** The cosmic card drop-shadow + inner hairline (from ExerciseFrame.tsx). */
  cosmicShadow:
    "0 40px 90px -30px rgba(8, 10, 22, 0.55), 0 0 0 1px rgba(125, 240, 255, 0.18) inset",
  /** Full-bleed deep-space page gradient (navy → abyss). */
  pageGradient:
    "radial-gradient(ellipse at 50% 30%, #1f2451 0%, #0c1230 45%, #04050d 100%)",
} as const;

/* ────────────────────────────────────────────────────────────── */
/* Types                                                          */
/* ────────────────────────────────────────────────────────────── */

export type BrandColor = (typeof BRAND)[keyof typeof BRAND];
export type CosmicColor = (typeof COSMIC)[keyof typeof COSMIC];
export type TypeStack = (typeof TYPE)[keyof typeof TYPE];
export type SurfaceToken = (typeof SURFACE)[keyof typeof SURFACE];

/**
 * Convenience aggregate of every token group, for callers that prefer a
 * single import (`import { TOKENS } from "@/app/lib/cinematic"`).
 */
export const TOKENS = { BRAND, COSMIC, TYPE, SURFACE } as const;
