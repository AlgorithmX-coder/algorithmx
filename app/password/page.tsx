"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import AuthBackdrop from "@/app/components/auth/AuthBackdrop";
import { AuthReactorScene, type AuthMachinePhase, type AuthMachineState } from "@/app/components/auth-reactor";
import AuthField from "@/app/components/auth/AuthField";
import AuthButton, { type AuthButtonState } from "@/app/components/auth/AuthButton";
import AuthTerminalPanel from "@/app/components/auth/AuthTerminalPanel";
import AccessGrantedOverlay from "@/app/components/auth/AccessGrantedOverlay";
import { useIsDesktop } from "@/app/components/auth/useIsDesktop";
import { ACCESS, ACCESS_FONT, ACCESS_GRAD, rgba } from "@/app/components/auth/accessTokens";
import { IconCredentials, IconKey, IconHub, IconEye, IconEyeOff } from "@/app/components/auth/icons";

export default function PasswordGatePage() {
  const router = useRouter();
  const isDesktop = useIsDesktop(1200);
  const isTabletUp = useIsDesktop(768);
  const coreQuality = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  const reduced = !!useReducedMotion();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusField, setFocusField] = useState<AuthMachineState["focus"]>(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");

  const present = password.length > 0;
  const granted = phase === "success";

  const portalEnergy = granted ? 1 : phase === "loading" ? 0.96 : present ? 1 : 0;

  const machinePhase: AuthMachinePhase = granted
    ? "success"
    : phase === "loading"
      ? "submitting"
      : error
        ? "error"
        : present
          ? "armed"
          : "idle";
  const machineState: AuthMachineState = {
    modulesOnline: granted ? 6 : present ? 4 : 0,
    focus: focusField,
    phase: machinePhase,
    reducedMotion: reduced,
    quality: coreQuality,
  };

  const buttonState: AuthButtonState =
    phase === "loading" ? "loading" : granted ? "success" : present ? "idle" : "disabled";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!present) return;
    setPhase("loading");
    try {
      const res = await fetch("/api/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setPhase("success");
        window.setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 750);
      } else {
        setError("Hmm, that doesn't unlock the gate. Try again?");
        setPhase("idle");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setPhase("idle");
    }
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

  return (
    <div className="min-h-screen relative" style={{ background: ACCESS_GRAD.page, color: ACCESS.textBright, overflowX: "hidden" }}>
      <AuthBackdrop energy={portalEnergy} submitting={phase === "loading"} success={granted} />

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
              <span className="inline-flex items-center gap-2.5">
                <span className="flex items-center justify-center" style={{ width: 38, height: 38, borderRadius: 10, background: ACCESS_GRAD.brand, boxShadow: `0 0 18px ${rgba(ACCESS.cyan, 0.3)}` }}>
                  <span style={{ color: "#06080f", fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 14 }}>AX</span>
                </span>
                <span style={{ color: ACCESS.textBright, fontFamily: ACCESS_FONT.display, fontWeight: 800, fontSize: 19, letterSpacing: "-0.01em" }}>
                  Algorithm<span style={{ background: ACCESS_GRAD.brand, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>X</span>
                </span>
              </span>
            </div>

            <AuthTerminalPanel>
              <div
                className="inline-flex items-center gap-1.5 mb-4"
                style={{ padding: "4px 12px", borderRadius: 999, fontFamily: ACCESS_FONT.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: ACCESS.cyanSoft, background: rgba(ACCESS.cyan, 0.08), border: `1px solid ${rgba(ACCESS.cyan, 0.35)}` }}
              >
                <IconKey size={12} /> Invited guests only
              </div>

              <h1 className="mb-2" style={{ fontFamily: ACCESS_FONT.display, fontSize: "clamp(1.9rem, 2.6vw, 2.3rem)", fontWeight: 800, color: ACCESS.textBright, letterSpacing: "-0.02em", lineHeight: 1.08 }}>
                The gate is sealed
              </h1>
              <p className="mb-7" style={{ color: ACCESS.textSoft, fontSize: 15, fontWeight: 500, lineHeight: 1.5 }}>
                AlgorithmX is still being built. Enter the access password to step inside.
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
                <AuthField
                  id="gate-password"
                  label="Access password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  onFocus={() => setFocusField("password")}
                  onBlur={() => setFocusField(null)}
                  state={present ? "valid" : "idle"}
                  error={null}
                  icon={<IconCredentials size={18} />}
                  autoComplete="current-password"
                  placeholder="Enter the password"
                  rightSlot={passwordToggle}
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  required
                />
                <div className="pt-1">
                  <AuthButton
                    state={buttonState}
                    idleLabel="Open the gate"
                    loadingLabel="Unlocking…"
                    successLabel="Welcome"
                    disabledHint={!present ? "Enter the password to continue." : undefined}
                  />
                </div>
              </form>
            </AuthTerminalPanel>

            <p className="text-center mt-8" style={{ fontFamily: ACCESS_FONT.mono, fontSize: 11, letterSpacing: 2, color: ACCESS.textMuted }}>
              Six streams. One key.
            </p>
            <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
              {[
                { icon: <IconCredentials size={14} />, label: "ENCRYPTED" },
                { icon: <IconHub size={14} />, label: "UNDER CONSTRUCTION" },
              ].map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1.5" style={{ color: ACCESS.textMuted, fontSize: 10.5, fontWeight: 700, fontFamily: ACCESS_FONT.mono, letterSpacing: 1.4 }}>
                  {b.icon} {b.label}
                </span>
              ))}
            </div>
            <p className="text-center mt-6" style={{ fontSize: 12.5 }}>
              <a href="mailto:support@algorithmx.co.uk" className="transition hover:opacity-80" style={{ color: ACCESS.cyanSoft, fontWeight: 600 }}>
                Need help? support@algorithmx.co.uk
              </a>
            </p>
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

      {!isDesktop && <AccessGrantedOverlay show={granted} title="Gate open" subtitle="Entering AlgorithmX" />}
    </div>
  );
}
