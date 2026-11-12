import { Client, type Room, getStateCallbacks } from 'colyseus.js';
import { JUMP_DURATION_MS, ROOM_NAME, type Lang } from '../../../../shared/nightfall2/constants';
import type { ChatEvent, EmoteEvent, InputMsg, JoinOptions, JumpEvent, LobbyLookup, NewsEvent, SystemEvent } from '../../../../shared/nightfall2/messages';
import { emoteAnim, jumps, nf2, positions, type Roster } from './store';
import { sfxBell, sfxDawn, sfxEmote, sfxHush, sfxJump } from './sounds';
import { speakNews, stopSpeech } from './speech';

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

export async function createLobby(opts: JoinOptions & { lang: Lang }): Promise<void> {
  nf2.set({ status: 'connecting', error: '' });
  try {
    bind(await getClient().create(ROOM_NAME, opts));
  } catch (e) {
    fail(e);
  }
}

export async function joinLobby(code: string, opts: JoinOptions): Promise<void> {
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
    bind(await getClient().joinById(info.roomId, opts));
  } catch (e) {
    fail(e);
  }
}

function fail(e: unknown) {
  const kind = e instanceof LobbyError ? e.kind : 'failed';
  nf2.set({ status: 'error', error: kind });
}

function notice(ev: SystemEvent) {
  const text = noticeText(ev);
  if (text) nf2.set({ notices: [...nf2.get().notices.slice(-5), { id: ++noticeSeq, key: ev.key, text, at: Date.now() }] });
}

function bind(r: Room) {
  room = r;
  positions.clear();
  jumps.clear();
  emoteAnim.clear();
  const $ = getStateCallbacks(r);
  const syncRoster = () => {
    const roster: Roster[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    r.state.players.forEach((p: any, id: string) => roster.push({ id, name: p.name, color: p.color, look: p.look, host: p.host, alive: p.alive }));
    nf2.set({ roster });
  };
  const syncPhase = () => {
    const prev = nf2.get().phase;
    const phase = r.state.phase;
    nf2.set({ phase, phaseEndsAt: r.state.phaseEndsAt, day: r.state.day, code: r.state.code, lang: r.state.lang === 'en' ? 'en' : 'id', status: phase === 'lobby' ? 'lobby' : 'playing' });
    if (prev === 'night' && phase !== 'night') {
      stopSpeech();
      nf2.set({ crier: null });
      if (phase === 'day') sfxDawn();
    }
  };

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
    $(p).listen('look', syncRoster);
  });
  $(r.state).players.onRemove((_p: unknown, id: string) => {
    positions.delete(id);
    jumps.delete(id);
    emoteAnim.delete(id);
    syncRoster();
  });
  $(r.state).listen('phase', syncPhase);
  $(r.state).listen('phaseEndsAt', syncPhase);
  $(r.state).listen('day', syncPhase);
  $(r.state).listen('code', syncPhase);
  $(r.state).listen('lang', syncPhase);

  r.onMessage<ChatEvent>('chat', (ev) => nf2.set({ chat: [...nf2.get().chat.slice(-79), ev] }));
  r.onMessage<EmoteEvent>('emote', (ev) => {
    emoteAnim.set(ev.from, { id: ev.id, start: performance.now() });
    nf2.set({ emotes: { ...nf2.get().emotes, [ev.from]: { id: ev.id, at: Date.now() } } });
    if (ev.from !== r.sessionId) sfxEmote();
  });
  r.onMessage<JumpEvent>('jump', (ev) => jumps.set(ev.from, performance.now()));
  r.onMessage<NewsEvent>('news', (ev) => {
    nf2.set({ crier: { day: ev.day, lang: ev.lang, lines: ev.lines, index: -1 } });
    sfxBell();
    window.setTimeout(() => speakNews(ev.lines, ev.lang), 1200);
  });
  r.onMessage<SystemEvent>('system', (ev) => {
    if (ev.key === 'hush') sfxHush();
    notice(ev);
  });
  r.onLeave(() => {
    room = null;
    stopSpeech();
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
export function sendEmote(id: number) {
  room?.send('emote', { id });
}
/** Jump now (locally at once, then tell the others); ignored while already in the air. */
export function jump() {
  const me = nf2.get().me;
  if (!room || !me) return;
  const now = performance.now();
  if (now - (jumps.get(me) ?? -1e9) < JUMP_DURATION_MS) return;
  jumps.set(me, now);
  sfxJump();
  room.send('jump');
}
export function hostAction(kind: 'start' | 'skip' | 'lobby') {
  room?.send(kind);
}
export function leaveLobby() {
  const r = room;
  room = null;
  stopSpeech();
  nf2.reset();
  r?.leave();
}
