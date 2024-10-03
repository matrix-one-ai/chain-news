import { News, PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import RSSParser from "rss-parser";

export const runtime = "nodejs";

const rssParser = new RSSParser();

const prisma = new PrismaClient();

const mapChainwireRSSNews = (feed: any, provider: string, rssUrl: string) => {
  return {
    provider,
    providerTitle: feed.title,
    providerDescription: feed.description,
    providerUrl: feed.link,
    isRSS: true,
    rssUrl: rssUrl,
    items: feed.items.map((item: any) => ({
      title: item.title,
      description: item.contentSnippet,
      source: item.creator || item["dc:creator"],
      url: item.link,
      imageUrl: null,
      content: item["content:encodedSnippet"],
      datePublished: item.pubDate,
    })),
  };
};

export async function POST(req: NextRequest) {
  try {
    const { rssUrl, provider } = await req.json();

    if (!rssUrl) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    if (!provider) {
      return NextResponse.json(
        { error: "No provider provided" },
        { status: 400 }
      );
    }

    const feed = await rssParser.parseURL(rssUrl);

    const parsedNews = mapChainwireRSSNews(feed, provider, rssUrl);

    await prisma.news.createMany({
      data: parsedNews.items.map((item: News) => ({
        provider: parsedNews.provider,
        providerTitle: parsedNews.providerTitle,
        providerDescription: parsedNews.providerDescription,
        providerUrl: parsedNews.providerUrl,
        isRSS: parsedNews.isRSS,
        rssUrl: parsedNews.rssUrl,
        title: item.title,
        description: item.description,
        source: item.source,
        url: item.url,
        imageUrl: item.imageUrl,
        content: item.content,
        datePublished: new Date(item.datePublished),
      })),
    });

    return NextResponse.json(feed);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
