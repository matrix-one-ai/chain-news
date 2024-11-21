import { NextResponse } from "next/server";

export async function POST() {
  console.log("HELIO_PUBLIC_KEY", process.env.HELIO_PUBLIC_KEY);
  console.log("HELIO_SECRET_KEY", process.env.HELIO_SECRET_KEY);
  console.log(
    "NEXT_PUBLIC_HELIO_SMALL_PAYLINK",
    process.env.NEXT_PUBLIC_HELIO_SMALL_PAYLINK
  );
  console.log(
    "NEXT_PUBLIC_HELIO_LARGE_PAYLINK",
    process.env.NEXT_PUBLIC_HELIO_LARGE_PAYLINK
  );
  console.log(
    "NEXT_PUBLIC_HELIO_SMALL_MATRIX_PAYLINK",
    process.env.NEXT_PUBLIC_HELIO_SMALL_MATRIX_PAYLINK
  );
  console.log(
    "NEXT_PUBLIC_HELIO_LARGE_MATRIX_PAYLINK",
    process.env.NEXT_PUBLIC_HELIO_LARGE_MATRIX_PAYLINK
  );
  console.log("HELIO_WEBHOOK_URL", process.env.HELIO_WEBHOOK_URL);

  try {
    const respSmall = await fetch(
      `https://api.hel.io/v1/webhook/paylink/transaction?apiKey=${process.env.HELIO_PUBLIC_KEY}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HELIO_SECRET_KEY}`,
          "cache-control": "no-cache",
        },
        body: JSON.stringify({
          paylinkId: process.env.NEXT_PUBLIC_HELIO_SMALL_PAYLINK,
          targetUrl: `${process.env.HELIO_WEBHOOK_URL}/api/helio/webhook`,
          events: ["CREATED"],
        }),
      }
    );

    const respLarge = await fetch(
      `https://api.hel.io/v1/webhook/paylink/transaction?apiKey=${process.env.HELIO_PUBLIC_KEY}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HELIO_SECRET_KEY}`,
          "cache-control": "no-cache",
        },
        body: JSON.stringify({
          paylinkId: process.env.NEXT_PUBLIC_HELIO_LARGE_PAYLINK,
          targetUrl: `${process.env.HELIO_WEBHOOK_URL}/api/helio/webhook`,
          events: ["CREATED"],
        }),
      }
    );

    const respSmallMatrix = await fetch(
      `https://api.hel.io/v1/webhook/paylink/transaction?apiKey=${process.env.HELIO_PUBLIC_KEY}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HELIO_SECRET_KEY}`,
          "cache-control": "no-cache",
        },
        body: JSON.stringify({
          paylinkId: process.env.NEXT_PUBLIC_HELIO_SMALL_MATRIX_PAYLINK,
          targetUrl: `${process.env.HELIO_WEBHOOK_URL}/api/helio/webhook`,
          events: ["CREATED"],
        }),
      }
    );

    const respLargeMatrix = await fetch(
      `https://api.hel.io/v1/webhook/paylink/transaction?apiKey=${process.env.HELIO_PUBLIC_KEY}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.HELIO_SECRET_KEY}`,
          "cache-control": "no-cache",
        },
        body: JSON.stringify({
          paylinkId: process.env.NEXT_PUBLIC_HELIO_LARGE_MATRIX_PAYLINK,
          targetUrl: `${process.env.HELIO_WEBHOOK_URL}/api/helio/webhook`,
          events: ["CREATED"],
        }),
      }
    );

    if (
      respSmall.ok &&
      respLarge.ok &&
      respSmallMatrix.ok &&
      respLargeMatrix.ok
    ) {
      console.log("small", await respSmall.json());
      console.log("large", await respLarge.json());
      console.log("small matrix", await respSmallMatrix.json());
      console.log("large matrix", await respLargeMatrix.json());

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false }, { status: 500 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
