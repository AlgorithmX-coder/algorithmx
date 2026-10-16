/**
 * Parent dashboard — at-a-glance progress report (data + gate).
 *
 * Server component: auth() + hasEntitlement gate → pull every ChildProfile +
 * their cyber-heroes Progress in one query → build per-child summaries and hand
 * them to <ParentView>. Source of truth is the flat Progress table.
 */

import { landingRouteFor } from "@/app/lib/courseLandings";
import { CATALOGUE } from "@/app/lib/courseIntent";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { hasEntitlement, getAge } from "@/app/lib/entitlements";
import ParentView, { type ChildSummary, type WeekCell, type WeekState } from "./ParentView";

export const dynamic = "force-dynamic";

const PRODUCT_SLUG = "cyber-heroes";

export default async function ParentDashboard() {
  /* ── GATE ───────────────────────────────────────────────────── */
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await hasEntitlement(session.user.id, PRODUCT_SLUG);
  if (!ok) redirect(CATALOGUE);
  const userId = session.user.id;

  /* ── DATA ───────────────────────────────────────────────────── */
  const [product, childProfiles] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: PRODUCT_SLUG },
      select: { id: true, name: true, weeksCount: true },
    }),
    prisma.childProfile.findMany({
      where: { userId },
      select: { id: true, name: true, dateOfBirth: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  if (!product) redirect(CATALOGUE);
  const weeksCount = product.weeksCount;

  const childIds = childProfiles.map((c) => c.id);
  const progressRows = childIds.length
    ? await prisma.progress.findMany({
        where: { childProfileId: { in: childIds }, product: { slug: PRODUCT_SLUG } },
        select: { childProfileId: true, week: true, stars: true, completedAt: true },
      })
    : [];

  const byChild = new Map<string, Map<number, { stars: number; completedAt: Date | null }>>();
  for (const cid of childIds) byChild.set(cid, new Map());
  for (const r of progressRows) {
    byChild.get(r.childProfileId)?.set(r.week, { stars: r.stars, completedAt: r.completedAt });
  }

  const summaries: ChildSummary[] = childProfiles.map((c) => {
    const byWeek = byChild.get(c.id) ?? new Map();
    let completedCount = 0;
    let totalStars = 0;
    const weeks: WeekCell[] = [];
    for (let w = 1; w <= weeksCount; w++) {
      const row = byWeek.get(w);
      let state: WeekState = "not_started";
      let stars = 0;
      if (row) {
        if (row.completedAt) {
          state = "completed";
          completedCount += 1;
          stars = row.stars;
          totalStars += row.stars;
        } else {
          state = "in_progress";
          stars = row.stars;
        }
      }
      weeks.push({ week: w, state, stars });
    }
    return { id: c.id, name: c.name, age: getAge(c.dateOfBirth), completedCount, totalStars, weeks };
  });

  /* Logging out of Cyber Heroes lands on Cyber Heroes, not the AlgorithmX
   * home page (owner, 2026-10-16). A parent who signs out of their child's
   * course wants that course's page in front of them, with its own log-in on
   * it - not the top of a multi-product company site they then have to
   * navigate back down. The route comes from the shared landing map rather
   * than a literal, so it cannot drift from the card that links there. */
  async function handleLogout() {
    "use server";
    const { signOut } = await import("@/app/lib/auth");
    await signOut({ redirectTo: landingRouteFor(PRODUCT_SLUG) ?? "/" });
  }

  return <ParentView productName={product.name} weeksCount={weeksCount} summaries={summaries} onLogout={handleLogout} />;
}
