/* The clearance console, light. The site's warm sand ground, paper panels,
 * graphite ink, the site teal as the one accent, and the four data classes
 * as the one colour system. Single source: a hex or font stack appearing
 * anywhere else under app/ai-cleared is a bug (the simulators are the one
 * exception, because each recreates a vendor's own chrome). */
import type { DataClass, Verdict } from "./types";

export const K = Object.freeze({
  ground: "#f3ede4",
  panel: "#ffffff",
  panelRaise: "#faf7f1",
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
  crit: "#a63a08",
  critSoft: "rgba(166,58,8,0.10)",

  /* the header's translucent ground, and the shadow under lifted cards */
  headerBg: "rgba(243,237,228,0.92)",
  lift: "0 12px 40px rgba(20,22,29,0.12)",

  sans: "var(--font-inter), Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "var(--font-geist-mono), 'Geist Mono', ui-monospace, Consolas, monospace",
});

export const CLASS_COLOUR: Record<DataClass, { ink: string; soft: string }> = {
  P: { ink: "#3f7f96", soft: "rgba(63,127,150,0.12)" },
  I: { ink: "#0a7085", soft: "rgba(10,112,133,0.12)" },
  C: { ink: "#8a5400", soft: "rgba(138,84,0,0.12)" },
  R: { ink: "#a63a08", soft: "rgba(166,58,8,0.12)" },
};

export const VERDICT_COLOUR: Record<Verdict, { ink: string; soft: string; label: string }> = {
  ok: { ink: K.ok, soft: K.okSoft, label: "Cleared" },
  warn: { ink: K.warn, soft: K.warnSoft, label: "Over-shared" },
  crit: { ink: K.crit, soft: K.critSoft, label: "Leaked" },
};
