import { NextResponse } from "next/server";
import { lookupClass } from "@/app/lib/pupilAuth";

/**
 * Turn a class code into the names on the login cards.
 *
 * Deliberately unauthenticated: the child typing it has no account yet, and
 * the code IS the credential for this step. It returns first names, a colour
 * each, and whether each child has signed in before. Nothing else: no
 * surname, no email, no school name, no class id that would let anything be
 * written.
 *
 * A code that does not exist, a class that has been archived and a code of
 * the wrong shape all get the same answer, because a child does not need to
 * know which it was and a stranger should not be told.
 */
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let code = "";
  try {
    const body = (await req.json()) as { code?: unknown };
    if (typeof body.code === "string") code = body.code;
  } catch {
    /* a malformed body is just a wrong code as far as the child is concerned */
  }

  const found = await lookupClass(code);
  if (!found) {
    return NextResponse.json(
      { error: "We cannot find that class. Check the code on your card." },
      { status: 404 },
    );
  }

  /* No caching anywhere: this is a live list of children in a room. */
  return NextResponse.json(found, {
    headers: { "cache-control": "no-store" },
  });
}
