import { Client, type Room, getStateCallbacks } from 'colyseus.js';
import { ROOM_NAME } from '../../../../shared/nightfall2/constants';
import type { ChatEvent, InputMsg, LobbyLookup, SystemEvent } from '../../../../shared/nightfall2/messages';
import { nf2, positions, type Roster } from './store';

/**
 * Where the game server is, in order of preference:
 *  1. `?server=wss://…` in the URL (remembered) — handy for testing a tunnel without rebuilding
 *  2. VITE_NF2_SERVER at build time (production: the tunnel in front of the host PC)
 *  3. on a plain http page, the same host on port 2567 (local dev and LAN testing from a phone)
 * An https page cannot talk to a ws:// server, so there it stays offline until one of the first two is set.
 */
export function serverUrls(): { ws: string; http: string } | null {
  let override = '';
  try {
    const q = new URLSearchParams(location.search).get('server');
    if (q) localStorage.setItem('nf2-server', q);
    override = localStorage.getItem('nf2-server') ?? '';
  } catch { /* no storage */ }
  const env = import.meta.env.VITE_NF2_SERVER as string | undefined;
  const sameHost = location.protocol === 'http:' ? `ws://${location.hostname}:2567` : '';
  const ws = override || env || sameHost;
  if (!ws) return null;
  return { ws, http: ws.replace(/^ws/, 'http') };
}

export type LobbyErrorKind = 'offline' | 'not_found' | 'full' | 'failed';
export class LobbyError extends Error {
  kind: LobbyErrorKind;
  constructor(kind: LobbyErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

let client: Client | null = null;
let room: Room | null = null;
let noticeSeq = 0;
let noticeText: (ev: SystemEvent) => string = () => '';

export function setNoticeFormatter(fn: (ev: SystemEvent) => string) {
  noticeText = fn;
}

function getClient(): Client {
  const urls = serverUrls();
  if (!urls) throw new LobbyError('offline');
  if (!client) client = new Client(urls.ws);
  return client;
}

export async function createLobby(name: string, color: string): Promise<void> {
  nf2.set({ status: 'connecting', error: '' });
  try {
    bind(await getClient().create(ROOM_NAME, { name, color }));
  } catch (e) {
    fail(e);
  }
}

export async function joinLobby(code: string, name: string, color: string): Promise<void> {
  nf2.set({ status: 'connecting', error: '' });
  try {
    const urls = serverUrls();
    if (!urls) throw new LobbyError('offline');
    let res: Response;
    try {
      res = await fetch(`${urls.http}/lobby/${encodeURIComponent(code.trim().toUpperCase())}`);
    } catch {
      throw new LobbyError('offline');
    }
    if (res.status === 404) throw new LobbyError('not_found');
    const info = (await res.json()) as LobbyLookup;
    if (info.locked || info.clients >= info.maxClients) throw new LobbyError('full');
    bind(await getClient().joinById(info.roomId, { name, color }));
  } catch (e) {
    fail(e);
  }
}

function fail(e: unknown) {
  const kind = e instanceof LobbyError ? e.kind : 'failed';
  nf2.set({ status: 'error', error: kind });
}

function bind(r: Room) {
  room = r;
  positions.clear();
  const $ = getStateCallbacks(r);
  const syncRoster = () => {
    const roster: Roster[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.state.players.forEach((p: any, id: string) => roster.push({ id, name: p.name, color: p.color, host: p.host, alive: p.alive }));
    nf2.set({ roster });
  };
  const syncPhase = () => nf2.set({ phase: r.state.phase, phaseEndsAt: r.state.phaseEndsAt, day: r.state.day, code: r.state.code, status: r.state.phase === 'lobby' ? 'lobby' : 'playing' });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $(r.state).players.onAdd((p: any, id: string) => {
    positions.set(id, { x: p.x, z: p.z, rot: p.rot, moving: p.moving });
    syncRoster();
    $(p).onChange(() => {
      const pose = positions.get(id);
      if (pose) {
        pose.x = p.x;
        pose.z = p.z;
        pose.rot = p.rot;
        pose.moving = p.moving;
      }
    });
    $(p).listen('host', syncRoster);
    $(p).listen('alive', syncRoster);
    $(p).listen('name', syncRoster);
  });
  $(r.state).players.onRemove((_p: unknown, id: string) => {
    positions.delete(id);
    syncRoster();
  });
  $(r.state).listen('phase', syncPhase);
  $(r.state).listen('phaseEndsAt', syncPhase);
  $(r.state).listen('day', syncPhase);
  $(r.state).listen('code', syncPhase);

  r.onMessage<ChatEvent>('chat', (ev) => nf2.set({ chat: [...nf2.get().chat.slice(-79), ev] }));
  r.onMessage<SystemEvent>('system', (ev) => {
    const text = noticeText(ev);
    if (text) nf2.set({ notices: [...nf2.get().notices.slice(-5), { id: ++noticeSeq, key: ev.key, text, at: Date.now() }] });
  });
  r.onLeave(() => {
    room = null;
    if (nf2.get().status !== 'idle') nf2.set({ status: 'error', error: 'disconnected' });
  });
  r.onError(() => nf2.set({ status: 'error', error: 'failed' }));

  nf2.set({ me: r.sessionId });
  syncPhase();
  syncRoster();
}

export function sendInput(msg: InputMsg) {
  room?.send('input', msg);
}
export function sendChat(text: string) {
  room?.send('chat', { text });
}
export function hostAction(kind: 'start' | 'skip' | 'lobby') {
  room?.send(kind);
}
export function leaveLobby() {
  const r = room;
  room = null;
  nf2.reset();
  r?.leave();
}
