import type { ReactNode } from "react";

type ProgressCardProps = {
  metaLabel: string;
  metaValue: string;
  progressPercent?: number;
  children?: ReactNode;
};

export function ProgressCard({ metaLabel, metaValue, progressPercent, children }: ProgressCardProps) {
  return (
    <article className="progress-card">
      <div className="progress-meta">
        <span>{metaLabel}</span>
        <strong>{metaValue}</strong>
      </div>
      {typeof progressPercent === "number" && (
        <div className="progress-track" aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      )}
      {children}
    </article>
  );
}
