import Link from "next/link";
import { modelCallsLastDay } from "@/app/lib/modelAllowance";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { courseOf, getAdminContext, getRegister, firmStanding } from "@/app/lib/aiClearedAdmin";
import { firstNameOf } from "@/app/lib/aiCleared";
import { prisma } from "@/app/lib/prisma";
import { getPurchaseAmount } from "@/app/lib/refund";
import { CLASS_DEFAULT_NAME } from "../../engine/types";
import Frame from "../../Frame";
import AdminPanel from "../../admin/AdminPanel";
import { PurchasesPanel, RevokeFirmButton, type PurchaseRow } from "./OpsFirmActions";

/* /ai-cleared/ops/[slug][?course=ai-fluent]: one firm, exactly as its
 * admin sees it, with the same invite, resend, remove, nudge and profile
 * actions. Staff only. */
export const dynamic = "force-dynamic";

const PLAN: Record<string, string> = { TEAM: "Team", FIRM: "Firm", ENTERPRISE: "Enterprise" };
const COURSE_LABEL: Record<string, string> = { AI_CLEARED: "AI Cleared", AI_FLUENT: "AI Fluent", CYBER_PRO: "Cyber Pro" };

export default async function OpsFirmPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ course?: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`/ai-cleared/ops/${slug}`)}`);
  if (!(await isStaffUser(session.user.id))) redirect("/ai-cleared/ops");
  const ctx = await getAdminContext(session.user.id, slug);
  if (!ctx) notFound();

  const course = courseOf((await searchParams).course);
  const rows = await getRegister(ctx.orgId, course);
  const calls = await modelCallsLastDay(ctx.orgId);
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

  const purchaseRows = await prisma.seatPurchase.findMany({ where: { orgId: ctx.orgId }, orderBy: { createdAt: "desc" } });
  const purchases: PurchaseRow[] = await Promise.all(
    purchaseRows.map(async (pr) => {
      let amountPence: number | null = null;
      let refundedPence = 0;
      let currency = "gbp";
      try {
        const amt = await getPurchaseAmount(pr.stripeCheckoutSessionId);
        if (amt) {
          amountPence = amt.amountPence;
          refundedPence = amt.refundedPence;
          currency = amt.currency;
        }
      } catch {
        // Best-effort: a Stripe lookup can fail (sandbox session expired,
        // etc.) - still show the purchase row, just without an amount.
      }
      return { id: pr.id, course: COURSE_LABEL[pr.course] ?? pr.course, seats: pr.seats, createdAt: pr.createdAt.toISOString(), amountPence, refundedPence, currency };
    }),
  );

  return (
    <Frame firmName={ctx.org.name} meta={<><Link href="/ai-cleared/ops" className="cf-link">All firms</Link><span className="cf-meta">{firstNameOf(session.user.name, session.user.email)} · Staff</span></>} courseLink>
      <p className="cf-note" style={{ marginBottom: 14 }}>
        {PLAN[ctx.org.plan]} plan · {ctx.org.seatsPurchased} Cleared seats · {ctx.org.fluentSeatsPurchased} Fluent seats · {ctx.org.sector ?? "sector not set"} · contact {ctx.org.contactName ?? "not set"}{ctx.org.contactRole ? `, ${ctx.org.contactRole}` : ""} · {ctx.org.stripeCustomerId ? "paid through Stripe" : "manual deal"} · {calls} model call{calls === 1 ? "" : "s"} in the last 24 hours · created {ctx.org.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        {ctx.org.revokedAt ? " · access closed" : ""}
      </p>
      <p className="cf-note" style={{ marginBottom: 14 }}>
        <RevokeFirmButton orgId={ctx.orgId} revoked={!!ctx.org.revokedAt} />
      </p>
      <span className="cf-eyebrow">Purchases</span>
      <PurchasesPanel purchases={purchases} />
      <AdminPanel firmName={ctx.org.name} role="ADMIN" seatsPurchased={ctx.org.seatsPurchased} fluentSeatsPurchased={ctx.org.fluentSeatsPurchased} rows={rows} standing={standing} profile={profile} orgId={ctx.orgId} course={course} basePath={`/ai-cleared/ops/${ctx.org.slug}`} />
    </Frame>
  );
}
