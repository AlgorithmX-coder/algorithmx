/**
 * The two school phases the /schools page sells to. Everything phase-specific
 * (courses, accent, which product screens the tabs show) hangs off this so
 * the page reads as ONE offer per visitor: pick primary or secondary once and
 * the rest of the page follows.
 */
export type Phase = "primary" | "secondary";

export type CourseLine = {
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
  headline: string;
  courses: CourseLine[];
  /** Address shown in the fake browser bar of the product frame. */
  frameUrl: string;
};

export const PHASES: Record<Phase, PhaseInfo> = {
  primary: {
    label: "Primary",
    years: "Years 2 to 6",
    ages: "Ages 6 to 11",
    accent: "#ffb347",
    headline: "Narrated lessons, so nobody needs to read to take part.",
    courses: [
      {
        name: "Cyber Heroes",
        years: "Years 2 to 4",
        status: "Live",
        note: "20 animated lessons with Adam and Layla. Passwords, scams, kind messages and safe habits, one idea per screen.",
      },
      {
        name: "Cyber Explorers",
        years: "Years 5 to 6",
        status: "Live",
        note: "20 story missions with WREN, a voice-acted handler. Built for the years the first phone and first group chat arrive.",
      },
    ],
    frameUrl: "algorithmx.io/lesson/3",
  },
  secondary: {
    label: "Secondary",
    years: "Years 7 to 13",
    ages: "Ages 11 to 18",
    accent: "#7df0ff",
    headline: "Real scams, real judgement, in four different worlds.",
    courses: [
      {
        name: "Cyber Explorers",
        years: "Years 7 to 9",
        status: "Live",
        note: "20 cases across a signal room, a phone, a control console and a war room. Every case ends in a must-pass test.",
      },
      {
        name: "Cyber Ops",
        years: "Years 10 to 13",
        status: "In development",
        note: "Hands-on defence in a sealed cyber range for the GCSE and A level years. Ask us about early access.",
      },
    ],
    frameUrl: "algorithmx.io/explorers",
  },
};
