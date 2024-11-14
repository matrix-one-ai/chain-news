import { News } from "@prisma/client";
import NewsCard, { NewsItem } from "./NewsCard";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Fade,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { newsCategoryIcons } from "./NewsCard";
import Marquee from "react-fast-marquee";
import { CancelOutlined } from "@mui/icons-material";
import { useNewsStore } from "../zustand/store";
import { useNewsFetch, useNewsSearchOptionsFetch } from "../hooks/useNewsFetch";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const newsFilters = Object.keys(newsCategoryIcons).map((key) => ({
  label: key,
  icon: newsCategoryIcons[key as keyof typeof newsCategoryIcons],
}));

const stripPrefix = (str: string) => {
  return str.replace(/^W|Wrapped\s*/i, "");
};

interface NewsListProps {
  isVisible: boolean;
  onNewsClick: (newsItem: News | null) => void;
}

const NewsList = memo(({ isVisible, onNewsClick }: NewsListProps) => {
  const {
    news,
    newsSearchOptions,
    pageSize,
    fetching,
    fetchingSearchOptions,
    incrementPage,
  } = useNewsStore();
  const targetRef = useInfiniteScroll(incrementPage);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [tokenPrices, setTokenPrices] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");

  useNewsFetch(debouncedSearchQuery, selectedFilter);
  useNewsSearchOptionsFetch(selectedFilter);

  // Dummy news while fetching news data of next page
  const dummyNews: Array<null> = useMemo(
    () => Array(pageSize).fill(null),
    [pageSize],
  );

  const handleFilterClick = useCallback((category: string | null) => {
    setSelectedFilter(category);
  }, []);

  const handleFilterDelete = useCallback(() => {
    setSelectedFilter(null);
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
    },
    [],
  );

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Interpolate news data with token price data
  const interpolatedNews: NewsItem[] = useMemo(() => {
    return news.map((newsItem) => {
      const tokenPrice = tokenPrices?.find((token: any) => {
        if (!newsItem.tokenTicker) {
          return false;
        }
        const strippedTokenTicker = stripPrefix(newsItem.tokenTicker || "");
        const strippedTokenName = stripPrefix(token.tokenName);
        const strippedTokenSymbol = stripPrefix(token.tokenSymbol);
        return (
          strippedTokenSymbol === strippedTokenTicker ||
          strippedTokenName.includes(strippedTokenTicker)
        );
      });

      return {
        ...newsItem,
        tokenSymbol: tokenPrice?.tokenSymbol,
        usdPrice: tokenPrice?.usdPrice,
        percentChange24h: tokenPrice?.["24hrPercentChange"],
      };
    });
  }, [news, tokenPrices]);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/moralis/prices");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setTokenPrices(data);
      } catch (err: any) {}
    };

    fetchPrices();
  }, []);

  return (
    <Fade
      in={isVisible}
      timeout={500}
      style={{
        zIndex: 1000,
        touchAction: isVisible ? "all" : "none",
        pointerEvents: isVisible ? "all" : "none",
      }}
    >
      <Stack
        gap={1}
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          padding: "16px 12px",
          maxWidth: "365px",
          height: "100%",
          backgroundColor: "rgba(32, 24, 51, 0.6)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* TODO: Update all below filters with new figma */}
        <Marquee
          speed={30}
          gradientColor="rgba(0, 0, 0, 0.5)"
          style={{
            padding: "16px 0",
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
                backdropFilter: "blur(10px)",
              }}
            />
          ))}
        </Marquee>
        <Autocomplete
          options={newsSearchOptions.sort(
            (a, b) => -b.category.localeCompare(a.category),
          )}
          groupBy={(option) => option.category}
          getOptionLabel={(option) => option.title}
          size="small"
          sx={{
            zIndex: 1000,
            width: 315,
            backdropFilter: "blur(10px)",
          }}
          clearOnBlur={false}
          onChange={(_, value) => {
            if (value) {
              setSearchQuery(value.title);
            } else {
              setSearchQuery("");
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              onChange={handleSearchChange}
              label="Search"
            />
          )}
          loading={fetchingSearchOptions}
        />

        {selectedFilter && (
          <Tooltip title="Clear filter">
            <IconButton
              aria-label="delete"
              size="small"
              sx={{
                position: "absolute",
                top: -10,
                left: 0,
                zIndex: 1000,
              }}
              onClick={handleFilterDelete}
              style={{ margin: "0.25rem" }}
            >
              <CancelOutlined fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}

        <Stack gap={1} overflow="auto">
          {(fetching
            ? [...interpolatedNews, ...dummyNews] // When fetching news data of next page, let show skeleton loader for dummy data
            : interpolatedNews
          ).map((newsItem, index) => (
            <NewsCard
              key={`news-item-${index}`}
              newsItem={newsItem}
              onClick={onNewsClick}
            />
          ))}
          {/* Target element for infinite scroll */}
          <Box ref={targetRef} style={{ height: 1 }} />
        </Stack>
      </Stack>
    </Fade>
  );
});

NewsList.displayName = "NewsList";

export default NewsList;
