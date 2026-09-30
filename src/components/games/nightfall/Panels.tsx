/**
 * Overlays for Nightfall Deception: the shareable role book, the full rules
 * and the private role hint (with the player's secret notes).
 */
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { ROLES, TEAM_LABEL, ROLE_IDS, SOLO_BOSSES, type RoleId, type Team } from '@/data/nightfallRoles';
import { SETUP_TABLE, type Lang, type Mode, type NfState, type Report, type Side } from '@/lib/party/nightfall';
import { RoundTable } from '@/components/games/party/RoundTable';
import { PLAYER_COLORS } from '@/components/games/party/colors';
import { RoleIcon } from '@/components/games/nightfall/RoleIcon';
import { TEAM_COLOR } from '@/components/games/nightfall/palette';
import { UI, RULES, reportLine } from '@/components/games/nightfall/texts';

const PIXEL = { fontFamily: '"Press Start 2P", cursive' };
const TEAMS: Team[] = ['luminary', 'cursed', 'shadow', 'nightbringer'];

export function Overlay({ title, onClose, closeLabel, children }: { title: string; onClose: () => void; closeLabel: string; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[70] bg-black/90 overflow-auto p-3 sm:p-4 flex justify-center">
      <div className="w-full max-w-xl bg-[#0d0a14] border border-indigo-500/40 p-4 sm:p-5 h-fit">
        <div className="flex items-center justify-between mb-4 gap-2">
          <h2 className="text-indigo-200 text-[11px] sm:text-xs leading-relaxed" style={PIXEL}>{title}</h2>
          <button onClick={onClose} className="p-1.5 border border-indigo-500/40 text-indigo-200 shrink-0" aria-label={closeLabel}><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** All roles grouped by team — designed to be screenshotted and shared. */
export function RoleBook({ lang }: { lang: Lang }) {
  const t = UI[lang];
  return (
    <div className="space-y-4">
      <div className="text-center border border-indigo-500/30 bg-indigo-950/30 p-3">
        <p className="text-indigo-100 text-[11px] leading-relaxed" style={PIXEL}>NIGHTFALL DECEPTION</p>
        <p className="text-indigo-300/80 text-xs mt-1">{t.roleBookTitle}</p>
        <p className="text-indigo-300/60 text-[11px] mt-1">{t.roleBookHint}</p>
      </div>
      <div>
        <p className="text-indigo-300/70 text-[11px] mb-1 text-center">{t.setupLegend}</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-center text-[10px] text-indigo-200/80">
          {Object.entries(SETUP_TABLE).map(([n, [l, c, s, b]]) => (
            <div key={n} className="border border-indigo-700/40 py-1">
              <b className="text-indigo-100">{n}p</b><br />{l}·{c}·{s}·{b}
            </div>
          ))}
        </div>
      </div>
      {[...TEAMS.map((team) => ({ key: team, color: TEAM_COLOR[team], title: TEAM_LABEL[team][lang], ids: ROLE_IDS.filter((id) => ROLES[id].team === team && !SOLO_BOSSES.includes(id)) })),
        { key: 'solo', color: TEAM_COLOR.nightbringer, title: t.soloBosses, ids: SOLO_BOSSES }].map((group) => (
        <section key={group.key}>
          <h3 className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: group.color }}>{group.title}</h3>
          <div className="space-y-2">
            {group.ids.map((id) => (
              <div key={id} className="flex gap-3 items-start border bg-black/40 p-2.5" style={{ borderColor: `${group.color}55` }}>
                <RoleIcon role={id} size={44} className="shrink-0" />
                <div className="min-w-0">
                  <p className="font-bold text-sm" style={{ color: group.color }}>{ROLES[id].name}</p>
                  <p className="text-indigo-50/90 text-xs leading-snug">{ROLES[id].ability[lang]}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Public seat map: who sits where, who is alive, who can still vote. */
export function SeatMap({ state }: { state: NfState }) {
  const t = UI[state.lang];
  // A Nova who fired died completely; any other dead player without a ghost vote has used it
  const status = (p: number) =>
    state.alive[p] ? 'alive' : state.ghostVote[p] ? 'ghost' : state.roles[p] === 'nova' && state.novaUsed ? 'gone' : 'used';
  const LABEL = { alive: t.statusAlive, ghost: t.statusGhost, used: t.statusUsed, gone: t.statusGone };
  const MARK = { alive: null, ghost: '👻', used: '🗳️', gone: '✖' };
  const FILL = { alive: '', ghost: '#71717a', used: '#52525b', gone: '#3f3f46' };
  const TEXT = { alive: 'text-emerald-300', ghost: 'text-indigo-300', used: 'text-zinc-400', gone: 'text-red-300' };
  return (
    <div className="space-y-3">
      <div className="border border-indigo-500/30 bg-black/30 p-2">
        <RoundTable
          players={state.seats.map((p) => state.players[p])}
          startsLabel=""
          colors={state.seats.map((p) => (state.alive[p] ? PLAYER_COLORS[p] : FILL[status(p)]))}
          dim={state.seats.map((p) => !state.alive[p])}
          marks={state.seats.map((p) => MARK[status(p)])}
          center={[t.seatMap, `${state.alive.filter(Boolean).length}/${state.players.length} ${t.statusAlive.toLowerCase()}`]}
        />
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-indigo-200/80">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />{t.statusAlive}</span>
        <span className="flex items-center gap-1.5">👻 {t.statusGhost}</span>
        <span className="flex items-center gap-1.5">🗳️ {t.statusUsed}</span>
        <span className="flex items-center gap-1.5">✖ {t.statusGone}</span>
      </div>
      <ul className="space-y-1">
        {state.seats.map((p, k) => {
          const st = status(p);
          return (
            <li key={p} className={`flex items-center gap-2 border px-2 py-1.5 text-sm ${st === 'alive' ? 'border-indigo-600/40' : 'border-zinc-700'}`}>
              <span className="w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center text-black shrink-0" style={{ background: st === 'alive' ? PLAYER_COLORS[p] : FILL[st] }}>{k + 1}</span>
              <span className="flex-1 min-w-0">
                <span className={`block truncate ${st === 'alive' ? 'text-indigo-50' : 'text-zinc-400 line-through'}`}>{state.players[p]}</span>
                <span className={`block text-xs ${TEXT[st]}`}>{MARK[st] ? `${MARK[st]} ` : ''}{LABEL[st]}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-[11px] text-indigo-300/60">{t.seatMapHint}</p>
    </div>
  );
}

export function RulesView({ lang }: { lang: Lang }) {
  return (
    <div className="space-y-4">
      {RULES[lang].map((section) => (
        <section key={section.title}>
          <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1.5">{section.title}</h3>
          <ul className="list-disc pl-5 space-y-1.5 text-sm text-indigo-50/90 leading-relaxed">
            {section.items.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** Private hint: role card, status, goal, ability, tips and every piece of information received so far. */
export function RoleHint({ role, lang, mode, side, status, reports, names }: { role: RoleId; lang: Lang; mode: Mode; side: Side; status: string[]; reports: Report[]; names: string[] }) {
  const t = UI[lang];
  const info = ROLES[role];
  const color = TEAM_COLOR[info.team];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <RoleIcon role={role} size={64} />
        <div>
          <p className="text-xl font-bold" style={{ color }}>{info.name}</p>
          <p className="text-xs" style={{ color }}>{TEAM_LABEL[info.team][lang]}</p>
        </div>
      </div>
      {status.map((line) => <p key={line} className="text-sm font-bold text-amber-200 border border-amber-400/40 bg-amber-500/10 p-2">{line}</p>)}
      <div>
        <p className="text-indigo-300/70 text-xs uppercase tracking-wider">{t.goal}</p>
        <p className="text-sm text-indigo-50/90">{t.goals[mode][side]}</p>
      </div>
      <div>
        <p className="text-indigo-300/70 text-xs uppercase tracking-wider">{t.ability}</p>
        <p className="text-sm text-indigo-50/90 leading-relaxed">{info.ability[lang]}</p>
      </div>
      <div>
        <p className="text-indigo-300/70 text-xs uppercase tracking-wider">{t.tips}</p>
        <ul className="list-disc pl-5 text-sm text-indigo-50/85 space-y-1">{info.tips.map((tip, i) => <li key={i}>{tip[lang]}</li>)}</ul>
      </div>
      <div className="border border-indigo-500/30 bg-black/40 p-3">
        <p className="text-indigo-200 text-xs uppercase tracking-wider mb-2">{t.notes}</p>
        {reports.length === 0 ? (
          <p className="text-sm text-indigo-300/60">{t.noNotes}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {reports.map((r) => (
              <li key={r.night}>
                <p className="text-indigo-300/70 text-xs">{t.morningTitle(r.night)}</p>
                {r.items.map((item, i) => <p key={i} className="text-indigo-50/90">{reportLine(item, names, lang)}</p>)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
