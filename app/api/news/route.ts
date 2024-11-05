import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60 * 5;

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

  try {
    const feed = await prisma.news.findMany({
      select: {
        providerTitle: true,
        category: true,
        title: true,
        description: true,
        source: true,
        url: true,
        imageUrl: true,
        datePublished: true,
        content: true,
        tokenTicker: true,
      },
      orderBy: { datePublished: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
