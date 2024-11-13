"use client";

import { useEffect } from "react";
import {
  Box,
  Chip,
  Fade,
  IconButton,
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
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Image from "next/image";
import { load } from "cheerio";
import { useAuthStore, useNewsStore } from "@/app/zustand/store";
import { useToggle } from "@/app/hooks/useToggle";
import { formatToLocalDateTime } from "../helpers/time";

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

  const { isLoggedIn, isSubscribed } = useAuthStore();
  const { selectedNews } = useNewsStore();
  const [
    imageLoading,
    { toggleOn: toggleOnImageLoading, toggleOff: toggleOffImageLoading },
  ] = useToggle(true);

  // Reset imageLoading status whenever news image is changed
  useEffect(() => {
    toggleOnImageLoading();
  }, [newsItem?.imageUrl, toggleOnImageLoading]);

  return (
    <Tooltip
      title="You need to login to play articles"
      disableFocusListener={isLoggedIn}
      disableHoverListener={isLoggedIn}
      disableTouchListener={isLoggedIn}
      disableInteractive={isLoggedIn}
      placement="left"
    >
      <Fade in={true} timeout={500}>
        <Stack
          direction="column"
          borderRadius={1.5}
          border={
            newsItem !== null && selectedNews?.url === newsItem?.url
              ? "solid 1px"
              : "none"
          }
          borderColor="#FFD66E"
        >
          <Stack
            direction="column"
            padding={2}
            gap={2}
            bgcolor="#0C071C"
            borderRadius="6px 6px 0 0"
          >
            {/* Image */}
            <Box
              position="relative"
              width="100%"
              borderRadius={1}
              overflow="hidden"
              sx={{ aspectRatio: "297/92" }}
            >
              {(newsItem === null || imageLoading) && (
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width="100%"
                  height="100%"
                  sx={{ position: "absolute", top: 0, left: 0 }}
                />
              )}
              {newsItem !== null && (
                <>
                  <Image
                    src={newsItem.imageUrl as string}
                    alt={newsItem.title}
                    layout="fill"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    objectFit="cover"
                    onLoad={toggleOffImageLoading}
                  />

                  {newsItem.category && (
                    <Chip
                      label={newsItem.category}
                      color="primary"
                      sx={{
                        padding: "4px 8px",
                        position: "absolute",
                        top: 8,
                        left: 8,
                        backgroundColor: "error.main",
                        borderRadius: 2,
                        fontWeight: "bold",
                      }}
                      size="small"
                    />
                  )}
                </>
              )}
            </Box>
            {/* Title and info */}
            <Stack direction="column" width="100%" gap={1}>
              {newsItem === null ? (
                <>
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    height={36}
                  />
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    height={14}
                  />
                </>
              ) : (
                <>
                  <Typography
                    variant="h6"
                    color="white"
                    fontSize={14}
                    lineHeight="normal"
                    className="glitch"
                  >
                    {parseHTML(newsItem.title)}
                  </Typography>

                  <Typography variant="body2" fontSize={11} color="#666176">
                    {/* TODO: newsItem.datePublished is string, but TS recognizes it as Date */}
                    {`${newsItem.providerTitle} | ${formatToLocalDateTime(
                      newsItem.datePublished as unknown as string,
                    )}`}
                  </Typography>
                </>
              )}
            </Stack>
            {/* Play/pause button */}
            {/* TODO: Implement functionality */}
            <Box width="100%">
              {newsItem === null ? (
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width="100%"
                  height={24}
                />
              ) : (
                <IconButton
                  // aria-label={isPlaying ? "pause" : "play"}
                  sx={{
                    color: "#201833d9",
                    backgroundColor: "error.main",
                    width: "24px",
                    height: "24px",

                    ":hover": {
                      color: "info.main",
                      backgroundColor: "error.dark",
                    },
                  }}
                >
                  {/* {isPlaying ? <PauseIcon /> : <PlayArrowIcon />} */}
                  {/* <PauseIcon sx={{ width: "20px", height: "20px" }} /> */}
                  <PlayArrowIcon sx={{ width: "20px", height: "20px" }} />
                </IconButton>
              )}
            </Box>
          </Stack>
          {/* Coint type, price, and trading insight */}
          <Stack
            direction="column"
            width="100%"
            paddingX={2}
            paddingY={1}
            gap={1}
            bgcolor="#2A223C"
            borderRadius="0 0 6px 6px"
          >
            {newsItem === null ? (
              <>
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  width="100%"
                  height={24}
                />
                {!isSubscribed && (
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    width="100%"
                    height={18}
                  />
                )}
              </>
            ) : (
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography
                    variant="body2"
                    fontSize={18}
                    fontWeight="bold"
                    color="white"
                  >
                    {/* TODO: tokenTicker can be empty */}
                    {`$ ${newsItem.tokenTicker}`}
                  </Typography>
                  <Stack direction="row" gap={1}>
                    <Typography variant="body2" fontSize={18} color="white">
                      {/* TODO: usdPrice can be undefined */}
                      {`$${(newsItem.usdPrice ?? 0).toFixed(2)}`}
                    </Typography>
                    {isSubscribed && (
                      <Typography
                        variant="body2"
                        fontSize={18}
                        color={percentChangeColor}
                      >
                        {/* TODO: percentChange24h can be undefined */}
                        {`${plusOrMinus}${parseFloat(
                          newsItem.percentChange24h ?? "0",
                        ).toFixed(2)}%`}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
                {!isSubscribed && (
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="body2"
                      fontSize={12}
                      color="white"
                      sx={{ opacity: 0.5 }}
                    >
                      GET TRADING INSIGHTS
                    </Typography>
                    <Chip
                      label="PRO"
                      sx={{
                        height: 18,
                        backgroundColor: "#FFB526",
                        borderRadius: 0.8,
                        fontWeight: "bold",
                      }}
                      size="small"
                    />
                  </Stack>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </Fade>
    </Tooltip>
  );
};

export default NewsCard;
