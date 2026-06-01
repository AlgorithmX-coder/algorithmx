"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CyberPanelBackdrop } from "@/app/components/CyberFutureScenes";
import { CYBER_PALETTE, CYBER_GRAD } from "@/app/components/scene/cyberTokens";
import AuthSphere from "@/app/components/auth/AuthSphere";
import AuthField from "@/app/components/auth/AuthField";
import AuthButton, { type AuthButtonState } from "@/app/components/auth/AuthButton";
import AuthTerminalPanel from "@/app/components/auth/AuthTerminalPanel";
import AccessGrantedOverlay from "@/app/components/auth/AccessGrantedOverlay";
import { useIsDesktop } from "@/app/components/auth/useIsDesktop";
import { safeCourseSlug, hubTargetFor } from "@/app/lib/courseIntent";

const C = CYBER_PALETTE;
const GRAD = CYBER_GRAD.hero;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Password-rule chip. Inactive: dim outline only. Passed: subtle cyan
 * glow with a tick. Springs in to confirm the rule. */
function RuleChip({ pass, label }: { pass: boolean; label: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      animate={
        pass && !reduced
          ? { scale: [1, 1.06, 1] }
          : undefined
      }
      transition={{ duration: 0.32, ease: "easeOut" }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
        background: pass ? `${C.cyan}1f` : "rgba(255,255,255,0.03)",
        border: `1px solid ${pass ? `${C.cyan}88` : "rgba(232,237,255,0.12)"}`,
        color: pass ? C.cyanSoft : "rgba(232,237,255,0.5)",
        letterSpacing: 0.7,
        textTransform: "uppercase",
        boxShadow: pass ? `0 0 12px ${C.cyan}33` : "none",
        transition: "background 240ms ease, border-color 240ms ease, color 240ms ease, box-shadow 240ms ease",
      }}
    >
      <span aria-hidden style={{ fontSize: 10, lineHeight: 1, color: pass ? C.lime : "inherit" }}>
        {pass ? "✓" : "○"}
      </span>
      <span>{label}</span>
    </motion.span>
  );
}

