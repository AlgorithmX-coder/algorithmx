import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getIndividual } from "@/app/lib/individualOps";
import { prisma } from "@/app/lib/prisma";
import { IndividualsIcon } from "../../icons";
import { courseColor } from "../../courseColors";
import RevokeEntitlementButton from "./RevokeEntitlementButton";
import GrantCourseButton from "./GrantCourseButton";

/* /admin/individuals/[id]: one person - their courses, how they got
 * each one, and any family children on their account. Styling in
 * ../../admin.css. */
export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = { PURCHASE: "Bought (no payment taken yet)", MANUAL: "Free / staff-granted", BUNDLE: "Bundle" };

export default async function AdminIndividualPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getIndividual(id);
  if (!person) notFound();

  /* Only what they do not already hold. Offering a course somebody bought
     would let a careless press rewrite a purchase as a freebie, which
     grantEntitlement refuses anyway: better not to offer it. */
  const held = new Set(person.products.map((p) => p.slug));
  const grantable = (
    await prisma.product.findMany({ orderBy: { name: "asc" }, select: { slug: true, name: true } })
  ).filter((p) => !held.has(p.slug));

  const day = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—");

  return (
    <div>
      <p className="ad-back"><Link href="/admin/individuals">All individuals</Link></p>
      <span className="ad-eyebrow individuals"><IndividualsIcon /> Individual</span>
      <h1 className="ad-h1">{person.name ?? person.email}</h1>
      <p className="ad-note">
        {person.name ? person.email : "No name on file"} &middot; signed up {day(person.createdAt)} &middot; last active {day(person.lastActive)}
      </p>

      <div className="ad-card ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr><th>Course</th><th>How they got it</th><th>Granted</th><th></th></tr>
          </thead>
          <tbody>
            {person.products.map((p) => (
              <tr key={p.slug}>
                <td><span className="ad-course" style={{ "--c": courseColor(p.name) } as CSSProperties}>{p.name}</span></td>
                <td>{SOURCE_LABEL[p.source] ?? p.source}</td>
                <td>{day(p.grantedAt)}</td>
                <td><RevokeEntitlementButton userId={person.id} productSlug={p.slug} courseName={p.name} /></td>
              </tr>
            ))}
            {person.products.length === 0 && <tr><td colSpan={4} className="ad-empty">No courses.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* The other half of Revoke, which shipped on its own: there was no
          way to GIVE anybody a course from here. It is also what makes
          gating a course safe, since a tester shut out by a new gate can be
          let back in from this box. */}
      <div className="ad-card ad-form" style={{ padding: "16px 20px" }}>
        <h2 className="ad-h2" style={{ margin: 0 }}>Course access</h2>
        <GrantCourseButton userId={person.id} courses={grantable} />
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
