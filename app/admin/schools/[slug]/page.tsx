import LearnerOrgDetail from "../../LearnerOrgDetail";

/* /admin/schools/[slug]: one school, staff-wide. The screen itself is
 * shared with /admin/organisations/[slug] - same record, same machinery,
 * different words - so it lives in ../../LearnerOrgDetail.tsx. */
export const dynamic = "force-dynamic";

export default async function AdminSchoolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LearnerOrgDetail slug={slug} kind="SCHOOL" />;
}
