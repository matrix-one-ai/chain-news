import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json(
      { error: "Missing 'url' parameter." },
      { status: 400 }
    );
  }

  let url: string;

  try {
    url = decodeURIComponent(urlParam);
    new URL(url); // Validate URL format
  } catch {
    return NextResponse.json(
      { error: "Invalid 'url' parameter." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch the image. Status: ${response.status}` },
        { status: response.status }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("Content-Type") || "image/jpeg";
    const contentLength =
      response.headers.get("Content-Length") ||
      imageBuffer.byteLength.toString();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": contentLength,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching the image." },
      { status: 500 }
    );
  }
}
