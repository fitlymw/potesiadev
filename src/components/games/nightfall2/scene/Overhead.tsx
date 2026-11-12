import { Html } from '@react-three/drei';
import { EMOTES } from '../../../../../shared/nightfall2/constants';

/** Chat bubble and/or emote emoji floating above a head. */
export function Overhead({ text, emote, y = 2.55 }: { text?: string; emote?: number; y?: number }) {
  if (!text && emote === undefined) return null;
  return (
    <Html position={[0, y, 0]} center distanceFactor={9} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className="flex flex-col items-center gap-1">
        {emote !== undefined && <div className="nf2-pop text-[40px] leading-none drop-shadow">{EMOTES[emote].emoji}</div>}
        {text && <div className="max-w-[180px] rounded-xl bg-white/95 px-3 py-1.5 text-[13px] leading-snug text-zinc-900 shadow">{text}</div>}
      </div>
    </Html>
  );
}
