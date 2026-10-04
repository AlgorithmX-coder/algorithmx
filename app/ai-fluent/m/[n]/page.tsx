import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import { AI_FLUENT_SLUG, DB_TO_PHASE, DB_TO_TRACK, defaultToolFor, firmViewOf, firstNameOf, getEnrolment } from "@/app/lib/aiCleared";
import { FLUENT_MODULE_LIST, getFluentModule } from "../../manifests";
import { practisesOf } from "@/app/ai-cleared/engine/types";
import ClearedPlayer from "@/app/ai-cleared/engine/ClearedPlayer";

/* /ai-fluent/m/[n]: the player for Fluent module n, fed the manifest, the
 * firm's profile and the learner's track from the server. A module whose
 * content has not shipped is a 404 until it does. */
export const dynamic = "force-dynamic";

export default async function FluentModulePage({ params }: { params: Promise<{ n: string }> }) {
  const { n: raw } = await params;
  const n = Number(raw);
  const manifest = Number.isInteger(n) ? getFluentModule(n) : null;
  if (!manifest) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`/ai-fluent/m/${n}`)}`);
  const userId = session.user.id;

  const [entitled, enrolment] = await Promise.all([hasEntitlement(userId, AI_FLUENT_SLUG), getEnrolment(userId, "ai-fluent")]);
  if (!entitled || !enrolment) redirect("/ai-fluent");

  const firm = firmViewOf(enrolment);
  const progress = new Map(enrolment.modules.map((m) => [m.module, m]));
  const mine = progress.get(n);
  const courseMap = FLUENT_MODULE_LIST.map((m) => ({ n: m.n, title: m.title, minutes: m.minutes, available: m.available, done: !!progress.get(m.n)?.completedAt }));

  return (
    <ClearedPlayer
      manifest={manifest}
      track={DB_TO_TRACK[enrolment.track]}
      firm={firm}
      tool={(() => { const blk = manifest.tracks[DB_TO_TRACK[enrolment.track]]; const pr = blk ? practisesOf(blk)[0] : undefined; return (pr && pr.kind === "sandbox" && pr.tool) || defaultToolFor(firm); })()}
      learnerName={firstNameOf(enrolment.user.name, enrolment.user.email)}
      courseMap={courseMap}
      initialPhase={mine && !mine.completedAt ? DB_TO_PHASE[mine.phase] : undefined}
      live
    />
  );
}
