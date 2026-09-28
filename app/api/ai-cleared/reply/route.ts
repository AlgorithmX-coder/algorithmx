import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { getModule } from "@/app/ai-cleared/manifests";
import { realDataCheck } from "@/app/ai-cleared/engine/rules";
import { TRACKS, resolveTrack } from "@/app/ai-cleared/engine/types";
import { scriptedReply, voiceFor } from "@/app/ai-cleared/engine/voices";

/* POST /api/ai-cleared/reply
 * The assistant answers the prompt as sent, in the simulator's voice,
 * streamed back as chunked plain text (the client appends chunks to the
 * bubble). A refusal or an outage becomes the scripted reply, never a
 * blank bubble. Nothing is stored. */

export const runtime = "nodejs";

const Body = z.object({
  prompt: z.string().min(1).max(4000),
  module: z.number().int().min(1).max(5),
  track: z.enum(TRACKS),
  tool: z.enum(["copilot", "chatgpt", "gemini", "claude"]),
  firmName: z.string().max(120).optional(),
});

let client: Anthropic | null = null;
function anthropic(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ maxRetries: 1, timeout: 30_000 });
  return client;
}

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Accel-Buffering": "no",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const { prompt, module, track, tool, firmName } = parsed.data;

  const manifest = getModule(module);
  if (!manifest) return Response.json({ error: "No such module." }, { status: 404 });
  const { block, track: resolvedTrack } = resolveTrack(manifest, track);
  if (!block.dataPack) return Response.json({ error: "This module has no sandbox." }, { status: 404 });
  if (realDataCheck(prompt, block.dataPack)) return Response.json({ error: "Halted: that looks like real data." }, { status: 422 });

  const fallback = scriptedReply(module, resolvedTrack, prompt);
  const ai = anthropic();
  if (!ai) return new Response(fallback, { headers: TEXT_HEADERS });

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = 0;
      try {
        const stream = ai.messages.stream({
          model: "claude-opus-5",
          max_tokens: 600,
          thinking: { type: "disabled" },
          output_config: { effort: "low" },
          system: [{ type: "text", text: voiceFor(tool, firmName ?? "the firm"), cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: prompt }],
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
        console.error("[ai-cleared/reply] model call failed, scripted reply served", err instanceof Error ? err.message : err);
        if (sent === 0) controller.enqueue(encoder.encode(fallback));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, { headers: TEXT_HEADERS });
}
