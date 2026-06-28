import { Check, ChevronLeft, ChevronRight, Play, RotateCcw, Volume2 } from "lucide-react";
import { playAudio } from "../audio";
import type { ContentItem } from "../types";
import { formatStepNumber } from "../utils/app";
import { ImageShell } from "./ImageShell";
import { ProgressCard } from "./ProgressCard";
import { WordCard } from "./WordCard";

type ReviewPanelProps = {
  activeItemIndex: number;
  activeReviewItem?: ContentItem;
  completedCount: number;
  completedIndices: number[];
  currentPage: any;
  currentPageId: string;
  onPageTitleClick: () => void;
  onReset: () => void;
  onReviewSelect: (item: ContentItem) => void;
  onMovePage: (direction: -1 | 1) => void;
  pageNumber: number;
  reviewMarkers: ContentItem[];
  sortedItems: ContentItem[];
  pageTitleText: string;
  lastPageNumber: number;
};

export function ReviewPanel({
  activeItemIndex,
  activeReviewItem,
  completedCount,
  completedIndices,
  currentPage,
  currentPageId,
  lastPageNumber,
  onMovePage,
  onPageTitleClick,
  onReset,
  onReviewSelect,
  pageNumber,
  pageTitleText,
  reviewMarkers,
  sortedItems
}: ReviewPanelProps) {
  const progressPercent = (completedCount / 10) * 100;

  return (
    <section className="workspace">
      <div className="image-panel">
        <button className="page-title-button" type="button" onClick={onPageTitleClick}>
          <h1>{pageTitleText}</h1>
        </button>
        <ImageShell
          activeItemIndex={activeItemIndex}
          completedIndices={completedIndices}
          currentPageId={currentPageId}
          learningStep={null}
          mode="review"
          page={currentPage}
          reviewMarkers={reviewMarkers}
          onReviewSelect={onReviewSelect}
        />
      </div>

      <aside className="study-panel">
        <ProgressCard
          metaLabel={`${completedCount}/10 완료`}
          metaValue={`${Math.round(progressPercent)}%`}
          progressPercent={progressPercent}
        />

        {activeReviewItem && (
          <WordCard
            actions={
              <div className="audio-actions">
                <button type="button" onClick={() => void playAudio(activeReviewItem.audio.koreanUrl)}>
                  <Volume2 size={17} />
                  한국어
                </button>
                <button type="button" onClick={() => void playAudio(activeReviewItem.audio.englishUrl)}>
                  <Play size={17} />
                  English
                </button>
                <button type="button" onClick={() => void playAudio(activeReviewItem.audio.memoryUrl)}>
                  <Play size={17} />
                  문장
                </button>
              </div>
            }
            englishWord={activeReviewItem.englishWord}
            indexLabel={formatStepNumber(currentPageId, activeReviewItem.index)}
            meaning={activeReviewItem.koreanMeaning}
            sentence={activeReviewItem.sentence}
            title={activeReviewItem.word}
          />
        )}

        <div className="item-list">
          {sortedItems.map((item) => (
            <button
              className={item.index === activeItemIndex ? "item-row item-row--active" : "item-row"}
              key={item.index}
              type="button"
              onClick={() => onReviewSelect(item)}
            >
              <span>{formatStepNumber(currentPageId, item.index)}</span>
              <strong>{item.word}</strong>
              <em>{item.englishWord}</em>
              {completedIndices.includes(item.index) && <Check size={16} />}
            </button>
          ))}
        </div>

        <div className="nav-actions">
          <button type="button" onClick={() => onMovePage(-1)} disabled={pageNumber === 0}>
            <ChevronLeft size={18} />
            이전
          </button>
          <button type="button" onClick={onReset}>
            <RotateCcw size={17} />
            초기화
          </button>
          <button type="button" onClick={() => onMovePage(1)} disabled={pageNumber === lastPageNumber}>
            다음
            <ChevronRight size={18} />
          </button>
        </div>
      </aside>
    </section>
  );
}
