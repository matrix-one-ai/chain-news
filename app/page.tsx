import type { Metadata } from "next";
import ClientHome from "./ClientPage";
import { News } from "@prisma/client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}): Promise<Metadata> {
  const slug = searchParams.article;
  const metaData: Metadata = {};

  // If no slug is provided, return the default metadata
  if (!slug) return metaData;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/news/slug?slug=${slug}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch news by slug");
    }

    const { title, description, imageUrl }: News = await response.json();

    metaData.title = `Chain News: ${title}`;
    metaData.description = description;

    if (imageUrl) {
      metaData.openGraph = {
        type: "website",
        url: `https://app.chainnews.one?article=${slug}`,
        title,
        description,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      };
      metaData.twitter = {
        card: "summary_large_image",
        title,
        description,
        images: [{ url: imageUrl, width: 1200, height: 675 }],
      };
    }
  } catch (error) {
    console.log(error);
  } finally {
    return metaData;
  }
}

export default function Home() {
  return <ClientHome />;
}
