"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import AuthBackdrop from "@/app/components/auth/AuthBackdrop";
import { AuthReactorScene, type AuthMachinePhase, type AuthMachineState } from "@/app/components/auth-reactor";
import AuthField from "@/app/components/auth/AuthField";
import AuthButton, { type AuthButtonState } from "@/app/components/auth/AuthButton";
import AuthTerminalPanel from "@/app/components/auth/AuthTerminalPanel";
import { useIsDesktop } from "@/app/components/auth/useIsDesktop";
import { ACCESS, ACCESS_FONT, ACCESS_GRAD, rgba } from "@/app/components/auth/accessTokens";
import { IconContact, IconCredentials, IconCheck, IconKey } from "@/app/components/auth/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const isDesktop = useIsDesktop(1200);
  const isTabletUp = useIsDesktop(768);
  const coreQuality = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  const reduced = !!useReducedMotion();

  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [focusField, setFocusField] = useState<AuthMachineState["focus"]>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "sent">("idle");

  const emailValid = EMAIL_RE.test(email);
  const emailInvalid = touched && email.length > 0 && !emailValid;
  const sent = phase === "sent";

  const portalEnergy = sent ? 1 : phase === "loading" ? 0.96 : emailValid ? 1 : 0;

  const machinePhase: AuthMachinePhase = sent
    ? "success"
    : phase === "loading"
      ? "submitting"
      : error
        ? "error"
        : emailValid
          ? "armed"
          : "idle";
  const machineState: AuthMachineState = {
    modulesOnline: sent ? 6 : emailValid ? 4 : 0,
    focus: focusField,
    phase: machinePhase,
    reducedMotion: reduced,
    quality: coreQuality,
  };

  const buttonState: AuthButtonState =
    phase === "loading" ? "loading" : sent ? "success" : emailValid ? "idle" : "disabled";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched(true);
    if (!emailValid) {
      setError("Enter a valid email address.");
      return;
    }
    setPhase("loading");
    try {
      // Always succeeds from the UI's point of view — the API never reveals
      // whether the email matched an account (anti-enumeration).
      await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* swallow — same posture; the email itself is the retry path */
    }
    setPhase("sent");
  };

  return (
    <div className="min-h-screen relative" style={{ background: ACCESS_GRAD.page, color: ACCESS.textBright, overflowX: "hidden" }}>
      <AuthBackdrop energy={portalEnergy} submitting={phase === "loading"} success={sent} />

      {!isDesktop && (
        <div className="absolute inset-0" style={{ zIndex: 0, pointerEvents: "none" }}>
          <AuthReactorScene state={machineState} />
        </div>
      )}

      <div
        className="relative mx-auto min-h-screen w-full items-center gap-8 px-6"
        style={{
          zIndex: 2,
          maxWidth: 1440,
          display: isDesktop ? "grid" : "block",
          gridTemplateColumns: isDesktop ? "minmax(0, 460px) minmax(0, 1fr)" : undefined,
          gridTemplateRows: isDesktop ? "minmax(100vh, auto)" : undefined,
        }}
      >
        <div className="flex flex-col justify-center py-14">
          <div className="w-full max-w-md">
            <div className="mb-9">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 10, background: ACCESS_GRAD.brand, boxShadow: `0 0 18px ${rgba(ACCESS.cyan, 0.3)}` }}>
                  <span style={{ color: "#06080f", fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 14 }}>AX</span>
                </div>
                <span style={{ color: ACCESS.textBright, fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 19, letterSpacing: "-0.01em" }}>
                  Algorithm<span style={{ background: ACCESS_GRAD.brand, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>X</span>
                </span>
              </Link>
            </div>

            <AuthTerminalPanel>
              <h1 className="mb-2" style={{ fontFamily: ACCESS_FONT.display, fontSize: "clamp(1.9rem, 2.6vw, 2.3rem)", fontWeight: 800, color: ACCESS.textBright, letterSpacing: "-0.02em", lineHeight: 1.08 }}>
                Reset your password
              </h1>
              <p className="mb-7" style={{ color: ACCESS.textSoft, fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
                Enter your email and we&apos;ll send a secure link to set a new one.
              </p>

              {sent ? (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ padding: "16px", borderRadius: 12, background: rgba(ACCESS.cyan, 0.08), border: `1px solid ${rgba(ACCESS.cyan, 0.4)}` }}
                >
                  <div className="flex items-center gap-2 mb-1.5" style={{ fontWeight: 800, color: ACCESS.textBright }}>
                    <IconCheck size={16} /> Check your email
                  </div>
                  <div style={{ fontSize: 13.5, color: ACCESS.textSoft, lineHeight: 1.55 }}>
                    If an account exists for <span style={{ color: ACCESS.cyanSoft, fontWeight: 700 }}>{email}</span>, a reset link is on its way.
                  </div>
                </motion.div>
              ) : (
                <>
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        key="err"
                        role="alert"
                        aria-live="polite"
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4"
                        style={{ padding: "12px 14px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, background: rgba(ACCESS.warn, 0.1), border: `1px solid ${rgba(ACCESS.warn, 0.5)}`, color: ACCESS.warnSoft }}
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-1" noValidate>
                    <AuthField
                      id="forgot-email"
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      onFocus={() => setFocusField("email")}
                      onBlur={() => {
                        setTouched(true);
                        setFocusField(null);
                      }}
                      state={emailInvalid ? "invalid" : emailValid ? "valid" : "idle"}
                      error={emailInvalid ? "That email doesn't look right." : null}
                      icon={<IconContact size={18} />}
                      autoComplete="email"
                      inputMode="email"
                      placeholder="parent@example.com"
                      required
                    />
                    <div className="pt-1">
                      <AuthButton
                        state={buttonState}
                        idleLabel="Send reset link"
                        loadingLabel="Sending…"
                        successLabel="Sent"
                        disabledHint={!emailValid ? "Enter your email to continue." : undefined}
                      />
                    </div>
                  </form>
                </>
              )}

              <p className="text-center mt-5" style={{ color: ACCESS.textSoft, fontSize: 13.5, fontWeight: 500 }}>
                Remembered it?{" "}
                <a href="/login" style={{ color: ACCESS.cyan, fontWeight: 700 }} className="transition hover:opacity-80">Log in</a>
              </p>
            </AuthTerminalPanel>

            <p className="text-center mt-8" style={{ fontFamily: ACCESS_FONT.mono, fontSize: 11, letterSpacing: 2, color: ACCESS.textMuted }}>
              Six streams. One key.
            </p>
            <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
              {[
                { icon: <IconCredentials size={14} />, label: "ENCRYPTED" },
                { icon: <IconKey size={14} />, label: "SECURE RESET" },
              ].map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1.5" style={{ color: ACCESS.textMuted, fontSize: 10.5, fontWeight: 700, fontFamily: ACCESS_FONT.mono, letterSpacing: 1.4 }}>
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {isDesktop && (
          <div className="relative self-stretch">
            <div className="absolute inset-0">
              <AuthReactorScene state={machineState} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
