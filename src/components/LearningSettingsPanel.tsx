import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import type { AudioTrackOption, RepeatMode } from "../types";
import {
  AUDIO_TRACK_OPTIONS,
  getTrackOptionLabel,
  REPEAT_MODES,
  reorderAudioTrack,
  type LearningOptions,
  type LearningStatus
} from "../utils/app";
import { WordCard } from "./WordCard";

type LearningSettingsPanelProps = {
  currentPageId: string;
  learningOptions: LearningOptions;
  learningStatus: LearningStatus;
  onMovePage: (direction: -1 | 1) => void;
  onOptionsChange: (updater: (previous: LearningOptions) => LearningOptions) => void;
  pageNumber: number;
  pageTitleText: string;
};

export function LearningSettingsPanel({
  currentPageId,
  learningOptions,
  learningStatus,
  onMovePage,
  onOptionsChange,
  pageNumber,
  pageTitleText
}: LearningSettingsPanelProps) {
  const isSessionActive = learningStatus === "playing" || learningStatus === "paused";

  return (
    <section className="mode-panel">
      <WordCard
        extra={
          <>
            <div className="learning-config-header">
              <div>
                <p className="panel-kicker">학습 모드</p>
                <h2>자동 학습 설정</h2>
              </div>
              <div className="page-chip">
                <span>{currentPageId}</span>
              </div>
            </div>

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

            <div className="learning-option-grid">
              <label className="toggle-field">
                <span>랜덤 순서</span>
                <button
                  className={learningOptions.random ? "toggle-button toggle-button--active" : "toggle-button"}
                  type="button"
                  onClick={() =>
                    onOptionsChange((previous) => ({
                      ...previous,
                      random: !previous.random
                    }))
                  }
                >
                  <Shuffle size={15} />
                  {learningOptions.random ? "켜짐" : "꺼짐"}
                </button>
              </label>

              <label className="form-field">
                <span>항목 간 간격(초)</span>
                <input
                  type="number"
                  min={0.5}
                  max={60}
                  value={learningOptions.intervalSeconds}
                  onChange={(event) =>
                    onOptionsChange((previous) => ({
                      ...previous,
                      intervalSeconds: Math.max(1, Number(event.target.value) || 1)
                    }))
                  }
                />
              </label>

              <label className="form-field">
                <span>반복 방식</span>
                <select
                  value={learningOptions.repeatMode}
                  onChange={(event) =>
                    onOptionsChange((previous) => ({
                      ...previous,
                      repeatMode: event.target.value as RepeatMode
                    }))
                  }
                >
                  {REPEAT_MODES.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </label>

              {learningOptions.repeatMode === "COUNT" && (
                <label className="form-field">
                  <span>반복 횟수</span>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={learningOptions.repeatCount}
                    onChange={(event) =>
                      onOptionsChange((previous) => ({
                        ...previous,
                        repeatCount: Math.max(1, Number(event.target.value) || 1)
                      }))
                    }
                  />
                </label>
              )}
            </div>

            <div className="audio-order-card">
              <strong>오디오 순서</strong>
              <div className="audio-order-grid">
                {learningOptions.audioOrder.map((track, index) => (
                  <label className="form-field" key={`${track}-${index}`}>
                    <span>{index + 1}차 재생</span>
                    <select
                      value={track}
                      onChange={(event) =>
                        onOptionsChange((previous) => ({
                          ...previous,
                          audioOrder: reorderAudioTrack(
                            previous.audioOrder,
                            index,
                            event.target.value as AudioTrackOption
                          )
                        }))
                      }
                    >
                      {AUDIO_TRACK_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {getTrackOptionLabel(option)}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ height: 10 }} />
            <article className="word-card word-card--empty">
              <strong>자동 학습 안내</strong>
              <p>설정을 변경하면 현재 선택한 자동 학습 옵션에 바로 반영됩니다.</p>
              <p>학습 시작·일시정지·재생·정지는 학습 화면에서 제어할 수 있습니다.</p>
            </article>
          </>
        }
      />
    </section>
  );
}