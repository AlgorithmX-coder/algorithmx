import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import {
  CyberBackground,
  RevealOnScroll,
  AnimatedBar,
  AnimatedRing,
  StaggeredList,
} from "@/app/components/AnimatedDashboardV2";
import { getCertificateUrl, getAchievedMilestones } from "@/app/lib/certificates";

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

const WEEK_SUMMARIES: Record<number, string> = {
  1: "Your child learned how to create strong, memorable passwords and why reusing passwords is dangerous.",
  2: "Your child can now identify personal information that should never be shared online, like full names, addresses, and school details.",
  3: "Your child learned to recognise suspicious online strangers and what to do if someone they don't know contacts them.",
  4: "Your child can now spot common online scams and phishing attempts designed to trick kids.",
  5: "Your child learned what cyberbullying looks like, how to respond safely, and when to tell a trusted adult.",
  6: "Your child now understands safe gaming practices including privacy settings and avoiding toxic interactions.",
  7: "Your child learned about in-game purchases, loot boxes, and how to avoid spending real money without permission.",
  8: "Your child understands why sharing photos and videos online can be permanent and how to stay safe.",
  9: "Your child can now evaluate whether an app is safe before downloading, including checking permissions.",
  10: "Your child learned to navigate YouTube safely, recognise inappropriate content, and use safety settings.",
  11: "Your child knows exactly what to do and who to tell if something scary or wrong happens online.",
  12: "Your child understands that online actions leave a permanent trail and how to keep their digital footprint positive.",
  13: "Your child learned about healthy screen time habits and balancing online and offline activities.",
  14: "Your child understands how smart home devices work and the privacy considerations around them.",
  15: "Your child can now identify when they're talking to AI, understands its limitations, and knows not to trust it blindly.",
  16: "Your child learned to check links before clicking and understands the risks of scanning unknown QR codes.",
  17: "Your child understands social media risks including privacy settings, oversharing, and age restrictions.",
  18: "Your child learned how to safely share tablets and computers without exposing personal information.",
  19: "Your child can now help protect the whole family's online safety and teach others what they've learned.",
  20: "Your child completed the final mission and is now a certified Cyber Hero with comprehensive online safety knowledge.",
};

function ShieldLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <defs>
        <linearGradient id="parentShieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5 4 5.2v6.3c0 4.7 3.3 8.7 8 10 4.7-1.3 8-5.3 8-10V5.2L12 2.5Z"
        fill="url(#parentShieldGrad)"
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

