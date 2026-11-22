/* The /schools copy, frozen and verbatim, in page order. Converted from the
 * landing lab's schools-content.js, which was extracted from the live page
 * on 2026-11-21 (SchoolsLanding.tsx, ProductTabs.tsx, EnquiryForm.tsx,
 * ProofBand.tsx, Nav.tsx, Footer.tsx, SchoolsGlobe.tsx). Every string a
 * visitor reads on the Hologram Campus page comes from here, from
 * app/schools/phases.ts (the phase cards), app/schools/productData.ts (the
 * six screens and the teacher mock) or app/schools/curriculum.ts (the map).
 * No em-dashes, no emoji, no new words. */

export const AXS = {
  backdrop: {
    label: { head: "UNITED KINGDOM", lead: "SOURCE", brand: "ALGORITHMX" },
    cities: ["DUBAI", "ABU DHABI", "DOHA", "RIYADH", "CAIRO", "NAIROBI", "LAGOS", "CAPE TOWN", "MADRID", "GENEVA", "MUMBAI", "BANGKOK", "SINGAPORE", "KUALA LUMPUR", "HONG KONG", "SHANGHAI", "TOKYO", "SYDNEY", "AUCKLAND", "TORONTO", "NEW YORK"],
    motionButton: { paused: "Play animation", playing: "Pause animation" },
  },

  nav: {
    centre: { ariaLabel: "On this page" },
    aside: { label: "School login", href: "/schools/login" },
    cta: { label: "Get in touch", href: "#enquiry" },
    items: [
      { id: "phase", label: "Your phase" },
      { id: "product", label: "The screens" },
      { id: "how", label: "Set-up" },
      { id: "classroom", label: "Classroom" },
      { id: "receive", label: "What you get" },
      { id: "questions", label: "Questions" },
    ],
  },

  hero: {
    backLink: { label: "Back to home", href: "/" },
    eyebrow: "// British curriculum · Schools worldwide",
    headlineLead: "Cybersecurity lessons your pupils ",
    headlineAccent: "teach themselves.",
    sub: "Cyber Heroes for primary. Cyber Explorers and Cyber Ops for secondary. Pupils work on their own on the school’s computers, one 50-minute lesson a week. Teachers see everything and prepare nothing.",
    ctas: [
      { label: "Register your interest", href: "#enquiry", style: "primary" },
      { label: "Explore the curriculum", href: "#product", style: "ghost" },
    ],
    trust: [
      "Cyber skills that outpace the newest attacks",
      "One platform, ages 6 to 18+",
      "Certified and curriculum mapped",
    ],
  },

  proof: {
    eyebrow: "// Accredited, certified and backed",
    marks: [
      { name: "Cyber Essentials certified", copy: "The UK government backed standard for cyber security practice.", src: "/logos/cyber-essentials.png", alt: "Cyber Essentials", width: 96, plate: "light" },
      { name: "Aligned with the NCSC", copy: "Course content follows National Cyber Security Centre guidance.", src: "/logos/ncsc.svg", alt: "National Cyber Security Centre", width: 132, plate: "dark" },
      { name: "Collaborating with Microsoft", copy: "AlgorithmX is part of the Microsoft for Startups programme.", src: "/logos/microsoft-for-startups.webp", alt: "Microsoft for Startups", width: 140, plate: "light" },
      { name: "ASDAN accredited courses", copy: "Courses carry accreditation that schools already recognise.", src: "/logos/asdan.jpg", alt: "ASDAN", width: 96, plate: "light" },
    ],
  },

  reach: {
    eyebrow: "// One build, every time zone",
    headline: "Teach it in London. Teach it worldwide.",
    headlineGradientSpan: "Teach it worldwide.",
    sub: "Built to the British curriculum and taught far beyond Britain. One build serves every site from the edge, so the same week, the same safeguarding and the same teacher dashboard open in a browser tab wherever your classroom is.",
  },

  phase: {
    eyebrow: "// Step one · Pick your phase",
    headline: "Which school are you?",
    headlineGradientSpan: "school",
    sub: "Choose once. Every screen and example on this page follows.",
    radiogroupAriaLabel: "School phase",
    selectLabel: { selected: "✓ Selected", unselected: "Select" },
    /* the picture-window crop per phase (the art itself is in phases.ts) */
    artPosition: { primary: "58% 14%", secondary: "76% 40%" } as Record<"primary" | "secondary", string>,
  },

  product: {
    eyebrow: "// Inside the platform · ",
    headline: "See the learning platform, not a brochure.",
    headlineGradientSpan: "not a brochure.",
    sub: "Four screens captured straight from the live product, as a pupil sees it, and two showing what teachers get. Pick a step, or open any screen full size.",
    tablistAriaLabel: "Product screens",
    frame: {
      urlForMocks: "algorithmx.io/schools/teacher",
      pilotChip: "Pilot preview",
      fullSizeButton: "Full size",
      openFullSizeAriaPrefix: "Open full size: ",
      navAriaLabel: "Step through the screens",
      prev: { glyph: "‹", ariaLabel: "Previous screen" },
      next: { glyph: "›", ariaLabel: "Next screen" },
      lightbox: { closeGlyph: "×", closeAriaLabel: "Close" },
    },
    teacherMock: {
      brand: "ALGORITHMX",
      sidebar: ["My classes", "Reports", "Login cards", "Curriculum"],
      sidebarActive: "My classes",
      schoolLabel: "School",
      lockButton: "Lock screens",
      stats: ["Finished", "In progress", "Not started"],
      missedEyebrow: "Most missed question",
      missedTail: "got it wrong",
      missedButton: "Replay this on the board",
    },
    curriculumMock: {
      title: "Curriculum map",
      downloadButton: "Download PDF",
      columns: ["Lesson", "Education for a Connected World", "Computing"],
      eyebrow: { primary: "Cyber Heroes · Lessons 1 to 6", secondary: "Cyber Explorers · Cases 1 to 6" } as Record<"primary" | "secondary", string>,
      coverageLead: "Covers ",
      coverageTail: " of the 8 Education for a Connected World strands",
    },
  },

  howItWorks: {
    eyebrow: "// Running in your school within a week",
    headline: "Four steps. Half of them are ours.",
    headlineGradientSpan: "Half of them are ours.",
    steps: [
      { n: "01", colour: "#0a7085", title: "We create your licence", text: "We set up the school licence and your teacher logins. There is nothing to install: it runs in the browser your school already has." },
      { n: "02", colour: "#5744c9", title: "You build your classes", text: "Make a class, add your pupils by first name, and assign the course that class will take. Pupils sign in with a class code and a picture password." },
      { n: "03", colour: "#0e7a45", title: "Run the lessons", text: "Twenty weeks of lessons, one a week, about 50 minutes each. That leaves time either side to log in and log out inside a one-hour slot. Progress saves on every screen, so each pupil picks up exactly where they left off." },
      { n: "04", colour: "#8a5400", title: "Get the class report", text: "A detailed breakdown of the class and feedback on every pupil: who finished, what they found hard, and a certificate each to take home." },
    ],
  },

  classroom: {
    eyebrow: "// Built for a room of thirty",
    headline: "Independent by design. Safe by default.",
    headlineGradientSpan: "Safe by default.",
    sub: "Thirty pupils, one adult, fifty minutes. Every part of the platform is built around that room.",
    pillars: [
      { title: "Independent by design", accent: "#0a7085", icon: "headphones", points: ["Every instruction is spoken and captioned", "Pupils resume from the exact screen they left", "Wrong answers get a reason and another go", "Zero lesson prep. Zero marking."] },
      { title: "Safe by default", accent: "#0e7a45", icon: "shield", points: ["Cyber Essentials certified, the NCSC-backed security standard", "A closed environment: pupils only ever interact with the lesson", "Pupil data is never sent to AI services", "First name, class and progress only, deleted whenever you ask"] },
      { title: "Matched to the curriculum", accent: "#8a5400", icon: "book", points: ["Education for a Connected World strands", "The computing programme of study", "Online safety within RSHE", "A mapping sheet for every lesson"] },
    ],
    marks: {
      label: "// One platform, three courses",
      courses: [
        { id: "heroes", ages: "Ages 6 to 9", accent: "#8a5400" },
        { id: "explorers", ages: "Ages 10 to 13", accent: "#0a6675" },
        { id: "ops", ages: "Ages 14 to 17", accent: "#5744c9" },
      ] as ReadonlyArray<{ id: "heroes" | "explorers" | "ops"; ages: string; accent: string }>,
      accreditation: { logo: "/logos/asdan.jpg", alt: "ASDAN", strong: "ASDAN", line: "Accreditation aligned" },
    },
  },

  receive: {
    eyebrow: "// What your school receives",
    headline: "Everything your school receives.",
    headlineGradientSpan: "school receives.",
    sub: "Please get in touch to find out about the onboarding process. We’ll take you from the first conversation to the first lesson.",
    items: [
      "A whole-school licence for your phase",
      "The teacher view for every class",
      "An end-of-course class report",
      "Certificates for every pupil",
      "The curriculum mapping sheet",
    ],
  },

  pilotOffer: {
    chip: "No cost",
    title: "See it with a real class first.",
    text: "Book a walkthrough and we will show you the lessons, the teacher view and the reporting, on your screen, with time for your questions.",
    points: [
      "A run through a real lesson, start to finish",
      "The teacher view and the class report",
      "Straight answers on data, set-up and cost",
    ],
    cta: { label: "Book a walkthrough", href: "#enquiry" },
  },

  faq: {
    eyebrow: "// Before you ask",
    headline: "Questions heads ask.",
    headlineGradientSpan: "heads ask.",
    items: [
      { q: "What do we need in the room?", a: "Any computer with a modern browser. Headphones help, and captions cover the rest. It runs entirely in the browser, so your network team has nothing to set up." },
      { q: "How long is a lesson?", a: "About 50 minutes, which fits an hour slot with time to log in and log out. Progress saves on every screen, so if the bell goes, the pupil picks up exactly where they left off next week." },
      { q: "Who teaches it?", a: "The class teacher, whatever their confidence with computing. The narrator carries every instruction, the games mark themselves, and the teacher view shows who needs a nudge." },
      { q: "What pupil data do you hold?", a: "First name, class and progress, and that is all. Pupil activity stays within the platform and is never sent to an AI service, and we delete a school's data in full whenever you ask." },
      { q: "Is it safe?", a: "Yes. AlgorithmX is Cyber Essentials certified, the NCSC-backed standard for defending against common cyber attacks. Pupils only ever interact with the lesson itself, inside a closed environment built for schools, and every reward is personal to the pupil." },
      { q: "How does a school get started?", a: "Get in touch and we'll walk you through the onboarding process: the agreement, your licence, building your classes and the first lesson. Most schools start with a walkthrough so they can see the lessons before they commit." },
    ],
  },

  enquiry: {
    eyebrow: "// Get in touch",
    headline: "Thinking of registering?",
    headlineGradientSpan: "registering?",
    sub: "We’ll explain the onboarding process, from the agreement to the first lesson, and reply within two working days. We bring the processing agreement and a data-protection summary to the first conversation so your DPO has what they need.",
    emailLine: { prefix: "Prefer email? ", link: "admissions@algorithmx.co.uk", href: "mailto:admissions@algorithmx.co.uk" },
    cardLine: { prefix: "Not a school? A club, charity or training provider can ", link: "buy places by card", href: "/organisations/buy", suffix: "." },
    formAriaLabel: "School enquiry form",
  },

  footer: {
    lede: "Cyber and AI skills for people, schools and firms.",
    columns: [
      {
        label: "Courses",
        links: [
          { name: "Cyber Heroes", href: "/cyberheroes" },
          { name: "Cyber Explorers", href: "/cyberexplorers" },
          { name: "Cyber Ops", href: "/ops" },
          { name: "Cyber Pro", href: "/pro" },
          { name: "Desk Ready", href: "/desk-ready" },
          { name: "AI at work", href: "/corporate" },
        ],
        note: "+ 5 more subjects in development",
      },
      {
        label: "Company",
        links: [
          { name: "For Schools", href: "/schools" },
          { name: "Corporate training", href: "/corporate" },
          { name: "Contact", href: "mailto:support@algorithmx.co.uk" },
        ],
        note: "",
      },
    ],
    bottom: {
      email: { label: "support@algorithmx.co.uk", href: "mailto:support@algorithmx.co.uk" },
      copyright: "© 2026 AlgorithmX Limited. Company 17266946, registered in England and Wales. Registered office: 301b Uppingham Road, Leicester LE5 4DG.",
    },
  },
} as const;

/* Splits a headline around its gradient span: [before, span, after]. */
export function splitHeadline(h: string, span: string): [string, string, string] {
  const i = h.indexOf(span);
  return i < 0 ? [h, "", ""] : [h.slice(0, i), span, h.slice(i + span.length)];
}
