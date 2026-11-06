"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshIcon } from "./icons";

/* Re-runs the current page's server component (fresh DB read) without a
 * full reload. Every /admin page is `force-dynamic` already, so this is
 * the "make sure it's up to date" button the owner asked for - no new
 * data-fetching path needed. */
export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spun, setSpun] = useState(false);

  return (
    <button
      type="button"
      className="admin-refresh"
      aria-label="Refresh data"
      title="Refresh data"
      disabled={isPending}
      onClick={() => {
        setSpun(true);
        startTransition(() => router.refresh());
        setTimeout(() => setSpun(false), 500);
      }}
    >
      <RefreshIcon className={spun ? "admin-refresh-spin" : undefined} />
    </button>
  );
}
