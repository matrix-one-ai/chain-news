import { News } from "@prisma/client";
import NewsCard from "./NewsCard";
import { memo } from "react";

interface NewsListProps {
  newsItems: News[];
  isVisible: boolean;
  onNewsClick: (newsItem: News) => void;
}

const NewsList = memo(
  ({ newsItems, isVisible, onNewsClick }: NewsListProps) => {
    return isVisible ? (
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 1000,
          width: "50%",
          paddingLeft: "5rem",
          paddingTop: "0.25rem",
          maxWidth: "400px",
          maxHeight: "calc(100% - 3.25rem)",
          overflowY: "auto",
          touchAction: "all",
          pointerEvents: "all",
        }}
      >
        {newsItems.map((newsItem, index) => (
          <NewsCard
            key={newsItem.title + index}
            newsItem={newsItem}
            onClick={onNewsClick}
          />
        ))}
      </div>
    ) : null;
  }
);

NewsList.displayName = "NewsList";

export default NewsList;
