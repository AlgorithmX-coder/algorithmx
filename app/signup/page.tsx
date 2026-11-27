"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { safeCourseSlug, courseHomeFor } from "@/app/lib/courseIntent";
import { passwordProblem, passwordRules } from "@/app/lib/passwordPolicy";
import FrontShell, { TRUST_ICON, type FrontFx, type TrustItem } from "@/app/components/front-auth/FrontShell";
import { FrontButton, FrontField, RuleChips, type FrontButtonState } from "@/app/components/front-auth/FrontField";

/* The generic sign-up: teacher and firm invitees arrive with
 * ?callbackUrl=<join link>. Skin: the bright front door (landing lab round 7,
 * r7-front-signup.html). Fields, ids, checks, messages and redirects are
 * unchanged. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SignupPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fxRef = useRef<FrontFx | null>(null);

  /* Preserve ?course= intent through the auth flow so the hub can
   * highlight it after login. Validated to a safe slug shape. */
  const course = safeCourseSlug(searchParams.get("course"));
  /* A join link sends its own address here so the new account lands back
   * on the seat. Same-origin only. */
  const callbackRaw = searchParams.get("callbackUrl");
  const safeCallback = callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//") ? callbackRaw : null;
  const forCourse = !!safeCallback && (safeCallback.startsWith("/ai-cleared") || safeCallback.startsWith("/ai-fluent"));

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
  const [formError, setFormError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");

  /* Derived validity, kept in one block so the button and hint map cleanly against it. */
  const nameOk = name.trim().length > 0;
  const emailOk = EMAIL_RE.test(email);
  /* The same rule the server enforces (app/lib/passwordPolicy.ts). */
  const { length: ruleLength, upper: ruleUpper, special: ruleSpecial } = passwordRules(password);
  const passwordOk = passwordProblem(password) === null;
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

  const buttonState: FrontButtonState =
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
    fxRef.current?.flash();
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Couldn't create your account just yet. Try again?");
        setPhase("idle");
        return;
      }

      setPhase("success");
      fxRef.current?.success();
      // Account created but not signed in: route through /login, carrying
      // the intended hub destination (with any selected course).
      const loginUrl = `/login?registered=true&callbackUrl=${encodeURIComponent(safeCallback ?? courseHomeFor(course))}`;
      window.setTimeout(() => {
        router.push(loginUrl);
      }, 1100);
    } catch (err) {
      const detail = err instanceof Error ? err.message : "Network error";
      setFormError(`Couldn't reach the server. ${detail}. If this keeps happening, email support@algorithmx.co.uk.`);
      setPhase("idle");
    }
  };

  const nameInvalid = !!touched.name && !nameOk;
  const emailInvalid = !!touched.email && email.length > 0 && !emailOk;
  const passwordInvalid = !!touched.password && password.length > 0 && !passwordOk;
  const confirmInvalid = !!touched.confirm && confirmPassword.length > 0 && !confirmOk;

  const trust: TrustItem[] = [
    ...(forCourse ? [] : [{ text: "Six streams. One key." }]),
    { text: "Encrypted", icon: TRUST_ICON.lock },
    { text: "Family safe", icon: TRUST_ICON.person },
    { text: "UK GDPR aligned", icon: TRUST_ICON.shield },
  ];

  return (
    <FrontShell
      mode="signup"
      title={forCourse ? "Your seat is waiting" : "Bring AlgorithmX online"}
      sub={forCourse ? "Create your account with your work email, then your seat is yours." : "Create your account."}
      error={formError}
      trust={trust}
      fxRef={fxRef}
      foot={
        <>
          <p className="fra-switch">
            Already have an account? <a href="/login">Log in</a>
          </p>
          <p className="fra-legal">
            <a href="/terms">Terms</a>
            <span aria-hidden="true"> · </span>
            <a href="/privacy">Privacy</a>
          </p>
        </>
      }
    >
      <form className="fra-form" method="post" onSubmit={handleSubmit} noValidate>
        <FrontField
          id="signup-name"
          label="Full name"
          type="text"
          value={name}
          onChange={setName}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          invalid={nameInvalid}
          fieldError={nameInvalid ? "We'll need your name." : null}
          auto="name"
          placeholder="Your full name"
          i={0}
        />
        <FrontField
          id="signup-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          invalid={emailInvalid}
          fieldError={emailInvalid ? "That email doesn't look right." : null}
          auto="email"
          inputMode="email"
          placeholder={forCourse ? "you@yourfirm.co.uk" : "you@example.com"}
          i={1}
        />
        <FrontField
          id="signup-password"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          invalid={passwordInvalid}
          auto="new-password"
          placeholder="Create a strong password"
          i={2}
          toggle={{ shown: showPassword, onToggle: () => setShowPassword((v) => !v), ariaShow: "Show password", ariaHide: "Hide password" }}
          after={<RuleChips rules={[[ruleLength, "8+ chars"], [ruleUpper, "Capital"], [ruleSpecial, "Special char"]]} />}
        />
        <FrontField
          id="signup-confirm"
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          value={confirmPassword}
          onChange={setConfirmPassword}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          invalid={confirmInvalid}
          fieldError={confirmInvalid ? "Those passwords don't match yet." : null}
          auto="new-password"
          placeholder="Type your password again"
          i={3}
          last
          toggle={{ shown: showConfirm, onToggle: () => setShowConfirm((v) => !v), ariaShow: "Show confirmation password", ariaHide: "Hide confirmation password" }}
        />
        <FrontButton
          state={buttonState}
          idleLabel={forCourse ? "Create my account" : "Power on"}
          loadingLabel="Powering on…"
          successLabel="Account ready"
          hint={missingHint}
        />
      </form>
    </FrontShell>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f7f8fb" }} />}>
      <SignupPageInner />
    </Suspense>
  );
}
