import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Moon } from 'lucide-react';
import { sendNightAction } from '../net';
import { nf2, useNf2 } from '../store';
import type { TurnEvent } from '../../../../../shared/nightfall2/messages';
import type { TEXT } from '../texts';

const PIXEL = { fontFamily: '"Press Start 2P", cursive' };

/**
 * The Crier's question, on the screen of the one player being asked. Everyone else only sees
 * whose turn it is — the same information the table has when a phone is handed over.
 */
export function NightTurn({ t }: { t: (typeof TEXT)['id'] }) {
  const turn = useNf2((s) => s.turn);
  if (!turn) return null;
  // a fresh question is a fresh panel, so nothing is carried over from the last one
  return <TurnPanel key={`${turn.seat}-${turn.prompt}`} turn={turn} t={t} />;
}

function TurnPanel({ turn, t }: { turn: TurnEvent; t: (typeof TEXT)['id'] }) {
  const [picked, setPicked] = useState<number[]>([]);
  const [suspect, setSuspect] = useState<number | null>(null);
  const max = Math.max(...turn.accept);
  const canSend = turn.accept.includes(picked.length) && (!turn.suspect || suspect !== null);
  const toggle = (seat: number) => {
    setPicked((cur) => {
      if (cur.includes(seat)) return cur.filter((x) => x !== seat);
      if (cur.length >= max) return max === 1 ? [seat] : cur;
      return [...cur, seat];
    });
  };
  const send = (targets: number[]) => {
    sendNightAction(targets, suspect ?? undefined);
    nf2.set({ turn: null });
  };

  return (
    <motion.div
      data-ui
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-x-0 bottom-0 z-40 max-h-[70vh] overflow-y-auto rounded-t-3xl border-t-2 border-indigo-300/60 bg-[#0b1020]/95 p-4 backdrop-blur-md sm:inset-x-auto sm:left-1/2 sm:bottom-6 sm:w-[min(94vw,520px)] sm:-translate-x-1/2 sm:rounded-3xl sm:border-2"
    >
      <p className="flex items-center justify-center gap-2 text-[10px] text-indigo-200" style={PIXEL}>
        <Moon className="h-4 w-4" />{t.yourTurn}
      </p>
      <p className="mt-3 text-center text-sm leading-snug text-indigo-50">{turn.prompt}</p>

      {turn.candidates.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {turn.candidates.map((c) => {
            const on = picked.includes(c.seat);
            return (
              <button
                key={c.seat}
                onClick={() => toggle(c.seat)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-sm ${on ? 'border-emerald-300 bg-emerald-500/25 text-emerald-100' : 'border-indigo-400/40 text-indigo-100'}`}
              >
                {on && <Check className="h-4 w-4" />}
                {turn.pool === 'seat' ? `#${c.seat + 1}` : c.name}
              </button>
            );
          })}
        </div>
      )}

      {turn.suspect && (
        <div className="mt-4 border-t border-indigo-400/20 pt-3">
          <p className="text-center text-xs text-indigo-200/80">{t.suspectLabel}</p>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {turn.candidates.map((c) => (
              <button
                key={c.seat}
                onClick={() => setSuspect(c.seat)}
                className={`rounded-full border px-3 py-1.5 text-xs ${suspect === c.seat ? 'border-amber-300 bg-amber-500/25 text-amber-100' : 'border-indigo-400/30 text-indigo-200'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        {turn.accept.includes(0) && (
          <button onClick={() => send([])} disabled={turn.suspect && suspect === null} className="flex-1 border-2 border-indigo-400/50 py-3 text-[10px] text-indigo-100 disabled:opacity-40" style={PIXEL}>
            {t.skipAction}
          </button>
        )}
        <button onClick={() => send(picked)} disabled={!canSend} className="flex-[2] border-2 border-emerald-300 bg-emerald-500/25 py-3 text-[10px] text-emerald-100 disabled:opacity-40" style={PIXEL}>
          {t.confirmAction}
        </button>
      </div>
    </motion.div>
  );
}

/** What the rest of the circle sees while someone is being asked. */
export function TurnWatcher({ t }: { t: (typeof TEXT)['id'] }) {
  const turnName = useNf2((s) => s.turnName);
  const mine = useNf2((s) => s.turn);
  if (!turnName || mine) return null;
  return (
    <p data-ui className="pointer-events-none absolute left-1/2 bottom-24 w-[min(92vw,420px)] -translate-x-1/2 rounded-full border border-indigo-300/40 bg-indigo-950/80 px-4 py-2 text-center text-sm text-indigo-100 backdrop-blur-md">
      {t.askingNow(turnName)}
    </p>
  );
}

/** What you alone learned during the night. */
export function NightReport({ t }: { t: (typeof TEXT)['id'] }) {
  const report = useNf2((s) => s.report);
  if (!report?.length) return null;
  return (
    <motion.div
      data-ui
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute left-1/2 top-1/2 z-40 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-amber-300/60 bg-[#1a1408]/95 p-4 backdrop-blur-md"
    >
      <p className="text-center text-[10px] text-amber-200" style={PIXEL}>{t.reportTitle}</p>
      <ul className="mt-3 space-y-2">
        {report.map((line, i) => (
          <li key={i} className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm leading-snug text-amber-50">{line}</li>
        ))}
      </ul>
      <button onClick={() => nf2.set({ report: null })} className="mt-4 w-full border-2 border-amber-300 bg-amber-500/20 py-2.5 text-[10px] text-amber-100" style={PIXEL}>
        {t.gotIt}
      </button>
    </motion.div>
  );
}
