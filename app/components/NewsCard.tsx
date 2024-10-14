"use client";

import { Box, Chip, Typography } from "@mui/material";
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

interface NewsCardProps {
  newsItem: News;
  onClick: (newsItem: News) => void;
}

const parseHTML = (htmlString: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  return doc.body.textContent || "";
};

const categoryIcons: Record<NewsCategory, JSX.Element> = {
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

type NewsCategory =
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

const NewsCard: React.FC<NewsCardProps> = ({ newsItem, onClick }) => (
  <Box
    onClick={() => onClick(newsItem)}
    className="news-card"
    sx={{
      backgroundColor: "#0c0a1285",
      border: "1px solid",
      borderColor: "primary.main",
      borderRadius: "8px",
      marginBottom: "10px",
      padding: "10px",
      cursor: "pointer",
      transition:
        "transform 0.3s, box-shadow 0.3s, background-color 0.3s, backdrop-filter 0.3s",
      backdropFilter: "blur(10px)",

      "&:hover": {
        transform: "translateX(-10px)",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        backgroundColor: "#0c0a12b6",
        backdropFilter: "blur(15px)",
        borderColor: "success.main",
      },
    }}
  >
    <Image
      src={newsItem.imageUrl as string}
      alt={newsItem.title}
      width={350}
      height={250}
    />

    <Typography variant="h6" color="white" fontSize={18} className="glitch">
      {parseHTML(newsItem.title)}
    </Typography>

    <Typography variant="body2" color="info">
      {newsItem.providerTitle}
    </Typography>

    <Box style={{ marginTop: "10px" }}>
      {newsItem.category && (
        <Chip
          label={newsItem.category}
          icon={categoryIcons[newsItem.category as NewsCategory]}
          style={{ marginRight: "5px", padding: "2px 10px" }}
          size="small"
        />
      )}
    </Box>
  </Box>
);

export default NewsCard;
