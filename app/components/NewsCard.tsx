"use client";

import {
  Box,
  Chip,
  Fade,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { News } from "@prisma/client";
import {
  EmojiEvents,
  AccessAlarm,
  AttachMoney,
  MonetizationOn,
  NewspaperOutlined,
  ComputerOutlined,
  TokenOutlined,
  GamesOutlined,
} from "@mui/icons-material";
import Image from "next/image";
import { load } from "cheerio";
import { useAuthStore } from "../zustand/store";
import { useState } from "react";

export interface NewsItem extends News {
  tokenSymbol?: string;
  usdPrice?: number;
  percentChange24h?: string;
}

interface NewsCardProps {
  newsItem: NewsItem | null;
  onClick: (newsItem: News | null) => void;
}

const parseHTML = (htmlString: string): string => {
  const $ = load(htmlString);
  return $.text();
};

export const newsCategoryIcons: Record<NewsCategory, JSX.Element> = {
  Memes: <EmojiEvents />,
  Bitcoin: <TokenOutlined />,
  Ethereum: <TokenOutlined />,
  Solana: <TokenOutlined />,
  AI: <ComputerOutlined />,
  DePIN: <AccessAlarm />,
  NFTs: <AttachMoney />,
  DeFi: <MonetizationOn />,
  General: <NewspaperOutlined />,
  Gaming: <GamesOutlined />,
};

export type NewsCategory =
  | "Memes"
  | "Ethereum"
  | "Solana"
  | "Bitcoin"
  | "AI"
  | "DePIN"
  | "NFTs"
  | "DeFi"
  | "General"
  | "Gaming";

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, onClick }) => {
  const percentChange = parseFloat(newsItem?.percentChange24h || "0");
  const percentChangeColor = percentChange < 0 ? "#ff2e2e" : "secondary.main";
  const plusOrMinus = percentChange < 0 ? "" : "+";

  const { isLoggedIn } = useAuthStore();

  const [loading, setLoading] = useState(true);

  return (
    <Tooltip
      title="You need to login to play articles"
      disableFocusListener={isLoggedIn}
      disableHoverListener={isLoggedIn}
      disableTouchListener={isLoggedIn}
      disableInteractive={isLoggedIn}
      placement="left"
    >
      <Box
        onClick={() => onClick(newsItem)}
        className="news-card"
        sx={{
          backgroundColor: "#0c0a1285",
          border: "1px solid",
          borderColor: "primary.main",
          borderRadius: "8px",
          marginBottom: "10px",
          cursor: "pointer",
          transition:
            "transform 0.3s, box-shadow 0.3s, background-color 0.3s, backdrop-filter 0.3s",
          backdropFilter: "blur(10px)",
          zIndex: 1001,

          "&:hover": {
            transform: "translateX(-10px)",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
            backgroundColor: "#0c0a12b6",
            backdropFilter: "blur(15px)",
            borderColor: "success.main",
          },
        }}
      >
        <Fade in={true} timeout={500}>
          <Box>
            {(loading || newsItem === null) && (
              <Skeleton
                variant="rectangular"
                animation="wave"
                width={305}
                height={380}
              />
            )}
            {newsItem !== null && (
              <>
                <Box
                  sx={{
                    position: loading ? "absolute" : "relative",
                    visibility: loading ? "hidden" : "visible",
                  }}
                >
                  <Image
                    src={newsItem.imageUrl as string}
                    alt={newsItem.title}
                    width={350}
                    height={250}
                    style={{
                      margin: 0,
                    }}
                    onLoad={() => setLoading(false)}
                  />

                  {newsItem.category && (
                    <Chip
                      label={newsItem.category}
                      icon={
                        newsCategoryIcons[newsItem.category as NewsCategory]
                      }
                      sx={{
                        padding: "2px 10px",
                        position: "absolute",
                        top: -1,
                        left: -1,
                        backgroundColor: "error.main",
                        borderRadius: "5px 0 5px 0",
                      }}
                      size="small"
                    />
                  )}
                </Box>

                <Box
                  sx={{
                    padding: "0.75rem",
                    paddingTop: "0",
                    position: loading ? "absolute" : "relative",
                    visibility: loading ? "hidden" : "visible",
                  }}
                >
                  <Typography
                    variant="h6"
                    color="white"
                    fontSize={18}
                    className="glitch"
                  >
                    {parseHTML(newsItem.title)}
                  </Typography>

                  <Typography variant="body2" color="info">
                    {newsItem.providerTitle}
                  </Typography>

                  <Stack
                    sx={{
                      marginTop: "10px",
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    {newsItem.tokenTicker &&
                      newsItem.usdPrice &&
                      newsItem.percentChange24h && (
                        <>
                          <Chip
                            label={`${newsItem.tokenTicker}`}
                            size="small"
                          />
                          <Chip
                            label={`$${newsItem.usdPrice.toFixed(
                              2,
                            )} (${plusOrMinus}${parseFloat(
                              newsItem.percentChange24h,
                            ).toFixed(2)}%)`}
                            size="small"
                            sx={{ color: percentChangeColor }}
                          />
                        </>
                      )}
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Box>
    </Tooltip>
  );
};

export default NewsCard;
