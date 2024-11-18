import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const {
      walletAddress,
      chainId,
      chainNamespace,
      adapter,
      email,
      nickname,
      typeOfLogin,
      profileImage,
    } = await req.json();

    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    console.log(ip);

    let ipInfo: any = {};

    try {
      const ipInfoResp = await fetch(
        `http://ipinfo.io/${ip}?token=${process.env.IPINFO_API_KEY}`
      );

      ipInfo = await ipInfoResp.json();
    } catch (e) {
      console.log(e);
    }

    console.log("ipInfo:", ipInfo);

    const transactionOperations: any = [
      prisma.user.upsert({
        where: { walletAddress },
        update: {
          adapter,
          typeOfLogin,
          email,
          lastLogin: new Date(),
        },
        create: {
          walletAddress,
          chainId,
          chainNamespace,
          adapter,
          email,
          nickname,
          imageUrl: profileImage,
          lastLogin: new Date(),
          createdAt: new Date(),
          ipAddress: ipInfo?.ip,
        },
      }),
    ];

    if (ipInfo.ip) {
      transactionOperations.push(
        prisma.iPInfo.upsert({
          where: { ip: ipInfo.ip },
          update: {
            hostname: ipInfo.hostname,
            city: ipInfo.city,
            region: ipInfo.region,
            country: ipInfo.country,
            loc: ipInfo.loc,
            org: ipInfo.org,
            postal: ipInfo.postal,
            timezone: ipInfo.timezone,
          },
          create: {
            ip: ipInfo.ip,
            hostname: ipInfo.hostname,
            city: ipInfo.city,
            region: ipInfo.region,
            country: ipInfo.country,
            loc: ipInfo.loc,
            org: ipInfo.org,
            postal: ipInfo.postal,
            timezone: ipInfo.timezone,
          },
        })
      );
    }

    const dbTX = await prisma.$transaction(transactionOperations);

    const helioSubscription = await prisma.helioTransaction.findFirst({
      where: {
        web3AuthAddress: walletAddress,
        transactionSuccess: "SUCCESS",
        paymentType: "PAYLINK",
        createdAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    return NextResponse.json({
      walletAddress,
      nickname: dbTX[0].nickname,
      isAdmin: dbTX[0].isAdmin,
      imageUrl: dbTX[0].imageUrl,
      email: dbTX[0].email,
      isSubscribed: !!helioSubscription,
      subscriptionEndTime: new Date(
        new Date().setDate(new Date().getDate() + 30)
      ).getTime(),
      credits: dbTX[0].credits,
    });
  } catch (error) {
    console.log("web3auth login error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
