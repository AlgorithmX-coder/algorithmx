import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
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

        <div className="bg-[#111833] border border-white/[0.06] rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl">🛡️</span>
            <div>
              <h2 className="text-xl font-black text-white">Cyber Heroes Academy</h2>
              <p className="text-sm text-gray-400">Ages 6–10 · 12 Weeks · 45 min/week</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Progress</span>
              <span className="text-cyan-400 font-bold">0 / 12 modules</span>
            </div>
            <div className="w-full h-3 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500" />
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-cyan-400/60 mb-1">WEEK 1</div>
              <h3 className="text-base font-bold text-white">What is a Password?</h3>
              <p className="text-xs text-gray-500 mt-1">Learn why passwords matter and how to create strong ones.</p>
            </div>
            <a href="/lesson" className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-black text-sm font-black hover:from-cyan-300 hover:to-blue-400 transition-all duration-300 shadow-[0_0_20px_rgba(0,220,255,0.2)]">
              Start Lesson
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}