/* The /pro copy for the Ember Console page (landing lab round 9, version A,
 * the owner's pick on 2026-11-27), in page order. Taken from the approved
 * mockup r9-pro-a.html, which cut the live copy down and added nothing new:
 * the module titles and blurbs are the course hub's, the labs, steps,
 * breaches and FAQ are the live strings. The price and the open or closed
 * state come from the Product row at request time, so no price is written
 * here. No em-dashes, no emoji. */

export const PRO_ACCENT = "#ffb454";
export const PRO_GREEN = "#5fe0a8";
export const PRO_RED = "#ff6b81";
export const PRO_YELLOW = "#d7d24a";

/* A typed terminal line: [colour class, text, typed out letter by letter]. */
export type TermClass = "p" | "d" | "r" | "g" | "a" | "w";
export type TermLine = readonly [TermClass, string, boolean?];

export type Act = { badge: string; span: string; title: string; desc: string; colour: string };
export type Module = { title: string; blurb: string; act: 0 | 1 | 2 | 3 };

const ACTS: readonly Act[] = [
  { badge: "A1", span: "Modules 1 to 5", title: "Foundations you can touch", desc: "How security, the internet, passwords and cryptography really work. Hands-on from day one.", colour: "#d27206" },
  { badge: "A2", span: "Modules 6 to 11", title: "How attacks happen", desc: "Phishing, malware, web and network attacks and the breaches they caused, each rebuilt by you.", colour: "#c4470c" },
  { badge: "A3", span: "Modules 12 to 16", title: "Defence for real", desc: "Become the analyst: hardening, the SOC, a real SIEM, detection, threat intel and incident response.", colour: "#a63a08" },
  { badge: "A4", span: "Modules 17 to 21", title: "Get hired", desc: "Governance, scripting, resilience, the roles and cert roadmap, and a capstone. Finish with a portfolio and a plan.", colour: "#3a2416" },
];

/* The 21 modules, titles and blurbs as on the course hub (app/pro/CourseHub.tsx). */
const MODULES: readonly Module[] = [
  { title: "What security actually means", blurb: "The core ideas every certificate opens with: the CIA triad, risk, and thinking like a defender.", act: 0 },
  { title: "How the internet actually works", blurb: "The plumbing attackers use, from IP and DNS to HTTPS, explained without jargon.", act: 0 },
  { title: "Passwords & account security", blurb: "How passwords are really stored and cracked, and how to lock down your own accounts.", act: 0 },
  { title: "Cryptography without the maths", blurb: "Why the padlock means something: encryption, hashing and certificates in plain terms.", act: 0 },
  { title: "Law, ethics & your first audit", blurb: "The Computer Misuse Act, data protection, and your first real portfolio piece.", act: 0 },
  { title: "Who the attackers are", blurb: "The real threat actors and the lifecycle of an attack, from recon to impact.", act: 1 },
  { title: "Social engineering & phishing", blurb: "Why people are the easiest way in, and how to spot and report it.", act: 1 },
  { title: "Malware: how it really works", blurb: "Viruses, ransomware, and how infection actually happens.", act: 1 },
  { title: "Web attacks & the OWASP Top 10", blurb: "How web apps get broken, and you run a real SQL injection yourself.", act: 1 },
  { title: "Networks & Wi-Fi under attack", blurb: "Eavesdropping, spoofing, denial of service, and moving through a network.", act: 1 },
  { title: "Vulnerabilities & patching", blurb: "What a vulnerability really is, and the race to patch it before attackers strike.", act: 1 },
  { title: "Hardening & secure configuration", blurb: "Closing the doors, using the Cyber Essentials five controls as your checklist.", act: 2 },
  { title: "The SOC & the analyst’s day", blurb: "The most common first job in cyber security, seen from the inside.", act: 2 },
  { title: "Logs & the SIEM", blurb: "Reading what attackers leave behind, on real honeypot data.", act: 2 },
  { title: "Detection & threat intelligence", blurb: "Spotting the attack, and knowing your enemy with MITRE ATT&CK.", act: 2 },
  { title: "Incident response & forensics", blurb: "When it goes wrong: contain, investigate, recover.", act: 2 },
  { title: "Governance, risk & compliance", blurb: "The huge hiring lane most beginners never hear about.", act: 3 },
  { title: "Scripting for defenders", blurb: "A little real code goes a long way: parse logs, check input, automate.", act: 3 },
  { title: "Resilience: backups & continuity", blurb: "Surviving the bad day, from ransomware to disaster recovery.", act: 3 },
  { title: "The roles & the cert roadmap", blurb: "Which job, which certificate, and the honest state of the market.", act: 3 },
  { title: "The job machinery + capstone", blurb: "Everything you built, turned into a CV, a portfolio and an offer.", act: 3 },
];

