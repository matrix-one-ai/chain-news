import { Box, Typography } from "@mui/material";
import { News } from "@prisma/client";
import React from "react";
import Marquee from "react-fast-marquee";
import { load } from "cheerio";
import Image from "next/image";

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
          display: "flex",
          alignItems: "center",
        }}
      >
        {newsItems.map((newsItem, index) => (
          <React.Fragment key={`${newsItem.id}-${index}`}>
            {parseHTML(newsItem.title)}
            {index < newsItems.length - 1 && (
              <Image
                src="/images/Master-Emblem.svg"
                alt="separator"
                width={50}
                height={20}
                style={{ margin: "0 2rem" }}
              />
            )}
          </React.Fragment>
        ))}
      </Typography>
    </Marquee>
  </Box>
);

export default NewsTickerBanner;
