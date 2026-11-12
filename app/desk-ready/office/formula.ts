import type { Grid } from "./types";

/* Just enough of Excel's formulas for the office jobs: numbers, cell
 * references (B4), + - * / with brackets, SUM, AVERAGE, COUNT, MIN and
 * MAX over a range (G2:G11), a whole column (F:F) or a list, and COUNTIF
 * and SUMIF with a condition ("Late", ">500"). A formula that cannot be worked out
 * shows #VALUE!, a loop shows #REF!, as Excel would. Text cells count as
 * nothing in a sum, also as in Excel. */

export const colLetter = (c: number) => String.fromCharCode(65 + c);
export const cellName = (r: number, c: number) => `${colLetter(c)}${r + 1}`;

function parseRef(ref: string): [number, number] | null {
  const m = /^([A-Z])([0-9]{1,3})$/.exec(ref.toUpperCase());
  if (!m) return null;
  return [Number(m[2]) - 1, m[1].charCodeAt(0) - 65];
}

/* A range, written either way Excel allows: two corners (F2:F19) or a
 * whole column (F:F, every row of the sheet). ── Module 12 added F:F. ── */
const RANGE = "([A-Z][0-9]{1,3}:[A-Z][0-9]{1,3}|[A-Z]:[A-Z])";

const toNumber = (text: string): number | null => {
  const t = text.replace(/[£,\s]/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};

/* Rewrite the cell references in a formula, leaving text in quotes alone.
 * `fn` gets each reference's row and column (from 0) and returns the new
 * row. Plain values come back unchanged. */
function mapRefs(text: string, fn: (r: number, c: number) => number): string {
  if (!text.trim().startsWith("=")) return text;
  return text
    .split(/("[^"]*")/)
    .map((part, i) => (i % 2 === 1 ? part : part.replace(/\b([A-Za-z])([0-9]{1,3})\b/g, (_, col: string, row: string) => `${col.toUpperCase()}${Math.max(1, fn(Number(row) - 1, col.toUpperCase().charCodeAt(0) - 65) + 1)}`)))
    .join("");
}

/* Copying a formula down by `dr` rows moves every reference with it, as
 * Excel's fill handle does: =E2-F2 in row 2 becomes =E3-F3 in row 3. */
export const shiftRefs = (text: string, dr: number) => mapRefs(text, (r) => r + dr);

/* Moving a whole row (a sort) keeps the row's references to itself: a row
 * that moves from 2 to 5 turns =E2-F2 into =E5-F5, and leaves =SUM(G2:G11)
 * elsewhere alone. */
export const moveRowRefs = (text: string, from: number, to: number) => mapRefs(text, (r) => (r === from ? to : r));

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
    const v = new Parser(raw.slice(1), (rr, cc) => evaluate(g, rr, cc, next), g.length).run();
    return Number.isFinite(v) ? Math.round(v * 1e6) / 1e6 : "#DIV/0!";
  } catch (e) {
    return e instanceof Loop ? "#REF!" : "#VALUE!";
  }
}

export type Format = "money" | "percent";

/* Money looks after itself, as in Excel: a cell typed as £4.50 is money,
 * and so is a formula that works from money (=E2*F2 where F2 is £4.50,
 * or a SUM of such cells). */
