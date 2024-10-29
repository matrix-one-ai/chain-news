import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";
export const revalidate = 0;

const prisma = new PrismaClient();

export const GET = async () => {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY!,
      appSecret: process.env.TWITTER_CONSUMER_SECRET!,
    });

    const authLink = await client.generateAuthLink(
      `${process.env.NEXT_PUBLIC_URL}/api/twitter/callback`
    );

    console.log(authLink);

    await prisma.twitterAPI.deleteMany();

    await prisma.twitterAPI.create({
      data: {
        oauthToken: authLink.oauth_token,
        oauthTokenSecret: authLink.oauth_token_secret,
      },
    });

    return NextResponse.redirect(authLink.url);
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      message: "error",
      error: err,
    });
  }
};
