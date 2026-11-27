"use server";

import { signOut } from "@/app/lib/auth";

/* Someone opened their firm's team link signed in with the wrong address
 * (a personal one, say). Sign them out and send them to sign in again,
 * landing back on the same link. The path is built here from the token
 * alone, so the form cannot be used to send anyone anywhere else. */
export async function switchToWorkAddress(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "").slice(0, 120);
  const back = `/ai-cleared/join/${encodeURIComponent(token)}`;
  await signOut({ redirectTo: `/cyber-secured/login?callbackUrl=${encodeURIComponent(back)}` });
}
