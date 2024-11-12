import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(res: Request) {
  try {
    const event = await res.json();
    const tx = JSON.parse(event.transaction);

    console.log("HELIO WEBHOOK EVENT", tx);

    await prisma.helioTransaction.create({
      data: {
        transactionId: tx.id,
        paylinkId: tx.paylinkId,
        email: tx.meta.customerDetails.email,
        senderAddress: tx.meta.senderPK,
        receiverAddress: tx.meta.recipientPK,
        transactionSignature: tx.meta.transactionSignature,
        transactionSuccess: tx.meta.transactionStatus,
        geolocation: tx.meta.submitGeolocation,
        fee: tx.fee,
        amount: tx.meta.amount,
        quantity: tx.quantity,
        paymentType: tx.paymentType,
        transactionCreatedAt: new Date(tx.createdAt),
        tokenFrom: tx.meta.tokenQuote.from,
        tokenTo: tx.meta.tokenQuote.to,
        tokenFromPrice: tx.meta.tokenQuote.fromAmountDecimal,
        tokenToPrice: tx.meta.tokenQuote.toAmountMinimal,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
