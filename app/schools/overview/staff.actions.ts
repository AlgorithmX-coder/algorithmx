"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/lib/auth";
import { getHeadContext, inviteStaff, type InviteFailure } from "@/app/lib/schoolHead";
import { renewStaffLink, setStaffLinkLock } from "@/app/lib/staffLink";

/**
 * Inviting a member of staff.
 *
 * Re-checks the session and the ADMIN membership itself. A server action is
 * a public endpoint whatever renders it, so the gate on the page that drew
 * the form is not a gate on this. What is behind it is the right to hand
 * somebody access to a list of children's names.
 */

export type InviteResult =
  | { ok: true; email: string; link: string; emailed: boolean }
  | { ok: false; error: string };

/** One sentence per failure, in words a head can act on. */
const SAID: Record<InviteFailure, string> = {
  bad_email: "That does not look like an email address.",
  already_staff: "They already have access.",
  already_invited: "They have an invite open already. It is in the list below.",
  not_sent: "We could not send that. Try again, or email admissions@algorithmx.co.uk.",
};

export async function inviteStaffAction(formData: FormData): Promise<InviteResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in again." };

  const head = await getHeadContext(session.user.id);
  if (!head) return { ok: false, error: "Only whoever holds the licence can add staff." };
  if (head.revokedAt) return { ok: false, error: "This account is closed." };

  const email = String(formData.get("email") ?? "");

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "algorithmx.io";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  const done = await inviteStaff({
    orgId: head.orgId,
    orgName: head.orgName,
    kind: head.kind,
    email,
    origin: `${proto}://${host}`,
  });
  if (!done.ok) return { ok: false, error: SAID[done.error] };

  revalidatePath("/schools/overview");
  return { ok: true, email: email.trim().toLowerCase(), link: done.link, emailed: done.emailed };
}

/* ── The one staff join link ─────────────────────────────────────────
   The same gate as the invite above: the signed-in person must hold the
   licence at the school they are looking at, checked here and not trusted
   from the page. */

export type StaffLinkResult = { ok: true } | { ok: false; error: string };

export async function renewStaffLinkAction(): Promise<StaffLinkResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in again." };
  const head = await getHeadContext(session.user.id);
  if (!head) return { ok: false, error: "Only whoever holds the licence can change the link." };
  if (head.revokedAt) return { ok: false, error: "This account is closed." };

  const link = await renewStaffLink(head.orgId);
  if (!link) return { ok: false, error: "We could not make a new link. Try again in a moment." };
  revalidatePath("/schools/overview");
  return { ok: true };
}

export async function setStaffLinkLockAction(locked: boolean): Promise<StaffLinkResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in again." };
  const head = await getHeadContext(session.user.id);
  if (!head) return { ok: false, error: "Only whoever holds the licence can change the link." };
  if (head.revokedAt) return { ok: false, error: "This account is closed." };

  const done = await setStaffLinkLock(head.orgId, locked === true);
  if (!done.ok) {
    return {
      ok: false,
      error: done.error === "no_domain"
        ? "Your own address is at a free email provider, so there is no school domain to limit the link to."
        : "We could not change the link. Try again in a moment.",
    };
  }
  revalidatePath("/schools/overview");
  return { ok: true };
}
