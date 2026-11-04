import Link from "next/link";
import { prisma } from "@/app/lib/prisma";

/* /admin: a landing page to choose a tab, rather than auto-forwarding
 * to Schools. Counts are cheap direct queries (not the full
 * listX()/platformXTotals() functions, which pull nested relations
 * those list pages need but this page doesn't). */
export const dynamic = "force-dynamic";

const SMOKE_DOMAIN = "@algorithmx-ci.invalid";

export default async function AdminIndexPage() {
  const [schools, firms, individuals] = await Promise.all([
    prisma.organisation.count({ where: { school: { isNot: null } } }),
    prisma.organisation.count({ where: { school: { is: null } } }),
    prisma.user.count({ where: { role: { notIn: ["staff", "pupil"] }, email: { not: { endsWith: SMOKE_DOMAIN } }, entitlements: { some: {} } } }),
  ]);

  const tiles = [
    { href: "/admin/schools", label: "Schools", count: schools, note: "Cyber Heroes licences and trials" },
    { href: "/admin/firms", label: "Firms", count: firms, note: "AI Cleared / AI Fluent seats" },
    { href: "/admin/individuals", label: "Individuals", count: individuals, note: "Direct course sign-ups" },
  ];

  return (
    <div>
      <h1 className="ad-h1">Who do you want to look at?</h1>
      <div className="ad-tiles">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="ad-tile">
            <span className="ad-tile-count">{t.count}</span>
            <span className="ad-tile-label">{t.label}</span>
            <span className="ad-tile-note">{t.note}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
