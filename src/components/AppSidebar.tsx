type AppSidebarProps = {
  active: "home" | "study" | "review" | "board" | "settings" | "profile";
  memberName?: string;
  isAuthenticated: boolean;
  onHome: () => void;
  onEnterStudy: () => void;
  onBoard: () => void;
  onSettings: () => void;
  onProfile: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
};

const menuItems = [
  { key: "home", label: "홈", icon: "🏠" },
  { key: "study", label: "학습", icon: "📘" },
  { key: "review", label: "복습", icon: "💪" },
  { key: "board", label: "게시판", icon: "📋" },
  { key: "settings", label: "설정", icon: "⚙️" },
  { key: "profile", label: "프로필", icon: "👤" }
] as const;

export function AppSidebar({
  active,
  memberName,
  isAuthenticated,
  onHome,
  onEnterStudy,
  onBoard,
  onSettings,
  onProfile,
  onLogout,
  onOpenLogin
}: AppSidebarProps) {
  const handleClick = (key: AppSidebarProps["active"]) => {
    if (key === "home") onHome();
    if (key === "study") onEnterStudy();
    if (key === "board") onBoard();
    if (key === "settings") onSettings();
    if (key === "profile") onProfile();
  };

  return (
    <aside className="app-sidebar">
      <button className="app-sidebar__brand" type="button" onClick={onHome}>
        기억방
      </button>

      <nav className="app-sidebar__nav" aria-label="메인 메뉴">
        {menuItems.map((item) => (
          <button
            className={active === item.key ? "app-sidebar__item app-sidebar__item--active" : "app-sidebar__item"}
            key={item.key}
            type="button"
            onClick={() => handleClick(item.key)}
          >
            <span className="app-sidebar__icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

    </aside>
  );
}