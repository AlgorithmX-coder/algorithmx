"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/app/lib/auth";
import { getTeacherContext } from "@/app/lib/schoolAccess";
import { mintShareLink, revokeShareLink, MAX_DAYS } from "@/app/lib/packShare";

/**
 * Making and revoking the read-only links a school gets sent.
 *
 * Both actions re-check the session and the org membership themselves. A
 * server action is a public endpoint whatever renders it, so a gate on the
 * page that shows the button is not a gate on the action behind it.
 */

/** The origin the link should point at, taken from the request rather than
 *  from config, so a link minted on a preview deploy points at that preview
 *  and a link minted on the live site points at the live site. */
async function origin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "algorithmx.co.uk";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export type MintResult =
  | { ok: true; url: string; expiresAt: string }
  | { ok: false; error: string };

export async function createShareLink(formData: FormData): Promise<MintResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };
  const ctx = await getTeacherContext(session.user.id);
  if (!ctx) return { ok: false, error: "Your account is not on a school licence." };

  const week = Number(formData.get("week"));
  if (!Number.isInteger(week)) return { ok: false, error: "Pick a week." };

  const rawDays = Number(formData.get("days"));
  const days = Number.isFinite(rawDays) ? rawDays : undefined;
  if (days !== undefined && (days < 1 || days > MAX_DAYS)) {
    return { ok: false, error: `Choose between 1 and ${MAX_DAYS} days.` };
  }

  const label = String(formData.get("label") ?? "").slice(0, 120);

  const link = await mintShareLink({
    week,
    orgId: ctx.orgId,
    createdById: session.user.id,
    label,
    days,
    origin: await origin(),
  });
  if (!link) return { ok: false, error: "That week does not have a pack written yet." };

  revalidatePath("/schools/teach");
  return { ok: true, url: link.url, expiresAt: link.expiresAt.toISOString() };
}

export async function revokeShare(formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  const ctx = await getTeacherContext(session.user.id);
  if (!ctx) return;

  const id = String(formData.get("id") ?? "");
  if (id) await revokeShareLink(id, ctx.orgId);
  revalidatePath("/schools/teach");
}
