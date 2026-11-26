"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { LOGIN_LIMITED_CODE, TOO_MANY } from "@/app/lib/rateLimitWords";
import { useRouter, useSearchParams } from "next/navigation";
import BrandCube from "@/app/components/BrandCube";
import Wordmark from "@/app/admin/Wordmark";
import "@/app/admin/admin.css";

/* /admin-login: the staff sign-in, deliberately separate from the
 * customer-facing /login (which is themed per course for the consumer
 * product). Same underlying mechanism - NextAuth credentials - with the
 * console's own chrome, so it reads as the door to an internal tool.
 * Lives outside app/admin/ so it is not itself wrapped by
 * app/admin/layout.tsx's staff gate (which redirects here when signed
 * out), so it imports admin.css directly. */

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
      setError(res.code === LOGIN_LIMITED_CODE ? TOO_MANY : "Those details don't match an account.");
      setBusy(false);
      return;
    }
    router.push(safeCallback);
    router.refresh();
  }

  return (
    <div className="admin-ui al-shell">
      <form className="al-card" method="post" onSubmit={handleSubmit}>
        <div className="al-brand">
          <BrandCube size={44} />
          <Wordmark tag="Staff access" />
        </div>
        <h1 className="al-h1">Sign in</h1>
        <p className="al-note">The management console. Staff accounts only.</p>

        {error && <div className="al-err">{error}</div>}

        <label>
          Email
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@algorithmx.co.uk" />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
        </label>

        <button type="submit" className="al-btn" disabled={busy}>{busy ? "Signing in…" : "Open the console"}</button>

        <a className="al-forgot" href="/forgot-password">Forgot password?</a>

        <div className="al-foot"><span className="admin-live-dot" aria-hidden="true" />Encrypted &middot; Staff only</div>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="admin-ui" style={{ minHeight: "100vh" }} />}>
      <AdminLoginInner />
    </Suspense>
  );
}
