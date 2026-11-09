import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { pupilDestination } from "@/app/lib/pupilAuth";

/**
 * /schools/play: the one door a child goes through, whatever course their
 * class runs.
 *
 * The login used to send every child to /cyberhq, which is Cyber Heroes. A
 * class can be put on any of the four courses, and the other three have
 * their own portals, so a child in a Cyber Explorers class landed on the
 * Heroes hub and had no way to reach their own lessons.
 *
 * It is a route rather than a decision made in the login for two reasons.
 * The class code lookup runs BEFORE anybody is signed in, so it must not
 * start handing out a class's course to whoever types a code; and this
 * gives the school one stable address for "take this child to their work",
 * which is what a printed card or a browser bookmark on a shared classroom
 * machine needs. The answer is recomputed on every visit, so a class moved
 * up a course in September needs nothing migrated.
 */
export const dynamic = "force-dynamic";

export default async function SchoolPlayPage() {
  const session = await auth();
  /* Their own door, not /login: a child has no email address to type. */
  if (!session?.user?.id) redirect("/schools/login");
  redirect(await pupilDestination(session.user.id));
}
