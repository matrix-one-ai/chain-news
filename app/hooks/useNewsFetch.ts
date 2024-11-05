import { useEffect, useCallback } from "react";
import { useAppMountedStore, useNewsStore } from "../zustand/store";

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

  // Reset page number and news data when title or category changes
  useEffect(() => {
    setPage(1);
    setNews([]);
  }, [title, category, setPage, setNews]);

  // Fetch news data with pagination and filter options
  const fetchNews = useCallback(async () => {
    try {
      setFetching(true);

      const response = await fetch(
        `/api/news?page=${page}&pagesize=${pageSize}&where=${JSON.stringify({
          ...(title && { title: { contains: title } }),
          ...(category && { category }),
        })}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch news data");
      }

      const data = await response.json();

      addNews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  }, [setFetching, page, pageSize, title, category, addNews]);

  useEffect(() => {
    if (!mounted) return;

    fetchNews();
  }, [fetchNews, mounted]);

  // Fetch news total page with filter options
  const fetchNewsTotalPage = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/news/total-page?pagesize=${pageSize}&where=${JSON.stringify({
          ...(title && { title: { contains: title } }),
          ...(category && { category }),
        })}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch news page count");
      }

      const data = await response.json();

      setTotalPage(data);
    } catch (err) {
      console.error(err);
    }
  }, [pageSize, title, category, setTotalPage]);

  useEffect(() => {
    if (!mounted) return;

    fetchNewsTotalPage();
  }, [fetchNewsTotalPage, mounted]);
}

/**
 * Hooks for fetching search options for news
 * @param title
 * @param category
 * @returns void
 */
export function useNewsSearchOptionsFetch(
  title: string,
  category: string | null,
): void {
  const { mounted } = useAppMountedStore();
  const { setFetchingSearchOptions, setNewsSearchOptions } = useNewsStore();

  // Fetches news categories and titles with the given title and category
  const fetchNewsSearchOptions = useCallback(async () => {
    try {
      setFetchingSearchOptions(true);

      const response = await fetch(
        `/api/news?select=${JSON.stringify({
          category: true,
          title: true,
        })}&where=${JSON.stringify({
          ...(title && { title: { contains: title } }),
          ...(category && { category }),
        })}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch news search options");
      }

      const data = await response.json();

      setNewsSearchOptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingSearchOptions(false);
    }
  }, [setFetchingSearchOptions, setNewsSearchOptions, title, category]);

  useEffect(() => {
    if (!mounted) return;

    fetchNewsSearchOptions();
  }, [fetchNewsSearchOptions, mounted]);
}
