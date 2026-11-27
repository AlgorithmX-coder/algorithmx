/* The /ops copy for the Glass Console page (landing lab round 9, version B,
 * the owner's pick, 2026-11-27). Every visible string, in page order.
 *
 * Moved here from app/ops/holo/content.ts. The routes, the enrol logic, the
 * sign-in link, the footer links and the footer fine print are unchanged
 * from the page it replaces; the body copy is the design's shorter, approved
 * wording. No price exists on /ops. Age ranges are written "14 to 17". */

import { enrolHref } from "@/app/lib/consumerCatalogue";

/* The primary Sign up buttons: sign-up until checkout opens, then the buy
 * page (CONSUMER_CHECKOUT_OPEN in app/lib/launchSwitch.ts). */
const ENROL = enrolHref("cyberstart");

/* The four stretches of the course: the stage bar above the module tiles,
 * the tag in the readout and the module's group. */
export type ArcKind = "attack" | "defend" | "capstone" | "ai";

/* A terminal line: p = the typed prompt, d = dim output, ok = success,
 * w = warning, r = the red hit. */
export type TermKind = "p" | "d" | "ok" | "w" | "r";

export const AXO = {
  nav: {
    brand: { href: "#top", ariaLabel: "Cyber Ops by AlgorithmX" },
    ariaLabel: "Page",
    links: [
      { label: "The range", href: "#range" },
      { label: "Curriculum", href: "#curriculum" },
      { label: "Outcome", href: "#outcome" },
      { label: "Safety", href: "#safety" },
      { label: "FAQ", href: "#faq" },
    ],
    signIn: { label: "Sign in", href: "/ops/login" },
    cta: { label: "Sign up", href: ENROL },
  },

  hero: {
    chips: [
      { text: "Recruitment open", open: true },
      { text: "Ages 14 to 17", open: false },
      { text: "20 modules · about an hour each", open: false },
    ],
    h1Line1: "Get recruited.",
    h1Accent: "Do the real work.",
    lead: "Cyber Ops hires you as a junior security operator. Break into real targets and defend against real attacks, inside a walled range.",
    leadBold: "You leave with a portfolio, not a certificate.",
    buttons: [
      { label: "Sign up", href: ENROL, style: "primary" },
      { label: "See the 20 modules", href: "#curriculum", style: "ghost" },
    ],
    note: "The top tier of AlgorithmX, after Cyber Heroes and Cyber Explorers.",
    media: {
      titleBar: { title: "opr@range · the reel", badge: "Film · 0:32" },
      video: {
        src: "/ops/cyberops-trailer.mp4",
        poster: "/ops/cyberops-poster.jpg",
        ariaLabel: "Cyber Ops concept trailer",
      },
    },
    motionButton: { playing: "Pause animation", paused: "Play animation" },
  },

  range: {
    eyebrow: "what you actually do",
    h2: "A walled range. Real tools.",
    h2Accent: "Real targets.",
    lead: "Every module hands you a client engagement. Your payloads actually run. Nothing ever leaves your browser.",
    stepsAriaLabel: "The five steps of an engagement",
    terminal: {
      title: "opr@range · engagement E-05",
      sandbox: "Sandbox:",
      sealed: "sealed",
      noRoute: "No route to the real internet",
    },
    steps: [
      { n: "01", title: "Authorize", body: "Sign the scope. You only act inside written permission.", lines: [
        ["p", "$ scope sign --engagement E-05"],
        ["d", "client     Northwind Outfitters (simulated)"],
        ["d", "in scope   tgt-04.range.lab"],
        ["ok", "✓ scope signed. you may proceed."],
      ] },
      { n: "02", title: "Recon", body: "Map the target before you touch a thing.", lines: [
        ["p", "$ recon map tgt-04.range.lab"],
        ["d", "80/tcp   open  http"],
        ["d", "443/tcp  open  https"],
        ["w", "! login form found at POST /login"],
      ] },
      { n: "03", title: "Act", body: "Run the technique for real against the range.", lines: [
        ["p", "$ act inject --target /login --field email"],
        ["d", "sending crafted value to the email field ..."],
        ["r", "200 OK  logged in as admin, no password"],
        ["ok", "✓ finding confirmed: authentication bypass"],
      ] },
      { n: "04", title: "Document", body: "Capture the finding: impact, proof and the fix.", lines: [
        ["p", "$ finding new F-1 --severity high --cvss 8.1"],
        ["d", "impact       any account, including admin"],
        ["d", "proof        request and response captured"],
        ["ok", "fix          use a parameterized query"],
      ] },
      { n: "05", title: "Report", body: "File it. It lands in your portfolio.", lines: [
        ["p", "$ report file F-1"],
        ["ok", "✓ filed to portfolio"],
        ["ok", "✓ standing: Junior 64%"],
        ["d", "next engagement unlocked: E-06"],
      ] },
    ] as ReadonlyArray<{ n: string; title: string; body: string; lines: ReadonlyArray<readonly [TermKind, string]> }>,
  },

  curriculum: {
    eyebrow: "the curriculum",
    h2: "Twenty modules. Attacker, then defender,",
    h2Accent: "then the AI frontier.",
    /* the stage bar; grid widths follow the module counts (11, 3, 2, 4) */
    arcs: [
      { kind: "attack", label: "01 to 11 · Learn to break in", tag: "Attacker" },
      { kind: "defend", label: "12 to 14 · The role flip", tag: "Defender" },
      { kind: "capstone", label: "15 to 16 · Capstone", tag: "Capstone" },
      { kind: "ai", label: "17 to 20 · AI frontier", tag: "AI frontier" },
    ] as ReadonlyArray<{ kind: ArcKind; label: string; tag: string }>,
    modules: [
      { title: "Rules of Engagement", arc: "attack" },
      { title: "Recon & OSINT", arc: "attack" },
      { title: "The Web Surface", arc: "attack" },
      { title: "Broken Auth", arc: "attack" },
      { title: "Injection", arc: "attack" },
      { title: "Cross-Site Scripting", arc: "attack" },
      { title: "Access Control", arc: "attack" },
      { title: "Cryptography", arc: "attack" },
      { title: "Passwords & Hashes", arc: "attack" },
      { title: "Network Recon", arc: "attack" },
      { title: "Digital Forensics", arc: "attack" },
      { title: "Incident Response", arc: "defend" },
      { title: "Phishing Defense", arc: "defend" },
      { title: "Disclosure & Reporting", arc: "defend" },
      { title: "Full Engagement I", arc: "capstone" },
      { title: "Report & Debrief", arc: "capstone" },
      { title: "Prompt Injection", arc: "ai" },
      { title: "Cloud & API Security", arc: "ai" },
      { title: "Agentic AI Under Attack", arc: "ai" },
      { title: "Deepfakes & the Arms Race", arc: "ai" },
    ] as ReadonlyArray<{ title: string; arc: ArcKind }>,
    /* the module the readout shows before anyone picks one (module 05) */
    defaultModule: 4,
    readoutKey: "Module",
    tilesAriaLabel: "The 20 modules",
  },

  outcome: {
    eyebrow: "what you leave with",
    h2: "A portfolio,",
    h2Accent: "not a sticker.",
    lead: "Every engagement produces a real finding, written up the way a professional would. Show it to a teacher, a UCAS statement or a first employer.",
    ranks: [
      { name: "Junior", width: "64%", pct: "64%", active: true },
      { name: "Operator", width: "0%", pct: null, active: false },
      { name: "Lead", width: "0%", pct: null, active: false },
      { name: "Principal", width: "0%", pct: null, active: false },
    ],
    findingCard: {
      stamp: "Filed to portfolio",
      severity: "High",
      cvss: "CVSS 8.1",
      id: "F-1 · E-05",
      title: "Authentication bypass via SQL injection",
      fields: [
        { label: "Target", value: "tgt-04.range.lab · POST /login", kind: "mono" },
        { label: "Impact", value: "A crafted value in the email field logs in as any account, including admin, with no password.", kind: "text" },
        { label: "Remediation", value: "Use a parameterized query: email = $1, [email]", kind: "fix" },
      ],
    },
  },

  safety: {
    eyebrow: "for parents",
    h2: "Real skills.",
    h2Accent: "Zero real risk.",
    lead: "The reason it’s safe is architecture, not promises.",
    cards: [
      { icon: "range", title: "A walled range", body: "Every target is a fake system that runs inside the browser. Nothing can reach a real computer." },
      { icon: "scope", title: "Authorization first", body: "Every engagement begins by signing a scope. Practised twenty times." },
      { icon: "con", title: "Spot the con, don’t run it", body: "They learn to recognise phishing and manipulation, never to author it." },
      { icon: "tracked", title: "Structured and tracked", body: "Clear progress, a professional tone and law-aware framing throughout." },
    ],
  },

  faq: {
    eyebrow: "questions",
    h2: "Straight answers.",
    items: [
      { q: "Is this teaching my child to hack?", a: "Yes, and that’s the point. You cannot defend what you don’t understand. Cyber Ops teaches real offensive technique against fake targets in a sealed range, then turns your child around to defend and disclose.", openByDefault: true },
      { q: "Is it actually safe and legal?", a: "Completely. Every target is simulated inside the browser with no route to any real system, and every engagement starts by signing an authorization scope: the exact habit that keeps real professionals on the right side of the law.", openByDefault: false },
      { q: "What ages is it for? Do they need to be technical?", a: "Ages 14 to 17. No prior experience needed: the first modules build the ground up, and early engagements guide the commands so nobody’s staring at a blank terminal.", openByDefault: false },
      { q: "When can we start, and how much?", a: "Right now: the range is open. Create an account and your operator starts their first engagement today. AlgorithmX courses are a one-time payment for lifetime access.", openByDefault: false },
    ],
  },

  cta: {
    eyebrow: "enlist",
    h2: "The range is open.",
    lead: "Create an operator account and take the first engagement today. Twenty modules, one payment, a portfolio at the end.",
    buttons: [
      { label: "Sign up", href: ENROL, style: "primary" },
      { label: "Sign in", href: "/ops/login", style: "ghost" },
    ],
  },

  footer: {
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

/* The arc a module (0-based) belongs to, with its readout tag. */
export function moduleArc(i: number) {
  const C = AXO.curriculum;
  const m = C.modules[i];
  const arc = C.arcs.find((a) => a.kind === m.arc)!;
  return { n: String(i + 1).padStart(2, "0"), title: m.title, kind: arc.kind, tag: arc.tag };
}

/* The terminal's step counter, "03 / 05". */
export const stepLabel = (i: number) => `${AXO.range.steps[i].n} / ${String(AXO.range.steps.length).padStart(2, "0")}`;
