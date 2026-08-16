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
    const sync = () => {
      const next = Math.min(totalSeconds, readNow());
      setElapsed(next);
      if (next >= totalSeconds) {
        setRunning(false);
        frozenRef.current = totalSeconds;
        anchorRef.current = null;
        return true;
      }
      return false;
    };

    const tick = () => {
      if (sync()) return;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // rAF is suspended while the tab is hidden — if the phone dims mid-brew,
    // the clock would sit frozen on screen. The elapsed value is derived from
    // a wall-clock anchor, so a coarse interval keeps it honest in the
    // background, and we re-sync the moment the tab comes back into view.
    const interval = setInterval(sync, 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [running, totalSeconds, readNow]);

  // Keep the screen awake while a brew is running — a 3½ minute brew is long
  // enough for an iPhone to sleep, and you are looking at the dial, not
  // touching it.
  useEffect(() => {
    if (!running || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const acquire = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          void lock.release();
          return;
        }
        sentinel = lock;
      } catch {
        // Denied or unsupported — the brew still works, the screen just sleeps.
      }
    };

    void acquire();

    // iOS drops the lock whenever the tab is backgrounded; take it again.
    const onVisible = () => {
      if (document.visibilityState === "visible" && sentinel === null) void acquire();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void sentinel?.release();
      sentinel = null;
    };
  }, [running]);

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
