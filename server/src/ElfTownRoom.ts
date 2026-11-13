import { Room, matchMaker, type Client } from 'colyseus';
import { Schema, MapSchema, defineTypes } from '@colyseus/schema';
import {
  CHAT_MAX_CHARS,
  CHAT_MIN_INTERVAL_MS,
  CODE_ALPHABET,
  CODE_LENGTH,
  DAY_SECONDS,
  EMOTES,
  EMOTE_MIN_INTERVAL_MS,
  JUMP_DURATION_MS,
  JUMP_MIN_INTERVAL_MS,
  MAX_PLAYERS,
  NIGHT_SECONDS,
  PLAYER_COLORS,
  ROOM_NAME,
  TICK_MS,
  chatRadius,
  emoteRadius,
  type Lang,
  type Phase,
} from '../../shared/nightfall2/constants.ts';
import { colliders, spawnPoint } from '../../shared/nightfall2/town.ts';
import { distance, step } from '../../shared/nightfall2/physics.ts';
import { decodeLook, encodeLook } from '../../shared/nightfall2/look.ts';
import type { ChatEvent, ChatMsg, EmoteEvent, EmoteMsg, InputMsg, JoinOptions, JumpEvent, NewsEvent, SystemEvent } from '../../shared/nightfall2/messages.ts';
import { composeNews, emptyStats, type DayStats } from './news.ts';

// `declare` keeps the fields off the instance so the Schema accessors (change tracking) stay in charge.
export class Player extends Schema {
  declare sessionId: string;
  declare name: string;
  declare color: string;
  declare look: string;
  declare x: number;
  declare y: number;
  declare z: number;
  declare rot: number;
  declare moving: boolean;
  declare host: boolean;
  declare alive: boolean;
}
defineTypes(Player, { sessionId: 'string', name: 'string', color: 'string', look: 'string', x: 'number', y: 'number', z: 'number', rot: 'number', moving: 'boolean', host: 'boolean', alive: 'boolean' });

export class TownState extends Schema {
  declare code: string;
  declare lang: Lang;
  declare phase: Phase;
  declare phaseEndsAt: number;
  declare day: number;
  declare players: MapSchema<Player>;
}
defineTypes(TownState, { code: 'string', lang: 'string', phase: 'string', phaseEndsAt: 'number', day: 'number', players: { map: Player } });

const BOXES = colliders();

async function uniqueCode(): Promise<string> {
  const rooms = await matchMaker.query({ name: ROOM_NAME });
  const taken = new Set(rooms.map((r) => r.metadata?.code as string | undefined));
  for (;;) {
    let code = '';
    for (let i = 0; i < CODE_LENGTH; i++) code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    if (!taken.has(code)) return code;
  }
}

function cleanName(raw: unknown): string {
  const s = String(raw ?? '').replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 16);
  return s || 'Elf';
}

export class ElfTownRoom extends Room<TownState> {
  maxClients = MAX_PLAYERS;
  private inputs = new Map<string, InputMsg>();
  private lastChatAt = new Map<string, number>();
  private lastEmoteAt = new Map<string, number>();
  private lastJumpAt = new Map<string, number>();
  private chatSeq = 0;
  private joinCount = 0;
  private stats: DayStats = emptyStats();
  private seed = Math.floor(Math.random() * 1000);

