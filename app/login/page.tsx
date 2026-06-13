"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
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
import { IconContact, IconCredentials, IconKey, IconHub, IconEye, IconEyeOff } from "@/app/components/auth/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop(1200);
  const isTabletUp = useIsDesktop(768);
  const coreQuality = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  const reduced = !!useReducedMotion();

  /* Post-login destination. Priority:
   *   1. ?callbackUrl=… — same-origin guard ("/" but not "//").
   *   2. ?course=<slug> — hub with that course pre-selected.
   *   3. /hub           — platform home base. */
  const callbackRaw = searchParams.get("callbackUrl");
  const course = safeCourseSlug(searchParams.get("course"));
  const safeCallback =
    callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//") ? callbackRaw : hubTargetFor(course);

  const justRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [focusField, setFocusField] = useState<AuthMachineState["focus"]>(null);
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");

  const emailValid = EMAIL_RE.test(email);
  const emailInvalid = touched.email && email.length > 0 && !emailValid;
  const passwordPresent = password.length > 0;
  const granted = phase === "success";

  /* Portal energy (0..1) — charges the background chamber as the form fills,
   * with a submit/success surge. Mirrors the reactor's own state. */
  const portalEnergy = granted
    ? 1
    : phase === "loading"
      ? 0.96
      : [emailValid, passwordPresent].filter(Boolean).length / 2;

  /* Stream Orrery state — login powers up fewer modules (email + password,
   * 0–2 during input); success forces all six streams online. Built from
   * the same booleans + phase the form already tracks. */
  const machinePhase: AuthMachinePhase = granted
    ? "success"
    : phase === "loading"
      ? "submitting"
      : formError
        ? "error"
        : emailValid && passwordPresent
          ? "armed"
          : "idle";
  const machineState: AuthMachineState = {
    modulesOnline: granted ? 6 : [emailValid, passwordPresent && emailValid].filter(Boolean).length,
    focus: focusField,
    phase: machinePhase,
    reducedMotion: reduced,
    quality: coreQuality,
  };

  const buttonState: AuthButtonState = phase === "loading" ? "loading" : granted ? "success" : "idle";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setTouched({ email: true, password: true });

    if (!emailValid) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (!passwordPresent) {
      setFormError("Add your password.");
      return;
    }

    setPhase("loading");
    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setFormError("Those details don't match an account.");
      setPhase("idle");
      return;
    }

    setPhase("success");
    // Slightly longer than the old 750ms so the core's unlock/portal moment
    // lands before we route. Still snappy.
    window.setTimeout(() => {
      router.push(safeCallback);
    }, 1050);
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      style={{
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
      }}
    >
      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
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
        {/* LEFT — secure terminal slab */}
        <div className="flex flex-col justify-center py-14">
          <div className="w-full max-w-md">
            <div className="mb-9">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div
                  className="flex items-center justify-center"
                  style={{ width: 38, height: 38, borderRadius: 10, background: ACCESS_GRAD.brand, boxShadow: `0 0 18px ${rgba(ACCESS.cyan, 0.3)}` }}
                >
                  <span style={{ color: "#06080f", fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 14 }}>AX</span>
                </div>
                <span style={{ color: ACCESS.textBright, fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 19, letterSpacing: "-0.01em" }}>
                  Algorithm
                  <span style={{ background: ACCESS_GRAD.brand, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>X</span>
                </span>
              </Link>
            </div>

            <AuthTerminalPanel>
              <h1
                className="mb-7"
                style={{
                  fontFamily: ACCESS_FONT.display,
                  fontSize: "clamp(1.9rem, 2.6vw, 2.3rem)",
                  fontWeight: 800,
                  color: ACCESS.textBright,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.08,
                }}
              >
                Welcome back
              </h1>

              {justRegistered && !formError && (
                <motion.div
                  role="status"
                  aria-live="polite"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4"
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    fontSize: 13.5,
                    fontWeight: 600,
                    background: rgba(ACCESS.cyan, 0.08),
                    border: `1px solid ${rgba(ACCESS.cyan, 0.4)}`,
                    color: ACCESS.cyanSoft,
                  }}
                >
                  Account created — log in to power on.
                </motion.div>
              )}

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
                  id="login-email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  onFocus={() => setFocusField("email")}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, email: true }));
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

                <div>
                  <AuthField
                    id="login-password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    onFocus={() => setFocusField("password")}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, password: true }));
                      setFocusField(null);
                    }}
                    state={touched.password && !passwordPresent ? "invalid" : passwordPresent ? "valid" : "idle"}
                    error={touched.password && !passwordPresent ? "Add your password." : null}
                    icon={<IconCredentials size={18} />}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    rightSlot={passwordToggle}
                    required
                  />
                  <div className="flex justify-end -mt-2 mb-3">
                    <a href="/forgot-password" className="transition hover:opacity-80" style={{ color: ACCESS.cyanSoft, fontSize: 12.5, fontWeight: 600 }}>
                      Forgot password?
                    </a>
                  </div>
                </div>

                <div className="pt-1">
                  <AuthButton state={buttonState} idleLabel="Resume" loadingLabel="Resuming…" successLabel="You're in" />
                </div>
              </form>

              <p className="text-center mt-5" style={{ color: ACCESS.textSoft, fontSize: 13.5, fontWeight: 500 }}>
                Don&apos;t have an account?{" "}
                <a href="/signup" style={{ color: ACCESS.cyan, fontWeight: 700 }} className="transition hover:opacity-80">
                  Sign up
                </a>
              </p>
            </AuthTerminalPanel>

            {/* Dormant identity line (replaces the old "Secure terminal" chrome) */}
            <p className="text-center mt-8" style={{ fontFamily: ACCESS_FONT.mono, fontSize: 11, letterSpacing: 2, color: ACCESS.textMuted }}>
              Six streams. One key.
            </p>

            <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
              {[
                { icon: <IconCredentials size={14} />, label: "ENCRYPTED" },
                { icon: <IconKey size={14} />, label: "SECURE SESSION" },
                { icon: <IconHub size={14} />, label: "ONE HUB" },
              ].map((b, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5"
                  style={{ color: ACCESS.textMuted, fontSize: 10.5, fontWeight: 700, fontFamily: ACCESS_FONT.mono, letterSpacing: 1.4 }}
                >
                  {b.icon} {b.label}
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

      {/* Desktop: the Living Hub's fly-in carries the success moment.
          Tablet/mobile: overlay gives clear confirmation. */}
      {!isDesktop && <AccessGrantedOverlay show={granted} title="Access granted" subtitle="Routing to your hub" />}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: ACCESS.abyss }} />}>
      <LoginPageInner />
    </Suspense>
  );
}
