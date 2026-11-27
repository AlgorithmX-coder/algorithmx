"use client";

/**
 * The certificate page's "Light Table" (landing lab round 6, family certs,
 * v1, 2026-11-23): the issued A4 landscape sheet lit on the course's night
 * table, the actions in a column beside it. The facts on it are the live
 * ones CertificateView reads (holder, firm, track, dates, serial, the
 * CERT_COPY line and chips); the download is the live PDF route,
 * untouched; "Email me a copy" posts exactly as before. There is no locked
 * state (the server sends anyone without a certificate back to the
 * course) and no verify URL anywhere.
 *
 * Reveal and pause state live on data attributes on the root. Print shows
 * only the sheet, A4 landscape (light-table.css).
 */

import Link from "next/link";
import ByAlgorithmX from "@/app/components/ByAlgorithmX";
import { useEffect, useState } from "react";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import type { CertifiedCourseSlug } from "../engine/courses";
import "./light-table.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--lt-fraunces", display: "swap", axes: ["opsz"] });
const inter = Inter({ weight: ["400", "500", "600", "700", "800"], subsets: ["latin"], variable: "--lt-inter", display: "swap" });
const jet = JetBrains_Mono({ weight: ["400", "500", "600", "700", "800"], subsets: ["latin"], variable: "--lt-jet", display: "swap" });

export interface LightTableProps {
  course: CertifiedCourseSlug;
  name: string;
  brand: string;
  doneName: string;
  base: string;
  holder: string;
  firm: string;
  email: string;
  track: string;
  issued: string;
  until: string;
  serial: string;
  valid: boolean;
  completed: string;
  chips: string[];
}

