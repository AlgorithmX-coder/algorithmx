"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";

// 3D wireframe globe — code-split so the Three.js bundle only ships when
// the user actually loads /login (not on every other route).
const CyberGlobe = dynamic(() => import("@/app/components/CyberGlobe"), {
  ssr: false,
});

/* ─── CONSTANTS ─── */
const GRAD = "linear-gradient(135deg, #8b5cf6, #3b82f6)";

/* ─── FLOATING ORBS ─── */
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: "#f59e0b", dur: 9, delay: 0 },
        { size: 6, top: "18%", right: "10%", color: "#8b5cf6", dur: 11, delay: 1 },
        { size: 10, top: "35%", left: "3%", color: "#3b82f6", dur: 13, delay: 2 },
        { size: 5, top: "52%", right: "5%", color: "#f59e0b", dur: 8, delay: 0.5 },
        { size: 7, top: "70%", left: "12%", color: "#8b5cf6", dur: 10, delay: 3 },
        { size: 9, top: "82%", right: "8%", color: "#3b82f6", dur: 12, delay: 1.5 },
      ].map((o, i) => (
        <motion.div key={i} className="absolute rounded-full"
          animate={{ y: [0, -18, 0], scale: [1, 1.1, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: o.dur, ease: "easeInOut", repeat: Infinity, delay: o.delay }}
          style={{
            width: o.size, height: o.size, top: o.top,
            left: "left" in o ? o.left : undefined,
            right: "right" in o ? o.right : undefined,
            backgroundColor: o.color, opacity: 0.35,
            boxShadow: `0 0 ${o.size * 3}px ${o.color}`,
          }} />
      ))}
    </div>
  );
}

/* ─── FLOATING ICONS (right panel) ─── */
function FloatingIcons() {
  const icons = [
    { emoji: "🔑", top: "15%", left: "25%", delay: 0, dur: 7 },
    { emoji: "⭐", top: "28%", right: "18%", delay: 1.5, dur: 6 },
    { emoji: "🔒", top: "55%", left: "18%", delay: 0.5, dur: 8 },
    { emoji: "🛡️", top: "70%", right: "22%", delay: 2, dur: 6.5 },
    { emoji: "✨", top: "42%", left: "65%", delay: 3, dur: 9 },
    { emoji: "🔐", top: "88%", left: "40%", delay: 1, dur: 7.5 },
  ];
  return (
    <>
      {icons.map((ic, i) => (
        <motion.div key={i} className="absolute text-2xl"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: ic.dur, ease: "easeInOut", repeat: Infinity, delay: ic.delay }}
          style={{
            top: ic.top,
            left: "left" in ic ? ic.left : undefined,
            right: "right" in ic ? ic.right : undefined,
            opacity: 0.6,
          }}>
          {ic.emoji}
        </motion.div>
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
          <motion.div className="rounded-3xl p-7 sm:p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-5 p-3.5 rounded-2xl text-sm font-semibold"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5", backdropFilter: "blur(8px)" }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

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
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.02, boxShadow: "0 6px 30px rgba(139,92,246,0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full font-black text-white text-base rounded-2xl transition-colors duration-300 disabled:opacity-50"
                style={{
                  height: 50, background: GRAD,
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                }}>
                {loading ? "Logging In..." : "Log In"}
              </motion.button>
            </form>

            <p className="text-center text-gray-500 text-sm mt-6">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="font-bold transition hover:opacity-80" style={{ color: "#8b5cf6" }}>
                Sign Up
              </a>
            </p>
          </motion.div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {[
              { icon: "🔒", label: "Secure" },
              { icon: "👨‍👩‍👧‍👦", label: "Family Friendly" },
              { icon: "🛡️", label: "COPPA Compliant" },
            ].map((b, i) => (
              <motion.span key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 + i * 0.1 }}
                className="text-xs text-gray-500 flex items-center gap-1.5">
                <span>{b.icon}</span> {b.label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: VISUAL (hidden on mobile) ─── */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0c0b24, #1e1145 50%, #0d0a26)" }}>

        {/* Matrix-rain glyphs drifting down */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none" style={{ opacity: 0.12 }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const chars = "01XY#$/&*?!%@ZLR-=+";
            const ch = chars.charAt(i % chars.length);
            const colour = i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#10b981" : "#8b5cf6";
            return (
              <span
                key={i}
                style={{
                  position: "absolute",
                  left: `${(i * 4.1 + (i % 3) * 2) % 100}%`,
                  top: 0,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                  fontSize: 12 + (i % 4),
                  color: colour,
                  animation: `loginMatrixFall ${14 + (i % 7) * 2}s linear ${(i * 0.8) % 12}s infinite`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>

        {/* Circuit grid background */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "42px 42px",
        }} />

        <FloatingIcons />

        {/* Halo glow behind the 3D globe */}
        <div aria-hidden className="absolute" style={{
          width: 460, height: 460, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,211,238,0.22), rgba(139,92,246,0.08) 50%, transparent 70%)",
          animation: "loginOrbPulse 4s ease-in-out infinite",
          filter: "blur(20px)",
          pointerEvents: "none",
        }} />

        {/* Live 3D wireframe globe — rotates, has orbiting rings + floating
            particle shell. Fills the right column behind the AX label. */}
        <div className="absolute inset-0" style={{ pointerEvents: "none" }}>
          <CyberGlobe />
        </div>

        {/* Centre label + terminal prompt + stats */}
        <motion.div className="relative flex flex-col items-center"
          style={{ marginTop: 270 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}>
          <span className="text-3xl font-black tracking-widest" style={{
            fontFamily: "Nunito, sans-serif",
            color: "#fff",
            textShadow: "0 0 18px rgba(34,211,238,0.55), 0 2px 12px rgba(0,0,0,0.5)",
            letterSpacing: 6,
          }}>ALGORITHMX</span>

          {/* Terminal prompt line under the globe */}
          <div style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            fontSize: 12,
            color: "#22d3ee",
            marginTop: 18,
            letterSpacing: 1,
          }}>
            <span style={{ color: "#10b981" }}>$</span> ax_login --auth<span style={{ marginLeft: 6, animation: "loginCursorBlink 1s steps(1) infinite" }}>▮</span>
          </div>

          {/* Stats */}
          <p className="text-gray-400 text-sm mt-5 text-center">
            4 Courses · Ages 6–18+ · 100% Interactive
          </p>
          <p className="text-gray-500 text-xs mt-3 text-center">
            Trusted by families across the UK
          </p>
        </motion.div>

        <style>{`
          @keyframes loginMatrixFall {
            0% { transform: translateY(-100%); opacity: 0; }
            15% { opacity: 0.7; }
            100% { transform: translateY(110vh); opacity: 0; }
          }
          @keyframes loginOrbPulse {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.08); }
          }
          @keyframes loginCursorBlink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
