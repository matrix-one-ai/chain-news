import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60 * 5;

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "null", 10);
  const pageSize = parseInt(searchParams.get("pagesize") || "null", 10);
  const select = JSON.parse(searchParams.get("select") || "null"); // columns to select
  const where = JSON.parse(
    decodeURIComponent(searchParams.get("where") || "null"),
  );

  try {
    const feed = await prisma.news.findMany({
      select:
        select === null
          ? {
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
            }
          : select,
      where: where === null ? {} : where,
      ...(isNaN(page) || isNaN(pageSize)
        ? {}
        : { skip: (page - 1) * pageSize, take: pageSize }),
      orderBy: { datePublished: "desc" },
    });

    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
