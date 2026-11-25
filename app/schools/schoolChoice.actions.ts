"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { SCHOOL_CHOICE_COOKIE } from "@/app/lib/schoolChoice";

/**
 * Switch which school you are looking at.
 *
 * Only reachable by somebody who belongs to more than one, which is rare in
 * a school and ordinary for anybody testing: the owner had two and the
 * portal picked the dead one.
 *
 * The cookie is a PREFERENCE. It is re-checked against membership on every
 * read (see getSchoolContext, which can only choose among the schools the
 * person is in), so the worst a forged one can do is name a school they are
 * already in. The membership check here is belt and braces, and it is also
 * what stops the cookie quietly sticking to a school somebody has left.
 */
export async function chooseSchool(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;

  const orgId = String(formData.get("orgId") ?? "");
  if (!orgId) return;

  const allowed = await prisma.orgMember.count({
    where: {
      userId: session.user.id,
      orgId,
      role: { in: ["ADMIN", "MANAGER"] },
      org: { school: { isNot: null } },
    },
  });
  if (allowed === 0) return;

  (await cookies()).set({
    name: SCHOOL_CHOICE_COOKIE,
    value: orgId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  /* Every school screen reads the context, so every school screen changes. */
  revalidatePath("/schools", "layout");
}
