/**
 * Parent-facing Week deep-dive (post-refactor, simple shape).
 *
 * Server component. Shows the week's content header plus one block
 * per child on the family account, with the child's outcome for that
 * specific week (completed / in-progress / not started).
 *
 * Why this is so much smaller than the old version:
 *   The old per-question / per-screen analytics tables (LessonAttempt,
 *   ScreenResult, QuestionResponse, BossResult) have all been dropped.
 *   The single source of truth is now the Progress row — one per
 *   (child, product, week) — and that's all we have to render.
 *
 * Gating:
 *   - auth() guards the route; unauthenticated → /login.
 *   - hasEntitlement(userId, "cyber-heroes") guards the content;
 *     non-entitled → /hub. PAYWALL_ENFORCED is GONE — entitlement
 *     IS the gate now.
 *   - Every Prisma query is filtered by session.user.id, so a leaked
 *     week URL cannot expose another family's data.
 *
 * Validation:
 *   - week param is parsed to an integer and validated against the
 *     product's weeksCount; out-of-range → redirect("/parent").
 *   - CourseContent miss for a valid week → redirect("/parent")
 *     (defensive: shouldn't happen if the seed is healthy).
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement, getAge } from "@/app/lib/entitlements";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CYBER_PALETTE, CYBER_GRAD } from "@/app/components/scene/cyberTokens";

interface PageProps {
  params: Promise<{ week: string }>;
}

const FONT_STACK =
  "ui-rounded, 'Fredoka', 'Quicksand', 'Nunito', system-ui, -apple-system, sans-serif";

/* ────────────────────────── small UI helpers ────────────────────────── */

const C = {
  pageBg: CYBER_PALETTE.abyss,
  card: "rgba(15, 21, 48, 0.72)",
  border: "rgba(0, 229, 255, 0.22)",
  borderStrong: "rgba(0, 229, 255, 0.45)",
  text: CYBER_PALETTE.textBright,
  textSoft: CYBER_PALETTE.text,
  textMuted: "rgba(125, 240, 255, 0.55)",
  cyan: CYBER_PALETTE.cyan,
  cosmic: CYBER_PALETTE.cosmic,
  lime: CYBER_PALETTE.lime,
  amber: CYBER_PALETTE.amber,
  ember: CYBER_PALETTE.ember,
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function starString(n: number): string {
  const clamped = Math.max(0, Math.min(3, n));
  return "★".repeat(clamped) + "☆".repeat(3 - clamped);
}

/* ────────────────────────────── page ─────────────────────────────── */

export default async function ParentWeekDetail({ params }: PageProps) {
  // 1. AUTH GATE
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  // 2. ENTITLEMENT GATE
  const entitled = await hasEntitlement(userId, "cyber-heroes");
  if (!entitled) redirect("/hub");

  // 3. PARSE & VALIDATE WEEK
  const { week: weekParam } = await params;
  const week = Number.parseInt(weekParam, 10);
  if (!Number.isFinite(week) || week < 1) redirect("/parent");

  // Look up the product once — we need its id (for the composite
  // unique) AND its weeksCount (for upper-bound validation).
  const product = await prisma.product.findUnique({
    where: { slug: "cyber-heroes" },
    select: { id: true, weeksCount: true },
  });
  if (!product) redirect("/parent");
  if (week > product.weeksCount) redirect("/parent");

  // 4. FETCH WEEK CONTENT
  const content = await prisma.courseContent.findUnique({
    where: { productId_week: { productId: product.id, week } },
    select: { week: true, title: true, description: true },
  });
  if (!content) redirect("/parent");

  // 5. FETCH CHILDREN + THEIR PROGRESS FOR THIS WEEK
  // The Progress unique key is (childProfileId, productId, week), so
  // the nested `where` below yields 0 or 1 row per child. We sort
  // children oldest-first so the display order is stable across renders.
  const children = await prisma.childProfile.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      dateOfBirth: true,
      progress: {
        where: { productId: product.id, week },
        select: { stars: true, screen: true, completedAt: true },
      },
    },
  });

  /* ─────────────────────────── render ─────────────────────────── */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: CYBER_GRAD.page,
        color: C.text,
        fontFamily: FONT_STACK,
        padding: "32px 18px 80px",
      }}
    >
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        {/* Back link */}
        <Link
          href="/parent"
          style={{
            display: "inline-block",
            color: C.cyan,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 20,
            padding: "7px 16px",
            background: "rgba(0, 229, 255, 0.08)",
            border: `1px solid ${C.border}`,
            borderRadius: 999,
          }}
        >
          ← Back to parent dashboard
        </Link>

        {/* Week header */}
        <header style={{ marginBottom: 28 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.18em",
              color: C.cyan,
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Week {content.week}
          </div>
          <h1
            style={{
              fontSize: 34,
              fontWeight: 900,
              margin: "0 0 12px",
              lineHeight: 1.15,
              background: CYBER_GRAD.hero,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {content.title}
          </h1>
          <p
            style={{
              color: C.textSoft,
              fontSize: 15,
              margin: 0,
              lineHeight: 1.6,
              maxWidth: 640,
            }}
          >
            {content.description}
          </p>
        </header>

        {/* Per-child outcomes */}
        <section
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {children.length === 0 ? (
            <div
              style={{
                padding: 24,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                textAlign: "center",
                color: C.textSoft,
                fontSize: 14,
              }}
            >
              No children on this account yet.{" "}
              <Link
                href="/onboarding"
                style={{ color: C.cyan, fontWeight: 700 }}
              >
                Add a child profile →
              </Link>
            </div>
          ) : (
            children.map((child) => {
              const age = getAge(child.dateOfBirth);
              const row = child.progress[0];

              let stateLine: React.ReactNode;
              let accent: string;
              if (!row) {
                stateLine = "Not started";
                accent = C.textMuted;
              } else if (row.completedAt) {
                stateLine = (
                  <>
                    Completed on {formatDate(row.completedAt)} ·{" "}
                    <span style={{ color: C.amber }}>
                      {starString(row.stars)}
                    </span>{" "}
                    <span style={{ color: C.textSoft }}>
                      {row.stars} star{row.stars === 1 ? "" : "s"}
                    </span>
                  </>
                );
                accent = C.lime;
              } else {
                stateLine = (
                  <>
                    In progress · screen {row.screen + 1}
                  </>
                );
                accent = C.cyan;
              }

              return (
                <article
                  key={child.id}
                  style={{
                    padding: "18px 22px",
                    background: C.card,
                    border: `1px solid ${
                      row?.completedAt ? "rgba(126, 255, 151, 0.4)" : C.border
                    }`,
                    borderRadius: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 18,
                      fontWeight: 800,
                      color: C.text,
                    }}
                  >
                    {child.name}{" "}
                    <span
                      style={{
                        color: C.textMuted,
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      ({age} yo)
                    </span>
                  </h2>
                  <div
                    style={{
                      fontSize: 14,
                      color: accent,
                      fontWeight: 600,
                    }}
                  >
                    {stateLine}
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
