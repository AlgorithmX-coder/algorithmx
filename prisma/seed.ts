import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const modules = [
  { weekNumber: 1, title: "What is a Password?", description: "Learn why passwords matter and how to create strong ones that keep you safe online." },
  { weekNumber: 2, title: "Keeping Your Information Private", description: "Discover what personal information is and why some things should stay private." },
  { weekNumber: 3, title: "Who Are You Talking To?", description: "Learn how to spot fake profiles and stay safe when chatting online." },
  { weekNumber: 4, title: "Is This Real or Fake?", description: "Spot scam messages, fake pop-ups, and tricks that try to fool you." },
  { weekNumber: 5, title: "Being Kind Online", description: "Understand cyberbullying, how words can hurt online, and what to do if it happens." },
  { weekNumber: 6, title: "Safe Gaming", description: "Stay safe in Roblox, Minecraft, and Fortnite — stranger chat, reporting, and blocking." },
  { weekNumber: 7, title: "Spending Money in Games", description: "Learn about loot boxes, V-Bucks, Robux, and why to always ask a grown-up before buying." },
  { weekNumber: 8, title: "Photos and Videos", description: "Think before you share — screenshots last forever and consent matters." },
  { weekNumber: 9, title: "Apps and Downloads", description: "Spot fake apps, understand permissions, and only download with permission." },
  { weekNumber: 10, title: "YouTube and Video Safety", description: "Stay safe watching videos — avoid rabbit holes, report bad content, and manage screen time." },
  { weekNumber: 11, title: "What to Do When Something Goes Wrong", description: "Learn how to report, block, and tell a trusted grown-up — it's never your fault." },
  { weekNumber: 12, title: "Your Digital Footprint", description: "Everything you do online leaves a trail — learn to be proud of yours." },
  { weekNumber: 13, title: "Screen Time and Staying Healthy", description: "Balance your time online with breaks, sleep, and healthy habits." },
  { weekNumber: 14, title: "Alexa, Siri and Smart Devices", description: "Understand what smart devices hear and see, and how to protect your privacy." },
  { weekNumber: 15, title: "Talking to AI", description: "Learn about ChatGPT and chatbots — what they know, and what never to share with them." },
  { weekNumber: 16, title: "QR Codes and Links", description: "Don't scan random codes or click mystery links — learn to check before you tap." },
  { weekNumber: 17, title: "Social Media Safety", description: "Stay safe on TikTok, Snapchat, and Instagram — privacy settings, strangers, and what to post." },
  { weekNumber: 18, title: "Sharing Devices", description: "Keep your stuff private on family tablets — logging out, separate accounts, and boundaries." },
  { weekNumber: 19, title: "Protecting Your Family", description: "Become the family cyber expert — help your parents and grandparents stay safe too." },
  { weekNumber: 20, title: "Cyber Hero Graduation", description: "The ultimate challenge! Test everything you've learned and earn your Cyber Hero certificate." },
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
