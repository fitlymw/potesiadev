import { Html } from '@react-three/drei';
import { EMOTES } from '../../../../../shared/nightfall2/constants';

/**
 * What floats above a head: the last thing said, and the current emote — both as speech
 * bubbles, so an emote reads at a glance even when the little emoji is hard to see.
 */
export function Overhead({ text, emote, emoteLabel, y = 2.55 }: { text?: string; emote?: number; emoteLabel?: string; y?: number }) {
  if (!text && emote === undefined) return null;
  return (
    <Html position={[0, y, 0]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="flex flex-col items-center gap-1">
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
