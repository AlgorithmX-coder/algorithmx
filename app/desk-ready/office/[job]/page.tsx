import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JOBS, jobBySlug } from "../jobs";
import OfficeJob from "./OfficeJob";

/**
 * /desk-ready/office/[job] - one Desk Ready office job (the pretend office:
 * Outlook, File Explorer and Excel sharing one record, marked on the end
 * state). Open during UAT like the rest of the course; noindex until launch.
 */
export function generateStaticParams() {
  return JOBS.map((j) => ({ job: j.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ job: string }> }): Promise<Metadata> {
  const { job } = await params;
  const j = jobBySlug(job);
  return { title: j ? `On the job: ${j.title} | Desk Ready` : "Desk Ready", robots: { index: false, follow: false } };
}

export default async function DeskOfficeJobPage({ params }: { params: Promise<{ job: string }> }) {
  const { job } = await params;
  if (!jobBySlug(job)) notFound();
  return <OfficeJob slug={job} />;
}
