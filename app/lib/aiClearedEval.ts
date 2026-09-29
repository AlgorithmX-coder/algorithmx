import { EVAL_BANK, type EvalCase } from "@/app/ai-cleared/engine/evalBank";
import { DEFAULT_COACH, DEFAULT_WHY } from "@/app/ai-cleared/engine/grading";
import { isClean } from "@/app/ai-cleared/engine/rules";
import { resolveTrack } from "@/app/ai-cleared/engine/types";
import { getModule } from "@/app/ai-cleared/manifests";
import { gradePrompt } from "@/app/lib/aiClearedGrader";

/* The grader eval, shared by the command-line script and the ops console:
 * one eval case through the real grader, scored on what the rules layer
 * cannot check. Never import from a client component. */

export const EVAL_BAR = 0.9;
const AMERICAN = /\b(organize|organized|color|analyze|favorite|behavior|center|realize|apologize)\b/i;

export interface EvalCheck {
  name: string;
  ok: boolean;
  detail?: string;
}

export interface EvalResult {
  id: string;
  note: string;
  ms: number;
  verdict: string;
  pass: boolean;
  failed: EvalCheck[];
  coach?: string;
}

export function checksFor(c: EvalCase, out: Awaited<ReturnType<typeof gradePrompt>>): EvalCheck[] {
  const pack = resolveTrack(getModule(2)!, c.track).block.dataPack!;
  const checks: EvalCheck[] = [];
  if ("halted" in out) {
    checks.push({ name: "halted as expected", ok: out.halted === c.halted, detail: out.halted });
    return checks;
  }
  if ("error" in out) {
    checks.push({ name: "graded", ok: false, detail: out.error });
    return checks;
  }
  checks.push({ name: "model answered", ok: out.source === "model", detail: out.source });
  checks.push({ name: "verdict unchanged by the model", ok: out.verdict === c.verdict, detail: out.verdict });

  const sentences = out.coach.split(/(?<=[.?])\s+/).filter(Boolean).length;
  checks.push({ name: "coach is one sentence, no exclamation", ok: sentences <= 1 && !out.coach.includes("!"), detail: out.coach });
  checks.push({ name: "coach under 45 words", ok: out.coach.split(/\s+/).length <= 45 });
  checks.push({ name: "coach is not the default line", ok: out.coach !== DEFAULT_COACH[out.verdict] });
  checks.push({ name: "coach in British English", ok: !AMERICAN.test(out.coach) });
  checks.push({ name: "coach leaks nothing", ok: isClean(out.coach, pack) });
  checks.push({ name: "why lines leak nothing", ok: isClean(out.findings.map((f) => f.why).join(" "), pack) });

  if (out.findings.length) {
    checks.push({ name: "every why line is the model's, not the default", ok: out.findings.every((f) => f.why !== DEFAULT_WHY[f.cls]) });
    checks.push({ name: "every finding is in the prompt", ok: out.findings.every((f) => c.prompt.toLowerCase().includes(f.text.toLowerCase())) });
  }
  if (out.verdict !== "ok") {
    checks.push({ name: "rewrite is clean", ok: isClean(out.rewrite, pack) });
    checks.push({ name: "rewrite differs from the prompt", ok: out.rewrite.trim() !== c.prompt.trim() });
    if (out.findings.some((f) => f.cls === "C")) checks.push({ name: "rewrite keeps a placeholder for CONFIDENTIAL", ok: /\[[^\]]+\]/.test(out.rewrite), detail: out.rewrite });
  }
  if (c.tool !== "copilot") {
    checks.push({ name: "coach mentions the tool or the account", ok: /chatgpt|gemini|claude|personal|account|tool|workspace/i.test(out.coach), detail: out.coach });
  }
  return checks;
}

export async function runEvalCase(c: EvalCase): Promise<EvalResult> {
  const started = Date.now();
  const out = await gradePrompt({ prompt: c.prompt, module: 2, track: c.track, tool: c.tool, firmName: "Marlow Fenwick LLP" });
  const ms = Date.now() - started;
  const checks = checksFor(c, out);
  const failed = checks.filter((k) => !k.ok);
  const verdict = "halted" in out ? `halted (${out.halted})` : "error" in out ? `error (${out.error})` : `${out.verdict} via ${out.source}`;
  return { id: c.id, note: c.note, ms, verdict, pass: failed.length === 0, failed, coach: "coach" in out ? out.coach : undefined };
}

/* A slice of the bank, run with a little concurrency. */
export async function runEvalSlice(from: number, count: number, concurrency = 4): Promise<EvalResult[]> {
  const cases = EVAL_BANK.slice(from, from + count);
  const results: EvalResult[] = new Array(cases.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, cases.length) }, async () => {
      while (next < cases.length) {
        const i = next++;
        results[i] = await runEvalCase(cases[i]);
      }
    }),
  );
  return results;
}
