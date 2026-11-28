"use client";

import { useEffect, useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import BrandCube from "@/app/components/BrandCube";
import { backTarget, type BackTarget } from "./backTarget";
import "./crash.css";

/**
 * The crash screen behind app/error.tsx and app/global-error.tsx.
 *
 * The owner-approved bright design (landing lab round 7, "Daylight
 * Console"): the front door's light house, one white console, a rose
 * "Error" chip, Try again and Back to home, and a reference the visitor can
 * copy into an email to support. The styles are one scoped sheet
 * (crash.css, prefix .axcrash) and state lives in data attributes.
 *
 * Every crash is reported to Sentry once, when the screen mounts. The
 * reference shown is the error's digest (the id Next puts on a server
 * error, which matches the server logs) or, for an error thrown in the
 * browser, the id of the Sentry event just sent. The digest and the path
 * go to Sentry as tags so a quoted reference can be searched for. The
 * server already logs the digest for a server error; the "[crash]" console
 * line runs in the browser and is for the visitor's own devtools.
 *
 * The second button leads back into the area the visitor crashed in (their
 * classes, the console, the course) rather than the public homepage; see
 * backTarget.ts. The server render has no window, so it starts as Back to
 * home and the mount effect swaps in the real target.
 *
 * "page" renders inside the root layout; "global" replaces the root layout
 * (global-error), so it uses system fonts, draws no pools and leaves the
 * cube out: it must not depend on anything else in the app loading.
 */

const display = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"], variable: "--axcrash-disp", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--axcrash-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["600", "700"], variable: "--axcrash-mono", display: "swap" });

const SUPPORT = "support@algorithmx.co.uk";

const COPY = {
  page: {
    title: "Something went wrong",
    sub: "That one is on us, not you. Try again, or head home and pick up from there.",
    retry: "Try again",
    busy: "Trying again",
  },
  global: {
    title: "AlgorithmX couldn't load",
    sub: "Something failed before the page could start. Reload to try again.",
    retry: "Reload",
    busy: "Reloading",
  },
} as const;

const WARN = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </svg>
);
const RETRY = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 12a9 9 0 0115.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.2L3 16M3 21v-5h5" />
  </svg>
);
const HOME = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1z" />
  </svg>
);

function stamp(d: Date): string {
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function CrashScreen({
  error,
  onRetry,
  variant,
}: {
  error: Error & { digest?: string };
  onRetry: () => void;
  variant: "page" | "global";
}) {
  const c = COPY[variant];
  const [eventId, setEventId] = useState<string | null>(null);
  const [when, setWhen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [back, setBack] = useState<BackTarget>({ href: "/", label: "Back to home" });

  /* Report once per error. Set in an effect so the server render and the
     first client render agree (no clock or event id on the server). */
  useEffect(() => {
    const path = window.location.pathname;
    const digest = error.digest ?? "none";
    const id = Sentry.captureException(error, {
      tags: { boundary: variant === "global" ? "global-error" : "error", digest, path },
    });
    console.error("[crash]", { digest, path });
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the event id only exists once Sentry has been told, which is this effect's job
    setEventId(id ?? null);
    setWhen(stamp(new Date()));
    setBack(backTarget(path));
  }, [error, variant]);

  const ref = error.digest ?? eventId;
  const refLine = ref ? `${ref}${when ? ` · ${when}` : ""}` : null;

  function retry() {
    if (busy) return;
    setBusy(true);
    onRetry();
    /* If the retry renders the page, this screen unmounts. If it fails
       again the boundary shows this screen anew; either way the button
       comes back so it is never stuck spinning. */
    window.setTimeout(() => setBusy(false), 1600);
  }

  async function copy() {
    if (!refLine) return;
    try {
      await navigator.clipboard.writeText(refLine);
    } catch {
      /* Clipboard can be blocked; the reference is still on screen to read. */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  const mailto = `mailto:${SUPPORT}?subject=${encodeURIComponent(ref ? `Error ${ref}` : "Something went wrong")}`;

  return (
    <div className={`axcrash ${display.variable} ${sans.variable} ${mono.variable}`} data-variant={variant}>
      <div className="axcrash-grid" aria-hidden="true" />
      <div className="axcrash-pool" data-pool="cyan" aria-hidden="true" />
      <div className="axcrash-pool" data-pool="violet" aria-hidden="true" />

      <header className="axcrash-chrome">
        {/* A plain anchor, not next/link: a full load is the surest way out
            of a broken page, and global-error has no router to lean on. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full load on purpose, see above */}
        <a className="axcrash-lockup" href="/" aria-label="AlgorithmX home">
          {variant === "page" && <BrandCube size={22} />}
          <span className="axcrash-word">
            Algorithm<b>X</b>
          </span>
        </a>
      </header>

      <main className="axcrash-stage">
        <div className="axcrash-wrap">
          <section className="axcrash-console" aria-labelledby="axcrash-title">
            <div className="axcrash-head">
              <span className="axcrash-kick">
                {WARN}
                Error
              </span>
              <h1 className="axcrash-title" id="axcrash-title">
                {c.title}
              </h1>
              <p className="axcrash-sub">{c.sub}</p>
            </div>

            <div className="axcrash-actions">
              <button className="axcrash-btn" type="button" onClick={retry} data-busy={busy ? "true" : "false"} aria-busy={busy}>
                {RETRY}
                <span>{busy ? `${c.busy}…` : c.retry}</span>
              </button>
              {/* A plain anchor on purpose: a full load is the surest way out of a broken page. */}
              <a className="axcrash-btn" data-kind="ghost" href={back.href}>
                {HOME}
                <span>{back.label}</span>
              </a>
            </div>

            {refLine && (
              <div className="axcrash-ref">
                <span className="axcrash-ref-t">
                  <span className="axcrash-ref-k">Reference</span>
                  <code id="axcrash-ref">{refLine}</code>
                </span>
                <button className="axcrash-copy" type="button" onClick={copy} aria-describedby="axcrash-ref" data-done={copied ? "true" : "false"}>
                  {copied ? "COPIED" : "COPY"}
                </button>
              </div>
            )}
            <p className="axcrash-sr" role="status" aria-live="polite">
              {copied ? "Reference copied." : ""}
            </p>
          </section>

          <p className="axcrash-help">
            Still stuck? Email <a href={mailto}>{SUPPORT}</a>
            {refLine ? " with the reference." : "."}
          </p>
        </div>
      </main>
    </div>
  );
}
