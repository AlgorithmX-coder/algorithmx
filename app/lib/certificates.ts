export const MILESTONES = [
  {
    week: 5,
    title: "Cyber Cadet",
    icon: "🛡️",
    description:
      "Completed the first 5 missions and demonstrated foundational online safety awareness",
  },
  {
    week: 10,
    title: "Cyber Guardian",
    icon: "⚔️",
    description:
      "Reached the halfway mark with strong knowledge of digital threats and safe online behaviour",
  },
  {
    week: 15,
    title: "Cyber Defender",
    icon: "🏰",
    description:
      "Mastered 15 critical cybersecurity topics and can identify most online threats",
  },
  {
    week: 20,
    title: "Certified Cyber Hero",
    icon: "🎓",
    description:
      "Completed the entire Cyber Heroes Academy with comprehensive online safety knowledge",
  },
] as const;

export type Milestone = (typeof MILESTONES)[number];

export function getCertificateUrl(childName: string, weekNumber: number): string {
  const date = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `/api/certificate?childName=${encodeURIComponent(childName)}&weekNumber=${weekNumber}&completedDate=${encodeURIComponent(date)}`;
}

export function getAchievedMilestones(completedCount: number) {
  return MILESTONES.map((m) => ({
    ...m,
    achieved: completedCount >= m.week,
    progress: Math.min(100, Math.round((completedCount / m.week) * 100)),
    weeksRemaining: Math.max(0, m.week - completedCount),
  }));
}
