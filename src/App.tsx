import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { useContentPages } from "./hooks/useContentPages";
import { useLearning } from "./hooks/useLearning";
import { useProgress } from "./hooks/useProgress";
import { useStopwatch } from "./hooks/useStopwatch";
import { BoardPage } from "./pages/BoardPage";
import { LandingPage } from "./pages/LandingPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StudyPage } from "./pages/StudyPage";
import { LAST_PAGE_NUMBER, type StudyMode, type SurfaceView } from "./utils/app";

export function App() {
  const [surfaceView, setSurfaceView] = useState<SurfaceView>("home");
  const [hasEnteredStudy, setHasEnteredStudy] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("learning");
  const [error, setError] = useState<string | null>(null);

  const { currentPageId, isLoading, loadPageWindow, pageNumber, pagesById, setCurrentPageId } = useContentPages({
    onError: setError
  });

  const progress = useProgress({ currentPageId });
  const stopwatch = useStopwatch();

  const auth = useAuth({
    onError: setError,
    onLoginSuccess: () => {
      setHasEnteredStudy(false);
      setSurfaceView("home");
    }
  });

  const learning = useLearning({
    currentPageId,
    ensurePageLoaded: async (pageId) => {
      if (!pagesById[pageId]) {
        await loadPageWindow(pageId);
      }
    },
    onCurrentPageChange: setCurrentPageId,
    onStepItemChange: progress.setActiveItemIndex
  });

  useEffect(() => {
    if (studyMode !== "learning") {
      learning.stopLearningPlayback(learning.learningStatus === "completed" ? "completed" : "stopped");
    }
  }, [learning, studyMode]);

  function enterStudy() {
    if (progress.resumeProgress) {
      setCurrentPageId(progress.resumeProgress.pageId);
      progress.setActiveItemIndex(progress.resumeProgress.lastItemIndex);
    }

    setStudyMode("learning");
    setSurfaceView("home");
    setHasEnteredStudy(true);
  }

  function openSettings() {
    setSurfaceView("home");
    setHasEnteredStudy(true);
    setStudyMode("settings");
  }

  function openProfile() {
    learning.stopLearningPlayback("stopped");
    setHasEnteredStudy(false);
    setSurfaceView("profile");
  }

  function movePage(direction: -1 | 1) {
    const nextPageNumber = Math.min(LAST_PAGE_NUMBER, Math.max(0, pageNumber + direction));
    setCurrentPageId(`A${String(nextPageNumber).padStart(3, "0")}`);
    learning.resetLearningPageState();

    if (studyMode === "learning") {
      learning.stopLearningPlayback("idle");
    }
  }

  function handleLogout() {
    learning.stopLearningPlayback("stopped");
    auth.handleLogout();
    setHasEnteredStudy(false);
    setSurfaceView("home");
  }

  const currentPage = pagesById[currentPageId];

  const sortedItems = useMemo(
    () => [...(currentPage?.items ?? [])].sort((a, b) => a.index - b.index),
    [currentPage]
  );

  const reviewMarkers = useMemo(() => sortedItems.filter((item) => item.index > 0), [sortedItems]);
  const pageTitleItem = currentPage?.items.find((item) => item.index === 0) ?? currentPage?.items[0];
  const pageTitleText = pageTitleItem ? pageTitleItem.word : currentPageId;
  const learningStep = learning.learningSession?.steps[learning.currentStepIndex] ?? null;

  useEffect(() => {
    if (pagesById[currentPageId]) {
      progress.syncActiveItemForPage(currentPageId);
    }
  }, [currentPageId, pagesById, progress]);

  if (auth.isAuthProcessing || (isLoading && !currentPage)) {
    return (
      <main className="app app--center">
        <Loader2 className="spin" size={32} />
      </main>
    );
  }

  if (surfaceView === "profile" && !hasEnteredStudy) {
    return (
      <ProfilePage
        isAuthenticated={auth.isAuthenticated}
        memberName={auth.member?.displayName}
        onHome={() => {
          setSurfaceView("home");
          setHasEnteredStudy(false);
        }}
        onEnterStudy={enterStudy}
        onBoard={() => setSurfaceView("board")}
        onSettings={openSettings}
        onProfile={openProfile}
        onLogout={handleLogout}
        onOpenLogin={() => auth.setIsLoginOpen(true)}
      />
    );
  }

  if (surfaceView === "board" && !hasEnteredStudy) {
    return (
      <BoardPage
        isAuthenticated={auth.isAuthenticated}
        isLoginOpen={auth.isLoginOpen}
        memberName={auth.member?.displayName}
        onCloseLogin={() => auth.setIsLoginOpen(false)}
        onEnterStudy={enterStudy}
        onHome={() => {
          setSurfaceView("home");
          setHasEnteredStudy(false);
        }}
        onBoard={() => setSurfaceView("board")}
        onSettings={openSettings}
        onProfile={openProfile}
        onKakaoLogin={() => void auth.handleKakaoLogin()}
        onLogout={handleLogout}
        onOpenLogin={() => auth.setIsLoginOpen(true)}
        onUnavailableLogin={(provider) => setError(`${provider} 로그인은 아직 연결되지 않았습니다.`)}
      />
    );
  }

  if (!auth.isAuthenticated && !hasEnteredStudy) {
  return (
    <LandingPage
      currentPage={currentPage}
      error={error}
      isAuthenticated={false}
      isConversationOpen={isConversationOpen}
      isLoginOpen={auth.isLoginOpen}
      member={auth.member}
      onEnterStudy={enterStudy}
      onKakaoLogin={() => void auth.handleKakaoLogin()}
      onLogout={handleLogout}
      onOpenBoard={() => setSurfaceView("board")}
      onOpenLogin={() => auth.setIsLoginOpen(true)}
      onCloseLogin={() => auth.setIsLoginOpen(false)}
      onSetConversationOpen={setIsConversationOpen}
      onSettings={openSettings}
      onProfile={openProfile}
      onUnavailableLogin={(provider) => setError(`${provider} 로그인은 아직 연결되지 않았습니다.`)}
      pageTitleText={pageTitleText}
      totalCompletedCount={progress.totalCompletedCount}
      variant="guest"
    />
  );
}

  if (!hasEnteredStudy) {
    return (
      <LandingPage
        currentPage={currentPage}
        error={error}
        isAuthenticated={auth.isAuthenticated}
        isConversationOpen={isConversationOpen}
        isLoginOpen={false}
        member={auth.member}
        onEnterStudy={enterStudy}
        onKakaoLogin={() => {}}
        onLogout={handleLogout}
        onOpenBoard={() => setSurfaceView("board")}
        onOpenLogin={() => {}}
        onCloseLogin={() => {}}
        onSetConversationOpen={setIsConversationOpen}
        onSettings={openSettings}
        onProfile={openProfile}
        onUnavailableLogin={() => {}}
        pageTitleText={pageTitleText}
        totalCompletedCount={progress.totalCompletedCount}
        variant="member"
      />
    );
  }

  return (
    <StudyPage
      activeItemIndex={progress.activeItemIndex}
      completedCount={progress.completedCount}
      completedIndices={progress.completedIndices}
      currentCycle={learning.currentCycle}
      currentPage={currentPage}
      currentPageId={currentPageId}
      currentStepIndex={learning.currentStepIndex}
      elapsedMs={stopwatch.elapsedMs}
      error={error}
      isReviewCompleteOpen={progress.isReviewCompleteOpen}
      laps={stopwatch.laps}
      learningOptions={learning.learningOptions}
      learningSession={learning.learningSession}
      learningStatus={learning.learningStatus}
      learningStep={learningStep}
      onCloseCelebration={progress.closeCelebration}
      onHome={() => {
        learning.stopLearningPlayback("stopped");
        setHasEnteredStudy(false);
      }}
      onLap={stopwatch.pushLap}
      onModeChange={setStudyMode}
      onMovePage={movePage}
      onPauseLearning={learning.handlePauseLearning}
      onProgress={(item) => void progress.handleProgress(item)}
      onResetProgress={progress.handleReset}
      onResetStopwatch={stopwatch.reset}
      onResumeLearning={learning.handleResumeLearning}
      onSetLearningOptions={learning.setLearningOptions}
      onStartLearning={() =>
        void learning.handleStartLearning().catch((cause) => {
          setError(cause instanceof Error ? cause.message : "학습 세션을 시작하지 못했습니다.");
        })
      }
      onStartStopwatch={stopwatch.start}
      onStopLearning={() => learning.stopLearningPlayback("stopped")}
      onStopStopwatch={stopwatch.stop}
      pageNumber={pageNumber}
      pageTitleText={pageTitleText}
      reviewMarkers={reviewMarkers}
      sortedItems={sortedItems}
      studyMode={studyMode}
    />
  );
}