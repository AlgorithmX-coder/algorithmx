import "dotenv/config";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/* Targeted seed for AI Cleared: the product row and, when
 * SEED_AI_CLEARED_TEST_ORG=1, the Marlow Fenwick test firm with its seats.
 *
 * Deliberately separate from prisma/seed.ts, which drops and recreates
 * every product's CourseContent rows; Progress cascades on that FK, so the
 * main seed must never be run against production. This one touches only
 * Product (upsert by slug), Organisation, FirmProfile and Seat.
 *
 *   npx tsx prisma/seedAiCleared.ts
 *   SEED_AI_CLEARED_TEST_ORG=1 npx tsx prisma/seedAiCleared.ts */

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const product = {
    slug: "ai-cleared",
    name: "AI Cleared",
    ageMin: 18,
    ageMax: 99,
    priceGBP: 2900,
    weeks: 0,
    status: ProductStatus.ACTIVE,
    emoji: "🛡️",
    ageRange: "Working adults",
    duration: "About 90 minutes",
    weeksCount: 0,
  };
  const p = await prisma.product.upsert({ where: { slug: product.slug }, update: product, create: product });
  console.log(`  · product ${p.slug} (${p.status})`);

  if (process.env.SEED_AI_CLEARED_TEST_ORG !== "1") {
    console.log("  · test org skipped (set SEED_AI_CLEARED_TEST_ORG=1 to seed Marlow Fenwick)");
    return;
  }
  const org = await prisma.organisation.upsert({
    where: { slug: "marlow-fenwick" },
    update: { name: "Marlow Fenwick LLP", sector: "Legal services", contactName: "Priya Nair", contactRole: "Data Protection Officer", seatsPurchased: 25, plan: "FIRM" },
    create: { name: "Marlow Fenwick LLP", slug: "marlow-fenwick", sector: "Legal services", contactName: "Priya Nair", contactRole: "Data Protection Officer", seatsPurchased: 25, plan: "FIRM" },
  });
  const profile = {
    approvedTools: ["Microsoft 365 Copilot on your work account"],
    askFirstTools: ["Claude Team", "Gemini in Google Workspace"],
    bannedTools: ["Personal ChatGPT", "Browser extensions that read the page", "Meeting note-takers"],
    escalationContact: "Priya Nair",
    escalationRole: "Data Protection Officer",
    regulator: "Solicitors Regulation Authority",
  };
  await prisma.firmProfile.upsert({ where: { orgId: org.id }, update: profile, create: { orgId: org.id, ...profile } });
  const seats = [
    { email: "finance.tester@marlowfenwick.example", inviteToken: "mf-fin-7q2kd9xw4n8p", trackHint: "FINANCE" as const, team: "Finance" },
    { email: "legal.tester@marlowfenwick.example", inviteToken: "mf-leg-c3vn8ry5tz1m", trackHint: "LEGAL" as const, team: "Disputes" },
    { email: "general.tester@marlowfenwick.example", inviteToken: "mf-gen-h6sm2wq9kb4d", trackHint: null, team: null },
    { email: "hr.tester@marlowfenwick.example", inviteToken: "mf-hr-p8wz3nq6vd2k", trackHint: "HR" as const, team: "People" },
    { email: "tester2@marlowfenwick.example", inviteToken: "mf-t2-r4kd8mx2sq7b", trackHint: null, team: null },
    { email: "tester3@marlowfenwick.example", inviteToken: "mf-t3-z9qn5vh3kw6c", trackHint: null, team: null },
  ];
  for (const seat of seats) {
    await prisma.seat.upsert({ where: { orgId_email: { orgId: org.id, email: seat.email } }, update: {}, create: { orgId: org.id, ...seat } });
  }
  console.log(`  · test org "${org.name}" with ${seats.length} seat(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
