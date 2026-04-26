"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LighthouseScene } from "@/app/components/PixarScenes";

const C = {
  pageBg: "#1a0612",
  card: "rgba(40, 18, 38, 0.78)",
  border: "rgba(255, 220, 180, 0.35)",
  borderStrong: "rgba(255, 220, 180, 0.6)",
  text: "#fff7e6",
  textSoft: "#ffe9c8",
  textMuted: "rgba(255, 233, 200, 0.55)",
  goldLight: "#ffd58a",
  goldMid: "#ff9b4a",
  goldDeep: "#d4733a",
  goldDark: "#3a1a06",
  cream: "#fff7e6",
};
const GRAD = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid})`;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: `radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, #2a0d2e 35%, ${C.pageBg} 70%, #0a0410 100%)`,
        color: C.text,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka:wght@500;600;700;800&display=swap');
        * { font-family: 'Nunito', sans-serif; }
      `}</style>

      <LighthouseScene />

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
            "0 30px 60px -20px rgba(20, 6, 12, 0.7), 0 0 40px rgba(255, 178, 110, 0.18), 0 0 0 1px rgba(255, 220, 180, 0.05) inset",
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
            background: "rgba(40, 18, 38, 0.55)",
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: C.borderStrong,
            borderRadius: 999,
            marginBottom: 12,
            fontFamily: "Fredoka, Nunito, sans-serif",
          }}
        >
          ✦ Beacon Lit ✦
        </div>

        <h1
          className="text-3xl font-black mb-2"
          style={{
            fontFamily: "Fredoka, Nunito, sans-serif",
            background: "linear-gradient(135deg, #fff5cc, #ffd58a, #ff9b4a)",
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
              color: "#a8e3bb",
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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
                  style={{ color: C.textMuted }}
                >
                  ✉️
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
                    background: "rgba(20, 6, 12, 0.5)",
                    border: `1px solid rgba(255, 220, 180, 0.22)`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.goldLight;
                    e.currentTarget.style.boxShadow = "0 0 22px rgba(255, 200, 110, 0.25)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255, 220, 180, 0.22)";
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
                  background: "rgba(196, 81, 58, 0.18)",
                  border: "1px solid rgba(196, 81, 58, 0.5)",
                  color: "#f4a89a",
                }}
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 320, damping: 20 }}
              className="w-full font-black rounded-full"
              style={{
                height: 50,
                background: GRAD,
                color: C.goldDark,
                fontFamily: "Fredoka, Nunito, sans-serif",
                letterSpacing: 0.5,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                boxShadow:
                  "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
              }}
            >
              Send Reset Link
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
