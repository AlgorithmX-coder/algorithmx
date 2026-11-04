"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/app/admin/admin.css";

/* /admin-login: a plain, utilitarian sign-in for staff, deliberately
 * separate from the customer-facing /login (which is themed/animated
 * for the consumer product). Same underlying mechanism - NextAuth
 * credentials - just different chrome, so it reads as an internal tool
 * rather than part of the public site. Lives outside app/admin/ so it
 * is not itself wrapped by app/admin/layout.tsx's staff gate (which
 * redirects here when signed out) - so it imports admin.css directly
 * rather than inheriting it from that layout. */

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
    <div className="admin-ui al-shell">
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
