/* Cyber Pro learn-surface tokens. Single source: a hex or font stack
 * appearing anywhere else under app/pro is a bug (rule from the
 * Explorers engine). Warmer and more spacious than a SOC console: this
 * is a teaching surface for a nervous beginner, so more air, softer
 * ground, larger reading type. Pro brand = cosmic violet + cyan. */
export const T = Object.freeze({
  bg: "#0b0a16",
  bgRaise: "#12111f",
  panel: "#16152a",
  panelSoft: "rgba(255,255,255,0.035)",
  edge: "#272544",
  edgeSoft: "rgba(255,255,255,0.08)",

  ink: "#f3f2fb",  // headings / emphasis, near-white
  body: "#dcdaf1", // reading body, bright for sharp contrast on the dark ground
  muted: "#b4afd4", // secondary text (leads, captions)
  faint: "#8681a8", // tertiary labels / hints

  primary: "#8b6dff", // cosmic violet, lifted for dark ground
  primarySoft: "rgba(139,109,255,0.14)",
  cyan: "#35d6f0",
  cyanSoft: "rgba(53,214,240,0.12)",
  green: "#48d18a",
  greenSoft: "rgba(72,209,138,0.12)",
  amber: "#ffb454",
  amberSoft: "rgba(255,180,84,0.12)",
  red: "#ff6b7f",
  redSoft: "rgba(255,107,127,0.12)",

  display: "var(--font-pro-display), 'Chakra Petch', system-ui, sans-serif",
  sans: "var(--font-pro-sans), 'Nunito', system-ui, sans-serif",
  mono: "var(--font-pro-mono), 'IBM Plex Mono', ui-monospace, Consolas, monospace",
});
