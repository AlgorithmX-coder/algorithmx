"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import AuthBackdrop from "@/app/components/auth/AuthBackdrop";
import { AuthReactorScene, type AuthMachinePhase, type AuthMachineState } from "@/app/components/auth-reactor";
import AuthField from "@/app/components/auth/AuthField";
import AuthButton, { type AuthButtonState } from "@/app/components/auth/AuthButton";
import AuthTerminalPanel from "@/app/components/auth/AuthTerminalPanel";
import { useIsDesktop } from "@/app/components/auth/useIsDesktop";
import { ACCESS, ACCESS_FONT, ACCESS_GRAD, rgba } from "@/app/components/auth/accessTokens";
import { IconCredentials, IconCheck, IconKey, IconEye, IconEyeOff } from "@/app/components/auth/icons";

/* Password-rule chip — matches the signup form so the rules stay consistent. */
function RuleChip({ pass, label }: { pass: boolean; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 8,
        fontSize: 10.5,
        fontWeight: 700,
        fontFamily: ACCESS_FONT.mono,
        background: pass ? rgba(ACCESS.cyan, 0.1) : "transparent",
        border: `1px solid ${pass ? rgba(ACCESS.cyan, 0.45) : ACCESS.line}`,
        color: pass ? ACCESS.cyanSoft : ACCESS.textMuted,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        transition: "background 240ms ease, border-color 240ms ease, color 240ms ease",
      }}
    >
      {pass ? <IconCheck size={12} /> : <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: ACCESS.textMuted }} />}
      <span>{label}</span>
    </span>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const isDesktop = useIsDesktop(1200);
  const isTabletUp = useIsDesktop(768);
  const coreQuality = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  const reduced = !!useReducedMotion();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<{ password?: boolean; confirm?: boolean }>({});
  const [focusField, setFocusField] = useState<AuthMachineState["focus"]>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  const ruleLength = password.length >= 8;
  const ruleUpper = /[A-Z]/.test(password);
  const ruleSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordOk = ruleLength && ruleUpper && ruleSpecial;
  const confirmOk = confirm.length > 0 && password === confirm;
  const allReady = passwordOk && confirmOk;
  const done = phase === "done";
  const noToken = !token;

  const portalEnergy = done ? 1 : phase === "loading" ? 0.96 : [passwordOk, confirmOk].filter(Boolean).length / 2;

  const machinePhase: AuthMachinePhase = done
    ? "success"
    : phase === "loading"
      ? "submitting"
      : error || noToken
        ? "error"
        : allReady
          ? "armed"
          : "idle";
  const machineState: AuthMachineState = {
    modulesOnline: done ? 6 : Math.round(([passwordOk, confirmOk].filter(Boolean).length / 2) * 6),
    focus: focusField,
    phase: machinePhase,
    reducedMotion: reduced,
    quality: coreQuality,
  };

  const buttonState: AuthButtonState =
    phase === "loading" ? "loading" : done ? "success" : allReady ? "idle" : "disabled";

  const missingHint = !passwordOk ? "Choose a stronger password." : !confirmOk ? "Confirm your password." : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ password: true, confirm: true });
    if (!passwordOk) {
      setError("Password needs 8+ characters, a capital and a special character.");
      return;
    }
    if (!confirmOk) {
      setError("Those passwords don't match.");
      return;
    }
    setPhase("loading");
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not reset your password. Try requesting a new link.");
        setPhase("idle");
        return;
      }
      setPhase("done");
      window.setTimeout(() => router.push("/login?reset=1"), 2200);
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setPhase("idle");
    }
  };

  const eyeBtn = (shown: boolean, toggle: () => void, label: string) => (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: "transparent", border: "none", color: ACCESS.textSoft, cursor: "pointer" }}
    >
      {shown ? <IconEyeOff size={18} /> : <IconEye size={18} />}
    </button>
  );

  return (
    <div className="min-h-screen relative" style={{ background: ACCESS_GRAD.page, color: ACCESS.textBright, overflowX: "hidden" }}>
      <AuthBackdrop energy={portalEnergy} submitting={phase === "loading"} success={done} />

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
              {noToken ? (
                <>
                  <h1 className="mb-2" style={{ fontFamily: ACCESS_FONT.display, fontSize: "clamp(1.7rem, 2.4vw, 2.1rem)", fontWeight: 800, color: ACCESS.textBright, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                    Link expired
                  </h1>
                  <p className="mb-6" style={{ color: ACCESS.textSoft, fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
                    This reset link is broken or has expired. Request a fresh one and we&apos;ll send it over.
                  </p>
                  <a
                    href="/forgot-password"
                    className="inline-flex items-center justify-center w-full transition hover:opacity-90"
                    style={{ height: 54, borderRadius: 12, background: ACCESS_GRAD.executeArmed, color: "#06080f", fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 14, letterSpacing: 2, textTransform: "uppercase", gap: 10 }}
                  >
                    <IconKey size={16} /> Request a new link
                  </a>
                </>
              ) : done ? (
                <>
                  <h1 className="mb-2" style={{ fontFamily: ACCESS_FONT.display, fontSize: "clamp(1.9rem, 2.6vw, 2.3rem)", fontWeight: 800, color: ACCESS.textBright, letterSpacing: "-0.02em", lineHeight: 1.08 }}>
                    Password updated
                  </h1>
                  <motion.div
                    role="status"
                    aria-live="polite"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ marginTop: 14, padding: "16px", borderRadius: 12, background: rgba(ACCESS.cyan, 0.08), border: `1px solid ${rgba(ACCESS.cyan, 0.4)}` }}
                  >
                    <div className="flex items-center gap-2 mb-1.5" style={{ fontWeight: 800, color: ACCESS.textBright }}>
                      <IconCheck size={16} /> You&apos;re all set
                    </div>
                    <div style={{ fontSize: 13.5, color: ACCESS.textSoft, lineHeight: 1.55 }}>
                      Taking you to log in with your new password…
                    </div>
                  </motion.div>
                </>
              ) : (
                <>
                  <h1 className="mb-2" style={{ fontFamily: ACCESS_FONT.display, fontSize: "clamp(1.9rem, 2.6vw, 2.3rem)", fontWeight: 800, color: ACCESS.textBright, letterSpacing: "-0.02em", lineHeight: 1.08 }}>
                    Choose a new password
                  </h1>
                  <p className="mb-7" style={{ color: ACCESS.textSoft, fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
                    Make it strong — this protects your family&apos;s account.
                  </p>

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
                    <div>
                      <AuthField
                        id="reset-password"
                        label="New password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={setPassword}
                        onFocus={() => setFocusField("password")}
                        onBlur={() => {
                          setTouched((t) => ({ ...t, password: true }));
                          setFocusField(null);
                        }}
                        state={touched.password && password.length > 0 && !passwordOk ? "invalid" : passwordOk ? "valid" : "idle"}
                        error={null}
                        autoComplete="new-password"
                        placeholder="Create a strong password"
                        rightSlot={eyeBtn(showPassword, () => setShowPassword((v) => !v), showPassword ? "Hide password" : "Show password")}
                        required
                      />
                      <div className="-mt-2 mb-3 flex flex-wrap gap-2" aria-label="Password requirements">
                        <RuleChip pass={ruleLength} label="8+ chars" />
                        <RuleChip pass={ruleUpper} label="Capital" />
                        <RuleChip pass={ruleSpecial} label="Special char" />
                      </div>
                    </div>

                    <AuthField
                      id="reset-confirm"
                      label="Confirm password"
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={setConfirm}
                      onFocus={() => setFocusField("confirm")}
                      onBlur={() => {
                        setTouched((t) => ({ ...t, confirm: true }));
                        setFocusField(null);
                      }}
                      state={touched.confirm && confirm.length > 0 && !confirmOk ? "invalid" : confirmOk ? "valid" : "idle"}
                      error={touched.confirm && confirm.length > 0 && !confirmOk ? "Those passwords don't match yet." : null}
                      autoComplete="new-password"
                      placeholder="Type your password again"
                      rightSlot={eyeBtn(showConfirm, () => setShowConfirm((v) => !v), showConfirm ? "Hide confirmation password" : "Show confirmation password")}
                      required
                    />

                    <div className="pt-1">
                      <AuthButton state={buttonState} idleLabel="Set new password" loadingLabel="Saving…" successLabel="Saved" disabledHint={missingHint} />
                    </div>
                  </form>
                </>
              )}

              <p className="text-center mt-5" style={{ color: ACCESS.textSoft, fontSize: 13.5, fontWeight: 500 }}>
                Back to{" "}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: ACCESS.abyss }} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
