"use client";

import { usePathname } from "next/navigation";
import { activeSection } from "./AdminNav";

/* Where you are, in the top bar: "Admin / Schools", and "/ Detail" when
 * you are one level down. Reads the path only, so it needs no data and
 * never lags the page. */
export default function AdminCrumb() {
  const pathname = usePathname();
  const active = activeSection(pathname);
  const deeper = !!active && !active.exact && pathname.length > active.href.length + 1;
  return (
    <div className="admin-crumb" aria-label="Breadcrumb">
      <i>Admin</i>
      <span aria-hidden="true">/</span>
      <b>{active?.label ?? "Console"}</b>
      {deeper && (
        <>
          <span aria-hidden="true">/</span>
          <span>Detail</span>
        </>
      )}
    </div>
  );
}
