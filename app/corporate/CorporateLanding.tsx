"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import Nav from "@/app/components/landing-v2/Nav";
import Footer from "@/app/components/landing-v2/Footer";
import ProofBand from "@/app/components/ProofBand";
import { FadeUp } from "@/app/components/landing-v2/utilities";
import { sectionMark, sectionMarkBare } from "@/app/components/sectionMark";
import EnquiryForm from "./EnquiryForm";
import PasteTest from "./PasteTest";
import PolicyBuilder from "./PolicyBuilder";

/**
 * The corporate landing page: AI Cleared.
 *
 * One audience per glance, one button. Same chrome and section grammar as
 * /schools so the two B2B pages read as one company, with this page's own
 * signature in the hero: the paste test, run live on a prompt a finance
 * assistant would really type.
 *
 * Order: hero -> accreditations -> why now -> the product -> what's covered
 * -> set-up -> your firm -> roles -> questions -> enquiry.
 *
 * Copy rules that apply here (owner): state the benefit, never the denial;
 * no em-dashes; no invented figures; never "ask for a quote"; never claim
 * the course makes a firm "compliant". Prices are not listed yet.
 */

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
  background: "linear-gradient(135deg, #0a7085 0%, #086072 55%, #075464 100%)",
  color: "#fffdfa",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 16.5,
  fontWeight: 700,
  letterSpacing: "0.005em",
  textDecoration: "none",
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

const SECTIONS: ReadonlyArray<readonly [id: string, label: string, cta?: boolean]> = [
  ["product", "AI Cleared"],
  ["covered", "What's covered"],
  ["how", "Set-up"],
  ["firm", "Your firm"],
  ["roles", "Roles"],
  ["policy", "Free policy"],
  ["questions", "Questions"],
  ["enquiry", "Get in touch", true],
];

/* What the firm keeps. Four things, because a course alone sells weakly. */
const KEEPS = [
  { n: "01", colour: "#0a7085", title: "The course", text: "Five modules everyone takes, about ninety minutes in twenty minute sittings, then scenarios from each person's own desk. Learn, practise, prove, on every module." },
  { n: "02", colour: "#5744c9", title: "The sandbox", text: "Staff write real prompts to a live AI. Before it answers, a grader scores what they just sent and shows exactly what would have left the building." },
  { n: "03", colour: "#0e7a45", title: "The register", text: "Who has completed what, when, and their score. Filter by team, export for auditors and insurers, and see who still needs a nudge." },
  { n: "04", colour: "#8a5400", title: "The policy pack", text: "A dated AI Cleared certificate per person and one for the firm, plus a starter AI use policy written from your own profile answers." },
];

/* The five modules, in the order staff meet them. */
const MODULES = [
  { n: "01", title: "What happens to what you type", text: "The four tiers of any AI tool, from a free personal account to an enterprise workspace, what each does with your inputs, and how to check a tool you have never seen in five minutes.", task: "Sort six real tool set-ups into their tier." },
  { n: "02", title: "The paste test", text: "Four data classes in your firm's own words, three questions to ask before every send, and how to give the AI the shape of a problem without the facts in it.", task: "Chase an overdue invoice without naming the client." },
  { n: "03", title: "Your firm's approved tools", text: "Built from your own list: what is approved, what is banned, what needs a manager, and who to ask. Personal accounts on work devices, client workspaces, shared links.", task: "Ten scenarios from your firm's own tool list." },
  { n: "04", title: "Trust but verify", text: "Invented facts and citations, instructions hidden inside documents the AI reads, and Copilot surfacing files people never meant to share.", task: "Find the planted instruction inside a supplier PDF." },
  { n: "05", title: "Shadow AI and when to ask", text: "Extensions, note-takers and free tools that read your inbox. What to do the moment you realise you pasted the wrong thing, and who to tell.", task: "Triage six incidents, with your DPO's name on screen." },
];

const STEPS = [
  { n: "01", colour: "#0a7085", title: "Tell us about your firm", text: "Ten minutes on a profile: your approved tools, your data class names, who staff should ask. The course reads it from then on." },
  { n: "02", colour: "#5744c9", title: "We set up your seats", text: "Your licence, your admin login and a seat pack sized to your headcount. It runs in the browser, so there is nothing to install." },
  { n: "03", colour: "#0e7a45", title: "Staff learn in sittings", text: "Twenty minute modules that save on every screen. A job title picker gives each person scenarios from their own desk." },
  { n: "04", colour: "#8a5400", title: "You get the register", text: "Who has completed what, with scores and dates, a certificate per person and one for the firm once your team has passed." },
];

const PILLARS = [
  {
    title: "Tailored by your profile",
    accent: "#0a7085",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 6h16M4 12h10M4 18h7" /><circle cx="18" cy="16" r="3" /><path d="M20.5 18.5L22 20" /></svg>,
    points: ["Your approved and banned tools, by name", "Your data class names on every verdict", "Your escalation contact on every screen", "A starter AI policy written from your answers"],
  },
  {
    title: "Evidence that stands up",
    accent: "#0e7a45",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3l7 3v6c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
    points: ["A training register by person and team", "Scores, dates and certificate expiry", "An export for auditors and insurers", "A firm certificate once your team has passed"],
  },
  {
    title: "Practice data only",
    accent: "#8a5400",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h6M7 14h10" /><path d="M15 9.5h3" strokeWidth="3" /></svg>,
    points: ["Every firm, client and person in the course is invented", "The sandbox stops a send that looks like real data", "Transcripts are not kept", "Cyber Essentials certified, the NCSC-backed standard"],
  },
];

const SECTORS = [
  "Law, accountancy and financial advice",
  "Recruitment, consultancy and agencies",
  "Property, insurance and professional services",
  "Larger corporates, with seats split by department",
];

/* Eight tracks, grouped by the data a role touches, not by job title. */
const TRACKS = [
  { title: "Finance and payroll", jobs: "Accounts, credit control, payroll, bookkeeping", accent: "#0a7085" },
  { title: "Legal, risk and compliance", jobs: "Solicitors, paralegals, compliance, company secretaries", accent: "#5744c9" },
  { title: "HR and people", jobs: "HR, recruitment, L&D, office management", accent: "#a5117f" },
  { title: "Sales and marketing", jobs: "Sales, account management, marketing, bids", accent: "#a63a08" },
  { title: "Customer support", jobs: "Service desk, client care, reception, complaints", accent: "#0e7a45" },
  { title: "Operations and admin", jobs: "Ops, PAs, facilities, procurement, projects", accent: "#8a5400" },
  { title: "Engineering and IT", jobs: "Developers, IT support, data, security", accent: "#0a7085" },
  { title: "Leadership", jobs: "Partners, directors, heads of department, board", accent: "#5744c9" },
];

