import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
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
import { getCertificateUrl, getAchievedMilestones } from "@/app/lib/certificates";

/* ───────────────── PIXAR PALETTE (shared with dashboard) ───────────────── */
const C = {
  pageBg: "#1a0612",
  card: "rgba(40, 18, 38, 0.72)",
  border: "rgba(255, 220, 180, 0.22)",
  borderStrong: "rgba(255, 220, 180, 0.45)",
  text: "#fff7e6",
  textSoft: "#ffe9c8",
  textMuted: "rgba(255, 233, 200, 0.55)",
  inkDeep: "#3b2615",
  goldLight: "#ffd58a",
  goldMid: "#ff9b4a",
  goldDeep: "#d4733a",
  goldDark: "#3a1a06",
  coral: "#f08e7e",
  ember: "#c4513a",
  moss: "#7cc89a",
  mossLight: "#a8e3bb",
  cream: "#fff5cc",
};
const GRAD_GOLD = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid}, ${C.goldDeep})`;
const GRAD_GOLD_PILL = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid})`;
const GRAD_NAME = `linear-gradient(135deg, ${C.cream}, ${C.goldLight}, ${C.goldMid})`;
const GRAD_RACCOON = `linear-gradient(90deg, ${C.ember}, ${C.coral}, ${C.goldMid})`;
const SHADOW_PRIMARY =
  "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset";
const FONT_STACK =
  "ui-rounded, 'Fredoka', 'Quicksand', 'Nunito', system-ui, -apple-system, sans-serif";

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
          <stop offset="0%" stopColor={C.cream} />
          <stop offset="55%" stopColor={C.goldLight} />
          <stop offset="100%" stopColor={C.goldDeep} />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5 4 5.2v6.3c0 4.7 3.3 8.7 8 10 4.7-1.3 8-5.3 8-10V5.2L12 2.5Z"
        fill="url(#parentShieldGrad)"
      />
      <path
        d="m9 12 2.2 2.2L15 10.4"
        stroke={C.goldDark}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

