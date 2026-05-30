"use client";

/**
 * Inline "Join waitlist" mini-button for COMING_SOON product cards on /hub.
 *
 * Three states: idle → entering email → success. The email collection is
 * inline (no modal) so the card pattern stays tight. POSTs to /api/waitlist
 * which expects { email, productSlug, source }.
 *
 * The full WaitlistForm component (used on marketing pages) is heavier and
 * accent-themed per product — this is the family-hub variant: compact,
 * single-line, cyber-styled.
 */

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CYBER_PALETTE } from "@/app/components/scene/cyberTokens";

const C = CYBER_PALETTE;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistMiniButton({
  productSlug,
}: {
  productSlug: string;
}) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"closed" | "open" | "loading" | "success" | "error">("closed");
  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setErrMsg("Please enter a valid email.");
      setPhase("error");
      return;
    }
    setPhase("loading");
    setErrMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productSlug, source: "hub" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Server error");
      }
      setPhase("success");
    } catch (err: unknown) {
      setErrMsg(err instanceof Error ? err.message : "Something went wrong.");
      setPhase("error");
    }
  };

  if (phase === "success") {
    return (
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 10,
          background: `${C.lime}1a`,
          border: `1px solid ${C.lime}66`,
          color: C.lime,
          fontFamily: "'DM Sans', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 13,
        }}
        role="status"
        aria-live="polite"
      >
        <span aria-hidden>✓</span>
        You&apos;re on the list.
      </motion.div>
    );
  }

  if (phase === "closed") {
    return (
      <button
        type="button"
        onClick={() => setPhase("open")}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 16px",
          borderRadius: 10,
          background: "rgba(8, 10, 22, 0.55)",
          border: `1px solid ${C.cosmicSoft}66`,
          color: C.cosmicSoft,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 13.5,
          letterSpacing: "0.01em",
          cursor: "pointer",
          transition: "border-color 200ms ease, color 200ms ease",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = C.cosmic)}
        onBlur={(e) => (e.currentTarget.style.borderColor = `${C.cosmicSoft}66`)}
      >
        Join waitlist →
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}
      noValidate
    >
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (phase === "error") setPhase("open");
          }}
          placeholder="parent@email.com"
          aria-label="Email for waitlist"
          required
          style={{
            flex: 1,
            minWidth: 0,
            padding: "10px 12px",
            borderRadius: 10,
            background: "rgba(8, 10, 22, 0.7)",
            border: `1px solid ${C.cyan}55`,
            color: C.textBright,
            fontFamily: "'DM Sans', system-ui, sans-serif",
            fontSize: 13,
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={phase === "loading"}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: C.cyan,
            color: C.abyss,
            border: "none",
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 13,
            cursor: phase === "loading" ? "not-allowed" : "pointer",
            opacity: phase === "loading" ? 0.7 : 1,
            boxShadow: `0 0 14px ${C.cyan}66`,
          }}
        >
          {phase === "loading" ? "…" : "Notify me"}
        </button>
      </div>
      <AnimatePresence>
        {phase === "error" && errMsg && (
          <motion.span
            key="err"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            role="alert"
            style={{
              fontSize: 11.5,
              color: C.amber,
              fontFamily: "'DM Sans', system-ui, sans-serif",
              fontWeight: 600,
            }}
          >
            {errMsg}
          </motion.span>
        )}
      </AnimatePresence>
    </form>
  );
}
