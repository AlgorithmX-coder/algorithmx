"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { VoidPortalScene } from "@/app/components/CyberFutureScenes";

const C = {
  pageBg: "#080a16",
  card: "rgba(15, 21, 48, 0.78)",
  border: "rgba(0, 229, 255, 0.35)",
  borderStrong: "rgba(0, 229, 255, 0.6)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  textMuted: "rgba(125, 240, 255, 0.55)",
  cyan: "#00e5ff",
  cosmic: "#7c5cff",
  abyss: "#080a16",
};
const GRAD = `linear-gradient(135deg, ${C.cyan}, ${C.cosmic})`;

function ResetPasswordInner() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Token missing → don't even let them try.
  if (!token) {
    return (
      <Card>
        <Heading>Invalid link</Heading>
        <p style={{ color: C.textSoft, marginBottom: 18 }}>
          This password-reset link looks broken. Try requesting a new one.
        </p>
        <a
          href="/forgot-password"
          style={{
            display: "inline-block",
            background: GRAD,
            color: C.abyss,
            fontWeight: 900,
            padding: "12px 26px",
            borderRadius: 999,
            textDecoration: "none",
            fontSize: 14,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Request new link
        </a>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <Heading>Password updated</Heading>
        <p style={{ color: C.textSoft, marginBottom: 22 }}>
          You can now log in with your new password.
        </p>
        <a
          href="/login"
          style={{
            display: "inline-block",
            background: GRAD,
            color: C.abyss,
            fontWeight: 900,
            padding: "12px 26px",
            borderRadius: 999,
            textDecoration: "none",
            fontSize: 14,
            letterSpacing: 1,
            textTransform: "uppercase",
          }}
        >
          Back to login
        </a>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not reset password.");
        return;
      }
      setDone(true);
      // After 2.5s redirect to /login automatically (the explicit
      // button is also there for users who want to navigate manually).
      window.setTimeout(() => router.push("/login"), 2500);
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <Heading>Choose a new password</Heading>
      <p style={{ color: C.textSoft, marginBottom: 22, lineHeight: 1.55 }}>
        Pick something at least 8 characters long. Mix of letters, numbers, and
        symbols is best.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label="New password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          placeholder="••••••••"
        />
        <Field
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
          placeholder="••••••••"
        />

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
            color: C.abyss,
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            fontSize: 16,
            border: "none",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow:
              "0 18px 36px -10px rgba(0, 229, 255, 0.65), 0 0 0 1px rgba(125, 240, 255, 0.55) inset, 0 -3px 0 rgba(8, 10, 22, 0.55) inset",
          }}
        >
          {loading ? "Saving…" : "Set new password"}
        </motion.button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: C.textMuted }}>
        Cancelled this?{" "}
        <a
          href="/login"
          className="font-bold transition hover:opacity-80"
          style={{ color: C.cyan }}
        >
          Back to log in
        </a>
      </p>
    </Card>
  );
}

export default function ResetPasswordPage() {
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

      <Suspense fallback={null}>
        <ResetPasswordInner />
      </Suspense>
    </div>
  );
}

/* ─── Local presentational helpers ────────────────────────────────── */

function Card({ children }: { children: React.ReactNode }) {
  return (
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
      {children}
    </motion.div>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div
        style={{
          display: "inline-block",
          fontSize: 11,
          letterSpacing: 5,
          color: C.cyan,
          fontWeight: 800,
          textTransform: "uppercase",
          padding: "5px 16px",
          background: "rgba(15, 21, 48, 0.55)",
          border: `1px solid ${C.borderStrong}`,
          borderRadius: 999,
          marginBottom: 12,
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
        }}
      >
        ◇ Reset Password ◇
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
        {children}
      </h1>
    </>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-bold mb-2" style={{ color: C.textSoft }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full pl-4 pr-4 rounded-2xl font-medium transition-all duration-300 focus:outline-none"
        style={{
          height: 50,
          fontSize: 15,
          color: C.text,
          background: "rgba(8, 10, 22, 0.5)",
          border: `1px solid rgba(0, 229, 255, 0.22)`,
          width: "100%",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = C.cyan;
          e.currentTarget.style.boxShadow = "0 0 22px rgba(124, 92, 255, 0.25)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(0, 229, 255, 0.22)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}
