import { useEffect, useCallback } from "react";
import { useAppMountedStore, useNewsStore } from "../zustand/store";

/**
 * Hooks for fetching news data
 * @returns void
 */
export function useNewsFetch(): void {
  const { mounted } = useAppMountedStore();
  const { page, pageSize, setFetching, addNews } = useNewsStore();

  const fetchNews = useCallback(async () => {
    try {
      setFetching(true);

      const response = await fetch(
        `/api/news?page=${page}&pageSize=${pageSize}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      addNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [setFetching, page, pageSize, addNews]);

  useEffect(() => {
    if (!mounted) return;

    fetchNews();
  }, [fetchNews, mounted]);
}

/**
 * Hooks for fetching search options for news
 * @returns void
 */
export function useNewsSearchOptionsFetch(): void {
  const { mounted } = useAppMountedStore();
  const { setFetchingSearchOptions, setNewsSearchOptions } = useNewsStore();

  const fetchNewsSearchOptions = useCallback(async () => {
    try {
      setFetchingSearchOptions(true);

      const response = await fetch(
        `/api/news?select=${JSON.stringify({
          category: true,
          title: true,
        })}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      setNewsSearchOptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSearchOptions(false);
    }
  }, [setFetchingSearchOptions, setNewsSearchOptions]);

  useEffect(() => {
    if (!mounted) return;

    fetchNewsSearchOptions();
  }, [fetchNewsSearchOptions, mounted]);
}
