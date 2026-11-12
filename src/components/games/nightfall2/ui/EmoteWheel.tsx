import { useRef, useState } from 'react';
import { Smile } from 'lucide-react';
import { EMOTES } from '../../../../../shared/nightfall2/constants';
import { sendEmote } from '../net';
import type { TEXT } from '../texts';

const RADIUS = 78;

/**
 * Emote picker. Press and hold the button, slide onto an emote, release to send — or tap the
 * button to open the wheel and tap an emote. Works with a mouse too (keys 1–8 as a shortcut).
 */
export function EmoteWheel({ t, className, corner = false }: { t: (typeof TEXT)['id']; className?: string; corner?: boolean }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const pid = useRef<number | null>(null);
  const origin = useRef({ x: 0, y: 0, moved: false, openedByHold: false });
  // on phones the button hugs the corner, so the wheel opens up-left of the thumb
  const off = corner ? -(RADIUS + 36) : 0;

  const indexAt = (cx: number, cy: number): number | null => {
    const dx = cx - origin.current.x;
    const dy = cy - origin.current.y;
    const d = Math.hypot(dx, dy);
    if (d < 28) return null;
    const a = Math.atan2(dy, dx); // −π..π, 0 = east
    const slice = (Math.PI * 2) / EMOTES.length;
    return ((Math.round(a / slice) % EMOTES.length) + EMOTES.length) % EMOTES.length;
  };
  const pick = (i: number | null) => {
    if (i !== null) sendEmote(i);
    setOpen(false);
    setHover(null);
  };

  return (
    <div data-ui className={`absolute ${className ?? ''}`}>
      <button
        className="relative flex h-14 w-14 touch-none select-none items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-sm"
        aria-label={t.emote}
        title={`${t.emote} — ${t.emoteHint}`}
        onPointerDown={(e) => {
          pid.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          const r = e.currentTarget.getBoundingClientRect();
          origin.current = { x: r.left + r.width / 2 + off, y: r.top + r.height / 2 + off, moved: false, openedByHold: !open };
          setOpen(true);
        }}
        onPointerMove={(e) => {
          if (e.pointerId !== pid.current) return;
          const i = indexAt(e.clientX, e.clientY);
          if (i !== null) origin.current.moved = true;
          setHover(i);
        }}
        onPointerUp={(e) => {
          if (e.pointerId !== pid.current) return;
          pid.current = null;
          const i = indexAt(e.clientX, e.clientY);
          if (origin.current.moved) pick(i); // slid onto an emote: send it
          else if (!origin.current.openedByHold) setOpen(false); // second tap on the button closes
          // else: a plain tap opened the wheel; wait for a tap on an emote
        }}
        onPointerCancel={() => { pid.current = null; setOpen(false); setHover(null); }}
      >
        <Smile className="h-6 w-6" />
      </button>

      {open && (
        <div className="pointer-events-none absolute left-1/2 top-1/2" style={{ width: 0, height: 0, transform: `translate(${off}px, ${off}px)` }}>
          <div className="absolute rounded-full border border-white/15 bg-black/35 backdrop-blur-sm" style={{ left: -RADIUS - 30, top: -RADIUS - 30, width: (RADIUS + 30) * 2, height: (RADIUS + 30) * 2 }} />
          {EMOTES.map((e, i) => {
            const a = (i / EMOTES.length) * Math.PI * 2;
            const x = Math.cos(a) * RADIUS;
            const y = Math.sin(a) * RADIUS;
            const active = hover === i;
            return (
              <button
                key={e.id}
                className={`pointer-events-auto absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[26px] leading-none transition-transform ${active ? 'scale-125 border-amber-300 bg-amber-400/30' : 'border-white/20 bg-black/50'}`}
                style={{ left: x, top: y }}
                aria-label={t.emoteNames[i]}
                onPointerDown={(ev) => ev.stopPropagation()}
                onClick={() => pick(i)}
              >
                {e.emoji}
              </button>
            );
          })}
          {hover !== null && (
            <div className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/70 px-2 py-0.5 text-[11px] text-white" style={{ top: RADIUS + 38 }}>{t.emoteNames[hover]}</div>
          )}
        </div>
      )}
    </div>
  );
}
