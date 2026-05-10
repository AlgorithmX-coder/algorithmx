/**
 * Cyber Heroes Lab - futuristic design tokens.
 *
 * A parallel design system to the warm Pixar dusk tokens (./tokens.ts).
 * The marketing home page keeps the warm welcoming palette; the
 * moment a kid crosses into the app (login → lessons → dashboard) the
 * world flips to this - deep navy abyss, glowing cyan terminals,
 * holographic chromatic edges. Two systems, one decision per page.
 *
 * Why navy + glow for cyber: the kids are training to be Cyber Heroes
 * in a futuristic command-centre lab. The visual language should
 * reinforce that - dark, focused, alive with energy traces, but never
 * scary (kids 6-9 are the audience). Reads as exciting, not threatening.
 */

/* ───────────────────────── PALETTE ───────────────────────── */

export const CYBER_PALETTE = {
  // Background depths (deepest → lightest panel)
  abyss: "#080a16",        // page bg, deepest
  midnight: "#0f1530",     // primary base
  twilight: "#1a2147",     // panel surface
  oceanDeep: "#252d5e",    // card surface
  oceanMid: "#323b78",     // hover state / lighter card

  // Glow accents - used for borders, glow shadows, animated highlights
  cyan: "#00e5ff",         // primary brand glow
  cyanSoft: "#7df0ff",     // softer cyan for tints
  electric: "#3a7bff",     // electric blue
  cosmic: "#7c5cff",       // cosmic violet
  cosmicSoft: "#a08fff",   // soft violet for tints
  neon: "#ff5fb3",         // hot pink - celebrations, rare events
  lime: "#7eff97",         // success / energy / saved
  amber: "#ffb347",        // earned / XP / coins (kept warm for reward)
  ember: "#ff7a59",        // alert / warning (warmer than red)

  // Text
  textBright: "#e8edff",   // primary headlines on dark bg
  text: "#c5cdf0",         // body text
  textSoft: "#a8b2d1",     // secondary
  textMuted: "#6a7396",    // tertiary / labels

  // Status
  success: "#7eff97",
  warning: "#ffb347",
  error: "#ff5577",
} as const;

/* ───────────────────────── GRADIENTS ───────────────────────── */

export const CYBER_GRAD = {
  /** The hero gradient - used on titles, primary buttons, and active
   *  states. Travels cyan → violet → pink. Heavy enough that it
   *  reads as "the brand colour" everywhere. */
  hero: `linear-gradient(135deg, ${CYBER_PALETTE.cyan} 0%, ${CYBER_PALETTE.cosmic} 55%, ${CYBER_PALETTE.neon} 100%)`,

  /** Subdued variant for subtle accents - same hues, lower contrast. */
  heroSoft: `linear-gradient(135deg, ${CYBER_PALETTE.cyanSoft} 0%, ${CYBER_PALETTE.cosmicSoft} 100%)`,

  /** Page background - deep abyss with a hint of cosmic violet bleeding
   *  in from the top. Looks like the sky over a futuristic city. */
  page: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, ${CYBER_PALETTE.midnight} 35%, ${CYBER_PALETTE.abyss} 70%, #04050d 100%)`,

  /** Panel background - a dim navy that takes glow inserts cleanly. */
  panel: `linear-gradient(180deg, ${CYBER_PALETTE.twilight} 0%, ${CYBER_PALETTE.midnight} 100%)`,

  /** Card surface - slightly brighter than panel, suggests depth. */
  card: `linear-gradient(180deg, rgba(50, 60, 130, 0.85) 0%, rgba(20, 28, 70, 0.92) 100%)`,

  /** Glass surface - translucent dark navy with backdrop blur paired. */
  glass: "rgba(15, 21, 48, 0.78)",
  glassDarker: "rgba(8, 10, 22, 0.85)",

  /** Holographic shimmer - animated rotating conic gradient. Use as
   *  a `border-image` source or as a backdrop for chromatic edges. */
  holoConic: `conic-gradient(from 0deg, ${CYBER_PALETTE.cyan} 0deg, ${CYBER_PALETTE.cosmic} 120deg, ${CYBER_PALETTE.neon} 240deg, ${CYBER_PALETTE.cyan} 360deg)`,

  /** Energy beam - vertical slice with cyan core and violet edges,
   *  for accent strokes. */
  beam: `linear-gradient(180deg, transparent, ${CYBER_PALETTE.cyan}, ${CYBER_PALETTE.cosmic}, transparent)`,

  /** Reward gradient - the only warm accent in the system. Used for
   *  XP, coins, earned items. Visually distinct from the cool brand. */
  reward: `linear-gradient(135deg, ${CYBER_PALETTE.amber} 0%, ${CYBER_PALETTE.ember} 100%)`,
} as const;

