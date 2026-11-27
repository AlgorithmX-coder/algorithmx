"use client";

import { usePathname } from "next/navigation";

/* The address that missed, for the 404's "You asked for" chip. */
export default function AskedPath() {
  const path = usePathname();
  return <>{path || "/"}</>;
}
