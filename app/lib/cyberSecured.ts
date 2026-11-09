/* Cyber Secured: the one thing a firm buys. A seat is one person, and that
 * person may take every track below, in any order, whenever suits. There
 * is no certificate and no track waits on another (owner, 2026-11-09).
 *
 * Data only: no Prisma, so the portal, the invite emails and the claim all
 * read the same list. A track is real once its Product row exists; until
 * then the claim simply has nothing to enrol on for it, and enrolMissing
 * picks it up the next time the person opens the portal. */

export const CYBER_SECURED_NAME = "Cyber Secured";
export const CYBER_SECURED_BRAND = "CYBER SECURED";

export type SecuredTrackSlug = "ai-cleared" | "ai-fluent" | "cyber-awareness";

export interface SecuredTrack {
  slug: SecuredTrackSlug;
  name: string;
  /* Where the track is played. */
  base: string;
  /* One line for an invite: what it is and how long. */
  line: string;
  /* False until the track is built. A track that is not live is left out
   * of the emails, never promised. */
  live: boolean;
}

export const SECURED_TRACKS: readonly SecuredTrack[] = [
  { slug: "ai-cleared", name: "AI Cleared", base: "/ai-cleared", line: "using AI tools safely at work, about ninety minutes", live: true },
  { slug: "ai-fluent", name: "AI Fluent", base: "/ai-fluent", line: "getting real work out of them, about three hours", live: true },
  { slug: "cyber-awareness", name: "Cyber Awareness", base: "/cyber-awareness", line: "spotting the attacks aimed at staff, about two hours", live: true },
];

export const SECURED_TRACK_SLUGS: readonly SecuredTrackSlug[] = SECURED_TRACKS.map((t) => t.slug);

/* A firm's seats, one per person. Someone invited before Cyber Secured may
 * hold an old Cleared seat and an old Fluent seat; they are one person and
 * one seat of the licence, shown on whichever seat they claimed (else the
 * first they were sent). Claimed people first, in the order they claimed,
 * then the unclaimed in the order they were asked. Addresses are stored
 * lower-cased, so the email is the person. */
export function onePerPerson<T extends { email: string; claimedAt: Date | null; invitedAt: Date }>(seats: readonly T[]): T[] {
  const byEmail = new Map<string, T>();
  for (const s of [...seats].sort((a, b) => a.invitedAt.getTime() - b.invitedAt.getTime())) {
    const prev = byEmail.get(s.email);
    if (!prev || (!prev.claimedAt && s.claimedAt)) byEmail.set(s.email, s);
  }
  const at = (d: Date | null) => d?.getTime() ?? Infinity;
  return [...byEmail.values()].sort((a, b) => at(a.claimedAt) - at(b.claimedAt) || a.invitedAt.getTime() - b.invitedAt.getTime());
}

/* The live tracks as one phrase: "AI Cleared and AI Fluent". */
export function liveTrackNames(): string {
  const names = SECURED_TRACKS.filter((t) => t.live).map((t) => t.name);
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0] ?? "";
}