const FAQS = [
  { q: "Which AI tools does it cover?", a: "Microsoft 365 Copilot, ChatGPT, Gemini and Claude, at every tier from a free personal account to an enterprise workspace, plus a five minute method for checking any tool you have not seen before. Every vendor fact in the course carries the date it was last verified." },
  { q: "How long does it take?", a: "About ninety minutes in total, in twenty minute sittings. Progress saves on every screen, so a module can be finished between meetings and picked up the next day." },
  { q: "Does our data go into the course?", a: "The course runs on invented firms, clients and people. The sandbox stops any send that contains something that looks like a real identifier and explains why, and transcripts are not kept. Your firm profile holds tool names and a contact, and that is all." },
  { q: "Does it make us compliant?", a: "It gives you training and evidence of training: a register with scores, dates and certificates, which is what auditors, insurers and regulators ask to see. Your own policies and legal advice stay yours, and the starter policy is written as a starting point for your review." },
  { q: "Can we tailor it to our firm?", a: "Yes. The firm profile takes ten minutes and the course reads it from then on: your approved tools, your data class names, your escalation contact. Firms without an AI policy can write one now, free, further down this page." },
  { q: "How is it licensed?", a: "Per seat, per year, in packs sized to your headcount, with the content refreshed as the tools change. Larger firms can split seats across departments. Please get in touch to find out about the onboarding process." },
];

/* The two regulation pages, linked from the strip above the policy. */
const REGS = [
  { href: "/corporate/eu-ai-act", k: "EU AI Act · Article 4", title: "The AI literacy duty", text: "Since February 2025 firms that deploy AI have had to ensure their staff are AI literate. Whether it reaches a UK firm, and what evidence looks like." },
  { href: "/corporate/uk-gdpr", k: "UK GDPR · the ICO", title: "When a paste becomes a breach", text: "The duties that already apply when staff put client or employee data into a tool, and why Cyber Essentials does not cover it." },
];

