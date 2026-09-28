import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import { AI_CLEARED_SLUG, DB_TO_PHASE, DB_TO_TRACK, defaultToolFor, firmViewOf, firstNameOf, getEnrolment } from "@/app/lib/aiCleared";
import { MODULE_LIST, getModule } from "../../manifests";
import ClearedPlayer from "../../engine/ClearedPlayer";

/* /ai-cleared/m/[n]: the player for module n, fed the manifest, the firm's
 * profile and the learner's track from the server. */
export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: Promise<{ n: string }> }) {
  const { n: raw } = await params;
  const n = Number(raw);
  const manifest = Number.isInteger(n) ? getModule(n) : null;
  if (!manifest) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`/ai-cleared/m/${n}`)}`);
  const userId = session.user.id;

  const [entitled, enrolment] = await Promise.all([hasEntitlement(userId, AI_CLEARED_SLUG), getEnrolment(userId)]);
  if (!entitled || !enrolment) redirect("/ai-cleared");

  const firm = firmViewOf(enrolment);
  const progress = new Map(enrolment.modules.map((m) => [m.module, m]));
  const mine = progress.get(n);
  const courseMap = MODULE_LIST.map((m) => ({ n: m.n, title: m.title, minutes: m.minutes, available: m.available, done: !!progress.get(m.n)?.completedAt }));

  return (
    <ClearedPlayer
      manifest={manifest}
      track={DB_TO_TRACK[enrolment.track]}
      firm={firm}
      tool={manifest.tracks[DB_TO_TRACK[enrolment.track]]?.practise.tool ?? defaultToolFor(firm)}
      learnerName={firstNameOf(enrolment.user.name, enrolment.user.email)}
      courseMap={courseMap}
      initialPhase={mine && !mine.completedAt ? DB_TO_PHASE[mine.phase] : undefined}
      live
    />
  );
}
