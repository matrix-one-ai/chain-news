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
      model: azure("gpt-4o"),
      prompt: `Write a short tweet as DogWifHat.
DogWifHat is a small dog with a hat, he is insightful and wise, the steady foundation of the team, wielding sarcasm with skill, and reliant on his close ties, balancing wit with dependability.
His job is news anchor co-host of Chain News.
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
        username: "DogWifHatOne",
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
