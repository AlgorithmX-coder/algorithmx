/**
 * Landing-v2 shared data. Mirrors the data shapes from app/page.tsx
 * (the live homepage) so /landing-v2 has the same content and structure.
 * Restyled visuals are layered on top in the section components.
 */

export type AgeGroup = "6-10" | "11-14" | "15-17" | "18+";

export interface Course {
  title: string;
  ageRange: string;
  ageGroup: AgeGroup;
  desc: string;
  duration: string;
  price: string;
  live: boolean;
  coming?: string;
  image: string;
  href: string;
  extra?: string;
}

export interface Subject {
  id: string;
  title: string;
  iconName: "shield" | "gamepad" | "brain" | "phone" | "rocket" | "cpu";
  ages: string;
  status: string;
  /* Tailwind-style hex accent for this subject - drives chip tints */
  accent: string;
  courses: Course[];
}

/* TRUST_STRIP deleted 2026-07-17: it was dead code containing
 * accreditation overclaims ("CyberFirst Aligned", "ASDAN Accredited")
 * that directly contradicted the honest "working toward" framing in
 * STEPS below — a loaded gun for any future import. Recreate only with
 * claims that are true at the time. */

/* Subject palette - mapped to landing-v2 brand tokens so they harmonise
 * with the cinematic above. */
const SUBJ_CYAN = "#00f5ff";
const SUBJ_VIOLET = "#a667ff";
const SUBJ_GOLD = "#ffc94a";
const SUBJ_AMBER = "#ff7a3d";
const SUBJ_LIME = "#5fffa3";
const SUBJ_MAGENTA = "#ff3ad6";

