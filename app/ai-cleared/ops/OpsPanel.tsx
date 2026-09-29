"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { K } from "../engine/tokens";
import type { LookupHit } from "@/app/lib/aiClearedOps";

/* The two staff actions that need a form: create a firm by hand, and look
 * a certificate or a person up across every firm. */
export default function OpsPanel() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", sector: "", contactName: "", contactRole: "", plan: "TEAM", seatsPurchased: "10", adminEmail: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [made, setMade] = useState<{ name: string; slug: string; link: string; emailed: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<LookupHit[] | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  async function create() {
    setBusy("create");
    setErr(null);
    setMade(null);
    try {
      const res = await fetch("/api/ops/firms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, seatsPurchased: Number(f.seatsPurchased) }) });
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) throw new Error((j.error as string) ?? "Something went wrong.");
      setMade({ name: j.name as string, slug: j.slug as string, link: j.link as string, emailed: !!j.emailed });
      setF({ name: "", sector: "", contactName: "", contactRole: "", plan: "TEAM", seatsPurchased: "10", adminEmail: "" });
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  async function find() {
    setBusy("find");
    setErr(null);
    try {
      const res = await fetch(`/api/ops/lookup?q=${encodeURIComponent(q)}`);
      const j = (await res.json().catch(() => ({}))) as { hits?: LookupHit[]; error?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      setHits(j.hits ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setErr(`Copy this link: ${text}`);
    }
  };

  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div className="op-grid">
      <div className="cf-card op-form">
        <h2 className="op-h2">New firm</h2>
        <p className="cf-note">For an invoiced deal or a test firm. The admin gets the invite by email under your name, and the link shows here too.</p>
        <div className="op-row">
          <label>Firm name <input id="op-name" value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Kestrel Mutual" /></label>
          <label>Sector <input id="op-sector" value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Insurance" /></label>
        </div>
        <div className="op-row">
          <label>Contact name <input id="op-contact" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Who staff ask" /></label>
          <label>Contact role <input id="op-contact-role" value={f.contactRole} onChange={(e) => set("contactRole", e.target.value)} placeholder="Data Protection Officer" /></label>
        </div>
        <div className="op-row three">
          <label>Plan <select id="op-plan" value={f.plan} onChange={(e) => set("plan", e.target.value)}><option value="TEAM">Team (10 to 49)</option><option value="FIRM">Firm (50 to 249)</option><option value="ENTERPRISE">Enterprise</option></select></label>
          <label>Seats <input id="op-seats" type="number" min={1} value={f.seatsPurchased} onChange={(e) => set("seatsPurchased", e.target.value)} /></label>
          <label>Admin email <input id="op-admin" type="email" value={f.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} placeholder="admin@firm.co.uk" /></label>
        </div>
        <button type="button" className="cf-btn cf-btn-pri" onClick={create} disabled={busy === "create" || !f.name.trim() || !f.adminEmail.trim()}>{busy === "create" ? "Creating…" : "Create firm and admin invite"}</button>
        {made && (
          <div className="op-made">
            <b>{made.name} is set up.</b> Admin link{made.emailed ? ", also emailed" : " (email not sent, copy it)"}:
            <code>{made.link}</code>
            <span>
              <button type="button" className="cf-btn" onClick={() => copy(made.link)}>{copied ? "Copied" : "Copy link"}</button>
              <a className="cf-btn" href={`/ai-cleared/ops/${made.slug}`}>Open the firm</a>
            </span>
          </div>
        )}
      </div>

      <div className="cf-card op-form">
        <h2 className="op-h2">Look up</h2>
        <p className="cf-note">A certificate serial, or a person&rsquo;s email address, across every firm.</p>
        <div className="op-find">
          <input id="op-q" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") find(); }} placeholder="AXC-XXXX-XXXX or name@firm.co.uk" />
          <button type="button" className="cf-btn cf-btn-pri" onClick={find} disabled={busy === "find" || q.trim().length < 3}>{busy === "find" ? "Looking…" : "Find"}</button>
        </div>
        {hits && hits.length === 0 && <p className="cf-note">Nothing matches that.</p>}
        {hits && hits.length > 0 && (
          <ul className="op-hits">
            {hits.map((h, i) => (
              <li key={i}>
                <b>{h.name ?? h.email}</b>
                <span>{h.name ? h.email : ""} · <a href={`/ai-cleared/ops/${h.firmSlug}`}>{h.firm}</a> · {h.status === "cleared" ? "Cleared" : h.status === "started" ? `${h.modulesDone} modules cleared` : "Invited, not yet claimed"}</span>
                {h.serial && <span>Certificate <a href={`/verify/${h.serial}`} target="_blank" rel="noopener noreferrer">{h.serial}</a>, {h.score}%, issued {day(h.issuedAt)}, expires {day(h.expiresAt)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {err && <div className="op-err">{err}</div>}

      <style jsx>{`
        .op-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 18px; }
        .op-h2 { font-family: ${K.display}; font-size: 20px; margin: 0 0 4px; color: ${K.ink}; }
        .op-form { display: flex; flex-direction: column; gap: 12px; }
        .op-form input, .op-form select { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 9px 12px; }
        .op-form input:focus, .op-form select:focus { outline: none; border-color: rgba(87,68,201,0.5); box-shadow: 0 0 0 4px rgba(87,68,201,0.12); }
        .op-form label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        .op-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .op-row.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .op-form .cf-btn { align-self: flex-start; }
        .op-made { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 12px; background: ${K.okSoft}; color: ${K.ink}; font-size: 14px; }
        .op-made code { font-family: ${K.mono}; font-size: 12.5px; word-break: break-all; color: ${K.accentInk}; }
        .op-made span { display: flex; gap: 8px; flex-wrap: wrap; }
        .op-find { display: flex; gap: 8px; }
        .op-find input { flex: 1; }
        .op-hits { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
        .op-hits li { display: flex; flex-direction: column; gap: 2px; font-size: 14px; color: ${K.body}; padding: 10px 12px; border-radius: 10px; background: ${K.sunk}; }
        .op-hits b { color: ${K.ink}; }
        .op-hits a { color: ${K.accentInk}; }
        .op-err { grid-column: 1 / -1; padding: 10px 14px; border-radius: 10px; font-size: 14px; background: ${K.warnSoft}; color: ${K.warn}; }
        @media (max-width: 860px) { .op-grid, .op-row, .op-row.three { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
