import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { opsAlert } from "@/app/lib/opsAlert";
import { newInviteToken } from "@/app/lib/aiClearedAdmin";
import { createClass } from "@/app/lib/schoolClasses";

/* The AlgorithmX side of schools: every school at a glance, creating one
 * by hand with its first teacher invite, and claiming that invite. The
 * schools analog of aiClearedOps.ts. Never import from a client
 * component. */

export interface SchoolRow {
  id: string;
  slug: string;
  name: string;
  sector: string | null;
  contactName: string | null;
  seatsPurchased: number;
  pupilsUsed: number;
  classes: number;
  lastActivity: string | null;
  createdAt: string;
  trialExpiresAt: string | null;
  revokedAt: string | null;
  paidVia: "stripe" | "manual";
}

export async function listSchools(): Promise<SchoolRow[]> {
  const orgs = await prisma.organisation.findMany({
    where: { school: { isNot: null } },
    orderBy: { createdAt: "desc" },
    include: {
      classes: {
        where: { archivedAt: null },
        select: { id: true, pupils: { select: { id: true, progress: { select: { updatedAt: true } } } } },
      },
    },
  });
  return orgs.map((o) => {
    const pupils = o.classes.flatMap((c) => c.pupils);
    const stamps = pupils.flatMap((p) => p.progress.map((r) => r.updatedAt));
    const last = stamps.length ? new Date(Math.max(...stamps.map((d) => d.getTime()))) : null;
    return {
      id: o.id,
      slug: o.slug,
      name: o.name,
      sector: o.sector,
      contactName: o.contactName,
      seatsPurchased: o.seatsPurchased,
      pupilsUsed: pupils.length,
      classes: o.classes.length,
      lastActivity: last ? last.toISOString() : null,
      createdAt: o.createdAt.toISOString(),
      trialExpiresAt: o.trialExpiresAt ? o.trialExpiresAt.toISOString() : null,
      revokedAt: o.revokedAt ? o.revokedAt.toISOString() : null,
      paidVia: o.stripeCustomerId ? "stripe" : "manual",
    };
  });
}

export function platformSchoolTotals(rows: SchoolRow[]) {
  return {
    schools: rows.length,
    seatsLicensed: rows.reduce((a, r) => a + r.seatsPurchased, 0),
    pupilsUsed: rows.reduce((a, r) => a + r.pupilsUsed, 0),
    classes: rows.reduce((a, r) => a + r.classes, 0),
  };
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "school"
  );
}

/* Create a school by hand (a licence deal, or a test school) and its first
 * teacher invite. No Class is created yet - Class.teacherId is a real
 * User, and none exists until the invite is claimed. */
export async function createSchool(args: {
  name: string;
  sector?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  safeguardingContact?: string | null;
  childLineNumber?: string | null;
  seatsPurchased: number;
  teacherEmail: string;
  origin: string;
  staffName: string;
  staffEmail: string | null;
}) {
  const base = slugify(args.name);
  let slug = base;
  for (let i = 2; await prisma.organisation.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
  const org = await prisma.organisation.create({
    data: {
      name: args.name.trim(),
      slug,
      sector: args.sector?.trim() || null,
      contactName: args.contactName?.trim() || null,
      contactRole: args.contactRole?.trim() || null,
      plan: "TEAM",
      seatsPurchased: args.seatsPurchased,
    },
  });
  await prisma.schoolProfile.create({
    data: {
      orgId: org.id,
      safeguardingContact: args.safeguardingContact?.trim() || null,
      childLineNumber: args.childLineNumber?.trim() || null,
    },
  });
  const token = newInviteToken(slug.slice(0, 6));
  await prisma.teacherInvite.create({ data: { orgId: org.id, email: args.teacherEmail.trim().toLowerCase(), inviteToken: token, role: "ADMIN" } });
  let emailed = true;
  try {
    await sendTeacherInvite({ to: args.teacherEmail, token, schoolName: org.name, seats: args.seatsPurchased, origin: args.origin, staffName: args.staffName, staffEmail: args.staffEmail });
  } catch (err) {
    emailed = false;
    console.error("[admin/schools] teacher invite email failed", err instanceof Error ? err.message : err);
    await opsAlert({ what: "A teacher invite email did not send", detail: { school: org.name, slug, teacherEmail: args.teacherEmail, link: `${args.origin}/schools/join/${token}` }, error: err });
  }
  return { org, token, link: `${args.origin}/schools/join/${token}`, emailed };
}

export type ClaimInviteFailure = "not_found" | "claimed_by_other";

/* Claim a teacher invite: wires the person into the school as an
 * OrgMember, and, if nobody has claimed anything at this school yet,
 * gives them a first class to start from. */
export async function claimTeacherInvite(
  token: string,
  userId: string,
): Promise<{ ok: true; orgId: string; orgName: string } | { ok: false; error: ClaimInviteFailure }> {
  const invite = await prisma.teacherInvite.findUnique({
    where: { inviteToken: token },
    include: { org: { select: { id: true, name: true } } },
  });
  if (!invite) return { ok: false, error: "not_found" };
  if (invite.userId && invite.userId !== userId) return { ok: false, error: "claimed_by_other" };

  if (!invite.claimedAt) {
    await prisma.$transaction([
      prisma.teacherInvite.update({ where: { id: invite.id }, data: { claimedAt: new Date(), userId } }),
      prisma.orgMember.upsert({
        where: { orgId_userId: { orgId: invite.orgId, userId } },
        update: { role: invite.role },
        create: { orgId: invite.orgId, userId, role: invite.role },
      }),
    ]);
  }

  const classCount = await prisma.class.count({ where: { orgId: invite.orgId, archivedAt: null } });
  if (classCount === 0) {
    /* A class now has to say which course it runs, and nobody has chosen one
       at this point: the first teacher has only just claimed their invite.
       Cyber Heroes is the default because it is what every school class was
       before courses were selectable, and the teacher can make classes on
       any of the four from their own page. If the product is missing (a bare
       database with no seed), skip the starter class rather than fail the
       claim: landing with no class is recoverable, not being able to sign in
       at all is not. */
    const starter = await prisma.product.findUnique({
      where: { slug: "cyber-heroes" },
      select: { id: true },
    });
    if (starter) {
      await createClass({
        orgId: invite.orgId,
        teacherId: userId,
        name: "Class 1",
        productId: starter.id,
      });
    }
  }
  return { ok: true, orgId: invite.orgId, orgName: invite.org.name };
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export async function sendTeacherInvite(args: { to: string; token: string; schoolName: string; seats: number; origin: string; staffName: string; staffEmail: string | null }) {
  const link = `${args.origin}/schools/join/${args.token}`;
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">CYBER HEROES &middot; SCHOOLS</p>
      <h1 style="font-size:22px;margin:0 0 12px">${args.seats} place${args.seats === 1 ? "" : "s"} ${args.seats === 1 ? "is" : "are"} ready for ${esc(args.schoolName)}.</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">You are the first teacher set up for ${esc(args.schoolName)}. Set up your account from the link below and you will land on your classes page with a class ready to add children to. You can add more teachers once you are in.</p>
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Set up my teacher account</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">Questions go to ${esc(args.staffName)}${args.staffEmail ? ` (${esc(args.staffEmail)})` : ""}.</p>
    </div>`;
  const text = `${args.seats} place(s) are ready for ${args.schoolName}.\n\nSet up your teacher account: ${link}\n`;
  return sendEmail({ to: args.to, subject: `Cyber Heroes is ready for ${args.schoolName}`, html, text, replyTo: args.staffEmail ?? undefined });
}
