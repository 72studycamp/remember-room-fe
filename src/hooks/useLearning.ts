import { useCallback, useEffect, useRef, useState } from "react";
import { createLearningSession } from "../api";
import type { AudioTrack, CreateLearningSessionPayload, LearningSession } from "../types";
import {
  createDefaultUntilValue,
  getRepeatSummary,
  getTrackLabel,
  reorderAudioTrack,
  toOffsetDateTime,
  type LearningOptions,
  type LearningStatus
} from "../utils/app";

type UseLearningArgs = {
  currentPageId: string;
  ensurePageLoaded: (pageId: string) => Promise<void>;
  onCurrentPageChange: (pageId: string) => void;
  onStepItemChange: (itemIndex: number) => void;
};

export function useLearning({
  currentPageId,
  ensurePageLoaded,
  onCurrentPageChange,
  onStepItemChange
}: UseLearningArgs) {
  const [learningOptions, setLearningOptions] = useState<LearningOptions>({
    random: true,
    intervalSeconds: 3,
    repeatMode: "ONCE",
    repeatCount: 3,
    until: createDefaultUntilValue(),
    audioOrder: ["KOREAN", "ENGLISH", "MEMORY"]
  });
  const [learningSession, setLearningSession] = useState<LearningSession | null>(null);
  const [learningStatus, setLearningStatus] = useState<LearningStatus>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentCycle, setCurrentCycle] = useState(1);
  const learningRunIdRef = useRef(0);
  const learningPauseRef = useRef(false);
  const learningAudioRef = useRef<HTMLAudioElement | null>(null);

  const stopLearningPlayback = useCallback((nextStatus: LearningStatus = "stopped") => {
    learningRunIdRef.current += 1;
    learningPauseRef.current = false;
    const activeAudio = learningAudioRef.current;
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }
    learningAudioRef.current = null;
    setLearningStatus(nextStatus);
  }, []);

  const waitForPauseRelease = useCallback(async (runId: number) => {
    while (runId === learningRunIdRef.current && learningPauseRef.current) {
      await new Promise((resolve) => window.setTimeout(resolve, 120));
    }
  }, []);

  const playLearningAudio = useCallback(
    async (url: string, runId: number) => {
      if (runId !== learningRunIdRef.current) {
        return;
      }

      const previousAudio = learningAudioRef.current;
      if (previousAudio) {
        previousAudio.pause();
        previousAudio.currentTime = 0;
      }

      const audio = new Audio(url);
      audio.preload = "auto";
      learningAudioRef.current = audio;

      await waitForPauseRelease(runId);
      if (runId !== learningRunIdRef.current) {
        return;
      }

      await new Promise<void>((resolve, reject) => {
        const cleanup = () => {
          audio.removeEventListener("ended", handleEnded);
          audio.removeEventListener("error", handleError);
        };

        const handleEnded = () => {
          cleanup();
          resolve();
        };

        const handleError = () => {
          cleanup();
          reject(new Error("오디오 재생에 실패했습니다."));
        };

        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("error", handleError);

        audio.play().catch((cause) => {
          cleanup();
          reject(cause);
        });
      });

      if (learningAudioRef.current === audio) {
        learningAudioRef.current = null;
      }
    },
    [waitForPauseRelease]
  );

  const waitForInterval = useCallback(
    async (milliseconds: number, runId: number) => {
      let remaining = milliseconds;
      let startedAt = Date.now();

      while (remaining > 0 && runId === learningRunIdRef.current) {
        if (learningPauseRef.current) {
          remaining -= Date.now() - startedAt;
          await waitForPauseRelease(runId);
          startedAt = Date.now();
          continue;
        }

        const waitTime = Math.min(remaining, 150);
        await new Promise((resolve) => window.setTimeout(resolve, waitTime));
        remaining -= waitTime;
      }
    },
    [waitForPauseRelease]
  );

  const shouldContinueLearning = useCallback((session: LearningSession, cycle: number) => {
    const { repeatMode, repeatCount, until } = session.settings;

    switch (repeatMode) {
      case "ONCE":
        return false;
      case "COUNT":
        return cycle < Math.max(1, repeatCount);
      case "UNTIL":
        return until ? new Date() < new Date(until) : false;
      case "FOREVER":
        return true;
    }
  }, []);

  const runLearningSession = useCallback(
    async (session: LearningSession) => {
      const runId = learningRunIdRef.current;
      const intervalMs = Math.max(0, session.settings.intervalSeconds) * 1000;
      let cycle = 1;

      setLearningStatus("playing");
      setCurrentCycle(1);
      setCurrentStepIndex(0);

      while (runId === learningRunIdRef.current) {
        for (let stepIndex = 0; stepIndex < session.steps.length; stepIndex += 1) {
          const step = session.steps[stepIndex];
          setCurrentCycle(cycle);
          setCurrentStepIndex(stepIndex);
          onStepItemChange(step.itemIndex);

          await waitForPauseRelease(runId);
          if (runId !== learningRunIdRef.current) {
            return;
          }

          for (const queueItem of step.playQueue) {
            await playLearningAudio(queueItem.url, runId);
            if (runId !== learningRunIdRef.current) {
              return;
            }
          }

          const hasNextStep = stepIndex < session.steps.length - 1;
          const hasNextCycle = shouldContinueLearning(session, cycle);
          if ((hasNextStep || hasNextCycle) && intervalMs > 0) {
            await waitForInterval(intervalMs, runId);
          }
          if (runId !== learningRunIdRef.current) {
            return;
          }
        }

        if (!shouldContinueLearning(session, cycle)) {
          break;
        }

        cycle += 1;
      }

      if (runId === learningRunIdRef.current) {
        stopLearningPlayback("completed");
      }
    },
    [onStepItemChange, playLearningAudio, shouldContinueLearning, stopLearningPlayback, waitForInterval, waitForPauseRelease]
  );

  useEffect(() => {
    return () => {
      stopLearningPlayback("stopped");
    };
  }, [stopLearningPlayback]);

  async function handleStartLearning() {
    const payload: CreateLearningSessionPayload = {
      pageId: currentPageId,
      random: learningOptions.random,
      repeatMode: learningOptions.repeatMode,
      intervalSeconds: Math.max(1, learningOptions.intervalSeconds),
      audioOrder: learningOptions.audioOrder.filter((track): track is AudioTrack => track !== "NONE")
    };

    if (learningOptions.repeatMode === "COUNT") {
      payload.repeatCount = Math.max(1, learningOptions.repeatCount);
    }

    if (learningOptions.repeatMode === "UNTIL" && learningOptions.until) {
      payload.until = toOffsetDateTime(learningOptions.until);
    }

    stopLearningPlayback("starting");

    try {
      const session = await createLearningSession(payload);
      await ensurePageLoaded(session.pageId);

      onCurrentPageChange(session.pageId);
      setLearningSession(session);
      setCurrentStepIndex(0);
      setCurrentCycle(1);
      onStepItemChange(session.steps[0]?.itemIndex ?? 0);

      if (session.steps.length === 0) {
        setLearningStatus("completed");
        return;
      }

      learningRunIdRef.current += 1;
      learningPauseRef.current = false;
      void runLearningSession(session);
    } catch (cause) {
      setLearningStatus("idle");
      throw cause;
    }
  }

  function handlePauseLearning() {
    learningPauseRef.current = true;
    const activeAudio = learningAudioRef.current;
    if (activeAudio) {
      activeAudio.pause();
    }
    setLearningStatus("paused");
  }

  function handleResumeLearning() {
    learningPauseRef.current = false;
    const activeAudio = learningAudioRef.current;
    if (activeAudio) {
      void activeAudio.play();
    }
    setLearningStatus("playing");
  }

  function resetLearningPageState() {
    setLearningSession(null);
    setCurrentStepIndex(0);
    setCurrentCycle(1);
  }

  return {
    currentCycle,
    currentStepIndex,
    handlePauseLearning,
    handleResumeLearning,
    handleStartLearning,
    learningOptions,
    learningSession,
    learningStatus,
    resetLearningPageState,
    setLearningOptions,
    stopLearningPlayback
  };
}

export { createDefaultUntilValue, getRepeatSummary, getTrackLabel, reorderAudioTrack };
