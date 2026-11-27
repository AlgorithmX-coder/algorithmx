"use client";

import { Suspense, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { LOGIN_LIMITED_CODE, TOO_MANY } from "@/app/lib/rateLimitWords";
import { useRouter, useSearchParams } from "next/navigation";
import { safeCourseSlug, courseHomeFor } from "@/app/lib/courseIntent";
import FrontShell, { TRUST_ICON, type FrontFx, type TrustItem } from "@/app/components/front-auth/FrontShell";
import { FrontButton, FrontField, type FrontButtonState } from "@/app/components/front-auth/FrontField";

/* The generic sign-in: teachers (via /schools/login), firm and school
 * invitees, the e2e setup and anyone without a course context land here.
 * Skin: the bright front door (landing lab round 7, r7-front-login.html).
 * Fields, ids, checks, messages and redirects are unchanged. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fxRef = useRef<FrontFx | null>(null);

  /* Post-login destination. Priority:
   *   1. ?callbackUrl=… — same-origin guard ("/" but not "//").
   *   2. ?course=<slug> — straight into that course's own portal.
   *   3. the catalogue  — no course context, so let them pick. */
  const callbackRaw = searchParams.get("callbackUrl");
  const course = safeCourseSlug(searchParams.get("course"));
  const safeCallback =
    callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//") ? callbackRaw : courseHomeFor(course);

  const justRegistered = searchParams.get("registered") === "true";
  const forCourse = safeCallback.startsWith("/ai-cleared") || safeCallback.startsWith("/ai-fluent");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");

  const emailValid = EMAIL_RE.test(email);
  const emailInvalid = !!touched.email && email.length > 0 && !emailValid;
  const passwordPresent = password.length > 0;
  const passwordInvalid = !!touched.password && !passwordPresent;
  const granted = phase === "success";

  const buttonState: FrontButtonState = phase === "loading" ? "loading" : granted ? "success" : "idle";

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
    fxRef.current?.flash();
    const res = await signIn("credentials", { email, password, redirect: false });

    if (res?.error) {
      setFormError(res.code === LOGIN_LIMITED_CODE ? TOO_MANY : "Those details don't match an account.");
      setPhase("idle");
      return;
    }

    setPhase("success");
    fxRef.current?.success();
    // Long enough for the six streams to fire before we route. Still snappy.
    window.setTimeout(() => {
      router.push(safeCallback);
    }, 1050);
  };

  const trust: TrustItem[] = [
    ...(forCourse ? [] : [{ text: "Six streams. One key." }]),
    { text: "Encrypted", icon: TRUST_ICON.lock },
    { text: "Secure session", icon: TRUST_ICON.key },
    { text: "One hub", icon: TRUST_ICON.hub },
  ];

  return (
    <FrontShell
      mode="login"
      title={forCourse ? "Sign in to your course" : "Welcome back"}
      sub={null}
      notice={justRegistered && !formError ? "Account created. Log in to power on." : ""}
      error={formError}
      trust={trust}
      fxRef={fxRef}
      foot={
        <p className="fra-switch">
          Don&apos;t have an account?{" "}
          <a href={forCourse ? `/signup?callbackUrl=${encodeURIComponent(safeCallback)}` : "/signup"}>Sign up</a>
        </p>
      }
    >
      <form className="fra-form" method="post" onSubmit={handleSubmit} noValidate>
        <FrontField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          invalid={emailInvalid}
          fieldError={emailInvalid ? "That email doesn't look right." : null}
          auto="email"
          inputMode="email"
          placeholder={forCourse ? "you@yourfirm.co.uk" : "parent@example.com"}
          i={0}
        />
        <FrontField
          id="login-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          invalid={passwordInvalid}
          fieldError={passwordInvalid ? "Add your password." : null}
          auto="current-password"
          placeholder="Enter your password"
          i={1}
          toggle={{ shown: showPassword, onToggle: () => setShowPassword((v) => !v), ariaShow: "Show password", ariaHide: "Hide password" }}
        />
        <div className="fra-row">
          <a className="fra-forgot" href="/forgot-password">Forgot password?</a>
        </div>
        <FrontButton
          state={buttonState}
          idleLabel={forCourse ? "Sign in" : "Resume"}
          loadingLabel={forCourse ? "Signing in…" : "Resuming…"}
          successLabel="You're in"
        />
      </form>
    </FrontShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f7f8fb" }} />}>
      <LoginPageInner />
    </Suspense>
  );
}
