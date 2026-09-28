import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import { AI_CLEARED_SLUG, DB_TO_TRACK, firstNameOf, getEnrolment } from "@/app/lib/aiCleared";
import { MODULE_LIST } from "./manifests";
import { K } from "./engine/tokens";
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
      <div style={{ maxWidth: 620, margin: "0 auto", padding: "60px 24px" }}>
        <span style={{ fontFamily: K.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.22em", color: K.accentInk }}>AI CLEARED</span>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: K.ink, margin: "20px 0 10px", letterSpacing: "-0.015em" }}>You do not have a seat yet.</h1>
        <p style={{ fontSize: 16, color: K.body, maxWidth: "56ch" }}>
          AI Cleared is licensed by your firm. Your admin sends an invite link that claims your seat; open that link while signed in as {session.user.email}.
        </p>
        <p style={{ fontSize: 14.5, color: K.muted }}>
          Running training for your firm? See <Link href="/corporate" style={{ color: K.accentInk }}>the corporate page</Link> or write to <a href="mailto:admissions@algorithmx.co.uk" style={{ color: K.accentInk }}>admissions@algorithmx.co.uk</a>.
        </p>
      </div>
    );
  }

  const progress = new Map(enrolment.modules.map((m) => [m.module, m]));
  const modules = MODULE_LIST.map((m) => {
    const p = progress.get(m.n);
    const phaseLabel = p && !p.completedAt ? (p.phase === "LEARN" ? "in Learn" : p.phase === "PRACTISE" ? "in Practise" : p.phase === "PROVE" ? "in Prove" : undefined) : undefined;
    return { ...m, done: !!p?.completedAt, phaseLabel };
  });
  const resume = modules.find((m) => m.available && !m.done && progress.has(m.n)) ?? modules.find((m) => m.available && !m.done) ?? null;

  return (
    <ConsoleHome
      firmName={enrolment.org.name}
      learnerName={firstNameOf(enrolment.user.name, enrolment.user.email)}
      track={DB_TO_TRACK[enrolment.track]}
      trackLocked={!!enrolment.trackChangedAt}
      modules={modules}
      resumeN={resume?.n ?? null}
      complete={!!enrolment.completedAt}
    />
  );
}
