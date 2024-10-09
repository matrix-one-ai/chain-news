import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const feed = await prisma.news.findMany({
      select: {
        category: true,
        title: true,
        description: true,
        source: true,
        url: true,
        imageUrl: true,
        datePublished: true,
      },
      orderBy: { datePublished: "desc" },
    });

    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
