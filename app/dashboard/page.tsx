import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  RevealOnScroll,
  AnimatedBar,
  AnimatedRing,
  StaggeredList,
} from "@/app/components/AnimatedDashboardV2";
import {
  DashboardSky,
  DashboardParticles,
} from "@/app/components/DashboardAtmosphere";
import { hasEntitlement, getAge } from "@/app/lib/entitlements";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";

/* ───────────────── CYBER PALETTE ─────────────────
   Local subset of the cyber tokens — kept inline so the dashboard
   surfaces don't have to thread the central token import through every
   style block. Mirrors the dusk-cyber vocabulary used across the app. */
const C = {
  pageBg: "#080a16",
  card: "rgba(15, 21, 48, 0.72)",
  border: "rgba(0, 229, 255, 0.22)",
  borderStrong: "rgba(0, 229, 255, 0.45)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  textMuted: "rgba(125, 240, 255, 0.55)",
  goldLight: "#00e5ff",
  goldMid: "#7c5cff",
  goldDeep: "#3a7bff",
  goldDark: "#080a16",
  coral: "#ff5fb3",
  ember: "#ff7a59",
  moss: "#7eff97",
  mossLight: "#a0ffb0",
  cream: "#7df0ff",
};
const GRAD_GOLD = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid}, ${C.goldDeep})`;
const GRAD_GOLD_PILL = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid})`;
const GRAD_NAME = `linear-gradient(135deg, ${C.cream}, ${C.goldLight}, ${C.goldMid})`;
const GRAD_RACCOON = `linear-gradient(90deg, ${C.ember}, ${C.coral}, ${C.goldMid})`;

const SHADOW_SCENE =
  "0 30px 60px -20px rgba(8, 10, 22, 0.7), 0 0 0 1px rgba(0, 229, 255, 0.05) inset";
const SHADOW_PRIMARY =
  "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset";
const FONT_STACK =
  "ui-rounded, 'Fredoka', 'Quicksand', 'Nunito', system-ui, -apple-system, sans-serif";

const PRODUCT_SLUG = "cyber-heroes";

function ShieldLogo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      style={{ filter: "drop-shadow(0 0 8px rgba(0, 229, 255, 0.65))" }}
    >
      <defs>
        <linearGradient id="shieldLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#7c5cff" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5L3.5 5.6V12c0 5.4 3.7 8.6 8.5 9.5 4.8-.9 8.5-4.1 8.5-9.5V5.6L12 2.5z"
        stroke="url(#shieldLogoGrad)"
        strokeWidth={1.6}
        fill="rgba(0, 229, 255, 0.12)"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v8M8 12h8"
        stroke="url(#shieldLogoGrad)"
        strokeWidth={1.4}
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="1.3" fill="url(#shieldLogoGrad)" />
      <circle cx="12" cy="6.5" r="0.7" fill="url(#shieldLogoGrad)" />
      <circle cx="12" cy="17.5" r="0.7" fill="url(#shieldLogoGrad)" />
    </svg>
  );
}

