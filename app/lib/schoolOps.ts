import { prisma } from "@/app/lib/prisma";
import { sendEmail } from "@/app/lib/resend";
import { opsAlert } from "@/app/lib/opsAlert";
import { newInviteToken } from "@/app/lib/aiClearedAdmin";
import { createClass } from "@/app/lib/schoolClasses";
import { placesUsed } from "@/app/lib/schoolPlaces";
import type { LearnerOrgKind } from "@prisma/client";

/* The AlgorithmX side of schools and the other organisations that teach
 * children: each at a glance, creating one by hand with its first teacher
 * invite, and claiming that invite. The schools analog of aiClearedOps.ts.
 * Never import from a client component.
 *
 * A school and a youth organisation are the same thing here, told apart by
 * SchoolProfile.kind. They are sold to differently and staff talk about
 * them differently, so they have separate tabs and separate forms; nothing
 * below them is duplicated. */

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

/**
 * Every school, or every organisation that is not a school.
 *
 * Both are the same thing underneath and this is the same query: they teach
 * children on the same four courses, through the same classes, pupils and
 * places ledger. `kind` only decides which staff tab they appear under and
 * which words that tab uses.
 */
export async function listLearnerOrgs(kind: LearnerOrgKind): Promise<SchoolRow[]> {
  const orgs = await prisma.organisation.findMany({
    where: { school: { kind } },
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

export function platformLearnerOrgTotals(rows: SchoolRow[]) {
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
  /** School or other organisation. Decides nothing but the staff tab it
   *  appears under and the words used about it. */
  kind?: LearnerOrgKind;
  sector?: string | null;
  country?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  safeguardingContact?: string | null;
  seatsPurchased: number;
  /** Set when this school is being started on a trial, so the invite email
   *  leads with the trial instead of announcing places nobody bought. */
  trialDays?: number | null;
  teacherEmail: string;
  origin: string;
}) {
  const base = slugify(args.name);
  let slug = base;
  for (let i = 2; await prisma.organisation.findUnique({ where: { slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
  const org = await prisma.organisation.create({
    data: {
      name: args.name.trim(),
      slug,
      sector: args.sector?.trim() || null,
      country: args.country?.trim() || null,
      contactName: args.contactName?.trim() || null,
      contactRole: args.contactRole?.trim() || null,
      plan: "TEAM",
      seatsPurchased: args.seatsPurchased,
    },
  });
  /* No child line number here. It is the school's own country's number and
     the school is the only party who can give it; asking a salesperson for
     it at the moment of sale produced a blank field every time. The column
     stays, to be filled in from the school's own screen. */
  await prisma.schoolProfile.create({
    data: {
      orgId: org.id,
      kind: args.kind ?? "SCHOOL",
      safeguardingContact: args.safeguardingContact?.trim() || null,
    },
  });
  const token = newInviteToken(slug.slice(0, 6));
  await prisma.teacherInvite.create({ data: { orgId: org.id, email: args.teacherEmail.trim().toLowerCase(), inviteToken: token, role: "ADMIN" } });
  let emailed = true;
  try {
    await sendTeacherInvite({ to: args.teacherEmail, token, schoolName: org.name, kind: args.kind ?? "SCHOOL", seats: args.seatsPurchased, trialDays: args.trialDays ?? null, origin: args.origin });
  } catch (err) {
    emailed = false;
    console.error("[admin/schools] teacher invite email failed", err instanceof Error ? err.message : err);
    await opsAlert({ what: "A teacher invite email did not send", detail: { school: org.name, slug, teacherEmail: args.teacherEmail, link: `${args.origin}/schools/join/${token}` }, error: err });
  }
  return { org, token, link: `${args.origin}/schools/join/${token}`, emailed };
}

/* Change what a school has bought, after it was created.
 *
 * There was no way to do this at all: seatsPurchased was set once, by
 * whoever created the school, and never again. That made the ordinary
 * second conversation impossible - a trial becoming a licence, or a school
 * buying another twenty-five places in January - and the only way through
 * was editing the database by hand.
 *
 * It will not go below the places already spent. The ledger is what
 * `available` is counted against, so a school licensed for fewer places
 * than it has spent is a school quietly teaching children nobody paid for,
 * and that is not a state staff should be able to create by typing a
 * smaller number. Staff who really mean it take the pupils out first, or
 * close the school's access.
 *
 * A licence changing is worth a trail, so it alerts like a trial grant. */
export type SetPlacesFailure = "not_found" | "below_spent";

export interface SetPlacesOk {
  ok: true;
  /** What it is now. */
  places: number;
  /** Ledger rows, which is the floor this refused to go under. */
  spent: number;
  /** What it was, so the screen can say what changed. */
  previous: number;
}

export async function setPlaces(args: {
  orgId: string;
  places: number;
  actor: { name: string; email: string | null };
}): Promise<SetPlacesOk | { ok: false; error: SetPlacesFailure; spent?: number }> {
  const org = await prisma.organisation.findUnique({
    where: { id: args.orgId },
    select: { id: true, name: true, slug: true, seatsPurchased: true },
  });
  if (!org) return { ok: false, error: "not_found" };

  const spent = await placesUsed(org.id);
  if (args.places < spent) return { ok: false, error: "below_spent", spent };

  /* Saying the same number again is a success that changes nothing, and in
     particular does not raise an alert: staff re-saving a form they did not
     edit should not look like a licence change in the ops mailbox. */
  if (args.places === org.seatsPurchased) {
    return { ok: true, places: args.places, spent, previous: org.seatsPurchased };
  }

  await prisma.organisation.update({ where: { id: org.id }, data: { seatsPurchased: args.places } });
  await opsAlert({
    what: "Places changed",
    detail: {
      org: org.name,
      slug: org.slug,
      from: org.seatsPurchased,
      to: args.places,
      spent,
      changedBy: args.actor.email ?? args.actor.name,
    },
  });
  return { ok: true, places: args.places, spent, previous: org.seatsPurchased };
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

/** Where a school writes in. Never a person: staff change, an address does
 *  not, and a teacher should not be replying to whoever happened to set
 *  their school up. */
export const SCHOOLS_EMAIL = "schools@algorithmx.co.uk";

/**
 * The first teacher's invite.
 *
 * Says nothing about which course. A school picks a course per class, and
 * naming one in the welcome email is both wrong for a school that bought
 * something else and the reason the whole product used to read as a single
 * course. The same email has to work for a primary school running Cyber
 * Heroes and a secondary running Cyber Explorers.
 *
 * On a trial it leads with the trial rather than with a number of places.
 * It used to announce however many places were posted, which on a trial was
 * a hardcoded 30 that nobody had agreed to buy.
 *
 * `colleague` switches it to the other kind of invite: one teacher adding
 * another from the head's own screen. That reader does not need to be told
 * what their school bought, and should not be. Announcing a licence to
 * somebody down the corridor reads as a letter from a supplier.
 */
export async function sendTeacherInvite(args: { to: string; token: string; schoolName: string; kind?: LearnerOrgKind; seats: number; trialDays?: number | null; origin: string; colleague?: boolean }) {
  const link = `${args.origin}/schools/join/${args.token}`;
  const school = esc(args.schoolName);
  const isOrg = args.kind === "ORGANISATION";
  const onTrial = Boolean(args.trialDays && args.trialDays > 0);

  if (args.colleague) {
    const group = isOrg ? "group" : "class";
    const groups = isOrg ? "groups" : "classes";
    const people = isOrg ? "young people" : "children";
    const head = isOrg ? "whoever runs AlgorithmX for" : "whoever holds the licence at";
    const cHeadline = `You have been added to AlgorithmX at ${school}.`;
    const cSub = `Set up your account from the link below and you land on your own ${groups}, ready to make one and add your ${people}. Each one gets a login card with the ${group} code on it, so nobody has to remember an email address.`;
    const cHtml = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">ALGORITHMX &middot; ${isOrg ? "FOR ORGANISATIONS" : "FOR SCHOOLS"}</p>
      <h1 style="font-size:22px;margin:0 0 12px">${cHeadline}</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${cSub}</p>
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Set up my account</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">This invite was sent by ${head} ${school}. Anything we can help with, write to <a href="mailto:${SCHOOLS_EMAIL}" style="color:#0a7085">${SCHOOLS_EMAIL}</a>.</p>
    </div>`;
    const cText = `You have been added to AlgorithmX at ${args.schoolName}.\n\nSet up your account: ${link}\n\nYou land on your own ${groups}, ready to make one and add your ${people}.\n\nAnything we can help with, write to ${SCHOOLS_EMAIL}.\n`;
    return sendEmail({ to: args.to, subject: `You have been added to AlgorithmX at ${args.schoolName}`, html: cHtml, text: cText, replyTo: SCHOOLS_EMAIL });
  }

  /* ONE HEADLINE, for every school, every organisation and every course.
     It used to lead with either a course name or a number of places, and
     both are wrong to lead with: a course name is wrong for a school that
     bought something else, and a number of places on a trial was a figure
     nobody had agreed to buy. What the reader wants to know first is that
     the thing they signed for exists and is theirs. The standing goes in
     the line underneath, where a wrong guess cannot be the first words. */
  const headline = `${school} is ready for AlgorithmX.`;
  const standing = onTrial
    ? `You are on a ${args.trialDays}-day trial, so everything is open and nothing is charged.`
    : `Your licence covers ${args.seats} pupil place${args.seats === 1 ? "" : "s"}.`;
  const sub = `You are the first person set up for ${school}. ${standing} Set up your account from the link below and you will land on your classes page, ready to make a class and add children.`;
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">ALGORITHMX &middot; ${args.kind === "ORGANISATION" ? "FOR ORGANISATIONS" : "FOR SCHOOLS"}</p>
      <h1 style="font-size:22px;margin:0 0 12px">${headline}</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${sub}</p>
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">Set up my account</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">Any questions, write to <a href="mailto:${SCHOOLS_EMAIL}" style="color:#0a7085">${SCHOOLS_EMAIL}</a>.</p>
    </div>`;
  const text = `${args.schoolName} is ready for AlgorithmX.\n\n${onTrial ? `You are on a ${args.trialDays}-day trial, so everything is open and nothing is charged.` : `Your licence covers ${args.seats} pupil place(s).`}\n\nSet up your account: ${link}\n\nAny questions, write to ${SCHOOLS_EMAIL}.\n`;
  return sendEmail({ to: args.to, subject: `Your AlgorithmX account for ${args.schoolName}`, html, text, replyTo: SCHOOLS_EMAIL });
}

/**
 * More places have landed on an account that already exists.
 *
 * Deliberately NOT an invite. The reader already has an account, and sending
 * somebody a "set up your account" link for the account they are already
 * signed into is how a repeat customer starts to wonder whether we know who
 * they are. So this says what changed, says the new total, and points at
 * their own overview rather than at a join link.
 */
export async function sendPlacesAdded(args: {
  to: string;
  orgName: string;
  added: number;
  total: number;
  origin: string;
}) {
  const link = `${args.origin}/schools/overview`;
  const org = esc(args.orgName);
  const added = `${args.added} more place${args.added === 1 ? "" : "s"}`;
  const headline = `${added} for ${org}.`;
  const sub = `Your payment has cleared and the places are on your account already. ${org} now holds ${args.total} place${args.total === 1 ? "" : "s"} in total. Nothing else needs doing: you can spend them on any of our courses, a class at a time.`;
  const html = `
    <div style="font-family:Inter,Segoe UI,Helvetica,Arial,sans-serif;color:#14161d;max-width:560px;margin:0 auto;padding:24px">
      <p style="font-family:ui-monospace,Consolas,monospace;font-size:11px;letter-spacing:.2em;color:#0a7085;margin:0 0 16px">ALGORITHMX &middot; FOR ORGANISATIONS</p>
      <h1 style="font-size:22px;margin:0 0 12px">${headline}</h1>
      <p style="font-size:15px;line-height:1.55;margin:0 0 12px">${sub}</p>
      <p style="margin:18px 0 10px"><a href="${link}" style="display:inline-block;background:#0a7085;color:#fff;text-decoration:none;padding:11px 18px;border-radius:8px;font-weight:600">See your places</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:0">Or copy this link: <a href="${link}" style="color:#0a7085">${link}</a></p>
      <p style="font-size:13.5px;color:#5b6572;line-height:1.5;margin:14px 0 0">Your VAT invoice comes from Stripe separately. Anything else, write to <a href="mailto:${SCHOOLS_EMAIL}" style="color:#0a7085">${SCHOOLS_EMAIL}</a>.</p>
    </div>`;
  const text = `${added} for ${args.orgName}.\n\nYour payment has cleared and the places are on your account already. ${args.orgName} now holds ${args.total} place(s) in total.\n\nSee your places: ${link}\n\nYour VAT invoice comes from Stripe separately. Anything else, write to ${SCHOOLS_EMAIL}.\n`;
  return sendEmail({ to: args.to, subject: `${added} for ${args.orgName}`, html, text, replyTo: SCHOOLS_EMAIL });
}
