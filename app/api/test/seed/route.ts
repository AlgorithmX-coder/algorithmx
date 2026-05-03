import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/app/lib/prisma";

/**
 * Test-only endpoint that upserts a known E2E test user (and child
 * profile) so Playwright specs can sign in deterministically. Gated on
 * `E2E_TESTS=1` — any other environment returns 404 so this surface
 * cannot be hit on production.
 *
 * The test user lives at e2e@algorithmx.test with password `e2e-test-pw`.
 * Tests should never depend on any other user — this endpoint is the
 * single source of truth for the fixture.
 */

const TEST_EMAIL = "e2e@algorithmx.test";
const TEST_PASSWORD = "e2e-test-pw";
const TEST_CHILD_NAME = "Test Hero";
const TEST_CHILD_AGE = 9;

function isTestModeEnabled() {
  return process.env.E2E_TESTS === "1";
}

export async function POST() {
  if (!isTestModeEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    create: {
      email: TEST_EMAIL,
      name: "E2E Test Parent",
      hashedPassword,
      role: "learner",
      // Mark the test user as enrolled so the paywall doesn't bounce
      // /lesson/* requests during e2e runs.
      stripeStatus: "active",
      stripePaidAt: new Date(),
    },
    update: {
      hashedPassword,
      stripeStatus: "active",
      stripePaidAt: new Date(),
    },
  });

  // Ensure exactly one child profile exists. Delete-then-create so we
  // start each test run with a clean slate.
  await prisma.childProfile.deleteMany({ where: { userId: user.id } });
  await prisma.childProfile.create({
    data: {
      userId: user.id,
      childName: TEST_CHILD_NAME,
      age: TEST_CHILD_AGE,
      avatarColor: "blue",
    },
  });

  // Wipe any in-flight progress so tests start fresh.
  await prisma.progress.deleteMany({ where: { userId: user.id } });

  // Ensure the Cyber Heroes course + week-1 module exist so /lesson
  // doesn't 404 in a freshly-cloned test environment.
  let course = await prisma.course.findFirst({
    where: { title: "Cyber Heroes Academy" },
  });
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "Cyber Heroes Academy",
        description: "Beginner cybersecurity for ages 6-10.",
        ageRange: "6-10",
        duration: "45 min/week",
        weeksCount: 20,
        emoji: "🛡️",
        color: "hsl(195, 100%, 50%)",
      },
    });
  }
  const week1 = await prisma.module.findFirst({
    where: { courseId: course.id, weekNumber: 1 },
  });
  if (!week1) {
    await prisma.module.create({
      data: {
        courseId: course.id,
        weekNumber: 1,
        order: 1,
        title: "Passwords: The Secret Code",
        description: "Learn what passwords are and how to make them strong.",
      },
    });
  }

  return NextResponse.json({
    ok: true,
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    childName: TEST_CHILD_NAME,
  });
}

export async function GET() {
  // Allow GET for easy verification while debugging — same gate.
  return POST();
}
