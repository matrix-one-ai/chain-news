import ClientHome from "./ClientPage";

export default async function Home() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/news`, {
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
