/**
 * Course auth content: the words and routes behind the course-themed login,
 * signup, forgot-password and reset-password pages. The five original packs
 * are frozen copy (lifted verbatim from the live pages on 2026-11-22 for the
 * auth design lab and ported back unchanged); the AI Cleared, AI Fluent and
 * Cyber Awareness packs and the FLOW strings come from the round 6 lab
 * (2026-11-23). The skins read it, they never add words.
 *
 * Route pages pass a course KEY (a string, server-component safe) and the
 * client-side skin looks its pack up here.
 */

export type CourseAuthKey = "cyberheroes" | "cyberexplorers" | "ops" | "pro" | "desk" | "cleared" | "fluent" | "awareness";

export interface CourseAuthCopy {
  /** Catalog slug, carried through the auth flow for the hub target. */
  slug: string;
  /** Route base: login, signup, forgot-password and reset-password live
   *  under it. Also where "Back to course" points unless `landing` is set. */
  base: string;
  /** Where "Back to course" and the lockup point, when that is not `base`.
   *  The three firm tracks have no landing of their own (their base is the
   *  signed-in console, which sends a signed-out visitor to /login), so they
   *  point at the Cyber Secured page that sells them. */
  landing?: string;
  /** Post-login destination for a course the shared course-intent map does
   *  not know (courseHomeFor sends unknown slugs to the catalogue). */
  home?: string;
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
  cleared: {
    slug: "ai-cleared",
    base: "/ai-cleared",
    landing: "/corporate",
    home: "/ai-cleared",
    courseName: "AI Cleared",
    copy: {
      loginTitle: "Sign in",
      loginSub: "Pick up your clearance where you left off. Your sims are saved.",
      signupTitle: "Create your account",
      signupSub: "Learn the rules for AI at work and practise them in a live sandbox.",
      registeredNotice: "Account created. Sign in to start your first module.",
      submitLogin: "Sign in",
      submitSignup: "Create account",
    },
  },
  fluent: {
    slug: "ai-fluent",
    base: "/ai-fluent",
    landing: "/corporate",
    home: "/ai-fluent",
    courseName: "AI Fluent",
    copy: {
      loginTitle: "Welcome back",
      loginSub: "Back to the loop. Your prompts and progress are saved.",
      signupTitle: "Create your account",
      signupSub: "Get real work done with AI, one short module at a time.",
      registeredNotice: "Account created. Sign in to open your first module.",
      submitLogin: "Sign in",
      submitSignup: "Create account",
    },
  },
  awareness: {
    slug: "cyber-awareness",
    base: "/cyber-awareness",
    landing: "/corporate",
    home: "/cyber-awareness",
    courseName: "Cyber Awareness",
    copy: {
      loginTitle: "Sign in",
      loginSub: "Back on watch. Pick up where you left off.",
      signupTitle: "Create your account",
      signupSub: "Spot the scam before it lands. Short modules, real examples.",
      registeredNotice: "Account created. Sign in to start your first module.",
      submitLogin: "Sign in",
      submitSignup: "Create account",
    },
  },
};

/* Cyber Secured: the firm door (landing lab round 8, r8-door.html?c=secured,
 * owner 2026-11-26). Not a course of its own: one seat opens AI Cleared, AI
 * Fluent and Cyber Awareness, and the person lands on /cyber-secured, the
 * firm portal. Sign in only (a seat is claimed through the invite link,
 * which has its own way to create an account), so the signup words are
 * never shown; they are here because every pack carries them. */
export const SECURED_AUTH: CourseAuthCopy = {
  slug: "cyber-secured",
  base: "/cyber-secured",
  landing: "/corporate",
  home: "/cyber-secured",
  courseName: "Cyber Secured",
  copy: {
    loginTitle: "Sign in to your firm",
    loginSub: "Use the work email your firm invited.",
    signupTitle: "Create your account",
    signupSub: "Use the work email your firm invited.",
    registeredNotice: "Account created. Sign in to open your courses.",
    submitLogin: "Sign in",
    submitSignup: "Create account",
  },
};

/** Every auth pack: the courses, plus the Cyber Secured firm door. */
export type AuthPackKey = CourseAuthKey | "secured";

export function authPack(key: AuthPackKey): CourseAuthCopy {
  return key === "secured" ? SECURED_AUTH : COURSE_AUTH_CONTENT[key];
}

/* The strings every course shares: labels, placeholders, the toggle, the
 * forgot row, the switch lines, the busy label and the client error text.
 * Same words on every course. The forgot row goes to the course's own
 * forgot-password page (base + path). */
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
  forgot: { text: "Forgot password?", path: "/forgot-password" },
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

/* The forgot-password and reset-password strings: the live generic pages'
 * own (app/forgot-password, app/reset-password), with the round 6 changes
 * the owner's lab carried: no em-dash in the reset sub, and the family line
 * only on Cyber Heroes (a Cyber Pro or AI Fluent learner has no family
 * account). The server error strings are the live page's. */
export const FLOW = {
  forgot: {
    title: "Reset your password",
    sub: "Enter your email and we'll send a secure link to set a new one.",
    submit: "Send reset link",
    busy: "Sending…",
    hint: "Enter your email to continue.",
    errInvalid: "Enter a valid email address.",
    fieldErr: "That email doesn't look right.",
    sentTitle: "Check your email",
    sentBefore: "If an account exists for ",
    sentAfter: ", a reset link is on its way.",
    switchLead: "Remembered it?",
    switchLink: "Log in",
  },
  reset: {
    title: "Choose a new password",
    subFamily: "Make it strong. It protects your family's account.",
    sub: "Make it strong. It protects your account.",
    labelPw: "New password",
    rules: ["8+ chars", "Capital", "Special char"],
    rulesAria: "Password requirements",
    submit: "Set new password",
    busy: "Saving…",
    hintPw: "Choose a stronger password.",
    hintConfirm: "Confirm your password.",
    errWeak: "Password needs 8+ characters, a capital and a special character.",
    errMismatch: "Those passwords don't match.",
    fieldMismatch: "Those passwords don't match yet.",
    errServer: "Could not reset your password. Try requesting a new link.",
    errNetwork: "Couldn't reach the server. Please try again.",
    ariaShowC: "Show confirmation password",
    ariaHideC: "Hide confirmation password",
    expiredTitle: "Link expired",
    expiredBody: "This reset link is broken or has expired. Request a fresh one and we'll send it over.",
    expiredBtn: "Request a new link",
    doneTitle: "Password updated",
    doneHead: "You're all set",
    doneBody: "Taking you to log in with your new password…",
    backLead: "Back to",
    backLink: "Log in",
  },
} as const;
