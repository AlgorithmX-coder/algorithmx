"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CastleGateScene } from "@/app/components/PixarScenes";

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
  ember: "#c4513a",
};
const GRAD = `linear-gradient(135deg, ${C.goldLight}, ${C.goldMid})`;

export default function PasswordPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/");
        router.refresh();
      } else {
        setError("Hmm, that doesn't unlock the gate. Try again?");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

      <CastleGateScene />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl p-8 text-center"
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
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-7">
          <motion.div
            animate={{ rotate: [0, 6, 0, -6, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: GRAD,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 12px 28px -8px rgba(255,120,40,0.55), 0 0 0 1px rgba(255,235,200,0.55) inset",
            }}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke={C.goldDark}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </motion.div>
          <span
            style={{
              fontSize: 26,
              fontWeight: 800,
              fontFamily: "Fredoka, Nunito, sans-serif",
              background: "linear-gradient(135deg, #fff5cc, #ffd58a, #ff9b4a)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            AlgorithmX
          </span>
        </div>

        {/* Castle key badge */}
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
            marginBottom: 14,
            fontFamily: "Fredoka, Nunito, sans-serif",
          }}
        >
          🔑 Gatekeeper
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
          Whisper the password
        </h1>
        <p style={{ color: C.textSoft, opacity: 0.92, marginBottom: 24, fontSize: 15 }}>
          The castle is still being built — only invited guests beyond this gate.
        </p>

        <form onSubmit={onSubmit} className="space-y-3">
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
              style={{ color: C.textMuted }}
            >
              ✦
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              autoComplete="current-password"
              className="w-full pl-11 pr-4 rounded-2xl font-medium transition-all duration-300 focus:outline-none"
              style={{
                height: 50,
                fontSize: 15,
                color: C.text,
                background: "rgba(20, 6, 12, 0.5)",
                border: `1px solid rgba(255, 220, 180, 0.22)`,
                textAlign: "center",
                letterSpacing: 2,
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

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="text-sm font-semibold p-3 rounded-2xl"
              style={{
                background: "rgba(196, 81, 58, 0.18)",
                border: `1px solid rgba(196, 81, 58, 0.5)`,
                color: "#f4a89a",
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading || !password}
            whileHover={!loading && password ? { y: -2, scale: 1.02 } : {}}
            whileTap={!loading && password ? { scale: 0.97 } : {}}
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
              cursor: loading || !password ? "not-allowed" : "pointer",
              opacity: loading || !password ? 0.55 : 1,
              boxShadow:
                "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
            }}
          >
            {loading ? "Unlocking..." : "Open the Gate"}
          </motion.button>
        </form>

        <p style={{ color: C.textMuted, fontSize: 12, marginTop: 28 }}>
          &copy; 2026 AlgorithmX Ltd.
        </p>
        <p style={{ marginTop: 6, fontSize: 12 }}>
          <a
            href="mailto:support@algorithmx.co.uk"
            className="transition hover:opacity-80"
            style={{ color: C.goldLight, textDecoration: "none", fontWeight: 600 }}
          >
            Need help? support@algorithmx.co.uk
          </a>
        </p>
      </motion.div>
    </div>
  );
}
