/**
 * Cyber Explorers course content — the 20 cases as CourseContent rows
 * (one per "week", week = case number). Single source of truth, imported by
 * both prisma/seed.ts (dev) and scripts/seed-explorers-content.ts (the
 * idempotent, prod-safe upsert that never deletes — see that file's warning).
 *
 * Title + description mirror the mission board (app/explorers/page.tsx CASES).
 * The runtime never reads these; they exist so per-child Progress rows have a
 * CourseContent FK and the parent dashboard can label each case.
 */
export const EXPLORERS_CONTENT: { week: number; title: string; description: string }[] = [
  { week: 1, title: "Phishing", description: "Spot the fake message." },
  { week: 2, title: "Too Good To Be True", description: "Too-good-to-be-true scams and prize funnels." },
  { week: 3, title: "The Guessing Game", description: "How passwords really fall, and passphrases." },
  { week: 4, title: "The Puzzle You Posted", description: "Your public data trail and how crumbs combine." },
  { week: 5, title: "Signal Storm", description: "The same scam across every channel; spot the spear." },
  { week: 6, title: "Levers", description: "The six pressure levers, and naming them to beat them." },
  { week: 7, title: "Borrowed Faces", description: "Hijacked friend accounts; verify another way." },
  { week: 8, title: "The Perfect Message", description: "AI-written lures; verify by source, not style." },
  { week: 9, title: "The Long Game", description: "The slow con, and exiting without shame." },
  { week: 10, title: "The Voice", description: "Voice clones and the family code word." },
  { week: 11, title: "The Master Key", description: "Password managers and 2FA; lock every account." },
  { week: 12, title: "Unreadable", description: "Ciphers, the padlock, and public wi-fi." },
  { week: 13, title: "Backdoors", description: "Recovery is the back door; strong security answers." },
  { week: 14, title: "The Update Trap", description: "Permissions, updates, and fake installers." },
  { week: 15, title: "The Real Site", description: "The address bar is the only truth." },
  { week: 16, title: "The File On You", description: "The data economy; audit and cut down your trail." },
  { week: 17, title: "Ghost Stories", description: "Synthetic media and lateral reading." },
  { week: 18, title: "The Recruiter", description: "Ethics, dual-use, and your line." },
  { week: 19, title: "Static Rising", description: "Campaign anatomy, defence in depth, incident command." },
  { week: 20, title: "Signal Zero", description: "The capstone: unmask the coordinator, do it right." },
];
