import type { ReactNode } from "react";

type WordCardProps = {
  indexLabel?: string;
  title?: string;
  englishWord?: string;
  meaning?: string;
  sentence?: string;
  extra?: ReactNode;
  actions?: ReactNode;
  titleBadges?: ReactNode;
};

export function WordCard({
  actions,
  englishWord,
  extra,
  indexLabel,
  meaning,
  sentence,
  title,
  titleBadges
}: WordCardProps) {
  return (
    <article className="word-card">
      {(title || englishWord || indexLabel) && (
        <div className="word-heading">
          {indexLabel && <span className="item-index">{indexLabel}</span>}

          <div className="word-heading__main">
            {title && <h2>{title}</h2>}

            {(englishWord || titleBadges) && (
              <div className="word-subtitle-row">
                {englishWord && <p>{englishWord}</p>}
                {titleBadges}
              </div>
            )}
          </div>
        </div>
      )}
      {extra}
      {meaning && <p className="meaning">{meaning}</p>}
      {sentence && <p className="sentence">{sentence}</p>}
    </article>
  );
}