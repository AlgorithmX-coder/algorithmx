/**
 * /hub — the family home base after login.
 *
 * Server component: auth + data fetch happen here, then the result is
 * composed into client components (HubTrackCard, WaitlistMiniButton) for
 * motion + interaction. No entitlement gate on this route itself — the
 * hub is the ROUTING surface for entitlement gates (track cards link to
 * /dashboard for owned tracks, /purchase/<slug> for active-unowned ones,
 * and collect waitlist sign-ups for coming-soon ones).
 *
 * Layout (matches the family-dashboard design):
 *   - top bar: AX logo + FAMILY HUB pill
 *   - hero: "Welcome back, {name}" greeting + a stats strip
 *   - TRACKS: four EQUAL-SIZE track cards (live + three coming-soon)
 *   - activity bar: today's mission · course progress · family
 *
 * Data honesty: every number is real or cleanly derived from the
 * `Progress` table (badges = completed weeks, active missions =
 * in-progress weeks, stars = summed stars, progress %/rank via the
 * certificates milestones). The design intentionally avoids stats with
 * no backend source (a true day-streak and per-lesson time tracking do
 * not exist in the schema yet).
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

import { getOwnedProductSlugs } from "@/app/lib/entitlements";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";
import { getAchievedMilestones } from "@/app/lib/certificates";
import { landingRouteFor } from "@/app/lib/courseLandings";
import { CYBER_PALETTE, CYBER_GRAD } from "@/app/components/scene/cyberTokens";
import { CyberIcon, type CyberIconName, type CyberIconAccent } from "@/app/components/CyberIcon";
import HubTrackCard from "@/app/components/hub/HubTrackCard";

const C = CYBER_PALETTE;
const FONT_DISPLAY = "var(--font-space-grotesk), 'Space Grotesk', system-ui, sans-serif";
const FONT_BODY = "var(--font-dm-sans), 'DM Sans', system-ui, sans-serif";
const FONT_MONO = "ui-monospace, 'JetBrains Mono', Menlo, monospace";

/* Per-track presentation — punchy tagline + emblem glyph + accent. Keyed
 * by slug so it lands without a migration. Display names + age ranges
 * still come straight from the DB. */
const TRACK_CONFIG: Record<
  string,
  { tagline: string; icon: CyberIconName; accent: CyberIconAccent; accentHex: string }
> = {
  "cyber-heroes": {
    tagline: "Become a hero of the digital world. Learn. Defend. Lead.",
    icon: "shield",
    accent: "cyan",
    accentHex: C.cyan,
  },
  cyberexplorers: {
    tagline: "Explore. Discover. Understand the digital universe.",
    icon: "compass",
    accent: "electric",
    accentHex: C.electric,
  },
  cyberstart: {
    tagline: "Build skills. Create projects. Launch your future.",
    icon: "rocket",
    accent: "neon",
    accentHex: C.neon,
  },
  "cyberstart-pro": {
    tagline: "Advanced paths for future innovators and leaders.",
    icon: "graduation",
    accent: "cosmic",
    accentHex: C.cosmic,
  },
};

const FALLBACK_CONFIG = {
  tagline: "Hands-on cyber skills at the right level.",
  icon: "shield" as CyberIconName,
  accent: "cyan" as CyberIconAccent,
  accentHex: C.cyan,
};

function firstName(full?: string | null): string {
  if (!full) return "hero";
  const t = full.trim();
  return t ? t.split(/\s+/)[0] : "hero";
}

/** A simple colour string from the DB. Falls back to the brand cyan. */
function avatarColour(raw?: string | null): string {
  const v = (raw ?? "").trim();
  return v || C.cyan;
}

