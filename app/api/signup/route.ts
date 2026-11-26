import { NextResponse } from "next/server";
import { RULES, clientIp, hit, rateKey, tooManyResponse } from "@/app/lib/rateLimit";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { grantEntitlement } from "@/app/lib/entitlements";
import { TESTER_FREE_ACCESS } from "@/app/lib/launchSwitch";
import { emailTaken, normaliseEmail } from "@/app/lib/emailIdentity";

import { passwordProblem } from "@/app/lib/passwordPolicy";
import { asksDateOfBirth, looksLikeEmail, needsParentConsent, parseDateOfBirth } from "@/app/lib/ageCheck";
import { sendParentConsentEmail } from "@/app/lib/parentConsent";

/* Launch policy: a fresh account signing up through a course's own
 * themed auth page gets that course for free, there and then, so they
 * land straight in it instead of bouncing to the catalogue. Scoped to
 * the consumer courses whose checkout already grants free during launch.
 * Cyber Pro ("cyberstart-pro") is included here FOR UAT so testers get
 * the full course (Acts 2-4 are entitlement-gated from Module 6 on) the
 * moment they sign up, instead of having to run the free purchase stub.
 * Desk Ready ("desk-ready") is in for the same reason: its pilot learner
 * tests the moment they sign up.
 * ⚠️ Flip cyberstart-pro and desk-ready back OUT (and let the purchase
 * flow be the only grant) once the £99 Stripe buy is live. */
/* Governed by the one launch switch (app/lib/launchSwitch.ts): flip
 * TESTER_FREE_ACCESS to false at launch and no signup grants anything. */
const FREE_ON_SIGNUP: ReadonlySet<string> = new Set([
  "cyber-heroes",
  "cyberexplorers",
  "cyberstart",
  "cyberstart-pro",
  "desk-ready",
]);

export async function POST(request: Request) {
  /* New accounts per IP, generous enough for a staff room setting up
     together, tight enough that a script cannot mint thousands. */
  const limited = await hit(rateKey("signup-ip", clientIp(request)), RULES.signupIp);
  if (!limited.ok) return tooManyResponse(limited);

  try {
    const { name, email: rawEmail, password, course, dob: rawDob, parentEmail: rawParentEmail } = await request.json();
    /* Stored trimmed and lowercased, and refused if any account already
       holds the address in any case (app/lib/emailIdentity.ts says why). */
    const email = normaliseEmail(rawEmail);

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    /* One rule for every place a password is set (app/lib/passwordPolicy.ts). */
    const weak = passwordProblem(password);
    if (weak) {
      return NextResponse.json({ error: weak }, { status: 400 });
    }

    if (await emailTaken(email)) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    /* UNDER-13s (UK GDPR Article 8). The Cyber Explorers and Cyber Ops
       sign-ups ask for a date of birth; only the year is kept. Under 13, a
       parent's email is required too, and the account waits for that
       parent's consent before any course opens (app/lib/parentConsent.ts). */
    let birthYear: number | null = null;
    let parentEmail: string | null = null;
    if (typeof course === "string" && asksDateOfBirth(course)) {
      const dob = parseDateOfBirth(rawDob);
      if (!dob) {
        return NextResponse.json({ error: "Enter your date of birth." }, { status: 400 });
      }
      birthYear = dob.getUTCFullYear();
      if (needsParentConsent(dob)) {
        parentEmail = typeof rawParentEmail === "string" ? normaliseEmail(rawParentEmail) : "";
        if (!parentEmail || !looksLikeEmail(parentEmail)) {
          return NextResponse.json({ error: "Under 13? Add a parent's email so a grown-up can say yes." }, { status: 400 });
        }
        if (parentEmail === email) {
          return NextResponse.json({ error: "Use a parent's own email, not yours." }, { status: 400 });
        }
      }
    }
    const awaitingParent = parentEmail !== null;

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, hashedPassword, birthYear, needsParentConsent: awaitingParent, parentEmail },
    });

    if (awaitingParent && typeof course === "string") {
      const proto = request.headers.get("x-forwarded-proto") ?? "https";
      const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "www.algorithmx.co.uk";
      /* Best effort: the waiting page can send it again. */
      await sendParentConsentEmail({ userId: user.id, courseSlug: course, origin: `${proto}://${host}` }).catch((err) =>
        console.error("Signup parent email failed:", err),
      );
    }

    /* Free course access on signup (see FREE_ON_SIGNUP note above).
     * Best-effort: the account is already created, so a failed grant
     * must not fail the signup — we log it and let the user land in the
     * catalogue rather than erroring. `grantEntitlement` itself verifies
     * the Product exists, so an unknown slug can't mint a bogus row. */
    /* Not for a child awaiting a parent: nothing is granted before consent. */
    if (TESTER_FREE_ACCESS && !awaitingParent && typeof course === "string" && FREE_ON_SIGNUP.has(course)) {
      try {
        await grantEntitlement(user.id, course, "MANUAL");
      } catch (grantError) {
        console.error("Signup free-grant failed:", course, grantError);
      }
    }

    return NextResponse.json(
      { message: "Account created", userId: user.id, awaitingParent },
      { status: 201 }
    );
  } catch (error) {
    /* Log the full error server-side for Sentry + Vercel logs, but
     * surface a clearer hint to the client so a broken DATABASE_URL
     * or unrun migration isn't masked behind a generic message. */
    console.error("Signup error:", error);
    const message =
      error instanceof Error ? error.message : String(error);
    const isDbError =
      /database|prisma|connect|relation .* does not exist|ECONN|ENOTFOUND/i.test(
        message,
      );
    return NextResponse.json(
      {
        error: isDbError
          ? "We couldn't reach the account database. This is a server-side issue. Please contact support@algorithmx.co.uk."
          : "Something went wrong creating your account. Please try again.",
        ...(process.env.NODE_ENV !== "production" ? { detail: message } : {}),
      },
      { status: 500 }
    );
  }
}