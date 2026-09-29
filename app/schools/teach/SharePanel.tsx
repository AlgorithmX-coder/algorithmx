"use client";

import { useRef, useState, useTransition } from "react";
import { createShareLink, revokeShare } from "./share.actions";
import type { ShareRow } from "@/app/lib/packShare";

/**
 * Make a read-only link to one week and paste it into a reply.
 *
 * This is a sales tool, not an admin console, so it is one row of controls and
 * a list. The part that earns its place is the open count: after you send a
 * pack to a head of computing, the useful question is whether they opened it,
 * and that decides whether the follow up is "any thoughts?" or "did that link
 * reach you?".
 */

const fmt = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

function relative(d: Date | string): string {
  const days = Math.round((new Date(d).getTime() - Date.now()) / 86400000);
  if (days < 0) return "expired";
  if (days === 0) return "expires today";
  return "expires in " + days + (days === 1 ? " day" : " days");
}

export default function SharePanel({ weeks, links }: { weeks: { n: number; title: string }[]; links: ShareRow[] }) {
  const [pending, start] = useTransition();
  const [made, setMade] = useState<{ url: string; expiresAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = (fd: FormData) => {
    setError(null);
    setCopied(false);
    start(async () => {
      const res = await createShareLink(fd);
      if (res.ok) {
        setMade({ url: res.url, expiresAt: res.expiresAt });
        formRef.current?.reset();
      } else {
        setMade(null);
        setError(res.error);
      }
    });
  };

  const copy = async () => {
    if (!made) return;
    try {
      await navigator.clipboard.writeText(made.url);
      setCopied(true);
    } catch {
      /* clipboard is blocked in some browsers and every embedded webview, so
         the link is always on screen to select by hand as well */
      setError("Could not copy automatically. Select the link and copy it.");
    }
  };

  return (
    <div className="share">
      <h3>Send a week to a school</h3>
      <p className="sharelede">
        A read-only link to one week. It opens with no account, so you can paste it into a reply to
        an enquiry. It expires, you can turn it off, and you can see whether they opened it.
      </p>

      <form ref={formRef} action={submit} className="sharerow">
        <label>
          <span>Week</span>
          <select name="week" defaultValue={weeks[0]?.n}>
            {weeks.map((w) => (
              <option key={w.n} value={w.n}>Week {w.n} &middot; {w.title}</option>
            ))}
          </select>
        </label>
        <label className="grow">
          <span>Who is it for</span>
          <input name="label" placeholder="St Mary&rsquo;s, Priya (head of computing)" maxLength={120} />
        </label>
        <label>
          <span>Lasts</span>
          <select name="days" defaultValue="30">
            <option value="7">7 days</option>
            <option value="30">30 days</option>
            <option value="90">90 days</option>
          </select>
        </label>
        <button type="submit" disabled={pending}>{pending ? "Making…" : "Make a link"}</button>
      </form>

      {error && <p className="shareerr">{error}</p>}

      {made && (
        <div className="madelink">
          <code>{made.url}</code>
          <button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
          <small>{relative(made.expiresAt)}. This is the only time it is shown.</small>
        </div>
      )}

      {links.length > 0 && (
        <table className="sharelist">
          <thead>
            <tr><th>Week</th><th>Who</th><th>Opened</th><th>Status</th><th /></tr>
          </thead>
          <tbody>
            {links.map((l) => {
              const dead = Boolean(l.revokedAt) || new Date(l.expiresAt).getTime() < Date.now();
              return (
                <tr key={l.id} className={dead ? "dead" : undefined}>
                  <td>{l.week}</td>
                  <td>{l.label ?? <span className="dim">not named</span>}</td>
                  <td>
                    {l.opens === 0
                      ? <span className="dim">not yet</span>
                      : <>{l.opens}{l.opens === 1 ? " time" : " times"}<small>{fmt(l.lastOpenedAt ?? l.createdAt)}</small></>}
                  </td>
                  <td>{l.revokedAt ? "turned off" : relative(l.expiresAt)}</td>
                  <td>
                    {!dead && (
                      <form action={revokeShare}>
                        <input type="hidden" name="id" value={l.id} />
                        <button type="submit" className="revoke">Turn off</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
