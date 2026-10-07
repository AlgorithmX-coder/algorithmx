import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { anthropicClient, apiKeyStatus, safeErrorMessage } from "@/app/lib/anthropicClient";
import { manifestFor } from "@/app/lib/courseModules";
import { classCounts, localRewrite, realDataCheck, ruleFindings, verdictOf } from "@/app/ai-cleared/engine/rules";
import { DEFAULT_COACH, DEFAULT_WHY, type GradeResult } from "@/app/ai-cleared/engine/grading";
import { RUBRIC_ELEMENTS, RUBRIC_LABEL, practisesOf, resolveTrack, TOOL_LABEL, type LoopPractise, type Tool, type Track } from "@/app/ai-cleared/engine/types";
import { rulesGrade, scoreFrom, verdictFrom } from "@/app/ai-fluent/engine/rubric";
import { FLUENT_COACH, type ElementScore, type FluentGrade, type TurnScore } from "@/app/ai-fluent/engine/grading";

/* The AI Fluent rubric grader, shared by the API route and the eval.
 * Leak rules first (a CONFIDENTIAL or RESTRICTED finding returns the
 * Cleared panel and no Fluent score), then the rules layer for an
 * instant grade, then Claude for the aptness of each element, the move
 * of each turn and one sentence of coaching, as structured output. The
 * verdict is arithmetic over the scores, never the model's word. Never
 * touches the database. */

export interface FluentGradeInput {
  module: number;
  track: Track;
  tool: Tool;
  /* Which practice in the module's list, 0 by default. */
  practise?: number;
  /* The learner's prompts so far, oldest first; the last is the one being graded. */
  turns: string[];
  /* The tool's replies so far, aligned with turns (the last may be absent). */
  replies?: string[];
  firmName?: string;
}

export type FluentGradeOutput = FluentGrade | { halted: string } | { error: string; status: number };

const Grade = z.object({
  elements: z.array(z.object({ key: z.enum(["role", "reader", "task", "format", "length", "constraints", "material", "scope"]), score: z.number().int().min(0).max(2), why: z.string() })),
  turns: z.array(z.object({ i: z.number().int().min(0), move: z.enum(["moved", "repeated", "wandered"]), why: z.string() })),
  coach: z.string(),
});

export const FLUENT_GRADER_RULES = `You are the practice grader inside AI Fluent, a corporate course on getting real work out of AI tools. A learner is working through a practice in a simulated assistant. You score the LEARNER'S PROMPT, never the assistant's reply, against a rubric of prompt elements, and in a multi-turn practice you score whether each turn moved the work forward.

Elements: role (who the tool writes as), reader (who the output is for), task (one clear thing to produce), format (table, list, email, memo), length (a number), constraints (tone, must include, must not), material (the tool is pointed at what it needs), scope (one request per prompt).

Scoring an element: 0 = absent; 1 = present but weak (vague, generic, or wrong for the task); 2 = present and apt for this task and this reader. Score only the elements the rubric requires; you may list others at 0 marks if they are notably absent, but never invent presence. In a conversation that is kept between turns, an element stated on an earlier turn still counts on a later one: a follow-up that only fixes the length has not lost the reader. Scope is judged on the latest turn alone.

Scoring a turn: "moved" = the turn told the tool what was wrong, narrowed, added an element, or asked for a check; "repeated" = it restated the task or re-pasted an earlier prompt; "wandered" = it went to a different task. Turn 0 is always "moved".

Rules for your answer:
- One why line per element and per turn, short, plain, British English, no exclamation marks, addressed to the learner as "you".
- Coaching is one sentence, specific to what happened, never a lecture.
- Never repeat any client name, contact, amount or personal detail from the material or the prompt in a why line or the coaching. Name it by its kind.
- Never score the reply. If the prompt was good and the reply was poor, the prompt still scores well.`;

function anthropic() {
  return anthropicClient({ timeout: 20_000 });
}

export function fluentModelAvailable(): boolean {
  return apiKeyStatus() === "ok";
}

