import { Html } from '@react-three/drei';
import { EMOTES } from '../../../../../shared/nightfall2/constants';

/**
 * What floats above a head: the last thing said, and the current emote — both as speech
 * bubbles, so an emote reads at a glance even when the little emoji is hard to see.
 */
export function Overhead({ text, emote, emoteLabel, speaking, y = 2.55 }: { text?: string; emote?: number; emoteLabel?: string; speaking?: boolean; y?: number }) {
  if (!text && emote === undefined && !speaking) return null;
  return (
    <Html position={[0, y, 0]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="flex flex-col items-center gap-1">
        {speaking && (
          <div className="nf2-talk flex h-8 w-8 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-500/90 shadow-lg" aria-label="speaking">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
              <path d="M11 5 6 9H3v6h3l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <path d="M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        )}
        {emote !== undefined && (
          <div className="nf2-pop flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/95 px-3 py-1 shadow">
            <span className="text-[22px] leading-none">{EMOTES[emote].emoji}</span>
            {emoteLabel && <span className="text-[13px] font-semibold text-amber-900">{emoteLabel}</span>}
          </div>
        )}
        {text && <div className="max-w-[180px] rounded-xl bg-white/95 px-3 py-1.5 text-[13px] leading-snug text-zinc-900 shadow">{text}</div>}
      </div>
    </Html>
  );
}
