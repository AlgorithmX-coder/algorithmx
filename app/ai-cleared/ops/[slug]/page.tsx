import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { getAdminContext, getRegister, firmStanding } from "@/app/lib/aiClearedAdmin";
import { firstNameOf } from "@/app/lib/aiCleared";
import { CLASS_DEFAULT_NAME } from "../../engine/types";
import Frame from "../../Frame";
import AdminPanel from "../../admin/AdminPanel";

/* /ai-cleared/ops/[slug]: one firm, exactly as its admin sees it, with the
 * same invite, resend, remove, nudge and profile actions. Staff only. */
export const dynamic = "force-dynamic";

const PLAN: Record<string, string> = { TEAM: "Team", FIRM: "Firm", ENTERPRISE: "Enterprise" };

export default async function OpsFirmPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`/ai-cleared/ops/${slug}`)}`);
  if (!(await isStaffUser(session.user.id))) redirect("/ai-cleared/ops");
  const ctx = await getAdminContext(session.user.id, slug);
  if (!ctx) notFound();

  const rows = await getRegister(ctx.orgId);
  const standing = firmStanding(rows);
  const p = ctx.org.profile;
  const profile = {
    approvedTools: p?.approvedTools ?? [],
    askFirstTools: p?.askFirstTools ?? [],
    bannedTools: p?.bannedTools ?? [],
    escalationContact: p?.escalationContact ?? ctx.org.contactName ?? "",
    escalationRole: p?.escalationRole ?? ctx.org.contactRole ?? "",
    regulator: p?.regulator ?? "",
    classPublic: p?.classPublic ?? CLASS_DEFAULT_NAME.P,
    classInternal: p?.classInternal ?? CLASS_DEFAULT_NAME.I,
    classConfidential: p?.classConfidential ?? CLASS_DEFAULT_NAME.C,
    classRestricted: p?.classRestricted ?? CLASS_DEFAULT_NAME.R,
  };

  return (
    <Frame firmName={ctx.org.name} meta={<><Link href="/ai-cleared/ops" className="cf-link">All firms</Link><span className="cf-meta">{firstNameOf(session.user.name, session.user.email)} · Staff</span></>} courseLink>
      <p className="cf-note" style={{ marginBottom: 14 }}>
        {PLAN[ctx.org.plan]} plan · {ctx.org.seatsPurchased} seats · {ctx.org.sector ?? "sector not set"} · contact {ctx.org.contactName ?? "not set"}{ctx.org.contactRole ? `, ${ctx.org.contactRole}` : ""} · {ctx.org.stripeCustomerId ? "paid through Stripe" : "manual deal"} · created {ctx.org.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
      </p>
      <AdminPanel firmName={ctx.org.name} role="ADMIN" seatsPurchased={ctx.org.seatsPurchased} rows={rows} standing={standing} profile={profile} orgId={ctx.orgId} />
    </Frame>
  );
}
