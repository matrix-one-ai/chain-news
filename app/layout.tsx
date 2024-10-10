import type { Metadata } from "next";
import localFont from "next/font/local";
import { IBM_Plex_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import "@mui/material-pigment-css/styles.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});

export const metadata: Metadata = {
  title: "Chain News",
  description:
    "Latest news and updates on cryptocurrencies, blockchain, and DeFi, hosted by AIs.",
  openGraph: {
    type: "website",
    url: "https://chain-news-one.vercel.app",
    title: "Chain News",
    description:
      "Latest news and updates on cryptocurrencies, blockchain, and DeFi, hosted by AIs.",
    images: [
      {
        url: "https://chain-news-one.vercel.app/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Chain News OG Image",
      },
      {
        url: "https://chain-news-one.vercel.app/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "Chain News OG Image 2",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSans.variable}`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
