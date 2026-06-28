import { ChevronDown, LogIn } from "lucide-react";
import { AppSidebar } from "../components/AppSidebar";
import { LoginModal } from "../components/LoginModal";
import type { ContentPage, Member } from "../types";
import { landingHighlights, landingSteps, learningSections } from "../utils/app";

type LandingPageProps = {
  currentPage?: ContentPage;
  error: string | null;
  isAuthenticated: boolean;
  isConversationOpen: boolean;
  isLoginOpen: boolean;
  member: Member | null;
  onEnterStudy: () => void;
  onCloseLogin: () => void;
  onKakaoLogin: () => void;
  onLogout: () => void;
  onOpenBoard: () => void;
  onOpenLogin: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onSetConversationOpen: (next: boolean) => void;
  onUnavailableLogin: (provider: string) => void;
  pageTitleText: string;
  totalCompletedCount: number;
  variant: "guest" | "member";
};

export function LandingPage({
  currentPage,
  error,
  isAuthenticated,
  isConversationOpen,
  isLoginOpen,
  member,
  onEnterStudy,
  onCloseLogin,
  onKakaoLogin,
  onLogout,
  onOpenBoard,
  onOpenLogin,
  onProfile,
  onSettings,
  onSetConversationOpen,
  onUnavailableLogin,
  pageTitleText,
  totalCompletedCount,
  variant
}: LandingPageProps) {
  const progressPercent = Math.min(100, Math.max(0, totalCompletedCount));

  if (variant === "guest") {
    return (
      <main className="marketing">
        <header className="site-header site-header--light">
          <button className="brand-button brand-button--dark" type="button">
            기억방 학습기
          </button>
          <nav className="site-nav" aria-label="상단 메뉴">
            <button className="site-nav__item site-nav__item--active" type="button">
              홈
            </button>
            <button className="site-nav__item" type="button" onClick={onOpenBoard}>
              공지/자유게시판
            </button>
          </nav>
          <button className="login-button login-button--dark" type="button" onClick={onOpenLogin}>
            <LogIn size={16} />
            {member ? `${member.displayName}님` : "로그인"}
          </button>
        </header>

        <section className="marketing-hero">
          <div className="marketing-copy">
            <p className="marketing-eyebrow">기억방 학습기</p>
            <h1>복습은 클릭 중심, 학습은 자동 반복 중심으로 분리한 이미지 회화 학습기</h1>
            <p>
              콘텐츠 이미지와 아이템 데이터는 기존 API를 그대로 사용하고, 학습 모드에서는 세션 API 응답
              `steps`를 따라 자동 오디오 재생과 자동 step 전환을 수행합니다.
            </p>
            <div className="marketing-actions">
              <button className="primary-button" type="button" onClick={onOpenLogin}>
                로그인해서 시작
              </button>
              <button className="ghost-button" type="button" onClick={onOpenBoard}>
                공지/자유게시판 보기
              </button>
            </div>
            <div className="marketing-badges" aria-label="서비스 개요">
              <span>학습 세션 자동 재생</span>
              <span>복습 화면 유지</span>
              <span>{currentPage ? `${currentPage.id} 페이지 미리보기` : "콘텐츠 로딩 중"}</span>
            </div>
          </div>

          <div className="marketing-preview">
            {currentPage && (
              <>
                <div className="marketing-preview__label">{pageTitleText}</div>
                <img src={currentPage.imageUrl} alt={`${pageTitleText} 미리보기`} />
              </>
            )}
          </div>
        </section>

        <section className="marketing-section">
          <div className="marketing-section__header">
            <p>핵심 구성</p>
            <h2>학습과 복습을 다르게 다루도록 정리했습니다.</h2>
          </div>
          <div className="marketing-grid">
            {landingHighlights.map((item) => (
              <article className="marketing-card" key={item.title}>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-section marketing-section--muted">
          <div className="marketing-section__header">
            <p>학습 흐름</p>
            <h2>현재 제공하는 두 가지 방식</h2>
          </div>
          <div className="marketing-steps">
            {landingSteps.map((step, index) => (
              <article className="marketing-step" key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="marketing-section">
          <div className="marketing-section__header">
            <p>구역 구성</p>
            <h2>현재 공개된 학습 구역</h2>
          </div>
          <div className="marketing-grid marketing-grid--sections">
            {learningSections.map((section) => (
              <article className="marketing-card marketing-card--section" key={section.id}>
                <span>{section.title}</span>
                <strong>{section.range}</strong>
                <p>{section.state}</p>
              </article>
            ))}
          </div>
        </section>

        {error && (
          <div className="notice marketing-notice" role="alert">
            {error}
          </div>
        )}

        <LoginModal
          isOpen={isLoginOpen}
          onClose={onCloseLogin}
          onKakaoLogin={onKakaoLogin}
          onUnavailableLogin={onUnavailableLogin}
        />
      </main>
    );
  }

  return (
    <main className="landing landing--compact app-shell">
      <AppSidebar
        active="home"
        isAuthenticated={isAuthenticated}
        memberName={member?.displayName}
        onHome={() => {}}
        onEnterStudy={onEnterStudy}
        onBoard={onOpenBoard}
        onSettings={onSettings}
        onProfile={onProfile}
        onLogout={onLogout}
        onOpenLogin={onOpenLogin}
      />

      <section className="section-browser" aria-label="학습 섹션">
        <div className="section-browser-layout">
          <div className="section-stack">
            <div className="section-accordion">
              <button
                className={`section-trigger ${isConversationOpen ? "section-trigger--open" : ""}`}
                type="button"
                onClick={() => onSetConversationOpen(!isConversationOpen)}
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
                      onClick={index === 0 ? onEnterStudy : undefined}
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

            <div className="section-accordion">
              <button className="section-trigger" type="button">
                <span>한문</span>
                <ChevronDown size={16} />
              </button>
              <div className="section-empty">준비 중입니다.</div>
            </div>

            <div className="section-accordion">
              <button className="section-trigger" type="button">
                <span>중국어</span>
                <ChevronDown size={16} />
              </button>
              <div className="section-empty">준비 중입니다.</div>
            </div>
          </div>

          <aside className="landing-summary-card">
            <p>내 학습 현황</p>
            <h2>{totalCompletedCount}/100</h2>

            <div className="summary-progress" aria-hidden="true">
              <span
                style={
                  {
                    width: `${progressPercent}%`,
                    "--progress-percent": progressPercent
                  } as React.CSSProperties
                }
              />
            </div>

            <div className="landing-summary-meta">
              <span>현재 구역</span>
              <strong>A000-A009</strong>
            </div>

            <button type="button" onClick={onEnterStudy}>
              이어서 학습하기
            </button>
          </aside>
        </div>
      </section>

      {error && (
        <div className="notice landing-notice" role="alert">
          {error}
        </div>
      )}
    </main>
  );
}