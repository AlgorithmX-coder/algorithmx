import { FLUENT_BANK, type FluentCase } from "@/app/ai-fluent/engine/fluentBank";
import { FLUENT_COACH } from "@/app/ai-fluent/engine/grading";
import { isClean } from "@/app/ai-cleared/engine/rules";
import { resolveTrack } from "@/app/ai-cleared/engine/types";
import { getFluentModule } from "@/app/ai-fluent/manifests";
import { gradeFluent, type FluentGradeOutput } from "@/app/lib/aiFluentGrader";
import type { EvalCheck, EvalResult } from "@/app/lib/aiClearedEval";

/* The Fluent grader eval, run from the ops console: one bank case through
 * the real rubric grader, scored on the verdict and on what rules cannot
 * check (the model's own why lines, one British sentence of coaching,
 * nothing confidential repeated). Never import from a client component. */

export const FLUENT_EVAL_BAR = 0.9;
const AMERICAN = /\b(organize|organized|color|analyze|favorite|behavior|center|realize|apologize|summarize|summarized)\b/i;

export function fluentChecksFor(c: FluentCase, out: FluentGradeOutput): EvalCheck[] {
  const pack = resolveTrack(getFluentModule(1)!, "finance").block.dataPack!;
  const checks: EvalCheck[] = [];
  if ("halted" in out) {
    checks.push({ name: "halted as expected", ok: c.verdict === "halt", detail: out.halted });
    return checks;
  }
  if ("error" in out) {
    checks.push({ name: "graded", ok: false, detail: out.error });
    return checks;
  }
  if (c.verdict === "halt") {
    checks.push({ name: "halted as expected", ok: false, detail: "graded instead" });
    return checks;
  }
  if (c.verdict === "leak") {
    checks.push({ name: "leak layer caught it", ok: !!out.leak, detail: out.leak ? out.leak.verdict : "no leak found" });
    return checks;
  }
  checks.push({ name: "no leak reported", ok: !out.leak });
  checks.push({ name: "model answered", ok: out.source === "model", detail: out.source });
  checks.push({ name: "verdict as expected", ok: out.verdict === c.verdict, detail: `${out.verdict} (${out.score}%)` });
  const sentences = out.coach.split(/(?<=[.?])\s+/).filter(Boolean).length;
  checks.push({ name: "coach is one sentence, no exclamation", ok: sentences <= 1 && !out.coach.includes("!"), detail: out.coach });
  checks.push({ name: "coach under 45 words", ok: out.coach.split(/\s+/).length <= 45 });
  checks.push({ name: "coach is not the default line", ok: out.coach !== FLUENT_COACH[out.verdict] });
  checks.push({ name: "coach in British English", ok: !AMERICAN.test(out.coach) });
  checks.push({ name: "coach leaks nothing", ok: isClean(out.coach, pack) });
  checks.push({ name: "why lines leak nothing", ok: isClean([...out.elements.map((e) => e.why), ...out.turns.map((t) => t.why)].join(" "), pack) });
  checks.push({ name: "every required element has a why line", ok: out.elements.every((e) => e.why.trim().length > 0) });
  return checks;
}

export async function runFluentCase(c: FluentCase): Promise<EvalResult> {
  const started = Date.now();
  const out = await gradeFluent({ module: 1, track: "finance", tool: c.tool, practise: 0, turns: c.turns, firmName: "Marlow Fenwick LLP" });
  const ms = Date.now() - started;
  const checks = fluentChecksFor(c, out);
  const failed = checks.filter((k) => !k.ok);
  const verdict = "halted" in out ? `halted (${out.halted})` : "error" in out ? `error (${out.error})` : out.leak ? `leak (${out.leak.verdict})` : `${out.verdict} ${out.score}% via ${out.source}`;
  return { id: c.id, note: c.note, ms, verdict, pass: failed.length === 0, failed, coach: "coach" in out ? out.coach : undefined };
}

export async function runFluentSlice(from: number, count: number, concurrency = 4): Promise<EvalResult[]> {
  const cases = FLUENT_BANK.slice(from, from + count);
  const results: EvalResult[] = new Array(cases.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, cases.length) }, async () => {
      while (next < cases.length) {
        const i = next++;
        results[i] = await runFluentCase(cases[i]);
      }
    }),
  );
  return results;
}
