import Moralis from "moralis";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await Moralis.start({
      apiKey: process.env.MORALIS_KEY,
    });

    const response = await Moralis.EvmApi.token.getMultipleTokenPrices(
      {
        chain: "0x1",
        include: "percent_change",
      },
      {
        tokens: [
          // USDT (Tether)
          {
            tokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
          },
          // USDC (USD Coin)
          {
            tokenAddress: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          },
          // stETH (Lido Staked Ether)
          {
            exchange: "uniswapv2",
            tokenAddress: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
            toBlock: "16314545",
          },
          // MATIC (Polygon)
          {
            tokenAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
          },
          // BTC (Bitcoin)
          {
            tokenAddress: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
          },
          // ETH (Ethereum)
          {
            tokenAddress: "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
          },
          // BNB (Binance Coin)
          {
            tokenAddress: "0xb8c77482e45f1f44de1745f52c74426c631bdd52",
          },
          // ADA (Cardano)
          {
            tokenAddress: "0x3ee2200efb3400fabb9aacf31297cbdd1d435d47",
          },
          // SOL (Solana)
          {
            tokenAddress: "0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0",
          },
          // XRP (Ripple)
          {
            tokenAddress: "0xa2b4c0af19cc16a6cfacce81f192b024d625817d",
          },
          // DOT (Polkadot)
          {
            tokenAddress: "0x7083609fce4d1d8dc0c979aab8c869ea2c873402",
          },
          // DOGE (Dogecoin)
          {
            tokenAddress: "0xba2ae424d960c26247dd6c32edc70b295c744c43",
          },
          // AVAX (Avalanche)
          {
            tokenAddress: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
          },
          // SHIB (Shiba Inu)
          {
            tokenAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
          },
          // LTC (Litecoin)
          {
            tokenAddress: "0x4338665cbb7b2485a8855a139b75d5e34ab0db94",
          },
        ],
      }
    );
    console.log(response);
    return NextResponse.json(response.raw);
  } catch (e) {
    console.log(e);
    return NextResponse.error();
  }
}
