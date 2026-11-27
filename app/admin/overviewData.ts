import { prisma } from "@/app/lib/prisma";
import { listSchoolEnquiries } from "@/app/lib/schoolEnquiries";
import { INDIVIDUAL_LEARNERS_ORG_SLUG } from "@/app/lib/cyberSecured";

/* Everything the overview shows, in a handful of cheap queries. Counts
 * are direct (not the full listX() functions, which pull nested relations
 * the list pages need and this page doesn't); the 12-week series and the
 * recent feed come from createdAt alone. Never import from a client
 * component. */

const SMOKE_DOMAIN = "@algorithmx-ci.invalid";
const WEEKS = 12;
const WEEK_MS = 7 * 86400000;

export type Section = "schools" | "organisations" | "firms" | "individuals";

export interface FeedItem {
  key: string;
  section: Section;
  name: string;
  sub: string;
  href: string;
  at: Date;
}

export interface AttentionItem {
  key: string;
  tone: "warn" | "danger" | "ok";
  title: string;
  sub: string;
  href: string;
  go: string;
}

export interface Overview {
  counts: Record<Section, number>;
  series: Record<Section, number[]>;
  recent: FeedItem[];
  attention: AttentionItem[];
}

const INDIVIDUAL_WHERE = {
  role: { notIn: ["staff", "pupil"] },
  email: { not: { endsWith: SMOKE_DOMAIN } },
  entitlements: { some: {} },
};

function bucket(dates: Date[], now: number): number[] {
  const out = new Array<number>(WEEKS).fill(0);
  for (const d of dates) {
    const i = Math.floor((now - d.getTime()) / WEEK_MS);
    if (i >= 0 && i < WEEKS) out[WEEKS - 1 - i] += 1;
  }
  return out;
}

function sectionOf(org: { school: { kind: string } | null }): Section {
  if (!org.school) return "firms";
  return org.school.kind === "SCHOOL" ? "schools" : "organisations";
}

export function hrefFor(section: Section, slugOrId: string): string {
  switch (section) {
    case "schools": return `/admin/schools/${slugOrId}`;
    case "organisations": return `/admin/organisations/${slugOrId}`;
    case "firms": return `/ai-cleared/ops/${slugOrId}`;
    default: return `/admin/individuals/${slugOrId}`;
  }
}

export async function getOverview(): Promise<Overview> {
  const now = Date.now();
  const since = new Date(now - WEEKS * WEEK_MS);
  const soon = new Date(now + 2 * 86400000);
  const lately = new Date(now - 7 * 86400000);

  const [orgs, people, enquiries, endingSoon, endedLately, closed] = await Promise.all([
    prisma.organisation.findMany({
      /* The house record individual buyers are enrolled under is not a customer. */
      where: { slug: { not: INDIVIDUAL_LEARNERS_ORG_SLUG } },
      select: { id: true, name: true, slug: true, sector: true, createdAt: true, school: { select: { kind: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: INDIVIDUAL_WHERE,
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    listSchoolEnquiries({ handled: false }),
    prisma.organisation.findMany({
      where: { revokedAt: null, trialExpiresAt: { gt: new Date(now), lte: soon } },
      select: { id: true, name: true, slug: true, trialExpiresAt: true, school: { select: { kind: true } } },
      orderBy: { trialExpiresAt: "asc" },
      take: 5,
    }),
    prisma.organisation.findMany({
      where: { revokedAt: null, trialExpiresAt: { gte: lately, lte: new Date(now) } },
      select: { id: true, name: true, slug: true, trialExpiresAt: true, school: { select: { kind: true } } },
      orderBy: { trialExpiresAt: "desc" },
      take: 5,
    }),
    prisma.organisation.findMany({
      where: { revokedAt: { not: null } },
      select: { id: true, name: true, slug: true, revokedAt: true, school: { select: { kind: true } } },
      orderBy: { revokedAt: "desc" },
      take: 5,
    }),
  ]);

  const counts: Record<Section, number> = { schools: 0, organisations: 0, firms: 0, individuals: people.length };
  const dates: Record<Section, Date[]> = { schools: [], organisations: [], firms: [], individuals: [] };
  for (const o of orgs) {
    const s = sectionOf(o);
    counts[s] += 1;
    if (o.createdAt >= since) dates[s].push(o.createdAt);
  }
  for (const p of people) if (p.createdAt >= since) dates.individuals.push(p.createdAt);

  const series: Record<Section, number[]> = {
    schools: bucket(dates.schools, now),
    organisations: bucket(dates.organisations, now),
    firms: bucket(dates.firms, now),
    individuals: bucket(dates.individuals, now),
  };

  const recent: FeedItem[] = [
    ...orgs.slice(0, 10).map((o) => {
      const s = sectionOf(o);
      return { key: `o-${o.id}`, section: s, name: o.name, sub: o.sector ?? (s === "firms" ? "Firm" : s === "schools" ? "School" : "Organisation"), href: hrefFor(s, o.slug), at: o.createdAt };
    }),
    ...people.slice(0, 10).map((p) => ({ key: `u-${p.id}`, section: "individuals" as const, name: p.name ?? p.email, sub: p.name ? p.email : "Direct sign-up", href: hrefFor("individuals", p.id), at: p.createdAt })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 8);

  const day = (d: Date | null) => (d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "");
  const attention: AttentionItem[] = [];
  if (enquiries.length > 0) {
    attention.push({
      key: "enq",
      tone: "warn",
      title: `${enquiries.length} school enquir${enquiries.length === 1 ? "y" : "ies"} waiting`,
      sub: "Somebody filled in the schools form and is waiting to hear back.",
      href: "/admin/schools",
      go: "Open",
    });
  }
  for (const o of endingSoon) {
    const s = sectionOf(o);
    attention.push({ key: `soon-${o.id}`, tone: "warn", title: `${o.name}: trial ends ${day(o.trialExpiresAt)}`, sub: "Worth a call before it does.", href: hrefFor(s, o.slug), go: "View" });
  }
  for (const o of endedLately) {
    const s = sectionOf(o);
    attention.push({ key: `ended-${o.id}`, tone: "danger", title: `${o.name}: trial ended ${day(o.trialExpiresAt)}`, sub: "Locked out until a licence is set up on its page.", href: hrefFor(s, o.slug), go: "View" });
  }
  for (const o of closed) {
    const s = sectionOf(o);
    attention.push({ key: `closed-${o.id}`, tone: "danger", title: `${o.name}: access closed`, sub: `Since ${day(o.revokedAt)}. Reopen or delete from its page.`, href: hrefFor(s, o.slug), go: "View" });
  }

  return { counts, series, recent, attention };
}
