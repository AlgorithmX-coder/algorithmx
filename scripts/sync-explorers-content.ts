import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Idempotent CourseContent sync for Cyber Explorers ONLY.
 *
 * Run with:  npx tsx scripts/sync-explorers-content.ts
 * (DATABASE_URL from the environment decides which DB it hits.)
 *
 * Why not the full seed? The seed's content sync is drop-and-recreate,
 * and CourseContent deletion CASCADES to Progress — running it against
 * a live database would wipe every child's progress. This script only
 * UPSERTS the 20 Explorers rows (titles/descriptions converge, ids are
 * preserved) and bumps the product's weeksCount. It touches nothing
 * else: no status, no price, no other products.
 *
 * Titles must stay in lock-step with prisma/seed.ts (the source of
 * truth for fresh databases).
 */

const MISSIONS = [
  { week: 1,  title: "The 24-Hour Threat",    description: "Why urgent messages rush you - and how to read a sender's address like an analyst." },
  { week: 2,  title: "Too Good To Be True",   description: "Free is a price. Trace a prize scam from chat to fake site and cut its hub." },
  { week: 3,  title: "The Guessing Game",     description: "How password guessing really works - and passphrases that survive it." },
  { week: 4,  title: "The Puzzle You Posted", description: "How strangers combine small clues you post - and how to scrub the trail." },
  { week: 5,  title: "Signal Storm",          description: "The same trick across texts, QR codes and DMs - triage the flood, spot the spear." },
  { week: 6,  title: "Levers",                description: "The six pressure levers scammers pull - naming the lever kills it." },
  { week: 7,  title: "Borrowed Faces",        description: "When a real friend's account is stolen - verify on a different channel." },
  { week: 8,  title: "The Perfect Message",   description: "AI writes flawless scams now - verify by source, never by style." },
  { week: 9,  title: "The Long Game",         description: "Trust-farming and the sunk-cost trap - and how to exit a con without shame." },
  { week: 10, title: "The Voice",             description: "Voice cloning and deepfakes - set a family code word that beats them." },
  { week: 11, title: "The Master Key",        description: "Password managers and 2FA - build defenses and watch attacks bounce." },
  { week: 12, title: "Unreadable",            description: "Make and break ciphers, then meet real encryption - the padlock in your day." },
  { week: 13, title: "Backdoors",             description: "Account recovery is a back door - make security answers unguessable." },
  { week: 14, title: "The Update Trap",       description: "Apps are sets of powers - permissions, patches, and fake installers." },
  { week: 15, title: "The Real Site",         description: "Pixel-perfect fake login pages - the address bar and your tools see through them." },
  { week: 16, title: "The File On You",       description: "The data economy keeps a file on you - audit it, shrink it, own it." },
  { week: 17, title: "Ghost Stories",         description: "Synthetic images and fake screenshots - lateral reading before believing or sharing." },
  { week: 18, title: "The Recruiter",         description: "How cybercrime recruits kids with small favors - recognise the pitch, report it." },
  { week: 19, title: "Static Rising",         description: "A full campaign - recon to harvest - and defense in depth that holds the line." },
  { week: 20, title: "Signal Zero",           description: "The capstone: every skill, one final flood, and the coordinator unmasked." },
];

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: "cyberexplorers" },
    select: { id: true, weeksCount: true },
  });
  if (!product) {
    throw new Error(
      "Product 'cyberexplorers' not found — seed the catalogue first.",
    );
  }

  for (const m of MISSIONS) {
    await prisma.courseContent.upsert({
      where: { productId_week: { productId: product.id, week: m.week } },
      create: {
        productId: product.id,
        week: m.week,
        title: m.title,
        description: m.description,
        order: m.week,
      },
      update: { title: m.title, description: m.description, order: m.week },
    });
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { weeksCount: MISSIONS.length, weeks: MISSIONS.length },
  });

  const count = await prisma.courseContent.count({
    where: { productId: product.id },
  });
  console.log(`cyberexplorers CourseContent rows: ${count} (expected 20)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().then(() => process.exit(1));
  });