function CheckIcon({ size = 18, color = C.mossLight }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12.5 10 17.5 19 7.5"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRow({ stars }: { stars: number }) {
  // Show three pips, filled = stars earned. Used on completed week
  // rows so a 3-star perfect run is immediately visible.
  const clamped = Math.max(0, Math.min(3, stars));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${clamped} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          style={{
            fontSize: 12,
            color: i < clamped ? "#ffd158" : "rgba(125, 240, 255, 0.25)",
            filter: i < clamped ? "drop-shadow(0 0 4px rgba(255,209,88,0.6))" : "none",
          }}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default async function DashboardPage() {
  // ── GATE ─────────────────────────────────────────────────────────
  // 1) Must be signed in. 2) Must own the cyber-heroes product. The
  // hub handles purchase + upsell now, so unentitled users bounce
  // back there instead of seeing an in-dashboard paywall.
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const ok = await hasEntitlement(session.user.id, PRODUCT_SLUG);
  if (!ok) redirect("/hub");

  // ── DATA ─────────────────────────────────────────────────────────
  const userId = session.user.id;

  const childProfiles = await prisma.childProfile.findMany({
    where: { userId },
    select: { id: true, name: true, dateOfBirth: true, favouriteColour: true },
    orderBy: { createdAt: "desc" },
  });
  if (childProfiles.length === 0) redirect("/onboarding");

  const activeChildId = (await resolveActiveChildProfileId(userId)) ?? childProfiles[0].id;
  const activeChild =
    childProfiles.find((c) => c.id === activeChildId) ?? childProfiles[0];

  const product = await prisma.product.findUnique({
    where: { slug: PRODUCT_SLUG },
    include: {
      courseContents: { orderBy: { week: "asc" } },
    },
  });

  // If the seed hasn't been run, render a minimal empty state instead
  // of crashing. Same shell, no module list.
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

  // Pick the "current" week — first non-completed week that has either
  // started or is the lowest week number (everything is unlocked once
  // entitled; we just highlight where to go next).
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
  const raccoonStrong = raccoonPower > 50;

  const encouragement =
    completedCount === 0
      ? {
          title: "Ready to begin, Cyber Hero?",
          body: "Your first mission is waiting. Start Week 1 and take your first step toward defeating the Hacker Raccoon!",
          cta: "Start Week 1 →",
          href: `/lesson/${nextWeek ?? 1}`,
        }
      : completedCount >= totalWeeks && totalWeeks > 0
        ? {
            title: "You saved the day!",
            body: "Every week complete. The Raccoon has been defeated. Keep your skills sharp and revisit any lesson anytime.",
            cta: "Revisit Week 1 →",
            href: `/lesson/1`,
          }
        : {
            title: "You're on a roll!",
            body: `${completedCount} week${completedCount !== 1 ? "s" : ""} done, ${remaining} to go. Keep the momentum. Each lesson weakens the Raccoon.`,
            cta: `Continue Week ${nextWeek ?? 1} →`,
            href: `/lesson/${nextWeek ?? 1}`,
          };

  const stats = [
    {
      label: "Weeks Done",
      value: completedCount,
      accent: C.mossLight,
      icon: "✓",
      glow: "rgba(168, 227, 187, 0.45)",
    },
    {
      label: "Remaining",
      value: remaining,
      accent: C.goldLight,
      icon: "◷",
      glow: "rgba(0, 229, 255, 0.45)",
    },
    {
      label: "Badges Earned",
      value: completedCount,
      accent: C.goldMid,
      icon: "★",
      glow: "rgba(255, 155, 74, 0.5)",
    },
    {
      label: "Raccoon Power",
      value: `${raccoonPower}%`,
      accent: C.coral,
      icon: "🦝",
      glow: "rgba(240, 142, 126, 0.45)",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka:wght@500;600;700;800&display=swap');
        .dash { font-family: ${FONT_STACK}; color: ${C.text}; }
        .dash h1, .dash h2, .dash h3, .dash h4, .dash .display { font-family: 'Fredoka', ${FONT_STACK}; }
      `}</style>

      <div
        className="dash min-h-screen relative"
        style={{
          background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, ${C.pageBg} 70%, #04050d 100%)`,
        }}
      >
        <DashboardSky />
        <DashboardParticles />

        {/* ── NAV ── */}
        <nav
          className="sticky top-0 z-50"
          style={{
            background: "rgba(20, 8, 24, 0.78)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <a href="/hub" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 100,
                  background: GRAD_GOLD_PILL,
                  boxShadow: "0 4px 14px rgba(255, 155, 74, 0.4)",
                }}
              >
                <ShieldLogo size={22} />
              </div>
              <span
                className="display text-lg font-bold"
                style={{ color: C.text, letterSpacing: "-0.01em" }}
              >
                CyberHeroes
              </span>
            </a>
            <div className="flex items-center gap-3">
              <div
                className="hidden sm:flex items-center gap-2 pr-3"
                style={{
                  background: "rgba(0, 229, 255, 0.06)",
                  border: `1px solid ${C.border}`,
                  borderRadius: 100,
                  padding: "3px 3px 3px 3px",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 100,
                    background: GRAD_GOLD_PILL,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 900,
                    color: C.goldDark,
                    boxShadow: "0 2px 8px rgba(255, 155, 74, 0.4)",
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: C.textSoft, paddingRight: 4 }}
                >
                  {userName}
                  <span
                    className="ml-1.5"
                    style={{ color: C.textMuted, fontWeight: 700 }}
                  >
                    · age {childAge}
                  </span>
                </span>
              </div>
              <a
                href="/hub"
                className="hidden sm:inline-block"
                style={{
                  background: "rgba(255, 215, 138, 0.12)",
                  border: `1px solid ${C.borderStrong}`,
                  borderRadius: 100,
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.goldLight,
                  textDecoration: "none",
                }}
              >
                Hub
              </a>
              <form
                action={async () => {
                  "use server";
                  const { signOut } = await import("@/app/lib/auth");
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  style={{
                    background: "transparent",
                    border: `1px solid ${C.border}`,
                    borderRadius: 100,
                    padding: "7px 16px",
                    color: C.textSoft,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </nav>

        <div className="relative max-w-[1100px] mx-auto px-6 md:px-10 py-10" style={{ zIndex: 1 }}>
          {/* ── WELCOME HERO ── */}
          <RevealOnScroll>
            <section className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-14 mb-10">
              <div className="flex-1 text-center lg:text-left">
                <div
                  className="inline-flex items-center gap-2 mb-4"
                  style={{
                    background: "rgba(124, 200, 154, 0.16)",
                    border: `1px solid rgba(124, 200, 154, 0.5)`,
                    borderRadius: 100,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    color: C.mossLight,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 100,
                      background: C.moss,
                      boxShadow: `0 0 10px ${C.moss}`,
                      display: "inline-block",
                    }}
                  />
                  Mission Active
                </div>
                <h1
                  className="display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3"
                  style={{ color: C.text }}
                >
                  Welcome back,{" "}
                  <span
                    style={{
                      background: GRAD_NAME,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {userName}
                  </span>
                  !
                </h1>
                <p
                  className="text-base sm:text-lg mb-6 leading-relaxed"
                  style={{ color: C.textSoft, opacity: 0.92 }}
                >
                  {completedCount === 0
                    ? "Your first mission is ready. Tap below to begin."
                    : "Continue your adventure with Adam & Layla."}
                </p>

                {completedCount === 0 && (
                  <a
                    href={`/lesson/${nextWeek ?? 1}`}
                    className="inline-flex items-center gap-2 font-black mb-6 transition-all duration-200 hover:scale-105"
                    style={{
                      background: GRAD_GOLD_PILL,
                      color: C.goldDark,
                      boxShadow: SHADOW_PRIMARY,
                      borderRadius: 100,
                      padding: "14px 28px",
                      fontSize: 16,
                      textDecoration: "none",
                      letterSpacing: "0.02em",
                    }}
                  >
                    <span>🚀</span> Start Your First Mission →
                  </a>
                )}

                {/* Progress card */}
                <div
                  className="rounded-3xl p-5"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.borderStrong}`,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "0 18px 36px -12px rgba(8, 10, 22, 0.55)",
                  }}
                >
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="font-bold" style={{ color: C.textSoft }}>
                      Overall Progress
                    </span>
                    <span className="font-black" style={{ color: C.goldLight }}>
                      {completedCount} of {totalWeeks} weeks
                    </span>
                  </div>
                  <AnimatedBar
                    percent={progressPct}
                    gradient={GRAD_GOLD}
                    glowColor="rgba(124, 92, 255, 0.55)"
                    height={14}
                  />
                </div>
              </div>

              {/* Hero image */}
              <div className="shrink-0">
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-3xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255, 215, 138, 0.45), rgba(255, 155, 74, 0.45))",
                      filter: "blur(35px)",
                      transform: "scale(1.1)",
                    }}
                  />
                  <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                      border: `3px solid ${C.borderStrong}`,
                      boxShadow:
                        "0 0 50px rgba(124, 92, 255, 0.35), 0 0 0 6px rgba(140, 70, 30, 0.5)",
                    }}
                  >
                    <Image
                      src="/characters/waving.png"
                      alt="Adam and Layla waving"
                      width={300}
                      height={300}
                      className="block"
                      priority
                    />
                  </div>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {/* ── STAT CARDS ROW ── */}
          <RevealOnScroll delay={120}>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "0 14px 28px -10px rgba(8, 10, 22, 0.5)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: s.accent,
                      boxShadow: `0 0 14px ${s.glow}`,
                    }}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{
                        fontSize: 18,
                        color: s.accent,
                        filter: `drop-shadow(0 0 8px ${s.glow})`,
                      }}
                      aria-hidden
                    >
                      {s.icon}
                    </span>
                  </div>
                  <div
                    className="display"
                    style={{
                      fontSize: 36,
                      fontWeight: 800,
                      color: C.text,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="mt-1"
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: C.textMuted,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </section>
          </RevealOnScroll>

          {product ? (
            <>
              {/* ── HACKER RACCOON ── */}
              <RevealOnScroll delay={80}>
                <section
                  className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 mb-10"
                  style={{
                    background: C.card,
                    border: `1px solid ${
                      raccoonStrong
                        ? "rgba(255, 95, 179, 0.5)"
                        : "rgba(124, 200, 154, 0.45)"
                    }`,
                    boxShadow: raccoonStrong
                      ? "0 0 28px rgba(255, 95, 179, 0.18), 0 18px 36px -12px rgba(8, 10, 22, 0.6)"
                      : "0 0 28px rgba(124, 200, 154, 0.18), 0 18px 36px -12px rgba(8, 10, 22, 0.6)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div className="relative shrink-0">
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: raccoonStrong
                          ? "rgba(255, 95, 179, 0.4)"
                          : "rgba(124, 200, 154, 0.32)",
                        filter: "blur(28px)",
                        transform: "scale(0.85)",
                      }}
                    />
                    <Image
                      src="/characters/raccoon-sneaking.png"
                      alt="The Hacker Raccoon sneaking"
                      width={100}
                      height={100}
                      className="relative rounded-2xl block"
                      style={{
                        border: `2px solid ${
                          raccoonStrong
                            ? "rgba(255, 95, 179, 0.55)"
                            : "rgba(124, 200, 154, 0.5)"
                        }`,
                      }}
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full">
                    <h3
                      className="display font-bold text-lg mb-2"
                      style={{ color: C.text }}
                    >
                      {completedCount >= totalWeeks && totalWeeks > 0
                        ? "You defeated the Hacker Raccoon!"
                        : "The Hacker Raccoon is still out there…"}
                    </h3>
                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: C.textSoft, opacity: 0.9 }}
                    >
                      {completedCount >= totalWeeks && totalWeeks > 0
                        ? "Amazing work, Cyber Hero! You've completed every lesson and saved the day."
                        : `Complete all ${totalWeeks} weeks to defeat him. Each lesson weakens his power.`}
                    </p>
                    <div>
                      <div className="flex justify-between text-xs font-black mb-1.5">
                        <span style={{ color: C.coral, letterSpacing: 1 }}>
                          Raccoon Power
                        </span>
                        <span style={{ color: C.coral }}>{raccoonPower}%</span>
                      </div>
                      <AnimatedBar
                        percent={raccoonPower}
                        gradient={GRAD_RACCOON}
                        glowColor="rgba(240, 142, 126, 0.5)"
                        height={12}
                      />
                      <p
                        className="text-[11px] font-bold mt-2"
                        style={{ color: C.textMuted }}
                      >
                        {completedCount === 0
                          ? "Start your first lesson to begin weakening the raccoon."
                          : completedCount >= totalWeeks
                            ? "The raccoon's power has been fully drained."
                            : `${completedCount} lesson${completedCount !== 1 ? "s" : ""} down. Keep going!`}
                      </p>
                    </div>
                  </div>
                </section>
              </RevealOnScroll>

              {/* ── PRODUCT HEADER ── */}
              <RevealOnScroll delay={120}>
                <section
                  className="rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow: SHADOW_SCENE,
                  }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span
                      className="text-5xl shrink-0"
                      aria-hidden
                      style={{
                        filter: "drop-shadow(0 0 18px rgba(124, 92, 255, 0.5))",
                      }}
                    >
                      {product.emoji}
                    </span>
                    <div className="min-w-0">
                      <h2
                        className="display text-xl sm:text-2xl font-bold leading-snug"
                        style={{ color: C.text }}
                      >
                        {product.name}
                      </h2>
                      <p className="text-sm font-bold" style={{ color: C.textSoft, opacity: 0.85 }}>
                        Ages {product.ageRange} · {product.weeksCount} Weeks · {product.duration}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <AnimatedRing
                      percent={progressPct}
                      gradientFrom={C.goldLight}
                      gradientTo={C.goldMid}
                      glow={"rgba(124, 92, 255, 0.55)"}
                      track={"rgba(0, 229, 255, 0.12)"}
                      label={C.goldLight}
                    />
                  </div>
                </section>
              </RevealOnScroll>

              {/* ── WEEK LIST ── */}
              <StaggeredList className="space-y-3 mb-12">
                {courseContents.map((cc) => {
                  const p = progressByWeek.get(cc.week);
                  const isCompleted = !!p?.completedAt;
                  const isInProgress = !!p && !isCompleted;
                  const isCurrent = cc.week === nextWeek;

                  return (
                    <div
                      key={cc.id}
                      className="rounded-3xl flex items-center gap-4 sm:gap-5 transition-all duration-300"
                      style={{
                        padding: isCurrent ? "24px 24px" : "20px 24px",
                        background: isCurrent
                          ? "linear-gradient(135deg, rgba(124, 92, 255, 0.16), rgba(255, 215, 138, 0.10))"
                          : isCompleted
                            ? "linear-gradient(135deg, rgba(124, 200, 154, 0.12), rgba(15, 21, 48, 0.5))"
                            : C.card,
                        border: isCurrent
                          ? `2px solid rgba(124, 92, 255, 0.7)`
                          : isCompleted
                            ? "1px solid rgba(124, 200, 154, 0.4)"
                            : `1px solid ${C.border}`,
                        boxShadow: isCurrent
                          ? "0 0 32px rgba(124, 92, 255, 0.35), 0 18px 36px -12px rgba(8, 10, 22, 0.55)"
                          : isCompleted
                            ? "0 12px 24px -10px rgba(8, 10, 22, 0.45)"
                            : "0 10px 22px -10px rgba(8, 10, 22, 0.45)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}
                    >
                      {/* Week badge */}
                      <div
                        className="shrink-0 flex items-center justify-center font-black text-sm"
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          background: isCompleted
                            ? "rgba(124, 200, 154, 0.22)"
                            : isCurrent
                              ? GRAD_GOLD_PILL
                              : "rgba(0, 229, 255, 0.06)",
                          color: isCompleted
                            ? C.mossLight
                            : isCurrent
                              ? C.goldDark
                              : C.textSoft,
                          boxShadow: isCompleted
                            ? "0 0 18px rgba(124, 200, 154, 0.45)"
                            : isCurrent
                              ? "0 0 22px rgba(124, 92, 255, 0.55)"
                              : "none",
                        }}
                      >
                        {isCompleted ? <CheckIcon size={22} color={C.mossLight} /> : `W${cc.week}`}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-black uppercase mb-0.5 flex items-center gap-2 flex-wrap"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.15em",
                            color: isCompleted
                              ? "rgba(168, 227, 187, 0.85)"
                              : isCurrent
                                ? C.goldLight
                                : "rgba(125, 240, 255, 0.5)",
                          }}
                        >
                          <span>Week {cc.week}</span>
                          {isCompleted && p && p.stars > 0 && <StarRow stars={p.stars} />}
                          {isInProgress && p && (
                            <span style={{ color: C.goldLight, letterSpacing: "0.05em" }}>
                              · screen {p.screen}
                            </span>
                          )}
                        </div>
                        <h3
                          className="display font-bold text-sm sm:text-base leading-snug"
                          style={{
                            color: C.text,
                            opacity: isCompleted ? 0.82 : 1,
                          }}
                        >
                          {cc.title}
                        </h3>
                        <p
                          className="text-xs mt-1 leading-relaxed line-clamp-2"
                          style={{ color: C.textMuted }}
                        >
                          {cc.description}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        {isCompleted ? (
                          <a
                            href={`/lesson/${cc.week}`}
                            className="inline-flex items-center gap-1.5 font-black transition-all duration-200 hover:scale-105"
                            style={{
                              background: "rgba(124, 200, 154, 0.16)",
                              color: C.mossLight,
                              border: "1px solid rgba(124, 200, 154, 0.5)",
                              borderRadius: 100,
                              padding: "8px 16px",
                              fontSize: 12,
                              textDecoration: "none",
                            }}
                          >
                            <CheckIcon size={14} color={C.mossLight} />
                            Replay
                          </a>
                        ) : isCurrent ? (
                          <a
                            href={`/lesson/${cc.week}`}
                            className="inline-block font-black transition-all duration-200 hover:scale-105"
                            style={{
                              background: GRAD_GOLD_PILL,
                              color: C.goldDark,
                              boxShadow: SHADOW_PRIMARY,
                              borderRadius: 100,
                              padding: "12px 24px",
                              fontSize: 14,
                              minHeight: 44,
                              textDecoration: "none",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {isInProgress ? "Continue →" : "Start Lesson →"}
                          </a>
                        ) : (
                          <a
                            href={`/lesson/${cc.week}`}
                            className="inline-block font-black transition-all duration-200 hover:scale-105"
                            style={{
                              background: GRAD_GOLD_PILL,
                              color: C.goldDark,
                              boxShadow:
                                "0 14px 28px -8px rgba(255,120,40,0.55), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
                              borderRadius: 100,
                              padding: "10px 20px",
                              fontSize: 12,
                              textDecoration: "none",
                            }}
                          >
                            Start Lesson →
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </StaggeredList>

              {/* ── ENCOURAGEMENT ── */}
              <RevealOnScroll delay={80}>
                <section
                  className="rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden mb-6"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 215, 138, 0.18), rgba(196, 60, 106, 0.16))",
                    border: `1px solid ${C.borderStrong}`,
                    boxShadow:
                      "0 0 50px rgba(124, 92, 255, 0.18), 0 24px 50px -16px rgba(8, 10, 22, 0.6)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 5,
                      color: C.goldLight,
                      textTransform: "uppercase",
                      marginBottom: 8,
                    }}
                  >
                    ✦ Cyber Hero Academy ✦
                  </div>
                  <h3
                    className="display text-2xl sm:text-3xl font-bold mb-3"
                    style={{
                      background: GRAD_GOLD,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    {encouragement.title}
                  </h3>
                  <p
                    className="text-base mb-6 max-w-xl mx-auto leading-relaxed"
                    style={{ color: C.textSoft, opacity: 0.92 }}
                  >
                    {encouragement.body}
                  </p>
                  <a
                    href={encouragement.href}
                    className="inline-block font-black transition-all duration-200 hover:scale-105"
                    style={{
                      background: GRAD_GOLD_PILL,
                      color: C.goldDark,
                      boxShadow: SHADOW_PRIMARY,
                      borderRadius: 100,
                      padding: "14px 32px",
                      fontSize: 16,
                      textDecoration: "none",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {encouragement.cta}
                  </a>
                </section>
              </RevealOnScroll>
            </>
          ) : (
            <div
              className="rounded-3xl p-10 text-center"
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
              }}
            >
              <p className="font-bold" style={{ color: C.textMuted }}>
                Cyber Heroes content is not yet available. Please run the seed script.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
