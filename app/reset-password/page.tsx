"use client";

import { Suspense, useRef, useState } from "react";
import { passwordProblem, passwordRules } from "@/app/lib/passwordPolicy";
import { useRouter, useSearchParams } from "next/navigation";
import FrontShell, { TICK, TRUST_ICON, type FrontFx, type TrustItem } from "@/app/components/front-auth/FrontShell";
import { FrontButton, FrontField, RuleChips, type FrontButtonState } from "@/app/components/front-auth/FrontField";

/* Skin: the bright front door (landing lab round 7, r7-front-reset.html).
 * The token handling, the checks and their order, the API call, the
 * redirect to /login?reset=1 and every string are unchanged. */

const KEY = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 5l3 3M13 8l3 3" /></svg>
);

const TRUST: TrustItem[] = [
  { text: "Six streams. One key." },
  { text: "Encrypted", icon: TRUST_ICON.lock },
  { text: "Secure reset", icon: TRUST_ICON.key },
];

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const fxRef = useRef<FrontFx | null>(null);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [touched, setTouched] = useState<{ password?: boolean; confirm?: boolean }>({});
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");

  /* The same rule the server enforces (app/lib/passwordPolicy.ts). */
  const { length: ruleLength, upper: ruleUpper, special: ruleSpecial } = passwordRules(password);
  const passwordOk = passwordProblem(password) === null;
  const confirmOk = confirm.length > 0 && password === confirm;
  const allReady = passwordOk && confirmOk;
  const done = phase === "done";
  const noToken = !token;

  const buttonState: FrontButtonState =
    phase === "loading" ? "loading" : done ? "success" : allReady ? "idle" : "disabled";

  const missingHint = !passwordOk ? "Choose a stronger password." : !confirmOk ? "Confirm your password." : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ password: true, confirm: true });
    if (!passwordOk) {
      setError("Password needs 8+ characters, a capital and a special character.");
      return;
    }
    if (!confirmOk) {
      setError("Those passwords don't match.");
      return;
    }
    setPhase("loading");
    fxRef.current?.flash();
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Could not reset your password. Try requesting a new link.");
        setPhase("idle");
        return;
      }
      setPhase("done");
      fxRef.current?.success();
      window.setTimeout(() => router.push("/login?reset=1"), 2200);
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setPhase("idle");
    }
  };

  const foot = (
    <p className="fra-switch">
      Back to <a href="/login">Log in</a>
    </p>
  );

  if (noToken) {
    return (
      <FrontShell
        mode="reset"
        title="Link expired"
        sub="This reset link is broken or has expired. Request a fresh one and we'll send it over."
        trust={TRUST}
        fxRef={fxRef}
        foot={foot}
      >
        <a className="fra-btn fra-linkbtn" href="/forgot-password">
          {KEY}<span>Request a new link</span>
        </a>
      </FrontShell>
    );
  }

  if (done) {
    return (
      <FrontShell mode="reset" title="Password updated" sub={null} trust={TRUST} fxRef={fxRef} foot={foot}>
        <div className="fra-card" role="status" aria-live="polite">
          <b>{TICK}<span>You&apos;re all set</span></b>
          <p>Taking you to log in with your new password…</p>
        </div>
      </FrontShell>
    );
  }

  const passwordInvalid = !!touched.password && password.length > 0 && !passwordOk;
  const confirmInvalid = !!touched.confirm && confirm.length > 0 && !confirmOk;

  return (
    <FrontShell
      mode="reset"
      title="Choose a new password"
      sub="Make it strong: this protects your family's account."
      error={error}
      trust={TRUST}
      fxRef={fxRef}
      foot={foot}
    >
      <form className="fra-form" method="post" onSubmit={handleSubmit} noValidate>
        <FrontField
          id="reset-password"
          label="New password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={setPassword}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          invalid={passwordInvalid}
          auto="new-password"
          placeholder="Create a strong password"
          i={0}
          toggle={{ shown: showPassword, onToggle: () => setShowPassword((v) => !v), ariaShow: "Show password", ariaHide: "Hide password" }}
          after={<RuleChips rules={[[ruleLength, "8+ chars"], [ruleUpper, "Capital"], [ruleSpecial, "Special char"]]} />}
        />
        <FrontField
          id="reset-confirm"
          label="Confirm password"
          type={showConfirm ? "text" : "password"}
          value={confirm}
          onChange={setConfirm}
          onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
          invalid={confirmInvalid}
          fieldError={confirmInvalid ? "Those passwords don't match yet." : null}
          auto="new-password"
          placeholder="Type your password again"
          i={1}
          last
          toggle={{ shown: showConfirm, onToggle: () => setShowConfirm((v) => !v), ariaShow: "Show confirmation password", ariaHide: "Hide confirmation password" }}
        />
        <FrontButton state={buttonState} idleLabel="Set new password" loadingLabel="Saving…" successLabel="Saved" hint={missingHint} />
      </form>
    </FrontShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f7f8fb" }} />}>
      <ResetPasswordInner />
    </Suspense>
  );
}
