import { Timer } from "lucide-react";
import { formatTimer } from "../utils/app";

type StopwatchPanelProps = {
  elapsedMs: number;
  laps: number[];
  onLap: () => void;
  onReset: () => void;
  onStart: () => void;
  onStop: () => void;
};

export function StopwatchPanel({ elapsedMs, laps, onLap, onReset, onStart, onStop }: StopwatchPanelProps) {
  return (
    <section className="mode-panel">
      <article className="mode-card">
        <h2>초시계</h2>
        <div className="stopwatch-wrap">    
          <div className="timer-face">
            <Timer size={18} />
            {formatTimer(elapsedMs)}
          </div>
          <div className="timer-actions">
            <button type="button" onClick={onStart}>
              시작
            </button>
            <button type="button" onClick={onStop}>
              종료
            </button>
            <button type="button" onClick={onLap}>
              랩
            </button>
            <button type="button" onClick={onReset}>
              초기화
            </button>
          </div>
          <div className="lap-list">
            {laps.length === 0 && <p>기록 없음</p>}
            {laps.map((lap, index) => (
              <div key={`${lap}-${index}`}>
                Lap {index + 1} {formatTimer(lap)}
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
