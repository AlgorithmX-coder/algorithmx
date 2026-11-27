/**
 * THE CONSUMER PRICE LIST. Every course one person can buy for themselves,
 * what it costs, and where its pages are.
 *
 * Owner, 2026-11-26. Prices include VAT. Each is a one-off payment for
 * lifetime access to that one course: one purchase opens one course and
 * nothing else. No bundles, no discounts, no promo codes.
 *
 * The checkout charges exactly these figures (inline Stripe price_data, so
 * there is nothing to keep in step in the Stripe dashboard). Product.priceGBP
 * in the database is display data for older pages; this file is what is
 * charged.
 *
 * Client-safe: no Prisma, no Stripe. The buy page, the landings and the
 * checkout all read the same list.
 */
import { VAT_PERCENT } from "@/app/lib/corporateProducts";
import { CONSUMER_CHECKOUT_OPEN } from "@/app/lib/launchSwitch";
import { INDIVIDUAL_WORKPLACE_COURSE_PENCE } from "@/app/lib/individualCoursePrice";

export interface ConsumerCourse {
  /** The Product slug in the database. */
  slug: string;
  /** The name a buyer sees on the page and on their receipt. */
  name: string;
  /** The whole price in pence, VAT included. */
  pence: number;
  /** The course's sales page, where "Back to the course" goes. */
  landing: string;
  /** The course's own sign-up and sign-in pages. */
  signUp: string;
  signIn: string;
  /** Where a holder of the course lands once it is theirs. */
  home: string;
  /** A one-line promise for the order summary and the receipt. */
  line: string;
  /**
   * True for the three workplace courses (AI Cleared, AI Fluent, Cyber
   * Awareness). Firms license them per seat; an individual buyer is given
   * their own enrolment instead (see consumerCheckout.ts).
   */
  workplace: boolean;
}

export const CONSUMER_CATALOGUE: readonly ConsumerCourse[] = [
  { slug: "cyber-heroes", name: "Cyber Heroes", pence: 9900, landing: "/cyberheroes", signUp: "/cyberheroes/signup", signIn: "/cyberheroes/login", home: "/dashboard", line: "Twenty weeks of cyber safety missions for ages 6 to 9.", workplace: false },
  { slug: "cyberexplorers", name: "Cyber Explorers", pence: 9900, landing: "/cyberexplorers", signUp: "/cyberexplorers/signup", signIn: "/cyberexplorers/login", home: "/explorers", line: "Narrated cyber safety adventures for ages 9 to 12.", workplace: false },
  { slug: "cyberstart", name: "Cyber Ops", pence: 9900, landing: "/ops", signUp: "/ops/signup", signIn: "/ops/login", home: "/operators/portfolio", line: "Hands-on cyber security operations for teenagers.", workplace: false },
  { slug: "cyberstart-pro", name: "Cyber Pro", pence: 9900, landing: "/pro", signUp: "/pro/signup", signIn: "/pro/login", home: "/pro/course", line: "The adult cyber security course, from first principles to the real tools.", workplace: false },
  { slug: "desk-ready", name: "Desk Ready", pence: 2500, landing: "/desk-ready", signUp: "/desk-ready/signup", signIn: "/desk-ready/login", home: "/desk-ready/course", line: "The everyday computer skills every office job expects.", workplace: false },
  { slug: "ai-cleared", name: "AI Cleared", pence: INDIVIDUAL_WORKPLACE_COURSE_PENCE, landing: "/ai-cleared", signUp: "/ai-cleared/signup", signIn: "/ai-cleared/login", home: "/ai-cleared", line: "Use AI tools at work safely and with confidence.", workplace: true },
  { slug: "ai-fluent", name: "AI Fluent", pence: INDIVIDUAL_WORKPLACE_COURSE_PENCE, landing: "/ai-fluent", signUp: "/ai-fluent/signup", signIn: "/ai-fluent/login", home: "/ai-fluent", line: "Get real, checked work out of AI on your own desk.", workplace: true },
  { slug: "cyber-awareness", name: "Cyber Awareness", pence: INDIVIDUAL_WORKPLACE_COURSE_PENCE, landing: "/cyber-awareness", signUp: "/cyber-awareness/signup", signIn: "/cyber-awareness/login", home: "/cyber-awareness", line: "Spot the scams and attacks aimed at people at work.", workplace: true },
];

const BY_SLUG = new Map(CONSUMER_CATALOGUE.map((c) => [c.slug, c]));

/** The course for a slug, or null when one person cannot buy it. */
export function consumerCourse(slug: string | null | undefined): ConsumerCourse | null {
  if (!slug) return null;
  return BY_SLUG.get(slug.trim().toLowerCase()) ?? null;
}

export function isConsumerCourseSlug(slug: string | null | undefined): boolean {
  return consumerCourse(slug) !== null;
}

/** £99, £25, £29.50: whole pounds without pence, anything else with. */
export function formatPence(pence: number): string {
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
}

/**
 * The VAT already inside a VAT-inclusive price, in pence, rounded to the
 * nearest penny: £99 holds £16.50, £29 holds £4.83, £25 holds £4.17.
 */
export function vatIncludedPence(grossPence: number, percent: number = VAT_PERCENT): number {
  return Math.round((grossPence * percent) / (100 + percent));
}

/**
 * Where a landing page's "Enrol" or "Buy" button goes. While checkout is
 * shut (CONSUMER_CHECKOUT_OPEN in launchSwitch.ts) it is the course's own
 * sign-up, as before; once open, the buy page for that one course.
 */
export function enrolHref(slug: string, open: boolean = CONSUMER_CHECKOUT_OPEN): string {
  const c = consumerCourse(slug);
  if (!c) return "/";
  return open ? `/purchase/${c.slug}` : c.signUp;
}

/** The buy page for a course. */
export function purchasePath(slug: string): string {
  return `/purchase/${slug}`;
}
