"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshIcon } from "./icons";

/* The "Live" pill and the refresh button, together. Refresh re-runs the
 * current page's server component (a fresh DB read) without a full
 * reload - every /admin page is force-dynamic already, so no new
 * data-fetching path is needed. The pill shows when the numbers on
 * screen were last pulled. The clock is set on the client after mount,
 * so the server and browser never disagree about the minute. */
export default function LiveRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [spun, setSpun] = useState(false);
  const [at, setAt] = useState<string>("");

  const stamp = () =>
    setAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));

  useEffect(() => { stamp(); }, []);

  return (
    <>
      <span className="admin-live" title="Numbers are read live from the database on every page load">
        <span className="admin-live-dot" aria-hidden="true" />
        Live{at ? <> &middot; <b>{at}</b></> : null}
      </span>
      <button
        type="button"
        className="admin-refresh"
        aria-label="Refresh data"
        title="Refresh data"
        disabled={isPending}
        onClick={() => {
          setSpun(true);
          startTransition(() => {
            router.refresh();
            stamp();
          });
          setTimeout(() => setSpun(false), 650);
        }}
      >
        <RefreshIcon className={spun ? "admin-refresh-spin" : undefined} />
      </button>
    </>
  );
}
