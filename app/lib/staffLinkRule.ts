import { createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * The rules behind a school's one staff join link, with no database in them.
 *
 * Owner, 2026-11-26: the lead gets ONE link to forward to colleagues. Anyone
 * who opens it and signs in joins as a teacher. By default it only lets in
 * addresses at the school's own email domain, taken from the lead's address,
 * unless that address is at a free provider, where a domain lock would let in
 * everybody with an account there. The lead can switch the lock off.
 *
 * Kept here, apart from the queries, so a test can state each case plainly.
 */

/**
 * Free mail providers. A lead on one of these has no school domain to lock
 * the link to. Not exhaustive and does not need to be: a provider missing
 * from the list only means the lock is offered where it protects less, and
 * the lead can switch it off.
 */
export const FREE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  "gmail.com", "googlemail.com",
  "outlook.com", "outlook.co.uk", "hotmail.com", "hotmail.co.uk", "live.com", "live.co.uk", "msn.com",
  "yahoo.com", "yahoo.co.uk", "ymail.com", "rocketmail.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com", "aol.co.uk",
  "proton.me", "protonmail.com", "protonmail.ch", "pm.me",
  "gmx.com", "gmx.co.uk", "gmx.net", "mail.com", "zoho.com", "yandex.com", "tutanota.com", "fastmail.com",
  "btinternet.com", "sky.com", "virginmedia.com", "talktalk.net", "ntlworld.com", "blueyonder.co.uk",
]);

/** The part after the @, lowercased, or null if there is not one. */
export function emailDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const e = email.trim().toLowerCase();
  const at = e.lastIndexOf("@");
  if (at < 1) return null;
  const domain = e.slice(at + 1);
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain) ? domain : null;
}

/**
 * The domain a link should be locked to, from the lead's address. Null when
 * the address is at a free provider (or is not an address), which means the
 * link cannot be locked.
 */
export function schoolDomainFrom(leadEmail: string | null | undefined): string | null {
  const domain = emailDomain(leadEmail);
  if (!domain || FREE_EMAIL_DOMAINS.has(domain)) return null;
  return domain;
}

/**
 * May this address join through a link locked to `lockedTo`? An unlocked
 * link (null) lets anybody in. A locked one takes the domain itself or any
 * subdomain of it, because a school on `oakwood.sch.uk` often gives its
 * staff `staff.oakwood.sch.uk`. A look-alike such as `notoakwood.sch.uk`
 * does not match.
 */
export function domainAccepts(lockedTo: string | null | undefined, email: string | null | undefined): boolean {
  if (!lockedTo) return true;
  const domain = emailDomain(email);
  if (!domain) return false;
  const lock = lockedTo.toLowerCase();
  return domain === lock || domain.endsWith(`.${lock}`);
}

/** A fresh link token. 20 characters from an alphabet a person can read
 *  aloud, prefixed so it can never be mistaken for a per-email invite. */
export function newStaffLinkToken(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const b = randomBytes(20);
  let s = "";
  for (let i = 0; i < 20; i++) s += alphabet[b[i] % alphabet.length];
  return `staff-${s}`;
}

/**
 * Proof that a person can read mail at the address they signed up with.
 *
 * Accounts have no email verification, so without this a domain lock would
 * only stop honest mistakes: anybody holding the link could sign up as
 * `made.up@oakwood.sch.uk`. On a locked link the join therefore goes by
 * email. We send a signed link to the signed-in address and only that link
 * completes the join. The signature covers the link token, so making a new
 * link also kills every confirmation still sitting in an inbox.
 *
 * Shape: `<expiry ms>.<hex HMAC>`. Valid for a day.
 */
export const CONFIRM_TTL_MS = 24 * 60 * 60 * 1000;

function sign(secret: string, linkToken: string, userId: string, expires: number): string {
  return createHmac("sha256", secret).update(`staff-link:${linkToken}:${userId}:${expires}`).digest("hex");
}

export function makeJoinConfirm(secret: string, linkToken: string, userId: string, now = Date.now()): string {
  const expires = now + CONFIRM_TTL_MS;
  return `${expires}.${sign(secret, linkToken, userId, expires)}`;
}

export function checkJoinConfirm(
  secret: string,
  linkToken: string,
  userId: string,
  confirm: string | null | undefined,
  now = Date.now(),
): boolean {
  if (!secret || !confirm) return false;
  const m = /^(\d{10,16})\.([0-9a-f]{64})$/.exec(confirm);
  if (!m) return false;
  const expires = Number(m[1]);
  if (!Number.isFinite(expires) || expires < now) return false;
  const want = Buffer.from(sign(secret, linkToken, userId, expires), "hex");
  const got = Buffer.from(m[2], "hex");
  return want.length === got.length && timingSafeEqual(want, got);
}
