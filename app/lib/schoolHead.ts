import type { LearnerOrgKind } from "@prisma/client";
import { prisma } from "@/app/lib/prisma";
import { courseName } from "@/app/lib/schoolPlaces";
import { newInviteToken } from "@/app/lib/aiClearedAdmin";
import { sendTeacherInvite } from "@/app/lib/schoolOps";

/**
 * The head's side of the school platform.
 *
 * WHO THIS IS FOR. Two different people were being served one screen. A
 * teacher wants their own class: who is stuck, what the code is, add a
 * child. Whoever signed the licence wants none of that. They want to know
 * how many places they bought, how many are gone, who on their staff has
 * access, and whether the thing is being used - and if it is not, they
 * want to see that in one glance, in week three, not in July.
 *
 * `/schools/classes` is the teacher's screen. This is the other one.
 *
 * THE OWNERSHIP RULE, SAME AS `classProgress.ts`. Every query here filters
 * on the org in the query itself, with the orgId taken from the signed-in
 * user's own ADMIN membership, never from a request. A class id or a pupil
 * id from another school reaches nothing, because nothing here accepts one.
 *
 * READ ONLY, with one exception: inviting a member of staff. A head cannot
 * change a child's progress from here, cannot see more about a child than
 * their teacher can, and cannot buy places (that is a conversation, not a
 * button - see `needMorePlaces` on the page).
 */

export interface HeadContext {
  orgId: string;
  orgName: string;
  kind: LearnerOrgKind;
  seatsPurchased: number;
  trialExpiresAt: Date | null;
  revokedAt: Date | null;
}

/**
 * The school this person is the head of, or null.
 *
 * ADMIN only. A teacher is a MANAGER and gets null here, which is what
 * sends them back to their own classes rather than into this screen. The
 * first person we set up at a school is created ADMIN by `createSchool`,
 * so the head of computing who signed the licence lands here and the
 * staff they invite afterwards do not.
 */
export async function getHeadContext(userId: string): Promise<HeadContext | null> {
  if (!userId) return null;
  const member = await prisma.orgMember.findFirst({
    where: { userId, role: "ADMIN", org: { school: { isNot: null } } },
    select: {
      org: {
        select: {
          id: true,
          name: true,
          seatsPurchased: true,
          trialExpiresAt: true,
          revokedAt: true,
          school: { select: { kind: true } },
        },
      },
    },
  });
  if (!member?.org.school) return null;
  return {
    orgId: member.org.id,
    orgName: member.org.name,
    kind: member.org.school.kind,
    seatsPurchased: member.org.seatsPurchased,
    trialExpiresAt: member.org.trialExpiresAt,
    revokedAt: member.org.revokedAt,
  };
}

export interface ClassRollUp {
  id: string;
  name: string;
  yearGroup: number | null;
  code: string;
  courseName: string;
  courseSlug: string;
  weeksCount: number;
  teacherName: string;
  pupils: number;
  /** Pupils who have opened at least one week. */
  started: number;
  /** Pupils who have finished every week of the course. */
  finished: number;
  /** Weeks completed across the class, over weeks available to it. */
  weeksDone: number;
  weeksPossible: number;
  /** The most recent time any pupil in this class touched a lesson. */
  lastSeen: Date | null;
}

/**
 * Every live class in the school, rolled up.
 *
 * Two queries whatever the size of the school, not one per class: the
 * classes with their pupils' ids, then every progress row belonging to a
 * pupil in this org in one go. A primary with thirty classes would
 * otherwise open sixty connections to draw one page.
 *
 * A progress row only counts towards a class if it is against the course
 * that class runs. A child moved up from a Cyber Heroes class into a Cyber
 * Explorers one keeps both sets of rows, and the year 8 class must not be
 * credited with the twenty weeks they did in year 4.
 */
