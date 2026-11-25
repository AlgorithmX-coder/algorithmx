"use client";

import { useEffect, useState } from "react";
import NightHomeShell, { ByCube, NightHomePause } from "@/app/components/course-home/NightHomeShell";

/* The Cyber Pro course hub: every module, grouped into the four acts, with a
 * clear route into the ones that are built.
 *
 * Round 6 (landing lab homes-b pro v1, owner 2026-11-23): the Night Console
 * look, ember on graphite. The first screen answers "where am I and what do I
 * do next": the readiness meter and the next module with its topic bar sit in
 * the console beside the hero. Every number is the learner's own: topics come
 * from the lesson checkpoints in this browser (pro:lesson:*) merged with the
 * server's record (/api/pro/progress), exactly as before. */

type Status = "live" | "preview" | "soon";
type Mod = { n: number; title: string; blurb: string; tag: string; href?: string; status: Status };
type Act = { cls: string; tag: string; name: string; focus: string; modules: Mod[] };

const ACTS: Act[] = [
  {
    cls: "a1", tag: "Act 1", name: "Foundations you can touch", focus: "The language every certificate starts with.",
    modules: [
      { n: 1, title: "What security actually means", blurb: "The core ideas every certificate opens with: the CIA triad, risk, and thinking like a defender.", tag: "Security+ 1.0", href: "/pro/module01", status: "live" },
      { n: 2, title: "How the internet actually works", blurb: "The plumbing attackers use, from IP and DNS to HTTPS, explained without jargon.", tag: "Security+ 3.0", href: "/pro/module02", status: "live" },
      { n: 3, title: "Passwords & account security", blurb: "How passwords are really stored and cracked, and how to lock down your own accounts.", tag: "Security+ 4.0", href: "/pro/module03", status: "live" },
      { n: 4, title: "Cryptography without the maths", blurb: "Why the padlock means something: encryption, hashing and certificates in plain terms.", tag: "Security+ 1.4", href: "/pro/module04", status: "live" },
      { n: 5, title: "Law, ethics & your first audit", blurb: "The Computer Misuse Act, data protection, and your first real portfolio piece.", tag: "Security+ 5.0", href: "/pro/module05", status: "live" },
    ],
  },
  {
    cls: "a2", tag: "Act 2", name: "How attacks happen", focus: "Threats, vulnerabilities and the breaches they caused.",
    modules: [
      { n: 6, title: "Who the attackers are", blurb: "The real threat actors and the lifecycle of an attack, from recon to impact.", tag: "Security+ 2.1", href: "/pro/module06", status: "live" },
      { n: 7, title: "Social engineering & phishing", blurb: "Why people are the easiest way in, and how to spot and report it.", tag: "Security+ 2.2", href: "/pro/module07", status: "live" },
      { n: 8, title: "Malware: how it really works", blurb: "Viruses, ransomware, and how infection actually happens.", tag: "Security+ 2.4", href: "/pro/module08", status: "live" },
      { n: 9, title: "Web attacks & the OWASP Top 10", blurb: "How web apps get broken, and you run a real SQL injection yourself.", tag: "OWASP Top 10", href: "/pro/module09", status: "live" },
      { n: 10, title: "Networks & Wi-Fi under attack", blurb: "Eavesdropping, spoofing, denial of service, and moving through a network.", tag: "Security+ 2.4", href: "/pro/module10", status: "live" },
      { n: 11, title: "Vulnerabilities & patching", blurb: "What a vulnerability really is, and the race to patch it before attackers strike.", tag: "Security+ 2.5", href: "/pro/module11", status: "live" },
    ],
  },
  {
    cls: "a3", tag: "Act 3", name: "Defence for real", focus: "Security operations and the SOC job.",
    modules: [
      { n: 12, title: "Hardening & secure configuration", blurb: "Closing the doors, using the Cyber Essentials five controls as your checklist.", tag: "Cyber Essentials", href: "/pro/module12", status: "live" },
      { n: 13, title: "The SOC & the analyst's day", blurb: "The most common first job in cyber security, seen from the inside.", tag: "Security+ 4.0", href: "/pro/module13", status: "live" },
      { n: 14, title: "Logs & the SIEM", blurb: "Reading what attackers leave behind, on real honeypot data.", tag: "Security+ 4.0", href: "/pro/module14", status: "live" },
      { n: 15, title: "Detection & threat intelligence", blurb: "Spotting the attack, and knowing your enemy with MITRE ATT&CK.", tag: "MITRE ATT&CK", href: "/pro/module15", status: "live" },
      { n: 16, title: "Incident response & forensics", blurb: "When it goes wrong: contain, investigate, recover.", tag: "NIST 800-61", href: "/pro/module16", status: "live" },
    ],
  },
  {
    cls: "a4", tag: "Act 4", name: "Get hired", focus: "Governance, scripting and the career on-ramp.",
    modules: [
      { n: 17, title: "Governance, risk & compliance", blurb: "The huge hiring lane most beginners never hear about.", tag: "Security+ 5.0", href: "/pro/module17", status: "live" },
      { n: 18, title: "Scripting for defenders", blurb: "A little real code goes a long way: parse logs, check input, automate.", tag: "Code Lab", href: "/pro/code", status: "live" },
      { n: 19, title: "Resilience: backups & continuity", blurb: "Surviving the bad day, from ransomware to disaster recovery.", tag: "Security+ 3.0", href: "/pro/module19", status: "live" },
      { n: 20, title: "The roles & the cert roadmap", blurb: "Which job, which certificate, and the honest state of the market.", tag: "Career map", href: "/pro/module20", status: "live" },
      { n: 21, title: "The job machinery + capstone", blurb: "Everything you built, turned into a CV, a portfolio and an offer.", tag: "Capstone", href: "/pro/module21", status: "live" },
    ],
  },
];

