"use client";

import { useState } from "react";

/**
 * A school's one staff join link, for staff to read out or paste into an
 * email when a lead asks "how do my colleagues get in?".
 *
 * Copy only. Making a new link, and the domain lock, are the lead's own
 * controls on /schools/overview: staff changing them from here would break
 * a link the lead has already forwarded, without the lead knowing.
 */
export default function StaffLinkCard({
  link,
  lockedTo,
  staffs,
}: {
  link: string;
  lockedTo: string | null;
  /** "teachers" or "leaders", matching the page. */
  staffs: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setFailed(true);
    }
  }

  return (
    <div className="ad-card" style={{ padding: "16px 20px" }}>
      <h2 className="ad-h2" style={{ margin: 0 }}>Staff join link</h2>
      <p className="ad-note" style={{ margin: "4px 0 12px" }}>
        The one link the lead forwards to their {staffs}. Anyone who opens it and signs in joins as
        a {staffs.replace(/s$/, "")}
        {lockedTo ? `, if their address is at @${lockedTo} (checked by email)` : ", from any address"}.
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <code style={{ wordBreak: "break-all", flex: "1 1 280px", minWidth: 0, userSelect: "all" }}>{link}</code>
        <button type="button" className="ad-btn ad-btn-pri" onClick={copy}>
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
      {failed && <div className="ad-err">The browser would not copy it. Select the link and copy it by hand.</div>}
    </div>
  );
}
