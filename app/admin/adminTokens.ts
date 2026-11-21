/* The staff admin portal's own small token set. Copied from (not imported
 * from) app/ai-cleared/engine/tokens, which is explicitly scoped to
 * app/ai-cleared - /admin is a neutral area that spans schools, firms
 * and individuals, so it keeps its own copy rather than reaching into
 * one product's engine folder.
 *
 * "Mission Control" (2026-11-20): dark, to match the public site's own
 * dark + cyan-neon brand, with the brand light (cyan -> violet) as the
 * constant and one hue per customer segment. admin.css is the source of
 * truth for every page under /admin and /admin-login; these values mirror
 * it for the rare TSX that needs a colour in code. Change a colour there
 * first, then here. */
export const K = Object.freeze({
  ground: "#070b14",
  panel: "rgba(255,255,255,0.035)",
  sunk: "rgba(255,255,255,0.06)",
  edge: "rgba(255,255,255,0.14)",
  edgeSoft: "rgba(255,255,255,0.08)",

  ink: "#eef2ff",
  body: "#c7cfdd",
  muted: "#8a94a8",
  faint: "#5d667a",

  accent: "#00e5ff",
  accentInk: "#00e5ff",
  accentSoft: "rgba(0,229,255,0.12)",
  onAccent: "#ffffff",
  violet: "#7c5cff",

  ok: "#34d399",
  okSoft: "rgba(52,211,153,0.14)",
  warn: "#fbbf24",
  warnSoft: "rgba(251,191,36,0.14)",
  danger: "#fb7185",
  dangerSoft: "rgba(251,113,133,0.14)",

  sections: {
    schools: "#fb923c",
    organisations: "#34d399",
    firms: "#22d3ee",
    individuals: "#a78bfa",
  },

  glassStrong: "rgba(14,21,38,0.72)",

  sans: "var(--font-inter), Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  display: "var(--font-space-grotesk), 'Space Grotesk', var(--font-inter), Inter, system-ui, sans-serif",
  mono: "var(--font-geist-mono), 'Geist Mono', ui-monospace, Consolas, monospace",

  /* One scale, used everywhere, so spacing is a decision made once. */
  space: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", xxl: "32px", xxxl: "48px" },
  radius: { sm: "10px", md: "14px", lg: "18px", full: "999px" },
  /* Glass on dark: a lit top edge and a deep soft drop, never a grey blur. */
  shadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 60px -40px rgba(0,0,0,0.9)",
  shadowHover: "0 1px 0 rgba(255,255,255,0.06) inset, 0 40px 80px -40px rgba(0,0,0,0.9)",
});
