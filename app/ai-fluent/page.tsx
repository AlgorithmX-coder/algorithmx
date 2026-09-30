import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import { AI_FLUENT_SLUG, DB_TO_TRACK, firstNameOf, getEnrolments } from "@/app/lib/aiCleared";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { FLUENT_MODULE_LIST } from "./manifests";
import Frame from "@/app/ai-cleared/Frame";
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
    prisma.orgMember.findFirst({ where: { userId, role: { in: ["ADMIN", "MANAGER"] } }, select: { id: true } }),
    isStaffUser(userId),
  ]);
  if (!entitled || !enrolment) {
    if (!cleared && !adminRow && !staff) redirect("/ai-cleared");
    return (
      <Frame course="ai-fluent" meta={<span className="cf-meta">{session.user.email}</span>} firmName={cleared?.org.name}>
        <span className="cf-eyebrow">No Fluent seat yet</span>
        <h1 className="cf-h1">AI Fluent is the next step after <span className="cf-grad">AI Cleared</span>.</h1>
        <p className="cf-lead">
          About three hours on getting real work out of AI: prompting that works, the five workflows, verification as a habit and a real task on your own desk. Your firm licenses Fluent seats separately and your admin sends the invite; it opens with a valid AI Cleared certificate on this login.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {cleared && <Link href="/ai-cleared" className="cf-btn cf-btn-pri">Back to AI Cleared</Link>}
          {adminRow && <Link href="/ai-cleared/admin?course=ai-fluent" className="cf-btn">Fluent seats for your firm</Link>}
          {staff && <Link href="/ai-cleared/ops" className="cf-btn">Ops</Link>}
        </div>
      </Frame>
    );
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
      otherCourse={cleared ? { href: "/ai-cleared", label: "AI Cleared" } : null}
      playbookCount={playbookCount}
    />
  );
}
