/* The /ops copy, verbatim from the page it replaces (CyberStartLanding),
 * extracted for the landing lab as ops-content.js (window.AXO) and typed
 * here. Every visible string, in page order. No price exists on /ops; the
 * three empty rank cells carry no text (the old page printed a placeholder
 * em-dash there; the design draws a hairline instead). */

import { enrolHref } from "@/app/lib/consumerCatalogue";

/* The primary Sign up buttons: sign-up until checkout opens, then the buy
 * page (CONSUMER_CHECKOUT_OPEN in app/lib/launchSwitch.ts). */
const ENROL = enrolHref("cyberstart");

export const AXO = {
  nav: {
    brand: { wordmark: "CYBER OPS", href: "#top", ariaLabel: "Cyber Ops by AlgorithmX" },
    links: [
      { id: "range", label: "The Range", href: "#range" },
      { id: "curriculum", label: "Curriculum", href: "#curriculum" },
      { id: "outcome", label: "Outcome", href: "#outcome" },
      { id: "safety", label: "Safety", href: "#safety" },
      { id: "faq", label: "FAQ", href: "#faq" },
    ],
    chipsAriaLabel: "Page",
    signIn: { label: "Sign in", href: "/ops/login" },
    cta: { label: "Sign up", href: ENROL },
  },

  hero: {
    chips: [
      { text: "Recruitment open", kind: "open" },
      { text: "Ages 14-17", kind: "range" },
      { text: "20 modules . about an hour each", kind: "mono" },
    ],
    h1Line1: "Get recruited.",
    h1Line2: "Do the real work.",
    lead:
      "Cyber Ops hires you as a junior security operator. Break into real targets, defend against real attacks, and write up real findings - inside a walled range where nothing can actually go wrong. You leave with a portfolio, not a certificate.",
    buttons: [
      { label: "Sign up", href: ENROL, style: "primary" },
      { label: "See the 20 modules →", href: "#curriculum", style: "ghost" },
    ],
    note: "The top tier of AlgorithmX - after Cyber Heroes and Cyber Explorers.",
    /* Aligned with the NCSC (alignment, not endorsement). */
    ncscPill: {
      text: "Aligned with UK’s National Cyber Security Centre",
      logo: { src: "/logos/ncsc.svg", alt: "National Cyber Security Centre" },
    },
    media: {
      titleBar: { title: "opr@range . the reel", badge: "Film . 0:32" },
      video: {
        src: "/ops/cyberops-trailer.mp4",
        poster: "/ops/cyberops-poster.jpg",
        ariaLabel: "Cyber Ops concept trailer",
        replayLabel: "Replay",
      },
    },
    motionButton: { playing: "Pause animation", paused: "Play animation" },
  },

  range: {
    eyebrow: "What you actually do",
    h2: "A walled range. Real tools. Real targets.",
    lead:
      "Every module, Cyber Ops hands you a client engagement. You run it the way professionals do - on genuinely vulnerable systems we build for you to break. It all lives inside a sandbox that never touches the real internet, so you can do the real thing without any of the real risk.",
    lead2: "Your payloads actually run. Your exploits actually land. Nothing ever leaves your browser.",
    steps: [
      { n: "01", title: "Authorize", body: "Sign the scope. You only ever act inside written permission - the first rule of the job." },
      { n: "02", title: "Recon", body: "Map the target and find the way in before you touch a thing." },
      { n: "03", title: "Act", body: "Run the technique for real against the range - injection, cracking, or defense." },
      { n: "04", title: "Document", body: "Capture the finding: impact, proof, and the fix." },
      { n: "05", title: "Report", body: "File it. It lands in your portfolio and your standing at Cyber Ops." },
    ],
  },

  curriculum: {
    eyebrow: "The curriculum",
    h2: "Twenty modules, attacker to defender to the AI frontier.",
    lead:
      "You spend the first modules learning to break in - then turn around and learn to catch it - and finish on the newest attack surface of all: AI. That’s the honest arc of the profession, and it’s why this is never just a hacking course.",
    /* colour: the group's wire and numeral colour; the Role Flip is green and
       the AI Frontier purple, as on the page it replaces */
    groups: [
      { range: "Modules 1-3", title: "Foundations", colour: "#5744c9", modules: [
        { n: "01", title: "Rules of Engagement" },
        { n: "02", title: "Recon & OSINT" },
        { n: "03", title: "The Web Surface" },
      ] },
      { range: "Modules 4-7", title: "Web Exploitation", colour: "#5744c9", modules: [
        { n: "04", title: "Broken Auth" },
        { n: "05", title: "Injection" },
        { n: "06", title: "Cross-Site Scripting" },
        { n: "07", title: "Access Control" },
      ] },
      { range: "Modules 8-11", title: "Data & Systems", colour: "#5744c9", modules: [
        { n: "08", title: "Cryptography" },
        { n: "09", title: "Passwords & Hashes" },
        { n: "10", title: "Network Recon" },
        { n: "11", title: "Digital Forensics" },
      ] },
      { range: "Modules 12-14", title: "The Role Flip", colour: "#0e7a45", modules: [
        { n: "12", title: "Incident Response" },
        { n: "13", title: "Phishing Defense" },
        { n: "14", title: "Disclosure & Reporting" },
      ] },
      { range: "Modules 15-16", title: "Capstone", colour: "#4f3fc4", modules: [
        { n: "15", title: "Full Engagement I" },
        { n: "16", title: "Report & Debrief" },
      ] },
      { range: "Modules 17-20", title: "AI Frontier", colour: "#7a2fc9", modules: [
        { n: "17", title: "Prompt Injection" },
        { n: "18", title: "Cloud & API Security" },
        { n: "19", title: "Agentic AI Under Attack" },
        { n: "20", title: "Deepfakes & the Arms Race" },
      ] },
    ],
  },

  outcome: {
    eyebrow: "What you leave with",
    h2: "A portfolio, not a sticker.",
    lead:
      "Every engagement produces a real finding, written up the way a professional would - impact, proof, remediation. They stack into a portfolio you can actually show a teacher, a UCAS statement, or a first employer. Your standing at Cyber Ops climbs with the quality of the work, not just finishing it.",
    ranks: [
      { name: "Junior", width: "64%", pct: "64%", active: true },
      { name: "Operator", width: "0%", pct: null, active: false },
      { name: "Lead", width: "0%", pct: null, active: false },
      { name: "Principal", width: "0%", pct: null, active: false },
    ],
    findingCard: {
      severity: "High",
      cvss: "CVSS 8.1",
      id: "F-1 . E-05",
      title: "Authentication bypass via SQL injection",
      fields: [
        { label: "Target", value: "tgt-04.range.lab . POST /login", kind: "mono" },
        { label: "Impact", value: "The email field is concatenated straight into the login query. A crafted value logs in as any account - including admin - with no password.", kind: "text" },
        { label: "Remediation", value: "Use a parameterized query: email = $1, [email]", kind: "fix" },
      ],
    },
  },

  safety: {
    eyebrow: "For parents",
    h2: "Real skills. Zero real risk.",
    lead: "Cyber Ops teaches genuine offensive and defensive security - the reason it’s safe is architecture, not promises.",
    cards: [
      { icon: "shield", title: "A walled range", body: "Every target is a fake system that runs inside the browser. There is no network path out - nothing your child does can reach a real computer, ever." },
      { icon: "shieldCheck", title: "Authorization first", body: "Every engagement begins by signing a scope. The single most important professional and legal habit - you only touch what you’re allowed to - is practised twenty times." },
      { icon: "alert", title: "Spot the con, don’t run it", body: "Your child learns to recognise phishing and manipulation - never to author it. Deception aimed at people stays firmly on the defensive side." },
      { icon: "chart", title: "Structured & tracked", body: "A 20-module curriculum with clear progress, a professional tone, and law-aware framing throughout. Built for teenagers, respected as teenagers." },
    ],
  },

  faq: {
    eyebrow: "Questions",
    h2: "Straight answers.",
    items: [
      { q: "Is this teaching my child to hack?", a: "Yes - and that’s the point. You cannot defend what you don’t understand. Cyber Ops teaches real offensive technique against fake targets in a sealed range, then turns your child around to defend and disclose. They finish as someone who protects systems, with the professional ethics to match.", openByDefault: true },
      { q: "Is it actually safe and legal?", a: "Completely. Every target is simulated inside the browser with no route to any real system, and every engagement starts by signing an authorization scope - the exact habit that keeps real professionals on the right side of the law. We frame the relevant UK law (the Computer Misuse Act) throughout.", openByDefault: false },
      { q: "What ages is it for? Do they need to be technical?", a: "Ages 14-17. No prior experience needed - the first modules build the ground up, and early engagements guide the commands so nobody’s staring at a blank terminal. It gets genuinely challenging by design as they rank up.", openByDefault: false },
      { q: "When can we start, and how much?", a: "Right now - the range is open. Create an account and your operator starts their first engagement today. AlgorithmX courses are a one-time payment for lifetime access.", openByDefault: false },
    ],
  },

  cta: {
    eyebrow: "Enlist",
    h2: "The range is open.",
    lead: "Create an operator account and take the first engagement today. Twenty modules, one payment, a portfolio at the end.",
    buttons: [
      { label: "Sign up", href: ENROL, style: "primary" },
      { label: "Sign in", href: "/ops/login", style: "ghost" },
    ],
  },

  footer: {
    brand: { href: "#top" },
    links: [
      { label: "The Range", href: "#range" },
      { label: "Curriculum", href: "#curriculum" },
      { label: "Safety", href: "#safety" },
      { label: "FAQ", href: "#faq" },
      { label: "Sign up", href: "/ops/signup" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
    linksAriaLabel: "Footer",
    fine: "Cyber Ops is the 14-17 tier of AlgorithmX, a UK cybersecurity course for young people. All training takes place in a simulated, sandboxed range; no real systems are ever involved. © 2026 AlgorithmX Limited. Company 17266946, registered in England and Wales. Registered office: 301b Uppingham Road, Leicester LE5 4DG. Working name - brand and pricing subject to change.",
  },
} as const;

export type SafetyIcon = (typeof AXO.safety.cards)[number]["icon"];
