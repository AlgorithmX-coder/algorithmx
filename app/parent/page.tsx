/**
 * Parent dashboard - at-a-glance progress report.
 *
 * Option (a) view: per-child summary of "X of N weeks complete, T stars".
 * No per-question analytics. The granular models (LessonAttempt,
 * QuestionResponse, ScreenResult, BossResult) have been dropped — the
 * source of truth is the flat Progress table.
 *
 * Server component:
 *   1. auth() + hasEntitlement gate (entitlement is the access check;
 *      the paywall env flag is gone).
 *   2. Pulls every ChildProfile for the user and every Progress row
 *      for those children scoped to cyber-heroes in a single query.
 *   3. Fetches the Product so the "X of weeksCount" denominator is
 *      DB-driven, not hardcoded.
 *   4. Renders a calm, parent-facing read-out per child — no playful
 *      animation, tighter layout. Still dark cyber for cohesion.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { hasEntitlement, getAge } from "@/app/lib/entitlements";
import {
  CYBER_PALETTE as P,
  CYBER_GRAD as G,
  CYBER_SHADOW as S,
} from "@/app/components/scene/cyberTokens";

export const dynamic = "force-dynamic";

const PRODUCT_SLUG = "cyber-heroes";

type WeekState = "completed" | "in_progress" | "not_started";
interface WeekCell { week: number; state: WeekState; stars: number; }
interface ChildSummary {
  id: string;
  name: string;
  age: number;
  completedCount: number;
  totalStars: number;
  weeks: WeekCell[];
}

const FONT = "'DM Sans', 'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

const CARD: React.CSSProperties = {
  background: G.glass,
  border: `1px solid ${P.cyan}33`,
  borderRadius: 18,
  padding: 28,
  boxShadow: S.cardCyan,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

function StarGlyph({ color }: { color: string }) {
  return (
    <svg width={9} height={9} viewBox="0 0 24 24" fill={color} aria-hidden style={{ display: "block" }}>
      <path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.4 6.7L12 17.6l-6 3.2 1.4-6.7L2.5 9.5l6.6-.8L12 2.5z" />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  const safe = Math.max(0, Math.min(3, count));
  return (
    <div style={{ display: "flex", gap: 1.5 }} aria-label={`${safe} stars`}>
      {Array.from({ length: safe }).map((_, i) => <StarGlyph key={i} color={P.amber} />)}
    </div>
  );
}

export default async function ParentDashboard() {
  /* ── GATE ───────────────────────────────────────────────────── */
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await hasEntitlement(session.user.id, PRODUCT_SLUG);
  if (!ok) redirect("/hub");
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
  if (!product) redirect("/hub");
  const weeksCount = product.weeksCount;

  const childIds = childProfiles.map((c) => c.id);
  const progressRows = childIds.length
    ? await prisma.progress.findMany({
        where: {
          childProfileId: { in: childIds },
          product: { slug: PRODUCT_SLUG },
        },
        select: { childProfileId: true, week: true, stars: true, completedAt: true },
      })
    : [];

  // Bucket by child → week so per-child render is O(weeksCount), not O(rows).
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
    return {
      id: c.id,
      name: c.name,
      age: getAge(c.dateOfBirth),
      completedCount,
      totalStars,
      weeks,
    };
  });

  /* ── RENDER ─────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: G.page, color: P.text, fontFamily: FONT }}>
      <nav
        style={{
          position: "sticky", top: 0, zIndex: 10,
          background: G.glassDarker,
          borderBottom: `1px solid ${P.cyan}22`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            maxWidth: 1080, margin: "0 auto", padding: "14px 24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "0.02em", color: P.textBright }}>
            Parent Dashboard
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link
              href="/hub"
              style={{
                color: P.cyanSoft, fontSize: 13, fontWeight: 600, textDecoration: "none",
                padding: "6px 14px", borderRadius: 999, border: `1px solid ${P.cyan}33`,
              }}
            >
              Hub
            </Link>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/app/lib/auth");
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                style={{
                  background: "transparent", color: P.textSoft, fontSize: 13, fontWeight: 600,
                  padding: "6px 14px", borderRadius: 999, border: `1px solid ${P.cyan}22`,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 80px" }}>
        <header style={{ marginBottom: 32 }}>
          <div
            style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: P.cyan, marginBottom: 10,
            }}
          >
            {product.name} · Progress Report
          </div>
          <h1
            style={{
              fontSize: 30, lineHeight: 1.15, fontWeight: 700, color: P.textBright,
              margin: 0, letterSpacing: "-0.01em",
            }}
          >
            Your family at a glance
          </h1>
          <p style={{ marginTop: 10, fontSize: 15, color: P.textSoft, lineHeight: 1.6, maxWidth: 620 }}>
            A simple read-out of weeks completed and stars earned. Tap any
            started week for a more detailed look at how it went.
          </p>
        </header>

        {summaries.length === 0 && (
          <section style={CARD}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: P.textBright, margin: 0, marginBottom: 6 }}>
              No child profiles yet
            </h2>
            <p style={{ color: P.textSoft, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Add a child to start tracking their journey through {product.name}.
            </p>
            <Link
              href="/onboarding"
              style={{
                display: "inline-block", marginTop: 16, padding: "10px 18px", borderRadius: 999,
                background: G.hero, color: P.abyss, fontWeight: 700, fontSize: 14,
                textDecoration: "none", boxShadow: S.buttonGlow,
              }}
            >
              Add a child profile
            </Link>
          </section>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {summaries.map((c) => (
            <ChildCard key={c.id} child={c} weeksCount={weeksCount} />
          ))}
        </div>
      </main>
    </div>
  );
}

/* ───────────────────────── CHILD CARD ───────────────────────── */

