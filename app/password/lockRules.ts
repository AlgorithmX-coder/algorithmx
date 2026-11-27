/**
 * The launch gate's aperture lock (landing lab round 8, r8-gate.html): six
 * course-colour arcs around the AlgorithmX cube. Each pair of characters typed
 * seats one arc, capped at five; only the server accepting the password seats
 * the sixth. Pure helpers so the drawing and the rules can be tested.
 */

/** The six streams = the six course colours (heroes, explorers, ops, pro, schools, firms). */
export const GATE_STREAMS = ["#7c5cff", "#0e9f6e", "#0a9bb5", "#f97316", "#d97706", "#4f46e5"] as const;

/** What the page is showing; carried on the root as data-gate. */
export type GateState = "sealed" | "typing" | "checking" | "wrong" | "open";

/** How many arcs are seated for a password of this length. Typing alone never seats the sixth. */
export function seatedArcs(length: number, open: boolean): number {
  if (open) return GATE_STREAMS.length;
  if (length <= 0) return 0;
  return Math.min(GATE_STREAMS.length - 1, Math.ceil(length / 2));
}

const CX = 260;
const CY = 260;
const R = 196;
const pt = (r: number, a: number): [number, number] => [CX + r * Math.cos(a), CY + r * Math.sin(a)];
const round = (n: number) => Math.round(n * 100) / 100;

export type Line = { x1: number; y1: number; x2: number; y2: number };

/** 72 ticks on the outer ring; every sixth is longer and heavier. */
export const GATE_TICKS: (Line & { major: boolean })[] = Array.from({ length: 72 }, (_, i) => {
  const a = (i / 72) * Math.PI * 2;
  const major = i % 6 === 0;
  const [x1, y1] = pt(252, a);
  const [x2, y2] = pt(major ? 238 : 246, a);
  return { x1: round(x1), y1: round(y1), x2: round(x2), y2: round(y2), major };
});

/** Six fixed spokes, each ending in a node in its stream colour. */
export const GATE_SPOKES: (Line & { color: string })[] = GATE_STREAMS.map((color, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 3;
  const [x1, y1] = pt(110, a);
  const [x2, y2] = pt(168, a);
  return { x1: round(x1), y1: round(y1), x2: round(x2), y2: round(y2), color };
});

/** Six arcs on the rotating ring, one per stream, with a small gap between each. */
export const GATE_ARCS: { d: string; color: string }[] = GATE_STREAMS.map((color, i) => {
  const a0 = -Math.PI / 2 + (i * Math.PI) / 3 + 0.1;
  const a1 = a0 + Math.PI / 3 - 0.2;
  const [x0, y0] = pt(R, a0);
  const [x1, y1] = pt(R, a1);
  return { d: `M${round(x0)} ${round(y0)} A${R} ${R} 0 0 1 ${round(x1)} ${round(y1)}`, color };
});

export const GATE_CENTRE = { cx: CX, cy: CY } as const;
