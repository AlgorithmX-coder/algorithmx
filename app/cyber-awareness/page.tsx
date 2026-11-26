import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import { CYBER_AWARENESS_SLUG, DB_TO_TRACK, firstNameOf, getEnrolment } from "@/app/lib/aiCleared";
import { AWARENESS_MODULE_LIST } from "./manifests";
import ConsoleHome from "@/app/ai-cleared/ConsoleHome";
import IndividualOffer from "@/app/ai-cleared/IndividualOffer";

/* /cyber-awareness: the Cyber Awareness course home. Gated by the
 * entitlement, same as AI Cleared and AI Fluent. Modules ship one at a
 * time (see ./manifests): released ones open, the rest show as coming. */
export const dynamic = "force-dynamic";

export default async function CyberAwarenessHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fcyber-awareness");
  const userId = session.user.id;

  const [entitled, enrolment] = await Promise.all([hasEntitlement(userId, CYBER_AWARENESS_SLUG), getEnrolment(userId, "cyber-awareness")]);

  if (!entitled || !enrolment) return <IndividualOffer course="cyber-awareness" email={session.user.email ?? ""} />;

  const progress = new Map(enrolment.modules.map((m) => [m.module, m]));
  const modules = AWARENESS_MODULE_LIST.map((m) => {
    const p = progress.get(m.n);
    const phaseLabel = p && !p.completedAt ? (p.phase === "LEARN" ? "in Learn" : p.phase === "PRACTISE" ? "in Practise" : p.phase === "PROVE" ? "in Prove" : undefined) : undefined;
    return { ...m, done: !!p?.completedAt, phaseLabel };
  });
  const resume = modules.find((m) => m.available && !m.done && progress.has(m.n)) ?? modules.find((m) => m.available && !m.done) ?? null;
  const profile = enrolment.org.profile;

  return (
    <ConsoleHome
      course="cyber-awareness"
      firmName={enrolment.org.name}
      contactName={profile?.escalationContact ?? enrolment.org.contactName}
      contactRole={profile?.escalationRole ?? enrolment.org.contactRole}
      learnerName={firstNameOf(enrolment.user.name, enrolment.user.email)}
      track={DB_TO_TRACK[enrolment.track]}
      trackLocked={!!enrolment.trackChangedAt}
      modules={modules}
      resumeN={resume?.n ?? null}
      complete={!!enrolment.completedAt}
    />
  );
}
