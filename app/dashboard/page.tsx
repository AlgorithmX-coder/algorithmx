import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

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
      (m) => m.progress[0]?.status === "COMPLETED"
    ).length ?? 0;

  const totalModules = course?.modules.length ?? 0;
  const progressPct = totalModules > 0 ? (completedCount / totalModules) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {/* Nav */}
      <nav className="border-b border-white/[0.06] bg-[#0a0f1e]/90 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,220,255,0.3)]">
              <span className="text-xs font-black text-white">AX</span>
            </div>
            <span className="text-lg font-black text-white">
              ALGORITHM<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">X</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Welcome, <span className="text-cyan-400 font-bold">{session.user.name}</span>
            </span>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/app/lib/auth");
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="px-4 py-2 text-xs font-mono font-bold text-gray-500 hover:text-white border border-white/[0.08] hover:border-white/20 rounded-lg transition">
                LOG OUT
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
        <h1 className="text-3xl font-black text-white mb-2">Your Dashboard</h1>
        <p className="text-gray-400 mb-10">Continue your cybersecurity learning journey.</p>

        {course ? (
          <div className="bg-[#111833] border border-white/[0.06] rounded-2xl p-8">
            {/* Course header */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-4xl">{course.emoji}</span>
              <div>
                <h2 className="text-xl font-black text-white">{course.title}</h2>
                <p className="text-sm text-gray-400">
                  Ages {course.ageRange} · {course.weeksCount} Weeks · {course.duration}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-cyan-400 font-bold">
                  {completedCount} / {totalModules} modules
                </span>
              </div>
              <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Module list */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {course.modules.map((module, idx) => {
                const status = module.progress[0]?.status ?? "NOT_STARTED";
                const isCompleted = status === "COMPLETED";
                const isInProgress = status === "IN_PROGRESS";
                const isWeekOne = module.weekNumber === 1;

                // Unlock logic: week 1 always available; subsequent weeks unlock when previous is completed
                const prevModule = idx > 0 ? course.modules[idx - 1] : null;
                const prevCompleted =
                  prevModule?.progress[0]?.status === "COMPLETED";
                const isUnlocked = isWeekOne || prevCompleted || isCompleted || isInProgress;

                return (
                  <div
                    key={module.id}
                    className={`bg-white/[0.02] border rounded-xl p-5 flex items-center justify-between gap-4 transition-all duration-200 ${
                      isUnlocked
                        ? "border-white/[0.08] hover:border-cyan-400/20"
                        : "border-white/[0.04] opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Week badge */}
                      <div
                        className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black ${
                          isCompleted
                            ? "bg-cyan-400/20 text-cyan-400"
                            : isUnlocked
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-white/[0.04] text-gray-600"
                        }`}
                      >
                        {isCompleted ? "✓" : `W${module.weekNumber}`}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-mono text-cyan-400/50 mb-0.5">
                          WEEK {module.weekNumber}
                        </div>
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {module.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {module.description}
                        </p>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {isCompleted ? (
                        <span className="px-4 py-2 rounded-lg bg-cyan-400/10 text-cyan-400 text-xs font-bold border border-cyan-400/20">
                          Completed
                        </span>
                      ) : isInProgress ? (
                        <a
                          href="/lesson"
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-black hover:from-cyan-300 hover:to-blue-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,220,255,0.15)]"
                        >
                          Continue
                        </a>
                      ) : isUnlocked ? (
                        <a
                          href="/lesson"
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-xs font-black hover:from-cyan-300 hover:to-blue-400 transition-all duration-300 shadow-[0_0_15px_rgba(0,220,255,0.15)]"
                        >
                          Start Lesson
                        </a>
                      ) : (
                        <span className="px-4 py-2 rounded-lg bg-white/[0.04] text-gray-600 text-xs font-bold border border-white/[0.06]">
                          Locked
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-[#111833] border border-white/[0.06] rounded-2xl p-8 text-center text-gray-500">
            No course found. Please run the seed script.
          </div>
        )}
      </div>
    </div>
  );
}
