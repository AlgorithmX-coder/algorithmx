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

/**
 * Where to get a milestone certificate.
 *
 * Takes NO name and NO date any more. Both used to be passed in the query
 * string and printed as given, which made the certificate a name-to-PDF
 * service rather than a record: any caller could mint one for any name at
 * any rank. The route reads all three out of the database now, and checks
 * the milestone was earned, so there is nothing left for a caller to say
 * except which milestone it is.
 *
 * childProfileId is only for a teacher printing one for a pupil. Left out,
 * the certificate is for the caller's own active child.
 */
export function getCertificateUrl(weekNumber: number, childProfileId?: string): string {
  const who = childProfileId ? `&childProfileId=${encodeURIComponent(childProfileId)}` : "";
  return `/api/certificate?week=${weekNumber}${who}`;
}

export function getAchievedMilestones(completedCount: number) {
  return MILESTONES.map((m) => ({
    ...m,
    achieved: completedCount >= m.week,
    progress: Math.min(100, Math.round((completedCount / m.week) * 100)),
    weeksRemaining: Math.max(0, m.week - completedCount),
  }));
}
