"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import Nav from "@/app/components/landing-v2/Nav";
import Footer from "@/app/components/landing-v2/Footer";
import SchoolsGlobe from "@/app/schools/SchoolsGlobe";
import ProofBand from "@/app/components/ProofBand";
import { FadeUp } from "@/app/components/landing-v2/utilities";

import CourseLockup, { COURSE_HREF, type LockupId } from "@/app/components/CourseLockup";
import { sectionMark } from "@/app/components/sectionMark";
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

/* Every eyebrow on this page takes the shared section mark, the same one
   the homepage uses. Ten of them come from this constant. */
const eyebrow: React.CSSProperties = sectionMark;

const h2: React.CSSProperties = {
  margin: "14px 0 0",
  fontFamily: "var(--lv2-font-display)",
  fontSize: "clamp(1.9rem, 3.4vw, 2.8rem)",
  lineHeight: 1.06,
  letterSpacing: "-0.025em",
  fontWeight: 400,
  color: "var(--lv2-ink)",
};

const lede: React.CSSProperties = {
  margin: "16px 0 0",
  fontFamily: "var(--lv2-font-display)",
  fontSize: "clamp(1rem, 1.2vw, 1.1rem)",
  lineHeight: 1.6,
  color: "rgba(17,22,38,0.82)",
  maxWidth: 640,
};

const pillPrimary: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 58,
  padding: "0 34px",
  borderRadius: 999,
  /* the same deep teal the homepage primary carries, with paper on it */
  background: "linear-gradient(135deg, #0a7085 0%, #086072 55%, #075464 100%)",
  color: "#fffdfa",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 16.5,
  fontWeight: 700,
  letterSpacing: "0.005em",
  textDecoration: "none",
  /* a saturated cast under it and a lit top edge: the paper equivalent of
     the glow this button had on the dark page */
  boxShadow: "0 16px 38px -12px rgba(10,112,133,0.9), 0 0 0 1px rgba(10,112,133,0.3), inset 0 1px 0 rgba(255,255,255,0.4)",
  whiteSpace: "nowrap",
};

const pillGhost: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 58,
  padding: "0 26px",
  borderRadius: 999,
  border: "1px solid rgba(20,22,29,0.22)",
  background: "rgba(255,253,248,0.8)",
  color: "var(--lv2-ink)",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 15.5,
  fontWeight: 600,
  textDecoration: "none",
  whiteSpace: "nowrap",
};

/* Real screens fanned in the hero: front, middle, back. */
const STACK = [
  { img: "explorers-map", url: "algorithmx.io/explorers" },
  { img: "heroes-learn", url: "algorithmx.io/lesson/1" },
  { img: "explorers-meter", url: "algorithmx.io/explorers" },
];

const SECTIONS: ReadonlyArray<readonly [id: string, label: string, cta?: boolean]> = [
  ["phase", "Your phase"],
  ["product", "The screens"],
  ["how", "Set-up"],
  ["classroom", "Classroom"],
  ["receive", "What you get"],
  ["questions", "Questions"],
  ["enquiry", "Get in touch", true],
];

const STEPS = [
  { n: "01", colour: "#0a7085", title: "We create your licence", text: "We set up the school licence and your teacher logins. There is nothing to install: it runs in the browser your school already has." },
  { n: "02", colour: "#5744c9", title: "You build your classes", text: "Make a class, add your pupils by first name, and assign the course that class will take. Pupils sign in with a class code and a picture password." },
  { n: "03", colour: "#0e7a45", title: "Run the lessons", text: "Twenty weeks of lessons, one a week, about 50 minutes each. That leaves time either side to log in and log out inside a one-hour slot. Progress saves on every screen, so each pupil picks up exactly where they left off." },
  { n: "04", colour: "#8a5400", title: "Get the class report", text: "A detailed breakdown of the class and feedback on every pupil: who finished, what they found hard, and a certificate each to take home." },
];

/* The four courses, in the order a school meets them. Ages match the
   course landings; nothing here is a claim we cannot show on those pages. */
const COURSE_MARKS: ReadonlyArray<{ id: LockupId; ages: string; accent: string }> = [
  { id: "heroes", ages: "Ages 6 to 9", accent: "#8a5400" },
  { id: "explorers", ages: "Ages 10 to 13", accent: "#0a6675" },
  { id: "ops", ages: "Ages 14 to 17", accent: "#5744c9" },
  { id: "pro", ages: "Ages 18+", accent: "#a63a08" },
];

const PILLARS = [
  {
    title: "Independent by design",
    accent: "#0a7085",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 14v-3a8 8 0 0 1 16 0v3" /><rect x="3" y="13" width="4" height="7" rx="1.5" /><rect x="17" y="13" width="4" height="7" rx="1.5" /></svg>,
    points: ["Every instruction is spoken and captioned", "Pupils resume from the exact screen they left", "Wrong answers get a reason and another go", "Zero lesson prep. Zero marking."],
  },
  {
    title: "Safe by default",
    accent: "#0e7a45",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
    /* Four points each, so the three cards carry the same weight. The
       two data lines read better as one anyway. */
    points: ["Cyber Essentials certified, the NCSC-backed security standard", "A closed environment: pupils only ever interact with the lesson", "Pupil data is never sent to AI services", "First name, class and progress only, deleted whenever you ask"],
  },
  {
    title: "Matched to the curriculum",
    accent: "#8a5400",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" /><path d="M4 20.5V5.5M8 7h8M8 10.5h8" /></svg>,
    points: ["Education for a Connected World strands", "The computing programme of study", "Online safety within RSHE", "A mapping sheet for every lesson"],
  },
];

const RECEIVE = [
  "A whole-school licence for your phase",
  "The teacher view for every class",
  "An end-of-course class report",
  "Certificates for every pupil",
  "The curriculum mapping sheet",
];

