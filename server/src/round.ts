/**
 * A round of Nightfall Deception, run by the first game's own engine.
 *
 * The engine is a pure reducer written for one phone passed around a table: each night it walks
 * the seats one at a time and asks whoever's turn it is. That is exactly what the Crier does in
 * Elf Town, so the engine runs here unchanged and this wrapper only translates between seats and
 * players, and hands out the wording the first game already uses.
 */
import {
  canSuspect,
  initialState,
  nightSpec,
  pendingPlayer,
  reducer,
  type Lang,
  type NfState,
  type NightSpec,
} from '@/lib/party/nightfall';
import { UI, chronicleLine, reportLine } from '@/components/games/nightfall/texts';

/** What the player whose turn it is needs to choose, in their own language. */
export interface TurnInfo {
  seat: number;
  kind: NightSpec['kind'];
  count: number;
  accept: number[];
  allowSelf: boolean;
  pool: NightSpec['pool'];
  /** Nightfall Deception's own prompt for this ability. */
  prompt: string;
  /** Light players also name who they trust least. */
  suspect: boolean;
  /** Seats that may be chosen. */
  candidates: number[];
}

const PROMPT = (lang: Lang, spec: NightSpec, state: NfState): string => {
  const p = UI[lang].prompt as Record<string, unknown>;
  const v = p[spec.kind];
  if (typeof v === 'string') return v;
  if (typeof v === 'function') {
    const f = v as (...args: unknown[]) => string;
    switch (spec.kind) {
      case 'kill': return f(spec.count, spec.allowSelf);
      case 'gouge': case 'infect': return f(spec.count);
      case 'tide': return f(state.tideLeft ?? 0);
      case 'chat': return f(state.chatLeft ?? 0);
      default: return f(spec.count);
    }
  }
  return '';
};

export class Round {
  state: NfState;
  readonly lang: Lang;

  constructor(names: string[], lang: Lang) {
    this.lang = lang;
    let s = initialState(lang, 'standard');
    s = reducer(s, { type: 'ARRANGE', players: names });
    s = reducer(s, { type: 'START', seed: Math.floor(Math.random() * 1e9) });
    this.state = s;
    this.settle();
  }

  get phase() {
    return this.state.phase;
  }
  get night() {
    return this.state.night;
  }
  get winner() {
    return this.state.winner;
  }
  get names() {
    return this.state.players;
  }
  aliveSeats(): number[] {
    return this.state.alive.map((a, i) => (a ? i : -1)).filter((i) => i >= 0);
  }
  roleOf(seat: number) {
    return this.state.roles[seat];
  }

  /** Walk past the engine's "pass the phone" screens: in Elf Town the Crier just turns to the next player. */
  private settle() {
    for (let guard = 0; guard < 64; guard++) {
      if (this.state.phase === 'nightPass' || this.state.phase === 'dawnPass') {
        this.state = reducer(this.state, { type: 'CONFIRM_PASS' });
        continue;
      }
      // nobody tells their story at dawn yet: that lap is skipped until the day screen exists
      if (this.state.phase === 'dawn') {
        this.state = reducer(this.state, { type: 'DONE_DAWN', shared: false });
        continue;
      }
      break;
    }
  }

  /** Whose turn it is tonight, and what they must choose. */
  turn(): TurnInfo | null {
    if (this.state.phase !== 'night') return null;
    const seat = pendingPlayer(this.state);
    if (seat === null) return null;
    const spec = nightSpec(this.state, seat);
    const pool =
      spec.pool === 'dead'
        ? this.state.alive.map((a, i) => (a ? -1 : i))
        : spec.pool === 'seat'
          ? this.state.players.map((_, i) => i)
          : this.state.alive.map((a, i) => (a ? i : -1));
    const candidates = pool.filter((i) => i >= 0 && (spec.allowSelf || i !== seat));
    return {
      seat,
      kind: spec.kind,
      count: spec.count,
      accept: spec.accept,
      allowSelf: spec.allowSelf,
      pool: spec.pool,
      prompt: PROMPT(this.lang, spec, this.state),
      suspect: canSuspect(this.state, seat) && spec.kind !== 'dummy',
      candidates,
    };
  }

