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
 * get the same panel with `orgId` set. */

type Tab = "people" | "invite" | "profile";

export default function TeamPanel({
  firmName,
  role,
  seatsPurchased,
  tracks,
  rows,
  profile,
  profileSet = true,
  orgId,
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

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  /* Every call names the firm when staff are acting on it. */
  const api = (path: string, extra = "") => `${path}?${orgId ? `org=${encodeURIComponent(orgId)}&` : ""}${extra}`.replace(/[?&]$/, "");
  const people = rows.length;
  const left = Math.max(0, seatsPurchased - people);
  const claimed = rows.filter((r) => r.claimed).length;
  const started = rows.filter((r) => Object.values(r.progress).some((p) => p && p.done > 0)).length;
  const finishedOn = (slug: TeamTrack["slug"]) => rows.filter((r) => r.progress[slug]?.complete).length;

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
  const remove = (seatId: string) => call(`remove-${seatId}`, () => fetch(api("/api/org/seats"), { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seatId }) }), () => "Seat removed. It is free to give to someone else.");
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

      <div className="tp-stats">
        <div className="cf-card tp-stat">
          <b>{people} <small>of {seatsPurchased}</small></b>
          <span>seats given out{left > 0 ? `, ${left} left` : ", none left"}</span>
        </div>
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
        {(["people", "invite", "profile"] as const).map((t) => (
          <button key={t} type="button" className={`tp-tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t === "people" ? `People (${people})` : t === "invite" ? "Invite people" : "Firm profile"}</button>
        ))}
        <a className="cf-btn tp-csv" href={api("/api/org/register", "format=csv")}>Download CSV</a>
        <button type="button" className="cf-btn" onClick={nudge} disabled={busy === "nudge"}>{busy === "nudge" ? "Sending…" : "Nudge everyone unfinished"}</button>
      </div>
      {note && <div className={`tp-note ${note.tone}`} role="status">{note.text}</div>}

      {tab === "people" && (
        <div className="cf-card tp-table-wrap">
          <table className="tp-table">
            <thead>
              <tr><th>Person</th><th className="tp-opt">Team</th><th className="tp-opt">Desk</th>{tracks.map((t) => <th key={t.slug}>{t.name}</th>)}<th className="tp-opt">Last activity</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const removed = row.email.endsWith("@removed.invalid");
                return (
                  <tr key={row.seatId}>
                    <td>
                      <b>{removed ? "Removed at the person’s request" : row.name ?? row.email}</b>
                      <small>{removed ? "Seat used; data deleted" : row.name ? row.email : row.role === "ADMIN" ? "Admin invite" : "Not yet claimed"}</small>
                    </td>
                    <td className="tp-opt">{row.team ?? "—"}</td>
                    <td className="tp-opt">{row.desk ? TRACK_LABEL[row.desk] : "—"}</td>
                    {tracks.map((t) => <td key={t.slug}>{cell(row, t)}</td>)}
                    <td className="tp-opt">{row.lastActivity ? new Date(row.lastActivity).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</td>
                    <td className="tp-actions">
                      {!row.claimed && (
                        <>
                          <button type="button" onClick={() => copy(row.inviteToken)}>{copied === row.inviteToken ? "Copied" : "Copy link"}</button>
                          <button type="button" onClick={() => resend(row.seatId)} disabled={busy === `resend-${row.seatId}`}>Resend</button>
                          <button type="button" onClick={() => remove(row.seatId)} disabled={busy === `remove-${row.seatId}`}>Remove</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan={5 + tracks.length} style={{ color: K.muted }}>Nobody has a seat yet. Invite people from the next tab.</td></tr>}
            </tbody>
          </table>
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
          <p className="cf-note">Each address takes one seat ({left} left) and gets its own link by email, under your name, with replies coming to you. The seat opens every course. You can also copy links from the register.</p>
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
        .tp-actions { white-space: nowrap; }
        .tp-actions button { font: inherit; font-size: 12.5px; color: ${K.accentInk}; background: none; border: none; cursor: pointer; padding: 2px 6px; text-decoration: underline; text-underline-offset: 3px; }
        .tp-actions button:disabled { opacity: 0.5; }
        .tp-form { display: flex; flex-direction: column; gap: 12px; }
        .tp-form textarea, .tp-form input, .tp-form select { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 9px 12px; }
        .tp-form textarea:focus, .tp-form input:focus, .tp-form select:focus { outline: none; border-color: rgba(87,68,201,0.5); box-shadow: 0 0 0 4px rgba(87,68,201,0.12); }
        .tp-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        .tp-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .tp-row.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .tp-form .cf-btn { align-self: flex-start; }
        @media (max-width: 760px) { .tp-row, .tp-row.four { grid-template-columns: 1fr; } .tp-csv { margin-left: 0; } .tp-opt { display: none; } .tp-table { min-width: 0; } }
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
