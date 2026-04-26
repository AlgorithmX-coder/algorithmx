"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { GlobePanelBackdrop } from "@/app/components/PixarScenes";

// 3D wireframe globe — code-split so the Three.js bundle only ships when
// the user actually loads /login (not on every other route).
const CyberGlobe = dynamic(() => import("@/app/components/CyberGlobe"), {
  ssr: false,
});

/* ─── PIXAR PALETTE ─── */
const C = {
  pageBg: "#1a0612",
  panelBg: "#2a0d2e",
  card: "rgba(40, 18, 38, 0.72)",
  border: "rgba(255, 220, 180, 0.22)",
  borderStrong: "rgba(255, 220, 180, 0.45)",
  text: "#fff7e6",
  textSoft: "#ffe9c8",
  textMuted: "rgba(255, 233, 200, 0.55)",
  goldLight: "#ffd58a",
  goldMid: "#ff9b4a",
  goldDeep: "#d4733a",
  goldDark: "#3a1a06",
  coral: "#f08e7e",
  ember: "#c4513a",
  cream: "#fff7e6",
};
const GRAD = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid})`;

/* ─── FLOATING ORBS — WARM ─── */
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: "#ffd58a", dur: 9, delay: 0 },
        { size: 6, top: "18%", right: "10%", color: "#f08e7e", dur: 11, delay: 1 },
        { size: 10, top: "35%", left: "3%", color: "#ff9b4a", dur: 13, delay: 2 },
        { size: 5, top: "52%", right: "5%", color: "#ffd58a", dur: 8, delay: 0.5 },
        { size: 7, top: "70%", left: "12%", color: "#a06aff", dur: 10, delay: 3 },
        { size: 9, top: "82%", right: "8%", color: "#ff9b4a", dur: 12, delay: 1.5 },
      ].map((o, i) => (
        <motion.div key={i} className="absolute rounded-full"
          animate={{ y: [0, -18, 0], scale: [1, 1.1, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: o.dur, ease: "easeInOut", repeat: Infinity, delay: o.delay }}
          style={{
            width: o.size, height: o.size, top: o.top,
            left: "left" in o ? o.left : undefined,
            right: "right" in o ? o.right : undefined,
            backgroundColor: o.color,
            boxShadow: `0 0 ${o.size * 4}px ${o.color}`,
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
            opacity: 0.7,
            filter: "drop-shadow(0 0 12px rgba(255, 200, 110, 0.55))",
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
    <div
      className="min-h-screen flex"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, #2a0d2e 35%, ${C.pageBg} 70%, #0a0410 100%)`,
        color: C.text,
      }}
    >
      <FloatingOrbs />

      {/* ─── LEFT SIDE: FORM ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative" style={{ zIndex: 1 }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: GRAD,
                boxShadow: "0 0 20px rgba(255, 178, 110, 0.4)",
              }}
            >
              <span
                className="text-sm font-black"
                style={{ color: C.goldDark, fontFamily: "Fredoka, Nunito, sans-serif" }}
              >
                AX
              </span>
            </div>
            <span
              className="text-xl font-black"
              style={{ color: C.text, fontFamily: "Fredoka, Nunito, sans-serif" }}
            >
              Algorithm
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}
              >
                X
              </span>
            </span>
          </a>

          {/* Heading */}
          <div
            style={{
              display: "inline-block",
              fontSize: 11,
              letterSpacing: 5,
              color: C.goldLight,
              fontWeight: 800,
              textTransform: "uppercase",
              padding: "5px 16px",
              background: "rgba(40, 18, 38, 0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid ${C.borderStrong}`,
              borderRadius: 999,
              marginBottom: 12,
              fontFamily: "Fredoka, Nunito, sans-serif",
            }}
          >
            ✦ Welcome Back ✦
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black mb-2"
            style={{
              fontFamily: "Fredoka, Nunito, sans-serif",
              background: "linear-gradient(135deg, #fff5cc, #ffd58a, #ff9b4a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.01em",
            }}
          >
            Hello again, hero!
          </h1>
          <p className="mb-8 text-base" style={{ color: C.textSoft, opacity: 0.92 }}>
            Log in to continue your cybersecurity journey
          </p>

          {/* Form card */}
          <motion.div className="rounded-3xl p-7 sm:p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            style={{
              background: C.card,
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `1px solid ${C.border}`,
              boxShadow:
                "0 30px 60px -20px rgba(20, 6, 12, 0.7), 0 0 0 1px rgba(255, 220, 180, 0.05) inset",
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
                  style={{
                    background: "rgba(196, 81, 58, 0.15)",
                    border: "1px solid rgba(196, 81, 58, 0.5)",
                    color: "#f4a89a",
                    backdropFilter: "blur(8px)",
                  }}>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: C.textSoft }}>Email</label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                    style={{ color: C.textMuted }}
                  >
                    ✉️
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 rounded-2xl font-medium transition-all duration-300 focus:outline-none"
                    style={{
                      height: 50,
                      fontSize: 15,
                      color: C.text,
                      background: "rgba(20, 6, 12, 0.5)",
                      border: `1px solid ${C.border}`,
                      fontFamily: "Nunito, sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.goldLight;
                      e.currentTarget.style.boxShadow = "0 0 22px rgba(255, 200, 110, 0.25)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold" style={{ color: C.textSoft }}>Password</label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-bold transition hover:opacity-80"
                    style={{ color: C.goldLight }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                    style={{ color: C.textMuted }}
                  >
                    🔒
                  </span>

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 rounded-2xl font-medium transition-all duration-300 focus:outline-none"
                    style={{
                      height: 50,
                      fontSize: 15,
                      color: C.text,
                      background: "rgba(20, 6, 12, 0.5)",
                      border: `1px solid ${C.border}`,
                      fontFamily: "Nunito, sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.goldLight;
                      e.currentTarget.style.boxShadow = "0 0 22px rgba(255, 200, 110, 0.25)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition text-sm"
                    style={{ color: C.textMuted }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="w-full font-black text-base rounded-full transition-colors duration-300 disabled:opacity-50"
                style={{
                  height: 50,
                  background: GRAD,
                  color: C.goldDark,
                  fontFamily: "Fredoka, Nunito, sans-serif",
                  letterSpacing: 0.5,
                  boxShadow:
                    "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
                }}
              >
                {loading ? "Logging In..." : "Log In →"}
              </motion.button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="font-bold transition hover:opacity-80"
                style={{ color: C.goldLight }}
              >
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
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 + i * 0.1 }}
                className="text-xs flex items-center gap-1.5"
                style={{ color: C.textMuted }}
              >
                <span>{b.icon}</span> {b.label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: VISUAL (hidden on mobile) ─── */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: C.panelBg }}
      >
        <GlobePanelBackdrop />

        <FloatingIcons />

        {/* Live 3D wireframe globe — fills the right column */}
        <div className="absolute inset-0" style={{ pointerEvents: "none", zIndex: 1 }}>
          <CyberGlobe />
        </div>

        {/* Centre label + terminal prompt */}
        <motion.div
          className="relative flex flex-col items-center"
          style={{ marginTop: 270, zIndex: 2 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
        >
          <span
            className="text-3xl font-black tracking-widest"
            style={{
              fontFamily: "Fredoka, Nunito, sans-serif",
              color: C.cream,
              textShadow:
                "0 0 22px rgba(255, 200, 110, 0.6), 0 4px 12px rgba(20, 6, 12, 0.5)",
              letterSpacing: 6,
            }}
          >
            ALGORITHMX
          </span>

          <div
            style={{
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              fontSize: 12,
              color: C.goldLight,
              marginTop: 18,
              letterSpacing: 1,
            }}
          >
            <span style={{ color: C.goldMid }}>$</span> ax_login --auth
            <span style={{ marginLeft: 6, animation: "loginCursorBlink 1s steps(1) infinite" }}>▮</span>
          </div>
        </motion.div>

        <style>{`
          @keyframes loginCursorBlink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
