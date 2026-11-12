import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ChevronDown, Shuffle } from 'lucide-react';
import * as THREE from 'three';
import { ACCESSORIES, CLOTH, EYES, HAIR_COLORS, HAIR_STYLES, HATS, MOUTHS, SKIN, randomLook, type Look } from '../../../../../shared/nightfall2/look';
import { ElfCharacter } from '../scene/ElfCharacter';
import { newAnim } from '../scene/anim';
import type { TEXT } from '../texts';

/** Live preview that slowly turns and waves every few seconds. */
function Preview({ look }: { look: Look }) {
  const group = useRef<THREE.Group>(null);
  const anim = useRef(newAnim());
  useFrame(({ clock }, dt) => {
    const g = group.current;
    if (g) g.rotation.y += dt * 0.6;
    const a = anim.current;
    const t = clock.elapsedTime;
    if (t % 6 < 0.05 && a.emote !== 0) { a.emote = 0; a.emoteStart = performance.now(); }
    if (performance.now() - a.emoteStart > 2600) a.emote = -1;
  });
  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} />
      <group ref={group} position={[0, -1.05, 0]}>
        <ElfCharacter look={look} animRef={anim} />
      </group>
    </>
  );
}

function Swatches({ colors, value, onPick, label }: { colors: string[]; value: number; onPick: (i: number) => void; label: string }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wider text-indigo-300/70">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {colors.map((c, i) => (
          <button key={c} type="button" onClick={() => onPick(i)} aria-label={`${label} ${i + 1}`} className={`h-7 w-7 rounded-full border-2 ${value === i ? 'scale-110 border-white' : 'border-transparent'}`} style={{ background: c }} />
        ))}
      </div>
    </div>
  );
}

function Chips({ names, value, onPick, label }: { names: readonly string[]; value: number; onPick: (i: number) => void; label: string }) {
  return (
    <div>
      <span className="text-[11px] uppercase tracking-wider text-indigo-300/70">{label}</span>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {names.map((n, i) => (
          <button key={n} type="button" onClick={() => onPick(i)} className={`rounded-full border px-2.5 py-1 text-xs ${value === i ? 'border-emerald-300 bg-emerald-500/20 text-emerald-100' : 'border-indigo-400/30 text-indigo-200'}`}>{n}</button>
        ))}
      </div>
    </div>
  );
}

export function CharacterEditor({ look, onChange, t }: { look: Look; onChange: (l: Look) => void; t: (typeof TEXT)['id'] }) {
  const [open, setOpen] = useState(false);
  const set = (k: keyof Look) => (v: number) => onChange({ ...look, [k]: v });
  return (
    <div className="rounded-2xl border border-indigo-400/20 bg-black/30">
      <div className="flex items-center gap-3 p-3">
        <div className="h-40 w-28 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-indigo-900/60 to-emerald-900/40">
          <Canvas dpr={[1, 1.5]} camera={{ fov: 32, position: [0, 0.4, 5.2] }} gl={{ alpha: true, antialias: true }}>
            <Preview look={look} />
          </Canvas>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <span className="text-xs uppercase tracking-wider text-indigo-300/80">{t.character}</span>
          <button type="button" onClick={() => onChange(randomLook())} className="flex items-center justify-center gap-2 rounded-lg border border-indigo-400/40 py-2 text-sm text-indigo-100"><Shuffle className="h-4 w-4" />{t.random}</button>
          <button type="button" onClick={() => setOpen((o) => !o)} className="flex items-center justify-center gap-1 rounded-lg border border-emerald-300/50 bg-emerald-500/15 py-2 text-sm text-emerald-100" aria-expanded={open}>
            {t.parts.hair} · {t.parts.hat} · {t.parts.top} … <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      {open && (
        <div className="space-y-3 border-t border-indigo-400/15 p-3">
          <Swatches label={t.parts.skin} colors={SKIN} value={look.skin} onPick={set('skin')} />
          <Chips label={t.parts.hair} names={HAIR_STYLES.map((_, i) => t.hairStyles[i])} value={look.hair} onPick={set('hair')} />
          <Swatches label={t.parts.hairColor} colors={HAIR_COLORS} value={look.hairColor} onPick={set('hairColor')} />
          <Chips label={t.parts.hat} names={HATS.map((_, i) => t.hats[i])} value={look.hat} onPick={set('hat')} />
          {look.hat > 0 && <Swatches label={t.parts.hatColor} colors={CLOTH} value={look.hatColor} onPick={set('hatColor')} />}
          <Chips label={t.parts.eyes} names={EYES.map((_, i) => t.eyes[i])} value={look.eyes} onPick={set('eyes')} />
          <Chips label={t.parts.mouth} names={MOUTHS.map((_, i) => t.mouths[i])} value={look.mouth} onPick={set('mouth')} />
          <Swatches label={t.parts.top} colors={CLOTH} value={look.top} onPick={set('top')} />
          <Swatches label={t.parts.bottom} colors={CLOTH} value={look.bottom} onPick={set('bottom')} />
          <Swatches label={t.parts.shoes} colors={CLOTH} value={look.shoes} onPick={set('shoes')} />
          <Chips label={t.parts.acc} names={ACCESSORIES.map((_, i) => t.accessories[i])} value={look.acc} onPick={set('acc')} />
          {look.acc > 0 && <Swatches label={t.parts.accColor} colors={CLOTH} value={look.accColor} onPick={set('accColor')} />}
        </div>
      )}
    </div>
  );
}
