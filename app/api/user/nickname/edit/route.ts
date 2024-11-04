import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const { walletAddress, nickname } = await request.json();

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Missing wallet address" },
      { status: 400 }
    );
  }

  if (!nickname) {
    return NextResponse.json({ error: "Missing nickname" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { walletAddress },
      data: { nickname },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
