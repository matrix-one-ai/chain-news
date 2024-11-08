import { useEffect, useCallback, useRef } from "react";
import {
  useAppMountedStore,
  useLiveStreamStore,
  useNewsStore,
} from "../zustand/store";
import { AbortableFetch } from "../utils/abortablePromise";

/**
 * Hooks for fetching news data
 * @param title
 * @param category
 * @returns void
 */
export function useNewsFetch(title: string, category: string | null): void {
  const { mounted } = useAppMountedStore();
  const {
    page,
    pageSize,
    setNews,
    setPage,
    setTotalPage,
    setFetching,
    addNews,
  } = useNewsStore();
  const { isStreaming } = useLiveStreamStore();
  const abortableNewsFetch = useRef<AbortableFetch | null>(null);
  const abortableNewsTotalPageFetch = useRef<AbortableFetch | null>(null);

  // Reset operation when title or category changes
  useEffect(() => {
    // Halt previous fetches
    abortableNewsFetch.current?.abort();
    abortableNewsTotalPageFetch.current?.abort();

    // Reset page and news data
    setPage(1);
    setTotalPage(1);
    setNews([]);
  }, [title, category, setPage, setNews, setTotalPage]);

  // Fetch news data with pagination and filter options
  const fetchNews = useCallback(async () => {
    try {
      setFetching(true);

      abortableNewsFetch.current = new AbortableFetch(
        `/api/news?page=${page}&pagesize=${pageSize}&where=${encodeURIComponent(
          JSON.stringify({
            ...(title && { title: { contains: title } }),
            ...(category && { category }),
          })
        )}`
      );
      const response = await abortableNewsFetch.current.fetch;

      if (!response.ok) {
        throw new Error("Failed to fetch news data");
      }

      const data = await response.json();

      addNews(data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setFetching(false);
    }
  }, [setFetching, page, pageSize, title, category, addNews]);

  const fetchAllNews = useCallback(async () => {
    try {
      setFetching(true);

      abortableNewsFetch.current = new AbortableFetch(`/api/news/all`);
      const response = await abortableNewsFetch.current.fetch;

      if (!response.ok) {
        throw new Error("Failed to fetch news data");
      }

      const data = await response.json();

      addNews(data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setFetching(false);
    }
  }, [setFetching, addNews]);

  useEffect(() => {
    if (!mounted) return;

    if (isStreaming) {
      fetchAllNews();
    } else {
      fetchNews();
    }
  }, [isStreaming, fetchAllNews, fetchNews, mounted]);

  // Fetch news total page with filter options
  const fetchNewsTotalPage = useCallback(async () => {
    try {
      abortableNewsTotalPageFetch.current = new AbortableFetch(
        `/api/news/total-page?pagesize=${pageSize}&where=${encodeURIComponent(
          JSON.stringify({
            ...(title && { title: { contains: title } }),
            ...(category && { category }),
          })
        )}`
      );
      const response = await abortableNewsTotalPageFetch.current.fetch;

      if (!response.ok) {
        throw new Error("Failed to fetch news page count");
      }

      const data = await response.json();

      setTotalPage(data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    }
  }, [pageSize, title, category, setTotalPage]);

  useEffect(() => {
    if (!mounted) return;

    fetchNewsTotalPage();
  }, [fetchNewsTotalPage, mounted]);
}

/**
 * Hooks for fetching search options for news
 * @param category
 * @returns void
 */
export function useNewsSearchOptionsFetch(category: string | null): void {
  const { mounted } = useAppMountedStore();
  const { setFetchingSearchOptions, setNewsSearchOptions } = useNewsStore();
  const abortableNewsSearchOptionsFetch = useRef<AbortableFetch | null>(null);

  // Reset operation when category changes
  useEffect(() => {
    // Halt previous fetche
    abortableNewsSearchOptionsFetch.current?.abort();

    // Reset search options data
    setNewsSearchOptions([]);
  }, [category, setNewsSearchOptions]);

  // Fetches news categories and titles with the given title and category
  const fetchNewsSearchOptions = useCallback(async () => {
    try {
      setFetchingSearchOptions(true);

      abortableNewsSearchOptionsFetch.current = new AbortableFetch(
        `/api/news?select=${JSON.stringify({
          category: true,
          title: true,
        })}&where=${encodeURIComponent(
          JSON.stringify({
            ...(category && { category }),
          })
        )}`
      );
      const response = await abortableNewsSearchOptionsFetch.current.fetch;

      if (!response.ok) {
        throw new Error("Failed to fetch news search options");
      }

      const data = await response.json();

      setNewsSearchOptions(data);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
    } finally {
      setFetchingSearchOptions(false);
    }
  }, [setFetchingSearchOptions, setNewsSearchOptions, category]);

  useEffect(() => {
    if (!mounted) return;

    fetchNewsSearchOptions();
  }, [fetchNewsSearchOptions, mounted]);
}
