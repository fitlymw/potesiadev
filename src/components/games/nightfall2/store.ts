import { useSyncExternalStore } from 'react';
import type { Phase } from '../../../../shared/nightfall2/constants';
import type { ChatEvent, SystemEvent } from '../../../../shared/nightfall2/messages';

/** Slow-changing data React renders from. */
export interface Roster { id: string; name: string; color: string; host: boolean; alive: boolean }
export interface Notice { id: number; key: SystemEvent['key']; text: string; at: number }
export interface Nf2State {
  status: 'idle' | 'connecting' | 'lobby' | 'playing' | 'error';
  error: string;
  code: string;
  phase: Phase;
  phaseEndsAt: number;
  day: number;
  me: string;
  roster: Roster[];
  chat: ChatEvent[];
  notices: Notice[];
}

const initial: Nf2State = { status: 'idle', error: '', code: '', phase: 'lobby', phaseEndsAt: 0, day: 0, me: '', roster: [], chat: [], notices: [] };
let state: Nf2State = initial;
const subs = new Set<() => void>();

export const nf2 = {
  get: () => state,
  set(patch: Partial<Nf2State>) {
    state = { ...state, ...patch };
    subs.forEach((fn) => fn());
  },
  reset() {
    state = initial;
    positions.clear();
    subs.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    subs.add(fn);
    return () => { subs.delete(fn); };
  },
};

export function useNf2<T>(selector: (s: Nf2State) => T): T {
  return useSyncExternalStore(nf2.subscribe, () => selector(state), () => selector(state));
}

/**
 * Fast-changing data (20 Hz from the server) lives outside React: the 3D scene reads it
 * every frame, so a position change never re-renders the UI.
 */
export interface Pose { x: number; z: number; rot: number; moving: boolean }
export const positions = new Map<string, Pose>();

/** Movement input shared by the joystick, the keyboard and the local player: x right, y forward (−1..1). */
export const input = { x: 0, y: 0, keys: new Set<string>() };
/** Camera yaw (radians) the player can drag around; movement is relative to it. */
export const camera = { yaw: 0 };
/** Day/night blend (0 = noon, 1 = deep night), eased by the scene every frame. */
export const env = { night: 0 };
