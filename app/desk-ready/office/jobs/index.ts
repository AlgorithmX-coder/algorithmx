import type { Job } from "../types";
import { decemberRota } from "./decemberRota";
import { lateDelivery } from "./lateDelivery";
/* Module 3 */
import { chatOrEmail, rotaCall, stockMeeting } from "./meetingsMessages";
import { mondayInbox } from "./mondayInbox";
import { morningReport } from "./morningReport";
import { bestCustomer, oddNumber } from "./numbersMean";
import { lateCount, sheetTotals, vatQuote } from "./sheetMaths";
import { stockCount } from "./stockCount";
/* ── Module 8: Documents ── */
import { holidayForm } from "./holidayForm";
import { letterhead } from "./letterhead";
import { procedureReview } from "./procedureReview";
/* ── Module 9: Files and sharing ── */
import { shareRightWay } from "./shareRightWay";
import { sharedFolder } from "./sharedFolder";
import { versionBack } from "./versionBack";
const M9 = [sharedFolder, shareRightWay, versionBack];
/* ── end Module 9 ── */
/* ── Module 10: Admin in practice ── */
import { courierBooking } from "./courierBooking";
import { invoiceCheck } from "./invoiceCheck";
import { phoneMessage } from "./phoneMessage";
import { timesheetExpense } from "./timesheet";
const M10 = [invoiceCheck, timesheetExpense, phoneMessage, courierBooking];
/* ── end Module 10 ── */

/* Every office job, in course order. A module page lists its own jobs
 * under "On the job"; the route /desk-ready/office/[slug] runs one. */
export const JOBS: readonly Job[] = [mondayInbox, lateDelivery, stockMeeting, rotaCall, chatOrEmail, stockCount, decemberRota, morningReport, sheetTotals, vatQuote, lateCount, bestCustomer, oddNumber, letterhead, holidayForm, procedureReview, ...M9, ...M10];

export const jobBySlug = (slug: string) => JOBS.find((j) => j.slug === slug);
export const jobsFor = (moduleId: string) => JOBS.filter((j) => j.moduleId === moduleId);