export default async function HubPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  /* ── Data: all real, all from Progress / ChildProfile / Product ── */
  const [products, ownedSlugs, children, activeChildId] = await Promise.all([
    prisma.product.findMany({ orderBy: { ageMin: "asc" } }),
    getOwnedProductSlugs(userId),
    prisma.childProfile.findMany({
      where: { userId },
      select: { id: true, name: true, favouriteColour: true },
      orderBy: { createdAt: "desc" },
    }),
    resolveActiveChildProfileId(userId),
  ]);

  const childIds = children.map((c) => c.id);
  const liveProduct = products.find((p) => p.status === "ACTIVE") ?? null;
  const liveOwned = liveProduct ? ownedSlugs.has(liveProduct.slug) : false;

  /* Family-wide tallies (top stats) + active-child journey (card/bar). */
  let famBadges = 0;
  let famMissions = 0;
  let famStars = 0;
  let completedCount = 0;
  let totalWeeks = liveProduct?.weeksCount ?? 0;
  let weekCount = 0; // actual CourseContent rows — drives "all complete" vs "no content yet"
  let progressPct = 0;
  let rankLabel: string | null = null;
  let nextMission: { title: string; week: number } | null = null;

  if (liveProduct) {
    const liveContent = await prisma.product.findUnique({
      where: { id: liveProduct.id },
      select: {
        weeksCount: true,
        courseContents: { orderBy: { week: "asc" }, select: { week: true, title: true } },
      },
    });
    weekCount = liveContent?.courseContents.length ?? 0;
    totalWeeks = liveProduct.weeksCount || weekCount || 0;

    const allRows = childIds.length
      ? await prisma.progress.findMany({
          where: { childProfileId: { in: childIds }, productId: liveProduct.id },
          select: { childProfileId: true, week: true, stars: true, completedAt: true },
        })
      : [];

    famBadges = allRows.filter((r) => r.completedAt !== null).length;
    famMissions = allRows.filter((r) => r.completedAt === null).length;
    famStars = allRows.reduce((s, r) => s + (r.stars ?? 0), 0);

    const activeRows = activeChildId
      ? allRows.filter((r) => r.childProfileId === activeChildId)
      : [];
    completedCount = activeRows.filter((r) => r.completedAt !== null).length;
    progressPct = totalWeeks > 0 ? Math.round((completedCount / totalWeeks) * 100) : 0;

    const byWeek = new Map(activeRows.map((r) => [r.week, r]));
    for (const cc of liveContent?.courseContents ?? []) {
      const pr = byWeek.get(cc.week);
      if (!pr || !pr.completedAt) {
        nextMission = { title: cc.title, week: cc.week };
        break;
      }
    }

    const achieved = getAchievedMilestones(completedCount).filter((m) => m.achieved);
    rankLabel = achieved.length
      ? `Level ${achieved.length} · ${achieved[achieved.length - 1].title}`
      : "Cyber Rookie";
  }

  /* Today's mission routing (active child / live track). nextMission is
     null both when every week is done AND when the track has no content
     yet — distinguish them via weekCount so an empty track never claims
     "all missions complete". */
  const allDone = weekCount > 0 && nextMission === null;
  const mission = liveProduct
    ? {
        title: nextMission
          ? nextMission.title
          : allDone
            ? "All missions complete"
            : "Start your journey",
        course: liveProduct.name,
        href: nextMission
          ? liveOwned
            ? `/lesson/${nextMission.week}`
            : `/purchase/${liveProduct.slug}`
          : liveOwned
            ? "/dashboard"
            : `/purchase/${liveProduct.slug}`,
        cta: nextMission
          ? liveOwned
            ? "Continue"
            : "Get started"
          : allDone
            ? "Review"
            : liveOwned
              ? "Open"
              : "Get started",
      }
    : null;

  const stats: { label: string; value: number; icon: CyberIconName; accent: CyberIconAccent; hex: string }[] = [
    { label: "Badges Earned", value: famBadges, icon: "trophy", accent: "amber", hex: C.amber },
    { label: "Active Missions", value: famMissions, icon: "target", accent: "cyan", hex: C.cyan },
    { label: "Stars Earned", value: famStars, icon: "star", accent: "neon", hex: C.neon },
  ];

  const shownChildren = children.slice(0, 3);
  const extraChildren = Math.max(0, children.length - shownChildren.length);

  return (
    <main
      className="hub-root"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: CYBER_GRAD.page,
        color: C.textBright,
        overflowX: "hidden",
        fontFamily: FONT_BODY,
      }}
    >
      {/* Ambient glow field */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(0,229,255,0.06) 0%, transparent 45%), radial-gradient(circle at 85% 75%, rgba(124,92,255,0.08) 0%, transparent 50%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1280,
          margin: "0 auto",
          padding: "28px 32px 72px",
        }}
      >
        {/* ─── TOP BAR ─── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 13,
                background: CYBER_GRAD.hero,
                boxShadow: `0 0 22px ${C.cyan}77`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: C.abyss, fontFamily: FONT_DISPLAY }}>AX</span>
            </div>
            <span style={{ fontSize: 21, fontWeight: 700, color: C.textBright, fontFamily: FONT_DISPLAY, letterSpacing: "-0.01em" }}>
              Algorithm
              <span style={{ background: CYBER_GRAD.hero, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", color: "transparent" }}>X</span>
            </span>
          </Link>

          <Link
            href="/parent"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 9,
              padding: "12px 18px",
              borderRadius: 999,
              background: "rgba(8,10,22,0.6)",
              border: `1px solid ${C.cyan}55`,
              color: C.cyanSoft,
              textDecoration: "none",
              fontFamily: FONT_MONO,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              textShadow: `0 0 8px ${C.cyan}66`,
            }}
          >
            <CyberIcon name="family" size={17} accent="cyan" glow={false} />
            Family Hub
          </Link>
        </header>

        {/* ─── HERO: greeting + stats strip ─── */}
        <section
          className="hub-hero"
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 28,
            flexWrap: "wrap",
            marginBottom: 44,
          }}
        >
          <div style={{ minWidth: 280 }}>
            <h1
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: "clamp(34px, 5vw, 54px)",
                fontWeight: 700,
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                margin: "0 0 12px",
                color: C.textBright,
              }}
            >
              Welcome back,{" "}
              <span
                style={{
                  background: CYBER_GRAD.hero,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: `drop-shadow(0 0 22px ${C.cosmic}55)`,
                }}
              >
                {firstName(session.user.name)}
              </span>
            </h1>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: C.textSoft, fontFamily: FONT_BODY }}>
              Choose an adventure for your family.
            </p>
          </div>

          {/* Stats strip */}
          <div
            className="hub-stats"
            style={{
              display: "flex",
              alignItems: "stretch",
              borderRadius: 18,
              background: CYBER_GRAD.glass,
              border: "1px solid rgba(125,240,255,0.12)",
              boxShadow: "0 16px 40px -18px rgba(0,0,0,0.6), 0 0 0 1px rgba(125,240,255,0.05) inset",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              overflow: "hidden",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "16px 22px",
                  borderLeft: i === 0 ? "none" : "1px solid rgba(125,240,255,0.1)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `radial-gradient(circle at 50% 40%, ${s.hex}26, rgba(8,10,22,0.4) 75%)`,
                    border: `1px solid ${s.hex}33`,
                    flexShrink: 0,
                  }}
                >
                  <CyberIcon name={s.icon} size={22} accent={s.accent} glow />
                </div>
                <div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, lineHeight: 1, color: C.textBright }}>
                    {s.value}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 12, fontWeight: 600, color: C.textSoft, marginTop: 4, whiteSpace: "nowrap" }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── TRACKS ─── */}
        <section aria-labelledby="tracks-heading">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
            <h2
              id="tracks-heading"
              style={{
                fontFamily: FONT_DISPLAY,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: C.cyanSoft,
                margin: 0,
                whiteSpace: "nowrap",
              }}
            >
              Tracks
            </h2>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.cyan}55, transparent)` }} />
          </div>

          <div className="hub-tracks">
            {products.map((product, i) => {
              const cfg = TRACK_CONFIG[product.slug] ?? FALLBACK_CONFIG;
              const owned = ownedSlugs.has(product.slug);
              const isLive = product.status === "ACTIVE";
              const enterHref = owned ? "/dashboard" : `/purchase/${product.slug}`;
              const enterLabel = owned ? "Enter" : "Get started";
              return (
                <HubTrackCard
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  tagline={cfg.tagline}
                  iconName={cfg.icon}
                  accent={cfg.accent}
                  accentHex={cfg.accentHex}
                  ageRange={product.ageRange}
                  duration={product.duration}
                  weeksCount={product.weeksCount}
                  status={product.status as "ACTIVE" | "COMING_SOON"}
                  owned={owned}
                  landingHref={landingRouteFor(product.slug)}
                  enterHref={enterHref}
                  enterLabel={enterLabel}
                  progressPct={isLive && owned ? progressPct : null}
                  rankLabel={isLive && owned ? rankLabel : null}
                  index={i}
                />
              );
            })}
          </div>
        </section>

        {/* ─── ACTIVITY BAR ─── */}
        <section
          className="hub-bottom"
          style={{
            marginTop: 28,
            display: "flex",
            alignItems: "stretch",
            borderRadius: 20,
            background: CYBER_GRAD.glass,
            border: "1px solid rgba(125,240,255,0.12)",
            boxShadow: "0 18px 44px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(125,240,255,0.05) inset",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            overflow: "hidden",
          }}
        >
          {/* Today's Mission */}
          <div className="hub-bottom-cell" style={{ flex: 1.4, minWidth: 260, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <CyberIcon name="target" size={18} accent="cyan" glow />
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.cyanSoft }}>
                Today&apos;s Mission
              </span>
            </div>
            {mission ? (
              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: `radial-gradient(circle at 50% 40%, ${C.cyan}22, rgba(8,10,22,0.4) 75%)`,
                    border: `1px solid ${C.cyan}33`,
                    flexShrink: 0,
                  }}
                >
                  <CyberIcon name="shield" size={24} accent="cyan" glow />
                </div>
                <div style={{ flex: 1, minWidth: 130 }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: C.textBright, lineHeight: 1.2 }}>
                    {mission.title}
                  </div>
                  <div style={{ fontFamily: FONT_BODY, fontSize: 12.5, color: C.textSoft, marginTop: 3 }}>
                    {mission.course}
                  </div>
                </div>
                <Link
                  href={mission.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 18px",
                    borderRadius: 10,
                    background: CYBER_GRAD.hero,
                    color: C.abyss,
                    textDecoration: "none",
                    fontFamily: FONT_DISPLAY,
                    fontWeight: 700,
                    fontSize: 13.5,
                  }}
                >
                  {mission.cta}
                  <CyberIcon name="chevron" size={14} accent="cyan" glow={false} />
                </Link>
              </div>
            ) : (
              <p style={{ margin: 0, color: C.textSoft, fontFamily: FONT_BODY, fontSize: 14 }}>
                Pick an adventure above to begin.
              </p>
            )}
          </div>

          {/* Course Progress */}
          <div className="hub-bottom-cell" style={{ flex: 1, minWidth: 200, padding: "20px 24px", borderLeft: "1px solid rgba(125,240,255,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <CyberIcon name="bolt" size={18} accent="cosmic" glow />
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.cosmicSoft }}>
                Course Progress
              </span>
            </div>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, fontWeight: 700, color: C.textBright, lineHeight: 1 }}>
              {completedCount}
              <span style={{ fontSize: 16, color: C.textSoft, fontWeight: 600 }}> / {totalWeeks} weeks</span>
            </div>
            <div style={{ marginTop: 12, width: "100%", height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ width: `${progressPct}%`, height: "100%", borderRadius: 999, background: CYBER_GRAD.hero, boxShadow: `0 0 12px ${C.cosmic}88` }} />
            </div>
            <div style={{ marginTop: 7, fontFamily: FONT_BODY, fontSize: 12, color: C.textSoft }}>{progressPct}% complete</div>
          </div>

          {/* Family Activity */}
          <div className="hub-bottom-cell" style={{ flex: 1, minWidth: 200, padding: "20px 24px", borderLeft: "1px solid rgba(125,240,255,0.1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <CyberIcon name="family" size={18} accent="lime" glow />
              <span style={{ fontFamily: FONT_DISPLAY, fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.lime }}>
                Family
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {children.length > 0 ? (
                <div style={{ display: "flex" }}>
                  {shownChildren.map((c, i) => {
                    const col = avatarColour(c.favouriteColour);
                    return (
                      <div
                        key={c.id}
                        title={c.name}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: col,
                          color: "#06080f",
                          fontFamily: FONT_DISPLAY,
                          fontWeight: 700,
                          fontSize: 15,
                          border: "2px solid #0f1530",
                          marginLeft: i === 0 ? 0 : -10,
                          boxShadow: `0 0 12px ${col}66`,
                        }}
                      >
                        {c.name.trim().charAt(0).toUpperCase()}
                      </div>
                    );
                  })}
                  {extraChildren > 0 && (
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(8,10,22,0.7)",
                        color: C.cyanSoft,
                        fontFamily: FONT_DISPLAY,
                        fontWeight: 700,
                        fontSize: 13,
                        border: "2px solid #0f1530",
                        marginLeft: -10,
                      }}
                    >
                      +{extraChildren}
                    </div>
                  )}
                </div>
              ) : (
                <CyberIcon name="family" size={34} accent="lime" glow />
              )}
              <div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, fontWeight: 700, color: C.textBright, lineHeight: 1.2 }}>
                  {children.length} {children.length === 1 ? "learner" : "learners"}
                </div>
                <Link
                  href="/parent"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    minHeight: 44,
                    padding: "6px 0",
                    fontFamily: FONT_BODY,
                    fontSize: 12.5,
                    color: C.cyanSoft,
                    textDecoration: "none",
                  }}
                >
                  {children.length > 0 ? "Manage family →" : "Add a learner →"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Responsive grid + activity-bar stacking + keyboard focus ring */}
      <style>{`
        /* High-contrast focus ring for the hub's inline-styled controls.
           box-shadow follows each control's own border-radius and !important
           overrides inline box-shadow so the ring always shows; it sits
           inside the cards' padding so overflow:hidden never clips it. */
        .hub-root :is(a, button, input):focus-visible {
          outline: none !important;
          box-shadow: 0 0 0 2px #04050d, 0 0 0 4px #7df0ff !important;
        }
        .hub-tracks {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          align-items: stretch;
        }
        @media (max-width: 1040px) {
          .hub-tracks { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 560px) {
          .hub-tracks { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .hub-bottom { flex-direction: column; }
          .hub-bottom-cell { border-left: none !important; border-top: 1px solid rgba(125,240,255,0.1); }
          .hub-bottom-cell:first-child { border-top: none; }
        }
        @media (max-width: 720px) {
          .hub-stats { width: 100%; justify-content: space-between; }
        }
        @media (max-width: 460px) {
          .hub-stats { flex-direction: column; }
          .hub-stats > div { border-left: none !important; }
        }
      `}</style>
    </main>
  );
}
