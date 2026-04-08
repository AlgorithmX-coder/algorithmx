import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const modules = [
  { weekNumber: 1, title: "What is a Password?", description: "Learn why passwords matter and how to create strong ones that keep you safe online." },
  { weekNumber: 2, title: "Good vs Bad Passwords", description: "Discover what makes a password strong or weak, and practise building uncrackable ones." },
  { weekNumber: 3, title: "Staying Safe Online", description: "Explore the golden rules for keeping yourself safe whenever you go on the internet." },
  { weekNumber: 4, title: "What is Personal Information?", description: "Find out what personal information is and why you should keep it private online." },
  { weekNumber: 5, title: "Spotting Stranger Danger Online", description: "Learn how to recognise people online who might not be who they say they are." },
  { weekNumber: 6, title: "What is a Virus?", description: "Discover what computer viruses are, how they spread, and how to avoid them." },
  { weekNumber: 7, title: "Safe Browsing Habits", description: "Build smart habits for exploring the web safely and spotting risky websites." },
  { weekNumber: 8, title: "Cyberbullying – What to Do", description: "Understand what cyberbullying is and learn the steps to take if it happens to you." },
  { weekNumber: 9, title: "Email Safety", description: "Learn how to spot suspicious emails and avoid phishing tricks that try to fool you." },
  { weekNumber: 10, title: "Gaming Safely Online", description: "Discover how to enjoy online games safely and protect yourself while playing." },
  { weekNumber: 11, title: "Smart Device Safety", description: "Learn how to keep your phones, tablets, and smart devices safe and secure." },
  { weekNumber: 12, title: "Becoming a Cyber Hero – Final Quiz", description: "Put everything you've learned to the test and earn your Cyber Hero badge!" },
];

async function main() {
  console.log("Seeding database...");

  const existing = await prisma.course.findFirst({ where: { title: "Cyber Heroes Academy" } });
  if (existing) {
    console.log("Course already exists, skipping seed.");
    return;
  }

  const course = await prisma.course.create({
    data: {
      title: "Cyber Heroes Academy",
      description: "A fun, beginner-friendly course teaching kids the fundamentals of cybersecurity through interactive weekly lessons.",
      ageRange: "6–10",
      duration: "45 min/week",
      weeksCount: 12,
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

  console.log(`Created course: ${course.title} with 12 modules.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
