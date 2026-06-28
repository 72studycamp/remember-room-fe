import { useEffect, useMemo, useRef, useState } from "react";
import type { ContentItem, ContentPage, LearningStep } from "../types";
import { formatStepNumber, getMarkerPosition, type BoxSize, type ImageSize } from "../utils/app";

type ImageShellProps = {
  activeItemIndex: number;
  completedIndices: number[];
  currentPageId: string;
  learningStep: LearningStep | null;
  mode: "learning" | "review";
  page: ContentPage | undefined;
  reviewMarkers: ContentItem[];
  onReviewSelect: (item: ContentItem) => void;
};

export function ImageShell({
  activeItemIndex,
  completedIndices,
  currentPageId,
  learningStep,
  mode,
  page,
  reviewMarkers,
  onReviewSelect
}: ImageShellProps) {
  const imageShellRef = useRef<HTMLDivElement | null>(null);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [shellSize, setShellSize] = useState<BoxSize | null>(null);

  useEffect(() => {
    const refreshShellSize = () => {
      const shell = imageShellRef.current;
      if (!shell) {
        return;
      }

      setShellSize({
        width: shell.clientWidth,
        height: shell.clientHeight
      });
    };

    refreshShellSize();
    const shell = imageShellRef.current;
    const observer = shell ? new ResizeObserver(refreshShellSize) : null;
    if (shell) {
      observer?.observe(shell);
    }
    window.addEventListener("resize", refreshShellSize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", refreshShellSize);
    };
  }, [page?.id, mode]);

  const currentLearningMarker = useMemo(() => {
    if (!learningStep) {
      return null;
    }

    return {
      label: formatStepNumber(currentPageId, learningStep.itemIndex),
      marker: getMarkerPosition(learningStep.labelPoint.x, learningStep.labelPoint.y, shellSize, imageSize)
    };
  }, [currentPageId, imageSize, learningStep, shellSize]);

  return (
    <div className="image-panel">
      <div className="image-shell" ref={imageShellRef}>
        {page && (
          <>
            <img
              src={page.imageUrl}
              alt={`${page.id} 학습 이미지`}
              onLoad={(event) => {
                setImageSize({
                  width: event.currentTarget.naturalWidth,
                  height: event.currentTarget.naturalHeight
                });
                setShellSize({
                  width: event.currentTarget.parentElement?.clientWidth ?? event.currentTarget.clientWidth,
                  height: event.currentTarget.parentElement?.clientHeight ?? event.currentTarget.clientHeight
                });
              }}
            />
            {mode === "review" &&
              reviewMarkers.map((item) => {
                const marker = getMarkerPosition(item.labelPoint.x, item.labelPoint.y, shellSize, imageSize);
                const isActive = item.index === activeItemIndex;
                const isDone = completedIndices.includes(item.index);

                return (
                  <button
                    className={`marker ${isActive ? "marker--active" : ""} ${isDone ? "marker--done" : ""}`}
                    key={item.index}
                    style={{ left: `${marker.px}px`, top: `${marker.py}px` }}
                    type="button"
                    onClick={() => onReviewSelect(item)}
                    title={`${item.word} 선택`}
                  >
                    {formatStepNumber(currentPageId, item.index)}
                  </button>
                );
              })}
            {mode === "learning" &&
              reviewMarkers.map((item) => {
                const marker = getMarkerPosition(item.labelPoint.x, item.labelPoint.y, shellSize, imageSize);
                const isActive = learningStep?.itemIndex === item.index;

                return (
                  <div
                    className={`marker marker--ghost ${isActive ? "marker--active" : ""}`}
                    key={item.index}
                    style={{ left: `${marker.px}px`, top: `${marker.py}px` }}
                  >
                    {formatStepNumber(currentPageId, item.index)}
                  </div>
                );
              })}
            {mode === "learning" && currentLearningMarker && (
              <div
                className="learning-focus"
                style={{ left: `${currentLearningMarker.marker.px}px`, top: `${currentLearningMarker.marker.py}px` }}
              >
                <span>{currentLearningMarker.label}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
