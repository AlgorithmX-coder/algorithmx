import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";

const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

const MODULE_SUMMARIES: Record<number, string> = {
  1: "Learned what passwords are, why they matter, how to build strong ones, and how to spot phishing tricks.",
  2: "Explored online identity and understanding what personal information is safe to share.",
  3: "Discovered how to identify trustworthy websites and avoid dangerous links.",
  4: "Learned about cyberbullying — how to recognise it, respond safely, and support others.",
  5: "Understood the importance of software updates and keeping devices secure.",
  6: "Explored privacy settings on apps and games, and why they matter.",
  7: "Learned about digital footprints — what you leave behind online lasts forever.",
  8: "Discovered email safety, spam, and how scammers try to trick people.",
  9: "Explored safe gaming — in-app purchases, stranger danger, and reporting tools.",
  10: "Learned about two-factor authentication and extra layers of security.",
  11: "Understood backup and recovery — keeping your data safe from loss.",
  12: "Explored digital footprints — everything you do online leaves a trail.",
  13: "Learned about screen time balance, breaks, sleep, and healthy online habits.",
  14: "Understood how smart devices like Alexa and Siri listen, and how to protect privacy.",
  15: "Discovered what AI chatbots are, what they know, and what never to share with them.",
  16: "Learned to check QR codes and links before tapping — no more mystery clicks.",
  17: "Explored social media safety on TikTok, Snapchat, and Instagram — privacy and posting.",
  18: "Practised keeping things private on shared family devices — logging out and boundaries.",
  19: "Became the family cyber expert — helping parents and grandparents stay safe too.",
  20: "Completed the ultimate challenge and earned the Cyber Hero certificate!",
};

