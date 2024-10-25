import Moralis from "moralis";
import { NextResponse } from "next/server";

export const revalidate = 60 * 5;
export const runtime = "nodejs";

export const tokenContracts = [
  // WBTC (Wrapped Bitcoin)
  {
    tokenAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  },
  // WETH (Wrapped Ether)
  {
    tokenAddress: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  },
  // USDT (Tether)
  {
    tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  },
  // USDC (USD Coin)
  {
    tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  },
  // MATIC (Polygon)
  {
    tokenAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
  },
  // BNB (Binance Coin)
  {
    tokenAddress: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
  },
  // SHIB (Shiba Inu)
  {
    tokenAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
  },
];

export async function GET() {
  try {
    if (!Moralis.Core.isStarted) {
      await Moralis.start({
        apiKey: process.env.MORALIS_KEY,
      });
    }

    const response = await Moralis.EvmApi.token.getMultipleTokenPrices(
      {
        chain: "0x1",
        include: "percent_change",
      },
      {
        tokens: tokenContracts,
      }
    );

    return NextResponse.json(response.raw);
  } catch (e) {
    console.log(e);
    return NextResponse.error();
  }
}
