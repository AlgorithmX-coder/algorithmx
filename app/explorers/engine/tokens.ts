/**
 * Signal Room design tokens — single source, mirrors
 * `docs/explorers/algorithmx-explorers-art-direction.md` §3.
 * A hex appearing anywhere else in app/explorers is a bug.
 */

export const T = {
  // base neutrals — the room
  inkBlack: "#0B0F14",
  panel: "#121820",
  panelRaised: "#1A222E",
  hairline: "#2A3644",
  textPrimary: "#E6EDF3",
  textSecondary: "#8FA0B2",
  textDisabled: "#5A6B80",
  // semantic accents — roles, not decorations
  arcCyan: "#22D3EE", // identity / live data
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
