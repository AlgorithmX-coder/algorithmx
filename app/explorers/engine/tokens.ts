/**
 * Signal Room design tokens — single source, mirrors
 * `docs/explorers/algorithmx-explorers-art-direction.md` §3.
 * A hex appearing anywhere else in app/explorers is a bug.
 */

export const T = {
  // base neutrals — the room (matrix-terminal base, matches /explorers map)
  inkBlack: "#060810",
  panel: "#0C1422",
  panelRaised: "#122036",
  /* Glow-pass 2026-07-13 (owner override of the doc's restraint):
     hairline brightened to read as lit circuitry, and full brand-neon
     cyan added for borders/glow accents engine-wide. */
  hairline: "#33506B",
  glowCyan: "#00E5FF",
  textPrimary: "#E6EDF3",
  textSecondary: "#8FA0B2",
  textDisabled: "#5A6B80",
  // semantic accents — roles, not decorations
  arcCyan: "#34E1FF", // identity / live data (matrix-terminal cyan)
  confirmedGreen: "#3ECF8E", // success / verified
  actionAmber: "#E8A33D", // "your move"
  clearanceBrass: "#C9A961", // reward moments ONLY
  threatRed: "#E5484D", // live threat / incorrect
  // the analog counterpoint
  manila: "#E8E2D0",
  paper: "#F4F1E8",
  fileInk: "#14181D",
  // classification bands — sanctioned exception to the role audit (art doc Appendix A.2)
  bandConfidential: "#4A78B5",
  bandSecret: "#B54A4A",
  bandTopSecret: "#C77E3A",
  bandUltra: "#C9A961",
  // stamp ink
  stampInk: "#8A2E2E",
} as const;

export const MONO =
  "var(--font-geist-mono), ui-monospace, 'Cascadia Code', Consolas, monospace";
export const BODY = "var(--font-inter), system-ui, -apple-system, sans-serif";

export const BAND_BY_CLASSIFICATION = {
  CONFIDENTIAL: T.bandConfidential,
  SECRET: T.bandSecret,
  "TOP SECRET": T.bandTopSecret,
  ULTRA: T.bandUltra,
} as const;
