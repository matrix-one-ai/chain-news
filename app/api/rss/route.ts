import { News, PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import RSSParser from "rss-parser";
import { htmlToText } from "html-to-text";
import { generateText } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { put } from "@vercel/blob";
import slug from "slug";
import { generateHash } from "../../helpers/crypto";

const azure = createAzure({
  resourceName: process.env.AZURE_OPENAI_RESOURCE!,
  apiKey: process.env.AZURE_OPENAI_KEY!,
});

export const runtime = "nodejs";
export const maxDuration = 300;

const rssParser = new RSSParser({
  customFields: {
    item: ["media:content", "description", "media:thumbnail", "dc:creator"],
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
      category: "",
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
      category: "",
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

const mapCoinDeskNews = (feed: any, provider: string, rssUrl: string) => {
  return {
    provider,
    providerTitle: feed.title.trim(),
    providerDescription: feed.description.trim(),
    providerUrl: feed.link,
    isRSS: true,
    rssUrl: rssUrl,
    items: feed.items.map((item: any) => ({
      category: "",
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

const mapDecryptNews = (feed: any, provider: string, rssUrl: string) => {
  return {
    provider,
    providerTitle: feed.title.trim(),
    providerDescription: htmlToText(feed.description || "", {
      wordwrap: false,
      selectors: [{ selector: "img", format: "skip" }],
    }).trim(),
    providerUrl: feed.link,
    isRSS: true,
    rssUrl: rssUrl,
    items: feed.items.map((item: any) => ({
      category: "",
      title: item.title.trim(),
      description: htmlToText(item.description || "", {
        wordwrap: false,
        selectors: [{ selector: "img", format: "skip" }],
      }).trim(),
      source: item["dc:creator"],
      url: item.link,
      imageUrl: JSON.parse(JSON.stringify(item["media:thumbnail"]))?.["$"]?.url,
      content: htmlToText(item.content || "", {
        wordwrap: false,
        selectors: [{ selector: "img", format: "skip" }],
      }).trim(),
      datePublished: item.pubDate ? new Date(item.pubDate) : new Date(),
    })),
  };
};

const mapCryptoSlateNews = (feed: any, provider: string, rssUrl: string) => {
  return {
    provider,
    providerTitle: feed.title.trim(),
    providerDescription: feed.description.trim(),
    providerUrl: feed.link,
    isRSS: true,
    rssUrl: rssUrl,
    items: feed.items.map((item: any) => ({
      category: "",
      title: item.title.trim(),
      description: htmlToText(item.description || "", {
        wordwrap: false,
        selectors: [{ selector: "img", format: "skip" }],
      }).trim(),
      source: item["dc:creator"],
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
  {
    rssUrl: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    provider: "CoinDesk",
    mapFunction: mapCoinDeskNews,
  },
  {
    rssUrl: "http://decrypt.co/feed",
    provider: "Decrypt",
    mapFunction: mapDecryptNews,
  },
  {
    rssUrl: "https://cryptoslate.com/feed/",
    provider: "CryptoSlate",
    mapFunction: mapCryptoSlateNews,
  },
];

export async function GET() {
  try {
    for (const provider of providers) {
      let feed = null;
      try {
        feed = await rssParser.parseURL(provider.rssUrl);
      } catch (e) {
        console.log(`Error parsing ${provider.provider} RSS feed:`, e);
        continue;
      }

      const parsedNews = provider.mapFunction(
        feed,
        provider.provider,
        provider.rssUrl
      );

      const { text: categoryResult } = await generateText({
        model: azure("gpt-4o-mini"),
        prompt: `
          Categorize the following news articles from ${parsedNews.provider}:
          The categories are: NFTs, DeFi, Memes, DePIN, AI, Solana, Gaming, Ethereum, Bitcoin, and General.
          ${parsedNews.items
            .map((item: News, index: number) => `${index}: ${item.title}`)
            .join("\n")}
          Return a flat JSON object with the categories for each article.
          Example output: { "0": "NFTs", "1": "DeFi", "2": "General" }
          Do not include any other information in the response.
          Do not use any markdown text.
        `,
      });

      const categories = JSON.parse(categoryResult);

      parsedNews.items.forEach((item: News, index: number) => {
        item.category = categories[index];
      });

      const { text: tokenResult } = await generateText({
        model: azure("gpt-4o-mini"),
        prompt: `
          Estimate the token ticker name for the following news articles:
          ${parsedNews.items
            .map((item: News, index: number) => `${index}: ${item.title}`)
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

      parsedNews.items.forEach((item: News, index: number) => {
        item.tokenTicker = tokens[index];
      });

      const uploadPromises = parsedNews.items.map(async (item: News) => {
        if (item.imageUrl) {
          const imageResp = await fetch(item.imageUrl);

          if (!imageResp.ok) {
            return;
          }

          const imageBuffer = await imageResp.arrayBuffer();
          const contentType =
            imageResp.headers.get("Content-Type") || "image/jpeg";

          const blob = new Blob([new Uint8Array(imageBuffer)], {
            type: contentType,
          });

          const upload = await put(
            `news/${provider.provider}/${item.title.replace(
              /[^a-zA-Z0-9]/g,
              ""
            )}`,
            blob,
            {
              access: "public",
            }
          );

          console.log(upload.url);

          item.imageUrl = upload.url;
        }
      });

      await Promise.all(uploadPromises);

      for (const item of parsedNews.items) {
        try {
          await prisma.news.create({
            data: {
              provider: parsedNews.provider,
              slug: `${slug(item.title)}-${generateHash(item.title)}`,
              providerTitle: parsedNews.providerTitle,
              providerDescription: parsedNews.providerDescription,
              providerUrl: parsedNews.providerUrl,
              tokenTicker: item.tokenTicker,
              isRSS: parsedNews.isRSS,
              rssUrl: parsedNews.rssUrl,
              category: item.category,
              title: item.title,
              description: item.description,
              source: item.source,
              url: item.url,
              imageUrl: item.imageUrl,
              content: item.content,
              datePublished: new Date(item.datePublished),
            },
          });
        } catch (error) {
          console.log(`Error inserting item with title ${item.title}:`, error);
        }
      }
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
