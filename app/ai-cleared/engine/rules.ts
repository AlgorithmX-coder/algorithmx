import { CLASS_RANK, type DataClass, type DataPack, type Verdict } from "./types";

/* The rules layer: the first, instant grader. Runs in the browser before
 * anything leaves it, and again on the server so the grade route never
 * trusts client findings. Pure functions over a DataPack, no state. */

export interface Finding {
  start: number;
  end: number;
  text: string;
  cls: DataClass;
  label: string;
  placeholder: string;
  /* Filled by the model grader when it runs; a default line otherwise. */
  why?: string;
}

const compiled = new WeakMap<DataPack, { re: RegExp; cls: DataClass; label: string; placeholder: string }[]>();
function entities(pack: DataPack) {
  let list = compiled.get(pack);
  if (!list) {
    list = pack.entities.map((e) => {
      const flags = e.flags ?? "gi";
      return {
        re: new RegExp(e.pattern, flags.includes("g") ? flags : flags + "g"),
        cls: e.cls,
        label: e.label,
        placeholder: e.placeholder,
      };
    });
    compiled.set(pack, list);
  }
  return list;
}

/* Every pack entity found in the text, earliest first, overlaps removed
 * (the longer match wins). */
export function ruleFindings(text: string, pack: DataPack): Finding[] {
  const out: Finding[] = [];
  for (const e of entities(pack)) {
    e.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = e.re.exec(text))) {
      if (m[0].length === 0) {
        e.re.lastIndex++;
        continue;
      }
      if (m[0].trim().length < 3) continue;
      out.push({ start: m.index, end: m.index + m[0].length, text: m[0], cls: e.cls, label: e.label, placeholder: e.placeholder });
    }
  }
  out.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Finding[] = [];
  let last = -1;
  for (const f of out) {
    if (f.start >= last) {
      merged.push(f);
      last = f.end;
    }
  }
  return merged;
}

/* Identifiers that match a real-world pattern but are NOT in the practice
 * pack. If one appears, the send is halted in the browser and nothing is
 * transmitted. This is the guarantee the corporate page makes. */
const REAL: { re: RegExp; what: string }[] = [
  { re: /\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/g, what: "a National Insurance number" },
  { re: /\b\d{2}-\d{2}-\d{2}\b/g, what: "a sort code" },
  { re: /\b\d{8}\b/g, what: "an account number" },
  { re: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, what: "an email address" },
  { re: /\b(?:\+44\s?7|07)\d{3}\s?\d{6}\b/g, what: "a mobile number" },
  { re: /\b(?:\d[ -]?){15,16}\b/g, what: "a card number" },
];

export function realDataCheck(text: string, pack: DataPack): string | null {
  const covered = ruleFindings(text, pack);
  const inPack = (s: number, e: number) => covered.some((f) => s >= f.start && e <= f.end);
  for (const r of REAL) {
    r.re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = r.re.exec(text))) {
      if (!inPack(m.index, m.index + m[0].length)) return r.what;
    }
  }
  return null;
}

/* CONFIDENTIAL out = over-shared; RESTRICTED out = leaked. INTERNAL is
 * allowed in the firm's enterprise tool, which is what Module 2 uses. */
export function verdictOf(findings: Finding[]): Verdict {
  const top = findings.reduce((a, f) => Math.max(a, CLASS_RANK[f.cls]), -1);
  return top >= 3 ? "crit" : top === 2 ? "warn" : "ok";
}

export function classCounts(findings: Finding[]): Record<DataClass, number> {
  const n: Record<DataClass, number> = { P: 0, I: 0, C: 0, R: 0 };
  for (const f of findings) n[f.cls]++;
  return n;
}

/* The prompt split into plain and flagged runs, for the redacted echo. */
export function segments(text: string, findings: Finding[]): { text: string; cls?: DataClass }[] {
  const out: { text: string; cls?: DataClass }[] = [];
  let i = 0;
  for (const f of findings) {
    if (f.start > i) out.push({ text: text.slice(i, f.start) });
    out.push({ text: f.text, cls: f.cls });
    i = f.end;
  }
  if (i < text.length) out.push({ text: text.slice(i) });
  return out;
}

/* Deterministic rewrite: PUBLIC and INTERNAL stay, CONFIDENTIAL becomes its
 * placeholder, RESTRICTED is dropped and the pack's fallback line is added. */
export function localRewrite(text: string, findings: Finding[], pack: DataPack): string {
  let out = "";
  let i = 0;
  for (const f of findings) {
    out += text.slice(i, f.start) + (f.cls === "I" || f.cls === "P" ? f.text : f.placeholder);
    i = f.end;
  }
  out = (out + text.slice(i)).replace(/\s{2,}/g, " ").replace(/\s+([.,;])/g, "$1").trim();
  if (findings.some((f) => f.cls === "R") && pack.restrictedFallback) out += " " + pack.restrictedFallback;
  return out;
}

/* Does a candidate rewrite still carry anything above INTERNAL? Used to
 * validate the model's rewrite before showing it. */
export function isClean(text: string, pack: DataPack): boolean {
  return verdictOf(ruleFindings(text, pack)) === "ok";
}
