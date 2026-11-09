import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getAdminContext, getTeam } from "@/app/lib/aiClearedAdmin";
import { firstNameOf } from "@/app/lib/aiCleared";
import { trialStatus } from "@/app/lib/orgTrial";
import { CYBER_SECURED_BRAND } from "@/app/lib/cyberSecured";
import { CLASS_DEFAULT_NAME } from "@/app/ai-cleared/engine/types";
import Frame from "@/app/ai-cleared/Frame";
import TeamPanel from "../TeamPanel";

/* /cyber-secured/admin: the firm's team page. Seats, who holds one, how far
 * each person has got on every course, invites, nudges and the firm's
 * rules for AI. Gated by an OrgMember row with ADMIN or MANAGER at a firm. */
export const dynamic = "force-dynamic";

const BRAND = { word: CYBER_SECURED_BRAND, href: "/cyber-secured" };

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fcyber-secured%2Fadmin");
  const ctx = await getAdminContext(session.user.id);
  if (!ctx) {
    return (
      <Frame brand={BRAND} meta={<span className="cf-meta">{session.user.email}</span>}>
        <span className="cf-eyebrow">Your team</span>
        <h1 className="cf-h1">This page is for your firm&rsquo;s <span className="cf-grad">admins</span>.</h1>
        <p className="cf-lead">If you run Cyber Secured for your firm, ask admissions@algorithmx.co.uk to make you an admin, or claim an admin invite link.</p>
        <Link href="/cyber-secured" className="cf-btn cf-btn-pri">Back to your courses</Link>
      </Frame>
    );
  }

  const meta = (
    <>
      <span className="cf-meta cs-who">{firstNameOf(ctx.user.name, ctx.user.email)} · {ctx.role === "ADMIN" ? "Admin" : "Manager"}</span>
      <Link href="/cyber-secured" className="cf-link">My courses</Link>
    </>
  );

  if (ctx.org.revokedAt) {
    return (
      <Frame brand={BRAND} firmName={ctx.org.name} meta={meta}>
        <span className="cf-eyebrow">Access closed</span>
        <h1 className="cf-h1">{ctx.org.name}&rsquo;s access has been <span className="cf-grad">closed</span>.</h1>
        <p className="cf-lead">Everything is kept exactly as it was. If you believe this is a mistake, email admissions@algorithmx.co.uk.</p>
      </Frame>
    );
  }

  if (trialStatus(ctx.org.trialExpiresAt) === "expired") {
    return (
      <Frame brand={BRAND} firmName={ctx.org.name} meta={meta}>
        <span className="cf-eyebrow">Trial</span>
        <h1 className="cf-h1">{ctx.org.name}&rsquo;s trial has <span className="cf-grad">ended</span>.</h1>
        <p className="cf-lead">Everything you tried stays exactly as it was. Email admissions@algorithmx.co.uk and we will set a licence up for {ctx.org.name} to carry on from here.</p>
      </Frame>
    );
  }

  const { tracks, rows } = await getTeam(ctx.orgId);
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
    <Frame brand={BRAND} firmName={ctx.org.name} meta={meta}>
      <TeamPanel firmName={ctx.org.name} role={ctx.role} seatsPurchased={ctx.org.seatsPurchased} tracks={tracks} rows={rows} profile={profile} profileSet={!!p} />
    </Frame>
  );
}
