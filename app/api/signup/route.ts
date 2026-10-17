import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";
import { grantEntitlement } from "@/app/lib/entitlements";

const HAS_UPPER = /[A-Z]/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

/* Launch policy: a fresh account signing up through a course's own
 * themed auth page gets that course for free, there and then, so they
 * land straight in it instead of bouncing to the catalogue. Scoped to
 * the consumer courses whose checkout already grants free during launch.
 * Cyber Pro ("cyberstart-pro") is DELIBERATELY excluded while its paid
 * buy is held pending the £99 Stripe wiring. Flip these off (and let the
 * purchase flow be the only grant) once real payment is live. */
const FREE_ON_SIGNUP: ReadonlySet<string> = new Set([
  "cyber-heroes",
  "cyberexplorers",
  "cyberstart",
]);

export async function POST(request: Request) {
  try {
    const { name, email, password, course } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }
    if (!HAS_UPPER.test(password)) {
      return NextResponse.json(
        { error: "Password must include a capital letter" },
        { status: 400 }
      );
    }
    if (!HAS_SPECIAL.test(password)) {
      return NextResponse.json(
        { error: "Password must include a special character (e.g. ! @ # ?)" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, hashedPassword },
    });

    /* Free course access on signup (see FREE_ON_SIGNUP note above).
     * Best-effort: the account is already created, so a failed grant
     * must not fail the signup — we log it and let the user land in the
     * catalogue rather than erroring. `grantEntitlement` itself verifies
     * the Product exists, so an unknown slug can't mint a bogus row. */
    if (typeof course === "string" && FREE_ON_SIGNUP.has(course)) {
      try {
        await grantEntitlement(user.id, course, "MANUAL");
      } catch (grantError) {
        console.error("Signup free-grant failed:", course, grantError);
      }
    }

    return NextResponse.json(
      { message: "Account created", userId: user.id },
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