export const SUBJECTS: Subject[] = [
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    iconName: "shield",
    accent: SUBJ_CYAN,
    ages: "Ages 6 to Adult",
    status: "AVAILABLE NOW",
    courses: [
      {
        title: "Cyber Heroes Academy",
        ageRange: "Ages 6-9",
        ageGroup: "6-10",
        desc: "Join Adam, Layla, and Robo on animated adventures to learn online safety. Story-driven missions make cybersecurity feel like a game.",
        duration: "20 weeks · 45 min/week",
        price: "£99 · Lifetime Access",
        live: true,
        image: "/images/courses/cyberheroes.png",
        href: "/cyberheroes",
      },
      {
        title: "Cyber Explorers",
        ageRange: "Ages 10-13",
        ageGroup: "11-14",
        desc: "A spy thriller they play for real. 20 voice-acted story missions against the STATIC network — phishing, fake voices, and data tricks.",
        duration: "20 missions · 60 min/week",
        price: "£99 · Lifetime Access",
        live: true,
        image: "/images/courses/cyber-explorers.png",
        href: "/cyberexplorers",
      },
      {
        title: "Cyber Ops",
        ageRange: "Ages 14-17",
        ageGroup: "15-17",
        desc: "Get recruited as a junior security operator. Break into real targets, defend against real attacks, and leave with a portfolio that gets you noticed.",
        duration: "16 weeks · 90 min/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2026",
        image: "/images/courses/cyberstart.png",
        href: "/ops",
      },
      {
        title: "Cyber Pro",
        ageRange: "Ages 18+",
        ageGroup: "18+",
        desc: "Industry-standard security operations, compliance frameworks, and career preparation. Get certified and get hired.",
        duration: "20 weeks · 2 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/cyberstart-pro.png",
        href: "/pro",
      },
    ],
  },
  {
    id: "game-dev",
    title: "Game Development",
    iconName: "gamepad",
    accent: SUBJ_LIME,
    ages: "Ages 8 to Adult",
    status: "COMING 2026",
    courses: [
      {
        title: "Game Starters",
        ageRange: "Ages 8-10",
        ageGroup: "6-10",
        desc: "Build your first games with Scratch! Drag, drop, and watch your creations come to life.",
        duration: "10 weeks · 45 min/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2026",
        image: "/images/courses/gamestarters.png",
        href: "#",
      },
      {
        title: "Game Builders",
        ageRange: "Ages 11-14",
        ageGroup: "11-14",
        desc: "Level up to Unity and Roblox Studio. Design real mechanics, characters, and worlds.",
        duration: "14 weeks · 1 hr/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2026",
        image: "/images/courses/gamebuilders.png",
        href: "#",
      },
      {
        title: "Game Engineers",
        ageRange: "Ages 15+",
        ageGroup: "15-17",
        desc: "Unreal Engine, C#, physics systems, and publishing. Ship a real game to a real audience.",
        duration: "18 weeks · 1.5 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2026",
        image: "/images/courses/gameengineers.png",
        href: "#",
      },
    ],
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    iconName: "brain",
    accent: SUBJ_VIOLET,
    ages: "Ages 10 to Adult",
    status: "COMING 2026",
    courses: [
      {
        title: "AI Discoverers",
        ageRange: "Ages 10-13",
        ageGroup: "11-14",
        desc: "Play with AI! Train your first models, chat with AI safely, and explore the ethics of intelligent machines.",
        duration: "10 weeks · 1 hr/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2026",
        image: "/images/courses/aidiscoverers.png",
        href: "#",
      },
      {
        title: "AI Builders",
        ageRange: "Ages 14-16",
        ageGroup: "15-17",
        desc: "Python, TensorFlow, image recognition, and NLP. Build real machine learning models from scratch.",
        duration: "14 weeks · 1.5 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2026",
        image: "/images/courses/aibuilders.png",
        href: "#",
      },
      {
        title: "AI Engineers",
        ageRange: "Ages 17+",
        ageGroup: "18+",
        desc: "Neural networks, deep learning, responsible AI, and deployment. University-level AI skills for your career.",
        duration: "18 weeks · 2 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2026",
        image: "/images/courses/aiengineers.png",
        href: "#",
      },
    ],
  },
  {
    id: "app-dev",
    title: "App Development",
    iconName: "phone",
    accent: SUBJ_AMBER,
    ages: "Ages 10 to Adult",
    status: "COMING 2027",
    courses: [
      {
        title: "App Starters",
        ageRange: "Ages 10-13",
        ageGroup: "11-14",
        desc: "Design your dream app. No-code tools, wireframes, and UX thinking. Bring your ideas to life.",
        duration: "10 weeks · 1 hr/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/appstarters.png",
        href: "#",
      },
      {
        title: "App Developers",
        ageRange: "Ages 14-16",
        ageGroup: "15-17",
        desc: "React Native, real mobile apps, from idea to working prototype, right on your phone.",
        duration: "14 weeks · 1.5 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/appdevelopers.png",
        href: "#",
      },
      {
        title: "Full-Stack Developers",
        ageRange: "Ages 17+",
        ageGroup: "18+",
        desc: "React, Node.js, databases, APIs, CI/CD. Ship production applications and land developer roles.",
        duration: "18 weeks · 2 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/fullstackdeveloper.jpeg",
        href: "#",
      },
    ],
  },
  {
    id: "entrepreneurship",
    title: "Tech Entrepreneurship",
    iconName: "rocket",
    accent: SUBJ_GOLD,
    ages: "Ages 14 to Adult",
    status: "COMING 2027",
    courses: [
      {
        title: "Startup Foundations",
        ageRange: "Ages 14-16",
        ageGroup: "15-17",
        desc: "Turn your ideas into products. Lean startup, customer discovery, and your first pitch deck.",
        duration: "12 weeks · 1 hr/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/startupfoundations.png",
        href: "#",
      },
      {
        title: "Venture Builder",
        ageRange: "Ages 17+",
        ageGroup: "18+",
        desc: "Financial modelling, fundraising, go-to-market strategy. Build and launch a real tech company.",
        duration: "16 weeks · 1.5 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/venturestarter.png",
        href: "#",
      },
    ],
  },
  {
    id: "robotics",
    title: "Robotic Engineering",
    iconName: "cpu",
    accent: SUBJ_MAGENTA,
    ages: "Ages 8 to Adult",
    status: "COMING 2027",
    courses: [
      {
        title: "Robot Explorers",
        ageRange: "Ages 8-10",
        ageGroup: "6-10",
        desc: "Build your first robot with Lego Mindstorms! Sensors, motors, and programming through play.",
        duration: "10 weeks · 1 hr/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/robot-explorers.svg",
        href: "#",
      },
      {
        title: "Robot Builders",
        ageRange: "Ages 11-14",
        ageGroup: "11-14",
        desc: "Arduino, breadboards, sensors, and circuit design. Program real hardware.",
        duration: "14 weeks · 1.5 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/robot-builders.svg",
        href: "#",
      },
      {
        title: "Robot Engineers",
        ageRange: "Ages 15+",
        ageGroup: "15-17",
        desc: "ROS, computer vision, autonomous systems. Engineering-grade robotics.",
        duration: "18 weeks · 2 hrs/week",
        price: "£99 · Lifetime Access",
        live: false,
        coming: "COMING 2027",
        image: "/images/courses/robot-engineers.svg",
        href: "#",
        extra: "UK Only · Kit Included",
      },
    ],
  },
];

