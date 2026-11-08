import Link from "next/link";
import { prisma } from "@/app/lib/prisma";
import { SchoolIcon, OrganisationIcon, FirmIcon, IndividualsIcon } from "./icons";

/* /admin: a landing page to choose a tab, rather than auto-forwarding
 * to Schools. Counts are cheap direct queries (not the full
 * listX()/platformXTotals() functions, which pull nested relations
 * those list pages need but this page doesn't). */
export const dynamic = "force-dynamic";

const SMOKE_DOMAIN = "@algorithmx-ci.invalid";

export default async function AdminIndexPage() {
  /* Schools and organisations are both SchoolProfile rows and used to be
     counted together here, which would now show every youth club as a
     school. Split by kind; a firm is still the row with no profile. */
  const [schools, organisations, firms, individuals] = await Promise.all([
    prisma.organisation.count({ where: { school: { kind: "SCHOOL" } } }),
    prisma.organisation.count({ where: { school: { kind: "ORGANISATION" } } }),
    prisma.organisation.count({ where: { school: { is: null } } }),
    prisma.user.count({ where: { role: { notIn: ["staff", "pupil"] }, email: { not: { endsWith: SMOKE_DOMAIN } }, entitlements: { some: {} } } }),
  ]);

  const tiles = [
    { href: "/admin/schools", section: "schools", label: "Schools", count: schools, note: "School licences and trials", Icon: SchoolIcon },
    { href: "/admin/organisations", section: "organisations", label: "Organisations", count: organisations, note: "Youth clubs, councils, charities", Icon: OrganisationIcon },
    { href: "/admin/firms", section: "firms", label: "Firms", count: firms, note: "Firm seats and trials", Icon: FirmIcon },
    { href: "/admin/individuals", section: "individuals", label: "Individuals", count: individuals, note: "Direct course sign-ups", Icon: IndividualsIcon },
  ];

  return (
    <div>
      <h1 className="ad-h1">Who do you want to look at?</h1>
      <div className="ad-tiles">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className={`ad-tile ${t.section}`}>
            <span className="ad-tile-icon"><t.Icon /></span>
            <span className="ad-tile-count">{t.count}</span>
            <span className="ad-tile-label">{t.label}</span>
            <span className="ad-tile-note">{t.note}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
