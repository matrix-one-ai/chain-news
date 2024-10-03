import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  const response = await fetch(url as string);
  const imageBuffer = await response.arrayBuffer();

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
      "Content-Length":
        response.headers.get("Content-Length") ||
        imageBuffer.byteLength.toString(),
    },
  });
}
