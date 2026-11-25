/* The /cyberexplorers copy, frozen. Every string here is verbatim from the
 * page this design replaces (CyberExplorersLanding.tsx + IntroVideo.tsx),
 * extracted 2026-11-22 into landing-lab/explorers-content.js (window.AXE)
 * and converted here. Same sections, same order. Nothing from the live
 * file's unmounted data (actors, beats, blocks, verbs, the mission demo) is
 * rendered, so none of it is here. En-dashes are the copy's own; there are
 * no em-dashes. */

export const AXE = {
  nav: {
    logo: { href: "/", ariaLabel: "Cyber Explorers by AlgorithmX, home", wordmark: "CYBER EXPLORERS", bylineBy: "BY", bylineBrand: "ALGORITHMX" },
    links: [
      { id: "course", label: "THE COURSE", href: "#course" },
      { id: "parents", label: "FOR PARENTS", href: "#parents" },
    ],
    login: { label: "LOG IN", href: "/cyberexplorers/login" },
    enrol: { label: "ENROLL · £99", href: "/cyberexplorers/signup" },
    menu: { open: "Open menu", close: "Close menu", ariaLabel: "Page" },
  },

  hero: {
    eyebrow: "AlgorithmX Cybersecurity · Ages 10–13",
    h1Line1: "Raise a",
    h1Line2: "cyber-smart kid.",
    sub: "Cyber Explorers teaches 10–13s to outsmart scams, deepfakes and hackers.",
    coversLabel: "Covers",
    covers: "Scams · Deepfakes · Passwords · Privacy · Social engineering",
    ncscPill: {
      text: "Aligned with UK’s National Cyber Security Centre",
      logo: { src: "/logos/ncsc.svg", alt: "National Cyber Security Centre" },
    },
    ctaPrimary: { label: "ENROLL NOW · £99", href: "/cyberexplorers/signup" },
    ctaSecondary: { label: "SEE WHAT’S INCLUDED ↓", href: "#course" },
    finePrint: "One payment. Lifetime access. Money-back guarantee: if it doesn’t land with your kid, you get it back.",
    ticks: ["ICO CHILDREN’S CODE–ALIGNED", "NO ADS, NO LOOT BOXES", "SESSIONS END ON PURPOSE"],
    video: {
      src: "/explorers/trailer-cyberexplorers.mp4",
      poster: "/explorers/trailer-poster.jpg",
      ariaLabel: "Cyber Explorers recruitment trailer",
      titlebar: { label: "RECRUITMENT", sub: "// ARC SECURE FEED", live: "LIVE" },
      replay: { label: "PLAY" },
    },
  },

  motionButton: { playing: "Pause animation", paused: "Play animation" },

  stats: [
    { to: "20", label: "MISSIONS" },
    { to: "6", label: "THREAT ACTORS" },
    { to: "4", label: "CLEARANCE LEVELS" },
    { to: "1", label: "OPERATIVE: YOURS" },
  ],

  problem: {
    eyebrow: "01 · Why this matters now",
    title: "The internet doesn't wait until they're ready.",
    sub: "Age 10 to 13 is when it all arrives at once: the phone, the accounts, the group chats. And the scams arrive with them.",
    cards: [
      { big: "56% → 83%", small: "Smartphone ownership jumps between ages 10 and 11, the single biggest change in a child's digital life. (Ofcom)" },
      { big: "3 in 4", small: "11–17s have already seen harmful content online. Most never tell anyone. (Ofcom)" },
      { big: "One voice note", small: "is all AI needs to fake a voice your child trusts. The tricks are getting better. Your child can too." },
    ],
    closer: "You can’t read over their shoulder anymore. The next best thing is a kid who doesn’t need you to.",
  },

  transformation: {
    eyebrow: "02 · The change you'll see",
    title: "Same kid. Different reflexes.",
    before: { eyebrow: "Before", quote: "“It said my account would be deleted in 24 hours… so I clicked it and typed my password.”" },
    after: { eyebrow: "After 20 missions", quote: "“Real companies don’t rush you. And that’s not even their domain. Screenshotted, reported, blocked.”" },
    closer: "That reflex is the product. The spy fiction below is just how we get a 12-year-old to practice it every week. Voluntarily.",
  },

  included: {
    id: "course",
    eyebrow: "03 · What your child gets",
    title: "Everything included. Nothing vague.",
    sub: "A spy thriller they choose to play, not a worksheet in a game costume: a calm handler on the radio, real cases on the desk, and the exact tricks the real internet runs. Here is what arrives the day you enroll.",
    cards: [
      { n: "20", t: "Story missions", d: "One complete case a week, 45–60 minutes, fully self-guided with save-and-resume." },
      { n: "7", t: "Real analyst skills", d: "Spotting scams, reading web addresses, verifying identities, building real defenses, taught by doing." },
      { n: "1", t: "Voice-acted mentor", d: "WREN, their handler, talks them through every mission like a colleague, never a lecture." },
      { n: "6", t: "Villains to unmask", d: "Each one is a real internet threat in a story costume: phishing, fake voices, data theft." },
      { n: "∞", t: "Progress you can check", d: "XP, clearance ranks, and quiz records: evidence of learning, visible any time." },
      { n: "£99", t: "Once. Lifetime access", d: "Every mission, every future update, no subscription, and a money-back guarantee." },
    ],
  },

  proof: {
    eyebrow: "Why trust us",
    title: "We already built this for the little ones.",
    body: "Cyber Explorers comes from the team behind Cyber Heroes, our cybersecurity course for ages 6–9, live today with all 20 weeks and 20 bespoke boss battles shipped. Same platform, same safety rules, built up for the next age. CyberFirst and ASDAN aligned; GDPR and ICO Children’s Code by design.",
    bodyBold: "Cyber Heroes",
    link: { label: "SEE CYBER HEROES (AGES 6–9) →", href: "/cyberheroes" },
  },

  parents: {
    id: "parents",
    eyebrow: "04 · What you get as a parent",
    title: "Visibility, safety, and a kid who talks about it.",
    sub: "Six commitments, built into the product's design, not promises on a page.",
    points: [
      { t: "Rewards certify learning, not screen time", d: "Every point maps to something demonstrated. No XP for logging in, watching, or grinding. And nothing is ever taken away." },
      { t: "Sessions end on purpose", d: "Each mission closes with a full stop: no autoplay, no \"one more,\" no countdown pressure. Designed to the ICO Children's Code, not around it." },
      { t: "No leaderboards, no comparison", d: "Progress is measured against the case, never against other kids. Personal bests and closed cases: that's the scoreboard." },
      { t: "Defense-first, by design", d: "Explorers anticipate and counter attacks. They never write or send one, not even as an exercise. Mission 01 opens with signing the ARC Code." },
      { t: "Every mission lands in real life", d: "Debriefs end with one concrete action for the week: check the sender, turn on two-factor, report and loop in an adult they trust." },
      { t: "Evidence you can see", d: "Checkpoints produce real records of what your child can do: calls made correctly, not minutes watched." },
    ],
  },

  faq: {
    eyebrow: "Questions",
    title: "Questions, answered.",
    items: [
      { q: "Is Cyber Explorers right for my child's age?", a: "It's built for ages 10–13, the years kids get their first phone, first accounts, and first group chats. The tone is a professional field unit that takes them seriously: no cartoons, no baby-talk, no horror." },
      { q: "Do they need to finish Cyber Heroes first?", a: "No. Explorers is fully standalone. If your child did Cyber Heroes (ages 6–9), Explorers is the natural graduation: same platform, entirely new world, deeper skills." },
      { q: "Is this teaching my kid to hack?", a: "It's teaching your kid to think like the person who stops the hack. Explorers analyze, anticipate, and counter attacks; they never create them. That line is hard-coded into the curriculum and the fiction: it's the first thing an operative signs." },
      { q: "How much time does it take?", a: "One mission a week, 45–60 minutes, with save-and-resume at any point. The course is 20 missions across four clearance blocks." },
      { q: "What does it run on?", a: "Any modern browser: laptop, desktop, or tablet. Nothing to install." },
      { q: "My kid says they already know about scams.", a: "Most kids can recite 'don't click suspicious links.' Very few can tell you WHY gamehub.support-verify.net isn't GameHub, or what a pressure deadline is doing to their brain. Explorers teaches the mechanism, not the slogan. And kids who 'already know' tend to be the ones who love it most, because it finally treats them as capable." },
      { q: "How much does it cost?", a: "£99, once. That's all 20 missions, lifetime access, and every future update. No subscription, no in-app purchases, nothing sold to your child, ever." },
      { q: "What if my child loses interest?", a: "Every mission is a complete case with a real ending, built for 45–60 minutes: no cliffhanger traps, no daily-streak guilt. And enrollment comes with a simple money-back guarantee: if it doesn't land with your kid, you get your money back." },
    ],
  },

  cta: {
    eyebrow: "Simple pricing",
    title: "One price. Lifetime access.",
    price: "£99",
    bullets: [
      "All 20 missions, every incident, the full dossier archive",
      "Lifetime access, including every future update to the course",
      "One payment. No subscription, no in-app purchases, ever",
      "Money-back guarantee if it doesn't land with your kid",
    ],
    primary: { label: "ENROLL NOW · £99", href: "/cyberexplorers/signup" },
    secondary: { label: "ALREADY ENROLLED? LOG IN", href: "/cyberexplorers/login" },
  },

  footer: {
    /* the year is new Date().getFullYear() on the live page; kept dynamic */
    copyrightPrefix: "© ",
    copyrightSuffix: " ALGORITHMX · CYBER EXPLORERS",
    legal: "AlgorithmX Limited. Company 17266946, registered in England and Wales. Registered office: 301b Uppingham Road, Leicester LE5 4DG.",
    ariaLabel: "Footer",
    links: [
      { label: "PRIVACY", href: "/privacy" },
      { label: "TERMS", href: "/terms" },
      { label: "CONTACT", href: "mailto:support@algorithmx.co.uk" },
    ],
  },
} as const;
