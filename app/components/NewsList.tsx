import { News } from "@prisma/client";
import NewsCard from "./NewsCard";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Fade,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { newsCategoryIcons } from "./NewsCard";
import Marquee from "react-fast-marquee";
import { CancelOutlined } from "@mui/icons-material";

const newsFilters = Object.keys(newsCategoryIcons).map((key) => ({
  label: key,
  icon: newsCategoryIcons[key as keyof typeof newsCategoryIcons],
}));

const stripPrefix = (str: string) => {
  return str.replace(/^W|Wrapped\s*/i, "");
};

interface NewsListProps {
  newsItems: News[];
  isVisible: boolean;
  onNewsClick: (newsItem: News) => void;
}

const NewsList = memo(
  ({ newsItems, isVisible, onNewsClick }: NewsListProps) => {
    const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
    const [tokenPrices, setTokenPrices] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] =
      useState<string>("");

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
      []
    );

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedSearchQuery(searchQuery);
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    }, [searchQuery]);

    const filteredNewsItems = useMemo(
      () =>
        newsItems
          .filter(
            (newsItem) =>
              selectedFilter === null || newsItem.category === selectedFilter
          )
          .filter((newsItem) =>
            newsItem.title
              .toLowerCase()
              .includes(debouncedSearchQuery.toLowerCase())
          )
          .map((newsItem) => {
            const tokenPrice = tokenPrices?.find((token: any) => {
              if (!newsItem.tokenTicker) {
                return false;
              }
              const strippedTokenTicker = stripPrefix(
                newsItem.tokenTicker || ""
              );
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
          })
          .sort((a, b) => {
            if (a.usdPrice !== undefined && b.usdPrice === undefined) {
              return -1;
            }
            if (a.usdPrice === undefined && b.usdPrice !== undefined) {
              return 1;
            }
            return 0;
          }),
      [newsItems, debouncedSearchQuery, selectedFilter, tokenPrices]
    );

    useEffect(() => {
      const fetchNews = async () => {
        try {
          const response = await fetch("/api/moralis/prices");
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const data = await response.json();
          setTokenPrices(data);
        } catch (err: any) {}
      };

      fetchNews();
    }, []);

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
          <Autocomplete
            options={newsItems.sort(
              (a, b) => -b.category.localeCompare(a.category)
            )}
            groupBy={(option) => option.category}
            getOptionLabel={(option) => option.title}
            size="small"
            sx={{
              position: "fixed",
              top: 45,
              right: 5,
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
          />

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
            gradientColor="rgba(0, 0, 0, 0.5)"
            style={{
              padding: "0.25rem 0",
              position: "fixed",
              top: 2,
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
                  backdropFilter: "blur(10px)",
                }}
              />
            ))}
          </Marquee>
          <div
            style={{
              position: "fixed",
              top: 90,
              right: 0,
              width: "50%",
              paddingLeft: "5rem",
              maxWidth: "400px",
              maxHeight: "calc(100% - 140px)",
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
