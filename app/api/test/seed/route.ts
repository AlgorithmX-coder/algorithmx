import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

/**
 * Test-only endpoint that upserts a known E2E test user (and child
 * profile) so Playwright specs can sign in deterministically. Gated on
 * `E2E_TESTS=1` - any other environment returns 404 so this surface
 * cannot be hit on production.
 *
 * The test user lives at e2e@algorithmx.test with password `e2e-test-pw`.
 * Tests should never depend on any other user - this endpoint is the
 * single source of truth for the fixture.
 *
 * Access is granted via an Entitlement row (source=MANUAL) against the
 * cyber-heroes Product — replacing the old stripeStatus="active" hack.
 */

const TEST_EMAIL = "e2e@algorithmx.test";
const TEST_PASSWORD = "e2e-test-pw";
const TEST_CHILD_NAME = "Test Hero";
// Fixed DOB — makes the child ~9 years old as of 2026, matching the
// previous TEST_CHILD_AGE=9 fixture. Derive age at read-time, never store.
const TEST_CHILD_DOB = new Date("2017-01-01");
const TEST_CHILD_COLOUR = "blue";
const TEST_PRODUCT_SLUG = "cyber-heroes";

function isTestModeEnabled() {
  return process.env.E2E_TESTS === "1";
}

export async function POST() {
  if (!isTestModeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // The cyber-heroes Product (and its week-1 CourseContent) must be
  // populated by `prisma db seed`. The seed route only verifies — it
  // does not duplicate catalogue data.
  const product = await prisma.product.findUnique({
    where: { slug: TEST_PRODUCT_SLUG },
  });
  if (!product) {
    return NextResponse.json(
      {
        error:
          "cyber-heroes Product is missing. Run 'prisma db seed' before running e2e tests.",
      },
      { status: 500 },
    );
  }

  const week1Content = await prisma.courseContent.findUnique({
    where: { productId_week: { productId: product.id, week: 1 } },
  });
  if (!week1Content) {
    return NextResponse.json(
      {
        error:
          "Week-1 CourseContent for cyber-heroes is missing. Run 'prisma db seed' before running e2e tests.",
      },
      { status: 500 },
    );
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    create: {
      email: TEST_EMAIL,
      name: "E2E Test Parent",
      hashedPassword,
      role: "learner",
    },
    update: {
      hashedPassword,
      role: "learner",
    },
  });

  // Wipe Progress for any of the test user's existing children before
  // we delete the children themselves. Progress now hangs off
  // childProfileId, not userId — so query via the child rows.
  const existingChildren = await prisma.childProfile.findMany({
    where: { userId: user.id },
    select: { id: true },
  });
  if (existingChildren.length > 0) {
    await prisma.progress.deleteMany({
      where: {
        childProfileId: { in: existingChildren.map((c) => c.id) },
      },
    });
  }

  // Ensure exactly one child profile exists. Delete-then-create so we
  // start each test run with a clean slate.
  await prisma.childProfile.deleteMany({ where: { userId: user.id } });
  await prisma.childProfile.create({
    data: {
      userId: user.id,
      name: TEST_CHILD_NAME,
      dateOfBirth: TEST_CHILD_DOB,
      favouriteColour: TEST_CHILD_COLOUR,
    },
  });

  // Grant access to the cyber-heroes Product via a manual entitlement.
  // Idempotent — upsert on the (userId, productId) composite unique.
  await prisma.entitlement.upsert({
    where: {
      userId_productId: { userId: user.id, productId: product.id },
    },
    create: {
      userId: user.id,
      productId: product.id,
      source: "MANUAL",
    },
    update: {
      source: "MANUAL",
    },
  });

  return NextResponse.json({
    ok: true,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    // Keep `childName` in the response payload — the e2e specs read
    // this key, even though the DB column is now `name`.
    childName: TEST_CHILD_NAME,
  });
}

export async function GET() {
  // Allow GET for easy verification while debugging - same gate.
  return POST();
}
