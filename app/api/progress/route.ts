import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { moduleId } = body as { moduleId?: string };

  if (!moduleId) {
    return NextResponse.json({ error: "moduleId required" }, { status: 400 });
  }

  await prisma.progress.upsert({
    where: { userId_moduleId: { userId: session.user.id, moduleId } },
    create: {
      userId: session.user.id,
      moduleId,
      status: "COMPLETED",
      completedAt: new Date(),
    },
    update: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
