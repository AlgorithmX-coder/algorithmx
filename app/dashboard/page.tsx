import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  CyberBackground,
  RevealOnScroll,
  AnimatedBar,
  AnimatedRing,
  StaggeredList,
} from "@/app/components/AnimatedDashboardV2";

const GRAD_MAIN = "linear-gradient(135deg, #60a5fa, #34d399)";
const GRAD_CTA = "linear-gradient(135deg, #f97316, #f59e0b)";
const GRAD_NAME = "linear-gradient(135deg, #f59e0b, #f97316)";
const GRAD_RACCOON = "linear-gradient(90deg, #f97316, #ef4444)";

const COLORS = {
  bg: "#0a0e1a",
  card: "#111827",
  border: "rgba(148,163,184,0.12)",
  text: "#f1f5f9",
  secondary: "#94a3b8",
  muted: "#64748b",
  blue: "#60a5fa",
  green: "#34d399",
  orange: "#f97316",
  yellow: "#f59e0b",
  red: "#ef4444",
};

function ShieldLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="shieldLogoGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5 4 5.2v6.3c0 4.7 3.3 8.7 8 10 4.7-1.3 8-5.3 8-10V5.2L12 2.5Z"
        fill="url(#shieldLogoGrad)"
      />
      <path
        d="m9 12 2.2 2.2L15 10.4"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ size = 18, color = "#34d399" }: { size?: number; color?: string }) {
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

function LockIcon({ size = 18, color = "#64748b" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke={color} strokeWidth="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const childProfiles = await prisma.childProfile.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
  });

  if (childProfiles.length === 0) redirect("/onboarding");

  const activeChild = childProfiles[0];

  const course = await prisma.course.findFirst({
    where: { title: "Cyber Heroes Academy" },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          progress: {
            where: { userId: session.user.id! },
          },
        },
      },
    },
  });

  const completedCount =
    course?.modules.filter(
      (m: NonNullable<typeof course>["modules"][number]) =>
        m.progress[0]?.status === "COMPLETED",
    ).length ?? 0;

  const totalModules = course?.modules.length ?? 0;
  const progressPct = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
  const remaining = Math.max(0, totalModules - completedCount);

  let foundCurrentNext = false;
  const modules = (course?.modules ?? []).map(
    (module: NonNullable<typeof course>["modules"][number], idx: number) => {
      const status = module.progress[0]?.status ?? "NOT_STARTED";
      const isCompleted = status === "COMPLETED";
      const isInProgress = status === "IN_PROGRESS";
      const isWeekOne = module.weekNumber === 1;
      const prevModule = idx > 0 ? course!.modules[idx - 1] : null;
      const prevCompleted = prevModule?.progress[0]?.status === "COMPLETED";
      const isUnlocked = isWeekOne || prevCompleted || isCompleted || isInProgress;

      const isCurrentNext = isUnlocked && !isCompleted && !foundCurrentNext;
      if (isCurrentNext) foundCurrentNext = true;

      return {
        id: module.id,
        weekNumber: module.weekNumber,
        title: module.title,
        description: module.description,
        isCompleted,
        isInProgress,
        isUnlocked,
        isCurrentNext,
        prevWeek: !isUnlocked && prevModule ? prevModule.weekNumber : null,
      };
    },
  );

  const userName = activeChild.childName ?? session.user.name ?? "Cyber Hero";
  const raccoonPower = Math.round(100 - progressPct);
  const raccoonStrong = raccoonPower > 50;

  const encouragement =
    completedCount === 0
      ? {
          title: "Ready to begin, Cyber Hero?",
          body: "Your first mission is waiting. Start Week 1 and take your first step toward defeating the Hacker Raccoon!",
          cta: "Start Week 1 →",
        }
      : completedCount >= totalModules && totalModules > 0
        ? {
            title: "You saved the day!",
            body: "Every week complete. The Raccoon has been defeated. Keep your skills sharp and revisit any lesson anytime.",
            cta: "Revisit a Lesson →",
          }
        : {
            title: "You're on a roll!",
            body: `${completedCount} week${completedCount !== 1 ? "s" : ""} done, ${remaining} to go. Keep the momentum — each lesson weakens the Raccoon.`,
            cta: "Continue Mission →",
          };

  const stats = [
    {
      label: "Weeks Done",
      value: completedCount,
      accent: COLORS.green,
      icon: "✓",
      glow: "rgba(52,211,153,0.3)",
    },
    {
      label: "Remaining",
      value: remaining,
      accent: COLORS.blue,
      icon: "◷",
      glow: "rgba(96,165,250,0.3)",
    },
    {
      label: "Badges Earned",
      value: completedCount,
      accent: COLORS.yellow,
      icon: "★",
      glow: "rgba(245,158,11,0.3)",
    },
    {
      label: "Raccoon Power",
      value: `${raccoonPower}%`,
      accent: COLORS.orange,
      icon: "🦝",
      glow: "rgba(249,115,22,0.3)",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka:wght@500;600;700&display=swap');
        .dash { font-family: 'Nunito', sans-serif; color: ${COLORS.text}; }
        .dash h1, .dash h2, .dash h3, .dash h4, .dash .display { font-family: 'Fredoka', 'Nunito', sans-serif; }
      `}</style>

      <div className="dash min-h-screen relative" style={{ background: COLORS.bg }}>
        <CyberBackground />

        {/* ── NAV ── */}
        <nav
          className="sticky top-0 z-50 border-b"
          style={{
            background: "rgba(10,14,26,0.85)",
            backdropFilter: "blur(20px)",
            borderColor: COLORS.border,
          }}
        >
          <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
              <div
                className="flex items-center justify-center"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 100,
                  background: GRAD_MAIN,
                  boxShadow: "0 4px 14px rgba(96,165,250,0.35)",
                }}
              >
                <ShieldLogo size={22} />
              </div>
              <span className="display text-lg font-bold" style={{ color: COLORS.text, letterSpacing: "-0.01em" }}>
                CyberHeroes
              </span>
            </a>
            <div className="flex items-center gap-3">
              <div
                className="hidden sm:flex items-center gap-2 pr-3"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 100,
                  padding: "3px 3px 3px 3px",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 100,
                    background: GRAD_CTA,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 900,
                    color: "#fff",
                    boxShadow: "0 2px 8px rgba(249,115,22,0.35)",
                  }}
                >
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold" style={{ color: COLORS.secondary, paddingRight: 4 }}>
                  {userName}
                </span>
              </div>
              <a
                href="/parent"
                className="hidden sm:inline-block"
                style={{
                  background: "rgba(96,165,250,0.12)",
                  border: "1px solid rgba(96,165,250,0.35)",
                  borderRadius: 100,
                  padding: "7px 16px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: COLORS.blue,
                  textDecoration: "none",
                }}
              >
                Parent View
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
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 100,
                    padding: "7px 16px",
                    color: COLORS.secondary,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
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
                    background: "rgba(52,211,153,0.10)",
                    border: "1px solid rgba(52,211,153,0.35)",
                    borderRadius: 100,
                    padding: "5px 14px",
                    fontSize: 12,
                    fontWeight: 800,
                    color: COLORS.green,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 100,
                      background: COLORS.green,
                      boxShadow: `0 0 10px ${COLORS.green}`,
                      display: "inline-block",
                    }}
                  />
                  Mission Active
                </div>
                <h1
                  className="display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3"
                  style={{ color: COLORS.text }}
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
                <p className="text-base sm:text-lg mb-6 leading-relaxed" style={{ color: COLORS.secondary }}>
                  Continue your adventure with Adam &amp; Layla.
                </p>

                {/* Progress card */}
                <div
                  className="rounded-3xl p-5"
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="flex justify-between text-sm mb-2.5">
                    <span className="font-bold" style={{ color: COLORS.secondary }}>
                      Overall Progress
                    </span>
                    <span className="font-black" style={{ color: COLORS.blue }}>
                      {completedCount} of {totalModules} weeks
                    </span>
                  </div>
                  <AnimatedBar
                    percent={progressPct}
                    gradient={GRAD_MAIN}
                    glowColor="rgba(96,165,250,0.5)"
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
                      background: "linear-gradient(135deg, rgba(96,165,250,0.35), rgba(52,211,153,0.35))",
                      filter: "blur(35px)",
                      transform: "scale(1.1)",
                    }}
                  />
                  <div
                    className="relative rounded-3xl overflow-hidden border-2"
                    style={{
                      borderColor: "rgba(96,165,250,0.3)",
                      boxShadow: "0 0 50px rgba(96,165,250,0.15)",
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
                  <div
                    className="absolute"
                    style={{ top: -6, right: -6, fontSize: 14, color: COLORS.yellow }}
                    aria-hidden
                  >
                    ✦
                  </div>
                  <div
                    className="absolute"
                    style={{ bottom: 10, left: -8, fontSize: 10, color: COLORS.yellow }}
                    aria-hidden
                  >
                    ✦
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
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
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
                      boxShadow: `0 0 12px ${s.glow}`,
                    }}
                  />
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{
                        fontSize: 18,
                        color: s.accent,
                        filter: `drop-shadow(0 0 6px ${s.glow})`,
                      }}
                      aria-hidden
                    >
                      {s.icon}
                    </span>
                  </div>
                  <div
                    className="display"
                    style={{ fontSize: 36, fontWeight: 700, color: COLORS.text, lineHeight: 1 }}
                  >
                    {s.value}
                  </div>
                  <div
                    className="mt-1"
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: COLORS.muted,
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

          {course ? (
            <>
              {/* ── HACKER RACCOON ── */}
              <RevealOnScroll delay={80}>
                <section
                  className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 mb-10"
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${raccoonStrong ? "rgba(239,68,68,0.35)" : "rgba(52,211,153,0.3)"}`,
                    boxShadow: raccoonStrong
                      ? "0 0 20px rgba(239,68,68,0.12)"
                      : "0 0 20px rgba(52,211,153,0.12)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="relative shrink-0">
                    <div
                      className="absolute inset-0 rounded-2xl"
                      style={{
                        background: raccoonStrong ? "rgba(239,68,68,0.3)" : "rgba(52,211,153,0.25)",
                        filter: "blur(25px)",
                        transform: "scale(0.85)",
                      }}
                    />
                    <Image
                      src="/characters/raccoon-sneaking.png"
                      alt="The Hacker Raccoon sneaking"
                      width={100}
                      height={100}
                      className="relative rounded-2xl block"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full">
                    <h3 className="display font-bold text-lg mb-2" style={{ color: COLORS.text }}>
                      {completedCount >= totalModules && totalModules > 0
                        ? "You defeated the Hacker Raccoon!"
                        : "The Hacker Raccoon is still out there…"}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: COLORS.secondary }}>
                      {completedCount >= totalModules && totalModules > 0
                        ? "Amazing work, Cyber Hero! You've completed every lesson and saved the day."
                        : `Complete all ${totalModules} weeks to defeat him. Each lesson weakens his power.`}
                    </p>
                    <div>
                      <div className="flex justify-between text-xs font-black mb-1.5">
                        <span style={{ color: COLORS.red }}>Raccoon Power</span>
                        <span style={{ color: COLORS.red }}>{raccoonPower}%</span>
                      </div>
                      <AnimatedBar
                        percent={raccoonPower}
                        gradient={GRAD_RACCOON}
                        glowColor="rgba(239,68,68,0.4)"
                        height={12}
                      />
                      <p className="text-[11px] font-bold mt-2" style={{ color: COLORS.muted }}>
                        {completedCount === 0
                          ? "Start your first lesson to begin weakening the raccoon."
                          : completedCount >= totalModules
                            ? "The raccoon's power has been fully drained."
                            : `${completedCount} lesson${completedCount !== 1 ? "s" : ""} down — keep going!`}
                      </p>
                    </div>
                  </div>
                </section>
              </RevealOnScroll>

              {/* ── COURSE HEADER ── */}
              <RevealOnScroll delay={120}>
                <section
                  className="rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6"
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                    backdropFilter: "blur(14px)",
                  }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <span className="text-5xl shrink-0" aria-hidden>
                      {course.emoji}
                    </span>
                    <div className="min-w-0">
                      <h2
                        className="display text-xl sm:text-2xl font-bold leading-snug"
                        style={{ color: COLORS.text }}
                      >
                        {course.title}
                      </h2>
                      <p className="text-sm font-bold" style={{ color: COLORS.secondary }}>
                        Ages {course.ageRange} · {course.weeksCount} Weeks · {course.duration}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <AnimatedRing percent={progressPct} />
                  </div>
                </section>
              </RevealOnScroll>

              {/* ── MODULE LIST ── */}
              <StaggeredList className="space-y-3 mb-12">
                {modules.map((mod: (typeof modules)[number]) => {
                  const isCurrent = mod.isCurrentNext;

                  return (
                    <div
                      key={mod.id}
                      className="rounded-3xl flex items-center gap-4 sm:gap-5 transition-all duration-300"
                      style={{
                        padding: isCurrent ? "24px 24px" : "20px 24px",
                        background: isCurrent
                          ? "rgba(249,115,22,0.08)"
                          : mod.isCompleted
                            ? "rgba(52,211,153,0.06)"
                            : COLORS.card,
                        border: isCurrent
                          ? `1px solid ${COLORS.orange}`
                          : mod.isCompleted
                            ? "1px solid rgba(52,211,153,0.25)"
                            : `1px solid ${COLORS.border}`,
                        boxShadow: isCurrent ? "0 0 24px rgba(249,115,22,0.2)" : "none",
                        backdropFilter: "blur(10px)",
                        opacity: mod.isUnlocked ? 1 : 0.4,
                        cursor: mod.isUnlocked ? "default" : "not-allowed",
                        pointerEvents: mod.isUnlocked ? undefined : ("none" as const),
                      }}
                    >
                      {/* Week badge */}
                      <div
                        className="shrink-0 flex items-center justify-center font-black text-sm"
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 16,
                          background: mod.isCompleted
                            ? "rgba(52,211,153,0.18)"
                            : isCurrent
                              ? GRAD_CTA
                              : "rgba(255,255,255,0.04)",
                          color: mod.isCompleted
                            ? COLORS.green
                            : isCurrent
                              ? "#fff"
                              : COLORS.muted,
                          boxShadow: mod.isCompleted
                            ? "0 0 16px rgba(52,211,153,0.35)"
                            : isCurrent
                              ? "0 0 20px rgba(249,115,22,0.45)"
                              : "none",
                        }}
                      >
                        {mod.isCompleted ? (
                          <CheckIcon size={22} color={COLORS.green} />
                        ) : mod.isUnlocked ? (
                          `W${mod.weekNumber}`
                        ) : (
                          <LockIcon size={20} color={COLORS.muted} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-black uppercase mb-0.5"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.15em",
                            color: mod.isCompleted
                              ? "rgba(52,211,153,0.7)"
                              : isCurrent
                                ? "rgba(249,115,22,0.85)"
                                : "rgba(148,163,184,0.45)",
                          }}
                        >
                          Week {mod.weekNumber}
                        </div>
                        <h3
                          className="display font-bold text-sm sm:text-base leading-snug"
                          style={{ color: COLORS.text, opacity: mod.isCompleted ? 0.75 : 1 }}
                        >
                          {mod.title}
                        </h3>
                        <p
                          className="text-xs mt-1 leading-relaxed line-clamp-2"
                          style={{ color: COLORS.muted }}
                        >
                          {mod.description}
                        </p>
                      </div>

                      {/* Action */}
                      <div className="shrink-0">
                        {mod.isCompleted ? (
                          <a
                            href="/lesson"
                            className="inline-flex items-center gap-1.5 font-black transition-all duration-200 hover:scale-105"
                            style={{
                              background: "rgba(52,211,153,0.12)",
                              color: COLORS.green,
                              border: "1px solid rgba(52,211,153,0.3)",
                              borderRadius: 100,
                              padding: "8px 16px",
                              fontSize: 12,
                              textDecoration: "none",
                            }}
                          >
                            <CheckIcon size={14} color={COLORS.green} />
                            Completed
                          </a>
                        ) : isCurrent ? (
                          <a
                            href="/lesson"
                            className="inline-block font-black text-white transition-all duration-200 hover:scale-105"
                            style={{
                              background: GRAD_CTA,
                              boxShadow: "0 4px 24px rgba(249,115,22,0.45)",
                              borderRadius: 100,
                              padding: "12px 24px",
                              fontSize: 14,
                              minHeight: 44,
                              textDecoration: "none",
                            }}
                          >
                            {mod.isInProgress ? "Continue →" : "Start Lesson →"}
                          </a>
                        ) : mod.isUnlocked ? (
                          <a
                            href="/lesson"
                            className="inline-block font-black text-white transition-all duration-200 hover:scale-105"
                            style={{
                              background: GRAD_CTA,
                              boxShadow: "0 4px 18px rgba(249,115,22,0.35)",
                              borderRadius: 100,
                              padding: "10px 20px",
                              fontSize: 12,
                              textDecoration: "none",
                            }}
                          >
                            Start Lesson →
                          </a>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 font-bold whitespace-nowrap"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.muted,
                              borderRadius: 100,
                              padding: "8px 14px",
                              fontSize: 11,
                            }}
                          >
                            <LockIcon size={12} color={COLORS.muted} />
                            {mod.prevWeek !== null ? `Complete W${mod.prevWeek}` : "Locked"}
                          </span>
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
                      "linear-gradient(135deg, rgba(96,165,250,0.12), rgba(52,211,153,0.12))",
                    border: "1px solid rgba(96,165,250,0.3)",
                    boxShadow: "0 0 40px rgba(96,165,250,0.12)",
                  }}
                >
                  <h3
                    className="display text-2xl sm:text-3xl font-bold mb-3"
                    style={{ color: COLORS.text }}
                  >
                    {encouragement.title}
                  </h3>
                  <p
                    className="text-base mb-6 max-w-xl mx-auto leading-relaxed"
                    style={{ color: COLORS.secondary }}
                  >
                    {encouragement.body}
                  </p>
                  <a
                    href="/lesson"
                    className="inline-block font-black text-white transition-all duration-200 hover:scale-105"
                    style={{
                      background: GRAD_CTA,
                      boxShadow: "0 4px 24px rgba(249,115,22,0.45)",
                      borderRadius: 100,
                      padding: "14px 32px",
                      fontSize: 16,
                      textDecoration: "none",
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
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <p className="font-bold" style={{ color: COLORS.muted }}>
                No course found. Please run the seed script.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
