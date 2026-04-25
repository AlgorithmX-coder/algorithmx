/*
 * Pixar 2.5D scene design tokens.
 *
 * Shared palette, shadows, typography, and animation presets for all
 * lesson scenes. Import from "@/app/components/scene/tokens".
 */

/* ───────────────── PALETTES ───────────────── */

export const PALETTE = {
  // Warm-dusk (Mission Brief default)
  dusk: {
    sky: [
      { stop: 0, color: "#1f0f2e" },
      { stop: 0.25, color: "#3a1a4a" },
      { stop: 0.55, color: "#a04a4a" },
      { stop: 0.78, color: "#e88550" },
      { stop: 0.92, color: "#f9c27a" },
      { stop: 1, color: "#fde2b5" },
    ],
    ridgeFar: "#3a1a3e",
    ridgeMid: "#5a2540",
    ridgeNear: "#2a1230",
    floorCenter: "#fdd9a5",
    floorMid: "#d68a4c",
    floorEdge: "#3a1a08",
  },
  // Triumphant golden hour (Graduation)
  golden: {
    sky: [
      { stop: 0, color: "#1a1240" },
      { stop: 0.3, color: "#3f2a6a" },
      { stop: 0.6, color: "#d4733a" },
      { stop: 0.85, color: "#fcd25c" },
      { stop: 1, color: "#fff5d4" },
    ],
    ridgeFar: "#3a2a5e",
    ridgeMid: "#5a3a48",
    ridgeNear: "#2a1a3a",
    floorCenter: "#fff0c2",
    floorMid: "#e8a45a",
    floorEdge: "#5a2a14",
  },
  // Stormy / dramatic (Boss Battle)
  storm: {
    sky: [
      { stop: 0, color: "#0a0218" },
      { stop: 0.3, color: "#1f0c3a" },
      { stop: 0.6, color: "#4a1a5a" },
      { stop: 0.85, color: "#7a2f5a" },
      { stop: 1, color: "#a83a4a" },
    ],
    ridgeFar: "#2a0a3e",
    ridgeMid: "#3a1240",
    ridgeNear: "#1a0228",
    floorCenter: "#704a3a",
    floorMid: "#3a1c0a",
    floorEdge: "#0a0410",
  },
} as const;

export type PaletteKey = keyof typeof PALETTE;

/* ───────────────── TYPOGRAPHY ───────────────── */

export const FONT_STACK =
  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";

/* ───────────────── SHADOWS ───────────────── */

export const SHADOW = {
  sceneFrame:
    "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
  card:
    "0 18px 40px -12px rgba(40, 18, 8, 0.55), 0 -3px 0 rgba(255,178,110,0.18) inset",
  portraitRing:
    "0 0 0 4px rgba(255, 230, 190, 0.85), 0 0 0 6px rgba(140, 70, 30, 0.5), 0 14px 28px -8px rgba(50, 20, 5, 0.65), 0 0 24px rgba(255, 178, 110, 0.45)",
  primaryButton:
    "0 18px 36px -10px rgba(255,120,40,0.7), 0 0 0 1px rgba(255,235,200,0.6) inset, 0 -3px 0 rgba(180,80,30,0.45) inset",
  drop: "0 14px 28px -8px rgba(50, 20, 5, 0.65)",
} as const;

/* ───────────────── COLOR PRIMITIVES ───────────────── */

export const COLOR = {
  cream: "#ffe9c8",
  parchment: "#fdf6ee",
  goldLight: "#ffd58a",
  goldMid: "#ff9b4a",
  goldDark: "#3a1a06",
  inkDeep: "#3b2615",
  inkSoft: "#7a3a52",
  vignette: "rgba(20, 8, 24, 0.55)",
} as const;

/* ───────────────── SPRING PRESETS (motion) ───────────────── */

export const SPRING = {
  bouncy: { type: "spring" as const, stiffness: 220, damping: 22 },
  snappy: { type: "spring" as const, stiffness: 320, damping: 24 },
  gentle: { type: "spring" as const, stiffness: 140, damping: 24 },
} as const;

/* ───────────────── HELPERS ───────────────── */

export function gradientFromStops(
  stops: ReadonlyArray<{ stop: number; color: string }>,
  angle = "180deg"
): string {
  return (
    `linear-gradient(${angle}, ` +
    stops.map((s) => `${s.color} ${s.stop * 100}%`).join(", ") +
    ")"
  );
}
