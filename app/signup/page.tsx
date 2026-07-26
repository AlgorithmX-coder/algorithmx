"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import AuthBackdrop from "@/app/components/auth/AuthBackdrop";
import { AuthReactorScene, type AuthMachinePhase, type AuthMachineState } from "@/app/components/auth-reactor";
import AuthField from "@/app/components/auth/AuthField";
import AuthButton, { type AuthButtonState } from "@/app/components/auth/AuthButton";
import AuthTerminalPanel from "@/app/components/auth/AuthTerminalPanel";
import AccessGrantedOverlay from "@/app/components/auth/AccessGrantedOverlay";
import { useIsDesktop } from "@/app/components/auth/useIsDesktop";
import { safeCourseSlug, hubTargetFor } from "@/app/lib/courseIntent";
import { ACCESS, ACCESS_FONT, ACCESS_GRAD, rgba } from "@/app/components/auth/accessTokens";
import {
  IconIdentity,
  IconCredentials,
  IconVault,
  IconCheck,
  IconEye,
  IconEyeOff,
} from "@/app/components/auth/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Password-rule chip. Dormant: bare outline + dot. Passed: cyan tint
 * + check. State-driven only — no idle decoration. */
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
      {pass ? (
        <IconCheck size={12} />
      ) : (
        <span aria-hidden style={{ width: 5, height: 5, borderRadius: "50%", background: ACCESS.textMuted }} />
      )}
      <span>{label}</span>
    </span>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop(1200);
  const isTabletUp = useIsDesktop(768);
  const coreQuality = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  const reduced = !!useReducedMotion();

  /* Preserve ?course= intent through the auth flow so the hub can
   * highlight it after login. Validated to a safe slug shape. */
  const course = safeCourseSlug(searchParams.get("course"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirm?: boolean;
  }>({});
  const [focusField, setFocusField] = useState<AuthMachineState["focus"]>(null);
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");

  /* Derived validity — kept in one block so the engine + status stack
   * map cleanly against it. */
  const nameOk = name.trim().length > 0;
  const emailOk = EMAIL_RE.test(email);
  const ruleLength = password.length >= 8;
  const ruleUpper = /[A-Z]/.test(password);
  const ruleSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordOk = ruleLength && ruleUpper && ruleSpecial;
  const confirmOk = confirmPassword.length > 0 && password === confirmPassword;
  const allReady = nameOk && emailOk && passwordOk && confirmOk;

  const missingHint = useMemo(() => {
    const need: string[] = [];
    if (!nameOk) need.push("name");
    if (!emailOk) need.push("valid email");
    if (!passwordOk) need.push("strong password");
    if (!confirmOk) need.push("matching confirm");
    if (need.length === 0) return undefined;
    return `Still need: ${need.join(", ")}.`;
  }, [nameOk, emailOk, passwordOk, confirmOk]);

  const granted = phase === "success";

  /* Portal energy (0..1) — charges the background chamber as the form fills,
   * with a submit/success surge. Mirrors the reactor's own state. */
  const portalEnergy = granted
    ? 1
    : phase === "loading"
      ? 0.96
      : [nameOk, emailOk, passwordOk, confirmOk].filter(Boolean).length / 4;

  /* Stream Orrery state — built from the same field booleans + phase the
   * form already tracks, so the instrument and the form always agree.
   * modulesOnline counts valid required fields (0–4 during input); success
   * forces all six streams online. */
  const machinePhase: AuthMachinePhase = granted
    ? "success"
    : phase === "loading"
      ? "submitting"
      : formError
        ? "error"
        : allReady
          ? "armed"
          : "idle";
  const machineState: AuthMachineState = {
    modulesOnline: granted ? 6 : [nameOk, emailOk, passwordOk, confirmOk && passwordOk].filter(Boolean).length,
    focus: focusField,
    phase: machinePhase,
    reducedMotion: reduced,
    quality: coreQuality,
  };

  const buttonState: AuthButtonState =
    phase === "loading" ? "loading" : granted ? "success" : allReady ? "idle" : "disabled";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setTouched({ name: true, email: true, password: true, confirm: true });

    if (!allReady) {
      setFormError(missingHint ?? "Fill in everything above to power on.");
      return;
    }

    setPhase("loading");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Couldn't create your account just yet — try again?");
        setPhase("idle");
        return;
      }

      setPhase("success");
      // Account created but not signed in — route through /login, carrying
      // the intended hub destination (with any selected course).
      const loginUrl = `/login?registered=true&callbackUrl=${encodeURIComponent(hubTargetFor(course))}`;
      // Slightly longer than the old 800ms so the core's unlock/portal
      // moment lands before we route. Still snappy.
      window.setTimeout(() => {
        router.push(loginUrl);
      }, 1100);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Network error";
      setFormError(`Couldn't reach the server. ${detail}. If this keeps happening, email support@algorithmx.co.uk.`);
      setPhase("idle");
    }
  };

  const eyeBtnStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "transparent",
    border: "none",
    color: ACCESS.textSoft,
    cursor: "pointer",
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      style={eyeBtnStyle}
    >
      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
    </button>
  );

  const confirmToggle = (
    <button
      type="button"
      onClick={() => setShowConfirm((v) => !v)}
      aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
      style={eyeBtnStyle}
    >
      {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
    </button>
  );

  return (
    <div
      className="min-h-screen relative"
      style={{ background: ACCESS_GRAD.page, color: ACCESS.textBright, overflowX: "hidden" }}
    >
      <AuthBackdrop energy={portalEnergy} submitting={phase === "loading"} success={granted} />

      {/* Tablet/mobile: the reactor sits behind the form slab. */}
      {!isDesktop && (
        <div className="absolute inset-0" style={{ zIndex: 0, pointerEvents: "none" }}>
          <AuthReactorScene state={machineState} />
        </div>
      )}

      {/* Top line — brand far left, "Back to home" far right. Page chrome,
       *  pinned above the vertically-centered access layer. */}
      <div className="absolute left-0 right-0 top-0" style={{ zIndex: 3 }}>
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-6 pt-7" style={{ maxWidth: 1440 }}>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className="flex items-center justify-center"
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: ACCESS_GRAD.brand,
                boxShadow: `0 0 18px ${rgba(ACCESS.cyan, 0.3)}`,
              }}
            >
              <span style={{ color: "#06080f", fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 14 }}>
                AX
              </span>
            </div>
            <span style={{ color: ACCESS.textBright, fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 19, letterSpacing: "-0.01em" }}>
              Algorithm
              <span style={{ background: ACCESS_GRAD.brand, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>X</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 transition hover:opacity-80"
            style={{ color: ACCESS.cyanSoft, fontFamily: ACCESS_FONT.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2, whiteSpace: "nowrap" }}
          >
            <span aria-hidden>←</span> BACK TO HOME
          </Link>
        </div>
      </div>

      {/* ─── ACCESS LAYER: form + Learning Core ─── */}
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
        {/* LEFT — secure terminal slab (pt clears the fixed top line) */}
        <div className="flex flex-col justify-center pt-28 pb-14">
          <div className="w-full max-w-md">
            <AuthTerminalPanel>
              <h1
                className="mb-2"
                style={{
                  fontFamily: ACCESS_FONT.display,
                  fontSize: "clamp(1.9rem, 2.6vw, 2.3rem)",
                  fontWeight: 800,
                  color: ACCESS.textBright,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.08,
                }}
              >
                Bring AlgorithmX online
              </h1>
              <p className="mb-7" style={{ color: ACCESS.textSoft, fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
                Create your account.
              </p>

              <AnimatePresence>
                {formError && (
                  <motion.div
                    key="formerr"
                    role="alert"
                    aria-live="polite"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mb-4"
                    style={{
                      padding: "12px 14px",
                      borderRadius: 12,
                      fontSize: 13.5,
                      fontWeight: 600,
                      background: rgba(ACCESS.warn, 0.1),
                      border: `1px solid ${rgba(ACCESS.warn, 0.5)}`,
                      color: ACCESS.warnSoft,
                    }}
                  >
                    {formError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-1" noValidate>
                <AuthField
                  id="signup-name"
                  label="Full name"
                  type="text"
                  value={name}
                  onChange={setName}
                  onFocus={() => setFocusField("name")}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, name: true }));
                    setFocusField(null);
                  }}
                  state={touched.name && !nameOk ? "invalid" : nameOk ? "valid" : "idle"}
                  error={touched.name && !nameOk ? "We'll need your name." : null}
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                />

                <AuthField
                  id="signup-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, email: true }));
                    setFocusField(null);
                  }}
                  state={touched.email && email.length > 0 && !emailOk ? "invalid" : emailOk ? "valid" : "idle"}
                  error={touched.email && email.length > 0 && !emailOk ? "That email doesn't look right." : null}
                  autoComplete="email"
                  inputMode="email"
                  placeholder="you@example.com"
                  required
                />

                <div>
                  <AuthField
                    id="signup-password"
                    label="Password"
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
                    rightSlot={passwordToggle}
                    required
                  />
                  <div className="-mt-2 mb-3 flex flex-wrap gap-2" aria-label="Password requirements">
                    <RuleChip pass={ruleLength} label="8+ chars" />
                    <RuleChip pass={ruleUpper} label="Capital" />
                    <RuleChip pass={ruleSpecial} label="Special char" />
                  </div>
                </div>

                <AuthField
                  id="signup-confirm"
                  label="Confirm password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  onFocus={() => setFocusField("confirm")}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, confirm: true }));
                    setFocusField(null);
                  }}
                  state={touched.confirm && confirmPassword.length > 0 && !confirmOk ? "invalid" : confirmOk ? "valid" : "idle"}
                  error={touched.confirm && confirmPassword.length > 0 && !confirmOk ? "Those passwords don't match yet." : null}
                  autoComplete="new-password"
                  placeholder="Type your password again"
                  rightSlot={confirmToggle}
                  required
                />

                <div className="pt-1">
                  <AuthButton
                    state={buttonState}
                    idleLabel="Power on"
                    loadingLabel="Powering on…"
                    successLabel="Account ready"
                    disabledHint={missingHint}
                  />
                </div>
              </form>

              <p className="text-center mt-5" style={{ color: ACCESS.textSoft, fontSize: 13.5, fontWeight: 500 }}>
                Already have an account?{" "}
                <a href="/login" style={{ color: ACCESS.cyan, fontWeight: 700 }} className="transition hover:opacity-80">
                  Log in
                </a>
              </p>
            </AuthTerminalPanel>

            {/* Dormant identity line (replaces the old "Secure terminal" chrome) */}
            <p className="text-center mt-8" style={{ fontFamily: ACCESS_FONT.mono, fontSize: 11.5, letterSpacing: 2.2, color: ACCESS.textSoft }}>
              Six streams. One key.
            </p>

            {/* Trust row — SVG, not emoji */}
            <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
              {[
                { icon: <IconCredentials size={14} />, label: "ENCRYPTED" },
                { icon: <IconIdentity size={14} />, label: "FAMILY SAFE" },
                { icon: <IconVault size={14} />, label: "UK GDPR ALIGNED" },
              ].map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5"
                  style={{ color: ACCESS.textSoft, fontSize: 11, fontWeight: 700, fontFamily: ACCESS_FONT.mono, letterSpacing: 1.4 }}
                >
                  <span aria-hidden className="inline-flex" style={{ color: rgba(ACCESS.cyan, 0.75) }}>{b.icon}</span> {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — the reactor (desktop). It floats inside the shared full-bleed
            portal chamber painted by AuthBackdrop, so there's no column seam. */}
        {isDesktop && (
          <div className="relative self-stretch">
            <div className="absolute inset-0">
              <AuthReactorScene state={machineState} />
            </div>
          </div>
        )}
      </div>

      {/* On desktop the Living Hub's fly-in IS the success moment,
          so we don't cover it. On tablet/mobile the core is quieter, so the
          overlay gives clear confirmation. */}
      {!isDesktop && <AccessGrantedOverlay show={granted} title="Account secured" subtitle="Routing to login" />}
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: ACCESS.abyss }} />}>
      <SignupPageInner />
    </Suspense>
  );
}
