import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { getModule } from "@/app/ai-cleared/manifests";
import { classCounts, isClean, localRewrite, realDataCheck, ruleFindings, verdictOf } from "@/app/ai-cleared/engine/rules";
import { CLASS_DEFAULT_NAME, TOOL_LABEL, TRACKS, resolveTrack, type DataClass } from "@/app/ai-cleared/engine/types";
import { GRADER_RULES } from "@/app/ai-cleared/engine/voices";
import { DEFAULT_COACH, DEFAULT_WHY } from "@/app/ai-cleared/engine/grading";

/* POST /api/ai-cleared/grade
 * The sandbox grader. Rules first (instant, deterministic, re-run here so
 * the client is never trusted), then Claude for the why lines, the rewrite
 * and one sentence of coaching, as structured output. Nothing is stored:
 * this route never touches the database. */

export const runtime = "nodejs";

const Body = z.object({
  prompt: z.string().min(1).max(4000),
  module: z.number().int().min(1).max(5),
  track: z.enum(TRACKS),
  tool: z.enum(["copilot", "chatgpt", "gemini", "claude"]),
  /* The firm's own class names, so the coaching uses their words. */
  classNames: z.record(z.enum(["P", "I", "C", "R"]), z.string()).optional(),
  firmName: z.string().max(120).optional(),
});

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

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const { prompt, module, track, tool, firmName } = parsed.data;
  const names = { ...CLASS_DEFAULT_NAME, ...(parsed.data.classNames ?? {}) };

  const manifest = getModule(module);
  if (!manifest) return Response.json({ error: "No such module." }, { status: 404 });
  const { block } = resolveTrack(manifest, track);
  const pack = block.dataPack;
  if (!pack) return Response.json({ error: "This module has no sandbox." }, { status: 404 });

  /* The real-data halt, enforced again server-side. */
  const real = realDataCheck(prompt, pack);
  if (real) return Response.json({ halted: real }, { status: 200 });

  const findings = ruleFindings(prompt, pack);
  const verdict = verdictOf(findings);
  const base = {
    verdict,
    findings: findings.map((f) => ({ text: f.text, cls: f.cls, why: DEFAULT_WHY[f.cls] })),
    rewrite: localRewrite(prompt, findings, pack),
    coach: DEFAULT_COACH[verdict],
    counts: classCounts(findings),
    source: "rules" as "rules" | "model",
  };

  const ai = anthropic();
  if (!ai) return Response.json(base);

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
    if (res.stop_reason === "refusal" || !out) return Response.json(base);

    const why = new Map<string, string>();
    for (const f of out.findings) if (f.text && f.why) why.set(f.text.trim().toLowerCase(), f.why.trim());
    const merged = base.findings.map((f) => ({ ...f, why: why.get(f.text.trim().toLowerCase()) ?? f.why }));
    /* A model-found extra only counts if it is really in the prompt and not already covered. */
    for (const f of out.findings) {
      const t = f.text.trim();
      if (!t || merged.some((m) => m.text.toLowerCase() === t.toLowerCase())) continue;
      if (!prompt.toLowerCase().includes(t.toLowerCase())) continue;
      merged.push({ text: t, cls: NAME_TO_CLS[f.cls], why: f.why.trim() || DEFAULT_WHY[NAME_TO_CLS[f.cls]] });
    }
    const rewrite = out.rewrite.trim() && isClean(out.rewrite, pack) ? out.rewrite.trim() : base.rewrite;
    const coach = out.coach.trim() || base.coach;
    return Response.json({ ...base, findings: merged, rewrite, coach, source: "model" });
  } catch (err) {
    console.error("[ai-cleared/grade] model call failed, rules-only verdict served", err instanceof Error ? err.message : err);
    return Response.json(base);
  }
}
