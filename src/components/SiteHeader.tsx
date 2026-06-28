import { LogIn } from "lucide-react";

type SiteHeaderProps = {
  active: "home" | "board";
  isAuthenticated: boolean;
  memberName?: string;
  onHome: () => void;
  onBoard: () => void;
  onEnterStudy: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
};

export function SiteHeader({
  active,
  isAuthenticated,
  memberName,
  onHome,
  onBoard,
  onEnterStudy,
  onLogout,
  onOpenLogin
}: SiteHeaderProps) {
  return (
    <header className="site-header">
      <button className="brand-button" type="button" onClick={onHome}>
        기억방 학습기
      </button>

      <nav className="site-nav" aria-label="상단 메뉴">
        <button
          className={active === "home" ? "site-nav__item site-nav__item--active" : "site-nav__item"}
          type="button"
          onClick={onHome}
        >
          홈
        </button>

        <button
          className={active === "board" ? "site-nav__item site-nav__item--active" : "site-nav__item"}
          type="button"
          onClick={onBoard}
        >
          공지/자유게시판
        </button>
      </nav>

      <div className="site-header__actions">
        {isAuthenticated ? (
          <>
            <button className="ghost-button ghost-button--light" type="button" onClick={onEnterStudy}>
              학습 시작
            </button>

            <button className="login-button" type="button" onClick={onLogout}>
              {memberName ? `${memberName}님 로그아웃` : "로그아웃"}
            </button>
          </>
        ) : (
          <button className="login-button" type="button" onClick={onOpenLogin}>
            <LogIn size={16} />
            로그인
          </button>
        )}
      </div>
    </header>
  );
}