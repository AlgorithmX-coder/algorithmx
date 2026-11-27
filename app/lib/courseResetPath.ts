/**
 * The page a password-reset email link opens.
 *
 * A request from a course's own forgot-password page carries that course's
 * catalog slug, so the learner lands back in the same course's Night
 * Console to choose the new password. The slug only ever picks one of these
 * fixed, same-origin paths (never a URL taken from the request); anything
 * else, including no course at all, gets the generic page as before. The
 * token, its hash, its expiry and the email itself are the same either way.
 *
 * Keep in step with COURSE_AUTH_CONTENT and SECURED_AUTH (app/components/course-auth/content.ts):
 * courseResetPath.test.ts checks every course auth pack has its entry here.
 */

export const GENERIC_RESET_PATH = "/reset-password";

const COURSE_RESET_PATH: Readonly<Record<string, string>> = {
  "cyber-heroes": "/cyberheroes/reset-password",
  cyberexplorers: "/cyberexplorers/reset-password",
  cyberstart: "/ops/reset-password",
  "cyberstart-pro": "/pro/reset-password",
  "desk-ready": "/desk-ready/reset-password",
  "ai-cleared": "/ai-cleared/reset-password",
  "ai-fluent": "/ai-fluent/reset-password",
  "cyber-awareness": "/cyber-awareness/reset-password",
  "cyber-secured": "/cyber-secured/reset-password",
};

export function resetPathFor(course: unknown): string {
  return typeof course === "string" && Object.prototype.hasOwnProperty.call(COURSE_RESET_PATH, course)
    ? COURSE_RESET_PATH[course]
    : GENERIC_RESET_PATH;
}
