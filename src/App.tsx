import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  House,
  Loader2,
  LogIn,
  Play,
  RotateCcw,
  Timer,
  X,
  Volume2
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getContentWindow } from "./api";
import { playAudio } from "./audio";
import googleLoginImage from "./assets/google-login.png";
import kakaoIconImage from "./assets/kakao-icon.png";
import naverLoginImage from "./assets/naver-login.png";
import type { ContentItem, ContentPage, Progress } from "./types";

const FIRST_PAGE_ID = "A000";
const LAST_PAGE_NUMBER = 9;
const PROGRESS_STORAGE_KEY = "remember-room-progress";

type ImageSize = {
  width: number;
  height: number;
};
type BoxSize = {
  width: number;
  height: number;
};
type MarkerPosition = {
  px: number;
  py: number;
};
type StudyMode = "conversation" | "review" | "repeat" | "stopwatch";

const learningSections = [
  { id: "A000-A009", title: "A 구역", range: "A000-A009", state: "학습 가능" },
  { id: "A010-A019", title: "B 구역", range: "A010-A019", state: "준비 중" },
  { id: "A020-A029", title: "C 구역", range: "A020-A029", state: "준비 중" },
  { id: "A030-A039", title: "D 구역", range: "A030-A039", state: "준비 중" },
  { id: "A040-A049", title: "E 구역", range: "A040-A049", state: "준비 중" },
  { id: "A050-A059", title: "F 구역", range: "A050-A059", state: "준비 중" }
];

function toPageId(pageNumber: number) {
  return `A${String(pageNumber).padStart(3, "0")}`;
}

function getPageNumber(pageId: string) {
  return Number(pageId.replace("A", ""));
}

function getSavedIndex(progress?: Progress) {
  if (!progress || progress.lastItemIndex < 0) {
    return 0;
  }

  return Math.min(progress.lastItemIndex, 9);
}

function loadStoredProgress() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as Record<string, Progress>;
  } catch {
    return {};
  }
}

