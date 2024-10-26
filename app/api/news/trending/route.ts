import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";

export const revalidate = 60 * 5;

const prisma = new PrismaClient();

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

export async function GET(req: NextRequest) {
  try {
    const topic = req.nextUrl.searchParams.get("topic");

    console.log(topic);

    const feed = await prisma.news.findMany({
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
      },
      orderBy: { datePublished: "desc" },
    });

    const { text: filteredText } = await generateText({
      model: azure("gpt-4o"),
      prompt: `Give me the top 5 breaking stories in crypto from this list:
${feed
  .map((item) => `ID ${item.id}: ${item.title} - ${item.description}`)
  .join("\n")}

Return the IDs in a simple array like: [1, 2, 3, 4, 5]

${topic ? `The topic to filter for is: ${topic}` : ""}
Make sure is not general boring blog news, only price action, major events, and partnerships. This is for investors looking for hot topics.
`,
    });

    const ids = filteredText.match(/\d+/g)?.map(Number);

    if (!ids) {
      return NextResponse.json({ error: "No IDs found" });
    }

    const filteredFeed = feed.filter((item) => ids.includes(item.id));

    const commentFeed = [];

    for (const newsItem of filteredFeed) {
      const { text: commentsText } = await generateText({
        model: azure("gpt-4o-mini"),
        prompt: `Your job is to comment on the latest news in the world of cryptocurrency on our platform Chain News.
Your audience is consuming your comments in a RSS feed.

There are 2 hosts: Sam and DogWifHat.

Sam: Sam is a young female news reporter, educated, classy and informative. She is the main host of the show.
DogWifHat: DogWifHat is a crypto meme coin fanatic. He looks like a small dog with a hat. He is a bit of a clown and joker but an infamous finance guru. He is the co-host of the show.

The news item you have selected is:
Title: ${newsItem.title}
Description: ${newsItem.description}
Source: ${newsItem.source}

The content of the news source is:
${newsItem.content}


Please deliver the news to your audience in a dynamic, creative and non-repetitive way, use different segment style intros, jokes, emotional appeals, and cadences between hosts.

ONLY output in this script format:

Use ":" to separate the speaker from the text.

SPEAKER: TEXT
SPEAKER: TEXT
SPEAKER: TEXT
... etc

The only speakers you can use are:
Sam, DogWifHat

Sam should have more script lines then DogWifHat.

Do not inset new lines, weird characters or bullet lists. Or code, just text. Do not use cache or previous responses.
      `,
      });

      commentFeed.push({ ...newsItem, comments: commentsText });
    }

    return NextResponse.json(commentFeed);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
