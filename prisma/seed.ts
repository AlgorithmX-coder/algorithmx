import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const modules = [
  { weekNumber: 1, title: "Passwords: The Secret Code", description: "Discover why passwords matter and learn how to create super strong ones." },
  { weekNumber: 2, title: "Private Info: Guard Your Secrets", description: "Learn what personal information is and why some things should stay private." },
  { weekNumber: 3, title: "Stranger Danger: Friend or Foe?", description: "Spot fake profiles and stay safe when chatting to people online." },
  { weekNumber: 4, title: "Scams and Tricks: Real or Fake?", description: "Learn to spot scam messages, fake pop-ups, and sneaky tricks." },
  { weekNumber: 5, title: "Cyberbullying: Words Have Power", description: "Understand how words can hurt online and what to do if it happens." },
  { weekNumber: 6, title: "Gaming Safety: Defend Your Game Zone", description: "Stay safe in Roblox, Minecraft, and Fortnite — chat, reporting, and blocking." },
  { weekNumber: 7, title: "In-Game Spending: The V-Bucks Trap", description: "Learn about loot boxes, Robux, V-Bucks, and why to always ask a grown-up first." },
  { weekNumber: 8, title: "Photos & Videos: Think Before You Share", description: "Discover why screenshots last forever and why consent matters." },
  { weekNumber: 9, title: "Apps & Downloads: Spot the Fakes", description: "Learn to spot fake apps, understand permissions, and stay safe downloading." },
  { weekNumber: 10, title: "YouTube & Videos: Escape the Rabbit Hole", description: "Stay safe watching videos — avoid rabbit holes and manage screen time." },
  { weekNumber: 11, title: "Something Wrong? Emergency Protocol", description: "Learn how to report, block, and tell a trusted grown-up — it's never your fault." },
  { weekNumber: 12, title: "Digital Footprint: Tracks in the Snow", description: "Everything you do online leaves a trail — learn to be proud of yours." },
  { weekNumber: 13, title: "Screen Time: Balance Your Power", description: "Find the right balance between time online, breaks, sleep, and healthy habits." },
  { weekNumber: 14, title: "Smart Devices: Who's Listening?", description: "Understand what Alexa, Siri, and smart devices hear and how to protect your privacy." },
  { weekNumber: 15, title: "AI & Chatbots: Robot or Real?", description: "Learn about ChatGPT and chatbots — what they know and what never to share." },
  { weekNumber: 16, title: "QR Codes & Links: Don't Take the Bait", description: "Learn to check before you scan or click — not every link is safe." },
  { weekNumber: 17, title: "Social Media: The Profile Shield", description: "Stay safe on TikTok, Snapchat, and Instagram — privacy, strangers, and smart posting." },
  { weekNumber: 18, title: "Sharing Devices: Lock Before You Leave", description: "Keep your stuff private on family tablets — logging out and setting boundaries." },
  { weekNumber: 19, title: "Protecting Family: Family Firewall", description: "Become the family cyber expert — help your parents and grandparents stay safe." },
  { weekNumber: 20, title: "Graduation Day: The Final Mission", description: "The ultimate challenge! Test everything you've learned and earn your Cyber Hero certificate." },
];

async function main() {
  console.log("Seeding database...");

  const existing = await prisma.course.findFirst({ where: { title: "Cyber Heroes Academy" } });
  if (existing) {
    // Update course weeksCount
    await prisma.course.update({
      where: { id: existing.id },
      data: { weeksCount: 20 },
    });

    // Upsert modules: update existing, create new
    for (const m of modules) {
      const existingModule = await prisma.module.findFirst({
        where: { courseId: existing.id, weekNumber: m.weekNumber },
      });
      if (existingModule) {
        await prisma.module.update({
          where: { id: existingModule.id },
          data: { title: m.title, description: m.description, order: m.weekNumber },
        });
      } else {
        await prisma.module.create({
          data: {
            courseId: existing.id,
            weekNumber: m.weekNumber,
            title: m.title,
            description: m.description,
            order: m.weekNumber,
          },
        });
      }
    }

    console.log(`Updated course: ${existing.title} to 20 modules.`);
    return;
  }

  const course = await prisma.course.create({
    data: {
      title: "Cyber Heroes Academy",
      description: "A fun, beginner-friendly course teaching kids the fundamentals of cybersecurity through interactive weekly lessons.",
      ageRange: "6–10",
      duration: "45 min/week",
      weeksCount: 20,
      emoji: "🛡️",
      color: "hsl(195, 100%, 50%)",
      modules: {
        create: modules.map((m) => ({
          weekNumber: m.weekNumber,
          title: m.title,
          description: m.description,
          order: m.weekNumber,
        })),
      },
    },
  });

  console.log(`Created course: ${course.title} with 20 modules.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
