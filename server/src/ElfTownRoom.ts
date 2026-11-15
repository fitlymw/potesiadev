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
import { colliders, houseAt, nightSeat, spawnPoint } from '../../shared/nightfall2/town.ts';
import { distance, step } from '../../shared/nightfall2/physics.ts';
import { decodeLook, encodeLook } from '../../shared/nightfall2/look.ts';
import type { ChatEvent, ChatMsg, EmoteEvent, EmoteMsg, InputMsg, JoinOptions, JumpEvent, NewsEvent, RoleEvent, SetupEvent, SystemEvent } from '../../shared/nightfall2/messages.ts';
import { composeNews, emptyStats, type DayStats } from './news.ts';
// Nightfall Deception's own dealer and role book, so the mix is exactly the one the first game uses
import { NF_MAX_PLAYERS, NF_MIN_PLAYERS, dealRoles, setupFor } from '@/lib/party/nightfall';
import type { RoleId } from '@/data/nightfallRoles';

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
  /** Pressed "end the phase". Public on purpose: everyone sees who is ready. */
  declare ready: boolean;
  /** Sitting in the night circle: the town gathers and nobody wanders off. */
  declare seated: boolean;
}
defineTypes(Player, { sessionId: 'string', name: 'string', color: 'string', look: 'string', x: 'number', y: 'number', z: 'number', rot: 'number', moving: 'boolean', host: 'boolean', alive: 'boolean', ready: 'boolean', seated: 'boolean' });

export class TownState extends Schema {
  declare code: string;
  declare lang: Lang;
  declare phase: Phase;
  declare phaseEndsAt: number;
  declare day: number;
  /** A round with dealt roles is in progress (the lobby is just the town). */
  declare roundLive: boolean;
  declare players: MapSchema<Player>;
}
defineTypes(TownState, { code: 'string', lang: 'string', phase: 'string', phaseEndsAt: 'number', day: 'number', roundLive: 'boolean', players: { map: Player } });

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
  /** sessionId → dealt role. Server-side only; never part of the synchronised state. */
  private roles = new Map<string, RoleId>();
  private seed = Math.floor(Math.random() * 1000);

  async onCreate(options: JoinOptions) {
    const state = new TownState();
    state.code = await uniqueCode();
    // The creator's language is the lobby's language: the Crier speaks it to everyone.
    state.lang = options?.lang === 'en' ? 'en' : 'id';
    state.phase = 'lobby';
    state.phaseEndsAt = 0;
    state.day = 0;
    state.roundLive = false;
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
    this.onMessage('start', (client) => this.hostOnly(client, () => this.startRound()));
    this.onMessage('skip', (client) => this.voteSkip(client));
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
    p.ready = false;
    p.seated = false;
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
    this.roles.delete(client.sessionId);
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

  /**
   * Start the day/night cycle. With 5–10 players it is a real round: Nightfall Deception's own
   * dealer hands out the roles, and each player is told theirs in a private message — a role never
   * enters the shared room state, so it cannot be read off the wire. With any other number the
   * town still runs (walking, chat, the Crier), just without roles, and the room is told why.
   */
  private startRound() {
    const ids = Array.from(this.state.players.keys());
    const canDeal = ids.length >= NF_MIN_PLAYERS && ids.length <= NF_MAX_PLAYERS;
    this.roles.clear();
    if (canDeal) {
      const { roles } = dealRoles(ids.length, Math.random, 'standard');
      ids.forEach((id, i) => {
        const role = roles[i];
        this.roles.set(id, role);
        this.clients.find((c) => c.sessionId === id)?.send('role', { role } satisfies RoleEvent);
      });
      const [luminaries, cursed, shadows, bosses] = setupFor(ids.length, 'standard');
      this.broadcast('setup', { players: ids.length, luminaries, cursed, shadows, bosses } satisfies SetupEvent);
    } else {
      this.broadcast('system', { key: 'needPlayers', day: ids.length } satisfies SystemEvent);
    }
    this.state.roundLive = canDeal;
    this.beginPhase('day', 1);
  }

  /** Ending a phase early takes everyone: each player presses, and the room sees the tally. */
  private voteSkip(client: Client) {
    const p = this.state.players.get(client.sessionId);
    if (!p || this.state.phase === 'lobby') return;
    p.ready = !p.ready;
    const living = Array.from(this.state.players.values()).filter((q) => q.alive);
    if (living.length > 0 && living.every((q) => q.ready)) this.nextPhase();
  }

  private clearReady() {
    this.state.players.forEach((p) => { p.ready = false; });
  }

  /**
   * Night gathers the town: everyone is placed in a ring around the Crier, seated and facing
   * inwards, and stays put until dawn. Dawn simply lets them stand up where they are.
   */
  private seatForNight(on: boolean) {
    if (!on) {
      this.state.players.forEach((p) => { p.seated = false; });
      return;
    }
    const seated = Array.from(this.state.players.values());
    seated.forEach((p, i) => {
      const seat = nightSeat(i, seated.length);
      p.x = seat.x;
      p.z = seat.z;
      p.y = 0;
      p.rot = seat.rot;
      p.moving = false;
      p.seated = true;
      this.inputs.delete(p.sessionId);
    });
  }

  private tick(dtMs: number) {
    const dt = dtMs / 1000;
    const now = Date.now();
    this.state.players.forEach((p, id) => {
      const inp = p.seated ? undefined : this.inputs.get(id);
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
    this.clearReady();
    this.seatForNight(phase === 'night');
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
    this.clearReady();
    this.roles.clear();
    this.state.roundLive = false;
    this.state.phase = 'lobby';
    this.state.phaseEndsAt = 0;
    this.state.day = 0;
    this.stats = emptyStats();
    this.broadcast('system', { key: 'lobby' } satisfies SystemEvent);
  }

  /**
    * Who can hear `from`. A house is a private room: step inside with someone and the two of
    * you can talk however loudly, and nobody outside hears a word — not even standing at the
    * wall. Outside, the plain distance rule applies.
    */
  private nearby(from: Player, radius: number): { client: Client; dist: number }[] {
    const out: { client: Client; dist: number }[] = [];
    const room = houseAt(from.x, from.z);
    for (const other of this.clients) {
      const to = this.state.players.get(other.sessionId);
      if (!to) continue;
      if (houseAt(to.x, to.z) !== room) continue; // different rooms, or one of you is outdoors
      const dist = distance(from, to);
      if (room < 0 && dist > radius) continue; // outdoors: only as far as the voice carries
      out.push({ client: other, dist });
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
