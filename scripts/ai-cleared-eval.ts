/* The AI Cleared grader eval: forty prompts through the real grader with
 * the model on, scored on what the rules layer cannot check.
 *
 *   npm run eval:ai-cleared
 *
 * Needs ANTHROPIC_API_KEY. Without it the script explains and exits 2, so
 * a CI job without the key is a skip, not a failure. Exits 1 when the
 * pass rate is under the bar. Nothing here touches the database. */

import { EVAL_BANK, type EvalCase } from "../app/ai-cleared/engine/evalBank";
import { DEFAULT_COACH, DEFAULT_WHY } from "../app/ai-cleared/engine/grading";
import { isClean } from "../app/ai-cleared/engine/rules";
import { resolveTrack } from "../app/ai-cleared/engine/types";
import { getModule } from "../app/ai-cleared/manifests";
import { gradePrompt, modelAvailable } from "../app/lib/aiClearedGrader";

const BAR = 0.9;
const AMERICAN = /\b(organize|organized|color|analyze|favorite|behavior|center|realize|apologize)\b/i;

interface Check {
  name: string;
  ok: boolean;
  detail?: string;
}

function checksFor(c: EvalCase, out: Awaited<ReturnType<typeof gradePrompt>>): Check[] {
  const pack = resolveTrack(getModule(2)!, c.track).block.dataPack!;
  const checks: Check[] = [];
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
  /* The coaching and the why lines must never repeat a leaked item. */
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

async function main() {
  if (!modelAvailable()) {
    console.log("ai-cleared eval: no ANTHROPIC_API_KEY, nothing to evaluate (the rules layer is covered by vitest).");
    process.exit(2);
  }
  let passed = 0;
  const failures: string[] = [];
  const t0 = Date.now();
  for (const c of EVAL_BANK) {
    const started = Date.now();
    const out = await gradePrompt({ prompt: c.prompt, module: 2, track: c.track, tool: c.tool, firmName: "Marlow Fenwick LLP" });
    const ms = Date.now() - started;
    const checks = checksFor(c, out);
    const bad = checks.filter((k) => !k.ok);
    const ok = bad.length === 0;
    if (ok) passed++;
    const verdict = "halted" in out ? `halted (${out.halted})` : "error" in out ? `error (${out.error})` : `${out.verdict} via ${out.source}`;
    console.log(`${ok ? "PASS" : "FAIL"}  ${c.id}  ${String(ms).padStart(5)}ms  ${verdict}`);
    for (const k of bad) {
      const line = `      ${c.id}: ${k.name}${k.detail ? ` :: ${k.detail}` : ""}`;
      console.log(line);
      failures.push(line);
    }
  }
  const rate = passed / EVAL_BANK.length;
  console.log(`\n${passed}/${EVAL_BANK.length} passed (${Math.round(rate * 100)}%) in ${Math.round((Date.now() - t0) / 1000)}s. Bar is ${Math.round(BAR * 100)}%.`);
  process.exit(rate >= BAR ? 0 : 1);
}

main().catch((e) => {
  console.error("eval failed to run:", e instanceof Error ? e.message : e);
  process.exit(1);
});
