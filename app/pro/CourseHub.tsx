"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { T } from "./learn/tokens";
import { lessonCheckpointKey, type LessonCheckpoint } from "./learn/types";

/* The Cyber Pro course home. The map of all 20 weeks in four acts, with
 * Act 1 free and Acts 2 to 4 unlocked by the £99 purchase. Progress is
 * read from the same localStorage checkpoints the lessons write, so a
 * learner's ticks show up here (server-side progress is a follow-up).
 *
 * Only the built lessons carry an href; the rest show as upcoming. The
 * paid-act lessons are gated on their own routes too; here we just
 * reflect lock state so the map reads honestly. */

type Status = "ready" | "soon";

interface Week {
  n: number;
  id: string; // matches the lesson manifest id when built
  act: 1 | 2 | 3 | 4;
  title: string;
  href?: string;
  status: Status;
}

const WEEKS: Week[] = [
  { n: 1, id: "week-01", act: 1, title: "Passwords, and how they are really stored", href: "/pro/week01", status: "ready" },
  { n: 2, id: "week-02", act: 1, title: "How the internet actually works", status: "soon" },
  { n: 3, id: "week-03", act: 1, title: "Operating systems and the command line", status: "soon" },
  { n: 4, id: "week-04", act: 1, title: "Who attackers really are", status: "soon" },
  { n: 5, id: "week-05", act: 1, title: "Law, ethics, and your first audit", status: "soon" },
  { n: 6, id: "week-06", act: 2, title: "Phishing and social engineering", status: "soon" },
  { n: 7, id: "week-07", act: 2, title: "Malware and how it works", status: "soon" },
  { n: 8, id: "week-08", act: 2, title: "Web attacks: perform a real SQL injection", href: "/pro/week08", status: "ready" },
  { n: 9, id: "week-09", act: 2, title: "Networks and Wi-Fi under attack", status: "soon" },
  { n: 10, id: "week-10", act: 2, title: "The anatomy of a data breach", status: "soon" },
  { n: 11, id: "week-11", act: 2, title: "Vulnerability and patch management", status: "soon" },
  { n: 12, id: "week-12", act: 3, title: "The SOC and the analyst's day", status: "soon" },
  { n: 13, id: "week-13", act: 3, title: "Logs and the SIEM: catch an attacker", href: "/pro/week13", status: "ready" },
  { n: 14, id: "week-14", act: 3, title: "Detection and threat intelligence", status: "soon" },
  { n: 15, id: "week-15", act: 3, title: "Incident response and digital forensics", status: "soon" },
  { n: 16, id: "week-16", act: 3, title: "Defence in depth, GRC, and the UK reality", status: "soon" },
  { n: 17, id: "week-17", act: 4, title: "Try the roles on", status: "soon" },
  { n: 18, id: "week-18", act: 4, title: "Scripting for defenders", status: "soon" },
  { n: 19, id: "week-19", act: 4, title: "The job machinery", status: "soon" },
  { n: 20, id: "week-20", act: 4, title: "Capstone: one full breach, start to finish", status: "soon" },
];

const ACTS: { n: 1 | 2 | 3 | 4; title: string; weeks: string; free: boolean }[] = [
  { n: 1, title: "Foundations you can touch", weeks: "Weeks 1 to 5", free: true },
  { n: 2, title: "How attacks happen", weeks: "Weeks 6 to 11", free: false },
  { n: 3, title: "Defence for real", weeks: "Weeks 12 to 16", free: false },
  { n: 4, title: "Get hired", weeks: "Weeks 17 to 20", free: false },
];

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3" aria-hidden>
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.faint} strokeWidth="2" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

