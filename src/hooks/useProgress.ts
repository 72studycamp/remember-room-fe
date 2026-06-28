import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ContentItem, Progress } from "../types";
import { getCompletedIndices, getSavedIndex, loadStoredProgress, PROGRESS_STORAGE_KEY } from "../utils/app";

type UseProgressArgs = {
  currentPageId: string;
};

export function useProgress({ currentPageId }: UseProgressArgs) {
  const [progressByPage, setProgressByPage] = useState<Record<string, Progress>>(() => loadStoredProgress());
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [isReviewCompleteOpen, setIsReviewCompleteOpen] = useState(false);
  const previousPageIdRef = useRef(currentPageId);
  const progressByPageRef = useRef(progressByPage);

  const progress = progressByPage[currentPageId];
  const completedIndices = useMemo(() => getCompletedIndices(progress), [progress]);
  const completedCount = completedIndices.length;
  const totalCompletedCount = useMemo(
    () => Object.values(progressByPage).reduce((sum, item) => sum + getCompletedIndices(item).length, 0),
    [progressByPage]
  );
  const resumeProgress = useMemo(
    () =>
      Object.values(progressByPage)
        .filter((item) => !item.completed)
        .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0],
    [progressByPage]
  );

  useEffect(() => {
    progressByPageRef.current = progressByPage;
  }, [progressByPage]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressByPage));
  }, [progressByPage]);

  useEffect(() => {
    if (previousPageIdRef.current !== currentPageId) {
      previousPageIdRef.current = currentPageId;
      setActiveItemIndex(getSavedIndex(progressByPage[currentPageId]));
    }
  }, [currentPageId, progressByPage]);

  const syncActiveItemForPage = useCallback((pageId: string) => {
    setActiveItemIndex(getSavedIndex(progressByPageRef.current[pageId]));
  }, []);

  async function handleProgress(item: ContentItem) {
    const nextCompletedIndices = [...new Set([...completedIndices, item.index])].sort((a, b) => a - b);
    const nextCompletedCount = nextCompletedIndices.length;
    const nextCompleted = nextCompletedCount >= 10;
    const shouldOpenCelebration = nextCompleted && !progress?.celebrationShown;
    const nextProgress: Progress = {
      pageId: currentPageId,
      completedItemCount: nextCompletedCount,
      completedItemIndices: nextCompletedIndices,
      lastItemIndex: item.index,
      completed: nextCompleted,
      celebrationShown: progress?.celebrationShown ?? false,
      updatedAt: new Date().toISOString()
    };

    setActiveItemIndex(item.index);
    setProgressByPage((previous) => ({
      ...previous,
      [currentPageId]: nextProgress
    }));

    if (shouldOpenCelebration) {
      setIsReviewCompleteOpen(true);
    }
  }

  function focusReviewItem(item: ContentItem) {
    setActiveItemIndex(item.index);
  }

  function handleReset() {
    setProgressByPage((previous) => ({
      ...previous,
      [currentPageId]: {
        pageId: currentPageId,
        completedItemCount: 0,
        completedItemIndices: [],
        lastItemIndex: 0,
        completed: false,
        celebrationShown: false,
        updatedAt: new Date().toISOString()
      }
    }));
    setActiveItemIndex(0);
    setIsReviewCompleteOpen(false);
  }

  function closeCelebration() {
    setProgressByPage((previous) => {
      const current = previous[currentPageId];
      if (!current) {
        return previous;
      }

      return {
        ...previous,
        [currentPageId]: {
          ...current,
          celebrationShown: true
        }
      };
    });
    setIsReviewCompleteOpen(false);
  }

  return {
    activeItemIndex,
    completedCount,
    completedIndices,
    closeCelebration,
    focusReviewItem,
    handleProgress,
    handleReset,
    isReviewCompleteOpen,
    progress,
    progressByPage,
    resumeProgress,
    setActiveItemIndex,
    syncActiveItemForPage,
    totalCompletedCount
  };
}