const PARENT_TIPS_BY_WEEK: Record<number, string> = {
  1: "Ask your child to teach YOU about strong passwords! Let them show you the password recipe they learned.",
  2: "Talk about what personal information is okay to share online and what should stay private.",
  3: "Browse the web together and ask your child to spot which websites look trustworthy.",
  4: "Discuss what to do if someone is mean online — make sure they know they can always come to you.",
  5: "Check your family devices together for updates — make it a team activity!",
  6: "Review the privacy settings on your child's favourite apps together.",
  7: "Search your child's name online together and discuss what a digital footprint means.",
  8: "Show your child a spam email (safely!) and let them spot the red flags.",
  9: "Review your child's gaming accounts together and discuss safe gaming habits.",
  10: "Set up two-factor authentication on a family account together as practice.",
  11: "Help your child back up their important school files or photos.",
  12: "Talk about digital footprints — search your child's name online together and discuss what comes up.",
  13: "Set a family screen time agreement together — make it collaborative, not a punishment.",
  14: "Ask your child to show you the privacy settings on your smart speakers and devices.",
  15: "Chat about AI together — ask your child what they think chatbots should and shouldn't know about them.",
  16: "Next time you see a QR code in the wild, ask your child if they think it's safe to scan.",
  17: "Review your child's social media privacy settings together — make it a team check-up.",
  18: "Set up separate user accounts on shared family devices if you haven't already.",
  19: "Let your child teach a grandparent or relative about online safety — they'll love being the expert!",
  20: "Celebrate! Your child is now a certified Cyber Hero. Ask them to present what they learned to the family!",
};

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

  const modules = (course?.modules ?? []).map(
    (m: NonNullable<typeof course>["modules"][number]) => {
      const status = m.progress[0]?.status ?? "NOT_STARTED";
      return {
        id: m.id,
        weekNumber: m.weekNumber,
        title: m.title,
        status,
        completedAt: m.progress[0]?.completedAt ?? null,
      };
    },
  );

  const completedCount = modules.filter((m) => m.status === "COMPLETED").length;
  const totalModules = modules.length;
  const progressPct = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
  const currentWeek = modules.find((m) => m.status !== "COMPLETED")?.weekNumber ?? (totalModules > 0 ? totalModules : 1);
  const completedWeeks = modules.filter((m) => m.status === "COMPLETED").map((m) => m.weekNumber);
  const highestCompleted = completedWeeks.length > 0 ? Math.max(...completedWeeks) : 0;

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPct / 100) * circumference;

  const ACCENT_MAP: Record<string, string> = {
    purple: "#8b5cf6", blue: "#3b82f6", cyan: "#06b6d4",
    green: "#22c55e", amber: "#f59e0b", pink: "#ec4899",
  };
  const accent = ACCENT_MAP[child.avatarColor] ?? "#8b5cf6";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        .parent * { font-family: 'Nunito', sans-serif; }
        @keyframes floatOrb   {0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-24px) scale(1.3)}}
        @keyframes slideUp    {from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes cardIn     {from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes ringFill   {from{stroke-dashoffset:${circumference}}to{stroke-dashoffset:${dashOffset}}}
      `}</style>

      <div className="parent min-h-screen relative" style={{ background: "#1a1033" }}>

        {/* Floating orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
          {[
            { s: 6, t: "10%", l: "5%", c: "#f59e0b", d: "10s", dl: "0s" },
            { s: 5, t: "25%", r: "8%", c: "#8b5cf6", d: "12s", dl: "1s" },
            { s: 8, t: "50%", l: "4%", c: "#3b82f6", d: "14s", dl: "2s" },
            { s: 4, t: "70%", r: "6%", c: "#f59e0b", d: "9s", dl: "3s" },
          ].map((o: { s: number; t: string; c: string; d: string; dl: string; l?: string; r?: string }, i: number) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: o.s, height: o.s, top: o.t,
                left: o.l ?? undefined, right: o.r ?? undefined,
                backgroundColor: o.c, opacity: 0.25,
                boxShadow: `0 0 ${o.s * 3}px ${o.c}`,
                animation: `floatOrb ${o.d} ease-in-out infinite ${o.dl}`,
              }} />
          ))}
        </div>

        {/* Nav */}
        <nav className="sticky top-0 z-50 border-b"
          style={{ background: "rgba(26,16,51,0.85)", backdropFilter: "blur(20px)", borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1000px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: GRAD, boxShadow: "0 0 20px rgba(139,92,246,0.4)" }}>
                <span className="text-xs font-black text-white">AX</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Algorithm<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">X</span>
              </span>
            </a>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-xs font-bold text-gray-500 hidden sm:block">Parent Dashboard</span>
              <a href="/dashboard" className="text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors">
                Child View →
              </a>
              <form action={async () => {
                "use server";
                const { signOut } = await import("@/app/lib/auth");
                await signOut({ redirectTo: "/" });
              }}>
                <button className="px-4 py-2 text-xs font-black text-gray-400 hover:text-white rounded-2xl transition-colors"
                  style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </nav>

        <div className="relative max-w-[1000px] mx-auto px-6 md:px-10 py-10" style={{ zIndex: 1 }}>

          {/* ── 1. CHILD OVERVIEW ── */}
          <section className="rounded-3xl p-6 sm:p-8 mb-8"
            style={{
              background: "rgba(255,255,255,0.04)", border: `1px solid ${accent}25`,
              backdropFilter: "blur(14px)",
              animation: "slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
            }}>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar + info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0"
                  style={{ background: accent, boxShadow: `0 0 20px ${accent}40` }}>
                  {child.childName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>
                      {child.childName}&apos;s
                    </span>{" "}
                    Progress
                  </h1>
                  <p className="text-sm text-gray-400 font-bold mt-1">
                    Age {child.age} · Cyber Heroes Academy
                  </p>
                </div>
              </div>

              {/* Progress ring */}
              <div className="shrink-0 relative w-[120px] h-[120px] flex items-center justify-center">
                <svg width="120" height="120" className="-rotate-90">
                  <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                  <circle cx="60" cy="60" r={radius} fill="none"
                    stroke="url(#parentRingGrad)" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={dashOffset}
                    style={{ animation: "ringFill 1.4s cubic-bezier(0.34,1.56,0.64,1) 0.3s both", filter: `drop-shadow(0 0 6px ${accent}80)` }} />
                  <defs>
                    <linearGradient id="parentRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{progressPct}%</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Complete</span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-3 mt-6">
              {[
                { label: "Weeks Completed", value: `${completedCount}/${totalModules}` },
                { label: "Current Week", value: `${currentWeek}` },
                { label: "Course", value: "Cyber Heroes" },
              ].map((s, i) => (
                <div key={i} className="flex-1 min-w-[120px] rounded-2xl px-4 py-3 text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-lg font-black text-white">{s.value}</div>
                  <div className="text-[11px] font-bold text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 2. WEEKLY PROGRESS ── */}
          <section className="rounded-3xl p-6 sm:p-8 mb-8"
            style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              animation: "cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
            }}>
            <h2 className="text-xl font-black text-white mb-5">Weekly Progress</h2>

            {/* Desktop table */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-[60px_1fr_140px_140px] gap-y-0 text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-4">
                <span>Week</span><span>Topic</span><span>Status</span><span>Completed</span>
              </div>
              {modules.map((m, i) => {
                const isCompleted = m.status === "COMPLETED";
                const isInProgress = m.status === "IN_PROGRESS";
                return (
                  <div key={m.id} className="grid grid-cols-[60px_1fr_140px_140px] items-center px-4 py-3.5 rounded-xl"
                    style={{
                      background: i % 2 === 0 ? "rgba(255,255,255,0.02)" : "transparent",
                      animation: `cardIn 0.4s ease ${i * 0.05}s both`,
                    }}>
                    <span className="text-sm font-black" style={{ color: isCompleted ? "#4ade80" : isInProgress ? "#60a5fa" : "#4b5563" }}>
                      W{m.weekNumber}
                    </span>
                    <span className="text-sm font-bold text-gray-300">{m.title}</span>
                    <span className="text-xs font-black">
                      {isCompleted ? <span style={{ color: "#4ade80" }}>✅ Completed</span>
                        : isInProgress ? <span style={{ color: "#60a5fa" }}>🔵 In Progress</span>
                        : <span style={{ color: "#4b5563" }}>🔒 Locked</span>}
                    </span>
                    <span className="text-xs text-gray-500">
                      {m.completedAt ? new Date(m.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {modules.map((m, i) => {
                const isCompleted = m.status === "COMPLETED";
                const isInProgress = m.status === "IN_PROGRESS";
                return (
                  <div key={m.id} className="rounded-2xl p-4"
                    style={{
                      background: "rgba(255,255,255,0.03)", border: `1px solid ${isCompleted ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)"}`,
                      animation: `cardIn 0.4s ease ${i * 0.05}s both`,
                    }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black" style={{ color: isCompleted ? "#4ade80" : isInProgress ? "#60a5fa" : "#4b5563" }}>
                        Week {m.weekNumber}
                      </span>
                      <span className="text-xs font-black">
                        {isCompleted ? <span style={{ color: "#4ade80" }}>✅</span>
                          : isInProgress ? <span style={{ color: "#60a5fa" }}>🔵</span>
                          : <span style={{ color: "#4b5563" }}>🔒</span>}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-300">{m.title}</p>
                    {m.completedAt && (
                      <p className="text-[11px] text-gray-500 mt-1">
                        {new Date(m.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 3. LEARNING INSIGHTS ─�� */}
          <section className="rounded-3xl p-6 sm:p-8 mb-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: "4px solid #22c55e",
              backdropFilter: "blur(12px)",
              animation: "cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both",
            }}>
            <h2 className="text-xl font-black text-white mb-4">
              What {child.childName} has learned so far 📚
            </h2>
            {completedCount === 0 ? (
              <p className="text-gray-400 text-sm">
                Start the first lesson to see learning insights here! Each completed week unlocks a summary of what {child.childName} has learned.
              </p>
            ) : (
              <div className="space-y-3">
                {modules.filter((m) => m.status === "COMPLETED").map((m) => (
                  <div key={m.id} className="flex gap-3 items-start">
                    <span className="text-xs font-black text-green-400 mt-0.5 shrink-0">W{m.weekNumber}</span>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {MODULE_SUMMARIES[m.weekNumber] ?? m.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ─��� 4. TIPS FOR PARENTS ── */}
          <section className="rounded-3xl p-6 sm:p-8 mb-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderLeft: "4px solid #f59e0b",
              backdropFilter: "blur(12px)",
              animation: "cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
            }}>
            <h2 className="text-xl font-black text-white mb-4">
              💡 Continue the conversation at home 💬
            </h2>

            <div className="space-y-3 mb-5">
              {/* Contextual tip */}
              {highestCompleted > 0 && PARENT_TIPS_BY_WEEK[highestCompleted] ? (
                <div className="rounded-2xl p-4" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <p className="text-sm font-bold text-amber-300 mb-1">Based on Week {highestCompleted}:</p>
                  <p className="text-sm text-gray-300">{PARENT_TIPS_BY_WEEK[highestCompleted]}</p>
                </div>
              ) : (
                <div className="rounded-2xl p-4" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                  <p className="text-sm text-gray-300">
                    Encourage {child.childName} to start Week 1 — it takes just 45 minutes and they&apos;ll learn all about password safety.
                  </p>
                </div>
              )}
            </div>

            {/* General tips */}
            <div className="space-y-2.5">
              {[
                "Set aside 45 minutes each week for your child's cyber lesson",
                "Ask your child what they learned — teaching others helps them remember",
                "Make cybersecurity a family conversation, not just a course",
              ].map((tip, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <span className="text-amber-400 text-sm mt-0.5 shrink-0">•</span>
                  <p className="text-sm text-gray-400">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── 5. QUICK ACTIONS ── */}
          <section className="rounded-3xl p-6 sm:p-8 mb-10"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(12px)",
              animation: "cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s both",
            }}>
            <h2 className="text-xl font-black text-white mb-5">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/dashboard"
                className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-black text-white text-center transition-all duration-300 hover:scale-[1.02]"
                style={{ background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
                View as {child.childName} →
              </a>
              <button
                className="flex-1 px-6 py-3.5 rounded-2xl text-sm font-black text-gray-400 text-center transition-all duration-300 hover:text-white cursor-default"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                title="Coming soon!">
                Share Progress (Coming Soon)
              </button>
            </div>
          </section>

        </div>

        {/* Footer */}
        <footer className="border-t py-8 px-6 md:px-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1000px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GRAD }}>
                <span className="text-[9px] font-black text-white">AX</span>
              </div>
              <span className="text-sm font-bold text-gray-500">&copy; 2026 AlgorithmX</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="/dashboard" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Child Dashboard</a>
              <a href="/" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Home</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
