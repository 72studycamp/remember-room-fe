import { useEffect, useState } from "react";

export function useStopwatch() {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const tick = window.setInterval(() => {
      setElapsedMs((previous) => previous + 1000);
    }, 1000);

    return () => window.clearInterval(tick);
  }, [isRunning]);

  function start() {
    setIsRunning(true);
  }

  function stop() {
    setIsRunning(false);
  }

  function pushLap() {
    setLaps((previous) => [elapsedMs, ...previous].slice(0, 10));
  }

  function reset() {
    setElapsedMs(0);
    setLaps([]);
    setIsRunning(false);
  }

  return {
    elapsedMs,
    isRunning,
    laps,
    pushLap,
    reset,
    start,
    stop
  };
}
