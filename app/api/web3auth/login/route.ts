import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, chainId, chainNamespace, adapter } =
      await req.json();

    const user = await prisma.user.upsert({
      where: { walletAddress },
      update: {
        adapter,
        lastLogin: new Date(),
      },
      create: {
        walletAddress,
        chainId,
        chainNamespace,
        adapter,
        lastLogin: new Date(),
        createdAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "web3auth user saved successfully",
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.log("web3auth login error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
