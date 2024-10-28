import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export const GET = async (req: NextRequest) => {
  try {
    // Extract tokens from query string
    const oauth_token = req.nextUrl.searchParams.get("oauth_token");
    const oauth_verifier = req.nextUrl.searchParams.get("oauth_verifier");

    // Get the saved oauth_token_secret from session
    const { oauth_token_secret } = req.session;

    if (!oauth_token || !oauth_verifier || !oauth_token_secret) {
      return res
        .status(400)
        .send("You denied the app or your session expired!");
    }

    // Obtain the persistent tokens
    // Create a client from temporary tokens
    const client = new TwitterApi({
      appKey: CONSUMER_KEY,
      appSecret: CONSUMER_SECRET,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });
    console.log(authLink.url);
    return NextResponse.redirect(authLink.url);
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      message: "error",
      error: err,
    });
  }
};
