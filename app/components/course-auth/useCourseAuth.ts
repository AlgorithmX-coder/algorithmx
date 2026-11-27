"use client";

/**
 * The auth plumbing behind every course-themed login and signup page
 * (the Night Console skin, every course). Same plumbing as the platform pages: next-auth
 * credentials sign-in, the existing signup endpoint, the shared
 * forgot-password flow. Only the skin differs per course.
 *
 * Order of the client checks is load-bearing (the live pages, and the
 * owner-approved states): empty email or password, then an empty name on
 * signup, then the 8-character rule, then the mismatch. `invalid` names
 * the fields the failing check was about, for skins that mark them.
 */

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LOGIN_LIMITED_CODE, TOO_MANY } from "@/app/lib/rateLimitWords";
import { courseHomeFor, safeCourseSlug } from "@/app/lib/courseIntent";
import { passwordProblem } from "@/app/lib/passwordPolicy";
import { SHARED, authPack, type AuthPackKey } from "./content";

export type AuthMode = "login" | "signup";
export type FieldKey = "name" | "email" | "password" | "confirm";

export function useCourseAuth(course: AuthPackKey, mode: AuthMode) {
  const t = authPack(course);
  const router = useRouter();
  const searchParams = useSearchParams();

  /* Post-login destination: a same-origin callbackUrl wins, else the
   * course's own home via the shared course-intent helper (or the pack's
   * own home, for the firm tracks that helper does not map). */
  const callbackRaw = searchParams.get("callbackUrl");
  const callback = callbackRaw && callbackRaw.startsWith("/") && !callbackRaw.startsWith("//") ? callbackRaw : null;
  const destination = callback ?? t.home ?? courseHomeFor(safeCourseSlug(t.slug));
  const justRegistered = searchParams.get("registered") === "true";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [invalid, setInvalid] = useState<FieldKey[]>([]);

  const isLogin = mode === "login";

  const setters: Record<FieldKey, (v: string) => void> = { name: setName, email: setEmail, password: setPassword, confirm: setConfirm };
  const values: Record<FieldKey, string> = { name, email, password, confirm };
  /** value + onChange for one input; typing in a marked field clears its mark. */
  const field = (key: FieldKey) => ({
    value: values[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setters[key](e.target.value);
      setInvalid((cur) => (cur.includes(key) ? cur.filter((k) => k !== key) : cur));
    },
  });

  /** Runs the checks, then the real request. `onSend` fires the moment the
   *  checks pass and the request goes out (skins flash the light on it). */
  async function submit(onSend?: () => void): Promise<void> {
    setError("");
    setInvalid([]);

    if (!email.trim() || !password) {
      setError(SHARED.errors.empty);
      const bad: FieldKey[] = [];
      if (!email.trim()) bad.push("email");
      if (!password) bad.push("password");
      if (!isLogin && !name.trim()) bad.push("name");
      setInvalid(bad);
      return;
    }
    if (!isLogin) {
      if (!name.trim()) {
        setError(SHARED.errors.empty);
        setInvalid(["name"]);
        return;
      }
      /* The server's own rule, so the form never lets through a password
         the signup route will refuse. */
      const weak = passwordProblem(password);
      if (weak) {
        setError(password.length < 8 ? SHARED.errors.short : `${weak}.`);
        setInvalid(["password"]);
        return;
      }
      if (password !== confirm) {
        setError(SHARED.errors.mismatch);
        setInvalid(["confirm"]);
        return;
      }
    }

    setBusy(true);
    onSend?.();
    try {
      if (isLogin) {
        const res = await signIn("credentials", { email, password, redirect: false });
        if (res?.error) {
          setError(res.code === LOGIN_LIMITED_CODE ? TOO_MANY : SHARED.errors.noMatch);
          setBusy(false);
          return;
        }
        router.push(destination);
      } else {
        const res = await fetch("/api/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password, course: t.slug }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(typeof data?.error === "string" ? data.error : SHARED.errors.fallback);
          setBusy(false);
          return;
        }
        /* A callback (the buy page, say) survives the hop to sign-in. */
        router.push(`${t.base}/login?registered=true${callback ? `&callbackUrl=${encodeURIComponent(callback)}` : ""}`);
      }
    } catch {
      setError(SHARED.errors.network);
      setBusy(false);
    }
  }

  return {
    t,
    isLogin,
    justRegistered,
    field,
    showPw,
    toggleShowPw: () => setShowPw((v) => !v),
    error,
    busy,
    invalid,
    submit,
  };
}
