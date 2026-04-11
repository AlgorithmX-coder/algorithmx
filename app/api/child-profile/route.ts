import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const children = await prisma.childProfile.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(children);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { childName, age, avatarColor } = body;

  if (!childName || typeof childName !== "string" || childName.trim().length === 0) {
    return NextResponse.json({ error: "Child name is required" }, { status: 400 });
  }

  if (typeof age !== "number" || age < 4 || age > 18) {
    return NextResponse.json({ error: "Age must be between 4 and 18" }, { status: 400 });
  }

  const child = await prisma.childProfile.create({
    data: {
      userId: session.user.id,
      childName: childName.trim(),
      age,
      avatarColor: avatarColor || "purple",
    },
  });

  return NextResponse.json(child, { status: 201 });
}
