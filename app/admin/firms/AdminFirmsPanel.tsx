"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* New firm, with an optional trial grant layered on right after creation
 * - the same "add customer" action covers a real deal and a trial,
 * exactly as discussed: fill the form once, flip a switch for trial vs
 * licensed. Posts to the existing /api/ops/firms (no AI-Cleared-specific
 * logic in it, so no reason to clone it for /admin) then, if asked,
 * /api/admin/trial. */
export default function AdminFirmsPanel() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", sector: "", contactName: "", contactRole: "", plan: "TEAM", seatsPurchased: "10", fluentSeatsPurchased: "0", adminEmail: "" });
  const [trial, setTrial] = useState(false);
  const [trialDays, setTrialDays] = useState<"1" | "2">("2");
  const [busy, setBusy] = useState(false);
  const [made, setMade] = useState<{ name: string; slug: string; link: string; emailed: boolean; trialDays?: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  async function create() {
    setBusy(true);
    setErr(null);
    setMade(null);
    try {
      const res = await fetch("/api/ops/firms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, seatsPurchased: trial ? 1 : Number(f.seatsPurchased), fluentSeatsPurchased: Number(f.fluentSeatsPurchased) || 0 }),
      });
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) throw new Error((j.error as string) ?? "Something went wrong.");
      let grantedDays: number | undefined;
      if (trial) {
        const tRes = await fetch("/api/admin/trial", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: j.slug, days: Number(trialDays) }) });
        if (tRes.ok) grantedDays = Number(trialDays);
      }
      setMade({ name: j.name as string, slug: j.slug as string, link: j.link as string, emailed: !!j.emailed, trialDays: grantedDays });
      setF({ name: "", sector: "", contactName: "", contactRole: "", plan: "TEAM", seatsPurchased: "10", fluentSeatsPurchased: "0", adminEmail: "" });
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
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

  return (
    <div className="ad-card ad-form">
      <h2 className="ad-h2">New firm</h2>
      <p className="ad-note">For an invoiced deal, a test firm, or a trial. The admin gets the invite by email, and the link shows here too.</p>
      <div className="ad-row">
        <label>Firm name <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Kestrel Mutual" /></label>
        <label>Sector <input value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Insurance" /></label>
      </div>
      <div className="ad-row">
        <label>Contact name <input value={f.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Who staff ask" /></label>
        <label>Contact role <input value={f.contactRole} onChange={(e) => set("contactRole", e.target.value)} placeholder="Data Protection Officer" /></label>
      </div>
      <label className="ad-check">
        <input type="checkbox" checked={trial} onChange={(e) => setTrial(e.target.checked)} /> Grant a trial instead of licensing seats now
      </label>
      {trial ? (
        <label>Trial length <select value={trialDays} onChange={(e) => setTrialDays(e.target.value as "1" | "2")}><option value="1">1 day</option><option value="2">2 days</option></select></label>
      ) : (
        <div className="ad-row three">
          <label>Plan <select value={f.plan} onChange={(e) => set("plan", e.target.value)}><option value="TEAM">Team (10 to 49)</option><option value="FIRM">Firm (50 to 249)</option><option value="ENTERPRISE">Enterprise</option></select></label>
          <label>Cleared seats <input type="number" min={1} value={f.seatsPurchased} onChange={(e) => set("seatsPurchased", e.target.value)} /></label>
          <label>Fluent seats <input type="number" min={0} value={f.fluentSeatsPurchased} onChange={(e) => set("fluentSeatsPurchased", e.target.value)} /></label>
        </div>
      )}
      <label>Admin / trial contact email <input type="email" value={f.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} placeholder="admin@firm.co.uk" /></label>
      <button type="button" className="ad-btn ad-btn-pri" onClick={create} disabled={busy || !f.name.trim() || !f.adminEmail.trim()}>{busy ? "Creating…" : trial ? "Create trial firm and invite" : "Create firm and admin invite"}</button>
      {made && (
        <div className="ad-made">
          <b>{made.name} is set up{made.trialDays ? `, on a ${made.trialDays}-day trial` : ""}.</b> Invite link{made.emailed ? ", also emailed" : " (email not sent, copy it)"}:
          <code>{made.link}</code>
          <span>
            <button type="button" className="ad-btn" onClick={() => copy(made.link)}>{copied ? "Copied" : "Copy link"}</button>
            <a className="ad-btn" href={`/ai-cleared/ops/${made.slug}`}>Open the firm</a>
          </span>
        </div>
      )}
      {err && <div className="ad-err">{err}</div>}
    </div>
  );
}
