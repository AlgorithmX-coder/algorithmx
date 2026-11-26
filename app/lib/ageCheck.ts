/**
 * Age at sign-up, for the UK GDPR rule on children (Article 8 as applied by
 * the Data Protection Act 2018, s.9): a child under 13 can only use an
 * online service like ours with a parent's consent.
 *
 * Asked on the Cyber Explorers and Cyber Ops sign-ups, the two courses a
 * child may sign up to by themselves. Cyber Heroes is not here: its account
 * is the parent's own, and the children are profiles under it.
 *
 * Client-safe and dependency-free: the sign-up form and the signup route
 * run the same rule.
 */

/** The age under which a parent must say yes first. */
export const PARENT_CONSENT_AGE = 13;

/** Course slugs whose sign-up asks for a date of birth. */
export const ASKS_DATE_OF_BIRTH: readonly string[] = ["cyberexplorers", "cyberstart"];

export function asksDateOfBirth(courseSlug: string | null | undefined): boolean {
  return !!courseSlug && ASKS_DATE_OF_BIRTH.includes(courseSlug);
}

/**
 * A date of birth from a form's YYYY-MM-DD, or null when it is not a real
 * date, is in the future, or makes the person older than 120.
 */
export function parseDateOfBirth(raw: unknown, now: Date = new Date()): Date | null {
  if (typeof raw !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dob = new Date(Date.UTC(y, mo - 1, d));
  /* 2015-02-31 rolls over to March in Date; refuse it rather than guess. */
  if (dob.getUTCFullYear() !== y || dob.getUTCMonth() !== mo - 1 || dob.getUTCDate() !== d) return null;
  if (dob.getTime() > now.getTime()) return null;
  if (ageOn(dob, now) > 120) return null;
  return dob;
}

/** Whole years old on `now`, counted on calendar dates (UTC). */
export function ageOn(dob: Date, now: Date = new Date()): number {
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < dob.getUTCMonth() || (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate());
  if (beforeBirthday) age -= 1;
  return Math.max(0, age);
}

export function needsParentConsent(dob: Date, now: Date = new Date()): boolean {
  return ageOn(dob, now) < PARENT_CONSENT_AGE;
}

/** "p****@example.com": enough for a child to recognise the address. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.slice(0, 1)}${"*".repeat(Math.max(1, Math.min(4, local.length - 1)))}@${domain}`;
}

/** One @, something either side, a dot in the domain, no spaces. */
export function looksLikeEmail(raw: string): boolean {
  const e = raw.trim();
  const at = e.indexOf("@");
  if (at < 1 || at !== e.lastIndexOf("@") || e.includes(" ")) return false;
  const domain = e.slice(at + 1);
  const dot = domain.lastIndexOf(".");
  return dot > 0 && dot < domain.length - 1;
}
