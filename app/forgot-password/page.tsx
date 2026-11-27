"use client";

import { useRef, useState } from "react";
import { TOO_MANY } from "@/app/lib/rateLimitWords";
import FrontShell, { TICK, TRUST_ICON, type FrontFx } from "@/app/components/front-auth/FrontShell";
import { FrontButton, FrontField, type FrontButtonState } from "@/app/components/front-auth/FrontField";

/* Skin: the bright front door (landing lab round 7, r7-front-forgot.html).
 * The check, the API call, the anti-enumeration posture and every string are
 * unchanged. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const fxRef = useRef<FrontFx | null>(null);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "sent">("idle");

  const emailValid = EMAIL_RE.test(email);
  const emailInvalid = touched && email.length > 0 && !emailValid;
  const sent = phase === "sent";

  const buttonState: FrontButtonState =
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
    fxRef.current?.flash();
    try {
      // Always succeeds from the UI's point of view: the API never reveals
      // whether the email matched an account (anti-enumeration).
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      /* The one answer that is not "sent": too many requests. */
      if (res.status === 429) {
        const data = await res.json().catch(() => null);
        setError(typeof data?.error === "string" ? data.error : TOO_MANY);
        setPhase("idle");
        return;
      }
    } catch {
      /* swallow: same posture; the email itself is the retry path */
    }
    setPhase("sent");
    fxRef.current?.success();
  };

  return (
    <FrontShell
      mode="forgot"
      title="Reset your password"
      sub="Enter your email and we'll send a secure link to set a new one."
      error={sent ? "" : error}
      trust={[
        { text: "Six streams. One key." },
        { text: "Encrypted", icon: TRUST_ICON.lock },
        { text: "Secure reset", icon: TRUST_ICON.key },
      ]}
      fxRef={fxRef}
      foot={
        <p className="fra-switch">
          Remembered it? <a href="/login">Log in</a>
        </p>
      }
    >
      {sent ? (
        <div className="fra-card" role="status" aria-live="polite">
          <b>{TICK}<span>Check your email</span></b>
          <p>If an account exists for <em>{email}</em>, a reset link is on its way.</p>
        </div>
      ) : (
        <form className="fra-form" method="post" onSubmit={handleSubmit} noValidate>
          <FrontField
            id="forgot-email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            onBlur={() => setTouched(true)}
            invalid={emailInvalid}
            fieldError={emailInvalid ? "That email doesn't look right." : null}
            auto="email"
            inputMode="email"
            placeholder="parent@example.com"
            i={0}
            last
          />
          <FrontButton
            state={buttonState}
            idleLabel="Send reset link"
            loadingLabel="Sending…"
            successLabel="Sent"
            hint={!emailValid ? "Enter your email to continue." : undefined}
          />
        </form>
      )}
    </FrontShell>
  );
}
