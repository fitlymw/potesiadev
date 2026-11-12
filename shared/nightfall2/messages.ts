/** Message shapes between the Nightfall 2 client and server. */

// client → server
export interface InputMsg { x: number; z: number; rot: number }
export interface ChatMsg { text: string }

// server → client
export interface ChatEvent {
  id: number;
  from: string; // sessionId
  name: string;
  color: string;
  text: string;
  /** metres from the recipient when it was sent */
  dist: number;
  whisper: boolean;
  at: number;
}
export interface SystemEvent { key: 'joined' | 'left' | 'started' | 'day' | 'night' | 'lobby' | 'host'; name?: string; day?: number }

export interface JoinOptions { name: string; color: string }
export interface LobbyLookup { roomId: string; clients: number; maxClients: number; locked: boolean }
