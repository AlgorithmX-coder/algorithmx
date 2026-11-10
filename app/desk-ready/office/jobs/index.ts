import type { Job } from "../types";
import { decemberRota } from "./decemberRota";
import { lateDelivery } from "./lateDelivery";
import { mondayInbox } from "./mondayInbox";
import { morningReport } from "./morningReport";
import { bestCustomer, oddNumber } from "./numbersMean";
import { lateCount, sheetTotals, vatQuote } from "./sheetMaths";
import { stockCount } from "./stockCount";

/* Every office job, in course order. A module page lists its own jobs
 * under "On the job"; the route /desk-ready/office/[slug] runs one. */
export const JOBS: readonly Job[] = [mondayInbox, lateDelivery, stockCount, decemberRota, morningReport, sheetTotals, vatQuote, lateCount, bestCustomer, oddNumber];

export const jobBySlug = (slug: string) => JOBS.find((j) => j.slug === slug);
export const jobsFor = (moduleId: string) => JOBS.filter((j) => j.moduleId === moduleId);
