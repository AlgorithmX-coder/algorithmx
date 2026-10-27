/* LOCAL ONLY: mark some weeks complete so the wardrobe trial has kit to show.
 *
 * The e2e child profile starts with nothing finished, so "Your Kit" would show
 * only the base outfit - true, but useless for judging the panel. This marks
 * weeks 1-7 complete on the LOCAL dev database so the derivation
 * (completedAt -> earned kit) is genuinely exercised rather than faked in the UI.
 *
 * It REFUSES to run against anything but localhost. The seed endpoint and
 * scripts like this one create rows, and this repo has already had 450 fake
 * users land in production once; that is not happening twice.
 *
 *   node --env-file=.env scripts/_wardrobe-trial-seed.mjs
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL || "";
const host = (() => {
  try { return new URL(url).hostname; } catch { return ""; }
})();
if (!["localhost", "127.0.0.1", "::1"].includes(host)) {
  console.error(`refusing to write to ${host || "an unparseable DATABASE_URL"} - local only`);
  process.exit(2);
}
console.log(`database host: ${host} (safe)`);

/* Prisma 7 needs an explicit adapter - same shape as app/lib/prisma.ts. */
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
/* Overridable so the unlock check can drive several scenarios. */
const WEEKS = (process.env.TRIAL_WEEKS ?? "1,2,3,4,5,6,7")
  .split(",").map((n) => Number(n.trim())).filter((n) => Number.isInteger(n) && n > 0);
/* A week the child has STARTED but not finished - it must unlock nothing. */
const OPEN_WEEK = Number(process.env.TRIAL_OPEN_WEEK) || 0;

const product = await prisma.product.findFirst({ where: { slug: "cyber-heroes" } });
if (!product) {
  console.error("no cyber-heroes product row in the local database");
  process.exit(1);
}

const child = await prisma.childProfile.findFirst({
  where: { user: { email: "e2e@algorithmx.test" } },
  select: { id: true, name: true },
});
if (!child) {
  console.error("no child profile for e2e@algorithmx.test - run the seed endpoint first");
  process.exit(1);
}
console.log(`child profile: ${child.name}`);

/* Clear this child's rows so each scenario starts clean - otherwise an
 * earlier scenario's completed weeks leak into the next one and the check
 * passes for the wrong reason. */
await prisma.progress.deleteMany({ where: { childProfileId: child.id, productId: product.id } });

let touched = 0;
for (const week of WEEKS) {
  const content = await prisma.courseContent.findFirst({
    where: { productId: product.id, week },
    select: { id: true },
  });
  if (!content) { console.log(`  w${week}: no courseContent row, skipped`); continue; }

  await prisma.progress.upsert({
    where: { childProfileId_productId_week: { childProfileId: child.id, productId: product.id, week } },
    update: { completedAt: new Date(), screen: 29 },
    create: {
      childProfileId: child.id,
      productId: product.id,
      courseContentId: content.id,
      week,
      screen: 29,
      stars: 3,
      xp: 300,
      completedAt: new Date(),
    },
  });
  touched++;
}

console.log(`${touched} week(s) marked complete locally: ${WEEKS.slice(0, touched).join(", ")}`);
await prisma.$disconnect();
