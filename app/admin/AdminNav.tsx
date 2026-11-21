"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OverviewIcon, SchoolIcon, OrganisationIcon, FirmIcon, IndividualsIcon } from "./icons";

/* Schools and Organisations both teach children the four cyber courses and
   run on identical machinery underneath; they are separate entries because
   they are sold to differently and staff talk about them differently.
   Firms is the corporate line: a different product and a different
   learner. Overview is the console's front door. */
export const SECTIONS = [
  { href: "/admin", label: "Overview", section: "overview", Icon: OverviewIcon, exact: true },
  { href: "/admin/schools", label: "Schools", section: "schools", Icon: SchoolIcon, exact: false },
  { href: "/admin/organisations", label: "Organisations", section: "organisations", Icon: OrganisationIcon, exact: false },
  { href: "/admin/firms", label: "Firms", section: "firms", Icon: FirmIcon, exact: false },
  { href: "/admin/individuals", label: "Individuals", section: "individuals", Icon: IndividualsIcon, exact: false },
] as const;

export function activeSection(pathname: string) {
  return SECTIONS.find((s) => (s.exact ? pathname === s.href : pathname.startsWith(s.href)));
}

export default function AdminNav() {
  const pathname = usePathname();
  const active = activeSection(pathname);
  return (
    <nav className="admin-nav" aria-label="Admin sections">
      <div className="admin-nav-label">Console</div>
      {SECTIONS.map((s) => (
        <Link
          key={s.href}
          href={s.href}
          className="admin-nav-item"
          data-section={s.section}
          aria-current={active?.href === s.href ? "page" : undefined}
          title={s.label}
        >
          <s.Icon />
          <span>{s.label}</span>
          {s.section !== "overview" && <i className="admin-nav-dot" aria-hidden="true" />}
        </Link>
      ))}
    </nav>
  );
}