/* ── marks ── */
const I = (d: React.ReactNode, s = 15, sw = 2.2) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const BACK = I(<path d="M19 12H5M11 18l-6-6 6-6" />, 14);
const DOWN = I(<path d="M12 4v12M6 10l6 6 6-6M4 20h16" />);
const MAIL = I(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>);
const PRINT = I(<path d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6z" />);
const COPY = I(<><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></>, 14, 2);
const TICK = I(<path d="M5 12l5 5L20 7" />, 14, 2.6);

const MARK: Record<CertifiedCourseSlug, React.ReactNode> = {
  "ai-cleared": I(<path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4" />, 23, 1.8),
  "ai-fluent": I(<path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />, 22, 1.8),
};
/* the AlgorithmX cube as a solid blue mark, for paper */
const CUBE = (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <polygon points="16,3 28,9.5 16,16 4,9.5" fill="#6d8fff" /><polygon points="4,9.5 16,16 16,29 4,22.5" fill="#1b3fe6" /><polygon points="28,9.5 16,16 16,29 28,22.5" fill="#3f66ff" />
    <text x="16" y="19.2" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="7.4" fontWeight="700" fill="#fff">&lt;/&gt;</text>
  </svg>
);
const CUBE_WHITE = (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <g fill="none" stroke="#fff" strokeWidth="1.9" strokeLinejoin="round"><path d="M16 3 28 9.5v13L16 29 4 22.5v-13z" /><path d="M4 9.5 16 16l12-6.5M16 16v13" /></g>
    <text x="16" y="13.6" textAnchor="middle" fontFamily="ui-monospace,Menlo,monospace" fontSize="6.6" fontWeight="700" fill="#fff">&lt;/&gt;</text>
  </svg>
);
const GUIL = (
  <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth=".7" aria-hidden="true">
    {Array.from({ length: 12 }, (_, i) => <ellipse key={i} cx="100" cy="100" rx="88" ry="34" transform={`rotate(${i * 15} 100 100)`} />)}
    <circle cx="100" cy="100" r="92" /><circle cx="100" cy="100" r="60" />
  </svg>
);
const SIG = (
  <svg viewBox="0 0 150 46" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 34c8-20 16-30 20-28 4 3-6 24-2 26s12-18 18-20c5-2 2 14 6 16s10-16 16-18c6-1 4 12 8 14 5 2 12-14 18-14 7 0 2 12 8 14 5 1 14-12 22-10 6 1 6 12 12 12s8-6 12-8" />
    <path d="M4 40c30 2 70-4 142-8" strokeWidth="1" />
  </svg>
);

type EmailState = "idle" | "sending" | "sent" | "failed";

export default function LightTable(p: LightTableProps) {
  const [shown, setShown] = useState(false);
  const [paused, setPaused] = useState(false);
  const [mail, setMail] = useState<EmailState>("idle");
  const [copied, setCopied] = useState(false);

  /* reveal after the first paint, with a timed fallback so a slow first
     frame never leaves the page blank; reduced motion starts paused */
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let r2 = 0;
    const r1 = requestAnimationFrame(() => {
      if (still) { setPaused(true); setShown(true); return; }
      r2 = requestAnimationFrame(() => setShown(true));
    });
    const t = window.setTimeout(() => setShown(true), 600);
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); window.clearTimeout(t); };
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  /* the live request, unchanged */
  async function email() {
    setMail("sending");
    try {
      const r = await fetch("/api/ai-cleared/certificate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: true, course: p.course }) });
      const j = (await r.json().catch(() => ({}))) as { emailed?: boolean };
      setMail(r.ok && j.emailed ? "sent" : "failed");
    } catch {
      setMail("failed");
    }
  }

  async function copySerial() {
    try { await navigator.clipboard.writeText(p.serial); } catch { /* no clipboard rights: nothing to undo */ }
    setCopied(true);
  }

  const key = p.course === "ai-cleared" ? "cleared" : "fluent";
  const [brandPlain, brandAcc] = [p.brand.replace(/\s*\S+$/, ""), p.brand.split(" ").pop() ?? ""];
  const corners = <><i className="lt-corner tl" aria-hidden="true" /><i className="lt-corner tr" aria-hidden="true" /><i className="lt-corner bl" aria-hidden="true" /><i className="lt-corner br" aria-hidden="true" /></>;
  const chipCode = (c: string) => (p.course === "ai-cleared" ? c.charAt(0) : undefined);
  const mailLabel = mail === "idle" ? "Email me a copy" : mail === "sending" ? "Sending…" : mail === "sent" ? "Sent to your inbox" : "Could not send, try again";

  return (
    <div
      className={`lt ${fraunces.variable} ${inter.variable} ${jet.variable}`}
      data-course={key}
      data-valid={p.valid ? "" : undefined}
      data-in={shown ? "" : undefined}
      data-paused={paused ? "" : undefined}
    >
      <div className="lt-key" aria-hidden="true"><i className="breath" /><i className="b" /></div>
      <div className="lt-vignette" aria-hidden="true" />

      <header className="lt-chrome lt-wrap">
        <div className="lt-left">
          <Link className="lt-lockup" href={p.base} aria-label={`${p.name} by AlgorithmX`}>
            {MARK[p.course]}
            <span className="lk-col">
              <span className="lk-name">{brandPlain} <b>{brandAcc}</b></span>
              <span className="lk-by"><ByAlgorithmX wordClassName="dim" /></span>
            </span>
          </Link>
          <span className="lt-sep" aria-hidden="true" />
          <span className="lt-firm">{p.firm}</span>
        </div>
        <Link className="lt-back" href={p.base}>{BACK}Back to {p.name}</Link>
      </header>

      <main className="lt-main lt-wrap">
        <div className="lt-col">
          <span className="lt-eyebrow lt-rise"><i aria-hidden="true" />{p.valid ? "Course complete" : "Certificate expired"}</span>
          <h1 className="lt-h1 lt-rise" style={{ "--d": ".26s" } as React.CSSProperties}>You are <span className="acc">{p.doneName}</span>, {p.holder}.</h1>
          <p className="lt-lead lt-rise" style={{ "--d": ".32s" } as React.CSSProperties}>
            Every module done and the final assessment passed. The certificate was issued to you and is yours to download; it carries its own serial.
          </p>
          <div className="lt-actions lt-rise" style={{ "--d": ".38s" } as React.CSSProperties}>
            <a className="lt-btn pri" href={`/api/ai-cleared/certificate?course=${p.course}`}>{DOWN}Download the PDF</a>
            <button
              className="lt-btn"
              type="button"
              onClick={email}
              disabled={mail === "sending" || mail === "sent"}
              aria-busy={mail === "sending" || undefined}
              data-state={mail === "sent" || mail === "failed" ? mail : undefined}
            >
              {MAIL}
              <span>{mailLabel}{mail === "sending" ? <span className="dots" aria-hidden="true"><i /><i /><i /></span> : null}</span>
            </button>
            <button className="lt-btn" type="button" onClick={() => window.print()}>{PRINT}Print</button>
          </div>
          <p className="lt-live ok" role="status" aria-live="polite">{mail === "sent" ? `A copy is on its way to ${p.email}.` : ""}</p>
          <p className="lt-live err" role="alert" aria-live="polite">{mail === "failed" ? "The email could not be sent just now. The download still works." : ""}</p>
          <section className="lt-card lt-rise" style={{ "--d": ".46s" } as React.CSSProperties} aria-label="On the register">
            {corners}
            <p className="lab">On the register</p>
            <dl className="lt-facts">
              <div><dt>Track</dt><dd>{p.track}</dd></div>
              <div><dt>Issued</dt><dd>{p.issued}</dd></div>
              <div><dt>Valid until</dt><dd>{p.until}</dd></div>
              <div>
                <dt>Serial</dt>
                <dd className="serial">
                  <span>{p.serial}</span>
                  <button className="lt-copy" type="button" onClick={copySerial} aria-label={copied ? "Serial copied" : "Copy the serial"} data-done={copied ? "1" : undefined}>{copied ? TICK : COPY}</button>
                </dd>
              </div>
            </dl>
          </section>
          <p className="lt-note lt-rise" style={{ "--d": ".52s" } as React.CSSProperties}>
            Valid for twelve months from the day it was issued. The course no longer issues new certificates; every module you finish stays on your firm&rsquo;s training register.
          </p>
        </div>

        <div className="lt-stage">
          <div className="lt-sheetwrap">
            <article className="lt-sheet" aria-label={`Your ${p.name} certificate`}>
              <div className="frame" aria-hidden="true" />
              <div className="rule" aria-hidden="true" />
              <div className="guil" aria-hidden="true">{GUIL}</div>
              <div className="lt-in">
                <div className="top">
                  <span className="mark">{CUBE}<span className="word">ALGORITHM<b>X</b></span></span>
                  <span className="brand">{p.brand}</span>
                </div>
                <div className="title">Certificate of completion</div>
                <div className="certifies">This certifies that</div>
                <div className="holder">{p.holder}</div>
                <div className="of">of {p.firm}</div>
                <p className="body">{p.completed}</p>
                <div className="chips">{p.chips.map((c) => <span key={c} className="chip" data-c={chipCode(c)}>{c}</span>)}</div>
                <div className="foot">
                  <dl className="facts">
                    <div><dt>Track</dt><dd>{p.track}</dd></div>
                    <div><dt>Issued</dt><dd>{p.issued}</dd></div>
                    <div><dt>Valid until</dt><dd>{p.until}</dd></div>
                    <div><dt>Serial</dt><dd className="serial">{p.serial}</dd></div>
                  </dl>
                  <div className="sign">
                    <div className="sigblock"><div className="sig">{SIG}</div><div className="sigline"><b>Programme Director</b>AlgorithmX</div></div>
                    <div className="lt-seal" aria-hidden="true">
                      <svg className="ring" viewBox="0 0 100 100" aria-hidden="true">
                        <defs><path id={`lt-ring-${key}`} d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" /></defs>
                        <text fontFamily="var(--font-geist-mono),'JetBrains Mono',ui-monospace,monospace" fontSize="7.2" fontWeight="700" letterSpacing="1.9" fill="rgba(255,255,255,.92)">
                          <textPath href={`#lt-ring-${key}`}>{`ALGORITHMX · ${p.brand} · ALGORITHMX · ${p.brand} ·`}</textPath>
                        </text>
                      </svg>
                      <span className="cube">{CUBE_WHITE}</span>
                    </div>
                  </div>
                </div>
                <div className="fine"><span>Content reviewed quarterly and within weeks of a major change to any tool. Renewal is on the refreshed content.</span><span>AlgorithmX · algorithmx.co.uk · admissions@algorithmx.co.uk</span></div>
              </div>
              <div className="sweep" aria-hidden="true" />
            </article>
          </div>
        </div>
      </main>

      <footer className="lt-foot lt-wrap">
        <button
          className="lt-pause"
          type="button"
          onClick={() => setPaused((v) => !v)}
          aria-pressed={paused}
          aria-label={paused ? "Play motion" : "Pause motion"}
        >
          <i aria-hidden="true" /><span>{paused ? "Play motion" : "Pause motion"}</span>
        </button>
        <span>Nothing in the course is real data, and practice chats are never stored.</span>
        <span>Questions about your seat: <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a></span>
      </footer>

    </div>
  );
}
