import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    const [chats] = await prisma.$transaction([
      prisma.youtubeChat.findMany({
        where: {
          publishedAt: {
            gte: oneMinuteAgo,
          },
          isRead: false,
        },
      }),
      prisma.youtubeChat.updateMany({
        where: {
          publishedAt: {
            gte: oneMinuteAgo,
          },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      }),
    ]);

    return NextResponse.json({
      chats,
    });
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
