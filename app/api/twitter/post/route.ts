import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";
export const revalidate = 0;

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
  try {
    const { text, username } = await req.json();

    if (!text || !username) {
      return NextResponse.json({
        message: "error",
        error: "No text provided or username",
      });
    }

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const twitterSession = await prisma.twitterAPI.findFirst({
      where: {
        username,
      },
    });

    if (!twitterSession || !twitterSession.refreshToken) {
      return NextResponse.json({
        message: "error",
        error: "No twitterSession found!",
      });
    }

    const {
      client: refreshedClient,
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn,
    } = await client.refreshOAuth2Token(twitterSession?.refreshToken);

    await prisma.twitterAPI.update({
      where: {
        id: twitterSession.id,
      },
      data: {
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    });

    const tweet = await refreshedClient.v2.tweet({
      text,
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
