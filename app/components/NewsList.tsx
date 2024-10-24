import { News } from "@prisma/client";
import NewsCard from "./NewsCard";
import { memo, useCallback, useMemo, useState } from "react";
import { Box, Chip, Fade, IconButton, Tooltip } from "@mui/material";
import { newsCategoryIcons } from "./NewsCard";
import Marquee from "react-fast-marquee";
import { CancelOutlined } from "@mui/icons-material";

const newsFilters = Object.keys(newsCategoryIcons).map((key) => ({
  label: key,
  icon: newsCategoryIcons[key as keyof typeof newsCategoryIcons],
}));

interface NewsListProps {
  newsItems: News[];
  isVisible: boolean;
  onNewsClick: (newsItem: News) => void;
}

const NewsList = memo(
  ({ newsItems, isVisible, onNewsClick }: NewsListProps) => {
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

    const handleFilterClick = useCallback((category: string | null) => {
      setSelectedFilter(category);
    }, []);

    const handleFilterDelete = useCallback(() => {
      setSelectedFilter(null);
    }, []);

    const filteredNewsItems = useMemo(
      () =>
        newsItems.filter(
          (newsItem) =>
            selectedFilter === null || newsItem.category === selectedFilter
        ),
      [newsItems, selectedFilter]
    );

    return (
      <Fade
        in={isVisible}
        timeout={500}
        style={{
          zIndex: 1000,
          touchAction: "all",
          pointerEvents: "all",
        }}
      >
        <Box>
          {selectedFilter && (
            <Tooltip title="Clear filter">
              <IconButton
                aria-label="delete"
                size="small"
                sx={{
                  position: "fixed",
                  top: 2,
                  right: 325,
                  zIndex: 1000,
                }}
                onClick={handleFilterDelete}
                style={{ margin: "0.25rem" }}
              >
                <CancelOutlined fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}

          <Marquee
            speed={30}
            pauseOnHover
            direction="right"
            style={{
              padding: "0.25rem 0",
              position: "fixed",
              top: 0,
              right: 0,
              maxWidth: "320px",
            }}
          >
            {newsFilters.map(({ label, icon }) => (
              <Chip
                key={label}
                label={label}
                icon={icon}
                onClick={() => handleFilterClick(label)}
                color={selectedFilter === label ? "primary" : "default"}
                sx={{
                  margin: "0 0.25rem",
                }}
              />
            ))}
          </Marquee>
          <div
            style={{
              marginTop: "2.75rem",
              position: "fixed",
              top: 0,
              right: 0,
              width: "50%",
              paddingLeft: "5rem",
              maxWidth: "400px",
              maxHeight: "calc(100% - 5.75rem)",
              overflowY: "auto",
            }}
          >
            {filteredNewsItems.map((newsItem, index) => (
              <NewsCard
                key={newsItem.title + index}
                newsItem={newsItem}
                onClick={onNewsClick}
              />
            ))}
          </div>
        </Box>
      </Fade>
    );
  }
);

NewsList.displayName = "NewsList";

export default NewsList;