const FAQS = [
  { q: "What do we need in the room?", a: "Any computer with a modern browser. Headphones help, and captions cover the rest. It runs entirely in the browser, so your network team has nothing to set up." },
  { q: "How long is a lesson?", a: "About 50 minutes, which fits an hour slot with time to log in and log out. Progress saves on every screen, so if the bell goes, the pupil picks up exactly where they left off next week." },
  { q: "Who teaches it?", a: "The class teacher, whatever their confidence with computing. The narrator carries every instruction, the games mark themselves, and the teacher view shows who needs a nudge." },
  { q: "What pupil data do you hold?", a: "First name, class and progress, and that is all. Pupil activity stays within the platform and is never sent to an AI service, and we delete a school's data in full whenever you ask." },
  { q: "Is it safe?", a: "Yes. AlgorithmX is Cyber Essentials certified, the NCSC-backed standard for defending against common cyber attacks. Pupils only ever interact with the lesson itself, inside a closed environment built for schools, and every reward is personal to the pupil." },
  { q: "How does a school get started?", a: "Get in touch and we'll walk you through the onboarding process: the agreement, your licence, building your classes and the first lesson. Most schools start with a walkthrough so they can see the lessons before they commit." },
];

const PHASE_KEY = "ax-schools-phase";
const isPhase = (v: unknown): v is Phase => v === "primary" || v === "secondary";

