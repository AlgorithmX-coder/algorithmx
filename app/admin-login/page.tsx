"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { K } from "@/app/admin/adminTokens";

/* /admin-login: a plain, utilitarian sign-in for staff, deliberately
 * separate from the customer-facing /login (which is themed/animated
 * for the consumer product). Same underlying mechanism - NextAuth
 * credentials - just different chrome, so it reads as an internal tool
 * rather than part of the public site. Lives outside app/admin/ so it
 * is not itself wrapped by app/admin/layout.tsx's staff gate (which
 * redirects here when signed out). */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function AdminLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackRaw = searchParams.get("callbackUrl");
  const safeCallback = callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//") ? callbackRaw : "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setBusy(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Those details don't match an account.");
      setBusy(false);
      return;
    }
    router.push(safeCallback);
    router.refresh();
  }

  return (
    <div className="al-shell">
      <form className="al-card" onSubmit={handleSubmit}>
        <span className="al-brand">AlgorithmX &middot; <i>Staff</i></span>
        <h1 className="al-h1">Sign in</h1>
        <p className="al-note">Internal tool. Staff accounts only.</p>

        {error && <div className="al-err">{error}</div>}

        <label>
          Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@algorithmx.co.uk" />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
        </label>

        <button type="submit" className="al-btn" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>

        <a className="al-forgot" href="/forgot-password">Forgot password?</a>
      </form>

      <style>{`
        .al-shell { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: ${K.ground}; font-family: ${K.sans}; padding: 24px; }
        .al-card { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 360px; background: ${K.panel}; border: 1px solid ${K.edge}; border-radius: 16px; padding: 28px; }
        .al-brand { font-family: ${K.mono}; font-size: 12px; letter-spacing: 0.08em; color: ${K.accentInk}; }
        .al-brand i { font-style: normal; }
        .al-h1 { font-family: ${K.display}; font-size: 26px; margin: 2px 0 0; color: ${K.ink}; }
        .al-note { font-size: 13px; color: ${K.muted}; margin: 0 0 6px; }
        .al-card label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        .al-card input { font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 10px 12px; }
        .al-card input:focus { outline: none; border-color: ${K.accent}; }
        .al-btn { margin-top: 4px; font-size: 14px; font-weight: 600; padding: 10px 16px; border-radius: 10px; border: 1px solid ${K.accent}; background: ${K.accent}; color: ${K.onAccent}; cursor: pointer; }
        .al-btn:disabled { opacity: 0.6; cursor: default; }
        .al-forgot { align-self: center; font-size: 12.5px; color: ${K.accentInk}; text-decoration: none; margin-top: 4px; }
        .al-err { font-size: 13px; color: ${K.warn}; background: ${K.warnSoft}; border-radius: 8px; padding: 8px 10px; }
      `}</style>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <AdminLoginInner />
    </Suspense>
  );
}
