/* The /cyberexplorers copy for the "Field Unit" page (landing lab round 9,
 * r9-explorers.html, owner 27 Nov: "push it live"). This is the live copy,
 * shortened in the design; the strings are the design's. No em-dashes, no
 * emoji. The Children's Code lines and the NCSC badge are left out on
 * purpose (owner ruling: that claim waits until it is true).
 *
 * The price and the Enroll target come from the consumer catalogue so this
 * page can never disagree with checkout. The footer strings are the live
 * footer's, unchanged (#1154). */

import { consumerCourse, enrolHref, formatPence } from "@/app/lib/consumerCatalogue";

const PENCE = consumerCourse("cyberexplorers")?.pence ?? 9900;
/** "£99", from the catalogue. */
export const PRICE = formatPence(PENCE);
/** "99", the figure for the big price (the £ is set as a superscript). */
export const PRICE_FIGURE = PRICE.replace(/^£/, "");
/** Every Enroll button: sign-up until checkout opens, then the buy page. */
export const ENROL = enrolHref("cyberexplorers");
export const LOGIN = "/cyberexplorers/login";

export const CX = {
  nav: {
    home: { href: "/", ariaLabel: "Cyber Explorers by AlgorithmX, home" },
    /* the live lockup's stacked byline (the logo never changes) */
    bylineBy: "BY",
    bylineBrand: "ALGORITHMX",
    links: [
      { label: "The course", href: "#course" },
      { label: "For parents", href: "#parents" },
      { label: "Log in", href: LOGIN },
    ],
    enrol: `Enroll · ${PRICE}`,
  },

  hero: {
    tagline: "Ages 10 to 13 · ARC field unit",
    h1: "Raise a",
    h1Em: "cyber-smart kid.",
    lead: "Cyber Explorers teaches 10 to 13s to outsmart scams, deepfakes and hackers.",
    topics: ["Scams", "Deepfakes", "Passwords", "Privacy", "Social engineering"],
    primary: `Enroll now · ${PRICE}`,
    secondary: { label: "See what's included", href: "#course" },
    ticks: ["One payment, lifetime access", "No ads, no loot boxes", "Sessions end on purpose"],
    screen: { live: "Incoming transmission", net: "ARC secure net", play: "Play the trailer" },
    video: {
      src: "/explorers/trailer-cyberexplorers.mp4",
      poster: "/explorers/trailer-poster.jpg",
      ariaLabel: "Cyber Explorers recruitment trailer",
    },
    wanted: [
      { slug: "phantom-hook", name: "Phantom Hook", r: "-5deg" },
      { slug: "mimic", name: "Mimic", r: "2deg" },
      { slug: "skeleton-key", name: "Skeleton Key", r: "6deg" },
    ],
    wantedTag: "Wanted",
  },

  stats: [
    { n: 20, label: "Missions" },
    { n: 6, label: "Threat actors" },
    { n: 4, label: "Clearance levels" },
    { n: 1, label: "Operative: yours" },
  ],

  why: {
    tagline: "01 · Why this matters now",
    h2: "The internet doesn't wait",
    h2Em: "until they're ready.",
    sub: "Age 10 to 13 is when it all arrives at once: the phone, the accounts, the group chats. And the scams arrive with them.",
    cards: [
      { label: "Phones", a: "56% ", mid: "→", b: " 83%", p: "Smartphone ownership jumps between ages 10 and 11. (Ofcom)" },
      { label: "Harmful content", a: "3 ", mid: "in", b: " 4", p: "11 to 17s have already seen harmful content online. Most never tell anyone. (Ofcom)" },
      { label: "Deepfakes", a: "One ", mid: "voice note", b: "", p: "is all AI needs to fake a voice your child trusts." },
    ],
  },

  demo: {
    tagline: "02 · The change you'll see",
    h2: "Same kid.",
    h2Em: "Different reflexes.",
    evidence: "Evidence 01",
    instruction: "Tap the 3 tells",
    sender: "GameHub Rewards",
    fakeButton: "Verify my account",
    before: { label: "Before", quote: `"It said my account would be deleted in 24 hours, so I clicked it and typed my password."` },
    after: { label: "After 20 missions", quote: `"Real companies don't rush you. And that's not even their domain. Screenshotted, reported, blocked."` },
    show: "Show me the tells",
    reset: "Reset",
    note: "This is how a 12-year-old practises it, every week.",
  },

  course: {
    id: "course",
    tagline: "03 · What your child gets",
    h2: "Everything included.",
    h2Em: "Nothing vague.",
    sub: "A spy thriller they choose to play. Six villains to unmask, each one a real internet threat in a story costume.",
    actors: [
      { slug: "phantom-hook", name: "PHANTOM HOOK", line: "Urgent fakes dressed as companies you trust. Wants the click before the thought." },
      { slug: "mimic", name: "MIMIC", line: "Voices you trust. Faces you know. Neither is real." },
      { slug: "skeleton-key", name: "SKELETON KEY", line: "Ten thousand guesses a second. And one weak password." },
      { slug: "siren", name: "SIREN", line: "Prizes, flattery, urgency. Whatever gets a yes." },
      { slug: "ghostwriter", name: "GHOSTWRITER", line: "Machine-written lures, fluent in your favourite games." },
      { slug: "packrat", name: "PACKRAT", line: "Hoards every detail you overshare. Spends it later." },
    ],
    filePrefix: "FILE",
    reelLabel: "Scenes from the 20 missions",
    reel: [
      { n: "01", label: "Mission 01" },
      { n: "03", label: "Mission 03" },
      { n: "05", label: "Mission 05" },
      { n: "08", label: "Mission 08" },
      { n: "12", label: "Mission 12" },
      { n: "16", label: "Mission 16" },
      { n: "20", label: "The finale" },
    ],
    kit: [
      { n: "20", t: "Story missions", p: "One complete case a week, 45 to 60 minutes, save and resume.", verbs: [] },
      { n: "7", t: "Real analyst skills", p: "", verbs: ["INSPECT", "TRACE", "DECIDE", "BUILD", "PROFILE", "CIPHER", "SIMULATE"] },
      { n: "1", t: "Voice-acted mentor", p: "WREN, their handler, talks them through every mission.", verbs: [] },
      { n: "∞", t: "Progress you can check", p: "XP, clearance ranks and quiz records, visible any time.", verbs: [] },
    ],
  },

  trust: {
    label: "Why trust us",
    h3: "We already built this for the little ones.",
    p: "From the team behind Cyber Heroes, our course for ages 6 to 9. Same platform, same safety rules, built up for the next age.",
    img: { src: "/cyberheroes/characters/adam-layla-duo.png", alt: "Adam and Layla from Cyber Heroes", width: 900, height: 604 },
    link: { label: "See Cyber Heroes", href: "/cyberheroes" },
  },

  parents: {
    id: "parents",
    tagline: "04 · What you get as a parent",
    h2: "Visibility, safety, and",
    h2Em: "a kid who talks about it.",
    pledges: [
      { icon: "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z", t: "Rewards certify learning, not screen time", p: "No XP for logging in or grinding. Nothing is ever taken away." },
      { icon: "M6 5h4v14H6z M14 5h4v14h-4z", t: "Sessions end on purpose", p: `No autoplay, no "one more", no countdown pressure.` },
      { icon: "M4 20V10 M10 20V4 M16 20v-7 M3 20h18", t: "No leaderboards, no comparison", p: "Progress is measured against the case, never other kids." },
      { icon: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5z", t: "Defence-first, by design", p: "They counter attacks. They never write or send one." },
      { icon: "M4 11l8-7 8 7v9h-5v-6H9v6H4z", t: "Every mission lands in real life", p: "Each debrief ends with one action for the week." },
      { icon: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 100 6 3 3 0 000-6z", t: "Evidence you can see", p: "Real records of what your child can do, not minutes watched." },
    ],
  },

  faq: {
    tagline: "Questions",
    h2: "Questions, answered.",
    items: [
      { q: "Is Cyber Explorers right for my child's age?", a: "It's built for ages 10 to 13, the years kids get their first phone, first accounts and first group chats. The tone is a professional field unit that takes them seriously: no cartoons, no baby-talk, no horror." },
      { q: "Do they need to finish Cyber Heroes first?", a: "No. Explorers is fully standalone. If your child did Cyber Heroes (ages 6 to 9), Explorers is the natural graduation: same platform, entirely new world, deeper skills." },
      { q: "Is this teaching my kid to hack?", a: "It's teaching your kid to think like the person who stops the hack. Explorers analyse, anticipate and counter attacks; they never create them." },
      { q: "How much time does it take?", a: "One mission a week, 45 to 60 minutes, with save-and-resume at any point. The course is 20 missions across four clearance blocks." },
      { q: "What does it run on?", a: "Any modern browser: laptop, desktop or tablet. Nothing to install." },
      { q: "My kid says they already know about scams.", a: `Most kids can recite "don't click suspicious links". Very few can tell you why gamehub.support-verify.net isn't GameHub. Explorers teaches the mechanism, not the slogan.` },
      { q: "How much does it cost?", a: `${PRICE}, once. That's all 20 missions, lifetime access and every future update. No subscription, no in-app purchases, nothing sold to your child, ever.` },
      { q: "What if my child loses interest?", a: "Every mission is a complete case with a real ending: no cliffhanger traps, no daily-streak guilt. A child who takes a break picks up exactly where they left off." },
    ],
  },

  price: {
    once: "Once. Lifetime access.",
    h2: "One price. Lifetime access.",
    bullets: [
      "All 20 missions, every incident, the full dossier archive",
      "Every future update to the course",
      "No subscription, no in-app purchases, ever",
      "Any modern browser, nothing to install",
    ],
    primary: `Enroll now · ${PRICE}`,
    login: "Already enrolled? Log in",
    ladderLabel: "Clearance levels your child earns",
    ladder: ["Trainee", "Confidential", "Secret", "Top secret", "Ultra"],
  },

  /* The live footer, word for word (#1154); only its look changes. */
  footer: {
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

  motion: { pause: "Pause motion", play: "Play motion" },
} as const;
