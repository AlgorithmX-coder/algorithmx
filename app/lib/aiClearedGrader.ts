import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { getModule } from "@/app/ai-cleared/manifests";
import { classCounts, isClean, localRewrite, realDataCheck, ruleFindings, verdictOf } from "@/app/ai-cleared/engine/rules";
import { CLASS_DEFAULT_NAME, TOOL_LABEL, resolveTrack, type DataClass, type Tool, type Track, type Verdict } from "@/app/ai-cleared/engine/types";
import { GRADER_RULES } from "@/app/ai-cleared/engine/voices";
import { DEFAULT_COACH, DEFAULT_WHY } from "@/app/ai-cleared/engine/grading";

/* The sandbox grader, shared by the API route and the eval script. Rules
 * first (instant, deterministic), then Claude for the why lines, the
 * rewrite and one sentence of coaching, as structured output. Never
 * touches the database. */

export interface GradeInput {
  prompt: string;
  module: number;
  track: Track;
  tool: Tool;
  classNames?: Partial<Record<DataClass, string>>;
  firmName?: string;
}

export interface GradeFinding {
  text: string;
  cls: DataClass;
  why: string;
}

export type GradeOutput =
  | { halted: string }
  | { error: string; status: number }
  | {
      verdict: Verdict;
      findings: GradeFinding[];
      rewrite: string;
      coach: string;
      counts: Record<DataClass, number>;
      source: "rules" | "model";
    };

const Grade = z.object({
  findings: z.array(
    z.object({
      text: z.string(),
      cls: z.enum(["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"]),
      why: z.string(),
    }),
  ),
  rewrite: z.string(),
  coach: z.string(),
});

const NAME_TO_CLS: Record<string, DataClass> = { PUBLIC: "P", INTERNAL: "I", CONFIDENTIAL: "C", RESTRICTED: "R" };

let client: Anthropic | null = null;
function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ maxRetries: 1, timeout: 20_000 });
  return client;
}

export function modelAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function gradePrompt(input: GradeInput): Promise<GradeOutput> {
  const { prompt, module, track, tool, firmName } = input;
  const names = { ...CLASS_DEFAULT_NAME, ...(input.classNames ?? {}) };

  const manifest = getModule(module);
  if (!manifest) return { error: "No such module.", status: 404 };
  const { block } = resolveTrack(manifest, track);
  const pack = block.dataPack;
  if (!pack) return { error: "This module has no sandbox.", status: 404 };

  /* The real-data halt, enforced again server-side. */
  const real = realDataCheck(prompt, pack);
  if (real) return { halted: real };

  const findings = ruleFindings(prompt, pack);
  const verdict = verdictOf(findings);
  const base = {
    verdict,
    findings: findings.map((f) => ({ text: f.text, cls: f.cls, why: DEFAULT_WHY[f.cls] })),
    rewrite: localRewrite(prompt, findings, pack),
    coach: DEFAULT_COACH[verdict],
    counts: classCounts(findings),
    source: "rules" as const,
  };

  const ai = anthropic();
  if (!ai) return base;

  try {
    const tierNote =
      tool === "copilot"
        ? "The tool is the firm's enterprise Copilot, so INTERNAL is allowed."
        : `The tool is ${TOOL_LABEL[tool]} on an account the firm has not approved, so even INTERNAL should not be there.`;
    const res = await ai.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1200,
      thinking: { type: "disabled" },
      output_config: { effort: "low", format: zodOutputFormat(Grade) },
      system: [
        {
          type: "text",
          text: `${GRADER_RULES}\n\nPractice data pack (all invented): ${pack.facts}`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Firm: ${firmName ?? "the firm"}. The firm calls the classes ${names.P}, ${names.I}, ${names.C}, ${names.R}. ${tierNote}\nRules layer found: ${JSON.stringify(base.findings.map((f) => ({ text: f.text, cls: CLASS_DEFAULT_NAME[f.cls] })))}\n\nLearner's prompt:\n"""${prompt}"""`,
        },
      ],
    });
    const out = res.parsed_output;
    if (res.stop_reason === "refusal" || !out) return base;

    const why = new Map<string, string>();
    for (const f of out.findings) if (f.text && f.why) why.set(f.text.trim().toLowerCase(), f.why.trim());
    const merged: GradeFinding[] = base.findings.map((f) => ({ ...f, why: why.get(f.text.trim().toLowerCase()) ?? f.why }));
    /* A model-found extra only counts if it is really in the prompt and not already covered. */
    for (const f of out.findings) {
      const t = f.text.trim();
      if (!t || merged.some((m) => m.text.toLowerCase() === t.toLowerCase())) continue;
      if (!prompt.toLowerCase().includes(t.toLowerCase())) continue;
      merged.push({ text: t, cls: NAME_TO_CLS[f.cls], why: f.why.trim() || DEFAULT_WHY[NAME_TO_CLS[f.cls]] });
    }
    const rewrite = out.rewrite.trim() && isClean(out.rewrite, pack) ? out.rewrite.trim() : base.rewrite;
    const coach = out.coach.trim() || base.coach;
    return { ...base, findings: merged, rewrite, coach, source: "model" };
  } catch (err) {
    console.error("[ai-cleared/grade] model call failed, rules-only verdict served", err instanceof Error ? err.message : err);
    return base;
  }
}
