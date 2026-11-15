import { useSyncExternalStore } from 'react';
import type { Lang, Phase } from '../../../../shared/nightfall2/constants';
import type { ChatEvent, SetupEvent, SystemEvent } from '../../../../shared/nightfall2/messages';

/** Slow-changing data React renders from. */
export interface Roster { id: string; name: string; color: string; look: string; host: boolean; alive: boolean; ready: boolean }
export interface Notice { id: number; key: SystemEvent['key']; text: string; at: number }
export interface Crier { day: number; lang: Lang; lines: string[]; index: number }
export interface Nf2State {
  status: 'idle' | 'connecting' | 'lobby' | 'playing' | 'error';
  error: string;
  code: string;
  lang: Lang;
  phase: Phase;
  phaseEndsAt: number;
  day: number;
  me: string;
  roster: Roster[];
  chat: ChatEvent[];
  notices: Notice[];
  /** latest emote per player (for the overhead emoji) */
  emotes: Record<string, { id: number; at: number }>;
  crier: Crier | null;
  /** Your own dealt role (never anyone else's), and how the round was dealt. */
  myRole: string | null;
  setup: SetupEvent | null;
  roundLive: boolean;
}

const initial: Nf2State = { status: 'idle', error: '', code: '', lang: 'id', phase: 'lobby', phaseEndsAt: 0, day: 0, me: '', roster: [], chat: [], notices: [], emotes: {}, crier: null, myRole: null, setup: null, roundLive: false };
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
    jumps.clear();
    emoteAnim.clear();
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
 * Fast-changing data (20 Hz from the server, per-frame animation) lives outside React: the 3D
 * scene reads it every frame, so a position change never re-renders the UI.
 */
export interface Pose { x: number; y: number; z: number; rot: number; moving: boolean }
export const positions = new Map<string, Pose>();
/** performance.now() of each player's last jump */
export const jumps = new Map<string, number>();
/** emote id + performance.now() start, per player */
export const emoteAnim = new Map<string, { id: number; start: number }>();

/** Movement input shared by the joystick, the keyboard and the local player: x right, y forward (−1..1). */
export const input = { x: 0, y: 0, keys: new Set<string>() };
/** Camera yaw (radians) the player can drag around; movement is relative to it. */
export const camera = { yaw: 0 };
/** Day/night blend (0 = noon, 1 = deep night), eased by the scene every frame. */
export const env = { night: 0 };
/** Which house footprint the local player stands in (−1 outside): its roof is hidden. */
export const view = { house: -1 };