/* job-readiness (the old ReadinessMeter): 20 modules x 5 topics, plus the Code Lab as one */
const TOTAL = 101;
const MILESTONES: { at: number; label: string }[] = [
  { at: 0, label: "Begin your climb to job-ready" },
  { at: 1, label: "You have started. Keep the streak." },
  { at: 20, label: "Building your foundations" },
  { at: 45, label: "Starting to think like an analyst" },
  { at: 70, label: "Nearly job-ready" },
  { at: 100, label: "Job-ready. Every module done." },
];
function milestoneFor(pct: number): string {
  let m = MILESTONES[0].label;
  for (const x of MILESTONES) if (pct >= x.at) m = x.label;
  return m;
}

/* per-act accent (the four act colours), as CSS variables on each act block */
const ACT_VARS = (k: number) => ({ "--ac": `var(--hb6-a${k})`, "--ac-rgb": `var(--hb6-a${k}-rgb)`, "--ac-text": `var(--hb6-a${k}-text)` }) as React.CSSProperties;

/* Topic ids per module number, matching the lesson checkpoint keys
 * (pro:lesson:<id>). Every module is m{n}t1..5 except Module 3 (its content
 * lives in week01, so w1t*) and Module 18 (the Code Lab, which has no topics).
 * A module counts as done when all five of its topics are done. */
function moduleTopicIds(n: number): string[] {
  if (n === 18) return ["m18t1"]; // the Code Lab: one completion, recorded when every challenge is solved
  const prefix = n === 3 ? "w1" : `m${n}`;
  return [1, 2, 3, 4, 5].map((k) => `${prefix}t${k}`);
}

