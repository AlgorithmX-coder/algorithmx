"use client";

import { useState, useTransition } from "react";
import { renewStaffLinkAction, setStaffLinkLockAction } from "./staff.actions";

/**
 * The lead's one staff join link.
 *
 * Owner, 2026-11-26: one link to forward to colleagues, instead of typing
 * every address. Copy it, or make a new one, which kills the old one at once
 * (the safety valve for a link forwarded somewhere it should not have gone).
 *
 * The lock is on by default whenever the lead's own address has a school
 * domain. On a free provider there is nothing to lock to, so the box is not
 * offered and the page says plainly that anyone with the link can join.
 */
export default function StaffLink({
  link,
  lockedTo,
  leadDomain,
  staff,
  staffs,
  noun,
  groups,
}: {
  link: string;
  lockedTo: string | null;
  leadDomain: string | null;
  staff: string;
  staffs: string;
  noun: string;
  groups: string;
}) {
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const [asking, setAsking] = useState(false);
  const [said, setSaid] = useState<{ ok: boolean; text: string } | null>(null);
  /* The box moves the moment it is pressed, and moves back only if the
     server refuses. Waiting for the round trip made it look broken. */
  const [locked, setLocked] = useState(lockedTo !== null);

  const copy = async () => {
    setSaid(null);
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setSaid({ ok: false, text: "Your browser would not copy it. Select the link above and copy it yourself." });
    }
  };

  const renew = () =>
    start(async () => {
      const res = await renewStaffLinkAction();
      setAsking(false);
      setSaid(res.ok ? { ok: true, text: "New link made. The old one no longer works." } : { ok: false, text: res.error });
    });

  const lock = (on: boolean) => {
    setLocked(on);
    setSaid(null);
    start(async () => {
      const res = await setStaffLinkLockAction(on);
      if (!res.ok) {
        setLocked(!on);
        setSaid({ ok: false, text: res.error });
      }
    });
  };

  return (
    <div className="sxh-stafflink">
      <p className="sxh-label" id="sxh-stafflink-l">Your {staff} link</p>
      <p className="sxh-linkbox" aria-labelledby="sxh-stafflink-l">{link}</p>
      <div className="sxh-linkrow">
        <button type="button" className="sxh-btn sxh-btn-go" onClick={copy} disabled={pending}>
          {copied ? "Copied" : "Copy link"}
        </button>
        {asking ? (
          <span className="sxh-confirm">
            <span>The old link stops working straight away.</span>
            <button type="button" className="sxh-btn sxh-btn-quiet" onClick={renew} disabled={pending}>
              {pending ? "Making…" : "Make a new link"}
            </button>
            <button type="button" className="sxh-textbtn" onClick={() => setAsking(false)} disabled={pending}>
              Keep this one
            </button>
          </span>
        ) : (
          <button type="button" className="sxh-btn sxh-btn-quiet" onClick={() => setAsking(true)} disabled={pending}>
            Make a new link
          </button>
        )}
      </div>

      {leadDomain ? (
        <label className="sxh-check">
          <input
            type="checkbox"
            checked={locked}
            onChange={(e) => lock(e.target.checked)}
            disabled={pending}
          />
          <span>
            Only <b>@{leadDomain}</b> addresses can join. We email them a quick check that the
            address is theirs before they get in.
          </span>
        </label>
      ) : (
        <p className="sxh-note">
          Your own address is at a free email provider, so the link cannot be limited to a {noun}{" "}
          domain. Anyone with it can join. If it goes somewhere it should not, make a new one.
        </p>
      )}
      <p className="sxh-note">
        Forward it to your {staffs}. Anyone who opens it and signs in{locked && leadDomain ? ` with an @${leadDomain} address` : ""}{" "}
        joins as a {staff}: their own {groups}, drawing on the same pool of places as
        everyone else. They do not see this screen.
      </p>

      {said && (
        <p role={said.ok ? "status" : "alert"} className={`sxh-msg ${said.ok ? "good" : "bad"}`}>
          {said.text}
        </p>
      )}
    </div>
  );
}
