import type { ContentPage, HealthResponse } from "./types";

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
