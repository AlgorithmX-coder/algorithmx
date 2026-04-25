"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const GRAD = "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)";

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
    // Stub — real reset flow lands when the auth backend supports it. For
    // now we just acknowledge the request so the UI surface is complete.
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg, #0c0b24, #1e1145 50%, #0d0a26)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md rounded-3xl p-8"
        style={{
          background: "rgba(15,10,40,0.85)",
          border: "1px solid rgba(139,92,246,0.3)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139,92,246,0.15)",
          backdropFilter: "blur(14px)",
        }}
      >
        <a href="/login" className="text-xs font-bold text-gray-400 hover:text-white transition mb-4 inline-block">
          ← Back to login
        </a>

        {!submitted ? (
          <>
            <h1 className="text-3xl font-black text-white mb-2">Reset your password</h1>
            <p className="text-gray-400 text-sm mb-6">
              Enter the email address linked to your account and we&apos;ll send you a reset link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-base">📧</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full pl-11 pr-4 rounded-2xl text-white placeholder-gray-500 font-medium transition-all duration-300 focus:outline-none"
                    style={{
                      height: 50,
                      fontSize: 15,
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 0 20px rgba(139,92,246,0.15)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#fca5a5" }}>
                  {error}
                </div>
              )}

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, boxShadow: "0 6px 30px rgba(139,92,246,0.5)" }}
                whileTap={{ scale: 0.98 }}
                className="w-full font-black text-white text-base rounded-2xl"
                style={{
                  height: 50,
                  background: GRAD,
                  boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
                }}
              >
                Send reset link
              </motion.button>
            </form>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="text-center py-4"
          >
            <div
              style={{
                width: 72,
                height: 72,
                margin: "0 auto 16px",
                borderRadius: "50%",
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(74,222,128,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                boxShadow: "0 0 30px rgba(74,222,128,0.4)",
              }}
            >
              ✓
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Check your inbox</h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              If <span className="text-white font-bold">{email}</span> is linked to an AlgorithmX account,
              you&apos;ll receive a password reset link in the next few minutes. Don&apos;t forget to check your
              spam folder.
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 rounded-2xl font-bold text-white text-sm"
              style={{ background: GRAD, boxShadow: "0 4px 20px rgba(139,92,246,0.3)" }}
            >
              Back to login
            </a>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
