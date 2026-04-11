import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Image from "next/image";

/* ─── CONSTANTS (match landing page) ─── */
const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

/* ─── CLIENT ISLAND: animated background + progress bar + module cards ─── */
function DashboardShell({
  userName,
  completedCount,
  totalModules,
  progressPct,
  course,
  modules,
}: {
  userName: string;
  completedCount: number;
  totalModules: number;
  progressPct: number;
  course: { emoji: string; title: string; ageRange: string; weeksCount: number; duration: string } | null;
  modules: {
    id: string;
    weekNumber: number;
    title: string;
    description: string;
    isCompleted: boolean;
    isInProgress: boolean;
    isUnlocked: boolean;
    isCurrentNext: boolean;
    prevWeek: number | null;
  }[];
}) {
  /* Progress ring SVG (server-safe, no JS needed) */
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPct / 100) * circumference;

  return (
    <>
      {/* Inline styles for animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .dash-root, .dash-root * { font-family: 'Nunito', sans-serif; }
        @keyframes floatOrb    {0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.3)}}
        @keyframes heroFloat   {0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes glowPulse   {0%,100%{opacity:0.5}50%{opacity:1}}
        @keyframes slideUp     {from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes popIn       {0%{opacity:0;transform:scale(0.85)}100%{opacity:1;transform:scale(1)}}
        @keyframes currentGlow {0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0.4)}50%{box-shadow:0 0 20px 4px rgba(139,92,246,0.15)}}
        @keyframes progressFill{from{width:0}to{width:var(--target-w)}}
        @keyframes sparkle     {0%,100%{opacity:0.3;transform:scale(0.8)}50%{opacity:1;transform:scale(1.2)}}
        @keyframes ringFill    {from{stroke-dashoffset:${circumference}}to{stroke-dashoffset:${dashOffset}}}
      `}</style>

      <div className="dash-root min-h-screen relative" style={{ background: "#1a1033" }}>

        {/* ── FLOATING ORBS ── */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {[
            { s: 8, t: "8%", l: "6%", c: "#f59e0b", d: "9s", dl: "0s" },
            { s: 6, t: "20%", r: "8%", c: "#8b5cf6", d: "11s", dl: "1s" },
            { s: 10, t: "40%", l: "3%", c: "#3b82f6", d: "13s", dl: "2s" },
            { s: 5, t: "60%", r: "5%", c: "#f59e0b", d: "8s", dl: "0.5s" },
            { s: 7, t: "75%", l: "14%", c: "#8b5cf6", d: "10s", dl: "3s" },
            { s: 4, t: "45%", l: "52%", c: "#f59e0b", d: "14s", dl: "4s" },
          ].map((o, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: o.s, height: o.s, top: o.t,
                left: "l" in o ? o.l : undefined,
                right: "r" in o ? o.r : undefined,
                backgroundColor: o.c, opacity: 0.35,
                boxShadow: `0 0 ${o.s * 3}px ${o.c}`,
                animation: `floatOrb ${o.d} ease-in-out infinite ${o.dl}`,
              }} />
          ))}
        </div>

        {/* ── NAV ── */}
        <nav className="sticky top-0 z-50 border-b transition-all"
          style={{
            background: "rgba(26,16,51,0.85)",
            backdropFilter: "blur(20px)",
            borderColor: "rgba(255,255,255,0.06)",
          }}>
          <div className="max-w-[1100px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                style={{ background: GRAD, boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
                <span className="text-xs font-black text-white">AX</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Algorithm<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">X</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400 hidden sm:block">
                Welcome, <span className="text-amber-400 font-black">{userName}</span>
              </span>
              <form action={async () => {
                "use server";
                const { signOut } = await import("@/app/lib/auth");
                await signOut({ redirectTo: "/" });
              }}>
                <button className="px-4 py-2 text-xs font-black text-gray-400 hover:text-white rounded-xl transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </nav>

        <div className="relative max-w-[1100px] mx-auto px-6 md:px-10 py-10" style={{ zIndex: 1 }}>

          {/* ── WELCOME ── */}
          <section className="flex flex-col-reverse lg:flex-row items-center gap-10 lg:gap-14 mb-14"
            style={{ animation: "slideUp 0.7s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-3">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">{userName}</span>! 👋
              </h1>
              <p className="text-gray-400 text-base sm:text-lg mb-6 leading-relaxed">
                Ready for your next adventure with Adam &amp; Layla?
              </p>

              {/* Progress summary */}
              <div className="rounded-2xl p-4 mb-2"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
                <div className="flex justify-between text-sm mb-2.5">
                  <span className="text-gray-400 font-bold">Overall Progress</span>
                  <span className="font-black text-purple-400">{completedCount} of {totalModules} modules</span>
                </div>
                <div className="h-3.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full"
                    style={{
                      background: GRAD,
                      width: `${progressPct}%`,
                      ["--target-w" as string]: `${progressPct}%`,
                      animation: "progressFill 1.2s cubic-bezier(0.34,1.56,0.64,1) both",
                      boxShadow: "0 0 12px rgba(139,92,246,0.4)",
                    }} />
                </div>
              </div>
            </div>

            {/* Hero image */}
            <div className="shrink-0" style={{ animation: "popIn 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" }}>
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl"
                  style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.35),rgba(59,130,246,0.35))", filter: "blur(35px)", transform: "scale(1.1)", animation: "glowPulse 4s ease-in-out infinite" }} />
                <div className="relative rounded-3xl overflow-hidden border-2 shadow-2xl"
                  style={{ borderColor: "rgba(139,92,246,0.25)", animation: "heroFloat 5s ease-in-out infinite", boxShadow: "0 0 50px rgba(139,92,246,0.15)" }}>
                  <Image src="/characters/adam-layla-happy.png" alt="Adam and Layla" width={300} height={300} className="block" priority />
                </div>
                {[{ t: "-6px", r: "-6px", sz: 14 }, { b: "10px", l: "-8px", sz: 10 }].map((s, i) => (
                  <div key={i} className="absolute text-yellow-300"
                    style={{ top: "t" in s ? s.t : undefined, bottom: "b" in s ? s.b : undefined, right: "r" in s ? s.r : undefined, left: "l" in s ? s.l : undefined, fontSize: s.sz, animation: `sparkle 2.5s ease-in-out infinite ${i * 0.9}s` }}>✦</div>
                ))}
              </div>
            </div>
          </section>

          {course ? (
            <>
              {/* ── COURSE HEADER ── */}
              <section className="rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6"
                style={{
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.15)",
                  backdropFilter: "blur(14px)", animation: "slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
                }}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className="text-5xl shrink-0">{course.emoji}</span>
                  <div className="min-w-0">
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">{course.title}</h2>
                    <p className="text-sm text-gray-400 font-bold">Ages {course.ageRange} · {course.weeksCount} Weeks · {course.duration}</p>
                  </div>
                </div>
                {/* Progress ring */}
                <div className="shrink-0 relative w-[130px] h-[130px] flex items-center justify-center">
                  <svg width="130" height="130" className="-rotate-90">
                    <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                    <circle cx="65" cy="65" r={radius} fill="none"
                      stroke="url(#ringGrad)" strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      style={{ animation: `ringFill 1.4s cubic-bezier(0.34,1.56,0.64,1) 0.3s both`, filter: "drop-shadow(0 0 6px rgba(139,92,246,0.5))" }} />
                    <defs>
                      <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">{Math.round(progressPct)}%</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Complete</span>
                  </div>
                </div>
              </section>

              {/* ── MODULE LIST ── */}
              <section className="space-y-3 mb-12" style={{ animation: "slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" }}>
                {modules.map((mod, idx: number) => {
                  const isCurrentNext = mod.isCurrentNext;

                  return (
                    <div key={mod.id}
                      className="rounded-3xl p-5 sm:p-6 flex items-center gap-4 sm:gap-5 transition-all duration-300"
                      style={{
                        background: isCurrentNext ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.03)",
                        border: `1px solid ${isCurrentNext ? "rgba(139,92,246,0.3)" : mod.isCompleted ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)"}`,
                        backdropFilter: "blur(10px)",
                        opacity: mod.isUnlocked ? 1 : 0.45,
                        animation: isCurrentNext ? "currentGlow 3s ease-in-out infinite" : undefined,
                        animationDelay: `${idx * 0.08}s`,
                        cursor: mod.isUnlocked ? "pointer" : "default",
                        ...(mod.isUnlocked ? {} : { pointerEvents: "none" as const }),
                      }}>

                      {/* Week circle */}
                      <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-sm"
                        style={{
                          background: mod.isCompleted
                            ? "rgba(34,197,94,0.15)"
                            : isCurrentNext
                            ? "rgba(139,92,246,0.2)"
                            : "rgba(255,255,255,0.04)",
                          color: mod.isCompleted ? "#4ade80" : isCurrentNext ? "#a78bfa" : "#4b5563",
                          boxShadow: mod.isCompleted ? "0 0 12px rgba(34,197,94,0.2)" : isCurrentNext ? "0 0 16px rgba(139,92,246,0.2)" : "none",
                        }}>
                        {mod.isCompleted ? "✓" : `W${mod.weekNumber}`}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black uppercase tracking-widest mb-0.5"
                          style={{ color: mod.isCompleted ? "rgba(74,222,128,0.5)" : isCurrentNext ? "rgba(167,139,250,0.6)" : "rgba(255,255,255,0.15)" }}>
                          Week {mod.weekNumber}
                        </div>
                        <h3 className="font-black text-white text-sm sm:text-base leading-snug">{mod.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">{mod.description}</p>
                      </div>

                      {/* Action */}
                      <div className="shrink-0 flex items-center gap-3">
                        {isCurrentNext && (
                          <div className="hidden md:block w-10 h-10 rounded-xl overflow-hidden shrink-0"
                            style={{ border: "1px solid rgba(139,92,246,0.2)" }}>
                            <Image src="/characters/adam-layla-happy.png" alt="" width={40} height={40} className="block w-full h-full object-cover" />
                          </div>
                        )}
                        {mod.isCompleted ? (
                          <a href="/lesson" className="px-4 py-2.5 rounded-2xl text-xs font-black transition-all duration-300 hover:scale-105"
                            style={{ background: "rgba(34,197,94,0.1)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.2)" }}>
                            Completed ✓
                          </a>
                        ) : mod.isUnlocked ? (
                          <a href="/lesson" className="px-5 py-2.5 rounded-2xl text-xs font-black text-white transition-all duration-300 hover:scale-105"
                            style={{ background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
                            {mod.isInProgress ? "Continue →" : "Start Lesson →"}
                          </a>
                        ) : (
                          <span className="px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.04)" }}>
                            🔒 {mod.prevWeek !== null ? `Complete W${mod.prevWeek}` : "Locked"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* ── RACCOON / STORY ── */}
              <section className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)", animation: "slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
                }}>
                <div className="relative shrink-0">
                  <div className="absolute inset-0 rounded-2xl" style={{ background: "rgba(139,92,246,0.25)", filter: "blur(25px)", transform: "scale(0.85)" }} />
                  <Image src="/characters/raccoon.png" alt="The Hacker Raccoon" width={120} height={120} className="relative rounded-2xl block" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-black text-white text-lg mb-2">The Hacker Raccoon is still out there… 🦝</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    Complete all {totalModules} weeks to defeat him! Each lesson weakens his power.
                  </p>
                  {/* Raccoon power bar */}
                  <div>
                    <div className="flex justify-between text-xs font-black mb-1.5">
                      <span className="text-red-400">Raccoon Power</span>
                      <span className="text-red-400">{Math.round(100 - progressPct)}%</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                      <div className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${100 - progressPct}%`,
                          background: "linear-gradient(90deg, #f97316, #ef4444)",
                          boxShadow: "0 0 10px rgba(239,68,68,0.3)",
                        }} />
                    </div>
                    <p className="text-[11px] text-gray-500 font-bold mt-2">
                      {completedCount === 0
                        ? "Start your first lesson to begin weakening the raccoon!"
                        : completedCount >= totalModules
                        ? "🎉 You defeated the Hacker Raccoon!"
                        : `${completedCount} lesson${completedCount !== 1 ? "s" : ""} down — keep going!`}
                    </p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="rounded-3xl p-10 text-center"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-gray-500 font-bold">No course found. Please run the seed script.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ─── MAIN SERVER COMPONENT ─── */
export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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
        m.progress[0]?.status === "COMPLETED"
    ).length ?? 0;

  const totalModules = course?.modules.length ?? 0;
  const progressPct = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

  // Find the first available (not completed) unlocked module
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

  return (
    <DashboardShell
      userName={session.user.name ?? "Cyber Hero"}
      completedCount={completedCount}
      totalModules={totalModules}
      progressPct={progressPct}
      course={course ? { emoji: course.emoji, title: course.title, ageRange: course.ageRange, weeksCount: course.weeksCount, duration: course.duration } : null}
      modules={modules}
    />
  );
}
