import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";
import * as cheerio from "cheerio";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const list = await fetch(
      "https://fda.forbes.com/v2/education/?categories="
    );
    const listData = await list.json();

    const parsedNews = [];

    for (const item of listData.articles) {
      const resp = await fetch(item.articleURL);
      const html = await resp.text();

      console.log(html);

      const $ = cheerio.load(html);
      const mainContent = $("main").html();

      const { text } = await generateText({
        model: azure("gpt-4o-mini"),
        prompt: `
          Extract the News content from this HTML to pure string text, give me a 200-500 word summary.
          ---
          ${mainContent}
          `,
      });

      console.log(text);

      parsedNews.push({
        provider: "Forbes",
        providerTitle: "Forbes | Digital Assets",
        providerDescription:
          "Latest on Crypto News, Blockchain & NFTs - Digital Assets",
        providerUrl: "https://www.forbes.com/digital-assets/",
        isRSS: false,
        rssUrl: null,
        category: "",
        title: item.title.trim(),
        description: item.description,
        source: item.author,
        url: item.articleURL,
        imageUrl: item.image,
        content: text,
        datePublished: new Date(item.publishDate),
      });
    }

    const { text } = await generateText({
      model: azure("gpt-4o-mini"),
      prompt: `
        Categorize the following news articles from Forbes:
        The categories are: NFTs, DeFi, Memes, DePIN, AI, Solana, Gaming, Ethereum, Bitcoin, and General.
        ${parsedNews
          .map((item, index: number) => `${index}: ${item.title}`)
          .join("\n")}
        Return a flat JSON object with the categories for each article.
        Example output: { "0": "NFTs", "1": "DeFi", "2": "General" }
        Do not include any other information in the response.
        Do not use any markdown text.
      `,
    });

    const categories = JSON.parse(text);

    parsedNews.forEach((item, index: number) => {
      item.category = categories[index];
    });

    await prisma.news.deleteMany({
      where: {
        provider: "Forbes",
      },
    });

    await prisma.news.createMany({
      data: parsedNews.map((item) => ({
        provider: item.provider,
        providerTitle: item.providerTitle,
        providerDescription: item.providerDescription,
        providerUrl: item.providerUrl,
        isRSS: item.isRSS,
        rssUrl: item.rssUrl,
        category: item.category,
        title: item.title,
        description: item.description,
        source: item.source,
        url: item.url,
        imageUrl: item.imageUrl,
        content: item.content,
        datePublished: new Date(item.datePublished),
      })),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
