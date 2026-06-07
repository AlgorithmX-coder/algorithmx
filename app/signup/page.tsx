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
import HudReadout from "@/app/components/auth/AuthHud";
import AuthSwitchLink from "@/app/components/auth/AuthSwitchLink";
import { useIsDesktop } from "@/app/components/auth/useIsDesktop";
import { safeCourseSlug, hubTargetFor } from "@/app/lib/courseIntent";
import { ACCESS, ACCESS_FONT, ACCESS_GRAD, rgba } from "@/app/components/auth/accessTokens";
import {
  IconIdentity,
  IconContact,
  IconCredentials,
  IconVault,
  IconKey,
  IconHub,
  IconBolt,
  IconEye,
  IconEyeOff,
} from "@/app/components/auth/icons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRONG = "#7eff97";

/* Segmented password-strength meter. */
function StrengthMeter({ password, ok }: { password: string; ok: boolean }) {
  if (password.length === 0) return <div className="mb-3" style={{ height: 4 }} />;
  const passed = [password.length >= 8, /[A-Z]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const score = Math.min(4, passed + (password.length >= 12 ? 1 : 0));
  const label = ok ? "Strong" : score >= 2 ? "Getting there" : "Weak";
  const color = ok ? STRONG : score >= 2 ? ACCESS.cyan : ACCESS.warn;
  return (
    <div className="-mt-1 mb-3" style={{ display: "flex", alignItems: "center", gap: 10 }} aria-label="Password strength">
      <div style={{ display: "flex", gap: 5, flex: 1 }}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            style={{ height: 4, flex: 1, borderRadius: 999, background: i < score ? color : ACCESS.line, transition: "background 240ms ease" }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: ACCESS_FONT.body, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop(1200);
  const isTabletUp = useIsDesktop(768);
  const coreQuality = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  const reduced = !!useReducedMotion();

  const course = safeCourseSlug(searchParams.get("course"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; password?: boolean; confirm?: boolean }>({});
  const [focusField, setFocusField] = useState<AuthMachineState["focus"]>(null);
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");

  const nameOk = name.trim().length > 0;
  const emailOk = EMAIL_RE.test(email);
  const passwordOk = password.length >= 8 && /[A-Z]/.test(password) && /[^A-Za-z0-9]/.test(password);
  const confirmOk = confirmPassword.length > 0 && password === confirmPassword;
  const allReady = nameOk && emailOk && passwordOk && confirmOk;

  const missingHint = useMemo(() => {
    const need: string[] = [];
    if (!nameOk) need.push("name");
    if (!emailOk) need.push("valid email");
    if (!passwordOk) need.push("strong password");
    if (!confirmOk) need.push("matching confirm");
    return need.length === 0 ? undefined : `Still need: ${need.join(", ")}.`;
  }, [nameOk, emailOk, passwordOk, confirmOk]);

  const granted = phase === "success";

  const machinePhase: AuthMachinePhase = granted
    ? "success"
    : phase === "loading"
      ? "submitting"
      : formError
        ? "error"
        : allReady
          ? "armed"
          : "idle";
  const modulesOnline = granted ? 6 : [nameOk, emailOk, passwordOk, confirmOk && passwordOk].filter(Boolean).length;
  const machineState: AuthMachineState = { modulesOnline, focus: focusField, phase: machinePhase, reducedMotion: reduced, quality: coreQuality };
  const powerLevel = (modulesOnline / 6) * 100;

  const buttonState: AuthButtonState = phase === "loading" ? "loading" : granted ? "success" : allReady ? "idle" : "disabled";

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
      const loginUrl = `/login?registered=true&callbackUrl=${encodeURIComponent(hubTargetFor(course))}`;
      window.setTimeout(() => router.push(loginUrl), 1100);
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
    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} style={eyeBtnStyle}>
      {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
    </button>
  );
  const confirmToggle = (
    <button type="button" onClick={() => setShowConfirm((v) => !v)} aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"} style={eyeBtnStyle}>
      {showConfirm ? <IconEyeOff size={18} /> : <IconEye size={18} />}
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

      {/* Full-bleed unified chamber; the reactor sits centre-right (camera yaw),
          the form floats over the left of the same continuous floor. */}
      <div className="absolute inset-0" style={{ zIndex: 1, pointerEvents: "none" }}>
        <AuthReactorScene state={machineState} />
      </div>

      {/* HUD annotations around the reactor */}
      {isDesktop && <HudReadout stage={machinePhase} level={powerLevel} />}

      {/* Top nav */}
      <header className="absolute top-0 inset-x-0 flex items-center justify-between" style={{ zIndex: 30, padding: "20px 32px" }}>
        {brandMark}
        <AuthSwitchLink prompt="Already have an account?" label="Log in" href="/login" />
      </header>

      {/* Form card (left) */}
      <div className="relative min-h-screen flex items-center" style={{ zIndex: 20 }}>
        <div className="w-full" style={{ maxWidth: 488, marginLeft: isDesktop ? "5vw" : "auto", marginRight: isDesktop ? undefined : "auto", paddingLeft: 24, paddingRight: 24 }}>
          <AuthTerminalPanel>
            <div className="mb-6">{brandMark}</div>
            <h1 className="mb-2" style={{ fontFamily: ACCESS_FONT.display, fontSize: "clamp(1.65rem, 2.0vw, 1.95rem)", fontWeight: 800, color: ACCESS.textBright, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "nowrap" }}>
              Bring AlgorithmX online
            </h1>
            <p className="mb-6" style={{ color: ACCESS.textSoft, fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
              Create your account and power the future of learning.
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
                  style={{ padding: "12px 14px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, background: rgba(ACCESS.warn, 0.1), border: `1px solid ${rgba(ACCESS.warn, 0.5)}`, color: ACCESS.warnSoft }}
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
                onBlur={() => { setTouched((t) => ({ ...t, name: true })); setFocusField(null); }}
                state={touched.name && !nameOk ? "invalid" : nameOk ? "valid" : "idle"}
                error={touched.name && !nameOk ? "We'll need your name." : null}
                icon={<IconIdentity size={18} />}
                autoComplete="name"
                placeholder="Your full name"
                required
              />
              <AuthField
                id="signup-email"
                label="Email address"
                type="email"
                value={email}
                onChange={setEmail}
                onFocus={() => setFocusField("email")}
                onBlur={() => { setTouched((t) => ({ ...t, email: true })); setFocusField(null); }}
                state={touched.email && email.length > 0 && !emailOk ? "invalid" : emailOk ? "valid" : "idle"}
                error={touched.email && email.length > 0 && !emailOk ? "That email doesn't look right." : null}
                icon={<IconContact size={18} />}
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
                  onBlur={() => { setTouched((t) => ({ ...t, password: true })); setFocusField(null); }}
                  state={touched.password && password.length > 0 && !passwordOk ? "invalid" : passwordOk ? "valid" : "idle"}
                  error={null}
                  icon={<IconCredentials size={18} />}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  rightSlot={passwordToggle}
                  required
                />
                <StrengthMeter password={password} ok={passwordOk} />
              </div>
              <AuthField
                id="signup-confirm"
                label="Confirm password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={setConfirmPassword}
                onFocus={() => setFocusField("confirm")}
                onBlur={() => { setTouched((t) => ({ ...t, confirm: true })); setFocusField(null); }}
                state={touched.confirm && confirmPassword.length > 0 && !confirmOk ? "invalid" : confirmOk ? "valid" : "idle"}
                error={touched.confirm && confirmPassword.length > 0 && !confirmOk ? "Those passwords don't match yet." : null}
                icon={<IconVault size={18} />}
                autoComplete="new-password"
                placeholder="Type your password again"
                rightSlot={confirmToggle}
                required
              />
              <div className="pt-1">
                <AuthButton state={buttonState} idleLabel="Power on" loadingLabel="Powering on…" successLabel="Account ready" disabledHint={missingHint} leadingIcon={<IconBolt size={17} />} />
              </div>
            </form>

            {/* Reassurance */}
            <div className="mt-5 flex items-start gap-2" style={{ color: ACCESS.textMuted, fontSize: 12, lineHeight: 1.45 }}>
              <span style={{ marginTop: 1, flexShrink: 0, color: ACCESS.textSoft }}><IconVault size={14} /></span>
              <span>We protect your data with enterprise-grade security and never share your information.</span>
            </div>

            {/* Trust row */}
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2" style={{ borderTop: `1px solid ${ACCESS.lineSoft}`, paddingTop: 14 }}>
              {[
                { icon: <IconCredentials size={13} />, a: "End-to-end", b: "Encrypted" },
                { icon: <IconVault size={13} />, a: "GDPR", b: "Compliant" },
                { icon: <IconKey size={13} />, a: "Secure", b: "Infrastructure" },
                { icon: <IconHub size={13} />, a: "Trusted by", b: "Educators" },
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

      {/* Bottom taglines */}
      <div className="absolute inset-x-0 text-center" style={{ bottom: 18, zIndex: 20, pointerEvents: "none" }}>
        <div style={{ fontFamily: ACCESS_FONT.mono, fontSize: 11, letterSpacing: 4, color: ACCESS.cyan, opacity: 0.85 }}>SIX STREAMS. ONE KEY.</div>
        <div style={{ marginTop: 7, fontFamily: ACCESS_FONT.display, fontSize: 12.5, letterSpacing: 5, fontWeight: 700, color: ACCESS.textSoft }}>
          POWER KNOWLEDGE. SHAPE TOMORROW.
        </div>
      </div>

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
