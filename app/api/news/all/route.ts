import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export const revalidate = 60 * 5;

const prisma = new PrismaClient();

export async function GET() {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const feed = await prisma.news.findMany({
      select: {
        id: true,
        providerTitle: true,
        category: true,
        title: true,
        description: true,
        source: true,
        slug: true,
        url: true,
        imageUrl: true,
        datePublished: true,
        content: true,
        tokenTicker: true,
      },
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
      orderBy: { datePublished: "desc" },
    });

    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
