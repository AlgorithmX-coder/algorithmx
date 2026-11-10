import { prisma } from "@/app/lib/prisma";

/**
 * School enquiries: the leads from the /schools form.
 *
 * The labels live here rather than in the route because two screens read
 * them now. The form stores the raw key it was given; the email and the
 * staff console both turn that key into words, and they have to agree, or
 * a staff member reads "slt" while the email they were sent said "Deputy
 * head". One map, two readers.
 */
export const ROLE_LABELS: Record<string, string> = {
  head: "Headteacher or principal",
  slt: "Deputy head or SLT",
  computing: "Computing or online-safety lead",
  teacher: "Class teacher",
  it: "IT or network manager",
  other: "Other",
};

export const PHASE_LABELS: Record<string, string> = {
  primary: "Primary",
  secondary: "Secondary",
  both: "Primary and secondary",
};

export const SIZE_LABELS: Record<string, string> = {
  u100: "Under 100 pupils",
  "100-300": "100 to 300 pupils",
  "300-600": "300 to 600 pupils",
  "600+": "600+ pupils",
};

export function roleLabel(key: string | null | undefined): string {
  return (key && ROLE_LABELS[key]) || "Not given";
}
export function phaseLabel(key: string | null | undefined): string {
  return (key && PHASE_LABELS[key]) || "Not given";
}
export function sizeLabel(key: string | null | undefined): string {
  return (key && SIZE_LABELS[key]) || "Not given";
}

export interface EnquiryRow {
  id: string;
  name: string;
  email: string;
  school: string;
  role: string;
  phase: string;
  size: string;
  message: string;
  /** False means the lead is here but nobody was emailed about it. */
  emailed: boolean;
  handledAt: Date | null;
  createdAt: Date;
}

/**
 * The enquiries, newest first.
 *
 * `handled: false` is the working list, which is what the console shows by
 * default: a list of people waiting for an answer, not an archive.
 */
export async function listSchoolEnquiries(args?: {
  handled?: boolean;
  take?: number;
}): Promise<EnquiryRow[]> {
  const rows = await prisma.schoolEnquiry.findMany({
    where: args?.handled === undefined ? {} : args.handled ? { handledAt: { not: null } } : { handledAt: null },
    orderBy: { createdAt: "desc" },
    take: args?.take ?? 25,
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    school: r.school,
    role: roleLabel(r.role),
    phase: phaseLabel(r.phase),
    size: sizeLabel(r.size),
    message: r.message ?? "",
    emailed: r.emailed,
    handledAt: r.handledAt,
    createdAt: r.createdAt,
  }));
}

/** How many are waiting, for the heading. */
export async function countUnhandledEnquiries(): Promise<number> {
  return prisma.schoolEnquiry.count({ where: { handledAt: null } });
}

/**
 * Mark one dealt with, or put it back.
 *
 * Nothing is deleted: a lead that was answered and came to nothing is still
 * the evidence that the school was spoken to, and a staff member who ticks
 * the wrong row has to be able to untick it.
 */
export async function setEnquiryHandled(args: {
  id: string;
  handled: boolean;
  staffUserId: string;
}): Promise<boolean> {
  const done = await prisma.schoolEnquiry.updateMany({
    where: { id: args.id },
    data: args.handled
      ? { handledAt: new Date(), handledBy: args.staffUserId }
      : { handledAt: null, handledBy: null },
  });
  return done.count === 1;
}
