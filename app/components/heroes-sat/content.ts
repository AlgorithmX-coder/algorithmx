/* /cyberheroes copy and structure. Ported VERBATIM from the live page
 * (app/cyberheroes/page.tsx, MissionShowcase.tsx, CastRow.tsx) via the
 * landing-lab content file heroes-content.js, 2026-11-22. Every visible
 * string on the Saturday Morning page comes from here. Do not add copy. */

export const AXH = {
  nav: {
    ariaLabel: "Primary",
    logo: { href: "/", ariaLabel: "Cyber Heroes by AlgorithmX, home", byline: "by AlgorithmX" },
    links: [
      { id: "heroes", label: "Heroes" },
      { id: "curriculum", label: "Curriculum" },
      { id: "how", label: "How It Works" },
      { id: "unlock", label: "Pricing" },
    ],
    login: { label: "Log In", href: "/cyberheroes/login" },
    enrol: { label: "Enrol · £99", href: "/cyberheroes/signup" },
    burger: { ariaLabelClosed: "Menu", ariaLabelOpen: "Close menu" },
    mobileSheet: { ariaLabel: "Menu", login: "Log In", enrol: "Enrol Now · £99" },
  },

  hero: {
    badge: "Cybersecurity for Kids",
    h1Lead: "Turn Your Child Into a",
    h1Accent: "Cyber Hero",
    sub: "Join Adam and Layla on an interactive journey to become a Cyber Hero. Fun animated lessons, games, and challenges for ages 6-9.",
    /* The live page types this as one line: "20 weeks. 40+ missions. Lifetime
     * access, no subscriptions." The concept splits it at its full stops into
     * three stickers: same words, same order. */
    price: ["20 weeks.", "40+ missions.", "Lifetime access, no subscriptions."],
    trustLine: ["AlgorithmX certificates", "GDPR compliant"],
    ncsc: { text: "Aligned with UK’s National Cyber Security Centre", logo: "/logos/ncsc.svg", logoAlt: "National Cyber Security Centre" },
    honestLine: { check: "✓", text: "Built by parents, for parents. UK-based." },
    ctas: [
      { label: "Enrol Now · £99", href: "/cyberheroes/signup" },
      { label: "See How It Works", href: "#how" },
    ],
    counters: [
      { value: "20", label: "Weeks", tint: "#bfe6ff" },
      { value: "40+", label: "Missions", tint: "#cdf2c3" },
      { value: "4", label: "Certificates", tint: "#ffd9cd" },
      { value: "100%", label: "Hands-On", tint: "#ffd166" },
    ],
    video: {
      src: "/videos/cyberheroes-hero.mp4",
      poster: "/characters/heroic.png",
      playLabel: "Play video with sound",
    },
    motion: { pause: "Pause", play: "Play" },
  },

  characters: {
    h2Lead: "Meet the",
    h2Accent: "Characters",
    cast: [
      { name: "Adam", img: "/characters/cast-adam.webp", alt: "Adam, curious and brave Cyber Hero", blurb: "Curious and brave. A gamer who wants to keep his digital world safe.", tint: ["#bfe6ff", "#e6f5ff"], tilt: -2, villain: false },
      { name: "Layla", img: "/characters/cast-layla.webp", alt: "Layla, smart and fearless Cyber Hero", blurb: "Smart and fearless. She knows staying safe online is a superpower.", tint: ["#ffe6a3", "#fff3d6"], tilt: 1.2, villain: false },
      { name: "The Hacker Raccoon", img: "/characters/cast-raccoon.webp", alt: "The Hacker Raccoon, the villain", blurb: "Not just a cartoon villain. He runs the real attacks: phishing dressed up as game rewards, chat-room tricks, fake apps and password cracking. A new tactic every week, and your child learns to block every one.", tint: ["#ffd1c6", "#ffe9e2"], tilt: -1, villain: true },
    ],
  },

  weekSection: {
    h2Lead: "A Look",
    h2Accent: "Inside",
    sub: "Every week is its own story, with its own artwork and its own villain to outwit. Here are eight of the twenty.",
    /** The eight shown in full, in week order (MissionShowcase.FEATURED). */
    featured: [1, 3, 4, 6, 10, 11, 13, 19],
    eyebrow: (w: number) => `Week ${w}`,
    artAlt: (title: string) => `${title} mission artwork`,
    unlock: {
      headline: (locked: number) => `${locked} more weeks locked`,
      body: "Cyberbullying, in-game spending, fake apps, photo sharing, smart speakers, AI chatbots, social media and the final mission. Enrol once and your child keeps all twenty.",
      bullets: [
        "All 20 weeks, missions and boss battles",
        "4 milestone certificates",
        "Parent progress dashboard",
        "One-time payment, no subscriptions",
      ],
      cta: { label: "Enrol Now to Unlock · £99", arrow: "→", href: "/cyberheroes/signup" },
    },
  },

  /* The full 20-week curriculum. Titles and descriptions as on the live page
   * (sourced from prisma/seed.ts). Art per week: weekArt.ts; accent: weekThemes.ts. */
  weeks: [
    { w: 1, title: "Passwords: The Secret Code", sub: "Why passwords matter and how to create super-strong ones." },
    { w: 2, title: "Private Info: Guard Your Secrets", sub: "What personal information is and why some things stay private." },
    { w: 3, title: "Stranger Danger: Friend or Foe?", sub: "Spot fake profiles and stay safe chatting to people online." },
    { w: 4, title: "Scams and Tricks: Real or Fake?", sub: "Spot scam messages, fake pop-ups and sneaky tricks." },
    { w: 5, title: "Cyberbullying: Words Have Power", sub: "How words can hurt online and what to do if it happens." },
    { w: 6, title: "Gaming Safety: Defend Your Game Zone", sub: "Stay safe in Roblox, Minecraft and Fortnite. Chat, reporting and blocking." },
    { w: 7, title: "In-Game Spending: The V-Bucks Trap", sub: "Loot boxes, Robux and V-Bucks, and why to ask a grown-up first." },
    { w: 8, title: "Photos & Videos: Think Before You Share", sub: "Why screenshots last forever and why consent matters." },
    { w: 9, title: "Apps & Downloads: Spot the Fakes", sub: "Spot fake apps, understand permissions and download safely." },
    { w: 10, title: "YouTube & Videos: Escape the Rabbit Hole", sub: "Stay safe watching videos and manage screen time." },
    { w: 11, title: "Something Wrong? Emergency Protocol", sub: "How to report, block and tell a trusted grown-up. It's never your fault." },
    { w: 12, title: "Digital Footprint: Tracks in the Snow", sub: "Everything you do online leaves a trail. Learn to be proud of yours." },
    { w: 13, title: "Screen Time: Balance Your Power", sub: "The right balance between time online, breaks, sleep and healthy habits." },
    { w: 14, title: "Smart Devices: Who's Listening?", sub: "What Alexa, Siri and smart devices hear, and how to protect your privacy." },
    { w: 15, title: "AI & Chatbots: Robot or Real?", sub: "ChatGPT and chatbots: what they know, and what never to share." },
    { w: 16, title: "QR Codes & Links: Don't Take the Bait", sub: "Check before you scan or click. Not every link is safe." },
    { w: 17, title: "Social Media: The Profile Shield", sub: "Stay safe on TikTok, Snapchat and Instagram: privacy and smart posting." },
    { w: 18, title: "Sharing Devices: Lock Before You Leave", sub: "Keep your stuff private on family tablets: logging out and boundaries." },
    { w: 19, title: "Protecting Family: Family Firewall", sub: "Become the family cyber expert and help everyone stay safe." },
    { w: 20, title: "Graduation Day: The Final Mission", sub: "The ultimate challenge. Earn your Cyber Hero certificate!" },
  ],

  why: {
    h2: "Why Cybersecurity Matters for Kids",
    p1: "Children are spending more time online than ever before - gaming, chatting, streaming, learning. But the internet wasn't designed with kids in mind. Cyberbullying, phishing scams, data harvesting, and predatory behaviour are real threats that most children have never been taught to recognise.",
    p2: "Schools barely scratch the surface. Parental controls can only do so much. The best protection you can give your child is the knowledge to protect themselves. That's exactly what Cyber Heroes Academy delivers - real cybersecurity skills, taught through the language kids understand best: adventure, play, and stories.",
  },

  howItWorks: {
    eyebrow: "HOW IT WORKS",
    h2Lead: "From zero to",
    h2Accent: "Cyber Hero",
    h2Tail: "in 20 weeks",
    steps: [
      { num: "1", title: "Enrol & Create Account", desc: "One-time payment of £99. Set up your child's profile and customise their avatar.", color: "#0f6fa8", dark: false },
      { num: "2", title: "Watch the Story", desc: "Each week opens with an animated chapter where Adam, Layla, and Robo discover a new cyber threat.", color: "#2f7d3a", dark: false },
      { num: "3", title: "Earn Badges & Level Up", desc: "Collect digital badges, unlock milestone certificates, and watch the Raccoon's power drain week by week.", color: "#ff7a59", dark: false },
      { num: "4", title: "Complete the Mission", desc: "Interactive simulations, drag-and-drop puzzles, and a boss battle finale against the Hacker Raccoon.", color: "#ffd166", dark: true },
    ],
  },

  stats: [
    { value: "20", label: "Weeks of Adventure" },
    { value: "100+", label: "Interactive Activities" },
    { value: "6-10", label: "Age Range" },
    { value: "100%", label: "Interactive" },
  ],

  devices: {
    eyebrow: "Anywhere · Anytime",
    h2Lead: "Works on",
    h2Accent: "Laptop & Tablet",
    sub: "Laptop and tablet. Same lesson, same progress, picked up anywhere - kids start in the morning on a tablet and finish on a laptop after school.",
    laptop: { image: "/characters/heroic.png", alt: "Cyber Heroes lesson on a laptop", caption: "▸ Boss Battle · Week 1" },
    tablet: { image: "/characters/adam-layla-hacked.png", alt: "Cyber Heroes lesson on a tablet", caption: "▸ Story · The Hack" },
    footline: "Progress, badges, and certificates sync automatically - your child picks up exactly where they left off.",
  },

  faq: {
    eyebrow: "COMMON QUESTIONS",
    h2: "Got questions?",
    items: [
      { q: "How long does it take?", a: "20 weeks, one 45-minute session per week. Children can go at their own pace. There's no pressure to keep to a schedule." },
      { q: "Can I see what my child is learning?", a: "Yes. The parent dashboard shows you which lessons they've completed, badges earned, time spent, and a snapshot of how they're progressing each week. You'll also receive a milestone certificate at the end of each module." },
      { q: "Is it accredited?", a: "Every Cyber Heroes journey ends with an AlgorithmX certificate: milestone certificates at weeks 5, 10 and 15, and the Certified Cyber Hero certificate when all 20 weeks are done. The lessons follow guidance from the UK's National Cyber Security Centre." },
      { q: "What devices does it work on?", a: "Modern browsers on desktop or laptop (Chrome, Safari, Firefox, Edge: last two major versions) and on tablets (iPad 6th gen+, Android 9+). For the boss-battle visuals we recommend a screen of at least 10 inches. Headphones are optional but help kids focus." },
      { q: "Do we get lifetime access?", a: "Yes. Your one-time purchase of £99 gives you lifetime access with continuous updates. As new threats emerge, we update the content so your child's knowledge stays current." },
      { q: "I have more than one child. Do I need to pay £99 each time?", a: "Yes, enrolment is per child at £99. There's no sibling discount. Each child gets their own dedicated account, progress tracking, badges, and milestone certificates, so they can each move at their own pace. It's a one-time payment per child with lifetime access; no subscriptions, no renewals." },
    ],
    toggleOpen: "−",
    toggleClosed: "+",
  },

  cta: {
    h2Lead: "Ready to Become a",
    h2Accent: "Cyber Hero",
    h2Tail: "?",
    sub: "Join families across the UK giving their children the online safety skills they'll carry for life.",
    button: { label: "Enrol Now · £99", href: "/cyberheroes/signup" },
    fine: "One-time payment · Instant access · Lifetime updates",
  },

  footer: {
    copyright: "© 2026 AlgorithmX. All rights reserved.",
    tagline: "Cybersecurity Education for Kids",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: "mailto:support@algorithmx.co.uk" },
    ],
  },
} as const;

export type Week = (typeof AXH.weeks)[number];
