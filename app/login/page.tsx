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
import HudReadout from "@/app/components/auth/AuthHud";
import AuthSwitchLink from "@/app/components/auth/AuthSwitchLink";
import { useIsDesktop } from "@/app/components/auth/useIsDesktop";
import { safeCourseSlug, hubTargetFor } from "@/app/lib/courseIntent";
import { ACCESS, ACCESS_FONT, ACCESS_GRAD, rgba } from "@/app/components/auth/accessTokens";
import { IconContact, IconCredentials, IconKey, IconVault, IconHub, IconBolt, IconEye, IconEyeOff } from "@/app/components/auth/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop(1200);
  const isTabletUp = useIsDesktop(768);
  const coreQuality = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  const reduced = !!useReducedMotion();

  /* Post-login destination. Priority: ?callbackUrl (same-origin) → ?course → /hub. */
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

  const machinePhase: AuthMachinePhase = granted
    ? "success"
    : phase === "loading"
      ? "submitting"
      : formError
        ? "error"
        : emailValid && passwordPresent
          ? "armed"
          : "idle";
  const modulesOnline = granted ? 6 : [emailValid, passwordPresent && emailValid].filter(Boolean).length;
  const machineState: AuthMachineState = { modulesOnline, focus: focusField, phase: machinePhase, reducedMotion: reduced, quality: coreQuality };
  const powerLevel = (modulesOnline / 6) * 100;

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
    window.setTimeout(() => router.push(safeCallback), 1050);
  };

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: "transparent", border: "none", color: ACCESS.textSoft, cursor: "pointer" }}
    >
      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
    </button>
  );

  const brandMark = (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <div className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 9, background: ACCESS_GRAD.brand, boxShadow: `0 0 16px ${rgba(ACCESS.cyan, 0.3)}` }}>
        <span style={{ color: "#06080f", fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 13 }}>AX</span>
      </div>
      <span style={{ color: ACCESS.textBright, fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 18, letterSpacing: "-0.01em" }}>
        Algorithm
        <span style={{ background: ACCESS_GRAD.brand, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>X</span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen relative" style={{ background: ACCESS_GRAD.page, color: ACCESS.textBright, overflowX: "hidden" }}>
      <AuthBackdrop />

      {/* Full-bleed unified chamber; reactor centre-right, form over the left. */}
      <div className="absolute inset-0" style={{ zIndex: 1, pointerEvents: "none" }}>
        <AuthReactorScene state={machineState} />
      </div>

      {isDesktop && <HudReadout stage={machinePhase} level={powerLevel} />}

      <header className="absolute top-0 inset-x-0 flex items-center justify-between" style={{ zIndex: 30, padding: "20px 32px" }}>
        {brandMark}
        <AuthSwitchLink prompt="Don't have an account?" label="Sign up" href="/signup" variant="solid" />
      </header>

      <div className="relative min-h-screen flex items-center" style={{ zIndex: 20 }}>
        <div className="w-full" style={{ maxWidth: 470, marginLeft: isDesktop ? "5vw" : "auto", marginRight: isDesktop ? undefined : "auto", paddingLeft: 24, paddingRight: 24 }}>
          <AuthTerminalPanel>
            <div className="mb-6">{brandMark}</div>
            <h1 className="mb-2" style={{ fontFamily: ACCESS_FONT.display, fontSize: "clamp(1.9rem, 2.5vw, 2.3rem)", fontWeight: 800, color: ACCESS.textBright, letterSpacing: "-0.02em", lineHeight: 1.08 }}>
              Welcome back
            </h1>
            <p className="mb-6" style={{ color: ACCESS.textSoft, fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
              Log in to power up your AlgorithmX hub.
            </p>

            {justRegistered && !formError && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
                style={{ padding: "12px 14px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, background: rgba(ACCESS.cyan, 0.08), border: `1px solid ${rgba(ACCESS.cyan, 0.4)}`, color: ACCESS.cyanSoft }}
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
                  style={{ padding: "12px 14px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, background: rgba(ACCESS.warn, 0.1), border: `1px solid ${rgba(ACCESS.warn, 0.5)}`, color: ACCESS.warnSoft }}
                >
                  {formError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-1" noValidate>
              <AuthField
                id="login-email"
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                onFocus={() => setFocusField("email")}
                onBlur={() => { setTouched((t) => ({ ...t, email: true })); setFocusField(null); }}
                state={emailInvalid ? "invalid" : emailValid ? "valid" : "idle"}
                error={emailInvalid ? "That email doesn't look right." : null}
                icon={<IconContact size={18} />}
                autoComplete="email"
                inputMode="email"
                placeholder="you@example.com"
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
                  onBlur={() => { setTouched((t) => ({ ...t, password: true })); setFocusField(null); }}
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
                <AuthButton state={buttonState} idleLabel="Log in" loadingLabel="Verifying access…" successLabel="Access granted" leadingIcon={<IconBolt size={17} />} />
              </div>
            </form>

            <div className="mt-5 flex items-start gap-2" style={{ color: ACCESS.textMuted, fontSize: 12, lineHeight: 1.45 }}>
              <span style={{ marginTop: 1, flexShrink: 0, color: ACCESS.textSoft }}><IconVault size={14} /></span>
              <span>We protect your data with enterprise-grade security and never share your information.</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2" style={{ borderTop: `1px solid ${ACCESS.lineSoft}`, paddingTop: 14 }}>
              {[
                { icon: <IconCredentials size={13} />, a: "End-to-end", b: "Encrypted" },
                { icon: <IconKey size={13} />, a: "Secure", b: "Session" },
                { icon: <IconHub size={13} />, a: "One", b: "Hub" },
              ].map((t, i) => (
                <span key={i} className="inline-flex items-center gap-1.5" style={{ color: ACCESS.textMuted }}>
                  <span style={{ color: ACCESS.cyanSoft }}>{t.icon}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, lineHeight: 1.15, fontFamily: ACCESS_FONT.body }}>
                    {t.a}
                    <br />
                    {t.b}
                  </span>
                </span>
              ))}
            </div>
          </AuthTerminalPanel>
        </div>
      </div>

      <div className="absolute inset-x-0 text-center" style={{ bottom: 18, zIndex: 20, pointerEvents: "none" }}>
        <div style={{ fontFamily: ACCESS_FONT.mono, fontSize: 11, letterSpacing: 4, color: ACCESS.cyan, opacity: 0.85 }}>SIX STREAMS. ONE KEY.</div>
        <div style={{ marginTop: 7, fontFamily: ACCESS_FONT.display, fontSize: 12.5, letterSpacing: 5, fontWeight: 700, color: ACCESS.textSoft }}>
          POWER KNOWLEDGE. SHAPE TOMORROW.
        </div>
      </div>

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
