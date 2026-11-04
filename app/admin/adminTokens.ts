/* The staff admin portal's own small token set. Copied from (not imported
 * from) app/ai-cleared/engine/tokens, which is explicitly scoped to
 * app/ai-cleared - /admin is a neutral area that spans schools, firms
 * and individuals, so it keeps its own copy rather than reaching into
 * one product's engine folder.
 *
 * This is an internal tool, not a customer surface: the brief is "a
 * theme, but light-touch" - one accent colour, a plain spacing/radius
 * scale so every page agrees on what "a card" or "a gap" means, and
 * nothing beyond that (no gradients, no glass, no motion). Every page
 * under /admin and /admin-login pulls its look from admin.css, which
 * reads these same values - change a colour once, here. */
export const K = Object.freeze({
  ground: "#f3ede4",
  panel: "#ffffff",
  sunk: "#ece6da",
  edge: "#d9d2c4",
  edgeSoft: "rgba(20,22,29,0.08)",

  ink: "#14161d",
  body: "#2b2f36",
  muted: "#5b6572",
  faint: "#8a8f98",

  accent: "#0a7085",
  accentInk: "#0a7085",
  accentSoft: "rgba(10,112,133,0.10)",
  onAccent: "#ffffff",

  ok: "#0e7a45",
  okSoft: "rgba(14,122,69,0.10)",
  warn: "#8a5400",
  warnSoft: "rgba(138,84,0,0.10)",

  glassStrong: "rgba(255,255,255,0.88)",

  sans: "var(--font-inter), Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  display: "var(--font-space-grotesk), 'Space Grotesk', var(--font-inter), Inter, system-ui, sans-serif",
  mono: "var(--font-geist-mono), 'Geist Mono', ui-monospace, Consolas, monospace",

  /* One scale, used everywhere, so spacing is a decision made once. */
  space: { xs: "4px", sm: "8px", md: "12px", lg: "16px", xl: "24px", xxl: "32px", xxxl: "48px" },
  radius: { sm: "8px", md: "12px", lg: "16px", full: "999px" },
  /* The one shadow in the system - a card lifted a little off the sand
   * ground. Used on panels and, slightly stronger, on hover. Nothing
   * else carries a shadow. */
  shadow: "0 1px 2px rgba(20,22,29,0.04), 0 6px 16px rgba(20,22,29,0.05)",
  shadowHover: "0 2px 4px rgba(20,22,29,0.05), 0 10px 24px rgba(20,22,29,0.08)",
});
