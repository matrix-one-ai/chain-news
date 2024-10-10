import { Metadata } from "next";
import ClientHome from "./ClientPage";
import "./admin.css";

export const metadata: Metadata = {
  title: "Chain News | Admin",
  description:
    "Latest news and updates on cryptocurrencies, blockchain, and DeFi, hosted by AIs.",
};

export default async function Admin() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/news`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("Failed to fetch news");
    return <div>Error fetching news data.</div>;
  }

  const data = await response.json();

  data.sort(() => 0.5 - Math.random());

  return <ClientHome newsData={data} />;
}
