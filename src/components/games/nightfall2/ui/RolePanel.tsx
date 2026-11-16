import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronDown, X } from 'lucide-react';
import { ROLES, TEAM_GOAL, TEAM_LABEL, type RoleId, type Team } from '@/data/nightfallRoles';
import { RoleIcon } from '@/components/games/nightfall/RoleIcon';
import { nf2, useNf2 } from '../store';
import type { Lang, TEXT } from '../texts';

const PIXEL = { fontFamily: '"Press Start 2P", cursive' };

const TEAM_STYLE: Record<Team, { ring: string; bg: string; text: string }> = {
  luminary: { ring: 'border-amber-300/60', bg: 'bg-amber-950/80', text: 'text-amber-100' },
  cursed: { ring: 'border-lime-300/60', bg: 'bg-lime-950/80', text: 'text-lime-100' },
  shadow: { ring: 'border-rose-400/60', bg: 'bg-rose-950/80', text: 'text-rose-100' },
  nightbringer: { ring: 'border-fuchsia-400/70', bg: 'bg-fuchsia-950/80', text: 'text-fuchsia-100' },
};
const ORDER: Team[] = ['luminary', 'cursed', 'shadow', 'nightbringer'];

/**
 * Your own role, bottom-left of your screen only: it is sent to you in a private message and
 * never enters the shared room state, so no other player can read it.
 */
export function RoleCard({ t, lang }: { t: (typeof TEXT)['id']; lang: Lang }) {
  const role = useNf2((s) => s.myRole) as RoleId | null;
  const setup = useNf2((s) => s.setup);
  const [open, setOpen] = useState(true);
  if (!role) return null;
  const info = ROLES[role];
  const style = TEAM_STYLE[info.team];
  const evil = info.team === 'shadow' || info.team === 'nightbringer';
  return (
    <div data-ui className={`absolute left-3 top-16 z-40 w-[min(80vw,280px)] rounded-2xl border ${style.ring} ${style.bg} backdrop-blur-md`}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-2.5 p-2.5 text-left" aria-expanded={open}>
        <RoleIcon role={role} size={36} />
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] uppercase tracking-widest text-white/50" style={PIXEL}>{t.yourRole}</span>
          <span className={`block truncate text-base font-bold ${style.text}`}>{info.name}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-1.5 border-t border-white/10 px-2.5 pb-2.5 pt-2">
          <p className={`text-[11px] ${style.text}`}>{TEAM_LABEL[info.team][lang]}</p>
          <p className="text-xs leading-snug text-white/85">{info.ability[lang]}</p>
          <p className="text-[11px] text-white/55">{TEAM_GOAL[evil ? 'evil' : 'good'][lang]}</p>
          {setup && (
            <p className="text-[11px] text-white/45">
              {t.mix(setup.players, setup.luminaries, setup.cursed, setup.shadows, setup.bosses)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * The one-off reveal when the round is dealt: your role fills the middle of your own screen,
 * big enough to read at a glance and gone as soon as you tap it.
 */
export function RoleReveal({ t, lang }: { t: (typeof TEXT)['id']; lang: Lang }) {
  const role = useNf2((s) => s.myRole) as RoleId | null;
  const shown = useNf2((s) => s.roleRevealed);
  if (!role || !shown) return null;
  const info = ROLES[role];
  const style = TEAM_STYLE[info.team];
  const evil = info.team === 'shadow' || info.team === 'nightbringer';
  return createPortal(
    <motion.button
      data-ui
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => nf2.set({ roleRevealed: false })}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/85 p-5 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, rotateY: -25 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ type: 'spring', stiffness: 160, damping: 18 }}
        className={`w-[min(94vw,420px)] rounded-3xl border-2 ${style.ring} ${style.bg} p-6 text-center`}
      >
        <p className="text-[10px] uppercase tracking-widest text-white/60" style={PIXEL}>{t.roleRevealTitle}</p>
        <div className="mt-5 flex justify-center"><RoleIcon role={role} size={96} /></div>
        <p className={`mt-4 text-3xl font-bold ${style.text}`}>{info.name}</p>
        <p className={`mt-1 text-sm ${style.text}`}>{TEAM_LABEL[info.team][lang]}</p>
        <p className="mt-4 text-sm leading-snug text-white/90">{info.ability[lang]}</p>
        <p className="mt-4 text-xs text-white/60">{TEAM_GOAL[evil ? 'evil' : 'good'][lang]}</p>
        <p className="mt-5 text-[11px] text-white/45">{t.roleRevealHint}</p>
      </motion.div>
    </motion.button>,
    document.body,
  );
}

/**
 * The whole role book: what every role in the game can do. Open to anyone, any time.
 * Rendered through a portal because the button lives in the HUD's top bar, and `inset-0`
 * would otherwise only cover that strip.
 */
export function RoleBook({ t, lang, onClose }: { t: (typeof TEXT)['id']; lang: Lang; onClose: () => void }) {
  return createPortal(
    <motion.div
      data-ui
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex flex-col bg-black/85 backdrop-blur-md"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 className="text-[11px] text-amber-200" style={PIXEL}>{t.roleBook}</h2>
        <button onClick={onClose} className="rounded-lg border border-white/20 p-2 text-white" aria-label={t.close}><X className="h-4 w-4" /></button>
      </div>
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
        {ORDER.map((team) => {
          const list = Object.values(ROLES).filter((r) => r.team === team);
          const style = TEAM_STYLE[team];
          return (
            <section key={team}>
              <h3 className={`mb-2 text-xs font-semibold ${style.text}`}>{TEAM_LABEL[team][lang]}</h3>
              <ul className="space-y-2">
                {list.map((r) => (
                  <li key={r.id} className={`flex gap-3 rounded-xl border ${style.ring} ${style.bg} p-2.5`}>
                    <RoleIcon role={r.id} size={34} className="shrink-0" />
                    <div className="min-w-0">
                      <p className={`text-sm font-bold ${style.text}`}>{r.name}</p>
                      <p className="text-xs leading-snug text-white/80">{r.ability[lang]}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </motion.div>,
    document.body,
  );
}

/** The button that opens the book, for the HUD row. */
export function RoleBookButton({ t, lang }: { t: (typeof TEXT)['id']; lang: Lang }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className="rounded-xl border border-white/15 bg-black/40 p-2 backdrop-blur-md" aria-label={t.roleBook} title={t.roleBook}>
        <BookOpen className="h-4 w-4" />
      </button>
      <AnimatePresence>{open && <RoleBook t={t} lang={lang} onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