export default function SchoolsLanding() {
  const [phase, setPhase] = useState<Phase>("primary");
  const [activeSection, setActiveSection] = useState("");
  const subnavRef = useRef<HTMLElement>(null);
  const info = PHASES[phase];

  // One chip, rendered either in the nav or in the strip below it.
  const sectionChip = ([id, label, cta]: (typeof SECTIONS)[number]) => (
    <a
      key={id}
      href={`#${id}`}
      data-target={id}
      aria-current={activeSection === id ? "location" : undefined}
      className={`sch-chip-link${cta ? " sch-chip-cta" : ""}${activeSection === id ? " on" : ""}`}
    >
      {label}
    </a>
  );

  // Scroll-spy for the sticky section nav: the topmost section whose top
  // has passed the sticky bars is "current"; the strip scrolls its chip
  // into view on narrow screens.
  useEffect(() => {
    const els = SECTIONS.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = SECTIONS.find(([id]) => visible.has(id));
        if (first) setActiveSection(first[0]);
      },
      { rootMargin: "-130px 0px -60% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const nav = subnavRef.current;
    if (!nav || !activeSection) return;
    const chip = nav.querySelector<HTMLElement>(`[data-target="${activeSection}"]`);
    if (!chip || nav.scrollWidth <= nav.clientWidth) return;
    nav.scrollTo({ left: chip.offsetLeft - (nav.clientWidth - chip.clientWidth) / 2, behavior: "smooth" });
  }, [activeSection]);

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
    <div className="sch-page" style={{ display: "contents" }}>
      <SchoolsGlobe tone="sand" />
      {/* The page's own chrome: no telemetry, no site links. The brand cube
          is the way back home, and the section links ride in the bar itself
          wherever there is room for them. */}
      <Nav
        tone="sand"
        showTelemetry={false}
        showSiteLinks={false}
        cta={{ label: "Get in touch", href: "#enquiry" }}
        aside={{ label: "School login", href: "/schools/login" }}
        centre={
          <nav className="sch-navsections" aria-label="On this page">
            {SECTIONS.filter(([, , cta]) => !cta).map(sectionChip)}
          </nav>
        }
      />
      {/* overflow-x: clip keeps the decorative section glows (negative right
          offsets) from widening the page, which let phones pan sideways by
          160px. clip, unlike hidden, is not a scroll container, so the
          sticky section bar inside still sticks. */}
      <main style={{ position: "relative", color: "var(--lv2-ink)", minHeight: "100vh", overflowX: "clip" }}>
        {/* SECTION NAV ────────────────────────────────────── */}
        <div className="sch-subnav-wrap">
          <nav ref={subnavRef} className="sch-subnav" aria-label="On this page">
            {SECTIONS.map(sectionChip)}
          </nav>
        </div>

        {/* HERO ────────────────────────────────────────────── */}
        <section className="sch-section sch-hero-section">
          <FadeUp>
            <div className="sch-toprow">
              <Link href="/" className="sch-toplink"><span aria-hidden>←</span> Back to home</Link>
            </div>
          </FadeUp>

          <div className="sch-hero-grid">
            <div className="sch-hero">
              <FadeUp>
                <p style={eyebrow}>{"// For UK and British schools worldwide"}</p>
              </FadeUp>
              <FadeUp delay={0.06}>
                <h1 className="sch-h1">
                  Cybersecurity lessons your pupils <span className="sch-grad">teach themselves.</span>
                </h1>
              </FadeUp>
              <FadeUp delay={0.12}>
                <p style={{ ...lede, fontSize: "clamp(1.05rem, 1.35vw, 1.2rem)", maxWidth: 560 }}>
                  Cyber Heroes for primary. Cyber Explorers and Cyber Ops for secondary. Pupils work on their own on the school&rsquo;s computers, one 50-minute lesson a week. Teachers see everything and prepare nothing.
                </p>
              </FadeUp>
              <FadeUp delay={0.18}>
                <div className="sch-cta-row">
                  {/* Owner: make Register your interest stand out more, and
                      "look inside the product" should be educational, about
                      the curriculum. The second button also gets quieter, so
                      the first wins on contrast rather than on size alone. */}
                  <a href="#enquiry" style={pillPrimary}>
                    Register your interest
                    <span aria-hidden style={{ marginLeft: 10, fontSize: 17, lineHeight: 1 }}>&rarr;</span>
                  </a>
                  <a href="#product" style={pillGhost}>Explore the curriculum</a>
                </div>
              </FadeUp>
              <FadeUp delay={0.24}>
                <ul className="sch-trust">
                  {/* Owner: 6 to 18 plus, and the first line should sell the
                      fact that the course keeps up with new attack methods. */}
                  <li>Cyber skills that outpace the newest attacks</li>
                  <li>One platform, ages 6 to 18+</li>
                  <li>Certified and curriculum mapped</li>
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

        {/* ACCREDITATIONS ─────────────────────────────────── */}
        {/* The same band as the homepage, in the same place: straight
            after the hero, where its height does not depend on the
            window. It used to be four pills inside the hero here too. */}
        <ProofBand tone="sand" />

        {/* REACH ──────────────────────────────────────────── */}
        <section className="sch-section sch-reach-section">
          <FadeUp>
            <div className="sch-reach">
              <div>
                <p style={eyebrow}>{"// One build, every time zone"}</p>
                <h2 style={h2}>
                  Teach it in London. <span className="sch-grad">Teach it worldwide.</span>
                </h2>
                <p style={{ ...lede, maxWidth: 620 }}>
                  British schools teach far beyond Britain, and this curriculum travels with them. One build serves every site from the edge, so the same week, the same safeguarding and the same teacher dashboard open in a browser tab wherever your classroom is.
                </p>
              </div>
            </div>
          </FadeUp>
        </section>

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
                              <CourseLockup id={c.lockup} size={0.95} tone="sand" />
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
            <h2 style={h2}>See the learning platform, <span className="sch-grad">not a brochure.</span></h2>
            <p style={lede}>
              Four screens captured straight from the live product, as a pupil sees it, and two showing what teachers get. Pick a step, or open any screen full size.
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
            <h2 style={h2}>Four steps. <span className="sch-grad">Half of them are ours.</span></h2>
          </FadeUp>
          <div className="sch-grid-4" style={{ marginTop: 36 }}>
            {STEPS.map((s, i) => (
              <FadeUp key={s.n} delay={0.06 * i}>
                <div className="sch-card sch-step" style={{ ["--sch-accent" as string]: s.colour }}>
                  {/* Owner 2026-09-22: the Day 1 / Weekly / End of course
                      pills came off. Nothing else about these changed. */}
                  <span className="sch-step-top">
                    <span className="sch-step-n">{s.n}</span>
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
            <p style={lede}>Thirty pupils, one adult, fifty minutes. Every part of the platform is built around that room.</p>
          </FadeUp>
          <div className="sch-grid-3" style={{ marginTop: 36 }}>
            {PILLARS.map((p, i) => (
              <FadeUp key={p.title} delay={0.06 * i}>
                <div className="sch-card sch-pillar" style={{ ["--sch-accent" as string]: p.accent }}>
                  <span className="sch-pillar-icon">{p.icon}</span>
                  <h3>{p.title}</h3>
                  <span className="sch-rule" aria-hidden />
                  <ul>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                </div>
              </FadeUp>
            ))}
          </div>

          {/* The range the room gets, and the mark it is aligned to. Wording
              follows /cyberheroes: ASDAN is an alignment, not an award. */}
          <FadeUp delay={0.2}>
            <div className="sch-marks">
              <div className="sch-marks-courses">
                <p className="sch-marks-label">{"// One platform, four courses"}</p>
                <ul className="sch-marks-row">
                  {COURSE_MARKS.map((m) => (
                    /* Same links as the homepage chips, from the same map. */
                    <li key={m.id} style={{ ["--sch-accent" as string]: m.accent }}>
                      <Link href={COURSE_HREF[m.id]} className="sch-mark">
                        <CourseLockup id={m.id} size={0.82} tone="sand" />
                        <span className="sch-mark-age">{m.ages}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="sch-marks-accred">
                <span className="sch-marks-plate">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logos/asdan.jpg" alt="ASDAN" loading="lazy" />
                </span>
                <span className="sch-marks-accred-text">
                  <strong>ASDAN</strong>
                  <span>Accreditation aligned</span>
                </span>
              </div>
            </div>
          </FadeUp>
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
                <span className="sch-chip sch-chip-live">No cost</span>
                <h3>See it with a real class first.</h3>
                <p>Book a walkthrough and we will show you the lessons, the teacher view and the reporting, on your screen, with time for your questions.</p>
                <ul>
                  <li>A run through a real lesson, start to finish</li>
                  <li>The teacher view and the class report</li>
                  <li>Straight answers on data, set-up and cost</li>
                </ul>
                <a href="#enquiry" style={{ ...pillPrimary, marginTop: "auto" }}>Book a walkthrough</a>
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
                <h2 style={h2}>Thinking of <span className="sch-grad">registering?</span></h2>
                <p style={lede}>
                  We&rsquo;ll explain the onboarding process, from the agreement to the first lesson, and reply within two working days. We bring the processing agreement and a data-protection summary to the first conversation so your DPO has what they need.
                </p>
                <p style={{ ...lede, fontSize: 14.5, color: "rgba(17,22,38,0.63)" }}>
                  Prefer email? <a href="mailto:admissions@algorithmx.co.uk" style={{ color: "var(--lv2-cyan-soft)" }}>admissions@algorithmx.co.uk</a>
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
        /* The sand token layer. Without it the page keeps reading the
           neon values straight out of globals.css: --lv2-cyan-soft is
           still #0a7085, which is 1.1:1 on paper. */
        .sch-page, .sch-page :is(section, div, nav, header, footer, main, span, p, li, a) {
          --lv2-cyan: #0a7085;
          --lv2-cyan-soft: #0a7085;
          --lv2-lime: #0e7a45;
          --lv2-cosmic: #5744c9;
          --lv2-text-muted: #5d6472;
          --lv2-ink: #14161d;
        }
        html, .sch-page { background: #f3ede4; }

        .sch-section {
          position: relative;
          max-width: 1180px;
          margin: 0 auto;
          padding: calc(var(--lv2-rail) * 1.3) var(--lv2-rail);
          scroll-margin-top: 128px;
        }
        /* Fixed nav is 68px; keep the top row close under it at every width. */
        .sch-hero-section { padding-top: clamp(26px, 2.2vw, 44px); padding-bottom: calc(var(--lv2-rail) * 0.8); }
        .sch-glow { position: absolute; pointer-events: none; z-index: 0; border-radius: 50%; filter: blur(60px); opacity: 0.55; }
        .sch-glow-amber { width: 520px; height: 520px; right: -140px; top: -80px; background: radial-gradient(circle, rgba(255,179,71,0.35), transparent 65%); }
        .sch-glow-cyan { width: 640px; height: 640px; left: -220px; top: 120px; background: radial-gradient(circle, rgba(10,112,133,0.28), transparent 65%); }
        .sch-glow-violet { width: 560px; height: 560px; right: -160px; top: 40px; background: radial-gradient(circle, rgba(124,92,255,0.38), transparent 65%); }
        .sch-glow-lime { width: 480px; height: 480px; left: -160px; top: 0; background: radial-gradient(circle, rgba(126,255,151,0.22), transparent 65%); }
        .sch-section > *:not(.sch-glow) { position: relative; z-index: 1; }

        /* keyboard focus: every custom control on the page */
        .sch-section :is(a, button, summary, input, select, textarea):focus-visible,
        .sch-subnav a:focus-visible,
        .sch-lightbox button:focus-visible {
          outline: 2px solid var(--lv2-cyan); outline-offset: 3px;
        }
        .sch-phase:focus-visible { outline-offset: 4px; }

        .sch-reach-section {
          padding-top: calc(var(--lv2-rail) * 0.5);
          padding-bottom: calc(var(--lv2-rail) * 0.5);
        }
        .sch-reach {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: clamp(22px, 4vw, 60px);
          align-items: end;
        }
        .sch-reach-chips {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sch-reach-chips li {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 9px 16px;
          border-radius: 999px;
          border: 1px solid rgba(10,112,133,0.22);
          background: rgba(255,253,248,0.74);
          font-family: var(--lv2-font-mono);
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(17,22,38,0.88);
          white-space: nowrap;
        }
        .sch-reach-chips li::before {
          content: "";
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #0a7085;
          box-shadow: 0 0 10px rgb(10,112,133);
        }
        @media (max-width: 900px) {
          .sch-reach { grid-template-columns: minmax(0, 1fr); }
          .sch-reach-chips { flex-direction: row; flex-wrap: wrap; }
        }

        .sch-grad {
          background: linear-gradient(92deg, #0a7085 0%, #5744c9 55%, #a5117f 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .sch-h1 {
          margin: 18px 0 0; font-family: var(--lv2-font-display);
          font-size: clamp(2.5rem, 5vw, 4.3rem); line-height: 1.0; letter-spacing: -0.03em; font-weight: 400;
        }

        .sch-toprow { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 26px; }
        .sch-toplink {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none;
          color: var(--lv2-cyan-soft); white-space: nowrap; transition: opacity .2s ease;
        }
        .sch-toplink:hover { opacity: .8; }
        .sch-toplink-login { padding: 10px 16px; border-radius: 999px; border: 1px solid rgba(20,22,29,0.4); background: rgba(10,112,133,0.08); }

        /* hero */
        .sch-hero-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr); gap: 44px; align-items: center; }
        .sch-cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 30px; }
        .sch-trust { list-style: none; padding: 0; margin: 24px 0 0; display: flex; flex-wrap: wrap; gap: 10px 22px; }
        .sch-trust li {
          position: relative; padding-left: 18px;
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,22,38,0.73);
        }
        .sch-trust li::before { content: ""; position: absolute; left: 0; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #0e7a45; box-shadow: 0 0 10px #0e7a45; }

        .sch-stack { position: relative; width: 100%; aspect-ratio: 5 / 4; }
        .sch-stack::before {
          content: ""; position: absolute; inset: -6%; z-index: 0; border-radius: 40%;
          background: radial-gradient(closest-side at 35% 35%, rgba(10,112,133,0.32), transparent 70%),
                      radial-gradient(closest-side at 75% 75%, rgba(185,139,255,0.36), transparent 70%),
                      radial-gradient(closest-side at 70% 20%, rgba(255,138,212,0.2), transparent 70%);
          filter: blur(18px);
        }
        .sch-stack-card {
          position: absolute; width: 72%; border-radius: 14px; overflow: hidden; background: #fffdf8;
          border: 1px solid rgba(20,22,29,0.35);
          box-shadow: 0 30px 70px -30px rgba(10,112,133,0.55), 0 30px 60px -20px rgba(0,0,0,0.85);
          transition: transform .5s var(--lv2-ease-soft);
        }
        .sch-stack-bar { height: 24px; display: flex; align-items: center; gap: 5px; padding: 0 10px; background: #f4efe7; font-family: var(--lv2-font-mono); font-size: 9.5px; color: rgba(17,22,38,0.65); }
        .sch-stack-bar i { width: 7px; height: 7px; border-radius: 50%; background: rgba(244,239,231,0.26); }
        .sch-stack-bar i:nth-child(1) { background: #ff5f57; } .sch-stack-bar i:nth-child(2) { background: #febc2e; } .sch-stack-bar i:nth-child(3) { background: #28c840; }
        .sch-stack-bar span { margin-left: 6px; }
        .sch-stack-card img { display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover; object-position: top center; }
        .sch-stack-2 { left: 0; top: 0; z-index: 1; transform: rotate(-7deg) scale(0.92); opacity: 0.92; }
        .sch-stack-1 { right: 0; top: 10%; z-index: 2; transform: rotate(4deg) scale(0.96); }
        .sch-stack-0 { left: 9%; top: 28%; z-index: 3; transform: rotate(-2deg); border-color: rgba(20,22,29,0.55); }
        .sch-stack:hover .sch-stack-0 { transform: rotate(-1deg) translateY(-6px); }
        .sch-stack:hover .sch-stack-1 { transform: rotate(5deg) scale(0.96) translateY(-4px); }

        /* section nav */
        .sch-subnav-wrap { margin-top: 68px; position: sticky; top: 68px; z-index: 30; background: rgba(255,253,248,0.68); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid rgba(10,112,133,0.1); border-bottom: 1px solid rgba(10,112,133,0.1); }
        .sch-subnav { max-width: 1180px; margin: 0 auto; padding: 10px var(--lv2-rail); display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; scroll-behavior: smooth; }
        .sch-subnav::-webkit-scrollbar { display: none; }
        /* One bar wherever the nav has room for the section links: they ride
           in the nav itself and the strip below it goes away. Narrower than
           that, the nav keeps only the brand and the CTA and the strip stays,
           because six chips plus both of those cannot be read side by side. */
        .sch-navsections { display: none; }
        @media (min-width: 1180px) {
          .sch-navsections { display: flex; align-items: center; gap: 6px; min-width: 0; }
          .sch-subnav-wrap { display: none; }
          .sch-hero-section { padding-top: calc(68px + clamp(26px, 2.2vw, 44px)); }
          .sch-section { scroll-margin-top: 88px; }
        }
        .sch-chip-link {
          flex: 0 0 auto; display: inline-flex; align-items: center; min-height: 36px; padding: 0 14px; border-radius: 999px; text-decoration: none;
          border: 1px solid rgba(20,22,29,0.22); background: rgba(255,253,248,0.57);
          font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          color: rgba(17,22,38,0.82); transition: border-color .2s ease, color .2s ease, background .2s ease, box-shadow .2s ease;
        }
        .sch-chip-link:hover { border-color: var(--lv2-cyan); color: #fff; background: rgba(10,112,133,0.1); }
        .sch-chip-link.on { border-color: var(--lv2-cyan); color: #fff; background: rgba(10,112,133,0.16); box-shadow: 0 0 18px -6px var(--lv2-cyan); }
        .sch-chip-cta { border-color: transparent; color: #04050d; background: linear-gradient(135deg, #2af0ff 0%, #00cfff 55%, #00b4f0 100%); margin-left: auto; }
        .sch-chip-cta:hover, .sch-chip-cta.on { color: #04050d; background: linear-gradient(135deg, #5ff5ff 0%, #1fd8ff 55%, #14c2f8 100%); border-color: transparent; }
        /* fade the trailing edge when the strip scrolls (narrow screens) */
        @media (max-width: 1100px) {
          .sch-subnav { -webkit-mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 44px), transparent); mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 44px), transparent); padding-right: calc(var(--lv2-rail) + 32px); }
          .sch-chip-cta { margin-left: 0; }
        }

        /* cards */
        .sch-card {
          position: relative; height: 100%; box-sizing: border-box;
          padding: 26px 24px; border-radius: 18px;
          background: linear-gradient(180deg, rgba(244,239,231,0.78), rgba(255,253,248,0.78));
          border: 1px solid rgba(20,22,29,0.24);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px -30px rgba(10,112,133,0.35);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .sch-chip {
          display: inline-flex; align-items: center; height: 22px; padding: 0 9px;
          border-radius: 999px; border: 1px solid rgba(17,22,38,0.29);
          font-family: var(--lv2-font-mono); font-size: 10px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase; color: rgba(17,22,38,0.84); white-space: nowrap;
        }
        .sch-chip-live { border-color: rgba(95,255,163,0.6); color: #0e7a45; background: rgba(95,255,163,0.12); box-shadow: 0 0 14px -4px rgba(95,255,163,0.6); }

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
          padding: 0; border-radius: 22px; color: var(--lv2-ink); background: #fffdf8;
          border: 1px solid rgba(20,22,29,0.22); font-family: var(--lv2-font-display);
          transition: border-color .25s ease, box-shadow .25s ease, transform .25s ease;
          box-shadow: 0 30px 60px -40px rgba(0,0,0,0.9);
        }
        .sch-phase:hover { transform: translateY(-3px); border-color: rgba(20,22,29,0.45); }
        .sch-phase-on { border-color: var(--sch-accent); box-shadow: 0 0 0 1.5px var(--sch-accent), 0 40px 90px -40px var(--sch-accent2), 0 0 60px -20px var(--sch-accent); }
        .sch-phase-art { position: absolute; inset: 0; background-repeat: no-repeat; filter: saturate(1.15) brightness(1.02); transition: transform .6s var(--lv2-ease-soft); }
        .sch-phase:hover .sch-phase-art { transform: scale(1.03); }
        .sch-phase-scrim { position: absolute; inset: 0; background: linear-gradient(100deg, rgba(255,253,248,0.96) 0%, rgba(255,253,248,0.9) 40%, rgba(255,253,248,0.5) 68%, rgba(255,253,248,0.22) 100%); }
        .sch-phase-body { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 14px; padding: 26px 26px 24px; max-width: 74%; }
        .sch-phase-head { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
        .sch-phase-label { font-size: clamp(1.8rem, 2.8vw, 2.4rem); letter-spacing: -0.02em; line-height: 1; }
        .sch-phase-years { font-family: var(--lv2-font-mono); font-size: 11.5px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--sch-accent); font-weight: 700; }
        .sch-phase-headline { font-size: 15.5px; line-height: 1.5; color: rgba(17,22,38,0.89); }
        .sch-phase-courses { display: flex; flex-direction: column; gap: 10px; }
        .sch-course { display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 12px; background: rgba(255,253,248,0.72); border: 1px solid rgba(17,22,38,0.13); backdrop-filter: blur(6px); }
        .sch-course-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .sch-course-years { font-family: var(--lv2-font-mono); font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,22,38,0.68); }
        .sch-course-note { font-size: 13.5px; line-height: 1.5; color: rgba(17,22,38,0.76); }
        .sch-phase-check {
          align-self: flex-start; margin-top: 4px;
          font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;
          padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(17,22,38,0.66); color: #14161d; background: rgba(255,253,248,0.6);
        }
        .sch-phase:not(.sch-phase-on):hover .sch-phase-check { border-color: var(--sch-accent); color: var(--sch-accent); }
        .sch-phase-on .sch-phase-check { border-color: var(--sch-accent); color: #04050d; background: var(--sch-accent); }
        @media (max-width: 820px) {
          .sch-phase { min-height: 0; }
          .sch-phase-body { max-width: 100%; }
          .sch-phase-scrim { background: linear-gradient(180deg, rgba(255,253,248,0.9) 0%, rgba(255,253,248,0.9) 100%); }
        }

        /* product tabs */
        .sch-tabs { display: grid; grid-template-columns: minmax(0, 330px) minmax(0, 1fr); gap: 28px; align-items: start; }
        .sch-tablist { display: flex; flex-direction: column; gap: 6px; }
        .sch-tab {
          text-align: left; cursor: pointer; width: 100%;
          display: flex; flex-direction: column; gap: 6px;
          padding: 16px 18px 16px 20px; border-radius: 14px;
          background: transparent; color: var(--lv2-ink);
          border: 1px solid transparent; border-left: 2px solid rgba(17,22,38,0.15);
          font-family: var(--lv2-font-display); transition: background .2s ease, border-color .2s ease;
        }
        .sch-tab:hover { background: rgba(244,239,231,0.6); }
        .sch-tab-on { background: linear-gradient(180deg, rgba(244,239,231,0.9), rgba(255,253,248,0.9)); border-color: rgba(20,22,29,0.24); border-left-color: var(--sch-accent); box-shadow: 0 16px 40px -28px var(--sch-accent); }
        .sch-tab-head { display: flex; align-items: baseline; gap: 12px; }
        .sch-tab-n { font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.1em; color: var(--sch-accent); }
        .sch-tab-title { font-size: 1.25rem; letter-spacing: -0.01em; }
        .sch-tab-desc { font-size: 13.5px; line-height: 1.5; color: rgba(17,22,38,0.71); }
        .sch-tab:not(.sch-tab-on) .sch-tab-desc { display: none; }
        .sch-frame {
          border-radius: 16px; overflow: hidden; background: #fffdf8;
          border: 1px solid rgba(20,22,29,0.4);
          border-color: color-mix(in srgb, var(--sch-accent) 45%, transparent);
          box-shadow: 0 40px 90px -40px var(--sch-accent), 0 0 0 1px rgba(255,255,255,0.03);
        }
        .sch-frame-zoom { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
        .sch-frame-zoom img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; }
        .sch-frame-bar { display: flex; align-items: center; gap: 14px; height: 42px; padding: 0 14px; background: #f4efe7; border-bottom: 1px solid rgba(17,22,38,0.08); }
        .sch-frame-dots { display: inline-flex; gap: 6px; }
        .sch-frame-dots i { width: 10px; height: 10px; border-radius: 50%; display: block; }
        .sch-frame-url { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--lv2-font-mono); font-size: 12px; color: rgba(17,22,38,0.76); background: rgba(255,253,248,0.7); border-radius: 8px; padding: 6px 12px; }
        .sch-frame-chip { font-family: var(--lv2-font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #8a5400; border: 1px solid rgba(255,179,71,0.5); border-radius: 999px; padding: 4px 9px; white-space: nowrap; }
        .sch-frame-body { position: relative; width: 100%; aspect-ratio: 16 / 10; background: #fffdf8; }
        .sch-enlarge {
          position: absolute; right: 12px; bottom: 12px; z-index: 2; cursor: pointer;
          display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.28); background: rgba(255,253,248,0.72); color: #14161d;
          font-family: var(--lv2-font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          backdrop-filter: blur(6px); transition: background .2s ease, border-color .2s ease;
        }
        .sch-enlarge:hover { background: rgba(10,112,133,0.18); border-color: var(--lv2-cyan); }
        .sch-frame-foot { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 12px 10px 16px; border-top: 1px solid rgba(17,22,38,0.08); }
        .sch-frame-caption { margin: 0; font-family: var(--lv2-font-display); font-size: 13.5px; line-height: 1.5; color: rgba(17,22,38,0.76); }
        .sch-frame-nav { display: inline-flex; align-items: center; gap: 8px; flex: 0 0 auto; }
        .sch-frame-nav button {
          width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 22px; line-height: 1;
          border: 1px solid rgba(20,22,29,0.3); background: rgba(255,253,248,0.66); color: #14161d; transition: background .2s ease, border-color .2s ease;
        }
        @media (hover: none) { .sch-frame-nav button { width: 44px; height: 44px; } }
        .sch-frame-nav button:hover { background: rgba(10,112,133,0.16); border-color: var(--lv2-cyan); }
        .sch-frame-dotnav { display: inline-flex; gap: 5px; }
        .sch-frame-dotnav i { width: 6px; height: 6px; border-radius: 50%; background: rgba(244,239,231,0.26); }
        .sch-frame-dotnav i.on { background: var(--sch-accent); box-shadow: 0 0 8px var(--sch-accent); }
        @media (max-width: 900px) {
          .sch-tabs { grid-template-columns: 1fr; gap: 16px; }
          .sch-tablist { flex-direction: row; overflow-x: auto; gap: 8px; padding: 4px 40px 6px 4px; scrollbar-width: none; -webkit-mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 44px), transparent); mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 44px), transparent); }
          .sch-tablist::-webkit-scrollbar { display: none; }
          .sch-tab { flex: 0 0 auto; width: auto; min-width: 150px; padding: 12px 14px; border-left-width: 1px; border-bottom: 2px solid rgba(17,22,38,0.15); }
          .sch-tab-on { border-bottom-color: var(--sch-accent); border-left-color: rgba(20,22,29,0.24); }
          .sch-tab-desc { display: none !important; }
          .sch-tab-title { font-size: 1.05rem; }
          .sch-frame-foot { flex-direction: column; align-items: flex-start; }
        }

        /* lightbox */
        .sch-lightbox { position: fixed; inset: 0; z-index: 100; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(255,253,248,0.84); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .sch-lightbox-inner { position: relative; max-width: min(96vw, 1600px); max-height: 94vh; display: flex; flex-direction: column; gap: 10px; }
        .sch-lightbox-inner img { display: block; max-width: 100%; max-height: calc(94vh - 60px); object-fit: contain; border-radius: 12px; border: 1px solid rgba(20,22,29,0.35); box-shadow: 0 40px 100px -30px rgba(10,112,133,0.5); }
        .sch-lightbox-inner p { margin: 0; font-family: var(--lv2-font-display); font-size: 14px; color: rgba(17,22,38,0.84); text-align: center; }
        .sch-lightbox-close { position: absolute; top: -14px; right: -14px; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 26px; line-height: 1; border: 1px solid rgba(255,255,255,0.3); background: #f4efe7; color: #fff; }

        /* mock app (teacher view + curriculum map) */
        .sch-mock { position: absolute; inset: 0; display: flex; font-family: var(--lv2-font-display); color: #14161d; font-size: 12.5px; overflow: hidden; }
        .sch-mock-side { width: 150px; flex: 0 0 150px; background: #fffdf8; border-right: 1px solid rgba(70,58,44,0.14); padding: 16px 14px; display: flex; flex-direction: column; }
        .sch-mock-brand { font-family: var(--lv2-font-mono); font-weight: 800; letter-spacing: 0.12em; font-size: 11px; margin-bottom: 18px; }
        .sch-mock-side ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
        .sch-mock-side li { padding: 7px 9px; border-radius: 8px; color: rgba(17,22,38,0.63); }
        .sch-mock-side li.on { background: rgba(10,112,133,0.14); color: #14161d; font-weight: 600; }
        .sch-mock-school { margin-top: auto; display: flex; flex-direction: column; gap: 3px; }
        .sch-mock-school span { font-family: var(--lv2-font-mono); font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(17,22,38,0.66); }
        .sch-mock-school strong { font-size: 12px; font-weight: 600; }
        /* Three surfaces inside the mock, the same ones the page uses: the
           app canvas is the recessed ground, its panels are raised paper.
           Before this everything was one flat white and the panels were
           washes at 5% of a colour the light page does not have. */
        .sch-mock-main { flex: 1; min-width: 0; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; overflow: hidden; background: #f4efe6; }
        .sch-mock-title { display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
        .sch-mock-title h4 { margin: 4px 0 0; font-size: 20px; font-weight: 600; letter-spacing: -0.01em; }
        .sch-mock-eyebrow { font-family: var(--lv2-font-mono); font-size: 9.5px; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(17,22,38,0.66); }
        .sch-mock-btn { display: inline-flex; align-items: center; height: 28px; padding: 0 12px; border-radius: 999px; border: 1px solid; font-size: 11.5px; font-weight: 600; white-space: nowrap; }
        .sch-mock-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        .sch-mock-stats div { background: #fffdf8; border: 1px solid rgba(70,58,44,0.14); box-shadow: 0 2px 6px -4px rgba(86,68,45,0.5); border-radius: 10px; padding: 10px 12px; display: flex; flex-direction: column; gap: 2px; }
        .sch-mock-stats b { font-size: 22px; font-weight: 600; line-height: 1; }
        .sch-mock-stats span { font-size: 11px; color: rgba(17,22,38,0.63); }
        .sch-mock-cols { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 14px; min-height: 0; flex: 1; }
        .sch-mock-pupils { list-style: none; margin: 0; padding: 12px 14px; background: #fffdf8; border: 1px solid rgba(70,58,44,0.14); border-radius: 12px; display: flex; flex-direction: column; gap: 6px; align-self: start; }
        .sch-mock-pupils li { display: grid; grid-template-columns: 62px 1fr 64px; align-items: center; gap: 10px; }
        .sch-mock-name { font-weight: 600; }
        .sch-mock-bar { height: 7px; border-radius: 999px; background: #e7e0d2; overflow: hidden; display: block; }
        .sch-mock-bar i { display: block; height: 100%; border-radius: 999px; }
        .sch-mock-pct { font-family: var(--lv2-font-mono); font-size: 10.5px; color: rgba(17,22,38,0.63); text-align: right; }
        .sch-mock-missed { background: #fffdf8; border: 1px solid rgba(138,84,0,0.34); border-left: 3px solid #8a5400; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; align-self: start; }
        .sch-mock-q { margin: 2px 0 0; font-size: 14px; font-weight: 600; line-height: 1.35; }
        .sch-mock-n { margin: 0; font-size: 12px; color: rgba(17,22,38,0.79); }
        .sch-mock-n b { font-size: 18px; color: #8a5400; }
        .sch-mock-why { margin: 0; font-size: 11.5px; line-height: 1.45; color: rgba(17,22,38,0.65); }
        .sch-mock-missed .sch-mock-btn { margin-top: 4px; align-self: flex-start; }
        /* how far through the course this class is */
        .sch-mock-course { display: flex; align-items: center; gap: 8px; margin-top: 7px; }
        .sch-mock-course-track { display: block; width: 92px; height: 5px; border-radius: 999px; background: #e7e0d2; overflow: hidden; }
        .sch-mock-course-track i { display: block; height: 100%; border-radius: 999px; }
        .sch-mock-course-txt { font-family: var(--lv2-font-mono); font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,22,38,0.66); }

        /* the curriculum map's coverage summary */
        .sch-mock-cover { margin-top: 12px; padding-top: 11px; border-top: 1px solid rgba(70,58,44,0.16); display: flex; flex-direction: column; gap: 8px; }
        .sch-mock-cover-row { display: flex; flex-wrap: wrap; gap: 6px; }
        .sch-mock-cover-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; background: #fffdf8; border: 1px solid rgba(70,58,44,0.16); font-size: 10.5px; color: rgba(17,22,38,0.82); }
        .sch-mock-cover-chip i { width: 6px; height: 6px; border-radius: 999px; display: block; }

        .sch-mock-table { width: 100%; border-collapse: collapse; font-size: 11.5px; }
        .sch-mock-table th { text-align: left; font-family: var(--lv2-font-mono); font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(17,22,38,0.66); padding: 4px 8px 6px; border-bottom: 1px solid rgba(17,22,38,0.13); white-space: nowrap; }
        .sch-mock-table td { padding: 5px 8px; border-bottom: 1px solid rgba(17,22,38,0.07); vertical-align: top; color: rgba(17,22,38,0.86); line-height: 1.35; }
        .sch-mock-table td b { display: block; font-weight: 600; color: #14161d; }
        .sch-mock-table td span { font-size: 11px; color: rgba(17,22,38,0.66); }
        .sch-mock-table td i { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 7px; vertical-align: 1px; }
        /* the map is a document, not a dashboard: it keeps the paper ground */
        .sch-mock-cur .sch-mock-main { background: #fffdf8; }
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
        .sch-step p, .sch-pilot p { margin: 0; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(17,22,38,0.79); }
        /* the course + accreditation band */
        .sch-marks {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 20px clamp(20px, 3vw, 40px);
          margin-top: 30px;
          padding: 24px clamp(20px, 2.4vw, 30px);
          border-radius: 18px;
          border: 1px solid rgba(20,22,29,0.18);
          background: linear-gradient(180deg, rgba(244,239,231,0.6), rgba(255,253,248,0.6));
        }
        .sch-marks-courses { flex: 1 1 540px; min-width: 0; }
        .sch-marks-label {
          margin: 0 0 16px;
          font-family: var(--lv2-font-mono);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgb(10,112,133);
        }
        .sch-marks-row {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .sch-mark {
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, border-color .2s ease;
          display: flex;
          flex-direction: column;
          gap: 7px;
          padding: 12px 15px;
          border-radius: 12px;
          background: rgba(255,253,248,0.63);
          border: 1px solid rgba(20,22,29,0.14);
          border-left: 2px solid var(--sch-accent);
        }
        .sch-mark:hover {
          transform: translateY(-2px);
          border-color: var(--sch-accent);
          box-shadow: 0 16px 34px -20px rgba(86,68,45,0.7);
        }
        .sch-mark:focus-visible { outline: 2px solid var(--sch-accent); outline-offset: 3px; }
        .sch-mark-age {
          font-family: var(--lv2-font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(17,22,38,0.66);
        }
        .sch-marks-accred {
          flex: 0 0 auto;
          display: flex;
          align-items: center;
          gap: 14px;
          padding-left: clamp(0px, 2vw, 28px);
          border-left: 1px solid rgba(20,22,29,0.16);
        }
        .sch-marks-plate {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 9px 13px;
          border-radius: 12px;
          background: #fff;
          flex-shrink: 0;
        }
        .sch-marks-plate img { display: block; width: 96px; height: auto; }
        .sch-marks-accred-text { display: flex; flex-direction: column; gap: 3px; }
        .sch-marks-accred-text strong {
          font-family: var(--lv2-font-mono);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: #c7b6ff;
        }
        .sch-marks-accred-text span {
          font-family: var(--lv2-font-display);
          font-size: 13px;
          color: rgba(17,22,38,0.69);
        }
        @media (max-width: 1100px) {
          .sch-marks-accred { padding-left: 0; padding-top: 20px; border-left: 0; border-top: 1px solid rgba(20,22,29,0.16); }
        }

        .sch-pillar { border-top: 2px solid var(--sch-accent); }
        .sch-pillar-icon { display: inline-flex; width: 44px; height: 44px; border-radius: 12px; margin-bottom: 14px; align-items: center; justify-content: center; color: var(--sch-accent); background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.18); }
        @supports (background: color-mix(in srgb, red 10%, transparent)) {
          .sch-pillar-icon { background: color-mix(in srgb, var(--sch-accent) 14%, transparent); border-color: color-mix(in srgb, var(--sch-accent) 40%, transparent); }
        }
        .sch-pillar-icon svg { width: 22px; height: 22px; }
        .sch-pillar ul, .sch-pilot ul, .sch-receive { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
        /* Owner 2026-09-22: drop the ticks, keep the simplicity, and give
           the cards something. A tick claims each line is a feature being
           checked off; these are just what the thing is. So each point
           becomes a row with a hairline above it and a small accent dot,
           which is the same list treatment the homepage flagship panel
           uses. Nothing else added: the owner asked for better, not more. */
        .sch-pillar li, .sch-pilot li, .sch-receive li {
          position: relative;
          padding: 9px 0 0 22px;
          border-top: 1px solid rgba(86,68,45,0.14);
          font-family: var(--lv2-font-display);
          font-size: 14.5px;
          line-height: 1.5;
          color: rgba(17,22,38,0.88);
        }
        .sch-pillar li:first-child, .sch-pilot li:first-child, .sch-receive li:first-child {
          border-top: 0;
          padding-top: 0;
        }
        .sch-pillar li::before, .sch-pilot li::before, .sch-receive li::before {
          content: "";
          position: absolute;
          left: 2px;
          top: 16px;
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--sch-accent, #0e7a45);
        }
        .sch-pillar li:first-child::before, .sch-pilot li:first-child::before, .sch-receive li:first-child::before {
          top: 7px;
        }
        /* the short accent rule under each card title */
        .sch-rule {
          display: block;
          width: 30px;
          height: 2px;
          margin: 12px 0 2px;
          border-radius: 2px;
          background: var(--sch-accent, #0e7a45);
        }
        /* equal-height cards, so three ragged point counts do not leave
           three different card bottoms */
        .sch-grid-3 > *, .sch-grid-4 > * { height: 100%; }
        .sch-pillar, .sch-step { height: 100%; }
        .sch-receive { margin-top: 26px; }
        .sch-receive li { font-size: 15.5px; }
        .sch-pilot { display: flex; flex-direction: column; gap: 14px; border-color: rgba(95,255,163,0.5); box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 70px -40px rgba(95,255,163,0.6); }
        .sch-pilot .sch-chip { align-self: flex-start; }
        .sch-pilot a { align-self: flex-start; }

        /* faq */
        .sch-faq-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; margin-top: 30px; }
        @media (max-width: 820px) { .sch-faq-grid { grid-template-columns: 1fr; } }
        .sch-faq { border-radius: 14px; border: 1px solid rgba(20,22,29,0.2); background: linear-gradient(180deg, rgba(244,239,231,0.7), rgba(255,253,248,0.7)); padding: 0 18px; }
        .sch-faq[open] { border-color: rgba(20,22,29,0.45); }
        .sch-faq summary { cursor: pointer; list-style: none; padding: 16px 28px 16px 0; position: relative; font-family: var(--lv2-font-display); font-size: 15.5px; font-weight: 600; color: #14161d; }
        .sch-faq summary::-webkit-details-marker { display: none; }
        .sch-faq summary::after { content: "+"; position: absolute; right: 2px; top: 12px; font-size: 22px; color: var(--lv2-cyan-soft); transition: transform .2s ease; }
        .sch-faq[open] summary::after { transform: rotate(45deg); }
        .sch-faq p { margin: 0; padding: 0 0 16px; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(17,22,38,0.82); }

        .sch-form-grid { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 18px; }
        .sch-form-span { grid-column: 1 / -1; }
        @media (max-width: 640px) { .sch-form-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .sch-stack-card, .sch-phase-art { transition: none; } }
      `}</style>
    </div>
  );
}