function isMoney(g: Grid, r: number, c: number, depth = 0): boolean {
  const raw = (g[r]?.[c] ?? "").trim();
  if (/£/.test(raw)) return true;
  if (!raw.startsWith("=") || depth > 6) return false;
  const up = raw.toUpperCase().replace(/\$/g, "");
  const refs = [...up.matchAll(/\b([A-Z])([0-9]{1,3})\b/g)].map((m) => [Number(m[2]) - 1, m[1].charCodeAt(0) - 65] as const);
  /* a whole column (F:F) is money when any cell in it is */
  for (const m of up.matchAll(/\b([A-Z]):([A-Z])\b/g)) for (let cc = m[1].charCodeAt(0) - 65; cc <= m[2].charCodeAt(0) - 65; cc++) g.forEach((_, rr) => refs.push([rr, cc] as const));
  /* a COUNT of money is a count, not money */
  if (/\b(COUNT|COUNTIF)\(/i.test(raw) && !/\b(SUM|SUMIF|AVERAGE)\(/i.test(raw)) return false;
  return refs.some(([rr, cc]) => !(rr === r && cc === c) && isMoney(g, rr, cc, depth + 1));
}

/* What a cell shows: its worked-out value, as money (£, two places) or a
 * percentage when the cell is formatted that way, or when it works from
 * money. */
export function display(g: Grid, r: number, c: number, format?: Format): string {
  const v = evaluate(g, r, c);
  if (typeof v === "number") {
    if (format === "percent") return `${Math.round(v * 1000) / 10}%`;
    if (format === "money" || isMoney(g, r, c)) return `${v < 0 ? "-" : ""}£${Math.abs(v).toFixed(2)}`;
    return String(v);
  }
  const n = toNumber(v);
  if (n !== null && format === "money") return `£${n.toFixed(2)}`;
  if (n !== null && format === "percent") return `${Math.round(n * 1000) / 10}%`;
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
    /* how many rows the sheet has, for a whole column (F:F) */
    private rows = 0,
  ) {
    /* spaces and case don't matter outside quotes; inside them they do */
    this.src = src
      .split(/("[^"]*")/)
      /* Module 13: a $ fixes a reference when it is copied ($E$12); working
       * the formula out, it reads as the plain reference */
      .map((part, i) => (i % 2 === 1 ? part : part.replace(/\s+/g, "").replace(/\$/g, "").toUpperCase()))
      .join("");
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
    const cond = new RegExp(`^(COUNTIF|SUMIF)\\(${RANGE},`).exec(this.src.slice(this.i));
    if (cond) {
      this.i += cond[0].length;
      const test = this.criterion();
      const cells = this.range(cond[2]);
      let sums = cells;
      if (cond[1] === "SUMIF" && this.peek() === ",") {
        this.i++;
        const sumRange = new RegExp(`^${RANGE}`).exec(this.src.slice(this.i));
        if (!sumRange) throw new Bad();
        this.i += sumRange[0].length;
        sums = this.range(sumRange[1]);
      }
      if (this.src[this.i++] !== ")") throw new Bad();
      let count = 0;
      let total = 0;
      cells.forEach((v, k) => {
        if (!test(v)) return;
        count++;
        const s = sums[k];
        const n = typeof s === "number" ? s : toNumber(s ?? "");
        total += n ?? 0;
      });
      return cond[1] === "COUNTIF" ? count : total;
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

  /* The two corners of a range, from 0. A whole column runs from the top
   * row to the sheet's last. */
  private corners(text: string): [[number, number], [number, number]] {
    const col = /^([A-Z]):([A-Z])$/.exec(text);
    if (col) return [[0, col[1].charCodeAt(0) - 65], [Math.max(0, this.rows - 1), col[2].charCodeAt(0) - 65]];
    const [from, to] = text.split(":");
    const a = parseRef(from);
    const b = parseRef(to);
    if (!a || !b) throw new Bad();
    return [a, b];
  }

  /* Every cell's value in a range, row by row. */
  private range(text: string): (number | string)[] {
    const [a, b] = this.corners(text);
    const out: (number | string)[] = [];
    for (let r = Math.min(a[0], b[0]); r <= Math.max(a[0], b[0]); r++)
      for (let c = Math.min(a[1], b[1]); c <= Math.max(a[1], b[1]); c++) {
        const v = this.get(r, c);
        if (v === "#REF!") throw new Loop();
        out.push(v);
      }
    return out;
  }

  /* COUNTIF's second part: "Late" (text, any case), 5 (a number), a
   * comparison such as ">500" or "<>Late", or a cell holding the thing to
   * match (=SUMIF(C2:C11,I2,G2:G11), one formula copied down a list). */
  private criterion(): (v: number | string) => boolean {
    let text: string;
    const quoted = /^"([^"]*)"/.exec(this.src.slice(this.i));
    const ref = /^[A-Z][0-9]{1,3}(?![0-9:])/.exec(this.src.slice(this.i));
    if (quoted) {
      this.i += quoted[0].length;
      text = quoted[1];
    } else if (ref) {
      this.i += ref[0].length;
      const at = parseRef(ref[0]);
      if (!at) throw new Bad();
      const v = this.get(at[0], at[1]);
      if (v === "#REF!") throw new Loop();
      text = String(v);
    } else {
      const num = /^-?[0-9]+(\.[0-9]+)?/.exec(this.src.slice(this.i));
      if (!num) throw new Bad();
      this.i += num[0].length;
      text = num[0];
    }
    const m = /^(>=|<=|<>|>|<|=)?(.*)$/.exec(text.trim())!;
    const op = m[1] ?? "=";
    const want = m[2].trim();
    const wantN = toNumber(want);
    return (v) => {
      const n = typeof v === "number" ? v : toNumber(v);
      if (wantN !== null && n !== null) {
        if (op === ">") return n > wantN;
        if (op === "<") return n < wantN;
        if (op === ">=") return n >= wantN;
        if (op === "<=") return n <= wantN;
        if (op === "<>") return n !== wantN;
        return n === wantN;
      }
      const same = String(v).trim().toLowerCase() === want.toLowerCase();
      return op === "<>" ? !same : op === "=" ? same : false;
    };
  }

  /* The inside of SUM( ... ): ranges, cells and numbers split by commas.
   * Text and empty cells are skipped, as Excel skips them. */
  private args(): number[] {
    const out: number[] = [];
    for (;;) {
      const range = new RegExp(`^${RANGE}`).exec(this.src.slice(this.i));
      if (range) {
        this.i += range[0].length;
        const [a, b] = this.corners(range[1]);
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
