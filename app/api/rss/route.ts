import { News, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import RSSParser from "rss-parser";
import { htmlToText } from "html-to-text";

export const runtime = "nodejs";

const rssParser = new RSSParser({
  customFields: {
    item: ["media:content", "description"],
  },
});

const prisma = new PrismaClient();

const mapChainwireRSSNews = (feed: any, provider: string, rssUrl: string) => {
  return {
    provider,
    providerTitle: feed.title.trim(),
    providerDescription: feed.description.trim(),
    providerUrl: feed.link,
    isRSS: true,
    rssUrl: rssUrl,
    items: feed.items.map((item: any) => ({
      title: item.title.trim(),
      description: item.contentSnippet.trim(),
      source: item.creator || item["dc:creator"],
      url: item.link,
      imageUrl: JSON.parse(JSON.stringify(item["media:content"]))?.["$"]?.url,
      content: item["content:encodedSnippet"].trim(),
      datePublished: item.pubDate,
    })),
  };
};

const mapCoinTelegraphNews = (feed: any, provider: string, rssUrl: string) => {
  return {
    provider,
    providerTitle: feed.title.trim(),
    providerDescription: feed.description.trim(),
    providerUrl: feed.link,
    isRSS: true,
    rssUrl: rssUrl,
    items: feed.items.map((item: any) => ({
      title: item.title.trim(),
      description: htmlToText(item.description || "", {
        wordwrap: false,
        selectors: [{ selector: "img", format: "skip" }],
      }).trim(),
      source: item.creator,
      url: item.link,
      imageUrl: JSON.parse(JSON.stringify(item["media:content"]))?.["$"]?.url,
      content: htmlToText(item.description || "", {
        wordwrap: false,
        selectors: [{ selector: "img", format: "skip" }],
      }).trim(),
      datePublished: item.pubDate ? new Date(item.pubDate) : new Date(),
    })),
  };
};

const providers = [
  {
    rssUrl: "https://cointelegraph.com/rss",
    provider: "CoinTelegraph",
    mapFunction: mapCoinTelegraphNews,
  },
  {
    rssUrl: "https://app.chainwire.org/rss/public",
    provider: "ChainWire",
    mapFunction: mapChainwireRSSNews,
  },
];

export async function GET() {
  try {
    for (const provider of providers) {
      const feed = await rssParser.parseURL(provider.rssUrl);

      const parsedNews = provider.mapFunction(
        feed,
        provider.provider,
        provider.rssUrl
      );

      await prisma.news.deleteMany({
        where: {
          provider: provider.provider,
        },
      });

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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
