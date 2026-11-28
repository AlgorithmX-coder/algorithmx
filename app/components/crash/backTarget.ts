/**
 * Where the crash screen's second button goes.
 *
 * A signed-in teacher, pupil, learner or member of staff who crashes inside
 * their own area should be offered the way back into it, not the public
 * homepage. Each rule names the area's prefixes and its home; a prefix
 * matches the path itself or anything below it ("/admin" matches "/admin"
 * and "/admin/schools", not "/administer"). The longest matching prefix
 * wins, so "/schools/overview" beats "/schools".
 *
 * If the home is the very page that crashed, the button would lead straight
 * back into the same crash, so it falls back one level to the next shorter
 * matching row (a crash on /schools/overview goes to your classes), and to
 * the public homepage when there is none.
 */

export type BackTarget = { href: string; label: string };

const HOME: BackTarget = { href: "/", label: "Back to home" };

type Rule = {
  /** Matches the path itself or anything under it. */
  prefix: string;
  /** When true, only paths below the prefix match, not the prefix itself. */
  below?: boolean;
  /** Omitted: the course's own home, the path's first segment. */
  href?: string;
  label: string;
};

const COURSE = "Back to the course";

const RULES: Rule[] = [
  { prefix: "/schools/overview", href: "/schools/overview", label: "Back to your school" },
  // /schools itself is the public schools landing, so only paths below it.
  { prefix: "/schools", below: true, href: "/schools/classes", label: "Back to your classes" },
  { prefix: "/admin", href: "/admin", label: "Back to the console" },
  { prefix: "/admin-login", href: "/admin", label: "Back to the console" },
  { prefix: "/cyberhq", href: "/cyberhq", label: "Back to HQ" },
  { prefix: "/lesson", href: "/cyberhq", label: "Back to HQ" },
  { prefix: "/explorers", below: true, href: "/explorers", label: "Back to Explorers" },
  { prefix: "/operators", below: true, href: "/operators/portfolio", label: "Back to Ops" },
  { prefix: "/pro/course", href: "/pro/course", label: COURSE },
  { prefix: "/pro/testme", href: "/pro/course", label: COURSE },
  { prefix: "/pro/code", href: "/pro/course", label: COURSE },
  { prefix: "/desk-ready/course", href: "/desk-ready/course", label: COURSE },
  { prefix: "/desk-ready/learn", href: "/desk-ready/course", label: COURSE },
  { prefix: "/desk-ready/lessons", href: "/desk-ready/course", label: COURSE },
  { prefix: "/desk-ready/office", href: "/desk-ready/course", label: COURSE },
  { prefix: "/ai-cleared", below: true, label: COURSE },
  { prefix: "/ai-fluent", below: true, label: COURSE },
  { prefix: "/cyber-awareness", below: true, label: COURSE },
  { prefix: "/cyber-secured", below: true, label: COURSE },
  { prefix: "/dashboard", href: "/dashboard", label: "Back to your dashboard" },
].sort((a, b) => b.prefix.length - a.prefix.length);

function matches(path: string, rule: Rule): boolean {
  if (path.startsWith(`${rule.prefix}/`)) return true;
  return !rule.below && path === rule.prefix;
}

/** Drops a trailing slash (but keeps "/") so "/admin/" reads as "/admin". */
function tidy(pathname: string): string {
  const p = pathname.split(/[?#]/)[0] || "/";
  return p.length > 1 && p.endsWith("/") ? p.replace(/\/+$/, "") || "/" : p;
}

export function backTarget(pathname: string): BackTarget {
  const path = tidy(pathname);
  for (const rule of RULES) {
    if (!matches(path, rule)) continue;
    const href = rule.href ?? `/${path.split("/")[1]}`;
    if (href !== path) return { href, label: rule.label };
  }
  return HOME;
}
