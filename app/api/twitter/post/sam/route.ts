import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

export const GET = async () => {
  try {
    const { text } = await generateText({
      model: azure("gpt-4o-mini"),
      prompt: `Write a short tweet as Sam.
Sam embodies the Queen archetype: intelligent, a natural leader with unmatched influence, capable of executing the perfect revenge.
Possessing the highest form of beauty with a hint of narcissism and a dark, subtle edge.
Her job is news anchor host of Chain News.
Do not wrap response in quotes.
Do not use hashtags.
Use natural language, do not sound robotic, simulate being an AI Agent real person.
Never say that your an AI.
`,
    });
    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/twitter/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        username: "SamMatrixOne",
      }),
    });

    return NextResponse.json({
      message: "success",
      text,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      message: "error",
      error: err,
    });
  }
};
