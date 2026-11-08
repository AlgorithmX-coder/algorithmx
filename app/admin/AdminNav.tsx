"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SchoolIcon, OrganisationIcon, FirmIcon, IndividualsIcon } from "./icons";

/* Schools and Organisations both teach children the four cyber courses and
   run on identical machinery underneath; they are separate tabs because
   they are sold to differently and staff talk about them differently.
   Firms is the corporate AI line: a different product and a different
   learner. */
const TABS = [
  { href: "/admin/schools", label: "Schools", section: "schools", Icon: SchoolIcon },
  { href: "/admin/organisations", label: "Organisations", section: "organisations", Icon: OrganisationIcon },
  { href: "/admin/firms", label: "Firms", section: "firms", Icon: FirmIcon },
  { href: "/admin/individuals", label: "Individuals", section: "individuals", Icon: IndividualsIcon },
];

export default function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="admin-tabs" aria-label="Admin sections">
      {TABS.map((t) => (
        <Link key={t.href} href={t.href} className="admin-tab" data-section={t.section} aria-current={pathname.startsWith(t.href) ? "page" : undefined}>
          <t.Icon />
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
