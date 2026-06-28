import { AppSidebar } from "../components/AppSidebar";
import { LoginModal } from "../components/LoginModal";
import { boardSections } from "../utils/app";

type BoardPageProps = {
  isAuthenticated: boolean;
  isLoginOpen: boolean;
  memberName?: string;
  onCloseLogin: () => void;
  onEnterStudy: () => void;
  onHome: () => void;
  onBoard: () => void;
  onKakaoLogin: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onUnavailableLogin: (provider: string) => void;
};

export function BoardPage({
  isAuthenticated,
  isLoginOpen,
  memberName,
  onCloseLogin,
  onEnterStudy,
  onHome,
  onBoard,
  onKakaoLogin,
  onLogout,
  onOpenLogin,
  onSettings,
  onProfile,
  onUnavailableLogin
}: BoardPageProps) {
  return (
    <main className="board-shell app-shell">
      <AppSidebar
        active="board"
        isAuthenticated={isAuthenticated}
        memberName={memberName}
        onHome={onHome}
        onEnterStudy={onEnterStudy}
        onBoard={onBoard}
        onSettings={onSettings}
        onProfile={onProfile}
        onLogout={onLogout}
        onOpenLogin={onOpenLogin}
      />

      <section className="board-page">
        <div className="board-page__hero">
          <p>안내 공간</p>
          <h1>공지/자유게시판</h1>
          <span>백엔드 연동 전까지는 구조만 먼저 준비해 둡니다.</span>
        </div>

        <div className="board-page__layout">
          <aside className="board-sidebar">
            <strong>목차</strong>
            <ul>
              {boardSections.map((section) => (
                <li key={section}>{section}</li>
              ))}
            </ul>
          </aside>

          <section className="board-placeholder">
            <div className="board-placeholder__toolbar">
              <span>게시물 목록</span>
              <button type="button" disabled>
                글쓰기 준비 중
              </button>
            </div>
            <div className="board-placeholder__empty">
              <strong>아직 등록된 글이 없습니다.</strong>
              <p>공지사항, 운영 안내, 학습 공지용 게시판이 이 영역에 들어올 예정입니다.</p>
            </div>
          </section>
        </div>
      </section>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={onCloseLogin}
        onKakaoLogin={onKakaoLogin}
        onUnavailableLogin={onUnavailableLogin}
      />
    </main>
  );
}