import type { LockupId } from "./CourseLockup";

/**
 * The two school phases the /schools page sells to. Everything phase-specific
 * (courses, accent, card art, which product screens the tabs show) hangs off
 * this so the page reads as ONE offer per visitor: pick primary or secondary
 * once and the rest of the page follows.
 */
export type Phase = "primary" | "secondary";

export type CourseLine = {
  lockup: LockupId;
  name: string;
  years: string;
  status: "Live" | "In development";
  note: string;
};

export type PhaseInfo = {
  label: string;
  years: string;
  ages: string;
  accent: string;
  /** Second colour for the phase's gradient glow. */
  accent2: string;
  headline: string;
  courses: CourseLine[];
  /** Full-bleed card art (owner taste: art fills the card, scrims keep copy readable). */
  art: { src: string; position: string; size: string; alt: string };
  /** Address shown in the fake browser bar of the product frame. */
  frameUrl: string;
};

export const PHASES: Record<Phase, PhaseInfo> = {
  primary: {
    label: "Primary",
    years: "Years 2 to 6",
    ages: "Ages 6 to 11",
    accent: "#ffb347",
    accent2: "#ff6fb1",
    headline: "Narrated lessons, so nobody needs to read to take part.",
    courses: [
      {
        lockup: "heroes",
        name: "Cyber Heroes",
        years: "Years 2 to 4",
        status: "Live",
        note: "20 animated lessons with Adam and Layla. Passwords, scams, kind messages and safe habits.",
      },
      {
        lockup: "explorers",
        name: "Cyber Explorers",
        years: "Years 5 to 6",
        status: "Live",
        note: "20 story missions with WREN, a voice-acted handler, for the years the first phone arrives.",
      },
    ],
    art: {
      src: "/characters/adam-layla-happy.png",
      position: "calc(100% + 230px) 22%",
      size: "auto 118%",
      alt: "Adam and Layla, the Cyber Heroes, holding glowing shields",
    },
    frameUrl: "algorithmx.io/lesson/1",
  },
  secondary: {
    label: "Secondary",
    years: "Years 7 to 13",
    ages: "Ages 11 to 18",
    accent: "#7df0ff",
    accent2: "#b98bff",
    headline: "Real scams, real judgement, in four different worlds.",
    courses: [
      {
        lockup: "explorers",
        name: "Cyber Explorers",
        years: "Years 7 to 9",
        status: "Live",
        note: "20 cases across a signal room, a phone, a control console and a war room. Every case ends in a must-pass test.",
      },
      {
        lockup: "ops",
        name: "Cyber Ops",
        years: "Years 10 to 13",
        status: "In development",
        note: "Hands-on defence in a sealed cyber range for the GCSE and A level years. Ask us about early access.",
      },
    ],
    art: {
      src: "/explorers/scenes/explorers-card-v3.jpg",
      position: "calc(100% + 520px) 45%",
      size: "auto 125%",
      alt: "A pupil at a glowing command desk in the ARC control room",
    },
    frameUrl: "algorithmx.io/explorers",
  },
};
