import { useEffect } from "react";
import { X } from "lucide-react";
import googleLoginImage from "../assets/google-login.png";
import kakaoIconImage from "../assets/kakao-icon.png";
import naverLoginImage from "../assets/naver-login.png";

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onKakaoLogin: () => void;
  onUnavailableLogin: (provider: string) => void;
};

export function LoginModal({ isOpen, onClose, onKakaoLogin, onUnavailableLogin }: LoginModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="login-backdrop" role="presentation">
      <section className="login-panel" aria-modal="true" role="dialog" aria-label="로그인">
        <button className="login-close" type="button" onClick={onClose} aria-label="로그인 닫기">
          <X size={18} />
        </button>

        <div className="login-visual">
          <p>기억방 학습기</p>
        </div>

        <button className="kakao-login" type="button" onClick={onKakaoLogin}>
          <img src={kakaoIconImage} alt="" />
          카카오로 로그인
        </button>

        <div className="login-divider">
          <span>또는</span>
        </div>

        <div className="social-login-row" aria-label="다른 로그인">
          <button type="button" aria-label="네이버 로그인" onClick={() => onUnavailableLogin("네이버")}>
            <img src={naverLoginImage} alt="" />
          </button>

          <span className="social-separator" aria-hidden="true" />

          <button type="button" aria-label="구글 로그인" onClick={() => onUnavailableLogin("구글")}>
            <img src={googleLoginImage} alt="" />
          </button>
        </div>
      </section>
    </div>
  );
}