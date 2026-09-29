import { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { lookup } from "@/app/lib/aiClearedOps";

/* GET /api/ops/lookup?q=<serial or email>: staff look a certificate or a
 * person up across every firm. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (q.trim().length < 3) return Response.json({ hits: [] });
  return Response.json({ hits: await lookup(q) });
}
