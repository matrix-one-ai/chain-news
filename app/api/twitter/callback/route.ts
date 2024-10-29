import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";
export const revalidate = 0;

const prisma = new PrismaClient();

export const GET = async (req: NextRequest) => {
  try {
    const oauth_token = req.nextUrl.searchParams.get("oauth_token");
    const oauth_verifier = req.nextUrl.searchParams.get("oauth_verifier");

    const twitterSaved = await prisma.twitterAPI.findFirst();

    if (!twitterSaved) {
      return NextResponse.json({
        message: "error",
        error: "No saved tokens found!",
      });
    }

    const oauth_token_secret = twitterSaved.oauthTokenSecret;

    if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
      return NextResponse.json({
        message: "error",
        error: "Missing parameters",
      });
    }

    const client = new TwitterApi({
      appKey: process.env.TWITTER_CONSUMER_KEY!,
      appSecret: process.env.TWITTER_CONSUMER_SECRET!,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    const clientInit = await client.login(oauth_verifier);

    console.log(clientInit);

    return NextResponse.json({
      message: "success",
      data: {
        oauth_token,
        oauth_verifier,
        oauth_token_secret,
      },
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      message: "error",
      error: err,
    });
  }
};
