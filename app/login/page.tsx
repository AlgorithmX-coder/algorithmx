"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

/* ─── CONSTANTS ─── */
const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";
const SPRING = "cubic-bezier(0.34,1.56,0.64,1)";

/* ─── FLOATING ORBS ─── */
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: "#f59e0b", dur: "9s", delay: "0s" },
        { size: 6, top: "18%", right: "10%", color: "#8b5cf6", dur: "11s", delay: "1s" },
        { size: 10, top: "35%", left: "3%", color: "#3b82f6", dur: "13s", delay: "2s" },
        { size: 5, top: "52%", right: "5%", color: "#f59e0b", dur: "8s", delay: "0.5s" },
        { size: 7, top: "70%", left: "12%", color: "#8b5cf6", dur: "10s", delay: "3s" },
        { size: 9, top: "82%", right: "8%", color: "#3b82f6", dur: "12s", delay: "1.5s" },
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

/* ─── FLOATING ICONS (right panel) ─── */
function FloatingIcons() {
  const icons = [
    { emoji: "🔑", top: "15%", left: "25%", delay: "0s", dur: "7s" },
    { emoji: "⭐", top: "28%", right: "18%", delay: "1.5s", dur: "6s" },
    { emoji: "🔒", top: "55%", left: "18%", delay: "0.5s", dur: "8s" },
    { emoji: "🛡️", top: "70%", right: "22%", delay: "2s", dur: "6.5s" },
    { emoji: "✨", top: "42%", left: "65%", delay: "3s", dur: "9s" },
    { emoji: "🔐", top: "88%", left: "40%", delay: "1s", dur: "7.5s" },
  ];
  return (
    <>
      {icons.map((ic, i) => (
        <div key={i} className="absolute text-2xl" style={{
          top: ic.top,
          left: "left" in ic ? ic.left : undefined,
          right: "right" in ic ? ic.right : undefined,
          animation: `floatOrb ${ic.dur} ease-in-out infinite ${ic.delay}`,
          opacity: 0.6,
        }}>
          {ic.emoji}
        </div>
      ))}
    </>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address"); return false; }
    if (password.length < 1) { setError("Please enter your password"); return false; }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#1a1033" }}>
      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.35; }
          50% { transform: translateY(-18px) scale(1.1); opacity: 0.55; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeStagger {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <FloatingOrbs />

      {/* ─── LEFT SIDE: FORM ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative" style={{ zIndex: 1 }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GRAD, boxShadow: "0 0 20px rgba(139,92,246,0.3)" }}>
              <span className="text-sm font-black text-white">AX</span>
            </div>
            <span className="text-xl font-black text-white" style={{ fontFamily: "Nunito, sans-serif" }}>
              Algorithm<span className="text-transparent bg-clip-text" style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}>X</span>
            </span>
          </a>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2" style={{ fontFamily: "Nunito, sans-serif" }}>
            Welcome Back
          </h1>
          <p className="text-gray-300 mb-8 text-base">
            Log in to continue your cybersecurity journey
          </p>

          {/* Form card */}
          <div className="rounded-3xl p-7 sm:p-8"
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
              animation: `slideUp 0.7s ${SPRING} both`,
            }}>

            {/* Error */}
            {error && (
              <div className="mb-5 p-3.5 rounded-2xl text-sm font-semibold"
                style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", backdropFilter: "blur(8px)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base">✉️</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 rounded-2xl text-white placeholder-gray-500 font-medium transition-all duration-300 focus:outline-none"
                    style={{
                      height: 50, fontSize: 15,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 0 20px rgba(139,92,246,0.15)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 rounded-2xl text-white placeholder-gray-500 font-medium transition-all duration-300 focus:outline-none"
                    style={{
                      height: 50, fontSize: 15,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 0 20px rgba(139,92,246,0.15)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                    placeholder="Enter your password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition text-sm">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full font-black text-white text-base rounded-2xl transition-all duration-300 disabled:opacity-50"
                style={{
                  height: 50, background: GRAD,
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 6px 30px rgba(139,92,246,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.3)"; }}
              >
                {loading ? "Logging In..." : "Log In"}
              </button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="font-bold transition hover:opacity-80" style={{ color: "#8b5cf6" }}>
                Sign Up
              </a>
            </p>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {[
              { icon: "🔒", label: "Secure" },
              { icon: "👨‍👩‍👧‍👦", label: "Family Friendly" },
              { icon: "🛡️", label: "COPPA Compliant" },
            ].map((b, i) => (
              <span key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
                <span>{b.icon}</span> {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: VISUAL (hidden on mobile) ─── */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #241550, #1e1145)" }}>

        {/* Circuit grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />

        <FloatingIcons />

        {/* Shield */}
        <div className="relative flex flex-col items-center" style={{ animation: `fadeStagger 0.8s ${SPRING} both 0.3s` }}>
          <div className="flex items-center justify-center"
            style={{
              width: 200, height: 230,
              background: GRAD,
              borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
              boxShadow: "0 0 60px rgba(139,92,246,0.3), inset 0 0 40px rgba(255,255,255,0.05)",
            }}>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-black text-white" style={{ fontFamily: "Nunito, sans-serif", textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>AX</span>
              <span className="text-xs font-bold text-white/60 mt-1 tracking-widest">ALGORITHMX</span>
            </div>
          </div>

          {/* Stats */}
          <p className="text-gray-400 text-sm mt-8 text-center">
            4 Courses · Ages 6–18+ · 100% Interactive
          </p>
          <p className="text-gray-500 text-xs mt-3 text-center">
            Trusted by families across the UK
          </p>
        </div>
      </div>
    </div>
  );
}
