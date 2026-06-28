import type { StudyMode } from "../utils/app";

type ModeTabsProps = {
  studyMode: StudyMode;
  onChange: (mode: StudyMode) => void;
  onHome: () => void;
};

const tabs: Array<{ mode: StudyMode; label: string }> = [
  { mode: "learning", label: "학습" },
  { mode: "settings", label: "설정" },
  { mode: "review", label: "복습" },
  { mode: "stopwatch", label: "초시계" }
];

export function ModeTabs({ studyMode, onChange, onHome }: ModeTabsProps) {
  return (
    <section className="mode-tabs" aria-label="학습 모드">
      <button className="mode-tab" type="button" onClick={onHome}>
        홈
      </button>

      {tabs.map((tab) => (
        <button
          className={studyMode === tab.mode ? "mode-tab mode-tab--active" : "mode-tab"}
          key={tab.mode}
          type="button"
          onClick={() => onChange(tab.mode)}
        >
          {tab.label}
        </button>
      ))}
    </section>
  );
}