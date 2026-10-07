import { NextRequest } from "next/server";
import { z } from "zod";
import { anthropicClient, safeErrorMessage } from "@/app/lib/anthropicClient";
import { auth } from "@/app/lib/auth";
import { ALLOWANCE_MESSAGE, modelAllowance, recordModelCall } from "@/app/lib/modelAllowance";
import { manifestFor } from "@/app/lib/courseModules";
import { realDataCheck } from "@/app/ai-cleared/engine/rules";
import { TRACKS, practisesOf, resolveTrack, type AttachedDocument } from "@/app/ai-cleared/engine/types";
import { voiceFor } from "@/app/ai-cleared/engine/voices";
import { fluentScriptedReply } from "@/app/ai-fluent/engine/scripted";

/* POST /api/ai-fluent/reply
 * The assistant answers the latest prompt in the simulator's voice, with
 * the conversation so far and the practice's material in front of it,
 * streamed back as chunked plain text. A refusal or an outage becomes the
 * scripted reply, never a blank bubble. Nothing is stored. */

export const runtime = "nodejs";

const Body = z.object({
  prompt: z.string().min(1).max(4000),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(6000) })).max(12).optional(),
  module: z.number().int().min(1).max(9),
  track: z.enum(TRACKS),
  tool: z.enum(["copilot", "chatgpt", "gemini", "claude"]),
  practise: z.number().int().min(0).max(4).optional(),
  firmName: z.string().max(120).optional(),
});

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Accel-Buffering": "no",
};

function materialText(doc: AttachedDocument): string {
  return `${doc.title} (${doc.kind})\n${doc.sections.map((s) => `## ${s.heading}\n${s.paragraphs.map((p) => p.text).join("\n")}`).join("\n\n")}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if ((await modelAllowance(session.user.id)).over) return Response.json({ error: ALLOWANCE_MESSAGE }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const { prompt, history = [], module, track, tool, firmName } = parsed.data;

  const manifest = manifestFor("ai-fluent", module);
  if (!manifest) return Response.json({ error: "No such module." }, { status: 404 });
  const { block } = resolveTrack(manifest, track);
  const list = practisesOf(block);
  const practise = list[parsed.data.practise ?? 0];
  const loop = practise?.kind === "loop" ? practise : null;
  if (block.dataPack && realDataCheck(prompt, block.dataPack)) return Response.json({ error: "Halted: that looks like real data." }, { status: 422 });

  const material = loop?.material ? materialText(loop.material) : undefined;
  const turn = history.filter((h) => h.role === "user").length + 1;
  const fallback = fluentScriptedReply(prompt, turn, material);
  const ai = anthropicClient({ timeout: 20_000 });
  if (!ai) return new Response(fallback, { headers: TEXT_HEADERS });
  await recordModelCall(session.user.id, "AI_FLUENT", "reply");

  const system = [
    voiceFor(tool, firmName ?? "the firm"),
    material ? `The user has attached this document; answer from it and do not invent figures that are not in it:\n\n${material}` : "",
    loop?.webMode ? "Web search is on. When the user asks for sources, end with a numbered list of four sources, each with a publisher and a year; keep them plausible and specific." : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = 0;
      try {
        /* Sonnet 5.5 (owner call: efficient model per task) - same as
           ai-cleared/reply: omit `thinking` (Sonnet 5.5 rejects
           "disabled"; its default adaptive mode at effort "low" rarely
           engages on chat turns). */
        const stream = ai.messages.stream({
          model: "claude-sonnet-5-5",
          max_tokens: 700,
          output_config: { effort: "low" },
          system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }],
          messages: [...history.map((h) => ({ role: h.role, content: h.text })), { role: "user" as const, content: prompt }],
        });
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta" && event.delta.text) {
            controller.enqueue(encoder.encode(event.delta.text));
            sent += event.delta.text.length;
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal" || sent === 0) {
          controller.enqueue(encoder.encode((sent ? "\n\n" : "") + fallback));
        }
      } catch (err) {
        console.error("[ai-fluent/reply] model call failed, scripted reply served:", safeErrorMessage(err));
        if (sent === 0) controller.enqueue(encoder.encode(fallback));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, { headers: TEXT_HEADERS });
}
