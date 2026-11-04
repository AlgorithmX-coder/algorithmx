/* The pure part of trial-expiry logic - no Prisma, no server-only
 * imports, so it's safe from both server AND client components. Split
 * out of orgTrial.ts (which also holds grantTrial/clearTrial, both
 * Prisma-backed) specifically because a client component importing
 * trialStatus from the same file as grantTrial would pull the whole
 * Postgres driver into the browser bundle and break the build - that
 * is exactly what happened before this file existed. */

export type TrialStatus = "none" | "active" | "expired";

export function trialStatus(trialExpiresAt: Date | null): TrialStatus {
  if (!trialExpiresAt) return "none";
  return trialExpiresAt.getTime() > Date.now() ? "active" : "expired";
}