  async onCreate(options: JoinOptions) {
    const state = new TownState();
    state.code = await uniqueCode();
    // The creator's language is the lobby's language: the Crier speaks it to everyone.
    state.lang = options?.lang === 'en' ? 'en' : 'id';
    state.phase = 'lobby';
    state.phaseEndsAt = 0;
    state.day = 0;
    state.players = new MapSchema<Player>();
    this.setState(state);
    await this.setMetadata({ code: state.code, lang: state.lang });

    this.onMessage<InputMsg>('input', (client, msg) => {
      if (!msg || typeof msg.x !== 'number' || typeof msg.z !== 'number') return;
      const x = Math.max(-1, Math.min(1, msg.x));
      const z = Math.max(-1, Math.min(1, msg.z));
      this.inputs.set(client.sessionId, { x, z, rot: typeof msg.rot === 'number' ? msg.rot : 0 });
    });
    this.onMessage<ChatMsg>('chat', (client, msg) => this.chat(client, msg));
    this.onMessage<EmoteMsg>('emote', (client, msg) => this.emote(client, msg));
    this.onMessage('jump', (client) => this.jump(client));
    this.onMessage('start', (client) => this.hostOnly(client, () => this.beginPhase('day', 1)));
    this.onMessage('skip', (client) => this.hostOnly(client, () => this.nextPhase()));
    this.onMessage('lobby', (client) => this.hostOnly(client, () => this.toLobby()));

    this.setSimulationInterval((dt) => this.tick(dt), TICK_MS);
  }

  onJoin(client: Client, options: JoinOptions) {
    const p = new Player();
    const used = new Set(Array.from(this.state.players.values()).map((q) => q.color));
    const wanted = PLAYER_COLORS.includes(options?.color) ? options.color : '';
    p.sessionId = client.sessionId;
    p.name = cleanName(options?.name);
    p.color = wanted && !used.has(wanted) ? wanted : PLAYER_COLORS.find((c) => !used.has(c)) ?? PLAYER_COLORS[0];
    p.look = encodeLook(decodeLook(typeof options?.look === 'string' ? options.look : ''));
    const sp = spawnPoint(this.joinCount++);
    p.x = sp.x;
    p.y = 0;
    p.z = sp.z;
    p.rot = sp.rot;
    p.moving = false;
    p.alive = true;
    p.host = this.state.players.size === 0;
    this.state.players.set(client.sessionId, p);
    this.broadcast('system', { key: 'joined', name: p.name } satisfies SystemEvent, { except: client });
  }

  onLeave(client: Client) {
    const p = this.state.players.get(client.sessionId);
    if (!p) return;
    const wasHost = p.host;
    this.state.players.delete(client.sessionId);
    this.inputs.delete(client.sessionId);
    this.broadcast('system', { key: 'left', name: p.name } satisfies SystemEvent);
    if (wasHost) {
      const next = this.state.players.values().next().value as Player | undefined;
      if (next) {
        next.host = true;
        this.broadcast('system', { key: 'host', name: next.name } satisfies SystemEvent);
      }
    }
  }

  private hostOnly(client: Client, fn: () => void) {
    if (this.state.players.get(client.sessionId)?.host) fn();
  }

  private tick(dtMs: number) {
    const dt = dtMs / 1000;
    const now = Date.now();
    this.state.players.forEach((p, id) => {
      const inp = this.inputs.get(id);
      const moving = !!inp && Math.hypot(inp.x, inp.z) > 0.05;
      if (moving && inp) {
        const jumping = now - (this.lastJumpAt.get(id) ?? -1e9) < JUMP_DURATION_MS;
        const next = step({ x: p.x, y: p.y, z: p.z }, inp, dt, BOXES, jumping);
        this.stats.walked.set(id, (this.stats.walked.get(id) ?? 0) + Math.hypot(next.x - p.x, next.z - p.z));
        p.x = next.x;
        p.y = next.y;
        p.z = next.z;
        p.rot = inp.rot;
      }
      if (p.moving !== moving) p.moving = moving;
    });
    if (this.state.phase !== 'lobby' && now >= this.state.phaseEndsAt) this.nextPhase();
  }