export async function gradeFluent(input: FluentGradeInput): Promise<FluentGradeOutput> {
  const manifest = manifestFor("ai-fluent", input.module);
  if (!manifest) return { error: "No such module.", status: 404 };
  const { block } = resolveTrack(manifest, input.track);
  const list = practisesOf(block);
  const practise = list[input.practise ?? 0];
  if (!practise || practise.kind !== "loop") return { error: "This practice is not graded on the rubric.", status: 404 };
  const loop = practise as LoopPractise;
  const turns = input.turns.map((t) => t.trim()).filter(Boolean);
  if (!turns.length) return { error: "Nothing to grade.", status: 400 };
  const latest = turns[turns.length - 1];
  const turnIndex = Math.min(turns.length - 1, loop.turns.length - 1);
  const rubric = loop.turns[turnIndex]?.rubric;
  const pack = block.dataPack;

  /* The leak layer sits under every Fluent send. */
  if (pack) {
    const real = realDataCheck(latest, pack);
    if (real) return { halted: real };
    const findings = ruleFindings(latest, pack);
    const v = verdictOf(findings);
    if (v !== "ok") {
      const leak: GradeResult = {
        verdict: v,
        findings: findings.map((f) => ({ text: f.text, cls: f.cls, why: DEFAULT_WHY[f.cls] })),
        rewrite: localRewrite(latest, findings, pack),
        coach: DEFAULT_COACH[v],
        counts: classCounts(findings),
        source: "rules",
      };
      return { verdict: "notyet", score: 0, elements: [], turns: [], coach: leak.coach, source: "rules", leak };
    }
  }

  const base = rulesGrade({ turns, rubric, followUp: loop.followUp });
  const ai = anthropic();
  if (!ai) return base;

  try {
    const requires = rubric?.requires ?? [];
    const transcript = turns
      .map((t, i) => {
        const reply = input.replies?.[i];
        return `Turn ${i} (learner): """${t}"""${reply ? `\nTurn ${i} (assistant, for context only, not scored): """${reply.slice(0, 900)}"""` : ""}`;
      })
      .join("\n\n");
    /* Haiku 4.5 (owner call: efficient model per task) - same reasoning
       as aiClearedGrader: short structured verdict with a deterministic
       layer around it. No `thinking` param (off by default on Haiku)
       and no `effort` (rejected on Haiku 4.5). */
    const res = await ai.messages.parse({
      model: "claude-haiku-4-5",
      max_tokens: 1200,
      output_config: { format: zodOutputFormat(Grade) },
      system: [
        {
          type: "text",
          text: `${FLUENT_GRADER_RULES}\n\nThe practice: ${loop.task}\nThe brief the learner was given: ${loop.brief}${loop.material ? `\nThe material the tool has: "${loop.material.title}" (${loop.material.kind}): ${loop.material.sections.map((s) => `${s.heading}: ${s.paragraphs.map((p) => p.text).join(" ")}`).join(" | ").slice(0, 1800)}` : ""}\nThe conversation is ${loop.followUp ? "kept between turns" : "a fresh chat each send"}.`,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Firm: ${input.firmName ?? "the firm"}. Tool: ${TOOL_LABEL[input.tool]}.\nThis turn's rubric requires: ${requires.length ? requires.map((k) => `${k} (${RUBRIC_LABEL[k]})`).join(", ") : "no elements; score the turn's move only"}.\nWhat a good output must do: ${rubric?.goal ?? loop.brief}\nRules layer found present in the latest prompt: ${JSON.stringify(RUBRIC_ELEMENTS.filter((k) => base.elements.find((e) => e.key === k)?.score === 2))}.\nRules layer marked repeated: ${JSON.stringify(base.turns.filter((t) => t.move === "repeated").map((t) => t.i))}.\n\n${transcript}`,
        },
      ],
    });
    const out = res.parsed_output;
    if (res.stop_reason === "refusal" || !out) return base;

    /* Merge: the model's score for every required element; a rules
     * "repeated" is never overturned. */
    const modelEl = new Map(out.elements.map((e) => [e.key, e]));
    const elements: ElementScore[] = requires.map((key) => {
      const m = modelEl.get(key);
      const rulesScore = base.elements.find((e) => e.key === key)?.score ?? 0;
      const score = (m ? Math.max(0, Math.min(2, m.score)) : rulesScore) as 0 | 1 | 2;
      return { key, score, why: m?.why?.trim() || base.elements.find((e) => e.key === key)?.why || "" };
    });
    const modelTurns = new Map(out.turns.map((t) => [t.i, t]));
    const turnsScored: TurnScore[] = base.turns.map((t) => {
      const m = modelTurns.get(t.i);
      if (t.i === 0) return { ...t, why: m?.why?.trim() || t.why };
      if (t.move === "repeated") return { ...t, why: m?.why?.trim() || t.why };
      return { i: t.i, move: m?.move ?? t.move, why: m?.why?.trim() || t.why };
    });
    const verdict = verdictFrom(requires, elements, turnsScored);
    const coach = out.coach.trim() || FLUENT_COACH[verdict];
    return { verdict, score: scoreFrom(requires, elements, turnsScored), elements, turns: turnsScored, coach, source: "model" };
  } catch (err) {
    console.error("[ai-fluent/grade] model call failed, rules-only grade served:", safeErrorMessage(err));
    return base;
  }
}
