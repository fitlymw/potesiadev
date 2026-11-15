/** Message shapes between the Nightfall 2 client and server. */
import type { Lang } from './constants';

// client → server
export interface InputMsg { x: number; z: number; rot: number }
export interface ChatMsg { text: string }
export interface EmoteMsg { id: number }

// server → client
export interface ChatEvent {
  id: number;
  from: string; // sessionId
  name: string;
  color: string;
  text: string;
  /** metres from the recipient when it was sent */
  dist: number;
  at: number;
}
export interface EmoteEvent { from: string; id: number; at: number }
export interface JumpEvent { from: string }
/** The Town Crier's night bulletin; every client reads it aloud in the lobby's language. */
export interface NewsEvent { day: number; lang: Lang; lines: string[] }
export interface SystemEvent {
  key: 'joined' | 'left' | 'started' | 'day' | 'night' | 'lobby' | 'host' | 'hush' | 'needPlayers';
  name?: string;
  /** also carries the player count for `needPlayers` */
  day?: number;
}
/** Your own dealt role, sent only to you — it is never part of the shared room state. */
export interface RoleEvent { role: string }
/** The turn the Crier is giving you tonight: what to choose, in Nightfall Deception's own words. */
export interface TurnEvent {
  seat: number;
  kind: string;
  count: number;
  accept: number[];
  allowSelf: boolean;
  pool: 'alive' | 'dead' | 'seat';
  prompt: string;
  suspect: boolean;
  candidates: { seat: number; name: string }[];
}
/** What you choose on your turn. */
export interface NightActionMsg { targets: number[]; suspect?: number }
/** What you alone learned during the night. */
export interface ReportEvent { lines: string[] }

/** How the round was dealt: everyone may know the mix, nobody knows who holds what. */
export interface SetupEvent { players: number; luminaries: number; cursed: number; shadows: number; bosses: number }

export interface JoinOptions { name: string; color: string; look?: string; lang?: Lang }
export interface LobbyLookup { roomId: string; clients: number; maxClients: number; locked: boolean }
