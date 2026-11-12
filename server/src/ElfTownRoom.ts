import { Room, matchMaker, type Client } from 'colyseus';
import { Schema, MapSchema, defineTypes } from '@colyseus/schema';
import {
  CHAT_MAX_CHARS,
  CHAT_MIN_INTERVAL_MS,
  CODE_ALPHABET,
  CODE_LENGTH,
  DAY_SECONDS,
  MAX_PLAYERS,
  NIGHT_SECONDS,
  PLAYER_COLORS,
  ROOM_NAME,
  TICK_MS,
  chatRadius,
  type Phase,
} from '../../shared/nightfall2/constants.ts';
import { colliders, spawnPoint } from '../../shared/nightfall2/town.ts';
import { distance, step } from '../../shared/nightfall2/physics.ts';
import type { ChatEvent, ChatMsg, InputMsg, JoinOptions, SystemEvent } from '../../shared/nightfall2/messages.ts';

// `declare` keeps the fields off the instance so the Schema accessors (change tracking) stay in charge.
export class Player extends Schema {
  declare sessionId: string;
  declare name: string;
  declare color: string;
  declare x: number;
  declare z: number;
  declare rot: number;
  declare moving: boolean;
  declare host: boolean;
  declare alive: boolean;
}
defineTypes(Player, { sessionId: 'string', name: 'string', color: 'string', x: 'number', z: 'number', rot: 'number', moving: 'boolean', host: 'boolean', alive: 'boolean' });

export class TownState extends Schema {
  declare code: string;
  declare phase: Phase;
  declare phaseEndsAt: number;
  declare day: number;
  declare players: MapSchema<Player>;
}
defineTypes(TownState, { code: 'string', phase: 'string', phaseEndsAt: 'number', day: 'number', players: { map: Player } });

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
  private chatSeq = 0;
  private joinCount = 0;

  async onCreate() {
    const state = new TownState();
    state.code = await uniqueCode();
    state.phase = 'lobby';
    state.phaseEndsAt = 0;
    state.day = 0;
    state.players = new MapSchema<Player>();
    this.setState(state);
    await this.setMetadata({ code: state.code });

    this.onMessage<InputMsg>('input', (client, msg) => {
      if (!msg || typeof msg.x !== 'number' || typeof msg.z !== 'number') return;
      const x = Math.max(-1, Math.min(1, msg.x));
      const z = Math.max(-1, Math.min(1, msg.z));
      this.inputs.set(client.sessionId, { x, z, rot: typeof msg.rot === 'number' ? msg.rot : 0 });
    });
    this.onMessage<ChatMsg>('chat', (client, msg) => this.chat(client, msg));
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
    const sp = spawnPoint(this.joinCount++);
    p.x = sp.x;
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
    this.state.players.forEach((p, id) => {
      const inp = this.inputs.get(id);
      const moving = !!inp && Math.hypot(inp.x, inp.z) > 0.05;
      if (moving && inp) {
        const next = step({ x: p.x, z: p.z }, inp, dt, BOXES);
        p.x = next.x;
        p.z = next.z;
        p.rot = inp.rot;
      }
      if (p.moving !== moving) p.moving = moving;
    });
    if (this.state.phase !== 'lobby' && Date.now() >= this.state.phaseEndsAt) this.nextPhase();
  }

  private beginPhase(phase: Phase, day = this.state.day) {
    this.state.phase = phase;
    this.state.day = day;
    this.state.phaseEndsAt = Date.now() + (phase === 'day' ? DAY_SECONDS : NIGHT_SECONDS) * 1000;
    this.broadcast('system', { key: phase === 'day' ? (day === 1 ? 'started' : 'day') : 'night', day } satisfies SystemEvent);
  }

  private nextPhase() {
    if (this.state.phase === 'day') this.beginPhase('night');
    else if (this.state.phase === 'night') this.beginPhase('day', this.state.day + 1);
  }

  private toLobby() {
    this.state.phase = 'lobby';
    this.state.phaseEndsAt = 0;
    this.state.day = 0;
    this.broadcast('system', { key: 'lobby' } satisfies SystemEvent);
  }

  /** Proximity chat: the server decides who is close enough, so distant players never receive the text. */
  private chat(client: Client, msg: ChatMsg) {
    const from = this.state.players.get(client.sessionId);
    if (!from) return;
    const text = String(msg?.text ?? '').replace(/\s+/g, ' ').trim().slice(0, CHAT_MAX_CHARS);
    if (!text) return;
    const now = Date.now();
    if (now - (this.lastChatAt.get(client.sessionId) ?? 0) < CHAT_MIN_INTERVAL_MS) return;
    this.lastChatAt.set(client.sessionId, now);
    const radius = chatRadius(this.state.phase);
    const whisper = this.state.phase === 'night';
    const id = ++this.chatSeq;
    for (const other of this.clients) {
      const to = this.state.players.get(other.sessionId);
      if (!to) continue;
      const dist = distance(from, to);
      if (dist > radius) continue;
      const ev: ChatEvent = { id, from: client.sessionId, name: from.name, color: from.color, text, dist: Math.round(dist * 10) / 10, whisper, at: now };
      other.send('chat', ev);
    }
  }
}
