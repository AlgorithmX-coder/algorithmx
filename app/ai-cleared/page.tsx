import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import { AI_CLEARED_SLUG, DB_TO_TRACK, FIRM_ORG, firstNameOf, getEnrolments } from "@/app/lib/aiCleared";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { MODULE_LIST } from "./manifests";
import ConsoleHome from "./ConsoleHome";
import IndividualOffer from "./IndividualOffer";
import { isIndividualLearnersOrg } from "@/app/lib/cyberSecured";

/* /ai-cleared: the console home. Gated by the entitlement; a signed-in
 * user without a seat or a purchase is offered the course. */
export const dynamic = "force-dynamic";

export default async function AiClearedHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fai-cleared");
  const userId = session.user.id;

  const [entitled, { cleared: enrolment, fluent }, adminRow, staff] = await Promise.all([
    hasEntitlement(userId, AI_CLEARED_SLUG),
    getEnrolments(userId),
    /* An admin of a FIRM. A head teacher is an ADMIN of their school, so
       without the filter this page sent them into the firm console. */
    prisma.orgMember.findFirst({ where: { userId, role: { in: ["ADMIN", "MANAGER"] }, org: FIRM_ORG }, select: { id: true } }),
    isStaffUser(userId),
  ]);
  if (staff && !enrolment) redirect("/ai-cleared/ops");
  if (adminRow && !enrolment) redirect("/cyber-secured/admin");
  /* Anyone at a firm without this enrolment yet: the portal enrols them. */
  if ((!entitled || !enrolment) && fluent && !isIndividualLearnersOrg(fluent.org)) redirect("/cyber-secured");
  if (!entitled || !enrolment) return <IndividualOffer course="ai-cleared" email={session.user.email ?? ""} />;

  const progress = new Map(enrolment.modules.map((m) => [m.module, m]));
  const modules = MODULE_LIST.map((m) => {
    const p = progress.get(m.n);
    const phaseLabel = p && !p.completedAt ? (p.phase === "LEARN" ? "in Learn" : p.phase === "PRACTISE" ? "in Practise" : p.phase === "PROVE" ? "in Prove" : undefined) : undefined;
    return { ...m, done: !!p?.completedAt, phaseLabel };
  });
  const resume = modules.find((m) => m.available && !m.done && progress.has(m.n)) ?? modules.find((m) => m.available && !m.done) ?? null;
  const profile = enrolment.org.profile;

  return (
    <ConsoleHome
      course="ai-cleared"
      firmName={enrolment.org.name}
      contactName={profile?.escalationContact ?? enrolment.org.contactName}
      contactRole={profile?.escalationRole ?? enrolment.org.contactRole}
      learnerName={firstNameOf(enrolment.user.name, enrolment.user.email)}
      track={DB_TO_TRACK[enrolment.track]}
      trackLocked={!!enrolment.trackChangedAt}
      modules={modules}
      resumeN={resume?.n ?? null}
      complete={!!enrolment.completedAt}
      isAdmin={!!adminRow}
      isStaff={staff}

    />
  );
}
