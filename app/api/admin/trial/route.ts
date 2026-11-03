import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { prisma } from "@/app/lib/prisma";
import { grantTrial, clearTrial } from "@/app/lib/orgTrial";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/admin/trial: grant a 1-2 day trial to a school or firm (same
 * Organisation row either way). DELETE: clear a trial, once staff set a
 * real licence up. Staff only, shared by both admin tabs. */

const Ref = z.object({ orgId: z.string().optional(), slug: z.string().optional() });
const PostBody = Ref.extend({ days: z.union([z.literal(1), z.literal(2)]) });

async function resolveOrgId(ref: { orgId?: string; slug?: string }): Promise<string | null> {
  if (ref.orgId) return ref.orgId;
  if (ref.slug) {
    const org = await prisma.organisation.findUnique({ where: { slug: ref.slug }, select: { id: true } });
    return org?.id ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = PostBody.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const orgId = await resolveOrgId(parsed.data);
  if (!orgId) return Response.json({ error: "That organisation does not exist." }, { status: 404 });
  const trialExpiresAt = await grantTrial(orgId, parsed.data.days, { name: firstNameOf(session.user.name, session.user.email), email: session.user.email ?? null });
  return Response.json({ ok: true, trialExpiresAt: trialExpiresAt.toISOString() });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Ref.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const orgId = await resolveOrgId(parsed.data);
  if (!orgId) return Response.json({ error: "That organisation does not exist." }, { status: 404 });
  await clearTrial(orgId);
  return Response.json({ ok: true });
}
