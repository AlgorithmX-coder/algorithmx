import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { PICTURE_KEYS, SEQUENCE_LENGTH } from "@/app/lib/pictures";

/**
 * Signing a child in without an email address or a typed password.
 *
 * Three taps: the class code off the card on their desk, their own name from
 * the list, and a short sequence of pictures. No email, no spelling, nothing
 * to remember that a six year old cannot hold.
 *
 * THE BROWSER NEVER LEARNS AN EMAIL ADDRESS. Pupil accounts have synthetic
 * ones on a domain that can never receive mail, and nothing here returns one:
 * the client holds a profile id and a picture sequence, and the provider does
 * the rest on the server. That also means a class code cannot be turned into
 * a list of logins.
 *
 * WHAT A CLASS CODE DOES EXPOSE is the first names of the children in that
 * class, which is deliberate: the code is printed on cards handed out in the
 * room, and a child has to see their own name to pick it. It is why the code
 * is generated rather than chosen, and why it is 7 characters from a 29
 * letter alphabet rather than the school's name.
 */

const isSequence = (seq: unknown): seq is string[] =>
  Array.isArray(seq) &&
  seq.length === SEQUENCE_LENGTH &&
  seq.every((k) => typeof k === "string" && (PICTURE_KEYS as readonly string[]).includes(k));

export interface ClassLookup {
  className: string;
  pupils: { id: string; name: string; colour: string; needsSetup: boolean }[];
}

/**
 * Turn a class code into the names on the cards.
 *
 * Returns nothing for a code that does not exist, a class that has been
 * archived, or a school with no classes. The caller says the same thing in
 * all three cases, because a child does not need to know which it was and a
 * stranger should not be told either.
 */
export async function lookupClass(rawCode: string): Promise<ClassLookup | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code || code.length > 16) return null;

  const klass = await prisma.class.findFirst({
    where: { code, archivedAt: null },
    select: {
      name: true,
      pupils: {
        orderBy: { name: "asc" },
        select: {
          id: true, name: true, favouriteColour: true,
          user: { select: { hashedPassword: true } },
        },
      },
    },
  });
  if (!klass) return null;

  return {
    className: klass.name,
    pupils: klass.pupils.map((p) => ({
      id: p.id,
      name: p.name,
      colour: p.favouriteColour,
      /* First time in, the child chooses their own pictures. After that the
         same three are the only way in. */
      needsSetup: !p.user.hashedPassword,
    })),
  };
}

export type PupilSignIn =
  | { ok: true; userId: string; name: string }
  | { ok: false; reason: "unknown" | "wrong_pictures" | "bad_sequence" };

/**
 * Check a child's pictures, or set them the first time.
 *
 * FIRST RUN CLAIMS THE ACCOUNT. A pupil created by a teacher has no password
 * at all, and the first person to sign in as them chooses the pictures. That
 * is the right trade for this age: nothing to distribute, nothing to reset
 * before the lesson can start, and the teacher is standing in the room the
 * first time a class logs in. It does mean a classmate holding the card could
 * claim somebody else's account before they do, which is why a teacher can
 * reset a pupil's pictures and why the class list shows who has signed in.
 */
export async function authorisePupil(
  childProfileId: string,
  sequence: unknown,
): Promise<PupilSignIn> {
  if (!childProfileId || !isSequence(sequence)) return { ok: false, reason: "bad_sequence" };

  const child = await prisma.childProfile.findFirst({
    /* the class must still be live: an archived class is last year's */
    where: { id: childProfileId, class: { archivedAt: null } },
    select: { name: true, user: { select: { id: true, hashedPassword: true } } },
  });
  if (!child) return { ok: false, reason: "unknown" };

  const secret = sequence.join(".");

  if (!child.user.hashedPassword) {
    const hashed = await bcrypt.hash(secret, 10);
    /* Only if it is still unset. Two children racing on the same name would
       otherwise both think they had claimed it. */
    const claimed = await prisma.user.updateMany({
      where: { id: child.user.id, hashedPassword: null },
      data: { hashedPassword: hashed },
    });
    if (claimed.count === 0) return { ok: false, reason: "wrong_pictures" };
    return { ok: true, userId: child.user.id, name: child.name };
  }

  const matches = await bcrypt.compare(secret, child.user.hashedPassword);
  if (!matches) return { ok: false, reason: "wrong_pictures" };
  return { ok: true, userId: child.user.id, name: child.name };
}

/** A teacher clears a child's pictures so they can choose again. The only way
 *  back in for a child who has forgotten them, and it has to be one click in
 *  the middle of a lesson. */
export async function resetPupilPictures(orgId: string, childProfileId: string): Promise<boolean> {
  const child = await prisma.childProfile.findFirst({
    where: { id: childProfileId, class: { orgId } },
    select: { userId: true },
  });
  if (!child) return false;
  await prisma.user.update({ where: { id: child.userId }, data: { hashedPassword: null } });
  return true;
}
