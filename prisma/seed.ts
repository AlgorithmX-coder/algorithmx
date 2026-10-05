import "dotenv/config";
import { PrismaClient, ProductStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { EXPLORERS_CONTENT } from "./explorersContent";

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

// Cyber Ops (14-17). The LOCKED 16-week curriculum (design spine section 8).
// Kept in lock-step with the idempotent prod data migration
// 20261005120100_cyber_ops_content; edit both together.
const cyberOpsWeeks = [
  { week: 1,  title: "Rules of Engagement",        description: "Meet Redoubt, sign your first scope, and land a fully authorized first capture." },
  { week: 2,  title: "Reconnaissance & OSINT",     description: "Footprint a fake company from public information. Map the attack surface before you act." },
  { week: 3,  title: "The Web Surface",            description: "How web apps really work. Use dev tools to intercept and modify requests against the range." },
  { week: 4,  title: "Broken Authentication",      description: "Credential attacks, weak sessions, and MFA gaps against a fake login." },
  { week: 5,  title: "Injection",                  description: "Run a real SQL injection against a sandboxed database and extract what the scope allows." },
  { week: 6,  title: "Cross-Site Scripting",       description: "Inject script into a fake app, simulate cookie theft, and see why client-side trust fails." },
  { week: 7,  title: "Broken Access Control",      description: "IDOR, forced browsing, and privilege escalation — reach what should not be yours." },
  { week: 8,  title: "Cryptography",               description: "Encoding vs hashing vs encryption. Break weak and classical crypto, and learn why it matters." },
  { week: 9,  title: "Passwords & Hashes",         description: "Cracking concepts in-range: salting, rainbow tables, and the case for strong hashing." },
  { week: 10, title: "Network Recon",              description: "Port scanning and service enumeration against a fake network." },
  { week: 11, title: "Digital Forensics",          description: "Analyse logs and reconstruct a timeline to find the attacker's trail. Start reading the other side." },
  { week: 12, title: "Incident Response",          description: "Now you defend: detect, contain, and eradicate a live simulated breach." },
  { week: 13, title: "Social Engineering Defence", description: "Recognise phishing and pretexting. Analysis only — you spot the con, never author it." },
  { week: 14, title: "Disclosure & Reporting",     description: "The craft of the writeup: severity scoring and how real researchers disclose. Portfolio polish." },
  { week: 15, title: "Full Engagement, Part 1",    description: "A complete multi-stage engagement against a fake client: recon through exploit." },
  { week: 16, title: "Full Engagement, Part 2",    description: "Write the real report, present your findings, and receive a field-ready rating. Season close." },
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
    // The Explorers course app is live at /explorers; its 20 cases carry
    // per-child Progress (case = week). Status stays COMING_SOON here because
    // catalogue/purchase state is a separate commercial decision — content can
    // exist without flipping that. On prod, add content via the idempotent
    // scripts/seed-explorers-content.ts (never the destructive full seed).
    slug: "cyberexplorers",
    name: "Cyber Explorers",
    ageMin: 10,
    ageMax: 13,
    priceGBP: 9900,
    weeks: 20,
    status: ProductStatus.COMING_SOON,
    emoji: "🧭",
    ageRange: "10–13",
    duration: "60 min/week",
    weeksCount: 20,
    content: EXPLORERS_CONTENT,
  },
  {
    // Cyber Ops course app is being wired at /operators; its 16 engagements
    // carry per-child Progress (engagement = week), with reputation stored in
    // Progress.xp and the portfolio in OpsFinding. Status stays COMING_SOON —
    // catalogue/purchase state is a separate commercial decision; content can
    // exist without flipping it (same pattern as Explorers). On prod, content
    // lands via the idempotent migration, never the destructive full seed.
    slug: "cyberstart",
    name: "Cyber Ops",
    ageMin: 14,
    ageMax: 17,
    priceGBP: 9900,
    weeks: cyberOpsWeeks.length,
    status: ProductStatus.COMING_SOON,
    emoji: "🚀",
    ageRange: "14–17",
    duration: "60 min/week",
    weeksCount: cyberOpsWeeks.length,
    content: cyberOpsWeeks,
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
  /* AI Cleared: the corporate AI-safety course. Seat-licensed by a firm
   * (see Organisation/Seat), so it is excluded from the consumer hub by
   * slug (app/lib/corporateProducts.ts). Price is the Team rate per seat;
   * Firm and Enterprise rates are quoted on /corporate. Adult, module-based,
   * no weekly CourseContent. */
  {
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
    content: [],
  },
];

/* The test firm for AI Cleared. Invented, like everything in the course.
 * Only seeded when SEED_AI_CLEARED_TEST_ORG=1 so an ordinary seed run never
 * creates claimable seats. The invite tokens are fixed so the owner and the
 * testers can reach /ai-cleared/join/<token> on production without a mailbox. */
async function seedAiClearedTestOrg() {
  if (process.env.SEED_AI_CLEARED_TEST_ORG !== "1") {
    console.log("  · ai-cleared test org skipped (set SEED_AI_CLEARED_TEST_ORG=1 to seed Marlow Fenwick)");
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
  ];
  for (const seat of seats) {
    await prisma.seat.upsert({
      where: { orgId_email_course: { orgId: org.id, email: seat.email, course: "AI_CLEARED" } },
      update: {},
      create: { orgId: org.id, ...seat },
    });
  }
  console.log(`  · ai-cleared test org "${org.name}" with ${seats.length} seat(s)`);
}

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

  await seedAiClearedTestOrg();

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
