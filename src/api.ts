import type {
  ContentPage,
  CreateLearningSessionPayload,
  HealthResponse,
  KakaoExchangeResponse,
  KakaoLoginUrlResponse,
  LearningSession
} from "./types";

const RAW_API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);
const API_BASE_URL = shouldUseDirectBackend(RAW_API_BASE_URL) ? RAW_API_BASE_URL : "";
const BACKEND_ORIGIN = normalizeBaseUrl(import.meta.env.VITE_BACKEND_ORIGIN) || RAW_API_BASE_URL;

function normalizeBaseUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "") ?? "";
}

function shouldUseDirectBackend(baseUrl: string) {
  if (!baseUrl) {
    return false;
  }

  if (typeof window === "undefined") {
    return true;
  }

  return !(window.location.protocol === "https:" && baseUrl.startsWith("http://"));
}

function toProxyableUrl(url: string) {
  if (!url || !BACKEND_ORIGIN) {
    return url;
  }

  try {
    const parsed = new URL(url);
    if (parsed.origin !== BACKEND_ORIGIN) {
      return url;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return url;
  }
}

function normalizeContentPage(page: ContentPage): ContentPage {
  return {
    ...page,
    imageUrl: toProxyableUrl(page.imageUrl),
    items: page.items.map((item) => ({
      ...item,
      audio: {
        koreanUrl: toProxyableUrl(item.audio.koreanUrl),
        englishUrl: toProxyableUrl(item.audio.englishUrl),
        memoryUrl: toProxyableUrl(item.audio.memoryUrl)
      }
    }))
  };
}

function normalizeLearningSession(session: LearningSession): LearningSession {
  const normalizedSteps = session.steps.map((step) => ({
    ...step,
    audio: {
      koreanUrl: toProxyableUrl(step.audio.koreanUrl),
      englishUrl: toProxyableUrl(step.audio.englishUrl),
      memoryUrl: toProxyableUrl(step.audio.memoryUrl)
    },
    playQueue: step.playQueue.map((queueItem) => ({
      ...queueItem,
      url: toProxyableUrl(queueItem.url)
    }))
  }));
  const anchorStep = normalizedSteps.find((step) => step.itemIndex === 0);
  const remainingSteps = normalizedSteps.filter((step) => step.itemIndex !== 0);
  const orderedSteps = anchorStep
    ? [anchorStep, ...remainingSteps].map((step, index) => ({
        ...step,
        position: index + 1
      }))
    : normalizedSteps;

  return {
    ...session,
    imageUrl: toProxyableUrl(session.imageUrl),
    steps: orderedSteps
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(`${response.status} ${response.statusText}${message ? `: ${message}` : ""}`);
  }

  return response.json() as Promise<T>;
}

export function getHealth() {
  return request<HealthResponse>("/actuator/health");
}

export function getContentWindow(pageId: string, forward = 1) {
  return request<ContentPage[]>(`/api/content/pages/${pageId}/window?forward=${forward}`).then((pages) =>
    pages.map(normalizeContentPage)
  );
}

export function getKakaoLoginUrl() {
  return request<KakaoLoginUrlResponse>("/api/auth/kakao/login-url");
}

export function exchangeKakaoCode(code: string) {
  return request<KakaoExchangeResponse>("/api/auth/kakao/exchange", {
    method: "POST",
    body: JSON.stringify({ code })
  });
}

export function createLearningSession(payload: CreateLearningSessionPayload) {
  return request<LearningSession>("/api/learning/sessions", {
    method: "POST",
    body: JSON.stringify(payload)
  }).then(normalizeLearningSession);
}
