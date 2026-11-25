import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jobBySlug } from "../jobs";
import OfficeJob from "./OfficeJob";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * /desk-ready/office/[job] - one Desk Ready office job (the pretend office:
 * Outlook, File Explorer and Excel sharing one record, marked on the end
 * state). Gated on the Desk Ready entitlement like the rest of the course,
 * so it renders per request (no generateStaticParams); noindex until launch.
 */

export async function generateMetadata({ params }: { params: Promise<{ job: string }> }): Promise<Metadata> {
  const { job } = await params;
  const j = jobBySlug(job);
  return { title: j ? `On the job: ${j.title} | Desk Ready` : "Desk Ready", robots: { index: false, follow: false } };
}

export default async function DeskOfficeJobPage({ params }: { params: Promise<{ job: string }> }) {
  const { job } = await params;
  if (!jobBySlug(job)) notFound();
  await requireCourse("desk-ready", `/desk-ready/office/${job}`);
  return <OfficeJob slug={job} />;
}
