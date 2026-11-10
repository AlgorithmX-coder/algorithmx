import type { Grid } from "./types";

/* Just enough of Excel's formulas for the office jobs: numbers, cell
 * references (B4), + - * / with brackets, and SUM, AVERAGE, COUNT, MIN and
 * MAX over a range (G2:G11) or a list. A formula that cannot be worked out
 * shows #VALUE!, a loop shows #REF!, as Excel would. Text cells count as
 * nothing in a sum, also as in Excel. */

export const colLetter = (c: number) => String.fromCharCode(65 + c);
export const cellName = (r: number, c: number) => `${colLetter(c)}${r + 1}`;

function parseRef(ref: string): [number, number] | null {
  const m = /^([A-Z])([0-9]{1,3})$/.exec(ref.toUpperCase());
  if (!m) return null;
  return [Number(m[2]) - 1, m[1].charCodeAt(0) - 65];
}

const toNumber = (text: string): number | null => {
  const t = text.replace(/[£,\s]/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

class Bad extends Error {}
/* A cell that leads back to itself, however far round. */
class Loop extends Error {}

export function evaluate(g: Grid, r: number, c: number, seen: Set<string> = new Set()): number | string {
  const raw = (g[r]?.[c] ?? "").trim();
  if (!raw.startsWith("=")) return raw;
  const here = cellName(r, c);
  if (seen.has(here)) return "#REF!";
  const next = new Set(seen).add(here);
  try {
    const v = new Parser(raw.slice(1), (rr, cc) => evaluate(g, rr, cc, next)).run();
    return Number.isFinite(v) ? Math.round(v * 1e6) / 1e6 : "#DIV/0!";
  } catch (e) {
    return e instanceof Loop ? "#REF!" : "#VALUE!";
  }
}

/* What a cell shows: its worked-out value, money kept to two places when
 * the formula reads money. */
export function display(g: Grid, r: number, c: number): string {
  const v = evaluate(g, r, c);
  if (typeof v === "number") {
    const raw = g[r]?.[c] ?? "";
    return /£/.test(raw) ? `£${v.toFixed(2)}` : String(v);
  }
  return v;
}

/* A cell's value as a number, or null when it is text or empty. */
export function numeric(g: Grid, r: number, c: number): number | null {
  const v = evaluate(g, r, c);
  return typeof v === "number" ? v : toNumber(v);
}

class Parser {
  private i = 0;
  constructor(
    private src: string,
    private get: (r: number, c: number) => number | string,
  ) {
    this.src = src.replace(/\s+/g, "").toUpperCase();
  }

  run(): number {
    const v = this.expr();
    if (this.i !== this.src.length) throw new Bad();
    return v;
  }

  private peek() {
    return this.src[this.i];
  }

  private expr(): number {
    let v = this.term();
    while (this.peek() === "+" || this.peek() === "-") {
      const op = this.src[this.i++];
      const w = this.term();
      v = op === "+" ? v + w : v - w;
    }
    return v;
  }

  private term(): number {
    let v = this.factor();
    while (this.peek() === "*" || this.peek() === "/") {
      const op = this.src[this.i++];
      const w = this.factor();
      v = op === "*" ? v * w : v / w;
    }
    return v;
  }

  private factor(): number {
    const ch = this.peek();
    if (ch === "-") {
      this.i++;
      return -this.factor();
    }
    if (ch === "(") {
      this.i++;
      const v = this.expr();
      if (this.src[this.i++] !== ")") throw new Bad();
      return v;
    }
    const num = /^[0-9]+(\.[0-9]+)?/.exec(this.src.slice(this.i));
    if (num) {
      this.i += num[0].length;
      return Number(num[0]);
    }
    const fn = /^(SUM|AVERAGE|COUNT|MIN|MAX)\(/.exec(this.src.slice(this.i));
    if (fn) {
      this.i += fn[0].length;
      const values = this.args();
      return this.apply(fn[1], values);
    }
    const ref = /^[A-Z][0-9]{1,3}/.exec(this.src.slice(this.i));
    if (ref) {
      this.i += ref[0].length;
      const at = parseRef(ref[0]);
      if (!at) throw new Bad();
      const v = this.get(at[0], at[1]);
      if (typeof v === "number") return v;
      if (v === "#REF!") throw new Loop();
      if (v.startsWith("#")) throw new Bad();
      return toNumber(v) ?? 0;
    }
    throw new Bad();
  }

  /* The inside of SUM( ... ): ranges, cells and numbers split by commas.
   * Text and empty cells are skipped, as Excel skips them. */
  private args(): number[] {
    const out: number[] = [];
    for (;;) {
      const range = /^([A-Z][0-9]{1,3}):([A-Z][0-9]{1,3})/.exec(this.src.slice(this.i));
      if (range) {
        this.i += range[0].length;
        const a = parseRef(range[1]);
        const b = parseRef(range[2]);
        if (!a || !b) throw new Bad();
        for (let r = Math.min(a[0], b[0]); r <= Math.max(a[0], b[0]); r++)
          for (let c = Math.min(a[1], b[1]); c <= Math.max(a[1], b[1]); c++) {
            const v = this.get(r, c);
            if (v === "#REF!") throw new Loop();
            const n = typeof v === "number" ? v : toNumber(v);
            if (n !== null) out.push(n);
          }
      } else {
        out.push(this.expr());
      }
      const ch = this.src[this.i++];
      if (ch === ")") return out;
      if (ch !== ",") throw new Bad();
    }
  }

  private apply(fn: string, xs: number[]): number {
    switch (fn) {
      case "SUM":
        return xs.reduce((a, b) => a + b, 0);
      case "AVERAGE":
        return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
      case "COUNT":
        return xs.length;
      case "MIN":
        return xs.length ? Math.min(...xs) : 0;
      default:
        return xs.length ? Math.max(...xs) : 0;
    }
  }
}