export default function CourseHub({ priceGBP, hasPro, loggedIn }: { priceGBP: number; hasPro: boolean; loggedIn: boolean }) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const price = `£${Math.round(priceGBP / 100)}`;

  useEffect(() => {
    const d = new Set<string>();
    for (const w of WEEKS) {
      if (w.status !== "ready") continue;
      try {
        const raw = localStorage.getItem(lessonCheckpointKey(w.id));
        if (raw) {
          const cp = JSON.parse(raw) as LessonCheckpoint;
          if (cp.phase === "done") d.add(w.id);
        }
      } catch { /* ignore */ }
    }
    setDone(d);
  }, []);

  const readyCount = WEEKS.filter((w) => w.status === "ready").length;
  const doneCount = done.size;

  const actUnlocked = (act: number) => act === 1 || hasPro;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.body, fontFamily: T.sans }}>
      <style>{`
        .pro-hub :focus-visible { outline: 2px solid ${T.cyan}; outline-offset: 2px; }
        .pro-hub a.wk:hover { border-color: ${T.primary}88; background: ${T.primarySoft}; }
      `}</style>

      <div className="pro-hub" style={{ maxWidth: 820, margin: "0 auto", padding: "22px 24px 90px" }}>
        {/* header */}
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "6px 0 20px", borderBottom: `1px solid ${T.edge}`, flexWrap: "wrap" }}>
          <Link href="/" style={{ display: "flex", alignItems: "baseline", gap: 12, textDecoration: "none" }}>
            <span style={{ fontFamily: T.display, fontWeight: 700, fontSize: 17, letterSpacing: "0.07em", color: T.ink }}>CYBER PRO</span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>your course</span>
          </Link>
          {!loggedIn ? (
            <a href="/login" style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600, color: T.muted, textDecoration: "none" }}>Log in</a>
          ) : (
            <span style={{ fontFamily: T.mono, fontSize: 12, color: T.faint }}>{doneCount} of {readyCount} available done</span>
          )}
        </header>

        {/* intro */}
        <div style={{ marginTop: 26, marginBottom: 8 }}>
          <h1 style={{ fontFamily: T.display, fontSize: 28, fontWeight: 700, color: T.ink, margin: "0 0 10px", lineHeight: 1.2 }}>From zero to job-ready, one week at a time</h1>
          <p style={{ fontSize: 15.5, color: T.muted, lineHeight: 1.65, maxWidth: "60ch", margin: 0 }}>
            Twenty weeks across four acts. Start with Act 1 for free, then unlock the rest whenever you are ready. Your progress is saved as you go.
          </p>
        </div>

        {/* unlock banner */}
        {!hasPro && (
          <div style={{ marginTop: 20, background: T.panel, border: `1px solid ${T.primary}44`, borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 16, color: T.ink }}>Act 1 is free. Unlock all 20 weeks for {price}.</div>
              <div style={{ fontSize: 13, color: T.muted, marginTop: 3 }}>One payment, lifetime access, no subscription.</div>
            </div>
            <a href="/signup?course=cyberstart-pro"
              style={{ fontFamily: T.display, fontSize: 14, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, borderRadius: 10, padding: "11px 22px", textDecoration: "none", whiteSpace: "nowrap" }}>
              Unlock everything
            </a>
          </div>
        )}

        {/* acts */}
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 26 }}>
          {ACTS.map((act) => {
            const unlocked = actUnlocked(act.n);
            return (
              <section key={act.n}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.primary, letterSpacing: "0.08em" }}>ACT {act.n}</span>
                  <span style={{ fontFamily: T.display, fontSize: 18, fontWeight: 700, color: T.ink }}>{act.title}</span>
                  <span style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>{act.weeks}</span>
                  {act.free ? (
                    <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.green, background: T.greenSoft, border: `1px solid ${T.green}55`, borderRadius: 5, padding: "2px 8px" }}>FREE</span>
                  ) : !unlocked ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: T.faint, border: `1px solid ${T.edge}`, borderRadius: 5, padding: "2px 8px" }}><LockIcon />{price} TO UNLOCK</span>
                  ) : null}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {WEEKS.filter((w) => w.act === act.n).map((w) => {
                    const isDone = done.has(w.id);
                    const canOpen = w.status === "ready" && (unlocked || act.n === 1);
                    const rowInner = (
                      <>
                        <span style={{ fontFamily: T.mono, fontSize: 12, color: T.faint, width: 30, flexShrink: 0 }}>{String(w.n).padStart(2, "0")}</span>
                        <span style={{ flex: 1, fontSize: 14.5, color: w.status === "ready" && (unlocked || act.n === 1) ? T.ink : T.muted, fontWeight: 600 }}>{w.title}</span>
                        <span style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 11, fontWeight: 600 }}>
                          {w.status === "soon" ? (
                            <span style={{ color: T.faint }}>coming soon</span>
                          ) : !unlocked && act.n !== 1 ? (
                            <span style={{ color: T.faint, display: "inline-flex", alignItems: "center", gap: 5 }}><LockIcon />locked</span>
                          ) : isDone ? (
                            <span style={{ color: T.green, display: "inline-flex", alignItems: "center", gap: 5 }}><CheckIcon />review</span>
                          ) : (
                            <span style={{ color: T.cyan }}>start &rsaquo;</span>
                          )}
                        </span>
                      </>
                    );
                    const style: React.CSSProperties = {
                      display: "flex", alignItems: "center", gap: 12,
                      background: T.panelSoft, border: `1px solid ${T.edge}`, borderRadius: 10,
                      padding: "13px 16px", textDecoration: "none",
                      opacity: w.status === "soon" ? 0.6 : (!unlocked && act.n !== 1) ? 0.75 : 1,
                    };
                    return canOpen && w.href ? (
                      <Link key={w.n} href={w.href} className="wk" style={{ ...style, transition: "background 150ms, border-color 150ms" }}>{rowInner}</Link>
                    ) : (
                      <div key={w.n} style={style}>{rowInner}</div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* footer nav */}
        <div style={{ marginTop: 40, paddingTop: 18, borderTop: `1px solid ${T.edge}`, display: "flex", gap: 18, flexWrap: "wrap" }}>
          <a href="/cyberstart-pro" style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, textDecoration: "none" }}>About the course</a>
          <a href="/hub" style={{ fontFamily: T.mono, fontSize: 12, color: T.muted, textDecoration: "none" }}>Back to your hub</a>
        </div>
      </div>
    </div>
  );
}
