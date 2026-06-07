/**
 * Dev/admin entitlement grant — temporary stand-in for the real
 * purchase flow while payment is still being built.
 *
 * /dashboard requires a `cyber-heroes` entitlement and otherwise
 * redirects to /hub. Until checkout exists, run this to grant a test
 * account access so you can walk the post-onboarding experience.
 *
 * Usage (from project root):
 *   node scripts/grant-entitlement.mjs <email> [productSlug]
 *
 *   node scripts/grant-entitlement.mjs parent@example.com
 *   node scripts/grant-entitlement.mjs parent@example.com cyber-heroes
 *
 * Grants are written with source=MANUAL and are idempotent (re-running
 * is a no-op, mirroring grantEntitlement()). DATABASE_URL is read from
 * the environment or .env.local / .env.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "node:fs";

const [email, slug = "cyber-heroes"] = process.argv.slice(2);

if (!email) {
  console.error("Usage: node scripts/grant-entitlement.mjs <email> [productSlug]");
  process.exit(1);
}

// Load DATABASE_URL from the environment, falling back to .env files.
for (const f of [".env.local", ".env"]) {
  if (process.env.DATABASE_URL) break;
  if (!fs.existsSync(f)) continue;
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*DATABASE_URL\s*=\s*"?([^"\n]+?)"?\s*$/);
    if (m) {
      process.env.DATABASE_URL = m[1];
      break;
    }
  }
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set (env, .env.local, or .env).");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found with email "${email}".`);
    process.exit(1);
  }

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    const all = await prisma.product.findMany({ select: { slug: true } });
    console.error(
      `No product with slug "${slug}". Available: ${all.map((p) => p.slug).join(", ")}`,
    );
    process.exit(1);
  }

  const ent = await prisma.entitlement.upsert({
    where: { userId_productId: { userId: user.id, productId: product.id } },
    update: {}, // idempotent — never re-stamp grantedAt
    create: { userId: user.id, productId: product.id, source: "MANUAL" },
  });

  console.log(`✓ ${email} now owns "${slug}" (entitlement ${ent.id}, source ${ent.source}).`);
} finally {
  await prisma.$disconnect();
}
