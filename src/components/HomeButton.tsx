import { House } from "lucide-react";

type HomeButtonProps = {
  onClick: () => void;
};

export function HomeButton({ onClick }: HomeButtonProps) {
  return (
    <button className="home-button" type="button" onClick={onClick} aria-label="홈으로 이동">
      <House size={16} />
      홈
    </button>
  );
}
