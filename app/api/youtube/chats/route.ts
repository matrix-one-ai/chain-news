import { NextResponse } from "next/server";
import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";

export const maxDuration = 120; // 2 minutes
export const revalidate = 0;
export const runtime = "nodejs";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Step 1: Fetch Live Chat Messages from YouTube
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.GOOGLE_CLOUD_KEY,
    });

    const liveChatId =
      "KicKGFVDYjJZSlUtT09OaFJ1NHNRempFcTZDQRILaTFGQ0o5YmRZRTQ";
    let nextPageToken: string | undefined = undefined;
    let allChats: any[] = [];

    let retryCount = 0;
    const maxRetries = 5;
    let delay = 5000;

    do {
      const params: any = {
        liveChatId,
        part: ["snippet", "authorDetails"],
        maxResults: 100,
        pageToken: nextPageToken,
      };

      try {
        const response = await youtube.liveChatMessages.list(params);

        if (response.data.items && response.data.items.length > 0) {
          allChats = allChats.concat(response.data.items);
        } else {
          console.log("No more chat messages.");
          break;
        }

        nextPageToken = response.data.nextPageToken as string;
        retryCount = 0;
        delay = response.data.pollingIntervalMillis || 5000;
      } catch (error: any) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          const errorDetails = error.response.data.error.errors[0];
          if (errorDetails.reason === "rateLimitExceeded") {
            retryCount++;
            if (retryCount > maxRetries) {
              console.log("Max retries reached. Exiting.");
              break;
            }
            console.log(`Rate limit exceeded. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            console.error("An error occurred:", errorDetails.message);
            return NextResponse.json(
              { error: errorDetails.message },
              { status: 500 }
            );
          }
        } else {
          console.error("An unexpected error occurred:", error);
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
      }
    } while (nextPageToken);

    console.log(allChats);

    // Step 2: Prepare Data for Bulk Insertion
    const createManyData = allChats.map((chat) => ({
      id: chat.id,
      liveChatId: chat.snippet.liveChatId,
      authorChannelId: chat.snippet.authorChannelId,
      displayName: chat.authorDetails.displayName,
      displayMessage: chat.snippet.displayMessage,
      publishedAt: new Date(chat.snippet.publishedAt),
      isRead: false,
    }));

    // Step 3: Perform Database Operations in a Single Transaction
    const twoMinutesAgo = new Date(Date.now() - 120 * 1000); // Use Date object directly

    // Logging for debugging purposes
    console.log("Current UTC Time:", new Date().toISOString());
    console.log("Two Minutes Ago (UTC):", twoMinutesAgo.toISOString());

    const [insertResult, chats] = await prisma.$transaction([
      // Bulk Insert New Chats, skipping duplicates
      prisma.youtubeChat.createMany({
        data: createManyData,
        skipDuplicates: true, // Supported in PostgreSQL, MySQL 8.0.19+, and SQLite >= 3.24.0
      }),
      // Fetch Unread Chats from the Last Two Minutes
      prisma.youtubeChat.findMany({
        where: {
          publishedAt: {
            gte: twoMinutesAgo,
          },
          isRead: false,
        },
      }),
      // Mark Fetched Chats as Read
      prisma.youtubeChat.updateMany({
        where: {
          publishedAt: {
            gte: twoMinutesAgo,
          },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      }),
    ]);

    // Step 4: Return the Filtered Chats
    return NextResponse.json({
      chats,
    });
  } catch (error: any) {
    console.error("Error in /chat API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
