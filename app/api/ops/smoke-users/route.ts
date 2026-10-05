import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { prisma } from "@/app/lib/prisma";

/* The post-deploy smoke test used to create a permanent user on every
 * push to main; the sentinel it uses now is the one row that stays.
 * GET counts the leftover rows; DELETE removes them. Staff only. */

const SMOKE_DOMAIN = "@algorithmx-ci.invalid";
const SENTINEL = "ci-smoke-sentinel@algorithmx-ci.invalid";

async function staff() {
  const session = await auth();
  if (!session?.user?.id) return { error: Response.json({ error: "Sign in first." }, { status: 401 }) };
  if (!(await isStaffUser(session.user.id))) return { error: Response.json({ error: "Staff only." }, { status: 403 }) };
  return {};
}

const where = { email: { endsWith: SMOKE_DOMAIN }, NOT: { email: SENTINEL } };

export async function GET() {
  const s = await staff();
  if (s.error) return s.error;
  const [smoke, total] = await Promise.all([prisma.user.count({ where }), prisma.user.count()]);
  return Response.json({ smoke, real: total - smoke - (await prisma.user.count({ where: { email: SENTINEL } })) });
}

export async function DELETE() {
  const s = await staff();
  if (s.error) return s.error;
  const r = await prisma.user.deleteMany({ where });
  return Response.json({ deleted: r.count });
}
