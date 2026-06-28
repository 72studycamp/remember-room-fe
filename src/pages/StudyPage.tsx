import { useEffect, useState } from "react";
import type { ContentItem, ContentPage, LearningStep } from "../types";
import { CelebrationModal } from "../components/CelebrationModal";
import { LearningPanel } from "../components/LearningPanel";
import { LearningSettingsPanel } from "../components/LearningSettingsPanel";
import { ModeTabs } from "../components/ModeTabs";
import { ReviewPanel } from "../components/ReviewPanel";
import { StopwatchPanel } from "../components/StopwatchPanel";
import type { LearningOptions, LearningStatus, StudyMode } from "../utils/app";

type StudyPageProps = {
  activeItemIndex: number;
  completedCount: number;
  completedIndices: number[];
  currentCycle: number;
  currentPage?: ContentPage;
  currentPageId: string;
  currentStepIndex: number;
  error: string | null;
  isReviewCompleteOpen: boolean;
  laps: number[];
  learningOptions: LearningOptions;
  learningSession: any;
  learningStatus: LearningStatus;
  learningStep: LearningStep | null;
  pageNumber: number;
  pageTitleText: string;
  reviewMarkers: ContentItem[];
  sortedItems: ContentItem[];
  studyMode: StudyMode;
  elapsedMs: number;
  onCloseCelebration: () => void;
  onHome: () => void;
  onLap: () => void;
  onModeChange: (mode: StudyMode) => void;
  onMovePage: (direction: -1 | 1) => void;
  onPauseLearning: () => void;
  onProgress: (item: ContentItem) => void;
  onResetProgress: () => void;
  onResetStopwatch: () => void;
  onResumeLearning: () => void;
  onSetLearningOptions: (updater: (previous: LearningOptions) => LearningOptions) => void;
  onStartLearning: () => void;
  onStartStopwatch: () => void;
  onStopLearning: () => void;
  onStopStopwatch: () => void;
};

export function StudyPage({
  activeItemIndex,
  completedCount,
  completedIndices,
  currentCycle,
  currentPage,
  currentPageId,
  currentStepIndex,
  error,
  elapsedMs,
  isReviewCompleteOpen,
  laps,
  learningOptions,
  learningSession,
  learningStatus,
  learningStep,
  onCloseCelebration,
  onHome,
  onLap,
  onModeChange,
  onMovePage,
  onPauseLearning,
  onProgress,
  onResetProgress,
  onResetStopwatch,
  onResumeLearning,
  onSetLearningOptions,
  onStartLearning,
  onStartStopwatch,
  onStopLearning,
  onStopStopwatch,
  pageNumber,
  pageTitleText,
  reviewMarkers,
  sortedItems,
  studyMode
}: StudyPageProps) {
  const [isLearningCompleteOpen, setIsLearningCompleteOpen] = useState(false);

  useEffect(() => {
    if (learningStatus === "completed") {
      setIsLearningCompleteOpen(true);
    }
  }, [learningStatus]);

  return (
    <main className="app">
      {error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      <ModeTabs studyMode={studyMode} 
                onChange={onModeChange} 
                onHome={onHome} />

      {studyMode === "learning" && (
        <LearningPanel
          activeItemIndex={activeItemIndex}
          currentCycle={currentCycle}
          currentPage={currentPage}
          currentPageId={currentPageId}
          currentStepIndex={currentStepIndex}
          error={error}
          learningOptions={learningOptions}
          learningSession={learningSession}
          learningStatus={learningStatus}
          learningStep={learningStep}
          onMovePage={onMovePage}
          onOptionsChange={onSetLearningOptions}
          onPause={onPauseLearning}
          onResume={onResumeLearning}
          onStart={onStartLearning}
          onStop={onStopLearning}
          pageNumber={pageNumber}
          pageTitleText={pageTitleText}
          reviewMarkers={reviewMarkers}
        />
      )}

      {studyMode === "settings" && (
        <LearningSettingsPanel
          currentPageId={currentPageId}
          learningOptions={learningOptions}
          learningStatus={learningStatus}
          onMovePage={onMovePage}
          onOptionsChange={onSetLearningOptions}
          pageNumber={pageNumber}
          pageTitleText={pageTitleText}
        />
      )}

      {studyMode === "review" && (
        <ReviewPanel
          activeItemIndex={activeItemIndex}
          activeReviewItem={currentPage?.items.find((item) => item.index === activeItemIndex)}
          completedCount={completedCount}
          completedIndices={completedIndices}
          currentPage={currentPage}
          currentPageId={currentPageId}
          lastPageNumber={9}
          onMovePage={onMovePage}
          onPageTitleClick={() => {
            const pageTitleItem = currentPage?.items.find((item) => item.index === 0) ?? currentPage?.items[0];
            if (pageTitleItem) {
              onProgress(pageTitleItem);
            }
          }}
          onReset={onResetProgress}
          onReviewSelect={onProgress}
          pageNumber={pageNumber}
          pageTitleText={pageTitleText}
          reviewMarkers={reviewMarkers}
          sortedItems={sortedItems}
        />
      )}

      {studyMode === "stopwatch" && (
        <StopwatchPanel
          elapsedMs={elapsedMs}
          laps={laps}
          onLap={onLap}
          onReset={onResetStopwatch}
          onStart={onStartStopwatch}
          onStop={onStopStopwatch}
        />
      )}

      <CelebrationModal isOpen={isReviewCompleteOpen} type="review" onConfirm={onCloseCelebration} />

      <CelebrationModal
        isOpen={isLearningCompleteOpen}
        type="learning"
        onConfirm={() => setIsLearningCompleteOpen(false)}
      />
    </main>
  );
}
