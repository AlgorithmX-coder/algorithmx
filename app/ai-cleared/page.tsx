import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import { AI_CLEARED_SLUG, DB_TO_TRACK, firstNameOf, getEnrolment } from "@/app/lib/aiCleared";
import { MODULE_LIST } from "./manifests";
import Frame from "./Frame";
import ConsoleHome from "./ConsoleHome";

/* /ai-cleared: the console home. Gated by the entitlement; a signed-in
 * user without a seat is told how to get one. */
export const dynamic = "force-dynamic";

export default async function AiClearedHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fai-cleared");
  const userId = session.user.id;

  const [entitled, enrolment] = await Promise.all([hasEntitlement(userId, AI_CLEARED_SLUG), getEnrolment(userId)]);
  if (!entitled || !enrolment) {
    return (
      <Frame meta={<span className="cf-meta">{session.user.email}</span>}>
        <span className="cf-eyebrow">No seat yet</span>
        <h1 className="cf-h1">Your firm reserves your seat. Then you are <span className="cf-grad">in</span>.</h1>
        <p className="cf-lead">
          AI Cleared is licensed by firms, not bought by individuals. Your admin sends an invite link that claims your seat; open that link while signed in as {session.user.email}.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/corporate" className="cf-btn cf-btn-pri">About AI Cleared for firms</Link>
          <a href="mailto:admissions@algorithmx.co.uk" className="cf-btn">Email admissions</a>
        </div>
      </Frame>
    );
  }

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
