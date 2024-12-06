import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";

export const revalidate = 60 * 5;
export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-static";

const prisma = new PrismaClient();

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

export async function GET(req: NextRequest) {
  try {
    const topic = req.nextUrl.searchParams.get("topic");

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const feed = await prisma.news.findMany({
      where: {
        createdAt: {
          gte: oneDayAgo,
        },
      },
      select: {
        id: true,
        providerTitle: true,
        category: true,
        title: true,
        description: true,
        source: true,
        url: true,
        imageUrl: true,
        datePublished: true,
        content: true,
        slug: true,
      },
      orderBy: { datePublished: "desc" },
    });

    const { text: filteredText } = await generateText({
      model: azure("gpt-40-mini"),
      prompt: `Give me the top 20 breaking stories in crypto from this list:
${feed
  .map((item) => `ID ${item.id}: ${item.title} - ${item.description}`)
  .join("\n")}

Return the IDs in a simple array like: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

${topic ? `The topic to filter for is: ${topic}` : ""}
Make sure is not general boring blog news, only price action, major events, and partnerships. This is for investors looking for hot topics.
`,
    });

    const ids = filteredText.match(/\d+/g)?.map(Number);

    if (!ids) {
      return NextResponse.json({ error: "No IDs found" });
    }

    const filteredFeed = feed.filter((item) => ids.includes(item.id));

    return NextResponse.json(filteredFeed);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
