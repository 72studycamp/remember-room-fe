export type HealthResponse = {
  status: string;
};

export type AudioUrls = {
  koreanUrl: string;
  englishUrl: string;
  memoryUrl: string;
};

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
  lastItemIndex: number;
  completed: boolean;
  updatedAt?: string;
};

export type SaveProgressPayload = {
  completedItemCount: number;
  lastItemIndex: number;
  completed: boolean;
};