/* ───────────────────────── BORDERS ───────────────────────── */

export const CYBER_BORDER = {
  /** Hairline - for subtle separator lines on dark surfaces. */
  hair: "1px solid rgba(125, 240, 255, 0.12)",

  /** Default - visible but quiet. Most cards / inputs. */
  panel: "1px solid rgba(125, 240, 255, 0.22)",

  /** Energised - used on focused / active / important panels. */
  active: "1px solid rgba(0, 229, 255, 0.55)",

  /** Holographic - paired with `border-image` for the shimmer effect. */
  holo: "1.5px solid transparent",
} as const;

/* ───────────────────────── SHADOW (GLOW) ───────────────────────── */

export const CYBER_SHADOW = {
  /** Base panel shadow - depth without glow. */
  panel: "0 12px 32px -8px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(125, 240, 255, 0.06) inset",

  /** Card with subtle cyan glow. */
  cardCyan:
    "0 12px 28px -8px rgba(0, 0, 0, 0.65), 0 0 24px rgba(0, 229, 255, 0.18), 0 0 0 1px rgba(125, 240, 255, 0.16) inset",

  /** Card with violet glow. */
  cardViolet:
    "0 12px 28px -8px rgba(0, 0, 0, 0.65), 0 0 26px rgba(124, 92, 255, 0.22), 0 0 0 1px rgba(160, 143, 255, 0.16) inset",

  /** Hero / important card - full holographic halo. */
  cardHero:
    "0 18px 40px -10px rgba(0, 0, 0, 0.75), 0 0 28px rgba(0, 229, 255, 0.32), 0 0 56px rgba(124, 92, 255, 0.26), 0 0 0 1px rgba(125, 240, 255, 0.22) inset",

  /** Button glow ring - for primary CTAs. */
  buttonGlow:
    "0 0 24px rgba(0, 229, 255, 0.55), 0 8px 20px -6px rgba(0, 229, 255, 0.45), 0 0 0 1px rgba(125, 240, 255, 0.6) inset",

  /** Reward glow (warm) - for XP / coins / earned items. */
  reward:
    "0 0 22px rgba(255, 179, 71, 0.55), 0 8px 20px -6px rgba(255, 122, 89, 0.45)",

  /** Subtle text glow for headings. */
  textCyan: "0 0 22px rgba(0, 229, 255, 0.5)",
  textViolet: "0 0 22px rgba(124, 92, 255, 0.5)",
} as const;

/* ───────────────────────── SPRING / TIMINGS ─────────────── */

export const CYBER_SPRING = {
  snap: { type: "spring" as const, stiffness: 420, damping: 24 },
  pop:  { type: "spring" as const, stiffness: 320, damping: 20 },
  ease: { type: "spring" as const, stiffness: 220, damping: 24 },
} as const;

/* ───────────────────────── TYPOGRAPHY ───────────────────── */

/** Display font stack - used for big titles. Space Grotesk is already
 *  loaded site-wide; we layer Orbitron as an optional system fallback
 *  for users who happen to have it installed (slightly more "cyber"). */
export const CYBER_FONT = {
  display:
    "'Orbitron', 'Space Grotesk', system-ui, -apple-system, sans-serif",
  body:
    "'DM Sans', 'Inter', system-ui, -apple-system, sans-serif",
  mono:
    "ui-monospace, 'JetBrains Mono', 'Fira Code', Menlo, monospace",
} as const;

/* ───────────────────────── HELPERS ───────────────────────── */

/** Convert a hex colour to rgba with alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Common chromatic offset filter - applies a faint RGB-split to text
 *  for a holographic shimmer effect. Pair with @keyframes for animation. */
export const CYBER_FILTERS = {
  chromaticShimmer:
    "drop-shadow(-1px 0 0 rgba(0, 229, 255, 0.55)) drop-shadow(1px 0 0 rgba(255, 95, 179, 0.55))",
  cyanGlow: "drop-shadow(0 0 14px rgba(0, 229, 255, 0.6))",
  violetGlow: "drop-shadow(0 0 14px rgba(124, 92, 255, 0.6))",
} as const;
