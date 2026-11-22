/**
 * Course auth content: the words and routes behind the five course-themed
 * login and signup pages. Every string here is frozen copy (it was lifted
 * verbatim from the live pages on 2026-11-22 for the auth design lab and
 * ported back unchanged); the skins read it, they never add words.
 *
 * Route pages pass a course KEY (a string, server-component safe) and the
 * client-side skin looks its pack up here.
 */

export type CourseAuthKey = "cyberheroes" | "cyberexplorers" | "ops" | "pro" | "desk";

export interface CourseAuthCopy {
  /** Catalog slug, carried through the auth flow for the hub target. */
  slug: string;
  /** Landing base path; also where "Back to course" points. */
  base: string;
  courseName: string;
  copy: {
    loginTitle: string;
    loginSub: string;
    signupTitle: string;
    signupSub: string;
    registeredNotice: string;
    submitLogin: string;
    submitSignup: string;
  };
}

export const COURSE_AUTH_CONTENT: Record<CourseAuthKey, CourseAuthCopy> = {
  cyberheroes: {
    slug: "cyber-heroes",
    base: "/cyberheroes",
    courseName: "Cyber Heroes",
    copy: {
      loginTitle: "Welcome back!",
      loginSub: "Log in to continue the adventure with Adam and Layla.",
      signupTitle: "Join Cyber Heroes",
      signupSub: "Create the family account that powers your child's missions.",
      registeredNotice: "Account created! Log in to start the adventure.",
      submitLogin: "Log in",
      submitSignup: "Create account",
    },
  },
  cyberexplorers: {
    slug: "cyberexplorers",
    base: "/cyberexplorers",
    courseName: "Cyber Explorers",
    copy: {
      loginTitle: "AGENT SIGN-IN",
      loginSub: "Re-establish your secure link to ARC.",
      signupTitle: "NEW AGENT INTAKE",
      signupSub: "Create your credentials. ARC is watching the watchers.",
      registeredNotice: "Credentials issued. Sign in to go operational.",
      submitLogin: "Establish link",
      submitSignup: "Issue credentials",
    },
  },
  ops: {
    slug: "cyberstart",
    base: "/ops",
    courseName: "Cyber Ops",
    copy: {
      loginTitle: "OPERATOR SIGN-IN",
      loginSub: "Reconnect to the range. Your engagements are waiting.",
      signupTitle: "ENLIST",
      signupSub: "Create your operator account and step onto the range.",
      registeredNotice: "Operator account created. Sign in to deploy.",
      submitLogin: "Connect",
      submitSignup: "Enlist",
    },
  },
  pro: {
    slug: "cyberstart-pro",
    base: "/pro",
    courseName: "Cyber Pro",
    copy: {
      loginTitle: "Sign in",
      loginSub: "Pick up your modules where you left off, on any device.",
      signupTitle: "Create your account",
      signupSub: "21 modules of career-grade cyber. Your progress follows you.",
      registeredNotice: "Account created. Sign in to open your modules.",
      submitLogin: "Sign in",
      submitSignup: "Create account",
    },
  },
  desk: {
    slug: "desk-ready",
    base: "/desk-ready",
    courseName: "Desk Ready",
    copy: {
      loginTitle: "Welcome back",
      loginSub: "Sign in and pick up where you left off.",
      signupTitle: "Create your account",
      signupSub: "The fundamentals every desk job runs on, one short lesson at a time.",
      registeredNotice: "Account created. Sign in to start your first lesson.",
      submitLogin: "Sign in",
      submitSignup: "Create account",
    },
  },
};

/* The strings every course shares: labels, placeholders, the toggle, the
 * forgot row, the switch lines, the busy label and the client error text.
 * Same words on all five courses. */
export const SHARED = {
  labels: { name: "Your name", email: "Email", password: "Password", confirm: "Confirm password" },
  placeholders: {
    name: "Your full name",
    email: "you@example.com",
    passwordLogin: "Enter your password",
    passwordSignup: "Create a strong password",
    confirm: "Type your password again",
  },
  toggle: { show: "SHOW", hide: "HIDE", ariaShow: "Show password", ariaHide: "Hide password" },
  forgot: { text: "Forgot password?", href: "/forgot-password" },
  back: "Back to",
  busy: "One moment",
  switchLine: {
    login: { lead: "New here?", link: "Create an account" },
    signup: { lead: "Already have an account?", link: "Log in" },
  },
  errors: {
    empty: "Fill in every field to continue.",
    short: "Your password needs at least 8 characters.",
    mismatch: "The two passwords don't match.",
    noMatch: "Those details don't match an account.",
    network: "Something went wrong. Check your connection and try again.",
    fallback: "That didn't work. Try again.",
  },
} as const;
