import type { CSSProperties } from "react";

type CelebrationModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  type?: "review" | "learning";
};

export function CelebrationModal({
  isOpen,
  onConfirm,
  type = "review"
}: CelebrationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="celebration-backdrop" role="presentation">
      <section
        className="celebration-modal"
        role="dialog"
        aria-modal="true"
        aria-label={type === "learning" ? "학습 완료" : "복습 완료"}
      >
        <div className="celebration-burst" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              className="celebration-piece"
              key={index}
              style={
                {
                  "--piece-angle": `${index * 20}deg`,
                  "--piece-delay": `${index * 40}ms`
                } as CSSProperties
              }
            />
          ))}
        </div>

        <strong>축하합니다</strong>

        <p>
          {type === "learning"
            ? "학습을 완료했습니다."
            : "복습을 완료했습니다."}
        </p>

        <button
          className="celebration-button"
          type="button"
          onClick={onConfirm}
        >
          확인
        </button>
      </section>
    </div>
  );
}