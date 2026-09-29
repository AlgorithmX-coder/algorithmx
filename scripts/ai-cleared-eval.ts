/* The AI Cleared grader eval from the command line: forty prompts through
 * the real grader with the model on, scored on what the rules layer
 * cannot check. The same run is available to staff from the ops console.
 *
 *   npm run eval:ai-cleared
 *
 * Needs ANTHROPIC_API_KEY. Without it the script explains and exits 2, so
 * a CI job without the key is a skip, not a failure. Exits 1 when the
 * pass rate is under the bar. Nothing here touches the database. */

import { EVAL_BANK } from "../app/ai-cleared/engine/evalBank";
import { EVAL_BAR, runEvalCase } from "../app/lib/aiClearedEval";
import { modelAvailable } from "../app/lib/aiClearedGrader";

async function main() {
  if (!modelAvailable()) {
    console.log("ai-cleared eval: no ANTHROPIC_API_KEY, nothing to evaluate (the rules layer is covered by vitest).");
    process.exit(2);
  }
  let passed = 0;
  const t0 = Date.now();
  for (const c of EVAL_BANK) {
    const r = await runEvalCase(c);
    if (r.pass) passed++;
    console.log(`${r.pass ? "PASS" : "FAIL"}  ${r.id}  ${String(r.ms).padStart(5)}ms  ${r.verdict}`);
    for (const k of r.failed) console.log(`      ${r.id}: ${k.name}${k.detail ? ` :: ${k.detail}` : ""}`);
  }
  const rate = passed / EVAL_BANK.length;
  console.log(`\n${passed}/${EVAL_BANK.length} passed (${Math.round(rate * 100)}%) in ${Math.round((Date.now() - t0) / 1000)}s. Bar is ${Math.round(EVAL_BAR * 100)}%.`);
  process.exit(rate >= EVAL_BAR ? 0 : 1);
}

main().catch((e) => {
  console.error("eval failed to run:", e instanceof Error ? e.message : e);
  process.exit(1);
});
