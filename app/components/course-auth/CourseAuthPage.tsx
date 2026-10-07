"use client";

/**
 * CourseAuthPage - the shared login/signup surface behind the four
 * course-themed auth routes (/cyberheroes, /cyberexplorers, /ops,
 * /pro + /login|/signup).
 *
 * Same auth plumbing as the platform pages (next-auth credentials
 * sign-in; the existing signup endpoint; the shared forgot-password
 * flow) - only the skin and the post-auth destination are per-course.
 * Route pages pass a course KEY string; the theme pack is looked up
 * client-side (JSX never crosses the server boundary).
 */

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { hubTargetFor, safeCourseSlug } from "@/app/lib/courseIntent";
import { COURSE_AUTH_THEMES, type CourseAuthKey } from "./themes";

type Mode = "login" | "signup";

function Inner({ course, mode }: { course: CourseAuthKey; mode: Mode }) {
  const t = COURSE_AUTH_THEMES[course];
  const router = useRouter();
  const searchParams = useSearchParams();

  /* Post-login destination: a same-origin callbackUrl wins, else the
   * course's own home via the shared course-intent helper. */
  const callbackRaw = searchParams.get("callbackUrl");
  const destination =
    callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//")
      ? callbackRaw
      : hubTargetFor(safeCourseSlug(t.slug));
  const justRegistered = searchParams.get("registered") === "true";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Fill in every field to continue.");
      return;
    }
    if (!isLogin) {
      if (!name.trim()) {
        setError("Fill in every field to continue.");
        return;
      }
      if (password.length < 8) {
        setError("Your password needs at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("The two passwords don't match.");
        return;
      }
    }

    setBusy(true);
    try {
      if (isLogin) {
        const res = await signIn("credentials", { email, password, redirect: false });
        if (res?.error) {
          setError("Those details don't match an account.");
          setBusy(false);
          return;
        }
        router.push(destination);
      } else {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(typeof data?.error === "string" ? data.error : "That didn't work. Try again.");
          setBusy(false);
          return;
        }
        router.push(`${t.base}/login?registered=true`);
      }
    } catch {
      setError("Something went wrong. Check your connection and try again.");
      setBusy(false);
    }
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 15px",
    borderRadius: 11,
    border: `1px solid ${t.palette.border}`,
    background: "rgba(0,0,0,0.3)",
    color: t.palette.text,
    fontFamily: t.fonts.body,
    fontSize: 15,
    outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontFamily: t.fonts.mono,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: t.palette.textSoft,
    margin: "0 0 7px",
  };

  return (
    <div
      className="course-auth-root"
      style={{
        position: "relative",
        minHeight: "100vh",
        background: t.palette.page,
        color: t.palette.text,
        fontFamily: t.fonts.body,
        overflowX: "hidden",
      }}
    >
      {t.backdrop}

      {/* Top chrome: course lockup left, back-to-course right */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, maxWidth: 1180, margin: "0 auto", padding: "26px 24px 0" }}>
        <Link href={t.base} style={{ textDecoration: "none" }}>{t.lockup}</Link>
        <Link
          href={t.base}
          className="course-auth-fade"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: t.fonts.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: t.palette.textSoft, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          <span aria-hidden>←</span> Back to {t.courseName}
        </Link>
      </div>

      {/* Panel */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", padding: "7vh 20px 80px" }}>
        <div
          style={{
            width: "100%",
            maxWidth: 440,
            background: t.palette.panel,
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: `1px solid ${t.palette.border}`,
            borderRadius: 20,
            padding: "34px 32px 30px",
            boxShadow: `0 26px 70px rgba(0,0,0,0.5), 0 0 52px -18px ${t.palette.accent}66`,
          }}
        >
          <h1 style={{ fontFamily: t.fonts.display, fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.12, margin: 0, color: t.palette.text }}>
            {isLogin ? t.copy.loginTitle : t.copy.signupTitle}
          </h1>
          <p style={{ fontFamily: t.fonts.body, fontSize: 14.5, lineHeight: 1.55, color: t.palette.textSoft, margin: "10px 0 22px" }}>
            {isLogin ? t.copy.loginSub : t.copy.signupSub}
          </p>

          {isLogin && justRegistered && !error && (
            <p role="status" aria-live="polite" style={{ margin: "0 0 16px", padding: "11px 13px", borderRadius: 11, fontSize: 13.5, fontWeight: 600, background: `${t.palette.success}1a`, border: `1px solid ${t.palette.success}66`, color: t.palette.success }}>
              {t.copy.registeredNotice}
            </p>
          )}
          {error && (
            <p role="alert" aria-live="polite" style={{ margin: "0 0 16px", padding: "11px 13px", borderRadius: 11, fontSize: 13.5, fontWeight: 600, background: `${t.palette.danger}1a`, border: `1px solid ${t.palette.danger}66`, color: t.palette.danger }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {!isLogin && (
              <div style={{ marginBottom: 15 }}>
                <label htmlFor="ca-name" style={labelStyle}>Your name</label>
                <input id="ca-name" type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} style={fieldStyle} placeholder="Your full name" />
              </div>
            )}
            <div style={{ marginBottom: 15 }}>
              <label htmlFor="ca-email" style={labelStyle}>Email</label>
              <input id="ca-email" type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} style={fieldStyle} placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: isLogin ? 8 : 15 }}>
              <label htmlFor="ca-password" style={labelStyle}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="ca-password"
                  type={showPw ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...fieldStyle, paddingRight: 64 }}
                  placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", cursor: "pointer", color: t.palette.textSoft, fontFamily: t.fonts.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.1em" }}
                >
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>
            {isLogin ? (
              <div style={{ display: "flex", justifyContent: "flex-end", margin: "0 0 18px" }}>
                <Link href="/forgot-password" className="course-auth-fade" style={{ fontSize: 12.5, fontWeight: 600, color: t.palette.textSoft, textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="ca-confirm" style={labelStyle}>Confirm password</label>
                <input id="ca-confirm" type={showPw ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={fieldStyle} placeholder="Type your password again" />
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="course-auth-cta"
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: 999,
                border: "none",
                cursor: busy ? "wait" : "pointer",
                background: t.palette.accent,
                color: t.palette.ink,
                fontFamily: t.fonts.mono,
                fontSize: 12.5,
                fontWeight: 800,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                boxShadow: `0 10px 30px ${t.palette.accent}59, inset 0 1px 0 rgba(255,255,255,0.3)`,
                opacity: busy ? 0.75 : 1,
              }}
            >
              {busy ? "One moment" : isLogin ? t.copy.submitLogin : t.copy.submitSignup}
            </button>
          </form>

          <p style={{ textAlign: "center", margin: "20px 0 0", fontSize: 13.5, fontWeight: 500, color: t.palette.textSoft }}>
            {isLogin ? (
              <>
                New here?{" "}
                <Link href={`${t.base}/signup`} style={{ color: t.palette.accent, fontWeight: 700, textDecoration: "none" }}>
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link href={`${t.base}/login`} style={{ color: t.palette.accent, fontWeight: 700, textDecoration: "none" }}>
                  Log in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <style jsx global>{`
        .course-auth-root input::placeholder {
          color: rgba(160, 170, 195, 0.55);
        }
        .course-auth-root input:focus {
          border-color: ${t.palette.accent} !important;
          box-shadow: 0 0 0 3px ${t.palette.accent}2e;
        }
        .course-auth-fade {
          transition: opacity 0.18s ease;
        }
        .course-auth-fade:hover {
          opacity: 0.75;
        }
        .course-auth-cta {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
        }
        .course-auth-cta:hover:not(:disabled) {
          transform: translateY(-1px);
        }
        .course-auth-cta:active:not(:disabled) {
          transform: translateY(0) scale(0.99);
        }
      `}</style>
    </div>
  );
}

export default function CourseAuthPage({ course, mode }: { course: CourseAuthKey; mode: Mode }) {
  const t = COURSE_AUTH_THEMES[course];
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: t.palette.page }} />}>
      <Inner course={course} mode={mode} />
    </Suspense>
  );
}
