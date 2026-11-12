import { useSyncExternalStore } from 'react';

/** A half-second wall clock as an external store, so timers and expiring bubbles re-render without effects. */
const STEP = 500;
const subs = new Set<() => void>();
let timer: number | undefined;

function subscribe(fn: () => void) {
  subs.add(fn);
  if (timer === undefined) timer = window.setInterval(() => subs.forEach((f) => f()), STEP);
  return () => {
    subs.delete(fn);
    if (subs.size === 0 && timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}
const snapshot = () => Math.floor(Date.now() / STEP) * STEP;

export function useNow(): number {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
