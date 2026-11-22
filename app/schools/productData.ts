import type { Phase } from "./phases";

/**
 * The data behind the six product screens on /schools: the tab list, the
 * captures each tab shows per phase, and the numbers the built-in teacher
 * mock renders. One file, read by ProductTabs.tsx (the old landing) and by
 * the Hologram Campus page, so the two can never disagree about what the
 * product shows.
 */

/** Product frames live at /schools/<img>.webp (1000w) + /schools/<img>@2x.webp (2000w). */
export const shotSrc = (img: string) => `/schools/${img}.webp`;
export const shotSet = (img: string) => `/schools/${img}.webp 1000w, /schools/${img}@2x.webp 2000w`;
export const shotFull = (img: string) => `/schools/${img}@2x.webp`;

export type Shot = { img: string; caption: string };

export type Tab = {
  id: string;
  n: string;
  title: string;
  desc: string;
  kind: "shot" | "teacher" | "curriculum";
  shot?: Record<Phase, Shot>;
};

export const TABS: Tab[] = [
  {
    id: "learn",
    n: "01",
    title: "Students learn",
    desc: "Every idea is taught by doing, with a narrator and captions on screen, so every pupil can follow along.",
    kind: "shot",
    shot: {
      primary: { img: "heroes-learn", caption: "Password Hospital, Week 1. Diagnose a sick password, fix it, and watch the strength meter climb." },
      secondary: { img: "explorers-meter", caption: "Case 3, The Guessing Game. Drag the password length and watch the rig's clock jump from an instant to centuries." },
    },
  },
  {
    id: "play",
    n: "02",
    title: "Practise every module",
    desc: "A hands-on game for every idea. A wrong answer gets a spoken reason and another go.",
    kind: "shot",
    shot: {
      primary: { img: "heroes-play", caption: "Passphrase Forge, Week 1. Three random words make a password the Raccoon's machine can't crack." },
      secondary: { img: "explorers-phone", caption: "The Phone, Block 2. WREN briefs the pupil by text, then a scammer wearing a friend's account arrives." },
    },
  },
  {
    id: "prove",
    n: "03",
    title: "Test after every module",
    desc: "Every lesson ends in a boss battle or a must-pass test, so pupils prove what they have learned before they move on.",
    kind: "shot",
    shot: {
      primary: { img: "heroes-boss", caption: "The Week 1 boss: the Hacker Raccoon's Quiz Showdown." },
      secondary: { img: "explorers-boss", caption: "Case 2's boss, The Prize Factory. Three phases that reward thinking before acting." },
    },
  },
  {
    id: "progress",
    n: "04",
    title: "Track their own progress",
    desc: "Stickers, badges and personal bests that keep every pupil motivated from one week to the next.",
    kind: "shot",
    shot: {
      primary: { img: "heroes-reward", caption: "The Week 1 badge, Password Protector, on its way to the pupil's Cyber HQ." },
      secondary: { img: "explorers-map", caption: "The mission map. Every closed case earns a stamp, so pupils see their progress build across the course." },
    },
  },
  {
    id: "teacher",
    n: "05",
    title: "Teacher class review",
    desc: "Who has finished, who is stuck, and which question the class got wrong. Three answers on one screen.",
    kind: "teacher",
  },
  {
    id: "curriculum",
    n: "06",
    title: "The curriculum map",
    desc: "Every lesson mapped to Education for a Connected World and the computing programme of study.",
    kind: "curriculum",
  },
];

export const MOCK_CAPTION: Record<"teacher" | "curriculum", string> = {
  teacher: "Who has finished, who needs a nudge and what the class found hard, on one screen for the class teacher.",
  curriculum: "One row per lesson, so the computing lead can evidence coverage in minutes.",
};

/* The teacher mock (tab 05). The pupils' numbers drive the three counts and
   the bars; 100 renders as "Done", 0 as "Not started". */
export type TeacherMockData = {
  school: string;
  cls: string;
  course: string;
  unit: string;
  /** Owner: say where in the course this is. */
  unitN: number;
  unitOf: number;
  unitWord: "Week" | "Case";
  pupils: ReadonlyArray<readonly [string, number]>;
  missed: { q: string; n: number; why: string };
};

export const TEACHER_MOCK: Record<Phase, TeacherMockData> = {
  primary: {
    school: "St Mary's Primary",
    cls: "4 Oak",
    course: "Cyber Heroes",
    unit: "Week 3: Spot the Scam",
    unitN: 3,
    unitOf: 20,
    unitWord: "Week",
    pupils: [
      ["Amara", 100], ["Ben", 100], ["Chloe", 100], ["Dev", 72], ["Ella", 100],
      ["Farah", 40], ["George", 100], ["Hana", 88], ["Isaac", 100], ["Jo", 12],
    ],
    missed: { q: "Which message is the scam?", n: 6, why: "Most picked the one with the school logo. The tell was the link." },
  },
  secondary: {
    school: "Riverside Academy",
    cls: "8B",
    course: "Cyber Explorers",
    unit: "Case 2: Too Good To Be True",
    unitN: 2,
    unitOf: 20,
    unitWord: "Case",
    pupils: [
      ["Aisha", 100], ["Callum", 100], ["Daniel", 64], ["Esme", 100], ["Femi", 100],
      ["Grace", 28], ["Harry", 100], ["Imogen", 91], ["Jack", 100], ["Kai", 0],
    ],
    missed: { q: "Which address is the real shop?", n: 5, why: "Most trusted the display name. The tell was the domain." },
  },
};

export const pupilStatus = (pct: number) => (pct === 100 ? "Done" : pct === 0 ? "Not started" : `${pct}%`);
