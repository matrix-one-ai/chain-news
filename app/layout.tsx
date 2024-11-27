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
import Head from "next/head";
import Script from "next/script";

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
      <Script
        id="gtm-script"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl';f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-553DSNX9');`,
        }}
      />

      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${pixelifySans.variable}`}
      >
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <Navbar />
            <Box component="main" height={0} flexGrow={1} position="relative">
              {children}
              {userPageOverlay}
            </Box>
          </ThemeProvider>
        </AppRouterCacheProvider>
        <Analytics />
        <CssBaseline />
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-553DSNX9"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
      </body>
      <GoogleAnalytics gaId="GTM-553DSNX9" />
    </html>
  );
}
