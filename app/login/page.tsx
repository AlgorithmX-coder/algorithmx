"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { CyberPanelBackdrop } from "@/app/components/CyberFutureScenes";
import { CYBER_PALETTE, CYBER_GRAD, CYBER_SHADOW } from "@/app/components/scene/cyberTokens";

// 3D wireframe globe — code-split so the Three.js bundle only ships when
// the user actually loads /login (not on every other route).
const CyberGlobe = dynamic(() => import("@/app/components/CyberGlobe"), {
  ssr: false,
});

const C = CYBER_PALETTE;
const GRAD = CYBER_GRAD.hero;

/* ─── PARTICLE NODES (left side decoration) ──────────────────
 * Pulsing cyan/violet/pink dots floating around the form column.
 * Replaces the warm FloatingOrbs from the Pixar dusk version. */
function CyberParticles() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {[
        { size: 8,  top: "8%",  left: "6%",   color: C.cyan,    dur: 9,  delay: 0 },
        { size: 6,  top: "18%", right: "10%", color: C.cosmic,  dur: 11, delay: 1 },
        { size: 10, top: "35%", left: "3%",   color: C.cyan,    dur: 13, delay: 2 },
        { size: 5,  top: "52%", right: "5%",  color: C.neon,    dur: 8,  delay: 0.5 },
        { size: 7,  top: "70%", left: "12%",  color: C.cosmic,  dur: 10, delay: 3 },
        { size: 9,  top: "82%", right: "8%",  color: C.cyan,    dur: 12, delay: 1.5 },
      ].map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          animate={{ y: [0, -18, 0], scale: [1, 1.15, 1], opacity: [0.5, 0.95, 0.5] }}
          transition={{ duration: o.dur, ease: "easeInOut", repeat: Infinity, delay: o.delay }}
          style={{
            width: o.size,
            height: o.size,
            top: o.top,
            left: "left" in o ? o.left : undefined,
            right: "right" in o ? o.right : undefined,
            backgroundColor: o.color,
            boxShadow: `0 0 ${o.size * 5}px ${o.color}, 0 0 ${o.size * 9}px ${o.color}99`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── FLOATING SECURITY GLYPHS (right panel) ────────────────
 * Same set of icons as the Pixar version, but with cyan glow and a
 * monospace data-tag rendered next to a few of them — gives the
 * right panel a "cyber lab readout" feel. */
function CyberFloatingIcons() {
  const icons = [
    { emoji: "🔑", top: "15%", left: "25%", delay: 0,   dur: 7,   tag: "AUTH" },
    { emoji: "⭐", top: "28%", right: "18%", delay: 1.5, dur: 6 },
    { emoji: "🔒", top: "55%", left: "18%", delay: 0.5, dur: 8,   tag: "ENC" },
    { emoji: "🛡️", top: "70%", right: "22%", delay: 2,   dur: 6.5 },
    { emoji: "✨", top: "42%", left: "65%", delay: 3,   dur: 9 },
    { emoji: "🔐", top: "88%", left: "40%", delay: 1,   dur: 7.5, tag: "VAULT" },
  ];
  return (
    <>
      {icons.map((ic, i) => (
        <motion.div
          key={i}
          className="absolute"
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: ic.dur, ease: "easeInOut", repeat: Infinity, delay: ic.delay }}
          style={{
            top: ic.top,
            left: "left" in ic ? ic.left : undefined,
            right: "right" in ic ? ic.right : undefined,
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: 0.85,
            filter: `drop-shadow(0 0 14px ${C.cyan}aa) drop-shadow(0 0 28px ${C.cosmic}55)`,
          }}
        >
          <span style={{ fontSize: 24 }}>{ic.emoji}</span>
          {ic.tag && (
            <span
              style={{
                fontSize: 9,
                letterSpacing: 2,
                fontWeight: 800,
                fontFamily:
                  "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                color: C.cyan,
                padding: "2px 6px",
                background: "rgba(8, 10, 22, 0.7)",
                border: `1px solid ${C.cyan}77`,
                borderRadius: 4,
                textShadow: `0 0 6px ${C.cyan}`,
              }}
            >
              {ic.tag}
            </span>
          )}
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
      className="min-h-screen flex relative"
      style={{
        background: CYBER_GRAD.page,
        color: C.textBright,
      }}
    >
      <CyberParticles />

      {/* ─── UNIFIED BACKDROP — extends across the entire viewport ───
          Was a split-screen with the live globe only on the right.
          User flagged that the two sides still felt like separate
          screens; now the rotating wireframe globe + cyan/cosmic halo
          + floating glyphs + ALGORITHMX terminal label all render in
          a single full-viewport layer behind everything. The form
          floats on top, anchored to the left half. */}
      <div className="absolute inset-0" style={{ zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <CyberPanelBackdrop />

        {/* Live R3F globe — fills the whole viewport behind the form */}
        <div className="absolute inset-0">
          <CyberGlobe />
        </div>

        {/* Floating security glyphs spread across the whole viewport,
            biased to the right so they pool around the globe centre. */}
        <CyberFloatingIcons />

        {/* ALGORITHMX label + terminal prompt — anchored just below
            the centre, biased toward the right half so it sits behind
            the globe and beside the form, not under it. */}
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
              color: C.textBright,
              textShadow: `0 0 22px ${C.cyan}aa, 0 0 44px ${C.cosmic}66`,
              letterSpacing: 6,
            }}
          >
            ALGORITHMX
          </span>
          <div
            style={{
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              fontSize: 12,
              color: C.cyan,
              marginTop: 18,
              letterSpacing: 1,
              textShadow: `0 0 8px ${C.cyan}`,
            }}
          >
            <span style={{ color: C.cosmic }}>$</span> ax_login --auth
            <span style={{ marginLeft: 6, animation: "loginCursorBlink 1s steps(1) infinite" }}>▮</span>
          </div>
        </motion.div>
      </div>

      {/* ─── LEFT SIDE: FORM ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative" style={{ zIndex: 3 }}>
        <div className="w-full max-w-md relative" style={{ zIndex: 2 }}>
          {/* Logo */}
          <a href="/" className="inline-flex items-center gap-2.5 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: GRAD,
                boxShadow: CYBER_SHADOW.buttonGlow,
              }}
            >
              <span
                className="text-sm font-black"
                style={{ color: C.abyss, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                AX
              </span>
            </div>
            <span
              className="text-xl font-black"
              style={{ color: C.textBright, fontFamily: "'Space Grotesk', system-ui, sans-serif", letterSpacing: "-0.01em" }}
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
              color: C.cyan,
              fontWeight: 800,
              textTransform: "uppercase",
              padding: "5px 16px",
              background: "rgba(8, 10, 22, 0.7)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: `1px solid ${C.cyan}66`,
              borderRadius: 999,
              marginBottom: 14,
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              boxShadow: `0 0 16px ${C.cyan}33`,
              textShadow: `0 0 8px ${C.cyan}`,
            }}
          >
            ◇ ACCESS TERMINAL ◇
          </div>
          <h1
            className="text-3xl sm:text-4xl font-black mb-2"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              background: GRAD,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              filter: `drop-shadow(0 0 22px ${C.cyan}66)`,
              animation: "loginHoloShift 3.6s ease-in-out infinite",
            }}
          >
            Welcome back, hero.
          </h1>
          <p className="mb-8 text-base" style={{ color: C.textSoft }}>
            Authenticate to continue your cybersecurity training.
          </p>

          {/* Form card — invisible container.
              No background, no border, no shadow, no top-edge
              gradient strip, no padding box visible. Just a layout
              wrapper. The form fields below carry their own dark
              backgrounds so they remain legible against the live
              globe scene. Net effect: NO card. Form fields literally
              float in the scene. */}
          <motion.div
            className="p-7 sm:p-8 relative"
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
                    background: "rgba(255, 85, 119, 0.12)",
                    border: `1px solid ${C.error}88`,
                    color: "#ff8aa3",
                    backdropFilter: "blur(8px)",
                    boxShadow: `0 0 18px ${C.error}33`,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  className="block text-xs font-bold mb-2"
                  style={{ color: C.cyan, letterSpacing: 2, textTransform: "uppercase", fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace" }}
                >
                  ✉  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-4 pr-4 rounded-xl font-medium transition-all duration-300 focus:outline-none"
                  style={{
                    height: 50,
                    fontSize: 15,
                    color: C.textBright,
                    background: "rgba(8, 10, 22, 0.55)",
                    border: `1px solid ${C.cyan}33`,
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.cyan;
                    e.currentTarget.style.boxShadow = `0 0 22px ${C.cyan}55, 0 0 0 1px ${C.cyan} inset`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = `${C.cyan}33`;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="hero@cyberheroes.com"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-xs font-bold"
                    style={{ color: C.cyan, letterSpacing: 2, textTransform: "uppercase", fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace" }}
                  >
                    🔒  Password
                  </label>
                  <a
                    href="/forgot-password"
                    className="text-xs font-bold transition hover:opacity-80"
                    style={{ color: C.cosmic, textShadow: `0 0 8px ${C.cosmic}55` }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-12 rounded-xl font-medium transition-all duration-300 focus:outline-none"
                    style={{
                      height: 50,
                      fontSize: 15,
                      color: C.textBright,
                      background: "rgba(8, 10, 22, 0.55)",
                      border: `1px solid ${C.cyan}33`,
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.cyan;
                      e.currentTarget.style.boxShadow = `0 0 22px ${C.cyan}55, 0 0 0 1px ${C.cyan} inset`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = `${C.cyan}33`;
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

              {/* Submit — backlit cyan/violet pill */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 320, damping: 20 }}
                className="w-full font-black text-base rounded-full transition-colors duration-300 disabled:opacity-50 relative overflow-hidden"
                style={{
                  height: 52,
                  background: GRAD,
                  color: C.abyss,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  boxShadow: CYBER_SHADOW.buttonGlow,
                  border: "none",
                }}
              >
                <span style={{ position: "relative", zIndex: 2 }}>
                  {loading ? "Authenticating..." : "Log In →"}
                </span>
                {/* Shine sweep */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                    animation: "loginButtonShine 3s ease-in-out infinite",
                  }}
                />
              </motion.button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="font-bold transition hover:opacity-80"
                style={{ color: C.cyan, textShadow: `0 0 8px ${C.cyan}55` }}
              >
                Sign Up
              </a>
            </p>
          </motion.div>

          {/* Trust badges — now in monospace cyber-readout style */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            {[
              { icon: "🔒", label: "ENC: 256-BIT" },
              { icon: "👨‍👩‍👧‍👦", label: "FAMILY SAFE" },
              { icon: "🛡️", label: "COPPA COMPLIANT" },
            ].map((b, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 + i * 0.1 }}
                className="text-xs flex items-center gap-1.5"
                style={{
                  color: C.textMuted,
                  fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                  letterSpacing: 1,
                }}
              >
                <span>{b.icon}</span> {b.label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE — empty spacer on lg+ so the form anchors to
          the left half. The unified backdrop layer above already
          renders the globe / icons / ALGORITHMX label spanning both
          halves; this column just reserves layout space. */}
      <div
        className="hidden lg:flex flex-1 items-center justify-center relative"
        aria-hidden
      />

      <style>{`
        @keyframes loginCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        @keyframes loginHoloShift {
          0%,100% { filter: drop-shadow(0 0 22px ${C.cyan}66); }
          50%     { filter: drop-shadow(0 0 30px ${C.cosmic}88); }
        }
        @keyframes loginButtonShine {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