export const STEPS = [
  { n: 1, title: "Choose a Subject", desc: "Browse six technology streams", accent: SUBJ_CYAN },
  { n: 2, title: "Pick Your Level", desc: "Find the right course for your age", accent: SUBJ_LIME },
  { n: 3, title: "Enrol", desc: "One-time payment, instant access", accent: SUBJ_AMBER },
  { n: 4, title: "Learn & Build", desc: "Interactive lessons with real projects", accent: SUBJ_GOLD },
  /* Honest qualification framing: AlgorithmX is *working toward* the
   * CyberFirst (NCSC) and ASDAN recognition routes, not yet awarded.
   * The copy stays truthful pre-accreditation and avoids the
   * "X accredited" overclaim — update the wording the moment a
   * route is confirmed. */
  { n: 5, title: "Earn a Qualification", desc: "Working toward CyberFirst & ASDAN recognition", accent: SUBJ_VIOLET },
];

/* TESTIMONIALS removed 2026-07-17 (honesty pass): the entries were
 * placeholder personas, not collected reviews — publishing invented
 * consumer reviews is a banned practice under the UK DMCC Act 2024.
 * When real, consented, dated testimonials exist, reintroduce the
 * interface + array and restore the marquee in Testimonials.tsx. */

/* Technology logos for the homepage marquee — the tools the curriculum
 * teaches with (framed factually in Testimonials.tsx, NOT as
 * endorsements; institutional marks like NCSC / King's Trust / CompTIA
 * were removed for exactly that reason). Simple Icons SVGs with the
 * official brand colors baked into each file (Microsoft split into its
 * four squares). */
export const TRUST_LOGOS = [
  { name: "Microsoft", src: "/logos/brands/microsoft.svg" },
  { name: "Google", src: "/logos/brands/google.svg" },
  { name: "Apple", src: "/logos/brands/apple.svg" },
  { name: "Amazon Web Services", src: "/logos/brands/amazonwebservices.svg" },
  { name: "NVIDIA", src: "/logos/brands/nvidia.svg" },
  { name: "IBM", src: "/logos/brands/ibm.svg" },
  { name: "Cisco", src: "/logos/brands/cisco.svg" },
  { name: "Oracle", src: "/logos/brands/oracle.svg" },
  { name: "Intel", src: "/logos/brands/intel.svg" },
  { name: "Meta", src: "/logos/brands/meta.svg" },
  { name: "Unity", src: "/logos/brands/unity.svg" },
  { name: "Raspberry Pi", src: "/logos/brands/raspberrypi.svg" },
];

/* SVG icon paths (subset shared with the homepage). */
export const ICON_PATHS: Record<string, string> = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  gamepad: "M6 12h4M8 10v4M15 11h.01M18 13h.01",
  brain:
    "M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7zM9 22h6",
  phone: "M12 18h.01",
  rocket:
    "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z",
  cpu: "M9 9h6M9 13h6",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M12 5l7 7-7 7",
  chevron: "M6 9l6 6 6-6",
  quote:
    "M3 21c3 0 7-1 7-8V5H5v8c0 3-2 3-2 3zM17 21c3 0 7-1 7-8V5h-5v8c0 3-2 3-2 3z",
};
export const ICON_RECTS: Record<
  string,
  [number, number, number, number, number]
> = {
  gamepad: [2, 6, 20, 12, 2],
  cpu: [6, 4, 12, 16, 1],
  phone: [5, 2, 14, 20, 2],
};
