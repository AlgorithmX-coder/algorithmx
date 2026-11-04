import Link from "next/link";
import { listIndividuals, platformIndividualTotals } from "@/app/lib/individualOps";
import { K } from "../adminTokens";

/* /admin/individuals: everyone who signed up for a course directly,
 * staff-wide. Read-only - individuals sign themselves up, staff don't
 * create them, so there's no "add" form here like the other two tabs. */
export const dynamic = "force-dynamic";

export default async function AdminIndividualsPage() {
  const rows = await listIndividuals();
  const t = platformIndividualTotals(rows);
  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div>
      <h1 className="ad-h1">{t.individuals} individual{t.individuals === 1 ? "" : "s"}</h1>
      <p className="ad-note">
        {t.withChildren} with a child profile &middot; {t.entitlements} course entitlement{t.entitlements === 1 ? "" : "s"} across them all.
      </p>
      <p className="ad-note">
        Worth knowing: today every consumer course is free on signup or a zero-payment click-through (real card payment for Cyber Pro is still pending) - &ldquo;Bought&rdquo; below records how they got access, not that money changed hands yet.
      </p>

      <div className="ad-card ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>Person</th><th>Courses</th><th>Children</th><th>Signed up</th><th>Last active</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td><Link href={`/admin/individuals/${r.id}`}><b>{r.name ?? r.email}</b></Link><small>{r.name ? r.email : ""}</small></td>
                <td>{r.products.map((p) => p.name).join(", ") || "—"}</td>
                <td>{r.children.length ? r.children.map((c) => c.name).join(", ") : "—"}</td>
                <td>{day(r.createdAt)}</td>
                <td>{day(r.lastActive)}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} style={{ color: K.muted }}>No individual sign-ups yet.</td></tr>}
          </tbody>
        </table>
      </div>

      <style>{`
        .ad-h1 { font-family: ${K.display}; font-size: 24px; margin: 0 0 6px; color: ${K.ink}; }
        .ad-note { font-size: 13.5px; color: ${K.muted}; margin: 0 0 8px; max-width: 70ch; }
        .ad-card { background: ${K.panel}; border: 1px solid ${K.edge}; border-radius: 14px; margin-top: 10px; }
        .ad-table-wrap { padding: 6px 0; overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 760px; }
        .ad-table th { text-align: left; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${K.faint}; padding: 10px 12px; border-bottom: 1px solid ${K.edgeSoft}; font-weight: 600; }
        .ad-table td { padding: 11px 12px; border-bottom: 1px solid ${K.edgeSoft}; color: ${K.body}; vertical-align: top; }
        .ad-table td a { text-decoration: none; }
        .ad-table td b { display: block; color: ${K.ink}; font-weight: 600; }
        .ad-table td small { display: block; color: ${K.faint}; font-size: 12px; }
      `}</style>
    </div>
  );
}