export const AXP = {
  nav: {
    ariaLabel: "Cyber Pro",
    logo: { href: "/", ariaLabel: "Cyber Pro by AlgorithmX, home" },
    links: [
      { label: "The course", href: "/pro/course" },
      { label: "Pricing", href: "#enrol" },
    ],
    signIn: { label: "Sign in", href: "/pro/login" },
    /* label is `isActive ? active : inactive`; href is `canBuy ? /purchase/<slug> : #enrol` */
    cta: { active: "Get the course", inactive: "Enrol" },
  },

  motionButton: { playing: "Pause animation", paused: "Play animation" },

  hero: {
    eyebrow: "From total beginner to job-ready",
    h1Plain: "You don’t need to be technical to start.",
    h1Accent: "You will be by the end.",
    lead: "Cyber security is one of the best-paid, most in-demand careers going. Learn it from zero by doing, right in your browser.",
    /* canBuy ? `${forPrice} ${price}` : isActive ? active : inactive */
    cta: { forPrice: "Get the course for", active: "Get the course", inactive: "Enrol now" },
    priceStack: { once: "once", line2: "lifetime · no subscription" },
    secondaryRow: {
      link: { label: "See all 21 modules", href: "#journey" },
      badge: "18+ · aligned to Security+",
    },
  },

  passwordLab: {
    titleBar: "Module 3 · Password Lab",
    badge: "live",
    fieldLabel: "Try a password",
    placeholder: "type here...",
    inputAriaLabel: "Try a password to see how long it takes to crack",
    inputMaxLength: 40,
    toggle: { shown: "hide", hidden: "show", ariaShown: "Hide password", ariaHidden: "Show password" },
    stats: { length: "Length", charset: "Charset", rig: "Rig speed", rigValue: "10bn/s" },
    footer: { chevron: "›", text: "A taste of Module 3. All 21 are hands-on like this." },
    /* the word the lab types for itself on load (from the wordlist) */
    demoWord: "password123",
  },

  labs: {
    eyebrow: "real, not simulated",
    h2Plain: "You just cracked a password.",
    h2Accent: "Next, you’ll do this.",
    sub: "You do the real thing, safely, in your browser. Nothing you can break, nothing that ever leaves the page.",
    tabsAriaLabel: "Hands-on labs",
    barPrefix: "pro@lab · module",
    badge: "sandboxed",
    items: [
      {
        mod: "09",
        title: "Break into a database",
        desc: "Run a real SQL injection on a practice site, watch the whole customer table spill out, then fix it with one line.",
        lines: [["p", "$ lab open module-09", true], ["d", "password = '", true], ["r", "' OR '1'='1", true], ["r", ">> the whole customer table dumped"]] as readonly TermLine[],
      },
      {
        mod: "14",
        title: "Catch an attacker",
        desc: "Read a real capture of bots hammering a server and find the single break-in hidden in the noise, like an analyst.",
        lines: [["p", "$ lab open module-14", true], ["a", "02:14 FAIL root/admin", true], ["r", "02:15 SUCCESS root/xc3511", true], ["g", ">> you found the one that got in"]] as readonly TermLine[],
      },
      {
        mod: "16",
        title: "Work a real incident",
        desc: "Contain a live intrusion, trace how far it spread, and write the report a manager would actually act on.",
        lines: [["p", "$ lab open module-16", true], ["a", "alert: lateral movement", true], ["g", "contained host-07", true], ["g", ">> incident report filed"]] as readonly TermLine[],
      },
    ],
  },

  career: {
    eyebrow: "why now",
    h2Plain: "A real career,",
    h2Accent: "not a hobby",
    sub: "Organisations everywhere are short of people who can defend them, and they hire on proof of skill far more than on a degree.",
    points: [
      { icon: "M3 17l6-6 4 4 8-8M15 7h6v6", title: "In demand", desc: "Defenders are wanted in every industry, in every town." },
      { icon: "M8 3h8l4 4v14H4V3h4zM9 13l2 2 4-4", title: "Hired on skill", desc: "Show what you can do and the door opens, degree or not." },
      { icon: "M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5zM9 12h6", title: "Yours for life", desc: "Learn it once in your browser, use it for a whole career." },
    ],
  },

  how: {
    eyebrow: "how it works",
    h2Plain: "Taught like you’re smart",
    h2Accent: "but new",
    sub: "Every topic follows the same four steps, so you are never lost and never bored.",
    stepsAriaLabel: "The four steps",
    bar: "topic · passwords",
    badge: "Module 3",
    steps: [
      {
        title: "Learn",
        desc: "The idea in plain English, one everyday example, then the real word for it. New terms are taught before they are used.",
        lines: [["p", "$ learn password-reuse", true], ["w", "One password, used on lots of sites."], ["w", "One leak, and every one of them opens."], ["a", "the real word: credential stuffing"]] as readonly TermLine[],
      },
      {
        title: "See",
        desc: "A true story of a real company this happened to, and what it cost them when the basics were missing.",
        lines: [["p", "$ see --case 23andMe --year 2023", true], ["w", "Reused passwords unlocked the DNA"], ["w", "profiles of 6.9 million people."], ["r", "missing: unique passwords and MFA"]] as readonly TermLine[],
      },
      {
        title: "Try",
        desc: "You do it yourself, safely, in your browser. Real tools, real data, nothing you can break.",
        lines: [["p", "$ try crack password123", true], ["r", "Cracked instantly"], ["d", "It is on every attacker's wordlist."], ["g", ">> now make one that holds for centuries"]] as readonly TermLine[],
      },
      {
        title: "Explain",
        desc: "Put it in your own words. Explaining it is how you know it stuck, and how you talk your way into the job.",
        lines: [["p", "$ explain --in-your-own-words", true], ["w", "\"One leaked password should only ever"], ["w", " open one door. Use a different one"], ["w", " everywhere, and switch on MFA.\""], ["g", ">> that is how you know it stuck"]] as readonly TermLine[],
      },
    ],
  },

  forYou: {
    eyebrow: "who it’s for",
    h2Plain: "Made for you,",
    h2Accent: "wherever you’re starting",
    items: [
      { key: "> start: zero", title: "Never touched security", desc: "You start at the very beginning. Module 1 assumes nothing at all." },
      { key: "> start: switching", title: "Eyeing a career change", desc: "A real, in-demand field with a clear first rung. We show you the honest route in." },
      { key: "> start: some tech", title: "A bit techy already", desc: "You still learn the proper names, the frameworks and the hands-on craft employers test for." },
      { key: "> goal: proof", title: "Want proof you can do it", desc: "You finish with a portfolio of real work, not just a line on a CV." },
    ],
  },

  journey: {
    eyebrow: "the course",
    h2Before: "From zero to",
    h2Accent: "job-ready",
    h2After: ", in four acts",
    sub: "Twenty-one modules at your own pace, each act building on the last.",
    tilesAriaLabel: "The 21 modules",
    defaultModule: 8,
    acts: ACTS,
    modules: MODULES,
  },

  proof: {
    eyebrow: "what you leave with",
    h2Plain: "You leave with proof,",
    h2Accent: "not just a certificate",
    sub: "Employers hire people who can show the work. Every part of the course produces something real.",
    indexAriaLabel: "Portfolio pieces",
    docLabel: "PORTFOLIO PIECE",
    filed: "FILED",
    signature: "Prepared by: you",
    stamp: "FILED TO PORTFOLIO",
    items: [
      { title: "Investigation write-ups", desc: "Real incidents you worked, documented like a professional would.", lines: [92, 84, 88] },
      { title: "A honeypot capture", desc: "Your own server, attacked by real bots, analysed and written up.", lines: [88, 94, 70] },
      { title: "A breach you rebuilt", desc: "A famous vulnerability, found, exploited and patched by you.", lines: [96, 78, 86] },
      { title: "A risk assessment", desc: "A small business measured against the basics, in plain business language.", lines: [84, 90, 76] },
      { title: "A capstone report", desc: "One full intrusion, start to finish, and a briefing anyone could follow.", lines: [90, 86, 94] },
    ],
  },

  breaches: {
    eyebrow: "every lesson is a true story",
    h2Plain: "Learn from the breaches that",
    h2Accent: "actually happened",
    sub: "You learn each defence by seeing the real company that skipped it. Real names, real fines, real consequences.",
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
    eyebrow: "no hype",
    h2: "The honest version",
    items: [
      { title: "It takes real effort", desc: "Nobody goes from zero to hired in a weekend. This is a proper course of 21 modules." },
      { title: "The first job is realistic", desc: "Your way in is usually a support or analyst role, around £25,000 to £32,000 in the UK." },
      { title: "We prepare you, honestly", desc: "Aligned to the CompTIA Security+ objectives. We make you ready to earn the job." },
    ],
  },

  faq: {
    eyebrow: "questions",
    h2: "Questions, answered straight",
    items: [
      { q: "I have zero technical background. Is that really okay?", a: "That is exactly who this is built for. Module 1 assumes nothing, every new term is taught before it is used, and you are hands-on from the very first topic. If you can use a web browser, you can do this." },
      { q: "What exactly do I get for my money?", a: "All 21 modules across four acts, every hands-on lab, the portfolio pieces you build along the way, and lifetime access. One payment, no subscription." },
      { q: "How much time does it take?", a: "It is self-paced with lifetime access, so you decide. Each of the 21 modules tells you up front what it asks of you." },
      { q: "Do I get a certificate?", a: "You finish with something stronger: a portfolio of real work. The course is aligned to the CompTIA Security+ objectives and points you at the certificates worth paying for, which you sit with the exam body." },
      { q: "Will this get me a job?", a: "No honest course can promise that. What we can do is make you genuinely ready for a first support or analyst role, and give you the proof of work to show for it." },
    ],
  },

  /* the dark closing band: the final call and the pricing in one */
  enrol: {
    anchorId: "enrol",
    eyebrow: "enrol",
    h2Before: "Ready to start your",
    h2Accent: "cyber career",
    h2After: "?",
    sub: "Twenty-one modules, one payment, lifetime access. Everything you need to go from zero to job-ready.",
    pricing: {
      h3: "Everything, for one payment",
      sub: "All 21 modules, every lab, your portfolio and lifetime access. No subscription, ever.",
      once: "once",
      facts: [
        { k: "Access", v: "Lifetime" },
        { k: "Length", v: "21 modules" },
        { k: "Level", v: "Zero to hired" },
        { k: "Billing", v: "No subscription" },
      ],
    },
    action: {
      live: "course live",
      headlineActive: "The course is live. Buying opens any day now.",
      headlineInactive: "Opening very soon.",
      sub: "Leave your email and be first in line.",
    },
  },

  waitlist: {
    placeholder: "your@email.com",
    inputAriaLabel: "Email address for waitlist",
    button: "Notify me",
    buttonLoading: "Adding…",
    success: "You’re on the list. We’ll email you when it launches.",
    errorInvalid: "Please enter a valid email address.",
    errorServerFallback: "Something went wrong. Try again?",
    endpoint: "/api/waitlist",
    source: "enrol",
  },

  footer: {
    copyright: "© 2026 AlgorithmX",
    legal: "AlgorithmX Limited. Company 17266946, registered in England and Wales. Registered office: 301b Uppingham Road, Leicester LE5 4DG.",
    linksAriaLabel: "Footer",
    links: [
      { label: "Cyber Heroes", href: "/cyberheroes", current: false },
      { label: "Cyber Explorers", href: "/cyberexplorers", current: false },
      { label: "Cyber Ops", href: "/ops", current: false },
      { label: "Cyber Pro", href: "/pro", current: true },
      { label: "Terms", href: "/terms", current: false },
      { label: "Privacy", href: "/privacy", current: false },
    ],
  },
} as const;

/* Two-digit module number, "01" to "21". */
export const pad2 = (n: number) => String(n).padStart(2, "0");

/* The readout for a picked module (0-based index): its number, title, blurb,
 * its act and the act's label line, as the picker shows them. */
export function moduleReadout(i: number) {
  const m = MODULES[i];
  const a = ACTS[m.act];
  return {
    n: pad2(i + 1),
    title: m.title,
    blurb: m.blurb,
    act: a,
    actLabel: `ACT ${a.badge.slice(1)} · ${a.span.toUpperCase()}`,
  };
}

/* The portfolio pile: how deep document `doc` sits when piece `front` is on
 * top (0 is the front, total - 1 the back). */
export const stackDepth = (doc: number, front: number, total = 5) => (doc - front + total) % total;
