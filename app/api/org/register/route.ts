import { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";
import { getAdminContext, getRegister, registerCsv } from "@/app/lib/aiClearedAdmin";

/* GET /api/org/register[?format=csv]
 * The firm's training register for its admins and managers. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const ctx = await getAdminContext(session.user.id);
  if (!ctx) return Response.json({ error: "Not an admin." }, { status: 403 });

  const rows = await getRegister(ctx.orgId);
  if (new URL(req.url).searchParams.get("format") === "csv") {
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(registerCsv(rows, ctx.org.name), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="AI-Cleared-register-${ctx.org.slug}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return Response.json({ rows });
}
