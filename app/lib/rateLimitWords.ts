/* What a person is told when they have been rate limited. No imports, so
 * client components can use the same words the server sends. */

export const TOO_MANY = "Too many attempts. Please wait a few minutes and try again.";
export const PUPIL_TOO_MANY = "Too many tries. Ask your teacher, or wait 15 minutes.";

/* The `code` NextAuth hands back from signIn() when a credentials
 * provider refused because of a limit (see app/lib/auth.ts). */
export const LOGIN_LIMITED_CODE = "rate_limited";
export const PUPIL_LOCKED_CODE = "too_many_tries";
