import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const revalidate = 0;

export const GET = async () => {
  try {
    const trendingResp = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/news/trending`
    );

    const trending = await trendingResp.json();

    const topItem = trending[Math.floor(Math.random() * trending.length)];

    const tweet = `BREAKING NEWS: ${topItem.title} \n\n${topItem.description}\n\nRead more: ${topItem.url} #crypto #cryptocurrency #news`;

    await fetch(`${process.env.NEXT_PUBLIC_URL}/api/twitter/post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: tweet,
      }),
    });

    return NextResponse.json({
      message: "success",
      tweet,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      message: "error",
      error: err,
    });
  }
};
