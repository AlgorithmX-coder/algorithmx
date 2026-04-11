"use client";

const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: "#f59e0b", dur: "9s", delay: "0s" },
        { size: 6, top: "18%", right: "10%", color: "#8b5cf6", dur: "11s", delay: "1s" },
        { size: 10, top: "35%", left: "3%", color: "#3b82f6", dur: "13s", delay: "2s" },
        { size: 5, top: "52%", right: "5%", color: "#f59e0b", dur: "8s", delay: "0.5s" },
        { size: 7, top: "70%", left: "12%", color: "#8b5cf6", dur: "10s", delay: "3s" },
      ].map((o, i) => (
        <div key={i} className="absolute rounded-full"
          style={{
            width: o.size, height: o.size, top: o.top,
            left: "left" in o ? o.left : undefined,
            right: "right" in o ? o.right : undefined,
            backgroundColor: o.color, opacity: 0.35,
            boxShadow: `0 0 ${o.size * 3}px ${o.color}`,
            animation: `floatOrb ${o.dur} ease-in-out infinite ${o.delay}`,
          }} />
      ))}
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative" style={{ background: "#1a1033" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; }
          50% { transform: translateY(-18px) scale(1.1); opacity: 0.55; }
        }
        @keyframes raccoonFloat {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-14px) rotate(3deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <FloatingOrbs />

      <div className="text-center relative" style={{ zIndex: 1, fontFamily: "Nunito, sans-serif", animation: "slideUp 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        {/* Raccoon */}
        <div className="mb-6">
          <img
            src="/characters/raccoon.png"
            alt="The Hacker Raccoon"
            width={120}
            height={120}
            className="mx-auto block"
            style={{ animation: "raccoonFloat 3s ease-in-out infinite" }}
          />
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 sm:p-10 max-w-md mx-auto"
          style={{
            background: "rgba(255,255,255,0.04)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Oops! The Raccoon stole this page! 🦝
          </h1>
          <p className="text-gray-400 text-base mb-8">
            Don&apos;t worry — we&apos;ll get you back to safety.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/"
              className="px-6 py-3 rounded-2xl font-black text-white text-sm transition-all duration-300 hover:scale-105 inline-block"
              style={{ background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}>
              Go Home 🏠
            </a>
            <a href="/dashboard"
              className="px-6 py-3 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-105 inline-block"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#d1d5db",
              }}>
              Go to Dashboard 📚
            </a>
          </div>
        </div>

        <p className="text-gray-600 text-xs mt-6 font-bold">Error 404 — Page not found</p>
      </div>
    </div>
  );
}
