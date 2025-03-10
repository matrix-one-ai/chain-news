import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const pageSize = parseInt(searchParams.get("pagesize") || "null", 10);
  const where = JSON.parse(
    decodeURIComponent(searchParams.get("where") || "null")
  );

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  try {
    if (isNaN(pageSize)) return NextResponse.json(1);

    const count = await prisma.news.count({
      where: {
        ...(where === null ? {} : where),
        createdAt: {
          gte: oneDayAgo,
        },
      },
    });
    const totalPage = Math.ceil(count / pageSize);

    return NextResponse.json(totalPage);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
