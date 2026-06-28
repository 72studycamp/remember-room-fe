import type { AudioTrack, AudioTrackOption, Progress, RepeatMode } from "../types";

export const FIRST_PAGE_ID = "A000";
export const LAST_PAGE_NUMBER = 9;
export const PROGRESS_STORAGE_KEY = "remember-room-progress";
export const AUTH_STORAGE_KEY = "remember-room-authenticated";
export const MEMBER_STORAGE_KEY = "remember-room-member";
export const AUDIO_TRACKS: AudioTrack[] = ["KOREAN", "ENGLISH", "MEMORY"];
export const AUDIO_TRACK_OPTIONS: AudioTrackOption[] = ["KOREAN", "ENGLISH", "MEMORY", "NONE"];
export const REPEAT_MODES: Array<{ value: RepeatMode; label: string }> = [
  { value: "ONCE", label: "1회" },
  { value: "COUNT", label: "횟수 반복" },
  { value: "UNTIL", label: "시간 반복" },
  { value: "FOREVER", label: "무한 반복" }
];

export type ImageSize = {
  width: number;
  height: number;
};

export type BoxSize = {
  width: number;
  height: number;
};

export type MarkerPosition = {
  px: number;
  py: number;
};

export type StudyMode = "learning" | "settings" | "review" | "stopwatch";
export type SurfaceView = "home" | "board" | "profile";
export type LearningStatus = "idle" | "starting" | "playing" | "paused" | "stopped" | "completed";
export type LearningOptions = {
  random: boolean;
  intervalSeconds: number;
  repeatMode: RepeatMode;
  repeatCount: number;
  until: string;
  audioOrder: AudioTrackOption[];
};

export const learningSections = [
  { id: "A000-A009", title: "A 구역", range: "A000-A009", state: "학습 가능" },
  { id: "A010-A019", title: "B 구역", range: "A010-A019", state: "준비 중" },
  { id: "A020-A029", title: "C 구역", range: "A020-A029", state: "준비 중" },
  { id: "A030-A039", title: "D 구역", range: "A030-A039", state: "준비 중" },
  { id: "A040-A049", title: "E 구역", range: "A040-A049", state: "준비 중" },
  { id: "A050-A059", title: "F 구역", range: "A050-A059", state: "준비 중" }
] as const;

export const boardSections = ["공지사항", "업데이트", "자유게시판", "질문답변"] as const;

export const landingHighlights = [
  {
    title: "이미지 기반 암기",
    description: "한 장의 장면 안에 단어와 문장을 묶어서 위치 기억과 회화를 함께 익힙니다."
  },
  {
    title: "자동 오디오 학습",
    description: "학습 세션을 시작하면 오디오 순서와 간격에 맞춰 step이 자동으로 재생됩니다."
  },
  {
    title: "복습과 학습 분리",
    description: "직접 클릭하며 확인하는 복습 화면과 수면 반복용 학습 화면을 분리해서 유지합니다."
  }
] as const;

export const landingSteps = [
  "복습 모드는 이미지 위 마커를 누르며 단어와 문장을 직접 확인합니다.",
  "학습 모드는 페이지와 반복 방식을 고른 뒤 자동 재생으로 이어갑니다.",
  "오디오 순서와 반복 조건을 바꿔 수면 반복 학습 흐름에 맞출 수 있습니다."
] as const;

export function toPageId(pageNumber: number) {
  return `A${String(pageNumber).padStart(3, "0")}`;
}

export function getPageNumber(pageId: string) {
  return Number(pageId.replace("A", ""));
}

export function getSavedIndex(progress?: Progress) {
  if (!progress || progress.completedItemCount <= 0 || progress.lastItemIndex < 0) {
    return 0;
  }

  return Math.min(progress.lastItemIndex, 9);
}

export function getCompletedIndices(progress?: Progress) {
  if (!progress) {
    return [];
  }

  if (progress.completedItemIndices && progress.completedItemIndices.length > 0) {
    return [...new Set(progress.completedItemIndices)]
      .filter((index) => index >= 0 && index <= 9)
      .sort((a, b) => a - b);
  }

  return Array.from({ length: Math.max(0, Math.min(progress.completedItemCount, 10)) }, (_, index) => index);
}

export function loadStoredProgress() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as Record<string, Progress>;
  } catch {
    return {};
  }
}

export function loadStoredFlag(key: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

export function formatTimer(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export function formatDateTimeInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatOffset(date: Date) {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteMinutes = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteMinutes / 60)).padStart(2, "0");
  const minutes = String(absoluteMinutes % 60).padStart(2, "0");
  return `${sign}${hours}:${minutes}`;
}

export function toOffsetDateTime(value: string) {
  const date = new Date(value);
  const normalized = value.length === 16 ? `${value}:00` : value;
  return `${normalized}${formatOffset(date)}`;
}

export function createDefaultUntilValue() {
  const date = new Date();
  date.setHours(date.getHours() + 1, 0, 0, 0);
  return formatDateTimeInput(date);
}

export function getTrackLabel(track: AudioTrack) {
  switch (track) {
    case "KOREAN":
      return "한국어";
    case "ENGLISH":
      return "영어";
    case "MEMORY":
      return "기억문장";
  }
}

export function getTrackOptionLabel(track: AudioTrackOption) {
  if (track === "NONE") {
    return "없음";
  }

  return getTrackLabel(track);
}

export function formatStepNumber(pageId: string, itemIndex: number) {
  if (itemIndex === 0) {
    return String(getPageNumber(pageId) * 10);
  }

  return String(itemIndex);
}

export function getRepeatSummary(
  repeatMode: RepeatMode,
  repeatCount: number,
  until: string,
  cycle: number,
  status: LearningStatus
) {
  if (status === "completed") {
    return "학습 종료";
  }

  switch (repeatMode) {
    case "ONCE":
      return "1회 진행";
    case "COUNT":
      return `${cycle}/${repeatCount}회차`;
    case "UNTIL":
      return until ? `${until.replace("T", " ")} 까지 반복` : "시간 반복";
    case "FOREVER":
      return "중지할 때까지 반복";
  }
}

export function reorderAudioTrack(order: AudioTrackOption[], slotIndex: number, nextTrack: AudioTrackOption) {
  const nextOrder = [...order];
  const duplicateIndex = nextOrder.findIndex((track, index) => track === nextTrack && index !== slotIndex);
  if (nextTrack !== "NONE" && duplicateIndex >= 0) {
    [nextOrder[slotIndex], nextOrder[duplicateIndex]] = [nextOrder[duplicateIndex], nextOrder[slotIndex]];
    return nextOrder;
  }

  nextOrder[slotIndex] = nextTrack;
  return nextOrder;
}

export function getMarkerPosition(
  x: number,
  y: number,
  shellSize: BoxSize | null,
  imageSize: ImageSize | null
): MarkerPosition {
  const fallbackShellSize = shellSize ?? imageSize ?? { width: 1, height: 1 };
  const fallbackImageSize = imageSize ?? fallbackShellSize;
  const scale = Math.min(
    fallbackShellSize.width / fallbackImageSize.width,
    fallbackShellSize.height / fallbackImageSize.height
  );
  const renderedWidth = fallbackImageSize.width * scale;
  const renderedHeight = fallbackImageSize.height * scale;
  const offsetX = (fallbackShellSize.width - renderedWidth) / 2;
  const offsetY = (fallbackShellSize.height - renderedHeight) / 2;

  return {
    px: offsetX + x * scale,
    py: offsetY + y * scale
  };
}
