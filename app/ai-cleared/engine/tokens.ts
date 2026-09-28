/* The clearance console. Graphite, not black; paper text at 92%; the four
 * data classes as the one colour system. Single source: a hex or font stack
 * appearing anywhere else under app/ai-cleared is a bug (the simulators are
 * the one exception, because each recreates a vendor's own chrome). The
 * corporate page's photograph never appears in here; the console is its own
 * place. */
import type { DataClass, Verdict } from "./types";

export const K = Object.freeze({
  ground: "#0b1117",
  panel: "#111a22",
  panelRaise: "#16212b",
  sunk: "#080d12",
  edge: "#1f2b36",
  edgeSoft: "rgba(255,255,255,0.07)",

  ink: "rgba(240,244,247,0.92)",
  body: "rgba(226,232,238,0.82)",
  muted: "#93a3b0",
  faint: "#6b7a87",

  accent: "#46b7bf",
  accentInk: "#8ed6db",
  accentSoft: "rgba(70,183,191,0.14)",
  onAccent: "#07141a",

  ok: "#4cc38a",
  okSoft: "rgba(76,195,138,0.14)",
  warn: "#e0a040",
  warnSoft: "rgba(224,160,64,0.14)",
  crit: "#e4655c",
  critSoft: "rgba(228,101,92,0.14)",

  sans: "var(--font-inter), Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "var(--font-geist-mono), 'Geist Mono', ui-monospace, Consolas, monospace",
});

export const CLASS_COLOUR: Record<DataClass, { ink: string; soft: string }> = {
  P: { ink: "#7fb3c8", soft: "rgba(127,179,200,0.16)" },
  I: { ink: "#46b7bf", soft: "rgba(70,183,191,0.16)" },
  C: { ink: "#e0a040", soft: "rgba(224,160,64,0.16)" },
  R: { ink: "#e4655c", soft: "rgba(228,101,92,0.16)" },
};

export const VERDICT_COLOUR: Record<Verdict, { ink: string; soft: string; label: string }> = {
  ok: { ink: K.ok, soft: K.okSoft, label: "Cleared" },
  warn: { ink: K.warn, soft: K.warnSoft, label: "Over-shared" },
  crit: { ink: K.crit, soft: K.critSoft, label: "Leaked" },
};
