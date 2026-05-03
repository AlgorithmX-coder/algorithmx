"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * Inline email-capture form for "Coming Soon" course pages.
 *
 * Replaces the previous "Join the Waitlist" buttons that misleadingly
 * pointed to the full /signup form. This form takes only an email +
 * the course slug, POSTs to /api/waitlist, and shows a success state.
 *
 * Pass `courseSlug` ('cyberexplorers' | 'cyberstart' | 'cyberstart-pro')
 * and `accent` (CSS color) to match the host page's palette.
 */
export default function WaitlistForm({
  courseSlug,
  accent,
  accentSoft,
  buttonGradient,
  buttonShadow,
  source,
}: {
  courseSlug: "cyberexplorers" | "cyberstart" | "cyberstart-pro";
  accent: string;
  accentSoft: string;
  buttonGradient: string;
  buttonShadow: string;
  source?: string;
}) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, courseSlug, source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Server error");
      }
      setState("success");
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Something went wrong. Try again?",
      );
    }
  };

  if (state === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="inline-flex items-center gap-3 rounded-2xl"
        style={{
          padding: "14px 22px",
          background: `${accent}18`,
          border: `1px solid ${accent}55`,
          color: accentSoft,
          fontWeight: 800,
          fontSize: 15,
          letterSpacing: "0.01em",
          boxShadow: `0 0 28px ${accent}22`,
        }}
      >
        <span style={{ fontSize: 20 }}>✓</span>
        You&rsquo;re on the list. We&rsquo;ll email you when it launches.
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col sm:flex-row items-stretch gap-3 max-w-[440px] w-full mx-auto"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (state === "error") setState("idle");
        }}
        placeholder="your@email.com"
        aria-label="Email address for waitlist"
        className="flex-1 rounded-2xl px-5 transition focus:outline-none"
        style={{
          height: 52,
          fontSize: 15,
          fontWeight: 600,
          color: "#e8edff",
          background: "rgba(8, 10, 22, 0.78)",
          border: `1.5px solid ${accent}55`,
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = accent;
          e.currentTarget.style.boxShadow = `0 0 22px ${accent}55`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = `${accent}55`;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      <motion.button
        type="submit"
        disabled={state === "loading"}
        whileHover={{ scale: state === "loading" ? 1 : 1.04 }}
        whileTap={{ scale: state === "loading" ? 1 : 0.96 }}
        className="rounded-2xl font-black"
        style={{
          height: 52,
          padding: "0 24px",
          fontSize: 15,
          color: "#0a0e22",
          background: buttonGradient,
          boxShadow: buttonShadow,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          border: "none",
          cursor: state === "loading" ? "wait" : "pointer",
          opacity: state === "loading" ? 0.7 : 1,
          whiteSpace: "nowrap",
        }}
      >
        {state === "loading" ? "Adding…" : "Notify Me 🚀"}
      </motion.button>

      {state === "error" && (
        <p
          className="sm:w-full"
          style={{ color: "#ff8aa3", fontSize: 13, fontWeight: 700, marginTop: 4 }}
        >
          {errorMsg}
        </p>
      )}
    </form>
  );
}
