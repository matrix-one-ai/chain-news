import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { walletAddress, chainId, chainNamespace, adapter } =
      await req.json();

    const ip =
      req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for");
    console.log(ip);

    const ipInfoResp = await fetch(
      `http://ipinfo.io/${ip}?token=${process.env.IPINFO_API_KEY}`
    );

    const ipInfo = await ipInfoResp.json();

    console.log("ipInfo:", ipInfo);

    const dbTX = await prisma.$transaction([
      prisma.user.upsert({
        where: { walletAddress },
        update: {
          adapter,
          lastLogin: new Date(),
        },
        create: {
          walletAddress,
          chainId,
          chainNamespace,
          adapter,
          lastLogin: new Date(),
          createdAt: new Date(),
          ipAddress: ipInfo.ip,
        },
      }),
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
      }),
    ]);

    return NextResponse.json({
      message: "web3auth user saved successfully",
      nickname: dbTX[0].nickname,
      isAdmin: dbTX[0].isAdmin,
      imageUrl: dbTX[0].imageUrl,
    });
  } catch (error) {
    console.log("web3auth login error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
