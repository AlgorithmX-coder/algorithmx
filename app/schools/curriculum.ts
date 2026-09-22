import type { Phase } from "./phases";

/**
 * Rows for the curriculum-map preview on /schools. Lesson titles are the
 * real Cyber Heroes week titles (weekContent/week{n}.ts) and the real
 * Cyber Explorers case topics (explorers/page.tsx TOPICS). Strands are the
 * eight UKCIS "Education for a Connected World" strands; the computing
 * column paraphrases the national curriculum programme of study. This is
 * the preview shown in the product frame, not the full mapping sheet.
 */
export type CurriculumRow = {
  lesson: string;
  title: string;
  strand: string;
  computing: string;
};

/**
 * One colour per "Education for a Connected World" strand, so the map's
 * left column can be read down at a glance: rows sharing a colour share a
 * strand. Every one of these clears 3:1 on the map's paper ground, which
 * is the bar for a graphical element rather than text.
 */
export const STRAND_COLOUR: Record<string, string> = {
  "Privacy and security": "#0a7085",
  "Online relationships": "#5744c9",
  "Managing online information": "#8a5400",
  "Online bullying": "#a5117f",
  "Health, wellbeing and lifestyle": "#0e7a45",
  "Online reputation": "#a63a08",
  "Self-image and identity": "#0a6675",
  "Copyright and ownership": "#5d6472",
};

export const CURRICULUM: Record<Phase, CurriculumRow[]> = {
  primary: [
    { lesson: "Week 1", title: "Passwords: The Secret Code", strand: "Privacy and security", computing: "Use technology safely; keep passwords private" },
    { lesson: "Week 2", title: "Private Info: Guard Your Secrets", strand: "Privacy and security", computing: "Keep personal information private" },
    { lesson: "Week 3", title: "Stranger Danger: Friend or Foe?", strand: "Online relationships", computing: "Identify where to go for help and support" },
    { lesson: "Week 4", title: "Scams and Tricks: Real or Fake?", strand: "Managing online information", computing: "Use technology safely and responsibly" },
    { lesson: "Week 5", title: "Cyberbullying: Words Have Power", strand: "Online bullying", computing: "Recognise acceptable and unacceptable behaviour" },
    { lesson: "Week 6", title: "Gaming Safety: Defend Your Game Zone", strand: "Health, wellbeing and lifestyle", computing: "Identify ways to report concerns about content and contact" },
  ],
  secondary: [
    { lesson: "Case 1", title: "Spot the fake message", strand: "Managing online information", computing: "Recognise inappropriate content, contact and conduct" },
    { lesson: "Case 2", title: "Too-good-to-be-true scams", strand: "Managing online information", computing: "Use technology safely and securely" },
    { lesson: "Case 3", title: "How passwords fall", strand: "Privacy and security", computing: "Protect their online identity and privacy" },
    { lesson: "Case 4", title: "Your public data trail", strand: "Online reputation", computing: "Protect their online identity and privacy" },
    { lesson: "Case 5", title: "Targeted attacks", strand: "Managing online information", computing: "Know how to report concerns" },
    { lesson: "Case 6", title: "Manipulation tactics", strand: "Online relationships", computing: "Recognise inappropriate contact and conduct" },
  ],
};
