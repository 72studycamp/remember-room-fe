import type { ContentPage, HealthResponse } from "./types";

const API_BASE_URL = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

function normalizeBaseUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "") ?? "";
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
  return request<ContentPage[]>(`/api/content/pages/${pageId}/window?forward=${forward}`);
}
