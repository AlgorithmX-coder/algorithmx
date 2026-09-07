import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { EXPLORERS_CONTENT } from "../prisma/explorersContent";

/**
 * PROD-SAFE seeding of the Cyber Explorers CourseContent (the 20 cases).
 *
 * Run this ONCE against a database to add/refresh the cyberexplorers content
 * rows that per-child Progress FKs to. Safe to re-run.
 *
 *   DATABASE_URL="<prod url>" npx tsx scripts/seed-explorers-content.ts
 *
 * WHY this exists instead of `prisma db seed`: the full seed does
 * courseContent.deleteMany() per product, and Progress cascades on
 * CourseContent delete — so running the full seed on prod would WIPE every
 * child's saved progress. This script ONLY upserts by (productId, week); it
 * never deletes, so it can never cascade-delete a Progress row.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: "cyberexplorers" },
    select: { id: true, slug: true, status: true },
  });
  if (!product) {
    throw new Error(
      "No 'cyberexplorers' product row. Ensure the product catalogue is seeded first (it is a non-destructive product.upsert in prisma/seed.ts).",
    );
  }

  let created = 0;
  let updated = 0;
  for (const c of EXPLORERS_CONTENT) {
    const existing = await prisma.courseContent.findUnique({
      where: { productId_week: { productId: product.id, week: c.week } },
      select: { id: true },
    });
    await prisma.courseContent.upsert({
      where: { productId_week: { productId: product.id, week: c.week } },
      update: { title: c.title, description: c.description, order: c.week },
      create: {
        productId: product.id,
        week: c.week,
        order: c.week,
        title: c.title,
        description: c.description,
      },
    });
    existing ? updated++ : created++;
  }

  // Keep weeksCount accurate without touching status/pricing (commercial state).
  const total = await prisma.courseContent.count({ where: { productId: product.id } });
  if (total !== 20) console.warn(`  ! expected 20 content rows, found ${total}`);
  await prisma.product.update({ where: { id: product.id }, data: { weeksCount: total } });

  console.log(`cyberexplorers content synced: ${created} created, ${updated} updated, ${total} total. Status left as ${product.status}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
