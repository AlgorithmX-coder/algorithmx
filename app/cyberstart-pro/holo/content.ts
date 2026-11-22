/* The /pro copy, frozen and verbatim, in page order. Converted from the
 * landing lab's pro-content.js (window.AXP), which was extracted from the
 * live page on 2026-11-22 (CyberStartProLanding.tsx, WaitlistForm.tsx).
 * Every string a visitor reads on the Hologram page comes from here, except
 * the price, name, age range and duration, which come from the Product row
 * at request time. No em-dashes, no emoji, no new words. */

export const PRO_PRIMARY = "#ff7a3d";
export const PRO_ACCENT = "#ffb454";
export const PRO_GREEN = "#5fe0a8";
export const PRO_RED = "#ff6b81";
export const PRO_YELLOW = "#d7d24a";
const DIM = "rgba(255,255,255,0.65)";

export const AXP = {
  nav: {
    logo: { href: "/", ariaLabel: "Cyber Pro by AlgorithmX, home", wordmark: "CYBER PRO", by: "by", brand: "AlgorithmX" },
    chipsAriaLabel: "Page",
    signIn: { label: "Sign in", href: "/pro/login" },
    links: [
      { label: "The course", href: "/pro/course", id: "" },
      { label: "Pricing", href: "#enrol", id: "enrol" },
    ],
    /* label is `isActive ? "Get the course" : "Enrol"`; href is `canBuy ? buyHref : "#enrol"` */
    cta: { active: "Get the course", inactive: "Enrol" },
  },

  motionButton: { playing: "Pause animation", paused: "Play animation" },

  hero: {
    eyebrow: "From total beginner to job-ready",
    h1Plain: "You don't need to be technical to start.",
    h1Gradient: "You will be by the end.",
    sub: "Cyber security is one of the best-paid, most in-demand careers going, and far more learnable than it looks. Learn it from zero by doing, right in your browser.",
    /* the primary CTA's default label: canBuy ? `Get the course for ${price}` : isActive ? "Get the course" : "Enrol now" */
    cta: { forPrice: "Get the course for", active: "Get the course", inactive: "Enrol now" },
    priceStack: { once: "once", line2: "lifetime · no subscription" },
    secondaryRow: {
      link: { label: "See all 21 modules", href: "/pro/course" },
      badge: "18+ · aligned to Security+",
    },
  },

  passwordLab: {
    titleBar: "Module 3 · Password Lab",
    fieldLabel: "Try a password",
    placeholder: "type here...",
    inputAriaLabel: "Try a password to see how long it takes to crack",
    inputMaxLength: 40,
    toggle: { shown: "hide", hidden: "show", ariaShown: "Hide password", ariaHidden: "Show password" },
    footer: { chevron: "›", text: "A taste of Module 3. All 21 are hands-on like this." },
    /* the word the lab types for itself on load (from the wordlist) */
    demoWord: "password123",
  },

  modules: {
    eyebrow: "Real, not simulated",
    h2Plain: "You just cracked a password.",
    h2Gradient: "Next, you'll do this.",
    sub: "No slideshows, no multiple-choice quizzes about hacking. You do the real thing, safely, in your browser. Nothing you can break, nothing that ever leaves the page.",
    items: [
      {
        mod: "Module 9",
        title: "Break into a database",
        desc: "Run a real SQL injection on a practice site, watch the whole customer table spill out, then fix it with one line.",
        lines: [
          { text: "password = '", colour: DIM, weight: 400 },
          { text: "' OR '1'='1", colour: PRO_RED, weight: 700 },
          { text: ">> the whole customer table dumped", colour: PRO_RED, weight: 700 },
        ],
      },
      {
        mod: "Module 14",
        title: "Catch an attacker",
        desc: "Read a real capture of bots hammering a server and find the single break-in hidden in the noise, like an analyst.",
        lines: [
          { text: "02:14 FAIL root/admin", colour: PRO_ACCENT, weight: 400 },
          { text: "02:15 SUCCESS root/xc3511", colour: PRO_RED, weight: 700 },
          { text: ">> you found the one that got in", colour: PRO_GREEN, weight: 700 },
        ],
      },
      {
        mod: "Module 16",
        title: "Work a real incident",
        desc: "Contain a live intrusion, trace how far it spread, and write the report a manager would actually act on.",
        lines: [
          { text: "alert: lateral movement", colour: PRO_ACCENT, weight: 400 },
          { text: "contained host-07", colour: PRO_GREEN, weight: 700 },
          { text: ">> incident report filed", colour: PRO_GREEN, weight: 700 },
        ],
      },
    ],
    cta: "Get the course",
  },

  whyNow: {
    eyebrow: "Why now",
    h2: "A real career, not a hobby",
    p1: "Organisations everywhere are short of people who can defend them, and they hire on proof of skill far more than on a degree. That is the opening this course is built to get you through.",
    p2: "You start from nothing and finish ready for a first real role, with the hands-on work to show for it.",
    points: [
      { title: "In demand", desc: "Defenders are wanted in every industry, in every town." },
      { title: "Hired on skill", desc: "Show what you can do and the door opens, degree or not." },
      { title: "Yours for life", desc: "Learn it once in your browser, use it for a whole career." },
    ],
  },

  howItWorks: {
    eyebrow: "How it works",
    h2: "Taught like you're smart but new",
    sub: "Every topic follows the same four steps, so you are never lost and never bored. If you can use a web browser, you can do all of it.",
    steps: [
      { n: "01", title: "Learn", desc: "The idea in plain English, one everyday example, then the real word for it. New terms are taught before they are used." },
      { n: "02", title: "See", desc: "A true story of a real company this happened to, and what it cost them when the basics were missing." },
      { n: "03", title: "Try", desc: "You do it yourself, safely, in your browser. Real tools, real data, nothing you can break." },
      { n: "04", title: "Explain", desc: "Put it in your own words. Explaining it is how you know it stuck, and how you talk your way into the job." },
    ],
  },

  forYou: {
    h2: "Made for you, wherever you're starting",
    items: [
      { title: "Never touched security", desc: "You start at the very beginning. Module 1 assumes nothing at all." },
      { title: "Eyeing a career change", desc: "A real, in-demand field with a clear first rung. We show you the honest route in." },
      { title: "A bit techy already", desc: "You will still learn the proper names, the frameworks and the hands-on craft employers test for." },
      { title: "Want proof you can do it", desc: "You finish with a portfolio of real work, not just a line on a CV." },
    ],
  },

  journey: {
    h2: "From zero to job-ready, in four acts",
    h2Gradient: "job-ready",
    sub: "Twenty-one modules at your own pace, each act building on the last, taking you from your first login to a job-ready analyst.",
    acts: [
      { badge: "A1", span: "Modules 1 to 5", title: "Foundations you can touch", desc: "How security, the internet, passwords and cryptography really work. Taught from scratch, hands-on from day one." },
      { badge: "A2", span: "Modules 6 to 11", title: "How attacks happen", desc: "Phishing, malware, web and network attacks and the breaches they caused, each rebuilt so you understand it by doing it." },
      { badge: "A3", span: "Modules 12 to 16", title: "Defence for real", desc: "Become the analyst: hardening, the SOC, a real SIEM, detection and threat intel, and incident response." },
      { badge: "A4", span: "Modules 17 to 21", title: "Get hired", desc: "Governance, scripting, resilience, the roles and cert roadmap, and a capstone. Finish with a portfolio and a plan." },
    ],
    cta: "Get the course",
  },

  outcomes: {
    h2: "You leave with proof, not just a certificate",
    h2Gradient: "not just a certificate",
    sub: "Employers hire people who can show the work. Every part of the course produces something real you can put in front of them.",
    items: [
      { title: "Investigation write-ups", desc: "Real incidents you worked, documented like a professional would." },
      { title: "A honeypot capture", desc: "Your own server, attacked by real bots, analysed and written up." },
      { title: "A breach you rebuilt", desc: "A famous vulnerability, found, exploited and patched by you." },
      { title: "A risk assessment", desc: "A small business measured against the basics, in plain business language." },
      { title: "A capstone report", desc: "One full intrusion, start to finish, and a briefing anyone could follow." },
    ],
  },

  breaches: {
    eyebrow: "Every lesson is a true story",
    h2: "Learn from the breaches that actually happened",
    h2Gradient: "actually happened",
    sub: "You learn each defence by seeing the real company that skipped it, and what it cost them. Real names, real fines, real consequences.",
    items: [
      { org: "LastPass", year: "2022", lesson: "Attackers stole customers' encrypted password vaults, and weak master passwords fell.", tag: "Passwords" },
      { org: "23andMe", year: "2023", lesson: "Reused passwords unlocked the DNA profiles of 6.9 million people.", tag: "Reuse & MFA" },
      { org: "MOVEit", year: "2023", lesson: "One SQL-injection flaw breached thousands of organisations at once.", tag: "Web attacks" },
      { org: "Change Healthcare", year: "2024", lesson: "One login with no MFA, and US healthcare billing froze for weeks.", tag: "Access control" },
      { org: "MGM Resorts", year: "2023", lesson: "A single phone call to the help desk shut the casinos for days.", tag: "Social engineering" },
      { org: "Log4Shell", year: "2021", lesson: "One flaw in a free tool put millions of systems at risk overnight.", tag: "Vulnerabilities" },
    ],
  },

  honest: {
    eyebrow: "No hype",
    h2: "The honest version",
    items: [
      { title: "It takes real effort", desc: "Nobody goes from zero to hired in a weekend. This is a proper course of 21 modules, and we tell you exactly what each one asks of you." },
      { title: "The first job is realistic", desc: "Your way in is usually a support or analyst role, around £25,000 to £32,000 in the UK. We show you that path, not a fantasy one." },
      { title: "We prepare you, honestly", desc: "The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth your money. We never promise a job. We make you ready to earn one." },
    ],
  },

  faq: {
    h2: "Questions, answered straight",
    items: [
      { q: "I have zero technical background. Is that really okay?", a: "That is exactly who this is built for. Module 1 assumes nothing, every new term is taught before it is used, and you are hands-on from the very first topic. If you can use a web browser, you can do this." },
      { q: "What exactly do I get for my money?", a: "All 21 modules across four acts, every hands-on lab, the portfolio pieces you build along the way, and lifetime access. One payment, no subscription." },
      { q: "How much time does it take?", a: "It is self-paced with lifetime access, so you decide. The course is 21 modules across four acts, and each module tells you up front what it asks of you." },
      { q: "Do I get a certificate?", a: "You finish with something stronger: a portfolio of real work. The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth paying for, which you sit with the exam body." },
      { q: "Will this get me a job?", a: "No honest course can promise that. What we can do is make you genuinely ready for a first support or analyst role, and give you the proof of work to show for it." },
    ],
  },

  pricing: {
    anchorId: "enrol",
    h2: "Everything, for one payment",
    sub: "All 21 modules, every lab, your portfolio and lifetime access, for a single price. No subscription, ever. Free courses leave you alone and bootcamps charge thousands; Cyber Pro is one fair payment in between.",
    /* the Price fact's value is `${price} once`, from the Product row */
    facts: { price: "Price", once: "once", rest: [
      { k: "Access", v: "Lifetime" },
      { k: "Length", v: "21 modules" },
      { k: "Level", v: "Zero to hired" },
      { k: "Billing", v: "No subscription" },
    ] },
    action: {
      headlineActive: "The course is live. Buying opens any day now.",
      headlineInactive: "Opening very soon.",
      sub: "Leave your email and be first in line.",
    },
  },

  waitlist: {
    placeholder: "your@email.com",
    inputAriaLabel: "Email address for waitlist",
    /* the live string is "Notify Me 🚀"; the rocket is drawn as an inline SVG (no emoji rule) */
    button: "Notify Me",
    buttonLoading: "Adding…",
    success: "You’re on the list. We’ll email you when it launches.",
    errorInvalid: "Please enter a valid email address.",
    errorServerFallback: "Something went wrong. Try again?",
    endpoint: "/api/waitlist",
    source: "enrol",
  },

  cta: {
    h2: "Ready to start your cyber career?",
    h2Gradient: "cyber career",
    sub: "Twenty-one modules, one payment, lifetime access. Everything you need to go from zero to job-ready.",
  },

  footer: {
    copyright: "© 2026 AlgorithmX",
    linksAriaLabel: "Courses",
    links: [
      { label: "Cyber Heroes", href: "/cyberheroes", current: false },
      { label: "Cyber Explorers", href: "/cyberexplorers", current: false },
      { label: "Cyber Ops", href: "/ops", current: false },
      { label: "Cyber Pro", href: "/pro", current: true },
    ],
  },
} as const;

/* Splits a headline around its gradient span: [before, span, after]. */
export function splitHeadline(h: string, span: string): [string, string, string] {
  const i = h.indexOf(span);
  if (i < 0) return [h, "", ""];
  return [h.slice(0, i), span, h.slice(i + span.length)];
}
