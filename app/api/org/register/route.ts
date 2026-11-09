import { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";
import { getAdminContext, orgRefOf, getTeam, teamCsv } from "@/app/lib/aiClearedAdmin";

/* GET /api/org/register[?format=csv]
 * The firm's Cyber Secured register for its admins and managers: every
 * person once, with their progress on every course. */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const ctx = await getAdminContext(session.user.id, orgRefOf(req));
  if (!ctx) return Response.json({ error: "Not an admin." }, { status: 403 });

  const team = await getTeam(ctx.orgId);
  if (new URL(req.url).searchParams.get("format") === "csv") {
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(teamCsv(team, ctx.org.name), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="Cyber-Secured-register-${ctx.org.slug}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }
  return Response.json(team);
}