  /** Take that player's choice and move the night along. Returns false if it was not their turn. */
  submit(seat: number, targets: number[], suspect?: number): boolean {
    const now = this.turn();
    if (!now || now.seat !== seat) return false;
    const clean = targets.filter((t) => now.candidates.includes(t)).slice(0, now.count);
    this.state = reducer(this.state, {
      type: 'SUBMIT_NIGHT',
      targets: now.accept.includes(clean.length) ? clean : [],
      suspect: suspect !== undefined && now.suspect ? suspect : undefined,
    });
    this.settle();
    return true;
  }

  /** The night is over: resolve it and move to the morning. */
  finishNight() {
    if (this.state.phase === 'nightEnd') this.state = reducer(this.state, { type: 'SHOW_MORNING' });
    this.settle();
  }

  /** Leave the morning for the day (the engine decides whether the game is already over). */
  toDay() {
    if (this.state.phase === 'morning') this.state = reducer(this.state, { type: 'BEGIN_DAWN' });
    this.settle();
  }

  /** Close the day (no nominations yet) and let the engine move to the next night. */
  endDay() {
    if (this.state.phase === 'day') this.state = reducer(this.state, { type: 'END_DAY' });
    this.settle();
  }

  /** What this player learned tonight, in Nightfall Deception's own words. */
  reportLines(seat: number): string[] {
    const list = this.state.reports[seat] ?? [];
    const latest = list.filter((r) => r.night === this.state.night);
    return latest.flatMap((r) => r.items.map((item) => reportLine(item, this.state.players, this.lang)));
  }

  /**
   * What the whole town learns in the morning: the first game's public events, worded exactly
   * as its morning screen words them. The chronicle is deliberately NOT used here — that is the
   * end-of-game story and it names roles and private readings.
   */
  morningLines(): string[] {
    const t = UI[this.lang];
    const nm = (i: number) => this.state.players[i];
    const lines: string[] = [];
    // the night's public events are kept apart from the day's; both are worded the same way
    const feed = this.state.phase === 'nightEnd' || this.state.phase === 'morning' ? this.state.morningEvents : this.state.events;
    for (const e of feed) {
      switch (e.k) {
        case 'deaths': lines.push(e.players.length ? t.deathsSome(e.players.map(nm).join(', ')) : t.deathsNone); break;
        case 'executed': lines.push(t.events.executed(nm(e.player))); break;
        case 'shielded': lines.push(t.events.shielded(nm(e.player))); break;
        case 'noExecution': lines.push(t.events.noExecution); break;
        case 'novaHit': lines.push(t.events.novaHit(nm(e.shooter), nm(e.target))); break;
        case 'novaMiss': lines.push(t.events.novaMiss(nm(e.shooter), nm(e.target), e.died)); break;
        case 'saved': lines.push(t.events.saved(nm(e.target), e.by, e.what)); break;
        case 'pyre': lines.push(t.events.pyre(nm(e.by), nm(e.target))); break;
        case 'pactDeath': lines.push(t.events.pactDeath(nm(e.target), nm(e.partner))); break;
        case 'crownBurden': lines.push(t.events.crownBurden(nm(e.target))); break;
        case 'revived': lines.push(t.events.revived(nm(e.target))); break;
        case 'apex': lines.push(t.events.apex); break;
        case 'saintRevealed': lines.push(t.events.saintRevealed(nm(e.player))); break;
        case 'saintKill': lines.push(t.events.saintKill(nm(e.saint), nm(e.target), e.blocked)); break;
        case 'saintRevive': lines.push(t.events.saintRevive(nm(e.saint), nm(e.target))); break;
        case 'seats': break; // the swap is shown on the seat map, not read out
      }
    }
    return lines;
  }

  /** The full story, for the end of the game only. */
  chronicleLines(): string[] {
    return this.state.chronicle
      .map((e) => chronicleLine(e.item, this.state.players, this.state.roles, this.lang))
      .filter((line) => line.length > 0);
  }
}
