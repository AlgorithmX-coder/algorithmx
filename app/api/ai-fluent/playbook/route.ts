import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getEnrolment, TOOL_TO_DB } from "@/app/lib/aiCleared";

/* POST   /api/ai-fluent/playbook  { module, workflow, tool, prompt, whenToUse?, check? }
 * DELETE /api/ai-fluent/playbook  { id }
 * The one place the platform stores text a learner wrote: their own
 * prompt from a practice, on their Fluent enrolment. Nothing from the
 * tool's reply is ever accepted here. */

const Save = z.object({
  module: z.number().int().min(1).max(9),
  workflow: z.string().min(1).max(40),
  tool: z.enum(["copilot", "chatgpt", "gemini", "claude"]),
  prompt: z.string().min(1).max(4000),
  whenToUse: z.string().max(300).optional().nullable(),
  check: z.string().max(300).optional().nullable(),
});
const Remove = z.object({ id: z.string().min(1) });

const MAX_ENTRIES = 60;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const parsed = Save.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const enrolment = await getEnrolment(session.user.id, "ai-fluent");
  if (!enrolment) return Response.json({ error: "No enrolment." }, { status: 403 });
  const count = await prisma.playbookEntry.count({ where: { enrolmentId: enrolment.id } });
  if (count >= MAX_ENTRIES) return Response.json({ error: "Your playbook is full. Remove an entry to save another." }, { status: 409 });
  const b = parsed.data;
  const row = await prisma.playbookEntry.create({
    data: { enrolmentId: enrolment.id, module: b.module, workflow: b.workflow.trim(), tool: TOOL_TO_DB[b.tool], prompt: b.prompt.trim(), whenToUse: b.whenToUse?.trim() || null, check: b.check?.trim() || null },
  });
  return Response.json({ ok: true, id: row.id });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const parsed = Remove.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const enrolment = await getEnrolment(session.user.id, "ai-fluent");
  if (!enrolment) return Response.json({ error: "No enrolment." }, { status: 403 });
  await prisma.playbookEntry.deleteMany({ where: { id: parsed.data.id, enrolmentId: enrolment.id } });
  return Response.json({ ok: true });
}