  private beginPhase(phase: Phase, day = this.state.day) {
    this.state.phase = phase;
    this.state.day = day;
    this.state.phaseEndsAt = Date.now() + (phase === 'day' ? DAY_SECONDS : NIGHT_SECONDS) * 1000;
    this.broadcast('system', { key: phase === 'day' ? (day === 1 ? 'started' : 'day') : 'night', day } satisfies SystemEvent);
    if (phase === 'night') {
      // The Crier reads the day's gossip; the day's statistics start fresh at dawn.
      const names = new Map<string, string>();
      this.state.players.forEach((p, id) => names.set(id, p.name));
      const lines = composeNews(this.state.lang, day, names, this.stats, this.seed);
      this.broadcast('news', { day, lang: this.state.lang, lines } satisfies NewsEvent);
    } else {
      this.stats = emptyStats();
    }
  }

  private nextPhase() {
    if (this.state.phase === 'day') this.beginPhase('night');
    else if (this.state.phase === 'night') this.beginPhase('day', this.state.day + 1);
  }

  private toLobby() {
    this.state.phase = 'lobby';
    this.state.phaseEndsAt = 0;
    this.state.day = 0;
    this.stats = emptyStats();
    this.broadcast('system', { key: 'lobby' } satisfies SystemEvent);
  }

  /** Everyone within `radius` of `from` (the sender included). */
  private nearby(from: Player, radius: number): { client: Client; dist: number }[] {
    const out: { client: Client; dist: number }[] = [];
    for (const other of this.clients) {
      const to = this.state.players.get(other.sessionId);
      if (!to) continue;
      const dist = distance(from, to);
      if (dist <= radius) out.push({ client: other, dist });
    }
    return out;
  }

  /** Proximity chat: the server decides who is close enough, so distant players never receive the text. */
  private chat(client: Client, msg: ChatMsg) {
    const from = this.state.players.get(client.sessionId);
    if (!from) return;
    if (this.state.phase === 'night') {
      client.send('system', { key: 'hush' } satisfies SystemEvent); // nobody speaks at night
      return;
    }
    const text = String(msg?.text ?? '').replace(/\s+/g, ' ').trim().slice(0, CHAT_MAX_CHARS);
    if (!text) return;
    const now = Date.now();
    if (now - (this.lastChatAt.get(client.sessionId) ?? 0) < CHAT_MIN_INTERVAL_MS) return;
    this.lastChatAt.set(client.sessionId, now);
    this.stats.chats.set(client.sessionId, (this.stats.chats.get(client.sessionId) ?? 0) + 1);
    const id = ++this.chatSeq;
    for (const { client: other, dist } of this.nearby(from, chatRadius(this.state.phase))) {
      const ev: ChatEvent = { id, from: client.sessionId, name: from.name, color: from.color, text, dist: Math.round(dist * 10) / 10, at: now };
      other.send('chat', ev);
    }
  }

  /** Emotes follow the same proximity rule (a much smaller circle at night). */
  private emote(client: Client, msg: EmoteMsg) {
    const from = this.state.players.get(client.sessionId);
    if (!from) return;
    const id = Number(msg?.id);
    if (!Number.isInteger(id) || id < 0 || id >= EMOTES.length) return;
    const now = Date.now();
    if (now - (this.lastEmoteAt.get(client.sessionId) ?? 0) < EMOTE_MIN_INTERVAL_MS) return;
    this.lastEmoteAt.set(client.sessionId, now);
    this.stats.emotes.set(client.sessionId, (this.stats.emotes.get(client.sessionId) ?? 0) + 1);
    const ev: EmoteEvent = { from: client.sessionId, id, at: now };
    for (const { client: other } of this.nearby(from, emoteRadius(this.state.phase))) other.send('emote', ev);
  }

  /** Jumps are cosmetic; everyone sees them (they are visible from afar anyway). */
  private jump(client: Client) {
    const now = Date.now();
    if (now - (this.lastJumpAt.get(client.sessionId) ?? 0) < JUMP_MIN_INTERVAL_MS) return;
    this.lastJumpAt.set(client.sessionId, now);
    this.stats.jumps.set(client.sessionId, (this.stats.jumps.get(client.sessionId) ?? 0) + 1);
    this.broadcast('jump', { from: client.sessionId } satisfies JumpEvent, { except: client });
  }
}
