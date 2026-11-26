"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { K } from "@/app/ai-cleared/engine/tokens";
import { TRACKS, TRACK_LABEL, type Track } from "@/app/ai-cleared/engine/types";
import type { PersonRow, ProfileInput, TeamTrack } from "@/app/lib/aiClearedAdmin";
import { CYBER_SECURED_NAME } from "@/app/lib/cyberSecured";

/* The firm admin's view of Cyber Secured. It answers the questions the
 * person paying asks, in the order they ask them: how many seats, who has
 * one, how far each person has got on each course, and is anyone using it.
 * Then the two things they do here: invite people, and set the firm's
 * rules for AI. One seat is one person on every course, so the register is
 * one table with a column per course. Staff acting from the ops console
 * get the same panel with `orgId` set.
 *
 * The team link sits at the top: one link the lead forwards to everyone,
 * with Copy, Make a new link and the firm-domain check. "Who hasn't
 * joined" takes a pasted staff list and reminds the ones not in yet. */

type Tab = "people" | "missing" | "invite" | "profile";

export interface TeamLinkView {
  token: string;
  /* The domain the link is locked to, or null when anyone can use it. */
  domain: string | null;
  /* The domain switching the check on would lock to: the lead's own,
   * or null when the lead is on a free provider. */
  lockable: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—");

export default function TeamPanel({
  firmName,
  role,
  seatsPurchased,
  tracks,
  rows,
  profile,
  profileSet = true,
  orgId,
  teamLink,
  selfEmail,
}: {
  firmName: string;
  role: "ADMIN" | "MANAGER" | "LEARNER";
  seatsPurchased: number;
  tracks: TeamTrack[];
  rows: PersonRow[];
  profile: ProfileInput;
  /* False while the firm has never saved a profile, so the AI courses are
   * running on the built-in default (Copilot approved, personal ChatGPT not). */
  profileSet?: boolean;
  /* Set when AlgorithmX staff act on a firm from the ops console. */
  orgId?: string;
  teamLink?: TeamLinkView | null;
  /* The signed-in admin, so their own row never offers Remove. */
  selfEmail?: string | null;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("people");
  const [emails, setEmails] = useState("");
  const [team, setTeam] = useState("");
  const [track, setTrack] = useState<Track | "">("");
  const [inviteRole, setInviteRole] = useState<"LEARNER" | "MANAGER" | "ADMIN">("LEARNER");
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [prof, setProf] = useState<ProfileInput>(profile);
  const [copied, setCopied] = useState<string | null>(null);
  const [link, setLink] = useState<TeamLinkView | null>(teamLink ?? null);
  const [staffList, setStaffList] = useState("");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  /* Every call names the firm when staff are acting on it. */
  const api = (path: string, extra = "") => `${path}?${orgId ? `org=${encodeURIComponent(orgId)}&` : ""}${extra}`.replace(/[?&]$/, "");
  const active = rows.filter((r) => !r.removedAt);
  const people = active.length;
  const left = Math.max(0, seatsPurchased - people);
  const claimed = active.filter((r) => r.claimed).length;
  const started = active.filter((r) => Object.values(r.progress).some((p) => p && p.done > 0)).length;
  const finishedOn = (slug: TeamTrack["slug"]) => active.filter((r) => r.progress[slug]?.complete).length;
  const linkUrl = link ? `${origin}/ai-cleared/join/${link.token}` : "";

  /* "Who hasn't joined", worked out here from the register as the list is
     typed: in means a seat claimed and not removed. The server checks
     again before it sends anything. */
  const pasted = Array.from(new Set(staffList.split(/[\s,;]+/).map((e) => e.trim().toLowerCase().replace(/^<|>$/g, "")).filter(Boolean)));
  const inNow = new Set(active.filter((r) => r.claimed).map((r) => r.email.toLowerCase()));
  const pastedValid = pasted.filter((e) => EMAIL_RE.test(e));
  const pastedBad = pasted.filter((e) => !EMAIL_RE.test(e));
  const notJoined = pastedValid.filter((e) => !inNow.has(e));
  const lockDomain = link?.domain ?? null;
  const offDomain = lockDomain ? notJoined.filter((e) => { const d = e.split("@")[1] ?? ""; return d !== lockDomain && !d.endsWith(`.${lockDomain}`); }) : [];
  const toRemind = notJoined.filter((e) => !offDomain.includes(e));

  async function call(label: string, fn: () => Promise<Response>, ok: (j: Record<string, unknown>) => string) {
    setBusy(label);
    setNote(null);
    try {
      const res = await fn();
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) throw new Error((j.error as string) ?? "Something went wrong.");
      setNote({ tone: "ok", text: ok(j) });
      router.refresh();
    } catch (e) {
      setNote({ tone: "warn", text: e instanceof Error ? e.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  }

  const invite = () =>
    call("invite", () => fetch(api("/api/org/seats"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails: emails.split(/[\n,;]+/), team: team || null, track: track || null, role: inviteRole }) }), (j) => {
      const created = (j.created as unknown[])?.length ?? 0;
      const skipped = (j.skipped as unknown[])?.length ?? 0;
      const failed = (j.emailFailed as unknown[])?.length ?? 0;
      setEmails("");
      return `${created} invite${created === 1 ? "" : "s"} sent${skipped ? `, ${skipped} already had a seat` : ""}${failed ? `, ${failed} email${failed === 1 ? "" : "s"} could not be sent (copy the link from the register)` : ""}. Each seat opens every course.`;
    });
  const resend = (seatId: string) => call(`resend-${seatId}`, () => fetch(api("/api/org/seats"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resend: seatId }) }), () => "Invite sent again.");
  const remove = (row: PersonRow) => {
    if (row.claimed && !window.confirm(`Remove ${row.name ?? row.email}? Their seat comes back to you and their courses close. Their progress is kept, and you can invite them again later.`)) return;
    call(`remove-${row.seatId}`, () => fetch(api("/api/org/seats"), { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seatId: row.seatId }) }), () => `${row.name ?? row.email} is removed. The seat is free to give to someone else.`);
  };
  const teamCall = (label: string, body: Record<string, unknown>, ok: (j: Record<string, unknown>) => string) =>
    call(label, () => fetch(api("/api/org/team-link"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }), ok);
  const rotate = () => {
    if (!window.confirm("Make a new team link? The current one stops working straight away. Everyone who has already joined keeps their seat.")) return;
    teamCall("rotate", { action: "rotate" }, (j) => {
      if (link) setLink({ ...link, token: j.token as string });
      return "New link made. The old one no longer works, so share this one instead.";
    });
  };
  const toggleDomain = (on: boolean) =>
    teamCall("domain", { action: "domain", on }, (j) => {
      if (link) setLink({ ...link, domain: (j.domain as string | null) ?? null });
      return on ? `Done. Only @${j.domain as string} addresses can use the link now.` : "Done. Anyone with the link can join now, whatever their address.";
    });
  const remind = () =>
    teamCall("remind", { action: "remind", emails: toRemind }, (j) => {
      const n = (k: string) => ((j[k] as unknown[]) ?? []).length;
      const sent = n("sent");
      const parts = [`Reminder sent to ${sent} ${sent === 1 ? "person" : "people"}, under your name.`];
      if (n("recent")) parts.push(`${n("recent")} already had one today.`);
      if (n("joined")) parts.push(`${n("joined")} joined in the meantime.`);
      if (n("removed")) parts.push(`${n("removed")} you removed were left out.`);
      if (n("overLimit")) parts.push(`${n("overLimit")} were not sent: that is the most we send for one firm in a day. Try again tomorrow.`);
      if (n("failed")) parts.push(`${n("failed")} could not be sent. Copy the link and send it yourself.`);
      return parts.join(" ");
    });
  const nudge = () => call("nudge", () => fetch(api("/api/org/nudge"), { method: "POST" }), (j) => `Reminder sent to ${j.sent as number} of ${j.eligible as number} people, under your name.`);
  const save = () => call("profile", () => fetch(api("/api/org/profile"), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prof) }), () => "Firm profile saved. The AI courses read it from the next screen a learner opens.");

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(`${origin}/ai-cleared/join/${token}`);
      setCopied(token);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      setNote({ tone: "warn", text: `Copy this link: ${origin}/ai-cleared/join/${token}` });
    }
  };
  const isSelf = (row: PersonRow) => !!selfEmail && row.email.toLowerCase() === selfEmail.toLowerCase();
  const lines = (xs: string[]) => xs.join("\n");
  const fromLines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);
  const cell = (row: PersonRow, t: TeamTrack) => {
    if (!row.claimed) return <span className="tp-chip muted">Invited</span>;
    const p = row.progress[t.slug];
    if (p?.complete) return <span className="tp-chip ok">Finished</span>;
    if (!p || p.done === 0) return <span className="tp-chip muted">Not started</span>;
    return (
      <span className="tp-prog" title={`${p.done} of ${p.total} modules`}>
        <span className="tp-bar"><span style={{ width: `${Math.round((p.done / Math.max(1, p.total)) * 100)}%` }} /></span>
        <span className="tp-prog-n">{p.done} of {p.total}</span>
      </span>
    );
  };

  return (
    <div className="tp">
      <span className="cf-eyebrow">{orgId ? "Ops" : "Your team"} · {firmName}</span>
      <h1 className="cf-h1" style={{ marginBottom: 10 }}>{firmName} on <span className="cf-grad">{CYBER_SECURED_NAME}</span>.</h1>
      <p className="cf-lead" style={{ marginBottom: 22 }}>One seat is one person, and it opens every course. Here is who has a seat and how far each person has got.</p>

      <div className="cf-card tp-seats">
        <div className="tp-seats-count">
          <b>{people} of {seatsPurchased} seats used</b>
          <span>{left > 0 ? `${left} left` : "None left"}</span>
          <span className="tp-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, Math.round((people / Math.max(1, seatsPurchased)) * 100))}%` }} /></span>
        </div>
        <a className="cf-btn" href="/corporate/buy">Buy more seats</a>
      </div>

      {link && (
        <div className="cf-card tp-link">
          <div>
            <div className="cf-label" style={{ marginBottom: 4 }}>Your team link</div>
            <p className="tp-link-say">Send this one link to your staff by email or Teams. Each person opens it, creates an account and is straight into the courses. One person can only ever take one seat.</p>
          </div>
          <div className="tp-link-row">
            <input className="tp-link-url" readOnly value={linkUrl} aria-label="Your team link" onFocus={(e) => e.currentTarget.select()} />
            <button type="button" className="cf-btn cf-btn-pri tp-link-btn" onClick={() => copy(link.token)}>{copied === link.token ? "Copied" : "Copy link"}</button>
            <button type="button" className="cf-btn tp-link-btn" onClick={rotate} disabled={busy === "rotate"}>{busy === "rotate" ? "Making…" : "Make a new link"}</button>
          </div>
          <label className="tp-lock">
            <input type="checkbox" checked={!!link.domain} disabled={busy === "domain" || (!link.domain && !link.lockable)} onChange={(e) => toggleDomain(e.target.checked)} />
            <span>
              {link.domain
                ? <>Only <b>@{link.domain}</b> addresses can use the link.</>
                : link.lockable
                  ? <>Anyone with the link can join. Tick to allow only <b>@{link.lockable}</b> addresses.</>
                  : <>Anyone with the link can join. Your lead&rsquo;s address is on a free email provider, so there is no firm domain to lock it to.</>}
              {" "}If the link ends up somewhere it should not, make a new one and the old one stops working at once.
            </span>
          </label>
        </div>
      )}

      <div className="tp-stats">
        <div className="cf-card tp-stat">
          <b>{claimed}</b>
          <span>{claimed === 1 ? "person has" : "people have"} signed in</span>
        </div>
        <div className="cf-card tp-stat">
          <b>{started}</b>
          <span>{started === 1 ? "has" : "have"} started a course</span>
        </div>
        {tracks.map((t) => (
          <div key={t.slug} className="cf-card tp-stat">
            <b>{finishedOn(t.slug)}</b>
            <span>finished {t.name}</span>
          </div>
        ))}
      </div>

      {!profileSet && role === "ADMIN" && tab !== "profile" && (
        <div className="cf-card tp-alert">
          <span><b>Set your firm&rsquo;s AI tools before you invite anyone.</b> Until you do, the AI courses name Microsoft 365 Copilot as your approved tool and personal ChatGPT as not allowed. It takes two minutes.</span>
          <button type="button" className="cf-btn" onClick={() => setTab("profile")}>Open the firm profile</button>
        </div>
      )}

      <div className="tp-tabs">
        {(["people", "missing", "invite", "profile"] as const).map((t) => (
          <button key={t} type="button" className={`tp-tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t === "people" ? `People (${people})` : t === "missing" ? "Who hasn’t joined" : t === "invite" ? "Invite by email" : "Firm profile"}</button>
        ))}
        <a className="cf-btn tp-csv" href={api("/api/org/register", "format=csv")}>Download CSV</a>
        <button type="button" className="cf-btn" onClick={nudge} disabled={busy === "nudge"}>{busy === "nudge" ? "Sending…" : "Nudge everyone unfinished"}</button>
      </div>
      {note && <div className={`tp-note ${note.tone}`} role="status">{note.text}</div>}

      {tab === "people" && (
        <div className="cf-card tp-table-wrap">
          <table className="tp-table">
            <thead>
              <tr><th>Person</th><th className="tp-opt">Joined</th><th className="tp-opt">Desk</th>{tracks.map((t) => <th key={t.slug}>{t.name}</th>)}<th className="tp-opt">Last active</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const erased = row.email.endsWith("@removed.invalid");
                if (row.removedAt) {
                  return (
                    <tr key={row.seatId} className="tp-gone">
                      <td>
                        <b>{row.name ?? row.email}</b>
                        <small>{row.name ? `${row.email} · ` : ""}Removed {day(row.removedAt)}, seat given back</small>
                      </td>
                      <td className="tp-opt">{day(row.claimedAt)}</td>
                      <td className="tp-opt">{row.desk ? TRACK_LABEL[row.desk] : "—"}</td>
                      {tracks.map((t) => <td key={t.slug}><span className="tp-chip muted">Removed</span></td>)}
                      <td className="tp-opt">{day(row.lastActivity)}</td>
                      <td className="tp-actions"></td>
                    </tr>
                  );
                }
                return (
                  <tr key={row.seatId}>
                    <td>
                      <b>{erased ? "Removed at the person’s request" : row.name ?? row.email}</b>
                      <small>{erased ? "Seat used; data deleted" : row.name ? row.email : row.role === "ADMIN" ? "Admin invite" : "Not yet claimed"}</small>
                    </td>
                    <td className="tp-opt">{row.claimed ? day(row.claimedAt) : "Invited"}</td>
                    <td className="tp-opt">{row.desk ? TRACK_LABEL[row.desk] : "—"}</td>
                    {tracks.map((t) => <td key={t.slug}>{cell(row, t)}</td>)}
                    <td className="tp-opt">{day(row.lastActivity)}</td>
                    <td className="tp-actions">
                      {!row.claimed && (
                        <>
                          <button type="button" onClick={() => copy(row.inviteToken)}>{copied === row.inviteToken ? "Copied" : "Copy link"}</button>
                          <button type="button" onClick={() => resend(row.seatId)} disabled={busy === `resend-${row.seatId}`}>Resend</button>
                        </>
                      )}
                      {!erased && !isSelf(row) && <button type="button" onClick={() => remove(row)} disabled={busy === `remove-${row.seatId}`}>Remove</button>}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={5 + tracks.length} style={{ color: K.muted }}>Nobody has a seat yet. Send your team link round and people appear here as they join.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "missing" && (
        <div className="cf-card tp-form">
          <label className="cf-label" htmlFor="tp-staff">Paste your staff email list</label>
          <textarea id="tp-staff" value={staffList} onChange={(e) => setStaffList(e.target.value)} rows={6} placeholder={"One per line, or straight from a spreadsheet column or an email’s To line"} />
          {pasted.length === 0 && <p className="cf-note">We check the list against who has joined and show you who is still to come. Nothing is saved.</p>}
          {pasted.length > 0 && (
            <div className="tp-missing">
              <p className="tp-missing-sum">
                <b>{notJoined.length === 0 ? "Everyone on this list has joined." : `${notJoined.length} of ${pastedValid.length} ${notJoined.length === 1 ? "has" : "have"} not joined yet.`}</b>
                {pastedBad.length > 0 && <> {pastedBad.length} {pastedBad.length === 1 ? "line is not an email address and was" : "lines are not email addresses and were"} left out.</>}
              </p>
              {notJoined.length > 0 && (
                <ul className="tp-missing-list">
                  {notJoined.map((e) => <li key={e} className={offDomain.includes(e) ? "off" : ""}>{e}</li>)}
                </ul>
              )}
              {offDomain.length > 0 && <p className="cf-note">{offDomain.length} {offDomain.length === 1 ? "address is" : "addresses are"} outside @{lockDomain}, so the link would not let {offDomain.length === 1 ? "it" : "them"} in. Invite {offDomain.length === 1 ? "it" : "them"} by email instead, or switch the domain check off.</p>}
              {toRemind.length > left && <p className="cf-note">You have {left} {left === 1 ? "seat" : "seats"} left for {toRemind.length} people. The first {left} to open the link get one; buy more seats to cover everyone.</p>}
              {toRemind.length > 0 && link && (
                <button type="button" className="cf-btn cf-btn-pri" onClick={remind} disabled={busy === "remind"}>{busy === "remind" ? "Sending…" : `Send a reminder to ${toRemind.length}`}</button>
              )}
              <p className="cf-note">The reminder is the team link, under your name, with replies coming to you. Each address gets at most one a day.</p>
            </div>
          )}
        </div>
      )}

      {tab === "invite" && (
        <div className="cf-card tp-form">
          <label className="cf-label" htmlFor="tp-emails">Email addresses, one per line</label>
          <textarea id="tp-emails" value={emails} onChange={(e) => setEmails(e.target.value)} rows={6} placeholder={"hannah.price@yourfirm.co.uk\ntom.reid@yourfirm.co.uk"} />
          <div className="tp-row three">
            <label>Team <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Optional, e.g. Finance" /></label>
            <label>Desk <select value={track} onChange={(e) => setTrack(e.target.value as Track | "")}><option value="">Let them choose</option>{TRACKS.map((t) => <option key={t} value={t}>{TRACK_LABEL[t]}</option>)}</select></label>
            <label>Role <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "LEARNER" | "MANAGER" | "ADMIN")}><option value="LEARNER">Learner</option><option value="MANAGER">Manager (sees this page)</option>{role === "ADMIN" && <option value="ADMIN">Admin</option>}</select></label>
          </div>
          <p className="cf-note">For anyone you would rather invite by name, or someone outside your firm&rsquo;s domain. Each address takes one seat ({left} left) and gets its own link by email, under your name, with replies coming to you. Most firms simply share the team link above.</p>
          <button type="button" className="cf-btn cf-btn-pri" onClick={invite} disabled={busy === "invite" || !emails.trim()}>{busy === "invite" ? "Sending…" : "Send invites"}</button>
        </div>
      )}

      {tab === "profile" && (
        <div className="cf-card tp-form">
          <p className="cf-note" style={{ marginBottom: 8 }}>Your firm&rsquo;s rules for AI. AI Cleared teaches them and AI Fluent works inside them. One tool per line.</p>
          <div className="tp-row three">
            <label>Approved <textarea rows={4} value={lines(prof.approvedTools)} onChange={(e) => setProf({ ...prof, approvedTools: fromLines(e.target.value) })} placeholder="Microsoft 365 Copilot on your work account" /></label>
            <label>Ask first <textarea rows={4} value={lines(prof.askFirstTools)} onChange={(e) => setProf({ ...prof, askFirstTools: fromLines(e.target.value) })} placeholder="Claude Team" /></label>
            <label>Not allowed <textarea rows={4} value={lines(prof.bannedTools)} onChange={(e) => setProf({ ...prof, bannedTools: fromLines(e.target.value) })} placeholder="Personal ChatGPT" /></label>
          </div>
          <div className="tp-row three">
            <label>Who staff ask <input value={prof.escalationContact} onChange={(e) => setProf({ ...prof, escalationContact: e.target.value })} placeholder="Priya Nair" /></label>
            <label>Their role <input value={prof.escalationRole} onChange={(e) => setProf({ ...prof, escalationRole: e.target.value })} placeholder="Data Protection Officer" /></label>
            <label>Regulator <input value={prof.regulator} onChange={(e) => setProf({ ...prof, regulator: e.target.value })} placeholder="Optional" /></label>
          </div>
          <p className="cf-note" style={{ margin: "6px 0 8px" }}>Your names for the four classes of information, if they differ from ours.</p>
          <div className="tp-row four">
            <label>Public <input value={prof.classPublic} onChange={(e) => setProf({ ...prof, classPublic: e.target.value })} /></label>
            <label>Internal <input value={prof.classInternal} onChange={(e) => setProf({ ...prof, classInternal: e.target.value })} /></label>
            <label>Confidential <input value={prof.classConfidential} onChange={(e) => setProf({ ...prof, classConfidential: e.target.value })} /></label>
            <label>Restricted <input value={prof.classRestricted} onChange={(e) => setProf({ ...prof, classRestricted: e.target.value })} /></label>
          </div>
          <button type="button" className="cf-btn cf-btn-pri" onClick={save} disabled={busy === "profile" || !prof.escalationContact.trim()}>{busy === "profile" ? "Saving…" : "Save firm profile"}</button>
        </div>
      )}

      <style jsx>{`
        .tp-seats { display: flex; align-items: center; justify-content: space-between; gap: 14px 20px; flex-wrap: wrap; margin-bottom: 14px; }
        .tp-seats-count { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 14px; flex: 1; min-width: 240px; }
        .tp-seats-count b { font-family: ${K.display}; font-size: 26px; font-weight: 600; letter-spacing: -0.02em; color: ${K.ink}; }
        .tp-seats-count span { font-size: 16px; color: ${K.muted}; }
        .tp-meter { flex-basis: 100%; height: 8px; border-radius: 999px; background: ${K.sunk}; overflow: hidden; display: block; }
        .tp-meter span { display: block; height: 100%; border-radius: 999px; background: ${K.grad}; }
        .tp-link { margin-bottom: 18px; display: flex; flex-direction: column; gap: 12px; }
        .tp-link-say { margin: 0; font-size: 14.5px; line-height: 1.5; color: ${K.body}; max-width: 70ch; }
        .tp-link-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .tp-link-url { flex: 1; min-width: 0; font-family: ${K.mono}; font-size: 13px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 12px; padding: 12px 14px; }
        .tp-link-btn { padding: 11px 18px; font-size: 14px; }
        .tp-link-btn:disabled { opacity: 0.6; cursor: default; }
        .tp-lock { display: flex; gap: 10px; align-items: flex-start; font-size: 13.5px; line-height: 1.5; color: ${K.muted}; }
        .tp-lock input { margin-top: 3px; width: 16px; height: 16px; accent-color: ${K.accent}; flex-shrink: 0; }
        .tp-lock b { color: ${K.ink}; }
        .tp-missing { display: flex; flex-direction: column; gap: 10px; }
        .tp-missing-sum { margin: 0; font-size: 14.5px; color: ${K.body}; }
        .tp-missing-sum b { color: ${K.ink}; }
        .tp-missing-list { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px; max-height: 220px; overflow-y: auto; }
        .tp-missing-list li { font-family: ${K.mono}; font-size: 12px; color: ${K.ink}; background: ${K.sunk}; border-radius: 6px; padding: 4px 8px; }
        .tp-missing-list li.off { color: ${K.warn}; background: ${K.warnSoft}; }
        .tp-gone td { opacity: 0.6; }
        .tp-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 18px; }
        .tp-stat { display: flex; flex-direction: column; gap: 4px; padding: 16px 18px; }
        .tp-stat b { font-family: ${K.display}; font-size: 30px; font-weight: 600; letter-spacing: -0.02em; color: ${K.ink}; line-height: 1.1; }
        .tp-stat b small { font-size: 15px; font-weight: 500; color: ${K.muted}; letter-spacing: 0; }
        .tp-stat span { font-size: 13.5px; color: ${K.muted}; }
        .tp-alert { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 16px; margin-bottom: 14px; font-size: 14px; line-height: 1.5; border-left: 4px solid #b45309; }
        .tp-tabs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .tp-tab { font: inherit; font-size: 14px; font-weight: 600; color: ${K.ink}; background: ${K.glass}; border: 1px solid ${K.glassEdge}; border-radius: 999px; padding: 9px 15px; cursor: pointer; }
        .tp-tab.on { background: ${K.ink}; color: #fff; border-color: ${K.ink}; }
        .tp-csv { margin-left: auto; }
        .tp-note { padding: 10px 14px; border-radius: 10px; font-size: 14px; margin-bottom: 12px; }
        .tp-note.ok { background: ${K.okSoft}; color: ${K.ok}; }
        .tp-note.warn { background: ${K.warnSoft}; color: ${K.warn}; }
        .tp-table-wrap { padding: 6px 0; overflow-x: auto; }
        .tp-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 820px; }
        .tp-table th { text-align: left; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${K.faint}; padding: 10px 14px; border-bottom: 1px solid ${K.edgeSoft}; font-weight: 600; white-space: nowrap; }
        .tp-table td { padding: 11px 14px; border-bottom: 1px solid ${K.edgeSoft}; color: ${K.body}; vertical-align: middle; }
        .tp-table td b { display: block; color: ${K.ink}; font-weight: 600; }
        .tp-table td small { display: block; color: ${K.faint}; font-size: 12px; }
        .tp-actions { min-width: 150px; }
        .tp-actions button { white-space: nowrap; }
        .tp-actions button { font: inherit; font-size: 12.5px; color: ${K.accentInk}; background: none; border: none; cursor: pointer; padding: 2px 6px; text-decoration: underline; text-underline-offset: 3px; }
        .tp-actions button:disabled { opacity: 0.5; }
        .tp-form { display: flex; flex-direction: column; gap: 12px; }
        .tp-form textarea, .tp-form input, .tp-form select { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 9px 12px; }
        .tp-form textarea:focus, .tp-form input:focus, .tp-form select:focus { outline: none; border-color: rgba(87,68,201,0.5); box-shadow: 0 0 0 4px rgba(87,68,201,0.12); }
        .tp-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        .tp-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .tp-row.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .tp-form .cf-btn { align-self: flex-start; }
        @media (max-width: 760px) { .tp-row, .tp-row.four { grid-template-columns: 1fr; } .tp-csv { margin-left: 0; } .tp-opt { display: none; } .tp-table { min-width: 0; } .tp-link-url { flex-basis: 100%; } .tp-link-btn { flex: 1; } .tp-seats .cf-btn { width: 100%; } }
      `}</style>
      {/* Global, because the cells come from a helper and styled-jsx does
          not scope JSX built outside the returned tree. tp- keeps them ours. */}
      <style jsx global>{`
        .tp-chip { display: inline-block; font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; border-radius: 6px; padding: 3px 8px; white-space: nowrap; }
        .tp-chip.ok { color: ${K.ok}; background: ${K.okSoft}; }
        .tp-chip.muted { color: ${K.muted}; background: ${K.sunk}; }
        .tp-prog { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
        .tp-bar { display: inline-block; width: 64px; height: 6px; border-radius: 999px; background: ${K.sunk}; overflow: hidden; }
        .tp-bar span { display: block; height: 100%; border-radius: 999px; background: ${K.grad}; }
        .tp-prog-n { font-family: ${K.mono}; font-size: 11px; font-weight: 700; color: ${K.accentInk}; }
      `}</style>
    </div>
  );
}
