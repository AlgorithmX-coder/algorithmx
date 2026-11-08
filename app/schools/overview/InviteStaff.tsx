"use client";

import { useRef, useState } from "react";
import { inviteStaffAction, type InviteResult } from "./staff.actions";

/**
 * Add a member of staff.
 *
 * The one thing a head can change from this screen, and the reason the
 * screen had to be built: a school's first account was made by us at the
 * point of sale, and there was no way to make a second one.
 *
 * When the email does not send, the link is shown instead rather than the
 * failure being the end of it. A head who can paste a link into their own
 * staff email has lost nothing; a head who is told "could not send" has
 * lost the invite.
 */
export default function InviteStaff({ staffWord }: { staffWord: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<InviteResult | null>(null);
  const form = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setDone(null);
    try {
      const res = await inviteStaffAction(new FormData(e.currentTarget));
      setDone(res);
      if (res.ok) form.current?.reset();
    } catch {
      setDone({ ok: false, error: "Something went wrong. Try again in a moment." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="sxh-invite">
      <form ref={form} onSubmit={onSubmit} className="sxh-inviteform">
        <label htmlFor="sxh-staff-email" className="sxh-label">
          Their email address
        </label>
        <div className="sxh-inviterow">
          <input
            id="sxh-staff-email"
            name="email"
            type="email"
            required
            maxLength={160}
            autoComplete="off"
            spellCheck={false}
            placeholder="their.name@example.com"
            className="sxh-input"
            aria-describedby="sxh-invite-note"
          />
          <button type="submit" className="sxh-btn sxh-btn-go" disabled={busy}>
            {busy ? "Sending…" : `Invite ${staffWord}`}
          </button>
        </div>
        <p id="sxh-invite-note" className="sxh-note">
          They get their own {staffWord} account: their own classes, and the progress of the
          children in them. Places, staff and the licence stay with you.
        </p>
      </form>

      {done && !done.ok && (
        <p role="alert" className="sxh-msg bad">
          {done.error}
        </p>
      )}
      {done && done.ok && (
        <div role="status" className="sxh-msg good">
          {done.emailed ? (
            <p>
              Invite sent to <b>{done.email}</b>. It is in the list above until they claim it.
            </p>
          ) : (
            <>
              <p>
                The invite for <b>{done.email}</b> is ready, but our email did not go out. Send
                them this link yourself:
              </p>
              <p className="sxh-link">{done.link}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
