import { useCallback, useEffect, useMemo, useState } from "react";
import { getContentWindow } from "../api";
import type { ContentPage } from "../types";
import { FIRST_PAGE_ID, getPageNumber, toPageId } from "../utils/app";

type UseContentPagesArgs = {
  onError: (message: string | null) => void;
};

export function useContentPages({ onError }: UseContentPagesArgs) {
  const [pagesById, setPagesById] = useState<Record<string, ContentPage>>({});
  const [currentPageId, setCurrentPageId] = useState(FIRST_PAGE_ID);
  const [isLoading, setIsLoading] = useState(true);

  const loadPageWindow = useCallback(
    async (pageId: string) => {
      setIsLoading(true);
      onError(null);

      try {
        const windowPages = await getContentWindow(pageId, 1);
        setPagesById((previous) => {
          const next = { ...previous };
          windowPages.forEach((page) => {
            next[page.id] = page;
          });
          return next;
        });
      } catch (cause) {
        onError(cause instanceof Error ? cause.message : "콘텐츠를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    },
    [onError]
  );

  useEffect(() => {
    void loadPageWindow(FIRST_PAGE_ID);
  }, [loadPageWindow]);

  useEffect(() => {
    if (!pagesById[currentPageId]) {
      void loadPageWindow(currentPageId);
    }
  }, [currentPageId, loadPageWindow, pagesById]);

  const pageNumber = useMemo(() => getPageNumber(currentPageId), [currentPageId]);

  useEffect(() => {
    const nextPage = pagesById[toPageId(pageNumber + 1)];
    if (!nextPage) {
      return;
    }

    const image = new Image();
    image.src = nextPage.imageUrl;
  }, [pageNumber, pagesById]);

  return {
    currentPageId,
    isLoading,
    loadPageWindow,
    pageNumber,
    pagesById,
    setCurrentPageId
  };
}
