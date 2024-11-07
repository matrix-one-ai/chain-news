import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";
export const revalidate = 0;

const prisma = new PrismaClient();

export const GET = async () => {
  try {
    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const authLink = client.generateOAuth2AuthLink(
      `${process.env.NEXT_PUBLIC_URL}/api/twitter/callback`,
      {
        scope: [
          "tweet.read",
          "tweet.read",
          "tweet.write",
          "users.read",
          "offline.access",
        ],
      }
    );

    console.log(authLink);

    await prisma.twitterAPI.create({
      data: {
        state: authLink.state,
        codeVerifier: authLink.codeVerifier,
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
