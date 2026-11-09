import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import { CYBER_AWARENESS_SLUG, DB_TO_PHASE, DB_TO_TRACK, defaultToolFor, firmViewOf, firstNameOf, getEnrolment } from "@/app/lib/aiCleared";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "../../manifests";
import { practisesOf } from "@/app/ai-cleared/engine/types";
import ClearedPlayer from "@/app/ai-cleared/engine/ClearedPlayer";

/* /cyber-awareness/m/[n]: the player for Cyber Awareness module n, wired
 * onto the shared engine the same way AI Cleared and AI Fluent are. A
 * module with no manifest yet (see ../../manifests) 404s here. */
export const dynamic = "force-dynamic";

export default async function CyberAwarenessModulePage({ params }: { params: Promise<{ n: string }> }) {
  const { n: raw } = await params;
  const n = Number(raw);
  const manifest = Number.isInteger(n) ? getAwarenessModule(n) : null;
  if (!manifest) notFound();

  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(`/cyber-awareness/m/${n}`)}`);
  const userId = session.user.id;

  const [entitled, enrolment] = await Promise.all([hasEntitlement(userId, CYBER_AWARENESS_SLUG), getEnrolment(userId, "cyber-awareness")]);
  if (!entitled || !enrolment) redirect("/cyber-awareness");

  const firm = firmViewOf(enrolment);
  const progress = new Map(enrolment.modules.map((m) => [m.module, m]));
  const mine = progress.get(n);
  const courseMap = AWARENESS_MODULE_LIST.map((m) => ({ n: m.n, title: m.title, minutes: m.minutes, available: m.available, done: !!progress.get(m.n)?.completedAt }));

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
