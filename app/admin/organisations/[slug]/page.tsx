import LearnerOrgDetail from "../../LearnerOrgDetail";

/* /admin/organisations/[slug]: one youth club, council, charity or training
 * provider. The same screen as a school's, with a different vocabulary. */
export const dynamic = "force-dynamic";

export default async function AdminOrganisationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LearnerOrgDetail slug={slug} kind="ORGANISATION" />;
}
