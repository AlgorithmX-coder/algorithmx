"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Nav from "@/app/components/landing-v2/Nav";
import Footer from "@/app/components/landing-v2/Footer";
import GlobalBackdrop from "@/app/components/landing-v2/GlobalBackdrop";
import { FadeUp } from "@/app/components/landing-v2/utilities";

import CourseLockup from "./CourseLockup";
import EnquiryForm from "./EnquiryForm";
import ProductTabs, { shotSet, shotSrc } from "./ProductTabs";
import { PHASES, type Phase } from "./phases";

/**
 * The schools landing page. One audience per glance, one button.
 *
 * Order: hero -> section nav -> pick your phase -> see the product -> how it
 * runs -> built for the classroom -> what you receive -> questions -> enquiry.
 * The phase choice (primary / secondary) drives the product screens and the
 * form's default, lives in the URL (?phase=) so it can be shared, and is
 * remembered per browser.
 */

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  color: "rgba(125,240,255,0.82)",
};

const h2: React.CSSProperties = {
  margin: "14px 0 0",
  fontFamily: "var(--lv2-font-display)",
  fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)",
  lineHeight: 1.06,
  letterSpacing: "-0.025em",
  fontWeight: 400,
  color: "var(--lv2-paper)",
};

const lede: React.CSSProperties = {
  margin: "16px 0 0",
  fontFamily: "var(--lv2-font-display)",
  fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
  lineHeight: 1.6,
  color: "rgba(232,237,255,0.78)",
  maxWidth: 640,
};

const pillPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 54,
  padding: "0 30px",
  borderRadius: 999,
  background: "linear-gradient(135deg, #2af0ff 0%, #00cfff 55%, #00b4f0 100%)",
  color: "#04050d",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 15.5,
  fontWeight: 700,
  textDecoration: "none",
  boxShadow: "0 14px 34px -14px rgba(0,229,255,0.85)",
  whiteSpace: "nowrap",
};

const pillGhost: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 54,
  padding: "0 24px",
  borderRadius: 999,
  border: "1px solid rgba(159,245,255,0.45)",
  background: "rgba(0,229,255,0.06)",
  color: "var(--lv2-paper)",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 15.5,
  fontWeight: 600,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

/* Real screens fanned in the hero: front, middle, back. */
const STACK = [
  { img: "heroes-learn", url: "algorithmx.io/lesson/1" },
  { img: "explorers-meter", url: "algorithmx.io/explorers" },
  { img: "heroes-boss", url: "algorithmx.io/lesson/1" },
];

const SECTIONS = [
  ["#phase", "Your phase"],
  ["#product", "The screens"],
  ["#how", "Set-up"],
  ["#classroom", "Classroom"],
  ["#receive", "What you get"],
  ["#questions", "Questions"],
  ["#enquiry", "Get in touch"],
] as const;

const STEPS = [
  { n: "01", when: "Day 1", colour: "#7df0ff", title: "Send us first names", text: "Sign the processing agreement and send each class list: first names and year group. That is all we ever hold about a pupil." },
  { n: "02", when: "Day 2", colour: "#b98bff", title: "Print the login cards", text: "Every pupil gets a card with the class code and a three-picture password. No email addresses, nothing to type twice." },
  { n: "03", when: "Weekly", colour: "#5fffa3", title: "Run the block", text: "Six lessons, 45 minutes each, one a week. Pupils work on their own with headphones or captions. Progress saves on every screen, so the bell never costs a lesson." },
  { n: "04", when: "End of block", colour: "#ffb347", title: "Get the class report", text: "Who finished, what the class found hard, and a certificate for every pupil to take home." },
];

const PILLARS = [
  {
    title: "Independent by design",
    accent: "#7df0ff",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 14v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="13" width="4" height="7" rx="1.5" /><rect x="17" y="13" width="4" height="7" rx="1.5" /></svg>,
    points: ["Every instruction is spoken and captioned", "Pupils resume from the exact screen they left", "Wrong answers get a reason and another go", "Zero lesson prep. Zero marking."],
  },
  {
    title: "Safe by default",
    accent: "#5fffa3",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
    points: ["No chat, no messaging, no social features", "First name, class and progress. Nothing else stored.", "No pupil data is sent to any AI service", "Deleted when you ask, in full"],
  },
  {
    title: "Matched to the curriculum",
    accent: "#ffb347",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5V5.5M8 7h8M8 10.5h8" /></svg>,
    points: ["Education for a Connected World strands", "The computing programme of study", "Online safety within RSHE", "A mapping sheet for every lesson"],
  },
];

const RECEIVE = [
  "A whole-school licence for your phase",
  "Printable login cards for every pupil",
  "The teacher view for every class",
  "An end-of-block class report",
  "Certificates for every pupil",
  "The curriculum mapping sheet",
];

