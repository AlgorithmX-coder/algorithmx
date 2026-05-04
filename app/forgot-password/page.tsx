"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { VoidPortalScene } from "@/app/components/CyberFutureScenes";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";

const C = {
  pageBg: "#080a16",
  card: "rgba(15, 21, 48, 0.78)",
  border: "rgba(0, 229, 255, 0.35)",
  borderStrong: "rgba(0, 229, 255, 0.6)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  textMuted: "rgba(125, 240, 255, 0.55)",
  goldLight: "#00e5ff",
  goldMid: "#7c5cff",
  goldDeep: "#3a7bff",
  goldDark: "#080a16",
  cream: "#e8edff",
};
const GRAD = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid})`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    try {
      await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success — the API never reveals whether the email
      // matched a real account, so we never reveal it either.  Prevents
      // user enumeration.
      setSubmitted(true);
    } catch {
      // Network failure: still show success (same anti-enumeration
      // posture). The retry happens via the email itself if it didn't
      // arrive.
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, ${C.pageBg} 70%, #04050d 100%)`,
        color: C.text,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800&display=swap');
        * { font-family: 'Nunito', sans-serif; }
      `}</style>

      <VoidPortalScene />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl p-8"
        style={{
          background: C.card,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${C.border}`,
          boxShadow:
            "0 30px 60px -20px rgba(8, 10, 22, 0.7), 0 0 40px rgba(124, 92, 255, 0.18), 0 0 0 1px rgba(0, 229, 255, 0.05) inset",
          position: "relative",
          zIndex: 10,
        }}
      >
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
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: C.borderStrong,
            borderRadius: 999,
            marginBottom: 12,
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
          }}
        >
          ✦ Beacon Lit ✦
        </div>

        <h1
          className="text-3xl font-black mb-2"
          style={{
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            background: "linear-gradient(135deg, #7df0ff, #00e5ff, #7c5cff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.01em",
          }}
        >
          Find your way back
        </h1>
        <p style={{ color: C.textSoft, opacity: 0.92, marginBottom: 24 }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl p-5"
            style={{
              background: "rgba(124, 200, 154, 0.16)",
              border: "1px solid rgba(124, 200, 154, 0.55)",
              color: "#a0ffb0",
            }}
          >
            <div className="font-bold mb-1">✓ Check your email</div>
            <div className="text-sm" style={{ color: C.textSoft, opacity: 0.9 }}>
              If an account exists for{" "}
              <span style={{ fontWeight: 700, color: C.goldLight }}>{email}</span>, a reset link is on the way.
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 rounded-2xl font-medium transition-all duration-300 focus:outline-none"
                  style={{
                    height: 50,
                    fontSize: 15,
                    color: C.text,
                    background: "rgba(8, 10, 22, 0.5)",
                    border: `1px solid rgba(0, 229, 255, 0.22)`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.goldLight;
                    e.currentTarget.style.boxShadow = "0 0 22px rgba(124, 92, 255, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.22)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold p-3 rounded-2xl"
                style={{
                  background: "rgba(255, 95, 179, 0.18)",
                  border: "1px solid rgba(255, 95, 179, 0.5)",
                  color: "#f4a89a",
                }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={loading ? {} : { y: -2, scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="w-full font-black rounded-full"
              style={{
                height: 50,
                background: GRAD,
                color: C.goldDark,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontSize: 16,
                border: "none",
                cursor: loading ? "wait" : "pointer",
                opacity: loading ? 0.7 : 1,
                // Was warm orange drop + warm cream inner highlight + warm
                // brown bottom rim. Pulled to cyan drop + cyan inner glint
                // + abyss bottom rim, matching every other cyber CTA.
                boxShadow:
                  "0 18px 36px -10px rgba(0, 229, 255, 0.65), 0 0 0 1px rgba(125, 240, 255, 0.55) inset, 0 -3px 0 rgba(8, 10, 22, 0.55) inset",
              }}
            >
              {loading ? "Sending…" : "Send Reset Link"}
            </motion.button>
          </form>
        )}

        <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>
          Remembered it?{" "}
          <a
            href="/login"
            className="font-bold transition hover:opacity-80"
            style={{ color: C.goldLight }}
          >
            Back to log in
          </a>
        </p>
      </motion.div>
    </div>
  );
}
