import { ChevronLeft, ChevronRight, Pause, Play, Square } from "lucide-react";
import type { ContentItem, ContentPage, LearningSession, LearningStep } from "../types";
import {
  formatStepNumber,
  getRepeatSummary,
  getTrackLabel,
  type LearningOptions,
  type LearningStatus
} from "../utils/app";
import { ImageShell } from "./ImageShell";
import { ProgressCard } from "./ProgressCard";
import { WordCard } from "./WordCard";

type LearningPanelProps = {
  activeItemIndex: number;
  currentCycle: number;
  currentPage?: ContentPage;
  currentPageId: string;
  currentStepIndex: number;
  error: string | null;
  learningOptions: LearningOptions;
  learningSession: LearningSession | null;
  learningStatus: LearningStatus;
  learningStep: LearningStep | null;
  onMovePage: (direction: -1 | 1) => void;
  onOptionsChange: (updater: (previous: LearningOptions) => LearningOptions) => void;
  onPause: () => void;
  onResume: () => void;
  onStart: () => void;
  onStop: () => void;
  pageNumber: number;
  pageTitleText: string;
  reviewMarkers: ContentItem[];
};

export function LearningPanel({
  activeItemIndex,
  currentCycle,
  currentPage,
  currentPageId,
  currentStepIndex,
  learningOptions,
  learningSession,
  learningStatus,
  learningStep,
  onMovePage,
  onPause,
  onResume,
  onStart,
  onStop,
  pageNumber,
  pageTitleText,
  reviewMarkers
}: LearningPanelProps) {
  const isSessionActive = learningStatus === "playing" || learningStatus === "paused";

  const fallbackItem = currentPage?.items[0] ?? null;
  const displayItem = learningStep ?? fallbackItem;
  const displayItems = learningSession?.steps ?? currentPage?.items ?? [];

  const displayedStepIndex =
    learningStatus === "playing" || learningStatus === "paused" || learningStatus === "completed"
      ? currentStepIndex + 1
      : 0;

  const totalStepCount = learningSession?.steps.length ?? currentPage?.items.length ?? 10;

  return (
    <section className="workspace">
      <div className="image-panel">
        <button className="page-title-button" type="button" disabled>
          <h1>{pageTitleText}</h1>
        </button>

        <ImageShell
          activeItemIndex={activeItemIndex}
          completedIndices={[]}
          currentPageId={currentPageId}
          learningStep={learningStep}
          mode="learning"
          page={currentPage}
          reviewMarkers={reviewMarkers}
          onReviewSelect={() => {}}
        />
      </div>

      <aside className="study-panel">
        <div className="page-selector">
          <button type="button" onClick={() => onMovePage(-1)} disabled={pageNumber === 0 || isSessionActive}>
            <ChevronLeft size={16} />
          </button>

          <div className="page-selector__label">
            <strong>{pageTitleText}</strong>
            <span>{currentPageId}</span>
          </div>

          <button type="button" onClick={() => onMovePage(1)} disabled={pageNumber === 9 || isSessionActive}>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="learning-controls learning-controls--compact">
          <button className="primary-wide" type="button" onClick={onStart} disabled={learningStatus === "starting"}>
            {learningStatus === "starting" ? "세션 시작 중..." : "학습 시작"}
          </button>

          <div className="transport-controls">
            <button type="button" onClick={onPause} disabled={learningStatus !== "playing"}>
              <Pause size={16} />
              일시정지
            </button>
            <button type="button" onClick={onResume} disabled={learningStatus !== "paused"}>
              <Play size={16} />
              재생
            </button>
            <button type="button" onClick={onStop} disabled={!isSessionActive && learningStatus !== "completed"}>
              <Square size={16} />
              정지
            </button>
          </div>
        </div>

        {displayItem && (
          <WordCard
            englishWord={"englishWord" in displayItem ? displayItem.englishWord : ""}
            extra={
              <div className="learning-meta-grid">
                <div>
                  <span>현재 step</span>
                  <strong>
                    {"position" in displayItem
                      ? displayItem.position
                      : formatStepNumber(currentPageId, displayItem.index)}
                  </strong>
                </div>
                <div>
                  <span>항목 번호</span>
                  <strong>
                    {"itemIndex" in displayItem
                      ? formatStepNumber(currentPageId, displayItem.itemIndex)
                      : formatStepNumber(currentPageId, displayItem.index)}
                  </strong>
                </div>
              </div>
            }
            indexLabel={
              "itemIndex" in displayItem
                ? formatStepNumber(currentPageId, displayItem.itemIndex)
                : formatStepNumber(currentPageId, displayItem.index)
            }
            meaning={"koreanMeaning" in displayItem ? displayItem.koreanMeaning : ""}
            sentence={displayItem.sentence}
            title={displayItem.word}
            titleBadges={
              <div className="word-title-badges">
                {learningOptions.audioOrder
                  .filter((track) => track !== "NONE")
                  .map((track, index) => (
                    <span key={`${track}-${index}`}>{getTrackLabel(track)}</span>
                  ))}
              </div>
            }
          />
        )}

        {displayItems.length > 0 && (
          <div className="item-list">
            {displayItems.map((item, index) => {
              const isLearningStep = "itemIndex" in item;
              const itemIndex = isLearningStep ? item.itemIndex : item.index;
              const position = isLearningStep ? item.position : formatStepNumber(currentPageId, item.index);
              const isActive = learningSession ? index === currentStepIndex : itemIndex === activeItemIndex;

              return (
                <div className={isActive ? "item-row item-row--active" : "item-row"} key={`${position}-${itemIndex}`}>
                  <span>{position}</span>
                  <strong>{item.word}</strong>
                  <em>{formatStepNumber(currentPageId, itemIndex)}번</em>
                </div>
              );
            })}
          </div>
        )}
      </aside>
    </section>
  );
}