/* The password lab's maths and strings, moved verbatim from
 * CyberStartProLanding.tsx (the live page's crackEstimate). Pool sizes
 * 26/26/10/33, 1e10 guesses per second, the twenty-word wordlist, the eleven
 * verdicts and the three detail lines. Pure, so it can be unit-driven. */

import { PRO_GREEN, PRO_RED, PRO_YELLOW, PRO_ACCENT } from "./content";

const AMBER = PRO_ACCENT;

export const WORDLIST: ReadonlySet<string> = new Set([
  "password", "password1", "password123", "123456", "12345678", "123456789",
  "qwerty", "letmein", "welcome", "admin", "iloveyou", "111111", "abc123",
  "monkey", "dragon", "football", "sunshine", "princess", "qwerty123", "000000",
]);

export interface Crack { verdict: string; detail: string; colour: string; pct: number }

export function crackEstimate(pw: string): Crack {
  if (!pw) return { verdict: "Type a password above", detail: "and watch how long it would take to crack.", colour: "rgba(255,255,255,0.4)", pct: 0 };
  if (WORDLIST.has(pw.toLowerCase())) return { verdict: "Cracked instantly", detail: "It is on every attacker's wordlist. The length does not matter.", colour: PRO_RED, pct: 4 };

  const pool =
    (/[a-z]/.test(pw) ? 26 : 0) +
    (/[A-Z]/.test(pw) ? 26 : 0) +
    (/[0-9]/.test(pw) ? 10 : 0) +
    (/[^A-Za-z0-9]/.test(pw) ? 33 : 0);
  const rate = 1e10; // 10 billion guesses/sec, a realistic offline fast-hash rig
  const log10Guesses = pw.length * Math.log10(Math.max(pool, 1));
  const log10Seconds = log10Guesses - Math.log10(rate);
  const pct = Math.max(4, Math.min(100, Math.round((log10Guesses / 20) * 100)));

  const YEAR = 7.4;
  let verdict: string;
  let colour: string;
  if (log10Seconds < 0) { verdict = "Cracked instantly"; colour = PRO_RED; }
  else if (log10Seconds < 1.78) { verdict = "Cracked in seconds"; colour = PRO_RED; }
  else if (log10Seconds < 3.56) { verdict = "Cracked in minutes"; colour = AMBER; }
  else if (log10Seconds < 4.94) { verdict = "Cracked in hours"; colour = AMBER; }
  else if (log10Seconds < 6.5) { verdict = "Cracked in days"; colour = PRO_YELLOW; }
  else if (log10Seconds < YEAR) { verdict = "Holds for months"; colour = PRO_GREEN; }
  else if (log10Seconds < 9.5) { verdict = "Safe for years"; colour = PRO_GREEN; }
  else if (log10Seconds < 12.5) { verdict = "Safe for centuries"; colour = PRO_GREEN; }
  else { verdict = "Safe past the end of time"; colour = PRO_GREEN; }

  const detail =
    colour === PRO_RED ? "Short or simple. An attacker's laptop chews through this."
    : colour === AMBER || colour === PRO_YELLOW ? "Getting there. A little longer and it flips to safe."
    : "This is the whole trick: length beats cleverness. You will learn why.";
  return { verdict, detail, colour, pct };
}
