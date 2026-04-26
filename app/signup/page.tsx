"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ParticleNetworkScene } from "@/app/components/CyberFutureScenes";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";

// Heavy R3F atlas — only ship to the client, only render lg+ where the
// right panel is visible. Avoids hydration churn and keeps mobile fast.
const HeroAtlas = dynamic(() => import("@/app/components/HeroAtlas"), {
  ssr: false,
  loading: () => null,
});

/* ─── PIXAR PALETTE ─── */
const C = {
  pageBg: "#080a16",
  panelBg: "rgba(15, 21, 48, 0.4)",
  card: "rgba(15, 21, 48, 0.72)",
  border: "rgba(0, 229, 255, 0.22)",
  borderStrong: "rgba(0, 229, 255, 0.45)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  textMuted: "rgba(125, 240, 255, 0.55)",
  goldLight: "#00e5ff",
  goldMid: "#7c5cff",
  goldDeep: "#3a7bff",
  goldDark: "#080a16",
  coral: "#ff5fb3",
  ember: "#ff7a59",
  cream: "#e8edff",
};
const GRAD = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid})`;

/* ─── FLOATING ORBS — WARM ─── */
function FloatingOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8, top: "8%", left: "6%", color: "#00e5ff", dur: 9, delay: 0 },
        { size: 6, top: "18%", right: "10%", color: "#ff5fb3", dur: 11, delay: 1 },
        { size: 10, top: "35%", left: "3%", color: "#7c5cff", dur: 13, delay: 2 },
        { size: 5, top: "52%", right: "5%", color: "#00e5ff", dur: 8, delay: 0.5 },
        { size: 7, top: "70%", left: "12%", color: "#7c5cff", dur: 10, delay: 3 },
        { size: 9, top: "82%", right: "8%", color: "#7c5cff", dur: 12, delay: 1.5 },
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
            filter: "drop-shadow(0 0 12px rgba(124, 92, 255, 0.55))",
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
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
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
      className="min-h-screen flex relative"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, ${C.pageBg} 70%, #04050d 100%)`,
        color: C.text,
      }}
    >
      {/* Left-side floating orbs over the form column */}
      <FloatingOrbs />

      {/* ─── UNIFIED BACKDROP — extends across the entire viewport ───
          Mirrors the login page restructure: one absolute layer
          renders the ParticleNetworkScene + HeroAtlas + ALGORITHMX
          terminal across the full viewport, with the form floating
          on top anchored to the left half. */}
      <div className="absolute inset-0" style={{ zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <ParticleNetworkScene />

        <FloatingIcons />

        {/* Live R3F atlas — pulsing crystal core, wireframe shells,
            four tilted orbital rings. Fills the whole viewport so the
            form on the left has the orbital scene as its direct
            backdrop, same as the login globe. */}
        <div className="absolute inset-0">
          <HeroAtlas />
        </div>

        {/* Centre label + terminal prompt — biased toward the right
            half so it sits beside (not under) the form column. */}
        <motion.div
          className="absolute flex flex-col items-center"
          style={{
            top: "50%",
            left: "70%",
            transform: "translate(-50%, 80px)",
            zIndex: 2,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.6 }}
        >
          <span
            className="text-3xl font-black tracking-widest"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              color: C.cream,
              textShadow:
                "0 0 22px rgba(124, 92, 255, 0.6), 0 4px 12px rgba(8, 10, 22, 0.5)",
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
            <span style={{ color: C.goldMid }}>$</span> ax_signup --new-hero
            <span style={{ marginLeft: 6, animation: "spCursorBlink 1s steps(1) infinite" }}>▮</span>
          </div>
          <p
            className="text-xs mt-4 text-center"
            style={{ color: C.textSoft, opacity: 0.75, letterSpacing: 0.5 }}
          >
            4 Courses · Ages 6–18+ · 100% Interactive
          </p>
        </motion.div>
      </div>

      {/* ─── LEFT SIDE: FORM ─── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ zIndex: 3 }}
      >
        <div className="w-full max-w-md relative" style={{ zIndex: 2 }}>
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: GRAD,
                boxShadow: "0 0 20px rgba(124, 92, 255, 0.4)",
              }}
            >
              <span
                className="text-sm font-black"
                style={{ color: C.goldDark, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                AX
              </span>
            </div>
            <span
              className="text-xl font-black"
              style={{ color: C.text, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
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
              background: "rgba(15, 21, 48, 0.55)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid ${C.borderStrong}`,
              borderRadius: 999,
              marginBottom: 12,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            ✦ New Hero ✦
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black mb-2"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              background: "linear-gradient(135deg, #7df0ff, #00e5ff, #7c5cff)",
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

          {/* Form card — invisible container, matching the login.
              No background, no border, no shadow, no rounded panel.
              Just a layout wrapper. Each input field below carries its
              own dark glass background so they stay legible against the
              live scene. Net effect: form fields float over the
              backdrop with no enclosing surface. */}
          <motion.div
            className="p-7 sm:p-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
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
                    background: "rgba(255, 95, 179, 0.15)",
                    border: "1px solid rgba(255, 95, 179, 0.5)",
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
                      background: "rgba(8, 10, 22, 0.5)",
                      border: `1px solid ${C.border}`,
                      fontFamily: "Nunito, sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.goldLight;
                      e.currentTarget.style.boxShadow = "0 0 22px rgba(124, 92, 255, 0.25)";
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
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: C.textMuted, lineHeight: 0 }}
                  >
                    <CyberIconOrEmoji emoji="✉️" size={18} accent="cyan" glow={false} />
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
                      background: "rgba(8, 10, 22, 0.5)",
                      border: `1px solid ${C.border}`,
                      fontFamily: "Nunito, sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.goldLight;
                      e.currentTarget.style.boxShadow = "0 0 22px rgba(124, 92, 255, 0.25)";
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
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: C.textMuted, lineHeight: 0 }}
                  >
                    <CyberIconOrEmoji emoji="🔒" size={18} accent="cyan" glow={false} />
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
                      background: "rgba(8, 10, 22, 0.5)",
                      border: `1px solid ${C.border}`,
                      fontFamily: "Nunito, sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.goldLight;
                      e.currentTarget.style.boxShadow = "0 0 22px rgba(124, 92, 255, 0.25)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = C.border;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder="Create a password (min 8 characters)"
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
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
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
                <CyberIconOrEmoji emoji={b.icon} size={14} accent="cyan" glow={false} /> {b.label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE — empty layout spacer on lg+ so the form
          anchors to the left half. The unified backdrop layer above
          renders ParticleNetworkScene + HeroAtlas + ALGORITHMX label
          spanning both halves; this column just reserves space. */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative"
        aria-hidden
      >

        <style>{`
          @keyframes spIntroSpin {
            to { transform: rotate(360deg); }
          }
          @keyframes spCursorBlink {
            0%, 49% { opacity: 1; }
            50%, 100% { opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  );
}
