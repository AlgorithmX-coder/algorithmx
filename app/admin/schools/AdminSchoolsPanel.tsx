"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { K } from "../adminTokens";

/* New school, with the same optional trial-grant switch as AdminFirmsPanel
 * - one form covers a real licence and a trial. Posts to
 * /api/admin/schools (which creates the Organisation + SchoolProfile +
 * first teacher invite - no Class yet, that needs a real teacher first)
 * then, if asked, /api/admin/trial. */
export default function AdminSchoolsPanel() {
  const router = useRouter();
  const [f, setF] = useState({ name: "", sector: "", contactName: "", contactRole: "", safeguardingContact: "", childLineNumber: "", seatsPurchased: "50", teacherEmail: "" });
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
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, seatsPurchased: trial ? 30 : Number(f.seatsPurchased) }),
      });
      const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) throw new Error((j.error as string) ?? "Something went wrong.");
      let grantedDays: number | undefined;
      if (trial) {
        const tRes = await fetch("/api/admin/trial", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: j.slug, days: Number(trialDays) }) });
        if (tRes.ok) grantedDays = Number(trialDays);
      }
      setMade({ name: j.name as string, slug: j.slug as string, link: j.link as string, emailed: !!j.emailed, trialDays: grantedDays });
      setF({ name: "", sector: "", contactName: "", contactRole: "", safeguardingContact: "", childLineNumber: "", seatsPurchased: "50", teacherEmail: "" });
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
      <h2 className="ad-h2">New school</h2>
      <p className="ad-note">For a licence deal, a test school, or a trial. The first teacher gets the invite by email, and the link shows here too.</p>
      <div className="ad-row">
        <label>School name <input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Oakwood Primary" /></label>
        <label>Sector <input value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Primary school" /></label>
      </div>
      <div className="ad-row">
        <label>Contact name <input value={f.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Head of computing" /></label>
        <label>Contact role <input value={f.contactRole} onChange={(e) => set("contactRole", e.target.value)} placeholder="Head of Computing" /></label>
      </div>
      <div className="ad-row">
        <label>Safeguarding contact <input value={f.safeguardingContact} onChange={(e) => set("safeguardingContact", e.target.value)} placeholder="Who the course's safeguarding briefings name" /></label>
        <label>Child line number <input value={f.childLineNumber} onChange={(e) => set("childLineNumber", e.target.value)} placeholder="Optional" /></label>
      </div>
      <label className="ad-check">
        <input type="checkbox" checked={trial} onChange={(e) => setTrial(e.target.checked)} /> Grant a trial instead of licensing pupil places now
      </label>
      {trial ? (
        <label>Trial length <select value={trialDays} onChange={(e) => setTrialDays(e.target.value as "1" | "2")}><option value="1">1 day</option><option value="2">2 days</option></select></label>
      ) : (
        <label>Pupil places <input type="number" min={1} value={f.seatsPurchased} onChange={(e) => set("seatsPurchased", e.target.value)} /></label>
      )}
      <label>First teacher&rsquo;s email <input type="email" value={f.teacherEmail} onChange={(e) => set("teacherEmail", e.target.value)} placeholder="teacher@school.sch.uk" /></label>
      <button type="button" className="ad-btn ad-btn-pri" onClick={create} disabled={busy || !f.name.trim() || !f.teacherEmail.trim()}>{busy ? "Creating…" : trial ? "Create trial school and invite" : "Create school and teacher invite"}</button>
      {made && (
        <div className="ad-made">
          <b>{made.name} is set up{made.trialDays ? `, on a ${made.trialDays}-day trial` : ""}.</b> Invite link{made.emailed ? ", also emailed" : " (email not sent, copy it)"}:
          <code>{made.link}</code>
          <span>
            <button type="button" className="ad-btn" onClick={() => copy(made.link)}>{copied ? "Copied" : "Copy link"}</button>
            <a className="ad-btn" href={`/admin/schools/${made.slug}`}>Open the school</a>
          </span>
        </div>
      )}
      {err && <div className="ad-err">{err}</div>}

      <style jsx>{`
        .ad-form { margin-top: 18px; padding: 18px; display: flex; flex-direction: column; gap: 12px; max-width: 640px; }
        .ad-h2 { font-family: ${K.display}; font-size: 20px; margin: 0 0 4px; color: ${K.ink}; }
        .ad-note { font-size: 13px; color: ${K.muted}; margin: 0; }
        .ad-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        input, select { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 9px 12px; }
        .ad-check { flex-direction: row; align-items: center; gap: 8px; font-size: 13.5px; color: ${K.body}; }
        .ad-check input { width: auto; }
        .ad-btn { align-self: flex-start; font-size: 13.5px; font-weight: 600; padding: 9px 16px; border-radius: 10px; border: 1px solid ${K.edge}; background: ${K.panel}; color: ${K.ink}; cursor: pointer; text-decoration: none; display: inline-block; }
        .ad-btn-pri { background: ${K.accent}; border-color: ${K.accent}; color: ${K.onAccent}; }
        .ad-btn:disabled { opacity: 0.5; cursor: default; }
        .ad-made { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; border-radius: 12px; background: ${K.okSoft}; color: ${K.ink}; font-size: 14px; }
        .ad-made code { font-family: ${K.mono}; font-size: 12.5px; word-break: break-all; color: ${K.accentInk}; }
        .ad-made span { display: flex; gap: 8px; flex-wrap: wrap; }
        .ad-err { padding: 10px 14px; border-radius: 10px; font-size: 14px; background: ${K.warnSoft}; color: ${K.warn}; }
      `}</style>
    </div>
  );
}
