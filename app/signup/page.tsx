"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ConstellationScene } from "@/app/components/PixarScenes";

/* ─── PIXAR PALETTE ─── */
const C = {
  pageBg: "#1a0612",
  panelBg: "rgba(40, 18, 38, 0.4)",
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
        <motion.div
          key={i}
          className="absolute rounded-full"
          animate={{ y: [0, -18, 0], scale: [1, 1.1, 1], opacity: [0.45, 0.7, 0.45] }}
          transition={{ duration: o.dur, ease: "easeInOut", repeat: Infinity, delay: o.delay }}
          style={{
            width: o.size,
            height: o.size,
            top: o.top,
            left: "left" in o ? o.left : undefined,
            right: "right" in o ? o.right : undefined,
            backgroundColor: o.color,
            boxShadow: `0 0 ${o.size * 4}px ${o.color}`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── FLOATING ICONS ─── */
function FloatingIcons() {
  const icons = [
    { emoji: "🔒", top: "12%", left: "20%", delay: 0, dur: 6 },
    { emoji: "🔑", top: "25%", right: "15%", delay: 1, dur: 7 },
    { emoji: "⭐", top: "60%", left: "15%", delay: 2, dur: 8 },
    { emoji: "🛡️", top: "75%", right: "20%", delay: 0.5, dur: 6.5 },
    { emoji: "🔐", top: "40%", left: "70%", delay: 3, dur: 9 },
    { emoji: "✨", top: "85%", left: "45%", delay: 1.5, dur: 7.5 },
  ];
  return (
    <>
      {icons.map((ic, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: ic.dur, ease: "easeInOut", repeat: Infinity, delay: ic.delay }}
          style={{
            top: ic.top,
            left: "left" in ic ? ic.left : undefined,
            right: "right" in ic ? ic.right : undefined,
            opacity: 0.7,
            filter: "drop-shadow(0 0 12px rgba(255, 200, 110, 0.55))",
          }}
        >
          {ic.emoji}
        </motion.div>
      ))}
    </>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, #2a0d2e 35%, ${C.pageBg} 70%, #0a0410 100%)`,
        color: C.text,
      }}
    >
      {/* Left-side floating orbs over the form column */}
      <FloatingOrbs />

      {/* ─── LEFT SIDE: FORM ─── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ zIndex: 1 }}
      >
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
            ✦ New Hero ✦
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
            Join the Adventure
          </h1>
          <p className="mb-8 text-base" style={{ color: C.textSoft, opacity: 0.92 }}>
            Create your family&apos;s account and start learning cybersecurity today
          </p>

          {/* Form card */}
          <motion.div
            className="rounded-3xl p-7 sm:p-8"
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
            }}
          >
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
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: C.textSoft }}>
                  Full Name
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                    style={{ color: C.textMuted }}
                  >
                    👤
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: C.textSoft }}>
                  Email
                </label>
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
                <label className="block text-sm font-bold mb-2" style={{ color: C.textSoft }}>
                  Password
                </label>
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
                    placeholder="Create a password (min 6 characters)"
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
                {loading ? "Creating Account..." : "Create Account →"}
              </motion.button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>
              Already have an account?{" "}
              <a
                href="/login"
                className="font-bold transition hover:opacity-80"
                style={{ color: C.goldLight }}
              >
                Log In
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

      {/* ─── RIGHT SIDE: VISUAL — CONSTELLATION + GLOWING MEDALLION ─── */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden"
        style={{ background: C.panelBg }}
      >
        {/* ConstellationScene is fixed-position so it covers the full viewport;
            we place a clipping wrapper around the right column to keep it
            visually contained on this side only. The fixed layer still
            renders, but the form column has its own backdrop overlay so
            nothing leaks through visually. */}
        <ConstellationScene />

        <FloatingIcons />

        {/* Glowing medallion centerpiece */}
        <motion.div
          className="relative flex flex-col items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
          style={{ zIndex: 2 }}
        >
          {/* Halo behind medallion */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: -50,
              borderRadius: "50%",
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(255, 215, 138, 0.5) 60deg, transparent 120deg, rgba(247, 193, 214, 0.4) 180deg, transparent 240deg, rgba(255, 178, 110, 0.5) 300deg, transparent 360deg)",
              filter: "blur(28px)",
              animation: "spIntroSpin 16s linear infinite",
              opacity: 0.7,
            }}
          />
          <motion.div
            className="flex items-center justify-center"
            animate={{ y: [-6, 6, -6] }}
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
            style={{
              position: "relative",
              width: 220,
              height: 240,
              background:
                "radial-gradient(circle at 32% 28%, #fff5cc 0%, #ffd158 35%, #d48a18 80%, #5a2a05 100%)",
              borderRadius: "50% 50% 50% 50% / 40% 40% 60% 60%",
              boxShadow:
                "0 0 60px rgba(255, 178, 110, 0.5), inset 0 0 50px rgba(255, 245, 215, 0.3), 0 30px 60px -20px rgba(20, 6, 12, 0.8)",
              borderStyle: "solid",
              borderWidth: 4,
              borderColor: "rgba(255, 245, 215, 0.55)",
            }}
          >
            <div className="flex flex-col items-center">
              <span
                className="text-5xl font-black"
                style={{
                  fontFamily: "Fredoka, Nunito, sans-serif",
                  color: C.goldDark,
                  textShadow: "0 2px 0 rgba(255,245,215,0.5)",
                }}
              >
                AX
              </span>
              <span
                className="text-xs font-black mt-1 tracking-widest"
                style={{ color: "rgba(58, 26, 6, 0.7)" }}
              >
                ALGORITHMX
              </span>
            </div>
          </motion.div>

          <p
            className="text-sm mt-8 text-center"
            style={{
              color: C.goldLight,
              fontFamily: "Fredoka, Nunito, sans-serif",
              letterSpacing: 1,
              textShadow: "0 2px 8px rgba(20, 6, 12, 0.5)",
            }}
          >
            4 Courses · Ages 6–18+ · 100% Interactive
          </p>
          <p
            className="text-xs mt-3 text-center"
            style={{ color: C.textSoft, opacity: 0.75 }}
          >
            Trusted by families across the UK
          </p>
        </motion.div>

        <style>{`
          @keyframes spIntroSpin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
