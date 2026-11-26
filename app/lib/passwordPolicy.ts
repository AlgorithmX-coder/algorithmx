/* The one password rule, for every place a password is set: signup, the
 * reset link, and anything added later. No imports, so the forms can show
 * the same checks the server enforces.
 *
 * Signup asked for eight characters, a capital and a special character,
 * while the reset link only asked for eight, so a reset could swap a strong
 * password for "password". Both now read from here. */

export const PASSWORD_MIN = 8;
/** bcrypt only reads the first 72 bytes; far past that is a mistake or abuse. */
export const PASSWORD_MAX = 128;

export interface PasswordRules {
  length: boolean;
  upper: boolean;
  special: boolean;
}

export function passwordRules(password: string): PasswordRules {
  return {
    length: password.length >= PASSWORD_MIN,
    upper: /[A-Z]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

/** What is wrong with a password, in words a person can act on, or null. */
export function passwordProblem(password: unknown): string | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN) {
    return `Password must be at least ${PASSWORD_MIN} characters`;
  }
  if (password.length > PASSWORD_MAX) return `Password must be at most ${PASSWORD_MAX} characters`;
  const r = passwordRules(password);
  if (!r.upper) return "Password must include a capital letter";
  if (!r.special) return "Password must include a special character (e.g. ! @ # ?)";
  return null;
}
