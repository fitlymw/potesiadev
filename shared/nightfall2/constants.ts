/** Nightfall 2: Elf Town — numbers shared by the server and the client. */

export const ROOM_NAME = 'elf_town';
export const MAX_PLAYERS = 15;
export const CODE_LENGTH = 4;
/** Letters that are hard to confuse when read aloud. */
export const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export const TICK_MS = 50; // 20 Hz server simulation
export const INPUT_SEND_MS = 66; // ~15 Hz client → server
export const WALK_SPEED = 4.2; // m/s
export const PLAYER_RADIUS = 0.42;

/** Text chat is only delivered to players this close (metres). Night turns it into a whisper. */
export const CHAT_RADIUS_DAY = 10;
export const CHAT_RADIUS_NIGHT = 4;
export const CHAT_MAX_CHARS = 80;
export const CHAT_MIN_INTERVAL_MS = 600;
/** Name tags are hidden beyond this distance at night. */
export const NAME_RADIUS_NIGHT = 6;

export const DAY_SECONDS = 180;
export const NIGHT_SECONDS = 75;

export type Phase = 'lobby' | 'day' | 'night';

export const PLAYER_COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8',
  '#818cf8', '#c084fc', '#f472b6', '#a3e635', '#fbbf24', '#34d399',
  '#60a5fa', '#e879f9', '#fda4af',
];

export function chatRadius(phase: Phase): number {
  return phase === 'night' ? CHAT_RADIUS_NIGHT : CHAT_RADIUS_DAY;
}
