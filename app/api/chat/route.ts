import { CoreMessage, streamText } from "ai";
import { createAzure } from "@ai-sdk/azure";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const result = await streamText({
    model: azure("gpt-4o-mini"),
    system: "You are a helpful assistant.",
    messages,
  });

  return result.toDataStreamResponse();
}