const FAQS = [
  { q: "What do we need in the room?", a: "Any computer with a modern browser. Headphones help; captions cover the rest. Nothing to install and nothing for your network team to open up." },
  { q: "How long is a lesson?", a: "About 45 minutes, which fits a standard slot with time to log in. Progress saves on every screen, so if the bell goes, the pupil picks up exactly where they left off next week." },
  { q: "Who teaches it?", a: "The class teacher, whatever their confidence with computing. The narrator carries every instruction, the games mark themselves, and the teacher view shows who needs a nudge." },
  { q: "What pupil data do you hold?", a: "First name, class and progress. No email addresses, dates of birth or photos. Nothing a pupil does is sent to an AI service, and we delete a school's data in full when asked." },
  { q: "Is it safe?", a: "There is no chat, no messaging and no social feature of any kind. Pupils only ever interact with the lesson. Rewards are personal, never a ranking." },
  { q: "How does a school get started?", a: "Get in touch and we'll walk you through the onboarding process: the agreement, the class lists, the login cards and the first lesson. Most schools start with a free half-term pilot." },
];

const PHASE_KEY = "ax-schools-phase";
const isPhase = (v: unknown): v is Phase => v === "primary" || v === "secondary";

export default function SchoolsLanding() {
  const [phase, setPhase] = useState<Phase>("primary");
  const info = PHASES[phase];

  // Read ?phase= (shareable) or the remembered choice after mount, so server
  // and first client render agree.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const q = new URLSearchParams(window.location.search).get("phase");
        const stored = window.localStorage.getItem(PHASE_KEY);
        if (isPhase(q)) setPhase(q);
        else if (isPhase(stored)) setPhase(stored);
      } catch {}
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const choosePhase = (p: Phase) => {
    setPhase(p);
    try {
      window.localStorage.setItem(PHASE_KEY, p);
      const u = new URL(window.location.href);
      u.searchParams.set("phase", p);
      window.history.replaceState(null, "", u.toString());
    } catch {}
    document.getElementById("product")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <GlobalBackdrop />
      <Nav />
      <main style={{ position: "relative", color: "var(--lv2-paper)", minHeight: "100vh" }}>
        {/* HERO ────────────────────────────────────────────── */}
        <section className="sch-section sch-hero-section">
          <FadeUp>
            <div className="sch-toprow">
              <Link href="/" className="sch-toplink"><span aria-hidden>←</span> Back to home</Link>
              <Link href="/schools/login" className="sch-toplink sch-toplink-login">School login <span aria-hidden>→</span></Link>
            </div>
          </FadeUp>

          <div className="sch-hero-grid">
            <div className="sch-hero">
              <FadeUp>
                <p style={eyebrow}>{"// For schools · Primary and secondary · UK and British schools worldwide"}</p>
              </FadeUp>
              <FadeUp delay={0.06}>
                <h1 className="sch-h1">
                  Cybersecurity lessons your pupils <span className="sch-grad">teach themselves.</span>
                </h1>
              </FadeUp>
              <FadeUp delay={0.12}>
                <p style={{ ...lede, fontSize: "clamp(1.05rem, 1.35vw, 1.2rem)", maxWidth: 560 }}>
                  Cyber Heroes for primary. Cyber Explorers and Cyber Ops for secondary. Pupils work on their own on the school&rsquo;s computers, one 45-minute lesson a week. Teachers see everything and prepare nothing.
                </p>
              </FadeUp>
              <FadeUp delay={0.18}>
                <div className="sch-cta-row">
                  <a href="#enquiry" style={pillPrimary}>Request a free pilot</a>
                  <a href="#product" style={pillGhost}>See a real lesson</a>
                </div>
              </FadeUp>
              <FadeUp delay={0.24}>
                <ul className="sch-trust">
                  <li>Mapped to Education for a Connected World</li>
                  <li>No pupil data sent to AI services</li>
                  <li>Runs in the browser. Nothing to install.</li>
                </ul>
              </FadeUp>
            </div>

            <FadeUp delay={0.15} y={30}>
              <div className="sch-stack" aria-hidden>
                {STACK.map((s, i) => (
                  <div key={s.img} className={`sch-stack-card sch-stack-${i}`}>
                    <div className="sch-stack-bar"><i /><i /><i /><span>{s.url}</span></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shotSrc(s.img)} srcSet={shotSet(s.img)} sizes="(max-width: 980px) 90vw, 520px" alt="" />
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </section>

        {/* SECTION NAV ────────────────────────────────────── */}
        <div className="sch-subnav-wrap">
          <nav className="sch-subnav" aria-label="On this page">
            {SECTIONS.map(([href, label]) => <a key={href} href={href} className="sch-chip-link">{label}</a>)}
          </nav>
        </div>

        {/* PHASE PICKER ───────────────────────────────────── */}
        <section id="phase" className="sch-section">
          <span className="sch-glow sch-glow-amber" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// Step one · Pick your phase"}</p>
            <h2 style={h2}>Which <span className="sch-grad">school</span> are you?</h2>
            <p style={lede}>Choose once. Every screen and example on this page follows.</p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="sch-phase-grid" role="radiogroup" aria-label="School phase">
              {(Object.keys(PHASES) as Phase[]).map((p) => {
                const ph = PHASES[p];
                const on = p === phase;
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`${ph.label}, ${ph.years}`}
                    onClick={() => choosePhase(p)}
                    className={`sch-phase${on ? " sch-phase-on" : ""}`}
                    style={{ ["--sch-accent" as string]: ph.accent, ["--sch-accent2" as string]: ph.accent2 }}
                  >
                    <span className="sch-phase-art" style={{ backgroundImage: `url(${ph.art.src})`, backgroundPosition: ph.art.position, backgroundSize: ph.art.size }} aria-hidden />
                    <span className="sch-phase-scrim" aria-hidden />
                    <span className="sch-phase-body">
                      <span className="sch-phase-head">
                        <span className="sch-phase-label">{ph.label}</span>
                        <span className="sch-phase-years">{ph.years} · {ph.ages}</span>
                      </span>
                      <span className="sch-phase-headline">{ph.headline}</span>
                      <span className="sch-phase-courses">
                        {ph.courses.map((c) => (
                          <span key={c.name} className="sch-course">
                            <span className="sch-course-top">
                              <CourseLockup id={c.lockup} size={0.95} />
                              <span className="sch-course-years">{c.years}</span>
                              <span className={`sch-chip${c.status === "Live" ? " sch-chip-live" : ""}`}>{c.status}</span>
                            </span>
                            <span className="sch-course-note">{c.note}</span>
                          </span>
                        ))}
                      </span>
                      <span className="sch-phase-check" aria-hidden>{on ? "✓ Selected" : "Select"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </FadeUp>
        </section>

        {/* SEE THE PRODUCT ────────────────────────────────── */}
        <section id="product" className="sch-section">
          <span className="sch-glow sch-glow-cyan" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// Inside the platform · "}{info.label}</p>
            <h2 style={h2}>See the product, <span className="sch-grad">not a brochure.</span></h2>
            <p style={lede}>
              Four of these screens are the live product, captured as a pupil sees it. The last two are previews of what teachers get in the pilot. Pick a step, or open any screen full size.
            </p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div style={{ marginTop: 36 }}>
              <ProductTabs phase={phase} />
            </div>
          </FadeUp>
        </section>

        {/* HOW IT RUNS ────────────────────────────────────── */}
        <section id="how" className="sch-section">
          <FadeUp>
            <p style={eyebrow}>{"// Running in your school within a week"}</p>
            <h2 style={h2}>Four steps. <span className="sch-grad">Most of them are ours.</span></h2>
          </FadeUp>
          <div className="sch-grid-4" style={{ marginTop: 36 }}>
            {STEPS.map((s, i) => (
              <FadeUp key={s.n} delay={0.06 * i}>
                <div className="sch-card sch-step" style={{ ["--sch-accent" as string]: s.colour }}>
                  <span className="sch-step-top">
                    <span className="sch-step-n">{s.n}</span>
                    <span className="sch-chip">{s.when}</span>
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* CLASSROOM ──────────────────────────────────────── */}
        <section id="classroom" className="sch-section">
          <span className="sch-glow sch-glow-violet" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// Built for a room of thirty"}</p>
            <h2 style={h2}>Independent by design. <span className="sch-grad">Safe by default.</span></h2>
            <p style={lede}>Thirty pupils, one adult, fifty minutes. Every part of the platform is built around that room, not a living room.</p>
          </FadeUp>
          <div className="sch-grid-3" style={{ marginTop: 36 }}>
            {PILLARS.map((p, i) => (
              <FadeUp key={p.title} delay={0.06 * i}>
                <div className="sch-card sch-pillar" style={{ ["--sch-accent" as string]: p.accent }}>
                  <span className="sch-pillar-icon">{p.icon}</span>
                  <h3>{p.title}</h3>
                  <ul>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* WHAT YOU RECEIVE ───────────────────────────────── */}
        <section id="receive" className="sch-section">
          <div className="sch-grid-2" style={{ alignItems: "stretch" }}>
            <FadeUp>
              <div>
                <p style={eyebrow}>{"// What your school receives"}</p>
                <h2 style={h2}>Everything your <span className="sch-grad">school receives.</span></h2>
                <p style={lede}>Please get in touch to find out about the onboarding process. We&rsquo;ll take you from the first conversation to the first lesson.</p>
                <ul className="sch-receive">{RECEIVE.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="sch-card sch-pilot">
                <span className="sch-chip sch-chip-live">Free</span>
                <h3>A half-term pilot, on us.</h3>
                <p>Six lessons with one class. If it works, license the whole school from the start of a term. If it doesn&rsquo;t, you owe nothing and we delete the data.</p>
                <ul>
                  <li>One class, one course, six lessons</li>
                  <li>Login cards and the teacher view included</li>
                  <li>A class report at the end to show your head</li>
                </ul>
                <a href="#enquiry" style={{ ...pillPrimary, marginTop: "auto" }}>Request a pilot</a>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* QUESTIONS ──────────────────────────────────────── */}
        <section id="questions" className="sch-section">
          <span className="sch-glow sch-glow-lime" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// Before you ask"}</p>
            <h2 style={h2}>Questions <span className="sch-grad">heads ask.</span></h2>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="sch-faq-grid">
              {FAQS.map((f) => (
                <details key={f.q} className="sch-faq">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </FadeUp>
        </section>

        {/* ENQUIRY ────────────────────────────────────────── */}
        <section id="enquiry" className="sch-section" style={{ paddingBottom: "calc(var(--lv2-rail) * 2.4)" }}>
          <div className="sch-grid-2 sch-grid-2-form">
            <FadeUp>
              <div>
                <p style={eyebrow}>{"// Get in touch"}</p>
                <h2 style={h2}>Tell us about <span className="sch-grad">your school.</span></h2>
                <p style={lede}>
                  We&rsquo;ll explain the onboarding process, from the agreement to the first lesson, and reply within two working days. We bring the processing agreement and a data-protection summary to the first conversation so your DPO has what they need.
                </p>
                <p style={{ ...lede, fontSize: 14.5, color: "rgba(232,237,255,0.6)" }}>
                  Prefer email? <a href="mailto:support@algorithmx.co.uk" style={{ color: "var(--lv2-cyan-soft)" }}>support@algorithmx.co.uk</a>
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="sch-card" style={{ padding: "28px 26px" }}>
                <EnquiryForm defaultPhase={phase} />
              </div>
            </FadeUp>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .sch-section {
          position: relative;
          max-width: 1180px;
          margin: 0 auto;
          padding: calc(var(--lv2-rail) * 1.3) var(--lv2-rail);
          scroll-margin-top: 128px;
        }
        .sch-hero-section { padding-top: max(calc(var(--lv2-rail) * 3.2), 112px); padding-bottom: calc(var(--lv2-rail) * 0.8); }
        .sch-glow { position: absolute; pointer-events: none; z-index: 0; border-radius: 50%; filter: blur(60px); opacity: 0.55; }
        .sch-glow-amber { width: 520px; height: 520px; right: -140px; top: -80px; background: radial-gradient(circle, rgba(255,179,71,0.35), transparent 65%); }
        .sch-glow-cyan { width: 640px; height: 640px; left: -220px; top: 120px; background: radial-gradient(circle, rgba(0,229,255,0.28), transparent 65%); }
        .sch-glow-violet { width: 560px; height: 560px; right: -160px; top: 40px; background: radial-gradient(circle, rgba(124,92,255,0.38), transparent 65%); }
        .sch-glow-lime { width: 480px; height: 480px; left: -160px; top: 0; background: radial-gradient(circle, rgba(126,255,151,0.22), transparent 65%); }
        .sch-section > *:not(.sch-glow) { position: relative; z-index: 1; }

        .sch-grad {
          background: linear-gradient(92deg, #7df0ff 0%, #b98bff 55%, #ff8ad4 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .sch-h1 {
          margin: 18px 0 0; font-family: var(--lv2-font-display);
          font-size: clamp(2.5rem, 5vw, 4.3rem); line-height: 1.0; letter-spacing: -0.03em; font-weight: 400;
        }

        .sch-toprow { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 34px; }
        .sch-toplink {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none;
          color: var(--lv2-cyan-soft); white-space: nowrap; transition: opacity .2s ease;
        }
        .sch-toplink:hover { opacity: .8; }
        .sch-toplink-login { padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(159,245,255,0.4); background: rgba(0,229,255,0.08); }

        /* hero */
        .sch-hero-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); gap: 44px; align-items: center; }
        .sch-cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 30px; }
        .sch-trust { list-style: none; padding: 0; margin: 30px 0 0; display: flex; flex-wrap: wrap; gap: 10px 22px; }
        .sch-trust li {
          position: relative; padding-left: 18px;
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: rgba(232,237,255,0.7);
        }
        .sch-trust li::before { content: ""; position: absolute; left: 0; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #5fffa3; box-shadow: 0 0 10px #5fffa3; }

        .sch-stack { position: relative; width: 100%; aspect-ratio: 5 / 4; }
        .sch-stack::before {
          content: ""; position: absolute; inset: -6%; z-index: 0; border-radius: 40%;
          background: radial-gradient(closest-side at 35% 35%, rgba(0,229,255,0.32), transparent 70%),
                      radial-gradient(closest-side at 75% 75%, rgba(185,139,255,0.36), transparent 70%),
                      radial-gradient(closest-side at 70% 20%, rgba(255,138,212,0.2), transparent 70%);
          filter: blur(18px);
        }
        .sch-stack-card {
          position: absolute; width: 72%; border-radius: 14px; overflow: hidden; background: #0a0d18;
          border: 1px solid rgba(159,245,255,0.35);
          box-shadow: 0 30px 70px -30px rgba(0,229,255,0.55), 0 30px 60px -20px rgba(0,0,0,0.85);
          transition: transform .5s var(--lv2-ease-soft);
        }
        .sch-stack-bar { height: 24px; display: flex; align-items: center; gap: 5px; padding: 0 10px; background: #12162a; font-family: var(--lv2-font-mono); font-size: 9.5px; color: rgba(232,237,255,0.62); }
        .sch-stack-bar i { width: 7px; height: 7px; border-radius: 50%; background: rgba(232,237,255,0.25); }
        .sch-stack-bar i:nth-child(1) { background: #ff5f57; } .sch-stack-bar i:nth-child(2) { background: #febc2e; } .sch-stack-bar i:nth-child(3) { background: #28c840; }
        .sch-stack-bar span { margin-left: 6px; }
        .sch-stack-card img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; object-position: top center; }
        .sch-stack-2 { left: 0; top: 0; z-index: 1; transform: rotate(-7deg) scale(0.92); opacity: 0.92; }
        .sch-stack-1 { right: 0; top: 10%; z-index: 2; transform: rotate(4deg) scale(0.96); }
        .sch-stack-0 { left: 9%; top: 28%; z-index: 3; transform: rotate(-2deg); border-color: rgba(159,245,255,0.55); }
        .sch-stack:hover .sch-stack-0 { transform: rotate(-1deg) translateY(-6px); }
        .sch-stack:hover .sch-stack-1 { transform: rotate(5deg) scale(0.96) translateY(-4px); }

        /* section nav */
        .sch-subnav-wrap { position: sticky; top: 68px; z-index: 30; background: rgba(4,5,13,0.72); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid rgba(0,229,255,0.1); border-bottom: 1px solid rgba(0,229,255,0.1); }
        .sch-subnav { max-width: 1180px; margin: 0 auto; padding: 10px var(--lv2-rail); display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
        .sch-subnav::-webkit-scrollbar { display: none; }
        .sch-chip-link {
          flex: 0 0 auto; padding: 8px 14px; border-radius: 999px; text-decoration: none;
          border: 1px solid rgba(159,245,255,0.22); background: rgba(13,15,24,0.6);
          font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(232,237,255,0.78); transition: border-color .2s ease, color .2s ease, background .2s ease;
        }
        .sch-chip-link:hover { border-color: var(--lv2-cyan); color: #fff; background: rgba(0,229,255,0.1); }

        /* cards */
        .sch-card {
          position: relative; height: 100%; box-sizing: border-box;
          padding: 26px 24px; border-radius: 18px;
          background: linear-gradient(180deg, rgba(24,29,56,0.78), rgba(14,17,34,0.78));
          border: 1px solid rgba(159,245,255,0.24);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px -30px rgba(0,229,255,0.35);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .sch-chip {
          display: inline-flex; align-items: center; height: 22px; padding: 0 9px;
          border-radius: 999px; border: 1px solid rgba(232,237,255,0.28);
          font-family: var(--lv2-font-mono); font-size: 10px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase; color: rgba(232,237,255,0.8); white-space: nowrap;
        }
        .sch-chip-live { border-color: rgba(95,255,163,0.6); color: #5fffa3; background: rgba(95,255,163,0.12); box-shadow: 0 0 14px -4px rgba(95,255,163,0.6); }

        /* grids */
        .sch-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px; align-items: start; }
        .sch-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
        .sch-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        .sch-grid-2-form { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
        @media (max-width: 980px) {
          .sch-hero-grid { grid-template-columns: 1fr; gap: 30px; }
          .sch-stack { max-width: 560px; margin: 10px auto 0; }
          .sch-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .sch-grid-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) { .sch-grid-2, .sch-grid-2-form { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .sch-grid-4 { grid-template-columns: 1fr; } }

        /* phase picker */
        .sch-phase-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; margin-top: 34px; }
        @media (max-width: 820px) { .sch-phase-grid { grid-template-columns: 1fr; } }
        .sch-phase {
          position: relative; overflow: hidden; text-align: left; cursor: pointer; width: 100%; min-height: 420px;
          padding: 0; border-radius: 22px; color: var(--lv2-paper); background: #0b0e1c;
          border: 1px solid rgba(159,245,255,0.22); font-family: var(--lv2-font-display);
          transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
          box-shadow: 0 30px 60px -40px rgba(0,0,0,0.9);
        }
        .sch-phase:hover { transform: translateY(-3px); border-color: rgba(159,245,255,0.45); }
        .sch-phase-on { border-color: var(--sch-accent); box-shadow: 0 0 0 1.5px var(--sch-accent), 0 40px 90px -40px var(--sch-accent2), 0 0 60px -20px var(--sch-accent); }
        .sch-phase-art { position: absolute; inset: 0; background-repeat: no-repeat; filter: saturate(1.15) brightness(1.02); transition: transform .6s var(--lv2-ease-soft); }
        .sch-phase:hover .sch-phase-art { transform: scale(1.03); }
        .sch-phase-scrim { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(6,8,20,0.96) 0%, rgba(6,8,20,0.9) 40%, rgba(6,8,20,0.5) 68%, rgba(6,8,20,0.22) 100%); }
        .sch-phase-body { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; padding: 26px 26px 24px; max-width: 74%; }
        .sch-phase-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .sch-phase-label { font-size: clamp(1.8rem, 2.8vw, 2.4rem); letter-spacing: -0.02em; line-height: 1; }
        .sch-phase-years { font-family: var(--lv2-font-mono); font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--sch-accent); font-weight: 700; }
        .sch-phase-headline { font-size: 15.5px; line-height: 1.5; color: rgba(232,237,255,0.85); }
        .sch-phase-courses { display: flex; flex-direction: column; gap: 10px; }
        .sch-course { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 12px; background: rgba(8,10,22,0.72); border: 1px solid rgba(232,237,255,0.12); backdrop-filter: blur(6px); }
        .sch-course-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .sch-course-years { font-family: var(--lv2-font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(232,237,255,0.65); }
        .sch-course-note { font-size: 13.5px; line-height: 1.5; color: rgba(232,237,255,0.72); }
        .sch-phase-check {
          align-self: flex-start; margin-top: 4px;
          font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(232,237,255,0.3); color: rgba(232,237,255,0.78);
        }
        .sch-phase-on .sch-phase-check { border-color: var(--sch-accent); color: #04050d; background: var(--sch-accent); }
        @media (max-width: 820px) {
          .sch-phase { min-height: 0; }
          .sch-phase-body { max-width: 100%; }
          .sch-phase-scrim { background: linear-gradient(180deg, rgba(6,8,20,0.9) 0%, rgba(6,8,20,0.9) 100%); }
        }

        /* product tabs */
        .sch-tabs { display: grid; grid-template-columns: minmax(0, 330px) minmax(0, 1fr); gap: 28px; align-items: start; }
        .sch-tablist { display: flex; flex-direction: column; gap: 6px; }
        .sch-tab {
          text-align: left; cursor: pointer; width: 100%;
          display: flex; flex-direction: column; gap: 6px;
          padding: 16px 18px 16px 20px; border-radius: 14px;
          background: transparent; color: var(--lv2-paper);
          border: 1px solid transparent; border-left: 2px solid rgba(232,237,255,0.14);
          font-family: var(--lv2-font-display); transition: background .2s ease, border-color .2s ease;
        }
        .sch-tab:hover { background: rgba(20,24,46,0.6); }
        .sch-tab-on { background: linear-gradient(180deg, rgba(24,29,56,0.9), rgba(14,17,34,0.9)); border-color: rgba(159,245,255,0.24); border-left-color: var(--sch-accent); box-shadow: 0 16px 40px -28px var(--sch-accent); }
        .sch-tab-head { display: flex; align-items: baseline; gap: 12px; }
        .sch-tab-n { font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--sch-accent); }
        .sch-tab-title { font-size: 1.25rem; letter-spacing: -0.01em; }
        .sch-tab-desc { font-size: 13.5px; line-height: 1.5; color: rgba(232,237,255,0.68); }
        .sch-tab:not(.sch-tab-on) .sch-tab-desc { display: none; }
        .sch-frame {
          border-radius: 16px; overflow: hidden; background: #0a0d18;
          border: 1px solid color-mix(in srgb, var(--sch-accent) 45%, transparent);
          box-shadow: 0 40px 90px -40px var(--sch-accent), 0 0 0 1px rgba(255,255,255,0.03);
        }
        .sch-frame-bar { display: flex; align-items: center; gap: 14px; height: 42px; padding: 0 14px; background: #12162a; border-bottom: 1px solid rgba(232,237,255,0.08); }
        .sch-frame-dots { display: inline-flex; gap: 6px; }
        .sch-frame-dots i { width: 10px; height: 10px; border-radius: 50%; display: block; }
        .sch-frame-url { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--lv2-font-mono); font-size: 12px; color: rgba(232,237,255,0.72); background: rgba(8,10,22,0.7); border-radius: 8px; padding: 6px 12px; }
        .sch-frame-chip { font-family: var(--lv2-font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #ffb347; border: 1px solid rgba(255,179,71,0.5); border-radius: 999px; padding: 4px 9px; white-space: nowrap; }
        .sch-frame-body { position: relative; width: 100%; aspect-ratio: 16 / 10; background: #070a14; }
        .sch-enlarge {
          position: absolute; right: 12px; bottom: 12px; z-index: 2; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.28); background: rgba(8,10,22,0.72); color: #e8edff;
          font-family: var(--lv2-font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          backdrop-filter: blur(6px); transition: background .2s ease, border-color .2s ease;
        }
        .sch-enlarge:hover { background: rgba(0,229,255,0.18); border-color: var(--lv2-cyan); }
        .sch-frame-foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 12px 10px 16px; border-top: 1px solid rgba(232,237,255,0.08); }
        .sch-frame-caption { margin: 0; font-family: var(--lv2-font-display); font-size: 13.5px; line-height: 1.5; color: rgba(232,237,255,0.72); }
        .sch-frame-nav { display: inline-flex; align-items: center; gap: 8px; flex: 0 0 auto; }
        .sch-frame-nav button {
          width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 20px; line-height: 1;
          border: 1px solid rgba(159,245,255,0.3); background: rgba(13,15,24,0.7); color: #e8edff; transition: background .2s ease, border-color .2s ease;
        }
        .sch-frame-nav button:hover { background: rgba(0,229,255,0.16); border-color: var(--lv2-cyan); }
        .sch-frame-dotnav { display: inline-flex; gap: 5px; }
        .sch-frame-dotnav i { width: 6px; height: 6px; border-radius: 50%; background: rgba(232,237,255,0.25); }
        .sch-frame-dotnav i.on { background: var(--sch-accent); box-shadow: 0 0 8px var(--sch-accent); }
        @media (max-width: 900px) {
          .sch-tabs { grid-template-columns: 1fr; gap: 16px; }
          .sch-tablist { flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 6px; scrollbar-width: thin; }
          .sch-tab { flex: 0 0 auto; width: auto; min-width: 150px; padding: 12px 14px; border-left-width: 1px; border-bottom: 2px solid rgba(232,237,255,0.14); }
          .sch-tab-on { border-bottom-color: var(--sch-accent); border-left-color: rgba(159,245,255,0.24); }
          .sch-tab-desc { display: none !important; }
          .sch-tab-title { font-size: 1.05rem; }
          .sch-frame-foot { flex-direction: column; align-items: flex-start; }
        }

        /* lightbox */
        .sch-lightbox { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(4,5,13,0.88); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .sch-lightbox-inner { position: relative; max-width: min(96vw, 1600px); max-height: 94vh; display: flex; flex-direction: column; gap: 10px; }
        .sch-lightbox-inner img { display: block; max-width: 100%; max-height: calc(94vh - 60px); object-fit: contain; border-radius: 12px; border: 1px solid rgba(159,245,255,0.35); box-shadow: 0 40px 100px -30px rgba(0,229,255,0.5); }
        .sch-lightbox-inner p { margin: 0; font-family: var(--lv2-font-display); font-size: 14px; color: rgba(232,237,255,0.8); text-align: center; }
        .sch-lightbox-close { position: absolute; top: -14px; right: -14px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 26px; line-height: 1; border: 1px solid rgba(255,255,255,0.3); background: #0f1530; color: #fff; }

        /* mock app (teacher view + curriculum map) */
        .sch-mock { position: absolute; inset: 0; display: flex; font-family: var(--lv2-font-display); color: #e8edff; font-size: 12.5px; overflow: hidden; }
        .sch-mock-side { width: 150px; flex: 0 0 150px; background: #0d1122; border-right: 1px solid rgba(232,237,255,0.08); padding: 16px 14px; display: flex; flex-direction: column; }
        .sch-mock-brand { font-family: var(--lv2-font-mono); font-weight: 800; letter-spacing: 0.12em; font-size: 11px; margin-bottom: 18px; }
        .sch-mock-side ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
        .sch-mock-side li { padding: 7px 9px; border-radius: 8px; color: rgba(232,237,255,0.6); }
        .sch-mock-side li.on { background: rgba(125,240,255,0.14); color: #e8edff; font-weight: 600; }
        .sch-mock-school { margin-top: auto; display: flex; flex-direction: column; gap: 3px; }
        .sch-mock-school span { font-family: var(--lv2-font-mono); font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(232,237,255,0.45); }
        .sch-mock-school strong { font-size: 12px; font-weight: 600; }
        .sch-mock-main { flex: 1; min-width: 0; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; }
        .sch-mock-title { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
        .sch-mock-title h4 { margin: 4px 0 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
        .sch-mock-eyebrow { font-family: var(--lv2-font-mono); font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(232,237,255,0.5); }
        .sch-mock-btn { display: inline-flex; align-items: center; height: 28px; padding: 0 12px; border-radius: 999px; border: 1px solid; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
        .sch-mock-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .sch-mock-stats div { background: rgba(232,237,255,0.05); border: 1px solid rgba(232,237,255,0.08); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
        .sch-mock-stats b { font-size: 22px; font-weight: 600; line-height: 1; }
        .sch-mock-stats span { font-size: 11px; color: rgba(232,237,255,0.6); }
        .sch-mock-cols { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 14px; min-height: 0; flex: 1; }
        .sch-mock-pupils { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
        .sch-mock-pupils li { display: grid; grid-template-columns: 62px 1fr 64px; align-items: center; gap: 10px; }
        .sch-mock-name { font-weight: 600; }
        .sch-mock-bar { height: 7px; border-radius: 999px; background: rgba(232,237,255,0.1); overflow: hidden; display: block; }
        .sch-mock-bar i { display: block; height: 100%; border-radius: 999px; }
        .sch-mock-pct { font-family: var(--lv2-font-mono); font-size: 10.5px; color: rgba(232,237,255,0.6); text-align: right; }
        .sch-mock-missed { background: rgba(255,179,71,0.07); border: 1px solid rgba(255,179,71,0.3); border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; align-self: start; }
        .sch-mock-q { margin: 2px 0 0; font-size: 14px; font-weight: 600; line-height: 1.35; }
        .sch-mock-n { margin: 0; font-size: 12px; color: rgba(232,237,255,0.75); }
        .sch-mock-n b { font-size: 18px; color: #ffb347; }
        .sch-mock-why { margin: 0; font-size: 11.5px; line-height: 1.45; color: rgba(232,237,255,0.62); }
        .sch-mock-missed .sch-mock-btn { margin-top: 4px; align-self: flex-start; }
        .sch-mock-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
        .sch-mock-table th { text-align: left; font-family: var(--lv2-font-mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(232,237,255,0.5); padding: 4px 8px 6px; border-bottom: 1px solid rgba(232,237,255,0.12); white-space: nowrap; }
        .sch-mock-table td { padding: 5px 8px; border-bottom: 1px solid rgba(232,237,255,0.07); vertical-align: top; color: rgba(232,237,255,0.82); line-height: 1.35; }
        .sch-mock-table td b { display: block; font-weight: 600; color: #e8edff; }
        .sch-mock-table td span { font-size: 11px; color: rgba(232,237,255,0.55); }
        .sch-mock-table td i { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 7px; }
        @media (max-width: 640px) {
          .sch-mock-side { display: none; }
          .sch-mock-cols { grid-template-columns: 1fr; }
          .sch-mock-missed { display: none; }
          .sch-mock-table th:nth-child(3), .sch-mock-table td:nth-child(3) { display: none; }
        }

        /* steps + pillars */
        .sch-step { display: flex; flex-direction: column; gap: 10px; border-top: 2px solid var(--sch-accent); }
        .sch-step-top { display: flex; justify-content: space-between; align-items: center; }
        .sch-step-n {
          display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%;
          background: var(--sch-accent); color: #04050d; box-shadow: 0 0 22px -4px var(--sch-accent);
          font-family: var(--lv2-font-mono); font-size: 12px; font-weight: 800; letter-spacing: 0.06em;
        }
        .sch-step h3, .sch-pillar h3, .sch-pilot h3 { margin: 0; font-family: var(--lv2-font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.01em; }
        .sch-step p, .sch-pilot p { margin: 0; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(232,237,255,0.75); }
        .sch-pillar { border-top: 2px solid var(--sch-accent); }
        .sch-pillar-icon { display: inline-flex; width: 44px; height: 44px; border-radius: 12px; margin-bottom: 14px; align-items: center; justify-content: center; color: var(--sch-accent); background: color-mix(in srgb, var(--sch-accent) 14%, transparent); border: 1px solid color-mix(in srgb, var(--sch-accent) 40%, transparent); }
        .sch-pillar-icon svg { width: 22px; height: 22px; }
        .sch-pillar ul, .sch-pilot ul, .sch-receive { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .sch-pillar li, .sch-pilot li, .sch-receive li { position: relative; padding-left: 24px; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.5; color: rgba(232,237,255,0.84); }
        .sch-pillar li::before, .sch-pilot li::before, .sch-receive li::before { content: "✓"; position: absolute; left: 0; top: 0; font-weight: 800; color: var(--sch-accent, #5fffa3); }
        .sch-receive { margin-top: 26px; }
        .sch-receive li { font-size: 15.5px; }
        .sch-pilot { display: flex; flex-direction: column; gap: 14px; border-color: rgba(95,255,163,0.5); box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 70px -40px rgba(95,255,163,0.6); }
        .sch-pilot .sch-chip { align-self: flex-start; }
        .sch-pilot a { align-self: flex-start; }

        /* faq */
        .sch-faq-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; margin-top: 30px; }
        @media (max-width: 820px) { .sch-faq-grid { grid-template-columns: 1fr; } }
        .sch-faq { border-radius: 14px; border: 1px solid rgba(159,245,255,0.2); background: linear-gradient(180deg, rgba(24,29,56,0.7), rgba(14,17,34,0.7)); padding: 0 18px; }
        .sch-faq[open] { border-color: rgba(159,245,255,0.45); }
        .sch-faq summary { cursor: pointer; list-style: none; padding: 16px 28px 16px 0; position: relative; font-family: var(--lv2-font-display); font-size: 15.5px; font-weight: 600; color: #e8edff; }
        .sch-faq summary::-webkit-details-marker { display: none; }
        .sch-faq summary::after { content: "+"; position: absolute; right: 2px; top: 12px; font-size: 22px; color: var(--lv2-cyan-soft); transition: transform .2s ease; }
        .sch-faq[open] summary::after { transform: rotate(45deg); }
        .sch-faq p { margin: 0; padding: 0 0 16px; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(232,237,255,0.78); }

        .sch-form-grid { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 18px; }
        .sch-form-span { grid-column: 1 / -1; }
        @media (max-width: 640px) { .sch-form-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .sch-stack-card, .sch-phase-art { transition: none; } }
      `}</style>
    </>
  );
}
