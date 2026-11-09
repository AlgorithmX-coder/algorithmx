import { redirect } from "next/navigation";

/**
 * /c/ABCD-EFG: one short link per class.
 *
 * WHY THIS EXISTS. The sign-in asks a child to type their class code, and a
 * six year old typing ABCD-EFG off a card is the worst moment in the
 * product. This is the same code as a link, so the teacher can write one
 * address on the board, bookmark it once on the class machines, or send it
 * home, and the child never types anything: they land on the list of names
 * and tap their own.
 *
 * WHY NOT ONE LINK PER SCHOOL. The code is the only thing standing between
 * a stranger and a list of the first names of every child in a class. It is
 * generated rather than chosen, and seven characters from a 29 letter
 * alphabet, for exactly that reason (see pupilAuth.ts). A school-wide page
 * that lists classes to whoever arrives would hand that away. The code
 * stays; only the typing goes.
 *
 * Deliberately does not touch the database. It hands the code to the login,
 * which already looks it up and already says the right thing about a code
 * that does not exist, an archived class or a school whose access is
 * closed. One lookup, one set of words, one place to change them.
 */
export const dynamic = "force-dynamic";

/* Tolerant of how it was written down: lower case off a browser's history,
   spaces from a whiteboard, a missing hyphen from somebody retyping it. The
   login's own pattern is the final judge. */
function tidy(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s_]+/g, "").slice(0, 16);
}

export default async function ClassLinkPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const clean = tidy(decodeURIComponent(code ?? ""));
  redirect(clean ? `/schools/login?class=${encodeURIComponent(clean)}` : "/schools/login");
}
