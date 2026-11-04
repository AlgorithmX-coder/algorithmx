import Link from "next/link";
import { listIndividuals, platformIndividualTotals } from "@/app/lib/individualOps";

/* /admin/individuals: everyone who signed up for a course directly,
 * staff-wide. Read-only - individuals sign themselves up, staff don't
 * create them, so there's no "add" form here like the other two tabs.
 * Styling in ../admin.css. */
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
            {rows.length === 0 && <tr><td colSpan={5} className="ad-empty">No individual sign-ups yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
