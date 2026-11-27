/**
 * The daylight door (landing lab round 8, r8-door.html, owner 2026-11-26):
 * the words on the course side of the AI Cleared, AI Fluent and Cyber
 * Awareness sign-in, sign-up, forgot-password and reset-password pages.
 * The form side keeps the live words (COURSE_AUTH_CONTENT, SHARED, FLOW);
 * only the panel beside it is new, and these are its words, as the owner
 * approved them in the lab.
 */

import type { CourseAuthKey } from "./content";

/** The courses that open on the daylight door instead of the Night Console. */
export const DOOR_COURSES = ["cleared", "fluent", "awareness"] as const;
export type DoorCourse = (typeof DOOR_COURSES)[number];

export function isDoorCourse(course: CourseAuthKey): course is DoorCourse {
  return (DOOR_COURSES as readonly string[]).includes(course);
}

export interface DoorSide {
  /** The lockup and title, split into the plain word and the accented one. */
  word: [string, string];
  /** The eyebrow pill above the title. */
  who: string;
  /** One line under the title. */
  tag: string;
  /** Three facts: the figure, then what it counts. */
  facts: readonly [string, string][];
  /** The small caption in the corner of the animated motif, when it has one. */
  caption?: string;
}

export const DOOR_SIDE: Record<DoorCourse, DoorSide> = {
  cleared: {
    word: ["AI", "Cleared"],
    who: "For individuals",
    tag: "Learn the rules for AI at work and practise them in a live sandbox.",
    facts: [["5", "modules"], ["90 min", "start to finish"], ["Live", "practice sandbox"]],
    caption: "What is safe to paste",
  },
  fluent: {
    word: ["AI", "Fluent"],
    who: "For individuals",
    tag: "Get real work done with AI, one short module at a time.",
    facts: [["9", "modules"], ["3 hours", "start to finish"], ["Saved", "prompt playbook"]],
    caption: "Prompt, check, improve",
  },
  awareness: {
    word: ["Cyber", "Awareness"],
    who: "For individuals",
    tag: "Spot the scam before it lands. Short modules, real examples.",
    facts: [["8", "modules"], ["2 hours", "start to finish"], ["Real", "attack examples"]],
  },
};

/** The price panel under the facts. The figure itself comes from individualCoursePrice.ts. */
export const DOOR_PRICE = {
  lead: "One payment, the whole course.",
  rest: "VAT included. Pay by card after you create your account.",
} as const;

/** The two tabs above the form, and the trust line under it. */
export const DOOR_UI = {
  tabsAria: "Account",
  tabLogin: "Sign in",
  tabSignup: "Create account",
  trust: ["Encrypted", "UK hosted", "One account, one course"],
  pauseAria: "Pause motion",
  playAria: "Play motion",
} as const;

/** Every door: the three courses, plus the Cyber Secured firm door. */
export type DoorKey = DoorCourse | "secured";

/* The firm door (r8-door.html?c=secured): one seat, three courses, sign in
 * only, no price. The tracks are the lab's words; the module counts match
 * the course manifests. */
export const SECURED_SIDE = {
  word: ["Cyber", "Secured"] as [string, string],
  who: "For firms",
  tag: "One sign-in for your firm. Your seat opens all three courses.",
  tracks: [
    { key: "cleared", name: "AI Cleared", line: "The rules for AI at work, practised in a sandbox", count: "5 modules", rgb: "10,112,133" },
    { key: "fluent", name: "AI Fluent", line: "Real work done with AI, start to finish", count: "9 modules", rgb: "87,68,201" },
    { key: "awareness", name: "Cyber Awareness", line: "Spot the attacks aimed at staff", count: "8 modules", rgb: "165,17,127" },
  ] as const,
  note: "Take them in any order. Your firm's admin sees which modules you have finished, never your practice chats.",
} as const;

/** The firm door's own words on the form side and around it. */
export const SECURED_FORM = {
  emailLabel: "Work email",
  emailPlaceholder: "you@yourfirm.co.uk",
  invited: "Been invited? Open the link in your invite email first.",
  buyLead: "Buying for your firm?",
  buyLink: "See Cyber Secured",
  buyHref: "/corporate/buy",
  back: "AlgorithmX for firms",
  trust: ["Encrypted", "UK hosted", "Practice chats never stored"],
} as const;
