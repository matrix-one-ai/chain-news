import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";

export const runtime = "nodejs";

const prisma = new PrismaClient();

export const GET = async () => {
  try {
    const client = new TwitterApi({
      appKey: "uufGUyoQPkkqs5ksLNzqVqThU",
      appSecret: "qvyqBDuzmLGj38sKyvxnwkq7ZIkProELAHYkvbY79wfotl0jAL",
    });
    const authLink = await client.generateAuthLink(
      "http://localhost:3000/api/twitter/callback"
    );
    console.log(authLink)
    console.log(authLink.url);
    console.log(authLink.oauth_token);
    console.log(authLink.oauth_token_secret);
    return NextResponse.redirect(authLink.url);
  } catch (err) {
    console.log(err);
    return NextResponse.json({
      message: "error",
      error: err,
    });
  }
};
