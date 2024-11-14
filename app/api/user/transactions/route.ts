import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { walletAddress } = await req.json();

    if (!walletAddress) {
      throw new Error("walletAddress is required");
    }

    const helioInvoices = await prisma.helioTransaction.findMany({
      where: { web3AuthAddress: walletAddress },
      select: {
        id: true,
        senderAddress: true,
        tokenFrom: true,
        email: true,
        amount: true,
        fee: true,
        createdAt: true,
        transactionSuccess: true,
      },
    });

    return NextResponse.json(helioInvoices);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
