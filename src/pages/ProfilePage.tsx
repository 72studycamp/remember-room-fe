import { AppSidebar } from "../components/AppSidebar";

type ProfilePageProps = {
  isAuthenticated: boolean;
  memberName?: string;
  onHome: () => void;
  onEnterStudy: () => void;
  onBoard: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
};

export function ProfilePage({
  isAuthenticated,
  memberName,
  onHome,
  onEnterStudy,
  onBoard,
  onSettings,
  onProfile,
  onLogout,
  onOpenLogin
}: ProfilePageProps) {
  return (
    <main className="profile-page app-shell">
      <AppSidebar
        active="profile"
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

      <section className="profile-content">
        <article className="profile-card">
          <p className="profile-kicker">내 정보</p>
          <h1>프로필</h1>

          <div className="profile-field">
            <span>이름</span>
            <strong>{memberName ?? "게스트"}</strong>
          </div>

          <div className="profile-field">
            <span>닉네임</span>
            <strong>{memberName ?? "닉네임 미설정"}</strong>
          </div>

          <button className="profile-logout-button" type="button" onClick={isAuthenticated ? onLogout : onOpenLogin}>
            {isAuthenticated ? "로그아웃" : "로그인"}
          </button>
        </article>
      </section>
    </main>
  );
}