function LockIcon({ size = 18, color = C.textMuted }: { size?: number; color?: string }) {
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
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka:wght@500;600;700;800&display=swap');
        .parent { font-family: ${FONT_STACK}; color: ${C.text}; }
        .parent h1, .parent h2, .parent h3, .parent h4, .parent .display { font-family: 'Fredoka', ${FONT_STACK}; }
      `}</style>

      <div
        className="parent min-h-screen relative"
        style={{
          background:
            `radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, #2a0d2e 35%, ${C.pageBg} 70%, #0a0410 100%)`,
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
            <a href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
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
                Parent Dashboard
              </span>
            </a>
            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
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
                  background: "rgba(255, 215, 138, 0.14)",
                  border: `1px solid ${C.borderStrong}`,
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.goldLight,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 100,
                    background: C.goldLight,
                    boxShadow: `0 0 10px ${C.goldLight}`,
                    display: "inline-block",
                  }}
                />
                Parent View
              </div>
              <h1
                className="display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-3"
                style={{ color: C.text }}
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
              <p
                className="text-base sm:text-lg leading-relaxed"
                style={{ color: C.textSoft, opacity: 0.9 }}
              >
                Track {childName}&apos;s cybersecurity learning journey.
              </p>
            </section>
          </RevealOnScroll>

          {/* ── PROGRESS OVERVIEW ── */}
          <RevealOnScroll delay={80}>
            <section
              className="rounded-3xl p-6 sm:p-8 mb-10"
              style={{
                background: C.card,
                border: `1px solid ${C.border}`,
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                boxShadow:
                  "0 24px 50px -16px rgba(20, 6, 12, 0.6), 0 0 0 1px rgba(255, 220, 180, 0.05) inset",
              }}
            >
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                <div className="shrink-0">
                  <AnimatedRing
                    percent={progressPct}
                    gradientFrom={C.goldLight}
                    gradientTo={C.goldMid}
                    glow="rgba(255, 178, 110, 0.55)"
                    track="rgba(255, 220, 180, 0.12)"
                    label={C.goldLight}
                  />
                </div>
                <div className="flex-1 w-full">
                  <h2
                    className="display text-xl sm:text-2xl font-bold mb-2"
                    style={{ color: C.text }}
                  >
                    Overall Progress
                  </h2>
                  <p className="text-sm mb-4" style={{ color: C.textSoft, opacity: 0.9 }}>
                    <span className="font-black" style={{ color: C.goldLight }}>
                      {completedCount}
                    </span>{" "}
                    of{" "}
                    <span className="font-black" style={{ color: C.text }}>
                      {totalModules}
                    </span>{" "}
                    weeks completed
                  </p>
                  <div className="mb-5">
                    <AnimatedBar
                      percent={progressPct}
                      gradient={GRAD_GOLD}
                      glowColor="rgba(255, 200, 110, 0.55)"
                      height={14}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-black mb-1.5">
                      <span style={{ color: C.coral, letterSpacing: 1 }}>
                        Raccoon Power Remaining
                      </span>
                      <span style={{ color: C.coral }}>{raccoonPower}%</span>
                    </div>
                    <AnimatedBar
                      percent={raccoonPower}
                      gradient={GRAD_RACCOON}
                      glowColor="rgba(240, 142, 126, 0.5)"
                      height={10}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        color: C.textSoft,
                        opacity: 0.85,
                        lineHeight: 1.7,
                        marginTop: 12,
                        marginBottom: 8,
                      }}
                    >
                      The Hacker Raccoon represents real-world cyber threats — from phishing scams to password attacks — adapted to reflect the latest tactics children encounter online. As your child completes each lesson, they build the skills to recognise and defend against these threats, so you can feel confident they&apos;re prepared.
                    </p>
                    <p className="text-[11px] font-bold mt-2" style={{ color: C.textMuted }}>
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
                  background: "rgba(124, 200, 154, 0.18)",
                  border: "1px solid rgba(124, 200, 154, 0.55)",
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.mossLight,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow: "0 0 14px rgba(124, 200, 154, 0.3)",
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
                Learning Progress
              </div>
              <h2
                className="display text-2xl sm:text-3xl font-bold mb-6"
                style={{ color: C.text }}
              >
                What {childName} Has Learned So Far
              </h2>

              {completedModules.length === 0 ? (
                <div
                  className="rounded-3xl p-8 text-center"
                  style={{
                    background: C.card,
                    border: `1px solid ${C.border}`,
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                >
                  <p className="text-base" style={{ color: C.textSoft, opacity: 0.85 }}>
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
                        background:
                          "linear-gradient(135deg, rgba(124, 200, 154, 0.14), rgba(40, 18, 38, 0.6))",
                        border: "1px solid rgba(124, 200, 154, 0.4)",
                        boxShadow:
                          "0 0 18px rgba(124, 200, 154, 0.16), 0 14px 28px -10px rgba(20, 6, 12, 0.5)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="shrink-0 flex items-center justify-center"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 14,
                            background: "rgba(124, 200, 154, 0.22)",
                            boxShadow: "0 0 16px rgba(124, 200, 154, 0.4)",
                          }}
                        >
                          <CheckIcon size={22} color={C.mossLight} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div
                            className="font-black uppercase mb-0.5"
                            style={{
                              fontSize: 10,
                              letterSpacing: "0.15em",
                              color: "rgba(168, 227, 187, 0.85)",
                            }}
                          >
                            Week {mod.weekNumber}
                          </div>
                          <h3
                            className="display font-bold text-base leading-snug"
                            style={{ color: C.text }}
                          >
                            {mod.title}
                          </h3>
                        </div>
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: C.textSoft, opacity: 0.92 }}
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
                  background: "rgba(255, 215, 138, 0.14)",
                  border: `1px solid ${C.borderStrong}`,
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.goldLight,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  boxShadow: "0 0 14px rgba(255, 200, 110, 0.3)",
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 100,
                    background: C.goldLight,
                    boxShadow: `0 0 10px ${C.goldLight}`,
                    display: "inline-block",
                  }}
                />
                ★ Achievements
              </div>
              <h2
                className="display text-2xl sm:text-3xl font-bold mb-2"
                style={{ color: C.text }}
              >
                Certificates &amp; Milestones
              </h2>
              <p className="text-sm mb-6" style={{ color: C.textSoft, opacity: 0.85 }}>
                Download and print certificates for {childName}&apos;s achievements.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getAchievedMilestones(completedCount).map((m) => (
                  <div
                    key={m.week}
                    style={{
                      background: m.achieved
                        ? "linear-gradient(135deg, rgba(255, 215, 138, 0.16), rgba(40, 18, 38, 0.7))"
                        : C.card,
                      borderRadius: 18,
                      padding: 24,
                      border: m.achieved
                        ? `1px solid ${C.borderStrong}`
                        : `1px solid ${C.border}`,
                      boxShadow: m.achieved
                        ? "0 0 24px rgba(255, 200, 110, 0.22), 0 14px 28px -10px rgba(20, 6, 12, 0.55)"
                        : "0 10px 22px -10px rgba(20, 6, 12, 0.45)",
                      opacity: m.achieved ? 1 : 0.55,
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        style={{
                          fontSize: 36,
                          lineHeight: 1,
                          filter: m.achieved
                            ? "drop-shadow(0 0 14px rgba(255, 200, 110, 0.55))"
                            : undefined,
                        }}
                        aria-hidden
                      >
                        {m.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="display font-bold text-lg leading-tight"
                          style={{ color: C.text }}
                        >
                          {m.title}
                        </h3>
                      </div>
                      {m.achieved ? (
                        <span
                          className="inline-flex items-center font-black whitespace-nowrap"
                          style={{
                            background: "rgba(124, 200, 154, 0.18)",
                            color: C.mossLight,
                            border: "1px solid rgba(124, 200, 154, 0.5)",
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
                            background: "rgba(255, 220, 180, 0.04)",
                            border: `1px solid ${C.border}`,
                            color: C.textMuted,
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
                      style={{
                        fontSize: 13,
                        color: C.textSoft,
                        opacity: 0.9,
                        lineHeight: 1.6,
                      }}
                    >
                      {m.description}
                    </p>

                    <AnimatedBar
                      percent={m.progress}
                      gradient={
                        m.achieved
                          ? `linear-gradient(135deg, ${C.mossLight}, ${C.moss})`
                          : GRAD_GOLD
                      }
                      glowColor={
                        m.achieved
                          ? "rgba(124, 200, 154, 0.45)"
                          : "rgba(255, 200, 110, 0.5)"
                      }
                      height={10}
                    />

                    <p
                      className="mt-2"
                      style={{ fontSize: 11, color: C.textMuted, fontWeight: 600 }}
                    >
                      Week {m.week} milestone
                    </p>

                    {m.achieved && (
                      <div className="mt-4">
                        <a
                          href={getCertificateUrl(childName, m.week)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block font-black"
                          style={{
                            background: GRAD_GOLD_PILL,
                            color: C.goldDark,
                            boxShadow: SHADOW_PRIMARY,
                            borderRadius: 100,
                            padding: "10px 20px",
                            fontSize: 13,
                            textDecoration: "none",
                            letterSpacing: "0.02em",
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
                style={{ color: C.text }}
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
                          ? "linear-gradient(135deg, rgba(255, 178, 110, 0.16), rgba(255, 215, 138, 0.10))"
                          : mod.isCompleted
                            ? "linear-gradient(135deg, rgba(124, 200, 154, 0.12), rgba(40, 18, 38, 0.5))"
                            : C.card,
                        border: isCurrent
                          ? `2px solid rgba(255, 200, 110, 0.7)`
                          : mod.isCompleted
                            ? "1px solid rgba(124, 200, 154, 0.4)"
                            : `1px solid ${C.border}`,
                        boxShadow: isCurrent
                          ? "0 0 28px rgba(255, 178, 110, 0.32), 0 14px 28px -10px rgba(20, 6, 12, 0.5)"
                          : "0 10px 22px -10px rgba(20, 6, 12, 0.45)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
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
                            ? "rgba(124, 200, 154, 0.22)"
                            : isCurrent
                              ? GRAD_GOLD_PILL
                              : "rgba(255, 220, 180, 0.06)",
                          color: mod.isCompleted
                            ? C.mossLight
                            : isCurrent
                              ? C.goldDark
                              : C.textMuted,
                          boxShadow: mod.isCompleted
                            ? "0 0 16px rgba(124, 200, 154, 0.45)"
                            : isCurrent
                              ? "0 0 20px rgba(255, 178, 110, 0.5)"
                              : "none",
                        }}
                      >
                        {mod.isCompleted ? (
                          <CheckIcon size={20} color={C.mossLight} />
                        ) : mod.isUnlocked ? (
                          `W${mod.weekNumber}`
                        ) : (
                          <LockIcon size={18} color={C.textMuted} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div
                          className="font-black uppercase mb-0.5"
                          style={{
                            fontSize: 10,
                            letterSpacing: "0.15em",
                            color: mod.isCompleted
                              ? "rgba(168, 227, 187, 0.85)"
                              : isCurrent
                                ? C.goldLight
                                : "rgba(255, 233, 200, 0.5)",
                          }}
                        >
                          Week {mod.weekNumber}
                        </div>
                        <h3
                          className="display font-bold text-sm sm:text-base leading-snug"
                          style={{
                            color: C.text,
                            opacity: mod.isCompleted ? 0.82 : 1,
                          }}
                        >
                          {mod.title}
                        </h3>
                        <p
                          className="text-xs mt-1 leading-relaxed line-clamp-2"
                          style={{ color: C.textMuted }}
                        >
                          {mod.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {mod.isCompleted ? (
                          <span
                            className="inline-flex items-center gap-1.5 font-black whitespace-nowrap"
                            style={{
                              background: "rgba(124, 200, 154, 0.16)",
                              color: C.mossLight,
                              border: "1px solid rgba(124, 200, 154, 0.5)",
                              borderRadius: 100,
                              padding: "7px 14px",
                              fontSize: 11,
                            }}
                          >
                            <CheckIcon size={12} color={C.mossLight} />
                            Completed
                          </span>
                        ) : isCurrent ? (
                          <span
                            className="inline-block font-black whitespace-nowrap"
                            style={{
                              background: "rgba(255, 178, 110, 0.18)",
                              color: C.goldLight,
                              border: `1px solid ${C.borderStrong}`,
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
                              background: "rgba(255, 220, 180, 0.04)",
                              border: `1px solid ${C.border}`,
                              color: C.textMuted,
                              borderRadius: 100,
                              padding: "7px 14px",
                              fontSize: 11,
                            }}
                          >
                            <LockIcon size={12} color={C.textMuted} />
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
                  "linear-gradient(135deg, rgba(255, 215, 138, 0.18), rgba(196, 60, 106, 0.16))",
                border: `1px solid ${C.borderStrong}`,
                boxShadow:
                  "0 0 50px rgba(255, 178, 110, 0.18), 0 24px 50px -16px rgba(20, 6, 12, 0.6)",
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
                className="text-base max-w-xl mx-auto leading-relaxed"
                style={{ color: C.textSoft, opacity: 0.92 }}
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
