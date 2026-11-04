import Link from "next/link";
import { notFound } from "next/navigation";
import { getIndividual } from "@/app/lib/individualOps";
import { K } from "../../adminTokens";

/* /admin/individuals/[id]: one person - their courses, how they got
 * each one, and any family children on their account. */
export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = { PURCHASE: "Bought (no payment taken yet)", MANUAL: "Free / staff-granted", BUNDLE: "Bundle" };

export default async function AdminIndividualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getIndividual(id);
  if (!person) notFound();

  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div>
      <p className="ad-back"><Link href="/admin/individuals">All individuals</Link></p>
      <h1 className="ad-h1">{person.name ?? person.email}</h1>
      <p className="ad-note">
        {person.name ? person.email : "No name on file"} &middot; signed up {day(person.createdAt)} &middot; last active {day(person.lastActive)}
      </p>

      <div className="ad-card ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>Course</th><th>How they got it</th><th>Granted</th></tr>
          </thead>
          <tbody>
            {person.products.map((p) => (
              <tr key={p.slug}>
                <td><b>{p.name}</b></td>
                <td>{SOURCE_LABEL[p.source] ?? p.source}</td>
                <td>{day(p.grantedAt)}</td>
              </tr>
            ))}
            {person.products.length === 0 && <tr><td colSpan={3} style={{ color: K.muted }}>No courses.</td></tr>}
          </tbody>
        </table>
      </div>

      {person.children.length > 0 && (
        <div className="ad-card ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr><th>Child</th></tr>
            </thead>
            <tbody>
              {person.children.map((c) => (
                <tr key={c.id}><td><b>{c.name}</b></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .ad-back { margin: 0 0 10px; font-size: 13px; }
        .ad-back a { color: ${K.accentInk}; text-decoration: none; }
        .ad-h1 { font-family: ${K.display}; font-size: 24px; margin: 0 0 6px; color: ${K.ink}; }
        .ad-note { font-size: 13.5px; color: ${K.muted}; margin: 0 0 8px; }
        .ad-card { background: ${K.panel}; border: 1px solid ${K.edge}; border-radius: 14px; margin-top: 10px; }
        .ad-table-wrap { padding: 6px 0; overflow-x: auto; }
        .ad-table { width: 100%; border-collapse: collapse; font-size: 13.5px; min-width: 420px; }
        .ad-table th { text-align: left; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${K.faint}; padding: 10px 12px; border-bottom: 1px solid ${K.edgeSoft}; font-weight: 600; }
        .ad-table td { padding: 11px 12px; border-bottom: 1px solid ${K.edgeSoft}; color: ${K.body}; vertical-align: top; }
        .ad-table td b { color: ${K.ink}; font-weight: 600; }
      `}</style>
    </div>
  );
}
