import { NextResponse } from "next/server";
import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
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
              console.error("Max retries reached. Exiting.");
              break;
            }
            console.warn(`Rate limit exceeded. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            delay *= 2;
          } else {
            console.error("An error occurred:", errorDetails.message);
            break;
          }
        } else {
          console.error("An unexpected error occurred:", error);
          break;
        }
      }
    } while (nextPageToken);

    console.log(allChats);

    const upsertPromises = allChats.map(async (chat) => {
      const messageId = chat.id;
      const snippet = chat.snippet;
      const authorDetails = chat.authorDetails;

      await prisma.youtubeChat.upsert({
        where: { id: messageId },
        update: {},
        create: {
          id: messageId,
          liveChatId: snippet.liveChatId,
          authorChannelId: snippet.authorChannelId,
          displayName: authorDetails.displayName,
          displayMessage: snippet.displayMessage,
          publishedAt: new Date(snippet.publishedAt),
          isRead: false,
        },
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({
      message: "Chats fetched and stored successfully.",
    });
  } catch (error: any) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
