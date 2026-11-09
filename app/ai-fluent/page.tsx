import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import { AI_FLUENT_SLUG, DB_TO_TRACK, FIRM_ORG, firstNameOf, getEnrolments } from "@/app/lib/aiCleared";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { FLUENT_MODULE_LIST } from "./manifests";
import ConsoleHome from "@/app/ai-cleared/ConsoleHome";

/* /ai-fluent: the AI Fluent course home. Gated by the entitlement; a
 * person with only a Cleared seat is told how Fluent seats work. */
export const dynamic = "force-dynamic";

export default async function AiFluentHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fai-fluent");
  const userId = session.user.id;

  const [entitled, { cleared, fluent: enrolment }, adminRow, staff] = await Promise.all([
    hasEntitlement(userId, AI_FLUENT_SLUG),
    getEnrolments(userId),
    /* An admin of a FIRM. A head teacher is an ADMIN of their school, so
       without the filter this page sent them into the firm console. */
    prisma.orgMember.findFirst({ where: { userId, role: { in: ["ADMIN", "MANAGER"] }, org: FIRM_ORG }, select: { id: true } }),
    isStaffUser(userId),
  ]);
  if (!entitled || !enrolment) {
    /* One seat opens every course. Someone at a firm who is not on Fluent
       yet (they claimed before it was part of their seat) is enrolled by
       the portal; an admin without a seat goes to their team page. */
    if (cleared) redirect("/cyber-secured");
    if (adminRow) redirect("/cyber-secured/admin");
    if (staff) redirect("/admin/firms");
    redirect("/ai-cleared");
  }

  const [progress, playbookCount] = await Promise.all([
    Promise.resolve(new Map(enrolment.modules.map((m) => [m.module, m]))),
    prisma.playbookEntry.count({ where: { enrolmentId: enrolment.id } }),
  ]);
  const modules = FLUENT_MODULE_LIST.map((m) => {
    const p = progress.get(m.n);
    const phaseLabel = p && !p.completedAt ? (p.phase === "LEARN" ? "in Learn" : p.phase === "PRACTISE" ? "in Practise" : p.phase === "PROVE" ? "in Prove" : undefined) : undefined;
    return { ...m, done: !!p?.completedAt, phaseLabel };
  });
  const resume = modules.find((m) => m.available && !m.done && progress.has(m.n)) ?? modules.find((m) => m.available && !m.done) ?? null;
  const profile = enrolment.org.profile;

  return (
    <ConsoleHome
      course="ai-fluent"
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

      playbookCount={playbookCount}
    />
  );
}
