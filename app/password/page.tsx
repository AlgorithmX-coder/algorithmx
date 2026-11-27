"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import { TOO_MANY } from "@/app/lib/rateLimitWords";
import GateLock from "./GateLock";
import { seatedArcs, type GateState } from "./lockRules";
import "./gate.css";

/**
 * The launch gate, in daylight (owner-approved landing lab round 8,
 * r8-gate.html): the light Hologram ground, the lockup and the "Invited
 * guests only" chip, the words and form on the left and the aperture lock on
 * the right. Each pair of characters typed seats one of six course-colour
 * arcs, capped at five; only the server accepting the password seats the
 * sixth, spins the rings up and opens the core, then the redirect runs. A
 * wrong password turns the seated arcs red and shakes the form.
 *
 * The POST, the cookie (set by /api/password), the redirect and every
 * message are unchanged from the dark gate this replaces.
 *
 * Styles: gate.css, every rule under .agt. State lives in data attributes on
 * the root: data-gate (sealed | typing | checking | wrong | open), data-err
 * (a message is showing) and data-still (Pause pressed).
 */

const disp = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--agt-disp", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--agt-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["600", "700"], variable: "--agt-mono", display: "swap" });

const rise = (i: number) => ({ "data-rise": "", style: { "--i": i } as CSSProperties });

const WRONG_MS = 1600;

export default function PasswordGatePage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "success">("idle");
  const [wrong, setWrong] = useState(false);
  const [still, setStill] = useState(false);
  const wrongTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(wrongTimer.current), []);

  const present = password.length > 0;
  const granted = phase === "success";

  const gate: GateState = granted
    ? "open"
    : phase === "loading"
      ? "checking"
      : wrong
        ? "wrong"
        : present
          ? "typing"
          : "sealed";

  const hint = error || (granted ? "Gate open. Entering AlgorithmX" : !present ? "Enter the password to continue." : "");
  const buttonLabel = granted ? "Welcome" : phase === "loading" ? "Unlocking…" : "Open the gate";
  const locked = !present || phase !== "idle";

  const flashWrong = () => {
    window.clearTimeout(wrongTimer.current);
    setWrong(true);
    wrongTimer.current = window.setTimeout(() => setWrong(false), WRONG_MS);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!present) return;
    window.clearTimeout(wrongTimer.current);
    setWrong(false);
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
      } else if (res.status === 429) {
        setError(typeof data.error === "string" ? data.error : TOO_MANY);
        setPhase("idle");
      } else {
        setError("Hmm, that doesn't unlock the gate. Try again?");
        setPhase("idle");
        flashWrong();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setPhase("idle");
    }
  };

  return (
    <div
      className={`agt ${disp.variable} ${sans.variable} ${mono.variable}`}
      data-gate={gate}
      data-err={error ? "" : undefined}
      data-still={still ? "" : undefined}
    >
      <div className="agt-ground" aria-hidden="true">
        <span className="grid" />
        <span className="pool a" />
        <span className="pool b" />
        <span className="st" style={{ left: "7%", "--s": "255,150,60", "--d": "11s" } as CSSProperties} />
        <span className="st" style={{ left: "94%", "--s": "139,123,255", "--d": "10s", "--o": "-5s" } as CSSProperties} />
      </div>

      <header className="agt-top">
        <span className="agt-brand">
          <span className="mark">
            {/* eslint-disable-next-line @next/next/no-img-element -- a static 32px mark */}
            <img src="/favicon.svg" alt="" width={22} height={22} />
          </span>
          <span className="name">
            Algorithm<em>X</em>
          </span>
        </span>
        <span className="agt-chip">
          <i />
          Invited guests only
        </span>
      </header>

      <main className="agt-stage">
        <section className="agt-copy">
          <h1 {...rise(0)}>
            The gate is <em>{granted ? "open" : "sealed"}</em>
          </h1>
          <p className="lead" {...rise(1)}>
            AlgorithmX is still being built. Enter your access password to step inside.
          </p>
          {/* The rise-in sits on a wrapper so the wrong-password shake never replaces it. */}
          <div {...rise(2)}>
            <form className="agt-form" method="post" onSubmit={handleSubmit} noValidate>
              <div className="agt-field">
                <label htmlFor="gate-password">Access password</label>
                <div className="in">
                  <input
                    id="gate-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the password"
                    autoComplete="current-password"
                    aria-invalid={error ? true : undefined}
                    aria-describedby="gate-hint"
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>
              <button className="agt-btn" type="submit" disabled={locked} aria-busy={phase === "loading" || undefined}>
                {buttonLabel}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14 M13 6l6 6-6 6" />
                </svg>
              </button>
              <p className="agt-hint" id="gate-hint" role="status" aria-live="polite">
                {hint}
              </p>
            </form>
          </div>
          <div className="agt-meta" {...rise(3)}>
            <span>Six streams &middot; one key</span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 017 0v3" />
              </svg>
              Encrypted
            </span>
            <span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5" />
              </svg>
              Under construction
            </span>
          </div>
          <p className="agt-help" {...rise(4)}>
            Need help? <a href="mailto:support@algorithmx.co.uk">support@algorithmx.co.uk</a>
          </p>
        </section>

        <GateLock seated={seatedArcs(password.length, granted)} open={granted} />
      </main>

      <button
        className="agt-pause"
        type="button"
        onClick={() => setStill((v) => !v)}
        aria-pressed={still}
        aria-label={still ? "Play motion" : "Pause motion"}
      >
        {still ? (
          <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <path d="M3 1.5v9l7.5-4.5z" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
            <rect x="2" y="1.5" width="3" height="9" rx="1" />
            <rect x="7" y="1.5" width="3" height="9" rx="1" />
          </svg>
        )}
      </button>
    </div>
  );
}
