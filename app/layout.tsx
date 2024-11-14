import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Pixelify_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { Box } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import "./globals.css";
import Navbar from "./components/Navbar";
import { GoogleAnalytics } from "@next/third-parties/google";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
});

const pixelifySans = Pixelify_Sans({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-pixelify-sans",
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
  user: userPageOverlay,
}: Readonly<{
  children: React.ReactNode;
  user: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${pixelifySans.variable}`}
      >
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <Navbar />
            <Box component="main" flexGrow={1} position="relative">
              {children}
              {userPageOverlay}
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
        <Analytics />
        <CssBaseline />
        <GoogleAnalytics gaId="GTM-553DSNX9" />
      </body>
    </html>
  );
}