export default async function ParentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const childProfiles = await prisma.childProfile.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
  });

  if (childProfiles.length === 0) redirect("/onboarding");

  const child = childProfiles[0];

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
        status,
        isCompleted,
        isInProgress,
        isUnlocked,
        isCurrentNext,
        prevWeek: !isUnlocked && prevModule ? prevModule.weekNumber : null,
      };
    },
  );

  const completedCount = modules.filter((m) => m.isCompleted).length;
  const totalModules = modules.length;
  const progressPct = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;
  const raccoonPower = Math.round(100 - progressPct);
  const raccoonStrong = raccoonPower > 50;

  const childName = child.childName ?? "your child";

  const completedModules = modules.filter((m) => m.isCompleted);

  const encouragement =
    completedCount === 0
      ? {
          title: "Ready for the first mission?",
          body: `Encourage ${childName} to start their first mission — it only takes 45 minutes.`,
        }
      : completedCount >= totalModules && totalModules > 0
        ? {
            title: "Certified Cyber Hero!",
            body: `Congratulations! ${childName} has completed the entire Cyber Heroes Academy. Consider enrolling them in Cyber Explorers next.`,
          }
        : {
            title: "Great progress so far",
            body: `${childName} is making great progress! They've completed ${completedCount} out of ${totalModules} weeks.`,
          };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka:wght@500;600;700&display=swap');
        .parent { font-family: 'Nunito', sans-serif; color: ${COLORS.text}; }
        .parent h1, .parent h2, .parent h3, .parent h4, .parent .display { font-family: 'Fredoka', 'Nunito', sans-serif; }
      `}</style>

      <div className="parent min-h-screen relative" style={{ background: COLORS.bg }}>
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
              <span
                className="display text-lg font-bold"
                style={{ color: COLORS.text, letterSpacing: "-0.01em" }}
              >
                Parent Dashboard
              </span>
            </a>
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
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
                ← Back to Child View
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

        <div
          className="relative max-w-[1100px] mx-auto px-6 md:px-10 py-10"
          style={{ zIndex: 1 }}
        >
          {/* ── WELCOME ── */}
          <RevealOnScroll>
            <section className="mb-10">
              <div
                className="inline-flex items-center gap-2 mb-4"
                style={{
                  background: "rgba(96,165,250,0.10)",
                  border: "1px solid rgba(96,165,250,0.35)",
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: COLORS.blue,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 100,
                    background: COLORS.blue,
                    boxShadow: `0 0 10px ${COLORS.blue}`,
                    display: "inline-block",
                  }}
                />
                Parent View
              </div>
              <h1
                className="display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3"
                style={{ color: COLORS.text }}
              >
                Parent Dashboard —{" "}
                <span
                  style={{
                    background: GRAD_NAME,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {childName}
                </span>
              </h1>
              <p className="text-base sm:text-lg leading-relaxed" style={{ color: COLORS.secondary }}>
                Track {childName}&apos;s cybersecurity learning journey.
              </p>
            </section>
          </RevealOnScroll>

          {/* ── PROGRESS OVERVIEW ── */}
          <RevealOnScroll delay={80}>
            <section
              className="rounded-3xl p-6 sm:p-8 mb-10"
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
              }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="shrink-0">
                  <AnimatedRing percent={progressPct} />
                </div>
                <div className="flex-1 w-full">
                  <h2
                    className="display text-xl sm:text-2xl font-bold mb-2"
                    style={{ color: COLORS.text }}
                  >
                    Overall Progress
                  </h2>
                  <p className="text-sm mb-4" style={{ color: COLORS.secondary }}>
                    <span className="font-black" style={{ color: COLORS.blue }}>
                      {completedCount}
                    </span>{" "}
                    of{" "}
                    <span className="font-black" style={{ color: COLORS.text }}>
                      {totalModules}
                    </span>{" "}
                    weeks completed
                  </p>
                  <div className="mb-5">
                    <AnimatedBar
                      percent={progressPct}
                      gradient={GRAD_MAIN}
                      glowColor="rgba(96,165,250,0.5)"
                      height={14}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-black mb-1.5">
                      <span style={{ color: COLORS.red }}>Raccoon Power Remaining</span>
                      <span style={{ color: COLORS.red }}>{raccoonPower}%</span>
                    </div>
                    <AnimatedBar
                      percent={raccoonPower}
                      gradient={GRAD_RACCOON}
                      glowColor="rgba(239,68,68,0.4)"
                      height={10}
                    />
                    <p style={{ fontSize: 13, color: COLORS.secondary, lineHeight: 1.7, marginTop: 12, marginBottom: 8 }}>
                      The Hacker Raccoon represents real-world cyber threats — from phishing scams to password attacks — adapted to reflect the latest tactics children encounter online. As your child completes each lesson, they build the skills to recognise and defend against these threats, so you can feel confident they&apos;re prepared.
                    </p>
                    <p className="text-[11px] font-bold mt-2" style={{ color: COLORS.muted }}>
                      {raccoonStrong
                        ? "The Hacker Raccoon still has most of his power. Each lesson weakens him."
                        : "The Hacker Raccoon is on the ropes — most of his power has been drained."}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {/* ── WHAT CHILD HAS LEARNED ── */}
          <RevealOnScroll delay={120}>
            <section className="mb-12">
              <div
                className="inline-flex items-center gap-2 mb-4"
                style={{
                  background: "rgba(52,211,153,0.12)",
                  border: "1px solid rgba(52,211,153,0.35)",
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: COLORS.green,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow: "0 0 12px rgba(52,211,153,0.25)",
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
                Learning Progress
              </div>
              <h2
                className="display text-2xl sm:text-3xl font-bold mb-6"
                style={{ color: COLORS.text }}
              >
                What {childName} Has Learned So Far
              </h2>

              {completedModules.length === 0 ? (
                <div
                  className="rounded-3xl p-8 text-center"
                  style={{
                    background: COLORS.card,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <p className="text-base" style={{ color: COLORS.secondary }}>
                    No lessons completed yet — once {childName} finishes their first week, you&apos;ll see a summary of what they learned here.
                  </p>
                </div>
              ) : (
                <StaggeredList className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedModules.map((mod) => (
                    <div
                      key={mod.id}
                      className="rounded-2xl p-5"
                      style={{
                        background: COLORS.card,
                        border: "1px solid rgba(52,211,153,0.25)",
                        boxShadow: "0 0 16px rgba(52,211,153,0.1)",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="shrink-0 flex items-center justify-center"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: "rgba(52,211,153,0.18)",
                            boxShadow: "0 0 14px rgba(52,211,153,0.35)",
                          }}
                        >
                          <CheckIcon size={22} color={COLORS.green} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-black uppercase mb-0.5"
                            style={{
                              fontSize: 10,
                              letterSpacing: "0.15em",
                              color: "rgba(52,211,153,0.75)",
                            }}
                          >
                            Week {mod.weekNumber}
                          </div>
                          <h3
                            className="display font-bold text-base leading-snug"
                            style={{ color: COLORS.text }}
                          >
                            {mod.title}
                          </h3>
                        </div>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: COLORS.secondary }}
                      >
                        {WEEK_SUMMARIES[mod.weekNumber] ??
                          `${childName} completed the Week ${mod.weekNumber} lesson.`}
                      </p>
                    </div>
                  ))}
                </StaggeredList>
              )}
            </section>
          </RevealOnScroll>

          {/* ── CERTIFICATES & ACHIEVEMENTS ── */}
          <RevealOnScroll delay={100}>
            <section className="mb-12">
              <div
                className="inline-flex items-center gap-2 mb-4"
                style={{
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.35)",
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: COLORS.yellow,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow: "0 0 12px rgba(245,158,11,0.25)",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 100,
                    background: COLORS.yellow,
                    boxShadow: `0 0 10px ${COLORS.yellow}`,
                    display: "inline-block",
                  }}
                />
                ★ Achievements
              </div>
              <h2
                className="display text-2xl sm:text-3xl font-bold mb-2"
                style={{ color: COLORS.text }}
              >
                Certificates &amp; Milestones
              </h2>
              <p className="text-sm mb-6" style={{ color: COLORS.secondary }}>
                Download and print certificates for {childName}&apos;s achievements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAchievedMilestones(completedCount).map((m) => (
                  <div
                    key={m.week}
                    style={{
                      background: COLORS.card,
                      borderRadius: 18,
                      padding: 24,
                      border: m.achieved
                        ? "1px solid rgba(52,211,153,0.4)"
                        : `1px solid ${COLORS.border}`,
                      boxShadow: m.achieved
                        ? "0 0 20px rgba(52,211,153,0.15)"
                        : "none",
                      opacity: m.achieved ? 1 : 0.55,
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div style={{ fontSize: 36, lineHeight: 1 }} aria-hidden>
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="display font-bold text-lg leading-tight"
                          style={{ color: COLORS.text }}
                        >
                          {m.title}
                        </h3>
                      </div>
                      {m.achieved ? (
                        <span
                          className="inline-flex items-center font-black whitespace-nowrap"
                          style={{
                            background: "rgba(52,211,153,0.15)",
                            color: COLORS.green,
                            border: "1px solid rgba(52,211,153,0.35)",
                            borderRadius: 100,
                            padding: "5px 12px",
                            fontSize: 11,
                          }}
                        >
                          Achieved!
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center font-bold whitespace-nowrap"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${COLORS.border}`,
                            color: COLORS.muted,
                            borderRadius: 100,
                            padding: "5px 12px",
                            fontSize: 11,
                          }}
                        >
                          {m.weeksRemaining} week{m.weeksRemaining === 1 ? "" : "s"} to go
                        </span>
                      )}
                    </div>

                    <p
                      className="mb-4"
                      style={{ fontSize: 13, color: COLORS.secondary, lineHeight: 1.6 }}
                    >
                      {m.description}
                    </p>

                    <AnimatedBar
                      percent={m.progress}
                      gradient={
                        m.achieved
                          ? "linear-gradient(135deg, #34d399, #60a5fa)"
                          : GRAD_MAIN
                      }
                      glowColor={
                        m.achieved ? "rgba(52,211,153,0.4)" : "rgba(96,165,250,0.4)"
                      }
                      height={10}
                    />

                    <p
                      className="mt-2"
                      style={{ fontSize: 11, color: COLORS.muted, fontWeight: 600 }}
                    >
                      Week {m.week} milestone
                    </p>

                    {m.achieved && (
                      <div className="mt-4">
                        <a
                          href={getCertificateUrl(childName, m.week)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block font-black text-white"
                          style={{
                            background: GRAD_CTA,
                            boxShadow: "0 4px 18px rgba(249,115,22,0.4)",
                            borderRadius: 100,
                            padding: "10px 20px",
                            fontSize: 13,
                            textDecoration: "none",
                          }}
                        >
                          Download Certificate ↓
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </RevealOnScroll>

          {/* ── FULL MODULE LIST ── */}
          <RevealOnScroll delay={80}>
            <section className="mb-12">
              <h2
                className="display text-2xl font-bold mb-4"
                style={{ color: COLORS.text }}
              >
                Full Curriculum
              </h2>
              <StaggeredList className="space-y-3">
                {modules.map((mod) => {
                  const isCurrent = mod.isCurrentNext;
                  return (
                    <div
                      key={mod.id}
                      className="rounded-3xl flex items-center gap-4 sm:gap-5"
                      style={{
                        padding: "18px 24px",
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
                        boxShadow: isCurrent ? "0 0 20px rgba(249,115,22,0.18)" : "none",
                        opacity: mod.isUnlocked ? 1 : 0.45,
                      }}
                    >
                      {/* Week badge */}
                      <div
                        className="shrink-0 flex items-center justify-center font-black text-sm"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
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
                            ? "0 0 14px rgba(52,211,153,0.35)"
                            : isCurrent
                              ? "0 0 18px rgba(249,115,22,0.4)"
                              : "none",
                        }}
                      >
                        {mod.isCompleted ? (
                          <CheckIcon size={20} color={COLORS.green} />
                        ) : mod.isUnlocked ? (
                          `W${mod.weekNumber}`
                        ) : (
                          <LockIcon size={18} color={COLORS.muted} />
                        )}
                      </div>

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
                          style={{ color: COLORS.text, opacity: mod.isCompleted ? 0.8 : 1 }}
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

                      <div className="shrink-0">
                        {mod.isCompleted ? (
                          <span
                            className="inline-flex items-center gap-1.5 font-black whitespace-nowrap"
                            style={{
                              background: "rgba(52,211,153,0.12)",
                              color: COLORS.green,
                              border: "1px solid rgba(52,211,153,0.3)",
                              borderRadius: 100,
                              padding: "7px 14px",
                              fontSize: 11,
                            }}
                          >
                            <CheckIcon size={12} color={COLORS.green} />
                            Completed
                          </span>
                        ) : isCurrent ? (
                          <span
                            className="inline-block font-black whitespace-nowrap"
                            style={{
                              background: "rgba(249,115,22,0.15)",
                              color: COLORS.orange,
                              border: "1px solid rgba(249,115,22,0.4)",
                              borderRadius: 100,
                              padding: "7px 14px",
                              fontSize: 11,
                            }}
                          >
                            In Progress
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1.5 font-bold whitespace-nowrap"
                            style={{
                              background: "rgba(255,255,255,0.03)",
                              border: `1px solid ${COLORS.border}`,
                              color: COLORS.muted,
                              borderRadius: 100,
                              padding: "7px 14px",
                              fontSize: 11,
                            }}
                          >
                            <LockIcon size={12} color={COLORS.muted} />
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </StaggeredList>
            </section>
          </RevealOnScroll>

          {/* ── BOTTOM ENCOURAGEMENT ── */}
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
                className="text-base max-w-xl mx-auto leading-relaxed"
                style={{ color: COLORS.secondary }}
              >
                {encouragement.body}
              </p>
            </section>
          </RevealOnScroll>
        </div>
      </div>
    </>
  );
}
