import "dotenv/config";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

/**
 * Product catalogue + per-week CourseContent.
 *
 * - `priceGBP` is stored in PENCE (9900 = £99.00).
 * - `weeksCount` on Product is a cached count of CourseContent rows.
 *   We set it to the literal array length here so the two can never
 *   disagree. Any future content edit MUST update this in lock-step
 *   (preferably via a wrapper, but the seed is the source of truth).
 * - COMING_SOON products surface on the marketing pages + accept
 *   waitlist sign-ups but cannot be played. They have no CourseContent
 *   yet, so `weeksCount = 0`.
 */

const cyberHeroesWeeks = [
  { week: 1,  title: "Passwords: The Secret Code",            description: "Discover why passwords matter and learn how to create super strong ones." },
  { week: 2,  title: "Private Info: Guard Your Secrets",       description: "Learn what personal information is and why some things should stay private." },
  { week: 3,  title: "Stranger Danger: Friend or Foe?",        description: "Spot fake profiles and stay safe when chatting to people online." },
  { week: 4,  title: "Scams and Tricks: Real or Fake?",        description: "Learn to spot scam messages, fake pop-ups, and sneaky tricks." },
  { week: 5,  title: "Cyberbullying: Words Have Power",        description: "Understand how words can hurt online and what to do if it happens." },
  { week: 6,  title: "Gaming Safety: Defend Your Game Zone",   description: "Stay safe in Roblox, Minecraft, and Fortnite - chat, reporting, and blocking." },
  { week: 7,  title: "In-Game Spending: The V-Bucks Trap",     description: "Learn about loot boxes, Robux, V-Bucks, and why to always ask a grown-up first." },
  { week: 8,  title: "Photos & Videos: Think Before You Share", description: "Discover why screenshots last forever and why consent matters." },
  { week: 9,  title: "Apps & Downloads: Spot the Fakes",       description: "Learn to spot fake apps, understand permissions, and stay safe downloading." },
  { week: 10, title: "YouTube & Videos: Escape the Rabbit Hole", description: "Stay safe watching videos - avoid rabbit holes and manage screen time." },
  { week: 11, title: "Something Wrong? Emergency Protocol",    description: "Learn how to report, block, and tell a trusted grown-up - it's never your fault." },
  { week: 12, title: "Digital Footprint: Tracks in the Snow",  description: "Everything you do online leaves a trail - learn to be proud of yours." },
  { week: 13, title: "Screen Time: Balance Your Power",        description: "Find the right balance between time online, breaks, sleep, and healthy habits." },
  { week: 14, title: "Smart Devices: Who's Listening?",        description: "Understand what Alexa, Siri, and smart devices hear and how to protect your privacy." },
  { week: 15, title: "AI & Chatbots: Robot or Real?",          description: "Learn about ChatGPT and chatbots - what they know and what never to share." },
  { week: 16, title: "QR Codes & Links: Don't Take the Bait",  description: "Learn to check before you scan or click - not every link is safe." },
  { week: 17, title: "Social Media: The Profile Shield",       description: "Stay safe on TikTok, Snapchat, and Instagram - privacy, strangers, and smart posting." },
  { week: 18, title: "Sharing Devices: Lock Before You Leave", description: "Keep your stuff private on family tablets - logging out and setting boundaries." },
  { week: 19, title: "Protecting Family: Family Firewall",     description: "Become the family cyber expert - help your parents and grandparents stay safe." },
  { week: 20, title: "Graduation Day: The Final Mission",      description: "The ultimate challenge! Test everything you've learned and earn your Cyber Hero certificate." },
];

const products = [
  {
    slug: "cyber-heroes",
    name: "Cyber Heroes Academy",
    ageMin: 6,
    ageMax: 9,
    priceGBP: 9900,
    weeks: 20,
    status: ProductStatus.ACTIVE,
    emoji: "🛡️",
    ageRange: "6–9",
    duration: "45 min/week",
    weeksCount: cyberHeroesWeeks.length,
    content: cyberHeroesWeeks,
  },
  // Marketing-only tracks the waitlist form currently advertises. They
  // exist as catalogue rows so /api/waitlist FK lookups succeed; no
  // CourseContent until they actually launch.
  {
    slug: "cyberexplorers",
    name: "Cyber Explorers",
    ageMin: 10,
    ageMax: 13,
    priceGBP: 9900,
    weeks: 0,
    status: ProductStatus.COMING_SOON,
    emoji: "🧭",
    ageRange: "10–13",
    duration: "60 min/week",
    weeksCount: 0,
    content: [],
  },
  {
    slug: "cyberstart",
    name: "CyberStart",
    ageMin: 14,
    ageMax: 16,
    priceGBP: 9900,
    weeks: 0,
    status: ProductStatus.COMING_SOON,
    emoji: "🚀",
    ageRange: "14–16",
    duration: "60 min/week",
    weeksCount: 0,
    content: [],
  },
  {
    // Adult tier. Display name is "Cyber Pro"; the slug keeps the legacy
    // value because renaming it is a routing/Stripe decision of its own.
    // Canon: docs/pro/cyber-pro-design.md (18+, £99 owner-locked 2026-08).
    slug: "cyberstart-pro",
    name: "Cyber Pro",
    ageMin: 18,
    ageMax: 99,
    priceGBP: 9900,
    weeks: 0,
    status: ProductStatus.COMING_SOON,
    emoji: "🎓",
    ageRange: "18+",
    duration: "2 hrs/week",
    weeksCount: 0,
    content: [],
  },
];

async function main() {
  console.log("Seeding products + course content…");

  for (const p of products) {
    const { content, ...productFields } = p;

    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: productFields,
      create: productFields,
    });

    // Idempotent content sync: drop + recreate every row in one
    // transaction so re-runs converge on the same end state without
    // drift if titles/descriptions change.
    await prisma.$transaction([
      prisma.courseContent.deleteMany({ where: { productId: product.id } }),
      ...content.map((c) =>
        prisma.courseContent.create({
          data: {
            productId: product.id,
            week: c.week,
            order: c.week,
            title: c.title,
            description: c.description,
          },
        }),
      ),
    ]);

    const actualCount = await prisma.courseContent.count({
      where: { productId: product.id },
    });
    if (actualCount !== productFields.weeksCount) {
      // Lock-step guarantee — should never fire given the seed array
      // is the source of truth, but catches drift if hand-edited.
      await prisma.product.update({
        where: { id: product.id },
        data: { weeksCount: actualCount },
      });
    }

    console.log(`  · ${p.slug} (${p.status}) — ${actualCount} week(s)`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