const Arrow = ({ s = 18 }: { s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
const Tick = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>;
const Corners = () => <><i className="hb6-corner tl" aria-hidden="true" /><i className="hb6-corner tr" aria-hidden="true" /><i className="hb6-corner bl" aria-hidden="true" /><i className="hb6-corner br" aria-hidden="true" /></>;

function Pill({ status }: { status: Status }) {
  const label = { live: "Live", preview: "Preview", soon: "Soon" }[status];
  return <span className={`hb6-pill ${status === "soon" ? "soon" : "live"}`}>{label}</span>;
}

export default function CourseHub() {
  const built = ACTS.flatMap((a) => a.modules).filter((m) => m.href).length;

  // Which topics the learner has finished. Read from the lesson checkpoints in
  // localStorage first, then merge the server's cross-device record.
  // Best-effort and client-only; null until read, so nothing flashes.
  const [doneTopics, setDoneTopics] = useState<Set<string> | null>(null);
  useEffect(() => {
    const ids = new Set<string>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("pro:lesson:")) continue;
        try {
          const cp = JSON.parse(localStorage.getItem(k) || "null");
          if (cp && cp.phase === "done" && cp.id) ids.add(cp.id);
        } catch { /* ignore a corrupt checkpoint */ }
      }
    } catch { /* localStorage unavailable */ }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading localStorage once on mount (client-only store)
    setDoneTopics(new Set(ids));
    (async () => {
      try {
        const res = await fetch("/api/pro/progress", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { done?: string[] };
        if (Array.isArray(data.done) && data.done.length) {
          for (const id of data.done) ids.add(id);
          setDoneTopics(new Set(ids));
        }
      } catch { /* no server sync; local stands */ }
    })();
  }, []);

  const topics = doneTopics ?? new Set<string>();
  const doneMods = new Set<number>();
  for (const a of ACTS) for (const m of a.modules) {
    const ids = moduleTopicIds(m.n);
    if (ids.length > 0 && ids.every((id) => topics.has(id))) doneMods.add(m.n);
  }

  // Where the primary CTA should send the learner: the first module they have
  // not finished, or Module 1 for a fresh start, or the final test once
  // everything is done.
  const orderedMods = ACTS.flatMap((a) => a.modules);
  const nextMod = orderedMods.find((m) => moduleTopicIds(m.n).length > 0 && !doneMods.has(m.n));
  const nextAct = nextMod ? ACTS.findIndex((a) => a.modules.includes(nextMod)) + 1 : 0;
  const started = doneMods.size > 0;
  const ctaHref = nextMod?.href ?? "/pro/testme";
  const ctaLabel = !started ? "Start with Module 1" : nextMod ? `Continue: Module ${nextMod.n}` : "You're ready, take the test";
  const nextIds = nextMod ? moduleTopicIds(nextMod.n) : [];
  const nextDone = nextIds.filter((id) => topics.has(id)).length;
  const firstOpen = nextIds.findIndex((id) => !topics.has(id));

  const pct = Math.max(0, Math.min(100, Math.round((topics.size / TOTAL) * 100)));

  return (
    <NightHomeShell course="pro">
      <header className="hb6-chrome">
        <div className="hb6-chrome-in">
          <div className="hb6-chrome-l">
            <span className="hb6-lockup" role="img" aria-label="Cyber Pro by AlgorithmX">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff7a3d" strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0, filter: "drop-shadow(0 0 9px rgba(255,122,61,.35))" }}><path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" /><path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M13 15.5 H16.2" strokeLinecap="round" /></svg>
              <span className="lk-col" aria-hidden="true"><span className="lk-name">CYBER <b>PRO</b></span><span className="lk-by"><span className="dim">by</span><ByCube /><span className="dim">AlgorithmX</span></span></span>
            </span>
            <span className="hb6-trail">The course</span>
          </div>
          <div className="hb6-chrome-r">
            <span className="hb6-tag">0 to hired &middot; 18+</span>
            <NightHomePause />
          </div>
        </div>
      </header>

      <main className="hb6-main" id="main">
        <section className="hb6-hero" aria-labelledby="hb6-h1">
          <div className="hb6-hero-l">
            <p className="hb6-kicker hb6-rise" style={{ "--i": 0 } as React.CSSProperties}>The course{nextAct > 0 && started ? <> &middot; Act {nextAct} of 4</> : null}</p>
            <h1 id="hb6-h1" className="hb6-h1 hb6-rise" style={{ "--i": 1 } as React.CSSProperties}>Cyber security, from zero to hired<span className="hb6-caret" aria-hidden="true" /></h1>
            <p className="hb6-lede hb6-rise" style={{ "--i": 2 } as React.CSSProperties}>Real certificate content, taught for a curious adult with no technical background. Every module is <b>plain-English theory, a real breach, and a hands-on lab</b> in your browser. Work through them in order, or dip into any that is open.</p>
            <ul className="hb6-chips hb6-rise" style={{ "--i": 3 } as React.CSSProperties} aria-label="Course facts">
              <li><b>21</b> modules</li>
              <li><b>4</b> acts</li>
              <li><b>{built}</b> open now</li>
              {doneMods.size > 0 && <li className="ok"><b>{doneMods.size}</b> done</li>}
              <li>aligned to <b>Security+</b> &middot; ISC² CC</li>
            </ul>
            <div className="hb6-row hb6-rise" style={{ "--i": 4 } as React.CSSProperties}>
              <a className="hb6-sec" href="/pro/testme"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.2 6.3L20.5 10.5 14.2 12.7 12 19l-2.2-6.3L3.5 10.5 9.8 8.3z" /></svg>Test me</a>
              <span className="hb6-note">or pick any open module below.</span>
            </div>
          </div>
          <aside className="hb6-console hb6-rise" style={{ "--i": 2 } as React.CSSProperties} aria-label="Where you are and what is next">
            <Corners />
            {doneTopics && (
              <div className="hb6-ready">
                <div className="hb6-ready-top">
                  <div><span className="hb6-con-kicker">Your readiness</span><b className="hb6-ready-label">{milestoneFor(pct)}</b></div>
                  <div className="hb6-ready-num"><span className="pct">{pct}%</span><span className="of">{topics.size} of {TOTAL} topics</span></div>
                </div>
                <div className="hb6-bar" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Readiness"><i style={{ "--w": `${pct}%` } as React.CSSProperties} /></div>
              </div>
            )}
            <div className="hb6-next">
              {nextMod ? (
                <>
                  <span className="hb6-con-kicker">Up next &middot; Act {nextAct} &middot; Module {nextMod.n}</span>
                  <h2 className="hb6-con-title">{nextMod.title}</h2>
                  {nextIds.length > 1 && firstOpen >= 0 && <p className="hb6-con-sub">Topic {firstOpen + 1} of {nextIds.length}</p>}
                  {nextIds.length > 1 && (
                    <ol className="hb6-steps" aria-label={`Topics in Module ${nextMod.n}`}>
                      {nextIds.map((id, i) => {
                        const s = topics.has(id) ? "done" : i === firstOpen ? "next" : "todo";
                        return <li key={id} data-s={s}><span className="sr-only">Topic {i + 1}: {s === "done" ? "done" : s === "next" ? "next" : "to do"}</span></li>;
                      })}
                    </ol>
                  )}
                </>
              ) : null}
              <a className="hb6-cta" href={ctaHref}>{ctaLabel} <Arrow /></a>
              {nextMod && <div className="hb6-con-foot"><span>{nextMod.tag}</span><span>{nextDone} of {nextIds.length} {nextIds.length === 1 ? "topic" : "topics"} done</span></div>}
            </div>
          </aside>
        </section>

        {/* Quick-nav: the four acts at a glance, each jumping to its section. */}
        <nav className="hb6-actnav" aria-label="The four acts" data-reveal>
          {ACTS.map((a, ai) => (
            <a key={a.tag} href={`#act-${ai + 1}`} style={ACT_VARS(ai + 1)}>
              <span className="n" aria-hidden="true">{ai + 1}</span>
              <span className="t"><span className="k">Act {ai + 1}</span><span className="nm">{a.name}</span></span>
            </a>
          ))}
        </nav>

        {ACTS.map((a, ai) => (
          <section key={a.tag} className="hb6-act" id={`act-${ai + 1}`} aria-labelledby={`act-${ai + 1}-name`} style={ACT_VARS(ai + 1)} data-reveal>
            <div className="hb6-act-head">
              <span className="hb6-act-num" aria-hidden="true">{String(ai + 1).padStart(2, "0")}</span>
              <div className="hb6-act-meta">
                <div className="hb6-act-kicker">Act {ai + 1} &middot; {a.modules.length} modules</div>
                <h2 id={`act-${ai + 1}-name`} className="hb6-act-name">{a.name}</h2>
                <p className="hb6-act-focus">{a.focus}</p>
              </div>
            </div>
            <div className="hb6-mods">
              {a.modules.map((m) => {
                const isDone = doneMods.has(m.n);
                const isCurrent = !isDone && started && nextMod?.n === m.n;
                const ids = moduleTopicIds(m.n);
                const curDone = ids.filter((id) => topics.has(id)).length;
                const state = isDone ? "done" : isCurrent ? "current" : "open";
                const inner = (
                  <>
                    <div className="hb6-mod-top">
                      <span className="hb6-mod-n" aria-hidden="true">{m.n}</span>
                      <h3 className="hb6-mod-title">{m.title}</h3>
                      {isDone ? <span className="hb6-pill done"><Tick /> Done</span> : isCurrent && ids.length > 1 ? <span className="hb6-pill now">Topic {Math.min(curDone + 1, ids.length)} of {ids.length}</span> : <Pill status={m.status} />}
                    </div>
                    <p className="hb6-mod-blurb">{m.blurb}</p>
                    <div className="hb6-mod-foot">
                      <span className="hb6-mod-tag">{m.tag}</span>
                      {m.href && <span className="hb6-mod-go">{isDone ? "Review" : isCurrent ? "Continue" : m.status === "preview" ? "Preview lesson" : "Start module"} <Arrow s={13} /></span>}
                    </div>
                  </>
                );
                return m.href
                  ? <a key={m.n} className="hb6-mod" data-state={state} href={m.href} aria-label={isDone ? `${m.title} (completed, open to review)` : undefined}>{inner}</a>
                  : <div key={m.n} className="hb6-mod soon" data-state={state}>{inner}</div>;
              })}
            </div>
          </section>
        ))}
      </main>
    </NightHomeShell>
  );
}
