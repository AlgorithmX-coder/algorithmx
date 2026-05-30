import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { upsertProgress } from "@/app/lib/progressService";
import { NextResponse } from "next/server";

type PostBody = {
  childProfileId?: string;
  productSlug?: string;
  week?: number;
  screen?: number;
  stars?: number;
  completed?: boolean;
};

const ERROR_STATUS: Record<string, number> = {
  child_not_found: 403,
  child_not_owned: 403,
  product_not_found: 404,
  course_content_not_found: 404,
  invalid_stars: 400,
};

const ERROR_MESSAGE: Record<string, string> = {
  child_not_found: "Child profile not found",
  child_not_owned: "Forbidden",
  product_not_found: "Product not found",
  course_content_not_found: "Course content for that week not found",
  invalid_stars: "stars must be between 0 and 3",
};

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PostBody;
  try {
    body = (await request.json()) as PostBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { childProfileId, productSlug, week, screen, stars, completed } = body;

  if (
    typeof childProfileId !== "string" ||
    typeof productSlug !== "string" ||
    typeof week !== "number" ||
    typeof screen !== "number" ||
    typeof stars !== "number"
  ) {
    return NextResponse.json(
      {
        error:
          "childProfileId, productSlug, week, screen and stars are required",
      },
      { status: 400 },
    );
  }

  const result = await upsertProgress({
    userId: session.user.id,
    childProfileId,
    productSlug,
    week,
    screen,
    stars,
    completed,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: ERROR_MESSAGE[result.error.kind] },
      { status: ERROR_STATUS[result.error.kind] },
    );
  }

  return NextResponse.json(result.row);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const childProfileId = searchParams.get("childProfileId");
  const productSlug = searchParams.get("productSlug");

  if (!childProfileId || !productSlug) {
    return NextResponse.json(
      { error: "childProfileId and productSlug are required" },
      { status: 400 },
    );
  }

  const child = await prisma.childProfile.findUnique({
    where: { id: childProfileId },
    select: { id: true, userId: true },
  });
  if (!child) {
    return NextResponse.json(
      { error: "Child profile not found" },
      { status: 403 },
    );
  }
  if (child.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const rows = await prisma.progress.findMany({
    where: { childProfileId, productId: product.id },
    orderBy: { week: "asc" },
  });

  return NextResponse.json(rows);
}
