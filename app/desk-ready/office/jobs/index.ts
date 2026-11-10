import type { Job } from "../types";
import { lateDelivery } from "./lateDelivery";
import { mondayInbox } from "./mondayInbox";
import { morningReport } from "./morningReport";

/* Every office job, in course order. A module page lists its own jobs
 * under "On the job"; the route /desk-ready/office/[slug] runs one. */
export const JOBS: readonly Job[] = [mondayInbox, lateDelivery, morningReport];

export const jobBySlug = (slug: string) => JOBS.find((j) => j.slug === slug);
export const jobsFor = (moduleId: string) => JOBS.filter((j) => j.moduleId === moduleId);
