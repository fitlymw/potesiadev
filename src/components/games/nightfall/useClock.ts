import { useEffect, useRef, useState } from 'react';

/**
 * Countdown for one private turn. Mount a fresh component per turn (use a
 * `key`) so the clock restarts. `onExpire` fires once when time is up.
 */
export function useTurnClock(totalSeconds: number, onExpire: () => void) {
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const expireRef = useRef(onExpire);
  const firedRef = useRef(false);
  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);
  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (!firedRef.current && (t - start) / 1000 >= totalSeconds) {
        firedRef.current = true;
        expireRef.current();
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [start, totalSeconds]);
  const elapsed = (now - start) / 1000;
  return { elapsed, remaining: Math.max(0, totalSeconds - elapsed) };
}

/** Day-phase countdown with pause, +1 minute and skip. */
export function useDayClock(totalSeconds: number, onExpire: () => void) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running, setRunning] = useState(true);
  const expireRef = useRef(onExpire);
  const firedRef = useRef(false);
  useEffect(() => {
    expireRef.current = onExpire;
  }, [onExpire]);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setRemaining((r) => {
        const next = Math.max(0, r - 1);
        if (next === 0 && !firedRef.current) {
          firedRef.current = true;
          window.setTimeout(() => expireRef.current(), 0);
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return {
    remaining,
    running,
    toggle: () => setRunning((r) => !r),
    addMinute: () => {
      firedRef.current = false;
      setRemaining((r) => r + 60);
    },
    skip: () => {
      if (firedRef.current) return;
      firedRef.current = true;
      setRemaining(0);
      window.setTimeout(() => expireRef.current(), 0);
    },
  };
}
