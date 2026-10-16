import { landingRouteFor } from "@/app/lib/courseLandings";
import { CATALOGUE } from "@/app/lib/courseIntent";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { hasEntitlement, getAge } from "@/app/lib/entitlements";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";
import DashboardView, { type WeekItem, type WeekState } from "./DashboardView";
import PlayDashboardAmbientOnMount from "@/app/components/PlayDashboardAmbientOnMount";

const PRODUCT_SLUG = "cyber-heroes";

export default async function DashboardPage() {
  // ── GATE ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await hasEntitlement(session.user.id, PRODUCT_SLUG);
  if (!ok) redirect(CATALOGUE);

  // ── DATA ─────────────────────────────────────────────────────────
  const userId = session.user.id;

  const childProfiles = await prisma.childProfile.findMany({
    where: { userId },
    select: { id: true, name: true, dateOfBirth: true, favouriteColour: true },
    orderBy: { createdAt: "desc" },
  });
  if (childProfiles.length === 0) redirect("/onboarding");

  const activeChildId = (await resolveActiveChildProfileId(userId)) ?? childProfiles[0].id;
  const activeChild = childProfiles.find((c) => c.id === activeChildId) ?? childProfiles[0];

  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    include: { courseContents: { orderBy: { week: "asc" } } },
  });

  const courseContents = product?.courseContents ?? [];

  const progressRows = product
    ? await prisma.progress.findMany({
        where: { childProfileId: activeChild.id, productId: product.id },
        select: { week: true, screen: true, stars: true, completedAt: true },
      })
    : [];

  const progressByWeek = new Map(progressRows.map((p) => [p.week, p]));

  const completedCount = progressRows.filter((p) => p.completedAt !== null).length;
  const totalWeeks = courseContents.length;
  const progressPct = totalWeeks > 0 ? (completedCount / totalWeeks) * 100 : 0;
  const remaining = Math.max(0, totalWeeks - completedCount);

  // First non-completed week is "current" (the one to play next).
  let nextWeek: number | null = null;
  for (const cc of courseContents) {
    const p = progressByWeek.get(cc.week);
    if (!p || !p.completedAt) {
      nextWeek = cc.week;
      break;
    }
  }

  const childAge = getAge(activeChild.dateOfBirth);
  const userName = activeChild.name ?? session.user.name ?? "Cyber Hero";
  const raccoonPower = Math.round(100 - progressPct);

  // Per-week presentation state. Every week is open/startable once entitled;
  // the "current" (next-to-play) week is just visually highlighted.
  const weeks: WeekItem[] = courseContents.map((cc) => {
    const p = progressByWeek.get(cc.week);
    const isCompleted = !!p?.completedAt;
    const isInProgress = !!p && !isCompleted;
    const isCurrent = cc.week === nextWeek;
    const state: WeekState = isCompleted
      ? "completed"
      : isInProgress
        ? "inProgress"
        : isCurrent
          ? "current"
          : "available";
    return {
      id: cc.id,
      week: cc.week,
      title: cc.title,
      description: cc.description,
      state,
      stars: p?.stars ?? 0,
      screen: p?.screen ?? null,
      href: `/lesson/${cc.week}`,
    };
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

  return (
    <>
      {/* Faint Week-1 ambient bed (honors the global audio mute). */}
      <PlayDashboardAmbientOnMount />
      <DashboardView
      userName={userName}
      childAge={childAge}
      completedCount={completedCount}
      totalWeeks={totalWeeks}
      progressPct={progressPct}
      remaining={remaining}
      raccoonPower={raccoonPower}
      product={product ? { name: product.name, ageRange: product.ageRange, weeksCount: product.weeksCount, duration: product.duration } : null}
      weeks={weeks}
      heroCtaHref={`/lesson/${nextWeek ?? 1}`}
      onLogout={handleLogout}
      />
    </>
  );
}
