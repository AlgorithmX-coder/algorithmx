"use client";

import { useState } from "react";
import Link from "next/link";

import Nav from "@/app/components/landing-v2/Nav";
import Footer from "@/app/components/landing-v2/Footer";
import GlobalBackdrop from "@/app/components/landing-v2/GlobalBackdrop";
import { FadeUp } from "@/app/components/landing-v2/utilities";

import EnquiryForm from "./EnquiryForm";
import ProductTabs from "./ProductTabs";
import { PHASES, type Phase } from "./phases";

/**
 * The schools landing page. One audience per glance, one button.
 *
 * Order: hero -> pick your phase -> see the product -> how it runs ->
 * built for the classroom -> what you receive -> enquiry form. The phase
 * choice (primary / secondary) drives the product screens and the form's
 * default, so a visitor never reads about the wrong age group.
 */

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.32em",
  textTransform: "uppercase",
  color: "rgba(232,237,255,0.55)",
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
  color: "rgba(232,237,255,0.75)",
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
  boxShadow: "0 14px 34px -14px rgba(0,229,255,0.75)",
  whiteSpace: "nowrap",
};

const pillGhost: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 54,
  padding: "0 24px",
  borderRadius: 999,
  border: "1px solid rgba(159,245,255,0.35)",
  color: "var(--lv2-paper)",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 15.5,
  fontWeight: 600,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

const STEPS = [
  {
    n: "01",
    when: "Day 1",
    title: "Send us first names",
    text: "Sign the processing agreement and send each class list: first names and year group. That is all we ever hold about a pupil.",
  },
  {
    n: "02",
    when: "Day 2",
    title: "Print the login cards",
    text: "Every pupil gets a card with the class code and a three-picture password. No email addresses, nothing to type twice.",
  },
  {
    n: "03",
    when: "Weekly",
    title: "Run the block",
    text: "Six lessons, 45 minutes each, one a week. Pupils work on their own with headphones or captions. Progress saves on every screen, so the bell never costs a lesson.",
  },
  {
    n: "04",
    when: "End of block",
    title: "Get the class report",
    text: "Who finished, what the class found hard, and a certificate for every pupil to take home.",
  },
];

