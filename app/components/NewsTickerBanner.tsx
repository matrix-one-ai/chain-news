import { Box, Typography } from "@mui/material";
import { News } from "@prisma/client";
import React from "react";
import Marquee from "react-fast-marquee";
import { load } from "cheerio";

interface NewTickerBannerProps {
  newsItems: News[];
}

const parseHTML = (htmlString: string): string => {
  const $ = load(htmlString);
  return $.text();
};

const NewsTickerBanner = ({ newsItems }: NewTickerBannerProps) => (
  <Box
    sx={{
      backgroundColor: "#FFB46E",
      padding: "0.5rem 0",
    }}
  >
    <Marquee>
      <Typography
        variant="h5"
        sx={{
          letterSpacing: "0.1rem",
          textTransform: "uppercase",
        }}
      >
        {newsItems.map((newsItem) => parseHTML(newsItem.title)).join(" • ")}
      </Typography>
    </Marquee>
  </Box>
);

export default NewsTickerBanner;
