/* The locked 16-module curriculum as pure data (no component imports), so server
 * components like the portfolio can render the full course map without pulling in
 * the client module graph. Titles mirror the CourseContent rows / design spine
 * section 8. Phase grouping matches the CourseIntro. */

export type Phase = "Foundations" | "Web Exploitation" | "Data & Systems" | "Role Flip" | "Capstone";

export type CurriculumEntry = { no: number; title: string; phase: Phase };

export const CURRICULUM: CurriculumEntry[] = [
  { no: 1, title: "Rules of Engagement", phase: "Foundations" },
  { no: 2, title: "Reconnaissance & OSINT", phase: "Foundations" },
  { no: 3, title: "The Web Surface", phase: "Foundations" },
  { no: 4, title: "Broken Authentication", phase: "Web Exploitation" },
  { no: 5, title: "Injection", phase: "Web Exploitation" },
  { no: 6, title: "Cross-Site Scripting", phase: "Web Exploitation" },
  { no: 7, title: "Broken Access Control", phase: "Web Exploitation" },
  { no: 8, title: "Cryptography", phase: "Data & Systems" },
  { no: 9, title: "Passwords & Hashes", phase: "Data & Systems" },
  { no: 10, title: "Network Recon", phase: "Data & Systems" },
  { no: 11, title: "Digital Forensics", phase: "Data & Systems" },
  { no: 12, title: "Incident Response", phase: "Role Flip" },
  { no: 13, title: "Social Engineering Defence", phase: "Role Flip" },
  { no: 14, title: "Disclosure & Reporting", phase: "Role Flip" },
  { no: 15, title: "Full Engagement, Part 1", phase: "Capstone" },
  { no: 16, title: "Full Engagement, Part 2", phase: "Capstone" },
];

export const PHASE_ORDER: Phase[] = ["Foundations", "Web Exploitation", "Data & Systems", "Role Flip", "Capstone"];
