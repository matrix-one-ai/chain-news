import { Box, Typography } from "@mui/material";
import { News } from "@prisma/client";
import React from "react";
import Marquee from "react-fast-marquee";

interface NewTickerBannerProps {
  newsItems: News[];
}

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
        {newsItems.map((newsItem) => newsItem.title).join(" • ")}
      </Typography>
    </Marquee>
  </Box>
);

export default NewsTickerBanner;
