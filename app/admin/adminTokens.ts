/* The staff admin portal's own small token set. Copied from (not imported
 * from) app/ai-cleared/engine/tokens, which is explicitly scoped to
 * app/ai-cleared - /admin is a neutral area that spans both schools and
 * firms, so it keeps its own copy rather than reaching into one
 * product's engine folder. */
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
});
