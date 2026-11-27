import { randomBytes } from "crypto";

/* The rules of a firm's team join link, kept free of the database so they
 * can be tested on their own. The link itself, the claim and the emails
 * live in firmTeamLink.ts.
 *
 * One link per firm. The lead forwards it to their staff; each person who
 * opens it and signs in takes one seat, once. Who that person is comes
 * from the address on their account, so the same person opening the link
 * twice, or opening it after an invite was sent to them, never takes a
 * second seat. */

/* Addresses anyone can get. A lead on one of these has no firm domain to
 * lock the link to, so the lock starts off for them. A company domain
 * that merely starts with one of these words ("mail.kestrel.co.uk") is not
 * caught: the short list of webmail words only counts on a bare public
 * ending such as .com or .co.uk. */
const FREE_EXACT = new Set([
  "gmail.com",
  "googlemail.com",
  "proton.me",
  "pm.me",
  "protonmail.com",
  "protonmail.ch",
  "tutanota.com",
  "tuta.io",
  "fastmail.com",
  "hey.com",
  "btinternet.com",
  "btopenworld.com",
  "sky.com",
  "virginmedia.com",
  "ntlworld.com",
  "blueyonder.co.uk",
  "talktalk.net",
  "tiscali.co.uk",
  "plus.net",
  "mail.com",
  "email.com",
  "zoho.com",
  "yandex.com",
  "qq.com",
  "163.com",
]);
const FREE_WORDS = ["gmail", "googlemail", "outlook", "hotmail", "live", "msn", "yahoo", "ymail", "rocketmail", "icloud", "me", "mac", "aol", "proton", "protonmail", "gmx", "web", "yandex", "zoho", "mail"];
const PUBLIC_ENDINGS = ["com", "net", "org", "co.uk", "org.uk", "uk", "ie", "fr", "de", "es", "it", "nl", "be", "ch", "at", "dk", "se", "no", "fi", "pl", "pt", "ca", "us", "com.au", "co.nz", "co.za", "co.in", "in", "jp", "co.jp", "com.br", "com.mx", "ru", "me"];
const FREE_PATTERN = new RegExp(`^(?:${FREE_WORDS.join("|")})\.(?:${PUBLIC_ENDINGS.map((e) => e.replace(/\./g, "\.")).join("|")})$`);

/* The part after the @, lowercased, or "" when there is none. */
export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at < 0 ? "" : email.slice(at + 1).trim().toLowerCase();
}

export function isFreeEmailDomain(domain: string): boolean {
  const d = domain.trim().toLowerCase();
  return FREE_EXACT.has(d) || FREE_PATTERN.test(d);
}

/* The domain a new team link is locked to: the lead's own, unless it is a
 * free provider or not a real address, in which case the lock is off. */
export function defaultTeamDomain(leadEmail: string | null | undefined): string | null {
  const d = emailDomain(leadEmail ?? "");
  if (!d || !d.includes(".") || isFreeEmailDomain(d)) return null;
  return d;
}

/* Whether this address may use a link locked to `teamDomain`. A subdomain
 * counts ("uk.kestrel.com" under "kestrel.com"); a lookalike does not
 * ("notkestrel.com"). No lock lets everyone through. */
export function domainAllows(teamDomain: string | null, email: string): boolean {
  if (!teamDomain) return true;
  const d = emailDomain(email);
  const lock = teamDomain.toLowerCase();
  return d === lock || d.endsWith(`.${lock}`);
}

/* The same unambiguous alphabet as a Seat's invite token, twice as long:
 * a seat token goes to one inbox, this one is forwarded round a whole
 * firm, so it carries about 119 bits rather than 59. */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
export const TEAM_TOKEN_PREFIX = "team-";
export function newTeamToken(): string {
  const b = randomBytes(24);
  let s = "";
  for (let i = 0; i < 24; i++) s += ALPHABET[b[i] % ALPHABET.length];
  return `${TEAM_TOKEN_PREFIX}${s}`;
}

/* A seat at the firm that belongs to this person: sent to their address,
 * or claimed by their account. */
export interface TeamSeat {
  id: string;
  email: string;
  userId: string | null;
  claimedAt: Date | null;
  removedAt: Date | null;
}

export interface TeamJoinInput {
  revoked: boolean;
  seatsPurchased: number;
  /* People holding a seat now, removed ones not counted: the same number
   * the console shows as "used". */
  used: number;
  teamDomain: string | null;
  /* The signed-in person. */
  userId: string;
  email: string;
  /* This firm's seats for this person (by address or by account). */
  seats: TeamSeat[];
}

export type TeamJoinRefusal = "closed" | "removed" | "taken" | "wrong-domain" | "full";
export type TeamJoinDecision =
  | { ok: true; kind: "already-in"; seatId: string }
  | { ok: true; kind: "claim-invite"; seatId: string }
  | { ok: true; kind: "new-seat" }
  | { ok: false; reason: TeamJoinRefusal };

/**
 * What opening the team link does for this person. In order:
 *
 * - A closed firm hands out nothing.
 * - Someone already holding a seat here goes straight in, whatever the
 *   domain or the count: they are not taking anything new.
 * - Someone the lead removed stays removed. The link is shared round the
 *   firm, so letting it undo a removal would make removal meaningless; the
 *   lead can invite the address again, which clears it.
 * - An invite already sent to their address is the seat they take, so the
 *   link and the invite never add up to two seats. It is already counted,
 *   so neither the domain nor the count stops it.
 * - Otherwise a new seat: only at the firm's domain, and only while one
 *   is left.
 */
export function teamJoinDecision(input: TeamJoinInput): TeamJoinDecision {
  if (input.revoked) return { ok: false, reason: "closed" };
  const email = input.email.trim().toLowerCase();
  const mine = input.seats.filter((s) => s.userId === input.userId || s.email.trim().toLowerCase() === email);
  const active = mine.filter((s) => !s.removedAt);

  const held = active.find((s) => s.userId === input.userId && s.claimedAt);
  if (held) return { ok: true, kind: "already-in", seatId: held.id };
  if (!active.length && mine.length) return { ok: false, reason: "removed" };

  const invite = active.find((s) => !s.claimedAt && (!s.userId || s.userId === input.userId));
  if (invite) return { ok: true, kind: "claim-invite", seatId: invite.id };
  if (active.some((s) => s.userId && s.userId !== input.userId)) return { ok: false, reason: "taken" };

  if (!domainAllows(input.teamDomain, email)) return { ok: false, reason: "wrong-domain" };
  if (input.used >= input.seatsPurchased) return { ok: false, reason: "full" };
  return { ok: true, kind: "new-seat" };
}

/* "All 50 seats are taken." in the words the join page and the lead's
 * email both use. */
export function seatsTakenLine(seatsPurchased: number): string {
  if (seatsPurchased <= 0) return "There are no seats to give out yet.";
  if (seatsPurchased === 1) return "The one seat is taken.";
  return `All ${seatsPurchased} seats are taken.`;
}

/* Who to ask, in a sentence: the lead by name, or the firm's admin. */
export function askLine(leadName: string | null | undefined, what: string): string {
  const who = leadName?.trim() || "your firm's admin";
  return `Ask ${who} ${what}`;
}
