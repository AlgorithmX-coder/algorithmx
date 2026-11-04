"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SchoolIcon, FirmIcon, IndividualsIcon } from "./icons";

const TABS = [
  { href: "/admin/schools", label: "Schools", section: "schools", Icon: SchoolIcon },
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
