"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
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

const C = CYBER_PALETTE;
const GRAD = CYBER_GRAD.hero;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Floating cyber glyphs - decorative, desktop only. Same set as before
 * but only mounted on lg+ to keep mobile breathing. */
function CyberFloatingIcons() {
  const reduced = useReducedMotion();
  const icons = [
    { emoji: "🔑", top: "15%", left: "60%", delay: 0, dur: 7, tag: "AUTH" },
    { emoji: "⭐", top: "28%", right: "12%", delay: 1.5, dur: 6 },
    { emoji: "🔒", top: "62%", left: "62%", delay: 0.5, dur: 8, tag: "ENC" },
    { emoji: "🛡️", top: "78%", right: "16%", delay: 2, dur: 6.5 },
    { emoji: "✨", top: "42%", left: "85%", delay: 3, dur: 9 },
    { emoji: "🔐", top: "88%", left: "70%", delay: 1, dur: 7.5, tag: "VAULT" },
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

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop(1024);
  const reduced = !!useReducedMotion();

  /* Respect ?callbackUrl=… when a gated route bounced the user here.
   * Same-origin guard: only accept paths that begin with "/" and not
   * "//" (which would be a protocol-relative URL to another host).
   * Anything sketchy falls back to /dashboard. */
  const callbackRaw = searchParams.get("callbackUrl");
  const safeCallback =
    callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//")
      ? callbackRaw
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");

  const emailValid = EMAIL_RE.test(email);
  const emailInvalid = touched.email && email.length > 0 && !emailValid;
  const passwordPresent = password.length > 0;

  /* Sphere stage mapping - login only needs commsRing / shieldLayer /
   * accessGranted. identityRing + vaultLock stay off. */
  const sphereStage = {
    commsRing: emailValid,
    shieldLayer: passwordPresent && emailValid,
    accessGranted: phase === "success",
  };

  const buttonState: AuthButtonState =
    phase === "loading"
      ? "loading"
      : phase === "success"
        ? "success"
        : "idle";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setTouched({ email: true, password: true });

    if (!emailValid) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!passwordPresent) {
      setFormError("Please enter your password.");
      return;
    }

    setPhase("loading");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setFormError("Those details don't match an account. Try again or sign up.");
      setPhase("idle");
      return;
    }

    setPhase("success");
    // Brief premium transition before redirect - kept short so the
    // user never feels trapped. Navigation happens client-side via
    // router.push which is reliable; no fallback needed.
    window.setTimeout(() => {
      router.push(safeCallback);
    }, 750);
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

        {/* The sphere - reactive to form progress. CSS variant on
            mobile/tablet for performance; full R3F on desktop. */}
        <div className="absolute inset-0">
          <AuthSphere stage={sphereStage} mobile={!isDesktop} />
        </div>

        {/* Desktop-only chrome: floating glyphs + ALGORITHMX label */}
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
              <span style={{ color: C.cosmic }}>$</span> ax_login --auth
              <span style={{ marginLeft: 6, animation: "loginCursorBlink 1s steps(1) infinite" }}>▮</span>
            </div>
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
              ◇ ACCESS TERMINAL ◇
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
              Welcome back, hero.
            </h1>
            <p
              className="mb-6 text-base"
              style={{
                color: C.textBright,
                fontWeight: 600,
                textShadow: "0 1px 12px rgba(8,10,22,0.95)",
              }}
            >
              Log in to continue your Cyber Heroes mission.
            </p>

            {/* Form-level error - calm amber, not harsh red, role=alert */}
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
                id="login-email"
                label="✉  Email"
                type="email"
                value={email}
                onChange={setEmail}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                state={
                  emailInvalid ? "invalid" : emailValid ? "valid" : "idle"
                }
                error={emailInvalid ? "That doesn't look like a valid email." : null}
                autoComplete="email"
                inputMode="email"
                placeholder="hero@cyberheroes.com"
                required
              />

              <div>
                <AuthField
                  id="login-password"
                  label="🔒  Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  state={
                    touched.password && !passwordPresent
                      ? "invalid"
                      : passwordPresent
                        ? "valid"
                        : "idle"
                  }
                  error={touched.password && !passwordPresent ? "Please enter your password." : null}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  rightSlot={passwordToggle}
                  required
                />
                <div className="flex justify-end -mt-2 mb-3">
                  <a
                    href="/forgot-password"
                    className="font-black transition hover:opacity-80"
                    style={{
                      color: C.cyanSoft,
                      fontSize: 12.5,
                      textShadow: `0 0 8px ${C.cosmic}88`,
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
              </div>

              <AuthButton
                state={buttonState}
                idleLabel="Log in →"
                loadingLabel="Verifying access…"
                successLabel="Access granted"
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
              Don&apos;t have an account?{" "}
              <a
                href="/signup"
                className="font-black transition hover:opacity-80"
                style={{
                  color: C.cyan,
                  textShadow: `0 0 10px ${C.cyan}aa`,
                }}
              >
                Sign up
              </a>
            </p>
          </AuthTerminalPanel>

          {/* Trust badges - keep, but moved below the panel + brackets */}
          <div className="flex items-center justify-center gap-4 mt-12 flex-wrap">
            {[
              { icon: "🔒", label: "ENC: 256-BIT" },
              { icon: "👨‍👩‍👧‍👦", label: "FAMILY SAFE" },
              { icon: "🛡️", label: "COPPA COMPLIANT" },
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

      {/* Right-side empty spacer on desktop so the form anchors to
          the left half. The backdrop layer above renders the sphere
          + ALGORITHMX label across both halves. */}
      <div className="hidden lg:flex flex-1 items-center justify-center relative" aria-hidden />

      <AccessGrantedOverlay
        show={phase === "success"}
        title="Access granted"
        subtitle="Routing to Cyber HQ…"
      />

      <style>{`
        @keyframes loginCursorBlink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
        /* Brighter placeholder so kids/parents can actually read the
           hint over the dark glass inputs. */
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
