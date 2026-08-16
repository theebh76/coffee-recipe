"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A wall-clock brew timer.
 *
 * Elapsed time is derived from `performance.now()` rather than accumulated from
 * ticks, so the clock stays honest even if the tab is throttled or the render
 * loop drops frames — which matters when the number on screen is telling
 * someone when to stop pouring.
 */
export default function useBrewTimer(totalSeconds: number) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  // Wall-clock anchor: elapsed === (now - anchor) / 1000 while running.
  const anchorRef = useRef<number | null>(null);
  const frozenRef = useRef(0);

  const readNow = useCallback(() => {
    if (anchorRef.current == null) return frozenRef.current;
    return frozenRef.current + (performance.now() - anchorRef.current) / 1000;
  }, []);

  useEffect(() => {
    if (!running) return;

    let raf = 0;
    const tick = () => {
      const next = Math.min(totalSeconds, readNow());
      setElapsed(next);
      if (next >= totalSeconds) {
        setRunning(false);
        frozenRef.current = totalSeconds;
        anchorRef.current = null;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, totalSeconds, readNow]);

  const play = useCallback(() => {
    if (frozenRef.current >= totalSeconds) return;
    anchorRef.current = performance.now();
    setRunning(true);
  }, [totalSeconds]);

  const pause = useCallback(() => {
    frozenRef.current = readNow();
    anchorRef.current = null;
    setRunning(false);
    setElapsed(frozenRef.current);
  }, [readNow]);

  const reset = useCallback(() => {
    frozenRef.current = 0;
    anchorRef.current = null;
    setRunning(false);
    setElapsed(0);
  }, []);

  const seek = useCallback(
    (seconds: number) => {
      const target = Math.max(0, Math.min(totalSeconds, seconds));
      frozenRef.current = target;
      if (anchorRef.current != null) anchorRef.current = performance.now();
      setElapsed(target);
    },
    [totalSeconds],
  );

  return {
    elapsed,
    running,
    finished: elapsed >= totalSeconds,
    play,
    pause,
    reset,
    seek,
  };
}
