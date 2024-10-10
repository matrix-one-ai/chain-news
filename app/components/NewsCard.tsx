import { Chip } from "@mui/material";
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

interface NewsCardProps {
  newsItem: News;
  onClick: (newsItem: News) => void;
}

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
  <div onClick={() => onClick(newsItem)} className="news-card">
    {newsItem.imageUrl && (
      <img
        src={newsItem.imageUrl}
        alt={newsItem.title}
        style={{ height: "200px" }}
      />
    )}
    <h3>{newsItem.title}</h3>
    <p>{newsItem.providerTitle}</p>

    <div style={{ marginTop: "10px" }}>
      {newsItem.category && (
        <Chip
          label={newsItem.category}
          icon={categoryIcons[newsItem.category as NewsCategory]}
          style={{ marginRight: "5px", padding: "2px 10px" }}
        />
      )}
    </div>
  </div>
);

export default NewsCard;