const PILLARS = [
  {
    title: "Independent by design",
    accent: "#7df0ff",
    points: [
      "Every instruction is spoken and captioned",
      "Pupils resume from the exact screen they left",
      "Wrong answers get a reason and another go",
      "Zero lesson prep. Zero marking.",
    ],
  },
  {
    title: "Safe by default",
    accent: "#5fffa3",
    points: [
      "No chat, no messaging, no social features",
      "First name, class and progress. Nothing else stored.",
      "No pupil data is sent to any AI service",
      "Deleted when you ask, in full",
    ],
  },
  {
    title: "Matched to the curriculum",
    accent: "#ffb347",
    points: [
      "Education for a Connected World strands",
      "The computing programme of study",
      "Online safety within RSHE",
      "A mapping sheet for every lesson",
    ],
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

export default function SchoolsLanding() {
  const [phase, setPhase] = useState<Phase>("primary");
  const info = PHASES[phase];

  return (
    <>
      <GlobalBackdrop />
      <Nav />
      <main style={{ position: "relative", color: "var(--lv2-paper)", minHeight: "100vh" }}>
        {/* HERO ────────────────────────────────────────────── */}
        <section className="sch-section" style={{ paddingTop: "max(calc(var(--lv2-rail) * 3.6), 112px)", paddingBottom: "calc(var(--lv2-rail) * 1.2)" }}>
          <FadeUp>
            <div className="sch-toprow">
              <Link href="/" className="sch-toplink">
                <span aria-hidden>←</span> Back to home
              </Link>
              <Link href="/schools/login" className="sch-toplink sch-toplink-login">
                School login <span aria-hidden>→</span>
              </Link>
            </div>
          </FadeUp>

          <div className="sch-hero">
            <FadeUp>
              <p style={eyebrow}>{"// For schools · Primary and secondary · UK and British schools worldwide"}</p>
            </FadeUp>
            <FadeUp delay={0.06}>
              <h1
                style={{
                  margin: "18px 0 0",
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: "clamp(2.5rem, 5.4vw, 4.6rem)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.03em",
                  fontWeight: 400,
                  maxWidth: 900,
                }}
              >
                Cybersecurity lessons your pupils teach themselves.
              </h1>
            </FadeUp>
            <FadeUp delay={0.12}>
              <p style={{ ...lede, fontSize: "clamp(1.05rem, 1.35vw, 1.2rem)", maxWidth: 680 }}>
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
        </section>

        {/* PHASE PICKER ───────────────────────────────────── */}
        <section id="phase" className="sch-section">
          <FadeUp>
            <p style={eyebrow}>{"// Step one · Pick your phase"}</p>
            <h2 style={h2}>Which school are you?</h2>
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
                    onClick={() => setPhase(p)}
                    className={`sch-phase${on ? " sch-phase-on" : ""}`}
                    style={{ ["--sch-accent" as string]: ph.accent }}
                  >
                    <span className="sch-phase-head">
                      <span className="sch-phase-label">{ph.label}</span>
                      <span className="sch-phase-years">{ph.years} · {ph.ages}</span>
                    </span>
                    <span className="sch-phase-headline">{ph.headline}</span>
                    <span className="sch-phase-courses">
                      {ph.courses.map((c) => (
                        <span key={c.name} className="sch-course">
                          <span className="sch-course-top">
                            <b>{c.name}</b>
                            <span className="sch-course-years">{c.years}</span>
                            <span className={`sch-chip${c.status === "Live" ? " sch-chip-live" : ""}`}>{c.status}</span>
                          </span>
                          <span className="sch-course-note">{c.note}</span>
                        </span>
                      ))}
                    </span>
                    <span className="sch-phase-check" aria-hidden>{on ? "Selected" : "Select"}</span>
                  </button>
                );
              })}
            </div>
          </FadeUp>
        </section>

        {/* SEE THE PRODUCT ────────────────────────────────── */}
        <section id="product" className="sch-section">
          <FadeUp>
            <p style={eyebrow}>{"// Inside the platform · "}{info.label}</p>
            <h2 style={h2}>See the product, not a brochure.</h2>
            <p style={lede}>
              Four of these screens are the live product, captured as a pupil sees it. The last two are previews of what teachers get in the pilot. Pick a step.
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
            <h2 style={h2}>Four steps. Most of them are ours.</h2>
          </FadeUp>
          <div className="sch-grid-4" style={{ marginTop: 36 }}>
            {STEPS.map((s, i) => (
              <FadeUp key={s.n} delay={0.06 * i}>
                <div className="sch-card sch-step">
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
          <FadeUp>
            <p style={eyebrow}>{"// Built for a room of thirty"}</p>
            <h2 style={h2}>Independent by design. Safe by default.</h2>
            <p style={lede}>
              Thirty pupils, one adult, fifty minutes. Every part of the platform is built around that room, not a living room.
            </p>
          </FadeUp>
          <div className="sch-grid-3" style={{ marginTop: 36 }}>
            {PILLARS.map((p, i) => (
              <FadeUp key={p.title} delay={0.06 * i}>
                <div className="sch-card sch-pillar" style={{ ["--sch-accent" as string]: p.accent }}>
                  <h3>{p.title}</h3>
                  <ul>
                    {p.points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
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
                <h2 style={h2}>Everything your school receives.</h2>
                <p style={lede}>
                  Please get in touch to find out about the onboarding process. We&rsquo;ll take you from the first conversation to the first lesson.
                </p>
                <ul className="sch-receive">
                  {RECEIVE.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="sch-card sch-pilot">
                <span className="sch-chip sch-chip-live">Free</span>
                <h3>A half-term pilot, on us.</h3>
                <p>
                  Six lessons with one class. If it works, license the whole school from the start of a term. If it doesn&rsquo;t, you owe nothing and we delete the data.
                </p>
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

        {/* ENQUIRY ────────────────────────────────────────── */}
        <section id="enquiry" className="sch-section" style={{ paddingBottom: "calc(var(--lv2-rail) * 2.4)" }}>
          <div className="sch-grid-2 sch-grid-2-form">
            <FadeUp>
              <div>
                <p style={eyebrow}>{"// Get in touch"}</p>
                <h2 style={h2}>Tell us about your school.</h2>
                <p style={lede}>
                  We&rsquo;ll explain the onboarding process, from the agreement to the first lesson, and reply within two working days. We bring the processing agreement and a data-protection summary to the first conversation so your DPO has what they need.
                </p>
                <p style={{ ...lede, fontSize: 14.5, color: "rgba(232,237,255,0.55)" }}>
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
        }
        .sch-toprow { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 34px; }
        .sch-toplink {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none;
          color: var(--lv2-cyan-soft); white-space: nowrap; transition: opacity .2s ease;
        }
        .sch-toplink:hover { opacity: .8; }
        .sch-toplink-login {
          padding: 10px 16px; border-radius: 999px;
          border: 1px solid rgba(159,245,255,0.3); background: rgba(13,15,24,0.55);
        }
        .sch-hero { max-width: 900px; }
        .sch-cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 30px; }
        .sch-trust {
          list-style: none; padding: 0; margin: 30px 0 0;
          display: flex; flex-wrap: wrap; gap: 10px 22px;
        }
        .sch-trust li {
          position: relative; padding-left: 18px;
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: rgba(232,237,255,0.62);
        }
        .sch-trust li::before {
          content: ""; position: absolute; left: 0; top: 4px; width: 8px; height: 8px;
          border-radius: 50%; background: #5fffa3; box-shadow: 0 0 10px #5fffa3;
        }

        /* cards */
        .sch-card {
          position: relative; height: 100%; box-sizing: border-box;
          padding: 26px 24px; border-radius: 18px;
          background: rgba(13,15,24,0.55);
          border: 1px solid rgba(159,245,255,0.16);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .sch-chip {
          display: inline-flex; align-items: center; height: 22px; padding: 0 9px;
          border-radius: 999px; border: 1px solid rgba(232,237,255,0.22);
          font-family: var(--lv2-font-mono); font-size: 10px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase; color: rgba(232,237,255,0.7);
          white-space: nowrap;
        }
        .sch-chip-live { border-color: rgba(95,255,163,0.45); color: #5fffa3; background: rgba(95,255,163,0.08); }

        /* grids */
        .sch-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px; align-items: start; }
        .sch-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
        .sch-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        .sch-grid-2-form { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
        @media (max-width: 980px) {
          .sch-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .sch-grid-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) {
          .sch-grid-2, .sch-grid-2-form { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .sch-grid-4 { grid-template-columns: 1fr; }
        }

        /* phase picker */
        .sch-phase-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; margin-top: 34px; }
        @media (max-width: 820px) { .sch-phase-grid { grid-template-columns: 1fr; } }
        .sch-phase {
          position: relative; text-align: left; cursor: pointer; width: 100%;
          display: flex; flex-direction: column; gap: 16px;
          padding: 26px 26px 24px; border-radius: 20px;
          background: rgba(13,15,24,0.55); color: var(--lv2-paper);
          border: 1px solid rgba(159,245,255,0.16);
          transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
          font-family: var(--lv2-font-display);
        }
        .sch-phase:hover { transform: translateY(-2px); border-color: rgba(159,245,255,0.35); }
        .sch-phase-on {
          border-color: var(--sch-accent);
          box-shadow: 0 0 0 1px var(--sch-accent), 0 30px 60px -40px var(--sch-accent);
        }
        .sch-phase-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .sch-phase-label { font-size: clamp(1.7rem, 2.6vw, 2.2rem); letter-spacing: -0.02em; line-height: 1; }
        .sch-phase-years { font-family: var(--lv2-font-mono); font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--sch-accent); font-weight: 700; }
        .sch-phase-headline { font-size: 15.5px; line-height: 1.5; color: rgba(232,237,255,0.78); }
        .sch-phase-courses { display: flex; flex-direction: column; gap: 12px; }
        .sch-course { display: flex; flex-direction: column; gap: 5px; padding: 12px 14px; border-radius: 12px; background: rgba(8,10,22,0.6); border: 1px solid rgba(232,237,255,0.08); }
        .sch-course-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .sch-course-top b { font-weight: 600; font-size: 15px; }
        .sch-course-years { font-family: var(--lv2-font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(232,237,255,0.6); }
        .sch-course-note { font-size: 13.5px; line-height: 1.5; color: rgba(232,237,255,0.66); }
        .sch-phase-check {
          align-self: flex-start; margin-top: 4px;
          font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(232,237,255,0.25); color: rgba(232,237,255,0.7);
        }
        .sch-phase-on .sch-phase-check { border-color: var(--sch-accent); color: var(--sch-accent); }

        /* product tabs */
        .sch-tabs { display: grid; grid-template-columns: minmax(0, 330px) minmax(0, 1fr); gap: 28px; align-items: start; }
        .sch-tablist { display: flex; flex-direction: column; gap: 6px; }
        .sch-tab {
          text-align: left; cursor: pointer; width: 100%;
          display: flex; flex-direction: column; gap: 6px;
          padding: 16px 18px 16px 20px; border-radius: 14px;
          background: transparent; color: var(--lv2-paper);
          border: 1px solid transparent; border-left: 2px solid rgba(232,237,255,0.12);
          font-family: var(--lv2-font-display);
          transition: background .2s ease, border-color .2s ease;
        }
        .sch-tab:hover { background: rgba(13,15,24,0.45); }
        .sch-tab-on { background: rgba(13,15,24,0.7); border-color: rgba(159,245,255,0.18); border-left-color: var(--sch-accent); }
        .sch-tab-head { display: flex; align-items: baseline; gap: 12px; }
        .sch-tab-n { font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--sch-accent); }
        .sch-tab-title { font-size: 1.25rem; letter-spacing: -0.01em; }
        .sch-tab-desc { font-size: 13.5px; line-height: 1.5; color: rgba(232,237,255,0.62); }
        .sch-tab:not(.sch-tab-on) .sch-tab-desc { display: none; }
        @media (min-width: 901px) { .sch-tab-on .sch-tab-desc { display: block; } }
        .sch-frame {
          border-radius: 16px; overflow: hidden;
          background: #0a0d18; border: 1px solid rgba(159,245,255,0.22);
          box-shadow: 0 40px 80px -40px rgba(0,229,255,0.35);
        }
        .sch-frame-bar { display: flex; align-items: center; gap: 14px; height: 42px; padding: 0 14px; background: #12162a; border-bottom: 1px solid rgba(232,237,255,0.08); }
        .sch-frame-dots { display: inline-flex; gap: 6px; }
        .sch-frame-dots i { width: 10px; height: 10px; border-radius: 50%; display: block; }
        .sch-frame-url { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--lv2-font-mono); font-size: 12px; color: rgba(232,237,255,0.72); background: rgba(8,10,22,0.7); border-radius: 8px; padding: 6px 12px; }
        .sch-frame-chip { font-family: var(--lv2-font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #ffb347; border: 1px solid rgba(255,179,71,0.5); border-radius: 999px; padding: 4px 9px; white-space: nowrap; }
        .sch-frame-body { position: relative; width: 100%; aspect-ratio: 16 / 10; background: #070a14; }
        .sch-frame-caption { margin: 0; padding: 12px 16px 14px; font-family: var(--lv2-font-display); font-size: 13.5px; line-height: 1.5; color: rgba(232,237,255,0.66); border-top: 1px solid rgba(232,237,255,0.08); }
        @media (max-width: 900px) {
          .sch-tabs { grid-template-columns: 1fr; gap: 16px; }
          .sch-tablist { flex-direction: row; overflow-x: auto; gap: 8px; padding-bottom: 6px; scrollbar-width: thin; }
          .sch-tab { flex: 0 0 auto; width: auto; min-width: 150px; padding: 12px 14px; border-left-width: 1px; border-bottom: 2px solid rgba(232,237,255,0.12); }
          .sch-tab-on { border-bottom-color: var(--sch-accent); border-left-color: rgba(159,245,255,0.18); }
          .sch-tab-desc { display: none !important; }
          .sch-tab-title { font-size: 1.05rem; }
        }

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
        .sch-step { display: flex; flex-direction: column; gap: 10px; }
        .sch-step-top { display: flex; justify-content: space-between; align-items: center; }
        .sch-step-n { font-family: var(--lv2-font-mono); font-size: 12px; font-weight: 700; letter-spacing: 0.1em; color: var(--lv2-cyan-soft); }
        .sch-step h3, .sch-pillar h3, .sch-pilot h3 { margin: 0; font-family: var(--lv2-font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.01em; }
        .sch-step p, .sch-pilot p { margin: 0; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(232,237,255,0.72); }
        .sch-pillar { border-top: 2px solid var(--sch-accent); }
        .sch-pillar ul, .sch-pilot ul, .sch-receive { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .sch-pillar li, .sch-pilot li, .sch-receive li {
          position: relative; padding-left: 24px; font-family: var(--lv2-font-display);
          font-size: 14.5px; line-height: 1.5; color: rgba(232,237,255,0.8);
        }
        .sch-pillar li::before, .sch-pilot li::before, .sch-receive li::before {
          content: "✓"; position: absolute; left: 0; top: 0; font-weight: 800; color: var(--sch-accent, #5fffa3);
        }
        .sch-receive { margin-top: 26px; }
        .sch-receive li { font-size: 15.5px; }
        .sch-pilot { display: flex; flex-direction: column; gap: 14px; border-color: rgba(95,255,163,0.35); }
        .sch-pilot .sch-chip { align-self: flex-start; }
        .sch-pilot a { align-self: flex-start; }

        .sch-form-grid { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 18px; }
        .sch-form-span { grid-column: 1 / -1; }
        @media (max-width: 640px) { .sch-form-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
