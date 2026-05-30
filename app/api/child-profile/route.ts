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

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { name, dateOfBirth, favouriteColour } = body as {
    name?: unknown;
    dateOfBirth?: unknown;
    favouriteColour?: unknown;
  };

  if (typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (typeof dateOfBirth !== "string" || dateOfBirth.trim().length === 0) {
    return NextResponse.json(
      { error: "Date of birth is required" },
      { status: 400 },
    );
  }

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) {
    return NextResponse.json(
      { error: "Date of birth must be a valid date" },
      { status: 400 },
    );
  }

  if (dob.getTime() >= Date.now()) {
    return NextResponse.json(
      { error: "Date of birth must be in the past" },
      { status: 400 },
    );
  }

  if (typeof favouriteColour !== "string" || favouriteColour.trim().length === 0) {
    return NextResponse.json(
      { error: "Favourite colour is required" },
      { status: 400 },
    );
  }

  const child = await prisma.childProfile.create({
    data: {
      userId: session.user.id,
      name: name.trim(),
      dateOfBirth: dob,
      favouriteColour: favouriteColour.trim(),
    },
  });

  return NextResponse.json(child, { status: 201 });
}