export async function listClassRollUps(orgId: string): Promise<ClassRollUp[]> {
  const classes = await prisma.class.findMany({
    where: { orgId, archivedAt: null },
    orderBy: [{ yearGroup: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      yearGroup: true,
      code: true,
      teacher: { select: { name: true, email: true } },
      product: { select: { id: true, slug: true, name: true, weeksCount: true } },
      pupils: { select: { id: true } },
    },
  });
  if (classes.length === 0) return [];

  const pupilIds = classes.flatMap((k) => k.pupils.map((p) => p.id));
  const rows = pupilIds.length
    ? await prisma.progress.findMany({
        /* scoped through the relation as well as the id list, so even a
           stale id cannot reach another school's rows */
        where: { childProfileId: { in: pupilIds }, childProfile: { class: { orgId } } },
        select: { childProfileId: true, productId: true, completedAt: true, updatedAt: true },
      })
    : [];

  /* childProfileId -> productId -> { done, touched, last } */
  const byChild = new Map<string, Map<string, { done: number; touched: number; last: Date }>>();
  for (const r of rows) {
    const mine = byChild.get(r.childProfileId) ?? new Map();
    const cell = mine.get(r.productId) ?? { done: 0, touched: 0, last: r.updatedAt };
    cell.touched += 1;
    if (r.completedAt) cell.done += 1;
    if (r.updatedAt > cell.last) cell.last = r.updatedAt;
    mine.set(r.productId, cell);
    byChild.set(r.childProfileId, mine);
  }

  return classes.map((k) => {
    const weeksCount = k.product.weeksCount || 20;
    let started = 0;
    let finished = 0;
    let weeksDone = 0;
    let lastSeen: Date | null = null;

    for (const p of k.pupils) {
      const cell = byChild.get(p.id)?.get(k.product.id);
      if (!cell) continue;
      if (cell.touched > 0) started += 1;
      weeksDone += cell.done;
      if (cell.done >= weeksCount) finished += 1;
      if (!lastSeen || cell.last > lastSeen) lastSeen = cell.last;
    }

    return {
      id: k.id,
      name: k.name,
      yearGroup: k.yearGroup,
      code: k.code,
      courseName: courseName(k.product.slug, k.product.name),
      courseSlug: k.product.slug,
      weeksCount,
      /* A teacher who has not set a display name is shown by the email they
         were invited on, because a blank column in a staff list reads as a
         bug rather than as a missing preference. */
      teacherName: k.teacher.name?.trim() || k.teacher.email || "Unnamed",
      pupils: k.pupils.length,
      started,
      finished,
      weeksDone,
      weeksPossible: k.pupils.length * weeksCount,
      lastSeen,
    };
  });
}

export interface StaffRow {
  userId: string;
  name: string;
  email: string | null;
  /** True for whoever holds the licence. There can be more than one. */
  isHead: boolean;
  classes: number;
  pupils: number;
  joinedAt: Date;
}

/**
 * The adults with access, and what each of them is running.
 *
 * This is the list a head checks when somebody leaves, so it carries the
 * only two facts that matter for that decision: how many classes would be
 * left without an owner, and how many children are in them.
 */
export async function listStaff(orgId: string): Promise<StaffRow[]> {
  const [members, classes] = await Promise.all([
    prisma.orgMember.findMany({
      where: { orgId, role: { in: ["ADMIN", "MANAGER"] } },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.class.findMany({
      where: { orgId, archivedAt: null },
      select: { teacherId: true, _count: { select: { pupils: true } } },
    }),
  ]);

  const load = new Map<string, { classes: number; pupils: number }>();
  for (const k of classes) {
    const cell = load.get(k.teacherId) ?? { classes: 0, pupils: 0 };
    cell.classes += 1;
    cell.pupils += k._count.pupils;
    load.set(k.teacherId, cell);
  }

  return members.map((m) => ({
    userId: m.user.id,
    name: m.user.name?.trim() || m.user.email || "Unnamed",
    email: m.user.email,
    isHead: m.role === "ADMIN",
    classes: load.get(m.user.id)?.classes ?? 0,
    pupils: load.get(m.user.id)?.pupils ?? 0,
    joinedAt: m.createdAt,
  }));
}

/** Invites sent and not yet claimed, oldest first. */
export async function listPendingInvites(orgId: string) {
  return prisma.teacherInvite.findMany({
    where: { orgId, claimedAt: null },
    orderBy: { invitedAt: "asc" },
    select: { id: true, email: true, invitedAt: true, role: true },
  });
}

export type InviteFailure = "bad_email" | "already_staff" | "already_invited" | "not_sent";

/**
 * Invite a member of staff.
 *
 * The one write on this screen, and the reason the screen had to exist: a
 * school's first teacher account was created by us at the point of sale and
 * there was no way to make a second one. Every school with more than one
 * teacher was a support email.
 *
 * MANAGER, not ADMIN. Somebody invited here gets their own classes and
 * their own pupils' progress, and does not get this screen: places, staff
 * and the licence stay with whoever signed for them.
 */
export async function inviteStaff(args: {
  orgId: string;
  orgName: string;
  kind: LearnerOrgKind;
  email: string;
  origin: string;
}): Promise<{ ok: true; link: string; emailed: boolean } | { ok: false; error: InviteFailure }> {
  const email = args.email.trim().toLowerCase();
  /* Deliberately loose. The strictest thing worth asking of an address is
     that a human typed something that could be one; anything tighter
     rejects a real school address eventually, and the invite only works if
     the address receives it anyway. */
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) {
    return { ok: false, error: "bad_email" };
  }

  const already = await prisma.orgMember.findFirst({
    where: { orgId: args.orgId, user: { email }, role: { in: ["ADMIN", "MANAGER"] } },
    select: { id: true },
  });
  if (already) return { ok: false, error: "already_staff" };

  const open = await prisma.teacherInvite.findFirst({
    where: { orgId: args.orgId, email, claimedAt: null },
    select: { id: true },
  });
  if (open) return { ok: false, error: "already_invited" };

  /* A claimed invite for this address can be replaced: it means the person
     joined and then lost the account, which is a real support case. The
     unique constraint is (orgId, email), so the row is updated rather than
     added. */
  const token = newInviteToken(args.orgId.slice(0, 6));
  await prisma.teacherInvite.upsert({
    where: { orgId_email: { orgId: args.orgId, email } },
    create: { orgId: args.orgId, email, inviteToken: token, role: "MANAGER" },
    update: { inviteToken: token, role: "MANAGER", invitedAt: new Date(), claimedAt: null, userId: null },
  });

  const link = `${args.origin}/schools/join/${token}`;
  let emailed = true;
  try {
    /* The same sender as the head's own invite, so the branding and the
       reply-to address live in one place, but `colleague` switches the
       words: the head's invite announces a licence and its standing, and
       a teacher added by their own head does not need to be told what the
       school bought. It reads as a letter from a supplier rather than
       from the person down the corridor. */
    await sendTeacherInvite({
      to: email,
      token,
      schoolName: args.orgName,
      kind: args.kind,
      seats: 0,
      trialDays: null,
      origin: args.origin,
      colleague: true,
    });
  } catch (err) {
    /* The invite row exists either way, and the link is handed back to the
       head on screen, so a mail failure costs them a copy and paste rather
       than the whole operation. */
    emailed = false;
    console.error("[schools/overview] staff invite email failed", err instanceof Error ? err.message : err);
  }
  return { ok: true, link, emailed };
}