export default function CorporateLanding() {
  const [activeSection, setActiveSection] = useState("");
  const subnavRef = useRef<HTMLElement>(null);

  const sectionChip = ([id, label, cta]: (typeof SECTIONS)[number]) => (
    <a
      key={id}
      href={`#${id}`}
      data-target={id}
      aria-current={activeSection === id ? "location" : undefined}
      className={`corp-chip-link${cta ? " corp-chip-cta" : ""}${activeSection === id ? " on" : ""}`}
    >
      {label}
    </a>
  );

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

  return (
    <div className="corp-page" style={{ display: "contents" }}>
      <Nav
        tone="sand"
        showTelemetry={false}
        showSiteLinks={false}
        cta={{ label: "Get in touch", href: "#enquiry" }}
        centre={
          <nav className="corp-navsections" aria-label="On this page">
            {SECTIONS.filter(([, , cta]) => !cta).map(sectionChip)}
          </nav>
        }
      />
      <main className="corp-main" style={{ position: "relative", color: "var(--lv2-ink)", minHeight: "100vh", overflowX: "clip" }}>
        <div className="corp-subnav-wrap">
          <nav ref={subnavRef} className="corp-subnav" aria-label="On this page">
            {SECTIONS.map(sectionChip)}
          </nav>
        </div>

        {/* HERO ────────────────────────────────────────────── */}
        <section className="corp-section corp-hero-section">
          <FadeUp>
            <div className="corp-toprow">
              <Link href="/" className="corp-toplink"><span aria-hidden>←</span> Back to home</Link>
            </div>
          </FadeUp>

          <div className="corp-hero-grid">
            <div className="corp-hero">
              <FadeUp>
                <p style={sectionMarkBare}>{"// AI at work · For firms of every size"}</p>
              </FadeUp>
              <FadeUp delay={0.06}>
                <h1 className="corp-h1">
                  Every member of staff, <span className="corp-grad">cleared to use AI.</span>
                </h1>
              </FadeUp>
              <FadeUp delay={0.12}>
                <p style={{ ...lede, fontSize: "clamp(1.05rem, 1.35vw, 1.2rem)", maxWidth: 560 }}>
                  AI Cleared teaches your whole firm to use Copilot, ChatGPT, Gemini and Claude without leaking a client, a colleague or a bank detail, and to get real work out of them. Interactive, about ninety minutes, and every completion goes on a training register you can show clients, auditors and insurers.
                </p>
              </FadeUp>
              <FadeUp delay={0.18}>
                <div className="corp-cta-row">
                  <a href="#enquiry" style={pillPrimary}>
                    Register your interest
                    <span aria-hidden style={{ marginLeft: 10, fontSize: 17, lineHeight: 1 }}>&rarr;</span>
                  </a>
                  <a href="#policy" style={pillGhost}>Write our AI policy, free</a>
                </div>
              </FadeUp>
              <FadeUp delay={0.24}>
                <ul className="corp-trust">
                  <li>A live AI, real prompts, invented data</li>
                  <li>One course, every role in the firm</li>
                  <li>Certificate and training register</li>
                </ul>
              </FadeUp>
            </div>

            <FadeUp delay={0.15} y={30}>
              <PasteTest />
            </FadeUp>
          </div>
        </section>

        {/* ACCREDITATIONS ─────────────────────────────────── */}
        <ProofBand tone="sand" />

        {/* WHY NOW ────────────────────────────────────────── */}
        <section className="corp-section corp-why-section">
          <FadeUp>
            <div className="corp-why">
              <div>
                <p style={eyebrow}>{"// Why now"}</p>
                <h2 style={h2}>
                  Your staff already use AI. <span className="corp-grad">Make sure they use it well.</span>
                </h2>
                <p style={{ ...lede, maxWidth: 620 }}>
                  Pasting a client email into a chatbot is the quickest way to save ten minutes, which is exactly why it happens on personal accounts with the client&rsquo;s name still in the prompt. AI Cleared turns that reflex into a habit you can stand behind: the right tool, the right data, and a faster way to do the same job.
                </p>
              </div>
              <ul className="corp-why-chips">
                <li>The four data classes</li>
                <li>The paste test, before every send</li>
                <li>Your approved tools, by name</li>
              </ul>
            </div>
          </FadeUp>
        </section>

        {/* THE PRODUCT ────────────────────────────────────── */}
        <section id="product" className="corp-section">
          <span className="corp-glow corp-glow-amber" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// The product · AI Cleared"}</p>
            <h2 style={h2}>One purchase. <span className="corp-grad">Four things your firm keeps.</span></h2>
            <p style={lede}>A course alone changes little. AI Cleared comes with the sandbox that makes the habit stick, and the evidence and the policy that make the training stand up.</p>
          </FadeUp>
          <div className="corp-grid-4" style={{ marginTop: 36 }}>
            {KEEPS.map((s, i) => (
              <FadeUp key={s.n} delay={0.06 * i}>
                <div className="corp-card corp-step" style={{ ["--corp-accent" as string]: s.colour }}>
                  <span className="corp-step-top"><span className="corp-step-n">{s.n}</span></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
          <FadeUp delay={0.2}>
            <div className="corp-next">
              <span className="corp-chip">In development</span>
              <p><strong>Next in the series: AI Fluent.</strong> The upskilling course for staff who have been cleared: prompting that works, the tools used properly, and a role track for every job in the firm.</p>
            </div>
          </FadeUp>
        </section>

        {/* WHAT'S COVERED ─────────────────────────────────── */}
        <section id="covered" className="corp-section">
          <span className="corp-glow corp-glow-cyan" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// What's covered"}</p>
            <h2 style={h2}>Ninety minutes. <span className="corp-grad">One habit that sticks.</span></h2>
            <p style={lede}>Five modules, each in three parts: a short read with one diagram, a task in the sandbox against a live AI, then a scored check. Pass all five and the certificate issues.</p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <ol className="corp-mods">
              {MODULES.map((m) => (
                <li key={m.n} className="corp-mod">
                  <span className="corp-mod-n">{m.n}</span>
                  <div className="corp-mod-body">
                    <h3>{m.title}</h3>
                    <p>{m.text}</p>
                    <span className="corp-mod-task"><span>In the sandbox</span>{m.task}</span>
                  </div>
                </li>
              ))}
            </ol>
          </FadeUp>
          <FadeUp delay={0.14}>
            <p className="corp-mods-note">Every module ends with the faster way to do the real task, so the safe habit is also the quicker one.</p>
          </FadeUp>
        </section>

        {/* SET-UP ─────────────────────────────────────────── */}
        <section id="how" className="corp-section">
          <FadeUp>
            <p style={eyebrow}>{"// Running in your firm within a week"}</p>
            <h2 style={h2}>Four steps. <span className="corp-grad">Two of them are ours.</span></h2>
          </FadeUp>
          <div className="corp-grid-4" style={{ marginTop: 36 }}>
            {STEPS.map((s, i) => (
              <FadeUp key={s.n} delay={0.06 * i}>
                <div className="corp-card corp-step" style={{ ["--corp-accent" as string]: s.colour }}>
                  <span className="corp-step-top"><span className="corp-step-n">{s.n}</span></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* YOUR FIRM ──────────────────────────────────────── */}
        <section id="firm" className="corp-section">
          <span className="corp-glow corp-glow-violet" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// Built for the firm"}</p>
            <h2 style={h2}>Tailored to your firm. <span className="corp-grad">Evidence you can show.</span></h2>
            <p style={lede}>Written once, personal to every firm. The profile your admin fills in drives the scenarios, the verdicts and the policy, and the register turns completion into something you can hand to an auditor.</p>
          </FadeUp>
          <div className="corp-grid-3" style={{ marginTop: 36 }}>
            {PILLARS.map((p, i) => (
              <FadeUp key={p.title} delay={0.06 * i}>
                <div className="corp-card corp-pillar" style={{ ["--corp-accent" as string]: p.accent }}>
                  <span className="corp-pillar-icon">{p.icon}</span>
                  <h3>{p.title}</h3>
                  <span className="corp-rule" aria-hidden />
                  <ul>{p.points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                </div>
              </FadeUp>
            ))}
          </div>

          <div className="corp-grid-2" style={{ alignItems: "stretch", marginTop: 30 }}>
            <FadeUp>
              <div>
                <p style={eyebrow}>{"// Who it is for"}</p>
                <h3 className="corp-h3">Firms that handle other people&rsquo;s data for a living.</h3>
                <p style={lede}>Any firm where a client&rsquo;s name in the wrong place is a problem. Small teams buy on a card. Larger corporates buy seat packs by department.</p>
                <ul className="corp-receive">{SECTORS.map((r) => <li key={r}>{r}</li>)}</ul>
              </div>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="corp-card corp-walk">
                <span className="corp-chip corp-chip-live">See it first</span>
                <h3>Walk through a module with us.</h3>
                <p>Book a walkthrough and we will run the paste test on your screen, show the register and the certificate, and answer the questions your DPO will ask.</p>
                <ul>
                  <li>A module start to finish, with the live sandbox</li>
                  <li>The admin register and the firm certificate</li>
                  <li>Straight answers on data, set-up and cost</li>
                </ul>
                <a href="#enquiry" style={{ ...pillPrimary, marginTop: "auto" }}>Book a walkthrough</a>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ROLES ──────────────────────────────────────────── */}
        <section id="roles" className="corp-section">
          <FadeUp>
            <p style={eyebrow}>{"// Every role, its own desk"}</p>
            <h2 style={h2}>Eight tracks. <span className="corp-grad">Every job in the firm maps to one.</span></h2>
            <p style={lede}>Everyone takes the same core. Each track adds scenarios and practice data from that role&rsquo;s own work, so finance chases an invoice, HR drafts a reference and legal summarises a dispute.</p>
          </FadeUp>
          <div className="corp-grid-4" style={{ marginTop: 36 }}>
            {TRACKS.map((t, i) => (
              <FadeUp key={t.title} delay={0.04 * i}>
                <div className="corp-track" style={{ ["--corp-accent" as string]: t.accent }}>
                  <h3>{t.title}</h3>
                  <p>{t.jobs}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* REGULATION ─────────────────────────────────────── */}
        <section className="corp-section corp-reg-section">
          <FadeUp>
            <p style={eyebrow}>{"// The duties behind the demand"}</p>
            <h2 style={h2}>Two rules already apply. <span className="corp-grad">Here they are in plain English.</span></h2>
          </FadeUp>
          <div className="corp-grid-2" style={{ marginTop: 30 }}>
            {REGS.map((r, i) => (
              <FadeUp key={r.href} delay={0.06 * i}>
                <Link href={r.href} className="corp-reg">
                  <span className="corp-reg-k">{r.k}</span>
                  <span className="corp-reg-title">{r.title}</span>
                  <span className="corp-reg-text">{r.text}</span>
                  <span className="corp-reg-more">Read the page <span aria-hidden>&rarr;</span></span>
                </Link>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* FREE POLICY ────────────────────────────────────── */}
        <section id="policy" className="corp-section">
          <span className="corp-glow corp-glow-cyan" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// Free · Your AI use policy"}</p>
            <h2 style={h2}>Six answers. <span className="corp-grad">A policy your firm can adopt today.</span></h2>
            <p style={lede}>Every firm needs one before the first member of staff opens Copilot. Answer six questions and the policy writes itself on the right, in plain English, with your tools, your data rules and your contact in it. Email yourself a copy, free.</p>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div style={{ marginTop: 34 }}>
              <PolicyBuilder />
            </div>
          </FadeUp>
        </section>

        {/* QUESTIONS ──────────────────────────────────────── */}
        <section id="questions" className="corp-section">
          <span className="corp-glow corp-glow-lime" aria-hidden />
          <FadeUp>
            <p style={eyebrow}>{"// Before you ask"}</p>
            <h2 style={h2}>Questions <span className="corp-grad">firms ask.</span></h2>
          </FadeUp>
          <FadeUp delay={0.08}>
            <div className="corp-faq-grid">
              {FAQS.map((f) => (
                <details key={f.q} className="corp-faq">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </FadeUp>
        </section>

        {/* ENQUIRY ────────────────────────────────────────── */}
        <section id="enquiry" className="corp-section" style={{ paddingBottom: "calc(var(--lv2-rail) * 2.4)" }}>
          <div className="corp-grid-2 corp-grid-2-form">
            <FadeUp>
              <div>
                <p style={eyebrow}>{"// Get in touch"}</p>
                <h2 style={h2}>Thinking of <span className="corp-grad">clearing your firm?</span></h2>
                <p style={lede}>
                  We&rsquo;ll explain the onboarding process, from the firm profile to the first certificate, and reply within two working days. We bring a data-protection summary to the first conversation so your DPO has what they need.
                </p>
                <p style={{ ...lede, fontSize: 14.5, color: "rgba(17,22,38,0.63)" }}>
                  Prefer email? <a href="mailto:support@algorithmx.co.uk" style={{ color: "var(--lv2-cyan-soft)" }}>support@algorithmx.co.uk</a>
                </p>
              </div>
            </FadeUp>
            <FadeUp delay={0.08}>
              <div className="corp-card" style={{ padding: "28px 26px" }}>
                <EnquiryForm />
              </div>
            </FadeUp>
          </div>
        </section>
      </main>

      <Footer tone="sand" />

      <style>{`
        /* The sand token layer, the same one /schools carries. Without it
           the page reads the neon values out of globals.css. */
        .corp-page, .corp-page :is(section, div, nav, header, footer, main, span, p, li, a, ol, textarea, button) {
          --lv2-cyan: #0a7085;
          --lv2-cyan-soft: #0a7085;
          --lv2-lime: #0e7a45;
          --lv2-cosmic: #5744c9;
          --lv2-text-muted: #5d6472;
          --lv2-ink: #14161d;
        }
        html, .corp-page { background: #f3ede4; }

        /* This page's own ground: a faint ruled grid, the exercise-book
           idea from /schools carried over as a document grid, receding
           to nothing past the hero so the cards sit on plain sand. */
        .corp-main::before {
          content: ""; position: absolute; inset: 0 0 auto 0; height: 1400px; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(10,112,133,0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(10,112,133,0.09) 1px, transparent 1px);
          background-size: 48px 48px;
          -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 45%, transparent 100%);
          mask-image: linear-gradient(180deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 45%, transparent 100%);
        }

        .corp-section {
          position: relative;
          max-width: 1180px;
          margin: 0 auto;
          padding: calc(var(--lv2-rail) * 1.3) var(--lv2-rail);
          scroll-margin-top: 128px;
        }
        .corp-hero-section { padding-top: clamp(26px, 2.2vw, 44px); padding-bottom: calc(var(--lv2-rail) * 0.8); }
        .corp-glow { position: absolute; pointer-events: none; z-index: 0; border-radius: 50%; filter: blur(60px); opacity: 0.55; }
        .corp-glow-amber { width: 520px; height: 520px; right: -140px; top: -80px; background: radial-gradient(circle, rgba(255,179,71,0.35), transparent 65%); }
        .corp-glow-cyan { width: 640px; height: 640px; left: -220px; top: 120px; background: radial-gradient(circle, rgba(10,112,133,0.28), transparent 65%); }
        .corp-glow-violet { width: 560px; height: 560px; right: -160px; top: 40px; background: radial-gradient(circle, rgba(124,92,255,0.38), transparent 65%); }
        .corp-glow-lime { width: 480px; height: 480px; left: -160px; top: 0; background: radial-gradient(circle, rgba(126,255,151,0.22), transparent 65%); }
        .corp-section > *:not(.corp-glow) { position: relative; z-index: 1; }

        .corp-section :is(a, button, summary, input, select, textarea):focus-visible,
        .corp-subnav a:focus-visible {
          outline: 2px solid var(--lv2-cyan); outline-offset: 3px;
        }

        .corp-grad {
          background: linear-gradient(92deg, #0a7085 0%, #5744c9 55%, #a5117f 100%);
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .corp-h1 {
          margin: 18px 0 0; font-family: var(--lv2-font-display);
          font-size: clamp(2.5rem, 5vw, 4.3rem); line-height: 1.0; letter-spacing: -0.03em; font-weight: 400;
        }
        .corp-h3 { margin: 14px 0 0; font-family: var(--lv2-font-display); font-size: clamp(1.4rem, 2.2vw, 1.9rem); line-height: 1.15; letter-spacing: -0.02em; font-weight: 400; color: var(--lv2-ink); }

        .corp-toprow { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 26px; }
        .corp-toplink {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none;
          color: var(--lv2-cyan-soft); white-space: nowrap; transition: opacity .2s ease;
        }
        .corp-toplink:hover { opacity: .8; }

        /* hero */
        .corp-hero-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.95fr); gap: 44px; align-items: center; }
        .corp-cta-row { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 30px; }
        .corp-trust { list-style: none; padding: 0; margin: 24px 0 0; display: flex; flex-wrap: wrap; gap: 10px 22px; }
        .corp-trust li {
          position: relative; padding-left: 18px;
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase; color: rgba(17,22,38,0.73);
        }
        .corp-trust li::before { content: ""; position: absolute; left: 0; top: 4px; width: 8px; height: 8px; border-radius: 50%; background: #0e7a45; box-shadow: 0 0 10px #0e7a45; }

        /* the paste test */
        .corp-pt {
          position: relative; border-radius: 16px; overflow: hidden; background: #fffdf8;
          border: 1px solid rgba(20,22,29,0.35);
          box-shadow: 0 30px 70px -30px rgba(10,112,133,0.55), 0 30px 60px -20px rgba(0,0,0,0.5);
        }
        .corp-pt-bar { display: flex; align-items: center; gap: 12px; height: 40px; padding: 0 14px; background: #f4efe7; border-bottom: 1px solid rgba(17,22,38,0.08); }
        .corp-pt-dots { display: inline-flex; gap: 6px; }
        .corp-pt-dots i { width: 9px; height: 9px; border-radius: 50%; display: block; }
        .corp-pt-dots i:nth-child(1) { background: #ff5f57; } .corp-pt-dots i:nth-child(2) { background: #febc2e; } .corp-pt-dots i:nth-child(3) { background: #28c840; }
        .corp-pt-url { flex: 1 1 0; width: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: var(--lv2-font-mono); font-size: 11.5px; color: rgba(17,22,38,0.7); background: rgba(255,253,248,0.7); border-radius: 8px; padding: 5px 11px; }
        .corp-pt-chip { font-family: var(--lv2-font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #8a5400; border: 1px solid rgba(255,179,71,0.5); border-radius: 999px; padding: 4px 9px; white-space: nowrap; }
        .corp-pt-body { padding: 16px 18px 14px; display: flex; flex-direction: column; gap: 10px; }
        .corp-pt-task { margin: 0; padding: 11px 13px; border-radius: 10px; background: rgba(10,112,133,0.08); border: 1px solid rgba(10,112,133,0.28); font-family: var(--lv2-font-display); font-size: 13.5px; line-height: 1.5; color: rgba(17,22,38,0.9); }
        .corp-pt-task span { display: block; margin-bottom: 3px; font-family: var(--lv2-font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: #0a7085; }
        .corp-pt-lab { font-family: var(--lv2-font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(17,22,38,0.7); margin-top: 2px; }
        .corp-pt-ta {
          width: 100%; box-sizing: border-box; resize: vertical; min-height: 88px;
          font-family: var(--lv2-font-display); font-size: 14px; line-height: 1.5; color: #14161d;
          padding: 10px 12px; border-radius: 10px; border: 1.5px solid rgba(10,112,133,0.35); background: #fff; outline: none;
        }
        .corp-pt-ta:focus-visible { border-color: #0a7085; box-shadow: 0 0 0 3px rgba(10,112,133,0.14); outline: none; }
        .corp-pt-row { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .corp-pt-run {
          height: 40px; padding: 0 18px; border-radius: 999px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #0a7085 0%, #086072 55%, #075464 100%); color: #fffdfa;
          font-family: var(--lv2-font-display); font-size: 14px; font-weight: 700;
          box-shadow: 0 12px 26px -12px rgba(10,112,133,0.9);
        }
        .corp-pt-run:disabled { opacity: 0.45; cursor: default; box-shadow: none; }
        .corp-pt-alt {
          height: 40px; padding: 0 14px; border-radius: 999px; cursor: pointer;
          border: 1px solid rgba(20,22,29,0.22); background: rgba(255,253,248,0.8); color: #14161d;
          font-family: var(--lv2-font-display); font-size: 13.5px; font-weight: 600;
        }
        .corp-pt-alt:hover { border-color: #0a7085; }
        .corp-pt-verdict {
          display: flex; flex-direction: column; gap: 9px; padding: 12px 13px; border-radius: 12px;
          border: 1px solid color-mix(in srgb, var(--pt) 45%, transparent);
          background: color-mix(in srgb, var(--pt) 9%, #fffdf8);
        }
        .corp-pt-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; font-family: var(--lv2-font-display); font-size: 13.5px; line-height: 1.45; color: rgba(17,22,38,0.9); }
        .corp-pt-pill { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 999px; border: 1.5px solid var(--pt); color: var(--pt); background: #fffdf8; font-family: var(--lv2-font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; white-space: nowrap; }
        .corp-pt-echo { margin: 0; padding: 9px 11px; border-radius: 8px; background: #fffdf8; border: 1px solid rgba(17,22,38,0.12); font-family: var(--lv2-font-mono); font-size: 12.5px; line-height: 1.7; color: #14161d; white-space: pre-wrap; word-break: break-word; }
        .corp-pt-rd { background: #14161d; color: #14161d; border-radius: 2px; padding: 0 2px; }
        .corp-pt-int { color: #0a7085; font-weight: 600; }
        .corp-pt-finds { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
        .corp-pt-finds li { display: grid; grid-template-columns: 104px 1fr; gap: 6px 10px; align-items: baseline; font-size: 12.5px; }
        .corp-pt-tag { font-family: var(--lv2-font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.14em; }
        .corp-pt-txt { font-family: var(--lv2-font-mono); font-size: 12px; color: #14161d; }
        .corp-pt-why { grid-column: 2; font-family: var(--lv2-font-display); color: rgba(17,22,38,0.62); margin-top: -4px; }
        .corp-pt-note { margin: 0; font-family: var(--lv2-font-mono); font-size: 10.5px; letter-spacing: 0.06em; color: rgba(17,22,38,0.6); }
        @media (max-width: 480px) { .corp-pt-finds li { grid-template-columns: 1fr; } .corp-pt-why { grid-column: 1; margin-top: 0; } }

        /* section nav, the /schools pattern */
        .corp-subnav-wrap { margin-top: 68px; position: sticky; top: 68px; z-index: 30; background: rgba(255,253,248,0.68); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-top: 1px solid rgba(10,112,133,0.1); border-bottom: 1px solid rgba(10,112,133,0.1); }
        .corp-subnav { max-width: 1180px; margin: 0 auto; padding: 10px var(--lv2-rail); display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; scroll-behavior: smooth; }
        .corp-subnav::-webkit-scrollbar { display: none; }
        .corp-navsections { display: none; }
        @media (min-width: 1280px) {
          .corp-navsections { display: flex; align-items: center; gap: 6px; min-width: 0; }
          .corp-subnav-wrap { display: none; }
          .corp-hero-section { padding-top: calc(68px + clamp(26px, 2.2vw, 44px)); }
          .corp-section { scroll-margin-top: 88px; }
        }
        .corp-chip-link {
          flex: 0 0 auto; display: inline-flex; align-items: center; min-height: 36px; padding: 0 14px; border-radius: 999px; text-decoration: none;
          border: 1px solid rgba(10,112,133,0.42); background: rgba(10,112,133,0.16);
          font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          color: #075a6b;
          text-shadow: 0 0 10px rgba(10,112,133,0.55), 0 1px 0 rgba(255,255,255,0.6);
          box-shadow: 0 6px 16px -12px rgba(10,112,133,0.9), inset 0 1px 0 rgba(255,255,255,0.7);
          transition: border-color .2s ease, color .2s ease, background .2s ease, box-shadow .2s ease;
        }
        .corp-chip-link:hover { border-color: rgba(10,112,133,0.75); color: #05454f; background: rgba(10,112,133,0.26); text-shadow: 0 0 14px rgba(10,112,133,0.85), 0 1px 0 rgba(255,255,255,0.6); }
        .corp-chip-link.on { border-color: #0a7085; color: #fffdfa; background: #0a7085; text-shadow: none; box-shadow: 0 8px 20px -12px rgba(10,112,133,1), inset 0 1px 0 rgba(255,255,255,0.28); }
        .corp-chip-cta { border-color: transparent; color: #04050d; background: linear-gradient(135deg, #2af0ff 0%, #00cfff 55%, #00b4f0 100%); margin-left: auto; }
        .corp-chip-cta:hover, .corp-chip-cta.on { color: #04050d; background: linear-gradient(135deg, #5ff5ff 0%, #1fd8ff 55%, #14c2f8 100%); border-color: transparent; }
        @media (max-width: 1100px) {
          .corp-subnav { -webkit-mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 44px), transparent); mask-image: linear-gradient(90deg, #000 0, #000 calc(100% - 44px), transparent); padding-right: calc(var(--lv2-rail) + 32px); }
          .corp-chip-cta { margin-left: 0; }
        }

        /* why now */
        .corp-why-section { padding-top: calc(var(--lv2-rail) * 0.5); padding-bottom: calc(var(--lv2-rail) * 0.5); }
        .corp-why { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: clamp(22px, 4vw, 60px); align-items: end; }
        .corp-why-chips { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .corp-why-chips li {
          display: inline-flex; align-items: center; gap: 10px; padding: 9px 16px; border-radius: 999px;
          border: 1px solid rgba(10,112,133,0.22); background: rgba(255,253,248,0.74);
          font-family: var(--lv2-font-mono); font-size: 11.5px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: rgba(17,22,38,0.88); white-space: nowrap;
        }
        .corp-why-chips li::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #0a7085; box-shadow: 0 0 10px rgb(10,112,133); }
        @media (max-width: 900px) {
          .corp-why { grid-template-columns: minmax(0, 1fr); }
          .corp-why-chips { flex-direction: row; flex-wrap: wrap; }
        }

        /* cards */
        .corp-card {
          position: relative; height: 100%; box-sizing: border-box;
          padding: 26px 24px; border-radius: 18px;
          background: linear-gradient(180deg, rgba(244,239,231,0.78), rgba(255,253,248,0.78));
          border: 1px solid rgba(20,22,29,0.24);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px -30px rgba(10,112,133,0.35);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .corp-chip {
          display: inline-flex; align-items: center; height: 22px; padding: 0 9px;
          border-radius: 999px; border: 1px solid rgba(17,22,38,0.29);
          font-family: var(--lv2-font-mono); font-size: 10px; font-weight: 700;
          letter-spacing: 0.16em; text-transform: uppercase; color: rgba(17,22,38,0.84); white-space: nowrap;
        }
        .corp-chip-live { border-color: rgba(95,255,163,0.6); color: #0e7a45; background: rgba(95,255,163,0.12); box-shadow: 0 0 14px -4px rgba(95,255,163,0.6); }

        .corp-grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 30px; align-items: start; }
        .corp-grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 22px; }
        .corp-grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 18px; }
        .corp-grid-2-form { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
        .corp-grid-3 > *, .corp-grid-4 > * { height: 100%; }
        @media (max-width: 980px) {
          .corp-hero-grid { grid-template-columns: minmax(0, 1fr); gap: 30px; }
          .corp-pt { max-width: 620px; margin: 0 auto; }
          .corp-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .corp-grid-3 { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) { .corp-grid-2, .corp-grid-2-form { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .corp-grid-4 { grid-template-columns: 1fr; } }

        /* numbered cards: what you keep, and the set-up steps */
        .corp-step { display: flex; flex-direction: column; gap: 10px; border-top: 2px solid var(--corp-accent); height: 100%; }
        .corp-step-top { display: flex; justify-content: space-between; align-items: center; }
        .corp-step-n {
          display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%;
          background: var(--corp-accent); color: #fffdfa; box-shadow: 0 0 22px -4px var(--corp-accent);
          font-family: var(--lv2-font-mono); font-size: 12px; font-weight: 800; letter-spacing: 0.06em;
        }
        .corp-step h3, .corp-pillar h3, .corp-walk h3 { margin: 0; font-family: var(--lv2-font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.01em; }
        .corp-step p, .corp-walk p { margin: 0; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(17,22,38,0.79); }

        .corp-next { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-top: 22px; padding: 16px 20px; border-radius: 14px; border: 1px dashed rgba(20,22,29,0.3); background: rgba(255,253,248,0.5); }
        .corp-next p { margin: 0; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.55; color: rgba(17,22,38,0.8); }
        .corp-next strong { font-weight: 600; color: #14161d; }

        /* modules */
        .corp-mods { list-style: none; margin: 34px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 18px; }
        .corp-mod {
          display: grid; grid-template-columns: 44px minmax(0, 1fr); gap: 14px; padding: 20px 20px 18px; border-radius: 16px;
          background: linear-gradient(180deg, rgba(244,239,231,0.78), rgba(255,253,248,0.78));
          border: 1px solid rgba(20,22,29,0.24);
        }
        .corp-mod:last-child { grid-column: 1 / -1; grid-template-columns: 44px minmax(0, 1fr); }
        .corp-mod-n { font-family: var(--lv2-font-mono); font-size: 12px; font-weight: 800; letter-spacing: 0.08em; color: #0a7085; padding-top: 5px; }
        .corp-mod-body { display: flex; flex-direction: column; gap: 8px; }
        .corp-mod h3 { margin: 0; font-family: var(--lv2-font-display); font-size: 1.2rem; font-weight: 500; letter-spacing: -0.01em; }
        .corp-mod p { margin: 0; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(17,22,38,0.79); }
        .corp-mod-task { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; margin-top: 4px; font-family: var(--lv2-font-display); font-size: 13.5px; color: rgba(17,22,38,0.88); }
        .corp-mod-task span { font-family: var(--lv2-font-mono); font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #8a5400; border: 1px solid rgba(255,179,71,0.5); border-radius: 999px; padding: 3px 8px; white-space: nowrap; }
        .corp-mods-note { margin: 18px 0 0; font-family: var(--lv2-font-display); font-size: 15px; color: rgba(17,22,38,0.72); }
        @media (max-width: 820px) { .corp-mods { grid-template-columns: 1fr; } .corp-mod:last-child { grid-column: auto; } }

        /* pillars */
        .corp-pillar { border-top: 2px solid var(--corp-accent); height: 100%; }
        .corp-pillar-icon { display: inline-flex; width: 44px; height: 44px; border-radius: 12px; margin-bottom: 14px; align-items: center; justify-content: center; color: var(--corp-accent); background: color-mix(in srgb, var(--corp-accent) 14%, transparent); border: 1px solid color-mix(in srgb, var(--corp-accent) 40%, transparent); }
        .corp-pillar-icon svg { width: 22px; height: 22px; }
        .corp-pillar ul, .corp-walk ul, .corp-receive { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
        .corp-pillar li, .corp-walk li, .corp-receive li {
          position: relative; padding: 9px 0 0 22px; border-top: 1px solid rgba(86,68,45,0.14);
          font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.5; color: rgba(17,22,38,0.88);
        }
        .corp-pillar li:first-child, .corp-walk li:first-child, .corp-receive li:first-child { border-top: 0; padding-top: 0; }
        .corp-pillar li::before, .corp-walk li::before, .corp-receive li::before {
          content: ""; position: absolute; left: 2px; top: 16px; width: 6px; height: 6px; border-radius: 999px; background: var(--corp-accent, #0e7a45);
        }
        .corp-pillar li:first-child::before, .corp-walk li:first-child::before, .corp-receive li:first-child::before { top: 7px; }
        .corp-rule { display: block; width: 30px; height: 2px; margin: 12px 0 2px; border-radius: 2px; background: var(--corp-accent, #0e7a45); }
        .corp-receive { margin-top: 26px; }
        .corp-receive li { font-size: 15.5px; }
        .corp-walk { display: flex; flex-direction: column; gap: 14px; border-color: rgba(95,255,163,0.5); box-shadow: inset 0 1px 0 rgba(255,255,255,0.06), 0 30px 70px -40px rgba(95,255,163,0.6); }
        .corp-walk .corp-chip { align-self: flex-start; }
        .corp-walk a { align-self: flex-start; }

        /* tracks */
        .corp-track {
          height: 100%; box-sizing: border-box; padding: 18px 18px 16px; border-radius: 14px;
          background: rgba(255,253,248,0.63); border: 1px solid rgba(20,22,29,0.14); border-left: 2px solid var(--corp-accent);
          display: flex; flex-direction: column; gap: 6px;
        }
        .corp-track h3 { margin: 0; font-family: var(--lv2-font-display); font-size: 1.05rem; font-weight: 600; letter-spacing: -0.01em; color: #14161d; }
        .corp-track p { margin: 0; font-family: var(--lv2-font-display); font-size: 13.5px; line-height: 1.5; color: rgba(17,22,38,0.7); }

        /* faq */
        .corp-faq-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 18px; margin-top: 30px; }
        @media (max-width: 820px) { .corp-faq-grid { grid-template-columns: 1fr; } }
        .corp-faq { border-radius: 14px; border: 1px solid rgba(20,22,29,0.2); background: linear-gradient(180deg, rgba(244,239,231,0.7), rgba(255,253,248,0.7)); padding: 0 18px; }
        .corp-faq[open] { border-color: rgba(20,22,29,0.45); }
        .corp-faq summary { cursor: pointer; list-style: none; padding: 16px 28px 16px 0; position: relative; font-family: var(--lv2-font-display); font-size: 15.5px; font-weight: 600; color: #14161d; }
        .corp-faq summary::-webkit-details-marker { display: none; }
        .corp-faq summary::after { content: "+"; position: absolute; right: 2px; top: 12px; font-size: 22px; color: var(--lv2-cyan-soft); transition: transform .2s ease; }
        .corp-faq[open] summary::after { transform: rotate(45deg); }
        .corp-faq p { margin: 0; padding: 0 0 16px; font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(17,22,38,0.82); }

        /* regulation strip */
        .corp-reg-section { padding-bottom: calc(var(--lv2-rail) * 0.6); }
        .corp-reg { display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box; padding: 24px 24px 22px; border-radius: 18px; text-decoration: none; color: inherit; background: linear-gradient(180deg, rgba(244,239,231,0.78), rgba(255,253,248,0.78)); border: 1px solid rgba(20,22,29,0.24); border-left: 2px solid #0a7085; transition: transform .2s cubic-bezier(.16,1,.3,1), box-shadow .2s ease, border-color .2s ease; }
        .corp-reg:hover { transform: translateY(-2px); border-color: #0a7085; box-shadow: 0 16px 34px -20px rgba(10,112,133,0.7); }
        .corp-reg-k { font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #0a7085; }
        .corp-reg-title { font-family: var(--lv2-font-display); font-size: 1.25rem; font-weight: 500; letter-spacing: -0.01em; color: #14161d; }
        .corp-reg-text { font-family: var(--lv2-font-display); font-size: 14.5px; line-height: 1.6; color: rgba(17,22,38,0.79); }
        .corp-reg-more { margin-top: auto; padding-top: 8px; font-family: var(--lv2-font-mono); font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #0a7085; }

        /* the policy builder */
        .corp-pol { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 26px; align-items: start; }
        .corp-pol-form { display: flex; flex-direction: column; gap: 16px; position: relative; }
        .corp-pol-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .corp-pol-chips { display: flex; flex-wrap: wrap; gap: 8px; }
        .corp-pol-chip { height: 36px; padding: 0 12px; border-radius: 999px; cursor: pointer; border: 1.5px solid rgba(10,112,133,0.3); background: rgba(255,253,248,0.8); color: rgba(17,22,38,0.8); font-family: var(--lv2-font-display); font-size: 13px; font-weight: 600; transition: border-color .2s ease, background .2s ease, color .2s ease; }
        .corp-pol-chip.on { border-color: #0a7085; background: rgba(10,112,133,0.14); color: #14161d; }
        .corp-pol-chip-no.on { border-color: #a63a08; background: rgba(166,58,8,0.1); }
        .corp-pol-gate { margin-top: 6px; padding: 18px 18px 16px; border-radius: 16px; border: 1px solid rgba(10,112,133,0.35); background: rgba(10,112,133,0.06); display: flex; flex-direction: column; gap: 12px; }
        .corp-pol-gate-head { margin: 0; font-family: var(--lv2-font-display); font-size: 1.1rem; font-weight: 500; color: #14161d; }
        .corp-pol-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .corp-pol-send { height: 50px; padding: 0 24px; border-radius: 999px; border: none; cursor: pointer; background: linear-gradient(135deg, #0a7085 0%, #086072 55%, #075464 100%); color: #fffdfa; font-family: var(--lv2-font-display); font-size: 15px; font-weight: 700; box-shadow: 0 12px 30px -12px rgba(10,112,133,0.9); }
        .corp-pol-send:disabled { opacity: 0.7; cursor: wait; }
        .corp-pol-fine { font-family: var(--lv2-font-display); font-size: 13px; color: rgba(17,22,38,0.66); }
        .corp-pol-err { margin: 0; font-family: var(--lv2-font-display); font-size: 14px; font-weight: 600; color: #a63a08; }
        .corp-pol-ok { margin: 0; font-family: var(--lv2-font-display); font-size: 15px; line-height: 1.55; color: #14161d; }
        .corp-pol-doc { border-radius: 16px; overflow: hidden; background: #fffdf8; border: 1px solid rgba(20,22,29,0.3); box-shadow: 0 30px 70px -30px rgba(10,112,133,0.5); position: sticky; top: 140px; }
        .corp-pol-doc-bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 16px; background: #f4efe7; border-bottom: 1px solid rgba(17,22,38,0.08); font-family: var(--lv2-font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(17,22,38,0.7); }
        .corp-pol-copy { height: 30px; padding: 0 12px; border-radius: 999px; cursor: pointer; border: 1px solid rgba(20,22,29,0.25); background: #fffdf8; color: #14161d; font-family: var(--lv2-font-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; }
        .corp-pol-copy:hover { border-color: #0a7085; color: #0a7085; }
        .corp-pol-doc-body { padding: 22px 24px 26px; max-height: 640px; overflow: auto; font-family: var(--lv2-font-display); }
        .corp-pol-doc-body h3 { margin: 0 0 6px; font-size: 1.45rem; font-weight: 500; letter-spacing: -0.02em; color: #14161d; }
        .corp-pol-doc-intro { margin: 0 0 18px; font-size: 13.5px; line-height: 1.55; color: rgba(17,22,38,0.66); }
        .corp-pol-doc-body section { padding-top: 14px; margin-top: 14px; border-top: 1px solid rgba(20,22,29,0.1); }
        .corp-pol-doc-body h4 { margin: 0 0 6px; font-size: 14.5px; font-weight: 600; color: #14161d; }
        .corp-pol-doc-body p { margin: 0 0 8px; font-size: 14px; line-height: 1.6; color: rgba(17,22,38,0.86); }
        .corp-pol-doc-body ul { margin: 4px 0 6px; padding-left: 18px; }
        .corp-pol-doc-body li { font-size: 13.5px; line-height: 1.55; color: rgba(17,22,38,0.86); margin-bottom: 4px; }
        @media (max-width: 980px) { .corp-pol { grid-template-columns: 1fr; } .corp-pol-doc { position: static; } }
        @media (max-width: 520px) { .corp-pol-two { grid-template-columns: 1fr; } }

        /* form */
        .corp-form-grid { position: relative; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 18px; }
        .corp-form-span { grid-column: 1 / -1; }
        .corp-form-tools { display: flex; flex-wrap: wrap; gap: 8px; min-height: 54px; align-items: center; }
        .corp-form-tool {
          height: 38px; padding: 0 13px; border-radius: 999px; cursor: pointer;
          border: 1.5px solid rgba(10,112,133,0.28); background: rgba(8,10,22,0.78); color: rgba(242,246,255,0.86);
          font-family: var(--lv2-font-display); font-size: 13.5px; font-weight: 600; transition: border-color .2s ease, background .2s ease, color .2s ease;
        }
        .corp-form-tool.on { border-color: #0a7085; background: rgba(10,112,133,0.14); color: #14161d; }
        @media (max-width: 640px) { .corp-form-grid { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) { .corp-subnav { scroll-behavior: auto; } }
      `}</style>
    </div>
  );
}
