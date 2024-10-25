import { News, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { createAzure } from "@ai-sdk/azure";
import { generateText } from "ai";
import { load } from "cheerio";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function POST() {
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

      const $ = load(html);
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
        tokenTicker: "",
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

    const { text: categoryResult } = await generateText({
      model: azure("gpt-4o"),
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

    const categories = JSON.parse(categoryResult);

    parsedNews.forEach((item, index: number) => {
      item.category = categories[index];
    });

    const { text: tokenResult } = await generateText({
      model: azure("gpt-4o"),
      prompt: `
        Estimate the token ticker name for the following news articles:
        ${parsedNews
          .map((item, index: number) => `${index}: ${item.title}`)
          .join("\n")}
        Return a flat JSON object with the categories for each article.
        Example output: { "0": "ETH", "1": "BTC", "2": "DOGE" }
        Do not include any other information in the response.
        Do not use any markdown text.
        I want to know the best fit token ticker name for each article so I can pull prices.
        If the token ticker is not known, return an empty string.
      `,
    });

    const tokens = JSON.parse(tokenResult);

    parsedNews.forEach((item, index: number) => {
      item.tokenTicker = tokens[index];
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
        tokenTicker: item.tokenTicker,
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
