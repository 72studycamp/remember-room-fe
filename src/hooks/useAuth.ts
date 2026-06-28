import { useEffect, useState } from "react";
import { exchangeKakaoCode, getKakaoLoginUrl } from "../api";
import type { Member } from "../types";
import { AUTH_STORAGE_KEY, loadStoredFlag } from "../utils/app";

const MEMBER_STORAGE_KEY = "remember-room-member";

function loadStoredMember() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(MEMBER_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Member) : null;
  } catch {
    return null;
  }
}

type UseAuthArgs = {
  onError: (message: string | null) => void;
  onLoginSuccess: (member: Member) => void;
};

export function useAuth({ onError, onLoginSuccess }: UseAuthArgs) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => loadStoredFlag(AUTH_STORAGE_KEY));
  const [member, setMember] = useState<Member | null>(() => loadStoredMember());
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAuthProcessing, setIsAuthProcessing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, String(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (member) {
      window.localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(member));
      return;
    }

    window.localStorage.removeItem(MEMBER_STORAGE_KEY);
  }, [member]);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname !== "/auth/kakao/callback") {
      return;
    }

    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      onError("카카오 로그인 인가코드를 확인하지 못했습니다.");
      window.history.replaceState({}, "", "/");
      return;
    }

    window.history.replaceState({}, "", "/");
    setIsAuthProcessing(true);
    onError(null);

    void exchangeKakaoCode(code)
      .then((response) => {
        setMember(response.member);
        setIsAuthenticated(true);
        setIsLoginOpen(false);
        onLoginSuccess(response.member);
      })
      .catch((cause) => {
        onError(cause instanceof Error ? cause.message : "카카오 로그인 처리에 실패했습니다.");
      })
      .finally(() => {
        setIsAuthProcessing(false);
      });
  }, [onError, onLoginSuccess]);

  async function handleKakaoLogin() {
    onError(null);
    try {
      const response = await getKakaoLoginUrl();
      window.location.assign(response.loginUrl);
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "카카오 로그인 URL을 불러오지 못했습니다.");
    }
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setMember(null);
    setIsLoginOpen(false);
  }

  return {
    handleKakaoLogin,
    handleLogout,
    isAuthenticated,
    isAuthProcessing,
    isLoginOpen,
    member,
    setIsLoginOpen
  };
}
