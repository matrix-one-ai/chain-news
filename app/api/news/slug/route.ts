import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  try {
    if (!slug) {
      throw new Error("slug is required");
    }
    const news = await prisma.news.findUnique({
      where: { slug },
    });

    if (!news) {
      return NextResponse.json(
        { error: `News not found by ${slug}` },
        { status: 404 }
      );
    }

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
