import { CoreMessage, streamText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { NextResponse } from "next/server";
import { isWithinTokenLimit } from "gpt-tokenizer";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

export async function POST(req: Request) {
  try {
    let { messages }: { messages: CoreMessage[] } = await req.json();

    const messagesText = messages.map((message) => message.content).join("");

    const withinTokenLimit = isWithinTokenLimit(messagesText, 125000);

    // if the messages exceed the token limit, only send the most recent 3 messages
    if (!withinTokenLimit) {
      messages = messages.slice(-3);
    }

    const stream = await streamText({
      model: azure("gpt-4o"),
      system: "You are a helpful assistant.",
      messages,
    });

    return stream.toDataStreamResponse();
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