/* Desktop floating glyphs - decorative, reduced-motion aware. */
function CyberFloatingIcons() {
  const reduced = useReducedMotion();
  const icons = [
    { emoji: "🔑", top: "15%", left: "60%", delay: 0, dur: 7, tag: "AUTH" },
    { emoji: "⭐", top: "28%", right: "12%", delay: 1.5, dur: 6 },
    { emoji: "🔒", top: "62%", left: "62%", delay: 0.5, dur: 8, tag: "ENCRYPTED" },
    { emoji: "🛡️", top: "78%", right: "16%", delay: 2, dur: 6.5 },
    { emoji: "✨", top: "42%", left: "85%", delay: 3, dur: 9 },
  ];
  return (
    <>
      {icons.map((ic, i) => (
        <motion.div
          key={i}
          className="absolute"
          animate={reduced ? undefined : { y: [-10, 10, -10] }}
          transition={{ duration: ic.dur, ease: "easeInOut", repeat: Infinity, delay: ic.delay }}
          style={{
            top: ic.top,
            left: "left" in ic ? ic.left : undefined,
            right: "right" in ic ? ic.right : undefined,
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: 0.7,
            filter: `drop-shadow(0 0 14px ${C.cyan}aa)`,
          }}
        >
          <span style={{ fontSize: 22 }}>{ic.emoji}</span>
          {ic.tag && (
            <span
              style={{
                fontSize: 9,
                letterSpacing: 2,
                fontWeight: 800,
                fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                color: C.cyan,
                padding: "2px 6px",
                background: "rgba(8, 10, 22, 0.7)",
                border: `1px solid ${C.cyan}77`,
                borderRadius: 4,
              }}
            >
              {ic.tag}
            </span>
          )}
        </motion.div>
      ))}
    </>
  );
}

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop(1024);
  const reduced = !!useReducedMotion();

  /* If the user arrived from a specific course card (eg
   * /signup?course=cyber-heroes) we preserve that intent so the hub can
   * highlight it after login. Validate to a slug shape so the value is
   * safe to round-trip through the callbackUrl. */
  const course = safeCourseSlug(searchParams.get("course"));

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // independent reveal
  const [touched, setTouched] = useState<{
    name?: boolean;
    email?: boolean;
    password?: boolean;
    confirm?: boolean;
  }>({});
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");

  /* Derived state - kept in one block so the sphere mapping is easy
   * to scan against the rules. */
  const nameOk = name.trim().length > 0;
  const emailOk = EMAIL_RE.test(email);
  const ruleLength = password.length >= 8;
  const ruleUpper = /[A-Z]/.test(password);
  const ruleSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordOk = ruleLength && ruleUpper && ruleSpecial;
  const confirmOk = confirmPassword.length > 0 && password === confirmPassword;
  const allReady = nameOk && emailOk && passwordOk && confirmOk;

  /* What the user still needs to do - feeds the disabled button hint. */
  const missingHint = useMemo(() => {
    const need: string[] = [];
    if (!nameOk) need.push("name");
    if (!emailOk) need.push("valid email");
    if (!passwordOk) need.push("strong password");
    if (!confirmOk) need.push("matching confirm");
    if (need.length === 0) return undefined;
    return `Still needed: ${need.join(", ")}.`;
  }, [nameOk, emailOk, passwordOk, confirmOk]);

  /* Sphere stage - drives the AuthSphere rings/core. */
  const sphereStage = {
    identityRing: nameOk,
    commsRing: emailOk,
    shieldLayer: passwordOk,
    vaultLock: confirmOk && passwordOk,
    accessGranted: phase === "success",
  };

  const buttonState: AuthButtonState =
    phase === "loading"
      ? "loading"
      : phase === "success"
        ? "success"
        : allReady
          ? "idle"
          : "disabled";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setTouched({ name: true, email: true, password: true, confirm: true });

    if (!allReady) {
      // The disabled button hint already explains what's missing; mirror
      // it as a calm form-level error for screen readers.
      setFormError(missingHint ?? "Please complete every field before continuing.");
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
        setFormError(data.error || "We couldn't create your account. Please try again.");
        setPhase("idle");
        return;
      }

      setPhase("success");
      // Account is created but not signed in yet, so we route through
      // /login. We carry the intended hub destination (with the selected
      // course, if any) as a callbackUrl so login lands them on their hub.
      const loginUrl = `/login?registered=true&callbackUrl=${encodeURIComponent(hubTargetFor(course))}`;
      window.setTimeout(() => {
        router.push(loginUrl);
      }, 800);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Network error";
      setFormError(`Couldn't reach the server. ${detail}. If this keeps happening, email support@algorithmx.co.uk.`);
      setPhase("idle");
    }
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
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "transparent",
        border: "none",
        color: "rgba(232, 237, 255, 0.7)",
        cursor: "pointer",
        fontSize: 16,
      }}
    >
      {showPassword ? "🙈" : "👁️"}
    </button>
  );

  const confirmToggle = (
    <button
      type="button"
      onClick={() => setShowConfirm((v) => !v)}
      aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "transparent",
        border: "none",
        color: "rgba(232, 237, 255, 0.7)",
        cursor: "pointer",
        fontSize: 16,
      }}
    >
      {showConfirm ? "🙈" : "👁️"}
    </button>
  );

  return (
    <div
      className="min-h-screen flex relative"
      style={{
        background: CYBER_GRAD.page,
        color: C.textBright,
        overflowX: "hidden",
      }}
    >
      {/* ─── BACKDROP LAYER ─── */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ zIndex: 0, overflow: "hidden", pointerEvents: "none" }}
      >
        <CyberPanelBackdrop />

        <div className="absolute inset-0">
          <AuthSphere stage={sphereStage} mobile={!isDesktop} />
        </div>

        {/* Desktop-only chrome */}
        <div className="hidden lg:block">
          <CyberFloatingIcons />
          <motion.div
            className="absolute flex flex-col items-center"
            style={{
              top: "50%",
              left: "70%",
              transform: "translate(-50%, 100px)",
              zIndex: 2,
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.5 }}
          >
            <span
              className="text-3xl font-black tracking-widest"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                color: C.textBright,
                textShadow: `0 0 22px ${C.cyan}aa, 0 0 44px ${C.cosmic}66`,
                letterSpacing: 6,
              }}
            >
              ALGORITHMX
            </span>
            <div
              style={{
                fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                fontSize: 12,
                color: C.cyan,
                marginTop: 18,
                letterSpacing: 1,
                textShadow: `0 0 8px ${C.cyan}`,
              }}
            >
              <span style={{ color: C.cosmic }}>$</span> ax_signup --create-learning-hub
              <span style={{ marginLeft: 6, animation: "spCursorBlink 1s steps(1) infinite" }}>▮</span>
            </div>
            <p
              className="text-xs mt-4 text-center"
              style={{
                color: C.textSoft,
                opacity: 0.8,
                letterSpacing: 0.5,
                textShadow: "0 1px 6px rgba(8,10,22,0.9)",
              }}
            >
              6 streams · family access · secure learner hub
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── FORM COLUMN ─── */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12 relative"
        style={{ zIndex: 3 }}
      >
        <div className="w-full max-w-md relative">
          {/* Logo */}
          <div className="mb-8">
            <a href="/" className="inline-flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: GRAD,
                  boxShadow: `0 0 22px ${C.cyan}77`,
                }}
              >
                <span
                  className="text-sm font-black"
                  style={{ color: C.abyss, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  AX
                </span>
              </div>
              <span
                className="text-xl font-black"
                style={{
                  color: C.textBright,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  letterSpacing: "-0.01em",
                }}
              >
                Algorithm
                <span
                  className="text-transparent bg-clip-text"
                  style={{ backgroundImage: GRAD, WebkitBackgroundClip: "text" }}
                >
                  X
                </span>
              </span>
            </a>
          </div>

          <AuthTerminalPanel>
            <div
              style={{
                display: "inline-block",
                fontSize: 11,
                letterSpacing: 5,
                color: C.cyan,
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "5px 14px",
                background: "rgba(8, 10, 22, 0.6)",
                border: `1px solid ${C.cyan}66`,
                borderRadius: 999,
                marginBottom: 14,
                fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                textShadow: `0 0 8px ${C.cyan}`,
              }}
            >
              ✦ NEW ACCOUNT SETUP ✦
            </div>
            <h1
              className="text-3xl sm:text-4xl font-black mb-3"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                background: GRAD,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "-0.025em",
                filter: `drop-shadow(0 2px 0 rgba(8,10,22,0.9)) drop-shadow(0 0 22px ${C.cyan}77)`,
              }}
            >
              Create your AlgorithmX account
            </h1>
            <p
              className="mb-6 text-base"
              style={{
                color: C.textBright,
                fontWeight: 600,
                textShadow: "0 1px 12px rgba(8,10,22,0.95)",
              }}
            >
              Set up one secure account for your family and access every AlgorithmX course from your learning hub.
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
                  className="mb-4 px-3.5 py-3 rounded-2xl text-sm font-semibold"
                  style={{
                    background: `${C.amber}1a`,
                    border: `1px solid ${C.amber}88`,
                    color: "#ffd9a3",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  {formError}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-2" noValidate>
              <AuthField
                id="signup-name"
                label="👤  Full name"
                type="text"
                value={name}
                onChange={setName}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                state={
                  touched.name && !nameOk ? "invalid" : nameOk ? "valid" : "idle"
                }
                error={touched.name && !nameOk ? "We need a name to set up the account." : null}
                autoComplete="name"
                placeholder="Parent or guardian's name"
                required
              />

              <AuthField
                id="signup-email"
                label="✉  Email"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                state={
                  touched.email && email.length > 0 && !emailOk
                    ? "invalid"
                    : emailOk
                      ? "valid"
                      : "idle"
                }
                error={
                  touched.email && email.length > 0 && !emailOk
                    ? "That doesn't look like a valid email."
                    : null
                }
                autoComplete="email"
                inputMode="email"
                placeholder="parent@example.com"
                required
              />

              <div>
                <AuthField
                  id="signup-password"
                  label="🔒  Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  state={
                    touched.password && password.length > 0 && !passwordOk
                      ? "invalid"
                      : passwordOk
                        ? "valid"
                        : "idle"
                  }
                  error={null}
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  rightSlot={passwordToggle}
                  required
                />
                {/* Live password-rule chips. Wrap cleanly on narrow widths. */}
                <div
                  className="-mt-2 mb-3 flex flex-wrap gap-2"
                  aria-label="Password requirements"
                >
                  <RuleChip pass={ruleLength} label="8+ chars" />
                  <RuleChip pass={ruleUpper} label="Capital letter" />
                  <RuleChip pass={ruleSpecial} label="Special char" />
                </div>
              </div>

              <AuthField
                id="signup-confirm"
                label="🔁  Confirm password"
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={setConfirmPassword}
                onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
                state={
                  touched.confirm && confirmPassword.length > 0 && !confirmOk
                    ? "invalid"
                    : confirmOk
                      ? "valid"
                      : "idle"
                }
                error={
                  touched.confirm && confirmPassword.length > 0 && !confirmOk
                    ? "The two passwords do not match."
                    : null
                }
                autoComplete="new-password"
                placeholder="Type your password again"
                rightSlot={confirmToggle}
                required
              />

              <AuthButton
                state={buttonState}
                idleLabel="Create account →"
                loadingLabel="Creating secure account…"
                successLabel="Account secured"
                disabledHint={missingHint}
              />
            </form>

            <p
              className="text-center mt-5"
              style={{
                color: C.text,
                fontSize: 14,
                fontWeight: 600,
                textShadow: "0 1px 6px rgba(8,10,22,0.9)",
              }}
            >
              Already have an account?{" "}
              <a
                href="/login"
                className="font-black transition hover:opacity-80"
                style={{
                  color: C.cyan,
                  textShadow: `0 0 10px ${C.cyan}aa`,
                }}
              >
                Log in
              </a>
            </p>
          </AuthTerminalPanel>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-4 mt-12 flex-wrap">
            {[
              { icon: "🔒", label: "ENCRYPTED" },
              { icon: "👨‍👩‍👧‍👦", label: "FAMILY SAFE" },
              { icon: "🛡️", label: "UK GDPR ALIGNED" },
            ].map((b, i) => (
              <motion.span
                key={i}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-1.5"
                style={{
                  color: C.textSoft,
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                  letterSpacing: 1.5,
                  textShadow: "0 1px 6px rgba(8,10,22,0.9)",
                }}
              >
                <span>{b.icon}</span> {b.label}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 items-center justify-center relative" aria-hidden />

      <AccessGrantedOverlay
        show={phase === "success"}
        title="Account secured"
        subtitle="Account ready · Routing to login…"
      />

      <style>{`
        @keyframes spCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        input::placeholder {
          color: rgba(232, 237, 255, 0.7);
          font-weight: 600;
          opacity: 1;
        }
        input:focus::placeholder {
          color: rgba(232, 237, 255, 0.45);
        }
      `}</style>
    </div>
  );
}

/**
 * Suspense wrapper for the inner client component — required by Next.js
 * 16 because SignupPageInner now reads useSearchParams (to preserve the
 * ?course= intent). Mirrors the pattern in /login. Fallback is a flat
 * background panel so there's no flash before hydration.
 */
export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#06070d",
          }}
        />
      }
    >
      <SignupPageInner />
    </Suspense>
  );
}
