import Link from "next/link";
import { notFound } from "next/navigation";
import { getIndividual } from "@/app/lib/individualOps";

/* /admin/individuals/[id]: one person - their courses, how they got
 * each one, and any family children on their account. Styling in
 * ../../admin.css. */
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
            {person.products.length === 0 && <tr><td colSpan={3} className="ad-empty">No courses.</td></tr>}
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
    </div>
  );
}
