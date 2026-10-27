import { NextRequest } from "next/server";
import { z } from "zod";
import { anthropicClient, safeErrorMessage } from "@/app/lib/anthropicClient";
import { auth } from "@/app/lib/auth";
import { ALLOWANCE_MESSAGE, modelAllowance, recordModelCall } from "@/app/lib/modelAllowance";

/* POST /api/pro/summarise
 * The Cyber Pro note maker: the learner highlights a passage in the lesson
 * and this condenses it into a short revision note, in plain English for a
 * non-technical adult. Streamed back as chunked plain text (the client shows
 * a note that fills in live).
 *
 * Auth-gated and counted against the per-person daily model allowance, the
 * same as the tutor route. When the model key is missing it falls back to
 * the highlighted text itself (tidied), so a note is always captured; when
 * the allowance is spent the client keeps the raw highlight locally instead.
 * Nothing is stored server-side. */

export const runtime = "nodejs";

const Body = z.object({
  title: z.string().min(1).max(200),
  text: z.string().min(1).max(6000),
});

const TEXT_HEADERS = {
  "Content-Type": "text/plain; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Accel-Buffering": "no",
};

/* Tidy the raw highlight into a usable note when the model is unavailable:
 * collapse whitespace and keep it to a sensible length. */
function tidy(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 400 ? clean.slice(0, 397).trimEnd() + "..." : clean;
}

function summariseSystem(): string {
  return `You turn a passage a learner highlighted in a cyber security lesson into a short revision note.

How to write the note:
- Condense the passage to the key points only. Use 1 to 3 short bullet lines, each starting with "- ", or a single short sentence if that is enough.
- Plain English a non-technical adult can revise from later. Keep it tight.
- Keep ONLY facts that are in the passage. Do not add new facts, examples, figures or opinions, and do not pad it out.
- British spelling. Do not use em dashes.
- Output just the note. No preamble, no "Here is", no heading, no sign-off.`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in to make notes." }, { status: 401 });
  if ((await modelAllowance(session.user.id)).over) return Response.json({ error: ALLOWANCE_MESSAGE }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const { title, text } = parsed.data;

  const ai = anthropicClient({ timeout: 20_000 });
  // No model key configured: hand back the tidied highlight so a note is still made.
  if (!ai) return new Response(tidy(text), { headers: TEXT_HEADERS });
  await recordModelCall(session.user.id, "CYBER_PRO", "summarise");

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      let sent = 0;
      try {
        /* Sonnet 5.5 at effort "low": fast and cheap for a short condense.
           System prompt cached across calls. */
        const stream = ai.messages.stream({
          model: "claude-sonnet-5-5",
          max_tokens: 320,
          output_config: { effort: "low" },
          system: [{ type: "text", text: summariseSystem(), cache_control: { type: "ephemeral" } }],
          messages: [{ role: "user", content: `Passage to turn into a note (from the lesson "${title}"):\n\n${text}` }],
        });
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta" && event.delta.text) {
            controller.enqueue(encoder.encode(event.delta.text));
            sent += event.delta.text.length;
          }
        }
        const final = await stream.finalMessage();
        // Refusal or an empty reply: fall back to the tidied highlight.
        if (final.stop_reason === "refusal" || sent === 0) {
          controller.enqueue(encoder.encode(sent === 0 ? tidy(text) : ""));
        }
      } catch (err) {
        console.error("[pro/summarise] model call failed:", safeErrorMessage(err));
        if (sent === 0) controller.enqueue(encoder.encode(tidy(text)));
      } finally {
        controller.close();
      }
    },
  });
  return new Response(body, { headers: TEXT_HEADERS });
}
