export type HealthResponse = {
  status: string;
};

export type Member = {
  id: number;
  externalId: string;
  displayName: string;
};

export type KakaoLoginUrlResponse = {
  loginUrl: string;
};

export type KakaoExchangeResponse = {
  provider: string;
  providerUserId: string;
  member: Member;
};

export type AudioUrls = {
  koreanUrl: string;
  englishUrl: string;
  memoryUrl: string;
};

export type AudioTrack = "KOREAN" | "ENGLISH" | "MEMORY";
export type AudioTrackOption = AudioTrack | "NONE";

export type RepeatMode = "ONCE" | "COUNT" | "UNTIL" | "FOREVER";

export type LabelPoint = {
  x: number;
  y: number;
};

export type ContentItem = {
  index: number;
  word: string;
  englishWord: string;
  koreanMeaning: string;
  labelPoint: LabelPoint;
  sentence: string;
  audio: AudioUrls;
};

export type ContentPage = {
  id: string;
  order: number;
  imageUrl: string;
  items: ContentItem[];
};

export type Progress = {
  pageId: string;
  completedItemCount: number;
  completedItemIndices?: number[];
  lastItemIndex: number;
  completed: boolean;
  celebrationShown?: boolean;
  updatedAt?: string;
};

export type SaveProgressPayload = {
  completedItemCount: number;
  completedItemIndices?: number[];
  lastItemIndex: number;
  completed: boolean;
  celebrationShown?: boolean;
};

export type LearningQueueItem = {
  track: AudioTrack;
  url: string;
};

export type LearningStep = {
  position: number;
  itemIndex: number;
  word: string;
  englishWord: string;
  koreanMeaning: string;
  sentence: string;
  labelPoint: LabelPoint;
  audio: AudioUrls;
  playQueue: LearningQueueItem[];
};

export type LearningSettings = {
  random: boolean;
  itemCount: number;
  intervalSeconds: number;
  repeatMode: RepeatMode;
  repeatCount: number;
  until: string | null;
  audioOrder: AudioTrack[];
  seed: number | null;
};

export type LearningSession = {
  sessionId: string;
  pageId: string;
  imageUrl: string;
  generatedAt: string;
  settings: LearningSettings;
  steps: LearningStep[];
};

export type CreateLearningSessionPayload = {
  pageId: string;
  random: boolean;
  repeatMode: RepeatMode;
  repeatCount?: number;
  until?: string;
  intervalSeconds: number;
  audioOrder: AudioTrack[];
};
