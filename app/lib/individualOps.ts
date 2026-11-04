import { prisma } from "@/app/lib/prisma";

/* The AlgorithmX side of individuals: everyone who has signed up for a
 * course directly (not via a school or firm). Read-only for now - no
 * create action, since individuals sign themselves up; staff just need
 * to see who's there. Never import from a client component. */

const SMOKE_DOMAIN = "@algorithmx-ci.invalid";

export interface IndividualProduct {
  slug: string;
  name: string;
  source: string;
  grantedAt: string;
}

export interface IndividualChild {
  id: string;
  name: string;
}

export interface IndividualRow {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  products: IndividualProduct[];
  children: IndividualChild[];
  lastActive: string | null;
}

function toRow(u: {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  entitlements: { source: string; grantedAt: Date; product: { slug: string; name: string } }[];
  children: { id: string; name: string; progress: { updatedAt: Date }[] }[];
  proProgress: { completedAt: Date }[];
}): IndividualRow {
  const stamps = [
    ...u.children.flatMap((c) => c.progress.map((p) => p.updatedAt)),
    ...u.proProgress.map((p) => p.completedAt),
  ];
  const last = stamps.length ? new Date(Math.max(...stamps.map((d) => d.getTime()))) : null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt.toISOString(),
    products: u.entitlements.map((e) => ({ slug: e.product.slug, name: e.product.name, source: e.source, grantedAt: e.grantedAt.toISOString() })),
    children: u.children.map((c) => ({ id: c.id, name: c.name })),
    lastActive: last ? last.toISOString() : null,
  };
}

/* "Signed up for a course directly": real people (not staff, not a
 * school pupil, not a smoke-test account) who hold at least one
 * Entitlement. Excludes teachers/firm-admins whose only access is via
 * their school/firm, since that's covered on the other two tabs. */
export async function listIndividuals(): Promise<IndividualRow[]> {
  const users = await prisma.user.findMany({
    where: {
      role: { notIn: ["staff", "pupil"] },
      email: { not: { endsWith: SMOKE_DOMAIN } },
      entitlements: { some: {} },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      entitlements: { select: { source: true, grantedAt: true, product: { select: { slug: true, name: true } } } },
      // Family children only - a school pupil (classId set) is covered
      // on the Schools tab, not here.
      children: { where: { classId: null }, select: { id: true, name: true, progress: { select: { updatedAt: true } } } },
      proProgress: { select: { completedAt: true } },
    },
  });
  return users.map(toRow);
}

export async function getIndividual(id: string): Promise<IndividualRow | null> {
  const u = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      entitlements: { select: { source: true, grantedAt: true, product: { select: { slug: true, name: true } } } },
      children: { where: { classId: null }, select: { id: true, name: true, progress: { select: { updatedAt: true } } } },
      proProgress: { select: { completedAt: true } },
    },
  });
  return u ? toRow(u) : null;
}

export function platformIndividualTotals(rows: IndividualRow[]) {
  return {
    individuals: rows.length,
    withChildren: rows.filter((r) => r.children.length > 0).length,
    entitlements: rows.reduce((a, r) => a + r.products.length, 0),
  };
}
