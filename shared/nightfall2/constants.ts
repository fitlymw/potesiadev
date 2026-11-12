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

/**
 * Text chat is only delivered to players this close (metres) — by day. At night nobody may
 * speak: chat is refused and only the Town Crier is heard.
 */
export const CHAT_RADIUS_DAY = 10;
/** Emotes still work at night, but only this close. */
export const EMOTE_RADIUS_NIGHT = 4;
export const CHAT_MAX_CHARS = 80;
export const CHAT_MIN_INTERVAL_MS = 600;
export const EMOTE_MIN_INTERVAL_MS = 900;
export const JUMP_MIN_INTERVAL_MS = 650;
/** Name tags are hidden beyond this distance at night. */
export const NAME_RADIUS_NIGHT = 6;

export const DAY_SECONDS = 180;
export const NIGHT_SECONDS = 75;

export type Phase = 'lobby' | 'day' | 'night';
export type Lang = 'id' | 'en';

export const PLAYER_COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8',
  '#818cf8', '#c084fc', '#f472b6', '#a3e635', '#fbbf24', '#34d399',
  '#60a5fa', '#e879f9', '#fda4af',
];

/** Emote ids are the index in this list; the server only validates the index. */
export const EMOTES = [
  { id: 0, key: 'wave', emoji: '👋' },
  { id: 1, key: 'laugh', emoji: '😂' },
  { id: 2, key: 'cry', emoji: '😢' },
  { id: 3, key: 'angry', emoji: '😠' },
  { id: 4, key: 'think', emoji: '🤔' },
  { id: 5, key: 'point', emoji: '👉' },
  { id: 6, key: 'dance', emoji: '💃' },
  { id: 7, key: 'heart', emoji: '❤️' },
] as const;
export type EmoteKey = (typeof EMOTES)[number]['key'];
export const EMOTE_DURATION_MS = 2600;
export const JUMP_DURATION_MS = 620;

export function chatRadius(phase: Phase): number {
  return phase === 'night' ? 0 : CHAT_RADIUS_DAY;
}
export function emoteRadius(phase: Phase): number {
  return phase === 'night' ? EMOTE_RADIUS_NIGHT : CHAT_RADIUS_DAY;
}
