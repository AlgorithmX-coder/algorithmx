/* Cyber Pro console design tokens. Single source: a hex or font stack
 * appearing anywhere else under app/pro is a bug (rule carried from the
 * Explorers engine). Palette = the Pro tier brand (cosmic violet +
 * cyan) on a carbon ground, deliberately adjacent to but distinct from
 * the Ops range indigo. */
export const T = Object.freeze({
  bg: "#070910",
  bgRaise: "#0b0e1c",
  panel: "#0d1022",
  panelSoft: "rgba(255,255,255,0.03)",
  edge: "#1d2242",
  edgeSoft: "rgba(255,255,255,0.07)",

  ink: "#e8eaf6",
  muted: "#8b90ad",
  faint: "#585d7c",

  primary: "#7c5cff",
  primarySoft: "rgba(124,92,255,0.14)",
  cyan: "#00e5ff",
  green: "#3ecf8e",
  greenSoft: "rgba(62,207,142,0.12)",
  red: "#ff5d73",
  redSoft: "rgba(255,93,115,0.12)",
  amber: "#ffb347",
  amberSoft: "rgba(255,179,71,0.12)",

  display: "var(--font-pro-display), 'Chakra Petch', system-ui, sans-serif",
  sans: "var(--font-pro-sans), 'Nunito', system-ui, sans-serif",
  mono: "var(--font-pro-mono), 'IBM Plex Mono', ui-monospace, Consolas, monospace",
});
