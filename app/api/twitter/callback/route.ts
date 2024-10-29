import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";
export const revalidate = 0;

const prisma = new PrismaClient();

export const GET = async (req: NextRequest) => {
  try {
    const state = req.nextUrl.searchParams.get("state");
    const code = req.nextUrl.searchParams.get("code");

    const twitterSession = await prisma.twitterAPI.findFirst();

    if (!twitterSession) {
      return NextResponse.json({
        message: "error",
        error: "No twitterSession found!",
      });
    }

    const codeVerifier = twitterSession.codeVerifier;
    const sessionState = twitterSession.state;

    if (!state || !code || !codeVerifier || !sessionState) {
      return NextResponse.json({
        message: "error",
        error: "Missing parameters",
      });
    }
    if (state !== sessionState) {
      return NextResponse.json({
        message: "error",
        error: "Invalid state",
      });
    }

    const client = new TwitterApi({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    });

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
      expiresIn,
    } = await client.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: `${process.env.NEXT_PUBLIC_URL}/api/twitter/callback`,
    });

    if (!loggedClient || !accessToken || !refreshToken || !expiresIn) {
      return NextResponse.json({
        message: "error",
        error: "No client found",
      });
    }

    const { data: userObject } = await loggedClient.v2.me();

    console.log(userObject);

    await prisma.twitterAPI.update({
      where: {
        id: twitterSession.id,
      },
      data: {
        refreshToken,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
        username: userObject.username,
      },
    });

    return NextResponse.json({
      message: "success",
      userObject,
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      message: "error",
      error: err,
    });
  }
};
