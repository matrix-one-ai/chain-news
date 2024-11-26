import { News } from "@prisma/client";
import NewsCard, { NewsItem } from "./NewsCard";
import {
  memo,
  SyntheticEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Autocomplete,
  Box,
  Chip,
  Fade,
  IconButton,
  Stack,
  TextField,
  useMediaQuery,
} from "@mui/material";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { newsCategoryIcons } from "./NewsCard";
import { useAuthStore, useNewsStore, useOverlayStore } from "../zustand/store";
import { useNewsFetch } from "../hooks/useNewsFetch";
import useInfiniteScroll from "../hooks/useInfiniteScroll";
import { useToggle } from "../hooks/useToggle";

type newsFilter = {
  label: string;
  icon: JSX.Element;
};

const newsFilters: newsFilter[] = Object.keys(newsCategoryIcons).map((key) => ({
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
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const { isSubscribed, isAdmin } = useAuthStore();
  const { setIsPaywallModalOpen } = useOverlayStore();

  const { news, pageSize, fetching, selectedNews, incrementPage } =
    useNewsStore();
  const targetRef = useInfiniteScroll(incrementPage);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [tokenPrices, setTokenPrices] = useState<any>(null);
  const [open, { toggle: toggleOpen, set: setOpen }] = useToggle(false);

  useNewsFetch(selectedFilter);

  // Dummy news while fetching news data of next page
  const dummyNews: Array<null> = useMemo(
    () => Array(pageSize).fill(null),
    [pageSize]
  );

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

  // Handler for filter change
  const handleFilterChange = useCallback(
    (_: SyntheticEvent<Element, Event>, value: newsFilter | null) => {
      setSelectedFilter(value?.label ?? null);
    },
    []
  );

  const newsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    if (selectedNews && selectedNews.id) {
      newsRefs.current?.[selectedNews.id]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedNews]);

  // Whenever screen orientation is landscape, open news list
  useEffect(() => {
    setOpen(isLandscape);
  }, [isLandscape, setOpen]);

  // Handler for news click
  const handleNewsClick = useCallback(
    (newsItem: News | null) => {
      if (!isLandscape) {
        setOpen(false);
      }
      onNewsClick(newsItem);
    },
    [isLandscape, onNewsClick, setOpen]
  );

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
          width: "365px",
          padding: "16px 12px",
          maxWidth: "80%",
          height: "100%",
          backgroundColor: "rgba(32, 24, 51, 0.6)",
          backdropFilter: "blur(12px)",
          transform: `${open ? "translateX(0)" : "translateX(100%)"}`,
          transition:
            "transform 500ms, opacity 500ms cubic-bezier(0.4, 0, 0.2, 1) !important",
        }}
      >
        <IconButton
          aria-label={open ? "close-news-list" : "open-new-list"}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "translateX(-100%)",
            color: "white",
            backgroundColor: "rgba(32, 24, 51, 0.6)",
            backdropFilter: "blur(12px)",
            width: "50px",
            height: "50px",
            borderRadius: "unset",

            "@media (hover: hover)": {
              ":hover": {
                backgroundColor: "error.dark",
              },
            },
          }}
          onClick={toggleOpen}
        >
          {open ? (
            <CloseOutlinedIcon sx={{ width: "30px", height: "30px" }} />
          ) : (
            <MenuOpenOutlinedIcon sx={{ width: "30px", height: "30px" }} />
          )}
        </IconButton>
        {/* Filter dropdown */}
        <Stack direction="row">
          <Autocomplete
            options={newsFilters}
            getOptionLabel={(option) => option.label}
            size="small"
            sx={{
              zIndex: 1000,
              width: 0,
              flexGrow: 1,
              backgroundColor: "#2A223C",
              "& .MuiOutlinedInput-notchedOutline": {
                border: "none",
              },
              "& .MuiAutocomplete-endAdornment": {
                display: isSubscribed ? "block" : "none",
              },
            }}
            clearOnBlur={false}
            onChange={handleFilterChange}
            onClick={() => {
              if (!isSubscribed && !isAdmin) {
                setIsPaywallModalOpen(true);
              }
            }}
            renderInput={(params) => (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                paddingX={1}
              >
                <TextField {...params} label="Filter Topic" />
                {!isSubscribed && !isAdmin && (
                  <Chip
                    label="PRO"
                    sx={{
                      height: 18,
                      backgroundColor: "#FFB526",
                      borderRadius: 0.8,
                      fontWeight: "bold",
                      color: "black",
                      cursor: "pointer",
                      ":hover": {
                        color: "white",
                      },
                    }}
                    onClick={() => setIsPaywallModalOpen(true)}
                    size="small"
                  />
                )}
              </Stack>
            )}
            disabled={!isSubscribed && !isAdmin}
          />
        </Stack>

        {/* News list */}
        <Stack gap={1} overflow="auto">
          {(fetching
            ? [...interpolatedNews, ...dummyNews] // When fetching news data of next page, let show skeleton loader for dummy data
            : interpolatedNews
          ).map((newsItem, index) => (
            <div
              key={`news-item-${index}`}
              ref={(el) => {
                newsRefs.current[(newsItem as NewsItem)?.id] = el;
              }}
            >
              <NewsCard
                key={`news-item-${index}`}
                newsItem={newsItem}
                onClick={handleNewsClick}
              />
            </div>
          ))}
          {/* Target element for infinite scroll */}
          <Box ref={targetRef} style={{ height: 1, paddingBottom: 1 }} />
        </Stack>
      </Stack>
    </Fade>
  );
});

NewsList.displayName = "NewsList";

export default NewsList;