function ChildCard({ child, weeksCount }: { child: ChildSummary; weeksCount: number; }) {
  const pct = weeksCount > 0 ? Math.round((child.completedCount / weeksCount) * 100) : 0;
  return (
    <section style={CARD}>
      <div
        style={{
          display: "flex", alignItems: "baseline", justifyContent: "space-between",
          flexWrap: "wrap", gap: 12, marginBottom: 6,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: P.textBright, letterSpacing: "-0.01em" }}>
          {child.name}{" "}
          <span style={{ fontSize: 14, color: P.textMuted, fontWeight: 500 }}>
            ({child.age} yo)
          </span>
        </h2>
      </div>

      <p style={{ margin: 0, color: P.textSoft, fontSize: 14, lineHeight: 1.6 }}>
        <span style={{ color: P.cyan, fontWeight: 700 }}>{child.completedCount}</span>{" "}
        of {weeksCount} weeks complete
        <span style={{ color: P.textMuted, margin: "0 8px" }}>·</span>
        <span style={{ color: P.amber, fontWeight: 700 }}>{child.totalStars}</span>{" "}
        total stars
      </p>

      <div
        style={{
          marginTop: 14, height: 6, width: "100%",
          background: `${P.cyan}14`, borderRadius: 999, overflow: "hidden",
        }}
        aria-hidden
      >
        <div style={{ height: "100%", width: `${pct}%`, background: G.hero, borderRadius: 999 }} />
      </div>

      <div
        style={{
          marginTop: 22,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(58px, 1fr))",
          gap: 10,
        }}
      >
        {child.weeks.map((w) => <WeekDot key={w.week} cell={w} />)}
      </div>

      <div
        style={{
          marginTop: 18, display: "flex", flexWrap: "wrap", gap: 18,
          fontSize: 12, color: P.textMuted,
        }}
      >
        <LegendSwatch color={P.lime} label="Complete" />
        <LegendSwatch color={P.amber} label="In progress" />
        <LegendSwatch color={`${P.cyan}22`} ringColor={`${P.cyan}33`} label="Not started" />
      </div>
    </section>
  );
}

/* ───────────────────────── WEEK DOT ───────────────────────── */

function WeekDot({ cell }: { cell: WeekCell }) {
  const { week, state, stars } = cell;
  let bg: string; let border: string; let textColor: string; let glow: string | undefined;
  if (state === "completed") {
    bg = `linear-gradient(135deg, ${P.lime}, ${P.cyan})`;
    border = `1px solid ${P.lime}99`;
    textColor = P.abyss;
    glow = `0 0 16px ${P.lime}55`;
  } else if (state === "in_progress") {
    bg = `${P.amber}26`;
    border = `1px solid ${P.amber}88`;
    textColor = P.amber;
    glow = `0 0 12px ${P.amber}33`;
  } else {
    bg = `${P.cyan}0d`;
    border = `1px solid ${P.cyan}22`;
    textColor = P.textMuted;
  }

  const body = (
    <div
      style={{
        position: "relative", aspectRatio: "1 / 1", borderRadius: 12,
        background: bg, border, boxShadow: glow,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 2, cursor: state === "not_started" ? "default" : "pointer",
        transition: "transform 120ms ease",
      }}
      title={`Week ${week} — ${
        state === "completed" ? `complete (${stars}★)`
          : state === "in_progress" ? "in progress"
          : "not started"
      }`}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: textColor, letterSpacing: "0.04em", lineHeight: 1 }}>
        W{week}
      </div>
      {state === "completed" && stars > 0 && (
        <div style={{ marginTop: 2 }}><Stars count={stars} /></div>
      )}
    </div>
  );

  if (state === "not_started") return body;
  return (
    <Link href={`/parent/week/${week}`} style={{ textDecoration: "none" }} aria-label={`Open week ${week} details`}>
      {body}
    </Link>
  );
}

function LegendSwatch({ color, ringColor, label }: { color: string; ringColor?: string; label: string; }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          width: 10, height: 10, borderRadius: 4, background: color,
          border: ringColor ? `1px solid ${ringColor}` : undefined,
          display: "inline-block",
        }}
      />
      {label}
    </div>
  );
}