export function App() {
  const [pagesById, setPagesById] = useState<Record<string, ContentPage>>({});
  const [progressByPage, setProgressByPage] = useState<Record<string, Progress>>(() => loadStoredProgress());
  const [hasEnteredStudy, setHasEnteredStudy] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [currentPageId, setCurrentPageId] = useState(FIRST_PAGE_ID);
  const [studyMode, setStudyMode] = useState<StudyMode>("conversation");
  const [trackName, setTrackName] = useState("생활회화");
  const [startNumber, setStartNumber] = useState(0);
  const [endNumber, setEndNumber] = useState(0);
  const [repeatCount, setRepeatCount] = useState(20);
  const [loopSetup, setLoopSetup] = useState({
    image: 0,
    video: 3,
    native: 1,
    check: 0
  });
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [shellSize, setShellSize] = useState<BoxSize | null>(null);
  const previousPageIdRef = useRef(currentPageId);
  const imageShellRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentPage = pagesById[currentPageId];
  const progress = progressByPage[currentPageId];
  const activeItem = currentPage?.items.find((item) => item.index === activeItemIndex);
  const pageTitleItem = currentPage?.items.find((item) => item.index === 0) ?? currentPage?.items[0];
  const pageTitleText = pageTitleItem ? pageTitleItem.word : currentPageId;
  function getMarkerPosition(x: number, y: number): MarkerPosition {
    const fallbackShellSize = shellSize ?? imageSize ?? { width: 1, height: 1 };
    const fallbackImageSize = imageSize ?? fallbackShellSize;
    const scale = Math.min(
      fallbackShellSize.width / fallbackImageSize.width,
      fallbackShellSize.height / fallbackImageSize.height
    );
    const renderedWidth = fallbackImageSize.width * scale;
    const renderedHeight = fallbackImageSize.height * scale;
    const offsetX = (fallbackShellSize.width - renderedWidth) / 2;
    const offsetY = (fallbackShellSize.height - renderedHeight) / 2;
    const markerX = offsetX + x * scale;
    const markerY = offsetY + y * scale;

    return {
      px: markerX,
      py: markerY
    };
  }
  const completedCount = progress?.completedItemCount ?? 0;
  const pageNumber = getPageNumber(currentPageId);
  const savedProgressItems = Object.values(progressByPage);
  const totalCompletedCount = savedProgressItems.reduce(
    (sum, item) => sum + Math.min(item.completedItemCount, 10),
    0
  );
  const resumeProgress = savedProgressItems
    .filter((item) => !item.completed)
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""))[0];

  const sortedItems = useMemo(() => {
    return [...(currentPage?.items ?? [])].sort((a, b) => a.index - b.index);
  }, [currentPage]);
  const imageMarkerItems = useMemo(() => {
    return sortedItems.filter((item) => item.index > 0);
  }, [sortedItems]);
  const selectableNumbers = useMemo(() => {
    return Array.from({ length: 100 }, (_, index) => index * 10);
  }, []);

  useEffect(() => {
    if (!isTimerRunning) {
      return;
    }

    const tick = setInterval(() => {
      setElapsedMs((previous) => previous + 1000);
    }, 1000);

    return () => clearInterval(tick);
  }, [isTimerRunning]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progressByPage));
  }, [progressByPage]);

  const loadPageWindow = useCallback(async (pageId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const windowPages = await getContentWindow(pageId, 1);

      setPagesById((previous) => {
        const next = { ...previous };
        windowPages.forEach((page) => {
          next[page.id] = page;
        });
        return next;
      });
      setActiveItemIndex(getSavedIndex(progressByPage[pageId]));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "콘텐츠를 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [progressByPage]);

  useEffect(() => {
    void loadPageWindow(FIRST_PAGE_ID);
  }, [loadPageWindow]);

  useEffect(() => {
    if (!pagesById[currentPageId]) {
      void loadPageWindow(currentPageId);
      return;
    }

    if (previousPageIdRef.current !== currentPageId) {
      previousPageIdRef.current = currentPageId;
      setActiveItemIndex(getSavedIndex(progressByPage[currentPageId]));
      setImageSize(null);
    }
  }, [currentPageId, loadPageWindow, pagesById, progressByPage]);

  useEffect(() => {
    const nextPage = pagesById[toPageId(pageNumber + 1)];

    if (!nextPage) {
      return;
    }

    const image = new Image();
    image.src = nextPage.imageUrl;
  }, [pageNumber, pagesById]);

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
  }, [currentPageId, hasEnteredStudy, studyMode]);

  async function handleProgress(item: ContentItem) {
    const nextCompletedCount = Math.max(completedCount, item.index + 1);
    const nextProgress = {
      pageId: currentPageId,
      completedItemCount: nextCompletedCount,
      lastItemIndex: item.index,
      completed: nextCompletedCount >= 10,
      updatedAt: new Date().toISOString()
    };

    setActiveItemIndex(item.index);
    setError(null);
    setProgressByPage((previous) => ({
      ...previous,
      [currentPageId]: nextProgress
    }));
  }

  function handleReset() {
    setError(null);
    setProgressByPage((previous) => ({
      ...previous,
      [currentPageId]: {
        pageId: currentPageId,
        completedItemCount: 0,
        lastItemIndex: 0,
        completed: false,
        updatedAt: new Date().toISOString()
      }
    }));
    setActiveItemIndex(0);
  }

  function movePage(direction: -1 | 1) {
    const next = Math.min(LAST_PAGE_NUMBER, Math.max(0, pageNumber + direction));
    setCurrentPageId(toPageId(next));
  }

  function enterStudy() {
    if (resumeProgress) {
      setCurrentPageId(resumeProgress.pageId);
      setActiveItemIndex(getSavedIndex(resumeProgress));
    }

    setStudyMode("conversation");
    setHasEnteredStudy(true);
  }

  function stepNumber(setter: (value: number) => void, currentValue: number, direction: -1 | 1) {
    const currentIndex = selectableNumbers.indexOf(currentValue);
    const nextIndex = Math.max(0, Math.min(selectableNumbers.length - 1, currentIndex + direction));
    setter(selectableNumbers[nextIndex]);
  }

  function formatTimer(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }

  function pushLap() {
    setLaps((previous) => {
      const next = [elapsedMs, ...previous];
      return next.slice(0, 10);
    });
  }

  if (isLoading && !currentPage) {
    return (
      <main className="app app--center">
        <Loader2 className="spin" size={32} />
      </main>
    );
  }

  if (!hasEnteredStudy) {
    return (
      <main className="landing">
        <header className="landing-header">
          <button className="brand-button" type="button" aria-label="기억방 학습기">
            기억방 학습기
          </button>
          <button className="login-button" type="button" onClick={() => setIsLoginOpen(true)}>
            <LogIn size={16} />
            로그인
          </button>
        </header>

        <section className="landing-hero">
          {currentPage && <img src={currentPage.imageUrl} alt="" aria-hidden="true" />}
          <div className="landing-shade" />
          <div className="landing-content">
            <p className="landing-kicker">기억방 학습기</p>
            <h1>기억방 학습기</h1>
            <div className="landing-stats" aria-label="학습 현황">
              <span>A000-A009</span>
              <span>{totalCompletedCount}/100</span>
            </div>
          </div>
        </section>

        <section className="section-browser" aria-label="학습 섹션">
          <div className="section-accordion">
            <button
              className={`section-trigger ${isConversationOpen ? "section-trigger--open" : ""}`}
              type="button"
              onClick={() => setIsConversationOpen((previous) => !previous)}
              aria-expanded={isConversationOpen}
              aria-controls="conversation-sections"
            >
              <span>생활회화</span>
              <ChevronDown size={16} />
            </button>
            {isConversationOpen && (
              <div className="section-grid section-grid--compact" id="conversation-sections">
                {learningSections.map((section, index) => (
                  <button
                    className="section-card section-card--compact"
                    key={section.id}
                    type="button"
                    onClick={index === 0 ? enterStudy : undefined}
                    disabled={index !== 0}
                  >
                    <span>{section.title}</span>
                    <strong>{section.range}</strong>
                    <em>{section.state}</em>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="notice landing-notice" role="alert">
            {error}
          </div>
        )}

        {isLoginOpen && (
          <div className="login-backdrop" role="presentation">
            <section className="login-panel" aria-modal="true" role="dialog" aria-label="로그인">
              <button
                className="login-close"
                type="button"
                onClick={() => setIsLoginOpen(false)}
                aria-label="로그인 닫기"
              >
                <X size={18} />
              </button>
              <div className="login-visual">
                <p>기억방 학습기</p>
              </div>
              <button className="kakao-login" type="button">
                <img src={kakaoIconImage} alt="" />
                카카오로 로그인
              </button>
              <div className="login-divider">
                <span>또는</span>
              </div>
              <div className="social-login-row" aria-label="다른 로그인">
                <button type="button" aria-label="네이버 로그인">
                  <img src={naverLoginImage} alt="" />
                </button>
                <span className="social-separator" aria-hidden="true" />
                <button type="button" aria-label="구글 로그인">
                  <img src={googleLoginImage} alt="" />
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="app">
      <section className="topbar">
        <div className="topbar-left">
          <button
            className="home-button"
            type="button"
            onClick={() => setHasEnteredStudy(false)}
            aria-label="홈으로 이동"
          >
            <House size={16} />
            홈
          </button>
          <button
            className="page-title-button"
            type="button"
            onClick={() => pageTitleItem && void handleProgress(pageTitleItem)}
          >
            <h1>{pageTitleText}</h1>
          </button>
        </div>
      </section>

      {error && (
        <div className="notice" role="alert">
          {error}
        </div>
      )}

      <section className="mode-tabs" aria-label="학습 모드">
        <button
          className={studyMode === "conversation" ? "mode-tab mode-tab--active" : "mode-tab"}
          type="button"
          onClick={() => setStudyMode("conversation")}
        >
          생활회화
        </button>
        <button
          className={studyMode === "review" ? "mode-tab mode-tab--active" : "mode-tab"}
          type="button"
          onClick={() => setStudyMode("review")}
        >
          복습
        </button>
        <button
          className={studyMode === "repeat" ? "mode-tab mode-tab--active" : "mode-tab"}
          type="button"
          onClick={() => setStudyMode("repeat")}
        >
          반복학습
        </button>
        <button
          className={studyMode === "stopwatch" ? "mode-tab mode-tab--active" : "mode-tab"}
          type="button"
          onClick={() => setStudyMode("stopwatch")}
        >
          초시계
        </button>
      </section>

      {studyMode === "conversation" && <section className="workspace">
        <div className="image-panel">
          <div
            className="image-shell"
            ref={imageShellRef}
          >
            {currentPage && (
              <>
                <img
                  src={currentPage.imageUrl}
                  alt={`${currentPage.id} 학습 이미지`}
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
                {imageMarkerItems.map((item) => {
                  const marker = getMarkerPosition(item.labelPoint.x, item.labelPoint.y);
                  const isActive = item.index === activeItemIndex;
                  const isDone = item.index < completedCount;

                  return (
                    <div key={item.index}>
                      <button
                        className={`marker ${isActive ? "marker--active" : ""} ${isDone ? "marker--done" : ""}`}
                        style={{ left: `${marker.px}px`, top: `${marker.py}px` }}
                        type="button"
                        onClick={() => void handleProgress(item)}
                        title={`${item.word} 선택`}
                      >
                        {item.index}
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        <aside className="study-panel">
          <div className="progress-card">
            <div className="progress-meta">
              <span>{completedCount}/10 완료</span>
              <strong>{Math.round((completedCount / 10) * 100)}%</strong>
            </div>
            <div className="progress-track" aria-hidden="true">
              <span style={{ width: `${(completedCount / 10) * 100}%` }} />
            </div>
          </div>

          {activeItem && (
            <article className="word-card">
              <div className="word-heading">
                <span className="item-index">{activeItem.index}</span>
                <div>
                  <h2>{activeItem.word}</h2>
                  <p>{activeItem.englishWord}</p>
                </div>
              </div>
              <p className="meaning">{activeItem.koreanMeaning}</p>
              <p className="sentence">{activeItem.sentence}</p>

              <div className="audio-actions">
                <button type="button" onClick={() => void playAudio(activeItem.audio.koreanUrl)}>
                  <Volume2 size={17} />
                  한국어
                </button>
                <button type="button" onClick={() => void playAudio(activeItem.audio.englishUrl)}>
                  <Play size={17} />
                  English
                </button>
                <button type="button" onClick={() => void playAudio(activeItem.audio.memoryUrl)}>
                  <Play size={17} />
                  문장
                </button>
              </div>
            </article>
          )}

          <div className="item-list">
            {sortedItems.map((item) => (
              <button
                className={item.index === activeItemIndex ? "item-row item-row--active" : "item-row"}
                key={item.index}
                type="button"
                onClick={() => void handleProgress(item)}
              >
                <span>{item.index}</span>
                <strong>{item.word}</strong>
                <em>{item.englishWord}</em>
                {item.index < completedCount && <Check size={16} />}
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <button type="button" onClick={() => movePage(-1)} disabled={pageNumber === 0}>
              <ChevronLeft size={18} />
              이전
            </button>
            <button type="button" onClick={handleReset}>
              <RotateCcw size={17} />
              초기화
            </button>
            <button type="button" onClick={() => movePage(1)} disabled={pageNumber === LAST_PAGE_NUMBER}>
              다음
              <ChevronRight size={18} />
            </button>
          </div>
        </aside>
      </section>}

      {studyMode !== "conversation" && (
        <section className="mode-panel">
          <article className="mode-card">
            <h2>{studyMode === "review" ? "복습 설정" : studyMode === "repeat" ? "반복학습 설정" : "초시계"}</h2>
            {currentPage && (
              <div className="mode-preview">
                <div className="image-title-badge image-title-badge--compact">{pageTitleText}</div>
                <img src={currentPage.imageUrl} alt={`${currentPage.id} 미리보기`} />
              </div>
            )}

            {(studyMode === "review" || studyMode === "repeat") && (
              <div className="setting-stack">
                {studyMode === "repeat" && (
                  <div className="loop-row">
                    <strong>반복횟수</strong>
                    <button type="button" onClick={() => setLoopSetup({ image: 0, video: 3, native: 1, check: 0 })}>
                      Clear
                    </button>
                    <span>이미지 {loopSetup.image}</span>
                    <span>동영상 {loopSetup.video}</span>
                    <span>원어민 {loopSetup.native}</span>
                    <span>확인학습 {loopSetup.check}</span>
                  </div>
                )}

                <div className="setting-row">
                  <label>과정</label>
                  <div className="setting-value">{trackName}</div>
                </div>

                <div className="setting-row">
                  <label>시작번호</label>
                  <div className="setting-control">
                    <button type="button" onClick={() => stepNumber(setStartNumber, startNumber, -1)}>
                      <ChevronLeft size={14} />
                    </button>
                    <div className="setting-value">{startNumber}</div>
                    <button type="button" onClick={() => stepNumber(setStartNumber, startNumber, 1)}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="setting-row">
                  <label>종료번호</label>
                  <div className="setting-control">
                    <button type="button" onClick={() => stepNumber(setEndNumber, endNumber, -1)}>
                      <ChevronLeft size={14} />
                    </button>
                    <div className="setting-value">{endNumber}</div>
                    <button type="button" onClick={() => stepNumber(setEndNumber, endNumber, 1)}>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {studyMode === "repeat" && (
                  <div className="setting-row">
                    <label>반복횟수</label>
                    <div className="setting-control">
                      <button
                        type="button"
                        onClick={() => setRepeatCount((previous) => Math.max(1, previous - 1))}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <div className="setting-value">{repeatCount}회</div>
                      <button
                        type="button"
                        onClick={() => setRepeatCount((previous) => Math.min(99, previous + 1))}
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                <button className="primary-wide" type="button">
                  {studyMode === "review" ? "복습 시작" : "반복학습 시작"}
                </button>
              </div>
            )}

            {studyMode === "stopwatch" && (
              <div className="stopwatch-wrap">
                <div className="timer-face">
                  <Timer size={18} />
                  {formatTimer(elapsedMs)}
                </div>
                <div className="timer-actions">
                  <button type="button" onClick={() => setIsTimerRunning(true)}>
                    시작
                  </button>
                  <button type="button" onClick={() => setIsTimerRunning(false)}>
                    종료
                  </button>
                  <button type="button" onClick={pushLap}>
                    랩
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setElapsedMs(0);
                      setLaps([]);
                      setIsTimerRunning(false);
                    }}
                  >
                    초기화
                  </button>
                </div>
                <div className="lap-list">
                  {laps.length === 0 && <p>기록 없음</p>}
                  {laps.map((lap, index) => (
                    <div key={`${lap}-${index}`}>Lap {index + 1} {formatTimer(lap)}</div>
                  ))}
                </div>
              </div>
            )}
          </article>
        </section>
      )}
    </main>
  );
}
