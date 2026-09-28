import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { getAdminContext, getRegister, firmStanding } from "@/app/lib/aiClearedAdmin";
import { firstNameOf } from "@/app/lib/aiCleared";
import { CLASS_DEFAULT_NAME } from "../engine/types";
import Frame from "../Frame";
import AdminPanel from "./AdminPanel";

/* /ai-cleared/admin: the register, invites, nudges and the firm profile.
 * Gated by an OrgMember row with ADMIN or MANAGER. */
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fai-cleared%2Fadmin");
  const ctx = await getAdminContext(session.user.id);
  if (!ctx) {
    return (
      <Frame meta={<span className="cf-meta">{session.user.email}</span>} courseLink>
        <span className="cf-eyebrow">Admin</span>
        <h1 className="cf-h1">This page is for your firm&rsquo;s <span className="cf-grad">admins</span>.</h1>
        <p className="cf-lead">If you run AI Cleared for your firm, ask admissions@algorithmx.co.uk to make you an admin, or claim an admin invite link.</p>
        <Link href="/ai-cleared" className="cf-btn cf-btn-pri">Back to your course</Link>
      </Frame>
    );
  }

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
    <Frame firmName={ctx.org.name} meta={<span className="cf-meta">{firstNameOf(ctx.user.name, ctx.user.email)} · {ctx.role === "ADMIN" ? "Admin" : "Manager"}</span>} courseLink>
      <AdminPanel
        firmName={ctx.org.name}
        role={ctx.role}
        seatsPurchased={ctx.org.seatsPurchased}
        rows={rows}
        standing={standing}
        profile={profile}
      />
    </Frame>
  );
}
