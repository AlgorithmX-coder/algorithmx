"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { K } from "../engine/tokens";
import { TRACKS, TRACK_LABEL, type Track } from "../engine/types";
import { COURSES, COURSE_SLUGS, type CourseSlug } from "../engine/courses";
import type { RegisterRow, ProfileInput } from "@/app/lib/aiClearedAdmin";

/* The admin console: firm standing, the register per course with CSV
 * export, invites, nudges, the firm profile. One page, four glass cards.
 * The course switch is a link, so the server renders the right rows. */

type Standing = { claimed: number; cleared: number; invited: number; pct: number; firmCleared: boolean };

export default function AdminPanel({
  firmName,
  role,
  seatsPurchased,
  fluentSeatsPurchased = 0,
  rows,
  standing,
  profile,
  orgId,
  course = "ai-cleared",
  basePath = "/ai-cleared/admin",
}: {
  firmName: string;
  role: "ADMIN" | "MANAGER" | "LEARNER";
  seatsPurchased: number;
  fluentSeatsPurchased?: number;
  rows: RegisterRow[];
  standing: Standing;
  profile: ProfileInput;
  /* Set when AlgorithmX staff act on a firm from the ops console. */
  orgId?: string;
  /* Which course the rows are for. */
  course?: CourseSlug;
  /* The page the course switch links to. */
  basePath?: string;
}) {
  const router = useRouter();
  const fluent = course === "ai-fluent";
  const c = COURSES[course];
  const [tab, setTab] = useState<"register" | "invite" | "profile">("register");
  const [emails, setEmails] = useState("");
  const [team, setTeam] = useState("");
  const [track, setTrack] = useState<Track | "">("");
  const [inviteRole, setInviteRole] = useState<"LEARNER" | "MANAGER" | "ADMIN">("LEARNER");
  const [inviteCourse, setInviteCourse] = useState<CourseSlug>(course);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [prof, setProf] = useState<ProfileInput>(profile);
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  /* Every call names the firm when staff are acting on it, and the course. */
  const api = (path: string, extra = "") => `${path}?${orgId ? `org=${encodeURIComponent(orgId)}&` : ""}course=${course}&${extra}`.replace(/[?&]$/, "");
  const licensed = fluent ? fluentSeatsPurchased : seatsPurchased;
  const used = rows.length;
  const pct = Math.round(standing.pct * 100);
  const r = 30;
  const circ = 2 * Math.PI * r;
  const doneWord = fluent ? "fluent" : "cleared";

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
    call("invite", () => fetch(api("/api/org/seats"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ emails: emails.split(/[\n,;]+/), team: team || null, track: track || null, role: inviteRole, course: inviteCourse }) }), (j) => {
      const created = (j.created as unknown[])?.length ?? 0;
      const skipped = (j.skipped as unknown[])?.length ?? 0;
      const failed = (j.emailFailed as unknown[])?.length ?? 0;
      setEmails("");
      return `${created} ${COURSES[inviteCourse].name} invite${created === 1 ? "" : "s"} created${skipped ? `, ${skipped} already had a seat on it` : ""}${failed ? `, ${failed} email${failed === 1 ? "" : "s"} could not be sent (copy the link from the register)` : ""}.${inviteCourse !== course ? ` Switch to the ${COURSES[inviteCourse].name} register to see them.` : ""}`;
    });
  const resend = (seatId: string) => call(`resend-${seatId}`, () => fetch(api("/api/org/seats"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resend: seatId }) }), () => "Invite sent again.");
  const remove = (seatId: string) => call(`remove-${seatId}`, () => fetch(api("/api/org/seats"), { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seatId }) }), () => "Seat removed.");
  const nudge = () => call("nudge", () => fetch(api("/api/org/nudge"), { method: "POST" }), (j) => `Reminder sent to ${j.sent as number} of ${j.eligible as number} people on ${c.name}, under your name.`);
  const save = () => call("profile", () => fetch(api("/api/org/profile"), { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(prof) }), () => "Firm profile saved. Modules 2, 3 and 5 read it from the next screen a learner opens.");

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
  const switchHref = (slug: CourseSlug) => `${basePath}?course=${slug}`;

  return (
    <div className="ad">
      <span className="cf-eyebrow">{orgId ? "Ops" : "Admin"} · {firmName}</span>
      <div className="ad-course" role="tablist" aria-label="Course">
        {COURSE_SLUGS.map((slug) => (
          <Link key={slug} href={switchHref(slug)} role="tab" aria-selected={slug === course} className={`ad-course-tab ${slug === course ? "on" : ""}`}>{COURSES[slug].name}</Link>
        ))}
        <span className="cf-note">{fluent ? "Seats for staff who hold an AI Cleared certificate." : "Everyone's safety course. The firm's standing is measured here."}</span>
      </div>
      <div className="ad-head">
        <svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={`${pct} percent of claimed seats ${doneWord}`}>
          <defs>
            <linearGradient id="adring" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0a7085" /><stop offset="58%" stopColor="#5744c9" /><stop offset="100%" stopColor="#a5117f" /></linearGradient>
          </defs>
          <circle cx="38" cy="38" r={r} fill="none" stroke={K.edge} strokeWidth="6" />
          <circle cx="38" cy="38" r={r} fill="none" stroke="url(#adring)" strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - standing.pct)} transform="rotate(-90 38 38)" />
          <text x="38" y="43" textAnchor="middle" fontFamily="var(--font-geist-mono), monospace" fontSize="13" fontWeight="700" fill={K.ink}>{pct}%</text>
        </svg>
        <div>
          <h1 className="cf-h1" style={{ marginBottom: 6 }}>{!fluent && standing.firmCleared ? <>{firmName} is <span className="cf-grad">AI Cleared</span>.</> : <>{standing.cleared} of {standing.claimed} {doneWord}.</>}</h1>
          <p className="cf-note">
            {licensed} {c.name} seats licensed · {used} invited · {standing.claimed} claimed · {standing.cleared} {doneWord}.{fluent ? " Fluent is individual: there is no firm-level bar." : ` The firm counts as cleared at 80% of claimed seats${standing.firmCleared ? "; you are there." : "."}`}
          </p>
        </div>
      </div>

      <div className="ad-tabs">
        {(["register", "invite", "profile"] as const).map((t) => (
          <button key={t} type="button" className={`ad-tab ${tab === t ? "on" : ""}`} onClick={() => setTab(t)}>{t === "register" ? `Register (${rows.length})` : t === "invite" ? "Invite people" : "Firm profile"}</button>
        ))}
        <a className="cf-btn ad-csv" href={api("/api/org/register", "format=csv")}>Download CSV</a>
        <button type="button" className="cf-btn" onClick={nudge} disabled={busy === "nudge"}>{busy === "nudge" ? "Sending…" : "Nudge everyone unfinished"}</button>
      </div>
      {note && <div className={`ad-note ${note.tone}`}>{note.text}</div>}

      {tab === "register" && (
        <div className="cf-card ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr><th>Person</th><th>Team</th><th>Desk</th><th>Progress</th><th>Score</th><th>Certificate</th><th>Last activity</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.seatId}>
                  <td>
                    <b>{row.email.endsWith("@removed.invalid") ? "Removed at the person\u2019s request" : row.name ?? row.email}</b>
                    <small>{row.email.endsWith("@removed.invalid") ? "Seat used; data deleted" : row.name ? row.email : row.role === "ADMIN" ? "Admin invite" : "Not yet claimed"}</small>
                  </td>
                  <td>{row.team ?? "—"}</td>
                  <td>{row.track ? TRACK_LABEL[row.track] : "—"}</td>
                  <td>
                    <span className={`ad-status ${row.status}`}>{row.status === "cleared" ? (fluent ? "Fluent" : "Cleared") : row.status === "started" ? `${row.modulesDone} of ${row.modulesTotal}` : "Invited"}</span>
                  </td>
                  <td>{row.finalScore !== null ? `${row.finalScore}%` : "—"}</td>
                  <td>{row.serial ? <a href={`/verify/${row.serial}`} target="_blank" rel="noopener noreferrer">{row.serial}</a> : "—"}</td>
                  <td>{row.lastActivity ? new Date(row.lastActivity).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</td>
                  <td className="ad-actions">
                    {row.status === "invited" && (
                      <>
                        <button type="button" onClick={() => copy(row.inviteToken)}>{copied === row.inviteToken ? "Copied" : "Copy link"}</button>
                        <button type="button" onClick={() => resend(row.seatId)} disabled={busy === `resend-${row.seatId}`}>Resend</button>
                        <button type="button" onClick={() => remove(row.seatId)} disabled={busy === `remove-${row.seatId}`}>Remove</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={8} style={{ color: K.muted }}>No {c.name} seats yet. Invite people from the next tab.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {tab === "invite" && (
        <div className="cf-card ad-form">
          <label className="cf-label" htmlFor="ad-emails">Email addresses, one per line</label>
          <textarea id="ad-emails" value={emails} onChange={(e) => setEmails(e.target.value)} rows={6} placeholder={"hannah.price@yourfirm.co.uk\ntom.reid@yourfirm.co.uk"} />
          <div className="ad-row four">
            <label>Course <select value={inviteCourse} onChange={(e) => setInviteCourse(e.target.value as CourseSlug)}>{COURSE_SLUGS.map((s) => <option key={s} value={s}>{COURSES[s].name}</option>)}</select></label>
            <label>Team <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder="Optional, e.g. Finance" /></label>
            <label>Desk <select value={track} onChange={(e) => setTrack(e.target.value as Track | "")}><option value="">Let them choose</option>{TRACKS.map((t) => <option key={t} value={t}>{TRACK_LABEL[t]}</option>)}</select></label>
            <label>Role <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as "LEARNER" | "MANAGER" | "ADMIN")}><option value="LEARNER">Learner</option><option value="MANAGER">Manager (sees the register)</option>{role === "ADMIN" && <option value="ADMIN">Admin</option>}</select></label>
          </div>
          <p className="cf-note">Each address gets its own link by email, under your name, with replies coming to you. You can also copy links from the register.{inviteCourse === "ai-fluent" ? " A Fluent seat opens only for a login that holds a valid AI Cleared certificate; invite anyone now and the link waits." : ""}</p>
          <button type="button" className="cf-btn cf-btn-pri" onClick={invite} disabled={busy === "invite" || !emails.trim()}>{busy === "invite" ? "Sending…" : `Send ${COURSES[inviteCourse].name} invites`}</button>
        </div>
      )}

      {tab === "profile" && (
        <div className="cf-card ad-form">
          <p className="cf-note" style={{ marginBottom: 8 }}>These are the rules Module 3 teaches and the situations resolve against. One tool per line. Both courses read them.</p>
          <div className="ad-row three">
            <label>Approved <textarea rows={4} value={lines(prof.approvedTools)} onChange={(e) => setProf({ ...prof, approvedTools: fromLines(e.target.value) })} placeholder="Microsoft 365 Copilot on your work account" /></label>
            <label>Ask first <textarea rows={4} value={lines(prof.askFirstTools)} onChange={(e) => setProf({ ...prof, askFirstTools: fromLines(e.target.value) })} placeholder="Claude Team" /></label>
            <label>Not allowed <textarea rows={4} value={lines(prof.bannedTools)} onChange={(e) => setProf({ ...prof, bannedTools: fromLines(e.target.value) })} placeholder="Personal ChatGPT" /></label>
          </div>
          <div className="ad-row three">
            <label>Who staff ask <input value={prof.escalationContact} onChange={(e) => setProf({ ...prof, escalationContact: e.target.value })} placeholder="Priya Nair" /></label>
            <label>Their role <input value={prof.escalationRole} onChange={(e) => setProf({ ...prof, escalationRole: e.target.value })} placeholder="Data Protection Officer" /></label>
            <label>Regulator <input value={prof.regulator} onChange={(e) => setProf({ ...prof, regulator: e.target.value })} placeholder="Optional" /></label>
          </div>
          <p className="cf-note" style={{ margin: "6px 0 8px" }}>Your names for the four classes, if they differ from ours.</p>
          <div className="ad-row four">
            <label>Public <input value={prof.classPublic} onChange={(e) => setProf({ ...prof, classPublic: e.target.value })} /></label>
            <label>Internal <input value={prof.classInternal} onChange={(e) => setProf({ ...prof, classInternal: e.target.value })} /></label>
            <label>Confidential <input value={prof.classConfidential} onChange={(e) => setProf({ ...prof, classConfidential: e.target.value })} /></label>
            <label>Restricted <input value={prof.classRestricted} onChange={(e) => setProf({ ...prof, classRestricted: e.target.value })} /></label>
          </div>
          <button type="button" className="cf-btn cf-btn-pri" onClick={save} disabled={busy === "profile" || !prof.escalationContact.trim()}>{busy === "profile" ? "Saving…" : "Save firm profile"}</button>
        </div>
      )}

      <style jsx>{`
        .ad-course { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        .ad-course .cf-note { margin-left: 6px; }
        .ad-head { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; margin-bottom: 18px; }
        .ad-tabs { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
        .ad-tab { font: inherit; font-size: 14px; font-weight: 600; color: ${K.ink}; background: ${K.glass}; border: 1px solid ${K.glassEdge}; border-radius: 999px; padding: 9px 15px; cursor: pointer; }
        .ad-tab.on { background: ${K.ink}; color: #fff; border-color: ${K.ink}; }
        .ad-csv { margin-left: auto; }
        .ad-note { padding: 10px 14px; border-radius: 10px; font-size: 14px; margin-bottom: 12px; }
        .ad-note.ok { background: ${K.okSoft}; color: ${K.ok}; }
        .ad-note.warn { background: ${K.warnSoft}; color: ${K.warn}; }
        .ad-table-wrap { padding: 6px 0; overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 820px; }
        .ad-table th { text-align: left; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${K.faint}; padding: 10px 14px; border-bottom: 1px solid ${K.edgeSoft}; font-weight: 600; }
        .ad-table td { padding: 11px 14px; border-bottom: 1px solid ${K.edgeSoft}; color: ${K.body}; vertical-align: top; }
        .ad-table td b { display: block; color: ${K.ink}; font-weight: 600; }
        .ad-table td small { display: block; color: ${K.faint}; font-size: 12px; }
        .ad-table a { color: ${K.accentInk}; }
        .ad-status { display: inline-block; font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; border-radius: 6px; padding: 3px 8px; }
        .ad-status.cleared { color: ${K.ok}; background: ${K.okSoft}; }
        .ad-status.started { color: ${K.accentInk}; background: ${K.accentSoft}; }
        .ad-status.invited { color: ${K.muted}; background: ${K.sunk}; }
        .ad-actions { white-space: nowrap; }
        .ad-actions button { font: inherit; font-size: 12.5px; color: ${K.accentInk}; background: none; border: none; cursor: pointer; padding: 2px 6px; text-decoration: underline; text-underline-offset: 3px; }
        .ad-actions button:disabled { opacity: 0.5; }
        .ad-form { display: flex; flex-direction: column; gap: 12px; }
        .ad-form textarea, .ad-form input, .ad-form select { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 9px 12px; }
        .ad-form textarea:focus, .ad-form input:focus, .ad-form select:focus { outline: none; border-color: rgba(87,68,201,0.5); box-shadow: 0 0 0 4px rgba(87,68,201,0.12); }
        .ad-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        .ad-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .ad-row.four { grid-template-columns: repeat(4, minmax(0, 1fr)); }
        .ad-form .cf-btn { align-self: flex-start; }
        @media (max-width: 760px) { .ad-row, .ad-row.four { grid-template-columns: 1fr; } .ad-csv { margin-left: 0; } .ad-course .cf-note { margin-left: 0; flex-basis: 100%; } }
      `}</style>
      <style jsx global>{`
        .ad-course-tab { font-size: 13.5px; font-weight: 600; color: ${K.muted}; background: ${K.glass}; border: 1px solid ${K.glassEdge}; border-radius: 999px; padding: 7px 14px; text-decoration: none; }
        .ad-course-tab.on { color: ${K.onAccent}; background: ${K.grad}; border-color: transparent; }
      `}</style>
    </div>
  );
}
