/**
 * Static badge catalogue + shared types.
 *
 * Mirror of stickers-data.ts: lives outside badges.actions.ts because
 * Next.js 16 forbids any non-async export from a `"use server"` file.
 * One badge per week; the `id` is `week-N` so it lines up exactly with
 * progression.ts WEEK_BADGES, the client `earnBadge("week-N")` calls,
 * and the `badgeIds` in getProgressionSnapshot. Names track WEEK_BADGES;
 * icons are the trophy-room presentation (week 1 matches the in-lesson
 * badgeIcon "🔐").
 */

export interface BadgeCatalogueItem {
  week: number;
  id: string;
  name: string;
  icon: string;
}

export interface EarnedBadgeDTO {
  week: number;
  id: string;
  name: string;
  icon: string;
  earnedAt: Date;
}

export const BADGE_CATALOGUE: readonly BadgeCatalogueItem[] = [
  { week: 1, id: "week-1", name: "Password Protector", icon: "🔐" },
  { week: 2, id: "week-2", name: "Privacy Guardian", icon: "🛡️" },
  { week: 3, id: "week-3", name: "Stranger Danger Shield", icon: "🚸" },
  { week: 4, id: "week-4", name: "Phishing Hunter", icon: "🎣" },
  { week: 5, id: "week-5", name: "Scam Spotter", icon: "🕵️" },
  { week: 6, id: "week-6", name: "Footprint Tracker", icon: "👣" },
  { week: 7, id: "week-7", name: "Two-Factor Champion", icon: "🔑" },
  { week: 8, id: "week-8", name: "Link Inspector", icon: "🔗" },
  { week: 9, id: "week-9", name: "Cyberbully Blocker", icon: "🚫" },
  { week: 10, id: "week-10", name: "Screen Time Master", icon: "⏰" },
  { week: 11, id: "week-11", name: "Wi-Fi Warrior", icon: "📶" },
  { week: 12, id: "week-12", name: "App Permission Pro", icon: "⚙️" },
  { week: 13, id: "week-13", name: "Safe Search Sleuth", icon: "🔍" },
  { week: 14, id: "week-14", name: "Malware Manager", icon: "🦠" },
  { week: 15, id: "week-15", name: "Identity Defender", icon: "🪪" },
  { week: 16, id: "week-16", name: "Backup Boss", icon: "💾" },
  { week: 17, id: "week-17", name: "Update Ninja", icon: "🥷" },
  { week: 18, id: "week-18", name: "Social Savvy", icon: "💬" },
  { week: 19, id: "week-19", name: "Digital Citizen", icon: "🌐" },
  { week: 20, id: "week-20", name: "Cyber Hero Graduate", icon: "🎓" },
];
