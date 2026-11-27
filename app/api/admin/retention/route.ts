import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { planRetention, summarise } from "@/app/lib/retention";

/**
 * GET /api/admin/retention: what the data-retention policy would delete
 * today, per category, with the reasons anything is held back and what the
 * policy cannot yet measure.
 *
 * Staff only, like everything under /api/admin. Read only: it builds the
 * same plan the daily job builds and changes nothing. Counts, not rows: no
 * addresses or ids leave the server, so the answer can be pasted into a
 * message without becoming personal data.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });

  return Response.json(summarise(await planRetention()));
}
