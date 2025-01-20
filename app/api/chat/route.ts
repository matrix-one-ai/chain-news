// import { CoreMessage, streamText } from "ai";
// import { createAzure } from "@ai-sdk/azure";
import { NextResponse } from "next/server";
// import { isWithinTokenLimit } from "gpt-tokenizer";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

export const maxDuration = 300;
export const revalidate = 0;

// const azure = createAzure({
//   resourceName: process.env.AZURE_OPENAI_RESOURCE!,
//   apiKey: process.env.AZURE_OPENAI_KEY!,
// });

export async function POST(req: Request) {

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  // try {
  //   const {
  //     messages,
  //     walletAddress,
  //   }: { messages: CoreMessage[]; walletAddress: string } = await req.json();

  //   let localMessages = messages;

  //   if (!walletAddress) {
  //     return NextResponse.json(
  //       { error: "Wallet address is required" },
  //       { status: 400 }
  //     );
  //   }

  //   const messagesText = localMessages
  //     .map((message) => message.content)
  //     .join("");

  //   const withinTokenLimit = isWithinTokenLimit(messagesText, 125000);

  //   // if the messages exceed the token limit, only send the most recent 3 messages
  //   if (!withinTokenLimit) {
  //     localMessages = localMessages.slice(-3);
  //   }

  //   const stream = await streamText({
  //     model: azure("gpt-4o-mini"),
  //     messages: localMessages,
  //     frequencyPenalty: 0.5,
  //     presencePenalty: 0.5,
  //     temperature: 0.2,
  //   });

  //   await prisma.user.update({
  //     where: { walletAddress },
  //     data: {
  //       credits: {
  //         decrement: 1,
  //       },
  //     },
  //   });

  //   return stream.toDataStreamResponse();
  // } catch (error) {
  //   console.log(error);
  //   return NextResponse.json({ error: error }, { status: 500 });
  // }
}
